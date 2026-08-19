# 🧪 Clinical Evidence Grade (`pocketgull-app/clinical-evidence-grade`)

> **Oxford CEBM Levels, Cochrane Risk of Bias 2 (RoB 2), GRADE Evidence Grading, and Popperian Null-Hypothesis Engine** for Pocket-Gull.

---

## 🔬 Purpose

This standalone package provides an objective, epistemologically rigorous clinical evidence appraisal engine. It evaluates published medical literature, clinical trials, and AI-generated care recommendations against standard-of-care evidence hierarchies.

---

## 🏛️ Supported Clinical Frameworks

1. **Oxford Centre for Evidence-Based Medicine (OCEBM 2011)**:
   * **Level 1**: Systematic Reviews of RCTs
   * **Level 2**: Individual Randomized Controlled Trials
   * **Level 3**: Controlled Prospective / Inception Cohorts
   * **Level 4**: Case-Series / Case-Control Studies
   * **Level 5**: Mechanistic Bench Modeling / Expert Consensus
2. **Cochrane Risk of Bias 2 (RoB 2)**:
   * 5 canonical domains: Randomization, Deviations, Missing Data, Measurement, Selective Reporting.
3. **GRADE Certainty Matrix**:
   * Evaluates Risk of Bias, Inconsistency ($I^2$), Indirectness, Imprecision, and Publication Bias.
4. **Popperian Falsifiability & Skeptical Epistemology**:
   * Welch's t-test computing $p$-values against population baseline null hypothesis ($H_0$).
   * Automatic `skepticalWarningNotice` trigger when $p \ge 0.05$ or confidence intervals cross zero.

---

## 🚀 Quickstart

```bash
# 1. Install dependencies
pip install -e ".[dev]"

# 2. Run unit test suite
pytest tests/

# 3. Start local FastAPI grading server
uvicorn src.evidence_grader.server:app --reload --port 8080
```

---

## 👥 Domain Specialist Roles

* **Epidemiologists & Biostatisticians**: Implement advanced meta-analysis pooling ($I^2$), network meta-analysis, and meta-regression.
* **Medical Writers & Clinical Pharmacologists**: Add PubMed Central (PMC BioC) automated study methodology extraction.
* **Clinical Informaticians**: Map evidence grades to FHIR `ObservationDefinition` and `DiagnosticReport` resources.

---

<p align="center">
  <sub>© 2026 Pocket-Gull Engineering. Distributed under the Apache-2.0 License.</sub>
</p>
