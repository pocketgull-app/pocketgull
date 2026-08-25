import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';

export type AuscultationSite = 'Aortic' | 'Pulmonic' | 'Tricuspid' | 'Mitral/Apex';
export type MurmurPresence = 'Absent' | 'Present' | 'Unknown';
export type MurmurTiming = 'Early-Systolic' | 'Mid-Systolic' | 'Holosystolic' | 'Diastolic' | 'None';

export interface IPcgAcousticAnalysis {
  site: AuscultationSite;
  presence: MurmurPresence;
  timing: MurmurTiming;
  grade: string; // e.g. "Grade III/VI"
  confidenceScore: number; // 0.0 - 1.0
  s1PeakFrequencyHz: number;
  s2PeakFrequencyHz: number;
  heartRateBpm: number;
  diagnosticInterpretation: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhysioNetAcousticService {
  private patientState = inject(PatientStateService);

  readonly activeSite = signal<AuscultationSite>('Mitral/Apex');
  readonly isRecording = signal<boolean>(false);
  readonly isAnalyzing = signal<boolean>(false);

  readonly lastAnalysis = signal<IPcgAcousticAnalysis>({
    site: 'Mitral/Apex',
    presence: 'Absent',
    timing: 'None',
    grade: 'Grade 0/VI',
    confidenceScore: 0.96,
    s1PeakFrequencyHz: 48,
    s2PeakFrequencyHz: 72,
    heartRateBpm: 72,
    diagnosticInterpretation: 'Normal S1 & S2 physiological heart sound envelope. Zero pathological systolic or diastolic murmurs detected.'
  });

  /**
   * Generates or processes PCG audio buffer for MedGemma acoustic murmur classification.
   */
  async analyzeAcousticPcgStream(site: AuscultationSite, simulatedMurmur: boolean = false): Promise<IPcgAcousticAnalysis> {
    this.activeSite.set(site);
    this.isAnalyzing.set(true);

    // Simulated 20-400 Hz bandpass filtering & MedGemma acoustic embedding inference tick
    await new Promise(r => setTimeout(r, 350));

    const vitals = this.patientState.vitals();
    const hr = parseInt(vitals.hr || '72', 10);

    let result: IPcgAcousticAnalysis;

    if (simulatedMurmur) {
      result = {
        site,
        presence: 'Present',
        timing: site === 'Mitral/Apex' ? 'Holosystolic' : 'Mid-Systolic',
        grade: site === 'Mitral/Apex' ? 'Grade III/VI' : 'Grade II/VI',
        confidenceScore: 0.94,
        s1PeakFrequencyHz: 52,
        s2PeakFrequencyHz: 68,
        heartRateBpm: hr,
        diagnosticInterpretation: `Pathological ${site === 'Mitral/Apex' ? 'Holosystolic Mitral Regurgitation' : 'Ejection Systolic'} murmur detected at ${site} auscultation site. MedGemma acoustic embeddings indicate high spectral energy between S1 and S2.`
      };
    } else {
      result = {
        site,
        presence: 'Absent',
        timing: 'None',
        grade: 'Grade 0/VI',
        confidenceScore: 0.98,
        s1PeakFrequencyHz: 48,
        s2PeakFrequencyHz: 72,
        heartRateBpm: hr,
        diagnosticInterpretation: `Normal S1 & S2 physiological heart sound envelope at ${site}. Zero pathological systolic or diastolic turbulence detected.`
      };
    }

    this.lastAnalysis.set(result);
    this.isAnalyzing.set(false);
    return result;
  }
}
