@echo off
setlocal enabledelayedexpansion
title PocketGull — Hugging Face & Kaggle Model Hub Exporter

echo =================================================================
echo   POCKETGULL LLC -- GEMMA 3 LORA MODEL HUB PACKAGER
echo   Packages all 11 fine-tuned clinical adapters with Open Science
echo   Model Cards and Zenodo attribution (DOI: 10.5281/zenodo.20647514)
echo =================================================================
echo.

cd /d "%~dp0"

echo [*] Exporting Model Hub Cards and Manifest...
node scripts\huggingface_model_hub_export.mjs
if %errorlevel% neq 0 (
    echo [FAIL] Model Hub Export failed!
    pause
    exit /b 1
)

echo.
echo =================================================================
echo   ALL 11 GEMMA 3 LORA ADAPTERS PACKAGED SUCCESSFULLY
echo   Output: adapters\huggingface\model_hub_manifest.json
echo =================================================================
pause
