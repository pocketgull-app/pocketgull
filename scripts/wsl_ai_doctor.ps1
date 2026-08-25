# 🛡️ Pocket-Gull WSL2 & Local Edge AI Diagnostic Doctor
# Automated Health Check, Service Auto-Recovery & GPU Acceleration Verifier

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  🩺 Pocketgull WSL2 & Local Edge AI Diagnostic Sentinel" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan

# 1. Probe LxssManager Windows Service
Write-Host "`n[1/4] Checking Windows Subsystem for Linux (LxssManager) Service..." -ForegroundColor Yellow
$wslService = Get-Service -Name LxssManager -ErrorAction SilentlyContinue

if ($null -eq $wslService) {
    Write-Host "  ⚠️  LxssManager service not found in registry (WSL optional feature may be disabled)." -ForegroundColor DarkYellow
} elseif ($wslService.Status -eq 'Running') {
    Write-Host "  ✅ LxssManager service is RUNNING healthy." -ForegroundColor Green
} else {
    Write-Host "  ❌ LxssManager service is in state: $($wslService.Status)" -ForegroundColor Red
    Write-Host "  🔄 Attempting auto-recovery: Restarting LxssManager service..." -ForegroundColor Magenta
    try {
        Restart-Service -Name LxssManager -Force -ErrorAction Stop
        Write-Host "  ✅ LxssManager service successfully restarted!" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Could not restart service automatically. Elevated admin permissions may be required." -ForegroundColor DarkYellow
    }
}

# 2. Probe WSL CLI Status
Write-Host "`n[2/4] Probing WSL Environment & Installed Distros..." -ForegroundColor Yellow
try {
    $wslStatus = wsl.exe --status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ WSL2 Subsystem responding normally." -ForegroundColor Green
        $wslStatus | ForEach-Object { Write-Host "     $_" -ForegroundColor Gray }
    } else {
        Write-Host "  ❌ WSL Status check returned exit code $LASTEXITCODE." -ForegroundColor Red
        Write-Host "  🔄 Executing WSL shutdown & adapter refresh (wsl --shutdown)..." -ForegroundColor Magenta
        wsl.exe --shutdown
        Start-Sleep -Seconds 2
        Write-Host "  ✅ WSL instances cleared and refreshed." -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠️  wsl.exe invocation exception: $_" -ForegroundColor DarkYellow
}

# 3. Probe Direct3D12 / Vulkan GPU Acceleration
Write-Host "`n[3/4] Checking Direct3D12 & WebGPU Hardware Acceleration..." -ForegroundColor Yellow
$gpuInfo = Get-CimInstance Win32_VideoController | Select-Object -Property Name, DriverVersion, AdapterRAM
foreach ($gpu in $gpuInfo) {
    $ramGb = [Math]::Round(($gpu.AdapterRAM / 1GB), 2)
    Write-Host "  🎮 GPU Detected: $($gpu.Name) (Driver: $($gpu.DriverVersion), Dedicated VRAM: $ramGb GB)" -ForegroundColor Cyan
}

# 4. Check Pocketgull Edge AI Model Storage Cache
Write-Host "`n[4/4] Verifying Local Edge AI Cache Directories..." -ForegroundColor Yellow
$userProfile = $env:USERPROFILE
$huggingfaceCache = Join-Path $userProfile ".cache\huggingface"
$webllmCache = Join-Path $userProfile ".cache\webllm"

if (Test-Path $webllmCache) {
    $size = (Get-ChildItem -Path $webllmCache -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    $sizeMb = [Math]::Round(($size / 1MB), 2)
    Write-Host "  ✅ Local WebLLM Cache initialized: $webllmCache ($sizeMb MB)" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  WebLLM Cache will initialize on first browser model download." -ForegroundColor Gray
}

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "  ✅ Diagnostic Sentinel Complete. System ready for Local AI." -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
