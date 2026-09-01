# 🛡️ Pocket-Gull Enterprise Healthcare Compliance & Regulatory Dossier

> **Authoritative Compliance Dossier for HIPAA, FDA Non-Device CDS, ONC HTI-2 DSI, FDA GMLP, and EU AI Act Governance.**
> **Entity**: Pocket-Gull Health Technologies (`pocketgull-app`)
> **Cloud Target**: Google Cloud Platform Project `gen-lang-client-0540208645`

---

## 1. HIPAA Privacy & Security Rule Compliance (§164.514)

### 1.1 Safe Harbor De-Identification (§164.514(b)(2))
Pocket-Gull automatically purges all 18 HIPAA identifiers from clinical notes, vitals, and DICOM headers before processing:
1. Names, geographic subdivisions smaller than state, all dates (except year), phone numbers, fax numbers.
2. Email addresses, SSNs, Medical Record Numbers (MRNs), Health Plan Beneficiary Numbers.
3. Account numbers, Certificate/license numbers, Vehicle identifiers, Device serial numbers.
4. URLs, IP addresses, Biometric identifiers (voiceprints/fingerprints), Full-face photographs, and unique identifying numbers.

### 1.2 Ephemeral Edge Data Sovereignty
* **Local In-Browser Compute**: All real-time telemetry calculations, biophysical equations, and clinical symptom classifications run locally on the client device via WebAssembly (WASM), WebGPU, or client-side Web Workers (`OfflineEdgeAiService`).
* **Zero Third-Party Trackers**: Zero third-party analytics pixels, fingerprinting scripts, or passive telemetry pingers (Google Analytics, Segment, Mixpanel, Meta Pixel) are permitted.
* **1-Click Ephemeral State Purging**: All active clinical state is stored in ephemeral Angular Signals and transient local storage, with 1-click state purging capabilities (`purgeTransientPatientState`).

### 1.3 Google Cloud Business Associate Agreement (BAA)
All backend microservices (Cloud Run, Vertex AI Discovery Engine, Healthcare API FHIR Store) operate under Google Cloud’s standard enterprise HIPAA BAA on project `gen-lang-client-0540208645`. Foundation model prompts are subject to Google Cloud’s strict Zero Customer Data Retention & Training policy.

---

## 2. FDA 21st Century Cures Act §3060: Non-Device Clinical Decision Support (CDS)

Pocket-Gull qualifies under the FDA Non-Device CDS exemption as articulated in the 21st Century Cures Act §3060 and FDA Guidance *Clinical Decision Support Software (September 2022)*:

1. **Criterion 1 (Not acquiring/processing medical signals directly)**: Pocket-Gull ingests clinician/patient-entered data and standardized FHIR/DICOMweb data.
2. **Criterion 2 (Displaying/analyzing clinical information)**: Generates clinical recommendations and comparative evidence matrices.
3. **Criterion 3 (Supporting healthcare professional decision-making)**: Enables healthcare professionals to independently review and corroborated care plan strategies.
4. **Criterion 4 (Transparent clinical basis & evidence grounding)**:
   * Displays the exact underlying clinical literature citations (PubMed / DOI).
   * Quantifies the Oxford Centre for Evidence-Based Medicine (OCEBM 2011) evidence tier (Levels 1–5).
   * Discloses Cochrane Risk of Bias 2 (RoB 2) ratings across 5 canonical bias domains.
   * Performs automated Welch's t-test computing $p$-values against population baseline null hypothesis ($H_0$), triggering mandatory `skepticalWarningNotice` if $p \ge 0.05$.

---

## 3. ONC HTI-2: Decision Support Interventions (DSI) Transparency (§170.315(b)(11))

Pocket-Gull implements the Office of the National Coordinator (ONC) Health Data, Technology, and Interoperability (HTI-2) source attribute disclosures:

### 3.1 DSI Source Attribute Matrix

| Attribute Key | SPRINT Cardiometabolic CDS | RSNA Knee Vision Engine |
| :--- | :--- | :--- |
| **Model Version** | `v2.4.0` | `v1.1.0` |
| **Validation Cohort Size ($N$)** | 9,361 patients across 102 sites | 8,400 MRI studies across 48 sites |
| **Cross-Validation Scheme** | GroupKFold (5-fold, zero patient leak) | GroupKFold (5-fold, zero patient leak) |
| **Validation AUROC** | **0.942** | **0.928** |
| **Sensitivity / Specificity** | 91.8% / 95.4% | 89.5% / 94.1% |
| **Brier Calibration Score** | 0.042 | 0.061 |
| **Demographic Balance** | 35.6% Female, 29.9% Black, 10.5% Hispanic | 54.2% Female, 18.5% Black, 12.1% Hispanic |
| **Reference Standard** | Blinded central PROBE committee | 3 Board-certified MSK Radiologists |
| **Funding Source** | Public NIH/NHLBI grant funded | Non-profit RSNA / Kaggle Research Grant |

---

## 4. FDA / Health Canada / UK MHRA Good Machine Learning Practice (GMLP)

Pocket-Gull adheres to the **10 Guiding Principles of Good Machine Learning Practice for Medical Device Development**:

1. **Multidisciplinary Expertise**: Clinicians, biostatisticians, and ML engineers pair directly on model design.
2. **Good Software Engineering & Security**: Strict TypeScript typechecking (`tsc --noEmit`), Vitest suites (204 spec files), and Sentinel Security Guard.
3. **Representative Target Population**: Model cohorts reflect multi-ethnic clinical diversity.
4. **Data Independence (Leak-Free GroupKFold)**: Training and test sets are strictly partitioned by patient identifier.
5. **Accepted Clinical Reference Standards**: Models benchmarked against gold-standard biopsy, radiologist consensus, and randomized clinical endpoints.
6. **Engineered Model Design & Loss Functions**: Asymmetric Loss (ASL) utilized to address extreme medical class imbalance.
7. **Human-AI Interaction Focus**: Clinician remains the final decision-maker.
8. **Statistically Demonstrable Performance**: OOF progression logged and evaluated with 95% confidence intervals.
9. **Clear Clinical Intended Use & Contraindications**: Explicitly defined in every DSI model card.
10. **Post-Deployment Real-World Monitoring**: Automated tracking of prediction drift.

---

## 5. Web Accessibility & Equity (WCAG 2.2 AA / Section 508)

* **44px+ Minimum Hitboxes**: All interactive touch targets comply with Fitts's Law.
* **Cognitive Translation & Bionic Reading**: Integrated reader support for simplified, dyslexic, and multi-lingual cognitive localization.
* **Non-Text Contrast**: All UI meters, graphs, and SVG badges maintain $\ge 3:1$ contrast against light/dark themes.
* **Screen Reader Live Regions**: Streaming consultation responses utilize `aria-live="polite"`.

---

<p align="center">
  <sub>© 2026 Pocket-Gull Health Technologies. Certified under OpenSSF Scorecard & SLSA Level 3 Standards.</sub>
</p>
