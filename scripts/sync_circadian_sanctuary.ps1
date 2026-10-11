param(
    [ValidateSet('670', 'scotopic', 'night', 'washi', 'daylight', 'hemp', 'status')]
    [string]$Preset = '670'
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Sync Philips Hue Room Lights
$hueScript = Join-Path $scriptDir "sync_hue_circadian.ps1"
if (Test-Path $hueScript) {
    try {
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $hueScript -Preset $Preset
    } catch {
        Write-Warning "Hue sync warning: $($_.Exception.Message)"
    }
}

# 2. Sync Razer Chroma Peripherals (Keyboard, Mouse, Mousepad)
try {
    $initPayload = @{
        title = "PocketGull Circadian Sanctuary"
        description = "Unified Circadian Peripheral Lighting"
        author = @{ name = "Phil"; contact = "pocketgull.com" }
        device_supported = @("keyboard", "mouse", "mousepad", "headset", "chromalink")
        category = "application"
    } | ConvertTo-Json

    $initRes = Invoke-RestMethod -Uri "http://localhost:54235/razer/chromasdk" -Method Post -Body $initPayload -ContentType "application/json" -TimeoutSec 2
    
    # Chroma color is BGR (0x00BBGGRR)
    $colorBGR = if ($Preset -in '670', 'scotopic', 'night') {
        0x001010E0 # Deep Warm Ruby Red (R=224, G=16, B=16)
    } elseif ($Preset -in 'washi', 'daylight') {
        0x0088940D # Washi Soft Teal (R=13, G=148, B=136)
    } else {
        0x000953B4 # Warm Hemp Sepia
    }

    $staticEffect = @{
        effect = "CHROMA_STATIC"
        param = @{ color = $colorBGR }
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$($initRes.uri)/keyboard" -Method Put -Body $staticEffect -ContentType "application/json" | Out-Null
    Invoke-RestMethod -Uri "$($initRes.uri)/mouse" -Method Put -Body $staticEffect -ContentType "application/json" | Out-Null
    Invoke-RestMethod -Uri "$($initRes.uri)/mousepad" -Method Put -Body $staticEffect -ContentType "application/json" | Out-Null
    Write-Host "[OK] Razer Chroma peripherals synchronized to $Preset" -ForegroundColor Cyan
} catch {
    Write-Warning "Razer Chroma sync warning: $($_.Exception.Message)"
}

# 3. Soft Acoustic Confirmation Chime
$chime = "C:\Users\philg\AppData\Local\PocketGull\Sounds\pocketgull_ceramic_chime.wav"
if (Test-Path $chime) {
    try {
        (New-Object System.Media.SoundPlayer $chime).Play()
    } catch {}
}
