import numpy as np

# Try to import real db_manager, fall back to mock
try:
    from src.services.db_manager import get_total_likes_for_concept
except:
    from src.services.db_manager_mock import get_total_likes_for_concept

alpha0, beta0 = 1.0, 1.0
lr_base = 0.3
lr_fail = 0.02


def sigmoid(x):
    return 1 / (1 + np.exp(-np.clip(x, -500, 500)))


def initialize_user_state(num_concepts: int):
    """Initializing a new user profile with Bayesian priors."""
    theta_init = np.random.normal(0.0, 0.8, num_concepts)
    alpha = np.full(num_concepts, alpha0)
    beta = np.full(num_concepts, beta0)
    recent_success = np.zeros(num_concepts)
    return {
        "theta": theta_init.tolist(),
        "alpha": alpha.tolist(),
        "beta": beta.tolist(),
        "recent_success": recent_success.tolist()
    }


def update_mastery(user_state, concept_idx, outcome, b_concepts):
    """
    Update user's knowledge after answering one question.
    Combines IRT, Bayesian updates, and reinforcement learning.
    """
    theta = np.array(user_state["theta"])
    alpha = np.array(user_state["alpha"])
    beta = np.array(user_state["beta"])
    recent_success = np.array(user_state["recent_success"])

    b_sel = b_concepts[concept_idx]
    theta_sel = theta[concept_idx]
    p_true = sigmoid(theta_sel - b_sel)

    # 1. Update recent success (Moving average)
    recent_success[concept_idx] = 0.8 * recent_success[concept_idx] + 0.2 * outcome

    # 2. Dynamic Learning Rate Factors
    difficulty_factor = 1 + 0.5 * max(b_sel, 0)
    streak_boost = 1 + 0.3 * recent_success[concept_idx]
    lr_dynamic = lr_base * difficulty_factor * streak_boost
    
    # 3. Update Theta (Reinforcement Learning with IRT)
    theta[concept_idx] += lr_dynamic * (outcome - p_true)
    theta[concept_idx] += 0.02 * outcome

    # 4. Update Beta Distribution parameters (Bayesian model)
    alpha[concept_idx] += outcome
    beta[concept_idx] += (1 - outcome)

    user_state.update({
        "theta": theta.tolist(),
        "alpha": alpha.tolist(),
        "beta": beta.tolist(),
        "recent_success": recent_success.tolist()
    })
    return user_state


def select_next_lesson_concept(user_state, all_concepts_data):
    """
    Selects the next concept using IRT + social signals.
    """
    theta = np.array(user_state["theta"])
    b_concepts = np.array([c.get("difficulty", 0.0) for c in all_concepts_data])
    p_succ = sigmoid(theta - b_concepts)
    
    # 1. Calculate Expected Improvement
    delta_succ = lr_base * (1 - p_succ)
    delta_fail = -lr_fail * p_succ
    mastery_succ = sigmoid((theta + delta_succ) - b_concepts)
    mastery_fail = sigmoid((theta + delta_fail) - b_concepts)
    expected_improvement = (p_succ * mastery_succ + (1 - p_succ) * mastery_fail) - p_succ

    # 2. Social Score Boost
    try:
        lesson_likes = np.array([get_total_likes_for_concept(c.get("id", "")) for c in all_concepts_data])
        max_likes = np.max(lesson_likes) if np.max(lesson_likes) > 0 else 1.0
        social_boost = 0.2 * (lesson_likes / max_likes)
    except:
        social_boost = np.zeros(len(all_concepts_data))

    # 3. Final Selection Metric
    final_metric = expected_improvement + social_boost
    final_metric[p_succ > 0.95] *= 0.1 

    return int(np.argmax(final_metric))
