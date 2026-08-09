# 🏛️ POCKET GULL PROJECT GOVERNANCE

## 1. Governance Model
Pocket Gull is an open-source clinical technology project operating under a **Benevolent Dictator / Lead Maintainer** governance model with community advisory participation:
- **Lead Maintainer**: Phil Gear ([@philgear](https://github.com/philgear)) leads technical direction, architecture decisions, release tags, and clinical engineering standards.
- **Maintainers & Contributors**: Code reviews, pull request approvals, and issue triage are performed collaboratively adhering to OpenSSF Best Practices and clinical engineering guidelines.

---

## 2. Roles and Responsibilities
- **Lead Maintainer (`@philgear`)**:
  - Sets overall vision, core architecture, and security policies.
  - Manages GitHub repository settings, Cloud Run deployments, and security key material.
  - Reviews and merges all pull requests adhering to strict pre-commit validation.
- **Contributors**:
  - Submit issues, bug reports, and pull requests following [CONTRIBUTING.md](https://github.com/philgear/pocketgull/blob/main/CONTRIBUTING.md).
  - Ensure 100% strict compliance with HIPAA PII/PHI sanitization and automated unit testing rules.

---

## 4. Clinical Ethics & Digital Hippocratic Oath
All maintenance, feature additions, and model integrations must strictly adhere to **The Digital Hippocratic Oath for Clinical AI** documented in [docs/digital-hippocratic-oath.md](file:///c:/Users/philg/Pocketgull/pocketgull/docs/digital-hippocratic-oath.md). The 6 core pledges encompass:
1. *Primum Non Nocere* (Human-in-the-Loop CDS)
2. Epistemic Humility (Popperian $H_0$ Null-Hypothesis Testing & Cochrane RoB 2)
3. Absolute Patient Data Sovereignty & Anti-Surveillance
4. Prevention Over Reaction (Oral-Systemic SIBI Cross-Talk)
5. Economic Safeguards & Scale-to-Zero Cloud Protection
6. Compassionate Communication & Multi-Level Reading Translation
