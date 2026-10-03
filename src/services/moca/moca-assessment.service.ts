import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  IMocaSessionState,
  IMocaSummaryResult,
  IMocaDomainScore,
  ITrailNode,
  IMemoryWordState,
  IFhirMocaBundle,
  IFhirMocaObservation,
  MocaDiagnosticTier
} from './moca.types';
import { PatientStateService } from '../patient-state.service';
import { PatientManagementService } from '../patient-management.service';
import { StorageService } from '../storage.service';
import { HistoryEntry } from '../patient.types';

export const STANDARD_TRAIL_NODES: ITrailNode[] = [
  { id: '1', label: '1', x: 20, y: 35, type: 'number', sequenceIndex: 0 },
  { id: 'A', label: 'A', x: 42, y: 18, type: 'letter', sequenceIndex: 1 },
  { id: '2', label: '2', x: 75, y: 22, type: 'number', sequenceIndex: 2 },
  { id: 'B', label: 'B', x: 82, y: 55, type: 'letter', sequenceIndex: 3 },
  { id: '3', label: '3', x: 62, y: 78, type: 'number', sequenceIndex: 4 },
  { id: 'C', label: 'C', x: 38, y: 65, type: 'letter', sequenceIndex: 5 },
  { id: '4', label: '4', x: 18, y: 80, type: 'number', sequenceIndex: 6 },
  { id: 'D', label: 'D', x: 12, y: 52, type: 'letter', sequenceIndex: 7 },
  { id: '5', label: '5', x: 45, y: 42, type: 'number', sequenceIndex: 8 },
  { id: 'E', label: 'E', x: 72, y: 40, type: 'letter', sequenceIndex: 9 }
];

export const STANDARD_MEMORY_WORDS: IMemoryWordState[] = [
  {
    word: 'FACE',
    trial1Recalled: false,
    trial2Recalled: false,
    delayedSpontaneous: false,
    delayedCategoryCued: false,
    delayedChoiceCued: false,
    categoryCue: 'Part of the body',
    choiceOptions: ['Nose', 'Face', 'Hand']
  },
  {
    word: 'VELVET',
    trial1Recalled: false,
    trial2Recalled: false,
    delayedSpontaneous: false,
    delayedCategoryCued: false,
    delayedChoiceCued: false,
    categoryCue: 'Type of fabric',
    choiceOptions: ['Cotton', 'Velvet', 'Silk']
  },
  {
    word: 'CHURCH',
    trial1Recalled: false,
    trial2Recalled: false,
    delayedSpontaneous: false,
    delayedCategoryCued: false,
    delayedChoiceCued: false,
    categoryCue: 'Type of building',
    choiceOptions: ['Church', 'School', 'Hospital']
  },
  {
    word: 'DAISY',
    trial1Recalled: false,
    trial2Recalled: false,
    delayedSpontaneous: false,
    delayedCategoryCued: false,
    delayedChoiceCued: false,
    categoryCue: 'Type of flower',
    choiceOptions: ['Rose', 'Daisy', 'Tulip']
  },
  {
    word: 'RED',
    trial1Recalled: false,
    trial2Recalled: false,
    delayedSpontaneous: false,
    delayedCategoryCued: false,
    delayedChoiceCued: false,
    categoryCue: 'A color',
    choiceOptions: ['Red', 'Blue', 'Green']
  }
];

export const VIGILANCE_LETTER_SEQUENCE = [
  'F', 'B', 'A', 'C', 'M', 'N', 'A', 'A', 'J', 'K', 'L', 'B', 'A', 'F', 'A',
  'W', 'D', 'E', 'A', 'A', 'A', 'Z', 'F', 'A'
];

@Injectable({
  providedIn: 'root'
})
export class MocaAssessmentService {
  private platformId = inject(PLATFORM_ID);
  private patientState = inject(PatientStateService, { optional: true });
  private patientMgmt = inject(PatientManagementService, { optional: true });
  private storage = inject(StorageService, { optional: true });

  // --- Session State Signal ---
  readonly sessionState = signal<IMocaSessionState>(this.createInitialState());

