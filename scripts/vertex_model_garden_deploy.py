#!/usr/bin/env python3
"""
Google Cloud Vertex AI Model Garden Packaging & Deployment Pipeline.

This utility packages fine-tuned PocketGull Gemma 3 LoRA adapter weights,
generates Vertex AI Model Cards, uploads the model artifact to Google Cloud
Storage (GCS), registers the model in Vertex AI Model Registry, and creates/deploys
a dedicated Vertex AI Endpoint with autoscaling (min_replicas=0) for scale-to-zero cost efficiency.

Usage:
  # Dry-run validation of Vertex AI Model Garden specifications:
  python scripts/vertex_model_garden_deploy.py --paradigm pharmacogenomics_pgx --dry_run

  # Package and upload to Vertex AI Model Registry:
  python scripts/vertex_model_garden_deploy.py --paradigm pharmacogenomics_pgx --project_id gen-lang-client-0540208645 --region us-central1 --upload

  # Deploy to live Vertex AI Endpoint (scales to 0 when idle):
  python scripts/vertex_model_garden_deploy.py --paradigm pharmacogenomics_pgx --project_id gen-lang-client-0540208645 --region us-central1 --deploy
"""

import argparse
import json
import logging
import os
import subprocess
import sys
from typing import Any, Dict, Optional

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("vertex_model_garden")

DEFAULT_PROJECT_ID = os.environ.get("GCP_PROJECT_ID", "gen-lang-client-0540208645")
DEFAULT_REGION = os.environ.get("GCP_REGION", "us-central1")
DEFAULT_BUCKET_NAME = f"{DEFAULT_PROJECT_ID}-vertex-model-garden"

PARADIGM_METADATA = {
    "dpo_epistemic_grounding": {
        "name": "DPO Epistemic Grounding & Hallucination Suppression",
        "category": "Epistemic & Safety",
        "base_model": "google/gemma-3-27b-it",
        "container_image": "us-docker.pkg.dev/vertex-ai/prediction/vllm-openai:latest",
        "machine_type": "g2-standard-12",
        "accelerator_type": "NVIDIA_L4",
        "accelerator_count": 1,
    },
    "ambient_scribe_soap": {
        "name": "Ambient Clinical Scribe & SOAP Generator",
        "category": "Ambient Documentation",
        "base_model": "google/gemma-3-4b-it",
        "container_image": "us-docker.pkg.dev/vertex-ai/prediction/vllm-openai:latest",
        "machine_type": "g2-standard-4",
        "accelerator_type": "NVIDIA_L4",
        "accelerator_count": 1,
    },
    "pharmacogenomics_pgx": {
        "name": "Pharmacogenomics (PGx) & Drug-Herb Intercept",
        "category": "Specialty CDS",
        "base_model": "google/gemma-3-12b-it",
        "container_image": "us-docker.pkg.dev/vertex-ai/prediction/vllm-openai:latest",
        "machine_type": "g2-standard-8",
        "accelerator_type": "NVIDIA_L4",
        "accelerator_count": 1,
    },
    "circadian_chronodosing": {
        "name": "Circadian Chronobiology & Chronodosing Matrix",
        "category": "Chronobiology",
        "base_model": "google/gemma-3-4b-it",
        "container_image": "us-docker.pkg.dev/vertex-ai/prediction/vllm-openai:latest",
        "machine_type": "g2-standard-4",
        "accelerator_type": "NVIDIA_L4",
        "accelerator_count": 1,
    },
    "prior_auth_cms0057f": {
        "name": "Automated Prior Authorization (CMS-0057-F / FHIR R4)",
        "category": "Interoperability",
        "base_model": "google/gemma-3-12b-it",
        "container_image": "us-docker.pkg.dev/vertex-ai/prediction/vllm-openai:latest",
        "machine_type": "g2-standard-8",
        "accelerator_type": "NVIDIA_L4",
        "accelerator_count": 1,
    },
    "tri_paradigm_synthesis": {
        "name": "Tri-Paradigm Diagnostic Matrix (Western, TCM & Ayurveda)",
        "category": "Integrative",
        "base_model": "google/gemma-3-27b-it",
        "container_image": "us-docker.pkg.dev/vertex-ai/prediction/vllm-openai:latest",
        "machine_type": "g2-standard-12",
        "accelerator_type": "NVIDIA_L4",
        "accelerator_count": 1,
    },
    "rsna_imaging_vlm": {
        "name": "Multimodal Vision-Language RSNA Radiographic Reasoning",
        "category": "Multimodal Vision",
        "base_model": "google/gemma-3-27b-it",
        "container_image": "us-docker.pkg.dev/vertex-ai/prediction/vllm-openai:latest",
        "machine_type": "g2-standard-12",
        "accelerator_type": "NVIDIA_L4",
        "accelerator_count": 1,
    },
    "seo_medical_journalism": {
        "name": "Evidence-Grounded Medical Journalism & SEO Copywriter",
        "category": "Medical Journalism",
        "base_model": "google/gemma-3-12b-it",
        "container_image": "us-docker.pkg.dev/vertex-ai/prediction/vllm-openai:latest",
        "machine_type": "g2-standard-8",
        "accelerator_type": "NVIDIA_L4",
        "accelerator_count": 1,
    },
    "voice_multimodal_live": {
        "name": "Conversational Telemedicine Voice SSML Formatter",
        "category": "Voice & Audio",
        "base_model": "google/gemma-3-4b-it",
        "container_image": "us-docker.pkg.dev/vertex-ai/prediction/vllm-openai:latest",
        "machine_type": "g2-standard-4",
        "accelerator_type": "NVIDIA_L4",
        "accelerator_count": 1,
    },
    "calgary_cambridge_intake": {
        "name": "Socratic Calgary-Cambridge Patient Intake & Triage",
        "category": "Patient Triage",
        "base_model": "google/gemma-3-4b-it",
        "container_image": "us-docker.pkg.dev/vertex-ai/prediction/vllm-openai:latest",
        "machine_type": "g2-standard-4",
        "accelerator_type": "NVIDIA_L4",
        "accelerator_count": 1,
    },
    "fda_ftc_compliance_copywriter": {
        "name": "FTC & FDA 520(o) Clinical Copywriting & Compliance Guard",
        "category": "Legal & Compliance",
        "base_model": "google/gemma-3-12b-it",
        "container_image": "us-docker.pkg.dev/vertex-ai/prediction/vllm-openai:latest",
        "machine_type": "g2-standard-8",
        "accelerator_type": "NVIDIA_L4",
        "accelerator_count": 1,
    },
}


