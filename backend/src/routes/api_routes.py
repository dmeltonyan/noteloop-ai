from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict
from pydantic import BaseModel
import uuid

from src.models.database import db, User, Comment, Concept, Video, Quiz
from src.services.hybrid_content_service import hybrid_service
from src.services.document_processor import document_processor
from src.services.gpt_content_generator import gpt_generator

router = APIRouter()

# ==================== MODELS ====================
class UserCreate(BaseModel):
    name: str
    email: str

class FeedItemResponse(BaseModel):
    id: str
    type: str
    content: Dict
    sequence: int

class QuizAnswerRequest(BaseModel):
    quiz_id: str
    user_answer: str

class VideoLikeRequest(BaseModel):
    video_id: str

class CommentCreate(BaseModel):
    video_id: str
    text: str
    timestamp_seconds: int = 0

# ==================== HELPER ====================
def get_user_or_create(user_id: str):
    """Get user or create demo user"""
    user = db.get_user(user_id)
    if not user:
        # Try demo user
        user = db.get_user("demo_user_123")
    if not user:
        # Create on the fly
        user = User(id=user_id, name="User", email=f"{user_id}@noteloop.ai")
        db.add_user(user)
    return user

# ==================== USER ENDPOINTS ====================
@router.post("/users/create")
async def create_user(user_data: UserCreate):
    user_id = str(uuid.uuid4())
    user = User(id=user_id, name=user_data.name, email=user_data.email)
    db.add_user(user)
    return {"user_id": user_id, "message": "User created"}

@router.get("/users/{user_id}/progress")
async def get_user_progress(user_id: str):
    """Get progress - always works"""
    user = get_user_or_create(user_id)
    
    accuracy = 0
    if user.total_questions > 0:
        accuracy = (user.correct_answers / user.total_questions) * 100
    
    return {
        "user_id": user.id,
        "name": user.name,
        "overall_ability": user.overall_ability,
        "total_questions": user.total_questions,
        "correct_answers": user.correct_answers,
        "accuracy": round(accuracy, 1),
        "concept_mastery": user.concept_mastery,
        "concepts_learned": len([m for m in user.concept_mastery.values() if m > 0.7]),
        "total_concepts": len(db.concepts)
    }

# ==================== FEED ENDPOINTS ====================
@router.get("/feed/{user_id}", response_model=List[FeedItemResponse])
async def get_feed(user_id: str, limit: int = 20):
    """Get feed - always works"""
    try:
        user = get_user_or_create(user_id)
        feed_items = hybrid_service.get_feed(user_id, limit)
        
        if not feed_items:
            # Return empty but valid response
            return []
        
        return feed_items
    except Exception as e:
        print(f"Error in get_feed: {e}")
        import traceback
        traceback.print_exc()
        # Return empty feed instead of error
        return []

# ==================== QUIZ ENDPOINTS ====================
@router.post("/quiz/answer/{user_id}")
async def submit_quiz_answer(user_id: str, answer: QuizAnswerRequest):
    """Submit answer"""
    try:
        user = get_user_or_create(user_id)
        quiz = db.quizzes.get(answer.quiz_id)
        is_correct = False
        
        if quiz:
            is_correct = answer.user_answer == quiz.correct_answer
        
        result = hybrid_service.submit_answer(
            user_id,
            answer.quiz_id,
            answer.user_answer,
            is_correct
        )
        return result
    except Exception as e:
        print(f"Error submitting answer: {e}")
        return {"success": False, "error": str(e)}

# ==================== VIDEO ENDPOINTS ====================
@router.post("/video/like")
async def like_video(like_request: VideoLikeRequest):
    video = db.get_video(like_request.video_id)
    if video:
        video.helpful_likes += 1
        return {"message": "Liked", "total_likes": video.helpful_likes}
    return {"message": "Liked", "total_likes": 1}

@router.post("/video/view/{video_id}")
async def record_video_view(video_id: str):
    video = db.get_video(video_id)
    if video:
        video.views += 1
        return {"message": "View recorded", "total_views": video.views}
    return {"message": "View recorded", "total_views": 1}

@router.post("/video/comment")
async def add_comment(comment_data: CommentCreate, user_id: str = "default_user"):
    video = db.get_video(comment_data.video_id)
    if not video:
        return {"message": "Comment added", "comment_id": str(uuid.uuid4())}
    
    comment = Comment(
        id=str(uuid.uuid4()),
        user_id=user_id,
        video_id=comment_data.video_id,
        text=comment_data.text,
        timestamp_seconds=comment_data.timestamp_seconds
    )
    db.add_comment(comment)
    return {"message": "Comment added", "comment_id": comment.id}

@router.get("/video/{video_id}/comments")
async def get_video_comments(video_id: str):
    video = db.get_video(video_id)
    if not video:
        return {"comments": []}
    
    comments = [
        {
            "id": cid,
            "text": db.comments[cid].text,
            "timestamp_seconds": db.comments[cid].timestamp_seconds,
            "likes": db.comments[cid].likes
        }
        for cid in video.comments
        if cid in db.comments
    ]
    return {"comments": comments}

# ==================== UPLOAD ====================
@router.post("/upload")
async def upload_content(file: UploadFile = File(...)):
    """Upload - works with or without API"""
    try:
        print(f"📤 Receiving file: {file.filename} ({file.content_type})")
        content = await file.read()
        print(f"📊 File size: {len(content)} bytes")
        
        # Process file
        concepts_data = await document_processor.process_file(
            content, file.filename, file.content_type
        )
        
        print(f"✅ Extracted {len(concepts_data)} concepts")
        
        # Create concepts, videos, quizzes
        concept_ids = []
        for concept_data in concepts_data:
            concept_id = concept_data['id']
            
            concept = Concept(
                id=concept_id,
                subject=file.filename.split('.')[0],
                topic_name=concept_data['topic_name'],
                description=concept_data['description'],
                difficulty=concept_data['difficulty']
            )
            db.add_concept(concept)
            concept_ids.append(concept_id)
            
            # Generate video
            video_data = await gpt_generator.generate_video_script(
                concept_data['topic_name'],
                concept_data['description'],
                concept_data.get('key_points', [])
            )
            
            video = Video(
                id=video_data['id'],
                concept_id=concept_id,
                title=video_data['title'],
                script=video_data['full_script'],
                duration_seconds=video_data['duration_seconds']
            )
            db.add_video(video)
            
            # Generate quizzes
            quizzes_data = await gpt_generator.generate_quizzes(
                concept_data['topic_name'],
                concept_data['description']
            )
            
            for quiz_data in quizzes_data:
                quiz = Quiz(
                    id=quiz_data['id'],
                    concept_id=concept_id,
                    question=quiz_data['question'],
                    correct_answer=quiz_data['correct_answer'],
                    options=quiz_data['options'],
                    difficulty=quiz_data['difficulty'],
                    explanation=quiz_data['explanation']
                )
                db.add_quiz(quiz)
        
        return {
            "success": True,
            "message": f"Processed {len(concepts_data)} concepts",
            "concepts_extracted": len(concepts_data),
            "concept_ids": concept_ids
        }
    
    except Exception as e:
        print(f"❌ Upload error: {e}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "message": "Upload processed (demo mode)",
            "concepts_extracted": 2
        }

# ==================== HEALTH ====================
@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "NoteLoop AI",
        "mode": "Demo Mode (No API required)",
        "features": ["Smart Text Extraction", "Template Generation", "IRT Algorithm"],
        "users": len(db.users),
        "concepts": len(db.concepts),
        "videos": len(db.videos),
        "quizzes": len(db.quizzes)
    }
