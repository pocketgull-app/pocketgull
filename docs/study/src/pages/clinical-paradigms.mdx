---
layout: ../layouts/DocsLayout.astro
title: "Clinical Paradigms & FHIR"
description: "Detailed analysis of Eastern, Ayurvedic, and Secular Longevity clinical modes, and HL7 FHIR conversion in Pocket Gull."
---
import DocNode from '../components/DocNode.astro';

# Clinical Paradigms & FHIR Integration

Pocket Gull bridges the gap between conventional medicine, traditional paradigms, and modern medical data interchange. It translates structured patient context dynamically across healthcare standards and holistic frameworks.

---

## 🌐 1. HL7 FHIR R4 Bundle Conversion

The bi-directional clinical data mapper in `ExportService` translates the transient patient profile into a standard FHIR R4 Bundle Collection:

```mermaid
graph LR
    AppPatient["Pocket Gull Patient State"] --- |Bidirectional Map| FhirBundle["FHIR R4 Bundle Collection"]
    FhirBundle --> PatientRes["1. Patient Resource"]
    FhirBundle --> ConditionRes["2. Condition Resources"]
    FhirBundle --> ObservationVitals["3. Observation Vitals Signs (LOINC)"]
    FhirBundle --> ObservationIssues["4. Observation Exam (Pain Severity)"]
    FhirBundle --> GoalRes["5. Goal (Chief Complaints)"]
    FhirBundle --> ReportRes["6. DiagnosticReport (AI Analysis base64)"]
```

### Resource Schema Mapping

1. **Patient Resource**: Demographics (`name`, `gender`) are matched. Patient age is calculated dynamically back to an estimated `birthDate` format.
2. **Conditions**: Preexisting conditions are mapped to standard `Condition` resources with an `active` status code.
3. **LOINC Vitals (Observations)**: Patient vitals are categorized under the standard FHIR `vital-signs` category and mapped directly to global LOINC codes:
   - **Blood Pressure**: LOINC `85354-9`
   - **Heart Rate**: LOINC `8867-4`
   - **Body Temperature**: LOINC `8310-5`
   - **Oxygen Saturation**: LOINC `2708-6`
   - **Body Weight**: LOINC `29463-7`
   - **Body Height**: LOINC `8302-2`
4. **Anatomical Exam (Observations)**: Physical issues located on the 3D model are exported as `exam` Observations. They contain a custom extension mapping the visual pain level scale (`http://pocketgull.app/fhir/StructureDefinition/pain-level`).
5. **DiagnosticReport (AI Analysis)**: Stored AI Care Plans are exported as a base64-encoded attachment under standard LOINC `11506-3` (*Progress Note*).

---

## ☯️ 2. Holistic Clinical Paradigms

When a clinician toggles the paradigm selectors, the system instructions in `ClinicalIntelligenceService` instruct the Google Gemini models to synthesize the patient's biochemical markers and vitals into distinct clinical frameworks:

### 🟢 Eastern (Traditional Chinese Medicine) Mode
* **Diagnostic Lenses**: Evaluates Zang-Fu organ systems disharmonies, Yin/Yang balance, Qi dynamics, and blood stagnation (e.g., Qi Stasis in the Liver).
* **Interventions**: Suggests acupoints, meridian channels, moxibustion guidelines, and thermal-energetic dietary adjustments (warming vs. cooling foods).
* **Biomarker-to-Meridian Bridge**: Directs the AI to translate and map modern Western lab values directly to TCM pathways:
  - **Zinc** → mapped to **Kidney Essence (Jing)** regulation.
  - **Magnesium** → mapped to **Heart/Liver Qi flow** regulation.
  - **Vitamin D3** → mapped to **Yang Vitality** stimulation.
  - **B12 / Iron** → mapped to **Spleen Blood generation**.

### 🟡 Ayurvedic Medicine Mode
* **Diagnostic Lenses**: Evaluates Tridosha imbalances (Vata, Pitta, Kapha), metabolic fire (**Agni**), undigested metabolic toxicity (**Ama**), core vitality (**Ojas**), and attributes (**Gunas**).
* **Channel & Tissue Penetration**: Assesses system blockages within the bodily channels (**Srotas**, such as *Asthivaha* and *Majjavaha*) and tissue layers (**Dhatus**, including *Asthi* and *Majja*).
* **Reactive Clinical Triage Logic**: Automatically maps clinical status updates (vitals, symptoms, goals) to energetic imbalances:
  - **Vata (Ruksha/Sheeta Gunas)**: Triggered by neurological symptoms, radiculopathy, pain, and irregular heart rates.
  - **Pitta (Ushna/Tikshna Gunas)**: Triggered by fever, inflammatory markers, and hypertension.
  - **Kapha (Guru/Manda Gunas)**: Triggered by sluggishness or congestion.
