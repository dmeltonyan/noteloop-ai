import numpy as np
from typing import Dict, Tuple

class AdaptiveLearningEngine:
    """
    Production implementation of noteloopai_sim.py
    Your exact algorithm: dynamic learning rates + expected improvement
    """
    
    def __init__(self, num_concepts: int = 20):
        self.num_concepts = num_concepts
        self.b_concepts = np.linspace(-0.8, 0.8, num_concepts)
        self.lr_base_correct = 0.20
        self.lr_base_incorrect = 0.01
        self.alpha0 = 1.0
        self.beta0 = 1.0
    
    @staticmethod
    def sigmoid(x):
        """Your sigmoid function"""
        return 1 / (1 + np.exp(-np.clip(x, -500, 500)))
    
    def initialize_user(self, user_id: str) -> Dict:
        """Initialize new user with baseline mastery"""
        theta_init = np.random.normal(0.0, 0.8, size=self.num_concepts)
        alpha = np.full(self.num_concepts, self.alpha0)
        beta = np.full(self.num_concepts, self.beta0)
        recent_success = np.zeros(self.num_concepts)
        
        return {
            "user_id": user_id,
            "theta": theta_init.tolist(),
            "alpha": alpha.tolist(),
            "beta": beta.tolist(),
            "recent_success": recent_success.tolist()
        }
    
    def select_next_concept(self, user_state: Dict) -> Tuple[int, float]:
        """
        Your exact algorithm: Expected improvement selection
        Returns: (concept_index, expected_mastery)
        """
        theta = np.array(user_state["theta"])
        
        # Current mastery estimates
        p_succ = self.sigmoid(theta - self.b_concepts)
        
        # Expected improvement calculation
        lr_base = 0.3
        lr_fail = 0.02
        
        delta_succ = lr_base * (1 - p_succ)
        delta_fail = -lr_fail * p_succ
        
        mastery_succ = self.sigmoid((theta + delta_succ) - self.b_concepts)
        mastery_fail = self.sigmoid((theta + delta_fail) - self.b_concepts)
        
        expected_new_mastery = p_succ * mastery_succ + (1 - p_succ) * mastery_fail
        expected_improvement = expected_new_mastery - p_succ
        
        # Mask already-mastered concepts
        expected_improvement[p_succ > 0.95] = -1e9
        
        chosen_idx = np.argmax(expected_improvement)
        expected_mastery = p_succ[chosen_idx]
        
        return int(chosen_idx), float(expected_mastery)
    
    def update_mastery(self, user_state: Dict, concept_idx: int, outcome: int) -> Dict:
        """
        Update user mastery after interaction
        Uses your dynamic learning rate + momentum
        """
        theta = np.array(user_state["theta"])
        alpha = np.array(user_state["alpha"])
        beta = np.array(user_state["beta"])
        recent_success = np.array(user_state["recent_success"])
        
        b_sel = self.b_concepts[concept_idx]
        theta_sel = theta[concept_idx]
        
        # True probability
        p_true = self.sigmoid(theta_sel - b_sel)
        
        # Adaptive learning rate (your momentum logic)
        recent_success[concept_idx] = 0.8 * recent_success[concept_idx] + 0.2 * outcome
        difficulty_factor = 1 + 0.5 * np.clip(b_sel, 0, None)
        streak_boost = 1 + 0.3 * recent_success[concept_idx]
        lr_dynamic = self.lr_base_correct * difficulty_factor * streak_boost
        
        # Delta-rule update
        theta_before = theta[concept_idx]
        theta[concept_idx] += lr_dynamic * (outcome - p_true)
        theta[concept_idx] += 0.02 * outcome  # success bonus
        
        # Bayesian update
        alpha[concept_idx] += outcome
        beta[concept_idx] += (1 - outcome)
        
        return {
            "user_id": user_state["user_id"],
            "theta": theta.tolist(),
            "alpha": alpha.tolist(),
            "beta": beta.tolist(),
            "recent_success": recent_success.tolist(),
            "theta_change": float(theta[concept_idx] - theta_before)
        }
    
    def get_mastery_summary(self, user_state: Dict) -> Dict:
        """Get overall mastery statistics"""
        theta = np.array(user_state["theta"])
        mastery = self.sigmoid(theta - self.b_concepts)
        
        return {
            "overall_mastery": float(mastery.mean()),
            "mastered_concepts": int((mastery > 0.95).sum()),
            "struggling_concepts": int((mastery < 0.4).sum()),
            "per_concept_mastery": mastery.tolist()
        }