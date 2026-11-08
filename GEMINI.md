# Pocket-Gull (Understory) — Core Architecture & Clinical Standards

## Project Overview & Tech Stack
Pocket-Gull is a real-time medical Care Plan Strategy and Live AI Consult engine powered by Google Gemini.
- **Frontend**: Angular 22 (Standalone Components, Signals, PocketShoal CSS tokens)
- **Backend/SSR**: Node.js v24.x, Express, Angular SSR
- **AI Integration**: Google Gemini (`@google/adk`, `@google/genai`, Genkit) & Chrome Built-in AI (`#gemma4-for-built-in-ai`)
- **3D & Voice**: Three.js (procedural 1000 UPM glyph extrusion + Edwin Smith PBR substrates), Web Speech API
- **Privacy & Export**: DOMPurify, HL7 FHIR R4 Bundle standard, HIPAA §164.514 Safe Harbor
- **Companion Stack**: Python FastAPI (`pocketgull_api`), Flutter/Dart (`pocketgull_flutter`), BigQuery & Kaggle (`gen-lang-client-0540208645`)

## Core Developer Directives
- **Angular Signals & Standalone**: Strictly use Standalone Components (zero NgModules) and Signals (`signal`, `computed`, `effect`) over RxJS for local state. Prefix interfaces with `I` and suffix observables with `$`.
- **"Tell, Don't Ask" Domain Encapsulation**: Never bolt business logic onto raw getters outside the owning service/entity. Encapsulate calculations and state transitions inside intent-revealing domain methods.
- **Scripting (Randal L. Schwartz Standard)**: Prefer **Dart** (`dart run script.dart`) over Python for standalone utilities and FHIR/JSON batch scripts unless constrained by ML libraries. Use raw string templates (`r'''...'''`) when emitting SVG/XML/LaTeX.

## Deployment, Pre-Flight & GreenOps (`gen-lang-client-0540208645`)
- **Commands**:
  - Dev Server: `npm run dev`
  - Typecheck: `node c:\Users\philg\Pocketgull\pocketgull\node_modules\typescript\lib\tsc.js -p c:\Users\philg\Pocketgull\pocketgull\tsconfig.json --noEmit`
  - Build: `node c:\Users\philg\Pocketgull\pocketgull\node_modules\@angular\cli\bin\ng.js build`
- **Mandatory 8-Gate Pre-Flight (`npm run deploy`)**:
  1. `tsc --noEmit` | 2. `npx vitest run` | 3. `node scripts/sentinel_security_guard.mjs` | 4. `npm run sbom` (CycloneDX 1.6) | 5. `npm run observatory:audit` (125/100) | 6. `npm run tippss:audit` | 7. `npm run taint:audit` | 8. `npm run gcp:audit` (100/100). Abort immediately if any check fails.
- **Google Cloud IAM & Security (100/100 Grade A+)**:
  - Deploy Cloud Run strictly as `--service-account=pocketgull-run@gen-lang-client-0540208645.iam.gserviceaccount.com` by immutable SHA-256 digest (`@sha256:...`).
  - 100% Keyless WIF in GitHub Actions (zero static JSON service account keys).
  - Scope all API keys (`apiTargets`, `allowedReferrers`); store server LLM keys in Secret Manager.
  - Primary sovereign owner: `dpo@pocketgull.app`.
- **Mozilla HTTP Observatory 125/100 (Grade A+)**:
  - Security headers MUST execute as **Middleware #1** before any route or domain dispatcher.
  - Zero `'unsafe-inline'` / `'unsafe-eval'` in `script-src`; enforce per-request nonces + `'strict-dynamic'` and `default-src 'none'`.
  - Mandatory Bonus Suite (+25 pts): `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`, `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **GreenOps & FinOps**: Exclude `*.ttf` (~121 MB) from web containers; serve WOFF2 via `https://font.pocketgull.app` CDN. Use `--cache-from` in Cloud Build, `minScale: 0` on Cloud Run, and 7-day auto-pruning (`olderThan: "604800s"`, `keepCount: 3`) on Artifact Registry & GCS build buckets.

## Clinical, Ophthalmological & Neuro-Ergonomic Standards
- **Zero Spelling Errors & ISMP Disambiguation**: 100% lexical accuracy (`HIPAA`, `Ophthalmological`, `Ayurvedic`, `LogMAR`). Enforce slashed zero (`cv08`), curved `l` (`cv05`), serifed `I` (`ss02`), Louise Sloan 5:1 optotype scaling (LogMAR 0.0), and `<bdi dir="ltr">` for RTL dosages.
- **RSNA Melanopic EDI ($\text{mEDI} < 10\text{ lx}$) & Helmholtz Invariant**: Night/Scotopic modes suppress $>80\%$ sub-$480\text{ nm}$ blue light ($\text{m-DER} \le 0.25$). Dial back dark-mode stroke weight by $-3.75\%$ (`font-weight: 385 !important;`) with warm bone cream (`#ede3d2`) on peat obsidian (`#0d090b`) at $\ge 7:1$ WCAG AAA contrast.
- **0.1 Hz Mayer Wave & Ethical Motion (WCAG 2.2 §2.3.3)**: 10s respiratory cycle ($4\text{s}$ in / $6\text{s}$ out) strictly quarantined to therapeutic/research views (banned in billing/checkout via Sentinel Guard). Instant override on `prefers-reduced-motion: reduce`.
- **Marker Font & Margin Containment**: Handwritten/Chiseltip display fonts are restricted exclusively to the `"PocketGull"` brand wordmark and copyright footer. All text/specimen containers enforce `box-sizing: border-box; max-width: 100%; overflow-wrap: anywhere; word-break: break-word;` for zero horizontal blowout across all 5 thin-client/mobile viewports.

