"""
PocketGull Vertex AI Pipelines & Kubeflow Pipelines (KFP v2) Clinical Training DAG.
Automates dataset ingestion, JAX / scikit-learn model training, conformal calibration,
ONNX export, and FDA 21 CFR Part 11 electronic records attestation.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict


def build_pipeline_spec() -> Dict[str, Any]:
    """
    Constructs the canonical KFP v2 / Vertex AI Pipelines JSON specification
    for the PocketGull Clinical Risk & Causal Treatment Optimizer.
    """
    return {
        "pipelineInfo": {
            "name": "pocketgull-clinical-pipeline",
            "description": "Continuous training, conformal calibration, and ONNX export for PocketGull Clinical Intelligence.",
            "version": "1.31.0",
        },
        "root": {
            "dag": {
                "tasks": {
                    "ingest-biomarkers": {
                        "taskInfo": {"name": "Ingest Biomarkers Cohort"},
                        "componentRef": {"name": "comp-ingest-biomarkers"},
                        "inputs": {
                            "parameters": {
                                "dataset_uri": {"runtimeValue": {"constant": "gs://pocketgull-ml-datasets/physionet_cohort.csv"}}
                            }
                        },
                    },
                    "train-clinical-risk": {
                        "taskInfo": {"name": "Train JAX / Scikit Clinical Risk Scorer"},
                        "componentRef": {"name": "comp-train-clinical-risk"},
                        "dependentTasks": ["ingest-biomarkers"],
                        "inputs": {
                            "parameters": {
                                "epochs": {"runtimeValue": {"constant": 50}},
                                "learning_rate": {"runtimeValue": {"constant": 0.001}},
                                "hidden_dim": {"runtimeValue": {"constant": 64}},
                            }
                        },
                    },
                    "conformal-calibration": {
                        "taskInfo": {"name": "Calibrate 95% Conformal Coverage"},
                        "componentRef": {"name": "comp-conformal-calibration"},
                        "dependentTasks": ["train-clinical-risk"],
                        "inputs": {
                            "parameters": {
                                "alpha": {"runtimeValue": {"constant": 0.05}}
                            }
                        },
                    },
                    "evaluate-fda-attestation": {
                        "taskInfo": {"name": "Evaluate Metrics & FDA 21 CFR Part 11 Seal"},
                        "componentRef": {"name": "comp-evaluate-fda-attestation"},
                        "dependentTasks": ["conformal-calibration"],
                    },
                    "export-onnx": {
                        "taskInfo": {"name": "Export Edge ONNX Artifact"},
                        "componentRef": {"name": "comp-export-onnx"},
                        "dependentTasks": ["evaluate-fda-attestation"],
                    },
                }
            }
        },
        "components": {
            "comp-ingest-biomarkers": {
                "executorLabel": "exec-ingest-biomarkers",
                "inputDefinitions": {
                    "parameters": {"dataset_uri": {"parameterType": "STRING"}}
                },
                "outputDefinitions": {
                    "artifacts": {"preprocessed_dataset": {"artifactType": {"schemaTitle": "system.Dataset"}}}
                },
            },
            "comp-train-clinical-risk": {
                "executorLabel": "exec-train-clinical-risk",
                "inputDefinitions": {
                    "parameters": {
                        "epochs": {"parameterType": "NUMBER_INTEGER"},
                        "learning_rate": {"parameterType": "NUMBER_DOUBLE"},
                        "hidden_dim": {"parameterType": "NUMBER_INTEGER"},
                    }
                },
                "outputDefinitions": {
                    "artifacts": {"trained_model": {"artifactType": {"schemaTitle": "system.Model"}}}
                },
            },
            "comp-conformal-calibration": {
                "executorLabel": "exec-conformal-calibration",
                "inputDefinitions": {
                    "parameters": {"alpha": {"parameterType": "NUMBER_DOUBLE"}}
                },
                "outputDefinitions": {
                    "parameters": {"q_hat": {"parameterType": "NUMBER_DOUBLE"}}
                },
            },
            "comp-evaluate-fda-attestation": {
                "executorLabel": "exec-evaluate-fda-attestation",
                "outputDefinitions": {
                    "parameters": {
                        "roc_auc": {"parameterType": "NUMBER_DOUBLE"},
                        "brier_score": {"parameterType": "NUMBER_DOUBLE"},
                        "sha256_digest": {"parameterType": "STRING"},
                    }
                },
            },
            "comp-export-onnx": {
                "executorLabel": "exec-export-onnx",
                "outputDefinitions": {
                    "artifacts": {"onnx_model": {"artifactType": {"schemaTitle": "system.Model"}}}
                },
            },
        },
        "deploymentSpec": {
            "executors": {
                "exec-ingest-biomarkers": {
                    "container": {
                        "image": "us-docker.pkg.dev/gen-lang-client-0540208645/cloud-run-source-deploy/pocketgull-api:latest",
                        "command": ["python", "-m", "pocketgull_api.engines.lego_data_generator"],
                    }
                },
                "exec-train-clinical-risk": {
                    "container": {
                        "image": "us-docker.pkg.dev/gen-lang-client-0540208645/cloud-run-source-deploy/pocketgull-api:latest",
                        "command": ["python", "train_contest_model.py"],
                    }
                },
                "exec-conformal-calibration": {
                    "container": {
                        "image": "us-docker.pkg.dev/gen-lang-client-0540208645/cloud-run-source-deploy/pocketgull-api:latest",
                        "command": ["python", "-m", "pocketgull_api.services.conformal_risk_service"],
                    }
                },
                "exec-evaluate-fda-attestation": {
                    "container": {
                        "image": "us-docker.pkg.dev/gen-lang-client-0540208645/cloud-run-source-deploy/pocketgull-api:latest",
                        "command": ["python", "evaluate_model.py"],
                    }
                },
                "exec-export-onnx": {
                    "container": {
                        "image": "us-docker.pkg.dev/gen-lang-client-0540208645/cloud-run-source-deploy/pocketgull-api:latest",
                        "command": ["python", "export/export_onnx.py"],
                    }
                },
            }
        },
    }


def export_pipeline_spec(output_path: str = "models/vertex_pipeline_spec.json") -> Path:
    """Exports the Vertex AI / KFP pipeline DAG to a JSON specification file."""
    spec = build_pipeline_spec()
    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(spec, f, indent=2)
    print(f"[Vertex AI Pipelines] Exported KFP v2 pipeline spec to: {out.resolve()}")
    return out


if __name__ == "__main__":
    export_pipeline_spec()