  // --- 1 Hz Vigilance Runner State ---
  readonly isVigilanceRunning = signal<boolean>(false);
  readonly currentVigilanceIndex = signal<number>(-1);
  readonly currentVigilanceLetter = computed(() => {
    const idx = this.currentVigilanceIndex();
    return idx >= 0 && idx < VIGILANCE_LETTER_SEQUENCE.length ? VIGILANCE_LETTER_SEQUENCE[idx] : '';
  });
  private vigilanceTimer: any = null;
  private hasTappedForCurrentLetter = false;

  // --- 60s Verbal Fluency State ---
  readonly isFluencyRunning = signal<boolean>(false);
  readonly fluencySecondsRemaining = signal<number>(60);
  private fluencyTimer: any = null;
  private speechRecognition: any = null;

  constructor() {
    this.initSpeechRecognition();
  }

  public createInitialState(): IMocaSessionState {
    const patient = this.patientMgmt?.selectedPatient?.();
    return {
      patientId: patient?.id || 'demo-patient',
      patientName: patient?.name || 'Anonymous Patient',
      examinerName: 'Certified Clinician',
      examinerCertificationId: 'MOCA-CERT-2026',
      sessionTimestamp: new Date().toISOString(),
      educationYears: patient?.age && patient.age > 65 ? 12 : 14, // Default baseline

      // Domain 1: Visuospatial / Executive (5 pts)
      trailMakingCompleted: false,
      trailMakingScore: 0,
      cubeCopyScore: 0,
      clockScores: {
        contour: false,
        numbers: false,
        hands: false
      },

      // Domain 2: Naming (3 pts)
      animalNaming: {
        lion: false,
        rhinoceros: false,
        camel: false
      },

      // Domain 3: Memory Registration (0 pts)
      memoryWords: JSON.parse(JSON.stringify(STANDARD_MEMORY_WORDS)),

      // Domain 4: Attention (6 pts)
      attention: {
        digitSpanForward: false,
        digitSpanBackward: false,
        vigilanceTapping: false,
        vigilanceOmissions: 0,
        vigilanceCommissions: 0,
        serial7CorrectCount: 0,
        serial7Score: 0
      },

      // Domain 5: Language (3 pts)
      language: {
        sentence1: false,
        sentence2: false,
        fluencyCount: 0,
        fluencyPassed: false,
        fluencyWords: []
      },

      // Domain 6: Abstraction (2 pts)
      abstraction: {
        trainBicycle: false,
        watchRuler: false
      },

      // Domain 8: Orientation (6 pts)
      orientation: {
        date: false,
        month: false,
        year: false,
        dayOfWeek: false,
        place: false,
        city: false
      }
    };
  }

  public resetSession(): void {
    this.stopVigilanceTest();
    this.stopFluencyTest();
    this.sessionState.set(this.createInitialState());
  }

  // =========================================================================
  // DOMAIN COMPUTED SCORES
  // =========================================================================

  readonly visuospatialScore = computed(() => {
    const s = this.sessionState();
    let score = s.trailMakingScore + s.cubeCopyScore;
    if (s.clockScores.contour) score += 1;
    if (s.clockScores.numbers) score += 1;
    if (s.clockScores.hands) score += 1;
    return Math.min(5, Math.max(0, score));
  });

  readonly namingScore = computed(() => {
    const a = this.sessionState().animalNaming;
    let score = 0;
    if (a.lion) score++;
    if (a.rhinoceros) score++;
    if (a.camel) score++;
    return Math.min(3, score);
  });

  readonly attentionScore = computed(() => {
    const att = this.sessionState().attention;
    let score = 0;
    if (att.digitSpanForward) score++;
    if (att.digitSpanBackward) score++;
    if (att.vigilanceTapping) score++;
    score += att.serial7Score;
    return Math.min(6, score);
  });

  readonly languageScore = computed(() => {
    const lang = this.sessionState().language;
    let score = 0;
    if (lang.sentence1) score++;
    if (lang.sentence2) score++;
    if (lang.fluencyPassed) score++;
    return Math.min(3, score);
  });

