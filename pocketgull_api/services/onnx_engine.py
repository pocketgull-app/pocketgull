"""
Pocket Gull — ONNX FP16 Engine & Async Thread Pool Execution Service
Implements sub-millisecond hardware-optimized inference and event-loop thread pool isolation.
"""

from __future__ import annotations

import asyncio
import time
from typing import Any, Optional, Tuple
import numpy as np

# Optional ONNX Runtime import for high-throughput FP16 / SIMD CPU execution
try:
    import onnxruntime as ort  # type: ignore
    HAS_ONNX = True
except ImportError:
    ort = None
    HAS_ONNX = False


class OnnxFp16InferenceEngine:
    """
    Manages ONNX Runtime sessions with FP16 precision support and async worker thread isolation.
    """

    def __init__(self, model_path: Optional[str] = None):
        self.session: Optional[Any] = None
        self.input_name: Optional[str] = None
        self.output_name: Optional[str] = None
        self.is_fp16: bool = False

        if model_path and HAS_ONNX and ort is not None:
            self._load_onnx_session(model_path)

    def _load_onnx_session(self, model_path: str) -> None:
        if ort is None:
            return
        try:
            opts = ort.SessionOptions()
            opts.intra_op_num_threads = 2
            opts.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
            opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

            providers = ["CPUExecutionProvider"]
            if "CUDAExecutionProvider" in ort.get_available_providers():
                providers.insert(0, "CUDAExecutionProvider")

            self.session = ort.InferenceSession(model_path, opts, providers=providers)
            self.input_name = self.session.get_inputs()[0].name
            self.output_name = self.session.get_outputs()[0].name
            
            # Check if input datatype is FP16 (float16)
            input_type = self.session.get_inputs()[0].type
            self.is_fp16 = "float16" in input_type
            print(f"[ONNX Engine] Loaded ONNX session from {model_path} (FP16={self.is_fp16}, Providers={providers})")
        except Exception as exc:
            print(f"[ONNX Engine] Warning: Failed to load ONNX session from {model_path}: {exc}")
            self.session = None

    async def predict_proba_async(self, features: np.ndarray, fallback_model: Optional[Any] = None) -> Tuple[float, float]:
        """
        Asynchronously runs probability inference off the main asyncio event loop thread.
        Returns: (probability_positive_class, inference_latency_ms)
        """
        start_time = time.perf_counter()

        if self.session is not None and self.input_name:
            # Prepare tensor data
            input_data = features.astype(np.float16 if self.is_fp16 else np.float32)
            if input_data.ndim == 1:
                input_data = np.expand_dims(input_data, axis=0)

            # Offload blocking ONNX run call to thread pool
            def _onnx_run():
                assert self.session is not None and self.input_name is not None
                return self.session.run(None, {self.input_name: input_data})

            outputs = await asyncio.to_thread(_onnx_run)
            probs = outputs[0]
            # Handle standard classification output shape
            if probs.ndim == 2 and probs.shape[1] >= 2:
                prob = float(probs[0, 1])
            else:
                prob = float(probs.flat[0])
        elif fallback_model is not None:
            # Offload blocking scikit-learn predict_proba to worker thread pool
            def _scikit_run():
                input_arr = np.array(features)
                if input_arr.ndim == 1:
                    input_arr = np.expand_dims(input_arr, axis=0)
                if hasattr(fallback_model, "predict_proba"):
                    return float(fallback_model.predict_proba(input_arr)[0][1])
                elif hasattr(fallback_model, "predict"):
                    return float(fallback_model.predict(input_arr)[0])
                return 0.5

            prob = await asyncio.to_thread(_scikit_run)
        else:
            prob = 0.50

        latency_ms = round((time.perf_counter() - start_time) * 1000, 3)
        return prob, latency_ms


# Global singleton instance
onnx_engine = OnnxFp16InferenceEngine()
