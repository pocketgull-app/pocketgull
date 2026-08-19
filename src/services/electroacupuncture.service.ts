import { Injectable, signal, computed } from '@angular/core';

export type TElectroWaveform = 
  | 'continuous_2hz' 
  | 'high_100hz' 
  | 'dense_disperse' 
  | 'intermittent_ripple' 
  | 'microcurrent_0_1hz';

export interface IAcpointLead {
  code: string;
  name: string;
  pinyin: string;
  anatomicalLocation: string;
  depthMm: number;
}

export interface IElectroacupunctureProtocol {
  id: string;
  name: string;
  category: 'Neuropathic Pain' | 'Vagal Anti-Inflammatory' | 'Autonomic & Insomnia' | 'Fascial Regeneration';
  waveform: TElectroWaveform;
  frequencyHz: number;
  intensityMa: number;
  durationMinutes: number;
  leadPair: [IAcpointLead, IAcpointLead];
  clinicalRationale: string;
  primaryPeptide: string;
}

export const PROTOCOL_CATALOG: IElectroacupunctureProtocol[] = [
  {
    id: 'vagal_cytokine_reset',
    name: 'Vagal Anti-Inflammatory & Gut-Brain Axis Reset',
    category: 'Vagal Anti-Inflammatory',
    waveform: 'continuous_2hz',
    frequencyHz: 10,
    intensityMa: 1.5,
    durationMinutes: 30,
    leadPair: [
      { code: 'ST-36', name: 'Zusanli', pinyin: '足三里', anatomicalLocation: 'Anterolateral lower leg, 3 cun below ST-35', depthMm: 25 },
      { code: 'ST-37', name: 'Shangjuxu', pinyin: '上巨虚', anatomicalLocation: 'Anterolateral lower leg, 6 cun below ST-35', depthMm: 25 }
    ],
    clinicalRationale: 'Stimulates vagal nerve cholinergic anti-inflammatory pathway via alpha-7-nAChR receptors on splenic macrophages, suppressing TNF-alpha and IL-6.',
    primaryPeptide: 'Acetylcholine (ACh) & Vagal Somatostatin'
  },
  {
    id: 'sciatica_dynorphin_decompression',
    name: 'Sciatica & Lumbar Radiculopathy Decompression',
    category: 'Neuropathic Pain',
    waveform: 'dense_disperse',
    frequencyHz: 2, // 2/100 Hz alternating
    intensityMa: 2.5,
    durationMinutes: 25,
    leadPair: [
      { code: 'BL-23', name: 'Shenshu', pinyin: '肾俞', anatomicalLocation: 'Lower back, 1.5 cun lateral to L2 spinous process', depthMm: 30 },
      { code: 'GB-30', name: 'Huantiao', pinyin: '环跳', anatomicalLocation: 'Postero-lateral hip/gluteal region, sciatic notch', depthMm: 50 }
    ],
    clinicalRationale: 'Dense-disperse 2/100 Hz wave simultaneously releases beta-endorphin (PAG) and dynorphin (spinal dorsal horn), eliminating receptor tolerance.',
    primaryPeptide: 'Beta-Endorphin & Dynorphin Synergism'
  },
  {
    id: 'cranial_shen_insomnia',
    name: 'Cranial Shen Harmonization & Pineal Entrainment',
    category: 'Autonomic & Insomnia',
    waveform: 'continuous_2hz',
    frequencyHz: 2,
    intensityMa: 0.6,
    durationMinutes: 20,
    leadPair: [
      { code: 'GV-20', name: 'Baihui', pinyin: '百会', anatomicalLocation: 'Vertex of head, intersection of midsagittal & ear apex lines', depthMm: 10 },
      { code: 'Yin Tang', name: 'Hall of Impression', pinyin: '印堂', anatomicalLocation: 'Midpoint between the medial ends of the eyebrows', depthMm: 8 }
    ],
    clinicalRationale: 'Low-frequency 2 Hz cranio-facial stimulation upregulates serotonin, promotes pineal melatonin secretion, and enhances restorative Delta sleep.',
    primaryPeptide: 'Enkephalin, Serotonin & Melatonin'
  },
  {
    id: 'fascial_microcurrent_regeneration',
    name: 'Fascial Biotensegrity & Piezoelectric Microcurrent',
    category: 'Fascial Regeneration',
    waveform: 'microcurrent_0_1hz',
    frequencyHz: 0.1,
    intensityMa: 0.2, // 200 uA
    durationMinutes: 45,
    leadPair: [
      { code: 'LI-4', name: 'Hegu', pinyin: '合谷', anatomicalLocation: 'Dorsum of hand, between 1st and 2nd metacarpal bones', depthMm: 15 },
      { code: 'LI-11', name: 'Quchi', pinyin: '曲池', anatomicalLocation: 'Lateral end of the transverse cubital crease of elbow', depthMm: 20 }
    ],
    clinicalRationale: 'Sub-sensory microcurrent (<1000 uA) stimulates mitochondrial ATP synthesis by up to 500% and aligns collagen liquid crystal orientation.',
    primaryPeptide: 'Cellular ATP & Collagen Type I Pro-Peptides'
  }
];

