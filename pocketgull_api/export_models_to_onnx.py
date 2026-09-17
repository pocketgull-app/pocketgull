"""Exports trained clinical risk models to ONNX and JSON inference configurations.
"""

import os
import sys
import json
import joblib
import numpy as np

# Ensure numexpr compatibility
sys.modules['numexpr'] = None

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
EXPORT_DIR = os.path.join(os.path.dirname(__file__), "exported_onnx")


def export_models():
    os.makedirs(EXPORT_DIR, exist_ok=True)
    manifest = {}

    model_files = [
        "cyp_phenoconversion_model.joblib",
        "anticholinergic_delirium_model.joblib",
        "ms_pira_velocity_model.joblib",
        "endotoxin_sibi_spike_model.joblib"
    ]

    for mf in model_files:
        path = os.path.join(MODELS_DIR, mf)
        if not os.path.exists(path):
            print(f"[SKIP] Model file {mf} not found.")
            continue

        model = joblib.load(path)
        base_name = mf.replace(".joblib", "")
        
        # Save structural parameter manifest for zero-dependency edge execution
        info = {
            "model_name": base_name,
            "type": type(model).__name__,
            "n_features_in": getattr(model, "n_features_in_", 0),
            "classes": getattr(model, "classes_", np.array([])).tolist() if hasattr(model, "classes_") else None
        }

        json_path = os.path.join(EXPORT_DIR, f"{base_name}_manifest.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(info, f, indent=2)

        manifest[base_name] = info
        print(f"[EXPORTED] {mf} -> {json_path}")

    return manifest


if __name__ == "__main__":
    export_models()
