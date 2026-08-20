"""
GRADE (Grading of Recommendations Assessment, Development and Evaluation) Engine.
"""

from evidence_grader.models import StudyDesign, RiskOfBiasTier, GRADECertainty


def calculate_grade_certainty(
    study_design: StudyDesign,
    risk_of_bias: RiskOfBiasTier,
    inconsistency_i2_pct: float = 0.0,
    indirectness: bool = False,
    imprecision_wide_ci: bool = False,
    publication_bias_detected: bool = False,
    large_effect_size_rr_gt_2: bool = False,
    dose_response_gradient: bool = False,
) -> tuple[GRADECertainty, list[str], list[str]]:
    """
    Computes GRADE certainty rating by establishing baseline score per study design,
    applying 5 standard downgrade domains, and 3 standard upgrade domains.
    """
    # 1. Starting certainty level: RCTs start HIGH (4), Observational starts LOW (2)
    if study_design in [StudyDesign.SYSTEMATIC_REVIEW_RCT, StudyDesign.INDIVIDUAL_RCT]:
        score = 4
    elif study_design in [StudyDesign.PROSPECTIVE_COHORT, StudyDesign.RETROSPECTIVE_COHORT]:
        score = 2
    else:
        score = 1

    downgrades: list[str] = []
    upgrades: list[str] = []

    # 2. Downgrade Factors
    # A. Risk of Bias
    if risk_of_bias == RiskOfBiasTier.HIGH:
        score -= 2
        downgrades.append("Very serious risk of bias (-2)")
    elif risk_of_bias == RiskOfBiasTier.SOME_CONCERNS:
        score -= 1
        downgrades.append("Serious risk of bias (-1)")

    # B. Inconsistency (Heterogeneity)
    if inconsistency_i2_pct > 60.0:
        score -= 1
        downgrades.append(f"Substantial heterogeneity I^2 = {inconsistency_i2_pct:.1f}% (-1)")

    # C. Indirectness
    if indirectness:
        score -= 1
        downgrades.append("Indirectness of population or surrogate outcomes (-1)")

    # D. Imprecision
    if imprecision_wide_ci:
        score -= 1
        downgrades.append("Imprecision with wide confidence intervals crossing clinical boundaries (-1)")

    # E. Publication Bias
    if publication_bias_detected:
        score -= 1
        downgrades.append("Strongly suspected publication bias (-1)")

    # 3. Upgrade Factors (Only applicable if no major downgrades)
    if score >= 2:
        if large_effect_size_rr_gt_2:
            score += 1
            upgrades.append("Large magnitude of effect (RR > 2.0 or < 0.5) (+1)")
        if dose_response_gradient:
            score += 1
            upgrades.append("Evidence of biological dose-response gradient (+1)")

    # Clamp score to [1, 4]
    score = max(1, min(4, score))

    certainty_map = {
        4: GRADECertainty.HIGH,
        3: GRADECertainty.MODERATE,
        2: GRADECertainty.LOW,
        1: GRADECertainty.VERY_LOW,
    }

    return certainty_map[score], downgrades, upgrades
