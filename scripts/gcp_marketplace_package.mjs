#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ID = 'gen-lang-client-0540208645';
const OUTPUT_DIR = path.join(__dirname, '..', 'dist', 'gcp_marketplace');

export function generateMarketplacePackage() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const listingSpec = {
    solution: {
      name: 'PocketGull Clinical Intelligence & Ambient CDS Platform',
      tagline: 'Zero-Cloud-PHI-Egress Ambient Clinical Scribing, Complex Systems Attractors & Precision Posology',
      category: 'Healthcare & Life Sciences',
      publisher: {
        name: 'PocketGull LLC',
        corporate_identity: 'Oregon Entity 258869891 | EIN: 42-3162850',
        website: 'https://pocketgull.com',
        support_email: 'dpo@pocketgull.app',
        sales_email: 'leads@pocketgull.app',
        npi: '1487569752',
        orcid: '0009-0008-1372-5381',
        zenodo_doi: '10.5281/zenodo.20647514'
      },
      compliance: [
        'HIPAA §164.514 Safe Harbor De-Identification',
        'FDA 21st Century Cures Act Non-Device CDS (§ 520(o)(1)(E))',
        'Google SAIF Level 3 (Secure AI Framework)',
        'EU AI Act Art. 53(1)(c) Machine-Readable TDM Reservation',
        'FHIR R4 Bundle Standard (HL7 International)',
        'GA4GH Phenopackets v2 (Global Alliance for Genomics and Health)',
        'CMS-0057-F Interoperability & Prior Authorization'
      ],
      integration_type: 'SAAS_SUBSCRIPTION',
      fulfillment: {
        signup_url: 'https://pocketgull.com/api/billing/checkout?gcp_marketplace=true',
        sso_type: 'GOOGLE_WORKLOAD_IDENTITY_FEDERATION'
      }
    }
  };

  const pricingSpec = {
    pricing_plans: [
      {
        plan_id: 'pocketgull_founder_lifetime',
        display_name: 'Lifetime Solo Founder Pass',
        description: 'Perpetual on-device Edge AI clinical scribing, 3-Act Trajectory engine, and HL7 FHIR export for solo clinicians.',
        price_usd_one_time: 299.0,
        billing_type: 'ONE_TIME_FIXED'
      },
      {
        plan_id: 'pocketgull_clinic_annual',
        display_name: 'Annual Clinic Pro Pass',
        description: 'Full outpatient clinical intelligence, Herb-Drug/CYP450 posology, Linus Pauling orthomolecular suite, and priority onboarding.',
        price_usd_annual: 490.0,
        billing_type: 'RECURRING_ANNUAL'
      },
      {
        plan_id: 'pocketgull_clinic_onboarding',
        display_name: 'Group Clinic Onboarding Bundle',
        description: 'Turnkey deployment for group practices (up to 5 clinicians), dedicated HIPAA BAA, and 1-on-1 EHR workflow integration.',
        price_usd_one_time: 1250.0,
        billing_type: 'ONE_TIME_FIXED'
      },
      {
        plan_id: 'pocketgull_enterprise_health_system',
        display_name: 'Health System Enterprise Tier (GCP Commit Drawdown)',
        description: 'Unlimited clinician seats, Google SAIF Level 3 defense, dedicated Vertex AI endpoint deployment, 24/7 SLA, and consolidated GCP invoicing.',
        price_usd_monthly: 999.0,
        billing_type: 'RECURRING_MONTHLY'
      }
    ]
  };

  const listingPath = path.join(OUTPUT_DIR, 'marketplace_listing.json');
  const pricingPath = path.join(OUTPUT_DIR, 'pricing_plans.json');

  fs.writeFileSync(listingPath, JSON.stringify(listingSpec, null, 2), 'utf8');
  fs.writeFileSync(pricingPath, JSON.stringify(pricingSpec, null, 2), 'utf8');

  console.log('[SUCCESS] Generated Google Cloud Marketplace Producer Package:');
  console.log(`  - Project Target: ${PROJECT_ID}`);
  console.log(`  - Listing Spec:   ${listingPath}`);
  console.log(`  - Pricing Spec:   ${pricingPath}`);
}

generateMarketplacePackage();
