"""
Unit test suite for OnnxFp16InferenceEngine
Verifies async thread pool isolation, latency tracking, and Scikit-learn / ONNX fallback execution.
Uses Python standard library unittest to eliminate external test framework dependencies.
"""

import asyncio
import unittest
import numpy as np

from services.onnx_engine import OnnxFp16InferenceEngine, onnx_engine


class MockScikitModel:
    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        # Simulate CPU model prediction
        return np.array([[0.2, 0.8]])


class TestOnnxFp16Engine(unittest.IsolatedAsyncioTestCase):
    async def test_onnx_engine_heuristic_fallback(self):
        engine = OnnxFp16InferenceEngine(model_path=None)
        features = np.array([72.0, 120.0, 80.0, 98.0, 45.0, 93.3, 40.0, 0.6, 8640.0, 27.0, 9.0, 0.0])
        
        prob, latency_ms = await engine.predict_proba_async(features, fallback_model=None)
        self.assertEqual(prob, 0.50)
        self.assertGreaterEqual(latency_ms, 0.0)

    async def test_onnx_engine_scikit_fallback_thread_pool(self):
        engine = OnnxFp16InferenceEngine(model_path=None)
        mock_model = MockScikitModel()
        features = np.array([85.0, 135.0, 88.0, 96.0, 52.0, 103.6, 47.0, 0.63, 11475.0, 32.7, 100.0, 225.0])
        
        prob, latency_ms = await engine.predict_proba_async(features, fallback_model=mock_model)
        self.assertEqual(prob, 0.8)
        self.assertGreaterEqual(latency_ms, 0.0)

    def test_global_singleton_instance(self):
        self.assertIsNotNone(onnx_engine)
        self.assertIsInstance(onnx_engine, OnnxFp16InferenceEngine)


# Expose standard function wrappers so custom runner run_tests.py detects them
async def test_onnx_engine_heuristic_fallback():
    tc = TestOnnxFp16Engine()
    await tc.test_onnx_engine_heuristic_fallback()


async def test_onnx_engine_scikit_fallback_thread_pool():
    tc = TestOnnxFp16Engine()
    await tc.test_onnx_engine_scikit_fallback_thread_pool()


def test_global_singleton_instance():
    tc = TestOnnxFp16Engine()
    tc.test_global_singleton_instance()


if __name__ == "__main__":
    unittest.main()
