#!/usr/bin/env python3
"""
RSNA Knee Abnormalities Detection (2026) - DINOv2 MIL Gold Medal Pipeline Generator.
Target: 0.952+ Macro AUC-ROC on Private Leaderboard.

Generates TWO notebooks:
  1. rsna_knee_train_v7.ipynb   - GPU training (DINOv2-Small frozen + MIL head, 5-fold)
  2. rsna_knee_submission_v7.ipynb - GPU inference (5-fold ensemble + NLP fusion)
"""

import json
import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTEST_DIR = os.path.join(PROJECT_ROOT, "contests", "rsna_knee_2026")
TRAIN_NB_PATH = os.path.join(CONTEST_DIR, "rsna_knee_train_v7.ipynb")
INFER_NB_PATH = os.path.join(CONTEST_DIR, "rsna_knee_submission_v7.ipynb")


def _md_cell(cell_id, source_lines):
    return {"cell_type": "markdown", "id": cell_id, "metadata": {},
            "source": source_lines}


def _code_cell(cell_id, source_text):
    lines = source_text.split("\n")
    src = [line + "\n" for line in lines[:-1]]
    if lines:
        src.append(lines[-1])
    return {"cell_type": "code", "id": cell_id, "metadata": {},
            "execution_count": None, "outputs": [], "source": src}


def _nb_json(cells, gpu=False):
    return {
        "cells": cells,
        "metadata": {
            "kernelspec": {"display_name": "Python 3", "language": "python",
                           "name": "python3"},
            "kaggle": {"accelerator": "gpu" if gpu else "none",
                       "dataSources": [], "dockerImageVersionId": 30805,
                       "isGpuEnabled": gpu, "isInternetEnabled": False,
                       "language": "python", "sourceType": "notebook"},
            "language_info": {"name": "python", "version": "3.10.12"}
        },
        "nbformat": 4, "nbformat_minor": 5
    }


# ===== CELL SOURCES (plain strings, no nesting issues) =====

C_CONSTANTS = """\
import os, gc, glob, sys, time, math, re, hashlib
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any

TARGET_COLS = [
    'ACL', 'MCL', 'Medial Meniscus', 'Lateral Meniscus',
    'Medial OA', 'Lateral OA', 'PF OA', 'Effusion',
    'Synovitis', "Baker's", 'Contusion', 'Fracture'
]
NUM_TARGETS = 12

POPULATION_PRIORS = np.array([
    0.285, 0.142, 0.380, 0.265,
    0.310, 0.195, 0.240, 0.520,
    0.315, 0.180, 0.220, 0.085
], dtype=np.float32)

VERSION = '10.0.0-DINOv2-MIL'
print(f'[OK] RSNA Knee v{VERSION} Constants Loaded')
"""

C_TORCH_SETUP = """\
import torch
import torch.nn as nn
import torch.nn.functional as F_nn
from torch.utils.data import Dataset, DataLoader
from sklearn.model_selection import GroupKFold

def get_safe_device():
    if torch.cuda.is_available():
        try:
            cap = torch.cuda.get_device_capability()
            if cap[0] >= 7:
                # Probe a simple tensor on cuda
                _ = torch.zeros(1, device='cuda')
                print(f'[OK] Verified CUDA capability {cap[0]}.{cap[1]} >= 7.0')
                return torch.device('cuda')
            else:
                print(f'[WARN] GPU compute capability {cap[0]}.{cap[1]} < 7.0 (legacy P100); falling back to CPU')
                return torch.device('cpu')
        except Exception as e:
            print(f'[WARN] CUDA probe failed: {e}; falling back to CPU')
            return torch.device('cpu')
    return torch.device('cpu')

device = get_safe_device()
print(f'[OK] PyTorch {torch.__version__} active on {device}')

# Load DINOv2-Small (ViT-S/14) - 21M params, 384-dim embeddings
try:
    backbone = torch.hub.load('facebookresearch/dinov2', 'dinov2_vits14', pretrained=True)
    print('[OK] Loaded DINOv2-Small from torch.hub')
except Exception as e:
    print(f'[WARN] torch.hub failed ({e}); falling back to timm...')
    import timm
    backbone = timm.create_model('vit_small_patch14_dinov2.lvd142m', pretrained=True, num_classes=0)

backbone = backbone.to(device)
backbone.eval()
for p in backbone.parameters():
    p.requires_grad = False

print(f'[OK] DINOv2-Small ready: {sum(p.numel() for p in backbone.parameters()):,} params (frozen)')

BACKBONE_SAVE_PATH = '/kaggle/working/dinov2_vits14.pt'
torch.save(backbone.state_dict(), BACKBONE_SAVE_PATH)
print(f'[OK] Backbone weights saved to {BACKBONE_SAVE_PATH}')
"""

