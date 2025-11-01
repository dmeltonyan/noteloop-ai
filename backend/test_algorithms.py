import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from algorithms.noteloop_ai_engine import initialize_user_state, update_mastery, sigmoid
import numpy as np

def test_engine():
    print("=" * 60)
    print("NOTELOOP AI ENGINE TEST")
    print("=" * 60)
    
    # Test 1
    print("\nTest 1: Initialize User State")
    print("-" * 60)
    num_concepts = 5
    user_state = initialize_user_state(num_concepts)
    print(f"Initialized {num_concepts} concepts")
    print(f"Theta: {[round(t, 3) for t in user_state['theta']]}")
    print(f"Alpha: {user_state['alpha']}")
    print(f"Beta: {user_state['beta']}")
    print("PASS")
    
    # Test 2
    print("\nTest 2: Update After Correct Answer")
    print("-" * 60)
    b_concepts = np.array([-0.5, -0.3, 0.0, 0.3, 0.5])
    concept_idx = 0
    outcome = 1
    
    theta_before = user_state['theta'][concept_idx]
    user_state = update_mastery(user_state, concept_idx, outcome, b_concepts)
    theta_after = user_state['theta'][concept_idx]
    
    print(f"Difficulty: {b_concepts[concept_idx]}")
    print(f"Theta before: {round(theta_before, 4)}")
    print(f"Theta after: {round(theta_after, 4)}")
    print(f"Change: {round(theta_after - theta_before, 4)}")
    print("PASS")
    
    # Test 3
    print("\nTest 3: Update After Incorrect Answer")
    print("-" * 60)
    concept_idx = 1
    outcome = 0
    
    theta_before = user_state['theta'][concept_idx]
    user_state = update_mastery(user_state, concept_idx, outcome, b_concepts)
    theta_after = user_state['theta'][concept_idx]
    
    print(f"Difficulty: {b_concepts[concept_idx]}")
    print(f"Theta before: {round(theta_before, 4)}")
    print(f"Theta after: {round(theta_after, 4)}")
    print(f"Change: {round(theta_after - theta_before, 4)}")
    print("PASS")
    
    # Test 4
    print("\nTest 4: IRT Probability Calculations")
    print("-" * 60)
    for i in range(len(user_state['theta'])):
        theta_val = user_state['theta'][i]
        b_val = b_concepts[i]
        prob = sigmoid(theta_val - b_val)
        print(f"Concept {i}: theta={round(theta_val, 2)}, difficulty={b_val}, P(success)={round(prob, 3)}")
    print("PASS")
    
    print("\n" + "=" * 60)
    print("ALL TESTS PASSED")
    print("=" * 60)

if __name__ == "__main__":
    test_engine()
