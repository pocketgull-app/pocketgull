"""
RSNA Knee 2026 — Differentiable 5-Compartment Full-Perimeter Router Tuning
Optimizes the 12x5 Biomechanical Routing Matrix M on 3,613 Matched Studies.
"""
import os
import sys
sys.modules['numexpr'] = None

os.environ["OMP_NUM_THREADS"] = "8"
os.environ["OPENBLAS_NUM_THREADS"] = "8"
os.environ["MKL_NUM_THREADS"] = "8"

from pathlib import Path
import json
import numpy as np
import pandas as pd
from sklearn.metrics import roc_auc_score
from scipy.optimize import minimize

TARGETS = [
    'ACL', 'MCL', 'Medial Meniscus', 'Lateral Meniscus',
    'Medial OA', 'Lateral OA', 'PF OA',
    'Effusion', 'Synovitis', "Baker's", 'Contusion', 'Fracture'
]

COMPARTMENTS = ['medial', 'lateral', 'cruciate', 'patellofemoral', 'popliteal_perimeter']


def main():
    root = Path(__file__).resolve().parent
    print("=" * 76)
    print("  RSNA KNEE: 5-COMPARTMENT FULL-PERIMETER ROUTING MATRIX OPTIMIZATION")
    print("=" * 76)

    gold = pd.read_parquet(root / "train.parquet", columns=['StudyInstanceUID'] + TARGETS).dropna(subset=TARGETS)
    lemonade = pd.read_json(root / "lemonade_extracted_labels.jsonl", lines=True)
    combined_gt = pd.concat([gold, lemonade]).drop_duplicates(subset='StudyInstanceUID', keep='first').dropna(subset=TARGETS)

    oof = pd.read_csv(root / "kernel_output_v9" / "oof_predictions_v9.csv")
    merged = pd.merge(combined_gt, oof, on='StudyInstanceUID', suffixes=('_true', '_pred'))
    print(f"[DATA] Cohort Size: {len(merged):,} matched ground-truth studies")

    y_true = merged[[c + '_true' for c in TARGETS]].to_numpy(dtype=float)
    y_pred_base = merged[[c + '_pred' for c in TARGETS]].to_numpy(dtype=float)

    base_aucs = [float(roc_auc_score(y_true[:, i], y_pred_base[:, i])) for i in range(len(TARGETS))]
    base_mean = float(np.mean(base_aucs))
    print(f"[BASELINE] Uncalibrated OOF Macro-AUC: {base_mean:.5f}\n")

    # Construct compartment activation signals from base predictions
    # 1. Medial: max(Medial Meniscus, Medial OA)
    # 2. Lateral: max(Lateral Meniscus, Lateral OA)
    # 3. Cruciate: max(ACL, MCL)
    # 4. Patellofemoral: PF OA
    # 5. Popliteal Perimeter: max(Baker's, Effusion, Synovitis)
    t_idx = {name: i for i, name in enumerate(TARGETS)}

    comp_signals = np.stack([
        np.maximum(y_pred_base[:, t_idx['Medial Meniscus']], y_pred_base[:, t_idx['Medial OA']]),
        np.maximum(y_pred_base[:, t_idx['Lateral Meniscus']], y_pred_base[:, t_idx['Lateral OA']]),
        np.maximum(y_pred_base[:, t_idx['ACL']], y_pred_base[:, t_idx['MCL']]),
        y_pred_base[:, t_idx['PF OA']],
        np.maximum(y_pred_base[:, t_idx["Baker's"]], np.maximum(y_pred_base[:, t_idx['Effusion']], y_pred_base[:, t_idx['Synovitis']]))
    ], axis=1) # (N, 5)

    print(f"[COMPARTMENTS] Built 5-compartment perimeter activations: {comp_signals.shape}")

    # Optimize blend weights alpha per target between global prediction and compartment routed score
    # y_fused[:, t] = (1 - alpha_t) * y_pred_base[:, t] + alpha_t * sum_c(M[t, c] * comp[:, c])
    best_weights = {}
    fused_preds = y_pred_base.copy()

    for t_name in TARGETS:
        ti = t_idx[t_name]
        yt = y_true[:, ti]
        yp = y_pred_base[:, ti]
        base_auc_t = base_aucs[ti]

        def target_obj(params):
            # params: 5 routing weights + 1 blend alpha
            w_comp = params[:5]
            w_norm = np.exp(w_comp) / np.sum(np.exp(w_comp))
            alpha = 1.0 / (1.0 + np.exp(-params[5])) # sigmoid [0, 1]
            
            routed_t = np.dot(comp_signals, w_norm)
            fused_t = (1.0 - alpha) * yp + alpha * routed_t
            
            try:
                score = roc_auc_score(yt, fused_t)
                return -score
            except Exception:
                return 0.0

        init_params = np.zeros(6, dtype=float)
        # Initialize alpha to ~0.05 (near zero blend)
        init_params[5] = -3.0

        res = minimize(target_obj, init_params, method='Nelder-Mead', options={'maxiter': 300})
        best_w = np.exp(res.x[:5]) / np.sum(np.exp(res.x[:5]))
        best_alpha = float(1.0 / (1.0 + np.exp(-res.x[5])))
        
        opt_routed = np.dot(comp_signals, best_w)
        opt_fused = (1.0 - best_alpha) * yp + best_alpha * opt_routed
        opt_auc = float(roc_auc_score(yt, opt_fused))
        delta = opt_auc - base_auc_t

        fused_preds[:, ti] = opt_fused
        best_weights[t_name] = {
            'compartment_weights': {c: round(float(w), 4) for c, w in zip(COMPARTMENTS, best_w)},
            'blend_alpha': round(best_alpha, 4),
            'baseline_auc': round(base_auc_t, 5),
            'optimized_auc': round(opt_auc, 5),
            'gain': round(delta, 5)
        }

        tag = "[+]" if delta > 0.0001 else "[-]"
        print(f"  {tag} [{t_name:<16}] Base: {base_auc_t:.5f} -> Opt: {opt_auc:.5f} (gain: {delta:+.5f}) | alpha: {best_alpha:.3f}")

    final_aucs = [float(roc_auc_score(y_true[:, i], fused_preds[:, i])) for i in range(len(TARGETS))]
    final_mean = float(np.mean(final_aucs))
    overall_gain = final_mean - base_mean

    print("-" * 76)
    print(f"[RESULT] Initial Macro-AUC:  {base_mean:.5f}")
    print(f"[RESULT] Optimized Macro-AUC: {final_mean:.5f}")
    print(f"[RESULT] Net Macro-AUC Gain:  {overall_gain:+.5f}")
    print("-" * 76)

    out_path = root / "optimal_5compartment_router.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({
            "cohort_size": len(merged),
            "baseline_macro_auc": round(base_mean, 5),
            "optimized_macro_auc": round(final_mean, 5),
            "macro_auc_gain": round(overall_gain, 5),
            "targets": best_weights
        }, f, indent=2)

    print(f"[SAVED] Optimal 5-compartment routing parameters -> {out_path.name}")


if __name__ == "__main__":
    main()
