# PocketGull Licensing, Open Science & Regulatory Compliance Standards

**Corporate Entity**: PocketGull LLC (Oregon Registry: 258869891 | EIN: 42-3162850)  
**Principal Investigator**: Phillip Gear (CMS NPI: 1487569752 | ORCID: 0009-0008-1372-5381)  
**Open Science DOI**: [10.5281/zenodo.20647514](https://doi.org/10.5281/zenodo.20647514)  

---

## 1. Models & Codebase License: Apache License 2.0
All machine learning model weights, fine-tuned LoRA adapters (The **PocketGull Avian Navigator Tier**), Angular frontend source code, Python sidecars, and edge WebGPU runtimes are distributed under the **Apache License, Version 2.0**.

### Key Provisions:
* **Permissive Commercial & Non-Commercial Use**: Users may freely run, inspect, modify, and distribute the software in academic, clinical, and commercial environments.
* **Explicit Patent Grant**: Every contributor explicitly grants a perpetual, worldwide, non-exclusive patent license covering contributions.
* **Trademark Reservation**: The Apache 2.0 license **strictly reserves trademark rights**. The names *"PocketGull"*, *"Pocket-Gull"*, *"Avian Navigator Tier"*, and associated visual logos remain protected intellectual property of PocketGull LLC and may not be used without prior written authorization.
* **Limitation of Liability & AS-IS Warranty**: The software is provided "AS IS", without warranties or conditions of any kind.

---

## 2. Clinical Datasets License: Creative Commons Attribution 4.0 (CC-BY-4.0)
All curated clinical datasets, DPO preference pairs ([`pocketgull-nih-who-clinical-dpo`](https://huggingface.co/datasets/philgear/pocketgull-nih-who-clinical-dpo)), and multi-turn instruction corpora ([`pocketgull-clinical-instruction-corpus`](https://huggingface.co/datasets/philgear/pocketgull-clinical-instruction-corpus)) are licensed under the **Creative Commons Attribution 4.0 International (CC-BY-4.0)** license.

### Key Provisions:
* **Attribution Requirement**: Any downstream model, derivative dataset, academic publication, or commercial application utilizing these datasets MUST provide appropriate credit to:
  > *Gear, Phillip (2026). PocketGull Clinical Intelligence Suite & NIH/WHO Datasets. Zenodo / Hugging Face. DOI: 10.5281/zenodo.20647514.*
* **Open Science & Level A Provenance**: Derived from NIH (US Public Domain under 17 U.S.C. § 105) and WHO (CC-BY-4.0 IGO) consensus publications.

---

## 3. Statutory Regulatory & Clinical Disclaimers

### A. FDA 21 CFR § 520(o) Non-Device Clinical Decision Support (CDS) Notice
This software is a supportive educational and administrative Clinical Decision Support (CDS) tool. In accordance with Section 520(o)(1)(E) of the 21st Century Cures Act and FDA CDS Guidance:
1. The software is intended for use by qualified healthcare professionals and health literacy education.
2. The software provides evidence-grounded recommendations with explicit literature citations (NIH MedQuAD, WHO mhGAP) and does not perform autonomous primary diagnosis or direct treatment execution.
3. Healthcare professionals must exercise independent clinical judgment before ordering any medication, lab test, or clinical procedure.

### B. HIPAA § 164.514 Safe Harbor De-Identification Warranty
1. All training data, evaluation benchmarks, and mock clinical profiles strictly exclude all 18 categories of Direct and Indirect Identifiers specified under **45 CFR § 164.514(b)(2)**.
2. The software architecture enforces client-side edge computing (WebGPU / WebLLM) to prevent Protected Health Information (PHI) network egress.

### C. Institute for Safe Medication Practices (ISMP) Decimal Standard
All generated clinical orders, dosages, and titrations enforce strict ISMP high-risk medication safety guidelines:
* Prohibits trailing zeros (e.g., `5 mg`, NEVER `5.0 mg`) to eliminate 10-fold overdose misinterpretations.
* Mandates leading zeros on naked decimals (e.g., `0.5 mg`, NEVER `.5 mg`).

---

## 4. Citation & Reference
```bibtex
@software{pocketgull_suite_2026,
  author = {Gear, Phillip},
  title = {Pocket-Gull: Sovereign Multi-Paradigm Clinical Intelligence Engine},
  publisher = {Zenodo},
  year = {2026},
  version = {1.31.0},
  doi = {10.5281/zenodo.20647514},
  url = {https://pocketgull.app}
}
```
