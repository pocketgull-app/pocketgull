"""
Pocket Gull — IEEE P2933™ TIPPSS Pydantic v2 Models for Python Sidecar.
Enforces Trust, Identity, Privacy, Protection, Safety, Security across
cross-workspace Python/FastAPI data pipelines, ML scoring, and edge telemetry.
"""

from __future__ import annotations

from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class TippssTelemetryFrame(BaseModel):
    """
    IEEE P2933™ Ingestion Telemetry Frame.
    Strictly aligns with TypeScript ITippssTelemetryFrame and Dart HealthTelemetrySyncData.
    """
    model_config = ConfigDict(str_strip_whitespace=True, extra="ignore")

    device_id: str = Field(
        ...,
        description="FDA UDI / IEEE EUI-64 or Bluetooth MAC address",
        min_length=3,
        max_length=128
    )
    patient_id: str = Field(
        ...,
        description="Cryptographically bound patient identifier (de-identified)",
        min_length=3,
        max_length=64
    )
    timestamp_ms: int = Field(
        ...,
        description="Hardware epoch timestamp in milliseconds",
        ge=0
    )
    sequence_number: int = Field(
        ...,
        description="Monotonically increasing hardware packet counter",
        ge=0
    )
    modality: Literal[
        "heart_rate",
        "spo2",
        "temperature",
        "blood_pressure",
        "glucose",
        "raw_ppg",
        "motion"
    ] = Field(..., description="Biomedical sensor modality")
    value: float = Field(
        ...,
        description="Numeric sensor measurement"
    )
    signal_quality_index: int = Field(
        default=95,
        ge=0,
        le=100,
        description="Signal Quality Index (SQI 0-100%)"
    )
    lead_off_detected: bool = Field(
        default=False,
        description="Hardware electrode or optical sensor detachment indicator"
    )
    rssi_dbm: Optional[int] = Field(
        default=None,
        ge=-120,
        le=0,
        description="Received Signal Strength Indicator (dBm) for proximity gating"
    )
    payload_signature: Optional[str] = Field(
        default=None,
        description="HMAC-SHA256 pre-image or hardware attestation seal"
    )


class WaveformSample(BaseModel):
    """Individual high-frequency waveform point."""
    model_config = ConfigDict(str_strip_whitespace=True, extra="ignore")

    timestamp_ms: int = Field(..., ge=0)
    val: float = Field(...)
    modality: Literal["ppg", "ecg"] = Field(default="ppg")


class WaveformIncidentSnapshot(BaseModel):
    """
    Frozen -15s/+15s high-resolution incident snapshot for diagnostic anomaly capture.
    Stamped with FDA 21 CFR Part 11 compliant SHA-256 digest.
    """
    model_config = ConfigDict(str_strip_whitespace=True, extra="ignore")

    snapshot_id: str = Field(..., description="Unique incident identifier")
    trigger_timestamp: str = Field(..., description="ISO 8601 trigger timestamp")
    trigger_reason: str = Field(..., description="Clinical anomaly description")
    acuity: Literal["ROUTINE", "URGENT", "STAT_EMERGENCY"] = Field(
        default="STAT_EMERGENCY",
        description="Triage acuity rating"
    )
    pre_event_samples_count: int = Field(..., ge=0)
    post_event_samples_count: int = Field(..., ge=0)
    duration_sec: float = Field(..., ge=0.0)
    samples: List[WaveformSample] = Field(default_factory=list)
    sha256_part11_digest: str = Field(
        ...,
        description="FDA 21 CFR Part 11 cryptographic seal"
    )


class TippssVerificationRequest(BaseModel):
    """Ingress verification request payload."""
    model_config = ConfigDict(str_strip_whitespace=True, extra="ignore")

    frame: TippssTelemetryFrame
    expected_patient_id: str = Field(..., min_length=1)
    min_rssi_dbm: int = Field(default=-85, ge=-120, le=0)


class TippssVerificationResponse(BaseModel):
    """Ingress verification decision with audit attestation."""
    model_config = ConfigDict(str_strip_whitespace=True, extra="ignore")

    is_approved: bool
    pillar_violations: List[str] = Field(default_factory=list)
    violation_reason: Optional[str] = None
    is_lead_off_artifact: bool = False
    sha256_audit_digest: str