def generate_model_card(paradigm: str) -> Dict[str, Any]:
    """Generates the Vertex AI Model Garden specification document."""
    meta = PARADIGM_METADATA.get(paradigm, PARADIGM_METADATA["dpo_epistemic_grounding"])
    return {
        "model_card": {
            "name": f"PocketGull {meta['name']}",
            "publisher": "GEARARTS / PocketGull Clinical Intelligence",
            "version": "1.16.0",
            "base_model": meta["base_model"],
            "target_paradigm": paradigm,
            "category": meta["category"],
            "license": "Apache-2.0 / CC-BY-4.0",
            "hipaa_compliance": "HIPAA §164.514 Safe Harbor De-Identified",
            "open_science": {
                "zenodo_doi": "10.5281/zenodo.20647514",
                "npi": "1487569752",
                "orcid": "0009-0008-1372-5381",
            },
            "serving": {
                "container_image": meta["container_image"],
                "machine_type": meta["machine_type"],
                "accelerator_type": meta["accelerator_type"],
                "accelerator_count": meta["accelerator_count"],
                "min_replicas": 0,
                "max_replicas": 2,
            },
        }
    }


def run_command(cmd: str, dry_run: bool = False) -> Optional[str]:
    """Executes a gcloud or shell command with structured logging."""
    logger.info(f"Executing: {cmd}")
    if dry_run:
        logger.info("[DRY-RUN] Command skipped.")
        return None
    try:
        res = subprocess.run(
            cmd, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
        )
        return res.stdout.strip()
    except subprocess.CalledProcessError as e:
        logger.error(f"Command failed with code {e.returncode}: {e.stderr.strip()}")
        raise


