import pytest
from pocketgull_api.agents.dr_gulliver import dr_gulliver, DrGulliverAgent


def test_dr_gulliver_overview():
    res = dr_gulliver.synthesize_overview({"patient_id": "P-101", "vitals": {"heart_rate": 72, "spo2": 98}})
    assert res["clinical_status"] == "STABLE"
    assert "P-101" in res["patient_id"]


def test_dr_gulliver_legacy_chronicling():
    res = dr_gulliver.synthesize_legacy_chronicling({
        "narrative": "Observed significant HRV recovery after 15-min forest phytoncide walking.",
        "archetype": "LAND_STEWARD"
    })
    assert res["agent"] == "Dr. Gulliver"
    assert res["extracted_snomed_code"] == "366144005"
    assert res["primary_research_tag"] == "Autonomic HRV Recovery"
    assert "LAND_STEWARD" in res["lineage_guidance"]
