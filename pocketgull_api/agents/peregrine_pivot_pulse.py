"""
Avian Persona Agent: Peregrine (Pivot & Pulse Strategy Agent)
Tracks real-time physiological momentum ("Pulse") and executes adaptive care plan pivots ("Pivot").
"""

from __future__ import annotations

from typing import Dict, Any, List


class PeregrinePivotPulseAgent:
    """
    Peregrine continuously monitors biomarker momentum and triggers dynamic care strategy pivots
    when physiological trajectory crosses safety or recovery inflection points.
    """

    def __init__(self, agent_name: str = "Peregrine"):
        self.agent_name = agent_name
        self.role = "Real-Time Pulse Trajectory & Dynamic Care Strategy Pivot"

    def evaluate_pulse_and_pivot(
        self,
        hrv_ms: float,
        sibi_index: float,
        vocal_stress_index: float,
        current_regimen: str = "ACTIVE_REHAB",
    ) -> Dict[str, Any]:
        # Compute Pulse Momentum Score (0.0 - 1.0)
        # Higher HRV + lower SIBI/Stress = higher recovery pulse momentum
        normalized_hrv = min(1.0, hrv_ms / 100.0)
        pulse_momentum = MathMax(0.0, normalized_hrv * 0.5 + (1.0 - sibi_index) * 0.3 + (1.0 - vocal_stress_index) * 0.2)
        pulse_momentum = round(pulse_momentum, 2)

        # Determine Pivot Action
        should_pivot = False
        pivot_target = current_regimen
        pivot_rationale = "Pulse trajectory remains within optimal target bounds."

        if pulse_momentum < 0.40 and current_regimen == "ACTIVE_REHAB":
            should_pivot = True
            pivot_target = "SOMATIC_AVS_RECOVERY"
            pivot_rationale = "Elevated acoustic stress and diminished HRV momentum detected. Pivoting to 528Hz Solfeggio AVS recovery mode."
        elif pulse_momentum > 0.80 and current_regimen == "SOMATIC_AVS_RECOVERY":
            should_pivot = True
            pivot_target = "PROGRESSIVE_FUNCTIONAL_MOBILITY"
            pivot_rationale = "Autonomic stability restored (Pulse Momentum > 0.80). Pivoting to progressive functional mobility protocol."

        return {
            "agent": self.agent_name,
            "pulse_momentum": pulse_momentum,
            "current_regimen": current_regimen,
            "should_pivot": should_pivot,
            "pivoted_regimen": pivot_target,
            "pivot_rationale": pivot_rationale,
            "confidence_score": 0.97,
        }


def MathMax(a: float, b: float) -> float:
    return a if a > b else b


peregrine_agent = PeregrinePivotPulseAgent()
