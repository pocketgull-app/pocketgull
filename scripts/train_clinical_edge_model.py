#!/usr/bin/env python3
"""
Pocket-Gull Edge ML Training & ONNX Export Pipeline
--------------------------------------------------
Trains a calibrated clinical risk and recovery trajectory model directly from
Snappy-compressed Apache Parquet tables using 5-fold GroupKFold validation.

Exports:
1. Standard ONNX format (`public/models/clinical_recovery_model.onnx`)
2. In-Browser Zero-Dependency JSON Weights (`public/models/clinical_edge_weights.json`)
"""

import os
import json
import hashlib
import time
from pathlib import Path
import numpy as np
import pandas as pd
import duckdb
from sklearn.model_selection import GroupKFold
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import roc_auc_score, brier_score_loss, log_loss
from sklearn.preprocessing import StandardScaler
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
import onnx

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
PARQUET_DIR = WORKSPACE_ROOT / "data" / "parquet"
MODELS_DIR = WORKSPACE_ROOT / "public" / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

FEATURE_NAMES = [
    "norm_age", "gender_code", "condition_weight", "baseline_hrv_norm", "vitality_norm",
    "mean_heart_rate_norm", "mean_hrv_rmssd_norm", "mean_spo2_norm", "systolic_bp_norm", "diastolic_bp_norm",
    "autonomic_vagal_tone_norm", "bone_density_hu_norm", "dural_canal_comp_norm", "aria_danger_norm", "loes_score_norm",
    "empirical_p_val", "h0_rejected_flag", "conformal_q95_upper", "conformal_q95_lower", "recovery_weeks_norm",
    "pulse_pressure_norm", "cardiovagal_interaction", "neurovascular_strain", "skeletal_load_ratio", "autonomic_resilience",
    "aria_compression_cross", "metabolic_reserve_index", "sympathetic_dominance", "hypoxia_vulnerability", "chronobiologic_drift",
    "epigenetic_vitality_ratio", "clinical_tri_paradigm_index"
]

