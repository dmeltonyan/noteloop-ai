import numpy as np
import random
from typing import List, Tuple, Dict

class AdaptiveLearningEngine:
    """
    Combines:
    1. IRT (Item Response Theory) for ability estimation
    2. Reinforcement learning for content sequencing
    3. Feed optimization for engagement
    """
    
    def __init__(self):
        self.video_quiz_ratio = 4  # 4 videos, then 1 quiz
        self.min_videos_before_quiz = 3
        self.max_videos_before_quiz = 5
    
    def select_next_content(self, user, available_concepts: List, 
                           items_since_last_quiz: int) -> Tuple[str, str]:
        """
        Select next piece of content (video or quiz)
        Returns: (content_type, concept_id)
        """
        
        # Decide if next should be quiz
        should_show_quiz = self._should_show_quiz(items_since_last_quiz)
        
        if should_show_quiz:
            content_type = "quiz"
        else:
            content_type = "video"
        
        # Select optimal concept
        concept_id = self._select_optimal_concept(
            user.overall_ability,
            user.mastery_per_concept,
            available_concepts
        )
        
        return content_type, concept_id
    
    def _should_show_quiz(self, items_since_last_quiz: int) -> bool:
        """Determine if next item should be a quiz"""
        
        if items_since_last_quiz < self.min_videos_before_quiz:
            return False
        
        if items_since_last_quiz >= self.max_videos_before_quiz:
            return True
        
        # Probabilistic between min and max
        prob = (items_since_last_quiz - self.min_videos_before_quiz) / \
               (self.max_videos_before_quiz - self.min_videos_before_quiz)
        return random.random() < prob
    
    def _select_optimal_concept(self, user_ability: float, 
                               mastery_scores: Dict[str, float],
                               available_concepts: List) -> str:
        """
        Select concept in optimal difficulty zone (i+1)
        Using IRT and mastery-based selection
        """
        
        # Target difficulty: slightly above current ability
        target_difficulty = user_ability + 0.3
        
        concept_scores = []
        for concept in available_concepts:
            concept_id = concept.id
            concept_difficulty = concept.difficulty
            
            # Get current mastery (0-1 scale)
            mastery = mastery_scores.get(concept_id, 0.5)
            
            # Calculate scores
            # 1. Difficulty match (closer to i+1 is better)
            difficulty_score = 1 - abs(concept_difficulty - target_difficulty)
            
            # 2. Mastery need (lower mastery = higher priority)
            mastery_score = 1 - mastery
            
            # 3. Exploration bonus (random factor)
            exploration = random.random() * 0.15
            
            # Weighted combination
            total_score = (difficulty_score * 0.5 + 
                         mastery_score * 0.35 + 
                         exploration)
            
            concept_scores.append((concept_id, total_score))
        
        # Select highest scoring concept
        concept_scores.sort(key=lambda x: x[1], reverse=True)
        return concept_scores[0][0]
    
    def select_best_video(self, videos: List, user_ability: float) -> str:
        """Select best video from concept based on engagement and difficulty"""
        
        if not videos:
            return None
        
        video_scores = []
        for video in videos:
            # Factors: views, likes, user ability match
            engagement_score = (video.helpful_likes + 1) / (video.views + 1)
            
            # Prefer videos that match user's level
            # (You could add difficulty metadata to videos)
            
            # For now, use engagement as primary factor
            total_score = engagement_score + random.random() * 0.1
            
            video_scores.append((video.id, total_score))
        
        video_scores.sort(key=lambda x: x[1], reverse=True)
        return video_scores[0][0]
    
    def select_quiz(self, quizzes: List, user_ability: float) -> str:
        """Select quiz question matching user's ability"""
        
        if not quizzes:
            return None
        
        # Select question closest to user ability (±0.5 range)
        suitable_quizzes = [
            q for q in quizzes 
            if abs(q.difficulty - user_ability) < 1.0
        ]
        
        if not suitable_quizzes:
            suitable_quizzes = quizzes
        
        # Add some randomness
        return random.choice(suitable_quizzes).id
    
    def update_user_ability(self, user, quiz_difficulty: float, 
                           is_correct: bool) -> float:
        """
        Update user ability using IRT
        Returns new ability (theta)
        """
        
        # Calculate expected probability of correct answer
        expected_prob = self._irt_probability(user.overall_ability, quiz_difficulty)
        
        # Learning rate decreases with more questions
        learning_rate = 0.5 / (1 + user.total_questions / 100)
        
        # Update based on performance
        actual = 1.0 if is_correct else 0.0
        error = actual - expected_prob
        
        new_ability = user.overall_ability + (learning_rate * error)
        
        # Clamp to reasonable range
        new_ability = max(-3.0, min(3.0, new_ability))
        
        return new_ability
    
    def update_concept_mastery(self, user, concept_id: str, 
                              performance: float):
        """
        Update mastery for specific concept
        performance: 0.0 (failed) to 1.0 (perfect)
        """
        
        current_mastery = user.mastery_per_concept.get(concept_id, 0.5)
        
        # Exponential moving average
        alpha = 0.3  # Learning rate
        new_mastery = alpha * performance + (1 - alpha) * current_mastery
        
        user.mastery_per_concept[concept_id] = new_mastery
        
        return new_mastery
    
    def _irt_probability(self, ability: float, difficulty: float, 
                        discrimination: float = 1.0) -> float:
        """
        2-Parameter Logistic Model (2PL IRT)
        P(correct) = 1 / (1 + exp(-discrimination * (ability - difficulty)))
        """
        exponent = discrimination * (ability - difficulty)
        return 1 / (1 + np.exp(-exponent))
    
    def get_difficulty_zone(self, concept_difficulty: float, 
                           user_ability: float) -> str:
        """
        Classify content into zones:
        - comfortable (i+0): Review
        - optimal (i+1): Learning
        - stretch (i+2): Challenge
        """
        
        relative_diff = concept_difficulty - user_ability
        
        if relative_diff < -0.5:
            return "comfortable"
        elif relative_diff < 0.5:
            return "optimal"
        else:
            return "stretch"

adaptive_engine = AdaptiveLearningEngine()
