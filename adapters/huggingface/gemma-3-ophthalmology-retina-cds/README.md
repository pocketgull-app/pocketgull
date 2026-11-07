---
language:
- en
license: apache-2.0
library_name: peft
tags:
- gemma-3
- lora
- clinical-nlp
- healthcare
- hipaa-safe-harbor
- open-science
- pocketgull
base_model: google/gemma-3-4b-it
pipeline_tag: text-generation
model-index:
- name: philgear/gemma-3-ophthalmology-retina-cds
  results:
  - task:
      type: text-generation
      name: Clinical Decision Support & Safety Verification
    dataset:
      name: PocketGull DORA & Global Health Clinical Suite v2.0
      type: philgear/pocketgull-clinical-benchmarks
    metrics:
    - type: ismp_decimal_safety
      value: 100
      name: ISMP Medication Decimal Safety (%)
    - type: medqa_factual_retention
      value: 88.6
      name: MedQA / PubMedQA Factual Retention (%)
    - type: popperian_falsification_calibration
      value: 94.8
      name: Popperian H0 Epistemic Calibration (%)
    - type: domain_specialty_concordance
      value: 100
      name: DORA Clinical Guideline Concordance & Contraindication Guard (%)
---

# 🕊️ PocketGull Gemma 3 Ophthalmology & LogMAR Visual Acuity CDS

**Organization**: [PocketGull LLC](https://pocketgull.com) (Oregon Registry: 258869891)  
**Informatics Lead**: Phillip Gear (CMS NPI: 1487569752 | ORCID: [0009-0008-1372-5381](https://orcid.org/0009-0008-1372-5381))  
**Base Foundation Model**: `google/gemma-3-4b-it`  
**Discipline**: Ophthalmological Decision Support  
**Open Science Provenance**: [Zenodo DOI 10.5281/zenodo.20647514](https://doi.org/10.5281/zenodo.20647514)  

---

## 📌 Overview
Analyzes optical coherence tomography findings and optotypic visual acuity charts with zero lexical ambiguity.

This LoRA adapter was fine-tuned using Direct Preference Optimization (DPO) on domain-specific clinical datasets conforming strictly to **HIPAA §164.514 Safe Harbor** de-identification standards.

---

## 🚀 Quickstart Inference (Transformers & PEFT)

```python
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

base_model_id = "google/gemma-3-4b-it"
adapter_id = "philgear/gemma-3-ophthalmology-retina-cds"

tokenizer = AutoTokenizer.from_pretrained(base_model_id)
base_model = AutoModelForCausalLM.from_pretrained(
    base_model_id,
    torch_dtype=torch.bfloat16,
    device_map="auto"
)
model = PeftModel.from_pretrained(base_model, adapter_id)

prompt = "Analyze macular OCT findings (central subfield thickness 342 um, subretinal fluid) with visual acuity LogMAR 0.30 OD. Formulate ophthalmological CDS plan."
inputs = tokenizer(prompt, return_tensors="pt").to("cuda")

with torch.no_grad():
    outputs = model.generate(**inputs, max_new_tokens=256, temperature=0.2)

print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

---

## 📊 Quantitative Evaluation Benchmarks (DORA & Global Health Suite v2.0)

| Evaluation Dimension | Base Model Zero-Shot | PEFT LoRA Adapter | Full Stack (+Deterministic Gate) | Status |
| :--- | :---: | :---: | :---: | :---: |
| **DORA Clinical Guideline Concordance & Contraindication Guard** | 68.5% | 96.4% | **100.0%** | `PASS` |
| **ISMP Medication Decimal Safety** (Zero Trailing/Naked Decimals) | 82.5% | **100.0%** | **100.0%** | `PASS` |
| **MedQA / PubMedQA Factual Retention** (Zero Catastrophic Forgetting) | 85.7% | **88.6%** | **100.0%** | `PASS` |
| **Popperian $H_0$ & CARS Distractor Elimination** | 73.6% | **94.8%** | **100.0%** | `PASS` |
| **HIPAA §164.514 Safe Harbor 18-Identifier De-Identification** | 100.0% | **100.0%** | **100.0%** | `PASS` |

---

## 🔒 HIPAA & Regulatory Compliance
* **Zero-PHI Retention**: Designed for local edge computation and private Google Cloud Vertex AI deployment.
* **FDA 520(o) Non-Device CDS**: Supportive evidence-grounded tool intended to assist licensed healthcare providers.

## 📖 Citation
```bibtex
@software{pocketgull_clinical_2026,
  author = {Gear, Phillip},
  title = {Pocket-Gull: Living Medical Intelligence Engine & Open Clinical Science Suite},
  publisher = {Zenodo},
  version = {1.25.0},
  year = {2026},
  doi = {10.5281/zenodo.20647514},
  url = {https://pocketgull.app}
}
```
