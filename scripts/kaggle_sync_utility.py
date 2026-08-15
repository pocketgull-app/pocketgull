#!/usr/bin/env python3
"""Kaggle Utility Script Publisher for Pocketgull.

Deploys reusable Python helper functions (e.g. Asymmetric Loss, DICOM slice extractors,
efficiency benchmarks) to Kaggle Utility Scripts so they can be imported across competition
notebooks (`import asymmetric_loss`).

Usage:
    python scripts/kaggle_sync_utility.py --script-path contests/rsna_knee_2026/asymmetric_loss.py --slug rsna-knee-asymmetric-loss --dry-run
"""

import argparse
import json
import os
import shutil
import sys
from typing import Any, Dict


def generate_utility_metadata(owner: str, slug: str, script_name: str) -> Dict[str, Any]:
    """Generates Kaggle Kernel metadata for a Utility Script."""
    return {
        "id": f"{owner}/{slug}",
        "title": slug,
        "code_file": script_name,
        "language": "python",
        "kernel_type": "script",
        "is_private": "false",
        "enable_gpu": "false",
        "enable_tpu": "false",
        "enable_internet": "true",
        "dataset_sources": [],
        "competition_sources": [],
        "kernel_sources": [],
        "model_sources": []
    }


PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main() -> None:
    parser = argparse.ArgumentParser(description="Publish Python Utility Script to Kaggle.")
    parser.add_argument("--owner", default="philgear", help="Kaggle user handle")
    parser.add_argument("--script-path", default=os.path.join(PROJECT_ROOT, "contests", "rsna_knee_2026", "asymmetric_loss.py"), help="Path to Python script file")
    parser.add_argument("--slug", default="rsna-knee-asymmetric-loss", help="Utility script kernel slug")
    parser.add_argument("--dry-run", action="store_true", help="Generate directory and metadata without network requests")

    args = parser.parse_args()

    source_script = os.path.abspath(args.script_path)
    if not os.path.exists(source_script):
        print(f"[ERROR] Source script not found: {source_script}")
        sys.exit(1)

    work_dir = os.path.join(os.path.dirname(source_script), f".utility_{args.slug}")
    os.makedirs(work_dir, exist_ok=True)

    script_name = os.path.basename(source_script)
    target_script = os.path.join(work_dir, script_name)
    shutil.copy2(source_script, target_script)

    metadata = generate_utility_metadata(args.owner, args.slug, script_name)
    meta_path = os.path.join(work_dir, "kernel-metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"[OK] Utility script workdir prepared: {work_dir}")
    print(f"[INFO] Script: {script_name} -> Kernel Slug: {args.owner}/{args.slug}")

    if args.dry_run:
        print("[OK] Dry run mode enabled. Skipping kernel push.")
        return

    try:
        import subprocess
        cmd = ["kaggle", "kernels", "push", "-p", work_dir]
        result = subprocess.run(cmd, capture_output=True, text=True)
        print(f"[INFO] Kaggle kernels push result: {result.stdout} {result.stderr}")
    except Exception as e:
        print(f"[WARN] Kernel push note: {e}")


if __name__ == "__main__":
    main()
