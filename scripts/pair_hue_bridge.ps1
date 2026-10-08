param(
    [string]$BridgeIp = "192.168.88.5",
    [int]$TimeoutSeconds = 45
)

$uri = "http://$BridgeIp/api"
$body = '{"devicetype":"pocketgull#workstation"}'
$configDir = Join-Path $env:LOCALAPPDATA "PocketGull\Hue"
if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}
$configFile = Join-Path $configDir "hue_config.json"

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "   PHILIPS HUE BRIDGE PAIRING FOR POCKETGULL" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Target Bridge: $BridgeIp"
Write-Host "Please press the large round button on top of your Hue Bridge now!" -ForegroundColor Yellow
Write-Host "Waiting up to $TimeoutSeconds seconds for button press..."

$start = Get-Date
$username = $null

while (((Get-Date) - $start).TotalSeconds -lt $TimeoutSeconds) {
    try {
        $res = Invoke-RestMethod -Uri $uri -Method Post -Body $body -ContentType "application/json" -TimeoutSec 3
        if ($res.success) {
            $username = $res.success.username
            break
        } elseif ($res.error.type -eq 101) {
            # Link button not pressed yet
            Write-Host "." -NoNewline -ForegroundColor DarkGray
        } else {
            Write-Host "`nBridge returned: $($res | ConvertTo-Json -Compress)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "x" -NoNewline -ForegroundColor Red
    }
    Start-Sleep -Seconds 2
}

Write-Host ""
if ($username) {
    Write-Host "`n[SUCCESS] Successfully paired with Hue Bridge!" -ForegroundColor Green
    Write-Host "PocketGull Hue API Username: $username" -ForegroundColor Green
    
    $config = @{
        bridgeIp = $BridgeIp
        username = $username
        pairedAt = (Get-Date).ToString("o")
    }
    $config | ConvertTo-Json | Set-Content -Path $configFile -Encoding UTF8
    Write-Host "Configuration saved to: $configFile" -ForegroundColor Cyan
    
    # Query lights list
    try {
        $lights = Invoke-RestMethod -Uri "http://$BridgeIp/api/$username/lights" -Method Get
        Write-Host "`nFound Lights:" -ForegroundColor Cyan
        foreach ($prop in $lights.PSObject.Properties) {
            $light = $prop.Value
            Write-Host "  [$($prop.Name)] $($light.name) ($($light.type)) - State: $(if ($light.state.on) {'ON'} else {'OFF'})" -ForegroundColor White
        }
    } catch {
        Write-Host "Failed to list lights: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "`n[TIMEOUT] Link button was not pressed within $TimeoutSeconds seconds." -ForegroundColor Red
    Write-Host "Please ensure you press the physical button on top of the bridge and run this again." -ForegroundColor Yellow
}
