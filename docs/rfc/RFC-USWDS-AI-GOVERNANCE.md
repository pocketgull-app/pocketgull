# RFC: USWDS-AI Pattern Specification for OMB M-24-18 Conformance

**RFC Identifier**: RFC-USWDS-2026-01  
**Title**: Accessible Artificial Intelligence Disclosures, Falsifiable Reasoning Streams & Sensory Grounding for Federal Digital Services  
**Authors**: PocketGull Open Source Research Consortium (Phillip Gear & Clinical Review Board)  
**Target Repository**: `uswds/uswds` (GSA Technology Transformation Services)  
**Status**: Community Proposal / Open Reference Standard  
**Governing Mandates**: OMB Memorandum M-24-18, Public Law 115-336 (21st Century IDEA Act § 3(a)), Rehabilitation Act Section 508 (29 U.S.C. § 794d), 18 U.S.C. § 701

---

## 1. Executive Summary & Problem Statement

Under **OMB Memorandum M-24-18** (*"Advancing Governance, Innovation, and Risk Management for Agency Use of Artificial Intelligence"*), federal agencies (VA, CMS, SSA, IRS, DoD) are directed to implement responsible artificial intelligence governance, ensure public transparency, and protect civil rights in all agency interactions.

However, the **U.S. Web Design System (USWDS 3.x)** currently lacks official design patterns and accessible components for:
1. **Model Origin & Provenance Badges**: Differentiating zero-egress local edge AI from commercial cloud models.
2. **Accessible Streaming Text**: Delivering token-by-token streaming generation without disorienting screen reader users.
3. **Falsifiable Reasoning & Evidence Telemetry**: Displaying uncertainty metrics, empirical $p$-values, and hallucination alerts in clinical and benefits adjudication contexts.
4. **Trauma-Informed & Parasympathetic Pacing**: Providing calming, bio-rhythmic anchors for high-stress services (988 Suicide & Crisis Lifeline, Veterans Crisis Line).
5. **Non-Governmental Entity Demarcation (18 U.S.C. § 701 Safe Harbor)**: Clarifying how private practices and contractors (e.g. under the VA MISSION Act) can adopt USWDS without falsely claiming official government agency status.

This RFC proposes a standardized **USWDS-AI Component Suite** to resolve these gaps.

---

## 2. Proposed Component Specifications

### 2.1 Component: `usa-ai-badge` (Model Provenance & Egress Disclosure)

Federal users must immediately understand *where* an AI inference occurred and whether their data remained local.

```html
<!-- Local Edge Zero-Egress AI Badge -->
<span class="usa-ai-badge usa-ai-badge--local" role="status">
  <span class="usa-ai-badge__icon" aria-hidden="true">⚙️</span>
  <span class="usa-ai-badge__label">Local Edge AI</span>
  <span class="usa-ai-badge__detail">Zero-Egress · 0g CO₂</span>
</span>

<!-- Sovereign Cloud AI Badge -->
<span class="usa-ai-badge usa-ai-badge--cloud" role="status">
  <span class="usa-ai-badge__icon" aria-hidden="true">☁️</span>
  <span class="usa-ai-badge__label">Sovereign Cloud AI</span>
  <span class="usa-ai-badge__detail">US Domestic CONUS · FedRAMP High</span>
</span>
```

#### Accessibility Requirements (Section 508):
* Minimum optical contrast ratio: $\ge 7:1$ against surface background.
* Color is never the sole indicator of origin (explicit text tokens `Local Edge` vs `Sovereign Cloud`).
* Keyboard focusable if interactive tooltips are attached.

---

### 2.2 Component: `usa-ai-reasoning-stream` (Accessible Generative Streaming)

Streaming LLM responses frequently break screen readers by triggering continuous, un-debounced auditory interruptions.

```html
<div class="usa-ai-stream" aria-busy="true">
  <div class="usa-ai-stream__header">
    <span class="usa-ai-stream__status font-sans-xs font-bold text-base-darkest">
      Generating Clinical Summary...
    </span>
    <span class="usa-ai-stream__telemetry font-mono-2xs text-base">
      Inference: 182ms · Tokens: 420 · Budget: Normal
    </span>
  </div>

  <!-- Screen reader is notified politely only upon milestone completion -->
  <div 
    class="usa-ai-stream__content font-sans-sm" 
    aria-live="polite" 
    aria-atomic="false"
  >
    <p>Patient demonstrates high-frequency sensorineural hearing loss consistent with acoustic trauma...</p>
  </div>
</div>
```