@Injectable({
  providedIn: 'root'
})
export class ElectroacupunctureService {
  readonly protocols = PROTOCOL_CATALOG;
  readonly activeProtocol = signal<IElectroacupunctureProtocol>(PROTOCOL_CATALOG[0]);
  readonly waveform = signal<TElectroWaveform>('continuous_2hz');
  readonly frequencyHz = signal<number>(10);
  readonly intensityMa = signal<number>(1.5);
  readonly isRunning = signal<boolean>(false);
  readonly sessionElapsedTimeSeconds = signal<number>(0);

  // Computed Endogenous Opioid & Cytokine Telemetry
  readonly neuroChemicalTelemetry = computed(() => {
    const wave = this.waveform();
    const freq = this.frequencyHz();
    const intensity = this.intensityMa();
    const isRunning = this.isRunning();
    const mult = isRunning ? Math.min(1.0, 0.2 + (this.sessionElapsedTimeSeconds() / 60)) : 0.1;

    let betaEndorphin = 0;
    let dynorphin = 0;
    let enkephalin = 0;
    let cytokineSuppression = 0;
    let vagalTone = 1.0;

    switch (wave) {
      case 'continuous_2hz':
        betaEndorphin = Math.round(85 * mult);
        enkephalin = Math.round(75 * mult);
        dynorphin = Math.round(20 * mult);
        cytokineSuppression = Math.round(72 * mult);
        vagalTone = +(1.0 + (0.8 * mult)).toFixed(2);
        break;
      case 'high_100hz':
        betaEndorphin = Math.round(25 * mult);
        enkephalin = Math.round(30 * mult);
        dynorphin = Math.round(92 * mult);
        cytokineSuppression = Math.round(45 * mult);
        vagalTone = +(1.0 + (0.3 * mult)).toFixed(2);
        break;
      case 'dense_disperse':
        betaEndorphin = Math.round(90 * mult);
        enkephalin = Math.round(85 * mult);
        dynorphin = Math.round(88 * mult);
        cytokineSuppression = Math.round(80 * mult);
        vagalTone = +(1.0 + (0.95 * mult)).toFixed(2);
        break;
      case 'microcurrent_0_1hz':
        betaEndorphin = Math.round(40 * mult);
        enkephalin = Math.round(60 * mult);
        dynorphin = Math.round(15 * mult);
        cytokineSuppression = Math.round(85 * mult);
        vagalTone = +(1.0 + (1.2 * mult)).toFixed(2);
        break;
      case 'intermittent_ripple':
      default:
        betaEndorphin = Math.round(65 * mult);
        enkephalin = Math.round(60 * mult);
        dynorphin = Math.round(50 * mult);
        cytokineSuppression = Math.round(60 * mult);
        vagalTone = +(1.0 + (0.5 * mult)).toFixed(2);
        break;
    }

    return {
      betaEndorphinScore: betaEndorphin,
      dynorphinScore: dynorphin,
      enkephalinScore: enkephalin,
      cytokineSuppressionPercentage: cytokineSuppression,
      vagalToneMultiplier: vagalTone,
      totalEnergyJoules: +(intensity * 0.05 * this.sessionElapsedTimeSeconds()).toFixed(1)
    };
  });

  selectProtocol(protocol: IElectroacupunctureProtocol): void {
    this.activeProtocol.set(protocol);
    this.waveform.set(protocol.waveform);
    this.frequencyHz.set(protocol.frequencyHz);
    this.intensityMa.set(protocol.intensityMa);
  }

  toggleSession(): void {
    this.isRunning.update(r => !r);
  }

  tickSecond(): void {
    if (this.isRunning()) {
      this.sessionElapsedTimeSeconds.update(s => s + 1);
    }
  }

  resetSession(): void {
    this.isRunning.set(false);
    this.sessionElapsedTimeSeconds.set(0);
  }
}
