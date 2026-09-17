---
language:
- en
license: apache-2.0
library_name: peft
tags:
- gemma-2
- lora
- clinical-nlp
- healthcare
- hipaa-safe-harbor
- open-science
- pocketgull
- nih-medquad
- who-mhgap
base_model: pocketgull/edge-densitometry-vision
pipeline_tag: text-generation
widget:
- text: "Perform 1D optical intensity profile scan across rapid antigen strip cassette: detect control line at index 75% and faint test line at index 42%. Return validity, optical ratio, and qualitative diagnostic status."
- text: "Construct HIPAA-compliant FHIR R4 Observation resource with SNOMED CT positive finding (10828004) and LOINC 94558-4 for SARS-CoV-2 rapid lateral flow surveillance."
---

# PocketGull Edge Lateral Flow & Biomarker Vision Scanner

**Organization**: [PocketGull LLC](https://pocketgull.com) (Oregon Registry: 258869891)  
**Informatics Lead**: Phillip Gear (CMS NPI: 1487569752 | ORCID: [0009-0008-1372-5381](https://orcid.org/0009-0008-1372-5381))  
**Base Foundation Model**: `pocketgull/edge-densitometry-vision`  
**Discipline**: Zero-Cloud Computer Vision Densitometry for Rapid Antigen & Salivary Strips  
**Open Science Provenance**: [Zenodo DOI 10.5281/zenodo.20647514](https://doi.org/10.5281/zenodo.20647514)  

---

## 📌 Overview
Low-cost point-of-care edge ML model that reads and quantifies rapid lateral flow immunoassay cassettes and salivary biomarker strips directly on smartphone cameras. Verifies control line validity (>0.18 OD), quantifies test-to-control optical density ratios, and outputs structured HL7 FHIR R4 Observation bundles (LOINC 94558-4) with zero cloud egress.

This LoRA adapter was fine-tuned using Direct Preference Optimization (DPO) on domain-specific clinical datasets conforming strictly to **HIPAA §164.514 Safe Harbor** de-identification standards.

---

## 🚀 Quickstart Inference (Transformers & PEFT)

```python
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

base_model_id = "pocketgull/edge-densitometry-vision"
adapter_id = "pocketgull-llc/pocketgull-lateral-flow-edge"

tokenizer = AutoTokenizer.from_pretrained(base_model_id)
base_model = AutoModelForCausalLM.from_pretrained(
    base_model_id,
    torch_dtype=torch.bfloat16,
    device_map="auto"
)
model = PeftModel.from_pretrained(base_model, adapter_id)

prompt = "Patient presents with palpitations taking St. John's Wort alongside Warfarin. Evaluate CYP450 metabolism."
inputs = tokenizer(prompt, return_tensors="pt").to("cuda")

with torch.no_grad():
    outputs = model.generate(**inputs, max_new_tokens=256, temperature=0.2)

print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

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
