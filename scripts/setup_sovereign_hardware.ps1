# PocketGull Sovereign Hardware & Silicon Auto-Detection Pipeline
# Detects host silicon (Apple Metal / NVIDIA CUDA / AMD DirectML / Intel NPU)
# Registers sovereign clinical models in Ollama and benchmarks local inference.

param (
    [switch]$SkipInferenceTest = $false,
    [string]$OllamaHost = "http://127.0.0.1:11434"
)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🌊 PocketGull Sovereign Silicon & Hardware Detection Engine" -ForegroundColor Cyan
Write-Host "   Countess Ada Lovelace Poetic Science & Salutogenic CDS" -ForegroundColor DarkCyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Host Architecture & Operating System
$os = [System.Environment]::OSVersion.VersionString
$arch = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture
$procCount = [System.Environment]::ProcessorCount

Write-Host "`n[1/4] Probing Host Environment..." -ForegroundColor Yellow
Write-Host "  • OS Platform: $os ($arch)" -ForegroundColor Gray
Write-Host "  • CPU Cores / Threads: $procCount" -ForegroundColor Gray

# 2. Silicon & GPU Acceleration Detection
Write-Host "`n[2/4] Detecting Neural & GPU Acceleration Hardware..." -ForegroundColor Yellow
$detectedSilicon = "CPU (Fallback)"
$vramMb = 0
$accelerationBackend = "WASM_CPU"

try {
    $gpus = Get-CimInstance Win32_VideoController -ErrorAction SilentlyContinue
    foreach ($gpu in $gpus) {
        $gpuName = $gpu.Name
        $driverVer = $gpu.DriverVersion
        Write-Host "  • Detected Adapter: $gpuName (Driver: $driverVer)" -ForegroundColor Gray
        
        if ($gpuName -match "NVIDIA") {
            $detectedSilicon = "NVIDIA RTX/GTX ($gpuName)"
            $accelerationBackend = "CUDA_TENSOR_CORES"
            Write-Host "    ✦ Optimal Backend: NVIDIA CUDA (FP16/BF16 Tensor Cores & cuDNN)" -ForegroundColor Green
        } elseif ($gpuName -match "AMD|Radeon") {
            $detectedSilicon = "AMD Radeon ($gpuName)"
            $accelerationBackend = "DIRECTML_VULKAN"
            Write-Host "    ✦ Optimal Backend: AMD DirectML / Vulkan (Low-VRAM QLoRA)" -ForegroundColor Green
        } elseif ($gpuName -match "Apple") {
            $detectedSilicon = "Apple Silicon ($gpuName)"
            $accelerationBackend = "METAL_UNIFIED_MEMORY"
            Write-Host "    ✦ Optimal Backend: Apple Metal Unified Memory (UMA)" -ForegroundColor Green
        } elseif ($gpuName -match "Intel") {
            $detectedSilicon = "Intel ($gpuName)"
            $accelerationBackend = "WEBNN_NPU_OPENVINO"
            Write-Host "    ✦ Optimal Backend: Intel WebNN / DirectML / OpenVINO" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "  ! Hardware probe warning: $_" -ForegroundColor DarkYellow
}

Write-Host "  ✦ Selected Primary Silicon: $detectedSilicon [$accelerationBackend]" -ForegroundColor Cyan

# 3. Ollama Sovereign Model Registration
Write-Host "`n[3/4] Verifying Local Ollama Sovereign Runtime ($OllamaHost)..." -ForegroundColor Yellow

$ollamaActive = $false
try {
    $res = Invoke-RestMethod -Uri "$OllamaHost/api/tags" -Method Get -TimeoutSec 3 -ErrorAction Stop
    $ollamaActive = $true
    $existingModels = @($res.models | ForEach-Object { $_.name })
    Write-Host "  ✔ Ollama Server active with $($existingModels.Count) model(s) loaded." -ForegroundColor Green
    
    $modelDir = Join-Path $PSScriptRoot "..\models\sovereign"
    $modelfileClinical = Join-Path $modelDir "Modelfile.pocketgull"
    $modelfileEdge = Join-Path $modelDir "Modelfile.pocketgull-edge"
    
    # Check pocketgull-clinical:latest
    if ($existingModels -contains "pocketgull-clinical:latest") {
        Write-Host "  ✔ Sovereign Flagship: pocketgull-clinical:latest is already registered." -ForegroundColor Green
    } elseif (Test-Path $modelfileClinical) {
        Write-Host "  ⚡ Registering pocketgull-clinical:latest from Modelfile.pocketgull..." -ForegroundColor Yellow
        Start-Process -FilePath "ollama" -ArgumentList @("create", "pocketgull-clinical:latest", "-f", $modelfileClinical) -Wait -NoNewWindow
    }
    
    # Check pocketgull-edge:3b
    if ($existingModels -contains "pocketgull-edge:3b") {
        Write-Host "  ✔ Sovereign Edge: pocketgull-edge:3b is already registered." -ForegroundColor Green
    } elseif (Test-Path $modelfileEdge) {
        Write-Host "  ⚡ Registering pocketgull-edge:3b from Modelfile.pocketgull-edge..." -ForegroundColor Yellow
        Start-Process -FilePath "ollama" -ArgumentList @("create", "pocketgull-edge:3b", "-f", $modelfileEdge) -Wait -NoNewWindow
    }
} catch {
    Write-Host "  ⚠ Ollama is not currently running at $OllamaHost." -ForegroundColor DarkYellow
    Write-Host "    To activate sovereign offline models: start Ollama and run:" -ForegroundColor Gray
    Write-Host "    ollama create pocketgull-clinical:latest -f models/sovereign/Modelfile.pocketgull" -ForegroundColor Gray
}

# 4. Silicon-Targeted Benchmark / Verification
if (-not $SkipInferenceTest -and $ollamaActive) {
    Write-Host "`n[4/4] Executing Empirical Silicon Health Benchmark..." -ForegroundColor Yellow
    $testPrompt = "Evaluate acute pre-eclampsia seizure prophylaxis protocol."
    
    $targetModel = if ($existingModels -contains "pocketgull-edge:3b") { "pocketgull-edge:3b" } elseif ($existingModels -contains "pocketgull-clinical:latest") { "pocketgull-clinical:latest" } else { $existingModels[0] }
    
    if ($targetModel) {
        Write-Host "  Testing inference on model: $targetModel..." -ForegroundColor Gray
        $t0 = [System.Diagnostics.Stopwatch]::StartNew()
        try {
            $body = @{
                model = $targetModel
                prompt = $testPrompt
                stream = $false
                options = @{ temperature = 0.1; num_predict = 60 }
            } | ConvertTo-Json
            
            $inferRes = Invoke-RestMethod -Uri "$OllamaHost/api/generate" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 90
            $t0.Stop()
            
            $elapsedMs = $t0.ElapsedMilliseconds
            $preview = ($inferRes.response -replace "`n", " ").Trim()
            if ($preview.Length -gt 100) { $preview = $preview.Substring(0, 97) + "..." }
            
            Write-Host "  ✔ Local Inference Completed in ${elapsedMs}ms ($detectedSilicon)" -ForegroundColor Green
            Write-Host "    Sample Output: `"$preview`"" -ForegroundColor Gray
        } catch {
            Write-Host "  ! Inference test encountered a non-fatal error: $_" -ForegroundColor DarkYellow
        }
    }
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "✔ PocketGull Sovereign Hardware Setup Complete" -ForegroundColor Green
Write-Host "  Active Backend: $accelerationBackend" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
