# Test Razer Chroma REST API color sync
$initPayload = @{
    title = "PocketGull Circadian Sync"
    description = "Circadian Scotopic Lighting Sync"
    author = @{
        name = "Phil"
        contact = "pocketgull.com"
    }
    device_supported = @("keyboard", "mouse", "mousepad", "headset", "chromalink")
    category = "application"
} | ConvertTo-Json

try {
    $initRes = Invoke-RestMethod -Uri "http://localhost:54235/razer/chromasdk" -Method Post -Body $initPayload -ContentType "application/json"
    Write-Output "Chroma Session Initialized: $($initRes.sessionid), URI: $($initRes.uri)"
    
    # In Chroma REST API, color is BGR (0x00BBGGRR):
    # Ruby Red #DC2626 -> Red: 0xDC, Green: 0x26, Blue: 0x26 -> (Blue * 65536) + (Green * 256) + Red
    # Pure 670nm Deep Red: Red: 220 (0xDC), Green: 0, Blue: 0 -> 220 (0x000000DC) or Ruby Red 0x2626DC
    # Let's set static color for keyboard, mouse, and mousepad
    
    $colorBGR = 0x001010E0 # Deep Warm Ruby Red (R=224, G=16, B=16)
    
    $staticEffect = @{
        effect = "CHROMA_STATIC"
        param = @{
            color = $colorBGR
        }
    } | ConvertTo-Json
    
    # Apply to keyboard
    $kbRes = Invoke-RestMethod -Uri "$($initRes.uri)/keyboard" -Method Put -Body $staticEffect -ContentType "application/json"
    # Apply to mouse
    $mouseRes = Invoke-RestMethod -Uri "$($initRes.uri)/mouse" -Method Put -Body $staticEffect -ContentType "application/json"
    # Apply to mousepad
    $padRes = Invoke-RestMethod -Uri "$($initRes.uri)/mousepad" -Method Put -Body $staticEffect -ContentType "application/json"
    
    Write-Output "Applied to Keyboard: $($kbRes.result), Mouse: $($mouseRes.result), Mousepad: $($padRes.result)"
    
    # Send heartbeat
    $hb = Invoke-RestMethod -Uri "$($initRes.uri)/heartbeat" -Method Put
    Write-Output "Heartbeat tick: $($hb.tick)"
    
} catch {
    Write-Error "Chroma REST API Error: $($_.Exception.Message)"
}
