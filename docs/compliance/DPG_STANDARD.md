# Digital Public Goods Standard Compliance (DPGA)

**Project Name:** PocketGull  
**Repository:** [github.com/pocketgull-app/pocketgull](https://github.com/pocketgull-app/pocketgull)  
**Primary Sustainable Development Goal (SDG):** **SDG 3 — Good Health and Well-Being** (Target 3.8: Access to quality healthcare services and safe, effective, affordable essential medicines/diagnostics).

---

## 📋 Digital Public Goods Alliance (DPGA) 9-Indicator Self-Assessment

| Indicator | DPGA Standard Requirement | PocketGull Implementation & Proof | Status |
| :--- | :--- | :--- | :---: |
| **1. Relevance to SDGs** | Must clearly document how the project contributes to achieving the UN Sustainable Development Goals. | Contributes directly to **SDG 3.8** (Clinical strategy assistance, evidence-based triage, and functional medicine support for resource-limited clinics) and **SDG 9** (Open health infrastructure). | ✅ **PASS** |
| **2. Use of Approved Open License** | Must be released under an OSI-approved open source license or Creative Commons. | Dual-licensed under **MIT License** (source code) and **SIL Open Font License 1.1** (PocketGull Variable Typeface). See [`LICENSE`](./LICENSE). | ✅ **PASS** |
| **3. Clear Ownership** | Must clearly declare the copyright holders and project maintainers. | Declared in [`OWNERS`](./OWNERS), [`package.json`](./package.json), and [`CITATION.cff`](./CITATION.cff). Maintained by Phil Gear and open community contributors. | ✅ **PASS** |
| **4. Platform Independence & Open Standards** | Must not have mandatory lock-in to single vendor proprietary software; must implement recognized open standards. | • Built on **HL7 FHIR R4 Bundle** open health interoperability standard.<br>• Implements **OpenAPI 3.1** specification ([`docs/openapi.json`](./docs/openapi.json)).<br>• Runs on any standard Docker/OCI container runtime (Cloud Run, AWS App Runner, local Docker/Podman). | ✅ **PASS** |
| **5. Documentation** | Must provide comprehensive documentation covering setup, architecture, and API references. | • In-app Codex & Study Center ([`/docs/study`](./public/docs/study/)).<br>• Full Getting Started Guide ([`public/docs/study/getting-started.md`](./public/docs/study/getting-started.md)).<br>• Architecture diagrams & paradigm maps ([`DESIGN.md`](./DESIGN.md)). | ✅ **PASS** |
| **6. Mechanism for Data Extraction** | Must provide open mechanisms for users to export their data in standard formats. | Full 1-click **FHIR R4 JSON Bundle export** and **PDF clinical report generation** (`jsPDF`). Zero proprietary data trapping. | ✅ **PASS** |
| **7. Adherence to Privacy & Laws** | Must comply with applicable data protection laws (GDPR, HIPAA Safe Harbor). | • Complies with **HIPAA §164.514 Safe Harbor** de-identification.<br>• Ephemeral, client-side memory storage with 1-click state purge (`purgeTransientPatientState`).<br>• Zero third-party trackers or telemetry cookies. See [`PRIVACY.md`](./PRIVACY.md). | ✅ **PASS** |
| **8. Security by Design** | Must document security policies, vulnerability disclosure, and automated security scans. | • Documented in [`SECURITY.md`](./SECURITY.md).<br>• Automated **CodeQL**, **OpenSSF Scorecard**, and **Dependabot** workflows in [`.github/workflows/`](./.github/workflows/).<br>• Cryptographic **Software Bill of Materials (SBOM)** in SPDX (`sbom.spdx.json`) and CycloneDX (`sbom.cdx.json`). | ✅ **PASS** |
| **9. Do No Harm / Responsible AI** | Must take active steps to anticipate and mitigate algorithmic bias and safety risks. | • Built-in **Popperian Null-Hypothesis ($H_0$) testing** and **Cochrane Risk of Bias (RoB 2)** scoring to prevent AI hallucination and overconfidence.<br>• Explicit clinician-in-the-loop validation barriers. See [`RESPONSIBLE_AI.md`](./RESPONSIBLE_AI.md). | ✅ **PASS** |

---

## 🌍 Open-Source Health Impact Statement

PocketGull is engineered as an open digital public good to democratize clinical intelligence. It bridges functional, evidence-based integrative medicine with conventional care planning, making high-precision differential assessments accessible to independent clinicians, community health centers, and humanitarian medical deployments worldwide.
