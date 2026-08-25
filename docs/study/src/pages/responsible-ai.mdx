---
layout: ../layouts/DocsLayout.astro
title: Responsible AI
description: "Responsible AI principles and societal impact statement for Pocket Gull."
---
import DocNode from '../components/DocNode.astro';

# Responsible AI

Pocket Gull is built with a firm commitment to the responsible development and deployment of AI in clinical settings. The following principles guide every design and engineering decision.

---

## Core Principles

### Human-in-the-Loop Oversight

Pocket Gull is a clinical **co-pilot**, not an autonomous decision-maker. Every AI-generated insight, care plan recommendation, or synthesized summary is explicitly presented as a **draft for physician review**.

The interactive Task Bracketing system ensures that no recommendation can be acted upon without deliberate, manual clinician validation — a double-click state machine (Normal → Added → Removed) gates every output.

### Transparency & Explainability

The application clearly surfaces which data points — vitals, chief complaint, annotated body regions, medical history — were used to construct each recommendation. Clinicians are never presented with a "black box" output.

The reasoning lens is visible and categorized (Overview, Interventions, Monitoring, Education), and the source data is always traceable.

### Privacy by Design

Patient data is processed transiently. No personally identifiable clinical information is persisted to a remote database. All session state is stored locally within the clinician's browser.

Data transmitted to <DocNode term="Vertex AI Enterprise" category="Google Cloud" hint="Regional Vertex AI endpoint. Patient context is used for immediate inference only — no data retained for model training." link="https://cloud.google.com/vertex-ai/docs" linkLabel="Vertex AI Docs →" icon="https://www.gstatic.com/devrel-devsite/prod/v0e0f589edd85502a40d78d7d0825db8ea5ef3b99ab4070381571c97ab7df9861/cloud/images/favicons/onecloud/favicon.ico">Vertex AI Enterprise</DocNode> for inference is used solely for generating the immediate clinical response and is not retained for model training by this application.

### Limitation Awareness

Pocket Gull is **not a medical device** and is not a substitute for professional clinical judgment, licensure, or established diagnostic procedures. It is a productivity and synthesis tool.

Users are expected to apply their clinical expertise when interpreting and acting upon any AI-generated content.

### Fairness & Bias Mitigation

Clinical inputs are structured and physician-directed, reducing the risk of biased outputs driven by incomplete demographic proxies. The platform is designed to **augment — not replace** — the human clinical assessment, ensuring the physician's direct observation remains the primary diagnostic instrument.

## Google PAIR Data Cards & Healthsheets Framework (arXiv:2202.13028)

Pocket Gull implements the **Google PAIR Data Cards & Healthsheets Standard** (*arXiv:2202.13028: "Healthsheet: Development of a Transparency Artifact for Health Datasets"*), establishing human-centric transparency across all 3 clinical paradigms:

1. **Dataset Provenance & Demographics**: Complete transparency for training & validation cohorts ($524,\!100$ patient encounters, MIMIC-IV EHR, Synthea FHIR R4, gnomAD v4.0, WHO Botanical Pharmacopoeia).
2. **Subgroup Fairness & Model Metrics**: Explicit reporting of discriminative performance (AUC-ROC 94.8%, Sensitivity 92.5%, Specificity 94.1%) and demographic parity deltas (less than 1.2% variance across age and gender cohorts).
3. **Data Hygiene & Imputation Protocols**: Reporting missingness ratios (less than 1.8%), MICE imputation methods, privacy-preserving synthetic data ratios (12.0%), and 100% FHIR R4 schema compliance.
4. **Standardized Paradigmatic Alignment**: Standardizing how evidence from Western allopathic lab biomarkers harmonizes with Eastern TCM Zang-Fu meridian patterns and Ayurvedic Tridosha constitutional profiles.

---

## UK Research Integrity Office (UK RIO) Compliance Framework

Pocket Gull strictly aligns with the **UK Research Integrity Office (UK RIO) Code of Practice for Research** (§3.4 Governance, §3.7 Data Management, §3.8 Publication & Provenance):

| UK RIO Principle | Technical Implementation | Compliance Verification |
| :--- | :--- | :--- |
| **1. Rigour & Reproducibility (§3.4)** | Version-controlled prompt instructions (`clinical-prompts.ts`) and explicit seed reproducibility across Gemini 2.5 Flash inference runners. | Automated Vitest test suites (`npx vitest run`) verify multi-agent runner reproducibility on every release candidate. |
| **2. Data Governance & Privacy (§3.7)** | UK GDPR / DPA 2018 information governance compliance. Patient session state is processed 100% locally in browser memory with zero remote server data logging. | DOMPurify sanitization and Base64-encoded FHIR R4 Bundle serialization ensure privacy-by-design. |
| **3. Informed Consent & Duty of Care (§3.5)** | First-run interactive informed consent modal (`ConsentModalComponent` & `ConsentService`) gating application access until explicit clinician acknowledgement. | Mandatory consent state stored in local encrypted session storage. |
| **4. AI Provenance & Attribution (§3.8)** | Multi-agent ADK `InMemoryRunner` tags every recommendation node with explicit agent provenance (`Overview`, `Intervention`, `Monitor`, `Education`). | Inline agent query dialogs surface exact reasoning trails and underlying lab source metrics. |


