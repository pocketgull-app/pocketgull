#!/usr/bin/env bash
# scripts/setup_gcp_secrets.sh
# Provisions Google Cloud Secret Manager secrets for WordPress on Cloud Run
# Target Project: gen-lang-client-0540208645

set -e

PROJECT_ID="gen-lang-client-0540208645"

echo "🔐 Configuring Google Cloud Secret Manager for WordPress ($PROJECT_ID)..."

# Ensure Secret Manager API is enabled
gcloud services enable secretmanager.googleapis.com --project="$PROJECT_ID"

create_or_update_secret() {
  local SECRET_NAME=$1
  local SECRET_DESC=$2
  
  if gcloud secrets describe "$SECRET_NAME" --project="$PROJECT_ID" >/dev/null 2>&1; then
    echo "ℹ️  Secret '$SECRET_NAME' already exists in GCP Secret Manager."
  else
    echo "✨ Creating secret '$SECRET_NAME'..."
    gcloud secrets create "$SECRET_NAME" \
      --project="$PROJECT_ID" \
      --replication-policy="automatic"
    echo "✅ Created secret '$SECRET_NAME' ($SECRET_DESC)."
  fi
}

create_or_update_secret "pocketgull-wp-db-password" "MariaDB database password for WordPress"
create_or_update_secret "pocketgull-wp-app-password" "WordPress REST API Application Password for Phil"
create_or_update_secret "pocketgull-wp-auth-salts" "WordPress authentication security keys and salts"

echo ""
echo "🎉 All WordPress Secret Manager secrets are configured in $PROJECT_ID!"
echo "To add/update a secret value, run:"
echo "  echo -n 'your-secret-value' | gcloud secrets versions add pocketgull-wp-app-password --data-file=- --project=$PROJECT_ID"
