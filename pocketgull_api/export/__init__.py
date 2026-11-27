"""
Pocket Gull Model Export Package.
Lazy/graceful export wrapper so optional JAX/Flax dependencies never break package imports.
"""
from typing import Any, Optional

export_clinical_scorer_to_onnx: Optional[Any] = None

try:
    from .export_onnx import export_clinical_scorer_to_onnx
except ImportError:
    export_clinical_scorer_to_onnx = None

__all__ = ["export_clinical_scorer_to_onnx"]
