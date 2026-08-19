"""
Unit Test Suite for Clinical Evidence Grader
Evaluates Landmark RCTs, Observational Studies, and Popperian Null Hypothesis Tests.
"""

from evidence_grader.models import (
    StudyDesign,
    OxfordLevel,
    RiskOfBiasTier,
    GRADECertainty,
)
from evidence_grader.ocebm import classify_oxford_level
from evidence_grader.cochrane_rob2 import evaluate_cochrane_rob2
from evidence_grader.grade import calculate_grade_certainty
from evidence_grader.skeptical_epistemology import evaluate_null_hypothesis


def test_landmark_rct_sprint_trial_evaluation():
    """
    Evaluates the SPRINT Trial (NEJM 2015):
    - Rigorous multi-center randomized controlled trial
    - Low risk of bias, pre-registered protocol, blinding of outcome assessors
    """
    rob2 = evaluate_cochrane_rob2(
        title="SPRINT: Intensive vs. Standard Blood-Pressure Control",
        randomized=True,
        allocation_concealed=True,
        blinded_participants=False,  # Open-label due to drug titration
        blinded_assessors=True,      # Blinded adjudication committee (PROBE design)
        missing_outcome_pct=1.2,
        pre_registered_protocol=True,
        doi="10.1056/NEJMoa1511939",
    )

    assert rob2.d1_randomization == RiskOfBiasTier.LOW
    assert rob2.d3_missing_data == RiskOfBiasTier.LOW
    assert rob2.d4_measurement == RiskOfBiasTier.LOW
    assert rob2.overall_rob in [RiskOfBiasTier.LOW, RiskOfBiasTier.SOME_CONCERNS]

    # Oxford CEBM classification
    oxford_lvl = classify_oxford_level(StudyDesign.INDIVIDUAL_RCT, risk_of_bias=rob2.overall_rob, n_sample_size=9361)
    assert oxford_lvl in [OxfordLevel.LEVEL_1, OxfordLevel.LEVEL_2]

    # GRADE Certainty
    grade_cert, downgrades, _ = calculate_grade_certainty(
        StudyDesign.INDIVIDUAL_RCT,
        risk_of_bias=rob2.overall_rob,
        inconsistency_i2_pct=0.0,
    )
    assert grade_cert in [GRADECertainty.HIGH, GRADECertainty.MODERATE]

    # Popperian Null-Hypothesis Test on SPRINT Primary Outcome (Systolic BP diff ~14 mmHg)
    stat_test = evaluate_null_hypothesis(
        mean_treatment=121.4,
        mean_control=136.2,
        std_treatment=12.1,
        std_control=13.0,
        n_treatment=4678,
        n_control=4683,
        alpha=0.05,
        metric_name="Systolic BP (mmHg)",
    )
    assert stat_test.reject_null is True
    assert stat_test.p_value < 0.0001
    assert stat_test.skeptical_warning is None


def test_observational_nutritional_study_with_high_bias():
    """
    Evaluates an un-randomized observational cohort study with high attrition and reporting bias.
    """
    rob2 = evaluate_cochrane_rob2(
        title="Observational Association of Dietary Nutrient on Longevity",
        randomized=False,
        allocation_concealed=False,
        blinded_participants=False,
        blinded_assessors=False,
        missing_outcome_pct=34.0,
        pre_registered_protocol=False,
    )

    assert rob2.overall_rob == RiskOfBiasTier.HIGH

    oxford_lvl = classify_oxford_level(StudyDesign.RETROSPECTIVE_COHORT, risk_of_bias=rob2.overall_rob)
    assert oxford_lvl == OxfordLevel.LEVEL_4

    grade_cert, downgrades, _ = calculate_grade_certainty(
        StudyDesign.RETROSPECTIVE_COHORT,
        risk_of_bias=rob2.overall_rob,
    )
    assert grade_cert in [GRADECertainty.LOW, GRADECertainty.VERY_LOW]
    assert len(downgrades) >= 1


def test_popperian_null_hypothesis_failure_triggers_skeptical_notice():
    """
    Verifies that when an intervention yields p >= 0.05, a skeptical warning notice is triggered.
    """
    stat_test = evaluate_null_hypothesis(
        mean_treatment=128.2,
        mean_control=128.5,
        std_treatment=14.0,
        std_control=14.0,
        n_treatment=30,
        n_control=30,
        alpha=0.05,
        metric_name="Serum Biomarker X",
    )

    assert stat_test.reject_null is False
    assert stat_test.p_value >= 0.05
    assert stat_test.skeptical_warning is not None
    assert "failed to reject the null hypothesis" in stat_test.skeptical_warning
