"""
Study Plan Service
Creates and manages personalized study plans
"""
from datetime import datetime, timedelta
from src.models.database import db
import uuid

class StudyPlanService:
    def create_study_plan(self, user_id: str, concepts: list, duration_days: int = 7):
        """Create a personalized study plan"""
        plan_id = str(uuid.uuid4())
        
        # Calculate daily tasks
        schedule = []
        concepts_per_day = max(1, len(concepts) // duration_days)
        
        for day in range(duration_days):
            start_idx = day * concepts_per_day
            end_idx = min(start_idx + concepts_per_day, len(concepts))
            day_concepts = concepts[start_idx:end_idx]
            
            schedule.append({
                'day': day + 1,
                'date': (datetime.now() + timedelta(days=day)).isoformat(),
                'concepts': [c['id'] if isinstance(c, dict) else c for c in day_concepts],
                'estimated_time_minutes': len(day_concepts) * 15,  # 15 min per concept
                'completed': False
            })
        
        plan = {
            'id': plan_id,
            'user_id': user_id,
            'name': f'Study Plan - {duration_days} days',
            'schedule': schedule,
            'created_at': datetime.now().isoformat(),
            'duration_days': duration_days,
            'is_active': True
        }
        
        user = db.get_user(user_id)
        if user:
            user.study_plans.append(plan)
            user.active_study_plan = plan_id
        
        return plan
    
    def get_user_plans(self, user_id: str):
        """Get all study plans for a user"""
        user = db.get_user(user_id)
        if not user:
            return []
        
        return user.study_plans
    
    def get_active_plan(self, user_id: str):
        """Get the active study plan"""
        user = db.get_user(user_id)
        if not user or not user.active_study_plan:
            return None
        
        for plan in user.study_plans:
            if plan.get('id') == user.active_study_plan:
                return plan
        
        return None
    
    def complete_day(self, user_id: str, plan_id: str, day: int):
        """Mark a day as completed"""
        user = db.get_user(user_id)
        if not user:
            return False
        
        for plan in user.study_plans:
            if plan.get('id') == plan_id:
                for schedule_item in plan.get('schedule', []):
                    if schedule_item.get('day') == day:
                        schedule_item['completed'] = True
                        return True
        
        return False

study_plan_service = StudyPlanService()




