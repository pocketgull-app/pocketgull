"""
RSNA Knee Abnormalities Detection — Y-BOCS High-Precision 5-Fold CV Evaluator
Executes 5-Fold GroupKFold CV, applies Pivot & Pulse Co-Occurrence Calibration,
fits 2nd-level Meta-Ensemble Stacker, and runs Nelder-Mead Multi-Threshold Optimization.
"""

import sys
import os
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any
from sklearn.metrics import roc_auc_score

# Add contest root to path
sys.path.append(os.path.dirname(__file__))
from rsna_knee_eda import ValidationSplitter, LabelDistributionAnalyzer, TARGET_COLS
from rsna_knee_model import SklearnMultimodalBaseline
from high_res_preprocessor import HighResVolumePreprocessor
from cooccurrence_calibrator import CooccurrenceCalibrator
from meta_ensemble_stacker import MetaEnsembleStacker
from threshold_optimizer import NelderMeadThresholdOptimizer


def calculate_macro_auc(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculates macro-averaged ROC-AUC across 12 target columns."""
    aucs = []
    for i in range(y_true.shape[1]):
        if len(np.unique(y_true[:, i])) > 1:
            aucs.append(roc_auc_score(y_true[:, i], y_pred[:, i]))
        else:
            aucs.append(0.5)
    return float(np.mean(aucs))


def run_ybocs_high_precision_pipeline(
    data_df: pd.DataFrame, feature_cols: List[str], n_splits: int = 5
) -> Dict[str, Any]:
    """Executes full Y-BOCS High-Precision Cross-Validation and Optimization Pipeline.
    
    Args:
        data_df: DataFrame with patient_id, feature_cols, and 12 target columns.
        feature_cols: List of input feature names.
        n_splits: Number of CV folds.
        
    Returns:
        Dict containing stage-by-stage OOF AUC progression and per-target final scores.
    """
    # 1. GroupKFold on patient_id
    folded_df = ValidationSplitter.create_grouped_folds(data_df, n_splits=n_splits)
    
    X = folded_df[feature_cols].values
    Y = folded_df[TARGET_COLS].values
    
    # Generate predictions from 3 distinct base model variants for stacking
    oof_m1 = np.zeros_like(Y, dtype=float)  # Variant A: Standard GB
    oof_m2 = np.zeros_like(Y, dtype=float)  # Variant B: Deep GB
    oof_m3 = np.zeros_like(Y, dtype=float)  # Variant C: Regularized GB
    
    print(f"--- Step 1: Training 5-Fold Base Models (3 Architecture Variants) ---")
    for fold in range(n_splits):
        train_idx = folded_df[folded_df["fold"] != fold].index
        val_idx = folded_df[folded_df["fold"] == fold].index
        
        X_tr, Y_tr = X[train_idx], Y[train_idx]
        X_val, Y_val = X[val_idx], Y[val_idx]
        
        # Base Model 1 (Standard)
        b1 = SklearnMultimodalBaseline(n_estimators=40)
        b1.fit(X_tr, Y_tr)
        oof_m1[val_idx] = b1.predict_proba(X_val)
        
        # Base Model 2 (Deep)
        b2 = SklearnMultimodalBaseline(n_estimators=70)
        b2.fit(X_tr, Y_tr)
        oof_m2[val_idx] = b2.predict_proba(X_val)
        
        # Base Model 3 (Regularized Noise Injection)
        X_tr_noisy = X_tr + np.random.normal(0, 0.05, size=X_tr.shape)
        b3 = SklearnMultimodalBaseline(n_estimators=50)
        b3.fit(X_tr_noisy, Y_tr)
        oof_m3[val_idx] = b3.predict_proba(X_val)
        
        fold_auc = calculate_macro_auc(Y_val, oof_m1[val_idx])
        print(f"  Fold {fold + 1}/{n_splits} Base Validation Macro AUC: {fold_auc:.4f}")

    # Stage A: Raw Base Model OOF AUC
    raw_oof_auc = calculate_macro_auc(Y, oof_m1)
    
    # Stage B: Pivot & Pulse Bayesian Co-Occurrence Calibration
    print(f"\n--- Step 2: Applying Pivot & Pulse Co-Occurrence Calibration ---")
    calibrator = CooccurrenceCalibrator(alpha=0.12)
    calibrator.fit(Y)
    oof_calibrated = calibrator.calibrate_probabilities(oof_m1)
    cal_oof_auc = calculate_macro_auc(Y, oof_calibrated)
    
    # Stage C: 2nd-Level Meta-Ensemble Stacking
    print(f"--- Step 3: Fitting 2nd-Level Meta-Ensemble Stacker ---")
    stacker = MetaEnsembleStacker(n_estimators=40)
    stacker.fit([oof_m1, oof_m2, oof_m3], Y)
    oof_stacked = stacker.predict_proba([oof_m1, oof_m2, oof_m3])
    stacked_oof_auc = calculate_macro_auc(Y, oof_stacked)
    
    # Stage D: Nelder-Mead Multi-Threshold Decision Optimization
    print(f"--- Step 4: Optimizing Nelder-Mead Multi-Thresholds (tau_1..tau_12) ---")
    opt = NelderMeadThresholdOptimizer(num_targets=12)
    opt_results = opt.fit(oof_stacked, Y)
    oof_final = opt.transform(oof_stacked)
    final_oof_auc = calculate_macro_auc(Y, oof_final)
    
    # Per-Target Final Breakdown
    target_summary = {}
    for i, col in enumerate(TARGET_COLS):
        raw_s = roc_auc_score(Y[:, i], oof_m1[:, i]) if len(np.unique(Y[:, i])) > 1 else 0.5
        final_s = roc_auc_score(Y[:, i], oof_final[:, i]) if len(np.unique(Y[:, i])) > 1 else 0.5
        target_summary[col] = {
            "raw_base_auc": round(float(raw_s), 4),
            "final_ybocs_auc": round(float(final_s), 4),
            "total_gain": round(float(final_s - raw_s), 4),
            "opt_threshold": opt_results["best_thresholds"][col]
        }
        
    return {
        "stage_A_raw_oof_auc": round(float(raw_oof_auc), 4),
        "stage_B_calibrated_oof_auc": round(float(cal_oof_auc), 4),
        "stage_C_stacked_oof_auc": round(float(stacked_oof_auc), 4),
        "stage_D_final_ybocs_oof_auc": round(float(final_oof_auc), 4),
        "total_pipeline_gain": round(float(final_oof_auc - raw_oof_auc), 4),
        "target_summary": target_summary
    }


def generate_benchmark_dataset(n_samples: int = 1000, n_features: int = 48) -> Tuple[pd.DataFrame, List[str]]:
    """Generates synthetic benchmark dataset for CV pipeline verification."""
    np.random.seed(42)
    feature_cols = [f"feat_{i:02d}" for i in range(n_features)]
    
    patient_ids = [f"PAT_{np.random.randint(1, 200):04d}" for _ in range(n_samples)]
    study_ids = [f"STUDY_{i:04d}" for i in range(n_samples)]
    
    df = pd.DataFrame({"study_id": study_ids, "patient_id": patient_ids})
    for f in feature_cols:
        df[f] = np.random.randn(n_samples)
        
    acl = np.random.binomial(1, 0.28, size=n_samples)
    effusion = np.clip(acl * np.random.binomial(1, 0.75, size=n_samples) + (1 - acl) * np.random.binomial(1, 0.12, size=n_samples), 0, 1)
    contusion = np.clip(acl * np.random.binomial(1, 0.65, size=n_samples) + (1 - acl) * np.random.binomial(1, 0.08, size=n_samples), 0, 1)
    
    df["acl"] = acl
    df["effusion"] = effusion
    df["contusion"] = contusion
    
    for col in [c for c in TARGET_COLS if c not in ["acl", "effusion", "contusion"]]:
        df[col] = np.random.binomial(1, np.random.uniform(0.10, 0.35), size=n_samples)
        
    return df, feature_cols


if __name__ == "__main__":
    print("=" * 65)
    print("RSNA Knee — Y-BOCS High-Precision Cross-Validation Evaluator")
    print("=" * 65)
    
    dataset, feat_cols = generate_benchmark_dataset(n_samples=1000, n_features=48)
    results = run_ybocs_high_precision_pipeline(dataset, feat_cols, n_splits=5)
    
    print("\n" + "=" * 65)
    print("Y-BOCS HIGH-PRECISION PIPELINE AUC PROGRESSION")
    print("=" * 65)
    print(f"Stage A (Raw Base Model OOF AUC):              {results['stage_A_raw_oof_auc']:.4f}")
    print(f"Stage B (+ Pivot & Pulse Calibration):        {results['stage_B_calibrated_oof_auc']:.4f}")
    print(f"Stage C (+ 2nd-Level Meta-Ensemble Stacker):   {results['stage_C_stacked_oof_auc']:.4f}")
    print(f"Stage D (+ Nelder-Mead Multi-Thresholds):      {results['stage_D_final_ybocs_oof_auc']:.4f}")
    print(f"TOTAL PIPELINE AUC GAIN:                       {results['total_pipeline_gain']:+.4f}")
    print("\n--- Per-Target Y-BOCS Final Scores ---")
    score_df = pd.DataFrame(results["target_summary"]).T
    print(score_df.to_string())
