#!/usr/bin/env python3
"""
🏛️ PocketGull — Hugging Face Profile README Publisher.
Creates and pushes the official Profile README repository (philgear/philgear)
to render the comprehensive bio, research focus, and Avian Navigator Tier model index.
"""

import os
import sys
from pathlib import Path
from huggingface_hub import HfApi, create_repo, upload_file

PROFILE_README = """---
language:
- en
license: apache-2.0
tags:
- clinical-ai
- health-informatics
- gemma-3
- peft
- lora
- hipaa-safe-harbor
- fhir-r4
- webgpu
- pocketgull
---

# 🕊️ Phillip Gear
**Health Informatics Lead & AI Systems Architect — [PocketGull LLC](https://pocketgull.app)**  
*CMS NPI: 1487569752 | ORCID: [0009-0008-1372-5381](https://orcid.org/0009-0008-1372-5381) | Oregon SOS: 258869891*

---

## 📌 Research & Clinical Focus
Architecting **sovereign, zero-egress clinical intelligence engines** and privacy-preserving AI decision support tools grounded in official **NIH** (NLM, NHLBI, NIDDK, NINDS) and **WHO** Level A/B consensus literature.

* 🛡️ **100% On-Device Execution**: In-browser WebGPU and WebLLM execution eliminating patient PHI network egress.
* 🔒 **Deterministic Clinical Guardrails**: Zero-tolerance red-flag emergency rule-out gates (BE-FAST stroke, ACS) and ISMP decimal safety enforcement.
* 🌐 **Open Interoperability**: Native HL7 FHIR R4 Bundle exports and GA4GH Phenopackets v2 schema conformance.
* 📚 **Open Science Provenance**: [Zenodo DOI: 10.5281/zenodo.20647514](https://doi.org/10.5281/zenodo.20647514).

---

## 🕊️ The PocketGull Avian Navigator Tier Models

| Model | Base Foundation | Clinical Role & Focus |
| :--- | :--- | :--- |
| [**pocketgull-compass-2b**](https://huggingface.co/philgear/pocketgull-compass-2b) | Gemma 2 / 3 (2B / 4B) | NIH/WHO Stepped-Care Triage, Socratic Health Literacy, and 3-Act Trajectories |
| [**pocketgull-sentinel-peft**](https://huggingface.co/philgear/pocketgull-sentinel-peft) | Gemma 2 (2B) | Zero-Tolerance Emergency Red-Flag Interceptor & ISMP Decimal Safety Guard |
| [**pocketgull-scribe-soap**](https://huggingface.co/philgear/pocketgull-scribe-soap) | Gemma 3 (4B) | Zero-Egress Ambient Doctor-Patient SOAP & SBAR Encounter Encoder |
| [**pocketgull-tern-edge**](https://huggingface.co/philgear/pocketgull-tern-edge) | Gemma 2 (2B) | Sub-45ms Ultra-Lightweight On-Device WebGPU / Mobile Edge Engine |
| [**pocketgull-albatross-multimodal**](https://huggingface.co/philgear/pocketgull-albatross-multimodal) | Gemma 3 (12B) | High-Capacity Tri-Paradigm Diagnostic & 3D WebGL Anatomy Integrator |
| [**pocketgull-rxguard-pgx**](https://huggingface.co/philgear/pocketgull-rxguard-pgx) | Gemma 3 (4B) | Pharmacogenomics & Botanical Supplement Interaction Screener |

---

## 🚀 Live Interactive Demos (Hugging Face Spaces)

* ⚡ [**PocketGull WebGPU Zero-Egress Sovereign Clinical AI**](https://huggingface.co/spaces/philgear/pocketgull-webgpu-edge): 100% in-browser WebGPU hardware-accelerated clinical inference with zero network calls (HIPAA air-gapped).
* 🫀 [**PocketGull 3D WebGL Anatomy & Tri-Paradigm Triage**](https://huggingface.co/spaces/philgear/pocketgull-3d-anatomy): Three.js interactive 3D human anatomy viewer with clickable organ nodes (Heart, Brain, Lungs, Liver, Spine).
* 💊 [**PocketGull ISMP Decimal Safety & CYP450 RxGuard**](https://huggingface.co/spaces/philgear/pocketgull-ismp-rxguard): Instant prescription auditor detecting 10-fold decimal errors and botanical herb-drug interactions.
* 🕊️ [**PocketGull Clinical Intelligence Suite (Triage & 3-Act Trajectory)**](https://huggingface.co/spaces/philgear/pocketgull-clinical-consult): Stepped-care triage, emergency red-flag rule-outs, and 3-Act Trajectory generator.

---

## 📚 Open Clinical Datasets

* [**philgear/pocketgull-nih-who-clinical-dpo**](https://huggingface.co/datasets/philgear/pocketgull-nih-who-clinical-dpo): Gold-standard Direct Preference Optimization (DPO) chosen vs rejected pairs grounded in NIH MedQuAD and WHO mhGAP stepped-care triage.
* [**philgear/pocketgull-clinical-instruction-corpus**](https://huggingface.co/datasets/philgear/pocketgull-clinical-instruction-corpus): Multi-turn clinical SFT training instructions spanning stepped-care triage, ambient SOAP scribing, and pharmacogenomics.

---

## 🏛️ Federal Grants & Initiatives
* **NIH SBIR Phase I (R43)** & **ARPA-H Open BAA**: *Multi-Paradigm Sovereign Clinical Decision Support and Privacy-Preserving Ambient Scribing on Edge AI Architectures*.
* **Five Eyes (FVEY) Regulatory Mapping**: HIPAA §164.514 Safe Harbor, NHS DTAC/UK-GDPR, PIPEDA/PHIPA, and TGA SaMD compliance.

---

## 📬 Connect & Collaborate
* **Website**: [pocketgull.app](https://pocketgull.app)
* **ORCID**: [0009-0008-1372-5381](https://orcid.org/0009-0008-1372-5381)
* **Zenodo Prior Art**: [doi.org/10.5281/zenodo.20647514](https://doi.org/10.5281/zenodo.20647514)
"""

