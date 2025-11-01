"""
Hybrid Content Service - Fixed video ID tracking
"""

from src.models.database import db
from src.algorithms.adaptive_engine import adaptive_engine
import uuid

class HybridContentService:
    def __init__(self):
        self.use_supabase = False  # Using demo mode
        print(f"📊 Content Service Mode: In-Memory (Demo)")
    
    def get_feed(self, user_id, limit=20):
        """Get adaptive feed using demo data"""
        
        user = db.get_user(user_id)
        if not user:
            # Use demo user
            user = db.get_user("demo_user_123")
        
        if not user:
            return []
        
        available_concepts = list(db.concepts.values())
        if not available_concepts:
            return []
        
        feed_items = []
        items_since_last_quiz = 0
        
        for sequence in range(limit):
            content_type, concept_id = adaptive_engine.select_next_content(
                user,
                available_concepts,
                items_since_last_quiz
            )
            
            concept = db.concepts.get(concept_id)
            if not concept:
                continue
            
            if content_type == "video":
                videos = [db.videos[vid] for vid in concept.video_ids if vid in db.videos]
                if videos:
                    video = videos[0]
                    feed_items.append({
                        "id": str(uuid.uuid4()),
                        "type": "video",
                        "content": {
                            "video_id": video.id,  # Use actual video ID from database
                            "title": video.title,
                            "script": video.script,
                            "duration": video.duration_seconds,
                            "concept_name": concept.topic_name,
                            "likes": video.helpful_likes,
                            "views": video.views,
                            "url": video.url
                        },
                        "sequence": sequence
                    })
                    items_since_last_quiz += 1
            else:
                quizzes = [db.quizzes[qid] for qid in concept.quiz_ids if qid in db.quizzes]
                if quizzes:
                    quiz = quizzes[0]
                    feed_items.append({
                        "id": str(uuid.uuid4()),
                        "type": "quiz",
                        "content": {
                            "quiz_id": quiz.id,
                            "question": quiz.question,
                            "options": quiz.options,
                            "concept_name": concept.topic_name,
                            "difficulty_zone": adaptive_engine.get_difficulty_zone(
                                concept.difficulty, user.overall_ability
                            )
                        },
                        "sequence": sequence
                    })
                    items_since_last_quiz = 0
        
        return feed_items
    
    def submit_answer(self, user_id, quiz_id, user_answer, is_correct):
        """Submit quiz answer"""
        user = db.get_user(user_id)
        if not user:
            user = db.get_user("demo_user_123")
        
        quiz = db.quizzes.get(quiz_id)
        
        if not quiz:
            return {"error": "Quiz not found"}
        
        # Update user ability
        new_theta = adaptive_engine.update_user_ability(user, quiz.difficulty, is_correct)
        user.overall_ability = new_theta
        user.total_questions += 1
        if is_correct:
            user.correct_answers += 1
        
        # Update concept mastery
        performance = 1.0 if is_correct else 0.0
        new_mastery = adaptive_engine.update_concept_mastery(user, quiz.concept_id, performance)
        
        return {
            "is_correct": is_correct,
            "correct_answer": quiz.correct_answer,
            "explanation": quiz.explanation,
            "new_ability": new_theta,
            "concept_mastery": new_mastery,
            "success": True,
            "feedback": "Great job!" if is_correct else "Keep learning!",
            "new_mastery_level": new_mastery
        }

hybrid_service = HybridContentService()