#### Interaction Rules:
* The live streaming text container MUST use `aria-live="polite"` with `aria-atomic="false"`.
* High-frequency chunk token updates must NOT emit separate screen reader chime events; announcements occur upon punctuation boundaries or stream completion.

---

### 2.3 Component: `usa-ai-evidence` (Skeptical CDS & Falsifiability Card)

In healthcare and benefit claims, automated AI outputs must never project false certainty.

```html
<div class="usa-summary-box usa-summary-box--evidence" role="region" aria-label="Evidence Grounding">
  <div class="usa-summary-box__body">
    <div class="display-flex flex-justify flex-align-center">
      <h3 class="usa-summary-box__heading">Evidence Grounding &amp; Empirical Basis</h3>
      <span class="usa-tag usa-tag--verified">p &lt; 0.01 · Verified</span>
    </div>
    <div class="usa-summary-box__text">
      <ul class="usa-list">
        <li><strong>Statutory Citation</strong>: 38 U.S.C. § 1119 (PACT Act Presumptive Service-Connection).</li>
        <li><strong>Clinical Standard of Proof</strong>: 38 CFR § 4.87 (At least as likely as not / &ge; 50% probability).</li>
        <li><strong>Risk of Bias Assessment</strong>: Low (Cochrane RoB-2 Matrix grounded in active-duty STR records).</li>
      </ul>
    </div>
  </div>
</div>
```

---

### 2.4 Component: `usa-sensory-anchor` (Parasympathetic Respiratory Pacing)

For high-stress veteran health encounters, 988 suicide crisis workflows, or military sexual trauma (MST) intakes, digital interfaces must provide an unhurried, nervous-system-calming pacing mechanism.

```html
<div class="usa-sensory-anchor" role="timer" aria-label="0.1 Hz Parasympathetic Coherent Breathing Anchor">
  <div class="usa-sensory-anchor__visualizer" aria-hidden="true">
    <div class="usa-sensory-anchor__orb usa-sensory-anchor__orb--pulse-10s"></div>
  </div>
  <div class="usa-sensory-anchor__text font-sans-2xs text-base-darker">
    <span>Unhurried Care: 0.1 Hz Pacing (4s Inhale · 6s Exhale)</span>
  </div>
</div>
```

#### Motion Safety Invariant:
* Adheres strictly to `prefers-reduced-motion: reduce`: instantly freezes all scale transforms and glow pulses to $0\text{s}$ duration for vestibular and photosensitive user safety.

---

### 2.5 Pattern: `usa-banner--community-partner` (18 U.S.C. § 701 Safe Harbor)

To protect non-governmental civilian healthcare partners (e.g. treating veterans under the **VA MISSION Act of 2018, P.L. 115-182**) from federal impersonation liability, USWDS should formally document and standardize the non-governmental community banner:

```html
<section class="usa-banner usa-banner--community-partner" aria-label="Independent Healthcare Practice">
  <div class="usa-accordion">
    <header class="usa-banner__header">
      <div class="usa-banner__inner">
        <div class="grid-col-auto">
          <span class="usa-banner__icon" aria-hidden="true">🏥</span>
        </div>
        <div class="grid-col-fill tablet:grid-col-auto">
          <p class="usa-banner__header-text">
            Independent Healthcare Practice · Built with U.S. Web Design System (USWDS 3.0) for VA Community Care &amp; CMS Interoperability
          </p>
        </div>
      </div>
    </header>
  </div>
</section>
```

---

## 3. Reference Implementations

The patterns proposed in this RFC have been built, battle-tested, and empirically validated in the PocketGull monorepo across two modern frontend architectures:

1. **Angular 22 (Signals Architecture)**:
   * Source components: [`src/components/uswds/`](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/uswds/) and [`src/components/federal-uswds-portal.component.ts`](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/federal-uswds-portal.component.ts).
   * Verified with 18 Vitest unit tests and Playwright desktop/mobile browser tests.
2. **React 19 (TypeScript Standalone Library)**:
   * Source package: [`packages/uswds-react-cds/`](file:///c:/Users/philg/Pocketgull/pocketgull/packages/uswds-react-cds/).
   * Zero external runtime dependencies; peer-dependency typed against React 18 & 19.

---

## 4. Community Action & Submission Protocol

This specification is released under **Creative Commons Zero (CC0 1.0 Universal)** into the public domain. It is submitted to the General Services Administration (GSA), the USWDS core maintainer team, and the U.S. Digital Service (USDS) as an open RFC for formal consideration in the USWDS 3.x / 4.x roadmap.
