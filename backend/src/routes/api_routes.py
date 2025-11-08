from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict
from pydantic import BaseModel
import traceback

from src.models.database import db, User, Concept, Video, Quiz
from src.services.hybrid_content_service import hybrid_service
from src.services.document_processor import document_processor
from src.services.gpt_content_generator import gpt_generator
from src.services.ai_chat_service import ai_chat_service
from src.services.spaced_repetition_service import sr_service
from src.services.achievement_service import achievement_service
from src.services.reward_service import reward_service
from src.algorithms.forgetting_curve import forgetting_curve
from src.algorithms.multi_armed_bandit import mab_selector
from src.algorithms.metacognitive_tracker import metacognitive_tracker
from src.algorithms.exam_readiness import exam_predictor
from src.algorithms.learning_velocity import learning_velocity
from src.algorithms.optimal_study_time import study_time_predictor
from src.algorithms.interleaved_practice import interleaved_engine
from src.algorithms.deep_knowledge_tracing import dkt_model
from src.algorithms.cognitive_state import cognitive_detector
from src.algorithms.transfer_learning import transfer_detector
from src.services.folder_service import folder_service
from src.services.learning_style_service import learning_style_service
from src.services.collaboration_service import collaboration_service
from src.services.advanced_analytics_service import advanced_analytics
from src.services.tutor_verification_service import tutor_verification_service
from src.services.study_room_service import study_room_service
from src.services.study_plan_service import study_plan_service
from src.services.flashcard_service import flashcard_service
from src.services.ai_tutor_service import ai_tutor_service
from src.services.llm.generator import llm_generator
from datetime import datetime
import uuid

router = APIRouter()

class QuizAnswerRequest(BaseModel):
    quiz_id: str
    user_answer: str

class ChatRequest(BaseModel):
    message: str
    context: Dict = None
    upload_id: str = None

def get_user_or_create(user_id: str):
    user = db.get_user(user_id)
    if not user:
        user = db.get_user("demo_user_123")
    if not user:
        user = User(id=user_id, name="User", email=f"{user_id}@noteloop.ai")
        db.add_user(user)
    return user

@router.get("/users/{user_id}/progress")
async def get_user_progress(user_id: str):
    try:
        user = get_user_or_create(user_id)
        accuracy = (user.correct_answers / user.total_questions * 100) if user.total_questions > 0 else 0
        
        return {
            "user_id": user.id,
            "name": user.name,
            "overall_ability": round(user.overall_ability, 2),
            "total_questions": user.total_questions,
            "correct_answers": user.correct_answers,
            "accuracy": round(accuracy, 1),
            "concept_mastery": user.concept_mastery,
            "concepts_learned": len([m for m in user.concept_mastery.values() if (m if isinstance(m, float) else m.get('mastery', 0)) > 0.7]),
            "total_concepts": len(db.concepts)
        }
    except Exception as e:
        print(f"❌ Progress error: {e}")
        return {"error": str(e)}

@router.get("/feed/{user_id}")
async def get_feed(user_id: str, limit: int = 30, upload_id: str = None):
    try:
        user = get_user_or_create(user_id)
        
        # If no upload_id specified, use latest upload
        if not upload_id:
            upload_id = db.get_latest_upload_id(user_id)
        
        feed_items = hybrid_service.get_feed(user_id, limit, upload_id)
        return feed_items if feed_items else []
    except Exception as e:
        print(f"❌ Feed error: {e}")
        return []

@router.post("/quiz/answer/{user_id}")
async def submit_quiz_answer(user_id: str, answer: QuizAnswerRequest):
    try:
        user = get_user_or_create(user_id)
        quiz = db.quizzes.get(answer.quiz_id)
        
        if not quiz:
            return {"success": False, "error": "Quiz not found"}
        
        is_correct = answer.user_answer == quiz.correct_answer
        result = hybrid_service.submit_answer(user_id, answer.quiz_id, answer.user_answer, is_correct)
        
        # Update study streak
        db.update_study_streak(user_id)
        
        # Award credits for answering
        if is_correct:
            reward_result = reward_service.earn_credits(
                user_id, 'answer_correct', reward_service.CORRECT_ANSWER_CREDITS,
                {'quiz_id': answer.quiz_id, 'concept_id': quiz.concept_id}
            )
        else:
            reward_result = reward_service.earn_credits(
                user_id, 'answer_incorrect', reward_service.INCORRECT_ANSWER_CREDITS,
                {'quiz_id': answer.quiz_id, 'concept_id': quiz.concept_id}
            )
        result['credits_earned'] = reward_result.get('credits_earned', 0)
        result['level_up'] = reward_result.get('level_up', False)
        
        # Check achievements
        unlocked = achievement_service.check_achievements(user_id)
        if unlocked:
            result['achievements_unlocked'] = unlocked
            # Award credits for achievements
            for ach_id in unlocked:
                reward_service.earn_credits(user_id, f'achievement_{ach_id}', 100)
        
        # Initialize spaced repetition for concept if not already done
        if quiz.concept_id:
            sr_service.initialize_concept(user_id, quiz.concept_id)
        
        return result
    except Exception as e:
        print(f"❌ Answer error: {e}")
        return {"success": False, "error": str(e)}

