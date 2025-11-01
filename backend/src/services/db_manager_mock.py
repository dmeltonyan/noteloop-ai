"""
Mock DB Manager - Works without Supabase for demo/testing
"""

def get_total_likes_for_concept(concept_id):
    """Mock function - returns random like count for demo"""
    import random
    return random.randint(0, 100)

def get_user_by_email(user_email):
    """Mock function"""
    return None

def get_concepts():
    """Mock function"""
    return []

def get_lessons_with_embeddings():
    """Mock function"""
    return []

def get_lesson_content(lesson_id):
    """Mock function"""
    return None

def get_questions_for_concept(concept_id):
    """Mock function"""
    return []

def update_user_session_state(user_id, session_data):
    """Mock function"""
    return None

def insert_interactions(interactions):
    """Mock function"""
    return None

def update_user_theta(user_id, new_theta):
    """Mock function"""
    return None
