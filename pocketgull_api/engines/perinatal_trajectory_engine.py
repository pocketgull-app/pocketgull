"""
PocketGull Perinatal Hemodynamics & Postpartum Mood Trajectory Engine
Implements ACOG & NICE maternal guidelines:
1. Gestational Mean Arterial Pressure (MAP) & Preeclampsia screening.
2. Longitudinal Edinburgh Postnatal Depression Scale (EPDS) trajectory slope.
3. Postpartum / Lactation Micronutrient Repletion Requirements (Choline, DHA, Iron, Folate).
"""

import json
import numpy as np
from typing import Dict, Any, List

class PerinatalTrajectoryEngine:
    """Evaluates maternal perinatal hemodynamics, mood trajectories, and lactation kinetics."""

    def evaluate_maternal_trajectory(
        self,
        gestational_age_weeks: float = 28.0,
        is_postpartum: bool = False,
        postpartum_weeks: float = 0.0,
        systolic_bp: float = 124.0,
        diastolic_bp: float = 78.0,
        current_epds_score: int = 8,
        prior_epds_score: int = 6,
        days_between_epds_screens: int = 30,
        is_lactating: bool = True,
        serum_ferritin_ug_l: float = 35.0
    ) -> Dict[str, Any]:
        """Computes perinatal risk profile and care directives."""
        
        # Mean Arterial Pressure (MAP = (2*DBP + SBP) / 3)
        map_val = round((2.0 * diastolic_bp + systolic_bp) / 3.0, 1)

        # Gestational Hypertension / Preeclampsia risk
        if is_postpartum:
            preeclampsia_risk_tier = "POSTPARTUM_MONITORING"
            preeclampsia_prob = round(0.04 + (0.15 if map_val > 95.0 else 0.0), 3)
        else:
            # 2nd/3rd trimester threshold: MAP > 90 mmHg increases preeclampsia odds
            if map_val >= 95.0 or systolic_bp >= 140.0 or diastolic_bp >= 90.0:
                preeclampsia_risk_tier = "HIGH_STAGE_EVALUATION"
                preeclampsia_prob = 0.38
            elif map_val >= 88.0:
                preeclampsia_risk_tier = "MODERATE_ELEVATION"
                preeclampsia_prob = 0.16
            else:
                preeclampsia_risk_tier = "OPTIMAL_GESTATIONAL_HEMODYNAMICS"
                preeclampsia_prob = 0.03

        # EPDS Mood Trajectory Slope (Points per 30 days)
        if days_between_epds_screens > 0:
            epds_slope_per_month = round(((current_epds_score - prior_epds_score) / days_between_epds_screens) * 30.0, 2)
        else:
            epds_slope_per_month = 0.0

        if current_epds_score >= 13 or (current_epds_score >= 10 and epds_slope_per_month > 2.0):
            epds_risk_trajectory = "ESCALATING_POSTPARTUM_DEPRESSION_RISK"
            epds_alert = "CRITICAL_ACTION: EPDS score exceeds clinical threshold (>=13) or demonstrates rapid escalation. Urgent maternal mental health support indicated."
        elif current_epds_score >= 10:
            epds_risk_trajectory = "MODERATE_SUBCLINICAL_DYSPHORIA"
            epds_alert = "ATTENTION: Subclinical dysphoria detected. Increase supportive social framework and repeat EPDS in 14 days."
        else:
            epds_risk_trajectory = "STABLE_PERINATAL_MOOD"
            epds_alert = "NORMAL: Mood stability index within expected physiological limits."

        # Lactation micronutrient requirements
        lactation_plan = []
        if is_lactating or (not is_postpartum and gestational_age_weeks >= 34.0):
            lactation_plan.append("Choline: 550mg daily (critical for infant neurodevelopment & breastmilk lipid transfer)")
            lactation_plan.append("DHA / EPA: 300mg elemental DHA daily")
            if serum_ferritin_ug_l < 50.0:
                lactation_plan.append("Iron Bisglycinate: 25-45mg elemental iron with Vitamin C to replete depleted maternal bone marrow stores")
            lactation_plan.append("Hydration Base: Minimum 2.8 - 3.2 L fluid daily with trace electrolytes")

        return {
            "gestational_stage": f"Postpartum Week {postpartum_weeks:.0f}" if is_postpartum else f"Gestational Week {gestational_age_weeks:.0f}",
            "mean_arterial_pressure_mmhg": map_val,
            "preeclampsia_screening": {
                "risk_tier": preeclampsia_risk_tier,
                "probability": preeclampsia_prob,
                "sbp_dbp": f"{systolic_bp:.0f}/{diastolic_bp:.0f} mmHg"
            },
            "postpartum_mood_trajectory": {
                "current_epds": current_epds_score,
                "prior_epds": prior_epds_score,
                "epds_monthly_slope": epds_slope_per_month,
                "trajectory_class": epds_risk_trajectory,
                "clinical_guidance": epds_alert
            },
            "lactation_micronutrient_protocol": lactation_plan
        }

if __name__ == '__main__':
    engine = PerinatalTrajectoryEngine()
    print(json.dumps(engine.evaluate_maternal_trajectory(), indent=2))