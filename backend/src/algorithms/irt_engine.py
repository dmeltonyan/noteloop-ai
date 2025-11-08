"""Simple IRT Engine"""
import math

class IRTEngine:
    def __init__(self):
        self.D = 1.7
    
    def probability_correct(self, theta, difficulty):
        exponent = -self.D * (theta - difficulty)
        return 1 / (1 + math.exp(exponent))
    
    def update_ability(self, current_theta, item_difficulty, response_correct):
        p_correct = self.probability_correct(current_theta, item_difficulty)
        error = (1.0 if response_correct else 0.0) - p_correct
        learning_rate = 0.3
        new_theta = current_theta + learning_rate * error
        return max(-3.0, min(3.0, new_theta))
    
    def select_optimal_item(self, theta, available_items, answered_items):
        # Filter out recently answered
        candidates = [i for i in available_items if i['id'] not in answered_items[-20:]]
        if not candidates:
            candidates = available_items
        
        # Find item closest to ability
        best = min(candidates, key=lambda x: abs(x.get('difficulty', 0) - theta))
        return best
    
    def calculate_mastery(self, theta, concept_difficulty):
        p_correct = self.probability_correct(theta, concept_difficulty)
        if p_correct < 0.7:
            return p_correct / 0.7 * 0.5
        else:
            return 0.5 + (p_correct - 0.7) / 0.2 * 0.5

irt_engine = IRTEngine()
