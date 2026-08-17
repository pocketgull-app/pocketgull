# Pocket Gull — Platform Documentation & Clinical Architecture

> Pocket Gull is a real-time medical Care Plan Strategy and Live AI Consult engine powered by Google Gemini and Vertex AI. It provides clinical intelligence, patient state management, and multimodal live streaming consults.

## Table of Contents
- [1. Overview & Capabilities](#1-overview--capabilities)
- [2. Multi-Paradigm Diagnostic Lenses](#2-multi-paradigm-diagnostic-lenses)
- [3. FHIR R4 & Interoperability](#3-fhir-r4--interoperability)
- [4. WebMCP Tool Registry for Browser Agents](#4-webmcp-tool-registry-for-browser-agents)
- [5. Edge AI & Privacy Architecture](#5-edge-ai--privacy-architecture)
- [6. API Endpoints](#6-api-endpoints)

---

## 1. Overview & Capabilities
Pocket Gull synthesizes biophysical sensor telemetry, ECG/PPG wave metrics, and multidimensional clinical guidelines into actionable care strategies.

Key modules include:
- **Real-Time Gemini Live Audio**: Sub-250ms voice triage and conversational clinical assistance over WebSockets.
- **Three.js WebGL 3D Anatomy**: Procedural bone, organ, and dermatome visualization with interactive lesion tagging.
- **Biometric Respiratory Analyzer**: 24-band FFT acoustic spectral analysis detecting wheezing, stridor, and cough patterns.
- **Continuous Glucose Monitoring (CGM)**: Glycemic Time-in-Range (TIR), Mean Glucose, and eA1c analysis.
- **FDI Odontogram**: Complete 32-tooth surface caries and periodontal charting linked to systemic cardiovascular health metrics.

---

## 2. Multi-Paradigm Diagnostic Lenses
Pocket Gull analyzes health data across specialized analytical perspectives:
1. **Summary Overview**: High-level differential diagnoses, vital sign summaries, and urgent triage priorities.
2. **Treatment Matrix**: First-line pharmacological options, contraindications, and drug-drug interaction warnings.
3. **Functional Protocols**: Mitochondrial support, gut microbiome restoration, and autonomic vagal tone training.
4. **Precision Nutrients**: Targeted micronutrient dosing, bio-availability factors, and chronobiology fasting schedules.
5. **PhysioNet Telemetry**: Machine learning-based arrhythmia detection, ECG QTc interval tracking, and sepsis risk scoring.
6. **Maternal & Postpartum**: Edinburgh Postnatal Depression Scale (EPDS) screener and lactation-safe medication references.
7. **Epigenetic Longevity**: Biological age estimation, DNA methylation risk markers, and cellular senescence reduction protocols.
8. **Teledentistry & Systemic Health**: FDI notation caries mapping, periodontal probing depth, and systemic inflammatory burden indexing.

---

## 3. FHIR R4 & Interoperability
All clinical data structures conform to the HL7 FHIR R4 standard:
- **Patient**: HIPAA §164.514 Safe Harbor de-identified demographic resource.
- **Observation**: Vital signs (LOINC `8867-4` Heart Rate, `85354-9` Blood Pressure, `2708-6` Oxygen Saturation), laboratory findings, and machine learning scores.
- **CarePlan**: Comprehensive goals, practitioner activities, and scheduled clinical assessments.
- **Bundle**: Fully structured, validated FHIR R4 transaction payloads ready for EHR integration (Epic, Cerner, AthenaHealth).

---

## 4. WebMCP Tool Registry for Browser Agents
Autonomous AI agents can inspect and execute tools via the WebMCP interface at `/api/webmcp/tools`:
- `get_patient_state`: Inspect active patient demographics, vitals, lab results, and reported symptoms.
- `update_patient_vitals`: Push updated biometric measurements.
- `generate_care_plan`: Request multi-paradigm clinical plan generation.
- `toggle_dermatome_layer`: Adjust 3D WebGL viewport and nerve layer visualization.
- `generate_specialist_handoff`: Serialize clinical state into an SBAR specialist referral summary.

---

## 5. Edge AI & Privacy Architecture
- **HIPAA Compliance**: Zero persistence of sensitive health identifiers; all patient state is processed ephemerally in Angular Signals and client-side memory.
- **Local Edge Triage**: On-device WebGPU / WebLLM models process heart rate optical sampling (rPPG) and initial triage without network egress.
- **Scale-to-Zero Cloud Infrastructure**: Google Cloud Run backend scales to zero instances when idle, minimizing energy consumption and operational costs.

---

## 6. API Endpoints
- `GET /health` — Service health check and uptime status.
- `GET /api/config` — Public application configuration and feature flags.
- `POST /api/billing/checkout` — Generate Stripe Checkout session for subscription tiers.
- `POST /api/billing/portal` — Access Stripe Customer Billing Portal.
- `GET /api/billing/gaap-ledger` — Real-time ASC 606 double-entry balance sheet and income statement.
- `GET /api/webmcp/tools` — WebMCP Tool registry for autonomous agent discovery.
- `GET /.well-known/agent.json` — Agent manifest and protocol declaration.
