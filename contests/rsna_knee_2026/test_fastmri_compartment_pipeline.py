"""
Unit test suite for fastmri_compartment_pipeline.py
Verifies MONAI Anatomical Compartment Cropper coupling with FastMRI-MAE representations.
"""

import unittest
import sys
import os
from pathlib import Path
import numpy as np

# Ensure module directory is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastmri_compartment_pipeline import (
    BiomechanicalRoutingMatrix,
    CompartmentAwareFastMRIPipeline,
    FullBoundaryStratifiedSampler,
    TARGET_NAMES,
    COMPARTMENT_NAMES
)


class TestFastMRICompartmentPipeline(unittest.TestCase):

    def setUp(self):
        self.routing = BiomechanicalRoutingMatrix()
        self.pipeline = CompartmentAwareFastMRIPipeline(
            routing=self.routing,
            target_crop_hw=(224, 224)
        )

    def test_biomechanical_routing_matrix_structure(self):
        M = self.routing.get_routing_matrix()
        self.assertEqual(M.shape, (12, 5))
        # Row sums should all sum to 1.0
        row_sums = M.sum(axis=1)
        np.testing.assert_allclose(row_sums, np.ones(12), atol=1e-5)
        # Check specific anatomical groundings
        acl_idx = TARGET_NAMES.index('ACL')
        cruciate_idx = COMPARTMENT_NAMES.index('cruciate')
        self.assertAlmostEqual(float(M[acl_idx, cruciate_idx]), 1.0, places=4)

        pfoa_idx = TARGET_NAMES.index('PF OA')
        pf_idx = COMPARTMENT_NAMES.index('patellofemoral')
        self.assertGreater(float(M[pfoa_idx, pf_idx]), 0.80)

        med_oa_idx = TARGET_NAMES.index('Medial OA')
        med_idx = COMPARTMENT_NAMES.index('medial')
        self.assertGreater(float(M[med_oa_idx, med_idx]), 0.80)

        baker_idx = TARGET_NAMES.index("Baker's")
        pop_idx = COMPARTMENT_NAMES.index('popliteal_perimeter')
        self.assertGreater(float(M[baker_idx, pop_idx]), 0.80)

    def test_routing_projection_scores(self):
        # Suppose only the medial compartment has a high signal (e.g. 0.95)
        scores = {
            'medial': 0.95,
            'lateral': 0.05,
            'cruciate': 0.10,
            'patellofemoral': 0.05,
            'popliteal_perimeter': 0.05
        }
        routed = self.routing.route_compartment_scores(scores)
        self.assertEqual(routed.shape, (1, 12))
        
        # Medial OA & Medial Meniscus should be highest
        med_oa_idx = TARGET_NAMES.index('Medial OA')
        med_men_idx = TARGET_NAMES.index('Medial Meniscus')
        lat_oa_idx = TARGET_NAMES.index('Lateral OA')

        self.assertGreater(routed[0, med_oa_idx], 0.75)
        self.assertGreater(routed[0, med_men_idx], 0.75)
        self.assertLess(routed[0, lat_oa_idx], 0.20)

    def test_preprocess_and_crop_slab_coronal(self):
        # 2.5D slab: 3 channels, 392 x 392
        np.random.seed(42)
        slab = np.random.uniform(10.0, 800.0, size=(3, 392, 392)).astype(np.float32)
        crops = self.pipeline.preprocess_and_crop_slab(slab, plane='Coronal', laterality='L')

        self.assertEqual(set(crops.keys()), set(COMPARTMENT_NAMES))
        self.assertEqual(len(crops), 5)
        for name, patch in crops.items():
            self.assertEqual(patch.shape, (3, 224, 224), f"Failed for compartment {name}")
            self.assertFalse(np.isnan(patch).any())
            self.assertFalse(np.isinf(patch).any())
            self.assertGreaterEqual(float(np.min(patch)), 0.0)
            self.assertLessEqual(float(np.max(patch)), 1.0)

    def test_preprocess_and_crop_slab_sagittal_axial(self):
        # Verify alternative planes
        slab = np.ones((3, 392, 392), dtype=np.float32) * 500.0
        crops_sag = self.pipeline.preprocess_and_crop_slab(slab, plane='Sagittal', laterality='R')
        crops_ax = self.pipeline.preprocess_and_crop_slab(slab, plane='Axial', laterality='L')

        for c_dict in [crops_sag, crops_ax]:
            self.assertEqual(len(c_dict), 5)
            for name, patch in c_dict.items():
                self.assertEqual(patch.shape, (3, 224, 224))
                self.assertFalse(np.isnan(patch).any())

    def test_full_boundary_stratified_sampler(self):
        sampler = FullBoundaryStratifiedSampler(num_peripheral_slices=3, num_central_slices=6)
        volume = np.zeros((30, 128, 128), dtype=np.float32)
        indices = sampler.sample_indices(30)
        # Should have slices from 0..5 (peripheral medial), 6..23 (central), 24..29 (peripheral lateral)
        self.assertTrue(np.any(indices < 6))
        self.assertTrue(np.any((indices >= 6) & (indices <= 23)))
        self.assertTrue(np.any(indices > 23))
        
        slab = sampler.extract_stratified_slab(volume)
        self.assertEqual(slab.ndim, 3)
        self.assertEqual(slab.shape[0], len(indices))
        self.assertEqual(slab.shape[1:], (128, 128))

    def test_blend_compartment_with_global_predictions(self):
        # Global baseline prediction: 0.50 across all 12 targets
        global_p = np.full(12, 0.50, dtype=np.float32)
        
        # Localized compartment predictions indicate strong medial pathology
        compartment_p = {
            'medial': 0.90,
            'lateral': 0.10,
            'cruciate': 0.50,
            'patellofemoral': 0.50,
            'popliteal_perimeter': 0.50
        }

        fused = self.pipeline.blend_compartment_with_global_predictions(
            global_p, compartment_p, compartment_weight=0.20
        )
        self.assertEqual(fused.shape, (12,))
        self.assertTrue(np.all(fused >= 0.001))
        self.assertTrue(np.all(fused <= 0.999))

        # Medial OA should be higher than global baseline (0.50)
        med_oa_idx = TARGET_NAMES.index('Medial OA')
        self.assertGreater(fused[med_oa_idx], 0.55)

        # Lateral OA should be lower than global baseline (0.50)
        lat_oa_idx = TARGET_NAMES.index('Lateral OA')
        self.assertLess(fused[lat_oa_idx], 0.45)

    def test_batch_blending(self):
        # Batch of 4 studies
        batch_global = np.full((4, 12), 0.50, dtype=np.float32)
        batch_comp = {
            'medial': np.array([0.9, 0.1, 0.8, 0.2]),
            'lateral': np.array([0.1, 0.9, 0.2, 0.8]),
            'cruciate': np.array([0.5, 0.5, 0.5, 0.5]),
            'patellofemoral': np.array([0.5, 0.5, 0.5, 0.5]),
            'popliteal_perimeter': np.array([0.5, 0.5, 0.5, 0.5])
        }

        fused_batch = self.pipeline.blend_compartment_with_global_predictions(
            batch_global, batch_comp, compartment_weight=0.25
        )
        self.assertEqual(fused_batch.shape, (4, 12))
        self.assertFalse(np.isnan(fused_batch).any())


if __name__ == '__main__':
    unittest.main()
