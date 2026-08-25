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
---

# 🕊️ PocketGull Gemma 3 HIPAA Safe Harbor & Clinical Integrity Sentinel

**Organization**: [PocketGull LLC](https://pocketgull.com) (Oregon Registry: 258869891)  
**Informatics Lead**: Phillip Gear (CMS NPI: 1487569752 | ORCID: [0009-0008-1372-5381](https://orcid.org/0009-0008-1372-5381))  
**Base Foundation Model**: \`google/gemma-3-4b-it\`  
**Discipline**: Clinical Data Integrity & HIPAA De-Identification  
**Open Science Provenance**: [Zenodo DOI 10.5281/zenodo.20647514](https://doi.org/10.5281/zenodo.20647514)  

---

## 📌 Overview
Audits HIPAA §164.514 Safe Harbor de-identification, dual-custody verification, and prompt injection defense.

This LoRA adapter was fine-tuned using Direct Preference Optimization (DPO) on domain-specific clinical datasets conforming strictly to **HIPAA §164.514 Safe Harbor** de-identification standards.

---

## 🚀 Quickstart Inference (Transformers & PEFT)

```python
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

base_model_id = "google/gemma-3-4b-it"
adapter_id = "pocketgull-llc/gemma-3-hipaa-tamper-sentinel"

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