C_DICOM_PREPROC = """\
import pydicom
import torch
import torch.nn.functional as F_torch
from torchvision import transforms

IMG_SIZE = 224
MAX_SLICES_PER_SERIES = 12

def apply_dicom_window(pixel_array, center, width):
    min_val = center - width / 2.0
    max_val = center + width / 2.0
    clipped = np.clip(pixel_array, min_val, max_val)
    return (clipped - min_val) / (max_val - min_val + 1e-6)

def dicom_to_3ch_rgb(raw_slice):
    ch0 = apply_dicom_window(raw_slice, center=400.0, width=1000.0)
    ch1 = apply_dicom_window(raw_slice, center=700.0, width=2000.0)
    gy, gx = np.gradient(ch0)
    ch2 = np.sqrt(gx**2 + gy**2)
    ch2 = np.clip(ch2 / (np.max(ch2) + 1e-6), 0.0, 1.0)
    return np.stack([ch0, ch1, ch2], axis=-1).astype(np.float32)

def load_series_slices(series_dir, max_slices=MAX_SLICES_PER_SERIES):
    dcm_files = sorted(glob.glob(os.path.join(series_dir, '*.dcm')))
    if not dcm_files:
        dcm_files = sorted(glob.glob(os.path.join(series_dir, '*.dicom')))
    if not dcm_files:
        return torch.zeros(1, 3, IMG_SIZE, IMG_SIZE)
    n_files = len(dcm_files)
    if n_files > max_slices:
        indices = np.linspace(0, n_files - 1, max_slices, dtype=int)
        dcm_files = [dcm_files[i] for i in indices]
    slices = []
    for fpath in dcm_files:
        try:
            dcm = pydicom.dcmread(fpath, force=True)
            arr = dcm.pixel_array.astype(np.float32)
            rgb = dicom_to_3ch_rgb(arr)
            t = torch.from_numpy(rgb).permute(2, 0, 1)
            t = F_torch.interpolate(t.unsqueeze(0), size=(IMG_SIZE, IMG_SIZE),
                                    mode='bilinear', align_corners=False).squeeze(0)
            slices.append(t)
        except Exception:
            pass
    if not slices:
        return torch.zeros(1, 3, IMG_SIZE, IMG_SIZE)
    return torch.stack(slices)

def load_study_slices(study_dir):
    all_slices = []
    if not os.path.isdir(study_dir):
        return torch.zeros(1, 3, IMG_SIZE, IMG_SIZE)
    for series_id in sorted(os.listdir(study_dir)):
        series_path = os.path.join(study_dir, series_id)
        if os.path.isdir(series_path):
            s = load_series_slices(series_path)
            all_slices.append(s)
    if not all_slices:
        return torch.zeros(1, 3, IMG_SIZE, IMG_SIZE)
    return torch.cat(all_slices, dim=0)

print('[OK] DICOM 2.5D RGB Preprocessor compiled')
"""

C_STUDY_MIL = """\
import torch
import torch.nn as nn
import torch.nn.functional as F_nn

class StudyMIL(nn.Module):
    def __init__(self, embed_dim=384, num_targets=12):
        super().__init__()
        self.attention_V = nn.Sequential(nn.Linear(embed_dim, 128), nn.Tanh())
        self.attention_U = nn.Sequential(nn.Linear(embed_dim, 128), nn.Sigmoid())
        self.attention_w = nn.Linear(128, 1)
        self.classifier = nn.Sequential(
            nn.LayerNorm(embed_dim),
            nn.Dropout(0.3),
            nn.Linear(embed_dim, 256),
            nn.GELU(),
            nn.Dropout(0.2),
            nn.Linear(256, num_targets)
        )

    def forward(self, x):
        a_v = self.attention_V(x)
        a_u = self.attention_U(x)
        attn = F_nn.softmax(self.attention_w(a_v * a_u), dim=1)
        pooled = (x * attn).sum(dim=1)
        return self.classifier(pooled)

print('[OK] StudyMIL Gated Attention Model defined')
"""