  readonly abstractionScore = computed(() => {
    const abs = this.sessionState().abstraction;
    let score = 0;
    if (abs.trainBicycle) score++;
    if (abs.watchRuler) score++;
    return Math.min(2, score);
  });

  readonly delayedRecallScore = computed(() => {
    const words = this.sessionState().memoryWords;
    let score = 0;
    for (const w of words) {
      if (w.delayedSpontaneous) score++;
    }
    return Math.min(5, score);
  });

  readonly orientationScore = computed(() => {
    const o = this.sessionState().orientation;
    let score = 0;
    if (o.date) score++;
    if (o.month) score++;
    if (o.year) score++;
    if (o.dayOfWeek) score++;
    if (o.place) score++;
    if (o.city) score++;
    return Math.min(6, score);
  });

  readonly rawTotalScore = computed(() => {
    return (
      this.visuospatialScore() +
      this.namingScore() +
      this.attentionScore() +
      this.languageScore() +
      this.abstractionScore() +
      this.delayedRecallScore() +
      this.orientationScore()
    );
  });

  readonly educationBonus = computed(() => {
    const raw = this.rawTotalScore();
    const edu = this.sessionState().educationYears;
    return edu <= 12 && raw < 30 ? 1 : 0;
  });

  readonly totalAdjustedScore = computed(() => {
    return Math.min(30, this.rawTotalScore() + this.educationBonus());
  });

