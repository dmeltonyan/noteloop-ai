"""
Advanced Analytics Service
Provides detailed learning analytics with charts and insights
"""
from src.models.database import db
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from collections import defaultdict

class AdvancedAnalyticsService:
    """
    Provides advanced analytics and insights
    """
    
    def get_learning_velocity_analytics(self, user_id: str, days: int = 30) -> Dict:
        """Get learning velocity analytics"""
        user = db.get_user(user_id)
        if not user:
            return {}
        
        # Calculate velocity over time
        velocity_data = []
        concepts_mastered = 0
        
        for i in range(days):
            date = datetime.now() - timedelta(days=days - i - 1)
            date_str = date.strftime('%Y-%m-%d')
            
            # Count concepts mastered by this date
            mastered = sum(1 for mastery in user.concept_mastery.values()
                          if isinstance(mastery, dict) and mastery.get('mastery', 0) > 0.7
                          or (isinstance(mastery, (int, float)) and mastery > 0.7))
            
            velocity_data.append({
                "date": date_str,
                "concepts_mastered": mastered,
                "questions_answered": len([q for q in user.quiz_history 
                                          if q.get('timestamp', '').startswith(date_str)])
            })
        
        return {
            "velocity_data": velocity_data,
            "average_concepts_per_day": len([m for m in user.concept_mastery.values() 
                                            if (isinstance(m, dict) and m.get('mastery', 0) > 0.7) 
                                            or (isinstance(m, (int, float)) and m > 0.7)]) / max(days, 1)
        }
    
    def get_performance_trends(self, user_id: str, days: int = 30) -> Dict:
        """Get performance trends over time"""
        user = db.get_user(user_id)
        if not user:
            return {}
        
        trends = []
        daily_performance = defaultdict(lambda: {"correct": 0, "total": 0})
        
        # Analyze quiz history
        for quiz in user.quiz_history[-100:]:  # Last 100 quizzes
            timestamp = quiz.get('timestamp', '')
            if timestamp:
                date = timestamp[:10]  # YYYY-MM-DD
                if quiz.get('correct', False):
                    daily_performance[date]["correct"] += 1
                daily_performance[date]["total"] += 1
        
        # Build trend data
        for i in range(days):
            date = datetime.now() - timedelta(days=days - i - 1)
            date_str = date.strftime('%Y-%m-%d')
            
            perf = daily_performance[date_str]
            accuracy = (perf["correct"] / perf["total"] * 100) if perf["total"] > 0 else 0
            
            trends.append({
                "date": date_str,
                "accuracy": round(accuracy, 1),
                "questions": perf["total"],
                "correct": perf["correct"]
            })
        
        return {
            "trends": trends,
            "average_accuracy": sum(t["accuracy"] for t in trends) / max(len(trends), 1)
        }
    
    def get_activity_heatmap(self, user_id: str, days: int = 90) -> Dict:
        """Get activity heatmap data"""
        user = db.get_user(user_id)
        if not user:
            return {}
        
        heatmap_data = {}
        
        for i in range(days):
            date = datetime.now() - timedelta(days=days - i - 1)
            date_str = date.strftime('%Y-%m-%d')
            
            # Count activities on this date
            activities = 0
            
            # Quiz history
            activities += len([q for q in user.quiz_history 
                             if q.get('timestamp', '').startswith(date_str)])
            
            # Study days
            if date_str in user.study_days:
                activities += 1
            
            heatmap_data[date_str] = activities
        
        return {
            "heatmap": heatmap_data,
            "max_activities": max(heatmap_data.values()) if heatmap_data else 0
        }
    
    def get_concept_relationship_map(self, user_id: str) -> Dict:
        """Get concept relationships and dependencies"""
        user = db.get_user(user_id)
        if not user:
            return {}
        
        concepts = list(user.concept_mastery.keys())
        relationships = []
        
        # Simple relationship detection (in production, use NLP/AI)
        for i, concept1 in enumerate(concepts):
            for concept2 in concepts[i+1:]:
                # Check if concepts appear together in quizzes
                concept1_quizzes = [q for q in user.quiz_history 
                                  if q.get('concept_id') == concept1]
                concept2_quizzes = [q for q in user.quiz_history 
                                  if q.get('concept_id') == concept2]
                
                # Simple co-occurrence
                if len(concept1_quizzes) > 0 and len(concept2_quizzes) > 0:
                    relationships.append({
                        "source": concept1,
                        "target": concept2,
                        "strength": 0.5  # Placeholder
                    })
        
        return {
            "nodes": [{"id": c, "mastery": user.concept_mastery.get(c, 0)} for c in concepts],
            "links": relationships
        }
    
    def get_weak_areas_analysis(self, user_id: str) -> Dict:
        """Analyze weak areas in detail"""
        user = db.get_user(user_id)
        if not user:
            return {}
        
        weak_areas = []
        
        for concept_id, mastery in user.concept_mastery.items():
            mastery_value = mastery.get('mastery', 0) if isinstance(mastery, dict) else mastery
            
            if mastery_value < 0.6:
                # Get quiz performance for this concept
                concept_quizzes = [q for q in user.quiz_history 
                                 if q.get('concept_id') == concept_id]
                correct = sum(1 for q in concept_quizzes if q.get('correct', False))
                total = len(concept_quizzes)
                
                weak_areas.append({
                    "concept_id": concept_id,
                    "mastery": round(mastery_value * 100, 1),
                    "accuracy": round((correct / total * 100) if total > 0 else 0, 1),
                    "questions_attempted": total,
                    "improvement_needed": round((0.7 - mastery_value) * 100, 1)
                })
        
        # Sort by improvement needed
        weak_areas.sort(key=lambda x: x["improvement_needed"], reverse=True)
        
        return {
            "weak_areas": weak_areas[:10],  # Top 10
            "total_weak_areas": len(weak_areas)
        }
    
    def get_optimal_study_time_analysis(self, user_id: str) -> Dict:
        """Analyze optimal study times"""
        user = db.get_user(user_id)
        if not user:
            return {}
        
        performance_by_hour = defaultdict(lambda: {"correct": 0, "total": 0})
        
        for quiz in user.quiz_history:
            timestamp = quiz.get('timestamp', '')
            if timestamp:
                try:
                    dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    hour = dt.hour
                    
                    if quiz.get('correct', False):
                        performance_by_hour[hour]["correct"] += 1
                    performance_by_hour[hour]["total"] += 1
                except:
                    pass
        
        hourly_performance = []
        for hour in range(24):
            perf = performance_by_hour[hour]
            accuracy = (perf["correct"] / perf["total"] * 100) if perf["total"] > 0 else 0
            
            hourly_performance.append({
                "hour": hour,
                "accuracy": round(accuracy, 1),
                "questions": perf["total"]
            })
        
        # Find best hour
        best_hour = max(hourly_performance, key=lambda x: x["accuracy"]) if hourly_performance else None
        
        return {
            "hourly_performance": hourly_performance,
            "best_hour": best_hour["hour"] if best_hour else None,
            "best_accuracy": best_hour["accuracy"] if best_hour else 0
        }

advanced_analytics = AdvancedAnalyticsService()


