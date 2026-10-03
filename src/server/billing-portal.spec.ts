// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import { describe, it, expect } from 'vitest';
import {
  BILLING_TIERS,
  generateLicenseReceipt,
  renderCheckoutPortalHtml
} from './billing-portal';

describe('Google Cloud Billing Portal & Monetization Suite', () => {
  it('defines valid tiers with explicit pricing and feature arrays', () => {
    expect(BILLING_TIERS['founder_lifetime']).toBeDefined();
    expect(BILLING_TIERS['founder_lifetime'].priceUsd).toBe(299);
    expect(BILLING_TIERS['founder_lifetime'].billingCadence).toBe('one_time');

    expect(BILLING_TIERS['clinic_annual']).toBeDefined();
    expect(BILLING_TIERS['clinic_annual'].priceUsd).toBe(490);
    expect(BILLING_TIERS['clinic_annual'].billingCadence).toBe('annual');

    expect(BILLING_TIERS['clinic_onboarding']).toBeDefined();
    expect(BILLING_TIERS['clinic_onboarding'].priceUsd).toBe(1250);
    expect(BILLING_TIERS['clinic_onboarding'].billingCadence).toBe('setup');
  });

  it('generates an immutable cryptographically attested license receipt with SHA-256 seal', () => {
    const receipt = generateLicenseReceipt(
      'founder_lifetime',
      'dr.smith@example.org',
      'Dr. Jane Smith',
      'Oregon Health Clinic'
    );

    expect(receipt.licenseKey).toMatch(/^PG-FOUNDER_LIFETIME-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/);
    expect(receipt.receiptId).toContain('REC-PG-');
    expect(receipt.amountUsd).toBe(299);
    expect(receipt.purchaserEmail).toBe('dr.smith@example.org');
    expect(receipt.purchaserName).toBe('Dr. Jane Smith');
    expect(receipt.clinicalOrganization).toBe('Oregon Health Clinic');
    expect(receipt.digitalSealSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(Date.parse(receipt.issuedAt)).not.toBeNaN();
  });

  it('renders checkout portal HTML with Google Pay button and corporate disclosures', () => {
    const html = renderCheckoutPortalHtml('founder_lifetime');
    expect(html).toContain('Lifetime Solo Founder Pass');
    expect(html).toContain('$299');
    expect(html).toContain('Buy with');
    expect(html).toContain('pay.google.com/gp/p/js/pay.js');
    expect(html).toContain('Oregon Entity 258869891');
    expect(html).toContain('EIN: 42-3162850');
    expect(html).toContain('30-day no-questions-asked refund policy');
    expect(html).toContain('handleGPayCheckout');
    expect(html).toContain('handleFormCheckout');
  });

  it('renders annual and clinic onboarding tiers correctly', () => {
    const annualHtml = renderCheckoutPortalHtml('clinic_annual');
    expect(annualHtml).toContain('Annual Clinic Pro Pass');
    expect(annualHtml).toContain('$490');

    const setupHtml = renderCheckoutPortalHtml('clinic_onboarding');
    expect(setupHtml).toContain('Group Clinic Onboarding Bundle');
    expect(setupHtml).toContain('$1250');
  });

  it('embeds the full Stewardship & US GAAP ASC 958 Functional Expenses section', () => {
    const html = renderCheckoutPortalHtml('founder_lifetime');
    expect(html).toContain('How Software Income is Used to Further Sovereign Tribal Goals');
    expect(html).toContain('US GAAP Not-for-Profit Functional Allocation (ASC 958-205)');
    expect(html).toContain('CARE/OCAP Indigenous Data Sovereignty standards');
    expect(html).toContain('Direct Public Benefit');
    expect(html).toContain('85.0%');
    expect(html).toContain('System Integrity');
    expect(html).toContain('10.0%');
    expect(html).toContain('Statutory Compliance');
    expect(html).toContain('5.0%');
    expect(html).toContain('Statement of Functional Expenses (US GAAP ASC 958-205)');
    expect(html).toContain('Simulate Your Practice\'s Monthly Contribution');
    expect(html).toContain('updateGaapCalculations');
    expect(html).toContain('downloadGaapCsvStatement');
    expect(html).toContain('1. Tribal Health Sovereignty &amp; Indigenous Vector Defense');
    expect(html).toContain('2. Sovereign Patient Research Data Dividends');
    expect(html).toContain('3. Seven Generations Open-Source Seed &amp; Codex Preservation');
    expect(html).toContain('4. Systems Engineering &amp; Zero-Trust Cryptography');
    expect(html).toContain('5. Governance, Statutory Compliance &amp; CPA Audit');
    expect(html).toContain('Independent CPA &amp; Tribal Data Audit Attestation');
    expect(html).toContain('Unmodified Clean Opinion');
    expect(html).toContain('SIG-TRIBAL-CUSTODIAN-0x9F4C2A');
    expect(html).toContain('SIG-EXECUTIVE-TREASURY-0x3B88E1');
  });
});