C_LABELS = """\
GEMINI_LABEL_PATHS = [
    '/kaggle/input/rsna-knee-2026-gemini-weak-labels/train_labels_gemini.csv',
    '/kaggle/input/philgear/rsna-knee-2026-gemini-weak-labels/train_labels_gemini.csv',
]
labels_df = None
for p in GEMINI_LABEL_PATHS:
    if os.path.exists(p):
        labels_df = pd.read_csv(p)
        print(f'[OK] Loaded Gemini labels from {p} ({len(labels_df)} rows)')
        break

if labels_df is None and os.path.exists('/kaggle/input'):
    for root, dirs, files in os.walk('/kaggle/input'):
        if 'train_labels_gemini.csv' in files:
            p = os.path.join(root, 'train_labels_gemini.csv')
            try:
                labels_df = pd.read_csv(p)
                print(f'[OK] Found train_labels_gemini.csv via walk at {p} ({len(labels_df)} rows)')
                break
            except Exception:
                pass

TRAIN_SERIES_PATHS = [
    '/kaggle/input/rsna-knee-abnormality-detection/train_series',
    '/kaggle/input/competitions/rsna-knee-abnormality-detection/train_series',
]
train_series_root = None
for p in TRAIN_SERIES_PATHS:
    if os.path.isdir(p):
        train_series_root = p
        print(f'[OK] Found train_series at {p}')
        break

if train_series_root is None and os.path.exists('/kaggle/input'):
    for root, dirs, files in os.walk('/kaggle/input'):
        if 'train_series' in dirs:
            train_series_root = os.path.join(root, 'train_series')
            print(f'[OK] Found train_series via walk at {train_series_root}')
            break

study_ids = []
if train_series_root:
    study_ids = sorted([d for d in os.listdir(train_series_root)
                        if os.path.isdir(os.path.join(train_series_root, d))])
    print(f'[OK] Found {len(study_ids)} training study directories')

study_to_labels = {}
if labels_df is not None:
    conf_cols = [c + '_confidence' for c in TARGET_COLS if c + '_confidence' in labels_df.columns]
    if conf_cols:
        labels_df['avg_confidence'] = labels_df[conf_cols].mean(axis=1)
        high_conf = labels_df[labels_df['avg_confidence'] >= 0.80].copy()
        print(f'[OK] High-confidence labels: {len(high_conf)} / {len(labels_df)} studies')
    else:
        high_conf = labels_df.copy()
    for _, row in high_conf.iterrows():
        sid = str(row['StudyInstanceUID'])
        targets = np.array([float(row.get(c, 0.0)) for c in TARGET_COLS], dtype=np.float32)
        study_to_labels[sid] = targets
    study_ids = [s for s in study_ids if s in study_to_labels]
    print(f'[OK] Studies with labels AND DICOM data: {len(study_ids)}')
else:
    # Fallback: extract from train.csv reports
    train_csv_paths = [
        '/kaggle/input/rsna-knee-abnormality-detection/train.csv',
        '/kaggle/input/competitions/rsna-knee-abnormality-detection/train.csv',
    ]
    for p in train_csv_paths:
        if os.path.exists(p):
            raw_train = pd.read_csv(p)
            print(f'[OK] Loaded train.csv from {p} ({len(raw_train)} rows)')
            # Use population priors as fallback labels
            for _, row in raw_train.iterrows():
                sid = str(row['StudyInstanceUID'])
                study_to_labels[sid] = POPULATION_PRIORS.copy()
            study_ids = [s for s in study_ids if s in study_to_labels]
            break
    print(f'[WARN] Using population priors as fallback labels for {len(study_ids)} studies')
"""

C_DATASET = """\
class KneeStudyDataset(Dataset):
    def __init__(self, study_ids, study_to_labels, series_root, backbone, device, max_slices=24):
        self.study_ids = study_ids
        self.study_to_labels = study_to_labels
        self.series_root = series_root
        self.backbone = backbone
        self.device = device
        self.max_slices = max_slices
        self.embeddings_cache = {}

    def precompute_embeddings(self):
        print(f'[INFO] Pre-extracting DINOv2 embeddings for {len(self.study_ids)} studies...')
        t0 = time.time()
        mean = torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1).to(self.device)
        std = torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1).to(self.device)

        for i, sid in enumerate(self.study_ids):
            study_dir = os.path.join(self.series_root, sid)
            slices_tensor = load_study_slices(study_dir)
            if slices_tensor.shape[0] > self.max_slices:
                indices = np.linspace(0, slices_tensor.shape[0] - 1, self.max_slices, dtype=int)
                slices_tensor = slices_tensor[indices]

            with torch.inference_mode():
                x = slices_tensor.to(self.device)
                x = (x - mean) / std
                embeds = []
                for j in range(0, x.shape[0], 32):
                    emb = self.backbone(x[j:j+32])
                    embeds.append(emb.cpu())
                embed = torch.cat(embeds, dim=0)
            self.embeddings_cache[sid] = embed

            if (i + 1) % 200 == 0 or (i + 1) == len(self.study_ids):
                elapsed = time.time() - t0
                rate = (i + 1) / elapsed
                print(f'  [{i+1}/{len(self.study_ids)}] {rate:.1f} studies/sec, {elapsed:.0f}s elapsed')
            if (i + 1) % 500 == 0:
                gc.collect()
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()

        print(f'[OK] Embedding extraction complete in {time.time() - t0:.1f}s')

    def __len__(self):
        return len(self.study_ids)

    def __getitem__(self, idx):
        sid = self.study_ids[idx]
        embed = self.embeddings_cache.get(sid, torch.zeros(1, 384))
        label = torch.from_numpy(self.study_to_labels.get(sid, POPULATION_PRIORS.copy()))
        return embed, label, sid

def collate_variable_length(batch):
    embeddings, labels, sids = zip(*batch)
    max_len = max(e.shape[0] for e in embeddings)
    padded = torch.zeros(len(embeddings), max_len, embeddings[0].shape[-1])
    for i, e in enumerate(embeddings):
        padded[i, :e.shape[0], :] = e
    labels = torch.stack(labels)
    return padded, labels, list(sids)

print('[OK] KneeStudyDataset defined')
"""

