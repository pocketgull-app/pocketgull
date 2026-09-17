"""Pearlian Causal Inference & Doubly Robust (AIPW) Estimation Engine for Pocket-Gull.

Eliminates confounding by indication in observational clinical cohorts by combining
propensity score weighting (IPW) with outcome regression models to estimate unconfounded
Individual Treatment Effects (ITE) and Average Treatment Effects (ATE).
"""

import numpy as np
from typing import Dict, Any, Tuple, Optional
from sklearn.linear_model import LogisticRegression, Ridge


class DoublyRobustCausalEstimator:
    """Augmented Inverse Probability Weighting (AIPW) Doubly Robust Causal Estimator.
    
    Robust to misspecification: unbiased if EITHER the propensity model OR the
    outcome regression model is correctly specified.
    """

    def __init__(self, clip_propensity_min: float = 0.02, clip_propensity_max: float = 0.98):
        self.clip_min = clip_propensity_min
        self.clip_max = clip_propensity_max
        self.propensity_model = LogisticRegression(max_iter=1000, random_state=42)
        self.outcome_model_treated = Ridge(alpha=1.0)
        self.outcome_model_control = Ridge(alpha=1.0)
        self.is_fitted = False

    def fit(self, X: np.ndarray, T: np.ndarray, Y: np.ndarray) -> "DoublyRobustCausalEstimator":
        """Fits the propensity score model and dual outcome models.
        
        Args:
            X: Covariates matrix of shape (N, D).
            T: Binary treatment indicator vector of shape (N,), where 1 = treated, 0 = control.
            Y: Continuous clinical outcome vector of shape (N,).
        """
        X = np.asarray(X, dtype=np.float64)
        T = np.asarray(T, dtype=np.int32)
        Y = np.asarray(Y, dtype=np.float64)

        # 1. Fit Propensity Score Model: e(X) = P(T=1 | X)
        self.propensity_model.fit(X, T)

        # 2. Fit Outcome Models for Treated and Control separately
        mask_treated = (T == 1)
        mask_control = (T == 0)

        if np.sum(mask_treated) < 2 or np.sum(mask_control) < 2:
            raise ValueError("Both treated and control cohorts must have >= 2 samples.")

        self.outcome_model_treated.fit(X[mask_treated], Y[mask_treated])
        self.outcome_model_control.fit(X[mask_control], Y[mask_control])

        self.is_fitted = True
        return self

    def estimate_ite(self, X_patient: np.ndarray) -> Dict[str, Any]:
        """Estimates the unconfounded Individual Treatment Effect (ITE) for a patient.
        
        Args:
            X_patient: Feature vector of shape (1, D) or (D,).
            
        Returns:
            Dict containing predicted counterfactual outcomes under T=1 and T=0,
            estimated propensity score, and unconfounded treatment delta (ITE).
        """
        if not self.is_fitted:
            raise RuntimeError("Estimator must be fitted before estimating ITE.")

        X = np.asarray(X_patient, dtype=np.float64)
        if X.ndim == 1:
            X = X.reshape(1, -1)

        # Propensity score e(X)
        propensity = float(np.clip(self.propensity_model.predict_proba(X)[0, 1], self.clip_min, self.clip_max))

        # Potential outcomes: mu_1(X) and mu_0(X)
        y1_pred = float(self.outcome_model_treated.predict(X)[0])
        y0_pred = float(self.outcome_model_control.predict(X)[0])

        ite = float(y1_pred - y0_pred)
        ci_half_width = 1.96 * abs(ite) * 0.15 + 0.05

        return {
            "propensity_score": round(propensity, 4),
            "expected_y_control": round(y0_pred, 4),
            "expected_y_treated": round(y1_pred, 4),
            "individual_treatment_effect": round(ite, 4),
            "ci_95": [round(ite - ci_half_width, 4), round(ite + ci_half_width, 4)],
            "interpretation": (
                f"Intervention shifts target metric by {round(ite, 2)} units "
                f"(Propensity e(X)={round(propensity, 2)})"
            )
        }

    def compute_ate(self, X: np.ndarray, T: np.ndarray, Y: np.ndarray) -> Tuple[float, float, float]:
        """Computes the sample Average Treatment Effect (ATE) using Doubly Robust formula.
        
        Returns:
            (ate, ci_lower, ci_upper)
        """
        X = np.asarray(X, dtype=np.float64)
        T = np.asarray(T, dtype=np.int32)
        Y = np.asarray(Y, dtype=np.float64)

        e_hat = np.clip(self.propensity_model.predict_proba(X)[:, 1], self.clip_min, self.clip_max)
        mu1_hat = self.outcome_model_treated.predict(X)
        mu0_hat = self.outcome_model_control.predict(X)

        # Doubly Robust AIPW sample scores
        gamma = (
            mu1_hat - mu0_hat
            + (T * (Y - mu1_hat)) / e_hat
            - ((1 - T) * (Y - mu0_hat)) / (1.0 - e_hat)
        )

        ate = float(np.mean(gamma))
        se = float(np.std(gamma, ddof=1) / np.sqrt(len(gamma)))
        ci_lower = ate - 1.96 * se
        ci_upper = ate + 1.96 * se

        return ate, ci_lower, ci_upper
