import { Injectable, signal, computed } from '@angular/core';

export type ToothSurface = 'M' | 'O' | 'D' | 'F' | 'L';
export type TWIGrade = 0 | 1 | 2 | 3 | 4;

export interface IFdaBuprenorphineOralSafetyDirective {
  warningTitle: string;
  fdaWarningYear: 2022;
  mechanism: string;
  coreDirectives: Array<{
    ruleNumber: number;
    action: string;
    clinicalRationale: string;
    urgency: 'MANDATORY' | 'HIGH_PRIORITY' | 'ROUTINE';
  }>;
}

export const FDA_BUPRENORPHINE_DENTAL_DIRECTIVE: IFdaBuprenorphineOralSafetyDirective = {
  warningTitle: 'FDA Drug Safety Communication: Dental Adverse Events with Transmucosal Buprenorphine',
  fdaWarningYear: 2022,
  mechanism: 'Sublingual and buccal buprenorphine formulations are inherently acidic (pH ~3.5 to 5.0). Mu-opioid receptor stimulation concurrently inhibits salivary secretion (xerostomia), depleting the bicarbonate buffer and accelerating cervical caries, enamel erosion, and severe periodontal attachment loss.',
  coreDirectives: [
    {
      ruleNumber: 1,
      action: 'Neutral Water Rinse Post-Dissolution',
      clinicalRationale: 'After the sublingual film or tablet completely dissolves (~5–10 min), take a sip of water, gently swish over all dental arches, and swallow. Never spit medication out prematurely.',
      urgency: 'MANDATORY'
    },
    {
      ruleNumber: 2,
      action: '1-Hour Toothbrushing Delay (Strict)',
      clinicalRationale: 'Do NOT brush teeth immediately after dosing. Mechanical brushing on acid-softened enamel causes severe cervical abrasions. Wait at least 60 minutes before brushing.',
      urgency: 'MANDATORY'
    },
    {
      ruleNumber: 3,
      action: 'Prescription 5000 ppm High-Fluoride Toothpaste / Varnish',
      clinicalRationale: 'Prescribe 1.1% Sodium Fluoride (Prevident 5000) or apply 5% NaF varnish quarterly to remineralize incipient demineralization.',
      urgency: 'HIGH_PRIORITY'
    },
    {
      ruleNumber: 4,
      action: 'Salivary Stimulation & Xylitol Pacing',
      clinicalRationale: 'Chew xylitol gum or use salivary secretagogues 3–5 times daily to stimulate endogenous buffer flow and inhibit S. mutans proliferation.',
      urgency: 'HIGH_PRIORITY'
    },
    {
      ruleNumber: 5,
      action: 'Bilateral Dental Linkage & 3-Month Periodontal Recalls',
      clinicalRationale: 'Establish dental baseline within 30 days of induction with tight 3-month periodontal probing and caries surveillance.',
      urgency: 'HIGH_PRIORITY'
    }
  ]
};