@router.post("/upload")
async def upload_content(file: UploadFile = File(...)):
    """Upload and process files - crash resistant"""
    try:
        print(f"\n{'='*70}")
        print(f"📤 UPLOAD: {file.filename}")
        print(f"{'='*70}")
        
        # Read file with size limit (10MB)
        MAX_SIZE = 10 * 1024 * 1024  # 10MB
        content = await file.read()
        
        if len(content) > MAX_SIZE:
            return {
                "success": False, 
                "message": f"File too large. Max size is 10MB. Your file is {len(content) / 1024 / 1024:.1f}MB"
            }
        
        print(f"📊 Size: {len(content):,} bytes")
        
        # Process file (with timeout protection)
        try:
            concepts_data = await document_processor.process_file(
                content, 
                file.filename, 
                file.content_type or 'text/plain'
            )
        except Exception as e:
            print(f"❌ Processing failed: {e}")
            traceback.print_exc()
            return {
                "success": False,
                "message": f"Failed to process file: {str(e)}"
            }
        
        if not concepts_data or len(concepts_data) == 0:
            return {
                "success": False, 
                "message": "No content could be extracted from the file"
            }
        
        # Track upload in user history FIRST
        upload_id = str(uuid.uuid4())
        
        print(f"\n🔨 Creating {len(concepts_data)} concepts...")
        
        concept_ids = []
        
        # Create concepts with upload_id
        for i, concept_data in enumerate(concepts_data, 1):
            try:
                cid = concept_data['id']
                
                # Create concept - use source_text if available, otherwise use description
                source_text = concept_data.get('source_text', concept_data['description'])
                concept = Concept(
                    id=cid,
                    subject=file.filename.split('.')[0],
                    topic_name=concept_data['topic_name'],
                    description=concept_data['description'],
                    difficulty=concept_data['difficulty'],
                    source_text=source_text,
                    upload_id=upload_id  # Track upload
                )
                db.add_concept(concept)
                concept_ids.append(cid)
                print(f"   [{i}/{len(concepts_data)}] ✓ {concept_data['topic_name'][:50]}")
                
                # Create quizzes with upload_id
                try:
                    source_text_for_quiz = concept_data.get('source_text', concept_data['description'])
                    quizzes_data = await gpt_generator.generate_quizzes(
                        concept_data['topic_name'],
                        concept_data['description'],
                        num_questions=3,
                        source_text=source_text_for_quiz
                    )
                    
                    for quiz_data in quizzes_data:
                        quiz = Quiz(
                            id=quiz_data['id'],
                            concept_id=cid,
                            question=quiz_data['question'],
                            correct_answer=quiz_data['correct_answer'],
                            options=quiz_data['options'],
                            difficulty=quiz_data['difficulty'],
                            explanation=quiz_data['explanation'],
                            source_text=quiz_data.get('source_text', concept_data['description'][:200]),
                            concept_name=concept_data['topic_name'],
                            upload_id=upload_id  # Track upload
                        )
                        db.add_quiz(quiz)
                except Exception as e:
                    print(f"⚠️  Quiz generation failed for {concept_data['topic_name']}: {e}")
                
            except Exception as e:
                print(f"❌ Error creating concept {i}: {e}")
                continue
        
        print(f"\n{'='*70}")
        print(f"✅ UPLOAD COMPLETE!")
        print(f"   Concepts: {len(concept_ids)}")
        print(f"   Quizzes: {len([q for q in db.quizzes.values() if q.upload_id == upload_id])}")
        print(f"{'='*70}\n")
        
        # Store upload metadata
        upload_data = {
            "id": upload_id,
            "filename": file.filename,
            "uploaded_at": datetime.now().isoformat(),
            "concepts_created": len(concept_ids),
            "concept_ids": concept_ids,
            "file_size": len(content)
        }
        
        # Store for all users (in production, track per user)
        db.add_upload(upload_id, upload_data)
        
        # Add to demo user's history
        demo_user = db.get_user("demo_user_123")
        if demo_user:
            demo_user.upload_history.append(upload_data)
            # Award credits for upload
            reward_service.earn_credits(
                "demo_user_123", 'upload_document', reward_service.UPLOAD_DOCUMENT_CREDITS,
                {'upload_id': upload_id, 'concepts_created': len(concept_ids)}
            )
        
        return {
            "success": True,
            "message": f"Created {len(concept_ids)} concepts from {file.filename}",
            "concepts_created": len(concept_ids),
            "concept_ids": concept_ids,
            "upload_id": upload_id
        }
        
    except Exception as e:
        print(f"\n❌ UPLOAD ERROR: {e}")
        traceback.print_exc()
        return {
            "success": False, 
            "message": f"Upload failed: {str(e)}"
        }

@router.post("/chat/{user_id}")
async def chat_with_ai(user_id: str, request: ChatRequest):
    """Chat with AI assistant"""
    try:
        user = get_user_or_create(user_id)
        
        # Get user context
        accuracy = (user.correct_answers / user.total_questions * 100) if user.total_questions > 0 else 0
        context = {
            "overall_ability": user.overall_ability,
            "accuracy": accuracy,
            "concepts_learned": len([m for m in user.concept_mastery.values() if (m if isinstance(m, float) else m.get('mastery', 0)) > 0.7])
        }
        
        # Get AI response
        response = await ai_chat_service.chat(user_id, request.message, context)
        
        # Save to chat history
        user_message = {
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now().isoformat(),
            "upload_id": request.upload_id
        }
        ai_message = {
            "role": "assistant",
            "content": response.get("response", ""),
            "timestamp": response.get("timestamp", datetime.now().isoformat()),
            "upload_id": request.upload_id
        }
        
        db.add_chat_message(user_id, user_message)
        db.add_chat_message(user_id, ai_message)
        
        return response
        
    except Exception as e:
        print(f"❌ Chat error: {e}")
        return {"response": "Error processing your message", "error": str(e)}

