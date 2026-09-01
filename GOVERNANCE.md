# Project Governance & Clinical Oversight Policy

**Pocket-Gull (Understory Clinical AI System)**  
*Open Source Governance, Clinical Decision Support (CDS) Review Board, and Release Protocol*

---

## 🏛️ 1. Governance Principles

PocketGull is an open-source medical intelligence ecosystem developed by **PocketGull LLC** in collaboration with clinical researchers, biomedical software engineers, and health informatics specialists.

Our governance model ensures:
1. **Clinical Rigor & Evidence Grounding**: All medical algorithms, clinical scoring systems, and drug interaction databases must be grounded in Oxford CEBM Level A/B literature or systematic Cochrane reviews.
2. **Deterministic Safety Precedence**: Stochastic machine learning outputs never override deterministic physiological emergency safeguards.
3. **Radical Transparency**: 100% open-source licensing (Apache-2.0, CC-BY-4.0), reproducible evaluation scripts, and public Hugging Face model cards.
4. **Data Sovereignty**: Zero PHI persistence, ephemeral edge computing, and strict HIPAA §164.514 Safe Harbor compliance.

---

## 👥 2. Roles & Responsibilities

### 2.1 Lead Systems Architect & Benevolent Dictator for Now (BDFN)
* **Lead Architect**: **Phillip Gear** ([ORCID: 0009-0008-1372-5381](https://orcid.org/0009-0008-1372-5381))
* Retains final architectural, licensing, and security decision-making authority over core repository branches and cryptographic release seals.

### 2.2 Clinical Review Board (CRB)
* Composed of licensed physicians, pharmacists, and medical informaticists.
* Reviews all Pull Requests touching:
  * ISMP high-risk medication safety rules.
  * CPIC pharmacogenomic allele tables.
  * Triage emergency red-flag interceptors (BE-FAST stroke, ACS, sepsis qSOFA).
  * LOINC clinical assessment scoring (PHQ-9, GAD-7, C-SSRS).

### 2.3 Core Maintainers
* Review daily pull requests, maintain CI/CD pipelines, and enforce pre-flight test suites (`tsc --noEmit`, `vitest run`, `sentinel_security_guard`).

---

## 📜 3. Decision-Making & RFC Process

Significant architectural or clinical changes follow a lightweight **Request for Comments (RFC)** process:

1. **RFC Proposal**: Contributor opens a GitHub Discussion under `Ideas & RFCs` or an issue with the `[CLINICAL-CDS]` template.
2. **Review Period**: 7-day public review period for community feedback and clinical verification.
3. **Proof-of-Work Verification**: Implementation must provide 100% passing unit tests, zero secret leaks, and statistical significance proofs ($p < 0.05$ against null hypothesis $H_0$).
4. **Consensus & Merge**: Merged upon approval by the Lead Architect and at least one Clinical Review Board reviewer.

---

## 🛡️ 4. Emergency Patch Protocol (STAT Override)

In the event of an identified patient safety hazard, zero-day vulnerability, or regulatory non-compliance:
1. Maintainers may push an emergency fix directly to a hotfix branch.
2. The hotfix must satisfy the mandatory Sentinel Security Guard and Vitest unit suites.
3. A post-mortem incident report will be published in `SECURITY.md` within 48 hours.

---

<p align="center">
  <sub>© 2026 PocketGull LLC & Phillip Gear. Distributed under the Apache-2.0 License.</sub>
</p>
