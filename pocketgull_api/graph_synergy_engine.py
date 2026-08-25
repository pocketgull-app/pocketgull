"""
PocketGull Bipartite Pharmacokinetic Graph Synergy & Herb-Drug Interaction Matrix
Models bipartite interactions between:
1. Pharmaceutical Agents (e.g. Warfarin, SSRIs, Statins, ACE Inhibitors, Beta Blockers)
2. Botanical / Functional Nutrients (e.g. St. John's Wort, Curcumin, Ginkgo Biloba, Ashwagandha, Berberine)
3. Biological Cytochrome P450 Enzymes (CYP3A4, CYP2D6, CYP2C9, CYP2C19, CYP1A2) & P-gp Transporters

Computes:
- Competitive inhibition / metabolic clearance velocity shifts.
- Interaction Risk Tier (LOW, MODERATE, CRITICAL_CONTRAINDICATION, SYNERGISTIC_BENEFIT).
- Clinical Action & Tapering Directive.
"""

import os
import json
from typing import Dict, Any, List, Optional

# Bipartite Graph Knowledge Base
CYP_SUBSTRATES = {
    "warfarin": {"cyp": ["CYP2C9", "CYP3A4", "CYP1A2"], "p_gp": False, "narrow_index": True},
    "sertraline": {"cyp": ["CYP2D6", "CYP2B6", "CYP3A4"], "p_gp": True, "narrow_index": False},
    "atorvastatin": {"cyp": ["CYP3A4"], "p_gp": True, "narrow_index": False},
    "metoprolol": {"cyp": ["CYP2D6"], "p_gp": False, "narrow_index": False},
    "digoxin": {"cyp": [], "p_gp": True, "narrow_index": True},
    "omeprazole": {"cyp": ["CYP2C19", "CYP3A4"], "p_gp": False, "narrow_index": False},
    "losartan": {"cyp": ["CYP2C9", "CYP3A4"], "p_gp": False, "narrow_index": False}
}

BOTANICAL_ACTIONS = {
    "st_johns_wort": {
        "induces": ["CYP3A4", "CYP2C19", "CYP2C9", "P-gp"],
        "inhibits": [],
        "serotonergic": True,
        "anticoagulant_potentiating": False
    },
    "curcumin": {
        "induces": [],
        "inhibits": ["CYP3A4", "CYP1A2", "CYP2D6", "P-gp"],
        "serotonergic": False,
        "anticoagulant_potentiating": True
    },
    "ginkgo_biloba": {
        "induces": ["CYP2C19"],
        "inhibits": ["CYP2C9", "CYP3A4"],
        "serotonergic": False,
        "anticoagulant_potentiating": True
    },
    "ashwagandha": {
        "induces": [],
        "inhibits": ["CYP3A4", "CYP2B6"],
        "serotonergic": False,
        "gabaergic": True,
        "anticoagulant_potentiating": False
    },
    "berberine": {
        "induces": [],
        "inhibits": ["CYP3A4", "CYP2D6", "CYP2C9", "P-gp"],
        "serotonergic": False,
        "anticoagulant_potentiating": False
    }
}

