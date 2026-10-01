"""
PocketGull Transgenerational Epigenetics, Mitochondrial Lineage & Environmental Exposomics Engine
================================================================================================
Implements Environmental Epigenetics & 150-Year Lineage Models:
1. Endocrine-Disrupting Chemical (EDC) cumulative xenobiotic exposure index.
2. Parental Germline Methylation Resilience (Folate/B12 1-carbon cycle & glutathione defense).
3. Matrilineal Mitochondrial DNA (mtDNA) Heteroplasmy & Complex IV Respiratory Reserve.
4. Paternal Gametogenesis & Sperm tsRNA (tRNA-derived small RNA) Epigenetic Payload.
5. 90-Day Preconception Gamete Conditioning Protocol with Antonovsky Manageability Invariant.
"""

import json
import numpy as np
from typing import Dict, Any, List

class TransgenerationalStewardshipEngine:
    """Evaluates environmental toxicant burdens, germline epigenetic stability, and preconception vitality."""

    def evaluate_stewardship_profile(
        self,
        tap_water_unfiltered: bool = True,
        canned_food_weekly_servings: int = 4,
        synthetic_fragrance_exposure_daily: bool = True,
        pesticide_organic_food_pct: float = 40.0,
        homocysteine_umol_l: float = 11.5,
        serum_folate_ng_ml: float = 9.2,
        glutathione_peroxidase_u_g_hb: float = 38.0,
        heavy_metals_risk_score: float = 0.35,
        maternal_mitochondrial_heteroplasmy_pct: float = 3.8,
        paternal_tsrna_stress_index: float = 24.0,
        days_until_target_conception: int = 90
    ) -> Dict[str, Any]:
        """
        Calculates toxicant exposure index, germline resilience, mtDNA heteroplasmy, 
        paternal small RNA integrity, and low-cost restorative protocol.
        """
        # 1. Cumulative EDC Exposure Index (0.0 to 100.0)
        edc_score = 10.0
        if tap_water_unfiltered:
            edc_score += 25.0  # PFAS, microplastics, disinfection byproducts
        edc_score += min(30.0, canned_food_weekly_servings * 6.0)  # BPA / BPS lining
        if synthetic_fragrance_exposure_daily:
            edc_score += 20.0  # Phthalates
        edc_score += (100.0 - pesticide_organic_food_pct) * 0.15  # Organophosphates

        edc_exposure_tier = (
            "CRITICAL_XENOBIOTIC_BURDEN" if edc_score > 65.0 
            else ("MODERATE_EDC_LOAD" if edc_score >= 35.0 else "MINIMAL_TOXIC_BURDEN")
        )

        # 2. Germline Epigenetic Methylation Resilience Index (0.0 to 100.0)
        meth_score = (
            100.0 
            - max(0.0, (homocysteine_umol_l - 8.0) * 8.0) 
            - max(0.0, (15.0 - serum_folate_ng_ml) * 3.0) 
            - max(0.0, (45.0 - glutathione_peroxidase_u_g_hb) * 1.5) 
            - (heavy_metals_risk_score * 30.0)
        )
        meth_score = round(max(5.0, min(100.0, meth_score)), 1)

        # 3. Matrilineal Mitochondrial DNA (mtDNA) Heteroplasmy Status
        # Optimal: <2.0%, Borderline: 2.0-8.0%, Elevated Risk of Multi-Generational Decay: >8.0%
        mtdna_status = (
            "OPTIMAL_MATRILINEAL_HOMOPLASMY" if maternal_mitochondrial_heteroplasmy_pct < 2.0
            else ("BORDERLINE_OXIDATIVE_HETEROPLASMY" if maternal_mitochondrial_heteroplasmy_pct <= 8.0 else "HIGH_RISK_MATRILINEAL_MUTATION_BURDEN")
        )

        # 4. Paternal Sperm tsRNA Epigenetic Stress Index (0.0 to 100.0)
        # Reflects xenobiotic/stress remodeling of non-coding small RNA payloads during 74-day spermatogenesis
        tsrna_tier = (
            "STABLE_PATERNAL_EPIGENOME" if paternal_tsrna_stress_index < 25.0
            else ("MODERATE_TSRNA_REMODELING" if paternal_tsrna_stress_index <= 55.0 else "HIGH_RISK_PATERNAL_METABOLIC_PROGRAMMING")
        )

        # 5. Gametogenesis Window (Spermatogenesis ~74-90 days; Oocyte Folliculogenesis ~85-100 days)
        gamete_window_progress_pct = round(min(100.0, max(0.0, (90 - days_until_target_conception) / 90.0 * 100.0)), 1)

        # 6. Stewardship Directives with Manageability Invariant (Actionable, Low-Cost Restorative Swaps)
        stewardship_protocol = []
        manageability_restorative_swaps = []

        if tap_water_unfiltered:
            stewardship_protocol.append("Switch to certified NSF-53/58 carbon block or reverse osmosis filtration to eliminate PFAS, lead, and microplastics.")
            manageability_restorative_swaps.append({
                "hazard": "Municipal Tap Water PFAS & Heavy Metals",
                "accessibleFrugalSwap": "NSF-53 certified sub-micron carbon block countertop or pitcher filter ($25-$35) + flush tap for 60s each morning.",
                "biologicalMechanism": "Excludes 98% of long-chain and short-chain perfluoroalkyl acids, protecting oocyte and sperm membranes from peroxidative damage."
            })

        if canned_food_weekly_servings > 2 or synthetic_fragrance_exposure_daily:
            stewardship_protocol.append("Phase out canned epoxy resin linings and synthetic personal fragrances to halt phthalate and bisphenol anti-androgenic signaling.")
            manageability_restorative_swaps.append({
                "hazard": "Endocrine Disruptors (BPA / Phthalates)",
                "accessibleFrugalSwap": "Transition to bulk dry legumes/grains in glass jars and unscented natural soaps/castile cleanser ($5-$10/mo savings).",
                "biologicalMechanism": "Halts exogenous estrogenic stimulation and prevents aberrant sperm tsRNA covalent modification during epididymal transit."
            })

        if homocysteine_umol_l > 9.0:
            stewardship_protocol.append(f"Optimize 1-carbon methylation cycle: L-Methylfolate (5-MTHF) 800mcg + Methylcobalamin 1000mcg to lower homocysteine ({homocysteine_umol_l} -> <8.0 umol/L).")
            manageability_restorative_swaps.append({
                "hazard": "Elevated Homocysteine & Germline Hypomethylation",
                "accessibleFrugalSwap": "Add daily dietary methyl donors: 2 pasture-raised eggs (choline 300mg) + 1 cup steamed dark leafy greens (folate).",
                "biologicalMechanism": "Supplies S-adenosylmethionine (SAMe) substrates for DNA methyltransferases (DNMT1/3a), preserving genomic imprinting."
            })

        if maternal_mitochondrial_heteroplasmy_pct > 2.0:
            stewardship_protocol.append(f"Maternal Matrilineal Support: Mitigate oocyte mitochondrial ROS (Heteroplasmy {maternal_mitochondrial_heteroplasmy_pct}%): CoQ10 200mg + Alpha-Lipoic Acid 300mg.")
            manageability_restorative_swaps.append({
                "hazard": "Oocyte Mitochondrial ROS & Heteroplasmy",
                "accessibleFrugalSwap": "Cold-water cold-brew green tea (EGCG) + 1 tbsp ground flaxseeds (lignans) + 15 min daily sunlight (photobiomodulation 660nm).",
                "biologicalMechanism": "Activates PGC-1alpha mitochondrial biogenesis and protects maternal mtDNA from strand breakage before fertilization."
            })

        if paternal_tsrna_stress_index > 20.0:
            stewardship_protocol.append(f"Paternal 74-Day Spermatogenesis Cleansing: Reduce sperm tsRNA stress index ({paternal_tsrna_stress_index}): Zinc 30mg + Lycopene 15mg + scrotal cooling.")
            manageability_restorative_swaps.append({
                "hazard": "Paternal Sperm Epigenetic Stress (tsRNA Alterations)",
                "accessibleFrugalSwap": "Avoid laptops directly on lap, hot tubs, and tight synthetic underwear + add 1/4 cup raw pumpkin seeds daily (zinc/magnesium).",
                "biologicalMechanism": "Maintains protamine-to-histone transition fidelity and blocks stress-induced small RNA cleavage in the male reproductive tract."
            })

        # Universal Parasympathetic Coherence Anchor
        manageability_restorative_swaps.append({
            "hazard": "Allostatic Stress & Parasympathetic Withdrawal",
            "accessibleFrugalSwap": "Daily 10-minute 0.1 Hz resonant breathing (5.5s inhalation, 5.5s exhalation) before sleep (Cost: $0).",
            "biologicalMechanism": "Restores heart rate variability (HRV RMSSD > 40ms) and activates the cholinergic anti-inflammatory reflex, buffering fetal autonomic tone."
        })

        return {
            "cumulative_edc_xenobiotic_index": round(edc_score, 1),
            "edc_exposure_tier": edc_exposure_tier,
            "germline_methylation_resilience_score": meth_score,
            "methylation_status": "OPTIMAL_EPIGENETIC_FIDELITY" if meth_score >= 80.0 else ("SUBCLINICAL_HYPOMETHYLATION" if meth_score >= 50.0 else "IMPAIRED_1_CARBON_FIDELITY"),
            "matrilineal_mitochondrial_health": {
                "maternal_heteroplasmy_pct": maternal_mitochondrial_heteroplasmy_pct,
                "mitochondrial_transmission_status": mtdna_status,
                "matrilineal_preservation_horizon": "150-Year Maternal Lineage Safe" if maternal_mitochondrial_heteroplasmy_pct < 2.5 else "Active Antioxidant Defense Required"
            },
            "paternal_gamete_epigenetics": {
                "paternal_tsrna_stress_index": paternal_tsrna_stress_index,
                "sperm_epigenome_tier": tsrna_tier,
                "spermatogenesis_cycle_days": 74
            },
            "preconception_90day_gamete_clock": {
                "days_until_target_conception": days_until_target_conception,
                "gametogenesis_maturation_pct": gamete_window_progress_pct,
                "current_biological_phase": (
                    "Early Mitotic Gamete Priming" if days_until_target_conception > 60 
                    else ("Meiotic Crossing Over & Mitochondrial Loading" if days_until_target_conception > 30 
                          else "Final Epigenetic Imprinting & Chromatin Condensation")
                )
            },
            "seven_generations_stewardship_protocol": stewardship_protocol,
            "manageability_restorative_swaps": manageability_restorative_swaps
        }

if __name__ == '__main__':
    engine = TransgenerationalStewardshipEngine()
    print(json.dumps(engine.evaluate_stewardship_profile(), indent=2))