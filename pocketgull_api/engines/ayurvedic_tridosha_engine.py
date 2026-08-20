"""
PocketGull Ayurvedic Tridosha, 7 Dhatu Tissue, & Agni/Ama Engine
Analyzes Prakriti baseline vs Vikriti doshic imbalance, 7 Dhatu tissue cascade,
metabolic digestive fire (Agni), cellular endotoxin sludge (Ama), and Rasayana protocols.
"""

import json
from typing import Dict, Any, List

class AyurvedicTridoshaEngine:
    """Evaluates Ayurvedic Tridosha, 7 Dhatu tissue health, Agni state, and Rasayana formulas."""

    def evaluate_ayurvedic_profile(
        self,
        vata_symptoms_score: float = 65.0,   # Anxiety, dry skin, insomnia, variable appetite (0-100)
        pitta_symptoms_score: float = 52.0,  # Acid reflux, irritability, inflammatory skin, burning (0-100)
        kapha_symptoms_score: float = 40.0,  # Lethargy, water retention, congestion, weight gain (0-100)
        bowel_regularity_index: float = 6.0, # 1-10 (1=constipated/dry, 10=loose/rapid)
        tongue_ama_coating: str = "moderate_white", # clean_pink, thin_white, moderate_white, thick_yellowish
        energy_stability: float = 5.5        # 1-10 (1=erratic crashing, 10=vital/sustained)
    ) -> Dict[str, Any]:
        """Calculates Tridosha distribution, 7 Dhatu vitality, Agni state, and Rasayana therapy."""

        # Normalize Tridosha Vikriti (Current State Percentages)
        total_dosha = max(1.0, vata_symptoms_score + pitta_symptoms_score + kapha_symptoms_score)
        v_pct = round((vata_symptoms_score / total_dosha) * 100.0, 1)
        p_pct = round((pitta_symptoms_score / total_dosha) * 100.0, 1)
        k_pct = round((kapha_symptoms_score / total_dosha) * 100.0, 1)

        # Classify Agni (Digestive Metabolic Fire)
        if v_pct > 45.0:
            agni_state = "Vishama Agni (Variable, Erratic Metabolic Fire driven by Vata)"
            agni_desc = "Appetite fluctuates wildly; prone to gas, bloating, and nervous digestion."
        elif p_pct > 45.0:
            agni_state = "Tikshna Agni (Sharp, Hyper-Metabolic Fire driven by Pitta)"
            agni_desc = "Excessive hunger, acid burning, irritability when meals are delayed."
        elif k_pct > 45.0:
            agni_state = "Manda Agni (Sluggish, Low Metabolic Fire driven by Kapha)"
            agni_desc = "Heavy postprandial stupor, slow metabolism, lymphatic stagnation."
        else:
            agni_state = "Sama Agni (Balanced, Harmonious Metabolic Fire)"
            agni_desc = "Optimal digestion, clear mind, efficient nutrient assimilation."

        # Compute Ama (Metabolic Endotoxin Sludge Score 0-100)
        ama_score = 15.0
        if tongue_ama_coating == "thick_yellowish":
            ama_score += 55.0
        elif tongue_ama_coating == "moderate_white":
            ama_score += 35.0
        elif tongue_ama_coating == "thin_white":
            ama_score += 15.0
        
        if energy_stability < 6.0:
            ama_score += (6.0 - energy_stability) * 6.0
        ama_score = round(min(100.0, ama_score), 1)

        # 7 Dhatu Tissue Ladder Evaluation (Rasa -> Rakta -> Mamsa -> Meda -> Asthi -> Majja -> Shukra -> Ojas)
        dhatus = [
            {"dhatu": "1. Rasa (Plasma & Lymph)", "status": "Dehydrated / Dry" if v_pct > 40 else "Nourished", "biomarker": "Electrolyte & lymphatic flow"},
            {"dhatu": "2. Rakta (Blood & Hemoglobin)", "status": "Heated / Inflamed" if p_pct > 40 else "Balanced", "biomarker": "Erythrocyte & vascular elasticity"},
            {"dhatu": "3. Mamsa (Muscle Tissue)", "status": "Depleted" if v_pct > 50 else "Toned", "biomarker": "Skeletal muscle protein synthesis"},
            {"dhatu": "4. Meda (Adipose & Lipids)", "status": "Sluggish Accumulation" if k_pct > 40 else "Clear", "biomarker": "Insulin sensitivity & lipid oxidation"},
            {"dhatu": "5. Asthi (Bone & Cartilage)", "status": "Porous / Vulnerable" if v_pct > 45 else "Dense", "biomarker": "Bone mineral density & joint lubrication"},
            {"dhatu": "6. Majja (Nerve & Bone Marrow)", "status": "Hyperactive / Strained" if v_pct > 40 else "Calm", "biomarker": "Neurocognitive conduction & HRV"},
            {"dhatu": "7. Shukra (Reproductive Essence)", "status": "Conserved" if ama_score < 40 else "Suppressed by Ama", "biomarker": "Germline methylation & gametogenesis"}
        ]

        # Overall Ojas (Vital Energy Reserve, 0-100)
        ojas_score = round(max(15.0, 100.0 - (ama_score * 0.5 + abs(v_pct - 33.3) * 0.4 + abs(p_pct - 33.3) * 0.4)), 1)

        # Rasayana Adaptogen Formulation Recommendation
        if v_pct >= p_pct and v_pct >= k_pct:
            primary_rasayana = "Ashwagandha (Withania somnifera) with warm sesame oil and ghee for grounding Vata"
        elif p_pct >= v_pct and p_pct >= k_pct:
            primary_rasayana = "Shatavari (Asparagus racemosus) and Brahmi (Bacopa monnieri) for cooling Pitta and calming neuro-inflammation"
        else:
            primary_rasayana = "Guggulu with Triphala and Trikatu for stimulating Manda Agni and clearing Kapha congestion"

        return {
            "tridosha_vikriti_distribution": {
                "vata_pct": v_pct,
                "pitta_pct": p_pct,
                "kapha_pct": k_pct,
                "predominant_imbalance": "Vata Aggravation" if v_pct > 40 else ("Pitta Excess" if p_pct > 40 else "Kapha Stagnation")
            },
            "metabolic_agni_state": {
                "classification": agni_state,
                "clinical_description": agni_desc,
                "ama_endotoxin_score": ama_score,
                "ama_tier": "HIGH_TOXIC_AMA" if ama_score >= 60 else ("MODERATE_AMA" if ama_score >= 35 else "CLEAN_AMA_FREE")
            },
            "seven_dhatu_tissue_cascade": dhatus,
            "ojas_vitality_reserve_score": ojas_score,
            "prescribed_rasayana_protocol": primary_rasayana,
            "dinacharya_lifestyle_guidance": (
                "Abhyanga (warm sesame oil self-massage) before showering, sip warm cumin-coriander-fennel tea, and maintain consistent sleep timing."
            )
        }

if __name__ == '__main__':
    engine = AyurvedicTridoshaEngine()
    print(json.dumps(engine.evaluate_ayurvedic_profile(), indent=2))