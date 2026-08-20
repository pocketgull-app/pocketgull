# scripts/deploy_wordpress_cloudrun.ps1
# Deploys Pocket-Gull WordPress Engine to Google Cloud Run (PowerShell)
# Target Project: gen-lang-client-0540208645

$ProjectId = "gen-lang-client-0540208645"
$Region = "us-central1"
$ServiceName = "pocketgull-wordpress"
$ImageTag = "gcr.io/$ProjectId/$ServiceName`:latest"

Write-Host "🚀 Building and Deploying WordPress to Google Cloud Run ($ProjectId)..." -ForegroundColor Cyan

# 1. Build container image with Cloud Build
gcloud builds submit `
  --project=$ProjectId `
  --tag=$ImageTag `
  --file="Dockerfile.wordpress" .

# 2. Deploy to Cloud Run with scale-to-zero ($0 idle cost) and Secret Manager injection
gcloud run deploy $ServiceName `
  --project=$ProjectId `
  --image=$ImageTag `
  --region=$Region `
  --platform="managed" `
  --allow-unauthenticated `
  --min-instances=0 `
  --max-instances=5 `
  --memory="512Mi" `
  --cpu="1" `
  --set-secrets="WORDPRESS_DB_PASSWORD=pocketgull-wp-db-password:latest"

Write-Host "✨ WordPress successfully deployed to Cloud Run on $ProjectId!" -ForegroundColor Green
