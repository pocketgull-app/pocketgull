# PocketGull Clinical Intelligence Engine — Platform Architecture Codex

## Overview
PocketGull is an open-source real-time clinical intelligence engine, live multimodal diagnostic co-pilot, and patient state coordinator built on Google Gemini 2.5 Flash / Live audio streaming, on-device WebGPU Gemma 3 edge intelligence, Angular 22, and the FHIR R4 Bundle standard.

---

## 1. System Architecture

```mermaid
graph TD
    CLIENT["Angular 22 Standalone SPA / PWA<br/>• Angular Signals Reactive State<br/>• WebGPU / WebGL Three.js Hologram<br/>• WebGPU On-Device Gemma 3 Local Edge AI<br/>• 5 Business Site Natural Voice Personas (Aoede, Puck, Charon, Kore, Fenrir)"]
    
    SERVER["Express SSR & Microservices Gateway<br/>• Node.js v24 LTS (50MB Stream Headroom)<br/>• FHIR R4 Serialization & DOMPurify Sanitization<br/>• WebMCP Tool Catalog (/api/discovery/tools)"]
    
    AI_LAYER["Clinical Intelligence & Agent Swarm Layer<br/>• Gemini 2.5 Flash / Live Full-Duplex Audio<br/>• Genkit Clinical Reasoning Engine<br/>• 78 Dynamic WebMCP Clinical CDS Tools"]

    SIDECAR["Python FastAPI Sidecar & ML Triage<br/>• RSNA Knee & Multi-Organ MRI Scoring<br/>• Pydantic v2 Strict Validation<br/>• Scikit-Learn / PyTorch Inference"]

    CLIENT <--> SERVER
    SERVER <--> AI_LAYER
    SERVER <--> SIDECAR
```

---

## 2. Core Clinical Principles & Epistemology

### 2.1 Popperian Null-Hypothesis ($H_0$) Testing
Every clinical decision support (CDS) recommendation evaluates the null hypothesis ($H_0$: no difference between intervention and placebo/standard-of-care). If $p \ge 0.05$, PocketGull issues an explicit warning disclosing unrejected null hypotheses to prevent clinical overconfidence.

### 2.2 Cochrane Risk of Bias (RoB 2)
Literature citations are automatically scored across five bias domains:
1. Randomization process
2. Deviations from intended interventions
3. Missing outcome data
4. Measurement of the outcome
5. Selection of reported results

### 2.3 HIPAA §164.514 Safe Harbor De-Identification
All patient state, consult transcripts, and serialized FHIR payloads strip all 18 direct identifiers. String fields are sanitized via DOMPurify to eliminate XSS/SSRF vulnerabilities.

---

## 3. Dynamic WebMCP Tool Architecture (78 Registered Tools)

PocketGull registers **78 native WebMCP agentic tools** directly on the browser `modelContext`, providing autonomous LLM agents with verifiable clinical capabilities:

* **Diagnostic & Tri-Paradigm Synthesis**: Hegelian dialectics, Matt Might precision algorithm, and rare disease triage.
* **Maternal & Women's Health**: 4th-trimester ACOG AIM postpartum sentinel, INOCA cardiac atypical ischemia, and endometriosis delay reducer.
* **Geriatric & Intergenerational Health**: Transgenerational Resilience Index (TRI), grandmother longevity genetics, and Oslerian bedside gestalt.
* **Youth & Trainee Scaffolding**: Digital dopamine load reset, Kaplan Attention Restoration nature intervals, and medical student diagnostic safety nets.
* **Clinical Social Work**: Automated SDoH ICD-10 Z-codes (`Z59.0`, `Z59.41`, `Z59.87`, `Z63.6`) and Zarit Caregiver Burden respite scoring.
* **Future Planning**: 10/20/30-year multi-decade healthspan forecasting, values-based advance care directives (POLST/MOLST), and FHIR R4 `Consent`.
* **Hardware & Biometrics**: Web Bluetooth GATT biometric streaming (0x180D Heart Rate / HRV RMSSD), Apple Health XML ingestion, and Pharmacogenomics (PGx / CPIC Level A) drug-gene safety checks.
* **Brand & Creative Sovereignty**: Scale-to-zero AI Branding Package Generator (`generate_ai_branding_package`) producing WCAG 2.2 AAA palettes and SVG mascot vector assets.

---

## 4. API Endpoints & Discovery

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Telemetry, uptime, registered tool count, and HIPAA compliance probe. |
| `/api/discovery/tools` | `GET` | Schema.org WebMCP JSON-LD tool catalog for autonomous AI discovery. |
| `/api/discovery/status` | `GET` | WebGPU, WASM Edge AI, and system health status. |
| `/api/patients` | `GET`, `POST` | Resilient JSON file-backed patient roster sync with 50MB payload headroom. |
| `/api/billing/art-checkout` | `POST` | Fine art archival giclée print Stripe Checkout creator. |
| `/llms.txt` | `GET` | Standardized agent manifest for LLM context crawlers. |
| `/privacy-policy` | `GET` | HIPAA §164.514 de-identification and data sovereignty charter. |
| `/terms-of-service` | `GET` | Clinical Decision Support CDS legal and ethical terms. |

---

## 5. Security, Scale & Zero-Jank Mandates

* **Hardware Compositing**: Keyframes exclusively animate `transform: translate3d()` and `opacity` with `will-change: transform`.
* **Universal 48px Touch Target**: Minimum 48px $\times$ 48px hitboxes across all interactive controls.
* **Scale-to-Zero Cloud Run**: Google Cloud Run services scale to 0 instances when idle, minimizing idle cloud spend.
* **Artifact Lifecycle**: Automated 7-day retention policy (`olderThan: 604800s`, `keepCount: 3`) on Artifact Registry and GCS build buckets.
