"""
Avian Persona Agent: Professor Puffin (Socratic Health Literacy & Education)
"""

from __future__ import annotations

from typing import Dict, Any


class ProfPuffinAgent:
    """
    Professor Puffin simplifies complex clinical concepts into accessible, Socratic patient education dialogues.
    """

    def __init__(self, agent_name: str = "Professor Puffin"):
        self.agent_name = agent_name
        self.role = "Socratic Patient Health Literacy"

    def generate_explanation(self, term: str) -> Dict[str, Any]:
        explanations = {
            "sibi": "Systemic Inflammatory Burden Index measures how active your body's immune response is right now.",
            "hrv": "Heart Rate Variability shows how adaptable your autonomic nervous system is to stress and rest.",
            "spo2": "SpO2 measures the percentage of oxygen carrying proteins in your bloodstream.",
        }

        explanation = explanations.get(
            term.lower(),
            f"{term.capitalize()} is an important biometric metric used to monitor your health and recovery trajectory.",
        )

        return {
            "agent": self.agent_name,
            "term": term,
            "patient_friendly_summary": explanation,
            "socratic_question": f"Would you like to explore how your daily sleep habits influence your {term.upper()} score?",
        }


prof_puffin = ProfPuffinAgent()
