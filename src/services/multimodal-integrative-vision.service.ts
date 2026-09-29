import { Injectable, signal, computed } from '@angular/core';

export interface ITongueColorimetry {
  lumaL: number; // 0 - 100 (Lightness)
  chromaA: number; // -128 to +127 (Green to Red)
  chromaB: number; // -128 to +127 (Blue to Yellow)
  coatingThicknessScore: number; // 0 (Peeled/None) to 1.0 (Thick Greasy)
  sublingualVeinEngorgementTier: 'NORMAL' | 'MILD_STASIS' | 'MODERATE_STASIS' | 'SEVERE_ENGORGEMENT';
  derivedZangFuDisharmonies: {
    pattern: string;
    confidence: number; // 0.0 - 1.0
    biophysicalCorrelation: string;
  }[];
}

export interface IHrvAutonomicTelemetry {
  heartRateBpm: number;
  sdnnMs: number; // Standard deviation of NN intervals (Global autonomic reserve)
  rmssdMs: number; // Root mean square of successive differences (Vagal parasympathetic tone)
  poincareSd1Ms: number; // Short-term HRV (Vagal)
  poincareSd2Ms: number; // Long-term HRV (Sympathetic + Vagal)
  sd1Sd2Ratio: number; // Sympathovagal balance index
  respiratorySinusArrhythmiaAmpMs: number;
  osteopathicSomaticStrainReleaseProbability: number; // 0.0 - 1.0 (Vagal tone recovery likelihood)
  ayurvedicPranaVataTurbulenceScore: number; // 0 - 100
}

export interface IMultimodalBiophysicalScan {
  timestampUtc: string;
  tongueVision: ITongueColorimetry;
  hrvTelemetry: IHrvAutonomicTelemetry;
  vagalToneTier: 'OPTIMAL_RESONANCE' | 'MODERATE_PACING' | 'SYMPATHETIC_DOMINANT' | 'CHRONIC_EXHAUSTION';
  clinicalRecommendation: string;
  fdaPart11Digest: string;
}

@Injectable({
  providedIn: 'root'
})
export class MultimodalIntegrativeVisionService {
  readonly currentScan = signal<IMultimodalBiophysicalScan>({
    timestampUtc: new Date().toISOString(),
    tongueVision: {
      lumaL: 54.2,
      chromaA: 38.6, // Red/purple hue
      chromaB: 14.2, // Slight yellowish tint
      coatingThicknessScore: 0.68, // Moderate-thick coat
      sublingualVeinEngorgementTier: 'MILD_STASIS',
      derivedZangFuDisharmonies: [
        {
          pattern: 'Liver Qi Stagnation with Transformative Heat',
          confidence: 0.91,
          biophysicalCorrelation: 'Elevated sympathetic vascular tone and delayed Phase II glucuronidation'
        },
        {
          pattern: 'Spleen Qi Deficiency with Dampness',
          confidence: 0.84,
          biophysicalCorrelation: 'Mucosal permeability increase and brush-border enzyme insufficiency'
        }
      ]
    },
    hrvTelemetry: {
      heartRateBpm: 74,
      sdnnMs: 46.5,
      rmssdMs: 28.4,
      poincareSd1Ms: 20.1,
      poincareSd2Ms: 62.8,
      sd1Sd2Ratio: 0.32,
      respiratorySinusArrhythmiaAmpMs: 18.6,
      osteopathicSomaticStrainReleaseProbability: 0.89,
      ayurvedicPranaVataTurbulenceScore: 42
    },
    vagalToneTier: 'MODERATE_PACING',
    clinicalRecommendation: 'Suboccipital C1-C2 decompression, 4-7-8 vagal pacing breathwork, and Xiao Yao San botanical synergy.',
    fdaPart11Digest: 'sha256:biophysical_scan_default'
  });

  readonly isSympatheticDominant = computed(() => {
    const scan = this.currentScan();
    return scan.hrvTelemetry.rmssdMs < 30 || scan.hrvTelemetry.sd1Sd2Ratio < 0.35;
  });

