"""
Interleaved Practice Engine
Mixes different concepts instead of blocking (proven to improve retention)
"""
import random
from typing import List, Dict, Optional

class InterleavedPracticeEngine:
    """
    Generates interleaved practice sequences
    Alternates between concepts instead of blocking
    """
    
    def __init__(self):
        self.min_gap = 2  # Minimum items between same concept
        self.max_gap = 8  # Maximum items before revisiting concept
        self.similarity_threshold = 0.7  # Don't interleave too similar concepts
    
    def generate_interleaved_sequence(self, concepts: List[Dict], 
                                     user_mastery: Dict[str, float],
                                     sequence_length: int = 20) -> List[Dict]:
        """
        Generate interleaved practice sequence
        
        Args:
            concepts: List of concept dictionaries with:
                - id: concept identifier
                - difficulty: concept difficulty
                - similarity_tags: optional tags for similarity
            user_mastery: Dict mapping concept_id to mastery (0-1)
            sequence_length: Desired sequence length
        
        Returns:
            List of concept items in interleaved order
        """
        if not concepts:
            return []
        
        # Filter concepts that need practice (mastery < 0.9)
        practice_concepts = [
            c for c in concepts 
            if user_mastery.get(c['id'], 0.0) < 0.9
        ]
        
        if not practice_concepts:
            # All mastered - use all concepts for maintenance
            practice_concepts = concepts
        
        # Limit to reasonable number for interleaving
        max_concepts = min(len(practice_concepts), 5)  # Interleave max 5 concepts
        selected_concepts = practice_concepts[:max_concepts]
        
        # Generate interleaved sequence
        sequence = []
        concept_indices = {c['id']: 0 for c in selected_concepts}  # Track last position
        
        for i in range(sequence_length):
            # Find concepts that can be added (respecting gaps)
            available_concepts = []
            
            for concept in selected_concepts:
                concept_id = concept['id']
                last_position = concept_indices[concept_id]
                
                # Check if enough gap since last appearance
                gap = i - last_position
                if gap >= self.min_gap or last_position == 0:
                    # Also check if not too long since last appearance
                    if gap <= self.max_gap or last_position == 0:
                        available_concepts.append(concept)
            
            # If no concepts available, reset and use any
            if not available_concepts:
                available_concepts = selected_concepts
            
            # Select concept (prefer lower mastery for more practice)
            selected = min(
                available_concepts,
                key=lambda c: user_mastery.get(c['id'], 0.5)
            )
            
            sequence.append({
                **selected,
                'sequence_position': i,
                'interleaved': True
            })
            
            # Update last position
            concept_indices[selected['id']] = i
        
        return sequence
    
    def compare_with_blocked(self, interleaved_performance: List[float],
                            blocked_performance: List[float]) -> Dict:
        """
        Compare interleaved vs blocked practice performance
        
        Returns:
            Comparison metrics
        """
        if not interleaved_performance or not blocked_performance:
            return {
                'interleaved_avg': 0.0,
                'blocked_avg': 0.0,
                'improvement': 0.0,
                'recommendation': 'insufficient_data'
            }
        
        interleaved_avg = sum(interleaved_performance) / len(interleaved_performance)
        blocked_avg = sum(blocked_performance) / len(blocked_performance)
        
        improvement = ((interleaved_avg - blocked_avg) / blocked_avg * 100) if blocked_avg > 0 else 0
        
        if improvement > 10:
            recommendation = 'strong_preference_interleaved'
        elif improvement > 0:
            recommendation = 'prefer_interleaved'
        elif improvement > -10:
            recommendation = 'similar_performance'
        else:
            recommendation = 'prefer_blocked'
        
        return {
            'interleaved_avg': interleaved_avg,
            'blocked_avg': blocked_avg,
            'improvement_percent': round(improvement, 1),
            'recommendation': recommendation
        }

interleaved_engine = InterleavedPracticeEngine()


