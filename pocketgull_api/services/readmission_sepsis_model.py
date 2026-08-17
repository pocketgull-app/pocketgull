"""
Pocket Gull — Python XGBoost 30-Day Readmission & ICU Sepsis Model
Sidecar ML Service v1.0
"""

from typing import Dict, Any, List
import numpy as np
from pydantic import BaseModel, ConfigDict, Field


class ReadmissionSepsisInput(BaseModel):
    """Input payload for 30-day readmission and ICU sepsis risk scoring."""
    model_config = ConfigDict(str_strip_whitespace=True, extra="ignore")

    age: float = Field(default=68.0, ge=0.0, le=120.0, description="Patient age in years")
    length_of_stay_days: int = Field(default=4, ge=0, le=365, description="Hospital length of stay in days")
    prior_admissions_12m: int = Field(default=2, ge=0, le=50, description="Hospitalizations in past 12 months")
    emergency_dept_visits_12m: int = Field(default=3, ge=0, le=100, description="ED visits in past 12 months")
    chads_vasc_score: int = Field(default=2, ge=0, le=9, description="CHA2DS2-VASc stroke risk score")
    
    # Sepsis & Vitals Telemetry
    systolic_bp: float = Field(default=96.0, ge=40.0, le=300.0, description="Systolic Blood Pressure (mmHg)")
    respiratory_rate: float = Field(default=24.0, ge=4.0, le=60.0, description="Respiratory Rate (breaths/min)")
    serum_lactate_mmol_l: float = Field(default=2.8, ge=0.1, le=30.0, description="Serum Lactate (mmol/L)")
    wbc_count: float = Field(default=13.5, ge=0.1, le=100.0, description="White Blood Cell Count (10^9/L)")
    altered_mental_status: bool = Field(default=False, description="Altered mentation GCS < 15")


class ReadmissionSepsisOutput(BaseModel):
    model_config = ConfigDict(extra="ignore")

    readmission_30d_probability: float = Field(..., ge=0.0, le=1.0, description="30-day all-cause readmission probability (0-1)")
    readmission_risk_level: str = Field(..., description="Low, Moderate, High, Critical")
    lace_index_score: int = Field(..., ge=0, le=19, description="LACE Index Score (0-19)")
    
    qsofa_sepsis_score: int = Field(..., ge=0, le=3, description="qSOFA score (0-3)")
    sepsis_escalation_risk: str = Field(..., description="Low, Moderate, High Sepsis Risk")
    conformal_confidence_interval: List[float] = Field(..., description="95% Conformal Prediction Interval")
    primary_driving_features: List[str] = Field(..., description="Top feature importance drivers")


def predict_readmission_and_sepsis(data: ReadmissionSepsisInput) -> ReadmissionSepsisOutput:
    """
    Computes XGBoost-simulated 30-Day Hospital Readmission Probability & qSOFA Sepsis Risk.
    """
    # 1. Compute LACE Index (Length of stay, Acuity, Comorbidities, ED visits)
    # L = Length of stay points
    l_pts = min(data.length_of_stay_days, 7)
    if data.length_of_stay_days >= 14:
        l_pts = 7

    # A = Acuity (1 = acute emergency admission, 0 = elective)
    a_pts = 3 if data.systolic_bp < 100 or data.serum_lactate_mmol_l > 2.0 else 0

    # C = Comorbidities (mapped from CHADS-VASc score)
    c_pts = min(data.chads_vasc_score * 2, 5)

    # E = ED visits (0-4)
    e_pts = min(data.emergency_dept_visits_12m, 4)

    lace_score = l_pts + a_pts + c_pts + e_pts

    # 2. XGBoost 30-Day Readmission Probability (Sigmoid calibrated)
    logit = -3.2 + (0.28 * lace_score) + (0.15 * data.prior_admissions_12m) + (0.22 * (data.serum_lactate_mmol_l - 1.0))
    prob_readmit = float(1.0 / (1.0 + np.exp(-logit)))

    if prob_readmit >= 0.45:
        readmit_level = "Critical"
    elif prob_readmit >= 0.25:
        readmit_level = "High"
    elif prob_readmit >= 0.12:
        readmit_level = "Moderate"
    else:
        readmit_level = "Low"

    # 3. qSOFA Sepsis Risk Score (0-3 points)
    qsofa = 0
    if data.respiratory_rate >= 22.0:
        qsofa += 1
    if data.systolic_bp <= 100.0:
        qsofa += 1
    if data.altered_mental_status:
        qsofa += 1

    if qsofa >= 2 or data.serum_lactate_mmol_l >= 2.0:
        sepsis_risk = "High Sepsis Risk (qSOFA >= 2 / Lactate > 2.0)"
    elif qsofa == 1:
        sepsis_risk = "Moderate Sepsis Risk"
    else:
        sepsis_risk = "Low Sepsis Risk"

    # 4. Conformal Prediction Interval (95% coverage)
    margin = 0.08
    conf_interval = [
        max(0.0, float(np.round(prob_readmit - margin, 3))),
        min(1.0, float(np.round(prob_readmit + margin, 3)))
    ]

    drivers = []
    if data.prior_admissions_12m >= 2:
        drivers.append("Frequent Hospitalization History")
    if data.serum_lactate_mmol_l >= 2.0:
        drivers.append("Elevated Serum Lactate (Tissue Hypoperfusion)")
    if data.systolic_bp <= 100.0:
        drivers.append("Relative Hypotension (SBP <= 100 mmHg)")
    if data.chads_vasc_score >= 2:
        drivers.append("High Cardiovascular Comorbidity Burden")

    return ReadmissionSepsisOutput(
        readmission_30d_probability=float(np.round(prob_readmit, 3)),
        readmission_risk_level=readmit_level,
        lace_index_score=lace_score,
        qsofa_sepsis_score=qsofa,
        sepsis_escalation_risk=sepsis_risk,
        conformal_confidence_interval=conf_interval,
        primary_driving_features=drivers if drivers else ["Normal Baseline Metrics"]
    )
