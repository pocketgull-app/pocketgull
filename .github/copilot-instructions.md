# GitHub Copilot & Agent Instructions: Pocket-Gull (Understory)

## 1. Project Overview & Mission
Pocket-Gull is a real-time clinical intelligence engine, multimodal AI consultation assistant, and HIPAA-compliant care planning platform powered by Google Gemini 2.5 and Angular 22.

---

## 2. Core Architecture & Technology Stack
- **Frontend Framework**: Angular 22 with Standalone Components. **Strict Rule**: Never generate NgModules; always use standalone components, `inject()`, and reactive Angular Signals (`signal`, `computed`, `effect`).
- **Reactive State**: Centralized in `PatientStateService` using Angular Signals for local/ephemeral reactivity. Keep domain logic inside owning services ("Tell, Don't Ask").
- **Backend / SSR**: Node.js v24.x, Express, Angular Server-Side Rendering (SSR).
- **AI Streaming Layer**: `@google/genai`, Google Genkit, and `@google/adk` `InMemoryRunner`. Defensively chunk streaming responses against network interruptions.
- **3D Biophysical Visualization**: Three.js for procedural anatomical modeling with Edwin Smith surgical codex biophysical shaders.
- **Data Serialization & Privacy**: Strict **HL7 FHIR R4 Bundle** format for all exported or cross-service patient payloads. DOMPurify sanitization on all I/O.
- **Styling**: Precompiled TailwindCSS utility classes using curated design tokens (`obsidian`, `gearTeal`, `amberGold`, `paperCream`). **Strict Rule**: Zero runtime JIT CDN scripts in production.

---

## 3. Scripting & Tooling Standard (Randal L. Schwartz Standard)
- **Dart Over Python for Standalone Utilities**: When writing one-off scripts, automation utilities, batch data transformations, or verification tools where the language is not constrained, prefer **Dart** (`dart run scripts/dart/tool.dart`) over Python.
- Dart provides zero virtualenv friction, sound static typing with Dart 3 pattern matching, a batteries-included standard library (`dart:io`, `dart:convert`, `dart:async`), and predictable single-threaded concurrency.

---

## 4. Typography & Marker Font Governance Standard
- **Brand & Copyright Boundary**: The handwritten Marker Font (`font-pocketgull-handwritten`, `.marker-bold-emphasis`, `.bionic-pocketgull-marker`) MUST **ONLY** be used when rendering the official **Brand Lettering ("PocketGull")** and **Copyright / Legal Footer** imprint lines.
- **Universal Clinical Legibility**: All clinical interfaces, telemetry HUDs, reading frames, research literature, and vitals tables MUST strictly use clean, high-legibility clinical typography stacks (`font-pocketgull-inter`, `font-pocketgull-mono`, `font-pocketgull-sans-clinical`) to eliminate optical dosage misinterpretations.

---

## 5. Clinical Safety & Regulatory Compliance Boundaries
- **FDA 520(o) Non-Device CDS**: Pocket-Gull is supportive Clinical Decision Support (CDS) for healthcare professionals and patients. It does not replace independent clinical judgment.
- **HIPAA §164.514 Safe Harbor**: All test fixtures, mock data, and log payloads must strip all 18 direct and indirect identifiers.
- **Canonical Domain Standard**: All FHIR StructureDefinition URIs, security labels, and egress anchors MUST use the canonical domain `https://pocketgull.app`.
- **Five Eyes (FVEY) Statutory Compliance**: Support explicit profiles for US (HIPAA/HITECH), UK (NHS DTAC/DSPT), Canada (PIPEDA/PHIPA), Australia (Privacy Act 1988/TGA SaMD), and New Zealand (HIPC 2020/HISO).

---

## 6. Conventional Commit Format & Pre-Commit Rules
Every commit must strictly adhere to the Conventional Commits specification:
```text
<type>(<scope>): <description>
```
- **Allowed Types**: `feat`, `fix`, `docs`, `test`, `security`, `chore`, `refactor`, `perf`, `style`, `ci`, `build`
- **Common Scopes**: `ui`, `ai`, `gemini`, `voice`, `clinical`, `fhir`, `server`, `security`, `ci`, `three`, `companion`
- **STRICT LENGTH LIMIT**: The subject line must be **72 characters or fewer**.
- **Imperative Mood**: Use "add", "fix", "update" (not "added", "fixes", "updated").

---

## 7. Verification & Build Commands
Always verify changes using the explicit repository paths:
- **TypeScript Typecheck**:
  ```powershell
  node node_modules/typescript/lib/tsc.js -p tsconfig.json --noEmit
  ```
- **Vitest Unit Suite**:
  ```powershell
  npx vitest run
  ```
- **Sentinel Security & Egress Guard**:
  ```powershell
  node scripts/sentinel_security_guard.mjs
  ```
- **Dart AGY Skills Verification**:
  ```powershell
  dart run scripts/dart/verify_agy_skills.dart
  ```
