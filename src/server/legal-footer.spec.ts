// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import { describe, it, expect } from 'vitest';
import { renderLegalFooterHtml } from './legal-footer';

describe('Universal Legal Footer (renderLegalFooterHtml)', () => {
  it('renders complete statutory safe harbor and trademark disclaimers', () => {
    const html = renderLegalFooterHtml();

    // 21st Century Cures Act & ONC Information Blocking
    expect(html).toContain('Statutory Interoperability Safe Harbor');
    expect(html).toContain('21st Century Cures Act');
    expect(html).toContain('45 CFR Part 171');
    expect(html).toContain('HL7® FHIR® R4');
    expect(html).toContain('SMART on FHIR');
    expect(html).toContain('HL7 CDS Hooks');

    // FDA Non-Device Demarcation & Part 11
    expect(html).toContain('FDA 21 CFR Part 11');
    expect(html).toContain('Section 520(o)');
    expect(html).toContain('21 U.S.C. 360j(o)');

    // Nominative Trademark Disclaimers for Tech & Healthcare Giants
    expect(html).toContain('Nominative Fair Use &amp; Third-Party Trademark Disclaimers');
    expect(html).toContain('Epic, Epic Hyperspace, and Care Everywhere are registered trademarks of Epic Systems Corporation');
    expect(html).toContain('Oracle Health are registered trademarks of Oracle Corporation');
    expect(html).toContain('MEDITECH is a registered trademark of Medical Information Technology, Inc');
    expect(html).toContain('Microsoft, Windows, Azure, and Copilot are registered trademarks of Microsoft Corporation');
    expect(html).toContain('Google, Chrome, Android, and Gemma are registered trademarks of Google LLC');
    expect(html).toContain('Amazon, AWS, and Amazon Pharmacy are registered trademarks of Amazon.com, Inc');

    // Standards Bodies
    expect(html).toContain('Health Level Seven International');
    expect(html).toContain('Regenstrief Institute, Inc');
    expect(html).toContain('IHTSDO');

    // Corporate Identity
    expect(html).toContain('PocketGull LLC');
    expect(html).toContain('Registered Oregon Entity: 258869891');
    expect(html).toContain('WCAG AAA Compliant');
    expect(html).toContain('100% HIPAA Safe Harbor (§ 164.514)');
  });

  it('renders navigation links by default and respects options', () => {
    const htmlWithNav = renderLegalFooterHtml();
    expect(htmlWithNav).toContain('footer-nav-links');
    expect(htmlWithNav).toContain('Clinical Articles');
    expect(htmlWithNav).toContain('Case Studies Commons');
    expect(htmlWithNav).toContain('href="/ai.txt"');

    const htmlWithoutNav = renderLegalFooterHtml({ includeNavigationLinks: false });
    expect(htmlWithoutNav).not.toContain('footer-nav-links');
    expect(htmlWithoutNav).toContain('Statutory Interoperability Safe Harbor');
  });
});
