"""
RSNA Knee Abnormalities Detection — Exploratory Data Analysis & Metadata Parser
Comprehensive tools for DICOM MRI sequence analysis, multilingual radiology report processing,
target co-occurrence analysis, and leakage-free validation splitting.
"""

import os
import re
import math
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional, Any
from sklearn.model_selection import KFold
try:
    import pydicom
except ImportError:
    pydicom = None  # Handled gracefully by DicomMetadataParser


# 12 Competition Target Abnormalities
TARGET_COLS: List[str] = [
    "acl",
    "mcl",
    "medial_meniscus",
    "lateral_meniscus",
    "medial_oa",
    "lateral_oa",
    "pf_oa",
    "effusion",
    "synovitis",
    "bakers_cyst",
    "contusion",
    "fracture",
]


class DicomMetadataParser:
    """Extracts geometric, sequence, and technical metadata from DICOM headers."""

    @staticmethod
    def determine_plane(orientation_cosines: List[float]) -> str:
        """Determines scan plane (Sagittal, Coronal, Axial) from ImageOrientationPatient.
        
        Args:
            orientation_cosines: 6-element list [rx, ry, rz, cx, cy, cz]
            
        Returns:
            str: 'Sagittal', 'Coronal', 'Axial', or 'Unknown'
        """
        if not orientation_cosines or len(orientation_cosines) < 6:
            return "Unknown"
            
        r = np.array(orientation_cosines[:3])
        c = np.array(orientation_cosines[3:6])
        normal = np.cross(r, c)
        normal = np.abs(normal)
        
        max_idx = np.argmax(normal)
        if max_idx == 0:
            return "Sagittal"
        elif max_idx == 1:
            return "Coronal"
        elif max_idx == 2:
            return "Axial"
        return "Unknown"

    @staticmethod
    def infer_sequence_type(series_description: str, echo_time: Optional[float] = None, repetition_time: Optional[float] = None) -> str:
        """Infers MRI sequence contrast (T1, T2, PD-FS, etc.) from series metadata.
        
        Args:
            series_description: DICOM SeriesDescription string
            echo_time: Echo Time (TE) in ms
            repetition_time: Repetition Time (TR) in ms
            
        Returns:
            str: Inferred sequence name
        """
        desc = (series_description or "").upper()
        if "PDFS" in desc or "PD_FS" in desc or ("PD" in desc and "FAT" in desc) or "STIR" in desc:
            return "PD-FS"
        elif "T2" in desc:
            return "T2"
        elif "T1" in desc:
            return "T1"
        elif "PD" in desc:
            return "PD"
            
        # Fallback to TE / TR heuristics if description is uninformative
        if echo_time is not None and repetition_time is not None:
            if repetition_time > 1500 and echo_time > 60:
                return "T2"
            elif repetition_time < 800 and echo_time < 30:
                return "T1"
            elif repetition_time > 1500 and echo_time < 40:
                return "PD"
                
        return "Other"

    @classmethod
    def parse_file(cls, dcm_path: str) -> Dict[str, Any]:
        """Parses a DICOM file and returns structured metadata.
        
        Args:
            dcm_path: Path to DICOM file.
            
        Returns:
            Dict containing DICOM tags and inferred plane/sequence attributes.
        """
        if pydicom is None:
            return {"file_path": dcm_path, "error": "pydicom module not installed. Please run: pip install pydicom"}
            
        try:
            dcm = pydicom.dcmread(dcm_path, stop_before_pixels=True)
            iop = getattr(dcm, "ImageOrientationPatient", None)
            iop_list = [float(x) for x in iop] if iop else []
            plane = cls.determine_plane(iop_list)
            
            series_desc = str(getattr(dcm, "SeriesDescription", ""))
            te = float(getattr(dcm, "EchoTime", 0.0)) if hasattr(dcm, "EchoTime") else None
            tr = float(getattr(dcm, "RepetitionTime", 0.0)) if hasattr(dcm, "RepetitionTime") else None
            sequence = cls.infer_sequence_type(series_desc, te, tr)
            is_fluid_sensitive = sequence in ["PD-FS", "T2", "STIR"] or "FS" in series_desc.upper() or "FAT" in series_desc.upper()
            
            spacing = getattr(dcm, "PixelSpacing", [1.0, 1.0])
            pixel_spacing = [float(x) for x in spacing] if spacing else [1.0, 1.0]
            
            return {
                "file_path": dcm_path,
                "patient_id": str(getattr(dcm, "PatientID", "Unknown")),
                "study_instance_uid": str(getattr(dcm, "StudyInstanceUID", "Unknown")),
                "series_instance_uid": str(getattr(dcm, "SeriesInstanceUID", "Unknown")),
                "series_description": series_desc,
                "plane": plane,
                "sequence": sequence,
                "is_fluid_sensitive": is_fluid_sensitive,
                "rows": int(getattr(dcm, "Rows", 0)),
                "columns": int(getattr(dcm, "Columns", 0)),
                "slice_thickness": float(getattr(dcm, "SliceThickness", 0.0)) if hasattr(dcm, "SliceThickness") else 1.0,
                "pixel_spacing_row": pixel_spacing[0],
                "pixel_spacing_col": pixel_spacing[1],
                "window_center": float(getattr(dcm, "WindowCenter", 0.0)),
                "window_width": float(getattr(dcm, "WindowWidth", 0.0)),
            }
        except Exception as err:
            return {"file_path": dcm_path, "error": str(err)}