## Epistemology, Three Acts & Cognitive Triad
- **Three Acts Clinical Trajectory**: Partition care plans into *Act I (Days 0–30 Metabolic Bridge / Where You've Been)*, *Act II (Weeks 2–12 Sleep, Glymphatic & Autonomic Pacing / Where You Stand Today)*, and *Act III (Months 6+ Stepped-Care Resilience / Where You're Going)*.
- **Cognitive Triad (DSRP + Oakley + Seligman)**: Enforce 4-slot working memory max (`WM_SLOT_MAX = 4`), 3-step micro-chunks, Seligman 3 Ps reversal (Transience, Specificity, External Biophysical Feedback), and the warm *Quiet Workshop Voice*.
- **Popperian Falsifiability & 12 Clinical Fallacies**: Compute $p$-values against $H_0$ (`SkepticalEpistemologyService`); warn when $p \ge 0.05$, tag Cochrane Risk of Bias & Evidence Tiers (`Level A/B/C`), badge `[EXPLORATORY IN SILICO MODEL • NON-DIAGNOSTIC]`, and guard against all 12 canonical clinical fallacies (using Gigerenzer natural frequencies out of 10,000).
- **Respectful Pricing & Affiliate Governance**: Present `"Standard Retail Benchmark"` and `"Estimated Out-of-Pocket Total"` alongside $4–$10 generic benchmarks. Never send raw Amazon affiliate links (`tag=pgdpo-20`) in SMS/email or pass PHI in egress URLs; always display FTC disclosure.

## Institutional Security, IEEE P2933™ TIPPSS, FVEY & MSA Governance
- **Institutional Security Triad**:
  - *NIST SP 800-90A*: Use OS CSPRNG (`crypto.getRandomValues` / `node:crypto`) with 53-bit IEEE-754 mantissa scaling `(high * 4294967296.0 + low) / 9007199254740992.0` (zero `Math.random()`, zero modulo bias, zero static salt literals).
  - *FDA 21 CFR Part 11 & HIPAA §164.312(c)(1)*: Stamp SHA-256 integrity digests on all state transitions, FHIR bundles, and STAT emergency overrides.
- **Anti-Whaling & Deterministic Precedence**: Require M-of-N Dual-Custody (`MandiantClinicalDefenseService`) for $>50$ record exports or $\ge \$500$ disbursements, FIDO2/WebAuthn step-up for voice-ordered medication edits, and deterministic interception of BE-FAST/ACS/SpO2<90%/C-SSRS red flags before any LLM call.
- **IEEE P2933™ TIPPSS & Five Eyes (FVEY)**: Enforce 6-pillar wearable trust (Hardware Root of Trust, patient binding, micro-consents, RSSI $\ge -85\text{ dBm}$, SQI bounds, SHA-256 digest) and statutory mapping across US (HIPAA/988), UK (NHS DTAC/111), CA (PIPEDA/988), AU (APPs/TGA/13 11 14), and NZ (HIPC/1737).
- **MSA Compliance (Effective Sept 30, 2026) & OpenSSF Baseline 3**: Zero base-model distillation from MS endpoints, zero emotion/affective inference from voice/video, mandatory human-in-the-loop CDS attestation, C2PA preservation, DCO sign-off (`git commit -s`), SPDX `Apache-2.0` headers, and two-person PR review.
- **Chrome Built-in AI & Fair Play 5 Pillars**: Support Gemma 4 Prompt API, Multimodal Blob input, ISMP Proofreader, Acuity Classifier, and 256-d `OnDeviceEmbedderService` with 100% deterministic TypeScript fallbacks (`OfflineEdgeAiService`) and transparent telemetry badges.
- **Scoped Rules**: See [.agents/rules/bigquery-kaggle-ml.md](file:///c:/Users/philg/Pocketgull/pocketgull/.agents/rules/bigquery-kaggle-ml.md) for BigQuery $\leftrightarrow$ Kaggle & ML rules, and [.agents/rules/typefoundry-and-repos.md](file:///c:/Users/philg/Pocketgull/pocketgull/.agents/rules/typefoundry-and-repos.md) for Typefoundry & cross-repo rules.
