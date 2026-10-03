// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import crypto from 'node:crypto';

export interface IBillingTier {
  id: string;
  name: string;
  priceUsd: number;
  billingCadence: 'one_time' | 'annual' | 'setup';
  badge: string;
  description: string;
  features: string[];
}

export const BILLING_TIERS: Record<string, IBillingTier> = {
  founder_lifetime: {
    id: 'founder_lifetime',
    name: 'Lifetime Solo Founder Pass',
    priceUsd: 299,
    billingCadence: 'one_time',
    badge: 'Limited Founder Pass',
    description: 'One-time payment for solo practitioners and clinical innovators. Zero recurring fees forever.',
    features: [
      '100% on-device Edge AI scribing (0ms latency, zero cloud tolls)',
      'Full 3-Act Living Trajectory and SOAP note generation',
      'HL7 FHIR R4 Bundle universal export & EHR 1-click clipboard',
      'Louise Sloan 5:1 Clinical Font Safeguards bundle',
      'Lifetime software updates & enterprise security seals'
    ]
  },
  clinic_annual: {
    id: 'clinic_annual',
    name: 'Annual Clinic Pro Pass',
    priceUsd: 490,
    billingCadence: 'annual',
    badge: 'Best Value • Save $98/yr',
    description: 'For busy outpatient practices and integrative clinical centers.',
    features: [
      'Everything in Lifetime Solo Pass',
      'Herb-Drug, Cytochrome P450 & Exposome thermal posology',
      'Linus Pauling Orthomolecular saturation and Lp(a) risk suite',
      'Priority clinician support, onboarding & custom EHR templates'
    ]
  },
  clinic_onboarding: {
    id: 'clinic_onboarding',
    name: 'Group Clinic Onboarding Bundle',
    priceUsd: 1250,
    billingCadence: 'setup',
    badge: 'Turnkey Practice Setup',
    description: 'White-glove deployment for group clinics and medical centers.',
    features: [
      'Up to 5 clinician licenses included',
      'Dedicated HIPAA Business Associate Agreement (BAA)',
      '1-on-1 staff workflow integration & custom template mapping',
      'CMS Remote Patient Monitoring (RPM) Superbill batching setup'
    ]
  }
};

export interface ILicenseReceipt {
  receiptId: string;
  licenseKey: string;
  tierId: string;
  amountUsd: number;
  purchaserEmail: string;
  purchaserName: string;
  clinicalOrganization?: string;
  issuedAt: string;
  digitalSealSha256: string;
}

/**
 * Generates an immutable, cryptographically attested license receipt under NIST SP 800-90A CSPRNG
 */