class RadiologyReportAnalyzer:
    """Analyzes radiology free-text reports across multiple languages."""

    CLINICAL_KEYWORDS: Dict[str, List[str]] = {
        "acl": ["acl", "anterior cruciate", "ligamento cruzado anterior", "croisé antérieur", "vorderes kreuzband"],
        "mcl": ["mcl", "medial collateral", "ligamento colateral medial", "collatéral médial", "innenband"],
        "medial_meniscus": ["medial meniscus", "menisco medial", "ménisque médial", "innenmeniscus"],
        "lateral_meniscus": ["lateral meniscus", "menisco lateral", "ménisque latéral", "aussenmeniscus"],
        "effusion": ["effusion", "derrames", "épanchement", "gelenkerguss", "fluid"],
        "fracture": ["fracture", "fractura", "fraktur"],
        "contusion": ["contusion", "bone bruise", "edema óseo", "épanchement osseux", "knochenödem"],
    }

    @classmethod
    def analyze_report(cls, text: str) -> Dict[str, Any]:
        """Extracts text statistics and keyword indicators from a radiology report.
        
        Args:
            text: Raw report string.
            
        Returns:
            Dict containing length, word count, and target keyword matches.
        """
        clean_text = (text or "").strip()
        words = re.findall(r"\w+", clean_text.lower())
        
        keyword_hits = {}
        text_lower = clean_text.lower()
        for target, kw_list in cls.CLINICAL_KEYWORDS.items():
            keyword_hits[f"kw_mention_{target}"] = any(kw in text_lower for kw in kw_list)
            
        return {
            "char_count": len(clean_text),
            "word_count": len(words),
            "is_empty": len(clean_text) == 0,
            **keyword_hits,
        }


class LabelDistributionAnalyzer:
    """Computes target label distributions, positivity rates, and co-occurrence matrices."""

    @staticmethod
    def compute_summary(df: pd.DataFrame, target_cols: List[str] = TARGET_COLS) -> pd.DataFrame:
        """Computes count, positive count, and positivity percentage per target.
        
        Args:
            df: DataFrame containing target binary columns.
            target_cols: List of target column names.
            
        Returns:
            pd.DataFrame summary table.
        """
        records = []
        total = len(df)
        for col in target_cols:
            positives = int(df[col].sum()) if col in df.columns else 0
            rate = (positives / total) * 100.0 if total > 0 else 0.0
            records.append({
                "target": col,
                "total_studies": total,
                "positive_count": positives,
                "positivity_rate_pct": round(rate, 2),
                "imbalance_ratio": round((total - positives) / max(1, positives), 2),
            })
        return pd.DataFrame(records)

    @staticmethod
    def compute_cooccurrence_matrix(df: pd.DataFrame, target_cols: List[str] = TARGET_COLS) -> pd.DataFrame:
        """Computes co-occurrence counts matrix between all pairs of targets.
        
        Args:
            df: DataFrame containing binary target columns.
            target_cols: List of target column names.
            
        Returns:
            pd.DataFrame (12x12) co-occurrence matrix.
        """
        available = [c for c in target_cols if c in df.columns]
        matrix = df[available].T.dot(df[available])
        return matrix


