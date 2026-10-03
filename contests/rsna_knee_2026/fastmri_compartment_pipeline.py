"""
RSNA Knee 2026 — MONAI Anatomical Compartment Cropper + FastMRI-MAE Pipeline
Author: PocketGull Clinical Intelligence Architecture

Couples the MSD-inspired AnatomicalCompartmentCropper with the in-domain
FastMRI Knee-MAE backbone:
1. Decomposes knee MRI slabs into 4 functional anatomical compartments:
   - Medial Compartment (Medial Meniscus, Medial OA)
   - Lateral Compartment (Lateral Meniscus, Lateral OA)
   - Patellofemoral Compartment (PF OA)
   - Cruciate / Central Compartment (ACL, MCL, Effusion, Synovitis, Baker's, Contusion, Fracture)
2. Normalizes crops using MONAI robust non-zero percentile scaling (1% - 99%).
3. Maps localized anatomical representations to target-specific heads via a
   Biomechanical Compartment Routing Matrix.
4. Fuses localized predictions with global multi-instance learning (MIL) predictions.
"""

from __future__ import annotations
import math
import numpy as np
from typing import Dict, List, Tuple, Optional, Any
from pathlib import Path

from monai_spatial_engine import (
    robust_percentile_norm,
    AnatomicalCompartmentCropper,
    FullBoundaryStratifiedSampler
)

# 12 RSNA Knee Target Abnormalities
TARGET_NAMES = [
    'ACL', 'MCL', 'Medial Meniscus', 'Lateral Meniscus',
    'Medial OA', 'Lateral OA', 'PF OA',
    'Effusion', 'Synovitis', "Baker's", 'Contusion', 'Fracture'
]

COMPARTMENT_NAMES = ['medial', 'lateral', 'cruciate', 'patellofemoral', 'popliteal_perimeter']

# Anatomical association mapping
COMPARTMENT_PRIMARY_TARGETS: Dict[str, List[str]] = {
    'medial': ['Medial Meniscus', 'Medial OA'],
    'lateral': ['Lateral Meniscus', 'Lateral OA'],
    'patellofemoral': ['PF OA'],
    'cruciate': ['ACL', 'MCL', 'Effusion', 'Synovitis', 'Contusion', 'Fracture'],
    'popliteal_perimeter': ["Baker's", 'Effusion', 'Synovitis']
}


class BiomechanicalRoutingMatrix:
    """
    Constructs an anatomically grounded routing matrix M in R^{12 x 5}
    that projects 5 compartment feature vectors (including the full popliteal
    and peripheral subchondral perimeter) to the 12 target abnormalities.
    """

    def __init__(self):
        # Columns correspond to: ['medial', 'lateral', 'cruciate', 'patellofemoral', 'popliteal_perimeter']
        self.matrix = np.zeros((len(TARGET_NAMES), len(COMPARTMENT_NAMES)), dtype=np.float32)
        
        # Primary anatomical associations
        self._set_weight('ACL', 'cruciate', 1.0)
        self._set_weight('MCL', 'cruciate', 0.65)
        self._set_weight('MCL', 'medial', 0.35)
        
        self._set_weight('Medial Meniscus', 'medial', 0.85)
        self._set_weight('Medial Meniscus', 'cruciate', 0.15)
        
        self._set_weight('Lateral Meniscus', 'lateral', 0.85)
        self._set_weight('Lateral Meniscus', 'cruciate', 0.15)
        
        self._set_weight('Medial OA', 'medial', 0.85)
        self._set_weight('Medial OA', 'cruciate', 0.15)
        
        self._set_weight('Lateral OA', 'lateral', 0.85)
        self._set_weight('Lateral OA', 'cruciate', 0.15)
        
        self._set_weight('PF OA', 'patellofemoral', 0.85)
        self._set_weight('PF OA', 'cruciate', 0.15)
        
        self._set_weight('Effusion', 'cruciate', 0.50)
        self._set_weight('Effusion', 'patellofemoral', 0.30)
        self._set_weight('Effusion', 'popliteal_perimeter', 0.20)
        
        self._set_weight('Synovitis', 'cruciate', 0.55)
        self._set_weight('Synovitis', 'patellofemoral', 0.25)
        self._set_weight('Synovitis', 'popliteal_perimeter', 0.20)
        
        self._set_weight("Baker's", 'popliteal_perimeter', 0.85)
        self._set_weight("Baker's", 'cruciate', 0.10)
        self._set_weight("Baker's", 'medial', 0.05)
        
        self._set_weight('Contusion', 'cruciate', 0.35)
        self._set_weight('Contusion', 'medial', 0.25)
        self._set_weight('Contusion', 'lateral', 0.25)
        self._set_weight('Contusion', 'popliteal_perimeter', 0.15)
        
        self._set_weight('Fracture', 'cruciate', 0.20)
        self._set_weight('Fracture', 'medial', 0.25)
        self._set_weight('Fracture', 'lateral', 0.25)
        self._set_weight('Fracture', 'patellofemoral', 0.15)
        self._set_weight('Fracture', 'popliteal_perimeter', 0.15)

        # Normalize rows to sum to 1.0
        row_sums = self.matrix.sum(axis=1, keepdims=True)
        row_sums[row_sums == 0] = 1.0
        self.matrix = self.matrix / row_sums

    def _set_weight(self, target: str, compartment: str, weight: float):
        t_idx = TARGET_NAMES.index(target)
        c_idx = COMPARTMENT_NAMES.index(compartment)
        self.matrix[t_idx, c_idx] = weight

    def get_routing_matrix(self) -> np.ndarray:
        return self.matrix.copy()

    def route_compartment_scores(self, compartment_scores: Dict[str, np.ndarray]) -> np.ndarray:
        """
        Projects compartment scores (each shape (B,) or scalar) into 12-target scores (B, 12).
        """
        vectors = []
        for c_name in COMPARTMENT_NAMES:
            val = compartment_scores.get(c_name, 0.0)
            if np.isscalar(val):
                vectors.append(np.array([val], dtype=np.float32))
            else:
                vectors.append(np.asarray(val, dtype=np.float32).flatten())

        # Shape: (4, B)
        c_mat = np.stack(vectors, axis=0)
        # (12, 4) @ (4, B) -> (12, B) -> transpose to (B, 12)
        routed = np.matmul(self.matrix, c_mat).T
        return routed


