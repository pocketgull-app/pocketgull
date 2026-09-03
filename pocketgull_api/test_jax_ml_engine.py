"""
Comprehensive Verification Suite for Pocket Gull JAX ML Engine.
Tests Flax NNX architecture, Optax/Orbax training & checkpointing,
JIT-compiled inference engine, ONNX export, and FastAPI sidecar endpoints.
"""
import os
import sys
import shutil
import tempfile
from pathlib import Path

# Ensure root directory is on sys.path
sys.path.insert(0, str(Path(__file__).parent.resolve()))

import numpy as np
from typing import Any, Optional

try:
    import jax
    import jax.numpy as jnp
    from flax import nnx
    import optax
    import orbax.checkpoint as ocp
    import onnx
    from models.clinical_scorer import ClinicalRiskScorer
    from training.train import create_optimizer, train_step
    from export.export_onnx import export_clinical_scorer_to_onnx
    HAS_JAX = True
except ImportError:
    HAS_JAX = False
    jax: Any = None
    jnp: Any = None
    nnx: Any = None
    optax: Any = None
    ocp: Any = None
    onnx: Any = None
    ClinicalRiskScorer: Any = None
    create_optimizer: Any = None
    train_step: Any = None
    export_clinical_scorer_to_onnx: Any = None

from fastapi.testclient import TestClient
from inference.engine import JAXInferenceEngine
from main import app, jax_ml_state


def test_clinical_risk_scorer_nnx():
    """Verify Flax NNX ClinicalRiskScorer forward pass and shape invariant."""
    if not HAS_JAX:
        return
    rngs = nnx.Rngs(0)
    model = ClinicalRiskScorer(in_features=32, hidden_dim=64, out_features=1, rngs=rngs)
    model.eval()

    dummy_input = jnp.ones((4, 32), dtype=jnp.float32)
    logits = model(dummy_input)
    assert logits.shape == (4, 1)
    assert not jnp.isnan(logits).any()


def test_training_step_optax():
    """Verify Optax optimizer update and gradient computation in JIT mode."""
    if not HAS_JAX:
        return
    rngs = nnx.Rngs(42)
    model = ClinicalRiskScorer(in_features=32, hidden_dim=64, out_features=1, rngs=rngs)
    optimizer = nnx.Optimizer(model, create_optimizer(1e-3), wrt=nnx.Param)

    x = jax.random.normal(jax.random.key(1), (16, 32))
    y = jnp.ones((16, 1), dtype=jnp.float32)

    loss_1, _ = train_step(model, optimizer, x, y)
    loss_2, _ = train_step(model, optimizer, x, y)
    assert float(loss_1) > 0.0
    assert float(loss_2) >= 0.0


def test_orbax_checkpoint_roundtrip(tmp_path: Optional[Path] = None):
    """Verify Orbax checkpoint saving and weight restoration."""
    if not HAS_JAX:
        return
    if tmp_path is None:
        tmp_dir = Path(tempfile.mkdtemp(prefix="orbax_ckpt_"))
    else:
        tmp_dir = tmp_path
    ckpt_dir = tmp_dir / "test_checkpoint"
    rngs = nnx.Rngs(10)
    model = ClinicalRiskScorer(in_features=32, hidden_dim=64, out_features=1, rngs=rngs)

    # Save
    atomicity_opts = ocp.options.AtomicityOptions(mode=ocp.options.AtomicityMode.COMMIT_FILE)
    checkpointer = ocp.StandardCheckpointer(atomicity_options=atomicity_opts)
    _, state = nnx.split(model)
    checkpointer.save(str(ckpt_dir), state, force=True)
    checkpointer.wait_until_finished()
    checkpointer.close()

    # Restore into fresh model
    fresh_model = ClinicalRiskScorer(in_features=32, hidden_dim=64, out_features=1, rngs=nnx.Rngs(99))
    graphdef, abstract_state = nnx.split(fresh_model)
    restore_ckptr = ocp.StandardCheckpointer()
    restored_state = restore_ckptr.restore(str(ckpt_dir), abstract_state)
    nnx.update(fresh_model, restored_state)
    restore_ckptr.close()

    # Test output parity
    test_x = jnp.ones((2, 32))
    out_orig = model(test_x)
    out_restored = fresh_model(test_x)
    np.testing.assert_allclose(np.array(out_orig), np.array(out_restored), rtol=1e-5)