@router.post("/study-guide/generate")
async def generate_study_guide(request: dict):
    """Generate AI-powered study guide from uploaded concepts"""
    try:
        user_id = request.get("user_id")
        upload_id = request.get("upload_id")
        concepts_data = request.get("concepts", [])
        
        if not concepts_data or len(concepts_data) == 0:
            return {
                "success": False,
                "message": "No concepts provided"
            }
        
        # Use AI chat service to generate comprehensive study guide
        concepts_text = "\n".join([
            f"- {c.get('topic_name', 'Concept')}: {c.get('description', '')[:200]}"
            for c in concepts_data[:10]
        ])
        
        study_guide_prompt = f"""Create a comprehensive study guide from the following concepts:

{concepts_text}

Format the study guide as JSON with this structure:
{{
  "title": "Study Guide Title",
  "sections": [
    {{
      "title": "Concept Name",
      "summary": "Clear, concise summary (2-3 sentences)",
      "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4"],
      "examples": ["Example 1", "Example 2"],
      "studyTips": ["Tip 1", "Tip 2"]
    }}
  ]
}}

Make it educational, easy to understand, and focused on helping the student learn effectively. Return ONLY valid JSON."""
        
        # Generate study guide using AI with JSON response format
        if ai_chat_service.client:
            try:
                response = await ai_chat_service.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are an expert study guide creator. Always return valid JSON only."},
                        {"role": "user", "content": study_guide_prompt}
                    ],
                    max_tokens=2000,
                    temperature=0.7,
                    response_format={"type": "json_object"}
                )
                response_text = response.choices[0].message.content.strip()
            except Exception as e:
                print(f"AI generation error: {e}")
                response_text = ""
        else:
            response_text = ""
        
        # Try to parse JSON from response
        import json
        import re
        
        study_guide = None
        
        # Extract JSON from response (handle markdown code blocks)
        json_match = re.search(r'```(?:json)?\s*(\{.*\})\s*```', response_text, re.DOTALL)
        if json_match:
            try:
                study_guide = json.loads(json_match.group(1))
            except:
                pass
        
        if not study_guide:
            # Try to find JSON object directly
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                try:
                    study_guide = json.loads(json_match.group(0))
                except:
                    pass
        
        if not study_guide:
            # Fallback: create structured guide from concepts
            study_guide = {
                "title": "Complete Study Guide",
                "sections": [
                    {
                        "title": c.get("topic_name", "Concept"),
                        "summary": (c.get("description", "")[:200] + "...") if len(c.get("description", "")) > 200 else c.get("description", ""),
                        "keyPoints": [
                            "Key concept point 1",
                            "Key concept point 2",
                            "Key concept point 3"
                        ],
                        "examples": ["Example 1", "Example 2"],
                        "studyTips": ["Review this concept daily", "Practice with related questions"]
                    }
                    for c in concepts_data[:10]
                ]
            }
        
        return {
            "success": True,
            "study_guide": study_guide
        }
        
    except Exception as e:
        print(f"❌ Study guide generation error: {e}")
        traceback.print_exc()
        return {
            "success": False,
            "message": f"Failed to generate study guide: {str(e)}"
        }

@router.post("/chat/{user_id}/explain")
async def explain_concept(user_id: str, request: dict):
    """Explain a concept in detail"""
    try:
        concept_text = request.get("concept_text", "")
        user_question = request.get("question", "")
        
        response = await ai_chat_service.explain_concept(concept_text, user_question)
        
        # Save to chat history
        db.add_chat_message(user_id, {
            "role": "user",
            "content": f"Explain: {user_question or concept_text[:100]}",
            "timestamp": datetime.now().isoformat()
        })
        db.add_chat_message(user_id, {
            "role": "assistant",
            "content": response.get("response", ""),
            "timestamp": response.get("timestamp", datetime.now().isoformat())
        })
        
        return response
        
    except Exception as e:
        return {"response": f"Error: {str(e)}"}

@router.get("/users/{user_id}/uploads")
async def get_user_uploads(user_id: str):
    """Get user's upload history"""
    try:
        user = get_user_or_create(user_id)
        uploads = db.get_user_uploads(user_id)
        return {
            "uploads": uploads,
            "total": len(uploads)
        }
    except Exception as e:
        return {"uploads": [], "error": str(e)}

@router.get("/users/{user_id}/chat-history")
async def get_chat_history(user_id: str):
    """Get user's chat history"""
    try:
        history = db.get_chat_history(user_id)
        return {"history": history}
    except Exception as e:
        return {"history": [], "error": str(e)}

@router.get("/users/{user_id}/learning-insights")
async def get_learning_insights(user_id: str):
    """Get learning insights and preferences"""
    try:
        user = get_user_or_create(user_id)
        accuracy = (user.correct_answers / user.total_questions * 100) if user.total_questions > 0 else 0
        
        # Analyze learning patterns
        preferences = db.get_learning_preferences(user_id)
        
        # Simple insights based on performance
        insights = {
            "overall_ability": round(user.overall_ability, 2),
            "accuracy": round(accuracy, 1),
            "total_questions": user.total_questions,
            "concepts_mastered": len([m for m in user.concept_mastery.values() if (m if isinstance(m, float) else m.get('mastery', 0)) > 0.7]),
            "learning_preferences": preferences,
            "suggested_focus": []  # Can be enhanced with ML
        }
        
        # Suggest focus areas
        if accuracy < 60:
            insights["suggested_focus"].append("Review fundamental concepts")
        if len(user.concept_mastery) > 0:
            weakest = min(user.concept_mastery.items(), key=lambda x: x[1] if isinstance(x[1], float) else x[1].get('mastery', 0))
            concept = db.get_concept(weakest[0])
            if concept:
                insights["suggested_focus"].append(f"Strengthen: {concept.topic_name}")
        
        return insights
        
    except Exception as e:
        return {"error": str(e)}

