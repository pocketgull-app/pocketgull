"""
Nelder-Mead Target-Specific Threshold Optimizer for RSNA Knee Competition
Data Science Best Practice #7: Optimizes target decision thresholds \tau_1, \tau_2, ..., \tau_K
on Out-of-Fold (OOF) predictions rather than using default 0.50.
"""

import numpy as np
import pandas as pd
from typing import List, Tuple, Dict, Optional
from scipy.optimize import minimize
from sklearn.metrics import f1_score, roc_auc_score

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


class NelderMeadThresholdOptimizer:
    """
    Optimizes 12 individual target decision thresholds using SciPy's Nelder-Mead
    simplex algorithm to maximize macro F1 / clinical sensitivity metrics on OOF predictions.
    """

    def __init__(self, target_names: Optional[List[str]] = None, initial_threshold: float = 0.35):
        self.target_names = target_names if target_names is not None else TARGET_COLS
        self.num_targets = len(self.target_names)
        self.initial_threshold = initial_threshold
        self.optimal_thresholds: np.ndarray = np.full(self.num_targets, initial_threshold, dtype=np.float32)
        self.baseline_macro_f1: float = 0.0
        self.optimized_macro_f1: float = 0.0

    def _objective_func(self, thresholds: np.ndarray, y_true: np.ndarray, y_pred: np.ndarray) -> float:
        """
        Objective function to minimize (-1.0 * Macro F1 score across all targets).
        """
        # Constrain thresholds between [0.05, 0.95]
        clipped_thresholds = np.clip(thresholds, 0.05, 0.95)
        
        f1_scores = []
        for col_idx in range(self.num_targets):
            binary_preds = (y_pred[:, col_idx] >= clipped_thresholds[col_idx]).astype(int)
            true_labels = y_true[:, col_idx].astype(int)
            score = f1_score(true_labels, binary_preds, zero_division=0)
            f1_scores.append(score)
            
        macro_f1 = float(np.mean(f1_scores))
        return -macro_f1  # Minimize negative F1 to maximize F1

    def fit(self, y_true_oof: np.ndarray, y_pred_oof: np.ndarray, max_iter: int = 500) -> np.ndarray:
        """
        Fits Nelder-Mead threshold optimization on Out-of-Fold predictions.
        
        Args:
            y_true_oof: (N, 12) binary ground truth array.
            y_pred_oof: (N, 12) predicted probability array [0, 1].
            max_iter: Maximum Nelder-Mead optimization iterations.
            
        Returns:
            (12,) array of optimal target decision thresholds.
        """
        initial_guess = np.full(self.num_targets, self.initial_threshold)
        
        # Calculate baseline F1 with default initial threshold
        self.baseline_macro_f1 = -self._objective_func(initial_guess, y_true_oof, y_pred_oof)
        
        # Run Nelder-Mead Simplex Optimization
        res = minimize(
            fun=self._objective_func,
            x0=initial_guess,
            args=(y_true_oof, y_pred_oof),
            method="Nelder-Mead",
            options={"maxiter": max_iter, "disp": False, "xatol": 1e-4, "fatol": 1e-4}
        )
        
        self.optimal_thresholds = np.clip(res.x, 0.05, 0.95)
        self.optimized_macro_f1 = -self._objective_func(self.optimal_thresholds, y_true_oof, y_pred_oof)
        
        return self.optimal_thresholds

    def apply_thresholds(self, y_pred: np.ndarray) -> np.ndarray:
        """
        Applies optimal decision thresholds to produce binary predictions.
        
        Args:
            y_pred: (N, 12) predicted probability array.
            
        Returns:
            (N, 12) binary prediction array {0, 1}.
        """
        return (y_pred >= self.optimal_thresholds).astype(int)

    def summary_table(self) -> pd.DataFrame:
        """Returns a formatted pandas DataFrame summarizing optimal thresholds per target."""
        data = []
        for idx, name in enumerate(self.target_names):
            data.append({
                "Target Pathology": name,
                "Optimal Threshold (tau)": round(float(self.optimal_thresholds[idx]), 4),
                "Initial Baseline Threshold": self.initial_threshold,
            })
        return pd.DataFrame(data)


if __name__ == "__main__":
    print("=" * 65)
    print("Nelder-Mead Target Decision Threshold Optimizer Initialized")
    print("=" * 65)
    
    # Generate synthetic Out-of-Fold (OOF) predictions for verification
    np.random.seed(42)
    n_oof = 1000
    y_true_mock = np.random.binomial(1, [0.15, 0.12, 0.25, 0.20, 0.18, 0.14, 0.10, 0.30, 0.22, 0.16, 0.28, 0.08], size=(n_oof, 12))
    
    # Add noise to simulate real model probability output
    y_pred_mock = np.clip(y_true_mock * 0.70 + np.random.normal(0.15, 0.15, size=(n_oof, 12)), 0.01, 0.99)
    
    optimizer = NelderMeadThresholdOptimizer()
    opt_thresholds = optimizer.fit(y_true_mock, y_pred_mock)
    
    print(f"[OK] Baseline Macro F1 (Default tau=0.35):   {optimizer.baseline_macro_f1:.4f}")
    print(f"[OK] Optimized Macro F1 (Nelder-Mead tau*): {optimizer.optimized_macro_f1:.4f}")
    print(f"[OK] Gain Improvement:                  +{(optimizer.optimized_macro_f1 - optimizer.baseline_macro_f1):.4f}")
    print("\nTarget-Specific Optimal Thresholds:")
    print(optimizer.summary_table().to_string(index=False))