class PharmacokineticGraphSynergyEngine:
    """Graph-based pharmacokinetic and pharmacodynamic interaction network evaluator."""

    def evaluate_pair(self, drug_name: str, botanical_name: str) -> Dict[str, Any]:
        """Evaluates pairwise drug-herb interaction kinetics."""
        d_key = drug_name.strip().lower().replace('.', '').replace('-', '_').replace(' ', '_')
        b_key = botanical_name.strip().lower().replace('.', '').replace('-', '_').replace(' ', '_').replace("'", "")

        drug = CYP_SUBSTRATES.get(d_key)
        herb = BOTANICAL_ACTIONS.get(b_key)


        if not drug or not herb:
            return {
                "pair": f"{drug_name} + {botanical_name}",
                "status": "UNASSESSED_OR_NO_DIRECT_OVERLAP",
                "risk_tier": "LOW",
                "kinetic_shift_score": 0.1,
                "mechanism": "No verified high-affinity CYP450 or P-gp pathway collision in knowledge base.",
                "clinical_directive": "Standard clinical monitoring; minimal metabolic interference expected."
            }

        # Check Cytochrome P450 collisions
        induction_overlap = [c for c in drug["cyp"] if c in herb["induces"]]
        if drug["p_gp"] and "P-gp" in herb["induces"]:
            induction_overlap.append("P-glycoprotein efflux")

        inhibition_overlap = [c for c in drug["cyp"] if c in herb["inhibits"]]
        if drug["p_gp"] and "P-gp" in herb["inhibits"]:
            inhibition_overlap.append("P-glycoprotein efflux")

        # Pharmacodynamic safety flags
        serotonin_risk = herb.get("serotonergic", False) and d_key in ["sertraline", "fluoxetine", "escitalopram"]
        bleeding_risk = herb.get("anticoagulant_potentiating", False) and d_key in ["warfarin", "apixaban", "rivaroxaban", "aspirin"]

        # Risk stratification
        if serotonin_risk:
            return {
                "pair": f"{drug_name} + {botanical_name}",
                "status": "CONTRAINDICATED_PD_TOXICITY",
                "risk_tier": "CRITICAL_CONTRAINDICATION",
                "kinetic_shift_score": 0.95,
                "mechanism": "Severe Serotonin Syndrome risk via concurrent 5-HT reuptake inhibition and MAO-A/B modulation.",
                "clinical_directive": "Strictly discontinue botanical prior to pharmaceutical antidepressant initiation."
            }

        if bleeding_risk and (inhibition_overlap or induction_overlap or drug["narrow_index"]):
            return {
                "pair": f"{drug_name} + {botanical_name}",
                "status": "SEVERE_NARROW_THERAPEUTIC_INDEX_COLLISION",
                "risk_tier": "CRITICAL_CONTRAINDICATION",
                "kinetic_shift_score": 0.90,
                "mechanism": f"Narrow index anticoagulant clearance altered via {', '.join(inhibition_overlap or induction_overlap)} + antiplatelet synergy.",
                "clinical_directive": "High hemorrhage risk. Discontinue botanical; monitor INR / coagulation parameters immediately."
            }

        if induction_overlap:
            score = 0.75 if drug["narrow_index"] else 0.55
            return {
                "pair": f"{drug_name} + {botanical_name}",
                "status": "METABOLIC_CLEARANCE_ACCELERATION",
                "risk_tier": "MODERATE_TO_HIGH",
                "kinetic_shift_score": score,
                "mechanism": f"Substantial enzymatic induction of {', '.join(induction_overlap)} reducing active drug plasma bioavailability.",
                "clinical_directive": "Potential therapeutic failure. Monitor clinical efficacy or dose-adjust under medical supervision."
            }

        if inhibition_overlap:
            score = 0.80 if drug["narrow_index"] else 0.50
            return {
                "pair": f"{drug_name} + {botanical_name}",
                "status": "METABOLIC_CLEARANCE_INHIBITION",
                "risk_tier": "MODERATE",
                "kinetic_shift_score": score,
                "mechanism": f"Competitive inhibition of {', '.join(inhibition_overlap)} elevating peak drug plasma concentrations (C_max).",
                "clinical_directive": "Monitor for heightened adverse effects or toxicity; consider timing separation by 4+ hours."
            }

        return {
            "pair": f"{drug_name} + {botanical_name}",
            "status": "COMPATIBLE_BENEFICIAL_COMPANION",
            "risk_tier": "LOW",
            "kinetic_shift_score": 0.15,
            "mechanism": "Independent metabolic pathways with complementary physiological mechanisms.",
            "clinical_directive": "Safe to co-administer as part of integrated functional protocol."
        }

    def evaluate_regimen(self, drugs: List[str], botanicals: List[str]) -> Dict[str, Any]:
        """Evaluates full multi-drug multi-herb patient regimen."""
        interactions = []
        max_shift = 0.0
        critical_count = 0

        for d in drugs:
            for b in botanicals:
                res = self.evaluate_pair(d, b)
                interactions.append(res)
                max_shift = max(max_shift, res["kinetic_shift_score"])
                if res["risk_tier"] == "CRITICAL_CONTRAINDICATION":
                    critical_count += 1

        overall_safety = "CRITICAL_ALERTS_PRESENT" if critical_count > 0 else ("MODERATE_MONITORING" if max_shift > 0.45 else "OPTIMAL_COMPATIBILITY")

        return {
            "regimen_summary": {
                "drugs_evaluated": len(drugs),
                "botanicals_evaluated": len(botanicals),
                "pairwise_comparisons": len(interactions),
                "critical_contraindications": critical_count,
                "overall_safety_status": overall_safety,
                "peak_kinetic_shift_score": round(max_shift, 4)
            },
            "interactions": interactions
        }

if __name__ == '__main__':
    engine = PharmacokineticGraphSynergyEngine()
    test_run = engine.evaluate_regimen(["Warfarin", "Sertraline", "Atorvastatin"], ["St. John's Wort", "Curcumin", "Ashwagandha"])
    print(json.dumps(test_run, indent=2))