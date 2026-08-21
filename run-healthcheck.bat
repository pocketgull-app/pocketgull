@echo off
setlocal enabledelayedexpansion
title PocketGull — Hermetic Healthcheck & Proof Chain

echo =================================================================
echo   POCKETGULL LLC -- ZERO-DEFECT CLINICAL HEALTHCHECK
echo =================================================================
echo.

cd /d "%~dp0"

echo [1/5] Running TypeScript Typecheck (tsc --noEmit)...
node node_modules\typescript\lib\tsc.js -p tsconfig.json --noEmit
if %errorlevel% neq 0 (
    echo [FAIL] TypeScript Typecheck failed!
    pause
    exit /b 1
)
echo [PASS] TypeScript Typecheck 100%% clean.
echo.

echo [2/5] Running Vitest Unit Test Suite...
npx vitest run
if %errorlevel% neq 0 (
    echo [FAIL] Vitest Unit Tests failed!
    pause
    exit /b 1
)
echo [PASS] All unit test suites passed.
echo.

echo [3/5] Running Sentinel Security & Egress Guard...
node scripts\sentinel_security_guard.mjs
if %errorlevel% neq 0 (
    echo [FAIL] Sentinel Security Guard flagged an egress/secret violation!
    pause
    exit /b 1
)
echo [PASS] Zero secret leaks, all egress approved.
echo.

echo [4/5] Running Statutory Legal Posture Audit...
node scripts\verify_google_legal_posture.mjs
if %errorlevel% neq 0 (
    echo [FAIL] Legal posture verification failed!
    pause
    exit /b 1
)
echo [PASS] Statutory legal posture verified.
echo.

echo [5/5] Generating CycloneDX 1.6 SBOM...
node scripts\generate_cyclonedx_sbom.mjs
if %errorlevel% neq 0 (
    echo [FAIL] CycloneDX SBOM generation failed!
    pause
    exit /b 1
)
echo [PASS] CycloneDX 1.6 SBOM verified.
echo.

echo =================================================================
echo   ALL CLINICAL PROOF CHAIN CHECKS PASSED (100%% GREEN)
echo =================================================================
pause
