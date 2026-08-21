@echo off
setlocal enabledelayedexpansion
title PocketGull — Clinical AI Development Server

echo =================================================================
echo   POCKETGULL LLC -- CLINICAL AI DEV SERVER LAUNCHER
echo   Project: gen-lang-client-0540208645
echo   Entity:  PocketGull LLC (Reg #258869891, EIN: 42-3162850)
echo =================================================================
echo.

cd /d "%~dp0"

echo [*] Verifying Node.js version...
node -v
if %errorlevel% neq 0 (
    echo [!] Node.js not found in PATH. Please install Node.js v24.x.
    pause
    exit /b 1
)

echo [*] Launching Angular 22 + SSR Express Development Server...
echo [*] URL: http://localhost:4200
echo.

npm run dev

pause
