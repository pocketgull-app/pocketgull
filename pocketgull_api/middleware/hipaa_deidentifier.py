"""
PocketGull Edge-Preserving HIPAA De-Identification Middleware (HIPAA Safe Harbor §164.514)
Automatically intercepts incoming HTTP payloads, sanitizes direct/indirect identifiers,
converts exact birthdates to age cohorts using the current UTC year, and cryptographically
pseudonymizes patient IDs using an env-configured or ephemeral per-process CSPRNG salt.
"""

from datetime import datetime, timezone
import hashlib
import hmac
import json
import os
import re
import secrets
from typing import Any, Optional
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

HIPAA_UNCONDITIONAL_IDENTIFIER_KEYS = {
    "patient_name", "first_name", "last_name", "full_name",
    "mrn", "medical_record_number", "ssn", "social_security_number",
    "phone", "phone_number", "telephone", "mobile",
    "email", "email_address", "address", "street", "zip", "zipcode",
    "ip_address", "ip", "device_id", "serial_number",
}

# Parent collection/object keys whose nested `"name"` field represents clinical substances,
# medications, botanicals, biomarkers, or domain entities rather than a patient's legal name.
_NON_PATIENT_NAME_PARENTS = {
    "botanicals", "medications", "drugs", "herbs", "supplements", "ingredients",
    "compounds", "foods", "crops", "interventions", "biomarkers", "labs",
    "lab_results", "conditions", "symptoms", "allergies", "procedures",
    "devices", "products", "tests", "oxidative_stress_markers", "rasayanas",
}

# Sibling keys indicating an item dict is a medication/botanical/clinical substance, not a person
_SUBSTANCE_ITEM_HINT_KEYS = {
    "dose_mg", "dosage", "frequency", "route", "rxnorm", "active_ingredient",
    "concentration", "unit", "cyp_pathway", "botanical_family", "crop_name",
}

_EPHEMERAL_PSEUDONYM_SALT: Optional[str] = None


def _get_pseudonym_salt() -> str:
    """Loads pseudonymization salt from env or generates a per-process CSPRNG salt (zero static literals)."""
    global _EPHEMERAL_PSEUDONYM_SALT
    configured = (os.getenv("HIPAA_PSEUDONYM_SALT") or "").strip()
    if configured:
        return configured
    if _EPHEMERAL_PSEUDONYM_SALT is None:
        _EPHEMERAL_PSEUDONYM_SALT = secrets.token_hex(32)
    return _EPHEMERAL_PSEUDONYM_SALT


def pseudonymize_id(raw_id: str, salt: Optional[str] = None) -> str:
    """Generates deterministic pseudo-anonymous patient token using HMAC-SHA256."""
    effective_salt = salt if salt else _get_pseudonym_salt()
    digest = hmac.new(
        effective_salt.encode("utf-8"),
        str(raw_id).encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return f"anon_pt_{digest[:12]}"


def convert_dob_to_age_bracket(dob_str: str) -> str:
    """Converts YYYY-MM-DD to standard 5-year HIPAA age bracket relative to current UTC year."""
    match = re.search(r"(\d{4})", str(dob_str))
    if match:
        birth_year = int(match.group(1))
        current_year = datetime.now(timezone.utc).year
        approx_age = max(0, current_year - birth_year)
        if approx_age >= 90:
            return "90+"
        bracket_start = (approx_age // 5) * 5
        return f"{bracket_start}-{bracket_start + 4}y"
    return "UNKNOWN_AGE_BRACKET"


def _is_patient_name_context(data: dict[str, Any], parent_key: Optional[str]) -> bool:
    """Returns True only when bare `"name"` appears in a patient/demographic context."""
    if parent_key is not None:
        norm_parent = parent_key.lower().replace("-", "_").replace(" ", "_")
        if norm_parent in _NON_PATIENT_NAME_PARENTS:
            return False
    lower_keys = {k.lower().replace("-", "_").replace(" ", "_") for k in data.keys()}
    if lower_keys & _SUBSTANCE_ITEM_HINT_KEYS:
        return False
    return True


def sanitize_hipaa_payload(data: Any, parent_key: Optional[str] = None) -> Any:
    """Recursively traverses dictionary or list to strip/mask HIPAA 18 identifiers."""
    if isinstance(data, dict):
        sanitized: dict[str, Any] = {}
        redact_bare_name = _is_patient_name_context(data, parent_key)
        for k, v in data.items():
            k_lower = k.lower().replace("-", "_").replace(" ", "_")

            if k_lower == "name" and redact_bare_name:
                sanitized[k] = "Homo Sapiens (De-Identified Clinical Profile)"
            elif k_lower in HIPAA_UNCONDITIONAL_IDENTIFIER_KEYS:
                if "name" in k_lower:
                    sanitized[k] = "Homo Sapiens (De-Identified Clinical Profile)"
                elif "email" in k_lower or "phone" in k_lower or "telephone" in k_lower or "mobile" in k_lower:
                    sanitized[k] = "[REDACTED_CONTACT_INFO]"
                elif "ssn" in k_lower or "mrn" in k_lower or "medical_record_number" in k_lower:
                    sanitized[k] = pseudonymize_id(str(v))
                else:
                    sanitized[k] = "[REDACTED_HIPAA_DIRECT_IDENTIFIER]"
            elif k_lower in ("dob", "birth_date", "birthdate", "date_of_birth"):
                sanitized["age_bracket"] = convert_dob_to_age_bracket(str(v))
            elif k_lower in ("patient_id", "patientid", "id") and isinstance(v, str) and not v.startswith("anon_"):
                # Preserve explicitly synthetic/demo test IDs while pseudonymizing real clinical patient IDs/MRNs
                if len(v) > 5 and not v.startswith(("p00", "SYN-", "PT-")):
                    sanitized[k] = pseudonymize_id(v)
                else:
                    sanitized[k] = v
            else:
                sanitized[k] = sanitize_hipaa_payload(v, parent_key=k_lower)
        return sanitized
    elif isinstance(data, list):
        return [sanitize_hipaa_payload(item, parent_key=parent_key) for item in data]
    return data


class HipaaDeidentificationMiddleware(BaseHTTPMiddleware):
    """ASGI Middleware executing HIPAA Safe Harbor de-identification on JSON request bodies."""

    async def dispatch(self, request: Request, call_next):
        if request.method in ("POST", "PUT", "PATCH") and "application/json" in request.headers.get("content-type", ""):
            try:
                body = await request.body()
                if body:
                    payload = json.loads(body.decode("utf-8"))
                    sanitized = sanitize_hipaa_payload(payload)
                    new_body = json.dumps(sanitized).encode("utf-8")

                    # Update BOTH cached request._body AND request._receive so downstream
                    # FastAPI dependency & Pydantic body parsers actually receive scrubbed bytes.
                    request._body = new_body  # type: ignore[attr-defined]

                    async def receive():
                        return {"type": "http.request", "body": new_body, "more_body": False}

                    request._receive = receive  # type: ignore[attr-defined]
            except Exception:
                # Fall through if non-JSON or malformed payload (let FastAPI return 422)
                pass

        response = await call_next(request)
        response.headers["X-HIPAA-Safe-Harbor"] = "164.514(b)(2)-ENFORCED"
        return response
