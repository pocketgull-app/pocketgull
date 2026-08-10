"""
RSNA Knee Abnormalities Detection — Multimodal PyTorch & Sklearn Model Architecture
Supports PyTorch MultimodalKneeNet for deep learning volume feature extraction
and Sklearn MultiOutputClassifier for fast local CPU baseline training.
"""

import math
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional, Any
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.multioutput import MultiOutputClassifier

try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    # Check if DLLs load cleanly
    _dummy = torch.tensor([1.0])
    HAS_TORCH = True
except Exception:
    HAS_TORCH = False
    torch = None
    nn = None
    F = None

# Competition Target Labels
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


class SklearnMultimodalBaseline:
    """Fast scikit-learn MultiOutput Gradient Boosting baseline for CPU training."""

    def __init__(self, n_estimators: int = 100):
        self.model = MultiOutputClassifier(
            HistGradientBoostingClassifier(max_iter=n_estimators, random_state=42)
        )

    def fit(self, X: np.ndarray, Y: np.ndarray):
        """Fits multi-output gradient boosted decision trees for 12 targets.
        
        Args:
            X: (N, Features) Extracted image & text features.
            Y: (N, 12) Ground truth binary target matrix.
        """
        self.model.fit(X, Y)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Predicts per-target probabilities.
        
        Args:
            X: (N, Features)
        Returns:
            (N, 12) Probability matrix.
        """
        probas_list = self.model.predict_proba(X)
        preds = np.zeros((X.shape[0], len(TARGET_COLS)))
        for i, p in enumerate(probas_list):
            if p.shape[1] > 1:
                preds[:, i] = p[:, 1]
            else:
                preds[:, i] = p[:, 0]
        return preds


if HAS_TORCH:

    class SliceAttentionPooling(nn.Module):
        """Attention pooling across multi-plane DICOM slice sequences (Sagittal, Coronal, Axial)."""

        def __init__(self, embed_dim: int = 512):
            super().__init__()
            self.attn = nn.Sequential(
                nn.Linear(embed_dim, 128),
                nn.Tanh(),
                nn.Linear(128, 1),
            )

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            attn_weights = self.attn(x)
            attn_weights = F.softmax(attn_weights, dim=1)
            pooled = torch.sum(x * attn_weights, dim=1)
            return pooled

    class GatedCrossAttentionFusion(nn.Module):
        """Gated Cross-Attention module fusing visual volume features and radiology text features."""

        def __init__(self, vision_dim: int = 512, text_dim: int = 512, hidden_dim: int = 512):
            super().__init__()
            self.proj_v = nn.Linear(vision_dim, hidden_dim)
            self.proj_t = nn.Linear(text_dim, hidden_dim)

            self.cross_attn = nn.MultiheadAttention(embed_dim=hidden_dim, num_heads=8, batch_first=True)
            self.gate = nn.Sequential(
                nn.Linear(hidden_dim * 2, hidden_dim),
                nn.Sigmoid(),
            )
            self.norm = nn.LayerNorm(hidden_dim)

        def forward(self, v_feat: torch.Tensor, t_feat: torch.Tensor) -> torch.Tensor:
            v_proj = self.proj_v(v_feat).unsqueeze(1)
            t_proj = self.proj_t(t_feat).unsqueeze(1)

            attn_out, _ = self.cross_attn(v_proj, t_proj, t_proj)
            attn_out = attn_out.squeeze(1)
            v_flat = v_proj.squeeze(1)

            gate_val = self.gate(torch.cat([v_flat, attn_out], dim=-1))
            fused = gate_val * v_flat + (1.0 - gate_val) * attn_out
            return self.norm(fused)

    class MultimodalKneeNet(nn.Module):
        """Full Multimodal PyTorch Architecture for 12 Knee Abnormality Targets."""

        def __init__(self, num_targets: int = 12, feature_dim: int = 512):
            super().__init__()
            self.num_targets = num_targets

            self.sagittal_pool = SliceAttentionPooling(feature_dim)
            self.coronal_pool = SliceAttentionPooling(feature_dim)
            self.axial_pool = SliceAttentionPooling(feature_dim)

            self.vision_fc = nn.Sequential(
                nn.Linear(feature_dim * 3, feature_dim),
                nn.BatchNorm1d(feature_dim),
                nn.GELU(),
                nn.Dropout(0.3),
            )

            self.text_fc = nn.Sequential(
                nn.Linear(768, feature_dim),
                nn.BatchNorm1d(feature_dim),
                nn.GELU(),
                nn.Dropout(0.2),
            )

            self.fusion = GatedCrossAttentionFusion(feature_dim, feature_dim, feature_dim)

            self.classifier = nn.Sequential(
                nn.Linear(feature_dim, 256),
                nn.GELU(),
                nn.Dropout(0.2),
                nn.Linear(256, num_targets),
            )

        def forward(
            self,
            sag_slices: torch.Tensor,
            cor_slices: torch.Tensor,
            ax_slices: torch.Tensor,
            text_embed: torch.Tensor,
        ) -> torch.Tensor:
            sag_feat = self.sagittal_pool(sag_slices)
            cor_feat = self.coronal_pool(cor_slices)
            ax_feat = self.axial_pool(ax_slices)

            v_concat = torch.cat([sag_feat, cor_feat, ax_feat], dim=-1)
            v_embed = self.vision_fc(v_concat)

            t_embed = self.text_fc(text_embed)
            fused_feat = self.fusion(v_embed, t_embed)

            logits = self.classifier(fused_feat)
            return logits


if __name__ == "__main__":
    print("=" * 60)
    print("RSNA Knee Multimodal Model Suite Initialized")
    print("=" * 60)
    
    # Sklearn Gradient Boosting Baseline Test
    np.random.seed(42)
    X_dummy = np.random.randn(100, 64)
    Y_dummy = np.random.binomial(1, 0.25, size=(100, 12))
    
    sk_model = SklearnMultimodalBaseline(n_estimators=10)
    sk_model.fit(X_dummy, Y_dummy)
    preds = sk_model.predict_proba(X_dummy)
    print(f"[OK] Sklearn MultiOutput Model Trained Successfully! Output Shape: {preds.shape}")
    print(f"Sample Prediction Probabilities [Sample 0]:")
    for name, p in zip(TARGET_COLS, preds[0]):
        print(f"  - {name:<18}: {p:.4f}")
        
    if HAS_TORCH:
        print("\n[OK] PyTorch MultimodalKneeNet active and available.")
    else:
        print("\n[INFO] PyTorch runtime skipped locally (Sklearn CPU fallback active for Windows local baseline; PyTorch active on Kaggle Linux GPU containers).")
