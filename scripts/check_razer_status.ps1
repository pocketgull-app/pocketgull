$output = [ordered]@{}

# 1. Check Windows LampArray / Dynamic Lighting Devices
$pnp = Get-PnpDevice -PresentOnly | Where-Object { $_.FriendlyName -match 'Razer|Chroma|LampArray' } | Select-Object FriendlyName, InstanceId, Status, Class
$output['PnpDevices'] = $pnp

# 2. Check Dynamic Lighting registry settings
$dynLight = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Lighting" -ErrorAction SilentlyContinue
$output['DynamicLightingSettings'] = $dynLight

# 3. Check Razer Chroma SDK Registry & Ports
$chromaReg = Get-ItemProperty -Path "HKLM:\SOFTWARE\WOW6432Node\Razer Chroma SDK" -ErrorAction SilentlyContinue
$output['ChromaSdkRegistry'] = $chromaReg

# 4. Check if Razer Chroma SDK REST API is responding
try {
    $response = Invoke-RestMethod -Uri "http://localhost:54235/razer/chromasdk/heartbeat" -Method Get -TimeoutSec 2 -ErrorAction Stop
    $output['ChromaRestApi54235'] = $response
} catch {
    $output['ChromaRestApi54235'] = "Not reachable: $($_.Exception.Message)"
}

try {
    $response12076 = Invoke-RestMethod -Uri "http://localhost:12076/razer/chromasdk/heartbeat" -Method Get -TimeoutSec 2 -ErrorAction Stop
    $output['ChromaRestApi12076'] = $response12076
} catch {
    $output['ChromaRestApi12076'] = "Not reachable: $($_.Exception.Message)"
}

# 5. Check Razer processes and running services
$services = Get-Service | Where-Object { $_.Name -match 'Razer|Chroma' } | Select-Object Name, DisplayName, Status, StartType
$output['RazerServices'] = $services

$output | ConvertTo-Json -Depth 4
