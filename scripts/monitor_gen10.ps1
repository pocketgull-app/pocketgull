<#
.SYNOPSIS
    RSNA Knee Abnormality 2026 Generation 10 Autonomous Pipeline Daemon.
.DESCRIPTION
    1. Monitors philgear/rsna-knee-2026-training-v10 until COMPLETE.
    2. Downloads weights and oof_predictions_v10.csv to contests/rsna_knee_2026/kernel_output_v10.
    3. Runs post_train_evaluator.py to compute Macro-AUC and per-target gains.
#>

$ErrorActionPreference = "Continue"
$Root = "c:\Users\philg\Pocketgull\pocketgull"
Set-Location $Root

$TrainKernel = "philgear/rsna-knee-2026-training-v10"
$OutputDir = Join-Path $Root "contests\rsna_knee_2026\kernel_output_v10"
$PythonExe = "C:\Users\philg\anaconda3\python.exe"
$LogFile = Join-Path $Root "scripts\gen10_pipeline.log"

function Log-Msg($msg) {
    $ts = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $line = "[$ts] $msg"
    Write-Host $line
    Add-Content -Path $LogFile -Value $line -Encoding UTF8
}

Log-Msg "============================================================"
Log-Msg "STARTING RSNA KNEE GENERATION 10 SENTINEL"
Log-Msg "Tracking: $TrainKernel"
Log-Msg "============================================================"

$trainComplete = $false
while (-not $trainComplete) {
    try {
        $statusOutput = & $PythonExe -m kaggle kernels status $TrainKernel 2>&1
        Log-Msg "Gen-10 status check: $statusOutput"
        if ($statusOutput -match "COMPLETE") {
            $trainComplete = $true
            Log-Msg "GEN-10 TRAINING KERNEL COMPLETED SUCCESSFULLY!"
        } elseif ($statusOutput -match "ERROR|FAILED|CANCELLED") {
            Log-Msg "[ERROR] Gen-10 training kernel ended in error: $statusOutput"
            exit 1
        } else {
            Start-Sleep -Seconds 600
        }
    } catch {
        Log-Msg "[WARN] Exception while polling status: $_"
        Start-Sleep -Seconds 600
    }
}

# Download Output using UTF-8 Python helper to prevent charmap errors
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}
Log-Msg "Downloading Gen-10 artifacts to $OutputDir..."
& $PythonExe -c @"
import builtins
orig_open = builtins.open
def utf8_open(*args, **kwargs):
    if 'encoding' not in kwargs and ('w' in args[1] if len(args) > 1 else 'w' in kwargs.get('mode', '')):
        kwargs['encoding'] = 'utf-8'
    return orig_open(*args, **kwargs)
builtins.open = utf8_open

import os
from kaggle.api.kaggle_api_extended import KaggleApi
api = KaggleApi()
api.authenticate()
api.kernels_output('$TrainKernel', path=r'$OutputDir')
print('[OK] Download complete!')
"@

Log-Msg "Running Gen-10 OOF Evaluation..."
if (Test-Path (Join-Path $OutputDir "oof_predictions_v10.csv")) {
    $evalOutput = & $PythonExe "contests\rsna_knee_2026\post_train_evaluator.py" $OutputDir 2>&1
    Log-Msg "Evaluation Output:`n$evalOutput"
}

Log-Msg "GEN-10 PIPELINE COMPLETED SUCCESSFULLY!"
