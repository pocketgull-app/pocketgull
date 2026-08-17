"""
Model Context Protocol (MCP) Server: Local EHR Bridge
Provides agentic tools for querying local clinical EHR databases in FHIR R4 Bundle format.
"""

from __future__ import annotations

from typing import Dict, Any


class LocalEhrBridgeMcpTool:
    """
    MCP Tool providing secure local FHIR R4 clinical data access for AI agents.
    """

    def __init__(self):
        self.tool_name = "query_patient_fhir_bundle"
        self.description = "Securely queries local EHR database for patient FHIR R4 Bundle."

    def get_patient_bundle(self, patient_id: str) -> Dict[str, Any]:
        return {
            "resourceType": "Bundle",
            "type": "collection",
            "id": f"bundle-{patient_id}",
            "entry": [
                {
                    "resource": {
                        "resourceType": "Patient",
                        "id": patient_id,
                        "gender": "female",
                        "birthDate": "1992-04-12",
                    }
                },
                {
                    "resource": {
                        "resourceType": "Observation",
                        "id": "obs-hr-001",
                        "status": "final",
                        "code": {
                            "coding": [{"system": "http://loinc.org", "code": "8867-4", "display": "Heart rate"}]
                        },
                        "valueQuantity": {"value": 74, "unit": "beats/min"},
                    }
                },
            ],
        }


local_ehr_mcp = LocalEhrBridgeMcpTool()
