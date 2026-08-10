"""
Pivot & Pulse — Biomechanical Co-Occurrence Post-Processing Calibrator
Calibrates raw neural network probability predictions using empirical target co-occurrence priors
and Bayesian logit adjustments to maximize Macro AUC-ROC performance.
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional
from sklearn.metrics import roc_auc_score

# 12 Targets
TARGET_COLS: List[str] = [
    "acl",
    "mcl",
    "medial_meniscus",
    "lateral_meniscus",
    "medial_oa",
    "lateral_oa",
    "pf_oa",
    "effusion",
    "synovitis",
    "bakers_cyst",
    "contusion",
    "fracture",
]


class CooccurrenceCalibrator:
    """Bayesian Co-Occurrence Prior Post-Processing Calibrator."""

    def __init__(self, alpha: float = 0.15, eps: float = 1e-6):
        """
        Args:
            alpha: Calibration strength weighting factor (0.0 to 0.5).
            eps: Epsilon smoothing term for division stability.
        """
        self.alpha = alpha
        self.eps = eps
        self.conditional_priors: Optional[np.ndarray] = None
        self.base_priors: Optional[np.ndarray] = None

    def fit(self, y_true: np.ndarray):
        """Fits empirical joint and conditional co-occurrence matrices from training labels.
        
        Args:
            y_true: (N, 12) Binary ground truth matrix.
        """
        n_samples, n_targets = y_true.shape
        self.base_priors = np.mean(y_true, axis=0) + self.eps  # P(T_j = 1)
        
        # Co-occurrence counts
        joint_counts = np.dot(y_true.T, y_true)  # (12, 12)
        pos_counts = np.sum(y_true, axis=0, keepdims=True).T + self.eps  # P(T_i = 1) * N
        
        # P(T_j = 1 | T_i = 1)
        self.conditional_priors = joint_counts / pos_counts
        np.fill_diagonal(self.conditional_priors, 1.0)

    def calibrate_probabilities(self, y_pred: np.ndarray) -> np.ndarray:
        """Applies Bayesian prior adjustment to raw prediction probabilities.
        
        Args:
            y_pred: (N, 12) Raw predicted probabilities [0, 1].
            
        Returns:
            (N, 12) Calibrated predicted probabilities [0, 1].
        """
        if self.conditional_priors is None:
            raise ValueError("Calibrator must be fit on ground truth before calling calibrate_probabilities.")
            
        y_clipped = np.clip(y_pred, self.eps, 1.0 - self.eps)
        
        # Compute conditional expectation boost per target: sum_i y_pred_i * P(T_j | T_i)
        prior_boost = np.dot(y_clipped, self.conditional_priors) / (np.sum(self.conditional_priors, axis=0) + self.eps)
        
        # Blend raw predictions with co-occurrence prior boost
        calibrated = (1.0 - self.alpha) * y_clipped + self.alpha * prior_boost
        return np.clip(calibrated, 0.0, 1.0)

    def evaluate_improvement(self, y_true: np.ndarray, y_pred_raw: np.ndarray) -> Dict[str, float]:
        """Calculates Macro AUC before and after co-occurrence calibration.
        
        Args:
            y_true: Ground truth binary labels.
            y_pred_raw: Raw model prediction probabilities.
            
        Returns:
            Dict containing raw_macro_auc, calibrated_macro_auc, and delta.
        """
        self.fit(y_true)
        y_pred_cal = self.calibrate_probabilities(y_pred_raw)
        
        raw_aucs = [roc_auc_score(y_true[:, i], y_pred_raw[:, i]) for i in range(y_true.shape[1])]
        cal_aucs = [roc_auc_score(y_true[:, i], y_pred_cal[:, i]) for i in range(y_true.shape[1])]
        
        raw_mean = float(np.mean(raw_aucs))
        cal_mean = float(np.mean(cal_aucs))
        
        return {
            "raw_macro_auc": round(raw_mean, 5),
            "calibrated_macro_auc": round(cal_mean, 5),
            "delta_auc": round(cal_mean - raw_mean, 5),
        }


if __name__ == "__main__":
    print("=" * 60)
    print("Pivot & Pulse — Biomechanical Co-Occurrence Calibrator")
    print("=" * 60)
    
    # Synthetic smoke test with correlated targets (ACL tear correlated with Effusion and Contusion)
    np.random.seed(42)
    N = 1000
    
    # Ground truth with co-occurrence
    acl = np.random.binomial(1, 0.25, size=N)
    effusion = np.clip(acl * np.random.binomial(1, 0.8, size=N) + (1 - acl) * np.random.binomial(1, 0.15, size=N), 0, 1)
    contusion = np.clip(acl * np.random.binomial(1, 0.7, size=N) + (1 - acl) * np.random.binomial(1, 0.10, size=N), 0, 1)
    
    y_true = np.zeros((N, 12), dtype=int)
    y_true[:, 0] = acl
    y_true[:, 7] = effusion
    y_true[:, 10] = contusion
    
    for i in [1, 2, 3, 4, 5, 6, 8, 9, 11]:
        y_true[:, i] = np.random.binomial(1, 0.20, size=N)
        
    # Noisy predictions
    y_pred_raw = y_true * 0.6 + np.random.uniform(0.1, 0.4, size=(N, 12))
    
    calibrator = CooccurrenceCalibrator(alpha=0.15)
    results = calibrator.evaluate_improvement(y_true, y_pred_raw)
    
    print(f"Raw Model Macro AUC:         {results['raw_macro_auc']:.5f}")
    print(f"Calibrated Model Macro AUC:  {results['calibrated_macro_auc']:.5f}")
    print(f"Macro AUC Gain (Delta):      {results['delta_auc']:+.5f}")
