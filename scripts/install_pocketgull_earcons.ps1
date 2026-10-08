<#
.SYNOPSIS
    PocketGull Sacred Frequency & Ceramic Earcon Sound Scheme Installer.
    Synthesizes custom 16-bit 44.1kHz organic audio earcons (528Hz Solfeggio, 432Hz Philocardia, 
    Ceramic Kiln Chime, Ocean Harmonic Chord) and maps them into Windows system sounds.

.DESCRIPTION
    Replaces harsh Windows alert chimes with gentle, parasympathetic acoustic signals:
    - 528 Hz Solfeggio   -> Windows System Notification
    - 432 Hz Philocardia -> Windows Asterisk / Information
    - Ceramic Kiln Chime -> Windows Theme Change
    - Ocean Grounding    -> Windows Exclamation / Warning

.EXAMPLE
    pwsh install_pocketgull_earcons.ps1 -Action Apply
    pwsh install_pocketgull_earcons.ps1 -Action Test
    pwsh install_pocketgull_earcons.ps1 -Action Restore
#>

param(
    [ValidateSet('Apply', 'Test', 'Restore', 'Status')]
    [string]$Action = 'Apply'
)

$ErrorActionPreference = 'Stop'
$soundDir = Join-Path $env:LOCALAPPDATA "PocketGull\Sounds"
if (-not (Test-Path $soundDir)) {
    New-Item -ItemType Directory -Path $soundDir -Force | Out-Null
}

$csharp = @"
using System;
using System.IO;

public class PocketGullSynthesizer {
    public static void SynthesizeWav(string filePath, double[] frequencies, double[] weights, double durationSec, double decayRate) {
        int sampleRate = 44100;
        int numSamples = (int)(sampleRate * durationSec);
        short[] samples = new short[numSamples];

        for (int i = 0; i < numSamples; i++) {
            double t = (double)i / sampleRate;
            double envelope = Math.Exp(-decayRate * t);
            
            // Soft 15ms attack envelope to eliminate transient clicks
            if (t < 0.015) {
                envelope *= (t / 0.015);
            }

            double value = 0;
            for (int f = 0; f < frequencies.Length; f++) {
                value += Math.Sin(2.0 * Math.PI * frequencies[f] * t) * weights[f];
            }

            double finalSample = value * envelope * 0.70;
            short s = (short)Math.Max(short.MinValue, Math.Min(short.MaxValue, finalSample * short.MaxValue));
            samples[i] = s;
        }

        using (FileStream fs = new FileStream(filePath, FileMode.Create))
        using (BinaryWriter bw = new BinaryWriter(fs)) {
            bw.Write(System.Text.Encoding.ASCII.GetBytes("RIFF"));
            bw.Write(36 + numSamples * 2);
            bw.Write(System.Text.Encoding.ASCII.GetBytes("WAVE"));
            bw.Write(System.Text.Encoding.ASCII.GetBytes("fmt "));
            bw.Write(16);
            bw.Write((short)1); // PCM
            bw.Write((short)1); // Mono
            bw.Write(sampleRate);
            bw.Write(sampleRate * 2);
            bw.Write((short)2);
            bw.Write((short)16);
            bw.Write(System.Text.Encoding.ASCII.GetBytes("data"));
            bw.Write(numSamples * 2);
            for (int i = 0; i < numSamples; i++) {
                bw.Write(samples[i]);
            }
        }
    }
}
"@

Add-Type -TypeDefinition $csharp -ErrorAction SilentlyContinue

$wav528    = Join-Path $soundDir "pocketgull_528hz_notification.wav"
$wav432    = Join-Path $soundDir "pocketgull_432hz_asterisk.wav"
$wavChime  = Join-Path $soundDir "pocketgull_ceramic_chime.wav"
$wavOcean  = Join-Path $soundDir "pocketgull_ocean_chord.wav"

function Generate-AllEarcons {
    Write-Host "[+] Synthesizing PocketGull Organic Acoustic Waveforms..." -ForegroundColor Cyan
    # 528 Hz Solfeggio: 528Hz + 1056Hz Octave, warm exponential decay (2.0s)
    [PocketGullSynthesizer]::SynthesizeWav($wav528, @(528.0, 1056.0), @(0.75, 0.25), 2.0, 2.8)
    Write-Host "  • 528 Hz Solfeggio Transformation: $wav528" -ForegroundColor Green

    # 432 Hz Philocardia: 432Hz fundamental, gentle calming decay (1.6s)
    [PocketGullSynthesizer]::SynthesizeWav($wav432, @(432.0, 864.0), @(0.80, 0.20), 1.6, 3.0)
    Write-Host "  • 432 Hz Philocardia Vagal Resonance: $wav432" -ForegroundColor Green

    # Ceramic Chime: 1320 Hz + 2640 Hz airy bell overtone (1.2s)
    [PocketGullSynthesizer]::SynthesizeWav($wavChime, @(1320.0, 2640.0, 3960.0), @(0.65, 0.25, 0.10), 1.2, 4.5)
    Write-Host "  • Flight Sanctuary Ceramic Kiln Chime: $wavChime" -ForegroundColor Green

    # Ocean Grounding: 216Hz + 432Hz + 648Hz triad chord (2.2s)
    [PocketGullSynthesizer]::SynthesizeWav($wavOcean, @(216.0, 432.0, 648.0), @(0.50, 0.35, 0.15), 2.2, 2.5)
    Write-Host "  • Ocean Triad Grounding Chord: $wavOcean" -ForegroundColor Green
}

