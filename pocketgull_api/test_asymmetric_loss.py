"""
Unit Tests for Asymmetric Loss (ASL) Engine & GroupKFold Invariants
"""

import unittest
import numpy as np
from pocketgull_api.services.asymmetric_loss_engine import (
    compute_asymmetric_loss,
    AsymmetricLossEngine,
    ClinicalBiomarkerFeatures,
    predict_asymmetric_multilabel_risk,
    TARGET_LABELS
)


class TestAsymmetricLossEngine(unittest.TestCase):

    def test_asl_zero_loss_on_easy_negatives(self):
        """When predicted probability p <= margin (0.05) for y=0, loss should be exactly 0.0."""
        y_true = np.array([0.0, 0.0, 0.0])
        y_pred = np.array([0.01, 0.04, 0.05])
        
        loss = compute_asymmetric_loss(y_true, y_pred, gamma_neg=4.0, clip_margin=0.05)
        self.assertAlmostEqual(loss, 0.0, places=5)

    def test_asl_hard_positive_focusing(self):
        """Positive instances suffer higher loss when predicted probability is far from 1.0."""
        y_true = np.array([1.0])
        y_pred_hard = np.array([0.20])
        y_pred_easy = np.array([0.90])

        loss_hard = compute_asymmetric_loss(y_true, y_pred_hard, gamma_pos=1.0)
        loss_easy = compute_asymmetric_loss(y_true, y_pred_easy, gamma_pos=1.0)

        self.assertGreater(loss_hard, loss_easy)

    def test_multilabel_risk_prediction(self):
        """Validates prediction output schema across all 12 target pathologies."""
        features = ClinicalBiomarkerFeatures(
            age=72.0,
            systolic_bp=88.0, # Hypotension -> Sepsis risk
            respiratory_rate=28.0, # Tachypnea
            serum_lactate_mmol_l=3.4, # High lactate
            spo2_percent=88.0, # Hypoxia
            bnp_pg_ml=850.0, # Heart failure marker
            hs_crp_mg_l=45.0 # Acute inflammation
        )

        output = predict_asymmetric_multilabel_risk(features)

        self.assertEqual(len(output.abnormalities), len(TARGET_LABELS))
        self.assertIn("sepsis", output.active_positive_findings)
        self.assertGreater(output.max_abnormality_risk, 0.50)
        self.assertLessEqual(output.falsification_p_value, 0.05)
        self.assertIn("Isotonic", output.calibration_method)

    def test_group_kfold_leak_free_guarantee(self):
        """Verifies GroupKFold partition guarantee: 0 patient overlap across train/val folds."""
        from sklearn.model_selection import GroupKFold
        
        # 100 observations across 20 unique patients (5 records per patient)
        n_samples = 100
        patient_ids = np.repeat(np.arange(20), 5)
        X = np.random.randn(n_samples, 4)
        y = np.random.randint(0, 2, size=(n_samples, 3))

        gkf = GroupKFold(n_splits=5)
        
        for fold, (train_idx, val_idx) in enumerate(gkf.split(X, y, groups=patient_ids)):
            train_patients = set(patient_ids[train_idx])
            val_patients = set(patient_ids[val_idx])
            
            # Intersection must be completely empty (zero data leakage)
            overlap = train_patients.intersection(val_patients)
            self.assertEqual(len(overlap), 0, f"Patient leakage detected in fold {fold}: {overlap}")


if __name__ == "__main__":
    unittest.main()
