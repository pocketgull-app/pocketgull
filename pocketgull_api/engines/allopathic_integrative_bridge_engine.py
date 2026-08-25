"""
PocketGull Allopathic Molecular & Tri-Paradigm Pharmacogenomics Bridge Engine
Triangulates Western pharmaceuticals with TCM botanicals and Ayurvedic Rasayanas:
1. CYP450 liver enzyme induction/inhibition (CYP3A4, CYP2D6, CYP1A2, CYP2C9, CYP2C19).
2. P-glycoprotein transport interference & bioavailability modulation.
3. Thermal & Energetic safety checks to prevent Spleen/Pitta contraindications.
4. Concrete hour-by-hour dosing deconfliction schedules.
"""

import json
from typing import Dict, Any, List

CYP_DATABASE = {
    "St. John's Wort": {"induces": ["CYP3A4", "CYP2C9", "CYP2C19", "P-gp"], "inhibits": [], "thermal": "Neutral"},
    "Grapefruit Extract": {"induces": [], "inhibits": ["CYP3A4", "CYP1A2"], "thermal": "Cold"},
    "Huang Lian (Berberine)": {"induces": [], "inhibits": ["CYP3A4", "CYP2D6"], "thermal": "Extremely Cold"},
    "Curcumin (Turmeric)": {"induces": [], "inhibits": ["CYP3A4", "CYP1A2", "CYP2C9"], "thermal": "Warming"},
    "Ginkgo Biloba": {"induces": ["CYP2C19"], "inhibits": ["CYP2C9", "CYP3A4"], "thermal": "Neutral"},
    "Ashwagandha": {"induces": [], "inhibits": ["CYP3A4"], "thermal": "Warming"},
    "Piperine (Black Pepper Extract)": {"induces": [], "inhibits": ["CYP3A4", "P-gp"], "thermal": "Hot Pungent"}
}

DRUG_DATABASE = {
    "Warfarin": {"substrate": ["CYP2C9", "CYP3A4"], "narrow_therapeutic_index": True, "risk": "Hemorrhage / INR instability"},
    "Atorvastatin": {"substrate": ["CYP3A4"], "narrow_therapeutic_index": False, "risk": "Myopathy / Rhabdomyolysis if inhibited"},
    "Metformin": {"substrate": ["OCT2", "MATE1"], "narrow_therapeutic_index": False, "risk": "Additive hypoglycemia / Lactic acidosis"},
    "Amlodipine": {"substrate": ["CYP3A4"], "narrow_therapeutic_index": False, "risk": "Hypotension / Peripheral edema"},
    "Levothyroxine": {"substrate": [], "narrow_therapeutic_index": True, "risk": "Chelation / Suppressed absorption"},
    "Omeprazole": {"substrate": ["CYP2C19", "CYP3A4"], "narrow_therapeutic_index": False, "risk": "Altered systemic clearance"}
}

