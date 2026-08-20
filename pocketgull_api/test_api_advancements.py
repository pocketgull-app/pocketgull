"""
Unit and Integration Tests for PocketGull's Advanced API Suite:
1. Edge-Preserving HIPAA De-Identification Middleware (§164.514)
2. SMART-on-FHIR 1-Click EHR Launch & CarePlan Write-Back
3. Continuous Biosignal Streaming via Server-Sent Events (SSE)
"""

import json
from fastapi.testclient import TestClient
from pocketgull_api.main import app
from pocketgull_api.middleware.hipaa_deidentifier import sanitize_hipaa_payload, pseudonymize_id, convert_dob_to_age_bracket

client = TestClient(app)

def test_hipaa_safe_harbor_sanitizer():
    """Validates recursive stripping and pseudonymization of HIPAA 18 direct identifiers."""
    raw_payload = {
        "name": "John Doe",
        "email": "john.doe@hospital.org",
        "phone": "+1-555-0199",
        "mrn": "MRN-987654321",
        "birth_date": "1960-05-15",
        "age": 66,
        "vitals": {
            "hr": 74,
            "patient_name": "John Doe Private",
            "notes": "Patient reports digital eye strain."
        }
    }

    sanitized = sanitize_hipaa_payload(raw_payload)
    assert sanitized["name"] == "Homo Sapiens (De-Identified Clinical Profile)"
    assert sanitized["email"] == "[REDACTED_CONTACT_INFO]"
    assert sanitized["phone"] == "[REDACTED_CONTACT_INFO]"
    assert sanitized["mrn"].startswith("anon_pt_")
    assert sanitized["age_bracket"] == "65-69y"
    assert sanitized["vitals"]["patient_name"] == "Homo Sapiens (De-Identified Clinical Profile)"
    assert sanitized["vitals"]["hr"] == 74

def test_dob_converter_edge_cases():
    """Tests age cohort conversion including HIPAA >=90 threshold."""
    assert convert_dob_to_age_bracket("1990-01-01") == "35-39y"
    assert convert_dob_to_age_bracket("1930-01-01") == "90+"
    assert convert_dob_to_age_bracket("invalid") == "UNKNOWN_AGE_BRACKET"

def test_smart_on_fhir_launch_flow():
    """Validates SMART-on-FHIR OAuth2 launch sequence for Epic and Cerner EHRs."""
    # 1. Epic Launch
    res_epic = client.get("/api/fhir/smart/launch", params={
        "iss": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
        "launch": "epic_launch_12345"
    })
    assert res_epic.status_code == 200
    data_epic = res_epic.json()
    assert data_epic["ehr_vendor"] == "Epic Systems"
    assert "response_type=code" in data_epic["auth_redirect_url"]
    assert "launch=epic_launch_12345" in data_epic["auth_redirect_url"]

    # 2. Cerner Launch
    res_cerner = client.get("/api/fhir/smart/launch", params={
        "iss": "https://fhir.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d",
        "launch": "cerner_launch_67890"
    })
    assert res_cerner.status_code == 200
    assert res_cerner.json()["ehr_vendor"] == "Oracle Cerner"

def test_smart_on_fhir_careplan_export():
    """Validates writing back signed CarePlan to EHR FHIR server."""
    payload = {
        "patient_id": "p002",
        "care_plan_title": "PocketGull Cardiometabolic Care Plan",
        "summary": "Paced breathing and precision CoQ10 protocol.",
        "interventions": [
            "Paced Resonance Breathing 10 min daily at 0.1 Hz",
            "CoQ10 200mg morning with healthy fats",
            "Magnesium Glycinate 300mg before bed"
        ]
    }
    res = client.post("/api/fhir/smart/export-careplan", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "CAREPLAN_EXPORTED_TO_EHR"
    assert data["fhir_resource_type"] == "CarePlan"
    assert len(data["fhir_payload"]["activity"]) == 3
    assert data["fhir_payload"]["subject"]["reference"] == "Patient/p002"

def test_sse_biosignal_telemetry_stream():
    """Validates Server-Sent Events (SSE) live telemetry stream format."""
    # Test with short 2-second stream
    response = client.get("/api/stream/telemetry", params={"sessions_seconds": 2})
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]
    assert response.headers.get("X-HIPAA-Safe-Harbor") == "164.514(b)(2)-ENFORCED"