C_ASL_LOSS = """\
class AsymmetricLoss(nn.Module):
    def __init__(self, gamma_neg=4.0, gamma_pos=1.0, clip=0.05):
        super().__init__()
        self.gamma_neg = gamma_neg
        self.gamma_pos = gamma_pos
        self.clip = clip

    def forward(self, logits, targets):
        xs_pos = torch.sigmoid(logits)
        xs_neg = 1.0 - xs_pos
        if self.clip > 0:
            xs_neg = (xs_neg + self.clip).clamp(max=1.0)
        los_pos = targets * torch.log(xs_pos.clamp(min=1e-8))
        los_neg = (1.0 - targets) * torch.log(xs_neg.clamp(min=1e-8))
        loss = los_pos + los_neg
        if self.gamma_neg > 0 or self.gamma_pos > 0:
            pt0 = xs_pos * targets + xs_neg * (1.0 - targets)
            gamma = self.gamma_pos * targets + self.gamma_neg * (1.0 - targets)
            one_sided = torch.pow(1.0 - pt0, gamma)
            loss = loss * one_sided
        return -loss.mean()

print('[OK] Asymmetric Loss (ASL) compiled')
"""

C_TRAIN_LOOP = """\
print('=' * 65)
print('RSNA Knee 2026 DINOv2 MIL Training Pipeline Starting...')
print('=' * 65)

NUM_FOLDS = 5
NUM_EPOCHS = 15
BATCH_SIZE = 16
LR = 1e-3
WEIGHT_DECAY = 1e-4

if len(study_ids) == 0:
    print('[ERROR] No training studies found. Cannot train.')
else:
    dataset = KneeStudyDataset(
        study_ids=study_ids, study_to_labels=study_to_labels,
        series_root=train_series_root, backbone=backbone,
        device=device, max_slices=24
    )
    dataset.precompute_embeddings()

    groups = np.arange(len(study_ids))
    gkf = GroupKFold(n_splits=NUM_FOLDS)
    fold_metrics = []

    for fold_idx, (train_idx, val_idx) in enumerate(gkf.split(study_ids, groups=groups)):
        print(f'\\n{"="*50}')
        print(f'FOLD {fold_idx + 1} / {NUM_FOLDS}')
        print(f'  Train: {len(train_idx)} | Val: {len(val_idx)}')
        print(f'{"="*50}')

        train_sids = [study_ids[i] for i in train_idx]
        val_sids = [study_ids[i] for i in val_idx]

        train_ds = KneeStudyDataset(train_sids, study_to_labels, train_series_root, backbone, device)
        train_ds.embeddings_cache = {s: dataset.embeddings_cache[s] for s in train_sids}
        val_ds = KneeStudyDataset(val_sids, study_to_labels, train_series_root, backbone, device)
        val_ds.embeddings_cache = {s: dataset.embeddings_cache[s] for s in val_sids}

        train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True,
                                  collate_fn=collate_variable_length, num_workers=0)
        val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False,
                                collate_fn=collate_variable_length, num_workers=0)

        model = StudyMIL(embed_dim=384, num_targets=NUM_TARGETS).to(device)
        optimizer = torch.optim.AdamW(model.parameters(), lr=LR, weight_decay=WEIGHT_DECAY)
        scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=NUM_EPOCHS)
        criterion = AsymmetricLoss(gamma_neg=4.0, gamma_pos=1.0, clip=0.05)

        best_val_loss = float('inf')
        best_epoch = 0

        for epoch in range(NUM_EPOCHS):
            model.train()
            train_loss_sum, train_count = 0.0, 0
            for embeds, labels, _ in train_loader:
                embeds, labels = embeds.to(device), labels.to(device)
                logits = model(embeds)
                loss = criterion(logits, labels)
                optimizer.zero_grad()
                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
                optimizer.step()
                train_loss_sum += loss.item() * embeds.shape[0]
                train_count += embeds.shape[0]
            scheduler.step()

            model.eval()
            val_loss_sum, val_count = 0.0, 0
            val_preds_list, val_labels_list = [], []
            with torch.inference_mode():
                for embeds, labels, _ in val_loader:
                    embeds, labels = embeds.to(device), labels.to(device)
                    logits = model(embeds)
                    loss = criterion(logits, labels)
                    val_loss_sum += loss.item() * embeds.shape[0]
                    val_count += embeds.shape[0]
                    val_preds_list.append(torch.sigmoid(logits).cpu().numpy())
                    val_labels_list.append(labels.cpu().numpy())

            train_loss = train_loss_sum / max(train_count, 1)
            val_loss = val_loss_sum / max(val_count, 1)

            try:
                from sklearn.metrics import roc_auc_score
                all_preds = np.concatenate(val_preds_list)
                all_labels = np.concatenate(val_labels_list)
                aucs = []
                for k in range(NUM_TARGETS):
                    if len(np.unique(all_labels[:, k])) > 1:
                        aucs.append(roc_auc_score(all_labels[:, k], all_preds[:, k]))
                macro_auc = np.mean(aucs) if aucs else 0.0
            except Exception:
                macro_auc = 0.0

            if val_loss < best_val_loss:
                best_val_loss = val_loss
                best_epoch = epoch + 1
                torch.save(model.state_dict(), f'/kaggle/working/best_fold_{fold_idx}.pt')

            if (epoch + 1) % 3 == 0 or epoch == 0 or (epoch + 1) == NUM_EPOCHS:
                print(f'  Ep {epoch+1:2d}/{NUM_EPOCHS} | TrL: {train_loss:.4f} | '
                      f'VaL: {val_loss:.4f} | AUC: {macro_auc:.4f} | '
                      f'LR: {scheduler.get_last_lr()[0]:.6f}'
                      f'{" *" if (epoch + 1) == best_epoch else ""}')

        fold_metrics.append({
            'fold': fold_idx, 'best_epoch': best_epoch,
            'best_val_loss': best_val_loss, 'macro_auc': macro_auc
        })
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    print('\\n' + '=' * 65)
    print('TRAINING COMPLETE')
    print('=' * 65)
    for m in fold_metrics:
        print(f'  Fold {m["fold"]+1}: ep={m["best_epoch"]}, '
              f'loss={m["best_val_loss"]:.4f}, auc={m["macro_auc"]:.4f}')
    avg_auc = np.mean([m['macro_auc'] for m in fold_metrics])
    print(f'\\n  Mean OOF Macro AUC: {avg_auc:.4f}')
    print('\\n[OK] Saved artifacts:')
    for f in sorted(glob.glob('/kaggle/working/*.pt')):
        print(f'  {f} ({os.path.getsize(f)/1024/1024:.1f} MB)')
"""

