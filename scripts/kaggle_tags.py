#!/usr/bin/env python3
"""Standardized Kaggle Tagging Taxonomy for Pocketgull.

Defines a curated, high-relevance taxonomy of tags and keywords for Kaggle Models,
Datasets, Kernels, and Utility Scripts to maximize platform discoverability and
usability score (10/10).
"""

from typing import List, Optional

# Core Clinical & Medical Imaging Taxonomy
CLINICAL_TAGS = [
    "healthcare",
    "medical-imaging",
    "dicom",
    "mri",
    "fhir",
    "hipaa-safe-harbor",
    "clinical-cds",
    "biomedical",
    "synthetic"
]

# AI, ML & Deep Learning Framework Taxonomy
AI_ML_TAGS = [
    "gemini",
    "agentic-ai",
    "pytorch",
    "onnx",
    "deep-learning",
    "computer-vision",
    "asymmetric-loss",
    "group-kfold",
    "socratic-reasoning"
]

# Project & Benchmark Taxonomy
PROJECT_TAGS = [
    "pocketgull",
    "med-skeptic",
    "rsna",
    "physionet"
]

# Combined master taxonomy
ALL_TAGS = sorted(list(set(CLINICAL_TAGS + AI_ML_TAGS + PROJECT_TAGS)))


def get_standard_tags(
    category: str = "all",
    extra_tags: Optional[List[str]] = None
) -> List[str]:
    """Returns a clean, deduplicated list of standard Kaggle tags.

    Args:
        category: Tag domain category ('all', 'clinical', 'ai_ml', 'project').
        extra_tags: Additional custom tags to append.

    Returns:
        List of formatted string tags.
    """
    if category == "clinical":
        base = list(CLINICAL_TAGS)
    elif category == "ai_ml":
        base = list(AI_ML_TAGS)
    elif category == "project":
        base = list(PROJECT_TAGS)
    else:
        base = list(ALL_TAGS)

    if extra_tags:
        base.extend(extra_tags)

    # Clean and deduplicate preserving case
    seen = set()
    cleaned = []
    for tag in base:
        tag_str = str(tag).strip().lower().replace(" ", "-")
        if tag_str and tag_str not in seen:
            seen.add(tag_str)
            cleaned.append(tag_str)

    return cleaned


if __name__ == "__main__":
    print(f"[OK] Pocketgull Master Tag Taxonomy ({len(ALL_TAGS)} tags):")
    print(", ".join(ALL_TAGS))
