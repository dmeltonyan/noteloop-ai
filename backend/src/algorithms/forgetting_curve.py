"""
Forgetting Curve Model
Based on Ebbinghaus forgetting curve: R = e^(-t/S)
Where R = retention, t = time since last review, S = memory strength
"""
import math
from datetime import datetime, timedelta
from typing import Dict, Optional

class ForgettingCurveModel:
    """
    Models memory decay and predicts optimal review times
    """
    
    def __init__(self):
        self.base_strength = 1.0  # Initial memory strength
        self.strength_growth_rate = 0.3  # How much strength increases per review
        self.retention_threshold = 0.7  # Review when retention drops below this
    
    def calculate_retention(self, last_review: datetime, memory_strength: float, 
                          current_time: Optional[datetime] = None) -> float:
        """
        Calculate current retention probability
        
        Args:
            last_review: When concept was last reviewed
            memory_strength: Current memory strength (increases with reviews)
            current_time: Current time (defaults to now)
        
        Returns:
            Retention probability (0.0 to 1.0)
        """
        if current_time is None:
            current_time = datetime.now()
        
        # Time since last review in hours
        time_delta = current_time - last_review
        hours_since_review = time_delta.total_seconds() / 3600
        
        # Forgetting curve: R = e^(-t/S)
        # Higher memory strength = slower forgetting
        retention = math.exp(-hours_since_review / (memory_strength * 24))
        
        return max(0.0, min(1.0, retention))
    
    def update_memory_strength(self, current_strength: float, review_quality: float,
                               times_reviewed: int) -> float:
        """
        Update memory strength after review
        
        Args:
            current_strength: Current memory strength
            review_quality: How well user remembered (0.0 to 1.0)
            times_reviewed: Number of times reviewed
        
        Returns:
            New memory strength
        """
        # Strength increases with successful reviews
        # More reviews = slower forgetting
        strength_increase = self.strength_growth_rate * review_quality
        
        # Diminishing returns (each review adds less)
        diminishing_factor = 1.0 / (1.0 + times_reviewed * 0.1)
        
        new_strength = current_strength + (strength_increase * diminishing_factor)
        
        # Cap at reasonable maximum (forgetting slows but never stops)
        return min(new_strength, 10.0)
    
    def predict_optimal_review_time(self, last_review: datetime, memory_strength: float,
                                   target_retention: float = 0.7) -> datetime:
        """
        Predict when to review to maintain target retention
        
        Args:
            last_review: When concept was last reviewed
            memory_strength: Current memory strength
            target_retention: Desired retention level (default 0.7)
        
        Returns:
            Optimal review time
        """
        # Solve: target_retention = e^(-t/S)
        # t = -S * ln(target_retention)
        hours_until_review = -memory_strength * 24 * math.log(target_retention)
        
        # Ensure minimum 1 hour, maximum 30 days
        hours_until_review = max(1, min(hours_until_review, 30 * 24))
        
        return last_review + timedelta(hours=hours_until_review)
    
    def is_due_for_review(self, last_review: datetime, memory_strength: float,
                          current_time: Optional[datetime] = None) -> bool:
        """
        Check if concept is due for review
        
        Returns:
            True if retention has dropped below threshold
        """
        retention = self.calculate_retention(last_review, memory_strength, current_time)
        return retention < self.retention_threshold
    
    def get_retention_decay_curve(self, memory_strength: float, 
                                  hours_ahead: int = 168) -> list:
        """
        Get retention values over time for visualization
        
        Returns:
            List of (hours, retention) tuples
        """
        curve = []
        base_time = datetime.now()
        
        for hours in range(0, hours_ahead + 1, 6):  # Every 6 hours
            time_point = base_time - timedelta(hours=hours)
            retention = self.calculate_retention(time_point, memory_strength, base_time)
            curve.append((hours, retention))
        
        return curve

forgetting_curve = ForgettingCurveModel()