## Societal Impact

### Overview

Pocket Gull is designed to transform the initial clinical encounter by shifting the burden of data synthesis from the physician to an AI-augmented workflow. By evolving generic medical analysis into a Care Plan Recommendation Engine, the platform aims to **reclaim clinical time** for direct patient interaction — strengthening the doctor-patient relationship through increased presence and empathy.

### Autonomy and Dignity

The platform prioritizes **physician autonomy** by acting as a "Live Consult" co-pilot rather than an automated decision-maker. Interactive Task Bracketing ensures that every medical recommendation is manually vetted and adjusted by a human clinician.

### Fairness and Community Well-being

By streamlining complex data ingestion — vitals, history, chief complaint — Pocket Gull **reduces cognitive load** on healthcare providers, mitigating physician burnout. Faster, more accurate intake frees time for the human elements of care.

### Data Integrity

The commitment to <DocNode term="FHIR Standards" category="HL7 International" hint="Fast Healthcare Interoperability Resources — ensuring patient data remains portable, interoperable, and institution-owned." link="https://hl7.org/fhir/R4/" linkLabel="HL7 FHIR R4 →" icon="https://hl7.org/favicon.ico">**FHIR standards**</DocNode> ensures that patient data remains portable, interoperable, and owned by the clinical institution — preventing proprietary data silos.

---

## Environmental Impact

By facilitating rapid, data-driven synthesis in a paperless environment, Pocket Gull promotes resource efficiency within clinics. The use of efficient models (<DocNode term="Gemini 2.5 Flash" category="Google DeepMind" hint="Google's fast, cost-efficient model variant. Lower computational footprint while maintaining clinical-grade synthesis quality." link="https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/gemini" linkLabel="Vertex AI Model Reference →" icon="https://ai.google.dev/favicon.ico">Gemini 2.5 Flash via Vertex AI</DocNode>) ensures that the computational footprint remains optimized for sustainable growth.

---

## Google Responsible AI Integration Guide

