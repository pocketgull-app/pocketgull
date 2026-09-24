# Project Maintainers & Operational Continuity Plan

**Pocket-Gull (Understory Clinical AI System)**  
*Maintainer Roster, Access Continuity Protocol & Bus Factor Governance*

---

## 👥 1. Active Maintainer Roster

The PocketGull project is stewarded by core maintainers across engineering, clinical informatics, and security disciplines:

| Name | Role | GitHub Username | Domain Focus |
| :--- | :--- | :--- | :--- |
| **Phillip Gear** | Lead Systems Architect | [@philgear](https://github.com/philgear) | Core Architecture, Angular UI, AI Integration, Security |
| **Clinical Review Board** | Clinical Informaticists & Reviewers | `reviewers@pocketgull.app` | Clinical CDS, LOINC/FHIR Mappings, Medication Safety |
| **Security & Infrastructure Team** | DevSecOps Maintainers | `security@pocketgull.app` | GCP Cloud Run, CI/CD, Sentinel Egress Guard, SBOM |

---

## 🚌 2. Bus Factor & Succession Governance

To guarantee sustainable operational continuity and satisfy OpenSSF Gold standards (`bus_factor` and `access_continuity`):

1. **Dual Administrative Custody**:
   - Administrative and owner access to the [`pocketgull-app`](https://github.com/pocketgull-app) organization and primary repositories is held by at least two authorized, unassociated accounts with hardware-backed 2FA enabled.
2. **Access Continuity & Key Custody**:
   - Cloud Run infrastructure (`gen-lang-client-0540208645`), domain registrations (`pocketgull.app`), and OpenSSF badge management (`project/13644`) utilize centralized organization access rather than single-individual dependencies.
   - Cryptographic signing keys and secrets are securely escrowed in Google Cloud Secret Manager with dual-custody access policies.
3. **Emergency Succession Protocol**:
   - In the event of primary maintainer unavailability, designated backup maintainers from the Clinical Review Board and Core Engineering have pre-authorized legal and cryptographic standing to assume governance and deploy critical security patches.

---

## 🛡️ 3. Maintainer Responsibilities

Core maintainers commit to:
* Triaging public issues and pull requests within 7 calendar days.
* Enforcing the **Mandatory Pre-Flight Test Mandate** (`tsc --noEmit`, `vitest run`, `sentinel_security_guard.mjs`) on every proposed change.
* Performing two-person code reviews for all production merges to `main`.
* Upholding the [Code of Conduct](CODE_OF_CONDUCT.md) and [Governance Policy](GOVERNANCE.md).
