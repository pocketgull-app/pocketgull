"""
Clinical Triage & Risk Scorer built with modern Flax NNX.
Provides pure functional JAX execution wrapped in a Pythonic object-oriented interface.
Includes fallback when JAX/Flax is not installed.
"""
from typing import TYPE_CHECKING, Any, Optional

if TYPE_CHECKING:
    import jax
    import jax.numpy as jnp
    from flax import nnx
    HAS_JAX: bool
else:
    try:
        import jax
        import jax.numpy as jnp
        from flax import nnx
        HAS_JAX = True
    except ImportError:
        HAS_JAX = False
        jax = None
        jnp = None
        class _DummyModule:
            def __init__(self, *args: Any, **kwargs: Any) -> None:
                pass
            def eval(self) -> None:
                pass
        class nnx:
            Module = _DummyModule
            Linear: Any = lambda *args, **kwargs: None
            BatchNorm: Any = lambda *args, **kwargs: None
            Dropout: Any = lambda *args, **kwargs: None
            Rngs: Any = lambda *args, **kwargs: None
            @staticmethod
            def gelu(x: Any) -> Any:
                return x
            @staticmethod
            def jit(fn: Any) -> Any:
                return fn


class ClinicalRiskScorer(nnx.Module):
    """
    Deep residual multilayer perceptron for clinical vitals and risk scoring.
    """
    fc1: Any
    bn1: Any
    dropout: Any
    fc2: Any
    bn2: Any
    head: Any

    def __init__(
        self,
        in_features: int = 32,
        hidden_dim: int = 64,
        out_features: int = 1,
        dropout_rate: float = 0.1,
        *,
        rngs: Any = None,
    ):
        super().__init__()
        if HAS_JAX:
            self.fc1 = nnx.Linear(in_features, hidden_dim, rngs=rngs)
            self.bn1 = nnx.BatchNorm(hidden_dim, rngs=rngs)
            self.dropout = nnx.Dropout(rate=dropout_rate, rngs=rngs)
            
            self.fc2 = nnx.Linear(hidden_dim, hidden_dim, rngs=rngs)
            self.bn2 = nnx.BatchNorm(hidden_dim, rngs=rngs)
            
            self.head = nnx.Linear(hidden_dim, out_features, rngs=rngs)
        else:
            self.fc1 = None
            self.bn1 = None
            self.dropout = None
            self.fc2 = None
            self.bn2 = None
            self.head = None

    def eval(self, *args: Any, **kwargs: Any) -> None:
        if HAS_JAX and hasattr(super(), "eval"):
            super().eval(*args, **kwargs)

    def __call__(self, x: Any) -> Any:
        if not HAS_JAX:
            return x
        # Layer 1 with GeLU activation & Batch Normalization
        residual = self.fc1(x)
        x = nnx.gelu(self.bn1(residual))
        x = self.dropout(x)
        # Layer 2 with Residual Connection
        x = nnx.gelu(self.bn2(self.fc2(x))) + residual
        # Prediction Head (Raw Logits)
        logits = self.head(x)
        return logits
