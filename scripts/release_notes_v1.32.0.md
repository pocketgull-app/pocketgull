# 🕊️ PocketGull v1.32.0: Sovereign Edge Clinical Intelligence & The Avian Navigator Suite

We are thrilled to announce the official open-source release of **PocketGull v1.32.0**, introducing the **Avian Navigator Tier of fine-tuned Google Gemma models**, **in-browser WebGPU zero-egress clinical inference**, **interactive 3D WebGL anatomical triage**, and **1-click local deployment with Ollama**.

---

## 🌟 What's New in v1.32.0

### 1. 🕊️ The Avian Navigator Tier (6 Fine-Tuned Gemma Models)
Fine-tuned on NIH NLM MedQuAD, WHO mhGAP, ClinicalTrials.gov, and CPIC pharmacogenomics with DPO preference alignment and strict ISMP decimal safety filters:
* 🕊️ [**pocketgull-compass-2b**](https://huggingface.co/philgear/pocketgull-compass-2b): NIH/WHO Stepped-Care Triage & 3-Act Trajectory narrative generator.
* 🕊️ [**pocketgull-sentinel-peft**](https://huggingface.co/philgear/pocketgull-sentinel-peft): Zero-Tolerance Emergency Red-Flag Interceptor & ISMP Decimal Safety Guard.
* 🕊️ [**pocketgull-scribe-soap**](https://huggingface.co/philgear/pocketgull-scribe-soap): Zero-Egress Ambient Doctor-Patient SOAP Encounter Encoder.
* 🕊️ [**pocketgull-tern-edge**](https://huggingface.co/philgear/pocketgull-tern-edge): Sub-45ms Ultra-Lightweight On-Device WebGPU / Mobile Edge Engine.
* 🕊️ [**pocketgull-albatross-multimodal**](https://huggingface.co/philgear/pocketgull-albatross-multimodal): High-Capacity Tri-Paradigm Diagnostic & 3D WebGL Anatomy Integrator.
* 🕊️ [**pocketgull-rxguard-pgx**](https://huggingface.co/philgear/pocketgull-rxguard-pgx): Pharmacogenomics & Botanical Supplement Interaction Screener.

### 2. 🌐 4 Live Hugging Face Spaces (Free Edge Hosting)
* ⚡ [**PocketGull WebGPU Zero-Egress AI**](https://huggingface.co/spaces/philgear/pocketgull-webgpu-edge): 100% in-browser WebGPU hardware-accelerated clinical inference.
* 🫀 [**PocketGull 3D WebGL Anatomy Viewer**](https://huggingface.co/spaces/philgear/pocketgull-3d-anatomy): Three.js interactive 3D anatomy with clickable organ triage nodes.
* 💊 [**PocketGull ISMP Decimal Safety & RxGuard**](https://huggingface.co/spaces/philgear/pocketgull-ismp-rxguard): Instant prescription order safety auditor.
* 🕊️ [**PocketGull Clinical Intelligence Suite**](https://huggingface.co/spaces/philgear/pocketgull-clinical-consult): Stepped-care triage acuity classifier.

### 3. 🦙 1-Click Local Execution with Ollama
Run any Avian Navigator model locally on your own machine in 1 command:
```bash
# Windows
powershell -ExecutionPolicy Bypass -File dist/ollama/install_models.ps1

# macOS / Linux
bash dist/ollama/install_models.sh

# Run
ollama run pocketgull-compass-2b
```

### 4. 📜 Multi-Pillar Legal & Responsible AI Governance
* **Apache-2.0 License**: Code, scripts, and model adapter weights with mutual patent grants.
* **CC-BY-4.0 Datasets**: [philgear/pocketgull-nih-who-clinical-dpo](https://huggingface.co/datasets/philgear/pocketgull-nih-who-clinical-dpo).
* **Google Responsible AI Alignment**: Formal operationalization of Google's 3 AI Principles and PAIR Guidebook design patterns (`docs/GOOGLE_RESPONSIBLE_AI_ALIGNMENT.md`).
* **Academic Citation**: Citable with permanent **Zenodo DOI (`10.5281/zenodo.20647514`)**.

---

## 🛡️ Verification & Security Attestation
* **TypeScript Compilation**: 0 errors.
* **Vitest Unit & Clinical Test Suite**: 418/418 test files passed (1,657 tests).
* **Sentinel Security & Secret Guard**: 1,454 files audited with 0 secret leaks and 100% approved egress.
* **ISMP Decimal Safety**: 100.0% compliant (prohibits trailing zeros, mandates leading decimals).

---

## 👥 Contributors & Citation
Lead Systems Architect & Creator: **Phillip Gear** ([ORCID: 0009-0008-1372-5381](https://orcid.org/0009-0008-1372-5381))  
Published by **PocketGull LLC**.
