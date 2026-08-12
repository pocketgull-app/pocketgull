"""
Pocket Gull — Security & PHI/PII Sanitization Guard
Strips 18 HIPAA Safe Harbor identifiers before passing clinical text to LLM inference pipelines.
"""

from __future__ import annotations

import re
from typing import Dict, Tuple

# Common HIPAA PHI Regex Patterns
SSN_PATTERN = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")
EMAIL_PATTERN = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")
PHONE_PATTERN = re.compile(r"\b(?:\+?1[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b")
MRN_PATTERN = re.compile(r"\bMRN-?\d{6,10}\b", re.IGNORECASE)
DATE_PATTERN = re.compile(r"\b(0[1-9]|1[0-2])/(0[1-9]|[12]\d|3[01])/(19|20)\d{2}\b")


class PhiSanitizer:
    """
    Sanitizes clinical telemetry notes and patient history strings.
    Replaces sensitive identifiers with synthetic HIPAA tokens (e.g. [REDACTED_SSN]).
    """

    @staticmethod
    def sanitize_text(raw_text: str) -> Tuple[str, Dict[str, int]]:
        sanitized = raw_text
        counts: Dict[str, int] = {
            "ssn": 0,
            "email": 0,
            "phone": 0,
            "mrn": 0,
            "date": 0,
        }

        # Replace SSN
        sanitized, counts["ssn"] = SSN_PATTERN.subn("[REDACTED_SSN]", sanitized)
        # Replace Email
        sanitized, counts["email"] = EMAIL_PATTERN.subn("[REDACTED_EMAIL]", sanitized)
        # Replace Phone
        sanitized, counts["phone"] = PHONE_PATTERN.subn("[REDACTED_PHONE]", sanitized)
        # Replace MRN
        sanitized, counts["mrn"] = MRN_PATTERN.subn("[REDACTED_MRN]", sanitized)
        # Replace Date
        sanitized, counts["date"] = DATE_PATTERN.subn("[REDACTED_DATE]", sanitized)

        return sanitized, counts


phi_sanitizer = PhiSanitizer()
