<#
.SYNOPSIS
    PocketGull Audiophile Neuro-Acoustic Entrainment Studio Engine.
    High-fidelity multi-harmonic binaural beat, isochronic pulse, and purr generator
    with vacuum tube analog saturation, Bauer HRTF craniometric crossfeed, and pink noise floor.
#>

param(
    [ValidateSet('focus10', 'focus15', 'purr', 'gamma40', 'schumann', 'canoe')]
    [string]$Preset = 'focus10',

    [int]$DurationSec = 300,

    [switch]$Background,
    [switch]$ForceRebuild
)

$ErrorActionPreference = 'Stop'
$soundDir = Join-Path $env:LOCALAPPDATA "PocketGull\Sounds\Entrainment"
if (-not (Test-Path $soundDir)) {
    New-Item -ItemType Directory -Path $soundDir -Force | Out-Null
}

$csharp = @'
using System;
using System.IO;

public static class AudiophileEntrainmentSynth {
    private static double TubeSaturate(double x) {
        if (x > 1.2) return 1.0;
        if (x < -1.2) return -1.0;
        return (3.0 * x / 2.0) * (1.0 - (x * x / 3.0));
    }

    public static void GenerateStudioBinaural(
        string filePath, 
        double baseCarrierHz, 
        double beatHz, 
        double durationSec,
        bool isIsochronic = false,
        double isochronicHz = 0.0) 
    {
        int sampleRate = 44100;
        int numSamples = (int)(sampleRate * durationSec);
        short[] leftOut = new short[numSamples];
        short[] rightOut = new short[numSamples];

        double[] rawL = new double[numSamples];
        double[] rawR = new double[numSamples];

        double leftCarrier  = baseCarrierHz;
        double rightCarrier = isIsochronic ? baseCarrierHz : (baseCarrierHz + beatHz);

        int delaySamples = (int)(0.00028 * sampleRate);
        double crossfeedGain = 0.28;

        Random rng = new Random(528);
        double b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (int i = 0; i < numSamples; i++) {
            double t = (double)i / sampleRate;

            double envelope = 1.0;
            if (t < 2.5) envelope = t / 2.5;
            else if (t > durationSec - 2.5) envelope = (durationSec - t) / 2.5;

            double lSig = 0.50 * Math.Sin(2.0 * Math.PI * leftCarrier * t)
                        + 0.22 * Math.Sin(2.0 * Math.PI * (leftCarrier * 0.5) * t)
                        + 0.18 * Math.Sin(2.0 * Math.PI * (leftCarrier * 2.0) * t)
                        + 0.10 * Math.Sin(2.0 * Math.PI * (leftCarrier * 3.0) * t);

            double rSig = 0.50 * Math.Sin(2.0 * Math.PI * rightCarrier * t)
                        + 0.22 * Math.Sin(2.0 * Math.PI * (rightCarrier * 0.5) * t)
                        + 0.18 * Math.Sin(2.0 * Math.PI * (rightCarrier * 2.0) * t)
                        + 0.10 * Math.Sin(2.0 * Math.PI * (rightCarrier * 3.0) * t);

            if (isIsochronic && isochronicHz > 0) {
                double pulse = 0.5 + 0.5 * Math.Sin(2.0 * Math.PI * isochronicHz * t);
                lSig *= pulse;
                rSig *= pulse;
            }

            double white = (rng.NextDouble() * 2.0 - 1.0);
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            double pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.022;
            b6 = white * 0.115926;

            lSig = (lSig + pink) * envelope;
            rSig = (rSig + pink) * envelope;

            rawL[i] = TubeSaturate(lSig);
            rawR[i] = TubeSaturate(rSig);
        }

        for (int i = 0; i < numSamples; i++) {
            double delayedR = (i >= delaySamples) ? rawR[i - delaySamples] : 0.0;
            double delayedL = (i >= delaySamples) ? rawL[i - delaySamples] : 0.0;

            double finalL = rawL[i] + delayedR * crossfeedGain;
            double finalR = rawR[i] + delayedL * crossfeedGain;

            finalL = Math.Max(-0.95, Math.Min(0.95, finalL * 0.80));
            finalR = Math.Max(-0.95, Math.Min(0.95, finalR * 0.80));

            leftOut[i]  = (short)(finalL * short.MaxValue);
            rightOut[i] = (short)(finalR * short.MaxValue);
        }

        WriteStereoWav(filePath, sampleRate, numSamples, leftOut, rightOut);
    }

