---
name: five_eyes_thin_clients
description: Directives and automated verification procedures for Five Eyes (FVEY) regulatory health data sovereignty and institutional thin-client hardware resilience.
---

# Five Eyes (FVEY) Regulatory & Institutional Thin-Client Skill

This skill governs multi-jurisdiction compliance across the Five Eyes partner nations (US, UK, CA, AU, NZ) and ensures flawless performance across institutional thin clients, hospital COWs, school Chromebook kiosks, and mobile devices.

---

## 1. Five Eyes (FVEY) Statutory Sovereignty Matrix

When generating clinical notes, exporting patient telemetry, or rendering emergency disclaimers, strictly verify compliance against the target nation's profile:

| Nation | Statutory Frameworks | FHIR R4 Standard | Crisis Dispatch Lifeline |
| :--- | :--- | :--- | :--- |
| **United States** | HIPAA §164.514 Safe Harbor, HITECH, ONC HTI-1, FDA CDS Guidance | `FHIR_US_CORE_R4` | **988** Suicide & Crisis Lifeline |
| **United Kingdom** | NHS DTAC, NHS DSPT, UK-GDPR, NICE Evidence Standards (ESF) | `FHIR_UK_CORE` | **111** NHS Non-Emergency Dispatch |
| **Canada** | PIPEDA, Ontario PHIPA, Alberta HIA, Health Canada SaMD | `FHIR_CA_BASELINE` | **988** Suicide Crisis Helpline |
| **Australia** | Privacy Act 1988 (APPs), My Health Record Act 2012, TGA SaMD | `FHIR_AU_BASE` | **13 11 14** Lifeline Australia |
| **New Zealand** | Health Information Privacy Code 2020 (HIPC), NZ HISO 10029/10064 | `FHIR_NZ_BASE` | **1737** Need to Talk? Lifeline |

---

## 2. Institutional Thin-Client & Form-Factor Invariants

Institutional clients in hospital wards, school libraries, and exam rooms operate under constrained hardware and restrictive endpoint policies:

### 1. Viewport & Aspect Ratio Conformance
- **School / Public Library Chromebook**: $1366 \times 768\text{ px}$ (touch screen kiosk mode).
- **Hospital Computer-on-Wheels (COW)**: $1280 \times 1024\text{ px}$ ($5:4$ legacy aspect ratio running Citrix / RDP).
- **Exam Room Swivel Mount iPad**: $810 \times 1080\text{ px}$ (portrait orientation).
- **Mobile iPhone & Pixel**: $390 \times 844\text{ px}$ and $412 \times 915\text{ px}$ (zero horizontal scroll blowout).

### 2. Defensive Permission Fallback
- **Restricted Microphones**: If microphone access is blocked by group policy or browser settings, the UI must automatically switch to keyboard input and local simulated audio streams without throwing unhandled exceptions.
- **Offline Edge Audio**: Procedural ambient flow music and audio synthesis must use Web Audio API oscillators and offline buffers rather than external streaming audio servers.

### 3. Fitts's Law Hitbox Compliance
- All buttons, drawer triggers, audio controls, and navigation links must maintain $\ge 44 \times 44\text{ px}$ (or $48 \times 48\text{ px}$) physical touch target hitboxes with `touch-manipulation`.

---

## 3. Automated Pre-Deployment Verification

Before publishing or deploying multi-jurisdiction features:
1. Run Playwright across the multi-device matrix:
   ```powershell
   node run-playwright.cjs test e2e/desktop-clinical-flow.spec.ts e2e/mobile-clinical-flow.spec.ts e2e/institutional-thin-clients.spec.ts
   ```
2. Verify zero TypeScript errors:
   ```powershell
   node node_modules/typescript/lib/tsc.js -p tsconfig.json --noEmit
   ```
3. Run Vitest test suites:
   ```powershell
   npm test -- --run
   ```
