"""
Unit Tests for Vectorized H0 Falsification Engine & Conformal Uncertainty Calibrator.
Validates Monte Carlo empirical p-values, Cochrane RoB 2 discounting, conformal sets,
Brier / ECE calibration, and epistemic deferral rules.
"""
import os
import sys
import unittest
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from engines.falsification_engine import (
    FalsificationEngine,
    FalsificationRequest,
    CochraneBiasProfile,
    falsification_engine,
)
from engines.uncertainty_calibrator import (
    UncertaintyCalibrator,
    CalibrationRequest,
    uncertainty_calibrator,
)


class TestFalsificationEngine(unittest.TestCase):
    """Tests for Popperian H0 falsification and Cochrane bias discount engine."""

    def setUp(self):
        self.engine = FalsificationEngine(random_seed=42)

    def test_significant_two_sample_rejection(self):
        """High-powered true treatment effect should reject H0 with p < 0.05."""
        np.random.seed(42)
        treatment = list(np.random.normal(loc=15.0, scale=2.0, size=50))
        control = list(np.random.normal(loc=10.0, scale=2.0, size=50))

        req = FalsificationRequest(
            claim_id="CLAIM-RCT-001",
            treatment_samples=treatment,
            control_samples=control,
            null_mean=0.0,
            alpha=0.05,
            n_permutations=2000,
        )
        res = self.engine.evaluate_falsification(req)

        self.assertEqual(res.claim_id, "CLAIM-RCT-001")
        self.assertTrue(res.is_statistically_significant)
        self.assertEqual(res.h0_verdict, "REJECT_NULL")
        self.assertLess(res.empirical_p_value, 0.01)
        self.assertGreater(res.observed_mean_diff, 4.0)

    def test_underpowered_null_failure_to_reject(self):
        """Underpowered / null effect should emit skeptical warning and fail to reject H0."""
        np.random.seed(42)
        treatment = list(np.random.normal(loc=10.1, scale=3.0, size=15))
        control = list(np.random.normal(loc=10.0, scale=3.0, size=15))

        req = FalsificationRequest(
            claim_id="CLAIM-WEAK-002",
            treatment_samples=treatment,
            control_samples=control,
            null_mean=0.0,
            alpha=0.05,
            n_permutations=2000,
        )
        res = self.engine.evaluate_falsification(req)

        self.assertFalse(res.is_statistically_significant)
        self.assertIn("FAIL_TO_REJECT_NULL", res.h0_verdict)
        self.assertIsNotNone(res.skeptical_warning)

    def test_cochrane_rob2_discount_penalty(self):
        """High risk of bias should discount effective effect size significantly."""
        bias = CochraneBiasProfile(
            randomization_bias=0.8,
            deviation_bias=0.6,
            missing_data_bias=0.7,
            measurement_bias=0.5,
            selective_reporting_bias=0.9,
        )
        discount = self.engine.calculate_cochrane_discount(bias)
        self.assertLess(discount, 0.60)
        self.assertGreaterEqual(discount, 0.15)


class TestUncertaintyCalibrator(unittest.TestCase):
    """Tests for Conformal Prediction sets, Brier/ECE scores, and epistemic deferral."""

    def setUp(self):
        self.calibrator = UncertaintyCalibrator()

    def test_conformal_prediction_set_generation(self):
        """Confident distribution should generate a tight conformal prediction set."""
        probs = {
            "acl_tear": 0.94,
            "medial_meniscus": 0.88,
            "fracture": 0.02,
            "bakers_cyst": 0.04,
        }
        conformal_set = self.calibrator.compute_conformal_set(probs, alpha=0.05)
        self.assertEqual(conformal_set.coverage_guarantee_percent, 95.0)
        self.assertIn("acl_tear", conformal_set.included_conditions)
        self.assertNotIn("fracture", conformal_set.included_conditions)

    def test_brier_and_ece_metrics(self):
        """Computes accurate Brier and ECE scores."""
        probs = np.array([0.9, 0.8, 0.1, 0.2])
        labels = np.array([1.0, 1.0, 0.0, 0.0])
        brier, ece = self.calibrator.compute_brier_and_ece(probs, labels)

        self.assertLess(brier, 0.05)
        self.assertLess(ece, 0.20)

    def test_epistemic_abstention_on_ambiguity(self):
        """High-entropy uniform probabilities should trigger DEFER_TO_SPECIALIST."""
        ambiguous_probs = {
            "condition_a": 0.52,
            "condition_b": 0.49,
            "condition_c": 0.51,
            "condition_d": 0.48,
        }
        req = CalibrationRequest(
            patient_id="PATIENT-AMBIGUOUS-99",
            predicted_probabilities=ambiguous_probs,
            uncertainty_threshold=0.60,
        )
        res = self.calibrator.calibrate(req)

        self.assertEqual(res.epistemic_decision, "DEFER_TO_SPECIALIST")
        self.assertIn("Clinical specialist review", res.clinical_recommendation)


if __name__ == "__main__":
    unittest.main()