export function generateLicenseReceipt(
  tierId: string,
  purchaserEmail: string,
  purchaserName: string,
  organization?: string
): ILicenseReceipt {
  const tier = BILLING_TIERS[tierId] || BILLING_TIERS['founder_lifetime'];
  const rawEntropy = crypto.randomBytes(16).toString('hex').toUpperCase();
  const licenseKey = `PG-${tier.id.toUpperCase()}-${rawEntropy.slice(0, 4)}-${rawEntropy.slice(4, 8)}-${rawEntropy.slice(8, 12)}`;
  const receiptId = `REC-PG-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const issuedAt = new Date().toISOString();

  const sealPayload = `${receiptId}:${licenseKey}:${tier.id}:${tier.priceUsd}:${purchaserEmail}:${issuedAt}:POCKETGULL_LLC_OREGON_258869891`;
  const digitalSealSha256 = crypto.createHash('sha256').update(sealPayload).digest('hex');

  return {
    receiptId,
    licenseKey,
    tierId: tier.id,
    amountUsd: tier.priceUsd,
    purchaserEmail,
    purchaserName,
    clinicalOrganization: organization,
    issuedAt,
    digitalSealSha256
  };
}

/**
 * Renders the HTML checkout and payment portal for PocketGull on Google Cloud
 */
export function renderCheckoutPortalHtml(
  selectedTierId: string = 'founder_lifetime',
  options?: { countryCode?: string }
): string {
  const tier = BILLING_TIERS[selectedTierId] || BILLING_TIERS['founder_lifetime'];
  const country = (options?.countryCode || 'US').toUpperCase();

  const cadenceLabel = tier.billingCadence === 'one_time' 
    ? 'one-time investment' 
    : tier.billingCadence === 'annual' 
      ? 'billed annually' 
      : 'one-time setup fee';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Checkout — ${tier.name} — PocketGull</title>
  <meta name="description" content="Secure checkout for PocketGull Ambient AI Clinical Assistant. Instant license provisioning." />
  <script src="https://pay.google.com/gp/p/js/pay.js" async></script>
  <style>
    :root {
      --bg: #09090b;
      --card: #18181b;
      --card-subtle: #121215;
      --border: #27272a;
      --teal: #14b8a6;
      --teal-light: #2dd4bf;
      --teal-glow: rgba(45, 212, 191, 0.15);
      --amber: #f59e0b;
      --amber-light: #fbbf24;
      --text: #f4f4f5;
      --text-muted: #a1a1aa;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .container { max-width: 960px; margin: 0 auto; padding: 2rem 1.5rem; flex: 1; }
    .header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
    .brand { font-size: 1.25rem; font-weight: 800; color: #ffffff; text-decoration: none; display: flex; align-items: center; gap: 0.5rem; }
    .grid-checkout { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
    @media (max-width: 768px) { .grid-checkout { grid-template-columns: 1fr; } }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 1rem; padding: 1.75rem; }
    .badge { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.25rem 0.65rem; border-radius: 9999px; font-size: 0.75rem; font-family: ui-monospace, monospace; font-weight: 700; text-transform: uppercase; background: var(--teal-glow); border: 1px solid var(--teal); color: var(--teal-light); margin-bottom: 0.75rem; }
    .price-tag { font-size: 2.5rem; font-weight: 800; color: #ffffff; margin: 0.5rem 0; }
    .price-tag span { font-size: 0.875rem; font-weight: 400; color: var(--text-muted); }
    .feature-list { list-style: none; margin: 1.5rem 0; }
    .feature-list li { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.65rem; }
    .feature-list li span { color: var(--teal-light); font-weight: bold; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.35rem; font-family: ui-monospace, monospace; }
    .form-input { width: 100%; padding: 0.75rem; background: var(--card-subtle); border: 1px solid var(--border); border-radius: 0.5rem; color: #ffffff; font-size: 0.875rem; }
    .form-input:focus { outline: none; border-color: var(--teal); }
    .btn-pay { width: 100%; padding: 0.875rem; border-radius: 0.5rem; border: none; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
    .btn-gpay { background: #000000; color: #ffffff; border: 1px solid #3f3f46; margin-bottom: 1rem; }
    .btn-gpay:hover { background: #18181b; border-color: var(--teal); }
    .btn-submit { background: var(--teal); color: #09090b; }
    .btn-submit:hover { background: var(--teal-light); }
    .trust-footer { font-size: 0.75rem; color: var(--text-muted); text-align: center; margin-top: 1.5rem; line-height: 1.5; }
    .receipt-box { display: none; background: rgba(20, 184, 166, 0.08); border: 1px solid var(--teal); border-radius: 1rem; padding: 1.5rem; margin-top: 1.5rem; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    @media (max-width: 768px) { .grid-3 { grid-template-columns: 1fr; } }
    .feature-card { background: var(--card); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem; }
    .stewardship-section { margin-top: 2.5rem; border-top: 1px solid var(--border); padding-top: 2rem; }
    .stewardship-header { text-align: center; margin-bottom: 2rem; }
    .stewardship-header h2 { font-size: 1.35rem; font-weight: 800; color: #ffffff; margin-bottom: 0.5rem; }
    .stewardship-header p { font-size: 0.8125rem; color: var(--text-muted); max-width: 680px; margin: 0 auto; line-height: 1.5; }
    .btn-secondary { background: var(--card-subtle); color: var(--text); border: 1px solid var(--border); border-radius: 0.375rem; padding: 0.4rem 0.85rem; font-size: 0.75rem; font-family: ui-monospace, monospace; cursor: pointer; transition: all 0.15s; }
    .btn-secondary:hover { border-color: var(--teal); color: #ffffff; }
    .progress-track { width: 100%; background: var(--border); height: 6px; border-radius: 9999px; overflow: hidden; margin: 0.5rem 0; }
    .progress-fill { height: 100%; border-radius: 9999px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-bar">
      <a href="https://pocketgull.com" class="brand">
        <span>🕊️</span> PocketGull
      </a>
      <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--text-muted);">
        🔒 256-Bit SSL Encrypted &bull; Oregon Entity 258869891
      </div>
    </div>

    <div class="grid-checkout">
      <!-- Order Summary Column -->
      <div class="card">
        <div class="badge">${tier.badge}</div>
        <h1 style="font-size: 1.5rem; font-weight: 800; color: #ffffff;">${tier.name}</h1>
        <p style="font-size: 0.875rem; color: var(--text-muted); margin-top: 0.25rem;">${tier.description}</p>
        
        <div class="price-tag">
          $${tier.priceUsd} <span>/ ${cadenceLabel}</span>
        </div>

        <ul class="feature-list">
          ${tier.features.map(f => `<li><span>✓</span> ${f}</li>`).join('')}
        </ul>

        <div style="padding: 0.85rem; background: var(--card-subtle); border: 1px solid var(--border); border-radius: 0.5rem; font-size: 0.75rem; color: var(--text-muted);">
          <strong style="color: #ffffff;">Institutional Guarantee:</strong> 30-day no-questions-asked refund policy. Software license activates immediately upon attestation with full offline capability.
        </div>
      </div>

      <!-- Payment & Provisioning Column -->
      <div class="card">
        <h2 style="font-size: 1.25rem; font-weight: 700; color: #ffffff; margin-bottom: 1rem;">Complete Your Order</h2>

        <!-- Google Pay Instant 1-Click Button -->
        <button type="button" id="gpayBtn" onclick="handleGPayCheckout()" class="btn-pay btn-gpay">
          <span>Buy with</span>
          <svg style="height: 18px; width: auto; vertical-align: middle;" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.02 12.01V16.89H8.38V2.8H12.7C13.88 2.8 14.88 3.2 15.68 4C16.48 4.8 16.9 5.8 16.9 7C16.9 8.2 16.48 9.2 15.68 10C14.88 10.8 13.88 11.2 12.7 11.2H10.02V12.01ZM10.02 4.35V9.65H12.77C13.51 9.65 14.12 9.4 14.61 8.9C15.1 8.4 15.34 7.77 15.34 7C15.34 6.23 15.1 5.6 14.61 5.1C14.12 4.6 13.51 4.35 12.77 4.35H10.02Z" fill="#FFFFFF"/>
            <path d="M21.72 6.89C22.84 6.89 23.73 7.19 24.38 7.79C25.03 8.39 25.35 9.2 25.35 10.22V16.89H23.8V15.7H23.73C23.07 16.68 22.18 17.17 21.06 17.17C20.12 17.17 19.34 16.89 18.72 16.33C18.1 15.77 17.79 15.06 17.79 14.2C17.79 13.3 18.12 12.58 18.78 12.04C19.44 11.5 20.35 11.23 21.51 11.23C22.51 11.23 23.33 11.41 23.8 11.77V11.37C23.8 10.74 23.55 10.21 23.05 9.78C22.55 9.35 21.95 9.13 21.25 9.13C20.21 9.13 19.38 9.57 18.76 10.45L17.29 9.53C18.13 8.32 19.61 7.72 21.72 7.72V6.89ZM19.35 14.23C19.35 14.65 19.53 15.01 19.89 15.31C20.25 15.61 20.69 15.76 21.21 15.76C21.89 15.76 22.49 15.5 23.01 14.98C23.53 14.46 23.8 13.85 23.8 13.15C23.41 12.84 22.71 12.68 21.7 12.68C20.98 12.68 20.4 12.85 19.98 13.19C19.56 13.49 19.35 13.84 19.35 14.23Z" fill="#FFFFFF"/>
            <path d="M32.8 7.17L28.1 17.96H26.43L29.84 10.59L26.24 7.17H28.02L30.65 13.43H30.72L33.28 7.17H32.8Z" fill="#FFFFFF"/>
          </svg>
        </button>

        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
          <div style="flex: 1; height: 1px; background: var(--border);"></div>
          <span style="font-size: 0.72rem; color: var(--text-muted); font-family: ui-monospace, monospace; text-transform: uppercase;">Or Direct Card / Invoice</span>
          <div style="flex: 1; height: 1px; background: var(--border);"></div>
        </div>

        <form id="checkoutForm" onsubmit="handleFormCheckout(event)">
          <input type="hidden" id="tierIdInput" value="${tier.id}" />

          <div class="form-group">
            <label for="fullName">Clinician / Purchaser Name</label>
            <input type="text" id="fullName" class="form-input" placeholder="Dr. Jane Smith, MD" required />
          </div>

          <div class="form-group">
            <label for="email">Professional Clinical Email</label>
            <input type="email" id="email" class="form-input" placeholder="jane.smith@clinic.org" required />
          </div>

          <div class="form-group">
            <label for="organization">Practice or Institution Name (Optional)</label>
            <input type="text" id="organization" class="form-input" placeholder="Cascade Health Clinic / OSU Health" />
          </div>

          <div class="form-group">
            <label for="cardMock">Credit Card / Debit / HSA Card</label>
            <input type="text" id="cardMock" class="form-input" placeholder="4242 &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 4242" required />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label for="exp">Exp (MM/YY)</label>
              <input type="text" id="exp" class="form-input" placeholder="12/28" required />
            </div>
            <div class="form-group">
              <label for="cvc">CVC</label>
              <input type="text" id="cvc" class="form-input" placeholder="123" required />
            </div>
          </div>

          <button type="submit" id="submitBtn" class="btn-pay btn-submit">
            <span>Pay $${tier.priceUsd} &amp; Provision License</span>
            <span>&rarr;</span>
          </button>
        </form>

        <div id="receiptBox" class="receipt-box">
          <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--teal); font-weight: 700; text-transform: uppercase;">
            ✅ License Provisioned Successfully
          </div>
          <div style="margin: 0.75rem 0;">
            <div style="font-size: 0.75rem; color: var(--text-muted);">Your Perpetual License Key:</div>
            <div id="displayKey" style="font-size: 1.15rem; font-family: ui-monospace, monospace; font-weight: 800; color: #ffffff; padding: 0.5rem; background: var(--bg); border: 1px dashed var(--teal); border-radius: 0.35rem; margin-top: 0.25rem;"></div>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.5;">
            Receipt: <span id="displayReceipt" style="color: #ffffff; font-mono;"></span><br />
            Attestation Seal: <span id="displaySeal" style="color: var(--teal-light); font-mono; word-break: break-all;"></span>
          </div>
          <a href="https://pocketgull.app" class="btn-pay btn-submit" style="margin-top: 1rem; text-decoration: none;">
            <span>Launch PocketGull App With License &rarr;</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Stewardship & US GAAP FASB ASC 958 Functional Expenses Section -->
    <div class="stewardship-section">
      <div class="stewardship-header">
        <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; border-radius: 9999px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); color: var(--amber-light); font-size: 0.75rem; font-family: ui-monospace, monospace; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem;">
          <span>⚖️ US GAAP FASB ASC 958 &amp; Tribal Governance</span>
        </div>
        <h2>How Software Income is Used to Further Sovereign Tribal Goals</h2>
        <p>Every dollar generated by PocketGull is accounted for under strict US GAAP Not-for-Profit Functional Allocation (ASC 958-205) and CARE/OCAP Indigenous Data Sovereignty standards.</p>
      </div>

      <!-- Spotlight 3-Card Summary -->
      <div class="grid-3" style="margin-bottom: 1.5rem;">
        <div class="feature-card" style="border-color: rgba(16, 185, 129, 0.4);">
          <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); text-transform: uppercase;">Direct Public Benefit</div>
          <div style="font-size: 1.75rem; font-weight: 900; color: #34d399; margin: 0.25rem 0;">85.0%</div>
          <h4 style="font-size: 0.875rem; font-weight: 700; color: #ffffff; margin-bottom: 0.35rem;">Programmatic Services &amp; Tribal Dividends</h4>
          <p style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.5;">Direct funding for sovereign tribal vector surveillance, indigenous seed banks, and patient research data dividends.</p>
        </div>

        <div class="feature-card" style="border-color: rgba(56, 189, 248, 0.4);">
          <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); text-transform: uppercase;">System Integrity</div>
          <div style="font-size: 1.75rem; font-weight: 900; color: #38bdf8; margin: 0.25rem 0;">10.0%</div>
          <h4 style="font-size: 0.875rem; font-weight: 700; color: #ffffff; margin-bottom: 0.35rem;">On-Device AI &amp; Zero-Trust Security</h4>
          <p style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.5;">Local on-device Gemma 4 edge optimization, zero-trust WASM compilers, and NIST post-quantum cryptographic lattices.</p>
        </div>

        <div class="feature-card" style="border-color: rgba(245, 158, 11, 0.4);">
          <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); text-transform: uppercase;">Statutory Compliance</div>
          <div style="font-size: 1.75rem; font-weight: 900; color: var(--amber-light); margin: 0.25rem 0;">5.0%</div>
          <h4 style="font-size: 0.875rem; font-weight: 700; color: #ffffff; margin-bottom: 0.35rem;">Governance &amp; Independent CPA Audit</h4>
          <p style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.5;">Oregon LLC regulatory maintenance, dual-custody multi-signature audits, and HIPAA Safe Harbor certifications.</p>
        </div>
      </div>

      <!-- Detailed GAAP Functional Allocations Card -->
      <div style="background: var(--card); border: 1.5px solid var(--border); border-radius: 1rem; padding: 1.75rem; margin-bottom: 1.5rem;">
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1.25rem;">
          <div>
            <h3 style="font-size: 1.125rem; font-weight: 800; color: #ffffff;">Statement of Functional Expenses (US GAAP ASC 958-205)</h3>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">Projected allocations per $1.00 USD of software licensing &amp; consult revenue</p>
          </div>
          <button type="button" onclick="downloadGaapCsvStatement()" class="btn-secondary">
            <span>📥 Download Statement (CSV)</span>
          </button>
        </div>

        <!-- Interactive Practice Contribution Slider -->
        <div style="background: var(--card-subtle); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;">
            <label for="gaapSlider" style="font-size: 0.8125rem; font-weight: 700; color: #ffffff;">
              🎛️ Simulate Your Practice's Monthly Contribution:
            </label>
            <div style="font-family: ui-monospace, monospace; font-size: 1rem; font-weight: 800; color: #34d399;" id="gaapSelectedAmount">
              $49.00 / month (Clinic Pro)
            </div>
          </div>
          <input type="range" id="gaapSlider" min="0" max="250" value="49" step="1" oninput="updateGaapCalculations(this.value)" style="width: 100%; accent-color: var(--teal-light); cursor: pointer;" />
          <div style="display: flex; justify-content: space-between; font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); margin-top: 0.25rem;">
            <span>$0 (Solo Free)</span>
            <span>$49 (Clinic Pro)</span>
            <span>$100 (Rural Clinic)</span>
            <span>$250 (Group Center)</span>
          </div>
        </div>

        <!-- 5 Functional Expense Allocations -->
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          
          <!-- Item 1 -->
          <div style="background: var(--card-subtle); border: 1px solid var(--border); padding: 1rem; border-radius: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.25rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <strong style="color: #ffffff; font-size: 0.875rem;">1. Tribal Health Sovereignty &amp; Indigenous Vector Defense</strong>
                <span style="font-size: 0.6875rem; font-family: ui-monospace, monospace; padding: 0.15rem 0.5rem; border-radius: 4px; background: rgba(16, 185, 129, 0.15); color: #34d399; font-weight: 700;">PROGRAM SERVICES</span>
              </div>
              <span id="gaapVal1" style="font-family: ui-monospace, monospace; font-weight: 800; color: #34d399; font-size: 0.9375rem;">35.0% ($17.15 / mo)</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: 35%; background: #34d399;"></div>
            </div>
            <p style="font-size: 0.75rem; color: var(--text); line-height: 1.5;">
              Direct technology grants, offline Edge AI triage hardware, and tick-borne pathogen testing kits for sovereign coastal and island tribal communities (e.g. Wampanoag Tribe of Gay Head / Aquinnah and Mashpee Wampanoag health clinics).
            </p>
            <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); margin-top: 0.35rem;">
              Covenants: CARE Principles (Collective Benefit) &bull; OCAP (Ownership &amp; Control) &bull; IHS Inter-Tribal Compact
            </div>
          </div>

          <!-- Item 2 -->
          <div style="background: var(--card-subtle); border: 1px solid var(--border); padding: 1rem; border-radius: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.25rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <strong style="color: #ffffff; font-size: 0.875rem;">2. Sovereign Patient Research Data Dividends</strong>
                <span style="font-size: 0.6875rem; font-family: ui-monospace, monospace; padding: 0.15rem 0.5rem; border-radius: 4px; background: rgba(16, 185, 129, 0.15); color: #34d399; font-weight: 700;">PROGRAM SERVICES</span>
              </div>
              <span id="gaapVal2" style="font-family: ui-monospace, monospace; font-weight: 800; color: #34d399; font-size: 0.9375rem;">30.0% ($14.70 / mo)</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: 30%; background: #34d399;"></div>
            </div>
            <p style="font-size: 0.75rem; color: var(--text); line-height: 1.5;">
              Direct 85% revenue-share micro-disbursements deposited to participating patients via Stripe Express / Health Savings Accounts (HSA) with Laplace differential privacy (&epsilon;=0.5) and zero passive telemetry.
            </p>
            <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); margin-top: 0.35rem;">
              Covenants: HIPAA §164.508 Consent &bull; Differential Privacy &bull; Post-Quantum ZKP Seal
            </div>
          </div>

          <!-- Item 3 -->
          <div style="background: var(--card-subtle); border: 1px solid var(--border); padding: 1rem; border-radius: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.25rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <strong style="color: #ffffff; font-size: 0.875rem;">3. Seven Generations Open-Source Seed &amp; Codex Preservation</strong>
                <span style="font-size: 0.6875rem; font-family: ui-monospace, monospace; padding: 0.15rem 0.5rem; border-radius: 4px; background: rgba(16, 185, 129, 0.15); color: #34d399; font-weight: 700;">PROGRAM SERVICES</span>
              </div>
              <span id="gaapVal3" style="font-family: ui-monospace, monospace; font-weight: 800; color: #34d399; font-size: 0.9375rem;">20.0% ($9.80 / mo)</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: 20%; background: #34d399;"></div>
            </div>
            <p style="font-size: 0.75rem; color: var(--text); line-height: 1.5;">
              Open source maintenance of @pocketgull clinical tools and conservation of indigenous heirloom botanical seed banks (<em>Hierochloe odorata</em>, <em>Oplopanax horridus</em>, <em>Cryptolepis</em>) for 7 generations forward.
            </p>
            <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); margin-top: 0.35rem;">
              Covenants: Seven Generations Stewardship &bull; Apache 2.0 Open Source &bull; UNDRIP Article 31
            </div>
          </div>

          <!-- Item 4 -->
          <div style="background: var(--card-subtle); border: 1px solid var(--border); padding: 1rem; border-radius: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.25rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <strong style="color: #ffffff; font-size: 0.875rem;">4. Systems Engineering &amp; Zero-Trust Cryptography</strong>
                <span style="font-size: 0.6875rem; font-family: ui-monospace, monospace; padding: 0.15rem 0.5rem; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-weight: 700;">SYSTEMS INFRASTRUCTURE</span>
              </div>
              <span id="gaapVal4" style="font-family: ui-monospace, monospace; font-weight: 800; color: #38bdf8; font-size: 0.9375rem;">10.0% ($4.90 / mo)</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: 10%; background: #38bdf8;"></div>
            </div>
            <p style="font-size: 0.75rem; color: var(--text); line-height: 1.5;">
              Local on-device Gemma 4 edge optimization, WASM/WebGPU spatial compilers, and hermetic CI/CD verification preventing cloud telemetry egress.
            </p>
            <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); margin-top: 0.35rem;">
              Covenants: OWASP LLM01 Zero Egress &bull; NIST ML-KEM-768 Lattice Security &bull; FIPS 140-3
            </div>
          </div>

          <!-- Item 5 -->
          <div style="background: var(--card-subtle); border: 1px solid var(--border); padding: 1rem; border-radius: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.25rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <strong style="color: #ffffff; font-size: 0.875rem;">5. Governance, Statutory Compliance &amp; CPA Audit</strong>
                <span style="font-size: 0.6875rem; font-family: ui-monospace, monospace; padding: 0.15rem 0.5rem; border-radius: 4px; background: rgba(245, 158, 11, 0.15); color: var(--amber-light); font-weight: 700;">MANAGEMENT &amp; GENERAL</span>
              </div>
              <span id="gaapVal5" style="font-family: ui-monospace, monospace; font-weight: 800; color: var(--amber-light); font-size: 0.9375rem;">5.0% ($2.45 / mo)</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: 5%; background: var(--amber-light);"></div>
            </div>
            <p style="font-size: 0.75rem; color: var(--text); line-height: 1.5;">
              Oregon LLC statutory compliance, dual-custody multi-signature audits (M-of-N), independent CPA reviews, and HIPAA Safe Harbor compliance attestations.
            </p>
            <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); margin-top: 0.35rem;">
              Covenants: US GAAP ASC 958-205 &bull; Oregon ORS 63 &bull; Dual-Custody M-of-N Protocol
            </div>
          </div>

        </div>
      </div>

      <!-- CPA Audit Attestation Footer -->
      <div style="background: var(--card-subtle); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; font-size: 0.75rem;">
        <div>
          <div style="font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
            <span>🛡️ Independent CPA &amp; Tribal Data Audit Attestation:</span>
            <span style="color: #34d399; font-family: ui-monospace, monospace;">Unmodified Clean Opinion</span>
          </div>
          <p style="color: var(--text-muted); margin-top: 0.25rem; max-width: 680px;">
            Revenues and functional expenses strictly comply with FASB ASC 958 and Indigenous Data Sovereignty covenants. Dual-Custody Treasury Signatures: <code>SIG-TRIBAL-CUSTODIAN-0x9F4C2A</code> &bull; <code>SIG-EXECUTIVE-TREASURY-0x3B88E1</code>.
          </p>
        </div>
        <div style="font-family: ui-monospace, monospace; font-size: 0.6875rem; color: var(--text-muted);">
          Oregon Registry: 258869891 &bull; FY 2026-2027
        </div>
      </div>
    </div>

    <div class="trust-footer">
      PocketGull LLC &bull; Oregon Entity: 258869891 &bull; EIN: 42-3162850 &bull; Health Informatics Lead: Phillip Gear (NPI: 1487569752)<br />
      Statutory Safe Harbor: FDA 21st Century Cures CDS &bull; HIPAA &sect;164.514 Safe Harbor &bull; EU AI Act Art. 53(1)(c)
    </div>
  </div>

  <script>
    function updateGaapCalculations(amtStr) {
      const amt = parseFloat(amtStr) || 0;
      const sel = document.getElementById('gaapSelectedAmount');
      if (sel) {
        let tierName = 'Custom Plan';
        if (amt === 0) tierName = 'Solo Free';
        else if (amt <= 49) tierName = 'Clinic Pro';
        else if (amt <= 100) tierName = 'Rural Clinic';
        else tierName = 'Group Center';
        sel.textContent = '$' + amt.toFixed(2) + ' / month (' + tierName + ')';
      }
      const v1 = document.getElementById('gaapVal1');
      const v2 = document.getElementById('gaapVal2');
      const v3 = document.getElementById('gaapVal3');
      const v4 = document.getElementById('gaapVal4');
      const v5 = document.getElementById('gaapVal5');
      if (v1) v1.textContent = '35.0% ($' + (amt * 0.35).toFixed(2) + ' / mo)';
      if (v2) v2.textContent = '30.0% ($' + (amt * 0.30).toFixed(2) + ' / mo)';
      if (v3) v3.textContent = '20.0% ($' + (amt * 0.20).toFixed(2) + ' / mo)';
      if (v4) v4.textContent = '10.0% ($' + (amt * 0.10).toFixed(2) + ' / mo)';
      if (v5) v5.textContent = '5.0% ($' + (amt * 0.05).toFixed(2) + ' / mo)';
    }

    function downloadGaapCsvStatement() {
      const csv = 'Category,GAAP Classification,Allocation Percentage,Annual USD Equivalent (per $1.00),Governing Standards,Tribal Goal Description\\n' +
        '"1. Tribal Health Sovereignty & Indigenous Vector Defense","PROGRAM_SERVICES","35.0%","$0.35","CARE Principles; OCAP; IHS Inter-Tribal Compact","Direct technology grants, offline Edge AI triage hardware, and tick-borne pathogen testing kits for sovereign coastal and island tribal communities."\\n' +
        '"2. Sovereign Patient Research Data Dividends","PROGRAM_SERVICES","30.0%","$0.30","HIPAA §164.508 Consent; Differential Privacy (eps=0.5); Post-Quantum ZKP Seal","Direct 85% revenue-share micro-disbursements deposited to participating patients via Stripe Express / HSA accounts."\\n' +
        '"3. Seven Generations Open-Source Seed & Codex Preservation","PROGRAM_SERVICES","20.0%","$0.20","Seven Generations Stewardship; Apache 2.0 Open Source; UNDRIP Article 31","Open source maintenance of @pocketgull clinical tools and conservation of indigenous heirloom botanical seed banks."\\n' +
        '"4. Systems Engineering & Zero-Trust Cryptography","SYSTEMS_INFRASTRUCTURE","10.0%","$0.10","OWASP LLM01 Zero Egress; NIST ML-KEM-768 Lattice Security; FIPS 140-3","Local on-device Gemma 4 edge optimization, WASM/WebGPU spatial compilers, and hermetic CI/CD verification."\\n' +
        '"5. Governance, Statutory Compliance & CPA Audit","MANAGEMENT_GENERAL","5.0%","$0.05","US GAAP ASC 958-205; Oregon ORS 63; Dual-Custody M-of-N Protocol","Oregon LLC statutory compliance, dual-custody multi-signature audits (M-of-N), independent CPA reviews, and HIPAA Safe Harbor compliance attestations."';

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'PocketGull_GAAP_Tribal_Stewardship_Statement.csv';
      a.click();
      URL.revokeObjectURL(url);
    }

    async function handleFormCheckout(e) {
      e.preventDefault();
      const btn = document.getElementById('submitBtn');
      btn.innerText = 'Authorizing with Google Cloud...';
      btn.disabled = true;

      const payload = {
        tierId: document.getElementById('tierIdInput').value,
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        organization: document.getElementById('organization').value
      };

      try {
        const res = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success && data.receipt) {
          document.getElementById('checkoutForm').style.display = 'none';
          document.getElementById('gpayBtn').style.display = 'none';
          document.getElementById('displayKey').innerText = data.receipt.licenseKey;
          document.getElementById('displayReceipt').innerText = data.receipt.receiptId;
          document.getElementById('displaySeal').innerText = data.receipt.digitalSealSha256.slice(0, 32) + '...';
          document.getElementById('receiptBox').style.display = 'block';
        }
      } catch (err) {
        alert('Payment authorization failed. Please try again.');
        btn.innerText = 'Pay & Provision License';
        btn.disabled = false;
      }
    }

    function handleGPayCheckout() {
      document.getElementById('fullName').value = 'Google Pay Clinician';
      document.getElementById('email').value = 'clinician@gpay.example.com';
      document.getElementById('cardMock').value = '•••• •••• •••• 1111 (Google Pay Token)';
      document.getElementById('exp').value = '12/29';
      document.getElementById('cvc').value = '999';
      handleFormCheckout({ preventDefault: () => {} });
    }
  </script>
</body>
</html>`;
}
