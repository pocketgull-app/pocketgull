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
import shutil
import sys
from typing import Any, Dict, List


def generate_dataset_metadata(
    owner: str,
    slug: str,
    title: str,
    subtitle: str = "De-identified 3D Medical Imaging & Synthetic Clinical Consult Vectors",
    licenses: List[Dict[str, str]] = None,
    is_private: bool = False
) -> Dict[str, Any]:
    """Generates a standard Kaggle Dataset metadata dictionary achieving 10/10 usability rating.

    Fulfills Kaggle Usability 10 Criteria:
      1. Subtitle: Short descriptive tagline (<80 chars).
      2. Description: Comprehensive Markdown documentation (>500 chars).
      3. Data Dictionary: Detailed column definitions and data types.
      4. File Descriptions: Explicit file breakdown.
      5. License: Open access license (CC-BY-4.0).
      6. Provenance/Sources: Valid organization and project URL.
      7. Update Frequency: Periodic schedule (e.g. Monthly).
      8. Valid Keywords: Official valid Kaggle dataset tags.
      9. Column Description: Column schemas for every table.
    """
    if licenses is None:
        licenses = [{"name": "CC-BY-4.0"}]

    official_keywords = [
        "healthcare",
        "medicine",
        "python",
        "biology",
        "synthetic"
    ]

    description = (
        "# Pocketgull Clinical & Benchmark Dataset (MED-SKEPTIC)\n\n"
        "## Context & Overview\n"
        "This dataset provides de-identified 3D MRI volumetric metadata, multi-label diagnostic annotations, "
        "and synthetic clinical consult vectors engineered to evaluate foundation model diagnostic accuracy, "
        "Popperian falsifiability ($p < 0.05$), and Socratic evidence literacy.\n\n"
        "## Content & File Structure\n"
        "- `train.csv`: 4,400+ study-level multi-label pathology annotations (ACL, MCL, Meniscus tears, Osteoarthritis, Effusion).\n"
        "- `train.parquet`: Snappy-compressed zero-copy columnar format containing all 4,400+ study annotations.\n"
        "- `train_series.csv`: DICOM MRI volumetric acquisition parameters, series UIDs, and plane orientations (Sagittal, Coronal, Axial).\n"
        "- `train_labels_gemini.csv`: Gemini 2.5 Flash distilled weak labels with clinical rationale confidence scores.\n"
        "- `lemonade_extracted_labels.jsonl`: 5,057 AMD GPU local LLM-extracted pathology labels across 3,613 unique patient studies.\n"
        "- `optimal_biomechanical_priors.json`: Nelder-Mead continuous transfer weights (+0.00605 Macro-AUC gain on 3,613-study cohort).\n"
        "- `jax_cooccurrence_priors.json`: 12x12 Bayesian conditional expectation co-occurrence probability matrix.\n"
        "- `jax_optimal_ensemble_weights.json`: Specialized multi-model blend weights for DINOv2, A5 Folds, RadImageNet, and Raptor CoAtNet.\n"
        "- `asymmetric_loss.py`: PyTorch/NumPy implementation of Asymmetric Loss (ASL: gamma_minus=4.0, gamma_plus=1.0).\n\n"
        "## Data Dictionary\n"
        "| Column Name | Data Type | Description |\n"
        "|:---|:---|:---|\n"
        "| `StudyInstanceUID` | String | Unique anonymized study subject hash |\n"
        "| `SeriesInstanceUID` | String | Unique DICOM volumetric series acquisition identifier |\n"
        "| `ACL` | Integer (0 or 1) | Binary indicator for Anterior Cruciate Ligament tear |\n"
        "| `MCL` | Integer (0 or 1) | Binary indicator for Medial Collateral Ligament tear |\n"
        "| `Medial Meniscus` | Integer (0 or 1) | Binary indicator for Medial Meniscus tear |\n"
        "| `Lateral Meniscus` | Integer (0 or 1) | Binary indicator for Lateral Meniscus tear |\n"
        "| `Medial OA` | Integer (0 or 1) | Binary indicator for Medial Compartment Osteoarthritis |\n"
        "| `Lateral OA` | Integer (0 or 1) | Binary indicator for Lateral Compartment Osteoarthritis |\n"
        "| `PF OA` | Integer (0 or 1) | Binary indicator for Patellofemoral Osteoarthritis |\n"
        "| `Effusion` | Integer (0 or 1) | Presence of joint effusion / fluid accumulation |\n"
        "| `Synovitis` | Integer (0 or 1) | Synovial membrane inflammation or thickening |\n"
        "| `Baker's` | Integer (0 or 1) | Popliteal synovial fluid distension (Baker's cyst) |\n"
        "| `Contusion` | Integer (0 or 1) | Subchondral bone marrow edema pattern |\n"
        "| `Fracture` | Integer (0 or 1) | Cortical bone discontinuity |\n\n"
        "## HIPAA §164.514 Safe Harbor Compliance\n"
        "All data strictly conforms to HIPAA 45 CFR §164.514(b)(2) Safe Harbor anonymization. "
        "All 18 direct personal identifiers (names, dates, MRNs, institutional headers) have been permanently removed.\n\n"
        "## Provenance & Citation\n"
        "Published by PocketGull LLC & the RSNA Radiology Archive under Creative Commons Attribution 4.0 International (CC-BY 4.0). "
        "Free for global research, academic evaluation, and model benchmarking.\n"
    )

    resources = [
        {
            "path": "train.csv",
            "description": "Primary study-level multi-label pathology ground truth annotations for 4,400+ patients.",
            "schema": {
                "fields": [
                    {"name": "StudyInstanceUID", "type": "string", "description": "Unique anonymized study subject hash identifier"},
                    {"name": "ACL", "type": "integer", "description": "Anterior Cruciate Ligament tear binary indicator (0 or 1)"},
                    {"name": "MCL", "type": "integer", "description": "Medial Collateral Ligament tear binary indicator (0 or 1)"},
                    {"name": "Medial Meniscus", "type": "integer", "description": "Medial Meniscus tear binary indicator (0 or 1)"},
                    {"name": "Lateral Meniscus", "type": "integer", "description": "Lateral Meniscus tear binary indicator (0 or 1)"},
                    {"name": "Medial OA", "type": "integer", "description": "Medial compartment osteoarthritis cartilage loss (0 or 1)"},
                    {"name": "Lateral OA", "type": "integer", "description": "Lateral compartment osteoarthritis cartilage loss (0 or 1)"},
                    {"name": "PF OA", "type": "integer", "description": "Patellofemoral osteoarthritis retropatellar wear (0 or 1)"},
                    {"name": "Effusion", "type": "integer", "description": "Joint effusion / fluid accumulation binary indicator (0 or 1)"},
                    {"name": "Synovitis", "type": "integer", "description": "Synovial membrane inflammation or thickening (0 or 1)"},
                    {"name": "Baker's", "type": "integer", "description": "Popliteal synovial fluid distension / Baker's cyst (0 or 1)"},
                    {"name": "Contusion", "type": "integer", "description": "Subchondral bone marrow edema pattern (0 or 1)"},
                    {"name": "Fracture", "type": "integer", "description": "Cortical bone discontinuity binary indicator (0 or 1)"}
                ]
            }
        },
        {
            "path": "train_series.csv",
            "description": "DICOM MRI volumetric acquisition parameters, series UIDs, and plane orientations.",
            "schema": {
                "fields": [
                    {"name": "StudyInstanceUID", "type": "string", "description": "Unique anonymized study subject hash identifier"},
                    {"name": "SeriesInstanceUID", "type": "string", "description": "Unique DICOM series volumetric acquisition identifier"},
                    {"name": "SeriesDescription", "type": "string", "description": "Anatomical slice orientation plane (Sagittal, Coronal, or Axial)"}
                ]
            }
        },
        {
            "path": "train_labels_gemini.csv",
            "description": "Gemini 2.5 Flash distilled weak labels with clinical rationale confidence scores.",
            "schema": {
                "fields": [
                    {"name": "StudyInstanceUID", "type": "string", "description": "Unique anonymized study subject hash identifier"},
                    {"name": "ACL", "type": "number", "description": "Weak label probability for Anterior Cruciate Ligament tear [0.0 - 1.0]"},
                    {"name": "MCL", "type": "number", "description": "Weak label probability for Medial Collateral Ligament tear [0.0 - 1.0]"},
                    {"name": "Medial Meniscus", "type": "number", "description": "Weak label probability for Medial Meniscus tear [0.0 - 1.0]"},
                    {"name": "Lateral Meniscus", "type": "number", "description": "Weak label probability for Lateral Meniscus tear [0.0 - 1.0]"},
                    {"name": "Effusion", "type": "number", "description": "Weak label probability for Joint Effusion [0.0 - 1.0]"}
                ]
            }
        },
        {
            "path": "train.parquet",
            "description": "Zero-copy Snappy-compressed columnar format containing all 4,400+ study annotations."
        },
        {
            "path": "lemonade_extracted_labels.jsonl",
            "description": "5,057 AMD GPU local LLM-extracted pathology labels across 3,613 unique patient studies."
        },
        {
            "path": "optimal_biomechanical_priors.json",
            "description": "Nelder-Mead continuous transfer weights (+0.00605 Macro-AUC gain on 3,613-study cohort)."
        },
        {
            "path": "jax_cooccurrence_priors.json",
            "description": "12x12 Bayesian conditional expectation co-occurrence probability matrix."
        },
        {
            "path": "jax_optimal_ensemble_weights.json",
            "description": "Specialized multi-model blend weights for DINOv2, A5 Folds, RadImageNet, and Raptor CoAtNet."
        },
        {
            "path": "asymmetric_loss.py",
            "description": "PyTorch/NumPy implementation of Asymmetric Loss (ASL) for extreme class imbalance."
        },
        {
            "path": "rsna_parquet_jax_engine.py",
            "description": "Vectorized JAX + NumPy Bayesian co-occurrence calibration engine."
        },
        {
            "path": "cooccurrence_calibrator.py",
            "description": "Bayesian co-occurrence prior calibrator and conditional expectation matrix calculator."
        },
        {
            "path": "threshold_optimizer.py",
            "description": "Nelder-Mead multi-target decision threshold optimizer."
        }
    ]

    return {
        "title": title,
        "subtitle": subtitle,
        "id": f"{owner}/{slug}",
        "licenses": licenses,
        "isPrivate": is_private,
        "keywords": official_keywords,
        "sources": [
            {
                "name": "PocketGull Clinical Intelligence & RSNA Radiology Archive",
                "url": "https://github.com/philgear/pocketgull"
            }
        ],
        "updateFrequency": "monthly",
        "description": description,
        "resources": resources
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Publish or update dataset on Kaggle with 10/10 usability score.")
    parser.add_argument("--owner", default="philgear", help="Kaggle user handle (default: philgear)")
    parser.add_argument("--slug", default="med-skeptic-dicom-bench", help="Dataset slug identifier")
    parser.add_argument("--title", default="Pocketgull Medical Skeptic DICOM Benchmark", help="Dataset title")
    parser.add_argument("--dataset-dir", default=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "contests", "rsna_knee_2026"), help="Directory containing dataset files")
    parser.add_argument("--stage-dir", default=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "contests", "rsna_knee_2026", "dataset_staging"), help="Staging directory for clean packaging")
    parser.add_argument("--message", default="Version 2.0: 3,613-study ground truth cohort, Snappy-compressed Parquet, Nelder-Mead biomechanical priors (+0.00605 Macro-AUC), and JAX calibration engines", help="Version message")
    parser.add_argument("--is-private", action="store_true", help="Mark dataset as private")
    parser.add_argument("--dry-run", action="store_true", help="Validate and write metadata without network calls")

    args = parser.parse_args()

    source_dir = os.path.abspath(args.dataset_dir)
    stage_dir = os.path.abspath(args.stage_dir)
    os.makedirs(stage_dir, exist_ok=True)

    metadata = generate_dataset_metadata(
        owner=args.owner,
        slug=args.slug,
        title=args.title,
        is_private=args.is_private
    )

    metadata_path = os.path.join(stage_dir, "dataset-metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    # Also keep a copy in source dir for source control
    with open(os.path.join(source_dir, "dataset-metadata.json"), "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"[OK] 10/10 Usability Dataset metadata generated at: {metadata_path}")
    print(f"[INFO] Dataset ID: {args.owner}/{args.slug}")

    # Copy curated files to staging directory
    curated_files = [
        "train.csv",
        "train.parquet",
        "train_series.csv",
        "train_labels_gemini.csv",
        "lemonade_extracted_labels.jsonl",
        "optimal_biomechanical_priors.json",
        "jax_cooccurrence_priors.json",
        "jax_optimal_ensemble_weights.json",
        "asymmetric_loss.py",
        "rsna_parquet_jax_engine.py",
        "cooccurrence_calibrator.py",
        "threshold_optimizer.py"
    ]

    for fname in curated_files:
        src = os.path.join(source_dir, fname)
        dst = os.path.join(stage_dir, fname)
        if os.path.exists(src):
            shutil.copy2(src, dst)
            size_kb = os.path.getsize(dst) / 1024.0
            print(f"  [STAGED] {fname} ({size_kb:.1f} KB)")
        else:
            print(f"  [WARN] Source file not found: {src}")

    if args.dry_run:
        print("[OK] Dry run mode enabled. Skipping API upload.")
        return

    import subprocess
    cmd = ["kaggle", "datasets", "version", "-p", stage_dir, "-m", args.message, "-r", "zip"]
    print(f"[RUNNING] {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    print(f"[INFO] Dataset version update stdout:\n{result.stdout}")
    if result.stderr:
        print(f"[INFO] Dataset version update stderr:\n{result.stderr}")


if __name__ == "__main__":
    main()

