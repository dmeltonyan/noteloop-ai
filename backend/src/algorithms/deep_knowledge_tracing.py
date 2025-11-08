"""
Deep Knowledge Tracing
Predicts mastery probability in real-time (like Duolingo)
Simplified version - full DKT would use neural networks
"""
from typing import Dict, List, Optional
from datetime import datetime
import math

class DeepKnowledgeTracing:
    """
    Simplified Knowledge Tracing model
    Predicts probability of correct answer before user attempts
    """
    
    def __init__(self):
        self.learning_rate = 0.3
        self.forgetting_rate = 0.1
    
    def predict_mastery_probability(self, concept_id: str, 
                                   interaction_history: List[Dict]) -> float:
        """
        Predict probability of correct answer
        
        Args:
            concept_id: Concept being tested
            interaction_history: List of past interactions:
                {
                    'concept_id': str,
                    'correct': bool,
                    'timestamp': datetime,
                    'difficulty': float
                }
        
        Returns:
            Probability of correct answer (0.0 to 1.0)
        """
        # Filter to this concept
        concept_history = [
            h for h in interaction_history 
            if h['concept_id'] == concept_id
        ]
        
        if not concept_history:
            # Never seen before - base probability on difficulty
            return 0.5
        
        # Calculate mastery based on recent performance
        recent_interactions = concept_history[-10:]  # Last 10 interactions
        
        # Weight recent interactions more heavily
        total_weight = 0.0
        weighted_correct = 0.0
        
        for i, interaction in enumerate(recent_interactions):
            # More recent = higher weight
            weight = (i + 1) / len(recent_interactions)
            total_weight += weight
            
            if interaction['correct']:
                weighted_correct += weight
        
        # Base mastery probability
        mastery_prob = weighted_correct / total_weight if total_weight > 0 else 0.5
        
        # Apply forgetting based on time since last interaction
        last_interaction = concept_history[-1]
        time_since = (datetime.now() - last_interaction['timestamp']).total_seconds() / 86400  # days
        
        # Exponential decay
        forgetting_factor = math.exp(-self.forgetting_rate * time_since)
        mastery_prob *= forgetting_factor
        
        return max(0.1, min(0.95, mastery_prob))
    
    def update_mastery(self, concept_id: str, was_correct: bool,
                      current_mastery: float) -> float:
        """
        Update mastery estimate after interaction
        
        Args:
            concept_id: Concept identifier
            was_correct: Whether answer was correct
            current_mastery: Current mastery estimate
        
        Returns:
            Updated mastery estimate
        """
        target = 1.0 if was_correct else 0.0
        error = target - current_mastery
        
        # Update with learning rate
        new_mastery = current_mastery + (self.learning_rate * error)
        
        return max(0.0, min(1.0, new_mastery))
    
    def get_learning_state(self, concept_id: str, 
                          interaction_history: List[Dict]) -> Dict:
        """
        Get current learning state for concept
        
        Returns:
            Dictionary with learning state information
        """
        mastery_prob = self.predict_mastery_probability(concept_id, interaction_history)
        
        # Determine state
        if mastery_prob > 0.8:
            state = 'mastered'
        elif mastery_prob > 0.6:
            state = 'learning'
        elif mastery_prob > 0.4:
            state = 'struggling'
        else:
            state = 'new'
        
        return {
            'concept_id': concept_id,
            'mastery_probability': round(mastery_prob, 3),
            'state': state,
            'ready_to_advance': mastery_prob > 0.85,
            'needs_review': mastery_prob < 0.6
        }

dkt_model = DeepKnowledgeTracing()