class AllopathicIntegrativeBridgeEngine:
    """Bridges Allopathic molecular pharmacology with TCM & Ayurvedic therapies."""

    def evaluate_tri_paradigm_safety(
        self,
        current_allopathic_drugs: List[str] = ["Metformin", "Amlodipine"],
        candidate_tcm_herbs: List[str] = ["Huang Lian (Berberine)"],
        candidate_ayurvedic_rasayanas: List[str] = ["Ashwagandha", "Curcumin (Turmeric)"]
    ) -> Dict[str, Any]:
        """Calculates molecular enzyme conflicts, pharmacodynamic synergies, and spacing rules."""

        detected_alerts = []
        cyp_interactions = []

        all_botanicals = candidate_tcm_herbs + candidate_ayurvedic_rasayanas

        for drug_name in current_allopathic_drugs:
            drug_info = DRUG_DATABASE.get(drug_name, None)
            if not drug_info:
                continue

            for bot_name in all_botanicals:
                bot_info = CYP_DATABASE.get(bot_name, None)
                if not bot_info:
                    continue

                # Check CYP enzyme overlap
                inhibited_enzymes = set(bot_info["inhibits"]).intersection(set(drug_info["substrate"]))
                induced_enzymes = set(bot_info["induces"]).intersection(set(drug_info["substrate"]))

                if inhibited_enzymes:
                    cyp_interactions.append({
                        "drug": drug_name,
                        "botanical": bot_name,
                        "affected_enzymes": list(inhibited_enzymes),
                        "effect": "CYP Inhibition -> Potential increased drug plasma concentration and toxicity risk",
                        "severity": "HIGH" if drug_info["narrow_therapeutic_index"] else "MODERATE"
                    })

                if induced_enzymes:
                    cyp_interactions.append({
                        "drug": drug_name,
                        "botanical": bot_name,
                        "affected_enzymes": list(induced_enzymes),
                        "effect": "CYP Induction -> Accelerated drug clearance and sub-therapeutic efficacy",
                        "severity": "HIGH" if drug_info["narrow_therapeutic_index"] else "MODERATE"
                    })

                # Specific Pharmacodynamic Cross-Checks
                if drug_name == "Metformin" and ("Berberine" in bot_name or "Huang Lian" in bot_name):
                    detected_alerts.append({
                        "interaction": f"{drug_name} + {bot_name}",
                        "mechanism": "Dual AMPK activation & SGLT-2 glucose modulation",
                        "clinical_significance": "Beneficial glycemic synergy; monitor for additive hypoglycemia if fasting.",
                        "action_plan": "Take Metformin with meals; take Berberine 2 hours apart with breakfast/lunch."
                    })

                if drug_name == "Levothyroxine" and bot_name == "Ashwagandha":
                    detected_alerts.append({
                        "interaction": f"{drug_name} + {bot_name}",
                        "mechanism": "Ashwagandha stimulates thyroid T3/T4 synthesis",
                        "clinical_significance": "May lower requirement for exogenous Levothyroxine; monitor TSH in 6 weeks.",
                        "action_plan": "Space administration by at least 4 hours."
                    })

        # Thermal Energetic Harmonization
        thermal_notes = []
        if "Huang Lian (Berberine)" in candidate_tcm_herbs:
            thermal_notes.append("Huang Lian is Extremely Cold (Ku Han). Long-term administration requires warming counter-balance (e.g. Zingiber officinale / Gan Jiang) to prevent Spleen Qi depletion.")
        if "Curcumin (Turmeric)" in candidate_ayurvedic_rasayanas and "Ashwagandha" in candidate_ayurvedic_rasayanas:
            thermal_notes.append("Both botanicals are Warming/Pungent. Excellent for Vata-Kapha pacification; monitor for Pitta acid flare in heat-sensitive individuals.")

        # Dosing Schedule Deconfliction
        daily_schedule = [
            {"time": "07:00 (Wake)", "items": "Allopathic thyroid or morning fasting medications with water"},
            {"time": "08:30 (Breakfast)", "items": "Metformin + Morning meal"},
            {"time": "11:30 (Mid-Day)", "items": "TCM / Ayurvedic botanicals (Berberine, Ashwagandha) spaced 2+ hours from pharmaceuticals"},
            {"time": "18:30 (Dinner)", "items": "Evening allopathic medications + Curcumin with healthy fats for absorption"},
            {"time": "21:30 (Pre-Sleep)", "items": "Grounding warm Rasayana or herbal tea"}
        ]

        return {
            "cyp450_pharmacokinetic_interactions": cyp_interactions,
            "pharmacodynamic_synergies_and_warnings": detected_alerts,
            "thermal_energetic_harmonization": thermal_notes,
            "hour_by_hour_dosing_schedule": daily_schedule,
            "overall_safety_tier": "SAFE_WITH_SPACING" if len(cyp_interactions) <= 1 else "REQUIRES_CLINICAL_MONITORING"
        }

if __name__ == '__main__':
    engine = AllopathicIntegrativeBridgeEngine()
    print(json.dumps(engine.evaluate_tri_paradigm_safety(), indent=2))