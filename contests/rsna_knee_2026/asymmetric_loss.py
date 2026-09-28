"""
Asymmetric Loss (ASL), Clinical Gain & Multi-Faceted Asymmetry Suite
Optimized for RSNA Knee Abnormalities Detection and Clinical Decision Support.

Implements:
1. Asymmetric Loss (ASL, Ridnik et al., ICCV 2021)
2. Asymmetric Clinical Gain Objective & Loss (G_asym)
3. Pinball / Quantile Loss & Multi-Horizon Risk Calibration
4. Expectile Clinical Regression Loss
5. Asymmetric Contrastive Projection & Predictor Head (BYOL/SimSiam style)
6. Contralateral Bilateral Asymmetry Comparator
"""

from __future__ import annotations
import math
from typing import Dict, List, Tuple, Optional, Any, Union
import numpy as np

try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    _dummy = torch.tensor([1.0])
    HAS_TORCH = True
except Exception:
    HAS_TORCH = False
    torch = None
    nn = None
    F = None


# 12 RSNA Knee Target Abnormalities
TARGET_NAMES: List[str] = [
    'ACL', 'MCL', 'Medial Meniscus', 'Lateral Meniscus',
    'Medial OA', 'Lateral OA', 'PF OA',
    'Effusion', 'Synovitis', "Baker's", 'Contusion', 'Fracture'
]

# Clinical Urgency & Severity Weights for Utility Calculation
CLINICAL_SEVERITY_WEIGHTS: Dict[str, float] = {
    'ACL': 5.0,
    'MCL': 3.5,
    'Medial Meniscus': 4.0,
    'Lateral Meniscus': 4.0,
    'Medial OA': 3.0,
    'Lateral OA': 3.0,
    'PF OA': 2.5,
    'Effusion': 2.0,
    'Synovitis': 2.0,
    "Baker's": 1.5,
    'Contusion': 2.5,
    'Fracture': 5.0
}


# =====================================================================
# 1. ASYMMETRIC LOSS (ASL)
# =====================================================================

