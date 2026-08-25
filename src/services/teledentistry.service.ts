import { Injectable, signal, computed } from '@angular/core';

export type ToothSurface = 'M' | 'O' | 'D' | 'F' | 'L';
export type TWIGrade = 0 | 1 | 2 | 3 | 4;

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
   * SIBI = min(100, (Deep Pockets * 6) + (%BOP * 0.8) + (hs-CRP * 12))
   */
  readonly sibiScore = computed(() => {
    const deepPockets = this.deepPocketsCount();
    const bop = this.bleedingPercentage();
    const crp = this.hsCRP();

    const raw = (deepPockets * 6) + (bop * 0.8) + (crp * 12);
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
}