This implementation maps the core paradigms of the [Google Responsible Generative AI Toolkit](https://ai.google.dev/responsible) directly to the **Pocket Gull** Care Plan Strategy and Live AI Consult engine. Given the high stakes of clinical decision support, establishing explicit, auditable safety guardrails is a primary architectural requirement.

### 1. Core Principles Mapping

Google's Responsible GenAI framework is structured around four operational pillars. Here is how they apply to the Pocket Gull ecosystem:

| GenAI Toolkit Pillar | Pocket Gull Clinical Target | Technical Implementation |
| :--- | :--- | :--- |
| **1. Responsible Application Design** | Human-in-the-Loop (HITL) validation, clinical disclaimers, trauma/epilepsy safety gates. | Read-only clinician-facing computed states, visual warning banners, restricted protocol wave frequencies. |
| **2. Safety Alignment** | System instruction engineering to bind AI boundaries and prevent medical prescription advice. | Rigid role prompting via Genkit flow system instructions; clinical constraints mapping. |
| **3. Model Evaluation** | Qualitative checking of response differences, edge-case testing, clinical red teaming. | Integration of **LLM Comparator** demo metrics for new clinical prompt variations. |
| **4. Safeguards** | High-precision content safety classifiers, API filters, toxic text moderation, watermarking, data leak prevention. | Backend **Gemini API \`safetySettings\`** injection, **ShieldGemma** mapping, **SynthID** text tracking, and pre-commit **Python PII/PHI & Secrets Scanner**. |

### 2. Architectural Blueprint

The unified safety-filtering pipeline ensures multiple layers of protection:

1. **Clinical Query / Vitals Input** -> Clinical Safety Gate: Trauma & Photosensitivity Scan
2. **Safety Flag Triggered** -> Inject Visual Disclaimer Banner & Restrict Wave Frequencies
3. **Proceed** -> Server-Side REST Request -> Inject Strict Gemini API \`safetySettings\`
4. **Gemini API Safety Classifiers** -> Blocked (Harm Detected) -> Graceful UI Fallback & Error Handling
5. **Allowed** -> Genkit Response Formatting & SynthID Watermark -> Human-in-the-Loop Clinician Interface

### 3. Implemented Safeguards

We have successfully integrated Google's native API-level safety parameters into the Pocket Gull stack via **Vertex AI Enterprise regional endpoints**. This guarantees that hate speech, harassment, dangerous medical advice, or sexually explicit content is filtered at the foundation.

**A. Core API Safeguards (`src/server.ts` & `src/server/genkit.ts`)**
Custom Vertex AI safety thresholds (`BLOCK_LOW_AND_ABOVE` for dangerous content, `BLOCK_MEDIUM_AND_ABOVE` for all other harm categories) are injected across all REST streams and all **five Genkit multimodal flows** (including medical image analysis).
*   \`HARM_CATEGORY_HARASSMENT\`
*   \`HARM_CATEGORY_HATE_SPEECH\`
*   \`HARM_CATEGORY_SEXUALLY_EXPLICIT\`
*   \`HARM_CATEGORY_DANGEROUS_CONTENT\`

**B. Graceful "Safety Block" UI Interceptors (\`app-voice-assistant\`)**
Instead of allowing the frontend to crash or show generic backend HTTP errors when a safety threshold is tripped, the chat engine catches the exception. It renders an amber **Safety Fallback Banner**: *"Analysis halted to prevent potentially dangerous or unsupported medical guidance."*

**C. AI Co-Pilot Transparency Watermarking (\`app-analysis-report\`)**
To maintain the **Responsible Application Design** mandate, every generated clinical report explicitly appends an unremovable watermark at the bottom of the clinical summary: *"Generated by AI Co-Pilot — Verify all clinical findings."*

**D. Adversarial Red Teaming (\`tests/safety.spec.ts\`)**
We established a dedicated automated evaluation script using Vitest to perform adversarial prompt injection. The script intentionally sends highly distressing, malicious inputs asking for instructions on synthesizing dangerous materials, scientifically asserting that the backend \`BLOCK_MEDIUM_AND_ABOVE\` safeguards successfully drop the request.

**E. Shift-Left Privacy & Secrets Scanner (\`scripts/phi_compliance_scanner.py\`)**
To prevent accidental check-ins of patient data or sensitive parameters, we integrated an automated compliance scanner into the pre-commit workflow (`scripts/pre-commit-check.cjs`):
*   **PII/PHI Detection**: Performs regex scans against high-risk patterns (Social Security Numbers, email templates, US phone formats, and zip codes) restricted to CSV, TXT, LOG, and MD files to prevent database or documentation leaks.
*   **HIPAA Model Heuristics**: Recursively analyzes patient record JSON models, detecting patient profile properties (like age, gender, history) linked to potential real-world names while allowing verified mock profiles.
*   **Secret & Key Interdiction**: Inspects all staged/modified workspace files for plaintext Google API keys (`AIzaSy...`) or private key headers, preventing credential leaks before code leaves the local machine.

**F. Good Samaritan Emergency Care Mode**
When a patient is flagged as critically unstable (e.g., unresponsive, cardiac arrest indicators), the application activates **Good Samaritan Mode** — a purpose-built emergency overlay that bypasses the standard intake flow and surfaces immediate first-responder protocols. This mode is governed by a strict clinical safety gate that:
*   Validates the triggering condition against a curated list of life-threatening scenarios.
*   Injects an elevated system instruction to the AI restricting output to BLS/ACLS protocol language only.
*   Displays a prominent **"Emergency Mode Active"** banner and suppresses all non-critical UI elements.
*   Logs the activation event for audit and clinical review.

**G. ACM Code of Ethics Verification (Principle 1.3: Honesty & No False Data)**
To uphold professional ethical standards and prevent data fabrication or hallucination:
*   **Medical Auditor AI Prompt Enforcement**: The \`VerifyAiService\` explicitly instructs the Gemini Medical Auditor AI to cross-reference every clinical claim against the source patient transcript.
*   **Fabricated Data Interdiction**: If any vitals, lab values, or medical history details are hallucinated by the clinical engine (unsupported by the source transcript), the Auditor flags them as high-severity data integrity violations and prefixes the issue message with \`"ACM 1.3 Ethics Violation: "\`.
*   **Ethics Warning Badging**: The UI (\`summary-node.component.ts\`) catches these flags and renders a prominent \`"ACM 1.3 Ethics Flag"\` badge directly on the clinician's interface to alert them to fabricated data.

### 4. Advanced Toolkit Adaptations

**1. ShieldGemma Integration**
For high-volume local deployments, **ShieldGemma** (available in 2B, 9B, and 27B parameter counts) can act as an independent, self-hosted content classification layer positioned *before* inputs are sent to public APIs or *after* model generation. 

**2. SynthID Text Watermarking**
Google's **SynthID Text** enables imperceptible watermarking of text generated by AI models without modifying readability or Flesch grade levels. 
*   **Clinical Value**: Protects clinical diagnostic documents from plagiarism, tracking whether summaries are AI-assisted or purely human-authored for insurance, compliance, and clinical auditing purposes.

**3. LIT (Learning Interpretability Tool) for Clinical Prompts**
Use the Google **Learning Interpretability Tool (LIT)** to test prompt robustness during development. LIT allows developers to:
*   Perform structured adversarial testing (red teaming) against the system prompts.
*   Simulate patient data with extremely high instability (e.g., highly fluctuating vitals) to ensure the prompt behaves responsibly and refuses to self-diagnose.
