#!/usr/bin/env python3
"""
RSNA Knee 2026 — Phase 2: Gemini Weak Label Extraction (Vertex AI)

Uses Vertex AI Gemini endpoint via gcloud Application Default Credentials
to extract structured labels from 4,349 unlabeled radiology reports.

Usage:
    python contests/rsna_knee_2026/extract_labels_gemini.py

Output:
    contests/rsna_knee_2026/train_labels_gemini.csv
"""

import json
import os
import sys
import time
import hashlib
import subprocess
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from pathlib import Path

# ─── Configuration ─────────────────────────────────────────────────────────────

TRAIN_CSV = Path(__file__).parent / 'train.csv'
OUTPUT_CSV = Path(__file__).parent / 'train_labels_gemini.csv'
CACHE_DIR = Path(__file__).parent / '.label_cache'

TARGET_COLS = [
    'ACL', 'MCL', 'Medial Meniscus', 'Lateral Meniscus',
    'Medial OA', 'Lateral OA', 'PF OA', 'Effusion',
    'Synovitis', "Baker's", 'Contusion', 'Fracture'
]

# JSON-safe key names (no apostrophes)
JSON_SAFE_KEYS = [
    'ACL', 'MCL', 'Medial Meniscus', 'Lateral Meniscus',
    'Medial OA', 'Lateral OA', 'PF OA', 'Effusion',
    'Synovitis', 'Bakers', 'Contusion', 'Fracture'
]

# Map JSON-safe keys back to TARGET_COLS
KEY_MAP = dict(zip(JSON_SAFE_KEYS, TARGET_COLS))
KEY_MAP_REVERSE = dict(zip(TARGET_COLS, JSON_SAFE_KEYS))

# Vertex AI configuration
GCP_PROJECT = 'gen-lang-client-0540208645'
GCP_REGION = 'us-central1'
GEMINI_MODEL = 'gemini-2.5-flash'
VERTEX_URL = (
    f'https://{GCP_REGION}-aiplatform.googleapis.com/v1/projects/{GCP_PROJECT}'
    f'/locations/{GCP_REGION}/publishers/google/models/{GEMINI_MODEL}:generateContent'
)

# Rate limiting
REQUESTS_PER_MINUTE = 60  # Vertex AI paid tier
BATCH_SIZE = 1            # 1 report per call for reliable JSON output
SLEEP_BETWEEN_CALLS = 60.0 / REQUESTS_PER_MINUTE

# ─── Structured Extraction Prompt ──────────────────────────────────────────────

SYSTEM_PROMPT = """You are an expert MSK (musculoskeletal) radiologist reviewing knee MRI radiology reports.

Your task: For each radiology report, extract binary labels (0 or 1) for EXACTLY 12 knee abnormalities.

CRITICAL LABELING RULES (from competition adjudication guidelines):
- Bias toward SPECIFICITY (high threshold): If a finding is ambiguous, equivocal, or described as "mild" / "minor" / "grade 1" / "degenerative signal without surface extension", label it as 0.
- ACL: Label 1 ONLY for high-grade partial (>50% fiber disruption) or complete tear. Mild thickening/mucoid degeneration = 0.
- MCL: Label 1 ONLY for acute high-grade tear with fiber disruption AND adjacent edema. Chronic low-grade sprain = 0.
- Medial/Lateral Meniscus: Label 1 ONLY if signal contacts the articular surface on >=2 images, OR there is morphologic truncation/displaced fragment. Intrasubstance degeneration = 0.
- Medial/Lateral/PF OA: Label 1 ONLY for >=1 cm area of high-grade cartilage loss (>50% thickness loss). Mild chondromalacia = 0.
- Effusion: Label 1 for moderate or large joint effusion. Trace/physiologic fluid = 0.
- Synovitis: Label 1 for definite synovial thickening/inflammation. Normal synovium = 0.
- Bakers Cyst: Label 1 for moderate or large popliteal cyst. Tiny Bakers = 0.
- Contusion: Label 1 for definite bone marrow edema from impact WITHOUT fracture line. Reactive edema = 0.
- Fracture: Label 1 for acute cortical break or discrete fracture line. Stress reaction without visible line = 0.

CONFIDENCE: Also provide a confidence score (0.0-1.0) for each label.

OUTPUT FORMAT: Return a single JSON object (NOT an array):
{"labels": {"ACL": 0, "MCL": 0, "Medial_Meniscus": 0, "Lateral_Meniscus": 0, "Medial_OA": 0, "Lateral_OA": 0, "PF_OA": 0, "Effusion": 0, "Synovitis": 0, "Bakers": 0, "Contusion": 0, "Fracture": 0}, "confidence": {"ACL": 0.9, "MCL": 0.9, "Medial_Meniscus": 0.9, "Lateral_Meniscus": 0.9, "Medial_OA": 0.9, "Lateral_OA": 0.9, "PF_OA": 0.9, "Effusion": 0.9, "Synovitis": 0.9, "Bakers": 0.9, "Contusion": 0.9, "Fracture": 0.9}}

Use underscores in multi-word keys. Use Bakers not Baker's. Return ONLY the JSON object, nothing else.

IMPORTANT:
- Reports may be in Spanish, Dutch, French, German, Portuguese, English, or other languages.
- If a report doesn't mention a finding AT ALL, label it 0 with confidence 0.7.
- If a report explicitly states a finding is NORMAL or ABSENT, label it 0 with confidence 0.95.
- If a report clearly describes the abnormality, label it 1 with confidence 0.90-0.95.
"""

