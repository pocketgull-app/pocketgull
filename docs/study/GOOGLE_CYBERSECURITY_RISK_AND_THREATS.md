# Google Cybersecurity Study Guide: Risk Management, Threats & Vulnerabilities (Applied to Pocket Gull)

> **Module Alignment**: Google Cybersecurity Certificate — *Assets, Threats, and Vulnerabilities*  
> **Live Verification Command**: `npm run audit:org` ([`scripts/organizational_risk_audit.mjs`](../../scripts/organizational_risk_audit.mjs))

---

## 1. Asset Classification (Digital vs. Physical)

An **asset** is any item perceived as having value to an organization. Protecting Confidentiality, Integrity, and Availability (CIA) starts with an accurate asset inventory.

| Asset Class | Course Examples | Pocket Gull Equivalent | Protection Control |
| :--- | :--- | :--- | :--- |
| **Digital Assets** | SSNs, Dates of Birth, Bank account numbers, Mailing addresses | • Patient intake vitals & FHIR R4 Bundles<br>• Clinician OAuth / SMART-on-FHIR tokens<br>• Proprietary clinical algorithms & font master outlines (`1000 UPM`) | • **HIPAA §164.514 Safe Harbor** scrubbing (`phi_taint_boundary_linter.dart`)<br>• **Ephemeral memory-only** OAuth tokens (`src/server/fitbit.ts`)<br>• **IP Sovereignty Guard** (`ip_sovereignty_guard.dart`) |
| **Physical Assets** | Payment kiosks, Servers, Desktop workstations, Office spaces | • Clinician thin-client workstations<br>• Hardware FIDO2 / WebAuthn security keys<br>• Edge GPU host (`RX 6650 XT`) & `sbd-pi4b` node | • **Keyless Workload Identity Federation (WIF)**<br>• **FIDO2 Step-Up** for voice medication edits<br>• **Zero local server PHI persistence** |

---

## 2. The 4 Risk Management Strategies

$$\text{Risk} = \text{Likelihood of a Threat} \times \text{Impact on CIA Triad}$$

| Risk Strategy | Definition | Pocket Gull Implementation (Domain 8 in `audit:org`) |
| :--- | :--- | :--- |
| **1. Avoidance** | Eliminating the activity or exposure that creates the risk altogether. | **Zero Centralized PHI Database**: Patient records live ephemerally in browser memory/local vaults rather than a central SQL database, eliminating bulk server-breach exposure (`SECURITY.md §1`). |
| **2. Mitigation** | Reducing the likelihood or impact of a known risk via technical/administrative controls. | **Multi-Layer Defense**: `10 req/min` AI rate limiters (`aiRateLimiter`), `DOMPurify` XSS sanitization, and deterministic BE-FAST/ACS/C-SSRS emergency intercepts before LLM inference. |
| **3. Transference** | Shifting risk management responsibility to a specialized third party via contract/SLA. | **Stripe Hosted Checkout & GCP Vertex AI BAA**: Payment card handling is transferred to Stripe (`billing.routes.ts`), and cloud AI inference runs over BAA-covered Vertex AI (`src/server/genkit.ts`). |
| **4. Acceptance** | Acknowledging residual risk to preserve business/clinical continuity when mitigation cost exceeds impact. | **Offline Edge Continuity**: Accepting temporary cloud/billing unavailability by falling back automatically to deterministic client-side WebGPU/WASM inference (`OfflineEdgeAiService`). |