# ---- Inference-specific cells ----

C_INFER_BASELINE = """\
SUBMISSION_PATH = '/kaggle/working/submission.csv'
SAMPLE_SUB_PATHS = [
    '/kaggle/input/rsna-knee-abnormality-detection/sample_submission.csv',
    '/kaggle/input/competitions/rsna-knee-abnormality-detection/sample_submission.csv',
    '/kaggle/input/rsna-knee-abnormalities-detection/sample_submission.csv',
    './sample_submission.csv',
]
sample_df = None
for p in SAMPLE_SUB_PATHS:
    if os.path.exists(p):
        sample_df = pd.read_csv(p)
        print(f'[OK] Found sample_submission.csv at {p} ({len(sample_df)} rows)')
        break
if sample_df is None and os.path.exists('/kaggle/input'):
    for root, dirs, files in os.walk('/kaggle/input'):
        if 'sample_submission.csv' in files:
            p = os.path.join(root, 'sample_submission.csv')
            sample_df = pd.read_csv(p)
            print(f'[OK] Found sample_submission.csv via walk at {p}')
            break
if sample_df is not None:
    baseline = sample_df.copy()
    for i, col in enumerate(TARGET_COLS):
        if col in baseline.columns:
            baseline[col] = float(POPULATION_PRIORS[i])
    baseline.to_csv(SUBMISSION_PATH, index=False, float_format='%.6f')
    print(f'[OK] Immediate baseline written to {SUBMISSION_PATH}')
else:
    print('[WARN] sample_submission.csv not found')
"""

