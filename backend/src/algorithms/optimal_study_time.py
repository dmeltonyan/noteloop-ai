"""
Optimal Study Time Predictor
Identifies when user learns best based on historical performance
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from collections import defaultdict

class OptimalStudyTimePredictor:
    """
    Predicts optimal study times based on performance patterns
    """
    
    def __init__(self):
        self.min_samples = 10  # Minimum samples for reliable prediction
    
    def track_performance_by_time(self, user_id: str, timestamp: datetime,
                                 performance: float, concept_id: str):
        """
        Track performance at specific time
        
        Args:
            user_id: User identifier
            timestamp: When the study session occurred
            performance: Performance score (0.0 to 1.0)
            concept_id: Concept being studied
        """
        # Store performance by hour of day and day of week
        # This would be stored in database in production
        pass
    
    def analyze_performance_patterns(self, performance_history: List[Dict]) -> Dict:
        """
        Analyze performance patterns by time
        
        Args:
            performance_history: List of performance records:
                {
                    'timestamp': datetime,
                    'performance': float (0-1),
                    'concept_id': str
                }
        
        Returns:
            Dictionary with analysis:
            {
                'best_hour': int (0-23),
                'best_day': str ('monday', etc.),
                'performance_by_hour': Dict[int, float],
                'performance_by_day': Dict[str, float],
                'peak_performance': float
            }
        """
        if len(performance_history) < self.min_samples:
            return {
                'best_hour': None,
                'best_day': None,
                'performance_by_hour': {},
                'performance_by_day': {},
                'peak_performance': 0.0,
                'reliability': 'insufficient_data'
            }
        
        # Group by hour of day
        performance_by_hour = defaultdict(list)
        performance_by_day = defaultdict(list)
        
        for record in performance_history:
            timestamp = record['timestamp']
            performance = record['performance']
            
            hour = timestamp.hour
            day_name = timestamp.strftime('%A').lower()
            
            performance_by_hour[hour].append(performance)
            performance_by_day[day_name].append(performance)
        
        # Calculate average performance per hour
        avg_by_hour = {
            hour: sum(perfs) / len(perfs)
            for hour, perfs in performance_by_hour.items()
            if len(perfs) >= 2  # At least 2 samples
        }
        
        # Calculate average performance per day
        avg_by_day = {
            day: sum(perfs) / len(perfs)
            for day, perfs in performance_by_day.items()
            if len(perfs) >= 2
        }
        
        # Find best hour and day
        best_hour = max(avg_by_hour.items(), key=lambda x: x[1])[0] if avg_by_hour else None
        best_day = max(avg_by_day.items(), key=lambda x: x[1])[0] if avg_by_day else None
        peak_performance = max(avg_by_hour.values()) if avg_by_hour else 0.0
        
        return {
            'best_hour': best_hour,
            'best_day': best_day,
            'performance_by_hour': avg_by_hour,
            'performance_by_day': avg_by_day,
            'peak_performance': peak_performance,
            'reliability': 'high' if len(performance_history) >= 30 else 'medium'
        }
    
    def get_optimal_study_times(self, analysis: Dict, 
                                num_suggestions: int = 3) -> List[Dict]:
        """
        Get optimal study time suggestions
        
        Returns:
            List of suggested study times with performance predictions
        """
        suggestions = []
        
        best_hour = analysis.get('best_hour')
        best_day = analysis.get('best_day')
        performance_by_hour = analysis.get('performance_by_hour', {})
        
        if best_hour is not None:
            # Suggest best hour
            suggestions.append({
                'time': f"{best_hour}:00",
                'day': best_day or 'any day',
                'predicted_performance': analysis.get('peak_performance', 0.0),
                'reason': 'Your peak learning time'
            })
            
            # Suggest nearby hours (within 2 hours)
            for offset in [-2, -1, 1, 2]:
                nearby_hour = (best_hour + offset) % 24
                if nearby_hour in performance_by_hour:
                    suggestions.append({
                        'time': f"{nearby_hour}:00",
                        'day': best_day or 'any day',
                        'predicted_performance': performance_by_hour[nearby_hour],
                        'reason': f'Near your peak time ({best_hour}:00)'
                    })
        
        # Sort by predicted performance
        suggestions.sort(key=lambda x: x['predicted_performance'], reverse=True)
        
        return suggestions[:num_suggestions]
    
    def get_study_time_feedback(self, analysis: Dict) -> str:
        """Generate feedback about optimal study times"""
        best_hour = analysis.get('best_hour')
        peak_performance = analysis.get('peak_performance', 0.0)
        
        if best_hour is None:
            return "📊 Not enough data yet. Keep studying to discover your optimal times!"
        
        hour_str = f"{best_hour}:00"
        
        if peak_performance > 0.8:
            return f"🎯 Excellent! You perform best at {hour_str}. Schedule important study sessions then."
        elif peak_performance > 0.7:
            return f"✅ You learn well at {hour_str}. Consider prioritizing study time around then."
        else:
            return f"📈 Your best performance is at {hour_str}, but there's room for improvement. Try different times to find what works best."

study_time_predictor = OptimalStudyTimePredictor()


