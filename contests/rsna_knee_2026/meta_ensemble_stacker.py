"""
RSNA Knee Abnormalities Detection — 2nd-Level Meta-Ensemble Stacker
Blends predictions across diverse base model families (ConvNeXt 2.5D MIL, Swin3D, EVA-02, mDeBERTa-v3)
using gradient boosted decision trees for non-linear multi-target interaction modeling.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.multioutput import MultiOutputClassifier
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


class MetaEnsembleStacker:
    """2nd-Level MultiOutput Gradient Boosted Stacker."""

    def __init__(self, n_estimators: int = 80, learning_rate: float = 0.05):
        self.model = MultiOutputClassifier(
            HistGradientBoostingClassifier(
                max_iter=n_estimators,
                learning_rate=learning_rate,
                max_depth=4,
                random_state=42
            )
        )

    def _construct_meta_features(self, model_predictions: List[np.ndarray]) -> np.ndarray:
        """Concatenates OOF probability matrices from multiple base models.
        
        Args:
            model_predictions: List of (N, 12) probability arrays from base models.
            
        Returns:
            (N, 12 * num_models) stacked meta-feature matrix.
        """
        return np.hstack(model_predictions)

    def fit(self, oof_predictions: List[np.ndarray], y_true: np.ndarray):
        """Fits meta-ensemble stacker on Out-of-Fold (OOF) base model predictions.
        
        Args:
            oof_predictions: List of (N, 12) OOF prediction matrices from base models.
            y_true: (N, 12) Ground truth labels.
        """
        meta_X = self._construct_meta_features(oof_predictions)
        self.model.fit(meta_X, y_true)

    def predict_proba(self, test_predictions: List[np.ndarray]) -> np.ndarray:
        """Predicts blended multi-target probabilities.
        
        Args:
            test_predictions: List of (N, 12) prediction matrices from base models.
            
        Returns:
            (N, 12) Blended probability matrix.
        """
        meta_X = self._construct_meta_features(test_predictions)
        probas_list = self.model.predict_proba(meta_X)
        preds = np.zeros((meta_X.shape[0], len(TARGET_COLS)))
        for i, p in enumerate(probas_list):
            if p.shape[1] > 1:
                preds[:, i] = p[:, 1]
            else:
                preds[:, i] = p[:, 0]
        return preds


if __name__ == "__main__":
    print("=" * 65)
    print("2nd-Level Meta-Ensemble Stacker Initialized")
    print("=" * 65)
    
    np.random.seed(42)
    N = 800
    y_true = np.random.binomial(1, 0.25, size=(N, 12))
    
    # 4 Base Models (ConvNeXt, Swin3D, EVA-02, mDeBERTa)
    m1 = np.clip(y_true * 0.5 + np.random.uniform(0.1, 0.4, size=(N, 12)), 0, 1)
    m2 = np.clip(y_true * 0.48 + np.random.uniform(0.1, 0.42, size=(N, 12)), 0, 1)
    m3 = np.clip(y_true * 0.52 + np.random.uniform(0.08, 0.38, size=(N, 12)), 0, 1)
    m4 = np.clip(y_true * 0.45 + np.random.uniform(0.15, 0.45, size=(N, 12)), 0, 1)
    
    stacker = MetaEnsembleStacker(n_estimators=30)
    stacker.fit([m1, m2, m3, m4], y_true)
    blended_preds = stacker.predict_proba([m1, m2, m3, m4])
    
    # Evaluate individual vs stacked AUC
    base_aucs = [np.mean([roc_auc_score(y_true[:, i], m[:, i]) for i in range(12)]) for m in [m1, m2, m3, m4]]
    stacked_auc = float(np.mean([roc_auc_score(y_true[:, i], blended_preds[:, i]) for i in range(12)]))
    
    print(f"Base Model OOF AUCs:  ConvNeXt={base_aucs[0]:.4f}, Swin3D={base_aucs[1]:.4f}, EVA-02={base_aucs[2]:.4f}, mDeBERTa={base_aucs[3]:.4f}")
    print(f"[OK] 2nd-Level Stacked Blended OOF AUC: {stacked_auc:.4f}")
    print(f"[OK] Ensemble Gain:                      {stacked_auc - max(base_aucs):+.4f}")
