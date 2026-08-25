#!/usr/bin/env bash
# scripts/deploy_wordpress_cloudrun.sh
# Deploys Pocket-Gull WordPress Engine to Google Cloud Run
# Target Project: gen-lang-client-0540208645

set -e

PROJECT_ID="gen-lang-client-0540208645"
REGION="us-central1"
SERVICE_NAME="pocketgull-wordpress"
IMAGE_TAG="gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"

echo "🚀 Building and Deploying WordPress to Google Cloud Run ($PROJECT_ID)..."

# 1. Build container image with Cloud Build
gcloud builds submit \
  --project="$PROJECT_ID" \
  --tag="$IMAGE_TAG" \
  --file="Dockerfile.wordpress" .

# 2. Deploy to Cloud Run with scale-to-zero ($0 idle cost) and Secret Manager injection
gcloud run deploy "$SERVICE_NAME" \
  --project="$PROJECT_ID" \
  --image="$IMAGE_TAG" \
  --region="$REGION" \
  --platform="managed" \
  --allow-unauthenticated \
  --min-instances=0 \
  --max-instances=5 \
  --memory="512Mi" \
  --cpu="1" \
  --set-secrets="WORDPRESS_DB_PASSWORD=pocketgull-wp-db-password:latest"

echo "✨ WordPress successfully deployed to Cloud Run on $PROJECT_ID!"