  readonly summaryResult = computed<IMocaSummaryResult>(() => {
    const total = this.totalAdjustedScore();
    const raw = this.rawTotalScore();
    const bonus = this.educationBonus();

    let tier: MocaDiagnosticTier = 'NORMAL';
    let tierLabel = 'Normal Cognitive Function';
    let tierColor = 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40';
    let clinicalInterpretation = 'Patient cognitive performance falls within the age and education-adjusted normal range (≥26/30). No clinical evidence of Mild Cognitive Impairment (MCI) or dementia detected.';
    const recommendations: string[] = [
      'Maintain active cardiovascular health and Mediterranean-DASH Intervention for Neurodegenerative Delay (MIND) diet.',
      'Engage in lifelong cognitive novelty, continuous reading, and complex social interactions.',
      'Target 7-9 hours of restorative sleep to promote glymphatic neurotoxin clearance.'
    ];

    if (total < 10) {
      tier = 'SEVERE_IMPAIRMENT';
      tierLabel = 'Severe Cognitive Impairment';
      tierColor = 'bg-rose-600/20 text-rose-700 dark:text-rose-300 border-rose-600/40';
      clinicalInterpretation = 'Severe global neurocognitive impairment (<10/30). Multi-domain functional deficits impacting activities of daily living (ADLs). Immediate comprehensive neurological workup indicated.';
      recommendations.unshift(
        'STAT Comprehensive Neurological Evaluation & Dementia Specialist Referral.',
        'Urgent safety assessment: Driving cessation, medication management oversight, and caregiver support structure.',
        'Brain MRI without contrast and PET-FDG or amyloid biomarker screening as clinically appropriate.'
      );
    } else if (total < 18) {
      tier = 'MODERATE_IMPAIRMENT';
      tierLabel = 'Moderate Cognitive Impairment';
      tierColor = 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/40';
      clinicalInterpretation = 'Moderate cognitive impairment (10–17/30). Evident executive, memory, and functional deficits consistent with early-to-mid stage neurodegenerative or vascular dementia.';
      recommendations.unshift(
        'Specialist neurology referral for neurodegenerative disease staging.',
        'Laboratory dementia workup: TSH, Vitamin B12, CMP, RPR, and lipid panel to exclude reversible etiologies.',
        'Formal Occupational Therapy home safety assessment and power of attorney / advance directive review.'
      );
    } else if (total < 26) {
      tier = 'MILD_COGNITIVE_IMPAIRMENT';
      tierLabel = 'Mild Cognitive Impairment (MCI)';
      tierColor = 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40';
      clinicalInterpretation = 'Score falls within the validated Mild Cognitive Impairment range (18–25/30). Preservation of basic daily autonomy with measurable deficit in memory registration, executive function, or attention.';
      recommendations.unshift(
        'Perform baseline volumetric brain MRI to evaluate medial temporal lobe / hippocampal atrophy (Scheltens scale).',
        'Aggressively optimize vascular risk factors: Target systolic BP < 120 mmHg, HbA1c < 7.0%, and apolipoprotein B control.',
        'Schedule serial MoCA rescreening at 6-month intervals to establish rate-of-decline trajectory.'
      );
    }

    // Deficit Sub-Typing (Amnestic vs Frontal-Retrieval vs Multi-Domain)
    const delayed = this.delayedRecallScore();
    const words = this.sessionState().memoryWords;
    const categoryRestoredCount = words.filter(w => !w.delayedSpontaneous && w.delayedCategoryCued).length;
    let deficitProfile: IMocaSummaryResult['deficitProfile'] = 'NORMAL';

    if (total < 26) {
      if (delayed <= 2 && categoryRestoredCount >= 2) {
        deficitProfile = 'FRONTAL_EXECUTIVE_RETRIEVAL';
        clinicalInterpretation += ' Retrieval deficit pattern: Cued recall significantly improves performance, pointing towards frontal-subcortical or vascular dysregulation rather than primary hippocampal failure.';
      } else if (delayed <= 2 && categoryRestoredCount === 0) {
        deficitProfile = 'AMNESTIC_HIPPOCAMPAL';
        clinicalInterpretation += ' Amnestic encoding deficit pattern: Failure of both spontaneous and category-cued recall, highly characteristic of early Alzheimer-type hippocampal consolidation impairment.';
      } else {
        deficitProfile = 'MULTI_DOMAIN';
      }
    }

    const domainBreakdown: IMocaDomainScore[] = [
      { domainId: 'visuospatial_executive', name: 'Visuospatial / Executive', earned: this.visuospatialScore(), max: 5, loincComponentCode: '72171-2' },
      { domainId: 'naming', name: 'Animal Naming', earned: this.namingScore(), max: 3, loincComponentCode: '72170-4' },
      { domainId: 'attention', name: 'Attention & Calculation', earned: this.attentionScore(), max: 6, loincComponentCode: '72169-6' },
      { domainId: 'language', name: 'Language & Fluency', earned: this.languageScore(), max: 3, loincComponentCode: '72168-8' },
      { domainId: 'abstraction', name: 'Abstraction & Similarities', earned: this.abstractionScore(), max: 2, loincComponentCode: '72167-0' },
      { domainId: 'delayed_recall', name: 'Delayed Recall (5 Words)', earned: this.delayedRecallScore(), max: 5, loincComponentCode: '72166-2' },
      { domainId: 'orientation', name: 'Temporal & Spatial Orientation', earned: this.orientationScore(), max: 6, loincComponentCode: '72165-4' }
    ];

    return {
      rawScore: raw,
      educationBonus: bonus,
      totalAdjustedScore: total,
      tier,
      tierLabel,
      tierColor,
      clinicalInterpretation,
      recommendations,
      domainBreakdown,
      deficitProfile
    };
  });

  // =========================================================================
  // DOMAIN 1: VISUOSPATIAL / EXECUTIVE ACTIONS
  // =========================================================================

  public validateTrailMaking(connections: string[]): boolean {
    const expected = ['1', 'A', '2', 'B', '3', 'C', '4', 'D', '5', 'E'];
    if (connections.length < expected.length) return false;
    for (let i = 0; i < expected.length; i++) {
      if (connections[i] !== expected[i]) return false;
    }
    return true;
  }

  public setTrailMakingScore(pass: boolean, canvasData?: string): void {
    this.sessionState.update(s => ({
      ...s,
      trailMakingCompleted: true,
      trailMakingScore: pass ? 1 : 0,
      trailCanvasDataUrl: canvasData || s.trailCanvasDataUrl
    }));
  }

