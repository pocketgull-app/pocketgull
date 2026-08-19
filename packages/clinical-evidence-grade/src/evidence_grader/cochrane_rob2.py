"""
Cochrane Risk of Bias 2 (RoB 2) Tool Engine for Randomized Trials.
"""

from evidence_grader.models import CochraneRoB2Assessment, RiskOfBiasTier


def evaluate_cochrane_rob2(
    title: str,
    randomized: bool,
    allocation_concealed: bool,
    blinded_participants: bool,
    blinded_assessors: bool,
    missing_outcome_pct: float,
    pre_registered_protocol: bool,
    doi: str | None = None,
) -> CochraneRoB2Assessment:
    """
    Evaluates a trial across the 5 Cochrane RoB 2 canonical domains:
    1. Randomization process
    2. Deviations from intended interventions
    3. Missing outcome data
    4. Measurement of outcome
    5. Selection of reported results
    """
    # D1: Randomization
    if randomized and allocation_concealed:
        d1 = RiskOfBiasTier.LOW
    elif randomized and not allocation_concealed:
        d1 = RiskOfBiasTier.SOME_CONCERNS
    else:
        d1 = RiskOfBiasTier.HIGH

    # D2: Deviations from intended interventions
    if blinded_participants:
        d2 = RiskOfBiasTier.LOW
    else:
        d2 = RiskOfBiasTier.SOME_CONCERNS

    # D3: Missing outcome data
    if missing_outcome_pct <= 5.0:
        d3 = RiskOfBiasTier.LOW
    elif missing_outcome_pct <= 20.0:
        d3 = RiskOfBiasTier.SOME_CONCERNS
    else:
        d3 = RiskOfBiasTier.HIGH

    # D4: Measurement of outcome
    if blinded_assessors:
        d4 = RiskOfBiasTier.LOW
    else:
        d4 = RiskOfBiasTier.SOME_CONCERNS

    # D5: Selection of reported result
    if pre_registered_protocol:
        d5 = RiskOfBiasTier.LOW
    else:
        d5 = RiskOfBiasTier.SOME_CONCERNS

    # Overall RoB 2 Decision Rule:
    # - Low risk in all domains -> Low risk overall
    # - Some concerns in at least 1 domain and no High risk -> Some concerns
    # - High risk in at least 1 domain OR Some concerns in multiple domains -> High risk
    domains = [d1, d2, d3, d4, d5]
    high_count = sum(1 for d in domains if d == RiskOfBiasTier.HIGH)
    some_concerns_count = sum(1 for d in domains if d == RiskOfBiasTier.SOME_CONCERNS)

    if high_count >= 1 or some_concerns_count >= 3:
        overall = RiskOfBiasTier.HIGH
        rationale = f"High risk of bias triggered due to {high_count} high-risk domains and {some_concerns_count} domain concerns."
    elif some_concerns_count >= 1:
        overall = RiskOfBiasTier.SOME_CONCERNS
        rationale = f"Some concerns identified across {some_concerns_count} domains."
    else:
        overall = RiskOfBiasTier.LOW
        rationale = "Low risk of bias verified across all 5 canonical Cochrane domains."

    return CochraneRoB2Assessment(
        doi=doi,
        title=title,
        d1_randomization=d1,
        d2_deviations=d2,
        d3_missing_data=d3,
        d4_measurement=d4,
        d5_reporting=d5,
        overall_rob=overall,
        rationale=rationale,
    )
