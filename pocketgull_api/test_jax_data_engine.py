"""
Unit tests for JAX High-Throughput Biophysical MRI Data & Counterfactual Cohort Engine.
"""

import os
import sys
import unittest
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from engines.jax_mri_data_engine import (
    BiophysicalMriAugmenter,
    CounterfactualCohortGenerator,
    TARGET_NAMES,
)


class TestJaxMriDataEngine(unittest.TestCase):
    """Tests biophysical transformations and counterfactual synthesis."""

    def test_b1_bias_field_augmentation(self):
        img = np.ones((128, 128), dtype=np.float32) * 0.5
        warped = BiophysicalMriAugmenter.apply_b1_bias_field(img, strength=0.35, seed=123)
        self.assertEqual(warped.shape, (128, 128))
        self.assertTrue(np.all(warped >= 0.0) and np.all(warped <= 1.0))
        # Verify spatial non-uniformity was introduced
        self.assertGreater(np.std(warped), 0.01)

    def test_rician_noise_injection(self):
        img = np.ones((64, 64), dtype=np.float32) * 0.7
        noisy = BiophysicalMriAugmenter.apply_rician_noise(img, snr_db=18.0, seed=456)
        self.assertEqual(noisy.shape, (64, 64))
        self.assertTrue(np.all(noisy >= 0.0) and np.all(noisy <= 1.0))
        self.assertGreater(np.std(noisy), 0.01)

    def test_kspace_motion_ghosting(self):
        img = np.zeros((64, 64), dtype=np.float32)
        img[20:44, 20:44] = 0.8
        ghosted = BiophysicalMriAugmenter.simulate_kspace_motion_ghosting(img, num_corrupted_lines=8, seed=789)
        self.assertEqual(ghosted.shape, (64, 64))
        self.assertTrue(np.all(ghosted >= 0.0) and np.all(ghosted <= 1.0))
        # Artifacts should leak outside the central square
        self.assertGreater(np.mean(ghosted[:15, :15]), 0.0)

    def test_counterfactual_cohort_generation(self):
        cohort = CounterfactualCohortGenerator.generate_cohort(num_samples=5000, seed=42)
        self.assertEqual(cohort["num_samples"], 5000)
        self.assertEqual(cohort["feature_matrix"].shape, (5000, 9))
        self.assertEqual(cohort["target_matrix"].shape, (5000, 12))
        self.assertLess(cohort["generation_time_ms"], 1000.0)  # Sub-second generation check
        
        # Verify all 12 targets have non-zero prevalence
        for target in TARGET_NAMES:
            self.assertGreater(cohort["class_prevalences"][target], 0.0)

        # Verify Pivot-Shift / Triad kinetic constraint: P(Contusion | ACL) >= 0.50
        Y = cohort["target_matrix"]
        acl_cases = Y[:, 0] == 1
        contusion_rate_in_acl = float(np.mean(Y[acl_cases, 10]))
        self.assertGreaterEqual(contusion_rate_in_acl, 0.50)


if __name__ == "__main__":
    unittest.main()