export interface IToothState {
  fdiNumber: number; // 11-18, 21-28, 31-38, 41-48
  name: string;
  quadrant: 1 | 2 | 3 | 4;
  cariesSurfaces: ToothSurface[];
  twiGrade: TWIGrade;
  probingDepthMm: number;
  hasBleedingOnProbing: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TeledentistryService {
  readonly teeth = signal<IToothState[]>(this.initOdontogram());
  readonly hsCRP = signal<number>(2.4); // mg/L baseline
  readonly buprenorphineTherapyActive = signal<boolean>(false);
  readonly salivaryPh = signal<number>(6.8);
  readonly fdaDirective = FDA_BUPRENORPHINE_DENTAL_DIRECTIVE;

  // Filtered computed state
  readonly deepPocketsCount = computed(() =>
    this.teeth().filter(t => t.probingDepthMm >= 4).length
  );

  readonly bleedingPercentage = computed(() => {
    const total = this.teeth().length;
    if (total === 0) return 0;
    const bopCount = this.teeth().filter(t => t.hasBleedingOnProbing).length;
    return Math.round((bopCount / total) * 100);
  });

  /**
   * Systemic Inflammatory Burden Index (SIBI 0-100)
   * SIBI = min(100, (Deep Pockets * 6) + (%BOP * 0.8) + (hs-CRP * 12) + BupAddend)
   */
  readonly sibiScore = computed(() => {
    const deepPockets = this.deepPocketsCount();
    const bop = this.bleedingPercentage();
    const crp = this.hsCRP();
    const bupFactor = this.buprenorphineTherapyActive() ? 8 : 0;

    const raw = (deepPockets * 6) + (bop * 0.8) + (crp * 12) + bupFactor;
    return Math.min(100, Math.round(raw));
  });

  /**
   * Cardiovascular Risk Multiplier (1.0x - 2.8x)
   */
  readonly cvRiskMultiplier = computed(() => {
    const sibi = this.sibiScore();
    const multiplier = 1.0 + (sibi / 100) * 1.8;
    return Number(multiplier.toFixed(2));
  });

  /**
   * Predicted HbA1c Elevation (+0.0% to +0.8%)
   */
  readonly predictedHbA1cElevation = computed(() => {
    const sibi = this.sibiScore();
    const elevation = (sibi / 100) * 0.8;
    return Number(elevation.toFixed(2));
  });

  private initOdontogram(): IToothState[] {
    const list: IToothState[] = [];

    // Helper to generate tooth names
    const getToothName = (num: number): string => {
      const names: Record<number, string> = {
        18: 'Maxillary Right 3rd Molar', 17: 'Maxillary Right 2nd Molar', 16: 'Maxillary Right 1st Molar',
        15: 'Maxillary Right 2nd Premolar', 14: 'Maxillary Right 1st Premolar', 13: 'Maxillary Right Canine',
        12: 'Maxillary Right Lateral Incisor', 11: 'Maxillary Right Central Incisor',
        21: 'Maxillary Left Central Incisor', 22: 'Maxillary Left Lateral Incisor', 23: 'Maxillary Left Canine',
        24: 'Maxillary Left 1st Premolar', 25: 'Maxillary Left 2nd Premolar', 26: 'Maxillary Left 1st Molar',
        27: 'Maxillary Left 2nd Molar', 28: 'Maxillary Left 3rd Molar',
        48: 'Mandibular Right 3rd Molar', 47: 'Mandibular Right 2nd Molar', 46: 'Mandibular Right 1st Molar',
        45: 'Mandibular Right 2nd Premolar', 44: 'Mandibular Right 1st Premolar', 43: 'Mandibular Right Canine',
        42: 'Mandibular Right Lateral Incisor', 41: 'Mandibular Right Central Incisor',
        31: 'Mandibular Left Central Incisor', 32: 'Mandibular Left Lateral Incisor', 33: 'Mandibular Left Canine',
        34: 'Mandibular Left 1st Premolar', 35: 'Mandibular Left 2nd Premolar', 36: 'Mandibular Left 1st Molar',
        37: 'Mandibular Left 2nd Molar', 38: 'Mandibular Left 3rd Molar'
      };
      return names[num] || `Tooth ${num}`;
    };

    // Q1: 18..11
    for (let fdi = 18; fdi >= 11; fdi--) {
      list.push({ fdiNumber: fdi, name: getToothName(fdi), quadrant: 1, cariesSurfaces: [], twiGrade: 0, probingDepthMm: 2, hasBleedingOnProbing: false });
    }
    // Q2: 21..28
    for (let fdi = 21; fdi <= 28; fdi++) {
      list.push({ fdiNumber: fdi, name: getToothName(fdi), quadrant: 2, cariesSurfaces: [], twiGrade: 0, probingDepthMm: 2, hasBleedingOnProbing: false });
    }
    // Q4: 48..41
    for (let fdi = 48; fdi >= 41; fdi--) {
      list.push({ fdiNumber: fdi, name: getToothName(fdi), quadrant: 4, cariesSurfaces: [], twiGrade: 0, probingDepthMm: 2, hasBleedingOnProbing: false });
    }
    // Q3: 31..38
    for (let fdi = 31; fdi <= 38; fdi++) {
      list.push({ fdiNumber: fdi, name: getToothName(fdi), quadrant: 3, cariesSurfaces: [], twiGrade: 0, probingDepthMm: 2, hasBleedingOnProbing: false });
    }

    // Set clinical baseline demo state on key teeth (16, 26, 36, 46)
    return list.map(t => {
      if (t.fdiNumber === 16) return { ...t, cariesSurfaces: ['O', 'M'], twiGrade: 2, probingDepthMm: 5, hasBleedingOnProbing: true };
      if (t.fdiNumber === 46) return { ...t, cariesSurfaces: ['O', 'D'], twiGrade: 1, probingDepthMm: 4, hasBleedingOnProbing: true };
      if (t.fdiNumber === 26) return { ...t, twiGrade: 3, probingDepthMm: 4, hasBleedingOnProbing: true };
      return t;
    });
  }

  toggleSurface(fdiNumber: number, surface: ToothSurface) {
    this.teeth.update(list =>
      list.map(t => {
        if (t.fdiNumber !== fdiNumber) return t;
        const exists = t.cariesSurfaces.includes(surface);
        const nextSurfaces = exists
          ? t.cariesSurfaces.filter(s => s !== surface)
          : [...t.cariesSurfaces, surface];
        return { ...t, cariesSurfaces: nextSurfaces };
      })
    );
  }

  setTWIGrade(fdiNumber: number, grade: TWIGrade) {
    this.teeth.update(list =>
      list.map(t => (t.fdiNumber === fdiNumber ? { ...t, twiGrade: grade } : t))
    );
  }

  setProbingDepth(fdiNumber: number, depthMm: number) {
    this.teeth.update(list =>
      list.map(t => (t.fdiNumber === fdiNumber ? { ...t, probingDepthMm: depthMm } : t))
    );
  }

  toggleBOP(fdiNumber: number) {
    this.teeth.update(list =>
      list.map(t => (t.fdiNumber === fdiNumber ? { ...t, hasBleedingOnProbing: !t.hasBleedingOnProbing } : t))
    );
  }

  loadBuprenorphineXerostomiaPreset(): void {
    this.buprenorphineTherapyActive.set(true);
    this.salivaryPh.set(6.2); // Acidic sublingual dissolution shift
    this.hsCRP.set(3.2); // Elevated inflammatory marker
    this.teeth.update(list =>
      list.map(t => {
        // Mandibular anterior sublingual pooling area (teeth 31, 32, 41, 42)
        if ([31, 32, 41, 42].includes(t.fdiNumber)) {
          return {
            ...t,
            twiGrade: 2,
            cariesSurfaces: ['F', 'L'],
            probingDepthMm: 4,
            hasBleedingOnProbing: true
          };
        }
        // First molars with cervical demineralization
        if ([16, 26, 36, 46].includes(t.fdiNumber)) {
          return {
            ...t,
            twiGrade: 2,
            cariesSurfaces: ['O', 'M'],
            probingDepthMm: 5,
            hasBleedingOnProbing: true
          };
        }
        return t;
      })
    );
  }

  resetOdontogram(): void {
    this.buprenorphineTherapyActive.set(false);
    this.salivaryPh.set(6.8);
    this.hsCRP.set(2.4);
    this.teeth.set(this.initOdontogram());
  }
}