  public setCubeCopyScore(pass: boolean, canvasData?: string): void {
    this.sessionState.update(s => ({
      ...s,
      cubeCopyScore: pass ? 1 : 0,
      cubeCanvasDataUrl: canvasData || s.cubeCanvasDataUrl
    }));
  }

  public setClockScore(criterion: keyof IMocaSessionState['clockScores'], pass: boolean, canvasData?: string): void {
    this.sessionState.update(s => ({
      ...s,
      clockScores: {
        ...s.clockScores,
        [criterion]: pass
      },
      clockCanvasDataUrl: canvasData || s.clockCanvasDataUrl
    }));
  }

  // =========================================================================
  // DOMAIN 2: ANIMAL NAMING ACTIONS
  // =========================================================================

  public setAnimalScore(animal: keyof IMocaSessionState['animalNaming'], pass: boolean): void {
    this.sessionState.update(s => ({
      ...s,
      animalNaming: {
        ...s.animalNaming,
        [animal]: pass
      }
    }));
  }

  // =========================================================================
  // DOMAIN 3 & 7: MEMORY REGISTRATION & DELAYED RECALL ACTIONS
  // =========================================================================

  public toggleMemoryTrialWord(wordIndex: number, trial: 1 | 2): void {
    this.sessionState.update(s => {
      const words = [...s.memoryWords];
      if (words[wordIndex]) {
        if (trial === 1) {
          words[wordIndex].trial1Recalled = !words[wordIndex].trial1Recalled;
        } else {
          words[wordIndex].trial2Recalled = !words[wordIndex].trial2Recalled;
        }
      }
      return { ...s, memoryWords: words };
    });
  }

  public setDelayedRecallSpontaneous(wordIndex: number, pass: boolean): void {
    this.sessionState.update(s => {
      const words = [...s.memoryWords];
      if (words[wordIndex]) {
        words[wordIndex].delayedSpontaneous = pass;
      }
      return { ...s, memoryWords: words };
    });
  }

  public setDelayedCategoryCued(wordIndex: number, pass: boolean): void {
    this.sessionState.update(s => {
      const words = [...s.memoryWords];
      if (words[wordIndex]) {
        words[wordIndex].delayedCategoryCued = pass;
      }
      return { ...s, memoryWords: words };
    });
  }

  public setDelayedChoiceCued(wordIndex: number, pass: boolean): void {
    this.sessionState.update(s => {
      const words = [...s.memoryWords];
      if (words[wordIndex]) {
        words[wordIndex].delayedChoiceCued = pass;
      }
      return { ...s, memoryWords: words };
    });
  }

  // =========================================================================
  // DOMAIN 4: ATTENTION & 1 HZ VIGILANCE ACTIONS
  // =========================================================================

  public setDigitSpan(type: 'forward' | 'backward', pass: boolean): void {
    this.sessionState.update(s => ({
      ...s,
      attention: {
        ...s.attention,
        [type === 'forward' ? 'digitSpanForward' : 'digitSpanBackward']: pass
      }
    }));
  }

  public startVigilanceTest(): void {
    if (this.isVigilanceRunning()) return;
    this.stopVigilanceTest();

    this.isVigilanceRunning.set(true);
    this.currentVigilanceIndex.set(0);
    this.hasTappedForCurrentLetter = false;

    // Reset vigilance counters
    this.sessionState.update(s => ({
      ...s,
      attention: {
        ...s.attention,
        vigilanceOmissions: 0,
        vigilanceCommissions: 0,
        vigilanceTapping: false
      }
    }));

    this.playLetterTone();

    this.vigilanceTimer = setInterval(() => {
      // Check if previous letter was 'A' and wasn't tapped (omission)
      const prevIdx = this.currentVigilanceIndex();
      if (prevIdx >= 0 && prevIdx < VIGILANCE_LETTER_SEQUENCE.length) {
        const prevLetter = VIGILANCE_LETTER_SEQUENCE[prevIdx];
        if (prevLetter === 'A' && !this.hasTappedForCurrentLetter) {
          this.recordVigilanceOmission();
        }
      }

      const nextIdx = prevIdx + 1;
      if (nextIdx >= VIGILANCE_LETTER_SEQUENCE.length) {
        this.stopVigilanceTest();
        return;
      }

      this.currentVigilanceIndex.set(nextIdx);
      this.hasTappedForCurrentLetter = false;
      this.playLetterTone();
    }, 1000);
  }