# Spaced Repetition Endpoints
@router.get("/users/{user_id}/spaced-repetition/due")
async def get_due_reviews(user_id: str):
    """Get concepts due for spaced repetition review"""
    try:
        due_items = sr_service.get_due_reviews(user_id)
        return {"due_items": due_items, "count": len(due_items)}
    except Exception as e:
        return {"due_items": [], "error": str(e)}

@router.post("/users/{user_id}/spaced-repetition/review")
async def review_concept(user_id: str, request: dict):
    """Review a concept for spaced repetition"""
    try:
        concept_id = request.get("concept_id")
        quality = request.get("quality", 0.5)  # 0.0-1.0
        
        result = sr_service.review_concept(user_id, concept_id, quality)
        return {"success": True, "spaced_repetition": result}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/users/{user_id}/spaced-repetition/initialize")
async def initialize_spaced_repetition(user_id: str, request: dict):
    """Initialize spaced repetition for a concept"""
    try:
        concept_id = request.get("concept_id")
        result = sr_service.initialize_concept(user_id, concept_id)
        return {"success": True, "spaced_repetition": result}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Achievement Endpoints
@router.get("/users/{user_id}/achievements")
async def get_user_achievements(user_id: str):
    """Get user's achievements"""
    try:
        achievements = achievement_service.get_user_achievements(user_id)
        all_achievements = achievement_service.get_all_achievements()
        return {"unlocked": achievements, "all": all_achievements}
    except Exception as e:
        return {"unlocked": [], "all": [], "error": str(e)}

@router.post("/users/{user_id}/achievements/check")
async def check_achievements(user_id: str):
    """Check and unlock new achievements"""
    try:
        unlocked = achievement_service.check_achievements(user_id)
        return {"unlocked": unlocked, "count": len(unlocked)}
    except Exception as e:
        return {"unlocked": [], "error": str(e)}

# Study Streak Endpoints
@router.get("/users/{user_id}/streaks")
async def get_streaks(user_id: str):
    """Get user's study streaks"""
    try:
        user = get_user_or_create(user_id)
        return {
            "current_streak": user.current_streak,
            "longest_streak": user.longest_streak,
            "last_study_date": user.last_study_date,
            "study_days_count": len(user.study_days)
        }
    except Exception as e:
        return {"error": str(e)}