class CompartmentAwareFastMRIPipeline:
    """
    End-to-end inference & feature extraction pipeline coupling
    MONAI AnatomicalCompartmentCropper with FastMRI-MAE representations.
    """

    def __init__(
        self,
        cropper: Optional[AnatomicalCompartmentCropper] = None,
        routing: Optional[BiomechanicalRoutingMatrix] = None,
        target_crop_hw: Tuple[int, int] = (224, 224)
    ):
        self.cropper = cropper or AnatomicalCompartmentCropper()
        self.routing = routing or BiomechanicalRoutingMatrix()
        self.target_crop_hw = target_crop_hw

    def preprocess_and_crop_slab(
        self,
        slab: np.ndarray,
        plane: str = 'Coronal',
        laterality: str = 'L'
    ) -> Dict[str, np.ndarray]:
        """
        Standardizes raw MRI slab, extracts 4 anatomical compartments,
        and resizes each crop to standard target_crop_hw.
        """
        # Step 1: MONAI 1%-99% Non-Zero Percentile Normalization
        normed = robust_percentile_norm(slab, lower_pct=1.0, upper_pct=99.0, nonzero=True)

        # Step 2: Anatomical Compartment Decomposition
        raw_crops = self.cropper.extract_compartments_from_slab(
            normed, plane=plane, laterality=laterality
        )

        # Step 3: Resample each compartment crop to target_crop_hw
        standardized_crops = {}
        for c_name, patch in raw_crops.items():
            standardized_crops[c_name] = self._resize_patch(patch, self.target_crop_hw)

        return standardized_crops

    def _resize_patch(self, patch: np.ndarray, target_hw: Tuple[int, int]) -> np.ndarray:
        """Resizes (C, H, W) or (H, W) array using bilinear interpolation."""
        target_h, target_w = target_hw
        is_3d = (patch.ndim == 3)
        channels = patch.shape[0] if is_3d else 1
        h, w = patch.shape[-2:]

        if h == target_h and w == target_w:
            return patch.copy()

        # Grid coordinate sampling
        y_indices = np.linspace(0, h - 1, target_h).astype(np.float32)
        x_indices = np.linspace(0, w - 1, target_w).astype(np.float32)

        y0 = np.floor(y_indices).astype(int)
        y1 = np.clip(y0 + 1, 0, h - 1)
        x0 = np.floor(x_indices).astype(int)
        x1 = np.clip(x0 + 1, 0, w - 1)

        wa = (x1 - x_indices)[None, :] * (y1 - y_indices)[:, None]
        wb = (x_indices - x0)[None, :] * (y1 - y_indices)[:, None]
        wc = (x1 - x_indices)[None, :] * (y_indices - y0)[:, None]
        wd = (x_indices - x0)[None, :] * (y_indices - y0)[:, None]

        if is_3d:
            resampled = np.zeros((channels, target_h, target_w), dtype=np.float32)
            for c in range(channels):
                p = patch[c]
                resampled[c] = (
                    p[y0[:, None], x0] * wa +
                    p[y0[:, None], x1] * wb +
                    p[y1[:, None], x0] * wc +
                    p[y1[:, None], x1] * wd
                )
            return resampled
        else:
            return (
                patch[y0[:, None], x0] * wa +
                patch[y0[:, None], x1] * wb +
                patch[y1[:, None], x0] * wc +
                patch[y1[:, None], x1] * wd
            ).astype(np.float32)

    def blend_compartment_with_global_predictions(
        self,
        global_preds: np.ndarray,
        compartment_preds: Dict[str, np.ndarray],
        compartment_weight: float = 0.20
    ) -> np.ndarray:
        """
        Fuses global MIL predictions with routed localized compartment predictions.
        global_preds shape: (B, 12) or (12,)
        """
        routed_compartment = self.routing.route_compartment_scores(compartment_preds)
        
        # Ensure 2D shapes
        g_arr = np.asarray(global_preds, dtype=np.float32)
        single_sample = (g_arr.ndim == 1)
        if single_sample:
            g_arr = g_arr[None, :]

        # Target-specific compartment confidence gating
        # Medial & Lateral compartments have high local specificity (up to 30% weight)
        target_alphas = np.full(len(TARGET_NAMES), compartment_weight, dtype=np.float32)
        
        # High specificity targets benefit more from compartment crops
        for high_local_target in ['Medial Meniscus', 'Lateral Meniscus', 'Medial OA', 'Lateral OA']:
            idx = TARGET_NAMES.index(high_local_target)
            target_alphas[idx] = min(0.35, compartment_weight * 1.5)

        # Convex combination
        fused = (1.0 - target_alphas) * g_arr + target_alphas * routed_compartment
        fused = np.clip(fused, 0.001, 0.999)

        if single_sample:
            return fused[0]
        return fused
