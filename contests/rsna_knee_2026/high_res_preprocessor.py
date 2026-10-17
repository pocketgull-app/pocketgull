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

    def generate_anatomical_compartment_masks(self, plane: str) -> Dict[str, np.ndarray]:
        """Generates multi-compartment anatomical landmark ROI masks grounded in
        Anterior (Kneecap) and Lateral (Knee) orthopedic reference diagrams.

        Args:
            plane: 'Sagittal', 'Coronal', or 'Axial' plane description.

        Returns:
            Dictionary mapping anatomical structure names to (H, W) float32 heatmaps in [0, 1].
        """
        th, tw = self.target_resolution
        y, x = np.ogrid[:th, :tw]
        p_low = plane.lower()

        if p_low == "sagittal":
            # 1. Extensor Mechanism (Quadriceps Tendon -> Patella -> Patellar Tendon -> Tibial Tuberosity)
            extensor = np.exp(
                -((y - int(th * 0.48)) ** 2 / (2 * (th * 0.24) ** 2)
                  + (x - int(tw * 0.24)) ** 2 / (2 * (tw * 0.10) ** 2))
            )
            # 2. Blumensaat's Intercondylar Notch (ACL / PCL Cruciate Complex)
            cruciate_notch = np.exp(
                -((y - int(th * 0.50)) ** 2 / (2 * (th * 0.12) ** 2)
                  + (x - int(tw * 0.50)) ** 2 / (2 * (tw * 0.12) ** 2))
            )
            # 3. Tibiofemoral Meniscal & Kissing Contusion Horizon
            meniscal_horizon = np.exp(
                -((y - int(th * 0.56)) ** 2 / (2 * (th * 0.07) ** 2)
                  + (x - int(tw * 0.48)) ** 2 / (2 * (tw * 0.18) ** 2))
            )
            # 4. Posterior Hamstrings & Popliteal Bursa (Biceps Femoris / Semimembranosus / Baker's)
            popliteal_hamstring = np.exp(
                -((y - int(th * 0.58)) ** 2 / (2 * (th * 0.18) ** 2)
                  + (x - int(tw * 0.76)) ** 2 / (2 * (tw * 0.12) ** 2))
            )
            return {
                "extensor_mechanism": extensor.astype(np.float32),
                "cruciate_notch": cruciate_notch.astype(np.float32),
                "meniscal_horizon": meniscal_horizon.astype(np.float32),
                "popliteal_hamstring": popliteal_hamstring.astype(np.float32),
            }

        if p_low == "coronal":
            # 1. Tibiofemoral Joint Line & Meniscal Wedges (Medial & Lateral)
            joint_line = np.exp(
                -((y - int(th * 0.52)) ** 2 / (2 * (th * 0.08) ** 2)
                  + (x - int(tw * 0.50)) ** 2 / (2 * (tw * 0.26) ** 2))
            )
            # 2. Collateral Ligament Corridors (MCL Medial & LCL Lateral to Fibular Head)
            medial_collateral = np.exp(
                -((y - int(th * 0.50)) ** 2 / (2 * (th * 0.20) ** 2)
                  + (x - int(tw * 0.22)) ** 2 / (2 * (tw * 0.08) ** 2))
            )
            lateral_fibular = np.exp(
                -((y - int(th * 0.62)) ** 2 / (2 * (th * 0.18) ** 2)
                  + (x - int(tw * 0.78)) ** 2 / (2 * (tw * 0.09) ** 2))
            )
            # 3. Central Patellar / Quadriceps Superficial Window
            central_patella = np.exp(
                -((y - int(th * 0.44)) ** 2 / (2 * (th * 0.14) ** 2)
                  + (x - int(tw * 0.50)) ** 2 / (2 * (tw * 0.12) ** 2))
            )
            return {
                "joint_line": joint_line.astype(np.float32),
                "medial_collateral": medial_collateral.astype(np.float32),
                "lateral_fibular": lateral_fibular.astype(np.float32),
                "central_patella": central_patella.astype(np.float32),
            }

        # Axial plane: Patellofemoral Trochlear Groove (Anterior) & Popliteal Bursa (Posterior)
        patellofemoral = np.exp(
            -((y - int(th * 0.26)) ** 2 / (2 * (th * 0.12) ** 2)
              + (x - int(tw * 0.50)) ** 2 / (2 * (tw * 0.18) ** 2))
        )
        popliteal_cyst = np.exp(
            -((y - int(th * 0.76)) ** 2 / (2 * (th * 0.14) ** 2)
              + (x - int(tw * 0.38)) ** 2 / (2 * (tw * 0.18) ** 2))
        )
        return {
            "patellofemoral": patellofemoral.astype(np.float32),
            "popliteal_cyst": popliteal_cyst.astype(np.float32),
        }

    def generate_roi_auxiliary_mask(self, plane: str) -> np.ndarray:
        """Generates composite Region-of-Interest (ROI) spatial attention prior mask
        by fusing the multi-compartment anatomical landmark heatmaps.

        Args:
            plane: 'Sagittal', 'Coronal', or 'Axial' plane description.

        Returns:
            (384, 384) spatial heatmap mask in range [0, 1].
        """
        compartments = self.generate_anatomical_compartment_masks(plane)
        combined = np.zeros(self.target_resolution, dtype=np.float32)
        for sub_mask in compartments.values():
            combined = np.maximum(combined, sub_mask)
        return np.clip(combined, 0.0, 1.0).astype(np.float32)

    @staticmethod
    def detect_coronal_fibular_side(coronal_slice: np.ndarray) -> str:
        """Detects which side ('right_col' or 'left_col') of a Coronal knee slice contains
        the Fibular Head (anatomical Lateral anchor from Reference Diagram 1).

        In a coronal knee slice, the fibular head projects as a distinct cortical structure
        in the inferior-outer quadrant (y in [0.58*H, 0.88*H]).

        Args:
            coronal_slice: 2D numpy array of a coronal knee MRI slice.

        Returns:
            'right_col' if lateral/fibula is on the right half (x >= W/2),
            'left_col' if lateral/fibula is on the left half (x < W/2).
        """
        h, w = coronal_slice.shape
        y0, y1 = int(h * 0.58), int(h * 0.88)
        inf_band = coronal_slice[y0:y1, :].astype(np.float32)
        if inf_band.size == 0:
            return "right_col"
        gy, gx = np.gradient(inf_band)
        grad_mag = np.sqrt(gx ** 2 + gy ** 2)
        left_outer = np.mean(grad_mag[:, : max(1, int(w * 0.28))])
        right_outer = np.mean(grad_mag[:, int(w * 0.72) :])
        return "right_col" if right_outer >= left_outer else "left_col"


