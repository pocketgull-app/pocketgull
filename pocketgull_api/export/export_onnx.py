"""
JAX / Flax NNX -> StableHLO / ONNX Edge Exporter.
Serializes trained clinical risk scoring weights to portable ONNX runtime graph.
"""
import os
import sys
from pathlib import Path
from typing import Optional

# Ensure pocketgull_api root is on sys.path
sys.path.insert(0, str(Path(__file__).parent.parent.resolve()))

import numpy as np
import onnx
from onnx import helper, TensorProto
from flax import nnx
import orbax.checkpoint as ocp

from models.clinical_scorer import ClinicalRiskScorer


def export_clinical_scorer_to_onnx(
    output_path: str = "./models/clinical_risk_jax.onnx",
    checkpoint_dir: Optional[str] = None,
    in_features: int = 32,
    hidden_dim: int = 64,
    out_features: int = 1,
) -> str:
    """
    Exports a ClinicalRiskScorer (Flax NNX) to a validated ONNX model artifact.
    """
    model = ClinicalRiskScorer(
        in_features=in_features,
        hidden_dim=hidden_dim,
        out_features=out_features,
        dropout_rate=0.0,
        rngs=nnx.Rngs(0),
    )
    model.eval()

    if checkpoint_dir and Path(checkpoint_dir).exists():
        try:
            graphdef, abstract_state = nnx.split(model)
            checkpointer = ocp.StandardCheckpointer()
            restored_state = checkpointer.restore(str(Path(checkpoint_dir).resolve()), abstract_state)
            nnx.update(model, restored_state)
            checkpointer.close()
            print(f"[Export] Loaded checkpoint weights from {checkpoint_dir}")
        except Exception as exc:
            print(f"[Export] Warning: Could not restore checkpoint ({exc}). Exporting initial weights.")

    # Input and Output Tensor Signatures
    input_tensor = helper.make_tensor_value_info("features", TensorProto.FLOAT, ["batch_size", in_features])
    output_tensor = helper.make_tensor_value_info("probabilities", TensorProto.FLOAT, ["batch_size", out_features])

    # Extract model parameters
    fc1_w = helper.make_tensor(
        "fc1_w", TensorProto.FLOAT, [in_features, hidden_dim],
        np.array(model.fc1.kernel[...], dtype=np.float32).flatten().tolist(),
    )
    fc1_b = helper.make_tensor(
        "fc1_b", TensorProto.FLOAT, [hidden_dim],
        np.array(model.fc1.bias[...], dtype=np.float32).flatten().tolist(),
    )
    bn1_scale = helper.make_tensor(
        "bn1_scale", TensorProto.FLOAT, [hidden_dim],
        np.array(model.bn1.scale[...], dtype=np.float32).flatten().tolist(),
    )
    bn1_bias = helper.make_tensor(
        "bn1_bias", TensorProto.FLOAT, [hidden_dim],
        np.array(model.bn1.bias[...], dtype=np.float32).flatten().tolist(),
    )
    bn1_mean = helper.make_tensor(
        "bn1_mean", TensorProto.FLOAT, [hidden_dim],
        np.array(model.bn1.mean[...], dtype=np.float32).flatten().tolist(),
    )
    bn1_var = helper.make_tensor(
        "bn1_var", TensorProto.FLOAT, [hidden_dim],
        np.array(model.bn1.var[...], dtype=np.float32).flatten().tolist(),
    )

    fc2_w = helper.make_tensor(
        "fc2_w", TensorProto.FLOAT, [hidden_dim, hidden_dim],
        np.array(model.fc2.kernel[...], dtype=np.float32).flatten().tolist(),
    )
    fc2_b = helper.make_tensor(
        "fc2_b", TensorProto.FLOAT, [hidden_dim],
        np.array(model.fc2.bias[...], dtype=np.float32).flatten().tolist(),
    )
    bn2_scale = helper.make_tensor(
        "bn2_scale", TensorProto.FLOAT, [hidden_dim],
        np.array(model.bn2.scale[...], dtype=np.float32).flatten().tolist(),
    )
    bn2_bias = helper.make_tensor(
        "bn2_bias", TensorProto.FLOAT, [hidden_dim],
        np.array(model.bn2.bias[...], dtype=np.float32).flatten().tolist(),
    )
    bn2_mean = helper.make_tensor(
        "bn2_mean", TensorProto.FLOAT, [hidden_dim],
        np.array(model.bn2.mean[...], dtype=np.float32).flatten().tolist(),
    )
    bn2_var = helper.make_tensor(
        "bn2_var", TensorProto.FLOAT, [hidden_dim],
        np.array(model.bn2.var[...], dtype=np.float32).flatten().tolist(),
    )

    head_w = helper.make_tensor(
        "head_w", TensorProto.FLOAT, [hidden_dim, out_features],
        np.array(model.head.kernel[...], dtype=np.float32).flatten().tolist(),
    )
    head_b = helper.make_tensor(
        "head_b", TensorProto.FLOAT, [out_features],
        np.array(model.head.bias[...], dtype=np.float32).flatten().tolist(),
    )

    # Computational Graph Nodes
    nodes = [
        helper.make_node("MatMul", ["features", "fc1_w"], ["fc1_mm"]),
        helper.make_node("Add", ["fc1_mm", "fc1_b"], ["residual"]),
        helper.make_node("BatchNormalization", ["residual", "bn1_scale", "bn1_bias", "bn1_mean", "bn1_var"], ["bn1_out"]),
        helper.make_node("Gelu", ["bn1_out"], ["gelu1_out"]),
        helper.make_node("MatMul", ["gelu1_out", "fc2_w"], ["fc2_mm"]),
        helper.make_node("Add", ["fc2_mm", "fc2_b"], ["fc2_out"]),
        helper.make_node("BatchNormalization", ["fc2_out", "bn2_scale", "bn2_bias", "bn2_mean", "bn2_var"], ["bn2_out"]),
        helper.make_node("Gelu", ["bn2_out"], ["gelu2_out"]),
        helper.make_node("Add", ["gelu2_out", "residual"], ["res_out"]),
        helper.make_node("MatMul", ["res_out", "head_w"], ["head_mm"]),
        helper.make_node("Add", ["head_mm", "head_b"], ["logits"]),
        helper.make_node("Sigmoid", ["logits"], ["probabilities"]),
    ]

    graph = helper.make_graph(
        nodes,
        "ClinicalRiskScorer_ONNX",
        [input_tensor],
        [output_tensor],
        [fc1_w, fc1_b, bn1_scale, bn1_bias, bn1_mean, bn1_var, fc2_w, fc2_b, bn2_scale, bn2_bias, bn2_mean, bn2_var, head_w, head_b],
    )

    model_def = helper.make_model(
        graph,
        producer_name="pocketgull-jax-engine",
        opset_imports=[helper.make_opsetid("", 20)],
    )

    onnx.checker.check_model(model_def)

    dest = Path(output_path).resolve()
    dest.parent.mkdir(parents=True, exist_ok=True)
    onnx.save(model_def, str(dest))
    print(f"[Export] Successfully serialized validated ONNX model to {dest}")
    return str(dest)


if __name__ == "__main__":
    export_clinical_scorer_to_onnx()
