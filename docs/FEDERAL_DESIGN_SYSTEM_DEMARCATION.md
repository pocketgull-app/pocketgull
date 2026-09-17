# Federal Design System Demarcation & Anti-Impersonation Governance

**Policy Standard**: Non-Governmental Operational Status & 18 U.S.C. § 701 Safe Harbor  
**Effective Date**: September 16, 2026  
**Governing Laws & Authorities**: 18 U.S.C. § 701, 18 U.S.C. § 912, VA MISSION Act of 2018 (P.L. 115-182), GSA USWDS Public Domain License (CC0 1.0 Universal)

---

## 1. Executive Declaration of Non-Governmental Status

**PocketGull** (and its parent entity, PocketGull LLC, along with independent contributors and maintainers) is a **private, non-governmental software platform**. 

* **No Agency Status**: PocketGull does **NOT** represent, speak for, act as an agent of, or possess any official authority granted by the United States Government, the Executive Office of the President, the Department of Veterans Affairs (VA), the Centers for Medicare & Medicaid Services (CMS), the Department of Health and Human Services (HHS), or the General Services Administration (GSA).
* **Zero Intent to Impersonate**: Under no circumstances is this software intended to mislead patients, clinicians, adjudicators, or the general public into believing that PocketGull is an official federal government agency or an official federal `.gov` website.

---

## 2. Statutory Context: 18 U.S.C. § 701 & 18 U.S.C. § 912

Federal criminal statutes strictly prohibit the unauthorized imitation or impersonation of federal agencies, officers, or official seals:

1. **18 U.S.C. § 701 (Official badges, identification cards, other insignia)**:
   > *"Whoever manufactures, sells, or possesses any badge, identification card, or other insignia, of the design prescribed by the head of any department or agency of the United States... or any colorable imitation thereof... shall be fined under this title or imprisoned..."*
2. **18 U.S.C. § 912 (Officer or employee of the United States)**:
   > *"Whoever falsely assumes or pretends to be an officer or employee acting under the authority of the United States or any department, agency or officer thereof, and acts as such... shall be fined under this title or imprisoned..."*

To uphold complete legal fidelity with these provisions, PocketGull strictly prohibits displaying official federal seals, coat of arms, or affirmative `.gov` domain ownership banners on public, non-governmental host deployments.

---

## 3. Public Domain Nature of USWDS (CC0 1.0 Universal)

The **U.S. Web Design System (USWDS)** is developed and maintained by the General Services Administration (GSA) and the Technology Transformation Services (TTS). As work created by officers and employees of the United States Government as part of their official duties, USWDS code, design tokens, and components reside in the **public domain** (17 U.S.C. § 105) and are distributed under the **Creative Commons Zero (CC0 1.0 Universal)** dedication.

* **Permitted Civilian Use**: Any private individual, non-profit organization, commercial entity, or healthcare provider is legally permitted to use, adapt, modify, and build upon USWDS design tokens, CSS styles, typography stacks, and accessibility patterns.
* **The Restriction (The `.gov` Banner)**: The official `.gov` banner (`"An official website of the United States government"`) is reserved **strictly and exclusively** for official federal government websites operating on verified `.gov` or `.mil` top-level domains. Non-governmental entities utilizing USWDS **must not** display this banner claiming to be an official government website.

---

## 4. The Clinical Rationale: Why Private Practices Need USWDS

Why does a private medical software platform integrate USWDS components?

Under the **VA MISSION Act of 2018 (Public Law 115-182)**, over **40% of all Veteran healthcare visits** are delivered by civilian community providers through the **Veterans Community Care Network (CCN)** administered by Third-Party Administrators (Optum Serve and TriWest Healthcare Alliance).

When civilian providers examine Veterans, they encounter two severe structural bottlenecks:
1. **Administrative & Cognitive Friction**: Veterans transitioning between VA Medical Centers and civilian clinics face jarring differences in digital forms, leading to confusion, missed appointments, and dosage errors.
2. **Statutory Adjudication Deficits (38 CFR § 4.87)**: Civilian community doctors routinely submit medical opinions that are rejected by the Board of Veterans' Appeals (BVA) because the civilian progress notes fail to use the exact statutory legal phrasing (*"at least as likely as not [$\ge 50\%$ probability]"*) or fail to connect military occupational acoustic trauma to neurosensory deficits.

By utilizing USWDS design components (Step Indicators, Memorable Date inputs, Summary Boxes, and Section 508 contrast standards), PocketGull provides **ergonomic continuity** for Veterans while empowering civilian providers to format claims, PACT Act toxic exposure screenings, and FHIR US Core exports in the standard formats expected by VA adjudicators.

---

## 5. Architectural Implementation: The Dual-Perspective Demarcation

To enforce this boundary programmatically, PocketGull implements an explicit **Dual-Perspective Engine** (`FederalBannerMode`):

| Property | Private Practice / VA Community Care Mode (`community-partner`) | Official Federal Agency Host Mode (`official-gov`) |
| :--- | :--- | :--- |
| **Default State** | **ACTIVE BY DEFAULT** on all host startups | Requires explicit, manual switch |
| **Top Banner** | 🏥 *"Independent Healthcare Practice • Built with U.S. Web Design System (USWDS 3.0) for VA Community Care & CMS Interoperability"* | 🦅 *"An official website of the United States government"* (OMB M-23-22) |
| **Entity Disclaimer** | Prominent Section 508 disclosure disclaiming federal agency authority | Expandable `.gov` and HTTPS authority verification |
| **Patient Demographics** | Displays civilian practice context (`Beacon Hill Community Health`, attending physician NPI, CCN referral number) | Displays VA Medical Center facility context (`VA Boston Healthcare System`) |
| **Print Letterhead** | Renders civilian medical stationery (`VA Community Care Network Authorized Provider Letterhead`) with physician signature block | Renders official *United States Department of Veterans Affairs* letterhead |

---

## 6. Downstream Developer & Fork Governance Rules

All developers, contributors, healthcare systems, and commercial entities forking or adopting PocketGull code **MUST** adhere to the following invariants:

1. **Retain Non-Governmental Disclaimers**: Do not remove, suppress, or modify the `"Independent Healthcare Practice"` disclaimer banner in deployments hosted outside official `.gov` or `.mil` domains.
2. **Do Not Claim Agency Representation**: Never publish marketing materials, domain names, or social profiles claiming that this software is an "official VA portal" or an "official federal app."
3. **Preserve Section 508 & WCAG 2.2 AAA Contrast**: If styling or modifying components, maintain the minimum 7:1 contrast ratio, 44px+ hitboxes, and keyboard-accessible focus rings.
4. **Zero PHI Egress Invariant**: All PACT Act calculations, DBQ nexus phrasing, and FHIR US Core R4 transformations must remain client-side or within HIPAA-compliant, Business Associate Agreement (BAA) certified private infrastructure.

---

<p align="center">
  <sub>Document maintained under PocketGull LLC Governance Protocol. For questions or institutional inquiries, contact legal@pocketgull.app.</sub>
</p>