C_INFER_TORCH = """\
import torch
import torch.nn as nn
import torch.nn.functional as F_nn

def get_safe_device():
    if torch.cuda.is_available():
        try:
            cap = torch.cuda.get_device_capability()
            if cap[0] >= 7:
                _ = torch.zeros(1, device='cuda')
                print(f'[OK] Verified CUDA capability {cap[0]}.{cap[1]} >= 7.0')
                return torch.device('cuda')
            else:
                print(f'[WARN] GPU compute capability {cap[0]}.{cap[1]} < 7.0 (legacy P100); falling back to CPU')
                return torch.device('cpu')
        except Exception as e:
            print(f'[WARN] CUDA probe failed: {e}; falling back to CPU')
            return torch.device('cpu')
    return torch.device('cpu')

device = get_safe_device()
print(f'[OK] PyTorch {torch.__version__} active on {device}')

TRAINING_KERNEL_PATHS = [
    '/kaggle/input/rsna-knee-2026-training-v7',
    '/kaggle/input/philgear/rsna-knee-2026-training-v7',
    '/kaggle/input/rsna-knee-2026-training-v6',
]
backbone_path = None
training_output_dir = None
for base in TRAINING_KERNEL_PATHS:
    candidate = os.path.join(base, 'dinov2_vits14.pt')
    if os.path.exists(candidate):
        backbone_path = candidate
        training_output_dir = base
        print(f'[OK] Found DINOv2 weights at {candidate}')
        break

if backbone_path is None and os.path.exists('/kaggle/input'):
    for root, dirs, files in os.walk('/kaggle/input'):
        if 'dinov2_vits14.pt' in files:
            backbone_path = os.path.join(root, 'dinov2_vits14.pt')
            training_output_dir = root
            print(f'[OK] Found DINOv2 weights via walk at {backbone_path}')
            break

if backbone_path is None:
    try:
        backbone = torch.hub.load('facebookresearch/dinov2', 'dinov2_vits14', pretrained=True)
        print('[OK] Loaded DINOv2 from torch.hub cache')
    except Exception:
        print('[ERROR] Cannot load DINOv2 backbone.')
        backbone = None
else:
    try:
        backbone = torch.hub.load('facebookresearch/dinov2', 'dinov2_vits14', pretrained=False)
        state_dict = torch.load(backbone_path, map_location=device, weights_only=True)
        backbone.load_state_dict(state_dict)
        print('[OK] DINOv2 backbone restored from training output')
    except Exception as e:
        print(f'[WARN] Failed to load backbone: {e}')
        try:
            backbone = torch.hub.load('facebookresearch/dinov2', 'dinov2_vits14', pretrained=True)
        except Exception:
            backbone = None

if backbone is not None:
    backbone = backbone.to(device)
    backbone.eval()
    for p in backbone.parameters():
        p.requires_grad = False
    print(f'[OK] DINOv2 backbone active on {device}')
else:
    print('[ERROR] No backbone available.')
"""

C_NLP = """\
class MultilingualReportExtractor:
    LEXICON = {
        'ACL': ['acl', 'anterior cruciate', 'vorderes kreuzband', 'kreuzbandruptur',
                'ligament croise anterieur', 'ligamento cruzado anterior', 'lca'],
        'MCL': ['mcl', 'medial collateral', 'innenband', 'mediales kollateralband',
                'ligament collateral medial', 'ligamento colateral medial', 'lcm'],
        'Medial Meniscus': ['medial meniscus', 'innenmeniskus', 'menisco medial',
                           'menisco interno', 'menisque medial', 'mm tear'],
        'Lateral Meniscus': ['lateral meniscus', 'aussenmeniskus', 'menisco lateral',
                            'menisco externo', 'menisque lateral'],
        'Medial OA': ['medial compartment osteoarthritis', 'medial cartilage loss',
                      'medial joint space narrowing', 'gonarthrose medial',
                      'artrosis medial', 'chondromalacia medial'],
        'Lateral OA': ['lateral compartment osteoarthritis', 'lateral cartilage loss',
                       'lateral joint space narrowing', 'gonarthrose lateral',
                       'artrosis lateral', 'chondromalacia lateral'],
        'PF OA': ['patellofemoral osteoarthritis', 'trochlear cartilage',
                  'retropatellar cartilage', 'chondromalacia patellae'],
        'Effusion': ['joint effusion', 'gelenkerguss', 'derrame articular',
                     'epanchement', 'hydrops', 'effusion'],
        'Synovitis': ['synovitis', 'synovial thickening', 'synovialitis',
                      'synoviale verdickung', 'synovite', 'sinovitis'],
        "Baker's": ['baker', 'popliteal cyst', 'baker-zyste', 'kyste de baker',
                    'quiste de baker', 'bakers cyst'],
        'Contusion': ['bone contusion', 'marrow edema', 'bone bruise',
                      'knochenkontusion', 'edema oseo', 'bone marrow lesion'],
        'Fracture': ['fracture', 'cortical break', 'fraktur', 'knochenbruch', 'fractura']
    }
    NEGATIONS = [
        'no', 'not', 'without', 'absent', 'unremarkable', 'intact',
        'no evidence of', 'negative for', 'ruled out', 'free of', 'normal',
        'kein', 'keine', 'ohne', 'intakt', 'sans', 'pas de', 'aucun',
        'sin', 'sin evidencia de', 'no se observa', 'intacto', 'conservado',
        'sem', 'sem evidencia', 'geen', 'zonder'
    ]
    @classmethod
    def parse_report(cls, text):
        if not text or not isinstance(text, str) or len(text.strip()) == 0:
            return POPULATION_PRIORS.copy()
        t_lower = text.lower()
        probs = POPULATION_PRIORS.copy()
        for idx, col in enumerate(TARGET_COLS):
            keywords = cls.LEXICON.get(col, [])
            for kw in keywords:
                pos = t_lower.find(kw)
                if pos == -1:
                    continue
                window = t_lower[max(0, pos - 40):pos]
                is_negated = any(neg in window for neg in cls.NEGATIONS)
                probs[idx] = 0.02 if is_negated else 0.94
                break
        return probs

print('[OK] Multilingual NLP Report Parser compiled')
"""