if __name__ == "__main__":
    print("=" * 65)
    print("High-Resolution 3D Isotropic & Anatomical ROI Preprocessor Initialized")
    print("=" * 65)

    preprocessor = HighResVolumePreprocessor(target_resolution=(384, 384))
    dummy_dicom = np.random.randint(0, 4095, size=(512, 512), dtype=np.uint16)

    rgb_out = preprocessor.process_slice(dummy_dicom)
    sag_roi = preprocessor.generate_roi_auxiliary_mask("Sagittal")
    sag_parts = preprocessor.generate_anatomical_compartment_masks("Sagittal")
    fib_side = preprocessor.detect_coronal_fibular_side(dummy_dicom)

    print(f"[OK] High-Res Slice Processed Shape: {rgb_out.shape} (384x384x3)")
    print(f"[OK] Sagittal Composite ROI Shape:   {sag_roi.shape} (384x384)")
    print(f"[OK] Sagittal Compartments:          {list(sag_parts.keys())}")
    print(f"[OK] Coronal Fibular Anchor Side:    {fib_side}")
    print(f"     Soft Tissue Channel Mean:  {np.mean(rgb_out[:, :, 0]):.4f}")
    print(f"     Edema Fluid Channel Mean:  {np.mean(rgb_out[:, :, 1]):.4f}")

