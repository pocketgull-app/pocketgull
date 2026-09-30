"""
Unit test suite for Botanical Synergy & CYP450 Bio-Equivalence ML Service.
"""

from fastapi.testclient import TestClient
from main import app
from services.botanical_synergy_service import (
    BotanicalSynergyService,
    IBotanicalEntry,
    IMedicationEntry,
    IBotanicalSynergyRequest,
)

client = TestClient(app)


def test_piperine_curcumin_synergy():
    """Verify Piperine + Curcumin synergy detection and bioavailability amplification."""
    req = IBotanicalSynergyRequest(
        botanicals=[
            IBotanicalEntry(name="Piperine", dose_mg=10.0),
            IBotanicalEntry(name="Curcumin", dose_mg=500.0)
        ],
        medications=[]
    )
    result = BotanicalSynergyService.evaluate(req)

    assert result.risk_level == "LOW"
    assert len(result.synergy_pairs_detected) >= 1
    pair = result.synergy_pairs_detected[0]
    assert "Piperine" in pair.botanical_a
    assert pair.amplification_factor == 20.0
    assert result.provenance_hash.startswith("sha256:")


def test_st_johns_wort_ssri_contraindication():
    """Verify St. John's Wort + Sertraline triggers serotonin syndrome alerts."""
    req = IBotanicalSynergyRequest(
        botanicals=[
            IBotanicalEntry(name="St. John's Wort", dose_mg=300.0)
        ],
        medications=[
            IMedicationEntry(name="Sertraline", dose_mg=50.0)
        ]
    )
    result = BotanicalSynergyService.evaluate(req)

    assert result.risk_level in ["HIGH", "CRITICAL"]
    assert any("Serotonin Syndrome" in alert for alert in result.ismp_safety_alerts)


def test_berberine_metformin_synergy():
    """Verify Berberine + Metformin glucose transport synergy and hypoglycemia warning."""
    req = IBotanicalSynergyRequest(
        botanicals=[
            IBotanicalEntry(name="Berberine", dose_mg=500.0)
        ],
        medications=[
            IMedicationEntry(name="Metformin", dose_mg=850.0)
        ]
    )
    result = BotanicalSynergyService.evaluate(req)

    assert any("AMPK" in pair.synergy_type for pair in result.synergy_pairs_detected)
    assert any("hypoglycemia" in alert.lower() for alert in result.ismp_safety_alerts)


def test_fastapi_endpoint_botanical_synergy():
    """Test live FastAPI route for botanical synergy evaluation."""
    payload = {
        "botanicals": [
            {"name": "Piperine", "dose_mg": 10.0, "frequency": "daily"},
            {"name": "Curcumin", "dose_mg": 500.0, "frequency": "daily"}
        ],
        "medications": [
            {"name": "Atorvastatin", "dose_mg": 20.0, "route": "oral"}
        ],
        "hepatic_impairment_stage": "normal",
        "patient_age": 52.0
    }
    response = client.post("/v1/models/integrative/botanical-synergy", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "composite_interaction_risk_score" in data
    assert "synergy_pairs_detected" in data
    assert "provenance_hash" in data
