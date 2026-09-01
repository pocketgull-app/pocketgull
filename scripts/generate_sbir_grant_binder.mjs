/**
 * 🏛️ PocketGull LLC — Automated NIH / NSF SBIR Phase I Grant Binder Generator
 * Assembles a complete, compliant $300,000 Phase I proposal binder grounded in
 * verified corporate credentials, open science DOI, and CMS NPI metadata.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const outputDir = path.join(rootDir, 'docs', 'grants');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const GRANT_BINDER_CONTENT = `# NATIONAL INSTITUTES OF HEALTH (NIH) / NSF SBIR PHASE I RESEARCH PROPOSAL
**Project Title**: Multi-Paradigm Sovereign Clinical Decision Support and Privacy-Preserving Ambient Scribing on Edge AI Architectures  
**Applicant Small Business**: PocketGull LLC (Oregon SOS Registry: 258869891 | EIN: 42-3162850)  
**Principal Investigator / Informatics Lead**: Phillip Gear (CMS NPI: 1487569752 | ORCID: 0009-0008-1372-5381)  
**Target Mechanism**: NIH SBIR Phase I (R43) / NSF Small Business Innovation Research (SBIR)  
**Total Phase I Budget Request**: $300,000.00 USD (12-Month Period of Performance)  
**Open Science & Prior Art Provenance**: Zenodo DOI 10.5281/zenodo.20647514  

---

## 1. PROJECT SUMMARY & ABSTRACT
Physician burnout and clinical charting fatigue have reached critical levels across primary care and integrative medicine clinics, with practitioners spending over 1.8 hours nightly on Electronic Health Record (EHR) documentation. Furthermore, existing centralized cloud AI solutions introduce significant privacy risks, latency bottlenecks, and HIPAA compliance hurdles.

**PocketGull LLC** proposes to develop and validate a **zero-cloud-egress clinical intelligence engine** that executes ambient clinical scribing, tri-paradigm diagnostic synthesis (Western Allopathic, Traditional Chinese Medicine, Ayurvedic), and rare disease genetic variant mapping (GA4GH Phenopackets v2) entirely on local browser hardware via WebGPU and fine-tuned Gemma 3 LoRA adapters.

In Phase I, we will:
1. Train and compress 11 domain-specific Gemma 3 LoRA adapters with Direct Preference Optimization (DPO).
2. Validate in-browser WebAssembly/WebGPU zero-latency execution against 100 benchmark clinical scenarios.
3. Conduct an empirical 30-day crossover clinical trial across 5 independent Direct Primary Care (DPC) practices.

---

## 2. SPECIFIC AIMS

### Aim 1: Multi-Paradigm Ambient Scribing with Clinical Lexical Precision
* **Objective**: Develop an ambient conversational acoustic parser converting unstructured patient-clinician dialogues into structured 4-quadrant SOAP notes, SBAR handoffs, and SNOMED/ICD-10 coded encounters.
* **Milestone**: Achieve $\ge 98.5\%$ clinical entity extraction F1-score and $<1.5\\text{s}$ chunk-to-SOAP latency without external cloud API transmission.

### Aim 2: On-Device Edge Inference & HIPAA §164.514 Safe Harbor Privacy Verification
* **Objective**: Implement client-side in-browser WebGPU inference for quantized Gemma 3 adapters with automated 18-element HIPAA Safe Harbor sanitization.
* **Milestone**: Zero byte network payload egress containing PHI across all simulated clinical consults, certified by automated entropy and egress monitors.

### Aim 3: Interoperability via GA4GH Phenopackets v2 & FHIR R4 Bundle Translation
* **Objective**: Construct bidirectional translational bridges converting patient state into GA4GH Schema v2.0 JSON payloads for Harvard Undiagnosed Diseases Network (UDN) and CTSA research hub ingestion.
* **Milestone**: 100% schema validation pass rate across LOINC, HPO, and FHIR R4 ResearchStudy endpoints.

---

## 3. RESEARCH STRATEGY & METHODOLOGY

### A. Significance & Unmet Need
Integrative and Direct Primary Care physicians routinely manage polypharmacy patients taking botanical supplements alongside potent prescription medications. Standard EHR systems lack cross-paradigm cytochrome P450 (CYP2D6, CYP2C19) herb-drug interaction screening. PocketGull provides an evidence-grounded RxGuard engine directly within the ambient scribe workflow.

### B. Innovation
* **Tri-Paradigm Spatial Modeling**: Procedural 3D WebGL anatomical rendering integrated directly with diagnostic scoring.
* **Sovereign Edge Computing**: Bypasses cloud egress latency and eliminates per-token API recurring costs for independent practices.
* **Open Science Standards**: All schemas and benchmarks dual-licensed under MIT and CERN OHL-S v2.

---

## 4. BUDGET JUSTIFICATION ($300,000 USD)

| Category | Allocation | Description |
| :--- | :--- | :--- |
| **Direct Labor (PI & Lead ML Engineer)** | $185,000.00 | 12 person-months engineering, LoRA fine-tuning, and clinical trials |
| **Clinical Trial Site Stipends (5 Clinics)** | $45,000.00 | Subject honoraria and practice manager workflow integration compensation |
| **Compute & Local Edge Hardware Nodes** | $35,000.00 | Local RTX 6000 Ada inference validation nodes and edge tablets |
| **Regulatory & Security Audits** | $20,000.00 | Independent third-party HIPAA Safe Harbor & SOC2 compliance verification |
| **Indirect / Operational Overhead** | $15,000.00 | Oregon corporate filings, accounting, and grant administration |
| **Total Requested Phase I Budget** | **$300,000.00** | |

---

## 5. CORPORATE CERTIFICATION & SIGNATURES

The undersigned authorized official certifies that PocketGull LLC is an eligible domestic small business under 13 CFR § 121.702 and that all statements contained in this proposal are true, complete, and accurate.

**Authorized Representative**:  
Phillip Gear  
Managing Member & Health Informatics Lead, PocketGull LLC  
Oregon SOS Registry: 258869891 | IRS EIN: 42-3162850  
CMS NPI: 1487569752 | ORCID: 0009-0008-1372-5381  
101 SW Madison St #1664, Portland, OR 97207 USA  
Date: August 21, 2026
`;

const outputPath = path.join(outputDir, 'SBIR_PHASE_I_POCKETGULL_PROPOSAL.md');
fs.writeFileSync(outputPath, GRANT_BINDER_CONTENT, 'utf8');

console.log('================================================================');
console.log('🏛️  POCKETGULL LLC — NIH / NSF SBIR PHASE I GRANT BINDER GENERATED');
console.log('================================================================\n');
console.log(`✅ Proposal Document: ${outputPath}`);
console.log(`✅ Applicant Entity: PocketGull LLC (Reg #258869891, EIN: 42-3162850)`);
console.log(`✅ PI Credentials: CMS NPI 1487569752 | ORCID 0009-0008-1372-5381`);
console.log(`✅ Requested Budget: $300,000.00 USD`);
console.log('\n----------------------------------------------------------------\n');
