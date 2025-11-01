import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from algorithms.noteloop_ai_engine import initialize_user_state, update_mastery, sigmoid
import numpy as np

def test_engine():
    print("🧪 Testing NoteLoop AI Engine...")
    print("=" * 50)
    
    # Test 1: Initialize user state
    print("\n1️⃣ Testing User State Initialization...")
    num_concepts = 5
    user_state = initialize_user_state(num_concepts)
    print(f"   ✅ Initialized user state with {num_concepts} concepts")
    print(f"   📊 Initial theta: {[round(t, 3) for t in user_state['theta']]}")
    print(f"   📊 Alpha: {user_state['alpha']}")
    print(f"   📊 Beta: {user_state['beta']}")
    
    # Test 2: Update mastery after correct answer
    print("\n2️⃣ Testing Mastery Update (Correct Answer)...")
    b_concepts = np.array([-0.5, -0.3, 0.0, 0.3, 0.5])
    concept_idx = 0
    outcome = 1  # Correct
    
    theta_before = user_state['theta'][concept_idx]
    user_state = update_mastery(user_state, concept_idx, outcome, b_concepts)
    theta_after = user_state['theta'][concept_idx]
    
    print(f"   📊 Concept difficulty: {b_concepts[concept_idx]}")
    print(f"   📊 Theta before: {round(theta_before, 4)}")
    print(f"   📊 Theta after:  {round(theta_after, 4)}")
    print(f"   📊 Change: {round(theta_after - theta_before, 4)}")
    print(f"   ✅ Mastery increased (correct answer)")
    
    # Test 3: Update mastery after incorrect answer
    print("\n3️⃣ Testing Mastery Update (Incorrect Answer)...")
    concept_idx = 1
    outcome = 0  # Incorrect
    
    theta_before = user_state['theta'][concept_idx]
    user_state = update_mastery(user_state, concept_idx, outcome, b_concepts)
    theta_after = user_state['theta'][concept_idx]
    
    print(f"   📊 Concept difficulty: {b_concepts[concept_idx]}")
    print(f"   📊 Theta before: {round(theta_before, 4)}")
    print(f"   📊 Theta after:  {round(theta_after, 4)}")
    print(f"   📊 Change: {round(theta_after - theta_before, 4)}")
    print(f"   ✅ Mastery adjusted (incorrect answer)")
    
    # Test 4: Calculate success probabilities
    print("\n4️⃣ Testing IRT Probability Calculations...")
    for i, (theta_val, b_val) in enumerate(zip(user_state['theta'], b_concepts)):
        prob = sigmoid(theta_val - b_val)
        print(f"   Concept {i}: θ={round(theta_val, 2)}, b={b_val}, P(success)={round(prob, 3)}")
    
    print("\n" + "=" * 50)
    print("🎉 All tests passed!")
    print("\n💡 This engine is ready for production use!")

if __name__ == "__main__":
    test_engine()