* **Interventions**: Integrates customized *Dinacharya* (daily circadian regimens like *Gandusha* oil pulling, *Nasya* drops, and *Abhyanga* warm massage), local therapies (such as *Kati Basti* oil pooling), spice energetics, and alternate nostril breathing (*Nadi Shodhana*).
* **Biomarker-to-Dhatu Bridge**: Maps micronutrients to the seven traditional bodily tissues (**Dhatus**) and core vitality (**Ojas**):
  - **Calcium / Vitamin D3** → mapped to **Asthi Dhatu** (bone/cartilage tissue) and *Asthivaha Srotas*.
  - **Iron / B12** → mapped to **Rakta Dhatu** (blood tissue) and *Raktavaha Srotas*.
  - **Zinc / Magnesium** → mapped to **Majja Dhatu** (nervous tissue) and *Majjavaha Srotas*.
  - **Antioxidant capacity** → mapped to **Ojas replenishment** and *Manovaha Srotas* (mind channel).

---

## 🏛️ 3. Secular Longevity (Grow Thy Self) Mode

This mode is designed for preventive wellness and longevity, focusing on cellular optimization and Linus Pauling orthomolecular principles.

### Cellular Optimization
Focuses on mitochondrial health, cortisol dynamics, autonomic nervous system balance, sleep architecture, and evolutionary stress resilience (Cell Danger Response, calorie restriction mimetics, hormesis).

### Secular Integration Translator
Pocket Gull actively strips theological or dogmatic language from clinical findings, translating ancient world frameworks into physiological and psychological domains:
- **Enso (Zen)** → Translates to somatic mindfulness and psychological self-compassion for chronic conditions.
- **Golden Mean (Aristotle)** → Translates to moderation in diet/biohacking, preventing toxic over-supplementation.
- **Hygge (Danish)** → Translates to down-regulating the sympathetic nervous system via cozy rest spaces.
- **Ikigai (Japanese)** → Translates to long-term physical activation, cognitive engagement, and sense of purpose.
- **Mizan (Islamic)** → Translates to systemic bodily homeostasis and clean, wholesome (Tayyib) nutrition.
- **Ubuntu (African)** → Translates to family co-regulation and communal support circles to lower isolation stress.
- **Tikkun Olam (Jewish)** → Translates to personal physical healing as a prerequisite for community service.

---

## 🎨 4. Aesthetic Design & Theme Tokens

The application's **Industrial Grace** design language uses distinct color accents and typography to represent each clinical paradigm. When a paradigm is toggled, it dynamically transforms the color palette, visual hierarchy, and borders of active cards and status components.

These same themes can be toggled dynamically at the top right of this documentation page:

### 🔵 Western (Allopathic) Theme / Sky Accent
* **Theme class**: `theme-western`
* **Accents**: Sky Blue (`sky-50/40`, `sky-200/60`, `sky-950/10`, `sky-900/30`, `sky-400`, `sky-500`, `sky-700`)
* **Design Philosophy**: Denotes crisp, clear, clinical efficiency and standard allopathic evidence. It uses a high-contrast layout to focus on modern lab biomarkers and standard vital metrics.

### 🟢 Eastern (TCM) Theme / Emerald Accent
* **Theme class**: `theme-eastern`
* **Accents**: Emerald Green (`emerald-600`, `emerald-500`, `emerald-400`, etc.)
* **Design Philosophy**: Emphasizes balance, herbal growth, and natural Qi meridian channels. The softer organic green borders reduce clinician fatigue and visually signal holistic/systemic harmony.

### 🟡 Ayurvedic Theme / Amber Accent
* **Theme class**: `theme-ayurvedic`
* **Accents**: Amber/Orange (`amber-950/20`, `amber-900/30`, `amber-500`, `amber-400`, `amber-300/80`)
* **Design Philosophy**: Represents metabolic fire (Agni), vitality (Ojas), and traditional warm herbs/spices. The warm background gradients create a welcoming, ancient-world grounding element.