if HAS_TORCH:

    class AsymmetricLoss(nn.Module):
        """
        Asymmetric Loss for Multi-Label Classification.
        Paper: "Asymmetric Loss For Multi-Label Classification" (Ridnik et al., ICCV 2021)
        """

        def __init__(
            self,
            gamma_pos: float = 1.0,
            gamma_neg: float = 4.0,
            clip: float = 0.05,
            eps: float = 1e-8,
            disable_torch_grad_focal_loss: bool = False,
        ):
            super().__init__()
            self.gamma_pos = gamma_pos
            self.gamma_neg = gamma_neg
            self.clip = clip
            self.eps = eps
            self.disable_torch_grad_focal_loss = disable_torch_grad_focal_loss

        def forward(self, x: torch.Tensor, y: torch.Tensor) -> torch.Tensor:
            targets = y.to(x.dtype)
            x_sigmoid = torch.sigmoid(x)
            xs_pos = x_sigmoid
            xs_neg = 1.0 - x_sigmoid

            if self.clip is not None and self.clip > 0:
                xs_neg = (xs_neg + self.clip).clamp(max=1.0)

            los_pos = targets * torch.log(xs_pos.clamp(min=self.eps))
            los_neg = (1.0 - targets) * torch.log(xs_neg.clamp(min=self.eps))
            loss = los_pos + los_neg

            if self.gamma_pos > 0 or self.gamma_neg > 0:
                if self.disable_torch_grad_focal_loss:
                    torch.set_grad_enabled(False)
                pt0 = xs_pos * targets
                pt1 = xs_neg * (1.0 - targets)
                pt = pt0 + pt1
                one_sided_gamma = self.gamma_pos * targets + self.gamma_neg * (1.0 - targets)
                one_sided_w = torch.pow(1.0 - pt, one_sided_gamma)
                if self.disable_torch_grad_focal_loss:
                    torch.set_grad_enabled(True)
                loss *= one_sided_w

            return -loss.sum()

    class AsymmetricClinicalGainLoss(nn.Module):
        """
        Differentiable Asymmetric Clinical Gain Loss (Surrogate for Net Clinical Utility Maximization).
        Minimizes negative clinical gain across the 12 RSNA knee targets.
        """

        def __init__(
            self,
            weights: Optional[Union[Dict[str, float], List[float]]] = None,
            alpha: float = 1.0,
            lambda_miss: float = 2.0,
            gamma_miss: float = 2.0,
            lambda_fp: float = 1.0,
            gamma_fp: float = 3.0,
            clip: float = 0.05,
            eps: float = 1e-7,
        ):
            super().__init__()
            if weights is None:
                w_list = [CLINICAL_SEVERITY_WEIGHTS[t] for t in TARGET_NAMES]
            elif isinstance(weights, dict):
                w_list = [weights.get(t, 1.0) for t in TARGET_NAMES]
            else:
                w_list = list(weights)

            self.register_buffer('target_weights', torch.tensor(w_list, dtype=torch.float32))
            self.alpha = alpha
            self.lambda_miss = lambda_miss
            self.gamma_miss = gamma_miss
            self.lambda_fp = lambda_fp
            self.gamma_fp = gamma_fp
            self.clip = clip
            self.eps = eps

        def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
            p = torch.sigmoid(logits)
            y = targets.to(p.dtype)
            w = self.target_weights.to(p.device)

            tp_gain = torch.pow(p.clamp(min=self.eps), self.alpha)
            fn_cost = self.lambda_miss * torch.pow((1.0 - p).clamp(min=self.eps), self.gamma_miss)
            pos_utility = y * (tp_gain - fn_cost)

            p_fp_clipped = F.relu(p - self.clip)
            fp_cost = self.lambda_fp * torch.pow(p_fp_clipped, self.gamma_fp)
            neg_utility = - (1.0 - y) * fp_cost

            total_gain_per_target = w * (pos_utility + neg_utility)
            net_gain = total_gain_per_target.sum(dim=-1).mean()
            return -net_gain

    class PinballQuantileLoss(nn.Module):
        """
        Asymmetric Quantile (Pinball) Loss for interval and risk estimation.
        rho_tau(u) = u * (tau - I(u < 0))
        """

        def __init__(self, quantiles: Optional[List[float]] = None):
            super().__init__()
            self.quantiles = quantiles or [0.10, 0.50, 0.90]

        def forward(self, preds: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
            """
            preds: (N, Q, C) or (N, Q) where Q = len(quantiles)
            targets: (N, C) or (N,)
            """
            losses = []
            for i, q in enumerate(self.quantiles):
                if preds.ndim == 3:
                    pred_q = preds[:, i, :]
                    diff = targets - pred_q
                else:
                    pred_q = preds[:, i]
                    diff = targets - pred_q
                loss_q = torch.max((q - 1.0) * diff, q * diff)
                losses.append(loss_q.mean())
            return torch.stack(losses).mean()

    class ExpectileClinicalLoss(nn.Module):
        """
        Asymmetric Expectile Loss: |tau - I(y < y_hat)| * (y - y_hat)^2
        """

        def __init__(self, tau: float = 0.80):
            super().__init__()
            self.tau = tau

        def forward(self, preds: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
            diff = targets - preds
            weight = torch.where(diff > 0, self.tau, 1.0 - self.tau)
            return (weight * torch.square(diff)).mean()

    class AsymmetricProjectionHead(nn.Module):
        """
        Asymmetric Student-Teacher Projector/Predictor Head (SimSiam / BYOL style).
        Online branch passes through Projector + Predictor.
        Target branch passes only through Projector with stop_gradient (detach).
        """

        def __init__(self, in_dim: int = 512, hidden_dim: int = 512, out_dim: int = 128):
            super().__init__()
            self.projector = nn.Sequential(
                nn.Linear(in_dim, hidden_dim, bias=False),
                nn.BatchNorm1d(hidden_dim),
                nn.ReLU(inplace=True),
                nn.Linear(hidden_dim, out_dim, bias=False),
                nn.BatchNorm1d(out_dim, affine=False)
            )
            self.predictor = nn.Sequential(
                nn.Linear(out_dim, hidden_dim // 2, bias=False),
                nn.BatchNorm1d(hidden_dim // 2),
                nn.ReLU(inplace=True),
                nn.Linear(hidden_dim // 2, out_dim)
            )

        def forward_online(self, x: torch.Tensor) -> torch.Tensor:
            z = self.projector(x)
            p = self.predictor(z)
            return p

        def forward_target(self, x: torch.Tensor) -> torch.Tensor:
            with torch.no_grad():
                z = self.projector(x).detach()
            return z

        def asymmetric_cosine_loss(self, p1: torch.Tensor, z2: torch.Tensor) -> torch.Tensor:
            p1_norm = F.normalize(p1, dim=-1, p=2)
            z2_norm = F.normalize(z2.detach(), dim=-1, p=2)
            return 2.0 - 2.0 * (p1_norm * z2_norm).sum(dim=-1).mean()

else:

    class AsymmetricLoss:
        """NumPy fallback Asymmetric Loss wrapper when PyTorch is not available."""
        def __init__(self, gamma_pos=1.0, gamma_neg=4.0, clip=0.05, eps=1e-8):
            self.gamma_pos = gamma_pos
            self.gamma_neg = gamma_neg
            self.clip = clip
            self.eps = eps

        def __call__(self, y_pred, y_true):
            return numpy_asymmetric_loss(
                y_pred, y_true, self.gamma_pos, self.gamma_neg, self.clip, self.eps
            )

    class AsymmetricClinicalGainLoss:
        """NumPy fallback Asymmetric Gain Loss wrapper when PyTorch is not available."""
        def __init__(
            self,
            weights: Optional[Union[Dict[str, float], List[float]]] = None,
            alpha: float = 1.0,
            lambda_miss: float = 2.0,
            gamma_miss: float = 2.0,
            lambda_fp: float = 1.0,
            gamma_fp: float = 3.0,
            clip: float = 0.05,
            eps: float = 1e-7,
        ):
            self.objective = AsymmetricClinicalGainObjective(
                weights=weights,
                alpha=alpha,
                lambda_miss=lambda_miss,
                gamma_miss=gamma_miss,
                lambda_fp=lambda_fp,
                gamma_fp=gamma_fp,
                clip=clip,
                eps=eps,
            )

        def __call__(self, y_pred: np.ndarray, y_true: np.ndarray) -> float:
            net_gain = self.objective.compute_net_gain(y_pred, y_true)
            return -float(net_gain)

    class PinballQuantileLoss:
        """NumPy implementation of Pinball Quantile Loss."""
        def __init__(self, quantiles: Optional[List[float]] = None):
            self.quantiles = quantiles or [0.10, 0.50, 0.90]

        def __call__(self, preds: np.ndarray, targets: np.ndarray) -> float:
            losses = []
            for i, q in enumerate(self.quantiles):
                if preds.ndim == 3:
                    pred_q = preds[:, i, :]
                    diff = targets - pred_q
                else:
                    pred_q = preds[:, i]
                    diff = targets - pred_q
                loss_q = np.maximum((q - 1.0) * diff, q * diff)
                losses.append(np.mean(loss_q))
            return float(np.mean(losses))

    class ExpectileClinicalLoss:
        """NumPy implementation of Expectile Clinical Loss."""
        def __init__(self, tau: float = 0.80):
            self.tau = tau

        def __call__(self, preds: np.ndarray, targets: np.ndarray) -> float:
            diff = targets - preds
            weight = np.where(diff > 0, self.tau, 1.0 - self.tau)
            return float(np.mean(weight * np.square(diff)))


def numpy_asymmetric_loss(
    y_pred: np.ndarray,
    y_true: np.ndarray,
    gamma_pos: float = 1.0,
    gamma_neg: float = 4.0,
    clip: float = 0.05,
    eps: float = 1e-8,
) -> float:
    """NumPy-compatible Asymmetric Loss calculation."""
    p_pos = np.clip(y_pred, eps, 1.0 - eps)
    p_neg = np.clip(1.0 - p_pos + clip, eps, 1.0)
    
    loss_pos = y_true * np.log(p_pos) * ((1.0 - p_pos) ** gamma_pos)
    loss_neg = (1.0 - y_true) * np.log(p_neg) * (p_pos ** gamma_neg)
    
    return float(-np.sum(loss_pos + loss_neg))


# =====================================================================
# 2. ASYMMETRIC CLINICAL GAIN OBJECTIVE (G_asym)
# =====================================================================

class AsymmetricClinicalGainObjective:
    """
    Asymmetric Clinical Gain (G_asym) Decision-Theoretic Objective.
    
    Directly computes expected clinical net utility:
    - High positive reward for detecting actionable pathology (ACL, Fracture, Meniscal tears).
    - Asymmetric penalty for severe false negatives (misses).
    - Suppressed penalty for harmless low-confidence noise via margin clipping (m).
    """

    def __init__(
        self,
        weights: Optional[Union[Dict[str, float], List[float]]] = None,
        alpha: float = 1.0,
        lambda_miss: float = 2.0,
        gamma_miss: float = 2.0,
        lambda_fp: float = 1.0,
        gamma_fp: float = 3.0,
        clip: float = 0.05,
        eps: float = 1e-7,
    ):
        if weights is None:
            self.weights = np.array([CLINICAL_SEVERITY_WEIGHTS[t] for t in TARGET_NAMES], dtype=np.float32)
        elif isinstance(weights, dict):
            self.weights = np.array([weights.get(t, 1.0) for t in TARGET_NAMES], dtype=np.float32)
        else:
            self.weights = np.asarray(weights, dtype=np.float32)

        self.alpha = alpha
        self.lambda_miss = lambda_miss
        self.gamma_miss = gamma_miss
        self.lambda_fp = lambda_fp
        self.gamma_fp = gamma_fp
        self.clip = clip
        self.eps = eps

    def compute_net_gain(
        self,
        y_pred: np.ndarray,
        y_true: np.ndarray
    ) -> float:
        """
        Computes the mean net clinical gain across a dataset/batch.
        y_pred: (N, 12) predicted probabilities in [0, 1]
        y_true: (N, 12) binary ground truth labels in {0, 1}
        """
        gain_matrix = self.compute_target_gain_matrix(y_pred, y_true)
        sample_gains = gain_matrix.sum(axis=-1)
        return float(np.mean(sample_gains))

    def compute_target_gain_matrix(
        self,
        y_pred: np.ndarray,
        y_true: np.ndarray
    ) -> np.ndarray:
        """
        Returns (N, 12) matrix of weighted clinical utility per target per sample.
        """
        p = np.clip(np.asarray(y_pred, dtype=np.float32), self.eps, 1.0 - self.eps)
        y = np.asarray(y_true, dtype=np.float32)
        w = self.weights

        # Positive Utility: TP Gain - Miss Cost
        tp_gain = np.power(p, self.alpha)
        fn_cost = self.lambda_miss * np.power(np.clip(1.0 - p, self.eps, 1.0), self.gamma_miss)
        pos_utility = y * (tp_gain - fn_cost)

        # Negative Utility: FP Cost with Margin Clipping
        p_fp_clipped = np.maximum(p - self.clip, 0.0)
        fp_cost = self.lambda_fp * np.power(p_fp_clipped, self.gamma_fp)
        neg_utility = - (1.0 - y) * fp_cost

        # Weighted Target Gain: (N, 12)
        target_gains = w * (pos_utility + neg_utility)
        return target_gains

    def compute_clinical_utility_report(
        self,
        y_pred: np.ndarray,
        y_true: np.ndarray
    ) -> Dict[str, Any]:
        """
        Produces an in-depth clinical decision audit report.
        """
        p = np.asarray(y_pred, dtype=np.float32)
        y = np.asarray(y_true, dtype=np.float32)
        gain_matrix = self.compute_target_gain_matrix(p, y)
        net_gain = float(np.mean(gain_matrix.sum(axis=-1)))

        oracle_gain_matrix = self.compute_target_gain_matrix(y, y)
        oracle_net_gain = float(np.mean(oracle_gain_matrix.sum(axis=-1)))
        if oracle_net_gain <= 0:
            normalized_ratio = 1.0
        else:
            normalized_ratio = max(0.0, net_gain / oracle_net_gain)

        target_breakdown = {}
        for idx, t_name in enumerate(TARGET_NAMES):
            target_breakdown[t_name] = {
                'weight': float(self.weights[idx]),
                'mean_gain': float(np.mean(gain_matrix[:, idx])),
                'oracle_gain': float(np.mean(oracle_gain_matrix[:, idx])),
            }

        high_stakes_indices = [
            TARGET_NAMES.index('ACL'),
            TARGET_NAMES.index('MCL'),
            TARGET_NAMES.index('Medial Meniscus'),
            TARGET_NAMES.index('Lateral Meniscus'),
            TARGET_NAMES.index('Fracture'),
        ]
        high_stakes_gain = float(np.mean(gain_matrix[:, high_stakes_indices].sum(axis=-1)))

        return {
            'net_clinical_gain': net_gain,
            'oracle_net_gain': oracle_net_gain,
            'clinical_utility_ratio': normalized_ratio,
            'high_stakes_gain': high_stakes_gain,
            'target_breakdown': target_breakdown,
        }


def compute_asymmetric_clinical_gain(
    y_pred: np.ndarray,
    y_true: np.ndarray,
    weights: Optional[Union[Dict[str, float], List[float]]] = None,
    clip: float = 0.05,
) -> float:
    """Convenience function to evaluate net clinical gain in a single call."""
    obj = AsymmetricClinicalGainObjective(weights=weights, clip=clip)
    return obj.compute_net_gain(y_pred, y_true)


# =====================================================================
# 3. CONTRALATERAL BILATERAL ASYMMETRY COMPARATOR
# =====================================================================

class BilateralAsymmetryComparator:
    """
    Computes bilateral (Left vs Right) anatomical & pathological delta metrics:
    - Compartment Joint Space Narrowing (JSN) Asymmetry
    - Subchondral Sclerosis / Meniscal Strain Delta
    - Kinetic Loading Asymmetry Index: (L - R) / ((L + R) / 2 + eps)
    """

    def __init__(self, eps: float = 1e-6):
        self.eps = eps

    def compute_asymmetry_index(self, left_val: float, right_val: float) -> float:
        """Standard bilateral asymmetry index in [-2.0, 2.0]."""
        mean_val = (abs(left_val) + abs(right_val)) / 2.0 + self.eps
        return float((left_val - right_val) / mean_val)

    def evaluate_bilateral_mri_pair(
        self,
        left_predictions: Dict[str, float],
        right_predictions: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Evaluates a paired Left + Right knee prediction dict.
        Returns target-by-target asymmetry index, primary degenerative side, and mechanical load index.
        """
        target_deltas = {}
        for target in TARGET_NAMES:
            l_p = left_predictions.get(target, 0.0)
            r_p = right_predictions.get(target, 0.0)
            idx = self.compute_asymmetry_index(l_p, r_p)
            target_deltas[target] = {
                'left': l_p,
                'right': r_p,
                'delta': l_p - r_p,
                'asymmetry_index': idx
            }

        # Medial & Lateral OA Mechanical Load Imbalance
        med_oa_l = left_predictions.get('Medial OA', 0.0)
        med_oa_r = right_predictions.get('Medial OA', 0.0)
        lat_oa_l = left_predictions.get('Lateral OA', 0.0)
        lat_oa_r = right_predictions.get('Lateral OA', 0.0)

        oa_load_asymmetry = self.compute_asymmetry_index(
            med_oa_l + lat_oa_l,
            med_oa_r + lat_oa_r
        )

        dominant_side = 'Symmetric'
        if oa_load_asymmetry > 0.20:
            dominant_side = 'Left Dominant Degeneration'
        elif oa_load_asymmetry < -0.20:
            dominant_side = 'Right Dominant Degeneration'

        return {
            'dominant_pathology_side': dominant_side,
            'oa_load_asymmetry_index': oa_load_asymmetry,
            'target_deltas': target_deltas
        }


if __name__ == "__main__":
    print("=" * 60)
    print("Asymmetric Loss, Clinical Gain & Bilateral Suite Initialized")
    print("=" * 60)
    
    # NumPy CPU Verification
    y_pred_np = np.random.uniform(0.1, 0.9, size=(4, 12))
    y_true_np = np.random.binomial(1, 0.25, size=(4, 12)).astype(float)
    asl_val = numpy_asymmetric_loss(y_pred_np, y_true_np)
    print(f"[OK] NumPy ASL Forward Loss: {asl_val:.4f}")

    gain_obj = AsymmetricClinicalGainObjective()
    report = gain_obj.compute_clinical_utility_report(y_pred_np, y_true_np)
    print(f"[OK] Net Clinical Gain: {report['net_clinical_gain']:.4f}")
    print(f"[OK] Clinical Utility Ratio: {report['clinical_utility_ratio'] * 100:.2f}%")
    print(f"[OK] High Stakes Sub-Score: {report['high_stakes_gain']:.4f}")

    pinball = PinballQuantileLoss(quantiles=[0.10, 0.50, 0.90])
    q_preds = np.stack([y_pred_np * 0.8, y_pred_np, y_pred_np * 1.2], axis=1)
    q_loss = pinball(q_preds, y_true_np)
    print(f"[OK] Pinball Quantile Loss (10%, 50%, 90%): {q_loss:.4f}")

    expectile = ExpectileClinicalLoss(tau=0.85)
    exp_loss = expectile(y_pred_np, y_true_np)
    print(f"[OK] Expectile Clinical Loss (tau=0.85): {exp_loss:.4f}")

    bilateral = BilateralAsymmetryComparator()
    l_dict = {t: float(y_pred_np[0, i]) for i, t in enumerate(TARGET_NAMES)}
    r_dict = {t: float(y_pred_np[1, i]) for i, t in enumerate(TARGET_NAMES)}
    b_report = bilateral.evaluate_bilateral_mri_pair(l_dict, r_dict)
    print(f"[OK] Bilateral Asymmetry Evaluation: {b_report['dominant_pathology_side']} (Index: {b_report['oa_load_asymmetry_index']:.4f})")
    
    if HAS_TORCH:
        criterion = AsymmetricLoss(gamma_pos=1.0, gamma_neg=4.0, clip=0.05)
        gain_loss = AsymmetricClinicalGainLoss()
        dummy_logits = torch.randn(4, 12, requires_grad=True)
        dummy_targets = torch.tensor(y_true_np, dtype=torch.float32)
        loss = criterion(dummy_logits, dummy_targets)
        g_loss = gain_loss(dummy_logits, dummy_targets)
        proj_head = AsymmetricProjectionHead(in_dim=12, hidden_dim=32, out_dim=16)
        p_online = proj_head.forward_online(dummy_logits)
        z_target = proj_head.forward_target(dummy_logits)
        byol_loss = proj_head.asymmetric_cosine_loss(p_online, z_target)
        print(f"[OK] PyTorch ASL Loss: {loss.item():.4f}")
        print(f"[OK] PyTorch Gain Loss (Surrogate): {g_loss.item():.4f}")
        print(f"[OK] PyTorch Asymmetric Contrastive BYOL Loss: {byol_loss.item():.4f}")
    else:
        print("[INFO] PyTorch runtime skipped locally (NumPy ASL active for Windows local testing; PyTorch active on Kaggle Linux GPU containers).")
