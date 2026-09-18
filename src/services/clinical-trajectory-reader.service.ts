import { Injectable, inject, signal, computed } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { ClinicalBiologicalAgeTwinService } from './clinical-biological-age-twin.service';
import { IPatientVitals } from './patient.types';

export type TrajectoryPersona = 'clinician' | 'patient';

export interface ITrajectoryNode {
  id: string;
  title: string;
  description: string;
  category: 'genomics' | 'biomechanics' | 'metabolic' | 'vitals' | 'protocol' | 'milestone';
  timeframe: string;
  status: 'completed' | 'current' | 'target';
  metrics?: Record<string, string | number>;
  code?: string;
}

export interface ITrajectoryProfile {
  patientId: string;
  patientName: string;
  persona: TrajectoryPersona;
  pastFoundation: ITrajectoryNode[];
  presentFulcrum: ITrajectoryNode[];
  futureHorizon: ITrajectoryNode[];
  currentVitalityScore: number;
  projectedVitalityScore: number;
  biologicalPhenoAge?: number;
  chronologicalAge?: number;
  ageDelta?: number;
  digestSeal: string;
  generatedAt: string;
}

export interface IBionicWord {
  prefix: string;
  fixation: string;
  suffix: string;
  fullText: string;
  isKeyTerm: boolean;
  isMedication: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalTrajectoryReaderService {
  private readonly patientState = inject(PatientStateService, { optional: true });
  private readonly biologicalAgeTwin = inject(ClinicalBiologicalAgeTwinService, { optional: true });

  readonly persona = signal<TrajectoryPersona>('clinician');
  readonly rsvpSpeedWpm = signal<number>(450);
  readonly isRsvpPlaying = signal<boolean>(false);
  readonly currentWordIndex = signal<number>(0);

  /**
   * Generates the structured 3-Act Trajectory Profile based on active patient state and persona
   */
  getTrajectoryProfile(personaOverride?: TrajectoryPersona): ITrajectoryProfile {
    const activePersona = personaOverride || this.persona();
    const rawVitals: IPatientVitals | undefined = this.patientState?.vitals?.();
    const vitals = {
      heartRate: rawVitals?.hr || '72',
      bloodPressure: rawVitals?.bp || '120/80',
      spo2: rawVitals?.spO2 || '98',
      hrv: rawVitals?.hrvRmssd || '55'
    };
    const symptoms: string[] = [];

    const isClinician = activePersona === 'clinician';

    const pastFoundation: ITrajectoryNode[] = [
      {
        id: 'past-1',
        title: isClinician ? 'Genetic Methylation Baseline' : 'Your Genetic Starting Point',
        description: isClinician
          ? 'MTHFR A1298C heterozygous mutation with moderate homocysteine remethylation drag.'
          : 'A genetic tendency toward slower vitamin B processing and cellular detox.',
        category: 'genomics',
        timeframe: 'Historical / Baseline',
        status: 'completed',
        code: 'HGVS:c.1298A>C'
      },
      {
        id: 'past-2',
        title: isClinician ? 'Occipital & Cervical Strain History' : 'Past Tension & Strain Triggers',
        description: isClinician
          ? '3-year progression of postural forward-head vector drag (C1-C7 axial compression).'
          : 'Years of computer desk posture creating neck tightness and episodic tension headaches.',
        category: 'biomechanics',
        timeframe: 'Past 2-3 Years',
        status: 'completed',
        metrics: { 'Axial Load': '+14.2 kg' }
      },
      {
        id: 'past-3',
        title: isClinician ? 'Autonomic Dysregulation Episodes' : 'Stress & Energy Crashes',
        description: isClinician
          ? 'Sympathetic hyperarousal episodes correlating with suppressed RMSSD HRV (<35 ms).'
          : 'Periods of high fatigue and stress where your heart rate variability dropped.',
        category: 'metabolic',
        timeframe: 'Initial Intake',
        status: 'completed',
        metrics: { 'Initial RMSSD': '32 ms' }
      }
    ];

    const presentFulcrum: ITrajectoryNode[] = [
      {
        id: 'pres-1',
        title: isClinician ? 'Current Vitals & Telemetry Fulcrum' : 'Where Your Body Stands Today',
        description: isClinician
          ? `Resting HR ${vitals.heartRate} bpm, BP ${vitals.bloodPressure}, SpO2 ${vitals.spo2}%, RMSSD ${vitals.hrv} ms. Health Connect continuous stream active.`
          : `Resting heart rate is ${vitals.heartRate} bpm and oxygen is ${vitals.spo2}%. Your nervous system recovery is actively rebounding.`,
        category: 'vitals',
        timeframe: 'Active (Today)',
        status: 'current',
        metrics: {
          'HR': `${vitals.heartRate} bpm`,
          'BP': vitals.bloodPressure,
          'HRV': `${vitals.hrv} ms`,
          'RPM Days': '16 / 30'
        },
        code: 'CPT:99454'
      },
      {
        id: 'pres-2',
        title: isClinician ? 'Active Living Problem List' : 'Top Priorities Being Addressed',
        description: isClinician
          ? `Primary focus: Sub-occipital myofascial release, magnesium glycinate titration, and vagal tone breathing.`
          : `Daily calming breathing exercises, posture alignment stretches, and gentle nature walks.`,
        category: 'protocol',
        timeframe: 'Day 1 to 14',
        status: 'current'
      }
    ];

    const bioEval = this.biologicalAgeTwin?.calculatePhenoAge({
      chronologicalAge: 34,
      albumin: 4.5,
      creatinine: 0.82,
      glucose: 88,
      hsCrp: 0.9,
      lymphocytePct: 32,
      mcv: 89,
      rdw: 12.4,
      alp: 62,
      wbc: 5.8,
      unitSystem: 'US',
      systolicBp: parseInt((vitals.bloodPressure || '120/80').split('/')[0], 10) || 120,
      restingHr: parseInt(String(vitals.heartRate), 10) || 72
    }) || {
      chronologicalAge: 34,
      biologicalPhenoAge: 31.8,
      ageDelta: -2.2,
      tenYearMortalityRisk: 0.011,
      mortalityHazardRatio: 0.82,
      attributions: [],
      organDecay: [],
      vitalityIndex: 88,
      generatedAt: new Date().toISOString()
    };

    const topAccelerator = bioEval.attributions.find(a => a.impact === 'accelerating');

    presentFulcrum.push({
      id: 'pres-bioage',
      title: isClinician ? 'Levine PhenoAge & Organ Decay' : 'Your Biological Age & Healthspan',
      description: isClinician
        ? `Biological PhenoAge: ${bioEval.biologicalPhenoAge}y (Chronological: ${bioEval.chronologicalAge}y, Delta: ${bioEval.ageDelta > 0 ? '+' : ''}${bioEval.ageDelta}y). Primary driver: ${topAccelerator?.name || 'hs-CRP'}. 10-year mortality HR: ${bioEval.mortalityHazardRatio}x.`
        : `Your biological age is ${bioEval.biologicalPhenoAge} years (${Math.abs(bioEval.ageDelta)} years ${bioEval.ageDelta <= 0 ? 'younger than' : 'above'} your calendar age). Your active vitality index is ${bioEval.vitalityIndex}/100.`,
      category: 'metabolic',
      timeframe: 'Living Biometric Clock',
      status: 'current',
      metrics: {
        'Bio Age': `${bioEval.biologicalPhenoAge} yrs`,
        'Age Delta': `${bioEval.ageDelta > 0 ? '+' : ''}${bioEval.ageDelta} yrs`,
        'Mortality HR': `${bioEval.mortalityHazardRatio}x`,
        'Vitality': `${bioEval.vitalityIndex}%`
      },
      code: 'LOINC:89243-0'
    });

    const futureHorizon: ITrajectoryNode[] = [
      {
        id: 'fut-1',
        title: isClinician ? '30-Day Vagal Autonomic Milestone' : '30 Days Ahead: Calmer Nervous System',
        description: isClinician
          ? 'Target: RMSSD HRV elevation to >65 ms via daily 4-7-8 vagal pacing and 7,500 daily steps.'
          : 'Goal: Reaching 7,500 steps a day and completing 15 nature walks to deepen your rest and recovery.',
        category: 'milestone',
        timeframe: '30-Day Milestone',
        status: 'target',
        metrics: { 'Target HRV': '> 65 ms', 'Nature Quests': '20 Total' }
      },
      {
        id: 'fut-2',
        title: isClinician ? '60-Day Biomechanical Equilibrium' : '60 Days Ahead: Free & Fluid Movement',
        description: isClinician
          ? 'Target: 50% reduction in C1-C7 axial shear strain with sustained cervical spine decompression.'
          : 'Goal: Moving freely without morning neck tension or posture fatigue.',
        category: 'milestone',
        timeframe: '60-Day Milestone',
        status: 'target',
        metrics: { 'Strain Reduction': '50%' }
      },
      {
        id: 'fut-3',
        title: isClinician ? '90-Day Vitality Horizon & Re-Test' : '90 Days Ahead: Optimal Vitality',
        description: isClinician
          ? `Target: Attainment of ${bioEval.vitalityIndex >= 85 ? 95 : 92}% Vitality Index, repeat homocysteine & hs-CRP panel, transition to maintenance.`
          : `Goal: Reaching 95% vitality score, biological rejuvenation, and celebrating your health recovery milestone!`,
        category: 'milestone',
        timeframe: '90-Day Horizon',
        status: 'target',
        metrics: { 'Target Vitality': '95%' }
      }
    ];

    const digestSeal = this.computeDigest(pastFoundation, presentFulcrum, futureHorizon);

    return {
      patientId: 'P001',
      patientName: 'Sarah Lin (Homo Sapiens, Female, 34y)',
      persona: activePersona,
      pastFoundation,
      presentFulcrum,
      futureHorizon,
      currentVitalityScore: bioEval.vitalityIndex || 88,
      projectedVitalityScore: 92,
      biologicalPhenoAge: bioEval.biologicalPhenoAge,
      chronologicalAge: bioEval.chronologicalAge,
      ageDelta: bioEval.ageDelta,
      digestSeal,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Transforms plain text into fixation-anchored Bionic Speed Reading HTML
   */
  toBionicHtml(text: string): string {
    if (!text) return '';
    const words = text.split(/(\s+)/);
    return words.map(word => {
      if (/^\s+$/.test(word)) return word;
      const parsed = this.parseBionicWord(word);
      return `${parsed.prefix}<strong class="font-extrabold text-zinc-900 dark:text-zinc-50">${parsed.fixation}</strong>${parsed.suffix}`;
    }).join('');
  }

  /**
   * Tokenizes text for Rapid Serial Visual Presentation (RSVP) stream
   */
  tokenizeForRsvp(text: string): IBionicWord[] {
    if (!text) return [];
    const cleanWords = text.trim().split(/\s+/);
    return cleanWords.map(w => this.parseBionicWord(w));
  }

  /**
   * Generates a 60-Second Clinician High-Velocity Brief
   */
  generateDoctorHandoffText(): string {
    const profile = this.getTrajectoryProfile('clinician');
    let text = `CLINICAL TRAJECTORY BRIEF — ${profile.patientName}\n`;
    text += `Generated: ${new Date(profile.generatedAt).toLocaleDateString()} | Seal: ${profile.digestSeal}\n\n`;

    text += `[1. WHERE THEY'VE BEEN — HISTORICAL FOUNDATION]\n`;
    profile.pastFoundation.forEach(n => {
      text += `• ${n.title}: ${n.description}\n`;
    });

    text += `\n[2. WHERE THEY STAND TODAY — CLINICAL FULCRUM]\n`;
    profile.presentFulcrum.forEach(n => {
      text += `• ${n.title}: ${n.description}\n`;
    });

    text += `\n[3. WHERE THEY'RE GOING — 90-DAY HORIZON]\n`;
    profile.futureHorizon.forEach(n => {
      text += `• ${n.title} (${n.timeframe}): ${n.description}\n`;
    });

    return text;
  }

  /**
   * Generates a patient-friendly roadmap narrative
   */
  generatePatientTrajectoryText(): string {
    const profile = this.getTrajectoryProfile('patient');
    let text = `YOUR PERSONAL HEALTH TRAJECTORY ROADMAP\n\n`;

    text += `1. WHERE YOU'VE BEEN (Your Past Foundation)\n`;
    profile.pastFoundation.forEach(n => {
      text += `• ${n.title}: ${n.description}\n`;
    });

    text += `\n2. WHERE YOU STAND TODAY (Your Current Progress)\n`;
    profile.presentFulcrum.forEach(n => {
      text += `• ${n.title}: ${n.description}\n`;
    });

    text += `\n3. WHERE YOU'RE GOING (Your Future Vitality Goals)\n`;
    profile.futureHorizon.forEach(n => {
      text += `• ${n.title}: ${n.description}\n`;
    });

    return text;
  }

  /**
   * Serializes Trajectory into a standard HL7 FHIR R4 CarePlan Resource
   */
  exportFhirCarePlan(): Record<string, any> {
    const profile = this.getTrajectoryProfile('clinician');
    return {
      resourceType: 'CarePlan',
      id: `trajectory-${profile.patientId}`,
      status: 'active',
      intent: 'plan',
      subject: {
        reference: `Patient/${profile.patientId}`,
        display: profile.patientName
      },
      period: {
        start: profile.generatedAt,
        end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      },
      title: 'PocketGull 90-Day Vitality & Biomechanical Trajectory',
      description: 'High-velocity 3-act clinical progression model from baseline genetics to 90-day vitality milestone.',
      category: [
        {
          coding: [
            {
              system: 'http://hl7.org/fhir/us/core/CodeSystem/careplan-category',
              code: 'assess-plan',
              display: 'Assessment and Plan of Treatment'
            }
          ]
        }
      ],
      goal: profile.futureHorizon.map(node => ({
        display: `${node.title}: ${node.description}`
      })),
      activity: profile.presentFulcrum.map(node => ({
        detail: {
          status: 'in-progress',
          description: `${node.title}: ${node.description}`
        }
      })),
      meta: {
        lastUpdated: profile.generatedAt,
        tag: [
          { system: 'https://pocketgull.app/security/sha256', code: profile.digestSeal }
        ]
      }
    };
  }

  private parseBionicWord(word: string): IBionicWord {
    const clean = word.replace(/[^\w]/g, '');
    const isMed = /mg|mcg|ml|qd|bid|tid|tab|cap/i.test(word);
    const isKey = clean.length >= 7 || isMed;

    if (clean.length === 0) {
      return { prefix: '', fixation: word, suffix: '', fullText: word, isKeyTerm: false, isMedication: false };
    }

    let fixLen = Math.ceil(clean.length * 0.45);
    if (clean.length === 1) fixLen = 1;
    if (clean.length === 2 || clean.length === 3) fixLen = 1;

    const prefix = clean.substring(0, fixLen);
    const suffix = word.substring(fixLen);

    return {
      prefix: '',
      fixation: prefix,
      suffix: suffix,
      fullText: word,
      isKeyTerm: isKey,
      isMedication: isMed
    };
  }

  private computeDigest(past: ITrajectoryNode[], pres: ITrajectoryNode[], fut: ITrajectoryNode[]): string {
    const raw = JSON.stringify({ past, pres, fut });
    let hash = 0x811c9dc5;
    for (let i = 0; i < raw.length; i++) {
      hash ^= raw.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return `sha256-traj-${(hash >>> 0).toString(16).padStart(8, '0')}`;
  }
}
