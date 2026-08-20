"""
FastAPI Microservice for Clinical Evidence Grading.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List

from evidence_grader.models import (
    StudyDesign,
    OxfordLevel,
    CochraneRoB2Assessment,
    GRADECertainty,
    RiskOfBiasTier,
    ClinicalEvidenceReport,
    NullHypothesisTestResult,
)
from evidence_grader.ocebm import classify_oxford_level
from evidence_grader.cochrane_rob2 import evaluate_cochrane_rob2
from evidence_grader.grade import calculate_grade_certainty
from evidence_grader.skeptical_epistemology import evaluate_null_hypothesis

app = FastAPI(
    title="Pocket-Gull Clinical Evidence & Epistemological Grading API",
    description="Oxford CEBM, Cochrane RoB 2, GRADE framework, and Popperian Null-Hypothesis testing service.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ComprehensiveEvaluationRequest(BaseModel):
    study_id: str
    study_title: str
    study_design: StudyDesign
    randomized: bool = True
    allocation_concealed: bool = True
    blinded_participants: bool = True
    blinded_assessors: bool = True
    missing_outcome_pct: float = 2.0
    pre_registered_protocol: bool = True
    inconsistency_i2_pct: float = 0.0
    indirectness: bool = False
    imprecision_wide_ci: bool = False
    publication_bias_detected: bool = False
    mean_treatment: float = 120.0
    mean_control: float = 135.0
    std_treatment: float = 10.0
    std_control: float = 12.0
    n_treatment: int = 150
    n_control: int = 150
    metric_name: str = "Systolic Blood Pressure (mmHg)"
    doi: Optional[str] = None


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "clinical-evidence-grade",
        "version": "1.0.0",
        "frameworks": ["Oxford CEBM 2011", "Cochrane RoB 2", "GRADE", "Popperian Null-Test"],
    }


@app.post("/api/v1/grade", response_model=ClinicalEvidenceReport)
def evaluate_study_evidence(req: ComprehensiveEvaluationRequest):
    # 1. Cochrane RoB 2 Evaluation
    rob2 = evaluate_cochrane_rob2(
        title=req.study_title,
        randomized=req.randomized,
        allocation_concealed=req.allocation_concealed,
        blinded_participants=req.blinded_participants,
        blinded_assessors=req.blinded_assessors,
        missing_outcome_pct=req.missing_outcome_pct,
        pre_registered_protocol=req.pre_registered_protocol,
        doi=req.doi,
    )

    # 2. Oxford CEBM Classification
    oxford_lvl = classify_oxford_level(
        design=req.study_design,
        risk_of_bias=rob2.overall_rob,
        n_sample_size=req.n_treatment + req.n_control,
    )

    # 3. GRADE Certainty Calculation
    grade_cert, downgrades, upgrades = calculate_grade_certainty(
        study_design=req.study_design,
        risk_of_bias=rob2.overall_rob,
        inconsistency_i2_pct=req.inconsistency_i2_pct,
        indirectness=req.indirectness,
        imprecision_wide_ci=req.imprecision_wide_ci,
        publication_bias_detected=req.publication_bias_detected,
    )

    # 4. Popperian Null Hypothesis Statistical Test
    stat_test = evaluate_null_hypothesis(
        mean_treatment=req.mean_treatment,
        mean_control=req.mean_control,
        std_treatment=req.std_treatment,
        std_control=req.std_control,
        n_treatment=req.n_treatment,
        n_control=req.n_control,
        metric_name=req.metric_name,
    )

    # 5. Resolve Actionability Tier
    if oxford_lvl == OxfordLevel.LEVEL_1 and grade_cert == GRADECertainty.HIGH and stat_test.reject_null:
        tier = "Tier A (Standard of Care - High Certainty RCT/Meta-Analysis)"
    elif oxford_lvl in [OxfordLevel.LEVEL_1, OxfordLevel.LEVEL_2] and stat_test.reject_null:
        tier = "Tier B (Supportive Clinical Evidence)"
    else:
        tier = "Tier C (Investigational / Biological Plausibility Only)"

    return ClinicalEvidenceReport(
        study_id=req.study_id,
        study_title=req.study_title,
        study_design=req.study_design,
        oxford_level=oxford_lvl,
        cochrane_rob2=rob2,
        grade_certainty=grade_cert,
        downgrade_factors=downgrades,
        upgrade_factors=upgrades,
        statistical_validation=stat_test,
        clinical_actionability_tier=tier,
    )