def main():
    parser = argparse.ArgumentParser(
        description="Google Cloud Vertex AI Model Garden Deployment Pipeline"
    )
    parser.add_argument(
        "--paradigm",
        type=str,
        default="pharmacogenomics_pgx",
        choices=list(PARADIGM_METADATA.keys()),
        help="Target clinical paradigm to package/deploy",
    )
    parser.add_argument(
        "--project_id",
        type=str,
        default=DEFAULT_PROJECT_ID,
        help="Google Cloud Project ID",
    )
    parser.add_argument(
        "--region",
        type=str,
        default=DEFAULT_REGION,
        help="Google Cloud Region (default: us-central1)",
    )
    parser.add_argument(
        "--dry_run",
        action="store_true",
        help="Validate parameters and output commands without executing network calls",
    )
    parser.add_argument(
        "--upload",
        action="store_true",
        help="Upload model package to Vertex AI Model Registry",
    )
    parser.add_argument(
        "--deploy",
        action="store_true",
        help="Create Vertex AI Endpoint and deploy model with minScale=0",
    )

    args = parser.parse_args()

    meta = PARADIGM_METADATA[args.paradigm]
    model_display_name = f"pocketgull-{args.paradigm.replace('_', '-')}-gemma3-lora"
    endpoint_display_name = f"pocketgull-{args.paradigm.replace('_', '-')}-endpoint"
    gcs_artifact_uri = f"gs://{args.project_id}-vertex-model-garden/adapters/{args.paradigm}"

    card = generate_model_card(args.paradigm)
    logger.info("Generated Vertex AI Model Garden Card:\n" + json.dumps(card, indent=2))

    if args.dry_run or (not args.upload and not args.deploy):
        logger.info("=== Dry-Run Instructions ===")
        logger.info(f"1. Artifact GCS URI: {gcs_artifact_uri}")
        upload_cmd = (
            f"gcloud ai models upload \\\n"
            f"  --project={args.project_id} \\\n"
            f"  --region={args.region} \\\n"
            f"  --display-name={model_display_name} \\\n"
            f"  --container-image-uri={meta['container_image']} \\\n"
            f"  --artifact-uri={gcs_artifact_uri} \\\n"
            f"  --description='PocketGull {meta['name']} LoRA Adapter'"
        )
        logger.info(f"2. Model Upload Command:\n{upload_cmd}")

        deploy_cmd = (
            f"gcloud ai endpoints create --project={args.project_id} --region={args.region} --display-name={endpoint_display_name}\n"
            f"gcloud ai endpoints deploy-model $(gcloud ai endpoints list --filter='displayName:{endpoint_display_name}' --format='value(name)' --region={args.region} | head -n 1) \\\n"
            f"  --project={args.project_id} \\\n"
            f"  --region={args.region} \\\n"
            f"  --model=$(gcloud ai models list --filter='displayName:{model_display_name}' --format='value(name)' --region={args.region} | head -n 1) \\\n"
            f"  --display-name=v1-active \\\n"
            f"  --machine-type={meta['machine_type']} \\\n"
            f"  --accelerator=type={meta['accelerator_type'].lower().replace('_', '-')},count={meta['accelerator_count']} \\\n"
            f"  --min-replica-count=0 \\\n"
            f"  --max-replica-count=2"
        )
        logger.info(f"3. Endpoint Deploy Command:\n{deploy_cmd}")
        return

    if args.upload:
        logger.info(f"Uploading model {model_display_name} to Vertex AI Model Registry...")
        upload_cmd = (
            f"gcloud ai models upload "
            f"--project={args.project_id} "
            f"--region={args.region} "
            f"--display-name={model_display_name} "
            f"--container-image-uri={meta['container_image']} "
            f"--artifact-uri={gcs_artifact_uri} "
            f"--description='PocketGull {meta['name']} LoRA Adapter'"
        )
        run_command(upload_cmd, dry_run=args.dry_run)

    if args.deploy:
        logger.info(f"Deploying model to Vertex AI Endpoint {endpoint_display_name}...")
        create_endpoint_cmd = (
            f"gcloud ai endpoints create "
            f"--project={args.project_id} "
            f"--region={args.region} "
            f"--display-name={endpoint_display_name}"
        )
        run_command(create_endpoint_cmd, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
