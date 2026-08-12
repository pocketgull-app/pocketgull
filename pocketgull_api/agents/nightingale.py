"""
Avian Persona Agent: Nightingale (Vital Telemetry & Acute Alarm Thresholding)
"""

from __future__ import annotations

from typing import Dict, Any


class NightingaleAgent:
    """
    Nightingale monitors continuous biometric streams (HR, SpO2, HRV, SIBI index)
    and enforces acute alarm thresholds.
    """

    def __init__(self, agent_name: str = "Nightingale"):
        self.agent_name = agent_name
        self.role = "Vital Telemetry & Acute Alarm Thresholding"

    def evaluate_telemetry(self, heart_rate: float, spo2: float, sibi_index: float) -> Dict[str, Any]:
        alarms = []

        if spo2 < 90.0:
            alarms.append("CRITICAL: Hypoxemia warning (SpO2 < 90%)")
        if heart_rate > 130.0:
            alarms.append("WARNING: Tachycardia alert (HR > 130 bpm)")
        if sibi_index > 0.75:
            alarms.append("ELEVATED: High Systemic Inflammatory Burden Index (SIBI > 0.75)")

        return {
            "agent": self.agent_name,
            "active_alarms": alarms,
            "alarm_severity": "CRITICAL" if any("CRITICAL" in a for a in alarms) else ("WARNING" if alarms else "NORMAL"),
        }


nightingale = NightingaleAgent()
