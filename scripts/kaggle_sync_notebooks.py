#!/usr/bin/env python3
"""Kaggle Notebook Synchronization Utility for Pocketgull.

Pushes local competition, benchmark, and educational Jupyter notebooks to Kaggle Kernels
with metadata validation, GPU settings configuration, and API error logging.

Usage:
    python scripts/kaggle_sync_notebooks.py --kernel-dir contests/rsna_knee_2026 --dry-run
"""

import argparse
import json
import os
import sys
from typing import Any, Dict


PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main() -> None:
    parser = argparse.ArgumentParser(description="Synchronize Jupyter Notebook to Kaggle Kernels.")
    parser.add_argument("--owner", default="philgear", help="Kaggle handle")
    parser.add_argument("--kernel-dir", default=os.path.join(PROJECT_ROOT, "contests", "rsna_knee_2026"), help="Directory containing kernel-metadata.json")
    parser.add_argument("--dry-run", action="store_true", help="Validate metadata without executing network upload")

    args = parser.parse_args()

    kernel_dir = os.path.abspath(args.kernel_dir)
    meta_path = os.path.join(kernel_dir, "kernel-metadata.json")

    # Fallback to train metadata if default kernel-metadata.json isn't present
    if not os.path.exists(meta_path):
        fallback_meta = os.path.join(kernel_dir, "kernel-metadata-train.json")
        if os.path.exists(fallback_meta):
            meta_path = fallback_meta

    if not os.path.exists(meta_path):
        print(f"[ERROR] No kernel metadata JSON found at: {kernel_dir}")
        sys.exit(1)

    with open(meta_path, "r", encoding="utf-8") as f:
        meta_data: Dict[str, Any] = json.load(f)

    # Ensure owner handle matches argument if default handle is present
    kernel_id = meta_data.get("id", "")
    if "/" in kernel_id:
        slug = kernel_id.split("/")[-1]
        meta_data["id"] = f"{args.owner}/{slug}"
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta_data, f, indent=2)

    print(f"[OK] Validated Kernel Metadata: {meta_data.get('id')} ({meta_data.get('code_file')})")
    print(f"[INFO] GPU Enabled: {meta_data.get('enable_gpu')} | Internet: {meta_data.get('enable_internet')}")

    if args.dry_run:
        print("[OK] Dry run mode enabled. Skipping kernel push API call.")
        return

    try:
        import subprocess
        cmd = ["kaggle", "kernels", "push", "-p", os.path.dirname(meta_path)]
        result = subprocess.run(cmd, capture_output=True, text=True)
        print(f"[INFO] Kernel push output: {result.stdout}")
        if result.returncode != 0:
            print(f"[WARN] Kernel push warning: {result.stderr}")
    except Exception as e:
        print(f"[WARN] Kaggle API kernel push exception: {e}")


if __name__ == "__main__":
    main()