function Set-EventSound {
    param([string]$eventKey, [string]$wavPath)
    $regPath = "HKCU:\AppEvents\Schemes\Apps\.Default\$eventKey\.Current"
    if (-not (Test-Path $regPath)) {
        New-Item -Path $regPath -Force | Out-Null
    }
    Set-ItemProperty -Path $regPath -Name "(default)" -Value $wavPath -Force
}

if ($Action -eq 'Apply') {
    Generate-AllEarcons
    Write-Host "`n[+] Mapping Earcons to Windows System Sound Events..." -ForegroundColor Cyan

    Set-EventSound -eventKey "Notification.Default" -wavPath $wav528
    Set-EventSound -eventKey "SystemNotification"   -wavPath $wav528
    Set-EventSound -eventKey "SystemAsterisk"       -wavPath $wav432
    Set-EventSound -eventKey "ChangeTheme"          -wavPath $wavChime
    Set-EventSound -eventKey "SystemExclamation"    -wavPath $wavOcean

    Write-Host "[✓] PocketGull Earcon Sound Scheme is now active in Windows!" -ForegroundColor Green
    Write-Host "    - Windows Notification: 528 Hz Solfeggio"
    Write-Host "    - Information / Asterisk: 432 Hz Philocardia"
    Write-Host "    - Theme Change: Ceramic Kiln Bell"
    Write-Host "    - System Warning: Ocean Harmonic Chord`n"
}
elseif ($Action -eq 'Test') {
    Write-Host "`n[+] Playing PocketGull Earcons..." -ForegroundColor Cyan
    $player = New-Object System.Media.SoundPlayer

    Write-Host "  ▶ Playing 528 Hz Solfeggio (Notification)..."
    $player.SoundLocation = $wav528; $player.PlaySync()
    Start-Sleep -Milliseconds 300

    Write-Host "  ▶ Playing 432 Hz Philocardia (Asterisk)..."
    $player.SoundLocation = $wav432; $player.PlaySync()
    Start-Sleep -Milliseconds 300

    Write-Host "  ▶ Playing Ceramic Kiln Bell (Theme Change)..."
    $player.SoundLocation = $wavChime; $player.PlaySync()
    Start-Sleep -Milliseconds 300

    Write-Host "  ▶ Playing Ocean Triad Chord (Warning)..."
    $player.SoundLocation = $wavOcean; $player.PlaySync()

    Write-Host "[✓] All earcons played successfully.`n" -ForegroundColor Green
}
elseif ($Action -eq 'Restore') {
    Write-Host "`n[+] Restoring default Windows system sounds..." -ForegroundColor Yellow
    Set-EventSound -eventKey "Notification.Default" -wavPath "C:\Windows\Media\Windows Notify System Generic.wav"
    Set-EventSound -eventKey "SystemNotification"   -wavPath "C:\Windows\Media\Windows Notify System Generic.wav"
    Set-EventSound -eventKey "SystemAsterisk"       -wavPath "C:\Windows\Media\Windows Background.wav"
    Set-EventSound -eventKey "ChangeTheme"          -wavPath "C:\Windows\Media\Windows Theme.wav"
    Set-EventSound -eventKey "SystemExclamation"    -wavPath "C:\Windows\Media\Windows Exclamation.wav"
    Write-Host "[✓] Windows default sound scheme restored.`n" -ForegroundColor Green
}
elseif ($Action -eq 'Status') {
    Write-Host "`n=== CURRENT SYSTEM SOUND MAPPINGS ===" -ForegroundColor Cyan
    @("Notification.Default", "SystemNotification", "SystemAsterisk", "ChangeTheme", "SystemExclamation") | ForEach-Object {
        $val = (Get-ItemProperty "HKCU:\AppEvents\Schemes\Apps\.Default\$_\.Current" -ErrorAction SilentlyContinue)."(default)"
        [PSCustomObject]@{
            "Event" = $_
            "Sound File" = $val
        }
    } | Format-Table -AutoSize
}
