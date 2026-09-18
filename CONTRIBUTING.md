# Contributing to PocketGull

Thank you for your interest in contributing to **PocketGull**! We welcome contributions from clinical researchers, biomedical software engineers, pharmacologists, and open-source developers.

As a clinical intelligence platform dealing with patient state and medical decision support, all contributions must strictly adhere to our **Safety, Legal, and Architectural Invariants**.

---

## 🏛️ Clinical & Ethical Invariants

1. **Zero Protected Health Information (HIPAA §164.514 Safe Harbor)**:
   * NEVER submit real patient data, medical record numbers, or identifiable clinical notes. All test fixtures and mock records must strip all 18 HIPAA Safe Harbor identifiers.
2. **ISMP High-Risk Medication Safety Standard**:
   * All clinical text, drug dosages, and titration schedules must strictly eliminate trailing zeros (`5 mg`, NEVER `5.0 mg`) and mandate leading zeros on naked decimals (`0.5 mg`, NEVER `.5 mg`).
3. **FDA 21 CFR §520(o) Non-Device Demarcation**:
   * All AI-generated suggestions are supportive educational Clinical Decision Support (CDS) tools intended for qualified healthcare professionals. Code must enforce affirmative human clinician review before committing orders.
4. **Deterministic Emergency Interception**:
   * Critical red-flags (BE-FAST acute stroke, ACS chest pressure, SpO2 < 90%, C-SSRS suicidal crisis) must ALWAYS be intercepted ahead of LLM text generation with mandatory statutory emergency directives.

---

## 🛠️ Code Conventions & Architectural Standards

* **Frontend**: Angular 22 standalone components with native **Angular Signals** (`signal`, `computed`, `effect`). NgModules are prohibited.
* **Typing**: Strict TypeScript (`noImplicitAny`, explicit interface definitions prefixed with `I`).
* **Interoperability**: Data export and serialization across API boundaries must conform to **HL7 FHIR R4 Bundle** specifications.
* **Commit Messages**: Strictly follow **Conventional Commits** (`feat(scope): ...`, `fix(scope): ...`, `security(scope): ...`) with a **maximum 72-character subject line**.

---

## 🧪 Mandatory Pre-Flight Verification Mandate

Before submitting any Pull Request or committing changes, all test suites must pass 100% cleanly:

```bash
# 1. TypeScript Strict Typecheck
node node_modules/typescript/lib/tsc.js -p tsconfig.json --noEmit

# 2. Vitest Unit & Regression Test Suite
npx vitest run

# 3. Sentinel Security & Egress Guard
node scripts/sentinel_security_guard.mjs
```

---

## ✍️ Developer Certificate of Origin (DCO)

To ensure clear legal provenance and satisfy OpenSSF best practices, all contributions must include a **DCO sign-off** line in the git commit message footer:

```
Signed-off-by: Full Name <contributor@example.com>
```

You can automatically add this line to your commits using `git commit -s`. By signing your commit, you certify that you have the right to submit the work under the project's open-source license ([Developer Certificate of Origin 1.1](https://developercertificate.org/)).

---

## 🔍 Two-Person Code Review Standard

In compliance with OpenSSF Gold standards and clinical safety protocols:
1. **Pull Requests Required**: Direct pushes to `main` are disabled. All changes must arrive via a Pull Request.
2. **Independent Approval**: Every PR must receive at least **one independent approving review** from a core maintainer or Clinical Review Board member before merge.
3. **CI Status Checks**: All status checks (`Typecheck`, `Vitest Suite`, `CodeQL SAST`, `Sentinel Guard`) must pass green prior to merge.

---

## 📄 License & SPDX Headers

New source files must include the appropriate SPDX license identifier comment:
```typescript
// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear
```

---

## 📜 Code of Conduct & Maintainers
* Please review our [Code of Conduct](CODE_OF_CONDUCT.md) before participating in community discussions and reviews.
* For maintainer contacts and governance questions, see [MAINTAINERS.md](MAINTAINERS.md) and [GOVERNANCE.md](GOVERNANCE.md).
