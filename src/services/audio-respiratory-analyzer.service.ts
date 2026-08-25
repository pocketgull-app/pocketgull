import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';

export interface IRespiratoryAcousticReading {
  timestamp: string;
  dominantFrequencyHz: number;
  acousticEnergyDb: number;
  detectedPattern: 'Normal Breathing' | 'Expiratory Wheeze' | 'Inspiratory Stridor' | 'Explosive Cough Burst';
  severityGrade: 'Mild' | 'Moderate' | 'Severe';
  clinicalIndication: string;
}

@Injectable({
  providedIn: 'root'
})
export class AudioRespiratoryAnalyzerService {
  private patientState = inject(PatientStateService);

  readonly isAnalyzing = signal<boolean>(false);
  readonly dominantFrequencyHz = signal<number>(520); // Frequency pitch
  readonly acousticEnergyDb = signal<number>(-24); // Sound intensity in dB
  readonly coughBurstCountLast24h = signal<number>(14);

  readonly acousticPattern = computed<IRespiratoryAcousticReading>(() => {
    const freq = this.dominantFrequencyHz();
    const db = this.acousticEnergyDb();

    let pattern: IRespiratoryAcousticReading['detectedPattern'] = 'Normal Breathing';
    let severity: IRespiratoryAcousticReading['severityGrade'] = 'Mild';
    let indication = 'Normal vesicular breath sounds. No adventitious rhonchi or stridor detected.';

    if (freq >= 2000 && db > -18) {
      pattern = 'Inspiratory Stridor';
      severity = 'Severe';
      indication = 'High-pitched inspiratory sound indicating potential upper airway obstruction or croup. Immediate clinical evaluation advised.';
    } else if (freq >= 400 && freq <= 1600 && db > -22) {
      pattern = 'Expiratory Wheeze';
      severity = db > -12 ? 'Severe' : 'Moderate';
      indication = 'Continuous musical adventitious sound suggesting lower airway bronchospasm or small-airway narrowing (Asthma / COPD).';
    } else if (db > -8) {
      pattern = 'Explosive Cough Burst';
      severity = 'Moderate';
      indication = 'Explosive acoustic impulse with rapid transient pressure decay. Monitored for bronchial clearing.';
    }

    return {
      timestamp: new Date().toISOString(),
      dominantFrequencyHz: freq,
      acousticEnergyDb: db,
      detectedPattern: pattern,
      severityGrade: severity,
      clinicalIndication: indication
    };
  });

  simulateAcousticFrequency(frequencyHz: number, dbLevel: number): void {
    this.dominantFrequencyHz.set(frequencyHz);
    this.acousticEnergyDb.set(dbLevel);
  }
}
