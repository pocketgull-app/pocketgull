# Responsible AI & Clinical Safety Framework

**Pocket-Gull (Understory Clinical AI System)**  
*Google Software Engineering & Clinical Safety Standards (Software as a Medical Device - SaMD)*

> [!NOTE]
> For our complete operationalization matrix mapping to **Google's Three AI Principles** and the **Google People + AI Guidebook (PAIR)**, see the [Google Responsible AI Alignment Document](docs/GOOGLE_RESPONSIBLE_AI_ALIGNMENT.md).

---

## 1. Ethical Principles & AI Co-Pilot Bounds

Pocket-Gull utilizes Google Gemini and custom machine learning sidecars to augment clinical judgment. Under no circumstances does the system replace licensed human clinical decision-making.

### Key Guardrails
1. **Human-in-the-Loop Primary**: AI output is strictly classified as Clinical Decision Support (CDS) under FDA §520(o). Every recommendation requires clinician review before patient administration.
2. **Deterministic Precedence**: When AI predictions collide with deterministic physiological alarms (e.g. SpO₂ < 88% or HR > 140 bpm), deterministic safety overrides take immediate precedence over model recommendations.
3. **No Unsanitized PHI Egress**: All text sent to cloud LLM providers must pass through client-side de-identification (`VocalBiomarkerService`) and sidecar PII sanitization (`phi_sanitizer.py`).

---

## 2. Gemini Clinical CDS Safety Filter Policy

Clinical CDS conversations routinely require discussing toxic drug interactions, overdose protocols, suicidal ideation screening (PHQ-9 / C-SSRS), and trauma management.

```typescript
// Canonical Safety Threshold Configuration (SECURITY.md §2)
const CLINICAL_CDS_SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH }
];
```

*Note: Restricting standard-of-care medical terminology behind generic keyword blocks introduces false-positive interruptions in life-critical clinical workflows.*

---

## 3. HIPAA §164.514 Safe Harbor De-Identification Standard

Before telemetry data or unstructured notes leave the edge client, 18 HIPAA Safe Harbor identifiers are stripped:

- Patient names, geographic subdivisions smaller than state, and exact dates
- Telephone numbers, email addresses, and Social Security numbers
- Medical record numbers, health plan IDs, and account numbers
- Biometric identifiers, full-face photos, and web URLs

---

## 4. Multi-Paradigm Arbitration Integrity

When traditional systems (TCM "Liver Meridian Peak", Ayurvedic "Pitta Spike") conflict with evidence-based Western guidelines (circadian melatonin onset, SOFA scoring), the `ParadigmArbiterService` enforces deterministic arbitration rules:

1. **Patient Safety Baseline**: Western acute physiological telemetry overrides diagnostic suggestions from alternative paradigms.
2. **Coherence Fusion**: Non-conflicting recommendations (e.g. acupressure point ST36 for nausea combined with standard antiemetics) are synthesized into a unified care plan.
3. **Explicit Disclosure**: Every recommendation discloses its paradigm origin and evidence strength tier (Level A/B/C).
