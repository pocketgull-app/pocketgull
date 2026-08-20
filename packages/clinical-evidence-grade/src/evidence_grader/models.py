"""
Pydantic v2 Models for Evidence-Based Medicine & Epistemological Grading.
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class StudyDesign(str, Enum):
    SYSTEMATIC_REVIEW_RCT = "systematic_review_rct"
    INDIVIDUAL_RCT = "individual_rct"
    PROSPECTIVE_COHORT = "prospective_cohort"
    RETROSPECTIVE_COHORT = "retrospective_cohort"
    CASE_CONTROL = "case_control"
    CROSS_SECTIONAL = "cross_sectional"
    CASE_SERIES = "case_series"
    MECHANISTIC_BENCH = "mechanistic_bench"
    EXPERT_OPINION = "expert_opinion"


class OxfordLevel(str, Enum):
    LEVEL_1 = "Level 1 (Systematic Review / High-Quality RCT)"
    LEVEL_2 = "Level 2 (Individual RCT / Inception Cohort)"
    LEVEL_3 = "Level 3 (Non-Randomized Cohort / Follow-up)"
    LEVEL_4 = "Level 4 (Case-Series / Case-Control)"
    LEVEL_5 = "Level 5 (Mechanistic Reasoning / Expert Opinion)"


class RiskOfBiasTier(str, Enum):
    LOW = "Low Risk of Bias"
    SOME_CONCERNS = "Some Concerns"
    HIGH = "High Risk of Bias"


class GRADECertainty(str, Enum):
    HIGH = "High (Very confident that true effect lies close to estimate)"
    MODERATE = "Moderate (Moderately confident in effect estimate)"
    LOW = "Low (Confidence in effect estimate is limited)"
    VERY_LOW = "Very Low (Very little confidence in effect estimate)"


class CochraneRoB2Assessment(BaseModel):
    doi: Optional[str] = Field(None, description="Digital Object Identifier")
    title: str = Field(..., description="Study title")
    d1_randomization: RiskOfBiasTier = Field(
        ..., description="Domain 1: Randomization process"
    )
    d2_deviations: RiskOfBiasTier = Field(
        ..., description="Domain 2: Deviations from intended interventions"
    )
    d3_missing_data: RiskOfBiasTier = Field(
        ..., description="Domain 3: Missing outcome data"
    )
    d4_measurement: RiskOfBiasTier = Field(
        ..., description="Domain 4: Measurement of outcome"
    )
    d5_reporting: RiskOfBiasTier = Field(
        ..., description="Domain 5: Selection of reported result"
    )
    overall_rob: RiskOfBiasTier = Field(..., description="Overall Risk of Bias rating")
    rationale: str = Field(..., description="Structured clinical justification")


class NullHypothesisTestResult(BaseModel):
    test_statistic: float = Field(..., description="Calculated t, z, or chi-square statistic")
    p_value: float = Field(..., description="Popperian null-hypothesis p-value")
    reject_null: bool = Field(
        ..., description="True if p < alpha (default 0.05), rejecting H0"
    )
    alpha: float = Field(default=0.05, description="Significance threshold")
    confidence_interval_95: tuple[float, float] = Field(
        ..., description="95% Confidence Interval"
    )
    skeptical_warning: Optional[str] = Field(
        None, description="Disclosed when p >= 0.05 or confidence interval crosses null"
    )


class ClinicalEvidenceReport(BaseModel):
    study_id: str
    study_title: str
    study_design: StudyDesign
    oxford_level: OxfordLevel
    cochrane_rob2: CochraneRoB2Assessment
    grade_certainty: GRADECertainty
    downgrade_factors: List[str] = Field(default_factory=list)
    upgrade_factors: List[str] = Field(default_factory=list)
    statistical_validation: NullHypothesisTestResult
    clinical_actionability_tier: str = Field(
        ..., description="Tier A (Practice Standard), Tier B (Supportive), Tier C (Investigational)"
    )