@router.post("/users/{user_id}/streaks/update")
async def update_streak(user_id: str):
    """Update study streak (call when user studies)"""
    try:
        db.update_study_streak(user_id)
        achievement_service.check_achievements(user_id)  # Check achievements
        user = db.get_user(user_id)
        return {
            "success": True,
            "current_streak": user.current_streak,
            "longest_streak": user.longest_streak
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# Study Plan Endpoints
@router.post("/users/{user_id}/study-plans")
async def create_study_plan(user_id: str, request: dict):
    """Create a personalized study plan"""
    try:
        concepts = request.get("concepts", [])
        duration_days = request.get("duration_days", 7)
        
        plan = study_plan_service.create_study_plan(user_id, concepts, duration_days)
        return {"success": True, "plan": plan}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/users/{user_id}/study-plans")
async def get_study_plans(user_id: str):
    """Get all study plans for a user"""
    try:
        plans = study_plan_service.get_user_plans(user_id)
        active_plan = study_plan_service.get_active_plan(user_id)
        return {"plans": plans, "active_plan": active_plan}
    except Exception as e:
        return {"plans": [], "error": str(e)}

@router.post("/users/{user_id}/study-plans/{plan_id}/complete-day")
async def complete_study_day(user_id: str, plan_id: str, day: int):
    """Mark a study day as completed"""
    try:
        success = study_plan_service.complete_day(user_id, plan_id, day)
        return {"success": success}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Analytics Dashboard Endpoint
@router.get("/users/{user_id}/analytics")
async def get_analytics(user_id: str):
    """Get comprehensive analytics dashboard data"""
    try:
        user = get_user_or_create(user_id)
        accuracy = (user.correct_answers / user.total_questions * 100) if user.total_questions > 0 else 0
        
        # Calculate time-based stats
        study_days = sorted(list(user.study_days))
        activity_heatmap = {}
        for day in study_days:
            activity_heatmap[day] = 1  # Could track actual activity level
        
        # Concept mastery breakdown
        mastery_levels = {
            'mastered': len([m for m in user.concept_mastery.values() if (m if isinstance(m, float) else m.get('mastery', 0)) > 0.7]),
            'learning': len([m for m in user.concept_mastery.values() if 0.3 <= (m if isinstance(m, float) else m.get('mastery', 0)) <= 0.7]),
            'struggling': len([m for m in user.concept_mastery.values() if (m if isinstance(m, float) else m.get('mastery', 0)) < 0.3])
        }
        
        # Performance trends (simplified - would track over time in production)
        performance_trend = {
            'accuracy': [accuracy] * 7,  # Last 7 days (would be actual data)
            'questions_per_day': [user.total_questions // max(1, len(study_days))] * 7
        }
        
        analytics = {
            "overall_stats": {
                "ability": round(user.overall_ability, 2),
                "accuracy": round(accuracy, 1),
                "total_questions": user.total_questions,
                "concepts_mastered": mastery_levels['mastered'],
                "current_streak": user.current_streak,
                "achievements_count": len(user.achievements)
            },
            "mastery_levels": mastery_levels,
            "activity_heatmap": activity_heatmap,
            "performance_trend": performance_trend,
            "spaced_repetition": {
                "due_count": len(sr_service.get_due_reviews(user_id)),
                "total_tracked": len(user.spaced_repetition)
            },
            "study_habits": {
                "average_questions_per_day": user.total_questions // max(1, len(study_days)),
                "total_study_days": len(study_days),
                "consistency_score": len(study_days) / max(1, (datetime.now().date() - datetime.fromisoformat(study_days[0]).date() if study_days else datetime.now().date()).days)
            }
        }
        
        return analytics
        
    except Exception as e:
        return {"error": str(e)}

# Flashcard Endpoints
@router.get("/users/{user_id}/flashcards")
async def get_flashcards(user_id: str, upload_id: str = None):
    """Get flashcards for user"""
    try:
        flashcards = flashcard_service.get_quizzes_as_flashcards(user_id, upload_id)
        return {"flashcards": flashcards, "count": len(flashcards)}
    except Exception as e:
        return {"flashcards": [], "error": str(e)}

# AI Tutor Endpoints
@router.post("/tutor/{user_id}/session")
async def start_tutor_session(user_id: str, request: dict):
    """Start a new AI tutoring session"""
    try:
        topic = request.get("topic")
        upload_id = request.get("upload_id")
        session = await ai_tutor_service.start_session(user_id, topic, upload_id)
        return {"success": True, "session": session}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/tutor/{user_id}/session/{session_id}/message")
async def tutor_message(user_id: str, session_id: str, request: dict):
    """Send a message in a tutoring session"""
    try:
        message = request.get("message", "")
        result = await ai_tutor_service.process_message(user_id, session_id, message)
        return result
    except Exception as e:
        return {"error": str(e)}

@router.post("/tutor/{user_id}/session/{session_id}/question")
async def tutor_generate_question(user_id: str, session_id: str, concept_id: str = None):
    """Generate a practice question in tutoring session"""
    try:
        question_data = await ai_tutor_service.generate_question(user_id, session_id, concept_id)
        return {"success": True, "question": question_data}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/tutor/{user_id}/sessions")
async def get_tutor_sessions(user_id: str):
    """Get all tutor sessions for a user"""
    try:
        sessions = db.get_user_tutor_sessions(user_id)
        return {"sessions": sessions, "count": len(sessions)}
    except Exception as e:
        return {"sessions": [], "error": str(e)}

# Reward System Endpoints
@router.get("/users/{user_id}/rewards")
async def get_rewards(user_id: str):
    """Get user's reward summary"""
    try:
        summary = reward_service.get_reward_summary(user_id)
        available = reward_service.get_available_rewards()
        return {
            "summary": summary,
            "available_rewards": available
        }
    except Exception as e:
        return {"error": str(e)}

@router.post("/users/{user_id}/rewards/spend")
async def spend_rewards(user_id: str, request: dict):
    """Spend credits on a reward"""
    try:
        item = request.get("item")
        cost = request.get("cost")
        result = reward_service.spend_credits(user_id, item, cost)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/users/{user_id}/rewards/daily-bonus")
async def get_daily_bonus(user_id: str):
    """Get daily login and streak bonuses"""
    try:
        bonus = reward_service.calculate_daily_bonus(user_id)
        return bonus
    except Exception as e:
        return {"error": str(e)}

# Advanced Algorithm Endpoints
@router.get("/users/{user_id}/forgetting-curve/{concept_id}")
async def get_forgetting_curve(user_id: str, concept_id: str):
    """Get forgetting curve data for a concept"""
    try:
        user = get_user_or_create(user_id)
        mastery_data = user.concept_mastery.get(concept_id, {})
        
        if isinstance(mastery_data, dict):
            last_review_str = mastery_data.get('last_review')
            memory_strength = mastery_data.get('memory_strength', 1.0)
            
            if last_review_str:
                last_review = datetime.fromisoformat(last_review_str)
                retention = forgetting_curve.calculate_retention(last_review, memory_strength)
                optimal_review = forgetting_curve.predict_optimal_review_time(last_review, memory_strength)
                is_due = forgetting_curve.is_due_for_review(last_review, memory_strength)
                
                return {
                    "retention": round(retention, 3),
                    "optimal_review_time": optimal_review.isoformat(),
                    "is_due": is_due,
                    "memory_strength": memory_strength
                }
        
        return {"retention": 0.0, "is_due": True}
    except Exception as e:
        return {"error": str(e)}

@router.get("/users/{user_id}/exam-readiness")
async def get_exam_readiness(user_id: str, exam_concepts: str = None, days_until_exam: int = 7):
    """Predict exam readiness"""
    try:
        user = get_user_or_create(user_id)
        
        if exam_concepts:
            concept_list = exam_concepts.split(',')
        else:
            concept_list = list(user.concept_mastery.keys())
        
        mastery_data = {}
        for concept_id in concept_list:
            mastery = user.concept_mastery.get(concept_id, {})
            if isinstance(mastery, dict):
                mastery_data[concept_id] = mastery
            else:
                mastery_data[concept_id] = {
                    'mastery': float(mastery) if isinstance(mastery, (int, float)) else 0.0,
                    'last_review': datetime.now().isoformat(),
                    'memory_strength': 1.0
                }
        
        prediction = exam_predictor.predict_exam_score(
            user_id, concept_list, mastery_data, days_until_exam
        )
        
        return prediction
    except Exception as e:
        return {"error": str(e)}

@router.get("/users/{user_id}/learning-velocity")
async def get_learning_velocity(user_id: str, days: int = 7):
    """Get learning velocity metrics"""
    try:
        user = get_user_or_create(user_id)
        velocity_history = user.learning_velocity_history
        
        velocity_data = learning_velocity.calculate_velocity(velocity_history, days)
        feedback = learning_velocity.get_velocity_feedback(velocity_data)
        
        return {
            **velocity_data,
            "feedback": feedback
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/users/{user_id}/optimal-study-time")
async def get_optimal_study_time(user_id: str):
    """Get optimal study time predictions"""
    try:
        user = get_user_or_create(user_id)
        performance_history = user.performance_by_time
        
        analysis = study_time_predictor.analyze_performance_patterns(performance_history)
        suggestions = study_time_predictor.get_optimal_study_times(analysis)
        feedback = study_time_predictor.get_study_time_feedback(analysis)
        
        return {
            "analysis": analysis,
            "suggestions": suggestions,
            "feedback": feedback
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/users/{user_id}/metacognitive")
async def get_metacognitive_data(user_id: str):
    """Get metacognitive awareness data"""
    try:
        user = get_user_or_create(user_id)
        metacognitive_data = user.metacognitive_data
        
        all_confidences = []
        all_performances = []
        
        for concept_id, data in metacognitive_data.items():
            confidences = data.get('confidence_history', [])
            performances = data.get('performance_history', [])
            all_confidences.extend(confidences)
            all_performances.extend(performances)
        
        if len(all_confidences) >= 5:
            calibration = metacognitive_tracker.calculate_calibration(
                all_confidences, all_performances
            )
            feedback = metacognitive_tracker.get_metacognitive_feedback(calibration)
            suggestions = metacognitive_tracker.suggest_improvement(calibration)
            
            return {
                "calibration": calibration,
                "feedback": feedback,
                "suggestions": suggestions
            }
        
        return {
            "calibration": None,
            "feedback": "Need more data to assess metacognitive awareness",
            "suggestions": []
        }
    except Exception as e:
        return {"error": str(e)}

# Folder and Workspace Endpoints
@router.get("/users/{user_id}/folders")
async def get_folders(user_id: str):
    """Get all folders for user"""
    try:
        folders = folder_service.get_folders(user_id)
        return {"folders": folders}
    except Exception as e:
        return {"folders": [], "error": str(e)}

@router.post("/users/{user_id}/folders")
async def create_folder(user_id: str, request: dict):
    """Create a new folder"""
    try:
        name = request.get("name", "New Folder")
        color = request.get("color", "#667eea")
        icon = request.get("icon", "📁")
        description = request.get("description", "")
        
        result = folder_service.create_folder(user_id, name, color, icon, description)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.put("/users/{user_id}/folders/{folder_id}")
async def update_folder(user_id: str, folder_id: str, request: dict):
    """Update folder"""
    try:
        result = folder_service.update_folder(user_id, folder_id, request)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/users/{user_id}/folders/{folder_id}/add")
async def add_to_folder(user_id: str, folder_id: str, request: dict):
    """Add upload or quiz to folder"""
    try:
        upload_id = request.get("upload_id")
        quiz_id = request.get("quiz_id")
        result = folder_service.add_to_folder(user_id, folder_id, upload_id, quiz_id)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.delete("/users/{user_id}/folders/{folder_id}")
async def delete_folder(user_id: str, folder_id: str):
    """Delete folder"""
    try:
        result = folder_service.delete_folder(user_id, folder_id)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

# Learning Style Endpoints
@router.get("/users/{user_id}/learning-style/questionnaire")
async def get_learning_style_questionnaire(user_id: str):
    """Get learning style questionnaire"""
    try:
        questions = learning_style_service.get_questionnaire()
        return {"questions": questions}
    except Exception as e:
        return {"questions": [], "error": str(e)}

@router.post("/users/{user_id}/learning-style/assess")
async def assess_learning_style(user_id: str, request: dict):
    """Assess learning style from responses"""
    try:
        responses = request.get("responses", [])
        profile = learning_style_service.analyze_responses(responses)
        result = learning_style_service.save_learning_style(user_id, profile)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/users/{user_id}/learning-style")
async def get_learning_style(user_id: str):
    """Get user's learning style profile"""
    try:
        user = get_user_or_create(user_id)
        style = user.learning_preferences.get("learning_style", {})
        return {"profile": style}
    except Exception as e:
        return {"profile": {}, "error": str(e)}

# Quiz Saving Endpoints
@router.post("/users/{user_id}/quizzes/save")
async def save_quiz(user_id: str, request: dict):
    """Save a quiz for later review"""
    try:
        user = get_user_or_create(user_id)
        quiz_id = request.get("quiz_id")
        
        if not quiz_id:
            return {"success": False, "error": "quiz_id required"}
        
        # Check if already saved
        if not hasattr(user, 'saved_quizzes') or user.saved_quizzes is None:
            user.saved_quizzes = []
        
        if quiz_id not in [sq.get("quiz_id") for sq in user.saved_quizzes]:
            user.saved_quizzes.append({
                "quiz_id": quiz_id,
                "saved_at": datetime.now().isoformat(),
                "folder_id": request.get("folder_id")
            })
        
        return {"success": True, "saved_quizzes": len(user.saved_quizzes)}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/users/{user_id}/quizzes/saved")
async def get_saved_quizzes(user_id: str):
    """Get saved quizzes"""
    try:
        user = get_user_or_create(user_id)
        saved = getattr(user, 'saved_quizzes', [])
        return {"saved_quizzes": saved}
    except Exception as e:
        return {"saved_quizzes": [], "error": str(e)}

# Advanced Analytics Endpoints
@router.get("/users/{user_id}/analytics/advanced")
async def get_advanced_analytics(user_id: str, days: int = 30):
    """Get advanced analytics"""
    try:
        velocity = advanced_analytics.get_learning_velocity_analytics(user_id, days)
        trends = advanced_analytics.get_performance_trends(user_id, days)
        heatmap = advanced_analytics.get_activity_heatmap(user_id, 90)
        weak_areas = advanced_analytics.get_weak_areas_analysis(user_id)
        study_time = advanced_analytics.get_optimal_study_time_analysis(user_id)
        concept_map = advanced_analytics.get_concept_relationship_map(user_id)
        
        return {
            "velocity": velocity,
            "trends": trends,
            "heatmap": heatmap,
            "weak_areas": weak_areas,
            "optimal_study_time": study_time,
            "concept_map": concept_map
        }
    except Exception as e:
        return {"error": str(e)}

# Collaboration Endpoints
@router.post("/collaboration/groups")
async def create_study_group(user_id: str, request: dict):
    """Create a study group"""
    try:
        name = request.get("name", "New Study Group")
        description = request.get("description", "")
        is_public = request.get("is_public", False)
        
        result = collaboration_service.create_study_group(user_id, name, description, is_public)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/collaboration/groups/user/{user_id}")
async def get_user_groups(user_id: str):
    """Get user's study groups"""
    try:
        groups = collaboration_service.get_user_groups(user_id)
        return {"groups": groups}
    except Exception as e:
        return {"groups": [], "error": str(e)}

@router.get("/collaboration/groups/public")
async def get_public_groups():
    """Get public study groups"""
    try:
        groups = collaboration_service.get_public_groups()
        return {"groups": groups}
    except Exception as e:
        return {"groups": [], "error": str(e)}

@router.post("/collaboration/groups/{group_id}/join")
async def join_group(user_id: str, group_id: str, request: dict = None):
    """Join a study group"""
    try:
        referrer_id = None
        if request:
            referrer_id = request.get("referrer_id")
        result = collaboration_service.join_study_group(user_id, group_id, referrer_id)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/collaboration/groups/invite/{invite_code}/join")
async def join_by_invite(user_id: str, invite_code: str):
    """Join a group using an invite code"""
    try:
        result = collaboration_service.join_by_invite(user_id, invite_code)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/collaboration/groups/invite/{invite_code}")
async def get_group_by_invite(invite_code: str):
    """Get group details by invite code"""
    try:
        group = collaboration_service.get_group_by_invite(invite_code)
        if group:
            return {"success": True, "group": group}
        return {"success": False, "error": "Invalid invite code"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/collaboration/groups/{group_id}/share/folder")
async def share_folder(user_id: str, group_id: str, request: dict):
    """Share folder with group"""
    try:
        folder_id = request.get("folder_id")
        result = collaboration_service.share_folder(user_id, group_id, folder_id)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/collaboration/groups/{group_id}/share/quiz")
async def share_quiz(user_id: str, group_id: str, request: dict):
    """Share quiz with group"""
    try:
        quiz_id = request.get("quiz_id")
        result = collaboration_service.share_quiz(user_id, group_id, quiz_id)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/collaboration/groups/{group_id}/challenges")
async def create_challenge(user_id: str, group_id: str, request: dict):
    """Create group challenge"""
    try:
        challenge_type = request.get("type", "questions")
        target = request.get("target", 10)
        duration_days = request.get("duration_days", 7)
        
        result = collaboration_service.create_challenge(
            user_id, group_id, challenge_type, target, duration_days
        )
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

# Tutor Verification Endpoints
@router.post("/tutors/verify/apply")
async def apply_tutor_verification(user_id: str, request: dict):
    """Apply for tutor verification"""
    try:
        result = tutor_verification_service.submit_verification_request(user_id, request)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/tutors/{user_id}/profile")
async def get_tutor_profile(user_id: str):
    """Get tutor profile"""
    try:
        profile = tutor_verification_service.get_tutor_profile(user_id)
        return profile
    except Exception as e:
        return {"verified": False, "error": str(e)}

@router.get("/tutors/verified")
async def get_verified_tutors(subject: str = None):
    """Get list of verified tutors"""
    try:
        tutors = tutor_verification_service.get_verified_tutors(subject)
        return {"tutors": tutors}
    except Exception as e:
        return {"tutors": [], "error": str(e)}

# Study Room Endpoints
@router.post("/study-rooms")
async def create_study_room(host_id: str, request: dict):
    """Create a study room (no verification required)"""
    try:
        title = request.get("title", "Study Session")
        description = request.get("description", "")
        subject = request.get("subject", "")
        max_students = request.get("max_students", 10)
        is_public = request.get("is_public", False)
        scheduled_time = request.get("scheduled_time")
        
        result = study_room_service.create_study_room(
            host_id, title, description, subject, max_students, is_public, scheduled_time
        )
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/study-rooms/{room_id}")
async def get_study_room(room_id: str):
    """Get study room details"""
    try:
        room = study_room_service.get_study_room(room_id)
        if room:
            return {"success": True, "room": room}
        return {"success": False, "error": "Room not found"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/study-rooms/{room_id}/join")
async def join_study_room(user_id: str, room_id: str):
    """Join a study room"""
    try:
        result = study_room_service.join_study_room(user_id, room_id)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/study-rooms/{room_id}/leave")
async def leave_study_room(user_id: str, room_id: str):
    """Leave a study room"""
    try:
        result = study_room_service.leave_study_room(user_id, room_id)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/study-rooms/host/{host_id}")
async def get_host_rooms(host_id: str):
    """Get host's study rooms"""
    try:
        rooms = study_room_service.get_host_rooms(host_id)
        return {"rooms": rooms}
    except Exception as e:
        return {"rooms": [], "error": str(e)}

@router.get("/study-rooms/invite/{invite_code}")
async def get_room_by_invite(invite_code: str):
    """Get room by invite code"""
    try:
        room = study_room_service.get_room_by_invite(invite_code)
        if room:
            return {"success": True, "room": room}
        return {"success": False, "error": "Invalid invite code"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/study-rooms/public")
async def get_public_rooms(subject: str = None):
    """Get public study rooms"""
    try:
        rooms = study_room_service.get_public_rooms(subject)
        return {"rooms": rooms}
    except Exception as e:
        return {"rooms": [], "error": str(e)}

@router.post("/study-rooms/{room_id}/ai-assistance")
async def get_ai_tutor_assistance(room_id: str, request: dict):
    """Get AI assistance for tutor"""
    try:
        query = request.get("query", "")
        context = request.get("context", {})
        result = study_room_service.get_ai_tutor_assistance(room_id, query, context)
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

# Free LLM Processing Endpoints
@router.post("/process-text")
async def process_text(request: dict):
    """Process uploaded text and extract structured learning content"""
    try:
        text = request.get("text", "")
        if not text:
            return {"success": False, "error": "No text provided"}
        
        result = await llm_generator.process_text(text)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        print(f"❌ Text processing error: {e}")
        traceback.print_exc()
        return {"success": False, "error": str(e)}

@router.post("/extract-concepts")
async def extract_concepts(request: dict):
    """Extract concepts from text"""
    try:
        text = request.get("text", "")
        if not text:
            return {"success": False, "error": "No text provided"}
        
        result = await llm_generator.extract_concepts(text)
        return {
            "success": True,
            "concepts": result
        }
    except Exception as e:
        print(f"❌ Concept extraction error: {e}")
        return {"success": False, "error": str(e)}

@router.post("/generate-summary")
async def generate_summary(request: dict):
    """Generate summary of text"""
    try:
        text = request.get("text", "")
        length = request.get("length", "medium")
        
        if not text:
            return {"success": False, "error": "No text provided"}
        
        result = await llm_generator.generate_summary(text, length)
        return {
            "success": True,
            "summary": result
        }
    except Exception as e:
        print(f"❌ Summary generation error: {e}")
        return {"success": False, "error": str(e)}

@router.post("/flashcards")
async def generate_flashcards(request: dict):
    """Generate flashcards from concepts"""
    try:
        concepts = request.get("concepts", [])
        count = request.get("count", 10)
        
        if not concepts:
            return {"success": False, "error": "No concepts provided"}
        
        result = await llm_generator.create_flashcards(concepts, count)
        return {
            "success": True,
            "flashcards": result.get("flashcards", [])
        }
    except Exception as e:
        print(f"❌ Flashcard generation error: {e}")
        return {"success": False, "error": str(e)}

@router.post("/quiz")
async def generate_quiz(request: dict):
    """Generate quiz questions from concepts"""
    try:
        concepts = request.get("concepts", [])
        difficulty = request.get("difficulty", "mixed")
        question_count = request.get("question_count", 10)
        
        if not concepts:
            return {"success": False, "error": "No concepts provided"}
        
        result = await llm_generator.generate_quiz(concepts, difficulty, question_count)
        return {
            "success": True,
            "questions": result.get("questions", [])
        }
    except Exception as e:
        print(f"❌ Quiz generation error: {e}")
        return {"success": False, "error": str(e)}

@router.post("/study-plan")
async def generate_study_plan(request: dict):
    """Generate adaptive study plan"""
    try:
        concepts = request.get("concepts", [])
        user_level = request.get("user_level", "intermediate")
        duration_days = request.get("duration_days", 7)
        
        if not concepts:
            return {"success": False, "error": "No concepts provided"}
        
        result = await llm_generator.study_plan(concepts, user_level, duration_days)
        return {
            "success": True,
            "plan": result
        }
    except Exception as e:
        print(f"❌ Study plan generation error: {e}")
        return {"success": False, "error": str(e)}

@router.post("/topic-outline")
async def generate_topic_outline(request: dict):
    """Generate hierarchical topic outline"""
    try:
        text = request.get("text", "")
        if not text:
            return {"success": False, "error": "No text provided"}
        
        result = await llm_generator.generate_topic_outline(text)
        return {
            "success": True,
            "outline": result
        }
    except Exception as e:
        print(f"❌ Outline generation error: {e}")
        return {"success": False, "error": str(e)}

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "users": len(db.users),
        "concepts": len(db.concepts),
        "videos": len(db.videos),
        "quizzes": len(db.quizzes)
    }
