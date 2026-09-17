"""Unit tests for DoublyRobustCausalEstimator in pocketgull_api."""

import pytest
import numpy as np
from engines.causal_inference import DoublyRobustCausalEstimator


def test_doubly_robust_causal_estimator_synthetic():
    np.random.seed(42)
    N = 200
    D = 3

    # Generate synthetic confounded observational data
    X = np.random.randn(N, D)
    # Sicker patients (higher X[:, 0]) more likely to be treated
    logit = 0.8 * X[:, 0]
    p_true = 1.0 / (1.0 + np.exp(-logit))
    T = (np.random.rand(N) < p_true).astype(int)

    # True treatment effect tau = -15.0
    # Outcome Y confounded by X[:, 0]
    Y = 50.0 + 10.0 * X[:, 0] - 15.0 * T + np.random.randn(N) * 2.0

    estimator = DoublyRobustCausalEstimator()
    estimator.fit(X, T, Y)

    # Estimate ATE
    ate, ci_lower, ci_upper = estimator.compute_ate(X, T, Y)
    # True effect is -15.0; estimated ATE should be near -15.0
    assert -20.0 < ate < -10.0
    assert ci_lower < ate < ci_upper

    # Estimate ITE for a test patient
    x_test = np.array([0.5, -0.2, 0.1])
    ite_res = estimator.estimate_ite(x_test)
    assert "individual_treatment_effect" in ite_res
    assert "propensity_score" in ite_res
    assert -22.0 < ite_res["individual_treatment_effect"] < -8.0
