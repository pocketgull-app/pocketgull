"""
PocketGull Traditional Chinese Medicine (TCM) Jing-Luo Meridian & Zang-Fu Engine
Analyzes 5-Element (Wu Xing) equilibrium, 12 Jing-Luo meridian Qi flow, Zang-Fu organ patterns,
and generates customized Acupoint and classical herbal formula prescriptions.
"""

import json
from typing import Dict, Any, List

class TcmMeridianEngine:
    """Evaluates TCM Jing-Luo meridians, Zang-Fu organ disharmonies, and acupoint protocols."""

    def evaluate_tcm_profile(
        self,
        stress_irritability_level: float = 7.0,      # 0-10 (Liver Qi Stagnation indicator)
        fatigue_postprandial_heaviness: float = 6.5, # 0-10 (Spleen Qi Deficiency indicator)
        insomnia_palpitations: float = 5.0,          # 0-10 (Heart Blood/Yin Deficiency)
        lumbar_soreness_cold_aversion: float = 4.0,  # 0-10 (Kidney Yang/Yin Deficiency)
        cough_dry_throat: float = 2.0,               # 0-10 (Lung Qi/Yin)
        tongue_body_color: str = "pale_pink_teethmarks", # pale, red, pale_pink_teethmarks, purple
        tongue_coating: str = "white_greasy",            # thin_white, yellow_thick, white_greasy, peeled
        radial_pulse_type: str = "wiry_and_slippery"     # floating, deep, wiry, slippery, wiry_and_slippery
    ) -> Dict[str, Any]:
        """Calculates 5-Element balance, Zang-Fu disharmonies, and acupoint protocols."""

        # 5-Element (Wu Xing) Stress/Deficiency Vector (0-100 scale)
        wood_liver = round(min(100.0, stress_irritability_level * 10.0 + (15.0 if "wiry" in radial_pulse_type else 0.0)), 1)
        earth_spleen = round(min(100.0, fatigue_postprandial_heaviness * 10.0 + (20.0 if "teethmarks" in tongue_body_color or "greasy" in tongue_coating else 0.0)), 1)
        fire_heart = round(min(100.0, insomnia_palpitations * 10.0 + (15.0 if "red" in tongue_body_color else 0.0)), 1)
        water_kidney = round(min(100.0, lumbar_soreness_cold_aversion * 10.0), 1)
        metal_lung = round(min(100.0, cough_dry_throat * 10.0), 1)

        wu_xing_balance = {
            "wood_liver_gallbladder": wood_liver,
            "fire_heart_small_intestine": fire_heart,
            "earth_spleen_stomach": earth_spleen,
            "metal_lung_large_intestine": metal_lung,
            "water_kidney_urinary_bladder": water_kidney
        }

        # Determine Primary Zang-Fu Pattern
        primary_pattern = "Harmonious Qi & Blood Balance"
        classical_formula = "Ba Zhen Tang (Eight Treasures Decoction) for baseline tonification"
        
        if wood_liver >= 70.0 and earth_spleen >= 60.0:
            primary_pattern = "Liver Qi Stagnation Overacting on Spleen (Gan Yu Pi Xu)"
            classical_formula = "Xiao Yao San (Free and Easy Wanderer) with Chao Bai Zhu"
        elif earth_spleen >= 70.0:
            primary_pattern = "Spleen Qi Deficiency with Internal Dampness (Pi Xu Sheng Shi)"
            classical_formula = "Liu Jun Zi Tang (Six Gentlemen Decoction) or Shen Ling Bai Zhu San"
        elif fire_heart >= 70.0 and water_kidney >= 50.0:
            primary_pattern = "Heart and Kidney Non-Communication (Xin Shen Bu Jiao)"
            classical_formula = "Tian Wang Bu Xin Dan or Jiao Tai Wan"
        elif water_kidney >= 70.0:
            primary_pattern = "Kidney Essence and Yang Deficiency (Shen Yang Xu)"
            classical_formula = "Jin Gui Shen Qi Wan (Golden Book Kidney Qi Pill)"

        # Acupoint Prescription
        acupoints: List[Dict[str, str]] = []
        if wood_liver >= 50.0:
            acupoints.append({
                "code": "LV-3 (Taichong)",
                "location": "Dorsum of the foot in the hollow distal to the junction of the 1st and 2nd metatarsal bones",
                "function": "Spreads Liver Qi, pacifies Liver Yang, and clears emotional constraint"
            })
            acupoints.append({
                "code": "GB-34 (Yanglingquan)",
                "location": "Below the lateral aspect of the knee, in the tender depression anterior and inferior to the head of the fibula",
                "function": "Influential point of tendons, harmonizes Shaoyang and clears damp-heat"
            })

        if earth_spleen >= 50.0:
            acupoints.append({
                "code": "ST-36 (Zusanli)",
                "location": "Four fingerbreadths below the patella, one fingerbreadth lateral to the anterior crest of the tibia",
                "function": "Premier point for tonifying Spleen Qi, boosting Postnatal Essence and immune resilience"
            })
            acupoints.append({
                "code": "SP-6 (Sanyinjiao)",
                "location": "Three fingerbreadths superior to the prominence of the medial malleolus, behind the tibial border",
                "function": "Intersection of Spleen, Liver, and Kidney channels; nourishes Yin and resolves dampness"
            })

        if fire_heart >= 50.0:
            acupoints.append({
                "code": "PC-6 (Neiguan)",
                "location": "Two fingerbreadths above the wrist crease between the tendons of palmaris longus and flexor carpi radialis",
                "function": "Calms the Shen (spirit), opens the chest, and harmonizes autonomic heart rate variability"
            })
            acupoints.append({
                "code": "HT-7 (Shenmen)",
                "location": "At the wrist crease, on the radial side of the flexor carpi ulnaris tendon",
                "function": "Nourishes Heart Blood and grounds anxious insomnia"
            })

        # General Yuan-Source Harmonizer
        acupoints.append({
            "code": "LI-4 (Hegu)",
            "location": "On the dorsum of the hand, between the 1st and 2nd metacarpal bones at the midpoint of the 2nd metacarpal",
            "function": "Command point of face and sensory orifices; pairs with LV-3 to form the 'Four Gates' (Si Guan) for systemic Qi flow"
        })

        return {
            "tcm_diagnostic_summary": {
                "primary_zang_fu_pattern": primary_pattern,
                "tongue_diagnosis": f"Body: {tongue_body_color.replace('_', ' ').title()} | Coating: {tongue_coating.replace('_', ' ').title()}",
                "radial_pulse_synthesis": radial_pulse_type.replace('_', ' ').title(),
                "classical_herbal_formula": classical_formula
            },
            "wu_xing_5_element_balance": wu_xing_balance,
            "prescribed_acupoint_protocol": acupoints,
            "dietary_thermal_guidance": (
                "Emphasize warm, lightly cooked aromatic foods (ginger, steamed root vegetables, warm broths); strictly limit raw salads, iced drinks, and excessive greasy dairy to protect Spleen digestive fire."
                if earth_spleen > 50.0 else
                "Incorporate cooling, moistening foods (pears, lily bulbs, mung beans, mint tea) to clear excess heat."
            )
        }

if __name__ == '__main__':
    engine = TcmMeridianEngine()
    print(json.dumps(engine.evaluate_tcm_profile(), indent=2))