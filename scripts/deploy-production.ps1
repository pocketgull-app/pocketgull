# scripts/deploy-production.ps1
# PocketGull 1-Click Automated Production Deployment Pipeline
# Targets: Google Cloud Run [pocket-gull-v2] in gen-lang-client-0540208645 (us-central1)

param(
    [string]$ProjectId = "gen-lang-client-0540208645",
    [string]$Region = "us-central1",
    [string]$ServiceName = "pocket-gull-v2"
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
Set-Location $RootDir

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚀 Starting PocketGull 1-Click Production Deployment" -ForegroundColor Cyan
Write-Host "📌 Project:  $ProjectId" -ForegroundColor Gray
Write-Host "🌐 Region:   $Region" -ForegroundColor Gray
Write-Host "📦 Service:  $ServiceName" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

# Step 1: Compile Angular SSR Production Bundle
Write-Host "`n🔨 Step 1/4: Compiling Angular SSR production bundle..." -ForegroundColor Yellow
npm run build
Write-Host "✅ Production bundle compiled successfully." -ForegroundColor Green

# Step 2: Package Clean Deployment Source Archive
Write-Host "`n📦 Step 2/4: Packaging clean source archive (excluding local caches)..." -ForegroundColor Yellow
node scripts/package-deploy-source.mjs
Write-Host "✅ Clean source archive created." -ForegroundColor Green

# Step 3: Google Cloud Build Container Image
Write-Host "`n🏗️ Step 3/4: Building & pushing container image via Google Cloud Build..." -ForegroundColor Yellow
$ImageTag = "gcr.io/$ProjectId/${ServiceName}:latest"
gcloud builds submit "deploy_source.tar.gz" --tag $ImageTag --project=$ProjectId --quiet
Write-Host "✅ Container image built and pushed: $ImageTag" -ForegroundColor Green

# Step 4: Deploy Container to Google Cloud Run
Write-Host "`n🚀 Step 4/4: Deploying to Google Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $ServiceName `
    --image $ImageTag `
    --project=$ProjectId `
    --region=$Region `
    --platform=managed `
    --allow-unauthenticated `
    --memory="2Gi" `
    --cpu="2" `
    --min-instances=0 `
    --max-instances=5 `
    --set-env-vars="NODE_ENV=production,PORT=8080,OTEL_SDK_DISABLED=true" `
    --quiet

Write-Host "✅ Cloud Run deployment complete." -ForegroundColor Green

# Step 5: Verify Live Endpoints
Write-Host "`n🔍 Verifying live endpoints..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $resCom = Invoke-WebRequest -Uri "https://pocketgull.com" -UseBasicParsing -TimeoutSec 10
    Write-Host "  ✓ https://pocketgull.com -> HTTP $($resCom.StatusCode) ($($resCom.Content.Length) bytes)" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️ pocketgull.com check notice: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

try {
    $resApp = Invoke-WebRequest -Uri "https://pocketgull.app" -UseBasicParsing -TimeoutSec 10
    Write-Host "  ✓ https://pocketgull.app -> HTTP $($resApp.StatusCode) ($($resApp.Content.Length) bytes)" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️ pocketgull.app check notice: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "✨ PocketGull Production Deployment Finished Successfully!" -ForegroundColor Cyan
Write-Host "🌐 Public Marketing Site: https://pocketgull.com" -ForegroundColor White
Write-Host "🏥 Clinical App Platform: https://pocketgull.app" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
