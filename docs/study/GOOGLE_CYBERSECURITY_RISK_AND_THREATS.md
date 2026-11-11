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
