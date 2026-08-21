@echo off
setlocal enabledelayedexpansion
title PocketGull — Production Cloud Run Deployment

echo =================================================================
echo   POCKETGULL LLC -- PRODUCTION CLOUD RUN DEPLOYMENT
echo   Target Project: gen-lang-client-0540208645
echo   Region:         us-central1
echo   Domain:         https://pocketgull.app
echo =================================================================
echo.

cd /d "%~dp0"

echo [*] Triggering automated pre-flight tests and Cloud Run deployment...
node scripts\deploy-production.mjs
if %errorlevel% neq 0 (
    echo [FAIL] Deployment failed or pre-flight test aborted!
    pause
    exit /b 1
)

echo.
echo =================================================================
echo   DEPLOYMENT TO GOOGLE CLOUD RUN COMPLETE
echo   Live URL: https://pocketgull.app
echo =================================================================
pause