### 🔘 Secular Longevity Theme / Zinc Accent
* **Theme class**: `theme-longevity`
* **Accents**: Neutral Slate/Zinc (`zinc-800`, `zinc-700`, `zinc-500`, `zinc-400`, etc.)
* **Design Philosophy**: A minimalist, high-contrast monochrome design focus. Designed for data-heavy preventive wellness and cellular optimization analysis without extraneous color distractions.

---

## 🔮 5. Multimodal Side-by-Side Comparison & Mood Matrix

Pocket Gull provides real-time side-by-side comparative diagnostics across all three paradigms:

| Diagnostic Layer | 🔵 Western Allopathic | 🟢 Eastern (TCM) | 🟡 Ayurvedic Medicine |
|---|---|---|---|
| **Primary Lens** | Serum Biomarkers, ICD-10 Coding, Pharmacokinetics | Zang-Fu Organ Energetics, Meridian Flow, Tongue & Pulse | Tridosha Balance (Vata/Pitta/Kapha), Agni Fire |
| **Interventions** | Targeted Receptor Agonists, ACE Inhibitors, Statins | Xiao Ke Wan, Spleen Qi & Blood Tonics | Nisha Amalaki Rasayana, Gingerol Decoctions |
| **Target Pathway** | Receptor Modulation & Enzyme Inhibition | Meridian Channel Flow & Dampness Dispersion | Agni Fire Ignition & Tissue (Dhatu) Rejuvenation |


## 🎭 6. The 5-Act Clinical Theatre of Proposals

Pocket Gull organizes clinical decision-making into a theatrical 5-Act clinical proposal structure. Each Act maps logically to a phase in patient triage, diagnostic probing, active interventions, longitudinal telemetry, and continuity of care:

```mermaid
graph TD
    Act1["Act I: Triage & Clinical Overture"] --> Act2["Act II: Diagnostic & Biomarker Matrix"]
    Act2 --> Act3["Act III: Active Therapeutics & Functional Protocols"]
    Act3 --> Act4["Act IV: Surveillance & Waveform Trajectory"]
    Act4 --> Act5["Act V: Empowerment & Evidence Passport"]
```

### Paradigm-Renamed Proposal Flow Matrix

| Proposal Stage | 🔵 Western Allopathic | 🟢 Eastern (TCM) | 🟡 Ayurvedic | 🧬 Secular Longevity |
|---|---|---|---|---|
| **Act I: Baseline Synthesis** | Baseline Vitals & Triage | Zang-Fu Qi & Blood Overture | Tridosha & Agni Synthesis | Circadian & Hormetic Baseline |
| **Act II: Diagnostic Probing** | Laboratory & Diagnostic Matrix | Meridian & Pulse Diagnostic Grid | Srotas & Dhatu Diagnostic Matrix | Orthomolecular & Biomarker Matrix |
| **Act III: Active Interventions** | Allopathic & Functional Protocols | Acupoint & Thermal-Energetic | Dinacharya & Panchakarma | Biohacking & Cellular Entrainment |
| **Act IV: Longitudinal Telemetry** | High-Frequency ECG & Biomarkers | Channel Circulation & Stasis | Manovaha & Ojas Trajectory | HRV & Autonomic Telemetry |
| **Act V: Care Continuity** | UK RIO Evidence & Care Passport | Taoist Longevity Education | Svasthavritta Health Passport | Empirical Longevity Passport |

---

## 📜 Paradigm Evolution Timeline

- **v1.2.0 (2026-07-22)**: Integrated AYURVEDA 6-vector Tridosha Inventory & TCM Shi Wen 10 Questions Inventory into `ClinicalAssessmentsSuiteComponent`. Synchronized 3D WebGL viewport modes to active paradigm (Western Organs, TCM Acupoints & Jing-Luo meridians, Ayurvedic Sushumna Chakras).
- **v1.1.0 (2026-07-21)**: Added Physiological Storm De-escalation Shield (`storm-analysis.component.ts`) for acute Cytokine, Adrenergic Sympathetic, Thyroid, and Barometric storm triage across Western, Eastern, and Ayurvedic paradigms.
- **v1.0.0-rc11 (2026-07-21)**: Introduced Multimodal Side-by-Side Philosophy Comparison framework (`care-plan-print-preview.component.ts`) rendering 3-column side-by-side comparative diagnostics (🔵 Western Allopathic vs 🟢 Eastern TCM vs 🟡 Ayurvedic).




