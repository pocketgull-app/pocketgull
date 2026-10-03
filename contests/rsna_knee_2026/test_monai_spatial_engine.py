"""
Unit test suite for monai_spatial_engine.py
Verifies MONAI and MSD spatial normalization algorithms.
"""

import unittest
import numpy as np
from monai_spatial_engine import (
    robust_percentile_norm,
    compute_dicom_affine,
    AnatomicalCompartmentCropper,
    resample_slab_to_isotropic,
    extract_surface_mesh_metadata
)


class TestMonaiSpatialEngine(unittest.TestCase):

    def test_robust_percentile_norm_synthetic_mri(self):
        # Create synthetic 16-bit MRI intensities with background noise and high-intensity bone spikes
        np.random.seed(42)
        raw_mri = np.random.uniform(50.0, 1200.0, size=(16, 64, 64)).astype(np.float32)
        # Add background air
        raw_mri[:4, :10, :10] = 0.0
        # Add hyperintense artifact spikes
        raw_mri[10, 20, 20] = 15000.0

        normed = robust_percentile_norm(raw_mri, lower_pct=1.0, upper_pct=99.0, nonzero=True)
        self.assertEqual(normed.shape, raw_mri.shape)
        self.assertFalse(np.isnan(normed).any())
        self.assertFalse(np.isinf(normed).any())
        self.assertGreaterEqual(float(np.min(normed)), 0.0)
        self.assertLessEqual(float(np.max(normed)), 1.0)
        # Background air should remain 0
        self.assertAlmostEqual(float(normed[0, 0, 0]), 0.0, places=3)

    def test_compute_dicom_affine(self):
        ipp = [10.0, 20.0, 30.0]
        # Standard Coronal orientation (R = [1,0,0], C = [0,0,-1])
        iop = [1.0, 0.0, 0.0, 0.0, 0.0, -1.0]
        pixel_spacing = [0.45, 0.45]
        slice_thickness = 3.0

        affine = compute_dicom_affine(ipp, iop, pixel_spacing, slice_thickness)
        self.assertEqual(affine.shape, (4, 4))
        # Translation vector should match ipp
        np.testing.assert_allclose(affine[:3, 3], ipp)
        # Determinant of the 3x3 rotation/scaling block should be non-zero (invertible)
        det = np.linalg.det(affine[:3, :3])
        self.assertNotEqual(det, 0.0)
        expected_vol = 0.45 * 0.45 * 3.0
        self.assertAlmostEqual(abs(det), expected_vol, places=5)

    def test_anatomical_compartment_cropper(self):
        cropper = AnatomicalCompartmentCropper()
        # 3-channel 2.5D slab (3, 392, 392)
        slab = np.ones((3, 392, 392), dtype=np.float32)
        crops = cropper.extract_compartments_from_slab(slab, plane='Coronal', laterality='L')

        expected_keys = {'medial', 'lateral', 'cruciate', 'patellofemoral', 'popliteal_perimeter'}
        self.assertEqual(set(crops.keys()), expected_keys)

        for key, patch in crops.items():
            self.assertEqual(patch.shape[0], 3) # retains 3 channels
            self.assertGreater(patch.shape[1], 50)
            self.assertGreater(patch.shape[2], 50)
            self.assertFalse(np.isnan(patch).any())

    def test_full_boundary_stratified_sampler(self):
        from monai_spatial_engine import FullBoundaryStratifiedSampler
        sampler = FullBoundaryStratifiedSampler(num_peripheral_slices=2, num_central_slices=4)
        vol = np.zeros((20, 64, 64), dtype=np.float32)
        indices = sampler.sample_indices(20)
        self.assertEqual(len(indices), 8)
        slab = sampler.extract_stratified_slab(vol)
        self.assertEqual(slab.shape, (8, 64, 64))

    def test_resample_slab_to_isotropic(self):
        slab = np.random.uniform(0.0, 1.0, size=(3, 256, 256)).astype(np.float32)
        original_spacing = (0.7, 0.7, 3.0)
        resampled = resample_slab_to_isotropic(
            slab,
            original_spacing=original_spacing,
            target_hw=(392, 392)
        )
        self.assertEqual(resampled.shape, (3, 392, 392))
        self.assertFalse(np.isnan(resampled).any())

    def test_extract_surface_mesh_metadata(self):
        volume_3d = np.zeros((10, 10, 10), dtype=np.float32)
        volume_3d[3:7, 3:7, 3:7] = 0.9 # central cube

        meta = extract_surface_mesh_metadata(volume_3d, threshold=0.5)
        self.assertEqual(meta["status"], "READY")
        self.assertEqual(meta["mesh_source"], "MONAI-MSD-Volumetric-Pipeline")
        self.assertEqual(meta["tissue_voxel_count"], 4 * 4 * 4) # 64
        self.assertAlmostEqual(meta["volume_fraction"], 64.0 / 1000.0, places=4)
        np.testing.assert_allclose(meta["center_of_mass_voxels"], [4.5, 4.5, 4.5])


if __name__ == '__main__':
    unittest.main()
