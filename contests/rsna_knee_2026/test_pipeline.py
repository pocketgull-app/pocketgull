"""
Unit Tests for RSNA Knee Abnormality ML & Data Science Pipeline
Validates data preprocessors, loss functions, co-occurrence calibrator, and efficiency engine.
"""

import os
import sys
import unittest
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from contests.rsna_knee_2026.high_res_preprocessor import HighResVolumePreprocessor
from contests.rsna_knee_2026.asymmetric_loss import AsymmetricLoss, HAS_TORCH
from contests.rsna_knee_2026.cooccurrence_calibrator import CooccurrenceCalibrator
from contests.rsna_knee_2026.threshold_optimizer import NelderMeadThresholdOptimizer
from contests.rsna_knee_2026.efficiency_engine import EfficiencyInferenceEngine, TARGET_COLS
from contests.rsna_knee_2026.rsna_knee_gold_model import DicomWindowingRGB


class TestRSNAKneePipeline(unittest.TestCase):
    """Pipeline unit test suite."""

    def test_ninth_place_triplet_stacking(self):
        s_prev = np.random.randint(0, 4095, size=(256, 256), dtype=np.uint16)
        s_curr = np.random.randint(0, 4095, size=(256, 256), dtype=np.uint16)
        s_next = np.random.randint(0, 4095, size=(256, 256), dtype=np.uint16)

        rgb_25d = DicomWindowingRGB.convert_slice_triplet_to_25d_rgb(s_prev, s_curr, s_next)
        self.assertEqual(rgb_25d.shape, (256, 256, 3))
        self.assertTrue(np.all(rgb_25d >= 0.0) and np.all(rgb_25d <= 1.0))

    def test_high_res_preprocessor(self):
        preprocessor = HighResVolumePreprocessor(target_resolution=(384, 384))
        dummy_dicom = np.random.randint(0, 4095, size=(512, 512), dtype=np.uint16)
        
        rgb = preprocessor.process_slice(dummy_dicom)
        self.assertEqual(rgb.shape, (384, 384, 3))
        self.assertTrue(np.all(rgb >= 0.0) and np.all(rgb <= 1.0))

        roi = preprocessor.generate_roi_auxiliary_mask("Sagittal")
        self.assertEqual(roi.shape, (384, 384))

    def test_cooccurrence_calibrator(self):
        np.random.seed(42)
        n_samples = 100
        y_dummy = np.random.randint(0, 2, size=(n_samples, 12))
        probs_dummy = np.random.uniform(0.1, 0.4, size=(n_samples, 12))

        calibrator = CooccurrenceCalibrator(alpha=0.15)
        calibrator.fit(y_dummy)
        calibrated = calibrator.calibrate_probabilities(probs_dummy)

        self.assertEqual(calibrated.shape, (n_samples, 12))
        self.assertTrue(np.all(calibrated >= 0.0) and np.all(calibrated <= 1.0))

    def test_threshold_optimizer(self):
        np.random.seed(42)
        n_samples = 200
        y_true = np.random.randint(0, 2, size=(n_samples, 12))
        y_pred = np.clip(y_true * 0.6 + np.random.uniform(0.1, 0.3, size=(n_samples, 12)), 0.01, 0.99)

        optimizer = NelderMeadThresholdOptimizer(initial_threshold=0.35)
        optimal_tau = optimizer.fit(y_true, y_pred, max_iter=50)

        self.assertEqual(len(optimal_tau), 12)
        self.assertTrue(np.all(optimal_tau >= 0.05) and np.all(optimal_tau <= 0.95))
        self.assertGreaterEqual(optimizer.optimized_macro_f1, optimizer.baseline_macro_f1)

        binary_preds = optimizer.apply_thresholds(y_pred)
        self.assertEqual(binary_preds.shape, (n_samples, 12))

    def test_efficiency_engine(self):
        engine = EfficiencyInferenceEngine(num_key_slices=8, use_fp16=True)
        volume_40_slices = np.random.randint(0, 4095, size=(40, 256, 256), dtype=np.uint16)
        
        sampled = engine.sample_key_slices(volume_40_slices, target_count=8)
        self.assertEqual(sampled.shape, (8, 256, 256))

        mock_batch = [{
            "sagittal": volume_40_slices,
            "coronal": volume_40_slices,
            "axial": volume_40_slices
        } for _ in range(10)]

        preds, elapsed = engine.run_fast_batch_inference(mock_batch)
        self.assertEqual(preds.shape, (10, 12))
        self.assertLess(elapsed, 2.0)  # Sub-2-second execution assertion

    def test_asymmetric_loss(self):
        if not HAS_TORCH:
            self.skipTest("PyTorch not installed in environment")
            
        import torch
        loss_fn = AsymmetricLoss(gamma_pos=1.0, gamma_neg=4.0, clip=0.05)
        logits = torch.randn(8, 12, requires_grad=True)
        targets = torch.randint(0, 2, (8, 12)).float()
        
        loss = loss_fn(logits, targets)
        self.assertGreater(loss.item(), 0.0)
        
        loss.backward()
        self.assertIsNotNone(logits.grad)


if __name__ == "__main__":
    unittest.main()