# Map from JSON-safe underscore keys back to competition target column names
JSON_KEY_TO_TARGET = {
    'ACL': 'ACL', 'MCL': 'MCL',
    'Medial_Meniscus': 'Medial Meniscus', 'Lateral_Meniscus': 'Lateral Meniscus',
    'Medial_OA': 'Medial OA', 'Lateral_OA': 'Lateral OA', 'PF_OA': 'PF OA',
    'Effusion': 'Effusion', 'Synovitis': 'Synovitis',
    'Bakers': "Baker's", 'Contusion': 'Contusion', 'Fracture': 'Fracture'
}
TARGET_TO_JSON_KEY = {v: k for k, v in JSON_KEY_TO_TARGET.items()}


# ─── Auth & API ────────────────────────────────────────────────────────────────

def get_access_token() -> str:
    """Get a fresh access token via gcloud ADC."""
    gcloud_cmd = r'C:\Users\philg\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd'
    result = subprocess.run(
        [gcloud_cmd, 'auth', 'application-default', 'print-access-token'],
        capture_output=True, text=True, timeout=15, shell=True
    )
    if result.returncode != 0:
        raise RuntimeError(f'gcloud auth failed: {result.stderr}')
    return result.stdout.strip()


def call_gemini_vertex(reports_batch: List[Tuple[int, str]], access_token: str) -> Optional[List[Dict]]:
    """Send a batch of reports to Vertex AI Gemini."""
    import urllib.request
    import urllib.error

    user_parts = []
    for idx, (study_uid, report) in enumerate(reports_batch):
        truncated = report[:3000] if len(report) > 3000 else report
        user_parts.append(f"Report:\n{truncated}")

    user_prompt = (
        "Extract knee MRI labels from this radiology report. "
        "Return a single JSON object with 'labels' and 'confidence' keys.\n\n"
        + "\n\n".join(user_parts)
    )

    payload = {
        "contents": [
            {"role": "user", "parts": [{"text": user_prompt}]}
        ],
        "systemInstruction": {
            "parts": [{"text": SYSTEM_PROMPT}]
        },
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.1,
            "maxOutputTokens": 8192,
            "thinkingConfig": {"thinkingBudget": 0}
        }
    }

    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        VERTEX_URL,
        data=data,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {access_token}'
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            raw_bytes = resp.read()
            result = json.loads(raw_bytes.decode('utf-8'))

        # Debug: check response structure
        if 'candidates' not in result:
            print(f'  [WARN] No candidates in response: {str(result)[:300]}', flush=True)
            return None

        candidate = result['candidates'][0]
        if 'content' not in candidate:
            print(f'  [WARN] No content in candidate: {str(candidate)[:300]}', flush=True)
            return None

        text = candidate['content']['parts'][0]['text']
        parsed = repair_and_parse_json(text)
        if parsed is None:
            print(f'  [WARN] JSON repair failed. Raw text ({len(text)} chars): {text[:200]}', flush=True)
        # For batch_size=1, accept either a dict or a single-element list
        if isinstance(parsed, dict):
            return [parsed]
        elif isinstance(parsed, list):
            return parsed
        print(f'  [WARN] Parsed type: {type(parsed)}, returning None', flush=True)
        return None

    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        print(f'  [WARN] HTTP {e.code}: {body[:300]}', flush=True)
        if e.code == 429:
            print('  [WARN] Rate limited. Sleeping 30s...', flush=True)
            time.sleep(30)
        elif e.code == 401:
            print('  [WARN] Token expired, refreshing...', flush=True)
            return 'REFRESH_TOKEN'
        return None
    except Exception as e:
        import traceback
        print(f'  [WARN] API error: {type(e).__name__}: {e}', flush=True)
        traceback.print_exc()
        return None


