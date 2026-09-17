@echo off
rem Pocket-Gull RSNA Knee 2026 Windows Taskbar Monitor Launcher
rem Launches the Taskbar Tray Monitor in the background without a persistent console window.

start powershell -WindowStyle Hidden -ExecutionPolicy Bypass -NoProfile -File "%~dp0rsna_taskbar_monitor.ps1"
echo [OK] Pocket-Gull RSNA Taskbar Monitor launched in system tray.
