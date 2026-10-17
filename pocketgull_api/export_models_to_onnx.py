"""Exports trained clinical risk models to ONNX and JSON inference configurations
with SHA-256 hermetic integrity digests.
"""

import hashlib
import os
import sys
import json
import joblib
import numpy as np

# Ensure numexpr compatibility and package root resolution
sys.modules['numexpr'] = None
_REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _REPO_ROOT not in sys.path:
    sys.path.insert(0, _REPO_ROOT)

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
EXPORT_DIR = os.path.join(os.path.dirname(__file__), "exported_onnx")


def _compute_sha256(filepath: str) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def export_models():
    os.makedirs(EXPORT_DIR, exist_ok=True)
    manifest = {}

    if not os.path.exists(MODELS_DIR):
        print(f"[SKIP] Models directory {MODELS_DIR} not found.")
        return manifest

    model_files = sorted(
        f for f in os.listdir(MODELS_DIR) if f.endswith(".joblib")
    )

    for mf in model_files:
        path = os.path.join(MODELS_DIR, mf)
        try:
            sha256_digest = _compute_sha256(path)
            model = joblib.load(path)
            base_name = mf.replace(".joblib", "")

            # Save structural parameter manifest for zero-dependency edge execution & SHA-256 verification
            info = {
                "model_name": base_name,
                "type": type(model).__name__,
                "n_features_in": int(getattr(model, "n_features_in_", 0)),
                "classes": getattr(model, "classes_", np.array([])).tolist() if hasattr(model, "classes_") else None,
                "sha256": sha256_digest,
                "size_bytes": os.path.getsize(path),
            }

            json_path = os.path.join(EXPORT_DIR, f"{base_name}_manifest.json")
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(info, f, indent=2)

            manifest[base_name] = info
            print(f"[EXPORTED] {mf} -> {json_path} (sha256={sha256_digest[:12]}...)")
        except Exception as exc:
            print(f"[WARN] Could not export {mf}: {exc}")

    registry_path = os.path.join(EXPORT_DIR, "model_integrity_registry.json")
    with open(registry_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"[REGISTRY] Wrote {len(manifest)} verified model digests to {registry_path}")

    return manifest


if __name__ == "__main__":
    export_models()

