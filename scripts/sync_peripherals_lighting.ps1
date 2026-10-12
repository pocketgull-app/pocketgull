# PocketGull Circadian Peripheral Lighting Synchronizer (Razer Chroma & NZXT CAM)
# Strictly synchronizes hardware illumination with solar & cognitive themes:
#   * Washi (Daylight): Warm 2700K White / Gold
#   * Hemp (Afternoon): Sepia / Amber
#   * Scotopic / 670 (Night): Pure 650nm Deep Ruby Red (Mitochondrial CcO support & melatonin safe)

param(
    [ValidateSet('washi', 'hemp', '670', 'scotopic', 'obsidian')]
    [string]$Theme = '670'
)

$ErrorActionPreference = 'SilentlyContinue'

# ── 1. RAZER CHROMA HARDWARE SYNC ──
# Colors in Chroma REST API are BGR (0x00BBGGRR):
$chromaColorMap = @{
    'washi'    = 0x00389BC2  # Warm Daylight Gold/Cream (R=194, G=155, B=56)
    'hemp'     = 0x0040628A  # Warm Sepia Amber (R=138, G=98, B=64)
    'obsidian' = 0x00000000  # Dark / Off
    '670'      = 0x001010E0  # Pure 650nm Deep Ruby Red (R=224, G=16, B=16)
    'scotopic' = 0x001010E0  # Pure 650nm Deep Ruby Red
}

$colorBGR = $chromaColorMap[$Theme]

$initPayload = @{
    title = "PocketGull Circadian Sync"
    description = "Hardware Peripheral Circadian Illumination"
    author = @{ name = "Phil"; contact = "pocketgull.com" }
    device_supported = @("keyboard", "mouse", "mousepad", "headset", "chromalink")
    category = "application"
} | ConvertTo-Json

try {
    $initRes = Invoke-RestMethod -Uri "http://localhost:54235/razer/chromasdk" -Method Post -Body $initPayload -ContentType "application/json" -TimeoutSec 3
    if ($initRes -and $initRes.uri) {
        $staticEffect = @{
            effect = "CHROMA_STATIC"
            param = @{ color = $colorBGR }
        } | ConvertTo-Json

        Invoke-RestMethod -Uri "$($initRes.uri)/keyboard" -Method Put -Body $staticEffect -ContentType "application/json" -TimeoutSec 2 | Out-Null
        Invoke-RestMethod -Uri "$($initRes.uri)/mouse" -Method Put -Body $staticEffect -ContentType "application/json" -TimeoutSec 2 | Out-Null
        Invoke-RestMethod -Uri "$($initRes.uri)/mousepad" -Method Put -Body $staticEffect -ContentType "application/json" -TimeoutSec 2 | Out-Null
        Invoke-RestMethod -Uri "$($initRes.uri)/chromalink" -Method Put -Body $staticEffect -ContentType "application/json" -TimeoutSec 2 | Out-Null
        Write-Host "  [OK] Razer Chroma synchronized to $Theme" -ForegroundColor Green
    }
} catch {
    Write-Host "  [!] Razer Chroma SDK unavailable or not responding." -ForegroundColor DarkGray
}

# ── 2. NZXT CAM CHASSIS & COOLER SYNC ──
# NZXT CAM uses standard hex RGB ("RRGGBB")
$nzxtColorMap = @{
    'washi'    = "C29B38"  # Warm Gold
    'hemp'     = "8A6240"  # Warm Sepia
    'obsidian' = "000000"  # Off
    '670'      = "DC2626"  # Pure 650nm Scotopic Red
    'scotopic' = "DC2626"
}
$targetHex = $nzxtColorMap[$Theme]

$nzxtControllerPath = "C:\Users\philg\AppData\Roaming\NZXT CAM\DataStorage\latest\user\lightingController.json"
if (Test-Path $nzxtControllerPath) {
    try {
        $cfg = Get-Content $nzxtControllerPath -Raw | ConvertFrom-Json
        # Update channel 5, channel 6, and all channels in Default profile
        foreach ($p in $cfg.profiles) {
            if ($p.id -eq "DEFAULT") {
                foreach ($cs in $p.channelSettings) {
                    if ($cs.mode -and $cs.mode.ledRgbs) {
                        for ($i = 0; $i -lt $cs.mode.ledRgbs.Count; $i++) {
                            $cs.mode.ledRgbs[$i] = $targetHex
                        }
                    }
                }
            }
        }
        $cfg | ConvertTo-Json -Depth 10 | Set-Content $nzxtControllerPath -Encoding UTF8
        Write-Host "  [OK] NZXT CAM lighting profiles aligned to $Theme ($targetHex)" -ForegroundColor Green
    } catch { }
}