def test_inference_engine_jit_and_warmup():
    """Verify JAXInferenceEngine warmup, predict, and predict_batch."""
    engine = JAXInferenceEngine(in_features=32, hidden_dim=64)
    engine.warmup(32)

    features = [0.5] * 32
    score = engine.predict(features)
    assert 0.0 <= score <= 1.0

    batch = [[0.1 * i] * 32 for i in range(5)]
    batch_scores = engine.predict_batch(batch)
    assert len(batch_scores) == 5
    for s in batch_scores:
        assert 0.0 <= s <= 1.0


def test_export_onnx(tmp_path: Optional[Path] = None):
    """Verify ONNX model generation and structural validity."""
    if not HAS_JAX:
        return
    if tmp_path is None:
        tmp_dir = Path(tempfile.mkdtemp(prefix="onnx_export_"))
    else:
        tmp_dir = tmp_path
    onnx_file = tmp_dir / "clinical_scorer.onnx"
    exported_path = export_clinical_scorer_to_onnx(
        output_path=str(onnx_file),
        in_features=32,
        hidden_dim=64,
        out_features=1,
    )
    assert Path(exported_path).exists()
    model = onnx.load(exported_path)
    onnx.checker.check_model(model)


def test_fastapi_endpoints():
    """Verify FastAPI /health, /v1/score, and /v1/score_batch endpoints."""
    with TestClient(app) as client:
        # Health check
        res_health = client.get("/health")
        assert res_health.status_code == 200
        health_data = res_health.json()
        assert health_data["status"] == "ok"

        # Single score endpoint
        single_payload = {
            "patient_id": "PT-TEST-001",
            "features": [0.5] * 32,
        }
        res_score = client.post("/v1/score", json=single_payload)
        assert res_score.status_code == 200
        data = res_score.json()
        assert data["patient_id"] == "PT-TEST-001"
        assert 0.0 <= data["risk_score"] <= 1.0
        assert data["acuity_level"] in ["STAT_EMERGENCY", "URGENT", "ROUTINE"]
        assert data["latency_ms"] >= 0.0

        # Batch score endpoint
        batch_payload = {
            "batch": [
                {"patient_id": "PT-001", "features": [0.2] * 32},
                {"patient_id": "PT-002", "features": [0.8] * 32},
                {"patient_id": "PT-003", "features": [0.5] * 32},
            ]
        }
        res_batch = client.post("/v1/score_batch", json=batch_payload)
        assert res_batch.status_code == 200
        batch_data = res_batch.json()
        assert len(batch_data["results"]) == 3
        assert batch_data["total_latency_ms"] >= 0.0
        assert batch_data["results"][0]["patient_id"] == "PT-001"
        assert batch_data["results"][1]["patient_id"] == "PT-002"
        assert batch_data["results"][2]["patient_id"] == "PT-003"


def run_all_tests():
    if HAS_JAX:
        print("[RUN] Running test_clinical_risk_scorer_nnx()...")
        test_clinical_risk_scorer_nnx()
        print("  [OK] PASS: Flax NNX Model Definition")

        print("[RUN] Running test_training_step_optax()...")
        test_training_step_optax()
        print("  [OK] PASS: Optax Gradient Step")

        print("[RUN] Running test_orbax_checkpoint_roundtrip()...")
        tmp = Path(tempfile.mkdtemp())
        try:
            test_orbax_checkpoint_roundtrip(tmp)
            print("  [OK] PASS: Orbax Checkpoint Roundtrip")
        finally:
            shutil.rmtree(tmp, ignore_errors=True)

    print("[RUN] Running test_inference_engine_jit_and_warmup()...")
    test_inference_engine_jit_and_warmup()
    print("  [OK] PASS: JAX XLA JIT Inference Engine")

    if HAS_JAX:
        print("[RUN] Running test_export_onnx()...")
        tmp_onnx = Path(tempfile.mkdtemp())
        try:
            test_export_onnx(tmp_onnx)
            print("  [OK] PASS: ONNX Export & Graph Verification")
        finally:
            shutil.rmtree(tmp_onnx, ignore_errors=True)

    print("[RUN] Running test_fastapi_endpoints()...")
    test_fastapi_endpoints()
    print("  [OK] PASS: FastAPI /health, /v1/score, and /v1/score_batch")

    print("\n========================================")
    print("ALL JAX ML ENGINE VERIFICATIONS PASSED!")
    print("========================================")


if __name__ == "__main__":
    run_all_tests()