  public stopVigilanceTest(): void {
    if (this.vigilanceTimer) {
      clearInterval(this.vigilanceTimer);
      this.vigilanceTimer = null;
    }
    this.isVigilanceRunning.set(false);
    this.currentVigilanceIndex.set(-1);

    // Compute final vigilance score (1 pt if errors <= 1)
    const att = this.sessionState().attention;
    const totalErrors = att.vigilanceOmissions + att.vigilanceCommissions;
    this.sessionState.update(s => ({
      ...s,
      attention: {
        ...s.attention,
        vigilanceTapping: totalErrors <= 1
      }
    }));
  }

  public registerVigilanceTap(): void {
    if (!this.isVigilanceRunning()) return;
    const currentIdx = this.currentVigilanceIndex();
    if (currentIdx < 0 || currentIdx >= VIGILANCE_LETTER_SEQUENCE.length) return;

    const letter = VIGILANCE_LETTER_SEQUENCE[currentIdx];
    this.hasTappedForCurrentLetter = true;

    if (letter === 'A') {
      // Correct Hit
      this.playAudioFeedback(660, 0.08); // pleasant high chime
    } else {
      // False Alarm (Commission)
      this.playAudioFeedback(220, 0.15); // low buzz
      this.sessionState.update(s => ({
        ...s,
        attention: {
          ...s.attention,
          vigilanceCommissions: s.attention.vigilanceCommissions + 1
        }
      }));
    }
  }

  private recordVigilanceOmission(): void {
    this.sessionState.update(s => ({
      ...s,
      attention: {
        ...s.attention,
        vigilanceOmissions: s.attention.vigilanceOmissions + 1
      }
    }));
  }

  public setSerial7Score(correctSubtractionsCount: number): void {
    const count = Math.max(0, Math.min(5, correctSubtractionsCount));
    let score = 0;
    if (count >= 4) score = 3;
    else if (count >= 2) score = 2;
    else if (count === 1) score = 1;

    this.sessionState.update(s => ({
      ...s,
      attention: {
        ...s.attention,
        serial7CorrectCount: count,
        serial7Score: score
      }
    }));
  }

  // =========================================================================
  // DOMAIN 5: LANGUAGE & 60s FLUENCY ACTIONS
  // =========================================================================

  public setSentenceRepetition(sentence: 1 | 2, pass: boolean): void {
    this.sessionState.update(s => ({
      ...s,
      language: {
        ...s.language,
        [sentence === 1 ? 'sentence1' : 'sentence2']: pass
      }
    }));
  }

  public startFluencyTest(): void {
    if (this.isFluencyRunning()) return;
    this.stopFluencyTest();

    this.isFluencyRunning.set(true);
    this.fluencySecondsRemaining.set(60);

    // Start speech recognition if available
    this.startSpeechListening();

    this.fluencyTimer = setInterval(() => {
      const remaining = this.fluencySecondsRemaining() - 1;
      if (remaining <= 0) {
        this.stopFluencyTest();
        this.playAudioFeedback(880, 0.4); // Completion gong
      } else {
        this.fluencySecondsRemaining.set(remaining);
      }
    }, 1000);
  }

  public stopFluencyTest(): void {
    if (this.fluencyTimer) {
      clearInterval(this.fluencyTimer);
      this.fluencyTimer = null;
    }
    this.isFluencyRunning.set(false);
    this.stopSpeechListening();

    // Score fluency: >= 11 words = 1 pt
    const count = this.sessionState().language.fluencyCount;
    this.sessionState.update(s => ({
      ...s,
      language: {
        ...s.language,
        fluencyPassed: count >= 11
      }
    }));
  }

