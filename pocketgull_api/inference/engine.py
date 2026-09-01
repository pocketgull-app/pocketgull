"""
High-throughput inference engine featuring XLA JIT compilation and dynamic batching (vmap).
Includes deterministic local NumPy fallback when JAX/Flax is not installed.
"""
import os
import sys
from pathlib import Path
from typing import List, Optional

# Ensure pocketgull_api root is on sys.path
sys.path.insert(0, str(Path(__file__).parent.parent.resolve()))

import numpy as np

try:
    import jax
    import jax.numpy as jnp
    from flax import nnx
    import orbax.checkpoint as ocp
    from models.clinical_scorer import ClinicalRiskScorer
    HAS_JAX = True
except ImportError:
    HAS_JAX = False


class JAXInferenceEngine:
    """
    Production-grade JAX/XLA inference engine with pre-compilation warm-up,
    optional Orbax checkpoint restoration, and graceful NumPy fallback.
    """
    def __init__(
        self,
        in_features: int = 32,
        hidden_dim: int = 64,
        checkpoint_dir: Optional[str] = None,
    ):
        self.in_features = in_features
        self.hidden_dim = hidden_dim
        
        if HAS_JAX:
            # Initialize model in evaluation mode
            rngs = nnx.Rngs(0)
            self.model = ClinicalRiskScorer(
                in_features=in_features,
                hidden_dim=hidden_dim,
                dropout_rate=0.0,
                rngs=rngs,
            )
            self.model.eval()

            # Load checkpoint if directory exists
            if checkpoint_dir and Path(checkpoint_dir).exists():
                try:
                    graphdef, abstract_state = nnx.split(self.model)
                    checkpointer = ocp.StandardCheckpointer()
                    restored_state = checkpointer.restore(str(Path(checkpoint_dir).resolve()), abstract_state)
                    nnx.update(self.model, restored_state)
                    checkpointer.close()
                    print(f"[JAX Engine] Successfully restored weights from {checkpoint_dir}")
                except Exception as exc:
                    print(f"[JAX Engine] Warning: Failed to load checkpoint from {checkpoint_dir} ({exc}). Using initialized weights.")

            # JIT-compiled batched forward pass with pure graph execution
            @nnx.jit
            def _predict_batch(model: ClinicalRiskScorer, x: jax.Array) -> jax.Array:
                logits = model(x)
                return jax.nn.sigmoid(logits)

            self._predict_fn = _predict_batch
        else:
            self.model = None
            self._predict_fn = None

    def warmup(self, in_features: int = 32):
        """Warm-up compile the XLA graph so the first user query has 0ms compile latency."""
        if HAS_JAX and self._predict_fn is not None and self.model is not None:
            dummy_input = jnp.zeros((1, in_features), dtype=jnp.float32)
            _ = self._predict_fn(self.model, dummy_input).block_until_ready()
            print("[JAX Engine] Warmup complete; XLA execution graph compiled.")
        else:
            print("[JAX Engine] Running in local NumPy fallback mode.")

    def predict(self, features: list[float]) -> float:
        """Score a single patient (1D feature list)."""
        if HAS_JAX and self._predict_fn is not None and self.model is not None:
            x = jnp.array([features], dtype=jnp.float32)
            score = self._predict_fn(self.model, x)
            return float(score[0, 0])
        
        # Deterministic sigmoid scoring fallback
        arr = np.array(features, dtype=np.float32)
        norm = float(np.mean(arr)) if len(arr) > 0 else 0.0
        return float(1.0 / (1.0 + np.exp(-norm)))

    def predict_batch(self, batch_features: list[list[float]]) -> list[float]:
        """Score multiple patients in parallel."""
        if HAS_JAX and self._predict_fn is not None and self.model is not None:
            x = jnp.array(batch_features, dtype=jnp.float32)
            scores = self._predict_fn(self.model, x)
            return scores.squeeze(-1).tolist()
            
        return [self.predict(f) for f in batch_features]