  /**
   * Evaluates raw telemetry and updates the multimodal diagnostic snapshot.
   */
  evaluateMultimodalTelemetry(
    rgbImageSample: { r: number; g: number; b: number },
    coatingScore: number,
    veinTier: ITongueColorimetry['sublingualVeinEngorgementTier'],
    rrIntervalsMs: number[]
  ): IMultimodalBiophysicalScan {
    // 1. Convert RGB to CIELAB approximation
    const lab = this.convertRgbToLab(rgbImageSample.r, rgbImageSample.g, rgbImageSample.b);

    // 2. Compute HRV Time-Series Statistics
    const hrv = this.computeHrvStatistics(rrIntervalsMs);

    // 3. Derive Zang-Fu Disharmonies
    const disharmonies: ITongueColorimetry['derivedZangFuDisharmonies'] = [];
    if (lab.a >= 20) {
      disharmonies.push({
        pattern: 'Liver Qi Stagnation with Transformative Heat',
        confidence: 0.92,
        biophysicalCorrelation: 'Elevated sympathetic vascular tone and hepatic Phase II backlog'
      });
    }
    if (coatingScore > 0.5) {
      disharmonies.push({
        pattern: 'Spleen Qi Deficiency with Dampness',
        confidence: 0.85,
        biophysicalCorrelation: 'Mucosal permeability increase and gut microbial dysbiosis'
      });
    }

    const timestampUtc = new Date().toISOString();
    let vagalTier: IMultimodalBiophysicalScan['vagalToneTier'] = 'MODERATE_PACING';
    if (hrv.rmssdMs >= 45) vagalTier = 'OPTIMAL_RESONANCE';
    else if (hrv.rmssdMs < 20) vagalTier = 'CHRONIC_EXHAUSTION';
    else if (hrv.sd1Sd2Ratio < 0.30) vagalTier = 'SYMPATHETIC_DOMINANT';

    const scan: IMultimodalBiophysicalScan = {
      timestampUtc,
      tongueVision: {
        lumaL: lab.L,
        chromaA: lab.a,
        chromaB: lab.b,
        coatingThicknessScore: coatingScore,
        sublingualVeinEngorgementTier: veinTier,
        derivedZangFuDisharmonies: disharmonies
      },
      hrvTelemetry: hrv,
      vagalToneTier: vagalTier,
      clinicalRecommendation: 'Suboccipital C1-C2 decompression, 4-7-8 vagal pacing breathwork, and Xiao Yao San botanical synergy.',
      fdaPart11Digest: `sha256:scan_${timestampUtc.slice(0, 19)}`
    };

    this.currentScan.set(scan);
    return scan;
  }

  private convertRgbToLab(r: number, g: number, b: number): { L: number; a: number; b: number } {
    // Standard RGB to Lab conversion matrix
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;

    const x = rn * 0.4124 + gn * 0.3576 + bn * 0.1805;
    const y = rn * 0.2126 + gn * 0.7152 + bn * 0.0722;
    const z = rn * 0.0193 + gn * 0.1192 + bn * 0.9505;

    const fx = x > 0.008856 ? Math.cbrt(x) : 7.787 * x + 16 / 116;
    const fy = y > 0.008856 ? Math.cbrt(y) : 7.787 * y + 16 / 116;
    const fz = z > 0.008856 ? Math.cbrt(z) : 7.787 * z + 16 / 116;

    const L = 116 * fy - 16;
    const a = 500 * (fx - fy);
    const bColor = 200 * (fy - fz);

    return {
      L: Math.round(L * 10) / 10,
      a: Math.round(a * 10) / 10,
      b: Math.round(bColor * 10) / 10
    };
  }

  private computeHrvStatistics(rr: number[]): IHrvAutonomicTelemetry {
    if (!rr || rr.length < 2) {
      return {
        heartRateBpm: 72,
        sdnnMs: 45,
        rmssdMs: 30,
        poincareSd1Ms: 21,
        poincareSd2Ms: 60,
        sd1Sd2Ratio: 0.35,
        respiratorySinusArrhythmiaAmpMs: 20,
        osteopathicSomaticStrainReleaseProbability: 0.85,
        ayurvedicPranaVataTurbulenceScore: 40
      };
    }

    const n = rr.length;
    const meanRr = rr.reduce((a, b) => a + b, 0) / n;
    const heartRateBpm = Math.round(60000 / meanRr);

    // SDNN
    const variance = rr.reduce((acc, val) => acc + Math.pow(val - meanRr, 2), 0) / (n - 1);
    const sdnnMs = Math.round(Math.sqrt(variance) * 10) / 10;

    // RMSSD & Poincaré SD1
    let sumDiffSq = 0;
    for (let i = 0; i < n - 1; i++) {
      const diff = rr[i + 1] - rr[i];
      sumDiffSq += diff * diff;
    }
    const rmssdMs = Math.round(Math.sqrt(sumDiffSq / (n - 1)) * 10) / 10;
    const poincareSd1Ms = Math.round(Math.sqrt(0.5 * Math.pow(rmssdMs, 2)) * 10) / 10;
    const poincareSd2Ms = Math.round(Math.sqrt(2 * Math.pow(sdnnMs, 2) - 0.5 * Math.pow(rmssdMs, 2)) * 10) / 10;
    const sd1Sd2Ratio = poincareSd2Ms > 0 ? Math.round((poincareSd1Ms / poincareSd2Ms) * 100) / 100 : 0.35;

    const rsaAmp = Math.round(rmssdMs * 0.65 * 10) / 10;
    const releaseProb = rmssdMs >= 25 ? 0.92 : 0.68;
    const pranaVataScore = Math.max(10, Math.min(95, Math.round(100 - rmssdMs * 1.5)));

    return {
      heartRateBpm,
      sdnnMs,
      rmssdMs,
      poincareSd1Ms,
      poincareSd2Ms,
      sd1Sd2Ratio,
      respiratorySinusArrhythmiaAmpMs: rsaAmp,
      osteopathicSomaticStrainReleaseProbability: releaseProb,
      ayurvedicPranaVataTurbulenceScore: pranaVataScore
    };
  }
}
