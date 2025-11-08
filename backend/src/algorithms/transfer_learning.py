"""
Transfer Learning Detection
Identifies when knowledge transfers to new contexts
"""
from typing import Dict, List, Optional, Set
from datetime import datetime

class TransferLearningDetector:
    """
    Detects when knowledge transfers between related concepts
    """
    
    def __init__(self):
        self.similarity_threshold = 0.6  # Concepts are similar if similarity > 0.6
    
    def detect_transfer(self, source_concept: str, target_concept: str,
                       user_performance: Dict[str, List[Dict]]) -> Dict:
        """
        Detect if knowledge transferred from source to target
        
        Args:
            source_concept: Concept that was mastered
            target_concept: New concept being tested
            user_performance: Dict mapping concept_id to performance history:
                {
                    'interactions': List[Dict],
                    'mastery': float
                }
        
        Returns:
            Dictionary with transfer analysis:
            {
                'transfer_detected': bool,
                'transfer_strength': float (0-1),
                'evidence': List[str]
            }
        """
        source_data = user_performance.get(source_concept, {})
        target_data = user_performance.get(target_concept, {})
        
        source_mastery = source_data.get('mastery', 0.0)
        target_interactions = target_data.get('interactions', [])
        
        if source_mastery < 0.7 or not target_interactions:
            return {
                'transfer_detected': False,
                'transfer_strength': 0.0,
                'evidence': ['Insufficient data for transfer detection']
            }
        
        # Check if target performance is better than expected
        # (suggesting transfer from source)
        if len(target_interactions) < 3:
            return {
                'transfer_detected': False,
                'transfer_strength': 0.0,
                'evidence': ['Need more target concept interactions']
            }
        
        # Calculate expected performance (baseline)
        # Assume new concept starts at 0.5 mastery
        expected_performance = 0.5
        
        # Calculate actual performance
        actual_performance = sum(1 for i in target_interactions if i.get('correct', False)) / len(target_interactions)
        
        # Transfer detected if performance is significantly better than expected
        performance_boost = actual_performance - expected_performance
        
        transfer_detected = performance_boost > 0.2  # 20% improvement suggests transfer
        transfer_strength = min(1.0, performance_boost / 0.5)  # Normalize to 0-1
        
        evidence = []
        if transfer_detected:
            evidence.append(f"Target concept performance ({actual_performance:.1%}) exceeds expected ({expected_performance:.1%})")
            evidence.append(f"Source concept mastery ({source_mastery:.1%}) suggests knowledge transfer")
            if len(target_interactions) >= 5:
                # Check if performance improved over time (learning curve)
                recent_performance = sum(1 for i in target_interactions[-5:] if i.get('correct', False)) / 5
                early_performance = sum(1 for i in target_interactions[:5] if i.get('correct', False)) / 5
                if recent_performance > early_performance:
                    evidence.append("Performance improving over time - transfer likely")
        else:
            evidence.append("No significant transfer detected")
            evidence.append("Target concept performance matches expected baseline")
        
        return {
            'transfer_detected': transfer_detected,
            'transfer_strength': round(transfer_strength, 2),
            'source_mastery': round(source_mastery, 2),
            'target_performance': round(actual_performance, 2),
            'expected_performance': round(expected_performance, 2),
            'performance_boost': round(performance_boost, 2),
            'evidence': evidence
        }
    
    def find_transfer_opportunities(self, mastered_concepts: List[str],
                                   new_concepts: List[str],
                                   concept_similarity: Dict[tuple, float]) -> List[Dict]:
        """
        Find concepts where transfer is likely
        
        Returns:
            List of transfer opportunities
        """
        opportunities = []
        
        for mastered in mastered_concepts:
            for new_concept in new_concepts:
                similarity = concept_similarity.get((mastered, new_concept), 0.0)
                
                if similarity > self.similarity_threshold:
                    opportunities.append({
                        'source_concept': mastered,
                        'target_concept': new_concept,
                        'similarity': similarity,
                        'transfer_likelihood': similarity
                    })
        
        # Sort by transfer likelihood
        opportunities.sort(key=lambda x: x['transfer_likelihood'], reverse=True)
        
        return opportunities

transfer_detector = TransferLearningDetector()


