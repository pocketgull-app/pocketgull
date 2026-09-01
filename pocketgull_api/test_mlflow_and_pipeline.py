"""
Unit tests for MLflow Clinical Experiment Tracker and Vertex AI Pipelines KFP DAG.
"""

from pathlib import Path
import tempfile
import json

from pocketgull_api.services.mlflow_tracker import log_clinical_experiment, compute_file_sha256
from pocketgull_api.pipelines.vertex_clinical_pipeline import build_pipeline_spec, export_pipeline_spec


def test_compute_file_sha256():
    with tempfile.NamedTemporaryFile("w", delete=False) as f:
        f.write("Clinical test payload 2026")
        f_path = f.name

    try:
        digest = compute_file_sha256(f_path)
        assert len(digest) == 64
        assert all(c in "0123456789abcdef" for c in digest)
    finally:
        Path(f_path).unlink(missing_ok=True)


def test_log_clinical_experiment_manifest():
    params = {
        "model_type": "JAX_Flax_NNX",
        "epochs": 25,
        "learning_rate": 0.002,
    }
    metrics = {
        "roc_auc": 0.9425,
        "brier_score": 0.0812,
        "c_index": 0.7610,
    }

    result = log_clinical_experiment(
        experiment_name="clinical_risk_v2_evaluation",
        run_name="test_run_unit",
        params=params,
        metrics=metrics,
        tags={"tier": "unit_test"},
    )

    assert result["experiment_name"] == "clinical_risk_v2_evaluation"
    assert result["params"]["model_type"] == "JAX_Flax_NNX"
    assert result["metrics"]["roc_auc"] == 0.9425
    assert "timestamp_iso" in result
    assert "mlflow_status" in result


def test_vertex_clinical_pipeline_spec():
    spec = build_pipeline_spec()

    assert spec["pipelineInfo"]["name"] == "pocketgull-clinical-pipeline"
    tasks = spec["root"]["dag"]["tasks"]
    assert "ingest-biomarkers" in tasks
    assert "train-clinical-risk" in tasks
    assert "conformal-calibration" in tasks
    assert "evaluate-fda-attestation" in tasks
    assert "export-onnx" in tasks


def test_export_pipeline_spec():
    with tempfile.TemporaryDirectory() as tmpdir:
        out_file = Path(tmpdir) / "test_pipeline.json"
        exported = export_pipeline_spec(str(out_file))

        assert exported.exists()
        with open(exported, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert data["pipelineInfo"]["name"] == "pocketgull-clinical-pipeline"
