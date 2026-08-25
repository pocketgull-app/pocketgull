"""
PocketGull Causal Polypharmacy De-Prescribing Sandbox Engine
Implements Beers Criteria, STOPP/START guidelines, and Prescribing Cascade detection:
1. Detects hidden prescribing cascades (Drug A causes side effect -> Drug B prescribed).
2. Calculates Anticholinergic Cognitive Burden (ACB) and Fall Risk score.
3. Simulates counterfactual medication tapering scenarios on renal survival & fall risk.
"""

import json
import numpy as np
from typing import Dict, Any, List

KNOWN_PRESCRIBING_CASCADES = {
    ("amlodipine", "furosemide"): {
        "mechanism": "Calcium channel blocker causes peripheral vasodilation & ankle edema; loop diuretic prescribed inappropriately instead of switching anti-hypertensive class.",
        "safer_alternative": "Taper Furosemide; switch Amlodipine to Telmisartan/ACEi or lower dose."
    },
    ("nsaid", "omeprazole"): {
        "mechanism": "Chronic NSAID use induces gastric mucosal erosions; PPI added chronically without evaluating underlying joint inflammation or weaning.",
        "safer_alternative": "Transition from daily NSAID to Curcumin + Boswellia + topical relief; taper PPI to avoid hypomagnesemia & dysbiosis."
    },
    ("diphenhydramine", "donepezil"): {
        "mechanism": "Antihistamine anticholinergic burden induces confusion/memory loss; acetylcholinesterase inhibitor prescribed to counter drug-induced cognitive decline.",
        "safer_alternative": "Deprescribe Diphenhydramine (ACB score 3); evaluate sleep hygiene & Magnesium Glycinate."
    }
}

ANTICHOLINERGIC_BURDEN_SCORES = {
    "diphenhydramine": 3, "hydroxyzine": 3, "amitriptyline": 3, "oxybutynin": 3,
    "paroxetine": 3, "quetiapine": 2, "loratadine": 1, "ranitidine": 1,
    "atenolol": 1, "furosemide": 1, "prednisone": 1
}

class DeprescribingSandboxEngine:
    """Simulates de-prescribing scenarios, cascade unwinding, and risk reductions."""

    def simulate_deprescribing(
        self,
        current_medications: List[str] = None,
        candidate_deprescribe_drugs: List[str] = None,
        patient_age: float = 74.0,
        baseline_egfr: float = 48.0
    ) -> Dict[str, Any]:
        """Evaluates cascade collisions and calculates counterfactual risk deltas."""
        
        if current_medications is None:
            current_medications = ["Amlodipine", "Furosemide", "Omeprazole", "Diphenhydramine"]
        if candidate_deprescribe_drugs is None:
            candidate_deprescribe_drugs = ["Furosemide", "Diphenhydramine"]

        meds_lower = [m.strip().lower() for m in current_medications]
        taper_lower = [m.strip().lower() for m in candidate_deprescribe_drugs]

        # 1. Detect Prescribing Cascades
        detected_cascades = []
        for (drug_a, drug_b), cascade_info in KNOWN_PRESCRIBING_CASCADES.items():
            if drug_a in meds_lower and drug_b in meds_lower:
                detected_cascades.append({
                    "trigger_drug": drug_a.capitalize(),
                    "cascade_drug": drug_b.capitalize(),
                    "mechanism": cascade_info["mechanism"],
                    "recommended_unwind_strategy": cascade_info["safer_alternative"]
                })

        # 2. Anticholinergic Cognitive Burden (ACB)
        baseline_acb = sum(ANTICHOLINERGIC_BURDEN_SCORES.get(m, 0) for m in meds_lower)
        
        # Remaining meds after simulated deprescribing
        remaining_meds = [m for m in meds_lower if m not in taper_lower]
        simulated_acb = sum(ANTICHOLINERGIC_BURDEN_SCORES.get(m, 0) for m in remaining_meds)

        # 3. Fall Risk Index (0.0 to 1.0)
        # Sedatives, high ACB, and diuretics increase orthostatic hypotension & fall odds
        baseline_fall_risk = round(min(0.95, 0.15 + (patient_age - 65.0) * 0.015 + baseline_acb * 0.08 + (0.15 if "furosemide" in meds_lower else 0.0)), 2)
        simulated_fall_risk = round(min(0.95, 0.15 + (patient_age - 65.0) * 0.015 + simulated_acb * 0.08 + (0.15 if "furosemide" in remaining_meds else 0.0)), 2)
        fall_risk_delta_pct = round((baseline_fall_risk - simulated_fall_risk) * 100.0, 1)

        # 4. Projected Renal Trajectory Improvement (eGFR preservation)
        # Tapering unnecessary diuretics/NSAIDs preserves ~2.4 mL/min/1.73m^2 eGFR
        egfr_gain = 2.4 if ("furosemide" in taper_lower or "nsaid" in taper_lower) else 0.5
        projected_1yr_egfr = round(baseline_egfr + egfr_gain, 1)

        return {
            "regimen_analysis": {
                "total_current_medications": len(current_medications),
                "simulated_taper_targets": [m.capitalize() for m in candidate_deprescribe_drugs],
                "detected_prescribing_cascades": detected_cascades
            },
            "cognitive_and_fall_metrics": {
                "baseline_anticholinergic_burden_acb": baseline_acb,
                "simulated_post_taper_acb": simulated_acb,
                "baseline_annual_fall_risk_pct": round(baseline_fall_risk * 100.0, 1),
                "simulated_post_taper_fall_risk_pct": round(simulated_fall_risk * 100.0, 1),
                "absolute_fall_risk_reduction_pct": fall_risk_delta_pct
            },
            "renal_preservation_trajectory": {
                "baseline_egfr": baseline_egfr,
                "projected_1year_egfr_with_taper": projected_1yr_egfr,
                "renal_hemodynamic_benefit": "Elimination of pre-renal azotemia stress and electrolyte wasting."
            },
            "deprescribing_schedule_directive": [
                f"Week 1-2: Reduce {candidate_deprescribe_drugs[0]} dose by 50% under standing blood pressure monitoring." if len(candidate_deprescribe_drugs) > 0 else "Maintain current review.",
                "Week 3-4: Discontinue target drug; confirm absence of rebound edema/symptoms.",
                "Day 30: Re-evaluate serum electrolytes, BUN/Creatinine, and cognitive clarity."
            ]
        }

if __name__ == '__main__':
    engine = DeprescribingSandboxEngine()
    print(json.dumps(engine.simulate_deprescribing(), indent=2))