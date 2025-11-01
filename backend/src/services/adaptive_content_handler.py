import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.services.db_manager import (
    get_user_by_email, get_concepts, get_lessons_with_embeddings,
    get_lesson_content, update_user_session_state, insert_interactions,
    update_user_theta
)
from src.algorithms.noteloop_ai_engine import (
    select_next_lesson_concept, update_mastery, initialize_user_state, sigmoid
)
from datetime import datetime
import numpy as np

def run_adaptive_step(user_email):
    """
    Runs an adaptive step to select and deliver the next micro-lesson.
    Selection uses IRT mastery (theta) and difficulty (b_concepts) along with 
    a boost for popular (high liked lessons).
    
    Returns:
        lesson_content: dict of lesson and its embedded questions
        concept_id: string of the id of the concept being studied
        concept_idx: internal array index of the concept
    """
    user = get_user_by_email(user_email)
    if not user:
        raise ValueError(f"No user found with this email: {user_email}")
    
    concepts = get_concepts()
    if not concepts:
        raise ValueError("No concepts found in database")
    
    num_concepts = len(concepts)
    b_concepts = np.array([c["difficulty"] for c in concepts])
    
    session_data = user.get("session_data", {"last_concept_idx": 0, "current_lesson_id": None})
    
    user_state = user.get("current_theta")
    if not user_state or len(user_state.get("theta", [])) != num_concepts:
        user_state = initialize_user_state(num_concepts)
    
    # Select the next lesson concept based on mastery and social score
    next_concept_idx = select_next_lesson_concept(user_state, concepts)
    concept = concepts[next_concept_idx]
    
    # Fetch the best lesson for the chosen concept
    lessons_for_concept = get_lessons_with_embeddings()
    
    # Filter lessons by like count descending (FIX: was "1" instead of "l")
    filtered_lessons = [
        l for l in lessons_for_concept if l["concept_id"] == concept["id"]
    ]
    filtered_lessons.sort(key=lambda x: x.get("like_count", 0), reverse=True)
    
    if not filtered_lessons:
        return {"error": f"No micro-lesson found for concept: {concept['name']}"}, None, None
    
    lesson_to_use = filtered_lessons[0]
    
    # Fetch full lesson content including embedded questions
    lesson_content = get_lesson_content(lesson_to_use["id"])
    
    # Persistent session state for the next request
    new_session_data = {
        "last_concept_idx": next_concept_idx,
        "current_lesson_id": lesson_to_use["id"]
    }
    
    update_user_session_state(user["id"], new_session_data)
    
    return lesson_content, concept["id"], next_concept_idx


def submit_embedded_answer(user_email, question_id, user_answer_outcome, time_spent):
    """
    Triggered when a user submits an answer to an embedded question in a video.
    Triggers the reinforcement learning update and provides feedback.
    """
    user = get_user_by_email(user_email)
    if not user:
        return {"error": "User not found."}
    
    concepts = get_concepts()
    b_concepts = np.array([c["difficulty"] for c in concepts])
    
    # Load session state to find the concept index that was just studied
    session_data = user.get("session_data", {})
    last_concept_idx = session_data.get("last_concept_idx")
    current_lesson_id = session_data.get("current_lesson_id")
    
    if last_concept_idx is None or current_lesson_id is None:
        return {"error": "Missing session data (user must first run adaptive step)"}
    
    # Concept id is needed for recording the interaction
    concept_id = concepts[last_concept_idx]["id"]
    
    # Reload user mastery state
    user_state = user.get("current_theta") or initialize_user_state(len(concepts))
    
    # Apply mastery update
    theta_before = user_state["theta"][last_concept_idx]
    user_state = update_mastery(user_state, last_concept_idx, user_answer_outcome, b_concepts)
    theta_after = user_state["theta"][last_concept_idx]
    
    # Record interaction
    insert_interactions([{
        "user_id": user["id"],
        "question_id": question_id,
        "concept_id": concept_id,
        "outcome": user_answer_outcome,
        "time_spent": time_spent,
        "theta_before": round(float(theta_before), 4),
        "theta_after": round(float(theta_after), 4),
        "created_at": datetime.utcnow().isoformat()
    }])
    
    # Update user's persistent theta in database
    update_user_theta(user["id"], user_state)
    
    lesson_content = get_lesson_content(current_lesson_id)
    feedback_text = "Feedback unavailable"
    
    if lesson_content and lesson_content.get("lesson_questions"):
        for lq in lesson_content["lesson_questions"]:
            if lq["questions"]["id"] == question_id:
                if user_answer_outcome == 1:
                    feedback_text = lq["questions"]["feedback_correct"]
                else:
                    feedback_text = lq["questions"]["feedback_incorrect"]
                break
    
    return {
        "success": True,
        "feedback": feedback_text,
        "new_mastery_level": round(float(sigmoid(theta_after - b_concepts[last_concept_idx])), 4)
    }
