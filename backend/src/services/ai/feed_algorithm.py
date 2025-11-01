import numpy as np
import random
from typing import List, Tuple

class AdaptiveFeedAlgorithm:
    def __init__(self):
        self.lesson_quiz_ratio = 4
    
    def select_next_content(self, user_progress, available_concepts: List) -> Tuple[str, str]:
        total_viewed = user_progress.total_lessons_viewed + user_progress.total_questions_answered
        
        if total_viewed % (self.lesson_quiz_ratio + 1) == self.lesson_quiz_ratio:
            content_type = "quiz"
        else:
            content_type = "lesson"
        
        concept_id = self._select_optimal_concept(
            user_progress.theta,
            user_progress.concept_mastery,
            available_concepts
        )
        
        return content_type, concept_id
    
    def _select_optimal_concept(self, user_theta: float, mastery_scores: dict, available_concepts: List) -> str:
        target_difficulty = user_theta + 0.3
        
        concept_scores = []
        for concept in available_concepts:
            concept_id = concept.id
            concept_difficulty = concept.difficulty
            mastery = mastery_scores.get(concept_id, 0.5)
            
            difficulty_score = 1 - abs(concept_difficulty - target_difficulty)
            mastery_score = 1 - mastery
            exploration = random.random() * 0.2
            
            total_score = difficulty_score * 0.5 + mastery_score * 0.3 + exploration
            concept_scores.append((concept_id, total_score))
        
        concept_scores.sort(key=lambda x: x[1], reverse=True)
        return concept_scores[0][0]
    
    def determine_difficulty_zone(self, concept_difficulty: float, user_theta: float) -> str:
        relative_difficulty = concept_difficulty - user_theta
        
        if relative_difficulty < -0.5:
            return "comfortable"
        elif relative_difficulty < 0.5:
            return "optimal"
        else:
            return "stretch"
    
    def update_user_ability(self, user_progress, question_difficulty: float, is_correct: bool) -> float:
        expected_prob = self._irt_probability(user_progress.theta, question_difficulty)
        learning_rate = 0.5 / (1 + user_progress.total_questions_answered / 100)
        
        performance = 1.0 if is_correct else 0.0
        delta = learning_rate * (performance - expected_prob)
        
        new_theta = user_progress.theta + delta
        return max(-3.0, min(3.0, new_theta))
    
    def _irt_probability(self, theta: float, difficulty: float, discrimination: float = 1.0) -> float:
        exponent = discrimination * (theta - difficulty)
        return 1 / (1 + np.exp(-exponent))

feed_algorithm = AdaptiveFeedAlgorithm()
