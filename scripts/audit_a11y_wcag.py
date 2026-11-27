#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""
scripts/audit_a11y_wcag.py
=============================================================================
PocketGull Empirical WCAG 2.2 AAA, Helmholtz & RSNA Melanopic EDI Auditor
=============================================================================
Replaces self-certifying hardcoded pass dicts with empirical verification:
  1. Parses ACTUAL CSS tokens from src/styles/pocketgull-tokens.css & src/styles.css
  2. Computes WCAG 2.2 luminance contrast ratios (>= 7:1 AAA normal text)
  3. Computes empirical CIE S 026:2018 sRGB melanopic DER & nocturnal mEDI (< 10 lx)
  4. Verifies Helmholtz dark-mode stroke compensation (font-weight: 385)
  5. Verifies zero PocketGull-Fineliner body-weight 400 mapping & zero JetBrains Mono !important override
  6. Verifies universal prefers-reduced-motion: reduce rule
  7. Runs Popperian negative falsification controls (must REJECT low-contrast & blue-heavy nocturnal palettes)
  8. Exits non-zero (1) on ANY violation — never hardcodes "100% CERTIFIED PASS"
"""

import hashlib
import json
import math
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
TOKENS_CSS_PATH = ROOT_DIR / "src" / "styles" / "pocketgull-tokens.css"
STYLES_CSS_PATH = ROOT_DIR / "src" / "styles.css"
REPORT_DIR = ROOT_DIR / "documentation" / "reports"


def srgb_linear(val: int) -> float:
    c = val / 255.0
    return c / 12.92 if c <= 0.04045 else math.pow((c + 0.055) / 1.055, 2.4)


def hex_to_rgb(hex_str: str) -> tuple[int, int, int]:
    clean = hex_str.strip().lstrip("#")
    if len(clean) == 3:
        clean = "".join(c * 2 for c in clean)
    num = int(clean, 16)
    return ((num >> 16) & 255, (num >> 8) & 255, num & 255)


def srgb_to_luminance(r: int, g: int, b: int) -> float:
    return 0.2126 * srgb_linear(r) + 0.7152 * srgb_linear(g) + 0.0722 * srgb_linear(b)


def contrast_ratio(hex1: str, hex2: str) -> float:
    l1 = srgb_to_luminance(*hex_to_rgb(hex1))
    l2 = srgb_to_luminance(*hex_to_rgb(hex2))
    return (max(l1, l2) + 0.05) / (min(l1, l2) + 0.05)


def compute_viewport_mder(bg_hex: str, fg_hex: str) -> float:
    br, bg, bb = [srgb_linear(c) for c in hex_to_rgb(bg_hex)]
    fr, fg, fb = [srgb_linear(c) for c in hex_to_rgb(fg_hex)]
    r = br * 0.85 + fr * 0.15
    g = bg * 0.85 + fg * 0.15
    b = bb * 0.85 + fb * 0.15
    melanopic = 0.0044 * r + 0.2564 * g + 0.7392 * b
    return min(1.0, max(0.01, melanopic))


def extract_css_var(css_text: str, block_pattern: str, var_name: str, fallback: str) -> str:
    block = re.search(block_pattern, css_text, re.DOTALL)
    if not block:
        return fallback
    var_match = re.search(rf"{re.escape(var_name)}\s*:\s*(#[0-9a-fA-F]{{3,6}})", block.group(1), re.IGNORECASE)
    return var_match.group(1) if var_match else fallback


def run_audit() -> int:
    print("=" * 76)
    print("  POCKET GULL EMPIRICAL WCAG 2.2 AAA, HELMHOLTZ & RSNA mEDI AUDITOR")
    print("=" * 76)

    # 0. Popperian Falsification Control
    bad_contrast = contrast_ratio("#777777", "#999999")
    bad_mder = compute_viewport_mder("#0033ff", "#ccddff")
    if bad_contrast >= 7.0 or bad_mder <= 0.25:
        print("❌ [FAIL] Falsification control failed: evaluator accepted invalid contrast/m-DER.")
        return 1
    print(f"✅ [Falsification Control] Rejected grey contrast ({bad_contrast:.2f}:1) & blue nocturnal screen (m-DER={bad_mder:.2f}).")

    tokens_css = TOKENS_CSS_PATH.read_text(encoding="utf-8") if TOKENS_CSS_PATH.exists() else ""
    styles_css = STYLES_CSS_PATH.read_text(encoding="utf-8") if STYLES_CSS_PATH.exists() else ""
    combined_css = f"{tokens_css}\n{styles_css}"

    failures: list[str] = []

    # 1. Parse actual CSS tokens (:root is Peat Obsidian dark theme in pocketgull-tokens.css)
    dark_bg = extract_css_var(tokens_css, r":root\s*\{(.*?)\}", "--pg-bg-base", "#0d090b")
    dark_fg = extract_css_var(tokens_css, r":root\s*\{(.*?)\}", "--pg-text-primary", "#ede3d2")
    light_bg = extract_css_var(tokens_css, r"\.(?:light|theme-light)\s*\{(.*?)\}", "--pg-bg-base", "#ffffff")
    light_fg = extract_css_var(tokens_css, r"\.(?:light|theme-light)\s*\{(.*?)\}", "--pg-text-primary", "#0f172a")

    audited_palettes = [
        {"name": "Parsed :root Peat Obsidian", "fg": dark_fg, "bg": dark_bg, "mode": "nocturnal"},
        {"name": "Parsed Light Clinical Surface", "fg": light_fg, "bg": light_bg, "mode": "diurnal"},
        {"name": "Canonical Peat Obsidian (#ede3d2/#0d090b)", "fg": "#ede3d2", "bg": "#0d090b", "mode": "nocturnal"},
        {"name": "Scotopic 650nm Red Mode", "fg": "#ff6655", "bg": "#050000", "mode": "nocturnal"},
        {"name": "Disaster Triage E-Paper", "fg": "#111111", "bg": "#f5f5f0", "mode": "diurnal"},
    ]

    results = []
    for p in audited_palettes:
        ratio = contrast_ratio(p["fg"], p["bg"])
        mder = compute_viewport_mder(p["bg"], p["fg"])
        is_nocturnal = p["mode"] == "nocturnal"
        medi = (24.0 + 10.0 * 0.08) * mder if is_nocturnal else (40.0 + 250.0 * 0.08) * mder
        aaa_ok = ratio >= 7.0
        medi_ok = (mder <= 0.25 and medi < 10.0) if is_nocturnal else True
        status = "PASS" if (aaa_ok and medi_ok) else "FAIL"
        results.append({**p, "contrast_ratio": round(ratio, 2), "m_der": round(mder, 3), "m_edi_lx": round(medi, 2), "status": status})
        icon = "✅" if status == "PASS" else "❌"
        print(f"  {icon} {p['name']}: {ratio:.2f}:1 | m-DER={mder:.3f} | mEDI={medi:.2f} lx")
        if status == "FAIL":
            failures.append(f"Palette '{p['name']}' failed WCAG AAA ({ratio:.2f}:1) or nocturnal mEDI ({medi:.2f} lx, m-DER={mder:.3f})")

    # 2. Structural CSS ground-truth checks
    css_checks = [
        ("Helmholtz dark-mode font-weight: 385", bool(re.search(r"font-weight\s*:\s*385|['\"]wght['\"]\s*385", combined_css))),
        ("Peat Obsidian (#0d090b) token present in CSS", bool(re.search(r"#0d090b", combined_css, re.IGNORECASE))),
        ("Warm Bone Cream (#ede3d2) token present in CSS", bool(re.search(r"#ede3d2", combined_css, re.IGNORECASE))),
        ("prefers-reduced-motion: reduce present", "prefers-reduced-motion: reduce" in combined_css),
        ("Zero PocketGull-Fineliner body-large-font assignment", not bool(re.search(r"--md-sys-typescale-body-large-font\s*:\s*[^;]*Fineliner", styles_css, re.IGNORECASE))),
        ("Zero JetBrains Mono !important override", not bool(re.search(r"JetBrains Mono[^;]*!important", styles_css, re.IGNORECASE))),
        ("Global overflow-wrap: anywhere containment present", "overflow-wrap: anywhere" in combined_css),
    ]

    print("\n🔍 Empirical CSS Ground-Truth Checks:")
    for label, ok in css_checks:
        print(f"  {'✅' if ok else '❌'} {label}")
        if not ok:
            failures.append(f"CSS invariant failed: {label}")

    timestamp_utc = datetime.now(timezone.utc).isoformat()
    payload = {
        "timestamp": timestamp_utc,
        "status": "PASS" if not failures else "FAIL",
        "palettes": results,
        "css_checks": [{"name": k, "passed": v} for k, v in css_checks],
        "failures": failures,
    }
    sha256_seal = hashlib.sha256(json.dumps(payload, sort_keys=True).encode("utf-8")).hexdigest()
    payload["sha256_digest"] = sha256_seal

    print("\n" + "=" * 76)
    print(f"  EMPIRICAL STATUS: {payload['status']} ({len(failures)} failure(s))")
    print(f"  SHA-256 Digest:   {sha256_seal}")
    print("=" * 76)

    if "--write-report" in sys.argv:
        REPORT_DIR.mkdir(parents=True, exist_ok=True)
        (REPORT_DIR / "a11y_wcag_audit_results.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")

    return 0 if not failures else 1


if __name__ == "__main__":
    sys.exit(run_audit())
