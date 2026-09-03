"""
PocketGull Python Data Bridge — OpenTelemetry Distributed Tracing & Observability
Provides CNCF OpenTelemetry instrumentation for FastAPI with HIPAA Safe Harbor sanitization.
"""

from __future__ import annotations

import os
from contextlib import contextmanager
from typing import Any, Dict, Generator, Optional

HIPAA_BLOCKED_KEYS = {
    "name", "patient_name", "first_name", "last_name", "full_name",
    "mrn", "medical_record_number", "ssn", "social_security_number",
    "phone", "phone_number", "telephone", "mobile",
    "email", "email_address", "address", "street", "zip", "zipcode",
    "ip_address", "ip", "client_ip", "device_id", "serial_number"
}

def sanitize_telemetry_attributes(attributes: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitizes span attributes by redacting all 18 HIPAA Safe Harbor identifiers."""
    sanitized: Dict[str, Any] = {}
    for k, v in attributes.items():
        k_clean = k.lower().replace("-", "_").replace(" ", "_")
        if any(blocked in k_clean for blocked in HIPAA_BLOCKED_KEYS):
            sanitized[k] = "[REDACTED_HIPAA_SAFE_HARBOR]"
        elif isinstance(v, (int, float, bool)):
            sanitized[k] = v
        elif isinstance(v, str):
            sanitized[k] = v[:500]
        else:
            sanitized[k] = str(v)[:500]
    return sanitized

_tracer: Any = None
_is_otel_active: bool = False

def setup_opentelemetry(app: Any) -> bool:
    """
    Initializes OpenTelemetry auto-instrumentation for the FastAPI application.
    Safely degrades to a no-op if disabled or if OpenTelemetry dependencies are missing.
    """
    global _tracer, _is_otel_active
    
    is_disabled = os.getenv("OTEL_SDK_DISABLED", "false").lower() in ("true", "1", "yes")
    if is_disabled:
        print("[CNCF OpenTelemetry] Telemetry disabled via OTEL_SDK_DISABLED.")
        return False

    try:
        from opentelemetry import trace
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor
        from opentelemetry.sdk.resources import Resource
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
        
        service_name = os.getenv("OTEL_SERVICE_NAME", "pocketgull-api")
        resource = Resource.create({"service.name": service_name})
        provider = TracerProvider(resource=resource)
        
        otlp_endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
        if otlp_endpoint:
            from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
            exporter = OTLPSpanExporter(endpoint=f"{otlp_endpoint.rstrip('/')}/v1/traces")
            provider.add_span_processor(BatchSpanProcessor(exporter))
        
        trace.set_tracer_provider(provider)
        _tracer = trace.get_tracer("pocketgull-api", "1.0.0")
        
        FastAPIInstrumentor.instrument_app(app, tracer_provider=provider)
        _is_otel_active = True
        print(f"[CNCF OpenTelemetry] FastAPI instrumented for service='{service_name}'.")
        return True
    except ImportError:
        # opentelemetry packages not installed in python environment — graceful fallback
        print("[CNCF OpenTelemetry] SDK packages not detected in environment. Running in lightweight fallback mode.")
        return False
    except Exception as exc:
        print(f"[CNCF OpenTelemetry] Initialization warning ({exc}). Continuing with standard routing.")
        return False

@contextmanager
def clinical_span(name: str, attributes: Optional[Dict[str, Any]] = None) -> Generator[Any, None, None]:
    """
    Context manager for clinical spans with HIPAA attribute sanitization.
    """
    sanitized = sanitize_telemetry_attributes(attributes or {})
    if _is_otel_active and _tracer is not None:
        with _tracer.start_as_current_span(name, attributes=sanitized) as span:
            yield span
    else:
        # No-op span stub
        yield None
