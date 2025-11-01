from fastapi import APIRouter, HTTPException
from typing import List, Dict
from pydantic import BaseModel
import uuid
import random

from src.models.database import db
from src.services.ai.feed_algorithm import feed_algorithm

router = APIRouter()

class FeedItemResponse(BaseModel):
    id: str
    type: str
    content: Dict
    sequence: int

class AnswerRequest(BaseModel):
    question_id: str
    is_correct: bool

@router.get("/feed/{user_id}", response_model=List[FeedItemResponse])
async def get_feed(user_id: str, limit: int = 10):
    user_progress = db.get_user_progress(user_id)
    available_concepts = list(db.concepts.values())
    
    if not available_concepts:
        raise HTTPException(status_code=404, detail="No concepts available")
    
    feed_items = []
    
    for sequence in range(limit):
        content_type, concept_id = feed_algorithm.select_next_content(
            user_progress,
            available_concepts
        )
        
        concept = db.concepts[concept_id]
        
        if content_type == "lesson":
            zone = feed_algorithm.determine_difficulty_zone(
                concept.difficulty,
                user_progress.theta
            )
            
            lesson_id = None
            for lid in concept.lessons:
                lesson = db.lessons[lid]
                if lesson.difficulty_level == zone:
                    lesson_id = lid
                    break
            
            if lesson_id:
                lesson = db.lessons[lesson_id]
                feed_item = FeedItemResponse(
                    id=str(uuid.uuid4()),
                    type="lesson",
                    content={
                        "title": lesson.title,
                        "content": lesson.content,
                        "concept_name": concept.name,
                        "difficulty_zone": zone
                    },
                    sequence=sequence
                )
                feed_items.append(feed_item)
        
        else:
            suitable_questions = [
                db.questions[qid] for qid in concept.questions
                if abs(db.questions[qid].difficulty - user_progress.theta) < 1.0
            ]
            
            if suitable_questions:
                question = random.choice(suitable_questions)
                feed_item = FeedItemResponse(
                    id=str(uuid.uuid4()),
                    type="quiz",
                    content={
                        "question_id": question.id,
                        "question": question.question,
                        "concept_name": concept.name
                    },
                    sequence=sequence
                )
                feed_items.append(feed_item)
    
    return feed_items

@router.post("/answer/{user_id}")
async def submit_answer(user_id: str, answer: AnswerRequest):
    user_progress = db.get_user_progress(user_id)
    question = db.questions.get(answer.question_id)
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    new_theta = feed_algorithm.update_user_ability(
        user_progress,
        question.difficulty,
        answer.is_correct
    )
    user_progress.theta = new_theta
    user_progress.total_questions_answered += 1
    
    concept_id = question.concept_id
    performance = 1.0 if answer.is_correct else 0.0
    user_progress.update_mastery(concept_id, performance)
    
    return {
        "correct": answer.is_correct,
        "explanation": question.explanation,
        "new_ability": new_theta,
        "concept_mastery": user_progress.concept_mastery.get(concept_id, 0.5)
    }

@router.get("/progress/{user_id}")
async def get_progress(user_id: str):
    user_progress = db.get_user_progress(user_id)
    
    return {
        "user_id": user_id,
        "overall_ability": user_progress.theta,
        "questions_answered": user_progress.total_questions_answered,
        "lessons_viewed": user_progress.total_lessons_viewed,
        "concept_mastery": user_progress.concept_mastery,
        "streak_days": 0
    }
