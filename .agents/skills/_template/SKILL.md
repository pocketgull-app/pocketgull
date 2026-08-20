---
name: domain_skill_name
description: Clear, 1-2 sentence description of domain capabilities. Use when [Positive Triggers: specific keywords, tasks, workflows]. Do NOT use for [Negative Exclusions: adjacent but unsuited tasks].
---

# [Domain Skill Name]

## 1. Quick Mental Model & Domain Invariants
- **Core Purpose**: Brief summary of what this capability achieves.
- **Key Equations / Principles**:
  $$\text{Metric} = \sum_{i=1}^n w_i \cdot x_i$$
- **Non-Negotiable Invariants**:
  1. Invariant 1 (e.g., zero PII leakage, HIPAA §164.514 compliance).
  2. Invariant 2 (e.g., strict type definitions, no `any`).
  3. Invariant 3 (e.g., deterministic script execution over LLM math).

---

## 2. 4-Phase Operational Workflow

### Phase 1: Input Ingestion & Sanitization
- Validate incoming payload against schema.
- Strip sensitive identifiers or invalid enum variants.

### Phase 2: Deterministic Computation (Scripts)
- Execute companion script rather than computing in-context:
  ```powershell
  python .agents/skills/domain_skill_name/scripts/compute_metric.py --input data.json
  ```

### Phase 3: Domain Transformation & Integration
- Apply domain heuristics, FHIR bundle mapping, or Angular signal updates.

### Phase 4: Output Synthesis & Verification
- Format results into standard schema.
- Verify against domain validation checklist.

---

## 3. Bundled Scripts & Utilities
- `scripts/compute_metric.py`: Deterministic calculation engine for domain metrics.

---

## 4. Verification & Quality Checklist
- [ ] Positive control test cases pass.
- [ ] Edge cases handled (NaNs, empty collections, extreme boundary inputs).
- [ ] WCAG AAA / Optotypic legibility compliance verified (if UI).
