"""
Oxford Centre for Evidence-Based Medicine (OCEBM 2011) Classification Engine.
"""

from evidence_grader.models import StudyDesign, OxfordLevel, RiskOfBiasTier


def classify_oxford_level(
    design: StudyDesign,
    risk_of_bias: RiskOfBiasTier = RiskOfBiasTier.LOW,
    n_sample_size: int = 100,
) -> OxfordLevel:
    """
    Classifies a clinical study according to the Oxford CEBM 2011 hierarchy,
    with automatic downgrading for high risk of bias or severely underpowered sample sizes.
    """
    if design == StudyDesign.SYSTEMATIC_REVIEW_RCT:
        if risk_of_bias == RiskOfBiasTier.HIGH:
            return OxfordLevel.LEVEL_2
        return OxfordLevel.LEVEL_1

    elif design == StudyDesign.INDIVIDUAL_RCT:
        if risk_of_bias == RiskOfBiasTier.HIGH or n_sample_size < 30:
            return OxfordLevel.LEVEL_3
        return OxfordLevel.LEVEL_2

    elif design in [StudyDesign.PROSPECTIVE_COHORT, StudyDesign.RETROSPECTIVE_COHORT]:
        if risk_of_bias == RiskOfBiasTier.HIGH:
            return OxfordLevel.LEVEL_4
        return OxfordLevel.LEVEL_3

    elif design in [StudyDesign.CASE_CONTROL, StudyDesign.CROSS_SECTIONAL, StudyDesign.CASE_SERIES]:
        return OxfordLevel.LEVEL_4

    elif design in [StudyDesign.MECHANISTIC_BENCH, StudyDesign.EXPERT_OPINION]:
        return OxfordLevel.LEVEL_5

    return OxfordLevel.LEVEL_5