def publish_profile(token: str = None, username: str = "philgear"):
    effective_token = token or os.environ.get("HF_TOKEN")
    if not effective_token:
        print(" [ERROR] No HF_TOKEN provided. Pass token via command line or set HF_TOKEN environment variable.")
        return
    api = HfApi(token=effective_token)
    
    try:
        user_info = api.whoami()
        target_user = user_info.get("name", username)
        print(f" [AUTH] Authenticated as Hugging Face user: @{target_user}")
    except Exception as e:
        target_user = username
        print(f" [AUTH] Using user: @{target_user} (Notice: {e})")

    # Create the profile repository: philgear/philgear (as a model or dataset repository)
    repo_id = f"{target_user}/{target_user}"
    print(f" [PROFILE] Creating Profile README repository: {repo_id}...")
    
    try:
        create_repo(repo_id=repo_id, token=effective_token, repo_type="model", exist_ok=True)
    except Exception as create_err:
        print(f" [INFO] Repo existence status: {create_err}")

    # Write temporary README.md and upload
    temp_readme = Path("scratch") / "PROFILE_README.md"
    temp_readme.parent.mkdir(parents=True, exist_ok=True)
    temp_readme.write_text(PROFILE_README, encoding="utf-8")

    print(f" [PUSH] Uploading Profile README to https://huggingface.co/{repo_id}...")
    upload_file(
        path_or_fileobj=str(temp_readme),
        path_in_repo="README.md",
        repo_id=repo_id,
        repo_type="model",
        token=effective_token,
        commit_message="feat(profile): publish official PocketGull clinical profile README"
    )

    print("================================================================")
    print(f" [SUCCESS] Your Hugging Face Profile is live!")
    print(f" View Profile: https://huggingface.co/{target_user}")
    print("================================================================\n")

if __name__ == "__main__":
    token = sys.argv[1] if len(sys.argv) > 1 else None
    publish_profile(token=token)