def repair_and_parse_json(text: str) -> Optional[any]:
    """Robustly parse JSON from Gemini, repairing common issues."""
    import re

    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Fix 1: Replace Baker's with Bakers (apostrophe in JSON keys)
    repaired = text.replace("Baker's", "Bakers")
    repaired = repaired.replace("baker's", "bakers")
    repaired = repaired.replace("Baker\\'s", "Bakers")

    # Fix 2: Replace single quotes with double quotes (common Gemini quirk)
    # Only do this carefully to avoid breaking strings
    try:
        return json.loads(repaired)
    except json.JSONDecodeError:
        pass

    # Fix 3: Try to extract JSON array from markdown code block
    match = re.search(r'\[.*\]', repaired, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    # Fix 4: Try to extract JSON object
    match = re.search(r'\{.*\}', repaired, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    return None


# ─── Caching ───────────────────────────────────────────────────────────────────

def get_cache_path(study_uid: str) -> Path:
    h = hashlib.md5(study_uid.encode()).hexdigest()[:12]
    return CACHE_DIR / f'{h}.json'

def load_cached(study_uid: str) -> Optional[Dict]:
    p = get_cache_path(study_uid)
    if p.exists():
        try:
            return json.loads(p.read_text(encoding='utf-8'))
        except Exception:
            return None
    return None

def save_cache(study_uid: str, labels: Dict, confidence: Dict, language: str):
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    data = {'study_uid': study_uid, 'labels': labels, 'confidence': confidence, 'language': language}
    get_cache_path(study_uid).write_text(json.dumps(data), encoding='utf-8')


# ─── Main Pipeline ─────────────────────────────────────────────────────────────

def run_extraction():
    print('[OK] RSNA Knee 2026 - Phase 2: Gemini Weak Label Extraction (Vertex AI)', flush=True)
    print(f'[OK] Project: {GCP_PROJECT}', flush=True)
    print(f'[OK] Model: {GEMINI_MODEL}', flush=True)
    print(f'[OK] Batch size: {BATCH_SIZE} reports/call', flush=True)
    print(f'[OK] Rate limit: {REQUESTS_PER_MINUTE} RPM', flush=True)
    print(flush=True)

    # Load data
    df = pd.read_csv(TRAIN_CSV)
    print(f'[OK] Loaded {len(df)} studies from train.csv', flush=True)

    targets = TARGET_COLS
    labeled_mask = df[targets].notna().any(axis=1)
    gold_df = df[labeled_mask].copy()
    unlabeled_df = df[~labeled_mask].copy()
    print(f'[OK] Gold-standard labeled: {len(gold_df)}', flush=True)
    print(f'[OK] Unlabeled (need extraction): {len(unlabeled_df)}', flush=True)

    # Check cache
    already_cached = sum(1 for _, row in unlabeled_df.iterrows()
                         if load_cached(row['StudyInstanceUID']) is not None)
    remaining = len(unlabeled_df) - already_cached
    print(f'[OK] Already cached: {already_cached} / {len(unlabeled_df)}', flush=True)
    print(f'[OK] Remaining to extract: {remaining}', flush=True)

    if remaining > 0:
        est_calls = remaining // BATCH_SIZE + 1
        est_minutes = est_calls * SLEEP_BETWEEN_CALLS / 60.0
        print(f'[OK] Estimated API calls: {est_calls}', flush=True)
        print(f'[OK] Estimated time: {est_minutes:.1f} minutes', flush=True)

    # Get access token
    print(flush=True)
    print('[OK] Authenticating via gcloud ADC...', flush=True)
    access_token = get_access_token()
    token_refresh_time = time.time()
    print(f'[OK] Token acquired!', flush=True)
    print(flush=True)

    # Process batches — store (study_uid, report) tuples
    batch = []  # List of (study_uid, report_text)
    processed = 0
    successes = 0
    errors = 0

    for idx, row in unlabeled_df.iterrows():
        study_uid = row['StudyInstanceUID']

        if load_cached(study_uid) is not None:
            continue

        report = str(row['Report'])
        if not report or report == 'nan' or len(report) < 20:
            save_cache(study_uid, {t: 0 for t in targets}, {t: 0.5 for t in targets}, 'unknown')
            processed += 1
            continue

        batch.append((study_uid, report))

        if len(batch) >= BATCH_SIZE:
            # Refresh token every 45 minutes
            if time.time() - token_refresh_time > 2700:
                access_token = get_access_token()
                token_refresh_time = time.time()
                print('  [OK] Token refreshed', flush=True)

            print(f'  Batch {processed+1}-{processed+len(batch)} / {remaining} '
                  f'({100*(processed+len(batch))/max(remaining,1):.1f}%) '
                  f'[{successes} OK, {errors} err]', flush=True)

            result = call_gemini_vertex(batch, access_token)

            # Handle token refresh
            if result == 'REFRESH_TOKEN':
                access_token = get_access_token()
                token_refresh_time = time.time()
                result = call_gemini_vertex(batch, access_token)

            if result and isinstance(result, list):
                # Use positional mapping: result[i] corresponds to batch[i]
                for i, item in enumerate(result):
                    try:
                        labels = item.get('labels', {})
                        confidence = item.get('confidence', {})
                        language = item.get('language', item.get('detected_language', 'unknown'))

                        # Map by position in batch
                        if i < len(batch):
                            uid = batch[i][0]
                        else:
                            continue
                        save_cache(uid, labels, confidence, language)
                        successes += 1
                    except Exception as e:
                        print(f'    [ERR] Item {i}: {type(e).__name__}: {e}', flush=True)
                        errors += 1
            else:
                print(f'    [ERR] call_gemini_vertex returned: {type(result).__name__} = {repr(result)[:200]}', flush=True)
                errors += len(batch)

            processed += len(batch)
            batch = []
            time.sleep(SLEEP_BETWEEN_CALLS)

    # Final batch
    if batch:
        print(f'  Final batch ({len(batch)} reports)', flush=True)
        result = call_gemini_vertex(batch, access_token)
        if result and isinstance(result, list):
            for i, item in enumerate(result):
                try:
                    labels = item.get('labels', {})
                    confidence = item.get('confidence', {})
                    language = item.get('language', item.get('detected_language', 'unknown'))
                    if i < len(batch):
                        uid = batch[i][0]
                        save_cache(uid, labels, confidence, language)
                        successes += 1
                except Exception:
                    errors += 1

    print(flush=True)
    print(f'[OK] Extraction complete! Success: {successes}, Errors: {errors}', flush=True)

    # ─── Assemble Final CSV ────────────────────────────────────────────────────

    print(flush=True)
    print('[OK] Assembling train_labels_gemini.csv...', flush=True)

    rows = []
    for _, row in df.iterrows():
        uid = row['StudyInstanceUID']
        entry = {'StudyInstanceUID': uid, 'label_source': 'unknown'}

        if labeled_mask.loc[row.name]:
            entry['label_source'] = 'gold'
            for t in targets:
                entry[t] = float(row[t]) if pd.notna(row[t]) else 0.0
                entry[f'{t}_confidence'] = 1.0
        else:
            cached = load_cached(uid)
            if cached:
                entry['label_source'] = 'gemini'
                entry['detected_language'] = cached.get('language', 'unknown')
                for t in targets:
                    # Try underscore key (from Gemini), then exact match
                    json_key = TARGET_TO_JSON_KEY.get(t, t)
                    val = cached['labels'].get(json_key, cached['labels'].get(t, 0))
                    conf = cached['confidence'].get(json_key, cached['confidence'].get(t, 0.5))
                    entry[t] = float(val)
                    entry[f'{t}_confidence'] = float(conf)
            else:
                entry['label_source'] = 'prior'
                for t in targets:
                    entry[t] = 0.0
                    entry[f'{t}_confidence'] = 0.3

        rows.append(entry)

    out_df = pd.DataFrame(rows)
    out_df.to_csv(OUTPUT_CSV, index=False, float_format='%.4f')

    print(f'[OK] Output: {OUTPUT_CSV}', flush=True)
    print(f'[OK] Total rows: {len(out_df)}', flush=True)
    sources = out_df['label_source'].value_counts()
    for src, count in sources.items():
        print(f'  {src}: {count}', flush=True)

    print(flush=True)
    print('Label distribution (all sources):', flush=True)
    for t in targets:
        pos = int(out_df[t].sum())
        total = len(out_df)
        print(f'  {t:20s}: {pos:5d} / {total} ({100*pos/total:.1f}%)', flush=True)


if __name__ == '__main__':
    run_extraction()
