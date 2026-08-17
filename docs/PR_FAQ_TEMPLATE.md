# Pocket-Gull Working Backwards Template: Clinical PR/FAQ

Before building any new clinical feature, integration, or model update, the initiating engineer/clinician must complete this document.

---

## 1. PRESS RELEASE (PR)

### Title & Subtitle
* **Title**: [Name the feature from the patient/clinician perspective — e.g., "Pocket-Gull Introduces Real-Time Sub-Second Voice Triage for Rural Clinics"]
* **Subtitle**: [Who benefits and what is the primary breakthrough?]

### Summary
* [1-2 sentences summarizing the product launch and why the reader should care.]

### The Problem
* [Describe the patient pain point or clinical inefficiency as it exists today. Avoid technical jargon; focus on the human impact (e.g., patient anxiety, clinician screen-time fatigue).]

### The Solution / Breakthrough
* [How does this new feature elegantly resolve the problem? Explain how Pocket-Gull's real-time AI context handles this uniquely.]

### Quote from Leader
* ["This feature allows patients/clinicians to..." — A quote from a project lead explaining the strategic importance of the release.]

### Patient / Clinician Experience
* [A walk-through of the step-by-step experience. "When Dr. Smith loads the patient state..."]

### Call to Action
* [Where to go to use the feature or start the integration.]

---

## 2. FREQUENTLY ASKED QUESTIONS (FAQ)

### User / Clinical FAQs
* **Q: How does this protect patient privacy and remain HIPAA-compliant?**
  * *A:* [Answer focusing on DOMPurify sanitization, FHIR serialization, and zero third-party analytics trackers.]
* **Q: What is the clinical evidence tier for this feature?**
  * *A:* [Specify Level A (RCTs), Level B (Cohort), or Level C (Expert Consensus / Plausibility) and list references.]
* **Q: How does this feature handle false positives or erroneous AI recommendations?**
  * *A:* [Describe clinical guardrails and safety nets.]

### Technical & Operational FAQs
* **Q: What are the primary "Input Metrics" we are optimizing?**
  * *A:* [Define measurable inputs, such as response latency (TTFB), API serialization speed, or model fallbacks.]
* **Q: How does this design maintain decoupled API contracts?**
  * *A:* [Ensure no backdoor writes or shared state mutations between Angular, the FastAPI sidecar, and Rails.]
* **Q: What is the impact on Cloud Costs?**
  * *A:* [Demonstrate how the feature conforms to the scale-to-zero model and optimizes payload sizes.]
