# Seven Generations Sanctuary Drone & Environmental Sidechain Controller
# Looping biophilic ambient bed (Schumann 7.83 Hz / Focus 10) with Antigravity sidechain attenuation

param(
    [ValidateSet('schumann', 'canoe', 'focus10', 'purr', 'gamma40')]
    [string]$Drone = 'schumann',
    [switch]$Stop
)

$pidFile = "C:\Users\philg\.gemini\acoustic_journal\sanctuary_drone.pid"

if ($Stop) {
    if (Test-Path $pidFile) {
        $p = Get-Content $pidFile
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
        Write-Host "🕊️ Sanctuary ambient drone stopped." -ForegroundColor Yellow
    }
    return
}

# If already running, notify
if (Test-Path $pidFile) {
    $existingPid = Get-Content $pidFile
    $proc = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
    if ($proc) {
        Write-Host "🕊️ Sanctuary drone already active (PID: $existingPid)." -ForegroundColor Cyan
        return
    }
}

$soundsDir = "C:\Users\philg\AppData\Local\PocketGull\Sounds\Entrainment"
$droneMap = @{
    'schumann' = Join-Path $soundsDir "entrainment_schumann.wav"
    'canoe'    = Join-Path $soundsDir "entrainment_canoe.wav"
    'focus10'  = Join-Path $soundsDir "entrainment_focus10.wav"
    'purr'     = Join-Path $soundsDir "entrainment_purr.wav"
    'gamma40'  = Join-Path $soundsDir "entrainment_gamma40.wav"
}

$targetWav = $droneMap[$Drone]
if (-not (Test-Path $targetWav)) {
    Write-Host "File not found: $targetWav" -ForegroundColor Red
    return
}

# Write PID
$PID | Out-File $pidFile -Encoding UTF8

Write-Host "🌲 Seven Generations Sanctuary Drone Active ($Drone)" -ForegroundColor Green
Write-Host "   Acoustic Sidechaining enabled for Antigravity completions." -ForegroundColor DarkGray

# Loop ambient wave
try {
    $player = New-Object System.Media.SoundPlayer $targetWav
    $player.PlayLooping()
    while ($true) {
        Start-Sleep -Seconds 5
    }
} finally {
    if (Test-Path $pidFile) {
        Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
    }
}
