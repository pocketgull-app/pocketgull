---
name: jax-flax-nnx-pipeline
description: Best practices, architecture, and deployment standards for JAX, Flax NNX, Optax, Orbax Checkpointing, OpenXLA JIT compilation, and ONNX edge export in Pocket Gull.
---

# JAX / Flax NNX OpenXLA Pipeline Standard

This skill defines the canonical architecture and operational procedures for building, training, serializing, and serving high-performance machine learning models using **JAX**, **Flax NNX**, **Optax**, **Orbax**, and **ONNX** within Pocket Gull.

---

## 1. Core Architecture Stack

| Layer | Technology | Primary Function |
| :--- | :--- | :--- |
| **Model Definition** | `flax.nnx.Module` | Pure Python/JAX functional object-oriented neural modules. |
| **Optimization** | `optax` | Composable first-order gradient optimizers (Adam, AdamW, Cosine Decay). |
| **Checkpointing** | `orbax.checkpoint` | Multi-host asynchronous and single-host standard tensor checkpointing. |
| **Inference Acceleration** | `jax.jit` / OpenXLA | Graph pre-compilation, XLA compilation, and vectorized `jax.vmap` batching. |
| **Edge Export** | `onnx` (Opset 20) | Dynamic batch dimension graph serialization for zero-egress client runtime. |
| **API Serving** | `FastAPI` (lifespan) | Sub-millisecond sidecar inference endpoints with telemetry metrics. |

---

## 2. Flax NNX 0.12+ API Invariants

### 1. Model Definition Pattern
```python
import jax.numpy as jnp
from flax import nnx

class ClinicalRiskScorer(nnx.Module):
    def __init__(self, in_features: int = 32, hidden_dim: int = 64, out_features: int = 1, *, rngs: nnx.Rngs):
        self.fc1 = nnx.Linear(in_features, hidden_dim, rngs=rngs)
        self.ln1 = nnx.LayerNorm(hidden_dim, rngs=rngs)
        self.fc2 = nnx.Linear(hidden_dim, hidden_dim // 2, rngs=rngs)
        self.ln2 = nnx.LayerNorm(hidden_dim // 2, rngs=rngs)
        self.out = nnx.Linear(hidden_dim // 2, out_features, rngs=rngs)
        self.dropout = nnx.Dropout(rate=0.1, rngs=rngs)

    def __call__(self, x: jnp.ndarray) -> jnp.ndarray:
        x = nnx.relu(self.ln1(self.fc1(x)))
        x = self.dropout(x)
        x = nnx.relu(self.ln2(self.fc2(x)))
        logits = self.out(x)
        return nnx.sigmoid(logits)
```

### 2. Optax Training & JIT Invariants
- When instantiating `nnx.Optimizer`, explicitly declare `wrt=nnx.Param`.
- In Flax >= 0.11, `optimizer.update(model, grads)` requires `model` as the first positional argument.
```python
@nnx.jit
def train_step(model: ClinicalRiskScorer, optimizer: nnx.Optimizer, x: jnp.ndarray, y: jnp.ndarray):
    def loss_fn(m: ClinicalRiskScorer):
        preds = m(x)
        return optax.l2_loss(preds, y).mean()

    loss, grads = nnx.value_and_grad(loss_fn)(model)
    optimizer.update(model, grads)
    return loss
```

---

## 3. Orbax Windows Filesystem Invariant (CRITICAL)

On Windows operating systems, standard atomic directory renaming fails with `[WinError 5] Access is denied` due to file handle locks during temporary directory renaming (`atomicity.AtomicRenameTemporaryPath`).

### Mandatory Windows Atomicity Configuration:
```python
import orbax.checkpoint as ocp

atomicity_options = ocp.options.AtomicityOptions(mode=ocp.options.AtomicityMode.COMMIT_FILE)
checkpointer = ocp.StandardCheckpointer(atomicity_options=atomicity_options)

# Save
_, state = nnx.split(model)
checkpointer.save(checkpoint_path, state, force=True)
checkpointer.wait_until_finished()
checkpointer.close()

# Restore
graphdef, abstract_state = nnx.split(model)
restore_ckptr = ocp.StandardCheckpointer()
restored_state = restore_ckptr.restore(checkpoint_path, abstract_state)
nnx.update(model, restored_state)
restore_ckptr.close()
```

---

## 4. OpenXLA Inference Engine & Warmup Protocol

To prevent first-request latency spikes in production, inference engines MUST execute graph pre-compilation during sidecar startup (`lifespan`):

```python
class JAXInferenceEngine:
    def __init__(self, in_features: int = 32, hidden_dim: int = 64):
        self.in_features = in_features
        self.rngs = nnx.Rngs(0)
        self.model = ClinicalRiskScorer(in_features, hidden_dim, 1, rngs=self.rngs)
        self.model.eval()

        # JIT-compiled single prediction
        self._jit_predict = nnx.jit(lambda m, x: m(x))

    def warmup(self, n_features: int = 32):
        """Forces OpenXLA trace and compilation prior to handling live traffic."""
        dummy_batch = jnp.zeros((1, n_features), dtype=jnp.float32)
        _ = self._jit_predict(self.model, dummy_batch).block_until_ready()
```

---

## 5. ONNX Dynamic-Batch Edge Export (Opset 20)

To deploy models to client browsers (WebGPU / WebAssembly) or constrained embedded hardware:

```python
import onnx
from onnx import helper, TensorProto
import numpy as np

def export_to_onnx(model: ClinicalRiskScorer, output_path: str, in_features: int = 32):
    # Extract trained weights via numpy array conversions
    w1 = np.array(model.fc1.kernel[...])
    b1 = np.array(model.fc1.bias[...])
    # ... construct dynamic-batch ONNX graph with shape ['batch_size', in_features]
    # Check graph validity:
    onnx.checker.check_model(onnx_model)
    onnx.save(onnx_model, output_path)
```

---

## 6. Pre-Commit Verification Checklist

Before shipping any changes to the JAX pipeline:
1. Run [`pocketgull_api/test_jax_ml_engine.py`](file:///c:/Users/philg/Pocketgull/pocketgull/pocketgull_api/test_jax_ml_engine.py) to verify:
   - Flax NNX model forward pass & non-NaN invariants.
   - Optax loss reduction step.
   - Orbax checkpoint save/restore bit-exact parity (`np.testing.assert_allclose`).
   - XLA JIT warmup & vectorized batch scoring.
   - ONNX export checker validation.
   - FastAPI `/health`, `/v1/score`, and `/v1/score_batch` endpoints.
2. Confirm Pyright language server passes with 0 diagnostics.
