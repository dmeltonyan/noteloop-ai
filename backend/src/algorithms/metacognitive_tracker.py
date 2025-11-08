"""
Metacognitive Awareness Tracker
Measures calibration: how well users know what they know
Tracks confidence vs accuracy
"""
from typing import Dict, List, Optional
from datetime import datetime

class MetacognitiveTracker:
    """
    Tracks metacognitive awareness (confidence calibration)
    Low calibration = user over/underconfident
    High calibration = user accurately assesses their knowledge
    """
    
    def __init__(self):
        self.min_samples = 5  # Minimum samples for reliable calibration
    
    def track_confidence(self, user_id: str, concept_id: str, 
                        confidence: float, actual_performance: float,
                        timestamp: Optional[datetime] = None):
        """
        Track a confidence-performance pair
        
        Args:
            user_id: User identifier
            concept_id: Concept identifier
            confidence: User's confidence (0.0 to 1.0)
            actual_performance: Actual performance (0.0 to 1.0)
            timestamp: When this occurred
        """
        if timestamp is None:
            timestamp = datetime.now()
        
        # Store in user's metacognitive history
        # This would be stored in database in production
        pass
    
    def calculate_calibration(self, confidence_history: List[float],
                             performance_history: List[float]) -> Dict:
        """
        Calculate calibration metrics
        
        Args:
            confidence_history: List of confidence values
            performance_history: List of actual performance values
        
        Returns:
            Dictionary with calibration metrics
        """
        if len(confidence_history) < self.min_samples:
            return {
                'calibration_score': 0.5,  # Neutral if not enough data
                'overconfidence': 0.0,
                'underconfidence': 0.0,
                'reliability': 'insufficient_data'
            }
        
        # Calculate calibration score
        # Perfect calibration = confidence matches performance
        errors = [abs(c - p) for c, p in zip(confidence_history, performance_history)]
        mean_error = sum(errors) / len(errors)
        calibration_score = 1.0 - mean_error  # Higher = better calibration
        
        # Calculate overconfidence (confidence > performance)
        overconfident_count = sum(1 for c, p in zip(confidence_history, performance_history) if c > p + 0.1)
        overconfidence_rate = overconfident_count / len(confidence_history)
        
        # Calculate underconfidence (confidence < performance)
        underconfident_count = sum(1 for c, p in zip(confidence_history, performance_history) if c < p - 0.1)
        underconfidence_rate = underconfident_count / len(confidence_history)
        
        # Determine reliability
        if len(confidence_history) >= 20:
            reliability = 'high'
        elif len(confidence_history) >= 10:
            reliability = 'medium'
        else:
            reliability = 'low'
        
        return {
            'calibration_score': max(0.0, min(1.0, calibration_score)),
            'overconfidence': overconfidence_rate,
            'underconfidence': underconfidence_rate,
            'mean_confidence': sum(confidence_history) / len(confidence_history),
            'mean_performance': sum(performance_history) / len(performance_history),
            'reliability': reliability,
            'sample_size': len(confidence_history)
        }
    
    def get_metacognitive_feedback(self, calibration_data: Dict) -> str:
        """
        Generate feedback based on calibration
        
        Returns:
            Feedback message for user
        """
        calibration_score = calibration_data.get('calibration_score', 0.5)
        overconfidence = calibration_data.get('overconfidence', 0.0)
        underconfidence = calibration_data.get('underconfidence', 0.0)
        
        if calibration_score > 0.8:
            return "🎯 Excellent self-assessment! You accurately know what you know."
        elif overconfidence > 0.3:
            return "⚠️ You're more confident than your performance suggests. Consider reviewing concepts more thoroughly."
        elif underconfidence > 0.3:
            return "💪 You're underestimating yourself! You know more than you think - trust your knowledge."
        elif calibration_score > 0.6:
            return "✅ Good self-awareness. Keep tracking your confidence to improve further."
        else:
            return "📊 Your confidence doesn't always match your performance. Practice self-assessment to improve."
    
    def suggest_improvement(self, calibration_data: Dict) -> List[str]:
        """
        Suggest ways to improve metacognitive awareness
        
        Returns:
            List of improvement suggestions
        """
        suggestions = []
        overconfidence = calibration_data.get('overconfidence', 0.0)
        underconfidence = calibration_data.get('underconfidence', 0.0)
        
        if overconfidence > 0.3:
            suggestions.append("Before answering, pause and think: 'Am I really sure, or am I guessing?'")
            suggestions.append("Review explanations even when you get questions right")
            suggestions.append("Focus on understanding why answers are correct, not just that they are")
        
        if underconfidence > 0.3:
            suggestions.append("Trust your first instinct - you know more than you think")
            suggestions.append("Review concepts you've mastered to build confidence")
            suggestions.append("Track your accuracy - you're likely performing better than you feel")
        
        if not suggestions:
            suggestions.append("Continue tracking your confidence to maintain good self-awareness")
        
        return suggestions

metacognitive_tracker = MetacognitiveTracker()


