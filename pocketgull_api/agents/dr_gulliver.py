"""
Avian Persona Agent: Dr. Gulliver (Clinical Overview & Differential Synthesis)
"""

from __future__ import annotations

from typing import Dict, Any


class DrGulliverAgent:
    """
    Dr. Gulliver synthesizes multi-paradigm patient telemetry and clinical history
    into high-level differential diagnoses and care plan overviews.
    """

    def __init__(self, agent_name: str = "Dr. Gulliver"):
        self.agent_name = agent_name
        self.role = "Clinical Overview & Differential Synthesis"

    def synthesize_overview(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        patient_id = patient_data.get("patient_id", "P-UNKNOWN")
        vitals = patient_data.get("vitals", {})

        heart_rate = vitals.get("heart_rate", 72)
        spo2 = vitals.get("spo2", 98)

        stability = "STABLE" if (60 <= heart_rate <= 100 and spo2 >= 95) else "ATTENTION_REQUIRED"

        return {
            "agent": self.agent_name,
            "patient_id": patient_id,
            "clinical_status": stability,
            "primary_synthesis": f"Patient demonstrates {stability.lower()} physiological state (HR {heart_rate} bpm, SpO2 {spo2}%).",
            "recommended_focus": "Maintain continuous biometric monitoring and circadian sleep hygiene.",
        }

    def synthesize_legacy_chronicling(self, reflection_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Synthesizes raw user voice reflections and clinical discoveries into
        open-science research metadata and lineage wisdom directives.
        """
        narrative = reflection_data.get("narrative", "")
        archetype = reflection_data.get("archetype", "OPEN_SCIENCE_CONTRIBUTOR")

        # Auto-extract key research themes and SNOMED-CT clinical tags
        is_hrv = "hrv" in narrative.lower() or "heart" in narrative.lower()
        is_forest = "forest" in narrative.lower() or "phytoncide" in narrative.lower()

        snomed_code = "366144005" if is_hrv else ("428803005" if is_forest else "413315001")
        research_tag = "Autonomic HRV Recovery" if is_hrv else ("Environmental Phytoncide" if is_forest else "General Well-Being")

        return {
          "agent": self.agent_name,
          "archetype": archetype,
          "extracted_snomed_code": snomed_code,
          "primary_research_tag": research_tag,
          "curated_wisdom_summary": f"Dr. Gulliver Curated: {narrative[:120]}...",
          "lineage_guidance": f"Preserved for lineage stewardship under {archetype} archetype directive."
        }


dr_gulliver = DrGulliverAgent()
