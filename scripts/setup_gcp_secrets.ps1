# scripts/setup_gcp_secrets.ps1
# Provisions Google Cloud Secret Manager secrets for WordPress on Cloud Run (PowerShell)
# Target Project: gen-lang-client-0540208645

$ProjectId = "gen-lang-client-0540208645"

Write-Host "🔐 Configuring Google Cloud Secret Manager for WordPress ($ProjectId)..." -ForegroundColor Cyan

# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com --project=$ProjectId

function Ensure-GcpSecret {
    param (
        [string]$SecretName,
        [string]$Description
    )

    $exists = gcloud secrets describe $SecretName --project=$ProjectId 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "ℹ️  Secret '$SecretName' already exists in GCP Secret Manager." -ForegroundColor Yellow
    } else {
        Write-Host "✨ Creating secret '$SecretName'..." -ForegroundColor Green
        gcloud secrets create $SecretName --project=$ProjectId --replication-policy="automatic"
        Write-Host "✅ Created secret '$SecretName' ($Description)." -ForegroundColor Green
    }
}

Ensure-GcpSecret -SecretName "pocketgull-wp-db-password" -Description "MariaDB database password for WordPress"
Ensure-GcpSecret -SecretName "pocketgull-wp-app-password" -Description "WordPress REST API Application Password for Phil"
Ensure-GcpSecret -SecretName "pocketgull-wp-auth-salts" -Description "WordPress authentication security keys and salts"

Write-Host "`n🎉 All WordPress Secret Manager secrets are configured in $ProjectId!" -ForegroundColor Green
Write-Host "To add/update a secret value, run:" -ForegroundColor White
Write-Host "  Set-Content -NoNewline -Path ./temp.txt -Value 'your-secret-value'" -ForegroundColor Gray
Write-Host "  gcloud secrets versions add pocketgull-wp-app-password --data-file=./temp.txt --project=$ProjectId" -ForegroundColor Gray