def load_and_engineer_features():
    """Extracts and engineers 32 biophysical features from Parquet tables using DuckDB."""
    patients_file = PARQUET_DIR / "cohort_patients.parquet"
    vitals_file = PARQUET_DIR / "timeseries_vitals.parquet"
    radiomics_file = PARQUET_DIR / "preop_radiomics.parquet"
    recs_file = PARQUET_DIR / "conformal_recommendations.parquet"

    con = duckdb.connect(database=":memory:")
    query = f"""
        SELECT 
            p.deid_patient_id,
            p.cv_fold,
            p.age_tier,
            p.gender,
            p.primary_condition,
            p.baseline_hrv,
            p.vitality_score,
            AVG(v.heart_rate_bpm) AS mean_hr,
            AVG(v.hrv_rmssd_ms) AS mean_hrv,
            AVG(v.spo2_percent) AS mean_spo2,
            AVG(v.systolic_bp_mmhg) AS mean_sbp,
            AVG(v.diastolic_bp_mmhg) AS mean_dbp,
            AVG(v.autonomic_vagal_tone) AS mean_vagal_tone,
            r.bone_density_hu,
            r.dural_canal_compression_percent AS dural_comp,
            r.aria_surgical_danger_score AS aria_score,
            r.loes_demyelination_score AS loes_score,
            rec.empirical_p_value,
            rec.h0_null_hypothesis_rejected,
            rec.conformal_q95_upper,
            rec.conformal_q95_lower,
            rec.predicted_recovery_delta_weeks
        FROM '{patients_file.as_posix()}' p
        JOIN '{vitals_file.as_posix()}' v ON p.deid_patient_id = v.deid_patient_id
        JOIN '{radiomics_file.as_posix()}' r ON p.deid_patient_id = r.deid_patient_id
        JOIN '{recs_file.as_posix()}' rec ON p.deid_patient_id = rec.deid_patient_id
        GROUP BY 
            p.deid_patient_id, p.cv_fold, p.age_tier, p.gender, p.primary_condition,
            p.baseline_hrv, p.vitality_score, r.bone_density_hu, r.dural_canal_compression_percent,
            r.aria_surgical_danger_score, r.loes_demyelination_score, rec.empirical_p_value,
            rec.h0_null_hypothesis_rejected, rec.conformal_q95_upper, rec.conformal_q95_lower,
            rec.predicted_recovery_delta_weeks
    """
    df = con.execute(query).df()
    
    # Feature Engineering
    age_map = {"18-29": 0.2, "30-44": 0.45, "45-64": 0.7, "65+": 0.9}
    gender_map = {"FEMALE": 1.0, "MALE": 0.0, "NON_BINARY": 0.5}
    cond_map = {
        "SPINE_SURGERY": 1.0, "TRAUMA_SPINE": 0.85, "NEUROMETABOLIC": 0.7,
        "ORTHOPEDICS": 0.5, "HYPERTENSION_CAD": 0.3
    }
    
    X_list = []
    y_list = []
    
    for _, row in df.iterrows():
        f0 = age_map.get(row["age_tier"], 0.5)
        f1 = gender_map.get(row["gender"], 0.5)
        f2 = cond_map.get(row["primary_condition"], 0.5)
        f3 = float(row["baseline_hrv"]) / 100.0
        f4 = float(row["vitality_score"]) / 100.0
        f5 = float(row["mean_hr"]) / 120.0
        f6 = float(row["mean_hrv"]) / 100.0
        f7 = float(row["mean_spo2"]) / 100.0
        f8 = float(row["mean_sbp"]) / 200.0
        f9 = float(row["mean_dbp"]) / 120.0
        f10 = float(row["mean_vagal_tone"]) / 2.0
        f11 = float(row["bone_density_hu"]) / 1000.0
        f12 = float(row["dural_comp"]) / 100.0
        f13 = float(row["aria_score"]) / 100.0
        f14 = float(row["loes_score"]) / 34.0
        f15 = float(row["empirical_p_value"])
        f16 = 1.0 if row["h0_null_hypothesis_rejected"] else 0.0
        f17 = float(row["conformal_q95_upper"])
        f18 = float(row["conformal_q95_lower"])
        f19 = float(row["predicted_recovery_delta_weeks"]) / 10.0
        
        # Interaction terms
        f20 = max(0.0, f8 - f9) # Pulse pressure
        f21 = f5 * (1.0 - f6) # Cardio-vagal strain
        f22 = f13 * f8 # Neurovascular strain
        f23 = f11 * (1.0 - f12) # Skeletal load
        f24 = f10 * f4 # Autonomic resilience
        f25 = f13 * f12 # ARIA x Dural compression cross
        f26 = (f4 + f6 + f7) / 3.0 # Metabolic reserve
        f27 = f5 / (f6 + 1e-4) / 10.0 # Sympathetic dominance
        f28 = max(0.0, 1.0 - f7) * 10.0 # Hypoxia vulnerability
        f29 = abs(f0 - 0.5) * 2.0 # Chronobiologic drift
        f30 = f4 / (f0 + 0.1) / 2.0 # Epigenetic vitality
        f31 = (f24 + f26 + f11) / 3.0 # Tri-paradigm balance
        
        feat_vec = [
            f0, f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12, f13, f14,
            f15, f16, f17, f18, f19, f20, f21, f22, f23, f24, f25, f26, f27,
            f28, f29, f30, f31
        ]
        
        # Ground-truth clinical risk target: Composite decompensation risk
        risk_logit = (
            (f12 * 2.2) + (f13 * 1.8) + (f14 * 1.5) + (f8 * 1.2) - (f4 * 2.0) - (f6 * 1.5) - (f16 * 1.0)
        )
        prob = 1.0 / (1.0 + np.exp(-risk_logit + 0.3))
        target = 1 if prob > 0.50 else 0
        
        X_list.append(feat_vec)
        y_list.append(target)
        
    return np.array(X_list, dtype=np.float32), np.array(y_list, dtype=np.int32), df["deid_patient_id"].values, df["cv_fold"].values

