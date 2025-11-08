"""
Spaced Repetition Service
Manages spaced repetition reviews and scheduling
"""
from datetime import datetime, timedelta
from src.models.database import db
from src.algorithms.spaced_repetition import sr_scheduler

class SpacedRepetitionService:
    def get_due_reviews(self, user_id: str):
        """Get all concepts due for review"""
        user = db.get_user(user_id)
        if not user:
            return []
        
        due_concept_ids = db.get_due_for_review(user_id)
        due_items = []
        
        for concept_id in due_concept_ids:
            concept = db.get_concept(concept_id)
            sr_data = user.spaced_repetition.get(concept_id, {})
            
            if concept:
                due_items.append({
                    'concept_id': concept_id,
                    'concept_name': concept.topic_name,
                    'description': concept.description,
                    'mastery': user.concept_mastery.get(concept_id, 0.0),
                    'next_review': sr_data.get('next_review', ''),
                    'times_reviewed': sr_data.get('times_reviewed', 0),
                    'interval': sr_data.get('interval', 1)
                })
        
        return due_items
    
    def review_concept(self, user_id: str, concept_id: str, quality: float):
        """
        Review a concept and update spaced repetition schedule
        quality: 0.0-1.0 (how well user remembered)
        """
        user = db.get_user(user_id)
        if not user:
            return None
        
        sr_data = user.spaced_repetition.get(concept_id, {})
        mastery = user.concept_mastery.get(concept_id, 0.0)
        
        times_reviewed = sr_data.get('times_reviewed', 0)
        previous_interval = sr_data.get('interval', 1)
        last_review_str = sr_data.get('last_review', datetime.now().isoformat())
        
        try:
            last_review = datetime.fromisoformat(last_review_str)
        except:
            last_review = datetime.now()
        
        # Calculate next review using spaced repetition algorithm
        next_review = sr_scheduler.calculate_next_review(
            mastery=quality,
            previous_interval=previous_interval,
            times_reviewed=times_reviewed,
            last_review=last_review
        )
        
        # Update interval and ease factor
        if quality >= 0.7:
            # Remembered well - increase interval
            new_interval = int(previous_interval * 1.5)
            ease_factor = sr_data.get('ease_factor', 2.5) + 0.1
        elif quality >= 0.5:
            # Somewhat remembered - maintain interval
            new_interval = previous_interval
            ease_factor = sr_data.get('ease_factor', 2.5)
        else:
            # Forgot - decrease interval
            new_interval = max(1, int(previous_interval * 0.5))
            ease_factor = max(1.3, sr_data.get('ease_factor', 2.5) - 0.2)
        
        # Update spaced repetition data
        updated_sr_data = {
            'last_review': datetime.now().isoformat(),
            'next_review': next_review.isoformat(),
            'interval': new_interval,
            'times_reviewed': times_reviewed + 1,
            'ease_factor': ease_factor,
            'last_quality': quality
        }
        
        db.update_spaced_repetition(user_id, concept_id, updated_sr_data)
        
        return updated_sr_data
    
    def initialize_concept(self, user_id: str, concept_id: str):
        """Initialize spaced repetition for a new concept"""
        user = db.get_user(user_id)
        if not user:
            return None
        
        if concept_id not in user.spaced_repetition:
            sr_data = {
                'last_review': datetime.now().isoformat(),
                'next_review': (datetime.now() + timedelta(days=1)).isoformat(),
                'interval': 1,
                'times_reviewed': 0,
                'ease_factor': 2.5
            }
            db.update_spaced_repetition(user_id, concept_id, sr_data)
            return sr_data
        return user.spaced_repetition.get(concept_id)

sr_service = SpacedRepetitionService()




