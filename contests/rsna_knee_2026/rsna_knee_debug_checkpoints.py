import os
import torch
import numpy as np
import pandas as pd
import torch.nn as nn
import torch.nn.functional as F
import torchvision
import pydicom

TARGET_COLS = [
    'ACL', 'MCL', 'Medial Meniscus', 'Lateral Meniscus',
    'Medial OA', 'Lateral OA', 'PF OA', 'Effusion',
    'Synovitis', "Baker's", 'Contusion', 'Fracture'
]

# Model definitions (must match exactly)
class SliceAttentionPool(nn.Module):
    def __init__(self, embed_dim: int = 512):
        super().__init__()
        self.attn = nn.Sequential(
            nn.Linear(embed_dim, 128),
            nn.Tanh(),
            nn.Linear(128, 1)
        )
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        weights = self.attn(x)
        weights = F.softmax(weights, dim=1)
        return torch.sum(x * weights, dim=1)

class MILKneeNet(nn.Module):
    def __init__(self, num_targets: int = 12, backbone_name: str = 'resnet18'):
        super().__init__()
        self.num_targets = num_targets
        base_model = torchvision.models.resnet18(pretrained=False)
        self.feature_dim = 512
        self.backbone = nn.Sequential(*list(base_model.children())[:-1])
        self.sag_pool = SliceAttentionPool(self.feature_dim)
        self.cor_pool = SliceAttentionPool(self.feature_dim)
        self.ax_pool = SliceAttentionPool(self.feature_dim)
        self.classifier = nn.Sequential(
            nn.Linear(self.feature_dim * 3, 256),
            nn.GELU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_targets)
        )
    def extract_features(self, x: torch.Tensor) -> torch.Tensor:
        B, S, C, H, W = x.shape
        x_flat = x.view(B * S, C, H, W)
        feats = self.backbone(x_flat)
        return feats.view(B, S, -1)
    def forward(self, sag: torch.Tensor, cor: torch.Tensor, ax: torch.Tensor) -> torch.Tensor:
        sag_feats = self.extract_features(sag)
        cor_feats = self.extract_features(cor)
        ax_feats = self.extract_features(ax)
        sag_p = self.sag_pool(sag_feats)
        cor_p = self.cor_pool(cor_feats)
        ax_p = self.ax_pool(ax_feats)
        merged = torch.cat([sag_p, cor_p, ax_p], dim=-1)
        return self.classifier(merged)

def check_checkpoints():
    print("=" * 65)
    print("Kaggle Training Checkpoints Debugger")
    print("=" * 65)
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # 1. Check weights files exist
    checkpoint_files = [f"model_fold_{i}.pth" for i in range(5)]
    for f in checkpoint_files:
        exists = os.path.exists(f)
        size_mb = os.path.getsize(f) / (1024 * 1024) if exists else 0
        print(f"Checkpoint {f}: Exists={exists}, Size={size_mb:.2f} MB")
        
    # Load first fold model
    fold0_path = "model_fold_0.pth"
    if not os.path.exists(fold0_path):
        print(f"[ERROR] {fold0_path} not found in working directory.")
        return
        
    model = MILKneeNet().to(device)
    try:
        model.load_state_dict(torch.load(fold0_path, map_location=device))
        print(f"[SUCCESS] Loaded {fold0_path} state dict.")
    except Exception as e:
        print(f"[ERROR] Failed to load state dict: {e}")
        return
        
    # Check classifier weights to see if they are all identical or zero
    print("\n--- Classifier Weights Inspection ---")
    fc_weights = model.classifier[-1].weight.data.cpu().numpy()
    fc_bias = model.classifier[-1].bias.data.cpu().numpy()
    
    print(f"Classifier weights shape: {fc_weights.shape}")
    print(f"Classifier weights std: {fc_weights.std():.6f}")
    print(f"Classifier weights mean: {fc_weights.mean():.6f}")
    print(f"Classifier bias: {fc_bias}")
    
    # Check if weights have non-zero variance
    if fc_weights.std() < 1e-7:
        print("[WARN] Classifier weights have near-zero variance! Model may not have trained properly.")
    else:
        print("[OK] Classifier weights show normal variation.")

    # 2. Run dummy inference to check output variance
    print("\n--- Dummy Inference Check ---")
    dummy_sag = torch.randn(2, 16, 3, 256, 256).to(device)
    dummy_cor = torch.randn(2, 16, 3, 256, 256).to(device)
    dummy_ax = torch.randn(2, 16, 3, 256, 256).to(device)
    
    model.eval()
    with torch.no_grad():
        logits = model(dummy_sag, dummy_cor, dummy_ax)
        probs = torch.sigmoid(logits).cpu().numpy()
        
    print(f"Dummy predictions shape: {probs.shape}")
    print("Dummy predictions (Sample 0):")
    for name, p in zip(TARGET_COLS, probs[0]):
        print(f"  - {name:<18}: {p:.4f}")
    print("Dummy predictions (Sample 1):")
    for name, p in zip(TARGET_COLS, probs[1]):
        print(f"  - {name:<18}: {p:.4f}")
        
    diff = np.abs(probs[0] - probs[1]).max()
    print(f"Max absolute difference between dummy samples: {diff:.6f}")
    if diff < 1e-5:
        print("[WARN] Model outputs identical predictions for different inputs! Predictions are constant.")
    else:
        print("[OK] Model outputs vary across inputs.")

if __name__ == '__main__':
    check_checkpoints()
