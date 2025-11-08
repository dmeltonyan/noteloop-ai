"""
Spaced Repetition Scheduler
Implements SM-2 algorithm with IRT integration
"""

from datetime import datetime, timedelta
from typing import Dict, List
import math

class SpacedRepetitionScheduler:
    """
    Advanced spaced repetition using modified SM-2 algorithm
    Integrated with IRT for optimal spacing
    """
    
    def __init__(self):
        self.min_interval = 1  # 1 day minimum
        self.max_interval = 180  # 6 months maximum
    
    def calculate_next_review(self, mastery: float, previous_interval: int,
                             times_reviewed: int, last_review: datetime) -> datetime:
        """
        Calculate when item should be reviewed next
        
        Args:
            mastery: Current mastery level (0 to 1)
            previous_interval: Previous interval in days
            times_reviewed: Number of times reviewed
            last_review: When last reviewed
        
        Returns:
            Next review date
        """
        # Base interval on mastery and review count
        if times_reviewed == 0:
            interval = 1
        elif times_reviewed == 1:
            interval = 3
        else:
            # Exponential growth based on mastery
            easiness_factor = 1.3 + (mastery * 1.7)  # 1.3 to 3.0
            interval = int(previous_interval * easiness_factor)
        
        # Adjust for mastery level
        if mastery < 0.3:
            interval = max(1, interval // 2)  # Review sooner if struggling
        elif mastery > 0.8:
            interval = int(interval * 1.5)  # Space out if mastered
        
        # Apply bounds
        interval = max(self.min_interval, min(self.max_interval, interval))
        
        # Calculate next review date
        next_review = last_review + timedelta(days=interval)
        
        return next_review
    
    def get_items_due(self, items: List[Dict], current_time: datetime) -> List[Dict]:
        """
        Get items that are due for review
        
        Returns:
            List of items due for review, sorted by priority
        """
        due_items = []
        
        for item in items:
            next_review = item.get('next_review')
            if next_review and next_review <= current_time:
                # Calculate priority (overdue items get higher priority)
                days_overdue = (current_time - next_review).days
                priority = item.get('mastery', 0.5) + (days_overdue * 0.1)
                
                item['priority'] = priority
                due_items.append(item)
        
        # Sort by priority (lowest mastery + most overdue first)
        due_items.sort(key=lambda x: x.get('priority', 0))
        
        return due_items
    
    def should_review_now(self, mastery: float, last_review: datetime,
                         next_review: datetime, current_time: datetime) -> bool:
        """
        Determine if item should be reviewed now
        """
        # Always review if due
        if current_time >= next_review:
            return True
        
        # Review early if mastery is dropping
        if mastery < 0.4:
            return True
        
        # Don't review if recently seen (within last hour)
        if (current_time - last_review).total_seconds() < 3600:
            return False
        
        return False

sr_scheduler = SpacedRepetitionScheduler()