  public addFluencyWord(rawWord: string): void {
    const cleaned = rawWord.trim().toLowerCase();
    if (!cleaned) return;

    this.sessionState.update(s => {
      const existing = s.language.fluencyWords;
      if (existing.includes(cleaned)) return s; // Deduplicate

      const words = [...existing, cleaned];
      const count = words.length;
      return {
        ...s,
        language: {
          ...s.language,
          fluencyWords: words,
          fluencyCount: count,
          fluencyPassed: count >= 11
        }
      };
    });
  }

  public removeFluencyWord(index: number): void {
    this.sessionState.update(s => {
      const words = s.language.fluencyWords.filter((_, i) => i !== index);
      const count = words.length;
      return {
        ...s,
        language: {
          ...s.language,
          fluencyWords: words,
          fluencyCount: count,
          fluencyPassed: count >= 11
        }
      };
    });
  }

  // =========================================================================
  // DOMAIN 6: ABSTRACTION ACTIONS
  // =========================================================================

  public setAbstractionScore(pair: 'trainBicycle' | 'watchRuler', pass: boolean): void {
    this.sessionState.update(s => ({
      ...s,
      abstraction: {
        ...s.abstraction,
        [pair]: pass
      }
    }));
  }

  // =========================================================================
  // DOMAIN 8: ORIENTATION ACTIONS
  // =========================================================================

  public setOrientationScore(item: keyof IMocaSessionState['orientation'], pass: boolean): void {
    this.sessionState.update(s => ({
      ...s,
      orientation: {
        ...s.orientation,
        [item]: pass
      }
    }));
  }

  public setEducationYears(years: number): void {
    this.sessionState.update(s => ({
      ...s,
      educationYears: Math.max(0, Math.min(30, years))
    }));
  }

  // =========================================================================
  // AUDIO & SPEECH SYNTHESIS ENGINE
  // =========================================================================

  public speakText(text: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }

