param(
    [ValidateSet('670', 'scotopic', 'night', 'washi', 'morning', 'hemp', 'afternoon', 'off', 'status')]
    [string]$Preset = '670'
)

$configFile = Join-Path $env:LOCALAPPDATA "PocketGull\Hue\hue_config.json"
if (-not (Test-Path $configFile)) {
    Write-Error "Hue configuration file not found at $configFile. Run pair_hue_bridge.ps1 first."
    exit 1
}

$cfg = Get-Content -Path $configFile -Raw | ConvertFrom-Json
$bridgeIp = $cfg.bridgeIp
$username = $cfg.username
$baseUrl = "http://$bridgeIp/api/$username"

function Set-HueLightState {
    param(
        [string]$LightId,
        [hashtable]$State
    )
    $uri = "$baseUrl/lights/$LightId/state"
    $body = $State | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri $uri -Method Put -Body $body -ContentType "application/json" -TimeoutSec 3 | Out-Null
    } catch {
        Write-Warning "Failed to set light $LightId state: $($_.Exception.Message)"
    }
}

if ($Preset -eq 'status') {
    $lights = Invoke-RestMethod -Uri "$baseUrl/lights" -Method Get
    Write-Host "`nHue Lights Status ($bridgeIp):" -ForegroundColor Cyan
    foreach ($prop in $lights.PSObject.Properties) {
        $l = $prop.Value
        Write-Host "  [$($prop.Name)] $($l.name) ($($l.type))" -ForegroundColor White
        Write-Host "       On: $($l.state.on), Brightness: $($l.state.bri), Colormode: $($l.state.colormode)" -ForegroundColor Gray
    }
    exit 0
}

Write-Host "[+] Applying Hue Preset: $Preset to room lights..." -ForegroundColor Cyan

switch ($Preset) {
    { $_ -in '670', 'scotopic', 'night' } {
        # 670nm Scotopic Deep Red
        # Extended color lights: Whispy (5), Lightstrip (6) -> CIE xy [0.692, 0.308] pure saturated red
        # Dimmable lights: Main (4), Cornear (7) -> dim to 10%
        Set-HueLightState -LightId "5" -State @{ on = $true; bri = 90; xy = @(0.692, 0.308); transitiontime = 15 }
        Set-HueLightState -LightId "6" -State @{ on = $true; bri = 110; xy = @(0.692, 0.308); transitiontime = 15 }
        Set-HueLightState -LightId "4" -State @{ on = $true; bri = 20; transitiontime = 15 }
        Set-HueLightState -LightId "7" -State @{ on = $true; bri = 15; transitiontime = 15 }
        Write-Host "  • Whispy & Lightstrip: Scotopic 670nm Deep Red" -ForegroundColor Red
        Write-Host "  • Main & Cornear: Damped to 10-15% low glare" -ForegroundColor DarkRed
    }
    { $_ -in 'washi', 'morning' } {
        # Morning Washi Daylight (4000K daylight, ct = 250)
        Set-HueLightState -LightId "5" -State @{ on = $true; bri = 220; ct = 250; transitiontime = 20 }
        Set-HueLightState -LightId "6" -State @{ on = $true; bri = 220; ct = 250; transitiontime = 20 }
        Set-HueLightState -LightId "4" -State @{ on = $true; bri = 200; transitiontime = 20 }
        Set-HueLightState -LightId "7" -State @{ on = $true; bri = 180; transitiontime = 20 }
        Write-Host "  • All lights: Morning Washi 4000K Daylight" -ForegroundColor Yellow
    }
    { $_ -in 'hemp', 'afternoon' } {
        # Afternoon Hemp Warm Sepia (2700K warm white, ct = 370)
        Set-HueLightState -LightId "5" -State @{ on = $true; bri = 180; ct = 370; transitiontime = 20 }
        Set-HueLightState -LightId "6" -State @{ on = $true; bri = 180; ct = 370; transitiontime = 20 }
        Set-HueLightState -LightId "4" -State @{ on = $true; bri = 160; transitiontime = 20 }
        Set-HueLightState -LightId "7" -State @{ on = $true; bri = 140; transitiontime = 20 }
        Write-Host "  • All lights: Afternoon Hemp 2700K Soft Sepia" -ForegroundColor DarkYellow
    }
    'off' {
        Set-HueLightState -LightId "4" -State @{ on = $false; transitiontime = 10 }
        Set-HueLightState -LightId "5" -State @{ on = $false; transitiontime = 10 }
        Set-HueLightState -LightId "6" -State @{ on = $false; transitiontime = 10 }
        Set-HueLightState -LightId "7" -State @{ on = $false; transitiontime = 10 }
        Write-Host "  • All room lights turned off" -ForegroundColor Gray
    }
}
