import { Injectable } from '@angular/core';

export interface IDicomMetadata {
  patientId: string;
  studyInstanceUid: string;
  modality: 'XR' | 'CT' | 'MR' | 'US';
  studyDate: string;
  pixelSpacing: [number, number];
  sliceThickness?: number;
}

export interface IEcgRhythmStrip {
  svgContent: string;
  heartRate: number;
  durationMs: number;
}

export interface IGenomicSequence {
  geneSymbol: string;
  variant: string;
  sequenceSnippet: string;
  zygosity: 'Heterozygous' | 'Homozygous';
}

@Injectable({
  providedIn: 'root'
})
export class DiagnosticModalityGeneratorService {

  constructor() {}

  private getCryptoRandomFloat(): number {
    const buffer = new Uint32Array(2);
    globalThis.crypto.getRandomValues(buffer);
    return (buffer[0] * 4294967296.0 + buffer[1]) / 9007199254740992.0;
  }

  /**
   * Generates a realistic simulated ECG rhythm strip in SVG format.
   * Modulates RR intervals and adds baseline wander to simulate a real patient.
   */
  public generateEcgStrip(baseHeartRate: number = 72, durationMs: number = 5000): IEcgRhythmStrip {
    const width = 1000;
    const height = 200;
    const beatInterval = 60000 / baseHeartRate;
    const numBeats = Math.floor(durationMs / beatInterval);
    
    let pathData = `M 0,${height / 2}`;
    let currentX = 0;

    const wanderEntropy = new Uint16Array(numBeats);
    if (numBeats > 0) {
      globalThis.crypto.getRandomValues(wanderEntropy);
    }

    for (let i = 0; i < numBeats; i++) {
      // P wave
      currentX += width / (numBeats * 4);
      pathData += ` Q ${currentX - 5},${height / 2 - 10} ${currentX},${height / 2}`;
      
      // QRS complex
      currentX += width / (numBeats * 10);
      pathData += ` L ${currentX - 10},${height / 2 + 15} L ${currentX},${height / 2 - 60} L ${currentX + 10},${height / 2 + 20} L ${currentX + 15},${height / 2}`;
      
      // T wave
      currentX += width / (numBeats * 3);
      pathData += ` Q ${currentX - 15},${height / 2 - 20} ${currentX},${height / 2}`;
      
      // Baseline wander (NIST SP 800-90A CSPRNG)
      currentX += width / (numBeats * 3);
      const wander = (wanderEntropy[i] / 65535.0) * 4 - 2;
      pathData += ` L ${currentX},${height / 2 + wander}`;
    }

    const svgContent = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto stroke-emerald-400 fill-none" style="stroke-width: 2.5px; filter: drop-shadow(0px 0px 2px rgba(16, 185, 129, 0.4));">
      <path d="${pathData}" />
    </svg>`;

    return { svgContent, heartRate: baseHeartRate, durationMs };
  }

  /**
   * Generates simulated DICOM metadata for imaging studies with CSPRNG entropy.
   */
  public generateDicomMetadata(patientId: string, modality: 'XR' | 'CT' | 'MR' | 'US'): IDicomMetadata {
    const entropyBuf = new Uint32Array(2);
    globalThis.crypto.getRandomValues(entropyBuf);

    return {
      patientId,
      studyInstanceUid: `1.2.840.113619.2.55.3.4271045733.996.${Date.now()}.${entropyBuf[0]}`,
      modality,
      studyDate: new Date().toISOString().split('T')[0],
      pixelSpacing: [this.getCryptoRandomFloat() * 0.5 + 0.5, this.getCryptoRandomFloat() * 0.5 + 0.5],
      ...(modality === 'CT' || modality === 'MR' ? { sliceThickness: this.getCryptoRandomFloat() * 3 + 1 } : {})
    };
  }

  /**
   * Generates a simulated targeted genomic sequence for rare disease profiles.
   */
  public generateGenomicVariant(geneSymbol: string, variant: string): IGenomicSequence {
    const bases = ['A', 'C', 'G', 'T'];
    let sequenceSnippet = '';
    const randVals = new Uint8Array(51);
    globalThis.crypto.getRandomValues(randVals);

    for (let i = 0; i < 50; i++) {
      sequenceSnippet += bases[randVals[i] % 4];
    }
    // Embed a simulated substitution/indel
    sequenceSnippet = sequenceSnippet.slice(0, 25) + `[${variant}]` + sequenceSnippet.slice(25);

    return {
      geneSymbol,
      variant,
      sequenceSnippet,
      zygosity: randVals[50] >= 128 ? 'Heterozygous' : 'Homozygous'
    };
  }
}