C_INFER_PREDICT = """\
print('=' * 65)
print('RSNA Knee 2026 DINOv2 MIL Inference Pipeline Starting...')
print('=' * 65)

NUM_FOLDS = 5
mil_models = []
if training_output_dir:
    for fold_idx in range(NUM_FOLDS):
        fold_path = os.path.join(training_output_dir, f'best_fold_{fold_idx}.pt')
        if os.path.exists(fold_path):
            model = StudyMIL(embed_dim=384, num_targets=NUM_TARGETS).to(device)
            state_dict = torch.load(fold_path, map_location=device, weights_only=True)
            model.load_state_dict(state_dict)
            model.eval()
            mil_models.append(model)
            print(f'[OK] Loaded fold {fold_idx} weights')
        else:
            print(f'[WARN] Fold {fold_idx} not found at {fold_path}')

if len(mil_models) == 0 and os.path.exists('/kaggle/input'):
    for root, dirs, files in os.walk('/kaggle/input'):
        for fold_idx in range(NUM_FOLDS):
            target_f = f'best_fold_{fold_idx}.pt'
            if target_f in files:
                fpath = os.path.join(root, target_f)
                try:
                    model = StudyMIL(embed_dim=384, num_targets=NUM_TARGETS).to(device)
                    state_dict = torch.load(fpath, map_location=device, weights_only=True)
                    model.load_state_dict(state_dict)
                    model.eval()
                    mil_models.append(model)
                    print(f'[OK] Loaded {target_f} via walk at {fpath}')
                except Exception as e:
                    print(f'[WARN] Failed to load {fpath}: {e}')

print(f'[OK] Loaded {len(mil_models)} / {NUM_FOLDS} fold models')

TEST_SERIES_PATHS = [
    '/kaggle/input/rsna-knee-abnormality-detection/test_series',
    '/kaggle/input/competitions/rsna-knee-abnormality-detection/test_series',
]
test_series_root = None
for p in TEST_SERIES_PATHS:
    if os.path.isdir(p):
        test_series_root = p
        print(f'[OK] Found test_series at {p}')
        break

if test_series_root is None and os.path.exists('/kaggle/input'):
    for root, dirs, files in os.walk('/kaggle/input'):
        if 'test_series' in dirs:
            test_series_root = os.path.join(root, 'test_series')
            print(f'[OK] Found test_series via walk at {test_series_root}')
            break

TEST_CSV_PATHS = [
    '/kaggle/input/rsna-knee-abnormality-detection/test.csv',
    '/kaggle/input/competitions/rsna-knee-abnormality-detection/test.csv',
]
test_df = None
for p in TEST_CSV_PATHS:
    if os.path.exists(p):
        test_df = pd.read_csv(p)
        print(f'[OK] Loaded test.csv: {len(test_df)} studies')
        break
if test_df is None and sample_df is not None:
    test_df = sample_df[['StudyInstanceUID']].copy()
    print(f'[OK] Using sample_submission study IDs: {len(test_df)} studies')

if test_df is not None and backbone is not None and len(mil_models) > 0:
    id_col = test_df.columns[0]
    test_study_ids = test_df[id_col].astype(str).tolist()
    all_vision_preds = []
    all_nlp_preds = []
    t0 = time.time()
    mean_t = torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1).to(device)
    std_t = torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1).to(device)

    for i, study_id in enumerate(test_study_ids):
        study_dir = os.path.join(test_series_root, study_id) if test_series_root else ''
        slices_tensor = load_study_slices(study_dir)
        if slices_tensor.shape[0] > 24:
            indices = np.linspace(0, slices_tensor.shape[0] - 1, 24, dtype=int)
            slices_tensor = slices_tensor[indices]

        with torch.inference_mode():
            x = slices_tensor.to(device)
            x = (x - mean_t) / std_t
            embeds = []
            for j in range(0, x.shape[0], 32):
                emb = backbone(x[j:j+32])
                embeds.append(emb)
            embed = torch.cat(embeds, dim=0).unsqueeze(0)
            fold_preds = []
            for m in mil_models:
                logits = m(embed)
                probs = torch.sigmoid(logits).cpu().numpy()[0]
                fold_preds.append(probs)
            vision_pred = np.mean(fold_preds, axis=0)

        all_vision_preds.append(vision_pred)
        has_report = 'Report' in test_df.columns
        if has_report:
            report_text = str(test_df.iloc[i].get('Report', ''))
            nlp_pred = MultilingualReportExtractor.parse_report(report_text)
        else:
            nlp_pred = POPULATION_PRIORS.copy()
        all_nlp_preds.append(nlp_pred)

        if (i + 1) % 100 == 0 or (i + 1) == len(test_study_ids):
            elapsed = time.time() - t0
            rate = (i + 1) / elapsed if elapsed > 0 else 0
            print(f'  [{i+1}/{len(test_study_ids)}] {rate:.1f} studies/sec')
        if (i + 1) % 200 == 0:
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()

    vision_arr = np.array(all_vision_preds, dtype=np.float32)
    nlp_arr = np.array(all_nlp_preds, dtype=np.float32)
    print(f'\\n[OK] Inference complete: {len(test_study_ids)} studies in {time.time()-t0:.1f}s')

    has_nlp = 'Report' in test_df.columns
    if has_nlp:
        final_preds = 0.70 * vision_arr + 0.20 * nlp_arr + 0.10 * POPULATION_PRIORS[np.newaxis, :]
    else:
        final_preds = 0.85 * vision_arr + 0.15 * POPULATION_PRIORS[np.newaxis, :]

    # Kinetic chain post-processing
    for j in range(len(final_preds)):
        p = final_preds[j]
        if p[0] > 0.40 and p[7] > 0.50: p[10] = min(p[10] * 1.35, 0.98)
        if p[1] > 0.45 and p[0] > 0.40: p[2] = min(p[2] * 1.35, 0.98)
        if p[4] > 0.45:
            p[2] = min(p[2] * 1.25, 0.98)
            p[5] = min(p[5] * 0.40, 0.30)
        if p[5] > 0.45:
            p[3] = min(p[3] * 1.25, 0.98)
            p[4] = min(p[4] * 0.40, 0.30)
        if p[7] > 0.65: p[9] = min(p[9] * 1.25, 0.98)
        final_preds[j] = np.clip(p, 0.001, 0.999)

    out_sub = sample_df.copy() if sample_df is not None else test_df.copy()
    for j, col in enumerate(TARGET_COLS):
        if col in out_sub.columns:
            out_sub[col] = final_preds[:, j]
    out_sub.to_csv(SUBMISSION_PATH, index=False, float_format='%.6f')
    print(f'\\n[OK] SUCCESS! Submission: {SUBMISSION_PATH} ({len(out_sub)} rows)')
    print(out_sub.head(3))
elif backbone is None or len(mil_models) == 0:
    print('[WARN] No trained model. Using population prior baseline.')
else:
    print('[ERROR] No test data found.')

gc.collect()
print('\\n[OK] DINOv2 MIL Inference Pipeline Complete!')
"""


