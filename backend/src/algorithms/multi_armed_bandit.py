"""
Multi-Armed Bandit for Content Selection
Uses Upper Confidence Bound (UCB) algorithm to balance exploration vs exploitation
"""
import math
from typing import List, Dict, Optional

class MultiArmedBanditSelector:
    """
    Selects optimal concepts using UCB algorithm
    Balances between:
    - Exploitation: Concepts user is likely to master (high expected reward)
    - Exploration: New concepts to discover (uncertainty reduction)
    """
    
    def __init__(self, exploration_constant: float = 1.5):
        """
        Args:
            exploration_constant: Higher = more exploration (default 1.5)
        """
        self.c = exploration_constant
    
    def select_concept(self, concepts: List[Dict], user_stats: Dict,
                      total_interactions: int) -> Optional[Dict]:
        """
        Select best concept using UCB algorithm
        
        Args:
            concepts: List of concept dictionaries with:
                - id: concept identifier
                - difficulty: concept difficulty
                - mastery: current mastery (0-1)
                - times_practiced: number of times practiced
            user_stats: User statistics including:
                - overall_ability: user's ability level
                - concept_mastery: mastery per concept
            total_interactions: Total number of interactions so far
        
        Returns:
            Selected concept dictionary
        """
        if not concepts:
            return None
        
        if total_interactions == 0:
            # First interaction: select based on difficulty match
            return self._select_by_difficulty(concepts, user_stats.get('overall_ability', 0.0))
        
        scored_concepts = []
        
        for concept in concepts:
            concept_id = concept.get('id')
            times_practiced = concept.get('times_practiced', 0)
            mastery = concept.get('mastery', 0.0)
            difficulty = concept.get('difficulty', 0.0)
            user_ability = user_stats.get('overall_ability', 0.0)
            
            # Expected reward (exploitation term)
            # Higher mastery = higher expected reward
            # But also consider difficulty match
            difficulty_match = 1.0 - abs(difficulty - user_ability) / 3.0  # Normalize to 0-1
            expected_reward = (mastery * 0.6) + (difficulty_match * 0.4)
            
            # Uncertainty term (exploration term)
            # UCB formula: c * sqrt(ln(N) / n_i)
            # Where N = total interactions, n_i = times practiced this concept
            if times_practiced == 0:
                uncertainty = float('inf')  # Never practiced = maximum uncertainty
            else:
                uncertainty = self.c * math.sqrt(math.log(total_interactions) / times_practiced)
            
            # UCB score = expected_reward + uncertainty
            ucb_score = expected_reward + uncertainty
            
            scored_concepts.append({
                **concept,
                'ucb_score': ucb_score,
                'expected_reward': expected_reward,
                'uncertainty': uncertainty
            })
        
        # Select concept with highest UCB score
        best_concept = max(scored_concepts, key=lambda x: x['ucb_score'])
        
        return best_concept
    
    def _select_by_difficulty(self, concepts: List[Dict], user_ability: float) -> Dict:
        """Select concept closest to user's ability level"""
        best = min(concepts, 
                  key=lambda x: abs(x.get('difficulty', 0.0) - user_ability))
        return best
    
    def update_concept_stats(self, concept: Dict, outcome: float):
        """
        Update concept statistics after interaction
        
        Args:
            concept: Concept dictionary to update
            outcome: Performance outcome (0.0 to 1.0)
        """
        # Update times practiced
        concept['times_practiced'] = concept.get('times_practiced', 0) + 1
        
        # Update mastery (exponential moving average)
        current_mastery = concept.get('mastery', 0.5)
        alpha = 0.3  # Learning rate
        new_mastery = alpha * outcome + (1 - alpha) * current_mastery
        concept['mastery'] = new_mastery

mab_selector = MultiArmedBanditSelector()


