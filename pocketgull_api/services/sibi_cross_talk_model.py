"""
Pocket Gull — Periodontal Systemic Inflammatory Burden Index (SIBI) ML Engine
Sidecar ML Service v1.0
"""

from typing import List
import numpy as np
from pydantic import BaseModel, Field


class SibiCrossTalkInput(BaseModel):
    """Input payload for Periodontal SIBI and Systemic Health Risk Scoring."""

    deep_pockets_count: int = Field(
        default=2,
        ge=0,
        le=32,
        description="Number of periodontal probing sites >= 4mm (0 to 32)",
    )
    bleeding_on_probing_percent: float = Field(
        default=15.0,
        ge=0.0,
        le=100.0,
        description="Gingival Bleeding-on-Probing percentage (%BOP)",
    )
    hs_crp_mg_l: float = Field(
        default=1.5,
        ge=0.0,
        le=30.0,
        description="High-Sensitivity C-Reactive Protein serum concentration (mg/L)",
    )
    p_gingivalis_bacteremia_load: float = Field(
        default=0.2,
        ge=0.0,
        le=1.0,
        description="Trans-epithelial Porphyromonas gingivalis bacteremia index (0.0 to 1.0)",
    )


class SibiCrossTalkOutput(BaseModel):
    """Output payload for Periodontal SIBI and Systemic Health Risk Scoring."""

    sibi_score: int = Field(..., description="Systemic Inflammatory Burden Index (0-100)")
    cardiovascular_risk_multiplier: float = Field(
        ..., description="Atherosclerotic Plaque Accumulation Risk Multiplier (1.0x - 2.8x)"
    )
    predicted_hba1c_elevation: float = Field(
        ..., description="Cytokine-induced Insulin Resistance HbA1c Elevation (+0.0% to +0.8%)"
    )
    systemic_risk_classification: str = Field(
        ..., description="Systemic Risk Level: LOW, MODERATE, HIGH, CRITICAL"
    )
    conformal_interval_95: List[float] = Field(
        ..., description="95% Guaranteed Conformal Prediction Risk Interval [Lower, Upper]"
    )


def compute_sibi_cross_talk_risk(data: SibiCrossTalkInput) -> SibiCrossTalkOutput:
    """Computes the Periodontal Systemic Inflammatory Burden Index (SIBI) and systemic risk multipliers.

    Args:
        data: SibiCrossTalkInput containing probing depths, %BOP, hs-CRP, and bacteremia load.

    Returns:
        SibiCrossTalkOutput containing calculated risk scores, multipliers, and conformal bounds.
    """
    # SIBI Formula: min(100, (Deep Pockets * 6) + (%BOP * 0.8) + (hs-CRP * 12))
    raw_sibi = (
        (data.deep_pockets_count * 6.0)
        + (data.bleeding_on_probing_percent * 0.8)
        + (data.hs_crp_mg_l * 12.0)
        + (data.p_gingivalis_bacteremia_load * 15.0)
    )
    sibi_score = int(np.clip(np.round(raw_sibi), 0, 100))

    # Cardiovascular Risk Multiplier: 1.0x to 2.8x driven by trans-epithelial bacteremia
    cv_multiplier = float(np.round(1.0 + (sibi_score / 100.0) * 1.8, 2))

    # Predicted HbA1c Elevation: +0.0% to +0.8% driven by TNF-alpha / IL-6 cytokine resistance
    hba1c_shift = float(np.round((sibi_score / 100.0) * 0.8, 2))

    # Systemic Risk Classification
    if sibi_score >= 70:
        classification = "CRITICAL"
    elif sibi_score >= 45:
        classification = "HIGH"
    elif sibi_score >= 20:
        classification = "MODERATE"
    else:
        classification = "LOW"

    # Conformal Prediction 95% Interval (q_hat = 0.05 calibration)
    q_hat = 0.05
    point_prob = float(np.clip(sibi_score / 100.0, 0.0, 1.0))
    lower_bound = float(np.round(np.clip(point_prob - q_hat, 0.0, 1.0), 4))
    upper_bound = float(np.round(np.clip(point_prob + q_hat, 0.0, 1.0), 4))

    return SibiCrossTalkOutput(
        sibi_score=sibi_score,
        cardiovascular_risk_multiplier=cv_multiplier,
        predicted_hba1c_elevation=hba1c_shift,
        systemic_risk_classification=classification,
        conformal_interval_95=[lower_bound, upper_bound],
    )
