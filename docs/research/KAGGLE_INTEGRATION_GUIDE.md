# Kaggle Integration & Automated Badge Progression Guide

This guide details the operational procedures for running Kaggle API pipelines, deploying pre-trained models to Kaggle Model Hub, publishing datasets with a 10/10 usability score, syncing utility scripts, and tracking Kaggle badge achievements for **Pocketgull**.

---

## 1. Overview & Architecture

Pocketgull integrates with the Kaggle platform through standardized script interfaces (`scripts/kaggle_*.py`) and GitHub Actions workflows (`.github/workflows/kaggle-sync.yml`).

```
                              ┌─────────────────────────────────────────┐
                              │           Pocketgull Monorepo           │
                              └────────────────────┬────────────────────┘
                                                   │
                 ┌─────────────────────────────────┼─────────────────────────────────┐
                 │                                 │                                 │
     ┌───────────▼───────────┐         ┌───────────▼───────────┐         ┌───────────▼───────────┐
     │  kaggle_push_model    │         │  kaggle_push_dataset  │         │  kaggle_sync_utility  │
     └───────────┬───────────┘         └───────────┬───────────┘         └───────────┬───────────┘
                 │                                 │                                 │
                 ▼                                 ▼                                 ▼
   ┌──────────────────────────┐      ┌──────────────────────────┐      ┌──────────────────────────┐
   │     Kaggle Model Hub     │      │     Kaggle Datasets      │      │  Kaggle Utility Scripts  │
   │  (`philgear/<model>`)    │      │  (`philgear/<dataset>`)  │      │  (`philgear/<utility>`)  │
   └──────────────────────────┘      └──────────────────────────┘      └──────────────────────────┘
```

---

## 2. CLI Script Operations

### A. Publish / Version Pre-trained Models (`Model Creator` Badge)
```powershell
python scripts/kaggle_push_model.py `
  --owner philgear `
  --title "Pocketgull RSNA Knee ConvNeXt-Large" `
  --slug "rsna-knee-convnext-large" `
  --model-dir contests/rsna_knee_2026 `
  --dry-run
```

### B. Publish / Version 10/10 Usability Datasets (`Dataset Creator` & `Dataset Documenter` Badges)
```powershell
python scripts/kaggle_push_dataset.py `
  --owner philgear `
  --title "Pocketgull Medical Skeptic DICOM Benchmark" `
  --slug "med-skeptic-dicom-bench" `
  --dataset-dir contests/rsna_knee_2026 `
  --dry-run
```

### C. Publish Utility Scripts (`Utility Scripter` Badge)
```powershell
python scripts/kaggle_sync_utility.py `
  --owner philgear `
  --script-path contests/rsna_knee_2026/asymmetric_loss.py `
  --slug rsna-knee-asymmetric-loss `
  --dry-run
```

### D. Sync Competition / Benchmark Notebooks (`Code Submitter` & `Github Coder` Badges)
```powershell
python scripts/kaggle_sync_notebooks.py `
  --owner philgear `
  --kernel-dir contests/rsna_knee_2026 `
  --dry-run
```

---

## 3. Kaggle Usability 10 Checklist

To achieve the **Dataset Documenter** and **Model Documenter** badges, every published dataset and model MUST include:

1. **Explicit Data/Model Title & Short Subtitle**
2. **License Specification** (`Apache 2.0`, `CC-BY-4.0`, or `MIT`)
3. **Comprehensive Markdown Description**:
   - Provenance and clinical background
   - Architecture summary (for models) or schema dictionary (for datasets)
   - HIPAA §164.514(b)(2) Safe Harbor de-identification verification
4. **Relevant Keywords & Tags**: `healthcare`, `medical-imaging`, `dicom`, `gemini`, `pocketgull`

---

## 4. Badge Achievement Tracker

| Badge | Pipeline Action | Verification |
| :--- | :--- | :--- |
| **Model Creator** | Run `scripts/kaggle_push_model.py` | Verify entry under `kaggle.com/models/philgear` |
| **Dataset Creator** | Run `scripts/kaggle_push_dataset.py` | Verify dataset under `kaggle.com/datasets/philgear` |
| **Model Documenter** | Include 10/10 usability markdown in `model-metadata.json` | Achieve 10.0 score badge on Model Hub |
| **Dataset Documenter** | Include 10/10 usability markdown in `dataset-metadata.json` | Achieve 10.0 score badge on Kaggle Datasets |
| **Utility Scripter** | Run `scripts/kaggle_sync_utility.py` | Import utility script in notebook (`import asymmetric_loss`) |
| **API Notebook Creator** | Run `scripts/kaggle_sync_notebooks.py` | Verify kernel pushed via Kaggle API |
| **Github Coder** | Enable GitHub repository sync on Kaggle | Commit saved versions back to GitHub repo |
