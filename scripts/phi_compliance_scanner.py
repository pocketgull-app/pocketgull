#!/usr/bin/env python3
"""
Understory - PHI & PII Security Compliance Scanner
Automates scanning of code, assets, mock databases, and log files for:
1. Accidental Protected Health Information (PHI) & PII leaks (SSNs, Phone Numbers, Email formats, Address Zip codes).
2. Embedded API credentials, secrets, or high-entropy key patterns.
3. HIPAA compliance validation on active patient models.

Exit Codes:
- 0: Scanning passed with no violations.
- 1: Compliance violations detected.
"""

import os
import re
import sys
import json
from typing import List, Dict, Tuple

# Regex Patterns for PII / PHI
PII_PATTERNS = {
    "Social Security Number (SSN)": re.compile(r"\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b"),
    "Email Address": re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}\b"),
    "US Phone Number": re.compile(r"\b(?:\+?1[-. ]?)?\(?([2-9][0-8][0-9])\)?[-. ]?([2-9][0-9]{2})[-. ]?([0-9]{4})\b"),
    "Zip Code": re.compile(r"\b\d{5}(?:-\d{4})?\b")
}

# Regex Patterns for Secrets and API Keys
SECRET_PATTERNS = {
    "Google API Key": re.compile(r"AIzaSy[A-Za-z0-9_-]{33}"),
    "Generic Private Key": re.compile(r"-----BEGIN [A-Z0-9_-]+ PRIVATE KEY-----"),
    "Generic Password/Secret Assignment": re.compile(r"(api[-_]?key|secret[-_]?key|password|db[-_]?pass)\s*[:=]\s*['\"`][a-zA-Z0-9_\-*!@#%^&()]{16,}['\"`]", re.IGNORECASE)
}

# Directories to ignore
IGNORE_DIRS = {"node_modules", ".git", "dist", "dist-ssr", ".angular", "tmp", "test-results", "playwright-report", ".vscode", ".venv"}

# Extensions to skip (binary/large assets)
SKIP_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".pdf", ".zip", ".sqlite",
    ".db", ".keystore", ".jks", ".lock", ".ico", ".dill"
}

# Files to ignore completely (e.g. package locks containing metadata/emails)
IGNORE_FILES = {
    "package-lock.json",
    "yarn.lock"
}

# Known safe placeholders that regex might flag (like mock variables in tests)
SAFE_PLACEHOLDERS = {
    "fake_", "mock_", "dummy_", "test_", "placeholder", "example.com", "555-0199", "12345", "philgear", "pocketgull.app", "loinc", "icd-10"
}

def is_safe_placeholder(text: str) -> bool:
    text_lower = text.lower()
    return any(p in text_lower for p in SAFE_PLACEHOLDERS)

def mask_sensitive_match(match_text: str) -> str:
    if len(match_text) > 10:
        return match_text[:6] + "..." + match_text[-4:]
    return "******"

def scan_file(filepath: str) -> List[Tuple[str, int, str, str]]:
    """
    Scans a single file for PII/PHI and Secrets.
    Returns: List of (type, line_number, matched_text, description)
    """
    violations = []
    ext = os.path.splitext(filepath)[1].lower()
    
    # Restrict PII/PHI pattern scans to data, documentation, and log files.
    # Code files (.ts, .js, .dart, .html, .css) are highly prone to false positives (constants, ports, colors).
    # Skip JSON files as well since they are checked structurally by audit_patient_data_structures.
    scan_pii = ext in (".csv", ".txt", ".log", ".md")
    
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            for line_no, line in enumerate(f, 1):
                # 1. Scan for PII (only on data/log/doc files)
                if scan_pii:
                    for label, pattern in PII_PATTERNS.items():
                        for match in pattern.finditer(line):
                            match_text = match.group(0)
                            if not is_safe_placeholder(match_text) and not is_safe_placeholder(line):
                                violations.append(("PII/PHI", line_no, mask_sensitive_match(match_text), label))
                
                # 2. Scan for Secrets (exclude this scanner script to avoid false positives)
                if "phi_compliance_scanner" not in filepath:
                    for label, pattern in SECRET_PATTERNS.items():
                        for match in pattern.finditer(line):
                            match_text = match.group(0)
                            if not is_safe_placeholder(match_text):
                                masked = mask_sensitive_match(match_text)
                                violations.append(("SECRET", line_no, masked, label))
                                
    except Exception as e:
        print(f"[WARN] Could not read file {filepath}: {e}")
        
    return violations