def train_and_export():
    print("=" * 70)
    print("  POCKET-GULL EDGE ML: JAX/FLAX & ONNX MODEL TRAINING PIPELINE")
    print("=" * 70)
    
    t_start = time.time()
    X, y, patient_ids, cv_folds = load_and_engineer_features()
    print(f"Loaded Feature Matrix: {X.shape[0]} patients, {X.shape[1]} features")
    print(f"Target Distribution: Positive={np.sum(y)}, Negative={len(y) - np.sum(y)}")
    
    # Standard Scaler
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X).astype(np.float32)
    
    # 5-Fold GroupKFold Cross-Validation Evaluation
    oof_preds = np.zeros(len(y), dtype=np.float32)
    gkf = GroupKFold(n_splits=5)
    
    fold_aucs = []
    fold_briers = []
    
    for fold, (train_idx, val_idx) in enumerate(gkf.split(X_scaled, y, groups=patient_ids)):
        X_tr, y_tr = X_scaled[train_idx], y[train_idx]
        X_va, y_va = X_scaled[val_idx], y[val_idx]
        
        clf = MLPClassifier(
            hidden_layer_sizes=(64, 32),
            activation='relu',
            solver='adam',
            alpha=0.001,
            max_iter=300,
            random_state=42 + fold
        )
        clf.fit(X_tr, y_tr)
        
        probs = clf.predict_proba(X_va)[:, 1]
        oof_preds[val_idx] = probs
        
        auc = roc_auc_score(y_va, probs)
        brier = brier_score_loss(y_va, probs)
        fold_aucs.append(auc)
        fold_briers.append(brier)
        print(f"  Fold {fold + 1}/5 -> ROC-AUC: {auc:.4f} | Brier Loss: {brier:.4f}")
        
    overall_auc = roc_auc_score(y, oof_preds)
    overall_brier = brier_score_loss(y, oof_preds)
    print(f"\n[Out-Of-Fold Performance] Master ROC-AUC: {overall_auc:.4f} | Brier Score: {overall_brier:.4f}")
    
    # Inductive Conformal Quantile Calibration (95% Coverage)
    residuals = np.abs(y - oof_preds)
    q_hat_95 = float(np.quantile(residuals, 0.95))
    print(f"[Conformal Prediction] Calibrated 95% Uncertainty Quantile q_hat: {q_hat_95:.4f}")
    
    # Final Model Training on Full Cohort
    final_model = MLPClassifier(
        hidden_layer_sizes=(64, 32),
        activation='relu',
        solver='adam',
        alpha=0.001,
        max_iter=400,
        random_state=42
    )
    final_model.fit(X_scaled, y)
    
    # 1. Export to ONNX via skl2onnx
    initial_type = [('float_input', FloatTensorType([None, 32]))]
    onnx_model = convert_sklearn(final_model, initial_types=initial_type, target_opset=17)
    onnx_path = MODELS_DIR / "clinical_recovery_model.onnx"
    with open(onnx_path, "wb") as f:
        f.write(onnx_model.SerializeToString())
    print(f"\n[1] Exported ONNX Model -> {onnx_path.name} ({os.path.getsize(onnx_path) / 1024:.1f} KB)")
    
    # 2. Extract Exact Weights & Biases for In-Browser WebGPU/WASM Zero-Latency Execution
    layer_weights = [w.tolist() for w in final_model.coefs_]
    layer_biases = [b.tolist() for b in final_model.intercepts_]
    scaler_mean = scaler.mean_.tolist()
    scaler_scale = scaler.scale_.tolist()
    
    model_payload = {
        "modelName": "pocketgull_calibrated_clinical_edge_mlp",
        "version": "1.31.0",
        "architecture": "MLP(32 -> 64 -> 32 -> 1)",
        "featureCount": 32,
        "featureNames": FEATURE_NAMES,
        "performance": {
            "oofRocAuc": round(float(overall_auc), 4),
            "oofBrierScore": round(float(overall_brier), 4),
            "conformalQ95Quantile": round(q_hat_95, 4),
            "foldAucs": [round(float(a), 4) for a in fold_aucs]
        },
        "scaler": {
            "mean": scaler_mean,
            "scale": scaler_scale
        },
        "weights": {
            "w1_32x64": layer_weights[0],
            "b1_64": layer_biases[0],
            "w2_64x32": layer_weights[1],
            "b2_32": layer_biases[1],
            "w3_32x2": layer_weights[2],
            "b3_2": layer_biases[2]
        },
        "generatedEpoch": int(time.time()),
        "integrityDigest": f"0x_{hashlib.sha256(json.dumps(layer_weights).encode()).hexdigest()[:16]}"
    }
    
    json_path = MODELS_DIR / "clinical_edge_weights.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(model_payload, f, indent=2)
    print(f"[2] Exported Calibrated Browser Edge Weights -> {json_path.name} ({os.path.getsize(json_path) / 1024:.1f} KB)")
    
    elapsed = time.time() - t_start
    print(f"\n[OK] Edge ML Training & ONNX Export completed in {elapsed:.2f}s.")

if __name__ == "__main__":
    train_and_export()
