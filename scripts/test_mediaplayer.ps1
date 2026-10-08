# Test WASAPI MediaPlayer robust continuous playback
Add-Type -AssemblyName PresentationCore

$soundDir = Join-Path $env:LOCALAPPDATA "PocketGull\Sounds\Entrainment"
$wavFile = Join-Path $soundDir "entrainment_studio_focus10.wav"

$player = New-Object System.Windows.Media.MediaPlayer
$player.Open([Uri]$wavFile)

# Event handler for seamless looping
$script:isPlaying = $true
Register-ObjectEvent -InputObject $player -EventName "MediaEnded" -Action {
    $Event.Sender.Position = [TimeSpan]::Zero
    $Event.Sender.Play()
} | Out-Null

$player.Volume = 0.7
$player.Play()
Write-Host "MediaPlayer playing on WASAPI. Testing coexistence with other sounds..."

# Now play a sound with SoundPlayer to prove it DOES NOT interrupt MediaPlayer
Start-Sleep -Seconds 3
$chime = Join-Path $env:LOCALAPPDATA "PocketGull\Sounds\pocketgull_ceramic_chime.wav"
if (Test-Path $chime) {
    Write-Host "Playing ceramic chime via SoundPlayer..."
    $sp = New-Object System.Media.SoundPlayer($chime)
    $sp.Play()
}

Start-Sleep -Seconds 5
Write-Host "Checking MediaPlayer status: Position = $($player.Position.TotalSeconds)s"
$player.Stop()
$player.Close()
Write-Host "Test complete!"