def audit_patient_data_structures(filepath: str) -> List[str]:
    """
    Specifically validates patient data models (.json files) to ensure
    they follow HIPAA de-identification (no real names or addresses).
    """
    issues = []
    if not filepath.endswith(".json"):
        return issues
        
    # Known safe mock names and clinical categories that fit Name format
    allowed_names = {
        "Robert Davis", "Sarah Jenkins", "William Henderson", 
        "Global Sentinel", "Maternal Sentinel", "Pediatric Sentinel", "Geriatric Sentinel",
        "Systemic Health", "Oxidative Stress", "Antioxidant Status", "Alexander Vance", "Mara Santos",
        "Frida Kahlo", "Charles Darwin", "Srinivasa Ramanujan"
    }
        
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        # Helper to inspect objects recursively
        def check_node(node):
            if isinstance(node, dict):
                # HIPAA Check: ensure clinical JSON data uses structured codes/mock IDs, not real PII keys
                for k, v in node.items():
                    if k.lower() in ("ssn", "socialsecurity", "birthdate") and v:
                        issues.append(f"Found sensitive key '{k}' in JSON structure.")
                    if isinstance(v, str):
                        # Simple name heuristic (Capitalized First + Last, e.g. 'John Doe')
                        if k.lower() == "name" and re.match(r"^[A-Z][a-z]+\s[A-Z][a-z]+$", v):
                            # Refined heuristic: patient names reside in dicts containing other profile keys
                            # (like 'age', 'gender', 'history', etc.) and not in sub-structures 
                            # (like 'dose', 'value', 'pathway', 'unit', etc.)
                            is_patient_name_prop = any(prop in node for prop in ("age", "gender", "history", "vitals", "scans"))
                            if is_patient_name_prop:
                                if not is_safe_placeholder(v) and v not in allowed_names:
                                    issues.append(f"Potential real patient name '{v}' in JSON property '{k}'")
                    check_node(v)
            elif isinstance(node, list):
                for item in node:
                    check_node(item)
                    
        check_node(data)
    except json.JSONDecodeError:
        pass # Not a valid json file, skip structure checks
    except Exception as e:
        print(f"[WARN] Could not parse JSON in {filepath}: {e}")
        
    return issues

def is_third_party_or_build(relative_path: str) -> bool:
    parts = relative_path.split(os.sep)
    vendor_dirs = {
        "node_modules", ".git", ".angular", "dist", "playwright-report",
        "test-results", "tmp", ".husky", "build", ".dart_tool", "ios", "android",
        "windows", "linux", "macos", "web", "sandbox", "flutter", "venv", ".venv", ".vscode"
    }
    if any(part in vendor_dirs for part in parts):
        return True
    if parts[-1] == "CMakeLists.txt" or "build_log" in parts[-1]:
        return True
    return False

def main():
    workspace_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    print(f"[START] Starting HIPAA/PII & Secret Security Scan in: {workspace_dir}\n")
    
    total_scanned = 0
    pii_violations_count = 0
    secret_violations_count = 0
    json_issues_count = 0
    
    for root, dirs, files in os.walk(workspace_dir):
        # Prune build/third party directories to speed up os.walk
        dirs[:] = [d for d in dirs if not is_third_party_or_build(os.path.relpath(os.path.join(root, d), workspace_dir))]
        
        for file in files:
            # Skip environment files and lock files
            if file.startswith(".env") or file in IGNORE_FILES:
                continue
            filepath = os.path.join(root, file)
            ext = os.path.splitext(file)[1].lower()
            
            if ext in SKIP_EXTENSIONS:
                continue
                
            relative_path = os.path.relpath(filepath, workspace_dir)
            total_scanned += 1
            
            if is_third_party_or_build(relative_path):
                continue
            
            # File content scanning
            violations = scan_file(filepath)
            if violations:
                for v_type, line_no, _, desc in violations:
                    print(f"[FAIL] [{v_type}] {relative_path}:{line_no} -> Found {desc} [match redacted]")
                    if v_type == "PII/PHI":
                        pii_violations_count += 1
                    else:
                        secret_violations_count += 1
                        
            # Custom JSON structure compliance checks
            json_issues = audit_patient_data_structures(filepath)
            if json_issues:
                for issue in json_issues:
                    print(f"[WARN] [HIPAA SCHEMA] {relative_path} -> {issue}")
                    json_issues_count += 1
                    
    print("\n" + "="*50)
    print("Scan Summary:")
    print(f"Scanned Files: {total_scanned}")
    print(f"  PII/PHI Violations: {pii_violations_count}")
    print(f"  Secrets/API Keys: {secret_violations_count}")
    print(f"  HIPAA Schema Issues: {json_issues_count}")
    print("="*50)
    
    if pii_violations_count > 0 or secret_violations_count > 0 or json_issues_count > 0:
        print("\n[FAIL] Compliance check failed! Please address the security findings above.")
        sys.exit(1)
    else:
        print("\n[PASS] Compliance scan passed. No PII/PHI or credential leaks detected.")
        sys.exit(0)

if __name__ == "__main__":
    main()
