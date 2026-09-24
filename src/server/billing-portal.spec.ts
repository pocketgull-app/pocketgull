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
});
