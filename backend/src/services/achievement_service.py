"""
Achievement Service
Manages achievements and badge unlocking
"""
from src.models.database import db

class AchievementService:
    def check_achievements(self, user_id: str):
        """Check and unlock achievements based on user progress"""
        user = db.get_user(user_id)
        if not user:
            return []
        
        unlocked = []
        
        # Check streak achievements
        if user.current_streak >= 3 and 'streak_3' not in user.achievements:
            db.unlock_achievement(user_id, 'streak_3')
            unlocked.append('streak_3')
        
        if user.current_streak >= 7 and 'streak_7' not in user.achievements:
            db.unlock_achievement(user_id, 'streak_7')
            unlocked.append('streak_7')
        
        if user.current_streak >= 30 and 'streak_30' not in user.achievements:
            db.unlock_achievement(user_id, 'streak_30')
            unlocked.append('streak_30')
        
        # Check mastery achievements
        mastered_concepts = len([m for m in user.concept_mastery.values() if (m if isinstance(m, float) else m.get('mastery', 0)) > 0.7])
        
        if mastered_concepts >= 10 and 'master_10' not in user.achievements:
            db.unlock_achievement(user_id, 'master_10')
            unlocked.append('master_10')
        
        if mastered_concepts >= 50 and 'master_50' not in user.achievements:
            db.unlock_achievement(user_id, 'master_50')
            unlocked.append('master_50')
        
        # Check practice achievements
        if user.total_questions >= 1 and 'first_question' not in user.achievements:
            db.unlock_achievement(user_id, 'first_question')
            unlocked.append('first_question')
        
        if user.total_questions >= 100 and 'questions_100' not in user.achievements:
            db.unlock_achievement(user_id, 'questions_100')
            unlocked.append('questions_100')
        
        # Check accuracy achievement
        if user.total_questions >= 10:
            accuracy = (user.correct_answers / user.total_questions) * 100
            if accuracy >= 90 and 'accuracy_90' not in user.achievements:
                db.unlock_achievement(user_id, 'accuracy_90')
                unlocked.append('accuracy_90')
        
        # Check upload achievement
        if len(user.upload_history) >= 5 and 'upload_5' not in user.achievements:
            db.unlock_achievement(user_id, 'upload_5')
            unlocked.append('upload_5')
        
        # Check flashcard achievement
        flashcard_count = sum(1 for fp in user.flashcard_progress.values() if fp.get('seen', False))
        if flashcard_count >= 100 and 'flashcard_100' not in user.achievements:
            db.unlock_achievement(user_id, 'flashcard_100')
            unlocked.append('flashcard_100')
        
        return unlocked
    
    def get_user_achievements(self, user_id: str):
        """Get all achievements for a user"""
        user = db.get_user(user_id)
        if not user:
            return []
        
        return user.achievements_unlocked
    
    def get_all_achievements(self):
        """Get all available achievements"""
        return [
            {
                'id': ach.id,
                'name': ach.name,
                'description': ach.description,
                'icon': ach.icon,
                'category': ach.category
            }
            for ach in db.achievements.values()
        ]

achievement_service = AchievementService()




