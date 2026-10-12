# PocketGull Neural Voice Reflection & Spoken Milestone Briefing
# Delivers warm, empathetic spoken briefings using Windows SAPI / Neural voice with Philocardia pacing

param(
    [string]$Text = "Today's engineering milestones have been successfully harmonized.",
    [switch]$EveningReflection
)

$ErrorActionPreference = "SilentlyContinue"

Add-Type -AssemblyName System.Speech

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer

# Calibrate vocal prosody: unhurried, grounded cadence (~110-120 WPM)
$synth.Rate = -1
$synth.Volume = 85

# Select highest quality warm/natural installed voice (prefer Zira/Eva/David)
$installedVoices = $synth.GetInstalledVoices() | Where-Object { $_.Enabled }
$targetVoice = $installedVoices | Where-Object { $_.VoiceInfo.Name -match "Zira|Eva|Jenny|Natural" } | Select-Object -First 1

if ($targetVoice) {
    $synth.SelectVoice($targetVoice.VoiceInfo.Name)
}

if ($EveningReflection) {
    $journalFile = "C:\Users\philg\.gemini\acoustic_journal\resonance_$(Get-Date -Format 'yyyy-MM-dd').jsonl"
    if (Test-Path $journalFile) {
        $entries = @(Get-Content $journalFile -Encoding UTF8 | ForEach-Object { $_ | ConvertFrom-Json })
        $count = $entries.Count
        $pockets = ($entries | Where-Object { $_.project -like "*PocketGull*" }).Count
        $monastics = ($entries | Where-Object { $_.project -like "*Seven Generations*" -or $_.project -like "*Scriptorium*" }).Count
        
        $Text = "Good evening Phil. Today you harmonized $count creative milestones. PocketGull advanced through $pockets healing chords. Your architectural labor is complete, and it is safe to rest."
    } else {
        $Text = "Good evening Phil. All systems are resting peacefully in sanctuary mode."
    }
}

Write-Host "🎙️ Speaking briefing: `"$Text`"" -ForegroundColor Cyan

# Speak asynchronously to prevent UI freezing
$synth.SpeakAsync($Text) | Out-Null
