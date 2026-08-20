---
name: teledentistry_systemic
description: Manages FDI 32-tooth odontogram surface caries, Smith & Knight Tooth Wear Index (TWI Grades 0-4), periodontal probing depth (PPD >= 4mm), and Systemic Inflammatory Burden Index (SIBI) cross-talk to cardiovascular & HbA1c trajectory. Use when analyzing dental charts, periodontal charting, oral-systemic clinical risk, or odontogram SVG rendering. Do NOT use for general clinic scheduling, patient billing, or standard non-oral vital signs.
---

# Teledentistry and Systemic Health Cross-Talk Skill

## 1. Quick Mental Model & Domain Invariants
- **FDI 32-Tooth Odontogram Grid (Teeth 11–48)**: Identified using standard **FDI International Notation** (Quadrants 1–4). Caries & Restorations map to 5 anatomical surfaces:
  - **M**: Mesial | **O**: Occlusal | **D**: Distal | **F**: Facial / Buccal | **L**: Lingual / Palatal
- **Smith & Knight Tooth Wear Index (TWI Grades 0–4)**:
  - **Grade 0**: Normal enamel contour.
  - **Grade 1**: Superficial smooth wear facets (enamel).
  - **Grade 2**: Dentin exposure $< 1/3$ surface area.
  - **Grade 3**: Severe dentin loss $> 1/3$ surface area.
  - **Grade 4**: Complete pulp chamber exposure.
- **SIBI Formulation**:
  $$\text{SIBI} = \min\left(100, (\text{Deep Pockets} \times 6) + (\%BOP \times 0.8) + (\text{hs-CRP} \times 12)\right)$$

---

## 2. 4-Phase Operational Workflow

### Phase 1: Odontogram Ingestion & Surface Mapping
1. Validate tooth numbers against FDI range ($11\text{--}18, 21\text{--}28, 31\text{--}38, 41\text{--}48$).
2. Map caries/wear to discrete surface arrays (`mesial`, `occlusal`, `distal`, `facial`, `lingual`).

### Phase 2: Systemic Cross-Talk Computation
1. Aggregate pocket counts ($\text{PPD} \ge 4\text{ mm}$) and Bleeding on Probing ($\%BOP$).
2. Compute **Cardiovascular Risk Multiplier** ($1.0x\text{--}2.8x$) from trans-epithelial bacteremia ($P. gingivalis$).
3. Compute **Predicted HbA1c Elevation** ($+0.0\%\text{--}+0.8\%$) driven by cytokine ($\text{TNF-}\alpha, \text{IL-6}$) insulin receptor resistance.

### Phase 3: Clinical Crosswalk & FHIR Serialization
1. Map odontogram state into FHIR `DiagnosticReport` / `Observation` resources.
2. Embed SIBI trajectory scores into patient risk summary signals.

### Phase 4: Verification & Rendering Checklist
- [ ] Odontogram SVG elements render with distinct quadrant contrast.
- [ ] WCAG AAA contrast ratio ($\ge 7:1$) verified against `#020617` obsidian canvas.
- [ ] Zero undefined surfaces or unmapped FDI tooth numbers.