  private playLetterTone(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // AudioContext unavailable or restricted by browser policy
    }
  }

  private playAudioFeedback(freq: number, duration: number): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext fallback
    }
  }

  private initSpeechRecognition(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        this.speechRecognition = new SpeechRec();
        this.speechRecognition.continuous = true;
        this.speechRecognition.interimResults = false;
        this.speechRecognition.lang = 'en-US';

        this.speechRecognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              const transcript = event.results[i][0].transcript;
              const words = transcript.split(/\s+/);
              for (const w of words) {
                const cleaned = w.replace(/[^a-zA-Z]/g, '').toLowerCase();
                if (cleaned.startsWith('f') && cleaned.length > 1) {
                  this.addFluencyWord(cleaned);
                }
              }
            }
          }
        };
      } catch {
        this.speechRecognition = null;
      }
    }
  }

  private startSpeechListening(): void {
    if (this.speechRecognition) {
      try {
        this.speechRecognition.start();
      } catch {
        // Already started
      }
    }
  }

  private stopSpeechListening(): void {
    if (this.speechRecognition) {
      try {
        this.speechRecognition.stop();
      } catch {
        // Already stopped
      }
    }
  }

  // =========================================================================
  // FHIR R4 BUNDLE & EHR EXPORT
  // =========================================================================

  public generateFhirR4Bundle(): IFhirMocaBundle {
    const summary = this.summaryResult();
    const session = this.sessionState();
    const now = new Date().toISOString();
    const patientId = session.patientId || 'patient-default';

    const observation: IFhirMocaObservation = {
      resourceType: 'Observation',
      id: `moca-obs-${Date.now()}`,
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'survey',
              display: 'Survey'
            }
          ]
        },
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'exam',
              display: 'Exam'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '72106-8',
            display: 'Montreal Cognitive Assessment [MoCA]'
          },
          {
            system: 'http://loinc.org',
            code: '72172-0',
            display: 'Montreal Cognitive Assessment total score [MoCA]'
          }
        ],
        text: 'Montreal Cognitive Assessment 30-Point Standard Battery'
      },
      subject: {
        reference: `Patient/${patientId}`,
        display: session.patientName
      },
      effectiveDateTime: now,
      performer: [
        {
          display: `${session.examinerName} (Cert ID: ${session.examinerCertificationId || 'N/A'})`
        }
      ],
      valueInteger: summary.totalAdjustedScore,
      interpretation: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
              code: summary.tier === 'NORMAL' ? 'N' : (summary.tier === 'MILD_COGNITIVE_IMPAIRMENT' ? 'A' : 'AA'),
              display: summary.tierLabel
            }
          ],
          text: summary.tierLabel
        }
      ],
      note: [
        {
          text: `Raw Score: ${summary.rawScore}/30. Education Bonus: +${summary.educationBonus} (Years of Education: ${session.educationYears}). Final Score: ${summary.totalAdjustedScore}/30.`
        },
        {
          text: summary.clinicalInterpretation
        },
        {
          text: `Cognitive Deficit Phenotype: ${summary.deficitProfile}.`
        }
      ],
      component: summary.domainBreakdown.map(d => ({
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: d.loincComponentCode || '72106-8',
              display: d.name
            }
          ],
          text: d.name
        },
        valueInteger: d.earned
      }))
    };

    const questionnaireResponse: Record<string, any> = {
      resourceType: 'QuestionnaireResponse',
      id: `moca-qr-${Date.now()}`,
      status: 'completed',
      questionnaire: 'http://loinc.org/q/72106-8',
      subject: {
        reference: `Patient/${patientId}`
      },
      authored: now,
      item: summary.domainBreakdown.map(d => ({
        linkId: d.domainId,
        text: d.name,
        answer: [
          {
            valueInteger: d.earned
          }
        ]
      }))
    };

    return {
      resourceType: 'Bundle',
      id: `bundle-moca-${Date.now()}`,
      type: 'collection',
      timestamp: now,
      entry: [
        {
          fullUrl: `urn:uuid:${observation.id}`,
          resource: observation
        },
        {
          fullUrl: `urn:uuid:${questionnaireResponse.id}`,
          resource: questionnaireResponse
        }
      ]
    };
  }

  // =========================================================================
  // COMMIT TO PATIENT MEDICAL CHART
  // =========================================================================

  public commitToPatientChart(): void {
    const summary = this.summaryResult();
    const session = this.sessionState();

    // 1. Append clinical note to PatientStateService
    if (this.patientState) {
      const noteText = `[MONTREAL COGNITIVE ASSESSMENT (MoCA 30-POINT BATTERY)]\n` +
        `Date: ${new Date().toLocaleDateString()} | Total Adjusted Score: ${summary.totalAdjustedScore}/30 (Raw: ${summary.rawScore}, Edu Bonus: +${summary.educationBonus})\n` +
        `Stratification: ${summary.tierLabel} (${summary.deficitProfile})\n` +
        `Domain Breakdown:\n` +
        summary.domainBreakdown.map(d => ` • ${d.name}: ${d.earned}/${d.max}`).join('\n') +
        `\nClinical Impression: ${summary.clinicalInterpretation}\n` +
        `Recommendations:\n` +
        summary.recommendations.map(r => ` - ${r}`).join('\n');

      this.patientState.addClinicalNote({
        id: `note_moca_${Date.now()}`,
        text: noteText,
        sourceLens: 'Neurological Cognitive Screen',
        date: new Date().toISOString()
      });
    }

    // 2. Append history entry to selected patient
    const patient = this.patientMgmt?.selectedPatient?.();
    if (patient && this.storage) {
      const historyEntry: HistoryEntry = {
        type: 'ClinicalAssessment_MOCA' as any,
        date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
        summary: `MoCA 30-Point Battery Completed (Score: ${summary.totalAdjustedScore}/30 — ${summary.tierLabel})`,
        report: {
          totalScore: summary.totalAdjustedScore,
          rawScore: summary.rawScore,
          tier: summary.tierLabel,
          domainBreakdown: summary.domainBreakdown
        } as any
      };

      const cleaned = patient.history.filter((h: any) => h.type !== 'ClinicalAssessment_MOCA');
      patient.history = [...cleaned, historyEntry];
      this.storage.savePatient(patient);
    }
  }
}
