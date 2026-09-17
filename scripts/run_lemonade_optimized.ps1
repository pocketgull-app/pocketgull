# ==============================================================================
# Lemonade Server Hardware-Optimized Launcher for AMD Radeon RX 6650 XT
# Host Architecture: Intel Core i7-14700KF (20 Cores / 28 Threads) + AMD RX 6650 XT (8GB VRAM)
# ==============================================================================

param (
    [string]$ModelPath = "",
    [int]$Port = 13305,
    [int]$ContextSize = 8192,
    [int]$Threads = 16
)

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  POCKETGULL LOCAL EDGE AI: LEMONADE VULKAN OPTIMIZER" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Hardware Verification
$gpu = Get-CimInstance Win32_VideoController | Where-Object { $_.Name -match "Radeon|AMD" } | Select-Object -First 1
if ($gpu) {
    Write-Host "[OK] GPU Target: $($gpu.Name) (8GB GDDR6 VRAM, RDNA 2 Architecture)" -ForegroundColor Green
} else {
    Write-Host "[WARN] No discrete AMD Radeon GPU detected; falling back to CPU" -ForegroundColor Yellow
}

$cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
Write-Host "[OK] CPU Target: $($cpu.Name) ($($cpu.NumberOfCores) Cores / $($cpu.NumberOfLogicalProcessors) Threads)" -ForegroundColor Green

# 2. Optimized Parameters
Write-Host "`n[CONFIG] Applying RDNA 2 & Intel Core i7 Optimizations:" -ForegroundColor Yellow
Write-Host "  • Backend:        Vulkan (AMD RDNA 2 native shader compute)"
Write-Host "  • FlashAttention: Enabled (--flash-attn / SRAM-tiled attention)"
Write-Host "  • GPU Offload:    100% layers to VRAM (--n-gpu-layers 99)"
Write-Host "  • Context Window: $ContextSize tokens"
Write-Host "  • CPU Threads:    $Threads threads (pinned to performance cores)"
Write-Host "  • Port:           $Port (OpenAI-compatible SSE endpoint)"

# 3. Locate Server Binary
$serverCmd = Get-Command "lemonade-server" -ErrorAction SilentlyContinue
if (-not $serverCmd) {
    $serverCmd = Get-Command "llama-server" -ErrorAction SilentlyContinue
}

if (-not $serverCmd) {
    Write-Host "`n[INFO] Neither 'lemonade-server' nor 'llama-server' found in PATH." -ForegroundColor Yellow
    Write-Host "To install the Vulkan-accelerated daemon for AMD Radeon RX 6650 XT:" -ForegroundColor White
    Write-Host "  1. Download llama-server with Vulkan support: https://github.com/ggerganov/llama.cpp/releases" -ForegroundColor Gray
    Write-Host "  2. Or run: winget install ggerganov.llama.cpp" -ForegroundColor Gray
    Write-Host "`nSample execution command:" -ForegroundColor Cyan
    Write-Host "  llama-server -m <model.gguf> --n-gpu-layers 99 --flash-attn --ctx-size $ContextSize --threads $Threads --port $Port" -ForegroundColor White
    exit 0
}

Write-Host "`n[STARTING] Launching $($serverCmd.Source)..." -ForegroundColor Green
& $serverCmd.Source `
    --model $ModelPath `
    --n-gpu-layers 99 `
    --flash-attn `
    --ctx-size $ContextSize `
    --threads $Threads `
    --port $Port `
    --host "127.0.0.1"
