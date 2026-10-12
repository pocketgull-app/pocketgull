# PocketGull Daily Acoustic Reflection & Time-Lapse Replay
[CmdletBinding()]
param(
    [switch]$PlayAudio,
    [string]$Date = (Get-Date -Format "yyyy-MM-dd")
)

$journalFile = "C:\Users\philg\.gemini\acoustic_journal\resonance_$Date.jsonl"

if (!(Test-Path $journalFile)) {
    Write-Host ""
    Write-Host "PocketGull Daily Resonance Journal ($Date)" -ForegroundColor Cyan
    Write-Host "No acoustic completions recorded yet for today." -ForegroundColor DarkGray
    return
}

$rawLines = Get-Content $journalFile -Encoding UTF8
$entries = @($rawLines | ForEach-Object { $_ | ConvertFrom-Json })
$totalCount = $entries.Count
$projectGroups = $entries | Group-Object -Property project
$tierGroups = $entries | Group-Object -Property tierName

Write-Host ""
Write-Host "POCKETGULL DAILY ACOUSTIC REFLECTION ($Date)" -ForegroundColor Cyan
Write-Host "Total Completed Milestones: $totalCount" -ForegroundColor Green
Write-Host "---------------------------------------------------------" -ForegroundColor DarkGray

Write-Host ""
Write-Host "[Projects in Flow]" -ForegroundColor Yellow
foreach ($pg in $projectGroups) {
    Write-Host ("  * {0,-20} : {1,2} milestones" -f $pg.Name, $pg.Count) -ForegroundColor White
}

Write-Host ""
Write-Host "[Workload Complexity Distribution]" -ForegroundColor Yellow
foreach ($tg in $tierGroups) {
    Write-Host ("  * {0,-20} : {1,2} chords" -f $tg.Name, $tg.Count) -ForegroundColor White
}
Write-Host "---------------------------------------------------------" -ForegroundColor DarkGray

if ($PlayAudio) {
    Write-Host ""
    Write-Host "Playing 15-second acoustic daily time-lapse..." -ForegroundColor Magenta
    $soundsDir = "C:\Users\philg\AppData\Local\PocketGull\Sounds"
    $chimeCeramic = Join-Path $soundsDir "pocketgull_ceramic_chime.wav"
    $chime528     = Join-Path $soundsDir "pocketgull_528hz_notification.wav"
    $chordOcean   = Join-Path $soundsDir "pocketgull_ocean_chord.wav"
    $chime432     = Join-Path $soundsDir "pocketgull_432hz_asterisk.wav"

    # Intelligently sample down to a maximum of 16-20 musical chords
    # so the time-lapse strictly takes ~15 seconds even with hundreds of entries
    $sampleCount = [Math]::Min(18, $entries.Count)
    $step = [Math]::Max(1, [int]($entries.Count / $sampleCount))
    $sampledEntries = for ($i = 0; $i -lt $entries.Count; $i += $step) { $entries[$i] }

    foreach ($e in $sampledEntries) {
        $soundToPlay = $chimeCeramic
        if ($e.project -like "*PocketGull*" -and $e.tier -ge 3) {
            $soundToPlay = $chordOcean
        } elseif ($e.tier -eq 1) {
            $soundToPlay = $chime528
        } elseif ($e.project -like "*Seven Generations*" -or $e.project -like "*Scriptorium*") {
            $soundToPlay = $chime432
        }

        if (Test-Path $soundToPlay) {
            $player = New-Object System.Media.SoundPlayer $soundToPlay
            $player.PlaySync()
            Start-Sleep -Milliseconds 80
        }
    }
    Write-Host "Daily acoustic reflection complete. Rest well." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Tip: Run with -PlayAudio to hear your day played back in musical time-lapse." -ForegroundColor DarkGray
}
