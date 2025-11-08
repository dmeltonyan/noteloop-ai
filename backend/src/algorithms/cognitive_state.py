"""
Cognitive State Detection
Detects fatigue, focus, and adjusts difficulty accordingly
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from collections import deque

class CognitiveStateDetector:
    """
    Detects user's cognitive state based on performance patterns
    """
    
    def __init__(self):
        self.response_time_window = 20  # Last 20 interactions
        self.fatigue_threshold = 0.3  # 30% performance drop
        self.focus_threshold = 0.15  # 15% performance improvement
    
    def detect_cognitive_state(self, recent_interactions: List[Dict]) -> Dict:
        """
        Detect current cognitive state
        
        Args:
            recent_interactions: List of recent interactions:
                {
                    'timestamp': datetime,
                    'response_time': float (seconds),
                    'correct': bool,
                    'difficulty': float
                }
        
        Returns:
            Dictionary with cognitive state:
            {
                'state': str ('focused', 'fatigued', 'normal'),
                'confidence': float (0-1),
                'recommendations': List[str]
            }
        """
        if len(recent_interactions) < 5:
            return {
                'state': 'normal',
                'confidence': 0.3,
                'recommendations': ['Need more data to assess cognitive state']
            }
        
        # Analyze last 10 vs previous 10
        recent = recent_interactions[-10:]
        previous = recent_interactions[-20:-10] if len(recent_interactions) >= 20 else recent_interactions[:10]
        
        # Calculate metrics
        recent_accuracy = sum(1 for i in recent if i['correct']) / len(recent)
        previous_accuracy = sum(1 for i in previous if i['correct']) / len(previous) if previous else recent_accuracy
        
        recent_avg_time = sum(i.get('response_time', 0) for i in recent) / len(recent)
        previous_avg_time = sum(i.get('response_time', 0) for i in previous) / len(previous) if previous else recent_avg_time
        
        # Detect state
        accuracy_change = recent_accuracy - previous_accuracy
        time_change = recent_avg_time - previous_avg_time
        
        if accuracy_change < -self.fatigue_threshold or time_change > 2.0:
            state = 'fatigued'
            confidence = min(1.0, abs(accuracy_change) / self.fatigue_threshold)
        elif accuracy_change > self.focus_threshold and time_change < -0.5:
            state = 'focused'
            confidence = min(1.0, accuracy_change / self.focus_threshold)
        else:
            state = 'normal'
            confidence = 0.5
        
        # Generate recommendations
        recommendations = self._get_recommendations(state, accuracy_change, time_change)
        
        return {
            'state': state,
            'confidence': round(confidence, 2),
            'accuracy_change': round(accuracy_change, 3),
            'time_change': round(time_change, 2),
            'recommendations': recommendations,
            'current_accuracy': round(recent_accuracy, 2),
            'current_avg_time': round(recent_avg_time, 2)
        }
    
    def _get_recommendations(self, state: str, accuracy_change: float,
                            time_change: float) -> List[str]:
        """Generate recommendations based on cognitive state"""
        recommendations = []
        
        if state == 'fatigued':
            recommendations.append("💤 You're showing signs of fatigue. Consider taking a break.")
            recommendations.append("📉 Performance is declining - rest will help you learn better.")
            recommendations.append("⏰ Try again in 15-30 minutes for optimal learning.")
        elif state == 'focused':
            recommendations.append("🎯 You're in the zone! Great time for challenging concepts.")
            recommendations.append("⚡ Your focus is high - tackle difficult material now.")
            recommendations.append("📈 Performance is improving - keep going!")
        else:
            recommendations.append("✅ Normal cognitive state - maintain current pace.")
        
        return recommendations
    
    def suggest_difficulty_adjustment(self, cognitive_state: Dict,
                                     current_difficulty: float) -> float:
        """
        Suggest difficulty adjustment based on cognitive state
        
        Returns:
            Adjusted difficulty level
        """
        state = cognitive_state.get('state', 'normal')
        confidence = cognitive_state.get('confidence', 0.5)
        
        if state == 'fatigued':
            # Reduce difficulty when fatigued
            adjustment = -0.2 * confidence
        elif state == 'focused':
            # Increase difficulty when focused
            adjustment = 0.15 * confidence
        else:
            adjustment = 0.0
        
        new_difficulty = current_difficulty + adjustment
        
        # Clamp to reasonable range
        return max(0.0, min(1.0, new_difficulty))

cognitive_detector = CognitiveStateDetector()