### Industry Risk Frameworks
* **NIST RMF ([NIST SP 800-37](https://csrc.nist.gov/projects/risk-management/about-rmf))**: *Prepare → Categorize → Select → Implement → Assess → Authorize → Monitor*. Automated continuously on every commit via `npm run deploy` and `npm run audit:org`.
* **HITRUST CSF**: Certifiable healthcare risk framework harmonizing **HIPAA**, **NIST SP 800-53**, **ISO 27001**, and **OWASP** into prescriptive healthcare security controls.

---

## 3. Threat Vectors & Risk Factors

| Category | Threat / Risk Factor | Real-World Mechanism | Pocket Gull Countermeasure |
| :--- | :--- | :--- | :--- |
| **Threat** | **Insider Threat** | Staff member or vendor abuses authorized access to exfiltrate >50 patient charts or divert funds. | **Mandiant M-of-N Dual Custody** (`ClinicalDefenseGuardService`): Requires two distinct roles (`requestorRole !== authorizerRole`, co-signed by DPO) for bulk exports or disbursements $\ge \$500$. |
| **Threat** | **Advanced Persistent Threat (APT)** | Threat actor maintains stealthy long-term foothold via stolen static credentials. | **Zero Static GCP Keys** (`100% Keyless WIF`), scale-to-zero ephemeral Cloud Run containers (`minScale: 0`), and immutable `@sha256` image digests. |
| **Risk** | **External Risk** | Unauthenticated scrapers, prompt-injection bots, or forged webhooks. | Strict Origin/Referer guard (`ai.routes.ts`), OWASP LLM01 Unicode stripping, and Cloud Pub/Sub OIDC token verification (`verifyPubSubOidcToken`). |
| **Risk** | **Legacy Systems** | Unpatched workstations, forgotten payment kiosks, or SMBv1/NTLMv1 endpoints. | Hard-pinned **Node.js 24.x LTS**, hardened sandboxed containers (`--cap-drop=ALL --read-only`), and zero legacy NTLM/Exchange dependencies. |
| **Risk** | **Multiparty Risk** | Third-party SDKs, pixels, or cloud APIs accessing IP or patient telemetry. | Zero third-party ad/analytics trackers (`index.html`) + strict outbound domain allowlist (`sentinel_security_guard.mjs`). |
| **Risk** | **Software Compliance & Licensing** | Outdated transitive dependencies or viral/non-commercial license taint (`AGPL` / `CC-BY-NC`). | Automated **CycloneDX 1.6 SBOM** (`1,253` components), `package.json` `overrides`, and `npm run ip:guard`. |

---

## 4. OWASP Top 10 (2021) & Canonical CISA KEV Vulnerabilities

### Key 2021 OWASP Top 10 Additions (Domain 9 in `audit:org`)
1. **A04:2021 — Insecure Design**: Flaws in architectural trust boundaries (solved via static `BASE_CLINICAL_PROMPT` partitioning from `[CLINICAL DIRECTIVE CONTEXT]` and deterministic emergency red-flag precedence).
2. **A08:2021 — Software and Data Integrity Failures**: Unsigned updates, unverified CI/CD artifacts, or forged webhooks (solved via SLSA `@sha256` digest deployments, FDA 21 CFR Part 11 SHA-256 receipts, and Pub/Sub OIDC verification).
3. **A09:2021 — Security Logging and Monitoring Failures**: Silent intrusions due to missing or unmonitored logs (solved via newline-sanitized `health-data-audit.log` and BigQuery Log Analytics SIEM `siem_audit_logs`).
4. **A10:2021 — Server-Side Request Forgery (SSRF)**: Coercing the backend server into fetching internal metadata (`169.254.169.254`) or unauthorized URLs (solved via `sanitizeUrl()` in `src/server/healthcare.ts` enforcing `https://healthcare.googleapis.com/v1/projects/*` and static switch routing in `vertex-agent.routes.ts`).

---

### High-Profile CVEs & CISA KEV Reference Card (Domain 10 in `audit:org`)

| Vulnerability | Target System / Protocol | Exploitation Mechanism | Architectural Lesson |
| :--- | :--- | :--- | :--- |
| **ProxyLogon** (`CVE-2021-26855`) | Microsoft Exchange Server | **Pre-authenticated SSRF** allowing remote attackers to bypass authentication and achieve Remote Code Execution (RCE). | Enforce strict SSRF allowlists (`A10:2021`) and avoid self-hosted legacy mail servers. |
| **ZeroLogon** (`CVE-2020-1472`) | Windows Netlogon Protocol (`MS-NRPC`) | Cryptographic flaw (`AES-CFB8` all-zero IV) allowing an attacker to spoof Domain Controller authentication with `1 in 256` guesses. | Use OS CSPRNG entropy (**NIST SP 800-90A**) and never use static/zero IVs or `Math.random()`. |
| **Log4Shell** (`CVE-2021-44228`) | Apache Log4j2 (Java) | Unsanitized user strings logged by Log4j trigger remote **JNDI / LDAP** class loading and full RCE. | Strip control characters before logging (`sanitizeLogInput`), maintain a live **SBOM**, and forbid dynamic code evaluation in loggers. |
| **PetitPotam** (`CVE-2021-36942`) | Windows LAN Manager (**NTLM** / `MS-EFSRPC`) | Coerces a Windows server/DC into initiating outbound NTLM authentication to an attacker-controlled relay server. | Disable legacy NTLM in favor of **FIDO2 / OIDC / Kerberos**, and block arbitrary outbound server connections. |

---

## 5. Modern 2024–2026 Evolution (Beyond the 2021 Course Baseline)

### 5.1 OWASP Web Top 10: **2021 $\rightarrow$ 2025 Crosswalk** (Domain 9 in `audit:org`)
* **`A01:2025 – Broken Access Control` *(Absorbed `A10:2021` SSRF)***: SSRF and Broken Object Level Authorization (BOLA) are now unified under `#1`. Pocket Gull enforces strict origin verification, `sanitizeUrl()` (`https://healthcare.googleapis.com`), and static switch routing.
* **`A02:2025 – Security Misconfiguration` *(Jumped from #5 to #2)***: Reflects cloud IAM and container misconfigurations. Guarded by `npm run gcp:audit` (`100/100`) and `npm run observatory:audit` (`145/100` CSP3 nonces + HSTS preload).
* **`A03:2025 – Software Supply Chain Failures` *(New #3, replacing `A06:2021`)***: Covers malicious package maintainers, CI/CD workflow tampering, and unsigned artifacts. Enforced via **Google Cloud Binary Authorization**, **Keyless WIF**, and **CycloneDX 1.6 SBOM**.
* **`A10:2025 – Mishandling of Exceptional Conditions` *(Brand-New #10)***: Targets fail-open error states, unhandled promise crashes, and stack-trace leakage. Guarded by top-level `unhandledRejection`/`uncaughtException` handlers in `src/server.ts` and deterministic client fallbacks.

---

### 5.2 OWASP Top 10 for **LLM (2025)** & **Agentic AI (`ASI01–ASI10`, 2026)** (Domain 11 in `audit:org`)

| 2025–2026 AI Risk ID | Threat Vector | Pocket Gull Control |
| :--- | :--- | :--- |
| **`LLM01:2025` & `LLM07:2025`** | **Prompt Injection & System Prompt Leakage** | Static `BASE_CLINICAL_PROMPT` anti-disclosure directive + zero-width Unicode stripping + `[CLINICAL DIRECTIVE CONTEXT]` partitioning. |
| **`LLM08:2025`** | **Vector & Embedding Weaknesses** | Read-only Discovery Engine data stores (`vertex-agent.routes.ts`) with local curated clinical seed fallback. |
| **`LLM09:2025`** | **Misinformation / Hallucinations** | Popperian $H_0$ falsifiability (`p < 0.05`), Cochrane RoB 2 tagging, and Gigerenzer natural frequencies (`out of 10,000`) in `auditGenkitClinicalGrounding`. |
| **`LLM10:2025`** | **Unbounded Consumption ("Denial of Wallet")** | `thinkingBudget` clamped to $\le 2048$ tokens, `MAX_CHAT_SESSIONS = 50`, and `10 req/min` IP rate limiting. |
| **`ASI01:2026` – `ASI09:2026`** | **Agent Goal Hijack, Tool Misuse & Trust Exploitation** | FDA 21 CFR §520(o) clinician-in-the-loop bracketing, FIDO2 passkey step-up on voice medication edits, and **Mandiant M-of-N Dual Custody** in `WebMcpRegistrationService`. |

---

### 5.3 Modernized Frameworks & Post-2021 Watershed CVEs
* **NIST CSF 2.0 & Cyber AI Profile (`NIST IR 8596`)**: Added **`GOVERN` (`GV`)** as the 6th core pillar (including `GV.SC` Supply Chain Risk Management) and unified cyber + AI operations under *Secure, Defend, Thwart*.
* **HITRUST CSF v11.9 & AI Security Certification**: Added certifiable controls for agentic non-human identities, model poisoning, and **NIST FIPS 203/204/205 Post-Quantum Cryptography (ML-KEM / ML-DSA)** readiness.
* **Watershed 2023–2026 CISA KEV Additions**:
  * **XZ Utils (`CVE-2024-3094`)**: Multi-year social-engineering maintainer takeover injecting an `sshd` backdoor into build tarballs $\rightarrow$ why `A03:2025` Supply Chain & SLSA provenance exist.
  * **Polyfill.io Supply-Chain Attack (`2024`)**: Third-party CDN domain ownership transfer serving malicious JS to 100k+ sites $\rightarrow$ why Domain 10 bans external script CDNs (`polyfill.io`) and enforces CSP `strict-dynamic` nonces.
  * **MOVEit Transfer (`CVE-2023-34362`) & Citrix Bleed (`CVE-2023-4966`)**: Mass SQLi exfiltration & MFA-bypassing session memory bleed $\rightarrow$ why Pocket Gull avoids centralized PHI databases (`Risk Avoidance`) and binds short-lived ephemeral tokens in memory.

---

## 6. NIST SP 2400-102e2026: Adversarial ML & Agentic SI Taxonomy (Domain 12 in `audit:org`)

Published in November 2026 by the **NIST Center for Advancing Innovation and Standards for Super Intelligence (CAISSI)** (*Vassilev, Oprea, Fordyce, Davies, & Hamin*, `DOI: 10.6028/NIST.SP.2400-102e2026.ipd`), **NIST SP 2400-102** elevates **Agentic SI** (*Task Instructions $\rightarrow$ Planning $\rightarrow$ Execution $\rightarrow$ Observation*) alongside **Predictive ML (`PredML`)** and **Generative SI (`GenSI`)** as a first-class threat taxonomy (`NISTAML.061–067`).

### 6.1 Agentic SI & Frontier Attack Taxonomy (`NISTAML.015–067`)

| NIST SP 2400-102 ID | Attack Classification | Core Threat Mechanism | Pocket Gull Architectural Mitigation |
| :--- | :--- | :--- | :--- |
| **`NISTAML.015` / `.018`** | **Indirect & Direct Prompt Injection** | Adversarial directives embedded in untrusted clinical documents or user turns hijack instructions. | Static `systemInstruction` isolation + `[CLINICAL DIRECTIVE CONTEXT]` partitioning in `src/server/routes/ai.routes.ts`. |
| **`NISTAML.031`** | **Model Extraction & Adversarial Distillation** | Coordinated API querying to clone proprietary reasoning traces (Sept 2026 NSA/CISA/FBI Joint Advisory). | Enforced anti-distillation governance in `scripts/msa_governance_guard.mjs` + Vertex AI HIPAA BAA routing. |
| **`NISTAML.061` & `.067`** | **Agent Hijacking & Decomposition Attacks** | Subverting multi-step planning or splitting harmful objectives into benign-looking subtasks across turns. | Deterministic emergency red-flag precedence (`BE-FAST`, `ACS`, `SpO2 < 90%`, `C-SSRS`) before any LLM call + clinician-in-the-loop CDS gating. |
| **`NISTAML.062`** | **Memory Poisoning** (*AgentPoison / MemoryGraft*) | Dormant "Trojan Hippo" payloads planted in persistent agent memory that activate in later sessions. | Ephemeral Angular Signal lifecycle, `MAX_CHAT_SESSIONS` cap, and 1-click `purge_transient_patient_state` reset (`SECURITY.md`). |
| **`NISTAML.063`** | **Malicious Tools & Rogue MCP Servers** | *Tool Poisoning* hidden in tool metadata during Planning, Execution IPI, or post-approval *MCP Rug Pulls*. | Domain 12 Unicode Tag / override scanner on `src/services/webmcp-registration.service.ts` + Mandiant M-of-N Dual-Custody step-up. |
| **`NISTAML.064`** | **Malicious Skills (`SKILL.md` Bundles)** | Procedural instructions or bundled scripts treated as trusted agent guidance exfiltrating secrets or altering code. | Automated Domain 12 supply-chain integrity scan across all `.agents/skills/**/SKILL.md` bundles in `npm run audit:org`. |
| **`NISTAML.065` & `.066`** | **Malicious Agents & Resource Exhaustion** | Inter-agent message tampering, prompt worms, stalling tools, or unbounded reasoning token loops. | `AbortController` execution timeouts on WebMCP tools + `thinkingBudget <= 2048` token clamp. |

---

### 6.2 Foundational Theorems & Edge Hardware Takeaways (Sections 4.4, 5.1.1.1 & 5.2.4)
* **The Gödelian Limits of SI Security (`Sec. 5.1.1.1`, *Vassilev 2026*)**: Proves via Gödel's incompleteness theorem that **no finite set of LLM prompt guardrails or safety training can be universally complete and consistent** against open-ended inputs. Therefore, high-assurance clinical systems must never rely on model refusal alone—they require **system-level information-flow control (`Sec. 4.4`: *CaMeL, ACE, FIDES*)**, deterministic hard-coded physiological red-flag interceptors, and explicit **Gödel Incompleteness Bound** disclosures (`SECURITY.md`).
* **Quantized Edge Model Integrity (`Sec. 5.2.4` & `NISTAML.051`)**: Compressing models to `4-bit` / `8-bit` weights for local edge execution can amplify decision-boundary drift or trigger *quantization-activated Trojans* invisible in `FP32` audits. Pocket Gull stamps cryptographic `SHA-256` `integrityDigest` seals on quantized clinical edge weights in `scripts/train_clinical_edge_model.py` and pairs edge triage with deterministic TypeScript fallbacks.
