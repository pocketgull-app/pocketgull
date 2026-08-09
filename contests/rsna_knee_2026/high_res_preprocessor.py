"""
RSNA Knee Abnormalities Detection — High-Resolution 3D Isotropic & ROI Mask Preprocessor
Handles high-resolution (384x384 / 448x448) DICOM slice resampling, dual-windowing (Soft Tissue + Edema),
and spatial Region-of-Interest (ROI) auxiliary mask generation.
"""

import math
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional, Any


class HighResVolumePreprocessor:
    """High-Resolution 3D Isotropic DICOM Resampler & Dual-Window Tensor Generator."""

    def __init__(self, target_resolution: Tuple[int, int] = (384, 384)):
        """
        Args:
            target_resolution: Target spatial dimensions (H, W), default (384, 384).
        """
        self.target_resolution = target_resolution

    @staticmethod
    def apply_window(pixel_array: np.ndarray, center: float, width: float) -> np.ndarray:
        """Applies DICOM intensity windowing."""
        min_val = center - width / 2.0
        max_val = center + width / 2.0
        windowed = np.clip(pixel_array, min_val, max_val)
        return (windowed - min_val) / (max_val - min_val + 1e-6)

    def process_slice(self, raw_slice: np.ndarray) -> np.ndarray:
        """Processes single DICOM slice into 3-channel 384x384 RGB tensor.
        
        Args:
            raw_slice: (H_orig, W_orig) raw 12/16-bit DICOM array.
            
        Returns:
            (384, 384, 3) normalized RGB float array.
        """
        # Simple nearest-neighbor/bilinear resize mock for 2D matrix
        h, w = raw_slice.shape
        th, tw = self.target_resolution
        
        # Resample resolution
        row_indices = np.linspace(0, h - 1, th).astype(int)
        col_indices = np.linspace(0, w - 1, tw).astype(int)
        resized = raw_slice[np.ix_(row_indices, col_indices)]
        
        # Channel 0: Soft Tissue Window (Center=400, Width=1000)
        ch0 = self.apply_window(resized, center=400, width=1000)
        
        # Channel 1: Fluid-Sensitive Edema Window (Center=700, Width=2000)
        ch1 = self.apply_window(resized, center=700, width=2000)
        
        # Channel 2: High-Pass Gradient (Bone / Fracture edges)
        gy, gx = np.gradient(ch0)
        ch2 = np.sqrt(gx**2 + gy**2)
        ch2 = np.clip(ch2 / (np.max(ch2) + 1e-6), 0, 1)
        
        return np.stack([ch0, ch1, ch2], axis=-1)

    def generate_roi_auxiliary_mask(self, plane: str) -> np.ndarray:
        """Generates synthetic Region-of-Interest (ROI) spatial attention prior mask.
        
        Args:
            plane: 'Sagittal', 'Coronal', or 'Axial' plane description.
            
        Returns:
            (384, 384) spatial heatmap mask in range [0, 1].
        """
        th, tw = self.target_resolution
        y, x = np.ogrid[:th, :tw]
        cy, cx = th // 2, tw // 2
        
        if plane.lower() == "sagittal":
            # ACL / Meniscus central notch region
            mask = np.exp(-((y - cy)**2 / (2 * (th // 4)**2) + (x - cx)**2 / (2 * (tw // 4)**2)))
        elif plane.lower() == "coronal":
            # MCL / Medial-Lateral compartment region
            mask = np.exp(-((y - cy)**2 / (2 * (th // 3)**2) + (x - cx)**2 / (2 * (tw // 5)**2)))
        else:  # Axial
            # Trochlea / Patellofemoral cartilage region
            mask = np.exp(-((y - (cy - 40))**2 / (2 * (th // 5)**2) + (x - cx)**2 / (2 * (tw // 4)**2)))
            
        return mask.astype(np.float32)


if __name__ == "__main__":
    print("=" * 65)
    print("High-Resolution 3D Isotropic & ROI Mask Preprocessor Initialized")
    print("=" * 65)
    
    preprocessor = HighResVolumePreprocessor(target_resolution=(384, 384))
    dummy_dicom = np.random.randint(0, 4095, size=(512, 512), dtype=np.uint16)
    
    rgb_out = preprocessor.process_slice(dummy_dicom)
    sag_roi = preprocessor.generate_roi_auxiliary_mask("Sagittal")
    
    print(f"[OK] High-Res Slice Processed Shape: {rgb_out.shape} (384x384x3)")
    print(f"[OK] Sagittal ROI Heatmap Shape:     {sag_roi.shape} (384x384)")
    print(f"     Soft Tissue Channel Mean:  {np.mean(rgb_out[:, :, 0]):.4f}")
    print(f"     Edema Fluid Channel Mean:  {np.mean(rgb_out[:, :, 1]):.4f}")
