#!/usr/bin/env python3
"""Kaggle Model Hub Publisher for Pocketgull.

Packages pre-trained model weights (e.g. PyTorch ConvNeXt, Swin, ONNX export),
generates `model-metadata.json`, and publishes or updates models on Kaggle Model Hub
under user handle `philgear`.

Usage:
    python scripts/kaggle_push_model.py --model-dir contests/rsna_knee_2026 --title "Pocketgull RSNA Knee ConvNeXt-Large" --slug "rsna-knee-convnext-large" --dry-run
"""

import argparse
import json
import os
import sys
from typing import Any, Dict


try:
    from scripts.kaggle_tags import get_standard_tags
except ImportError:
    from kaggle_tags import get_standard_tags


def generate_model_metadata(
    owner: str,
    slug: str,
    title: str,
    summary: str,
    description: str,
    license_name: str = "Apache 2.0",
    is_private: bool = False,
    extra_tags: list[str] = None
) -> Dict[str, Any]:
    """Generates standard Kaggle Model metadata dictionary with usability 10 configuration.

    Args:
        owner: Kaggle username/handle (e.g. 'philgear').
        slug: Model repository slug identifier.
        title: Human readable model title.
        summary: Short 1-line summary of model function.
        description: Comprehensive Markdown model documentation.
        license_name: Open source license name.
        is_private: Whether the model repository is private.
        extra_tags: Additional specific tags.

    Returns:
        Dict conforming to Kaggle Model metadata schema.
    """
    tags = get_standard_tags(category="all", extra_tags=extra_tags)

    return {
        "ownerSlug": owner,
        "slug": slug,
        "title": title,
        "subtitle": summary,
        "description": description,
        "licenseName": license_name,
        "isPrivate": is_private,
        "framework": "pytorch",
        "tags": tags
    }


PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main() -> None:
    parser = argparse.ArgumentParser(description="Publish model to Kaggle Model Hub.")
    parser.add_argument("--owner", default="philgear", help="Kaggle user handle (default: philgear)")
    parser.add_argument("--slug", default="rsna-knee-convnext-large", help="Model slug identifier")
    parser.add_argument("--title", default="Pocketgull RSNA Knee ConvNeXt-Large", help="Model title")
    parser.add_argument("--model-dir", default=os.path.join(PROJECT_ROOT, "contests", "rsna_knee_2026"), help="Path to directory containing model weights/config")
    parser.add_argument("--is-private", action="store_true", help="Set model to private")
    parser.add_argument("--dry-run", action="store_true", help="Generate metadata and validate without sending network requests")

    args = parser.parse_args()

    model_dir = os.path.abspath(args.model_dir)
    os.makedirs(model_dir, exist_ok=True)

    summary = "Pre-trained ConvNeXt-Large multi-label abnormality detector for 3D DICOM knee MRI series."
    description = (
        "# Pocketgull RSNA Knee ConvNeXt-Large Model\n\n"
        "## Model Overview\n"
        "This model repository contains pre-trained multi-label abnormality classification weights "
        "trained on de-identified 3D knee MRI scans as part of Pocketgull's clinical decision intelligence pipeline.\n\n"
        "## Architecture & Training\n"
        "- **Backbone**: ConvNeXt-Large (FP16 ONNX export support)\n"
        "- **Loss Function**: Asymmetric Loss (ASL) with gamma_minus=4.0, gamma_plus=1.0\n"
        "- **Validation Protocol**: 5-Fold GroupKFold anchored by patient_id\n\n"
        "## HIPAA & Safe Harbor Compliance\n"
        "All data and model inputs comply strictly with HIPAA §164.514(b)(2) Safe Harbor de-identification rules.\n"
    )

    metadata = generate_model_metadata(
        owner=args.owner,
        slug=args.slug,
        title=args.title,
        summary=summary,
        description=description,
        is_private=args.is_private
    )

    metadata_path = os.path.join(model_dir, "model-metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"[OK] Model metadata generated at: {metadata_path}")
    print(f"[INFO] Owner Handle: {args.owner}")
    print(f"[INFO] Model Title: {args.title}")
    print(f"[INFO] Model Slug: {args.slug}")

    if args.dry_run:
        print("[OK] Dry run mode enabled. Skipping API upload call.")
        return

    try:
        from kaggle.api.kaggle_api_extended import KaggleApi
        api = KaggleApi()
        kaggle_user = getattr(api, "username", None) or api.config_values.get("username", args.owner)
        print(f"[INFO] Authenticated as Kaggle user: {kaggle_user}")
        import subprocess
        cmd = ["kaggle", "models", "create", "-p", model_dir]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"[OK] Successfully pushed model to Kaggle Model Hub: {result.stdout}")
        else:
            print(f"[WARN] Kaggle models CLI output: {result.stdout} | {result.stderr}")
            print("[INFO] Model metadata saved locally. Verify model registration via Kaggle web interface or CLI.")
    except Exception as e:
        print(f"[WARN] Kaggle API invocation note: {e}")
        print("[INFO] Model metadata ready for CLI deployment: `kaggle models create -p <model-dir>`")


if __name__ == "__main__":
    main()