    public static void GenerateStudioPurr(string filePath, double durationSec) {
        int sampleRate = 44100;
        int numSamples = (int)(sampleRate * durationSec);
        short[] left = new short[numSamples];
        short[] right = new short[numSamples];

        Random rng = new Random(432);

        for (int i = 0; i < numSamples; i++) {
            double t = (double)i / sampleRate;
            double env = 1.0;
            if (t < 2.5) env = t / 2.5;
            else if (t > durationSec - 2.5) env = (durationSec - t) / 2.5;

            double breathCycle = 0.5 + 0.5 * Math.Sin(2.0 * Math.PI * (1.0 / 2.1) * t);
            double purrFlutter = 0.85 + 0.15 * Math.Sin(2.0 * Math.PI * 25.5 * t);

            double h1 = Math.Sin(2.0 * Math.PI * 25.5 * t) * 0.45;
            double h2 = Math.Sin(2.0 * Math.PI * 51.0 * t) * 0.32;
            double h3 = Math.Sin(2.0 * Math.PI * 76.5 * t) * 0.18;
            double h4 = Math.Sin(2.0 * Math.PI * 102.0 * t) * 0.12;
            double h5 = Math.Sin(2.0 * Math.PI * 127.5 * t) * 0.08;

            double rumble = (rng.NextDouble() * 2.0 - 1.0) * 0.015;

            double val = (h1 + h2 + h3 + h4 + h5 + rumble) * breathCycle * purrFlutter * env;
            val = TubeSaturate(val * 1.1);

            short s = (short)(Math.Max(-0.95, Math.Min(0.95, val * 0.85)) * short.MaxValue);
            left[i]  = s;
            right[i] = s;
        }

        WriteStereoWav(filePath, sampleRate, numSamples, left, right);
    }

    private static void WriteStereoWav(string filePath, int sampleRate, int numSamples, short[] left, short[] right) {
        using (FileStream fs = new FileStream(filePath, FileMode.Create))
        using (BinaryWriter bw = new BinaryWriter(fs)) {
            bw.Write(System.Text.Encoding.ASCII.GetBytes("RIFF"));
            bw.Write(36 + numSamples * 4);
            bw.Write(System.Text.Encoding.ASCII.GetBytes("WAVE"));
            bw.Write(System.Text.Encoding.ASCII.GetBytes("fmt "));
            bw.Write(16);
            bw.Write((short)1);
            bw.Write((short)2);
            bw.Write(sampleRate);
            bw.Write(sampleRate * 4);
            bw.Write((short)4);
            bw.Write((short)16);
            bw.Write(System.Text.Encoding.ASCII.GetBytes("data"));
            bw.Write(numSamples * 4);
            for (int i = 0; i < numSamples; i++) {
                bw.Write(left[i]);
                bw.Write(right[i]);
            }
        }
    }
}
'@

Add-Type -TypeDefinition $csharp -ErrorAction SilentlyContinue

$wavFile = Join-Path $soundDir "entrainment_studio_$Preset.wav"

if ($ForceRebuild -or (-not (Test-Path $wavFile))) {
    Write-Host "[+] Synthesizing Audiophile Studio Reference Stem for $Preset..." -ForegroundColor Cyan
    Write-Host "    * Tube Warmth Saturation | Multi-Harmonics | Bauer HRTF 3D Crossfeed | Pink Noise Floor" -ForegroundColor DarkGray
    switch ($Preset) {
        'focus10' { [AudiophileEntrainmentSynth]::GenerateStudioBinaural($wavFile, 194.18, 4.5, 45.0) }
        'focus15' { [AudiophileEntrainmentSynth]::GenerateStudioBinaural($wavFile, 136.10, 1.5, 45.0) }
        'purr'    { [AudiophileEntrainmentSynth]::GenerateStudioPurr($wavFile, 45.0) }
        'gamma40' { [AudiophileEntrainmentSynth]::GenerateStudioBinaural($wavFile, 432.0, 0.0, 45.0, $true, 40.0) }
        'schumann'{ [AudiophileEntrainmentSynth]::GenerateStudioBinaural($wavFile, 432.0, 7.83, 45.0) }
        'canoe'   { [AudiophileEntrainmentSynth]::GenerateStudioBinaural($wavFile, 216.0, 1.0, 45.0) }
    }
    Write-Host "[OK] Audiophile stem ready: $wavFile`n" -ForegroundColor Green
}

function Start-EntrainmentPlayback {
    param([string]$Path, [int]$TotalSeconds)
    Add-Type -AssemblyName PresentationCore
    $player = New-Object System.Windows.Media.MediaPlayer
    $player.Open([Uri]$Path)
    
    # Seamless loop handler on MediaEnded
    Register-ObjectEvent -InputObject $player -EventName "MediaEnded" -Action {
        $Event.Sender.Position = [TimeSpan]::Zero
        $Event.Sender.Play()
    } | Out-Null
    
    $player.Volume = 0.70
    $player.Play()
    Write-Host "[>] Audiophile Entrainment Active ($Preset) for $TotalSeconds seconds..." -ForegroundColor Green
    
    $elapsed = 0
    while ($elapsed -lt $TotalSeconds) {
        Start-Sleep -Seconds 1
        $elapsed++
        if ($player.Position.TotalSeconds -ge 44.8) {
            $player.Position = [TimeSpan]::Zero
            $player.Play()
        }
    }
    
    for ($v = 0.70; $v -ge 0.05; $v -= 0.10) {
        $player.Volume = [Math]::Max(0.0, $v)
        Start-Sleep -Milliseconds 300
    }
    
    $player.Stop()
    $player.Close()
    Write-Host "[*] Session complete.`n" -ForegroundColor DarkGray
}

if ($Background) {
    Start-Process powershell.exe -ArgumentList "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$PSCommandPath`" -Preset $Preset -DurationSec $DurationSec"
    Write-Host "[OK] Launched $Preset studio entrainment in background ($DurationSec sec)." -ForegroundColor Green
    exit 0
}

Start-EntrainmentPlayback -Path $wavFile -TotalSeconds $DurationSec
