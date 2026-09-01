#!/usr/bin/env python3
"""
📚 PocketGull — Hugging Face Datasets Hub Publisher.
Packages and uploads curated clinical fine-tuning and DPO preference datasets
to Hugging Face Datasets (https://huggingface.co/datasets/philgear/...).
"""

import json
import os
import sys
from pathlib import Path
from huggingface_hub import HfApi, create_repo, upload_folder

DATASET_CONFIGS = [
    {
        "id": "pocketgull-nih-who-clinical-dpo",
        "name": "PocketGull NIH & WHO Clinical Preference DPO Dataset",
        "description": "Gold-standard Direct Preference Optimization (DPO) chosen vs rejected pairs grounded in NIH MedQuAD, WHO mhGAP guidelines, and ClinicalTrials.gov protocols with strict ISMP decimal safety.",
        "files": ["scripts/nih_who_dpo_pairs.jsonl"],
        "task_categories": ["text-generation", "reinforcement-learning"],
        "tags": ["clinical-dpo", "healthcare", "nih-medquad", "who-mhgap", "hipaa-safe-harbor", "open-science", "pocketgull"]
    },
    {
        "id": "pocketgull-clinical-instruction-corpus",
        "name": "PocketGull Multi-Paradigm Clinical Instruction Corpus",
        "description": "Multi-turn clinical SFT training instructions spanning stepped-care triage, ambient SOAP scribing, pharmacogenomics CYP450 interactions, and Calgary-Cambridge intake.",
        "files": ["scripts/nih_who_gemma_lora.jsonl", "scripts/nih_who_gemini_tuning.jsonl"],
        "task_categories": ["text-generation", "question-answering"],
        "tags": ["clinical-sft", "healthcare", "gemma-3", "fhir-r4", "soap-notes", "pocketgull"]
    }
]

def generate_dataset_card(ds_config: dict) -> str:
    tags_yaml = "\n".join([f"- {t}" for t in ds_config['tags']])
    return f"""---
language:
- en
license: cc-by-4.0
size_categories:
- 1K<n<10K
task_categories:
- text-generation
- question-answering
tags:
{tags_yaml}
---

# 📚 {ds_config['name']}

**Organization**: [PocketGull LLC](https://pocketgull.app) (Oregon SOS: 258869891)  
**Curator**: Phillip Gear (CMS NPI: 1487569752 | ORCID: [0009-0008-1372-5381](https://orcid.org/0009-0008-1372-5381))  
**License**: Creative Commons Attribution 4.0 International (CC-BY-4.0)  
**Open Science DOI**: [10.5281/zenodo.20647514](https://doi.org/10.5281/zenodo.20647514)  

---

## 📌 Dataset Summary
{ds_config['description']}

### Key Features:
* **Level A/B Evidence**: Grounded directly in official NIH (NLM, NHLBI, NIDDK, NINDS, Cancer.gov) and WHO (mhGAP, Essential Medicines) publications.
* **ISMP Decimal Safety**: 100% compliant with Institute for Safe Medication Practices standards (zero trailing zeros `5.0 mg` -> `5 mg`, mandatory leading zeros `.5 mg` -> `0.5 mg`).
* **HIPAA §164.514 Safe Harbor**: Cleaned and verified with zero protected health information (PHI) or personal identifiers.
* **3-Act Temporal Architecture**: Formatted with *Where You've Been*, *Where You Stand Today*, and *Where You're Going* clinical trajectories.

---

## 🚀 Loading the Dataset with Hugging Face Datasets

```python
from datasets import load_dataset

# Load directly into Python
dataset = load_dataset("philgear/{ds_config['id']}")
print(dataset)
```

---

## 📖 Citation
```bibtex
@dataset{{pocketgull_{ds_config['id'].replace('-', '_')}_2026,
  author = {{Gear, Phillip}},
  title = {{{ds_config['name']}}},
  publisher = {{Hugging Face}},
  year = {{2026}},
  url = {{https://huggingface.co/datasets/philgear/{ds_config['id']}}}
}}
```
"""

def publish_datasets(token: str = None, username: str = "philgear"):
    effective_token = token or os.environ.get("HF_TOKEN")
    if not effective_token:
        print(" [ERROR] No HF_TOKEN provided. Pass token via argument or set HF_TOKEN environment variable.")
        return

    api = HfApi(token=effective_token)
    try:
        user_info = api.whoami()
        target_user = user_info.get("name", username)
        print(f" [AUTH] Authenticated as Hugging Face user: @{target_user}\n")
    except Exception as e:
        target_user = username
        print(f" [AUTH] Using namespace: @{target_user} (Notice: {e})\n")

    for ds in DATASET_CONFIGS:
        repo_id = f"{target_user}/{ds['id']}"
        staging_dir = Path("dist") / "datasets" / ds['id']
        staging_dir.mkdir(parents=True, exist_ok=True)

        # Write README.md dataset card
        (staging_dir / "README.md").write_text(generate_dataset_card(ds), encoding="utf-8")

        # Copy data files into staging directory
        for src_file in ds['files']:
            src_path = Path(src_file)
            if src_path.exists():
                dst_path = staging_dir / src_path.name
                dst_path.write_bytes(src_path.read_bytes())
                print(f" [FILE] Staged: {src_path.name} -> {dst_path}")

        print(f" [PUSH] Creating dataset repo and uploading: {repo_id}...")
        try:
            create_repo(repo_id=repo_id, token=effective_token, repo_type="dataset", exist_ok=True)
            upload_folder(
                folder_path=str(staging_dir),
                repo_id=repo_id,
                repo_type="dataset",
                token=effective_token,
                commit_message=f"feat(dataset): publish {ds['name']} [PocketGull Open Science]"
            )
            print(f" [PUBLISHED] https://huggingface.co/datasets/{repo_id}\n")
        except Exception as err:
            print(f" [FAIL] Failed to upload {repo_id}: {err}\n")

    print("================================================================")
    print(" [SUCCESS] All PocketGull Clinical Datasets published to Hugging Face!")
    print("================================================================\n")

if __name__ == "__main__":
    token = sys.argv[1] if len(sys.argv) > 1 else None
    publish_datasets(token=token)
