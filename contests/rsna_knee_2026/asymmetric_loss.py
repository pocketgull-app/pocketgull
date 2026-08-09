"""
Asymmetric Loss (ASL) for Multi-Label Clinical Imbalance & Specificity Bias
Optimized for RSNA Knee Abnormalities Detection where radiologist adjudication explicitly
graded ambiguous findings as Negative.
"""

import math
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
            """
            Args:
                x: Input logits (N, C)
                y: Targets (N, C) binary labels [0, 1]
            """
            targets = y.to(x.dtype)
            
            # Calculating Probabilities
            x_sigmoid = torch.sigmoid(x)
            xs_pos = x_sigmoid
            xs_neg = 1.0 - x_sigmoid

            # Asymmetric Clipping for Negative Samples
            if self.clip is not None and self.clip > 0:
                xs_neg = (xs_neg + self.clip).clamp(max=1.0)

            # Basic Cross Entropy
            los_pos = targets * torch.log(xs_pos.clamp(min=self.eps))
            los_neg = (1.0 - targets) * torch.log(xs_neg.clamp(min=self.eps))
            loss = los_pos + los_neg

            # Asymmetric Focusing Weights
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


if __name__ == "__main__":
    print("=" * 60)
    print("Asymmetric Loss (ASL) Module Initialized")
    print("=" * 60)
    
    # NumPy CPU Fallback Test
    y_pred_np = np.random.uniform(0.1, 0.9, size=(4, 12))
    y_true_np = np.random.binomial(1, 0.25, size=(4, 12)).astype(float)
    asl_val = numpy_asymmetric_loss(y_pred_np, y_true_np)
    print(f"[OK] NumPy ASL Forward Loss: {asl_val:.4f}")
    
    if HAS_TORCH:
        criterion = AsymmetricLoss(gamma_pos=1.0, gamma_neg=4.0, clip=0.05)
        dummy_logits = torch.randn(4, 12, requires_grad=True)
        dummy_targets = torch.tensor(y_true_np, dtype=torch.float32)
        loss = criterion(dummy_logits, dummy_targets)
        print(f"[OK] PyTorch ASL Loss: {loss.item():.4f}")
    else:
        print("[INFO] PyTorch runtime skipped locally (NumPy ASL active for Windows local testing; PyTorch active on Kaggle Linux GPU containers).")
