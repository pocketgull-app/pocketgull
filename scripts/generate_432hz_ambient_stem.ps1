<#
.SYNOPSIS
    PocketGull 432Hz Algorithmic Ambient Soundscape Generator
    Synthesizes a 60-second 16-bit 44.1kHz Stereo Lossless WAV Stem
    Features: 432Hz Philocardia tuning, 10Hz Alpha binaural entrainment, Fibonacci swell envelopes.
#>

$outputDir = Join-Path $env:LOCALAPPDATA "PocketGull\Sounds"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$outputFile = Join-Path $outputDir "ambient_432hz_dorian_sanctuary.wav"

$csharp = @"
using System;
using System.IO;

public class Ambient432Synthesizer {
    public static void GenerateStereoStem(string filePath, double durationSec) {
        int sampleRate = 44100;
        int numSamples = (int)(sampleRate * durationSec);
        short[] samples = new short[numSamples * 2]; // Interleaved Stereo: L, R, L, R...

        // Harmonic frequencies (Dorian modal cluster rooted in 432Hz / 144Hz)
        double rootD = 144.0;       // D3 deep warm cello foundation
        double fifthA_L = 216.0;    // A3 pure fifth (Left)
        double fifthA_R = 226.0;    // A3 + 10Hz Alpha Binaural beat (Right)
        double highA_L = 432.0;     // A4 Philocardia resonance (Left)
        double highA_R = 442.0;     // A4 + 10Hz Alpha beat (Right)
        double chimeFreq = 1320.0;  // Ceramic overtone chime

        for (int i = 0; i < numSamples; i++) {
            double t = (double)i / sampleRate;

            // Global Master Envelope: 4.0s gentle fade-in, 6.0s smooth fade-out
            double masterEnv = 1.0;
            if (t < 4.0) {
                masterEnv = t / 4.0;
            } else if (t > durationSec - 6.0) {
                masterEnv = (durationSec - t) / 6.0;
            }

            // Fibonacci Breathing LFOs (Ocean swells at periods of 8.0s, 13.0s, 21.0s)
            double swell1 = 0.5 + 0.5 * Math.Sin(2.0 * Math.PI * (1.0 / 13.0) * t);
            double swell2 = 0.5 + 0.5 * Math.Sin(2.0 * Math.PI * (1.0 / 21.0) * t);
            double swell3 = 0.5 + 0.5 * Math.Sin(2.0 * Math.PI * (1.0 / 8.0) * t);

            // Left Channel Oscillators
            double left = (Math.Sin(2.0 * Math.PI * rootD * t) * 0.40 * swell1)
                        + (Math.Sin(2.0 * Math.PI * fifthA_L * t) * 0.30 * swell2)
                        + (Math.Sin(2.0 * Math.PI * highA_L * t) * 0.20 * swell3);

            // Right Channel Oscillators (Includes 10Hz Alpha frequency delta)
            double right = (Math.Sin(2.0 * Math.PI * rootD * t) * 0.40 * swell1)
                         + (Math.Sin(2.0 * Math.PI * fifthA_R * t) * 0.30 * swell2)
                         + (Math.Sin(2.0 * Math.PI * highA_R * t) * 0.20 * swell3);

            // Ceramic Chime accents at t=18s and t=36s
            foreach (double strikeTime in new double[] { 18.0, 36.0 }) {
                if (t >= strikeTime && t < strikeTime + 4.0) {
                    double chimeT = t - strikeTime;
                    double chimeEnv = Math.Exp(-2.8 * chimeT) * (chimeT < 0.015 ? chimeT / 0.015 : 1.0);
                    double chimeVal = (Math.Sin(2.0 * Math.PI * chimeFreq * chimeT) * 0.15)
                                    + (Math.Sin(2.0 * Math.PI * (chimeFreq * 2.0) * chimeT) * 0.06);
                    left += chimeVal * chimeEnv;
                    right += chimeVal * chimeEnv * 0.8;
                }
            }

            // Master attenuation to prevent clipping
            double finalLeft = left * masterEnv * 0.65;
            double finalRight = right * masterEnv * 0.65;

            short sL = (short)Math.Max(short.MinValue, Math.Min(short.MaxValue, finalLeft * short.MaxValue));
            short sR = (short)Math.Max(short.MinValue, Math.Min(short.MaxValue, finalRight * short.MaxValue));

            samples[i * 2] = sL;
            samples[i * 2 + 1] = sR;
        }

        // Write Standard 16-bit 44.1kHz Stereo WAV File
        using (FileStream fs = new FileStream(filePath, FileMode.Create))
        using (BinaryWriter bw = new BinaryWriter(fs)) {
            int subChunk2Size = numSamples * 2 * 2; // samples * channels * bytesPerSample
            bw.Write(System.Text.Encoding.ASCII.GetBytes("RIFF"));
            bw.Write(36 + subChunk2Size);
            bw.Write(System.Text.Encoding.ASCII.GetBytes("WAVE"));
            bw.Write(System.Text.Encoding.ASCII.GetBytes("fmt "));
            bw.Write(16);
            bw.Write((short)1);          // PCM
            bw.Write((short)2);          // Stereo
            bw.Write(sampleRate);
            bw.Write(sampleRate * 4);    // Byte rate (sampleRate * channels * bitsPerSample / 8)
            bw.Write((short)4);          // Block align (channels * bitsPerSample / 8)
            bw.Write((short)16);         // Bits per sample
            bw.Write(System.Text.Encoding.ASCII.GetBytes("data"));
            bw.Write(subChunk2Size);

            for (int i = 0; i < samples.Length; i++) {
                bw.Write(samples[i]);
            }
        }
    }
}
"@

Add-Type -TypeDefinition $csharp -ErrorAction SilentlyContinue

Write-Host "[+] Synthesizing 60-Second 432Hz Dorian Ambient Master Stem..." -ForegroundColor Cyan
[Ambient432Synthesizer]::GenerateStereoStem($outputFile, 60.0)
Write-Host "[OK] Stem synthesized successfully: $outputFile" -ForegroundColor Green
Write-Host "    - Duration: 60 Seconds"
Write-Host "    - Tuning: A=432Hz Philocardia Foundation"
Write-Host "    - Entrainment: 10Hz Alpha Wave Binaural Difference (L: 216Hz, R: 226Hz)"
Write-Host "    - Format: 16-bit 44.1kHz Stereo WAV"

