// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

export interface ILegalFooterOptions {
  /** Optional current active page identifier for aria-current */
  activePage?: string;
  /** Whether to render top navigation links inside the footer */
  includeNavigationLinks?: boolean;
}

/**
 * Universal Legal Footer for all PocketGull web endpoints.
 * Enforces:
 * 1. Statutory Interoperability Safe Harbor (21st Century Cures Act, 45 CFR Part 171)
 * 2. Nominative Trademark Fair Use Disclaimers (Epic, Microsoft, Google, Amazon, Oracle, HL7, LOINC, SNOMED)
 * 3. FDA 520(o) Non-Device Demarcation and HIPAA § 164.514 Safe Harbor Attestation
 * 4. WCAG AAA accessible contrast and Monastic Paper / Obsidian Dark reading tone adaptability
 */
export function renderLegalFooterHtml(options: ILegalFooterOptions = {}): string {
  const includeNav = options.includeNavigationLinks !== false;

  return `
  <!-- Universal PocketGull Legal Footer -->
  <footer class="pocketgull-universal-footer" style="border-top: 1px solid var(--border); padding: 3rem 0; font-size: 0.8125rem; color: var(--text-muted); background: var(--bg); transition: background-color 0.3s ease, border-color 0.3s ease;">
    <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 1.5rem;">
      
      ${includeNav ? `
      <!-- Brand & Direct Navigation Links -->
      <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1.75rem; margin-bottom: 1.75rem;">
        <div>
          <div style="font-weight: 800; font-size: 1.05rem; color: var(--text); letter-spacing: -0.01em; margin-bottom: 0.25rem;">
            <span style="color: var(--teal-light);">🕊️</span> PocketGull LLC
          </div>
          <div style="font-size: 0.775rem;">
            Portland, Oregon &bull; Privacy &amp; DPO: <a href="mailto:dpo@pocketgull.app" style="color: var(--teal-light); text-decoration: none;">dpo@pocketgull.app</a> &bull; Support: <a href="mailto:support@pocketgull.com" style="color: var(--teal-light); text-decoration: none;">support@pocketgull.com</a>
          </div>
        </div>

        <nav class="footer-nav-links" style="display: flex; flex-wrap: wrap; gap: 1.25rem; font-size: 0.8125rem;" aria-label="Legal & Direct Navigation">
          <a href="https://pocketgull.app" style="color: var(--text-muted); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='var(--teal-light)'" onmouseout="this.style.color='var(--text-muted)'">Launch App</a>
          <a href="/articles" style="color: var(--text-muted); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='var(--teal-light)'" onmouseout="this.style.color='var(--text-muted)'">Clinical Articles</a>
          <a href="/case-studies" style="color: var(--text-muted); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='var(--teal-light)'" onmouseout="this.style.color='var(--text-muted)'">Case Studies Commons</a>
          <a href="/case-studies/nantucket-tick-radar" style="color: var(--text-muted); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='var(--teal-light)'" onmouseout="this.style.color='var(--text-muted)'">Nantucket Radar</a>
          <a href="/case-studies/neuro-sanctuary" style="color: var(--text-muted); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='var(--teal-light)'" onmouseout="this.style.color='var(--text-muted)'">MS Neuro-Sanctuary</a>
          <a href="/privacy-policy.html" style="color: var(--text-muted); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='var(--teal-light)'" onmouseout="this.style.color='var(--text-muted)'">Privacy Policy</a>
          <a href="/terms-of-service.html" style="color: var(--text-muted); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='var(--teal-light)'" onmouseout="this.style.color='var(--text-muted)'">Terms of Service</a>
          <a href="/robots.txt" style="color: var(--text-muted); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='var(--teal-light)'" onmouseout="this.style.color='var(--text-muted)'">robots.txt</a>
          <a href="/ai.txt" style="color: var(--text-muted); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='var(--teal-light)'" onmouseout="this.style.color='var(--text-muted)'">ai.txt</a>
        </nav>
      </div>` : ''}

      <!-- Statutory Safe Harbor & Institutional Demarcation -->
      <div style="display: flex; flex-direction: column; gap: 1rem; font-size: 0.735rem; line-height: 1.65; color: var(--text-muted);">
        <div>
          <strong style="color: var(--text);">Statutory Interoperability Safe Harbor (21st Century Cures Act &amp; 45 CFR Part 171):</strong>
          PocketGull is an independent, non-device clinical decision support (CDS) sidecar developed in strict compliance with the ONC Information Blocking Rule (45 CFR Part 171) enacted under the 21st Century Cures Act. PocketGull interfaces with certified electronic health record (EHR) technologies exclusively through federally recognized, open public specifications including HL7® FHIR® R4 (US Core Implementation Guide), SMART on FHIR, and HL7 CDS Hooks. PocketGull does not alter, restrict, proprietary-fence, or extract unauthorized patient records.
        </div>

        <div>
          <strong style="color: var(--text);">FDA 21 CFR Part 11 &amp; Non-Device Demarcation:</strong>
          PocketGull functions as clinical decision support software under Section 520(o) of the Federal Food, Drug, and Cosmetic Act (21 U.S.C. 360j(o)). PocketGull assists licensed clinicians in analyzing biophysical trajectories, medication safety setpoints, and stepped-care guidelines; it does not replace independent clinical judgment, does not issue autonomous diagnoses or prescriptions, and does not operate as an active medical device. All electronic transactions, cryptographic receipts, and state transformations adhere to FDA 21 CFR Part 11 electronic attestation standards.
        </div>

        <div>
          <strong style="color: var(--text);">Nominative Fair Use &amp; Third-Party Trademark Disclaimers:</strong>
          Epic, Epic Hyperspace, and Care Everywhere are registered trademarks of Epic Systems Corporation. Cerner and Oracle Health are registered trademarks of Oracle Corporation. MEDITECH is a registered trademark of Medical Information Technology, Inc. Microsoft, Windows, Azure, and Copilot are registered trademarks of Microsoft Corporation. Google, Chrome, Android, and Gemma are registered trademarks of Google LLC. Amazon, AWS, and Amazon Pharmacy are registered trademarks of Amazon.com, Inc. HL7, FHIR, and the FHIR flame logo are registered trademarks of Health Level Seven International. LOINC is a registered trademark of the Regenstrief Institute, Inc. SNOMED CT is a registered trademark of the International Health Terminology Standards Development Organisation (IHTSDO). Reference to third-party commercial software, EHR platforms, healthcare standards, or hardware marks is strictly for nominative, descriptive identification of compatible standards and interoperability targets, and does not imply affiliation, sponsorship, or endorsement.
        </div>

        <div style="border-top: 1px solid var(--border); padding-top: 1rem; margin-top: 0.5rem; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.75rem; font-family: ui-monospace, monospace; font-size: 0.7rem;">
          <div>&copy; 2026 PocketGull LLC &amp; Phillip Gear. All rights reserved. &bull; Registered Oregon Entity: 258869891</div>
          <div style="color: var(--teal-light);">WCAG AAA Compliant &bull; 100% HIPAA Safe Harbor (§ 164.514) &bull; Zero Cloud Egress by Default</div>
        </div>
      </div>

    </div>
  </footer>
  `;
}
