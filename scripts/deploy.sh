#!/bin/bash
# Pocket Gull - Automated Google Cloud Run Deployment Script
# Required for Gemini Live Agent Challenge Infrastructure-as-Code Bonus

set -e

echo "=========================================================="
echo "🚀 Deploying Pocket Gull to Google Cloud Run"
echo "=========================================================="

# 1. Ensure gcloud is initialized and authenticated
# gcloud auth login
# gcloud config set project YOUR_PROJECT_ID
# Automatically grab the current project
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: Google Cloud Project ID is not set."
    echo "Please run 'gcloud auth login' and 'gcloud config set project <PROJECT_ID>' first."
    exit 1
fi

SERVICE_NAME="pocket-gull"
REGION="us-central1"
IMAGE_TAG="gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"

echo "📦 1/3: Building the image for Cloud Run using Dockerfile..."
# Assuming Google Cloud Build is enabled for the project
gcloud builds submit --tag $IMAGE_TAG

echo "🌐 2/3: Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_TAG \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --min-instances 0 \
    --max-instances 2 \
    --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest,STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest,STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET:latest,AWS_ACCESS_KEY_ID=AWS_ACCESS_KEY_ID:latest,AWS_SECRET_ACCESS_KEY=AWS_SECRET_ACCESS_KEY:latest,AWS_HEALTHLAKE_ENDPOINT=AWS_HEALTHLAKE_ENDPOINT:latest" \
    --update-env-vars=OTEL_SDK_DISABLED=true

if [ -n "$PORKBUN_API_KEY" ] && [ -n "$PORKBUN_SECRET_KEY" ]; then
    echo "🌐 Updating Porkbun DNS records..."
    node scripts/update-porkbun-dns.js
else
    echo "⚠️ Skipping DNS update: PORKBUN_API_KEY and PORKBUN_SECRET_KEY environment variables are not set."
fi

echo "✅ 3/3: Deployment Complete!"
echo "Your live agent is now running on Google Cloud."
echo "=========================================================="
