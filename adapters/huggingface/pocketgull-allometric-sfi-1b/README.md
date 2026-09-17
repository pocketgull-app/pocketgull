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
- nih-medquad
- who-mhgap
base_model: google/gemma-3-1b-it
pipeline_tag: text-generation
widget:
- text: "Pediatric patient 12 kg prescribed Amoxicillin: compare WBE fractal clearance (M^0.75), naive linear per-kg scaling, and vascular transit time scale (M^0.25)."
- text: "Analyze 30-point continuous cardiac telemetry: compute rolling lag-1 autocorrelation (rho_1), rolling variance, resilience recovery rate lambda, and tipping point acuity tier."
- text: "Patient on Oxybutynin 10mg, Topiramate 50mg, and Lisinopril 20mg in Phoenix 114°F heat (WBGT 91°F): compute multi-body simplicial hyperedge risk and attractor basin state."
---

# PocketGull SFI Complex Adaptive Systems & Allometric Posology

**Organization**: [PocketGull LLC](https://pocketgull.com) (Oregon Registry: 258869891)  
**Informatics Lead**: Phillip Gear (CMS NPI: 1487569752 | ORCID: [0009-0008-1372-5381](https://orcid.org/0009-0008-1372-5381))  
**Base Foundation Model**: `google/gemma-3-1b-it`  
**Discipline**: West-Brown-Enquist (WBE) Fractal Hydrodynamics, Critical Slowing Down (CSD), and Polypharmacy Hypergraphs  
**Open Science Provenance**: [Zenodo DOI 10.5281/zenodo.20647514](https://doi.org/10.5281/zenodo.20647514)  

---

## 📌 Overview
Complex systems clinical engine developed in alignment with theoretical frameworks from the Santa Fe Institute and the ASU-SFI Center for Biosocial Complex Systems. Replaces naive linear (mg/kg) dosing with West-Brown-Enquist (WBE) M^0.75 fractal branching hydrodynamic network scaling. Detects physiological Critical Slowing Down (CSD) through lag-1 autocorrelation inflation (rho_1 -> 1) 2-48 hours before clinical collapse. Models non-linear simplicial hyperedge cascades across polypharmacy regimens and extreme environmental heat.

This LoRA adapter was fine-tuned using Direct Preference Optimization (DPO) on domain-specific clinical datasets conforming strictly to **HIPAA §164.514 Safe Harbor** de-identification standards.

---

## 🚀 Quickstart Inference (Transformers & PEFT)

```python
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

base_model_id = "google/gemma-3-1b-it"
adapter_id = "pocketgull-llc/pocketgull-allometric-sfi-1b"

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
