"""
Reward Service
Manages learning credits, study coins, and knowledge points
Handles earning, spending, and redemption
"""
from src.models.database import db
from datetime import datetime
from typing import Dict, List, Optional

class RewardService:
    """
    Manages the reward system
    """
    
    def __init__(self):
        # Earning rates
        self.CORRECT_ANSWER_CREDITS = 10
        self.INCORRECT_ANSWER_CREDITS = 5  # Still learning!
        self.CONCEPT_MASTERED_CREDITS = 100
        self.UPLOAD_DOCUMENT_CREDITS = 200
        self.DAILY_LOGIN_CREDITS = 10
        self.STREAK_BONUS_PER_DAY = 25
        self.PERFECT_SESSION_BONUS = 200
        self.REVIEW_DUE_CONCEPTS_CREDITS = 15
        
        # Level thresholds (exponential)
        self.XP_PER_LEVEL = 1000
        self.XP_MULTIPLIER = 1.5
    
    def earn_credits(self, user_id: str, action: str, amount: int,
                    metadata: Optional[Dict] = None) -> Dict:
        """
        Award credits for an action
        
        Args:
            user_id: User identifier
            action: Action type ('answer_correct', 'concept_mastered', etc.)
            amount: Amount of credits to award
            metadata: Optional metadata about the action
        
        Returns:
            Dictionary with reward information
        """
        user = db.get_user(user_id)
        if not user:
            return {'success': False, 'error': 'User not found'}
        
        # Apply streak multiplier
        streak_multiplier = 1.0 + (min(user.current_streak, 7) * 0.05)  # Max 35% bonus
        final_amount = int(amount * streak_multiplier)
        
        # Award credits
        user.learning_credits += final_amount
        
        # Award XP (for leveling)
        xp_earned = final_amount  # 1 credit = 1 XP
        user.experience_points += xp_earned
        
        # Check for level up
        level_up = self._check_level_up(user)
        
        # Record transaction
        transaction = {
            'id': str(datetime.now().timestamp()),
            'action': action,
            'credits': final_amount,
            'xp': xp_earned,
            'timestamp': datetime.now().isoformat(),
            'metadata': metadata or {}
        }
        user.reward_history.append(transaction)
        
        # Keep last 100 transactions
        if len(user.reward_history) > 100:
            user.reward_history = user.reward_history[-100:]
        
        return {
            'success': True,
            'credits_earned': final_amount,
            'total_credits': user.learning_credits,
            'xp_earned': xp_earned,
            'level_up': level_up,
            'new_level': user.level if level_up else None
        }
    
    def _check_level_up(self, user) -> bool:
        """Check if user leveled up"""
        xp_needed = self.XP_PER_LEVEL * (self.XP_MULTIPLIER ** (user.level - 1))
        
        if user.experience_points >= xp_needed:
            user.level += 1
            # Award bonus credits for leveling
            bonus_credits = user.level * 50
            user.learning_credits += bonus_credits
            return True
        return False
    
    def spend_credits(self, user_id: str, item: str, cost: int) -> Dict:
        """
        Spend credits on an item
        
        Args:
            user_id: User identifier
            item: Item being purchased
            cost: Cost in credits
        
        Returns:
            Dictionary with purchase result
        """
        user = db.get_user(user_id)
        if not user:
            return {'success': False, 'error': 'User not found'}
        
        if user.learning_credits < cost:
            return {
                'success': False,
                'error': 'Insufficient credits',
                'required': cost,
                'available': user.learning_credits
            }
        
        user.learning_credits -= cost
        
        # Record purchase
        purchase = {
            'id': str(datetime.now().timestamp()),
            'item': item,
            'cost': cost,
            'timestamp': datetime.now().isoformat()
        }
        user.reward_history.append(purchase)
        
        return {
            'success': True,
            'item': item,
            'cost': cost,
            'remaining_credits': user.learning_credits
        }
    
    def get_reward_summary(self, user_id: str) -> Dict:
        """Get comprehensive reward summary"""
        user = db.get_user(user_id)
        if not user:
            return {}
        
        # Calculate XP needed for next level
        xp_needed = self.XP_PER_LEVEL * (self.XP_MULTIPLIER ** (user.level - 1))
        xp_progress = user.experience_points % int(xp_needed)
        level_progress = (xp_progress / xp_needed) * 100
        
        # Calculate recent earnings (last 7 days)
        recent_earnings = sum(
            t.get('credits', 0) for t in user.reward_history[-50:]
            if t.get('action') and 'answer' in t['action']
        )
        
        return {
            'learning_credits': user.learning_credits,
            'study_coins': user.study_coins,
            'knowledge_points': user.knowledge_points,
            'level': user.level,
            'experience_points': user.experience_points,
            'xp_for_next_level': int(xp_needed),
            'xp_progress': int(xp_progress),
            'level_progress_percent': round(level_progress, 1),
            'recent_earnings': recent_earnings,
            'total_transactions': len(user.reward_history)
        }
    
    def get_available_rewards(self) -> List[Dict]:
        """Get list of available rewards to redeem"""
        return [
            {
                'id': 'premium_ai_session',
                'name': 'Premium AI Tutor Session',
                'description': 'Get personalized help from AI tutor',
                'cost': 500,
                'category': 'premium_features'
            },
            {
                'id': 'advanced_analytics',
                'name': 'Advanced Analytics (1 month)',
                'description': 'Unlock detailed learning analytics',
                'cost': 1000,
                'category': 'premium_features'
            },
            {
                'id': 'unlimited_uploads',
                'name': 'Unlimited Uploads (1 month)',
                'description': 'Upload unlimited documents',
                'cost': 2000,
                'category': 'premium_features'
            },
            {
                'id': 'hint',
                'name': 'Extra Hint',
                'description': 'Get an extra hint on a question',
                'cost': 50,
                'category': 'power_ups'
            },
            {
                'id': 'skip_question',
                'name': 'Skip Question',
                'description': 'Skip a difficult question',
                'cost': 100,
                'category': 'power_ups'
            },
            {
                'id': 'time_extension',
                'name': 'Time Extension',
                'description': 'Get extra time on timed quizzes',
                'cost': 75,
                'category': 'power_ups'
            },
            {
                'id': 'custom_theme',
                'name': 'Custom Theme',
                'description': 'Unlock a new app theme',
                'cost': 150,
                'category': 'customization'
            },
            {
                'id': 'study_guide',
                'name': 'Generate Study Guide',
                'description': 'AI-generated study guide for your concepts',
                'cost': 300,
                'category': 'educational'
            },
            {
                'id': 'practice_exam',
                'name': 'Practice Exam',
                'description': 'Generate a full practice exam',
                'cost': 500,
                'category': 'educational'
            }
        ]
    
    def calculate_daily_bonus(self, user_id: str) -> Dict:
        """Calculate daily login and streak bonuses"""
        user = db.get_user(user_id)
        if not user:
            return {'bonus': 0}
        
        bonus = self.DAILY_LOGIN_CREDITS
        
        # Streak bonus
        if user.current_streak > 0:
            streak_bonus = min(user.current_streak * self.STREAK_BONUS_PER_DAY, 200)  # Cap at 200
            bonus += streak_bonus
        
        return {
            'bonus': bonus,
            'login_bonus': self.DAILY_LOGIN_CREDITS,
            'streak_bonus': bonus - self.DAILY_LOGIN_CREDITS,
            'streak_days': user.current_streak
        }

reward_service = RewardService()


