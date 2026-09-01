# Privacy Policy & Clinical Data Sovereignty

At **PocketGull LLC**, clinical privacy, data sovereignty, and HIPAA compliance are our highest invariants. This policy outlines how health data is handled, de-identified, and protected across all web, mobile, and API surfaces.

---

## 1. Local-First Persistence (No Centralized PHI Database)
We do not persist Protected Health Information (PHI) or Personally Identifiable Information (PII) to any remote database. All patient data, vitals, history details, and clinical reports reside strictly in your browser's local storage, IndexedDB, or on-device encrypted SQLite. Clearing local storage instantly purges all active records.

## 2. Ephemeral AI Transit Processing (Zero Model Training)
To provide clinical consults, intake summaries, and care plan strategies, transient patient details are processed via Google Gemini API or Vertex AI Enterprise endpoints:
*   All data transmitted to API endpoints is strictly ephemeral.
*   Data is processed strictly in transit and is **never** used to train, optimize, or refine foundational LLM weights.
*   Outbound requests carry cryptographic Zero-Data-Retention (`X-ZDR-Attestation: enabled`) headers.

## 3. Zero Third-Party Surveillance Telemetry
We enforce a strict anti-surveillance policy: zero third-party analytics trackers, advertising pixels, fingerprinting scripts, or passive telemetry pingers (Google Analytics, Segment, Meta Pixel) are permitted.

## 4. Research Data Dividend & Differential Privacy (NIH & LunaDNA Principles)
Patients may optionally choose to participate in accredited, IRB-approved clinical research cohorts:
*   **HIPAA §164.514 Safe Harbor**: All shared vectors are stripped of all 18 direct/indirect identifiers with age-capping ($>89 \to 90+$) and randomized relative epoch date shifting.
*   **Laplace Differential Privacy ($\epsilon = 0.5$)**: Continuous biosignals (e.g. continuous glucose monitoring, ambulatory blood pressure) are perturbed with calibrated Laplace noise to prevent linkage re-identification.
*   **Automated Patient Compensation**: 85% of net research query proceeds are disbursed directly to patients via Stripe Connect Express.
*   **Instant Revocation**: Research consent can be revoked at any time, instantly redacting future cohort aggregations.

---

## 5. Contact Information & Data Protection Officer
For privacy inquiries, HIPAA compliance audits, or data rights requests, contact our Data Protection Officer at **dpo@pocketgull.app**.