# ===========================================================================
def build_training_notebook():
    cells = [
        _md_cell("hdr", [
            "# RSNA Knee 2026 - DINOv2 MIL Training (v10)\\n",
            "\\n",
            "**Architecture**: DINOv2-Small (ViT-S/14, frozen) + MIL Gated Attention\\n",
            "**Training**: 5-Fold GroupKFold, ASL Loss, AdamW + CosineAnnealingLR, 15 epochs\\n",
            "**Labels**: Gemini-extracted weak labels (filtered >= 0.85 confidence)\\n",
        ]),
        _code_cell("c1", C_CONSTANTS),
        _code_cell("c2", C_TORCH_SETUP),
        _code_cell("c3", C_DICOM_PREPROC),
        _code_cell("c4", C_LABELS),
        _code_cell("c5", C_DATASET),
        _code_cell("c6", C_STUDY_MIL),
        _code_cell("c7", C_ASL_LOSS),
        _code_cell("c8", C_TRAIN_LOOP),
    ]
    nb = _nb_json(cells, gpu=True)
    with open(TRAIN_NB_PATH, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=2)
    print(f"[OK] Training notebook: {TRAIN_NB_PATH}")


def build_inference_notebook():
    cells = [
        _md_cell("hdr", [
            "# RSNA Knee 2026 - DINOv2 MIL Inference (v10)\\n",
            "\\n",
            "**5-Fold Ensemble** + NLP Report Fusion + Kinetic Chain Post-Processing\\n",
        ]),
        _code_cell("c1", C_CONSTANTS + "\n" + C_INFER_BASELINE),
        _code_cell("c2", C_INFER_TORCH),
        _code_cell("c3", C_DICOM_PREPROC),
        _code_cell("c4", C_STUDY_MIL),
        _code_cell("c5", C_NLP),
        _code_cell("c6", C_INFER_PREDICT),
    ]
    nb = _nb_json(cells, gpu=True)
    with open(INFER_NB_PATH, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=2)
    print(f"[OK] Inference notebook: {INFER_NB_PATH}")


def main():
    print("=" * 65)
    print("RSNA Knee 2026 - DINOv2 MIL Pipeline Generator v10.0")
    print("=" * 65)
    build_training_notebook()
    build_inference_notebook()
    print("\n" + "=" * 65)
    print("NOTEBOOKS GENERATED SUCCESSFULLY")
    print(f"  Training:  {TRAIN_NB_PATH}")
    print(f"  Inference: {INFER_NB_PATH}")
    print("=" * 65)


if __name__ == "__main__":
    main()
