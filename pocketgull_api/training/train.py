"""
Training script utilizing Optax for optimization and Orbax for asynchronous checkpointing.
Includes graceful fallback when JAX / Flax / Optax is not installed.
"""
import os
import shutil
import sys
from pathlib import Path
from typing import Any, Tuple

# Ensure pocketgull_api root is on sys.path
sys.path.insert(0, str(Path(__file__).parent.parent.resolve()))

try:
    import jax
    import jax.numpy as jnp
    from flax import nnx
    import optax
    import orbax.checkpoint as ocp
    from models.clinical_scorer import ClinicalRiskScorer
    HAS_JAX = True
except ImportError:
    HAS_JAX = False


def create_optimizer(learning_rate: float = 1e-3, decay_steps: int = 5000) -> Any:
    """Builds a learning rate schedule with AdamW and gradient clipping."""
    if not HAS_JAX:
        return None
    schedule = optax.warmup_cosine_decay_schedule(
        init_value=1e-5,
        peak_value=learning_rate,
        warmup_steps=200,
        decay_steps=decay_steps,
        end_value=1e-6,
    )
    return optax.chain(
        optax.clip_by_global_norm(1.0),
        optax.adamw(learning_rate=schedule, weight_decay=1e-2),
    )


if HAS_JAX:
    @nnx.jit
    def train_step(
        model: Any,
        optimizer: Any,
        x: Any,
        y: Any,
    ) -> Tuple[Any, Any]:
        """Single JIT-compiled optimization step."""
        def loss_fn(model: Any):
            logits = model(x)
            loss = optax.sigmoid_binary_cross_entropy(logits=logits, labels=y).mean()
            return loss, logits

        (loss, logits), grads = nnx.value_and_grad(loss_fn, has_aux=True)(model)
        optimizer.update(model, grads)
        return loss, logits
else:
    def train_step(model: Any, optimizer: Any, x: Any, y: Any) -> Tuple[Any, Any]:
        return 0.0, 0.0


def run_training():
    if not HAS_JAX:
        print("[JAX Training] JAX is not installed; skipping training loop.")
        return

    rngs = nnx.Rngs(default=42)
    model = ClinicalRiskScorer(in_features=32, hidden_dim=64, out_features=1, rngs=rngs)
    optimizer = nnx.Optimizer(model, create_optimizer(), wrt=nnx.Param)

    # Simulated synthetic training batch (32 features, binary target)
    key = jax.random.key(0)
    k1, k2 = jax.random.split(key)
    x_train = jax.random.normal(k1, (1024, 32))
    y_train = jax.random.bernoulli(k2, p=0.3, shape=(1024, 1)).astype(jnp.float32)

    print("Starting JAX training loop...")
    for epoch in range(1, 11):
        loss, _ = train_step(model, optimizer, x_train, y_train)
        if epoch % 2 == 0 or epoch == 1:
            print(f"Epoch {epoch:02d} | Loss: {float(loss):.4f}")

    # Checkpoint saving with Orbax
    checkpoint_dir = Path(__file__).parent.parent / "checkpoints" / "clinical_model"
    checkpoint_dir.parent.mkdir(parents=True, exist_ok=True)
    
    atomicity_opts = ocp.options.AtomicityOptions(mode=ocp.options.AtomicityMode.COMMIT_FILE)
    checkpointer = ocp.StandardCheckpointer(atomicity_options=atomicity_opts)
    
    _, state = nnx.split(model)
    target_path = str(checkpoint_dir.resolve())
    shutil.rmtree(target_path, ignore_errors=True)
    checkpointer.save(target_path, state, force=True)
    checkpointer.wait_until_finished()
    checkpointer.close()
    print(f"Model successfully saved to {target_path}")


if __name__ == "__main__":
    run_training()
