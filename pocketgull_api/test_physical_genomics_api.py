"""
Unit and Integration Test Suite for Physical Genomics FastAPI Endpoints
Tests multi-task biophysical predictions, pharmacological rescue, and FHIR LOINC 98253-8 bundling.
"""

import base64
from fastapi.testclient import TestClient
from main import app
from services.physical_genomics_api_service import physical_genomics_service, PhysicalGenomicsPredictRequest, PharmacologicalRescueRequest, HologramFhirBundleRequest

client = TestClient(app)


def test_physical_genomics_direct_service():
    """Test direct Python service execution."""
    req = PhysicalGenomicsPredictRequest(
        patient_id="SYN-PG-TEST",
        ecm_stiffness_kpa=8.5,
        actin_tension_nn=2.4,
        epigenetic_state="HYPERACETYLATED_H3K27AC",
        med1_conc_um=4.5,
        brd4_conc_um=3.2,
        has_ctcf_mutation=False,
    )
    res = physical_genomics_service.predict_multi_task_genomics(req)

    assert res.patient_id == "SYN-PG-TEST"
    assert res.tad_insulation_score > 0.60
    assert res.is_phase_separated is True
    assert res.droplet_radius_nm > 100.0
    assert res.cleavage_probability > 0.70
    assert res.outer_turn_unwrapping_force_pn > 4.0
    assert res.yap_taz_nuclear_ratio > 1.0
    assert len(res.cryptographic_sha256_attestation) == 64


def test_predict_physical_genomics_endpoint():
    """Test POST /v1/genomics/physical/predict FastAPI route."""
    payload = {
        "patient_id": "SYN-PG-API-001",
        "ecm_stiffness_kpa": 34.0,
        "actin_tension_nn": 4.8,
        "epigenetic_state": "POLYCOMB_H3K27ME3",
        "med1_conc_um": 7.5,
        "brd4_conc_um": 6.0,
        "has_ctcf_mutation": True,
        "crispr_guide_rna": "GACUUGACAGUCUACGAUCG",
        "crispr_target_dna": "GACTTGACAGTCTACGAUCG",
    }
    response = client.post("/v1/genomics/physical/predict", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["patient_id"] == "SYN-PG-API-001"
    assert data["tad_insulation_score"] == 0.38  # CTCF mutant
    assert data["fractal_globule_gamma"] == 0.88
    assert data["transcriptional_mechanostate"] == "STIFF_PRO_FIBROTIC_ONCOGENIC"
    assert data["yap_taz_nuclear_ratio"] >= 3.0
    assert "tad_insulation" in data["conformal_intervals"]
    assert len(data["cryptographic_sha256_attestation"]) == 64


def test_pharmacological_rescue_endpoint():
    """Test POST /v1/genomics/pharmacology/rescue endpoint."""
    payload = {
        "paradigm": "condensates",
        "drug_molecule": "JQ1",
        "current_aberrant_metric": 480.0,
        "target_metric_baseline": 85.0
    }
    response = client.post("/v1/genomics/pharmacology/rescue", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["drug_molecule"] == "JQ1"
    assert data["recommended_dose_nm"] > 0
    assert data["ic50_binding_affinity_nm"] == 72.0
    assert data["predicted_normalization_pct"] >= 90.0
    assert data["droplet_dissolution_pct"] == 78.5
    assert len(data["cryptographic_sha256_seal"]) == 64


def test_hologram_fhir_bundle_endpoint():
    """Test POST /v1/genomics/hologram/bundle with LOINC 98253-8."""
    dummy_b64 = base64.b64encode(b"DUMMY_WEBGL_PNG_DATA").decode("utf-8")
    payload = {
        "patient_id": "SYN-PG-MEDIA-001",
        "media_content_base64": dummy_b64,
        "mime_type": "image/png",
        "paradigm": "3D Chromatin Loop Extrusion",
        "normalization_score_pct": 96.4
    }
    response = client.post("/v1/genomics/hologram/bundle", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["resource_type"] == "Bundle"
    assert data["loinc_code"] == "98253-8"
    assert data["loinc_display"] == "Physical Genomics 3D Spatial Hologram"
    assert len(data["fhir_bundle_json"]["entry"]) == 2
    assert data["fhir_bundle_json"]["entry"][0]["resource"]["resourceType"] == "DiagnosticReport"
    assert data["fhir_bundle_json"]["entry"][1]["resource"]["resourceType"] == "Media"
    assert len(data["sha256_integrity_digest"]) == 64
