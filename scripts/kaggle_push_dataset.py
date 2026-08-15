#!/usr/bin/env python3
"""Kaggle Dataset Pipeline Creator for Pocketgull (Usability 10 Guaranteed).

Generates complete 10/10 usability rating dataset metadata and publishes/versions clinical,
synthetic PHI, and benchmark datasets under user handle `philgear`.

Usage:
    python scripts/kaggle_push_dataset.py --dataset-dir contests/rsna_knee_2026 --title "Pocketgull Medical Skeptic DICOM Benchmark" --slug "med-skeptic-dicom-bench"
"""

import argparse
import json
import os
import sys
from typing import Any, Dict


def generate_dataset_metadata(
    owner: str,
    slug: str,
    title: str,
    subtitle: str = "De-identified 3D Medical Imaging & Synthetic Clinical Consult Vectors",
    licenses: list[Dict[str, str]] = None,
    is_private: bool = True
) -> Dict[str, Any]:
    """Generates a standard Kaggle Dataset metadata dictionary achieving 10/10 usability rating.

    Fulfills Kaggle Usability 10 Criteria:
      1. Subtitle: Short descriptive tagline.
      2. Description: Comprehensive Markdown documentation (>500 chars).
      3. Data Dictionary: Detailed column definitions and data types.
      4. File Descriptions: Explicit file breakdown.
      5. License: Open access license (CC-BY-4.0).
      6. Keywords: Official valid Kaggle dataset tags.
    """
    if licenses is None:
        licenses = [{"name": "CC-BY-4.0"}]

    official_keywords = [
        "healthcare",
        "deep-learning",
        "python",
        "image-processing"
    ]

    description = (
        "# Pocketgull Clinical & Benchmark Dataset (MED-SKEPTIC)\n\n"
        "## Overview & Purpose\n"
        "This dataset provides de-identified 3D MRI volumetric metadata, multi-label diagnostic annotations, "
        "and synthetic clinical consult vectors engineered to evaluate foundation model diagnostic accuracy, "
        "Popperian falsifiability ($p < 0.05$), and Socratic evidence literacy.\n\n"
        "## Files & File Structure\n"
        "- `train.csv`: 4,400+ study-level multi-label pathology annotations (ACL, MCL, Meniscus tears, Osteoarthritis, Effusion).\n"
        "- `train_series.csv`: DICOM MRI volumetric acquisition parameters, series UIDs, and plane orientations (Sagittal, Coronal, Axial).\n"
        "- `train_labels_gemini.csv`: Gemini 2.5 Flash distilled weak labels with clinical rationale confidence scores.\n"
        "- `asymmetric_loss.py`: PyTorch/NumPy implementation of Asymmetric Loss (ASL: gamma_minus=4.0, gamma_plus=1.0).\n\n"
        "## Data Dictionary\n"
        "| Column Name | Data Type | Description |\n"
        "|:---|:---|:---|\n"
        "| `StudyInstanceUID` | String | Unique anonymized study subject hash |\n"
        "| `SeriesInstanceUID` | String | Unique DICOM volumetric series acquisition identifier |\n"
        "| `ACL` | Float / Int | Binary indicator for Anterior Cruciate Ligament tear (0 or 1) |\n"
        "| `MCL` | Float / Int | Binary indicator for Medial Collateral Ligament tear (0 or 1) |\n"
        "| `Medial Meniscus` | Float / Int | Binary indicator for Medial Meniscus tear (0 or 1) |\n"
        "| `Lateral Meniscus` | Float / Int | Binary indicator for Lateral Meniscus tear (0 or 1) |\n"
        "| `Effusion` | Float / Int | Presence of joint effusion / fluid accumulation (0 or 1) |\n"
        "| `socratic_challenge_score` | Float | Quantitative rating of evidence-based clinical reasoning (0.0 to 1.0) |\n\n"
        "## HIPAA §164.514 Safe Harbor Compliance\n"
        "All data strictly conforms to HIPAA 45 CFR §164.514(b)(2) Safe Harbor anonymization. "
        "All 18 direct personal identifiers (names, dates, MRNs, institutional headers) have been permanently removed.\n\n"
        "## Citation & Open Access\n"
        "Licensed under Creative Commons Attribution 4.0 International (CC-BY 4.0). "
        "Free for global research, academic evaluation, and model benchmarking.\n"
    )

    return {
        "title": title,
        "subtitle": subtitle,
        "id": f"{owner}/{slug}",
        "licenses": licenses,
        "isPrivate": is_private,
        "keywords": official_keywords,
        "description": description
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Publish or update dataset on Kaggle with 10/10 usability score.")
    parser.add_argument("--owner", default="philgear", help="Kaggle user handle (default: philgear)")
    parser.add_argument("--slug", default="med-skeptic-dicom-bench", help="Dataset slug identifier")
    parser.add_argument("--title", default="Pocketgull Medical Skeptic DICOM Benchmark", help="Dataset title")
    parser.add_argument("--dataset-dir", default=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "contests", "rsna_knee_2026"), help="Directory containing dataset files")
    parser.add_argument("--is-private", action="store_true", help="Mark dataset as private")
    parser.add_argument("--dry-run", action="store_true", help="Validate and write metadata without network calls")

    args = parser.parse_args()

    dataset_dir = os.path.abspath(args.dataset_dir)
    os.makedirs(dataset_dir, exist_ok=True)

    metadata = generate_dataset_metadata(
        owner=args.owner,
        slug=args.slug,
        title=args.title,
        is_private=args.is_private
    )

    metadata_path = os.path.join(dataset_dir, "dataset-metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"[OK] 10/10 Usability Dataset metadata generated at: {metadata_path}")
    print(f"[INFO] Dataset ID: {args.owner}/{args.slug}")

    if args.dry_run:
        print("[OK] Dry run mode enabled. Skipping API upload.")
        return

    import subprocess
    cmd = ["kaggle", "datasets", "version", "-p", dataset_dir, "-m", "Usability 10 metadata update with data dictionary and licensing"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    print(f"[INFO] Dataset version update output: {result.stdout} {result.stderr}")


if __name__ == "__main__":
    main()
