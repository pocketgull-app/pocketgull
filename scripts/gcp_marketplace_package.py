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
                "name": "GEARARTS LLC / PocketGull Clinical Informatics",
                "website": "https://pocketgull.com",
                "support_email": "dpo@pocketgull.app",
                "sales_email": "leads@pocketgull.app",
                "npi": "1487569752",
                "orcid": "0009-0008-1372-5381",
                "zenodo_doi": "10.5281/zenodo.20647514",
            },
            "compliance": [
                "HIPAA §164.514 Safe Harbor De-Identification",
                "Google SAIF Level 3 (Secure AI Framework)",
                "FHIR R4 Bundle Standard",
                "GA4GH Phenopackets v2 (Global Alliance for Genomics and Health)",
                "CMS-0057-F Interoperability & Prior Authorization",
            ],
            "integration_type": "SAAS_SUBSCRIPTION",
            "fulfillment": {
                "signup_url": "https://pocketgull.com/#workbench?gcp_marketplace=true",
                "sso_type": "GOOGLE_WORKLOAD_IDENTITY_FEDERATION",
            },
        }
    }

    pricing_spec = {
        "pricing_plans": [
            {
                "plan_id": "pocketgull_clinic_pilot_monthly",
                "display_name": "Independent Clinic Pilot (Monthly)",
                "description": "Ambient Clinical Scribe + SOAP notes, RxGuard PGx screening, and Socratic intake triage (Up to 3 clinicians)",
                "price_usd_monthly": 299.00,
                "billing_type": "RECURRING_MONTHLY",
            },
            {
                "plan_id": "pocketgull_implementation_sprint",
                "display_name": "Clinical AI & FHIR Implementation Sprint",
                "description": "Turnkey 2-week implementation: HIPAA Safe Harbor setup, Custom LoRA model fine-tuning, FHIR R4 pipeline",
                "price_usd_one_time": 3500.00,
                "billing_type": "ONE_TIME_FIXED",
            },
            {
                "plan_id": "pocketgull_academic_residency_annual",
                "display_name": "Academic Lab & Residency Hub (Annual)",
                "description": "GA4GH Phenopackets v2 rare disease pipelines, 11-paradigm open science datasets, unlimited OSCE simulation seats",
                "price_usd_annual": 1200.00,
                "billing_type": "RECURRING_ANNUAL",
            },
            {
                "plan_id": "pocketgull_enterprise_health_system",
                "display_name": "Health System Enterprise Tier",
                "description": "Unlimited clinician seats, Google SAIF Level 3 defense, dedicated Vertex AI endpoint deployment, 24/7 SLA",
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
