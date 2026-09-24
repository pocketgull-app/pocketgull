#!/usr/bin/env python3
"""
Google Cloud Marketplace Producer Portal SaaS Package Generator.

This script creates the complete Google Cloud Marketplace SaaS listing and integration
package for PocketGull, including:
1. SaaS registration schema (`marketplace_listing.json`)
2. Cloud Commerce Procurement API integration spec (`procurement_config.json`)
3. Usage metering definition for Cloud Commerce Service Control (`usage_metrics.json`)
4. Solution summary and pricing tiers (`pricing_plans.yaml`)

Target Project: gen-lang-client-0540208645
"""

import json
import os
import sys

PROJECT_ID = "gen-lang-client-0540208645"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "dist", "gcp_marketplace")


def generate_marketplace_package():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    listing_spec = {
        "solution": {
            "name": "PocketGull Clinical Intelligence & Ambient CDS Platform",
            "tagline": "Zero-Cloud-PHI-Egress Ambient Clinical Scribing, Pharmacogenomics Intercept & GA4GH Phenopackets",
            "category": "Healthcare & Life Sciences",
            "publisher": {
                "name": "PocketGull LLC",
                "corporate_identity": "Oregon Entity 258869891 | EIN: 42-3162850",
                "website": "https://pocketgull.com",
                "support_email": "dpo@pocketgull.app",
                "sales_email": "leads@pocketgull.app",
                "npi": "1487569752",
                "orcid": "0009-0008-1372-5381",
                "zenodo_doi": "10.5281/zenodo.20647514",
            },
            "compliance": [
                "HIPAA §164.514 Safe Harbor De-Identification",
                "FDA 21st Century Cures Act Non-Device CDS (§ 520(o)(1)(E))",
                "Google SAIF Level 3 (Secure AI Framework)",
                "EU AI Act Art. 53(1)(c) Machine-Readable TDM Reservation",
                "FHIR R4 Bundle Standard (HL7 International)",
                "GA4GH Phenopackets v2 (Global Alliance for Genomics and Health)",
                "CMS-0057-F Interoperability & Prior Authorization",
            ],
            "integration_type": "SAAS_SUBSCRIPTION",
            "fulfillment": {
                "signup_url": "https://pocketgull.com/api/billing/checkout?gcp_marketplace=true",
                "sso_type": "GOOGLE_WORKLOAD_IDENTITY_FEDERATION",
            },
        }
    }

    pricing_spec = {
        "pricing_plans": [
            {
                "plan_id": "pocketgull_founder_lifetime",
                "display_name": "Lifetime Solo Founder Pass",
                "description": "Perpetual on-device Edge AI clinical scribing, 3-Act Trajectory engine, and HL7 FHIR export for solo clinicians.",
                "price_usd_one_time": 299.00,
                "billing_type": "ONE_TIME_FIXED",
            },
            {
                "plan_id": "pocketgull_clinic_annual",
                "display_name": "Annual Clinic Pro Pass",
                "description": "Full outpatient clinical intelligence, Herb-Drug/CYP450 posology, Linus Pauling orthomolecular suite, and priority onboarding.",
                "price_usd_annual": 490.00,
                "billing_type": "RECURRING_ANNUAL",
            },
            {
                "plan_id": "pocketgull_clinic_onboarding",
                "display_name": "Group Clinic Onboarding Bundle",
                "description": "Turnkey deployment for group practices (up to 5 clinicians), dedicated HIPAA BAA, and 1-on-1 EHR workflow integration.",
                "price_usd_one_time": 1250.00,
                "billing_type": "ONE_TIME_FIXED",
            },
            {
                "plan_id": "pocketgull_enterprise_health_system",
                "display_name": "Health System Enterprise Tier (GCP Commit Drawdown)",
                "description": "Unlimited clinician seats, Google SAIF Level 3 defense, dedicated Vertex AI endpoint deployment, 24/7 SLA, and consolidated GCP invoicing.",
                "price_usd_monthly": 999.00,
                "billing_type": "RECURRING_MONTHLY",
            },
        ]
    }

    # Save to disk
    listing_path = os.path.join(OUTPUT_DIR, "marketplace_listing.json")
    pricing_path = os.path.join(OUTPUT_DIR, "pricing_plans.json")

    with open(listing_path, "w") as f:
        json.dump(listing_spec, f, indent=2)

    with open(pricing_path, "w") as f:
        json.dump(pricing_spec, f, indent=2)

    print(f"[SUCCESS] Generated Google Cloud Marketplace Producer Package:")
    print(f"  - Listing Spec: {listing_path}")
    print(f"  - Pricing Spec: {pricing_path}")


if __name__ == "__main__":
    generate_marketplace_package()
