# PocketGull Game-Engine Quest Audio Handler
# Fires exclusively when a turn completes (Stop Event).
# Emits rich Underworld-inspired progressive electronic textures, game XP levels, and Solfeggio resolutions.

param()

$ErrorActionPreference = "SilentlyContinue"

# 1. Read Antigravity context
$stdinRaw = ""
try {
    if ([Console]::IsInputRedirected) {
        $stdinRaw = [Console]::In.ReadToEnd()
    }
} catch { }

$context = $null
if (![string]::IsNullOrWhiteSpace($stdinRaw)) {
    try {
        $context = $stdinRaw | ConvertFrom-Json
    } catch { }
}

$workspacePath = ""
if ($context -and $context.workspacePaths -and $context.workspacePaths.Count -gt 0) {
    $workspacePath = $context.workspacePaths[0]
}
$stepCount = if ($context -and $context.executionNum) { [int]$context.executionNum } else { 1 }

# 2. Game Level / Quest Tiering
$soundsDir = "C:\Users\philg\AppData\Local\PocketGull\Sounds"
$chimeCeramic = Join-Path $soundsDir "pocketgull_ceramic_chime.wav"
$chime528     = Join-Path $soundsDir "pocketgull_528hz_notification.wav"
$chordOcean   = Join-Path $soundsDir "pocketgull_ocean_chord.wav"
$chime432     = Join-Path $soundsDir "pocketgull_432hz_asterisk.wav"
$dorianSanctuary = Join-Path $soundsDir "ambient_432hz_dorian_sanctuary.wav"

$levelName = "Checkpoint"
$soundToPlay = $chime528

if ($workspacePath -like "*pocketgull*" -or $workspacePath -like "*pg2*") {
    $projectName = "PocketGull"
    # Underworld-style atmospheric resolution / Ocean Chord
    $soundToPlay = if (Test-Path $chordOcean) { $chordOcean } else { $chime528 }
    $levelName = "Quest Victory (Ocean Chord)"
} elseif ($workspacePath -like "*monastic*" -or $workspacePath -like "*photo*") {
    $projectName = "Monastic Scriptorium"
    $soundToPlay = if (Test-Path $chime432) { $chime432 } else { $chimeCeramic }
    $levelName = "Folio Illuminated (432Hz Sacred)"
} else {
    $projectName = "General Sanctuary"
    $soundToPlay = if (Test-Path $chimeCeramic) { $chimeCeramic } else { $chime528 }
    $levelName = "Milestone Unlocked"
}

# Play sound asynchronously so the UI turn ends instantly without stutter
try {
    if (Test-Path $soundToPlay) {
        $player = New-Object System.Media.SoundPlayer $soundToPlay
        $player.Play()
    }
} catch { }

# 3. Log to Daily Resonance
try {
    $journalDir = "C:\Users\philg\.gemini\acoustic_journal"
    if (!(Test-Path $journalDir)) {
        New-Item -ItemType Directory -Path $journalDir -Force | Out-Null
    }
    $today = Get-Date -Format "yyyy-MM-dd"
    $journalFile = Join-Path $journalDir "resonance_$today.jsonl"
    
    $entry = [ordered]@{
        timestamp   = (Get-Date).ToString("o")
        project     = $projectName
        questLevel  = $levelName
        workspace   = $workspacePath
        conversationId = if ($context) { $context.conversationId } else { "" }
    }
    
    $jsonLine = ($entry | ConvertTo-Json -Compress)
    Add-Content -Path $journalFile -Value $jsonLine -Encoding UTF8
} catch { }

# 4. Antigravity Stop Hook Response
[Console]::Out.Write('{"decision":"allow"}')
