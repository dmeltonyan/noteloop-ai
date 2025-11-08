"""
Learning Velocity Tracker
Measures rate of learning improvement over time
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import math

class LearningVelocityTracker:
    """
    Tracks how fast user is learning (not just what they know)
    Measures concepts mastered per day, improvement rate, etc.
    """
    
    def __init__(self):
        self.min_data_points = 3  # Minimum for reliable velocity calculation
    
    def calculate_velocity(self, mastery_history: List[Dict], 
                          time_window_days: int = 7) -> Dict:
        """
        Calculate learning velocity over time window
        
        Args:
            mastery_history: List of mastery snapshots:
                {
                    'timestamp': datetime,
                    'concepts_mastered': int,
                    'overall_ability': float
                }
            time_window_days: Days to look back
        
        Returns:
            Dictionary with velocity metrics
        """
        if len(mastery_history) < self.min_data_points:
            return {
                'velocity': 0.0,
                'trend': 'insufficient_data',
                'concepts_per_day': 0.0,
                'ability_change_per_day': 0.0
            }
        
        # Filter to time window
        cutoff_date = datetime.now() - timedelta(days=time_window_days)
        recent_history = [
            h for h in mastery_history 
            if h['timestamp'] >= cutoff_date
        ]
        
        if len(recent_history) < 2:
            return {
                'velocity': 0.0,
                'trend': 'insufficient_data',
                'concepts_per_day': 0.0,
                'ability_change_per_day': 0.0
            }
        
        # Calculate concepts mastered per day
        first = recent_history[0]
        last = recent_history[-1]
        
        concepts_gained = last['concepts_mastered'] - first['concepts_mastered']
        days_elapsed = (last['timestamp'] - first['timestamp']).days or 1
        concepts_per_day = concepts_gained / days_elapsed
        
        # Calculate ability change per day
        ability_change = last['overall_ability'] - first['overall_ability']
        ability_change_per_day = ability_change / days_elapsed
        
        # Determine trend
        if len(recent_history) >= 3:
            # Check if velocity is increasing or decreasing
            mid_point = len(recent_history) // 2
            first_half_velocity = self._calculate_simple_velocity(
                recent_history[:mid_point+1]
            )
            second_half_velocity = self._calculate_simple_velocity(
                recent_history[mid_point:]
            )
            
            if second_half_velocity > first_half_velocity * 1.1:
                trend = 'accelerating'
            elif second_half_velocity < first_half_velocity * 0.9:
                trend = 'decelerating'
            else:
                trend = 'stable'
        else:
            trend = 'stable'
        
        # Overall velocity score (0-1)
        # Normalize concepts_per_day (assume max 5 per day is excellent)
        normalized_velocity = min(1.0, concepts_per_day / 5.0)
        
        return {
            'velocity': normalized_velocity,
            'trend': trend,
            'concepts_per_day': round(concepts_per_day, 2),
            'ability_change_per_day': round(ability_change_per_day, 3),
            'concepts_gained': concepts_gained,
            'days_elapsed': days_elapsed
        }
    
    def _calculate_simple_velocity(self, history: List[Dict]) -> float:
        """Calculate simple velocity for a subset of history"""
        if len(history) < 2:
            return 0.0
        
        first = history[0]
        last = history[-1]
        days = (last['timestamp'] - first['timestamp']).days or 1
        concepts_gained = last['concepts_mastered'] - first['concepts_mastered']
        
        return concepts_gained / days
    
    def predict_completion_time(self, current_mastery: int, target_mastery: int,
                               current_velocity: float) -> Optional[int]:
        """
        Predict days until reaching target mastery
        
        Args:
            current_mastery: Current number of concepts mastered
            target_mastery: Target number of concepts mastered
            current_velocity: Current concepts per day
        
        Returns:
            Days until completion, or None if velocity is 0
        """
        if current_velocity <= 0:
            return None
        
        concepts_remaining = target_mastery - current_mastery
        if concepts_remaining <= 0:
            return 0
        
        days_remaining = concepts_remaining / current_velocity
        return int(math.ceil(days_remaining))
    
    def get_velocity_feedback(self, velocity_data: Dict) -> str:
        """Generate feedback based on velocity"""
        concepts_per_day = velocity_data.get('concepts_per_day', 0.0)
        trend = velocity_data.get('trend', 'stable')
        
        if concepts_per_day > 2.0:
            if trend == 'accelerating':
                return "🚀 Excellent learning speed! You're accelerating - keep it up!"
            elif trend == 'decelerating':
                return "📈 Great progress, but pace is slowing. Try to maintain consistency."
            else:
                return "✅ Strong learning velocity! Maintain this pace."
        elif concepts_per_day > 1.0:
            if trend == 'accelerating':
                return "📊 Good progress! Your learning speed is increasing."
            else:
                return "💪 Steady progress. Consider increasing study frequency."
        elif concepts_per_day > 0.5:
            return "📚 Moderate progress. More consistent study will improve your velocity."
        else:
            return "🎯 Slow progress detected. Try studying more frequently to accelerate learning."

learning_velocity = LearningVelocityTracker()

