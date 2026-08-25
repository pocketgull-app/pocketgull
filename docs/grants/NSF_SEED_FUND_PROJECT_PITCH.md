# NSF America's Seed Fund (SBIR Phase I) — Official Project Pitch
**Company**: PocketGull LLC (Portland, Oregon)  
**Target Topic**: Artificial Intelligence (AI) / Biomedical Technologies (BM)  
**Portal**: https://seedfund.nsf.gov/apply/project-pitch/  
**Total Phase I Funding Target**: $305,000.00 USD (Non-Dilutive Grant)  
**PI / Contact**: Phillip Gear (Health Informatics Lead, CMS NPI: 1487569752, ORCID: 0009-0008-1372-5381)

---

## Field 1: The Technical Innovation (Word Count: ~420 / 500 max)

Physician burnout driven by administrative electronic health record (EHR) documentation has reached crisis levels, with outpatient clinicians spending upwards of two hours nightly typing clinical notes. Current commercial AI scribing solutions rely on centralized cloud inference architectures, which introduce severe latency bottlenecks, per-token cloud API cost structures, and substantial privacy risks regarding Protected Health Information (PHI) transmission under HIPAA §164.514.

PocketGull LLC has developed a breakthrough, zero-cloud-egress ambient clinical intelligence platform. Our technical innovation rests on three core advances:

1. **Client-Side Edge AI Quantization & WebGPU Scribing**:
   Rather than transmitting raw patient audio or transcripts to remote servers, PocketGull executes domain-adapted Small Language Models (Gemma 3 and Qwen 2.5 LoRA adapters) directly inside standard browser runtimes and local edge workstations via WebGPU and WebAssembly (WASM). This achieves instant conversational transcription and note generation with zero recurring server API costs and zero external data egress.

2. **Multi-Paradigm Reasoning & Botanical Cross-Interaction Guard**:
   Existing scribes only output standard allopathic text without drug safety context. PocketGull integrates standard Western allopathic diagnostic ontologies (ICD-10, SNOMED-CT) with evidence-grounded integrative medicine (botanical pharmacopeia and cytochrome P450 herb-drug metabolic interaction screening, e.g., St. John’s Wort CYP3A4 inductions) directly into the generated SOAP note and care plan.

3. **Autonomous HIPAA Safe Harbor De-Identification Sentinel**:
   The edge architecture embeds real-time local entropy analysis and 18-element HIPAA Safe Harbor automated redaction before any optional EHR synchronization or research export occurs, guaranteeing complete mathematical isolation of clinical data.

---

## Field 2: The Technical Objectives & Challenges (Word Count: ~440 / 500 max)

The primary technical challenge is achieving high clinical entity extraction accuracy ($>98\%$ F1-score across medical terminology) within the strict compute and memory constraints of local consumer and clinical workstation hardware ($<4\text{ GB}$ VRAM footprint).

In the Phase I R&D project, PocketGull will execute three rigorous technical objectives:

* **Objective 1: Model Compression & SFT/DPO Adapter Optimization**
  We will fine-tune and 4-bit/8-bit quantize domain-specialized LoRA adapters on high-fidelity clinical conversation datasets (spanning orthopedics, cardiovascular telemetry, and integrative primary care). We will evaluate token accuracy, clinical perplexity, and reasoning coherence using Direct Preference Optimization (DPO) to minimize medical hallucinations.
  * *Success Metric*: Clinical entity extraction F1-score $\ge 98.5\%$ and chunk-to-SOAP generation latency $<1.5\text{ seconds}$ running on local CPU/GPU hardware.

* **Objective 2: Zero-Egress Network Sentinel Verification**
  We will construct an automated dynamic egress firewall test suite that monitors all WebSocket, fetch, and HTTP network requests during active exam room recording.
  * *Success Metric*: Empirical verification of 0.00 bytes of audio or unencrypted text transmitted over external networks across 1,000 simulated clinical encounters.

* **Objective 3: Clinical Feasibility & Usability Trial**
  We will deploy PocketGull across a 30-day crossover pilot with 5 independent Direct Primary Care (DPC) and integrative clinics in Oregon, benchmarking total charting time saved per encounter and clinician Net Promoter Score (NPS).
  * *Success Metric*: Statistically significant $\ge 40\%$ reduction in same-day EHR documentation time ($p < 0.01$).

---

## Field 3: The Market Opportunity & Commercialization (Word Count: ~390 / 500 max)

The addressable market for clinical documentation and AI scribing in the United States exceeds $12.8B annually. While large hospital networks are courted by expensive enterprise cloud solutions (costing $400–$800/month per provider with multi-month sales cycles), over 250,000 independent outpatient clinicians, Direct Primary Care (DPC) physicians, and integrative practitioners are actively underserved and priced out.

**Commercialization Strategy**:
* **Go-To-Market (B2B SaaS / Local-First)**:
  * **Solo Clinician Tier ($0 / Forever Free)**: Community on-device version driving viral bottom-up clinician adoption and workflow lock-in.
  * **Clinic Pro ($49 / provider / month)**: Self-serve checkout offering custom specialty templates, automated herb-drug interaction alerts, and EHR clipboard integration.
  * **Health System Tier ($299 / month / site)**: SMART-on-FHIR R4 enterprise connectors and localized compliance audits.
* **Cost Advantage**: Because PocketGull offloads 100% of LLM inference compute to the clinician’s own hardware via WebGPU, our gross margins exceed **94%**, compared to cloud-bound competitors whose margins are eroded by massive cloud GPU inference bills.

---

## Field 4: The Company & Team (Word Count: ~210 / 250 max)

**PocketGull LLC** is an Oregon-registered health informatics enterprise (SOS: 258869891, EIN: 42-3162850) based in Portland, Oregon.

* **Phillip Gear (Founder & Principal Investigator)**:
  Health Informatics Lead with active CMS National Provider Identifier (NPI: 1487569752) and registered researcher credentials (ORCID: 0009-0008-1372-5381). Lead architect of the PocketGull sovereign WebGPU clinical runtime, open science Zenodo DOI (10.5281/zenodo.20647514), and full-stack FHIR R4 data pipelines.
* **Clinical Advisory Network**:
  Collaborating with osteopathic physicians (DO), integrative practitioners, and primary care directors across Oregon to guide prompt safety, ontology alignment, and human-in-the-loop validation.