class ValidationSplitter:
    """Generates leakage-free GroupKFold splits on patient_id."""

    @staticmethod
    def create_grouped_folds(df: pd.DataFrame, n_splits: int = 5, group_col: str = "patient_id") -> pd.DataFrame:
        """Applies GroupKFold on patient_id to ensure no patient overlap across folds.
        
        Args:
            df: DataFrame with group_col.
            n_splits: Number of folds (default 5).
            group_col: Patient grouping column name.
            
        Returns:
            pd.DataFrame with added 'fold' column (0 to n_splits-1).
        """
        df_out = df.copy()
        df_out["fold"] = -1
        
        groups = df_out[group_col].values
        unique_groups = np.unique(groups)
        
        kf = KFold(n_splits=n_splits, shuffle=True, random_state=42)
        for fold, (_, val_group_idx) in enumerate(kf.split(unique_groups)):
            val_groups = set(unique_groups[val_group_idx])
            df_out.loc[df_out[group_col].isin(val_groups), "fold"] = fold
            
        return df_out


if __name__ == "__main__":
    print("=" * 60)
    print("RSNA Knee Abnormalities Detection — EDA & Metadata Suite")
    print("=" * 60)
    
    # Demonstration on Synthetic Sample Data
    np.random.seed(42)
    sample_size = 250
    patient_ids = [f"PAT_{i:04d}" for i in np.random.randint(1, 100, size=sample_size)]
    study_ids = [f"STUDY_{i:04d}" for i in range(sample_size)]
    
    synthetic_df = pd.DataFrame({"study_id": study_ids, "patient_id": patient_ids})
    for col in TARGET_COLS:
        prob = np.random.uniform(0.05, 0.40)
        synthetic_df[col] = np.random.binomial(1, prob, size=sample_size)
        
    print("\n--- Target Label Distribution ---")
    summary = LabelDistributionAnalyzer.compute_summary(synthetic_df)
    print(summary.to_string(index=False))
    
    print("\n--- GroupKFold Patient Leakage Check ---")
    fold_df = ValidationSplitter.create_grouped_folds(synthetic_df, n_splits=5)
    patient_overlap = False
    for f in range(5):
        val_pats = set(fold_df[fold_df["fold"] == f]["patient_id"])
        train_pats = set(fold_df[fold_df["fold"] != f]["patient_id"])
        intersection = val_pats.intersection(train_pats)
        if intersection:
            patient_overlap = True
            print(f"Fold {f} HAS LEAKAGE! Overlapping patients: {len(intersection)}")
    if not patient_overlap:
        print("Success: Zero patient leakage verified across all 5 folds.")
        
    print("\n--- Plane Orientation Cosine Test ---")
    sag_cosines = [0.0, 1.0, 0.0, 0.0, 0.0, -1.0] # Sagittal plane
    cor_cosines = [1.0, 0.0, 0.0, 0.0, 0.0, -1.0] # Coronal plane
    ax_cosines = [1.0, 0.0, 0.0, 0.0, 1.0, 0.0]  # Axial plane
    print(f"Sagittal Test: {DicomMetadataParser.determine_plane(sag_cosines)}")
    print(f"Coronal Test:  {DicomMetadataParser.determine_plane(cor_cosines)}")
    print(f"Axial Test:    {DicomMetadataParser.determine_plane(ax_cosines)}")
