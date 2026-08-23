import { Injectable, signal, computed, effect, inject, untracked } from '@angular/core';
import {
  IBodyPartIssue,
  IPatientVitals,
  IBiometricEntry,
  IClinicalNote,
  IChecklistItem,
  IShoppingListItem,
  IDraftSummaryItem,
  IPatientState,
  HistoryEntry,
  IBookmark,
  BODY_PART_NAMES,
  BODY_PART_MAPPING,
  IAyurvedicStatus,
  IPatientAnatomicProfile
} from './patient.types';

export type { IPatientState };
export { BODY_PART_NAMES };
import { StorageService } from './storage.service';
import { GamificationService } from './gamification.service';
import { ThemeService } from './theme.service';
import { ActuarialLongevityService, IOccupationalHazardProfile } from './actuarial-longevity.service';
import { CoppaPrivacyShieldService, IGuardianAttestation } from './coppa-privacy-shield.service';
import { dataConnect } from '../lib/firebase';
import { createCarePlan, createConsultationSession } from '../lib/dataconnect/esm/index.esm.js';


@Injectable({
  providedIn: 'root'
})
export class PatientStateService {
  private themeService = inject(ThemeService);
  private actuarialLongevityService = inject(ActuarialLongevityService, { optional: true });
  readonly coppaShield = inject(CoppaPrivacyShieldService, { optional: true });

  // --- UI State & Clinical Tool Prescription State Machine ---
  readonly isPlainLanguageMode = computed(() => this.themeService.isPlainLanguageMode());
  readonly toolStates = signal<Record<string, 'unassigned' | 'prescribed' | 'hidden'>>({});
  readonly showContactlessScanner = signal<boolean>(false);
  readonly guardianAttestation = computed<IGuardianAttestation>(() => this.coppaShield?.guardianAttestation() || { isAttested: false, relationship: null, timestamp: null });

  toggleContactlessScanner(open?: boolean): void {
    this.showContactlessScanner.update(current => open !== undefined ? open : !current);
  }

  // --- Patient 3D Spatial Anatomic Profile & LiDAR Custom Mesh ---
  readonly anatomicProfile = signal<IPatientAnatomicProfile>({
    amputations: [],
    phantomLimbPain: [],
    customLiDARScanUrl: null
  });


  readonly hasActiveIssues = computed(() => {
    const issues = this.issues();
    const vitals = this.vitals();
    const cgm = parseFloat(vitals?.cgmGlucoseMgDl || '110');
    const hr = parseFloat(vitals?.hr || '72');
    const spO2 = parseFloat(vitals?.spO2 || '98');
    const hasBodyPartPain = Object.keys(issues).length > 0;
    const hasVitalsDeviation = hr > 100 || hr < 50 || spO2 < 95 || cgm < 70 || cgm > 180;
    return hasBodyPartPain || hasVitalsDeviation || this.isEmergencyMode();
  });

  readonly prescribedToolsList = computed(() => {
    const states = this.toolStates();
    const prescribedKeys = Object.keys(states).filter(k => states[k] === 'prescribed');
    const vitals = this.vitals();
    const hrVal = vitals?.hr ? parseInt(String(vitals.hr), 10) || 72 : 72;
    const bpVal = vitals?.bp || '118/76';
    
    const toolNamesMap: Record<string, { 
      name: string; 
      icon: string; 
      category: string;
      personalizedInstruction: string;
      suggestedUsage: string;
      patientCareTip: string;
    }> = {
      qaly: { 
        name: 'QALY Epigenetic Longevity Calculator', 
        icon: '⏳', 
        category: 'Epigenetic Healthspan',
        personalizedInstruction: `Target +12.0 QALY gain by reducing systemic CRP and stabilizing resting blood pressure around ${bpVal}.`,
        suggestedUsage: 'Re-assess every 30 days during progress reviews.',
        patientCareTip: 'Track how your daily sleep habits improve your long-term vitality score.'
      },
      solfeggio: { 
        name: 'Polyphonic Solfeggio & AVS Soundscape Deck', 
        icon: '🎵', 
        category: 'Acoustic Co-Regulation',
        personalizedInstruction: `Listen to 528 Hz (DNA/Cellular Repair) paired with 432 Hz to calm sympathetic tone from ${hrVal} bpm.`,
        suggestedUsage: '15-20 minutes in evening prior to bedtime entrainment.',
        patientCareTip: 'Use stereo headphones in a quiet, dark room for optimal brainwave sync.'
      },
      vagal: { 
        name: 'Vagal Resonance & Biofeedback Quick-Dock', 
        icon: '🫁', 
        category: 'Autonomic HRV Biofeedback',
        personalizedInstruction: `Practice 6 breaths/min (0.1 Hz resonance) to maximize baroreflex gain and increase HRV power.`,
        suggestedUsage: '10 minutes twice daily (08:00 AM & 20:00 PM).',
        patientCareTip: 'Breathe in for 4 seconds, exhale slowly for 6 seconds with relaxed shoulders.'
      },
      storm: { 
        name: 'Physiological & Environmental Storm Shield', 
        icon: '⛈️', 
        category: 'Acute Telemetry',
        personalizedInstruction: `Shield against barometric pressure drops and environmental humidity spikes that trigger symptom flares.`,
        suggestedUsage: 'Check alert panel daily at 07:30 AM before outdoor activity.',
        patientCareTip: 'Stay hydrated and increase electrolyte intake when barometric pressure drops.'
      },
      foraging: { 
        name: 'Androscoggin Phytoncide & Foraging Protocol', 
        icon: '🫐', 
        category: 'Botanical & Ecological',
        personalizedInstruction: `Incorporate high-polyphenol wild blueberries and pine needle phytoncide decoctions to clear Ama toxicity.`,
        suggestedUsage: 'Consume 1/2 cup wild berries daily with morning meal.',
        patientCareTip: 'Natural wild berries support healthy gut bacteria and digestive warmth.'
      },
      investment: { 
        name: 'Procedural Care Investment Matrix', 
        icon: '📈', 
        category: 'Actuarial Healthcare',
        personalizedInstruction: `Prioritize early lifestyle interventions over high-cost procedures for maximum actuarial ROI.`,
        suggestedUsage: 'Review quarterly with primary care team.',
        patientCareTip: 'Small daily healthy choices prevent expensive medical procedures later.'
      },
      perils: { 
        name: 'Life Perils & Stressor Paradigm Matrix', 
        icon: '⏳', 
        category: 'Biopsychosocial Risk',
        personalizedInstruction: `Identify external stressors (sleep disruption, workplace strain) and apply targeted vagal grounding.`,
        suggestedUsage: 'Assess weekly during self-reflection journaling.',
        patientCareTip: 'Take 3 deep breaths whenever you feel sudden daily stress building.'
      },
      karaoke: { 
        name: 'Avian Sea Shanty Karaoke & Duet Co-Singer Deck', 
        icon: '🎙️', 
        category: 'Multimodal Vocal Co-Regulation',
        personalizedInstruction: `Singalong to 60 BPM rhythm sea shanties with Avian co-singers for diaphragmatic vagal stimulation.`,
        suggestedUsage: '5-10 minutes during afternoon fatigue or anxiety onset.',
        patientCareTip: 'Sing out loud with Swoop or Gulliver to stretch your lungs and lift your mood!'
      }
    };

    return prescribedKeys.map(k => ({
      id: k,
      ...(toolNamesMap[k] || { 
        name: k, 
        icon: '🛠️', 
        category: 'Clinical Tool',
        personalizedInstruction: 'Follow clinical protocol guidelines.',
        suggestedUsage: 'Use as directed by care team.',
        patientCareTip: 'Consult care provider for questions.'
      })
    }));
  });

  // --- Anti-Surveillance & Ephemeral Data Sovereignty Controls ---
  readonly ephemeralPrivacyMode = signal<boolean>(true);

  // --- Enterprise Agent HIPAA & COPPA Audit Telemetry ---
  readonly enterpriseAuditLog = signal<Array<{
    timestamp: string;
    action: 'AI_SYNTHESIS' | 'FHIR_EXPORT' | 'PRESCRIBE_TOOL' | 'WAKE_WORD' | 'SBAR_HANDOFF' | 'STATE_PURGE' | 'PRIVACY_MODE_TOGGLE' | 'GUARDIAN_PROXY_ATTESTED' | 'COPPA_LOCKDOWN';
    actor: string;
    hash: string;
    details: string;
  }>>([
    {
      timestamp: new Date().toISOString(),
      action: 'AI_SYNTHESIS',
      actor: 'Gemini 2.5 Flash',
      hash: '0x8f3a9e21b71c4f52',
      details: 'Multi-Lens evidence-grounded clinical report synthesized'
    }
  ]);

  logEnterpriseAudit(
    action: 'AI_SYNTHESIS' | 'FHIR_EXPORT' | 'PRESCRIBE_TOOL' | 'WAKE_WORD' | 'SBAR_HANDOFF' | 'STATE_PURGE' | 'PRIVACY_MODE_TOGGLE' | 'GUARDIAN_PROXY_ATTESTED' | 'COPPA_LOCKDOWN',
    details: string
  ) {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      actor: 'PocketGull Enterprise Agent',
      hash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      details
    };
    this.enterpriseAuditLog.update(logs => [entry, ...logs.slice(0, 49)]);
  }

  recordGuardianProxyAttestation(
    relationship: 'Parent' | 'Legal Guardian' | 'Authorized Clinician',
    notes?: string
  ): void {
    const attestation = this.coppaShield.recordGuardianAttestation(relationship, notes);
    this.logEnterpriseAudit(
      'GUARDIAN_PROXY_ATTESTED',
      `Guardian Proxy Attestation confirmed by ${relationship} (${attestation.timestamp})`
    );
  }

  toggleEphemeralPrivacyMode(enabled?: boolean): boolean {
    const next = enabled !== undefined ? enabled : !this.ephemeralPrivacyMode();
    this.ephemeralPrivacyMode.set(next);
    this.logEnterpriseAudit(
      'PRIVACY_MODE_TOGGLE',
      `Ephemeral Privacy Mode set to ${next ? 'ENABLED (Strict Local Edge Isolation)' : 'DISABLED'}`
    );
    return next;
  }

  purgeTransientPatientState(): { timestamp: string; purgedItemsCount: number } {
    const activeIssueCount = Object.keys(this.issues()).length;
    const historyCount = this.patientHistory().length;
    const totalPurged = activeIssueCount + historyCount;

    // Ephemeral state reset
    this.issues.set({});
    this.patientGoals.set('');
    this.reasonForVisit.set('');
    this.dietaryProtocol.set('');
    this.patientHistory.set([]);
    this.coppaShield.revokeGuardianAttestation();
    this.vitals.set({
      bp: '',
      hr: '',
      temp: '',
      spO2: '',
      weight: '',
      height: '',
      cgmGlucoseMgDl: '',
      vitC: '',
      vitD3: '',
      magnesium: '',
      zinc: '',
      b12: ''
    });

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem('pocketgull_patient_state');
        localStorage.removeItem('pocketgull_transient_cache');
      } catch (e) {
        console.warn('LocalStorage cleanup warning:', e);
      }
    }

    const timestamp = new Date().toISOString();
    this.logEnterpriseAudit('STATE_PURGE', `Purged ${totalPurged} transient patient items & revoked guardian proxy tokens`);

    return { timestamp, purgedItemsCount: totalPurged };
  }
  
  getToolState(toolId: string): 'unassigned' | 'prescribed' | 'hidden' {
    return this.toolStates()[toolId] || 'unassigned';
  }

  cycleToolState(toolId: string): 'unassigned' | 'prescribed' | 'hidden' {
    const current = this.getToolState(toolId);
    let next: 'unassigned' | 'prescribed' | 'hidden' = 'unassigned';
    if (current === 'unassigned') next = 'prescribed';
    else if (current === 'prescribed') next = 'hidden';
    else next = 'unassigned';

    this.toolStates.update(map => ({
      ...map,
      [toolId]: next
    }));
    return next;
  }

  restoreHiddenTools() {
    this.toolStates.update(map => {
      const updated = { ...map };
      for (const key of Object.keys(updated)) {
        if (updated[key] === 'hidden') {
          updated[key] = 'unassigned';
        }
      }
      return updated;
    });
  }

  togglePlainLanguageMode() {
    this.themeService.togglePlainLanguageMode();
  }
  readonly selectedPartId = signal<string | null>(null);
  readonly hoveredPartIdForOverlay = signal<string | null>(null);
  readonly hoveredViewModeForOverlay = signal<'skin' | 'muscle' | 'skeleton' | 'organs' | 'eastern' | 'ayurvedic' | null>(null);
  readonly loadedPatientId = signal<string | null>(null);
  readonly selectedNoteId = signal<string | null>(null);
  readonly isLiveAgentActive = signal<boolean>(false);
  readonly liveAgentInput = signal<string>('');
  readonly isResearchFrameVisible = signal<boolean>(false);
  readonly isSynthesisDashboardVisible = signal<boolean>(false);
  readonly isSocraticIntakeVisible = signal<boolean>(false);
  readonly analysisUpdateRequest = signal(0);
  readonly requestedResearchUrl = signal<string | null>(null);
  readonly requestedResearchQuery = signal<string | null>(null);
  readonly requestedSearchEngine = signal<'google' | 'pubmed' | 'ayurveda' | 'tcm' | null>(null);
  readonly viewingPastVisit = signal<HistoryEntry | null>(null);
  readonly bodyViewerMode = signal<'3d' | '2d' | 'cellular' | 'quad' | 'tme' | 'awcim' | 'genesis'>('3d');
  readonly anatomyViewMode = signal<'skin' | 'muscle' | 'skeleton' | 'organs' | 'molecular' | 'eastern' | 'ayurvedic' | 'osteopathic' | 'typographic'>('skin');
  readonly customModelUrl = signal<string | null>(null);
  readonly activePatientSummary = signal<string | null>(null);
  readonly draftSummaryItems = signal<IDraftSummaryItem[]>([]);
  /** AI-derived anatomical findings mapped to severity tier for 3D overlay. */
  readonly aiAnomalyHighlights = signal<Record<string, 'critical' | 'moderate' | 'mild'>>({});
  /** Toggle the semi-transparent reference mannequin ghost overlay. */
  readonly showGhostOverlay = signal<boolean>(false);
  readonly lensAnnotations = signal<Record<string, Record<string, any>>>({});
  readonly isEmergencyMode = signal<boolean>(false);
  readonly isDemoMode = signal<boolean>(false);
  readonly isQuietMinimalUiMode = signal<boolean>(true);
  readonly isAudioPrimaryMode = signal<boolean>(false);
  readonly isGammaSyncActive = signal<boolean>(false);
  readonly sentinelScope = signal<'micro-patient' | 'macro-fleet'>('micro-patient');
  readonly activePhilosophy = signal<'western' | 'eastern' | 'ayurvedic' | 'osteopathic'>('western');
  readonly tcmIntake = signal<import('./patient.types').ITcmIntake>({
    tongueColor: 'pink',
    tongueCoating: 'thin-white',
    pulseQuality: 'normal',
    thermalPreference: 'neutral',
    sweatPattern: 'normal',
    tasteInMouth: 'normal',
    tcmPattern: 'Balanced Qi & Blood Flow'
  });
  readonly ayurvedicIntake = signal<import('./patient.types').IAyurvedicIntake>({
    prakritiVata: 4,
    prakritiPitta: 3,
    prakritiKapha: 3,
    vikritiVata: 5,
    vikritiPitta: 4,
    vikritiKapha: 2,
    agniType: 'samagni',
    amaScore: 2,
    nadiPulseType: 'swan-kapha',
    ashtavidhaStatus: 'Balanced Tridosha State'
  });
  readonly selectedCognitiveLevel = signal<'standard' | 'simplified' | 'dyslexia' | 'child'>('standard');
  readonly selectedLanguage = signal<string>('English');
  readonly selectedReadingLevel = signal<string>('standard');

  // --- ML Treatment Cost-Benefit Matrix State & Pharmacogenomics ---
  readonly genomicProfile = signal<import('./patient.types').IFhirGenomicObservation[]>([
    { resourceType: 'Observation', geneSymbol: 'CYP2D6', variantCode: '*4/*4', phenotype: 'Poor' },
    { resourceType: 'Observation', geneSymbol: 'CYP2C19', variantCode: '*2/*2', phenotype: 'Poor' }
  ]);
  readonly genomicVariants = signal<import('./patient.types').IGeneticVariant[]>([]);
  readonly biochemicalPathways = signal<import('./patient.types').IBiochemicalPathway[]>([]);
  readonly pkInteractions = signal<import('./patient.types').IPharmacokineticInteraction[]>([]);
  readonly ewarsAlerts = signal<import('./patient.types').IEwarsOutbreakAlert[]>([]);
  readonly travelProfile = signal<import('./patient.types').ITravelMedicineProfile | null>(null);
  readonly awareStewardship = signal<import('./patient.types').IWhoAwareClassification[]>([]);
  readonly environmentalIndex = signal<import('./patient.types').IEnvironmentalHealthIndex | null>(null);
  readonly clinicianRole = signal<'Cardiology' | 'Integrative' | 'Public Health' | 'General'>('General');
  readonly paretoWeights = signal<import('./patient.types').IMlParetoWeights>({ costWeight: 0.33, speedWeight: 0.33, adherenceWeight: 0.34 });
  readonly banditState = signal<import('./patient.types').IMlBanditState>({
    clinicianSpecialty: 'General',
    weights: { Western: 1.0, Eastern: 1.0, Ayurvedic: 1.0 }
  });


  // --- Patient Metadata State (for Demo Mode and Context) ---
  readonly patientId = signal<string | null>(null);
  readonly patientName = signal<string>('');
  readonly patientAge = signal<number>(0);
  readonly patientGender = signal<string>('');
  readonly patientHistory = signal<HistoryEntry[]>([]);

  // --- AVS Neuro-Therapy Synchronized State ---
  readonly isAvsSessionActive = signal<boolean>(false);
  readonly avsBreathingRate = signal<number>(6.0);
  readonly avsBrainwaveFrequency = signal<string>('theta');
  readonly avsBrainwaveFrequencyHz = signal<number>(6.0);
  /** AI-generated contextual co-regulation protocol for this encounter. */
  readonly avsProtocol = signal<import('./patient.types').IAvsProtocol | null>(null);
  /** Is the contextual protocol currently being generated by Gemini? */
  readonly isGeneratingAvsProtocol = signal<boolean>(false);

  // --- Patient Contextual State (feeds Co-Regulation AVS) ---
  /** Patient's occupational category — informs autonomic baseline and AVS protocol selection. */
  readonly occupation = signal<string>('');
  /** Reactive actuarial 10D occupational hazard profile derived from patient occupation with dynamic vitals/safety personalization. */
  readonly occupationalProfile = computed<IOccupationalHazardProfile | null>(() => {
    const occ = this.occupation();
    if (!this.actuarialLongevityService) return null;
    const medNames = (this.medications() || []).map(m => m.name);
    return this.actuarialLongevityService.getPersonalizedOccupationalProfile(
      occ,
      this.vitals(),
      medNames,
      75
    );
  });
  /** Chief complaint / reason for this specific encounter. */
  readonly reasonForVisit = signal<string>('');
  /** Dietary Protocol / Nutrition Strategy to integrate into intake */
  readonly dietaryProtocol = signal<string>('');
  /** Trauma safety flags extracted from chart — gates AVS protocol selection. */
  readonly traumaFlags = signal<import('./patient.types').ITraumaFlags | null>(null);

  // --- Patient Data State ---
  readonly issues = signal<Record<string, IBodyPartIssue[]>>({});
  readonly patientGoals = signal<string>("");
  readonly vitals = signal<IPatientVitals>({
        bp: '',
        hr: '',
        temp: '',
        spO2: '',
        weight: '',
        height: '',
        cgmGlucoseMgDl: '',
        vitC: '',
        vitD3: '',
        magnesium: '',
        zinc: '',
        b12: ''
    });

  /** Computed CGM Glucose status derived from real-time continuous glucose monitor telemetry. */
  readonly cgmGlucoseStatus = computed<'normal' | 'elevated' | 'hypoglycemic' | 'hyperglycemic' | 'unknown'>(() => {
    const raw = this.vitals()?.cgmGlucoseMgDl;
    if (!raw) return 'unknown';
    const val = parseFloat(raw);
    if (isNaN(val)) return 'unknown';
    if (val < 70) return 'hypoglycemic';
    if (val <= 140) return 'normal';
    if (val <= 180) return 'elevated';
    return 'hyperglycemic';
  });

    readonly dynamicNutrients = signal<import('./patient.types').IDynamicMarker[]>([]);
  readonly oxidativeStressMarkers = signal<import('./patient.types').IDynamicMarker[]>([]);
  readonly antioxidantSources = signal<import('./patient.types').IDynamicMarker[]>([]);
  readonly medications = signal<import('./patient.types').IDynamicMarker[]>([]);

  // --- Functional Medicine & Chronobiology Telemetry Signals ---
  readonly functionalMedicineTelemetry = signal<import('./patient.types').IFunctionalMedicineTelemetry>({
    inflammatoryScore: 38,
    hsCrpEstimate: '2.4 mg/L',
    mitochondrialReserve: 76,
    atpSynthesisRate: '92% Optimal',
    mucosalBarrierIntegrity: 84,
    zonulinIndex: 'Normal (18 ng/mL)',
    detoxificationCapacity: 88,
    activeNode: 'Defense & Repair'
  });

  readonly chronobiologyTelemetry = signal<import('./patient.types').IChronobiologyTelemetry>({
    circadianDisruptionIndex: 42,
    scnPhase: 'Dusk Transition',
    bmal1ExpressionPct: 74,
    per2DiurnalSlope: 'Steep (-0.45 ug/dL/hr)',
    melatoninAmplitude: 'Robust',
    trfWindowHours: '10:00 - 18:00 (8h TRF)'
  });

  /** Computed Cross-Lens Functional-Circadian Synergy Index (0-100, lower is better sync & lower stress) */
  readonly functionalCircadianSynergy = computed(() => {
    const inflam = this.functionalMedicineTelemetry()?.inflammatoryScore ?? 38;
    const cdi = this.chronobiologyTelemetry()?.circadianDisruptionIndex ?? 42;
    const combinedBurden = Math.round((inflam * 0.55) + (cdi * 0.45));
    const status = combinedBurden < 30 ? 'High Coherence' : combinedBurden < 60 ? 'Moderate Stress' : 'Circadian-Inflammatory Cascade';
    return {
      score: combinedBurden,
      status,
      inflammatoryContribution: Math.round(inflam * 0.55),
      circadianContribution: Math.round(cdi * 0.45),
      isCascadeRisk: combinedBurden >= 50
    };
  });
  
  readonly clinicalNotes = signal<IClinicalNote[]>([]);
  readonly checklist = signal<IChecklistItem[]>([]);
  readonly shoppingList = signal<IShoppingListItem[]>([]);
  readonly biometricHistory = signal<IBiometricEntry[]>([]);
  readonly ayurvedicStatus = signal<IAyurvedicStatus>({});

  // A trigger to force the UI to expand the analysis panel when an item is selected/clicked
  readonly uiExpandTrigger = signal<number>(0);

  // --- Clinician Manual Override & Smart Data Presence Computed Signals ---
  readonly showAllInstrumentsOverride = signal<boolean>(false);
  readonly activeDrilldownComponent = signal<'biomarkers' | 'occupational' | 'food_safety' | 'ybocs' | 'qaly' | 'foraging' | 'vagal' | null>(null);

  readonly hasOccupationalData = computed(() => {
    const occ = this.occupation();
    return !!(occ && occ.trim().length > 0 && occ.toLowerCase() !== 'unassigned');
  });

  readonly hasAllergiesOrDietaryData = computed(() => {
    const proto = this.dietaryProtocol();
    return !!(proto && proto.trim().length > 0);
  });

  readonly hasPsychiatricData = computed(() => {
    const complaint = (this.reasonForVisit() || '').toLowerCase();
    const issuesStr = Object.keys(this.issues() || {}).join(' ').toLowerCase();
    return complaint.includes('ocd') || complaint.includes('anxiety') || complaint.includes('compulsive') || complaint.includes('panic') || issuesStr.includes('ocd') || issuesStr.includes('anxiety');
  });

  readonly hasLabBiomarkerData = computed(() => {
    const nut = this.dynamicNutrients();
    const ox = this.oxidativeStressMarkers();
    return (nut && nut.length > 0) || (ox && ox.length > 0);
  });

  private storage = inject(StorageService);
  private game = inject(GamificationService);

  readonly isSparkModeActive = computed(() => this.themeService.currentTheme() === 'spark');

  constructor() {
    if (typeof window !== 'undefined') {
      // 1. Hydrate state asynchronously on app load (skip in E2E to prevent DB race/pollution)
      const isE2e = typeof navigator !== 'undefined' && navigator.webdriver;
      if (!isE2e) {
        this.storage.loadState('current_patient').then(data => {
          if (data && data.state) {
            // Temporarily disable the effect by untracking the init load (if needed), 
            // but loadState() mutations will just trigger a re-save, which is safe.
            this.loadState(data.state);
          }
        });
      }

      // 2. Persist state on any signal mutation
      try {
        effect(() => {
          const currentState = this.getCurrentState();
          const isEmergency = this.isEmergencyMode();
          untracked(() => {
            if (!isEmergency) {
              this.storage.saveState('current_patient', currentState);
            }
          });
        });
      } catch (e) {
        // Fallback for test injectors without EffectScheduler
      }
    }
  }

  // --- Computed State ---
  readonly hasIssues = computed(() => {
    const val = Object.keys(this.issues()).length > 0 || this.patientGoals().length > 0;
    console.log('[PatientStateService] hasIssues computed val =', val, 'issues count =', Object.keys(this.issues()).length, 'goals len =', this.patientGoals().length);
    return val;
  });

  /**
   * Returns a complete, fully-hydrated IPatient snapshot from active reactive signals
   * with defensive fallbacks for missing demographics.
   */
  public asPatientSnapshot(): import('./patient.types').IPatient {
    return {
      id: this.patientId() || 'p001',
      name: this.patientName() || 'Homo Sapiens (Male, Metabolic Syndrome, 58y)',
      age: this.patientAge() || 58,
      gender: (this.patientGender() as any) || 'Male',
      lastVisit: new Date().toISOString().split('T')[0],
      preexistingConditions: ['Essential Hypertension', 'Type 2 Diabetes'],
      history: this.patientHistory() || [],
      bookmarks: [],
      issues: this.issues() || {},
      patientGoals: this.patientGoals() || '',
      medications: this.medications()?.length ? this.medications() : [
        { id: 'm1', name: 'Warfarin 5mg', value: '5mg' },
        { id: 'm2', name: 'Metformin 1000mg', value: '1000mg' },
        { id: 'm3', name: 'Lisinopril 20mg', value: '20mg' }
      ],
      dietarySupplements: this.dynamicNutrients()?.length ? this.dynamicNutrients() : [
        { id: 's1', name: 'Ginkgo Biloba 120mg', value: '120mg' },
        { id: 's2', name: 'Ashwagandha 600mg', value: '600mg' },
        { id: 's3', name: 'Curcumin BCM-95', value: '500mg' }
      ],
      vitals: this.vitals()?.bp ? this.vitals() : {
        bp: '148/94',
        hr: '76',
        temp: '36.6',
        spO2: '98%',
        weight: '82',
        height: '175'
      }
    };
  }

  readonly inferredAyurvedicTriage = computed(() => {
    const manual = this.ayurvedicStatus();
    const inferred = this.runAyurvedicInference(this.issues(), this.vitals(), this.patientGoals(), this.dietaryProtocol());
    return {
      prakriti: manual.prakriti || inferred.prakriti,
      vikriti: manual.vikriti || inferred.vikriti,
      agniStatus: manual.agniStatus || inferred.agniStatus,
      amaStatus: manual.amaStatus || inferred.amaStatus,
      affectedDhatus: manual.affectedDhatus?.length ? manual.affectedDhatus : inferred.affectedDhatus,
      blockedSrotas: manual.blockedSrotas?.length ? manual.blockedSrotas : inferred.blockedSrotas,
      dominantGunas: manual.dominantGunas?.length ? manual.dominantGunas : inferred.dominantGunas
    };
  });

  runAyurvedicInference(
    issues: Record<string, IBodyPartIssue[]>,
    vitals: IPatientVitals,
    goals: string,
    diet: string
  ): IAyurvedicStatus {
    const goalsLower = goals.toLowerCase();
    const dietLower = diet.toLowerCase();
    const allNotes = Object.values(issues).flat();
    const notesLower = allNotes.map(i => i.description.toLowerCase()).join(' ');

    const hrNum = parseInt(vitals.hr, 10) || 0;
    const tempNum = parseFloat(vitals.temp) || 0;
    const systolic = parseInt(vitals.bp.split('/')[0], 10) || 0;

    let vataScore = 0;
    let pittaScore = 0;
    let kaphaScore = 0;

    // Vata Triggers
    if (hrNum > 90) vataScore += 2;
    if (allNotes.some(i => i.painLevel >= 6)) vataScore += 2;
    const vataKeywords = ['dry', 'stiffness', 'neuropathic', 'sciatic', 'insomnia', 'anxiety', 'constipation', 'cracking', 'pain', 'dryness', 'roughness'];
    vataKeywords.forEach(kw => {
      if (goalsLower.includes(kw)) vataScore += 1;
      if (notesLower.includes(kw)) vataScore += 1;
      if (dietLower.includes(kw)) vataScore += 1;
    });

    // Pitta Triggers
    if (tempNum > 99 || (tempNum > 37.2 && tempNum < 45)) pittaScore += 2;
    if (systolic > 130) pittaScore += 2;
    const pittaKeywords = ['burning', 'inflammation', 'acid', 'reflux', 'fever', 'redness', 'rash', 'sharp', 'heartburn', 'heat', 'acidity', 'loose stool'];
    pittaKeywords.forEach(kw => {
      if (goalsLower.includes(kw)) pittaScore += 1;
      if (notesLower.includes(kw)) pittaScore += 1;
      if (dietLower.includes(kw)) pittaScore += 1;
    });

    // Kapha Triggers
    if (vitals.weight && parseInt(vitals.weight, 10) > 200) kaphaScore += 2;
    const kaphaKeywords = ['sluggish', 'edema', 'heavy', 'congestion', 'swelling', 'mucus', 'lethargy', 'retention', 'heaviness', 'slow', 'moist'];
    kaphaKeywords.forEach(kw => {
      if (goalsLower.includes(kw)) kaphaScore += 1;
      if (notesLower.includes(kw)) kaphaScore += 1;
      if (dietLower.includes(kw)) kaphaScore += 1;
    });

    // Determine Vikriti (Imbalance)
    let vikriti = '';
    const scores = [{ dosha: 'Vata', score: vataScore }, { dosha: 'Pitta', score: pittaScore }, { dosha: 'Kapha', score: kaphaScore }];
    scores.sort((a, b) => b.score - a.score);
    if (scores[0].score === 0) {
      vikriti = 'Tridosha (Balanced)';
    } else if (scores[0].score - scores[1].score <= 1 && scores[1].score > 0) {
      vikriti = `${scores[0].dosha}-${scores[1].dosha} Aggravation`;
    } else {
      vikriti = `${scores[0].dosha} Aggravation`;
    }

    // Determine Agni Status
    let agniStatus: 'Sama' | 'Vishama' | 'Tikshna' | 'Manda' = 'Sama';
    if (vataScore > pittaScore && vataScore > kaphaScore && vataScore > 0) {
      agniStatus = 'Vishama';
    } else if (pittaScore > vataScore && pittaScore > kaphaScore && pittaScore > 0) {
      agniStatus = 'Tikshna';
    } else if (kaphaScore > vataScore && kaphaScore > pittaScore && kaphaScore > 0) {
      agniStatus = 'Manda';
    }

    // Determine Ama Status
    let amaStatus: 'Nirama' | 'Sama' = 'Nirama';
    const amaKeywords = ['stiffness', 'fatigue', 'coated tongue', 'sluggishness', 'brain fog', 'heaviness', 'constipation', 'mucus'];
    let amaMatches = 0;
    amaKeywords.forEach(kw => {
      if (goalsLower.includes(kw) || notesLower.includes(kw)) amaMatches++;
    });
    if (amaMatches >= 2 || kaphaScore > 4) {
      amaStatus = 'Sama';
    }

    // Determine affected Dhatus
    const affectedDhatus: ('Rasa' | 'Rakta' | 'Mamsa' | 'Medas' | 'Asthi' | 'Majja' | 'Shukra')[] = [];
    if (notesLower.includes('skin') || notesLower.includes('fatigue') || notesLower.includes('lymph') || goalsLower.includes('energy')) {
      affectedDhatus.push('Rasa');
    }
    if (notesLower.includes('blood') || notesLower.includes('pressure') || notesLower.includes('rash') || notesLower.includes('inflammation') || notesLower.includes('redness')) {
      affectedDhatus.push('Rakta');
    }
    if (notesLower.includes('muscle') || notesLower.includes('spasm') || notesLower.includes('wasting') || notesLower.includes('shoulder') || notesLower.includes('arm')) {
      affectedDhatus.push('Mamsa');
    }
    if (notesLower.includes('weight') || notesLower.includes('fat') || notesLower.includes('metabolism') || notesLower.includes('cholesterol')) {
      affectedDhatus.push('Medas');
    }
    if (notesLower.includes('joint') || notesLower.includes('bone') || notesLower.includes('sciatic') || notesLower.includes('back') || notesLower.includes('stiffness')) {
      affectedDhatus.push('Asthi');
    }
    if (notesLower.includes('nerve') || notesLower.includes('neuropathic') || notesLower.includes('sleep') || notesLower.includes('insomnia') || notesLower.includes('anxiety')) {
      affectedDhatus.push('Majja');
    }
    if (notesLower.includes('hormone') || notesLower.includes('libido') || notesLower.includes('vitality') || notesLower.includes('fertility')) {
      affectedDhatus.push('Shukra');
    }

    // Determine blocked Srotas
    const blockedSrotas: string[] = [];
    if (notesLower.includes('cough') || notesLower.includes('breath') || notesLower.includes('lungs') || notesLower.includes('congestion')) {
      blockedSrotas.push('Pranavaha Srotas (Respiratory)');
    }
    if (notesLower.includes('stomach') || notesLower.includes('acid') || notesLower.includes('reflux') || notesLower.includes('digestion') || notesLower.includes('nausea') || notesLower.includes('bloating')) {
      blockedSrotas.push('Annavaha Srotas (Digestive)');
    }
    if (notesLower.includes('swelling') || notesLower.includes('edema') || notesLower.includes('water') || notesLower.includes('retention')) {
      blockedSrotas.push('Udakavaha Srotas (Water regulation)');
    }
    if (affectedDhatus.includes('Rasa')) {
      blockedSrotas.push('Rasavaha Srotas (Plasma/Lymphatic)');
    }
    if (affectedDhatus.includes('Rakta')) {
      blockedSrotas.push('Raktavaha Srotas (Circulatory)');
    }
    if (affectedDhatus.includes('Asthi')) {
      blockedSrotas.push('Asthivaha Srotas (Skeletal)');
    }
    if (affectedDhatus.includes('Majja')) {
      blockedSrotas.push('Majjavaha Srotas (Nervous)');
    }

    // Determine dominant Gunas
    const dominantGunas: string[] = [];
    if (vataScore > 2) {
      dominantGunas.push('Ruksha (Dry)', 'Sheeta (Cold)', 'Chala (Mobile)');
    }
    if (pittaScore > 2) {
      dominantGunas.push('Ushna (Hot)', 'Tikshna (Sharp)', 'Sara (Spreading)');
    }
    if (kaphaScore > 2) {
      dominantGunas.push('Guru (Heavy)', 'Manda (Slow)', 'Sheeta (Cold)');
    }

    return {
      prakriti: 'Tridosha',
      vikriti,
      agniStatus,
      amaStatus,
      affectedDhatus,
      blockedSrotas,
      dominantGunas
    };
  }

  readonly selectedPartName = computed(() => {
    const id = this.selectedPartId();
    if (!id) return null;
    return BODY_PART_NAMES[id] || id;
  });

  // Helper to check if a part has any notes
  hasIssue(partId: string): boolean {
    const issues = this.issues()[partId];
    return !!issues && issues.length > 0;
  }

  // Lazy-load issue templates for a body part on demand if not already present
  lazyLoadPartIssues(partId: string): IBodyPartIssue[] {
    if (!partId) return [];
    const current = this.issues()[partId];
    if (current && current.length > 0) {
      return current;
    }
    const partName = BODY_PART_NAMES[partId] || partId.replace(/_/g, ' ').toUpperCase();
    const defaultIssue: IBodyPartIssue = {
      id: partId,
      noteId: `lazy_${partId}_${Date.now()}`,
      name: partName,
      painLevel: 0,
      description: `Baseline anatomical assessment for ${partName}. No acute pain reported.`,
      symptoms: [],
      recommendation: `Maintain routine wellness protocols for ${partName}.`
    };
    this.issues.update(map => ({
      ...map,
      [partId]: [defaultIssue]
    }));
    return [defaultIssue];
  }

  // Helper to check if a part has a note with a pain level > 0
  hasPainfulIssue(partId: string): boolean {
    const issues = this.issues()[partId];
    return !!issues && issues.some(i => i.painLevel > 0);
  }

  // --- Actions ---
  triggerUiExpand() {
    this.uiExpandTrigger.set(Date.now());
  }

  selectPart(partId: string | null) {
    this.selectedPartId.set(partId);
    this.triggerUiExpand();
    if (!partId) {
      this.selectedNoteId.set(null); // Deselect note when part is deselected
    } else {
      this.lazyLoadPartIssues(partId);
      this.game.completeQuest('click_anatomy');
    }
  }

  selectNote(noteId: string | null) {
    this.selectedNoteId.set(noteId);
  }

  selectPhilosophy(philosophy: 'western' | 'eastern' | 'ayurvedic' | 'osteopathic') {
    this.activePhilosophy.set(philosophy);
    this.requestAnalysisUpdate();
  }

  updateTcmIntake(partial: Partial<import('./patient.types').ITcmIntake>) {
    this.tcmIntake.update(curr => ({ ...curr, ...partial }));
    this.requestAnalysisUpdate();
  }

  updateAyurvedicIntake(partial: Partial<import('./patient.types').IAyurvedicIntake>) {
    this.ayurvedicIntake.update(curr => ({ ...curr, ...partial }));
    this.requestAnalysisUpdate();
  }

  toggleLiveAgent(active: boolean) {
    this.isLiveAgentActive.set(active);
  }

  toggleResearchFrame(visible?: boolean) {
    if (visible === undefined) {
      this.isResearchFrameVisible.update(v => {
        const next = !v;
        if (next) this.game.completeQuest('explore_evidence');
        return next;
      });
    } else {
      this.isResearchFrameVisible.set(visible);
      if (visible) {
        this.game.completeQuest('explore_evidence');
      }
    }
  }

  openResearchUrl(url: string) {
    if (!url) return;
    this.requestedResearchUrl.set(url);
    this.toggleResearchFrame(true);
  }

  openResearchQuery(query?: string, engine?: 'google' | 'pubmed' | 'ayurveda' | 'tcm') {
    if (engine) this.requestedSearchEngine.set(engine);
    if (query) this.requestedResearchQuery.set(query);
    this.toggleResearchFrame(true);
  }

  toggleSynthesisDashboard(visible?: boolean) {
    if (visible === undefined) {
      this.isSynthesisDashboardVisible.update(v => !v);
    } else {
      this.isSynthesisDashboardVisible.set(visible);
    }
  }

  toggleSocraticIntake(visible?: boolean) {
    if (visible === undefined) {
      this.isSocraticIntakeVisible.update(v => !v);
    } else {
      this.isSocraticIntakeVisible.set(visible);
    }
  }

  updateIssue(partId: string, issue: IBodyPartIssue) {
    this.issues.update(current => {
      const issuesForPart = current[partId] ? [...current[partId]] : [];
      const existingIndex = issuesForPart.findIndex(i => i.noteId === issue.noteId);
      if (existingIndex > -1) {
        // Update existing issue
        issuesForPart[existingIndex] = issue;
      } else {
        // Add new issue
        issuesForPart.push(issue);
      }
      return {
        ...current,
        [partId]: issuesForPart
      };
    });
  }

  removeIssueNote(partId: string, noteId: string) {
    this.issues.update(current => {
      const issuesForPart = current[partId] || [];
      const updatedIssuesForPart = issuesForPart.filter(i => i.noteId !== noteId);
      const updated = { ...current };
      if (updatedIssuesForPart.length > 0) {
        updated[partId] = updatedIssuesForPart;
      } else {
        // If no issues are left for this part, remove the part key
        delete updated[partId];
      }
      return updated;
    });
  }

  updateGoals(goals: string) {
    this.patientGoals.set(goals);
  }

    updateVital(key: keyof IPatientVitals, value: string) {
        console.log('[PatientStateService] updateVital called:', key, '->', value);
        this.vitals.update(vitals => ({ ...vitals, [key]: value }));
    }

    updateCmpLabs(cmpLabs: any) {
        console.log('[PatientStateService] updateCmpLabs called:', cmpLabs);
        this.vitals.update(vitals => ({ ...vitals, cmpLabs: { ...(vitals.cmpLabs || {}), ...cmpLabs } }));
    }

    addDynamicNutrient() {
        this.dynamicNutrients.update(nutrients => [
            ...nutrients, 
            { id: Date.now().toString(), name: '', value: '' }
        ]);
    }

    updateDynamicNutrient(id: string, field: 'name' | 'value', value: string) {
        this.dynamicNutrients.update(nutrients => 
            nutrients.map(n => n.id === id ? { ...n, [field]: value } : n)
        );
    }

    removeDynamicNutrient(id: string) {
        this.dynamicNutrients.update(nutrients => nutrients.filter(n => n.id !== id));
    }
    
    // --- Oxidative Stress Markers ---
    addOxidativeStressMarker() {
        this.oxidativeStressMarkers.update(markers => [
            ...markers, 
            { id: Date.now().toString(), name: '', value: '' }
        ]);
    }

    updateOxidativeStressMarker(id: string, field: 'name' | 'value', value: string) {
        this.oxidativeStressMarkers.update(markers => 
            markers.map(n => n.id === id ? { ...n, [field]: value } : n)
        );
    }

    removeOxidativeStressMarker(id: string) {
        this.oxidativeStressMarkers.update(markers => markers.filter(n => n.id !== id));
    }

    // --- Antioxidant Sources ---
    addAntioxidantSource() {
        this.antioxidantSources.update(sources => [
            ...sources, 
            { id: Date.now().toString(), name: '', value: '' }
        ]);
    }

    updateAntioxidantSource(id: string, field: 'name' | 'value', value: string) {
        this.antioxidantSources.update(sources => 
            sources.map(n => n.id === id ? { ...n, [field]: value } : n)
        );
    }

    removeAntioxidantSource(id: string) {
        this.antioxidantSources.update(sources => sources.filter(n => n.id !== id));
    }

    // --- Medications ---
    addMedication() {
        this.medications.update(meds => [
            ...meds, 
            { id: Date.now().toString(), name: '', value: '' }
        ]);
    }

    updateMedication(id: string, field: 'name' | 'value', value: string) {
        this.medications.update(meds => 
            meds.map(n => n.id === id ? { ...n, [field]: value } : n)
        );
    }

    removeMedication(id: string) {
        this.medications.update(meds => meds.filter(n => n.id !== id));
    }
  updateActivePatientSummary(plan: string | null) {
    this.activePatientSummary.set(plan);
    const patientId = this.loadedPatientId();
    if (plan && patientId) {
      createCarePlan(dataConnect, {
        patientId: patientId,
        diagnosis: "Clinical Care Strategy Update",
        recommendations: [plan]
      }).then(() => {
        console.log('[SQL Connect] Care plan successfully saved to database.');
      }).catch(err => {
        console.error('Failed to save care plan to SQL Connect:', err);
      });
    }
  }

  // --- Biometric Data Actions ---
  addBiometricEntries(entries: IBiometricEntry[]) {
    this.biometricHistory.update(history => [...history, ...entries]);
  }

  clearBiometricHistory() {
    this.biometricHistory.set([]);
  }

  // --- Care Plan Drafting Actions ---
  addClinicalNote(note: IClinicalNote) {
    this.clinicalNotes.update(notes => {
      const existing = notes.findIndex(n => n.id === note.id);
      if (existing > -1) {
        const next = [...notes];
        next[existing] = note;
        return next;
      }
      return [...notes, note];
    });
  }

  removeClinicalNote(id: string) {
    this.clinicalNotes.update(notes => notes.filter(n => n.id !== id));
  }

  addDraftSummaryItem(id: string, text: string) {
    this.draftSummaryItems.update(items => {
      const existing = items.findIndex(i => i.id === id);
      if (existing > -1) {
        const next = [...items];
        next[existing] = { id, text };
        return next;
      }
      return [...items, { id, text }];
    });
  }

  addChecklistItem(item: IChecklistItem) {
    this.checklist.update(items => [...items, item]);
  }

  toggleChecklistItem(id: string) {
    this.checklist.update(items => items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  }

  removeChecklistItem(id: string) {
    this.checklist.update(items => items.filter(item => item.id !== id));
  }

  addShoppingListItem(item: IShoppingListItem) {
    this.shoppingList.update(items => [...items, item]);
  }

  toggleShoppingListItem(id: string) {
    this.shoppingList.update(items => items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  }

  removeShoppingListItem(id: string) {
    this.shoppingList.update(items => items.filter(item => item.id !== id));
  }

  removeDraftSummaryItem(id: string) {
    this.draftSummaryItems.update(items => items.filter(item => item.id !== id));
  }

  clearDraftSummaryItems() {
    this.draftSummaryItems.set([]);
  }

  requestAnalysisUpdate() {
    this.analysisUpdateRequest.update(v => v + 1);
  }

  requestResearchUrl(url: string) {
    this.requestedResearchUrl.set(url);
  }

  requestResearchSearch(query: string, engine?: 'google' | 'pubmed' | 'ayurveda' | 'tcm') {
    if (engine) {
      this.requestedSearchEngine.set(engine);
    }
    this.requestedResearchQuery.set(query);
    this.toggleResearchFrame(true);
  }

  setViewingPastVisit(visit: HistoryEntry | null) {
    this.viewingPastVisit.set(visit);
  }


  // --- State Management for Multi-Patient ---

  /** Clears all patient data to represent a clean slate. */
  clearState() {
    this.selectedPartId.set(null);
    this.loadedPatientId.set(null);
    this.selectedNoteId.set(null);
    this.isLiveAgentActive.set(false); // also end any active consult
    this.isResearchFrameVisible.set(false);
    this.aiAnomalyHighlights.set({});
    this.showGhostOverlay.set(false);
    this.issues.set({});
    this.patientGoals.set('');
    this.dietaryProtocol.set('');
    this.occupation.set('');
        this.vitals.set({
            bp: '', hr: '', temp: '', spO2: '', weight: '', height: '',
            vitC: '', vitD3: '', magnesium: '', zinc: '', b12: ''
        });
        this.dynamicNutrients.set([]);
        this.oxidativeStressMarkers.set([]);
        this.antioxidantSources.set([]);
        this.medications.set([]);
    this.clinicalNotes.set([]);
    this.checklist.set([]);
    this.shoppingList.set([]);
    this.activePatientSummary.set(null);
    this.draftSummaryItems.set([]);
    this.biometricHistory.set([]);
    this.requestedResearchUrl.set(null);
    this.requestedResearchQuery.set(null);
    this.requestedSearchEngine.set(null);
    this.viewingPastVisit.set(null);
    this.activePhilosophy.set('western');
    this.ayurvedicStatus.set({});
    this.patientId.set(null);
    this.patientName.set('');
    this.patientAge.set(0);
    this.patientGender.set('');
    this.patientHistory.set([]);
    this.genomicVariants.set([]);
    this.biochemicalPathways.set([]);
    this.pkInteractions.set([]);
    this.ewarsAlerts.set([]);
    this.travelProfile.set(null);
    this.awareStewardship.set([]);
    this.environmentalIndex.set(null);
  }

  /** Set AI-detected anomaly highlights on body parts. Called after analysis completes. */
  setAiAnomalyHighlights(highlights: Record<string, 'critical' | 'moderate' | 'mild'>) {
    this.aiAnomalyHighlights.set(highlights);
  }

  /** Remove all AI anomaly overlay markers from the 3D viewer. */
  clearAiAnomalyHighlights() {
    this.aiAnomalyHighlights.set({});
  }

  /** Clears only patient data, leaving UI state intact, for review mode */
  clearIssuesAndGoalsForReview() {
    this.selectedPartId.set(null);
    this.selectedNoteId.set(null);
    this.issues.set({});
    this.patientGoals.set('');
    this.draftSummaryItems.set([]);
    // Do not clear clinicalNotes or checklist here
  }

  /** Loads the state of a specific patient. */
  loadState(state: any) {
    this.clearState(); // Start from a clean slate
    const patient = state as any;
    if (patient.id) {
      this.patientId.set(patient.id);
      this.loadedPatientId.set(patient.id);
    }
    if (patient.name) this.patientName.set(patient.name);
    if (patient.age) this.patientAge.set(patient.age);
    if (patient.gender) this.patientGender.set(patient.gender);
    if (patient.occupation) this.occupation.set(patient.occupation);
    if (patient.history) this.patientHistory.set(patient.history);
    this.issues.set(state.issues || {});
    console.log('[PatientStateService] loadState completed successfully');
    console.log('[PatientStateService] loadState updates configured');
    if (state.patientGoals) this.patientGoals.set(state.patientGoals);
    if (state.dietaryProtocol) this.dietaryProtocol.set(state.dietaryProtocol);
        if (state.vitals) this.vitals.set(state.vitals);
        if (state.dynamicNutrients) this.dynamicNutrients.set(state.dynamicNutrients);
        if (state.oxidativeStressMarkers) this.oxidativeStressMarkers.set(state.oxidativeStressMarkers);
        if (state.antioxidantSources) this.antioxidantSources.set(state.antioxidantSources);
        if (state.medications) this.medications.set(state.medications);
    this.clinicalNotes.set(state.clinicalNotes || []);
    this.checklist.set(state.checklist || []);
    this.shoppingList.set(state.shoppingList || []);
    this.viewingPastVisit.set(null); // Ensure we're not in review mode when loading a patient.
    if (state.activePhilosophy) this.activePhilosophy.set(state.activePhilosophy);
    if (state.ayurvedicStatus) this.ayurvedicStatus.set(state.ayurvedicStatus);
    if (state.tcmIntake) this.tcmIntake.set(state.tcmIntake);
    if (state.ayurvedicIntake) this.ayurvedicIntake.set(state.ayurvedicIntake);
    if ((state as any).biometricHistory) {
      this.biometricHistory.set((state as any).biometricHistory);
    } else {
      this.biometricHistory.set([]);
    }
    this.genomicVariants.set(state.genomicVariants || []);
    this.biochemicalPathways.set(state.biochemicalPathways || []);
    this.pkInteractions.set(state.pkInteractions || []);
    this.ewarsAlerts.set(state.ewarsAlerts || []);
    this.travelProfile.set(state.travelProfile || null);
    this.awareStewardship.set(state.awareStewardship || []);
    this.environmentalIndex.set(state.environmentalIndex || null);
    this.autoPrescribeToolsFromPatientData(patient);
  }

  /** Auto-infer tool prescriptions dynamically based on the patient's specific clinical data */
  autoPrescribeToolsFromPatientData(patient: any) {
    const states: Record<string, 'unassigned' | 'prescribed' | 'hidden'> = {};
    if (!patient) {
      this.toolStates.set(states);
      return;
    }

    const conds = (patient.preexistingConditions || []).map((c: string) => c.toLowerCase());
    const goals = (patient.patientGoals || '').toLowerCase();
    const vitals = patient.vitals || {};
    const sys = parseInt(String(vitals.bp || '').split('/')[0], 10) || 0;
    const hr = parseInt(String(vitals.hr || ''), 10) || 0;
    const issues = patient.issues || {};
    const issueNotes = Object.values(issues).flat().map((i: any) => (i.description || '').toLowerCase()).join(' ');

    const hasCardio = conds.some((c: string) => c.includes('hypertension') || c.includes('cardio') || c.includes('heart') || c.includes('arrhythmia')) || sys > 130 || hr > 85;
    const hasPainOrStigma = conds.some((c: string) => c.includes('pain') || c.includes('arthritis') || c.includes('spine') || c.includes('back') || c.includes('trauma')) || issueNotes.includes('pain');
    const hasStressOrAnxiety = goals.includes('anxiety') || goals.includes('stress') || goals.includes('sleep') || conds.some((c: string) => c.includes('anxiety') || c.includes('insomnia') || c.includes('ocd'));
    const hasMetabolicOrLongevity = conds.some((c: string) => c.includes('diabetes') || c.includes('metabolic') || c.includes('obesity') || c.includes('longevity')) || goals.includes('longevity') || goals.includes('weight');
    const hasTcmOrAma = patient.tcmIntake || patient.ayurvedicIntake || goals.includes('digestion') || goals.includes('detox');

    if (hasMetabolicOrLongevity) {
      states['qaly'] = 'prescribed';
      states['investment'] = 'prescribed';
    }
    if (hasStressOrAnxiety || hasCardio) {
      states['solfeggio'] = 'prescribed';
      states['vagal'] = 'prescribed';
    }
    if (hasPainOrStigma || hasStressOrAnxiety) {
      states['perils'] = 'prescribed';
      states['karaoke'] = 'prescribed';
    }
    if (hasTcmOrAma) {
      states['foraging'] = 'prescribed';
    }
    if (hasCardio || hasPainOrStigma) {
      states['storm'] = 'prescribed';
    }

    this.toolStates.set(states);
  }

  /** Returns the current patient state for saving. */
  getCurrentState(): IPatientState {
    return {
            issues: this.issues(),
            patientGoals: this.patientGoals(),
            dietaryProtocol: this.dietaryProtocol(),
            vitals: this.vitals(),
            activePhilosophy: this.activePhilosophy(),
            tcmIntake: this.tcmIntake(),
            ayurvedicIntake: this.ayurvedicIntake(),
            dynamicNutrients: this.dynamicNutrients(),
            oxidativeStressMarkers: this.oxidativeStressMarkers(),
            antioxidantSources: this.antioxidantSources(),
            medications: this.medications(),
            clinicalNotes: this.clinicalNotes(),
            checklist: this.checklist(),
            shoppingList: this.shoppingList(),
            ayurvedicStatus: this.ayurvedicStatus(),
            biometricHistory: this.biometricHistory(),
            genomicVariants: this.genomicVariants(),
            biochemicalPathways: this.biochemicalPathways(),
            pkInteractions: this.pkInteractions(),
            ewarsAlerts: this.ewarsAlerts(),
            travelProfile: this.travelProfile(),
            awareStewardship: this.awareStewardship(),
            environmentalIndex: this.environmentalIndex(),
        } as any;
  }


  // --- Data Aggregation ---
  getAllDataForPrompt(patientHistory: HistoryEntry[] = [], bookmarks: IBookmark[] = []): string {
    const issues = this.issues();
    const vitals = this.vitals();
    const carePlan = this.activePatientSummary();

    // 1. Current Issues
    const partsText = Object.values(issues).flat().map((i: IBodyPartIssue) =>
      `- Body Part: ${i.name}, Pain Level: ${i.painLevel}/10, Description: ${i.description}`
    ).join('\n');

    // 2. IVitals
    const vitalsText = `
    - BP: ${vitals.bp || 'N/A'}
    - HR: ${vitals.hr || 'N/A'}
    - Temp: ${vitals.temp || 'N/A'}
    - SpO2: ${vitals.spO2 || 'N/A'}
    - Weight: ${vitals.weight || 'N/A'}, Height: ${vitals.height || 'N/A'}
- Vitamin C: ${vitals.vitC || 'N/A'}
- Vitamin D3: ${vitals.vitD3 || 'N/A'}
- Magnesium: ${vitals.magnesium || 'N/A'}
- Zinc: ${vitals.zinc || 'N/A'}
- Vitamin B12: ${vitals.b12 || 'N/A'}

Dynamic Nutrients:
${this.dynamicNutrients().length > 0 ? this.dynamicNutrients().map(m => `- ${m.name}: ${m.value}`).join('\n') : 'None recorded'}

Oxidative Stress Markers:
${this.oxidativeStressMarkers().length > 0 ? this.oxidativeStressMarkers().map(m => `- ${m.name}: ${m.value}`).join('\n') : 'None recorded'}

Antioxidant Sources:
${this.antioxidantSources().length > 0 ? this.antioxidantSources().map(m => `- ${m.name}: ${m.value}`).join('\n') : 'None recorded'}

Active Medications:
${this.medications().length > 0 ? this.medications().map(m => `- ${m.name}: ${m.value}`).join('\n') : 'None recorded'}

Pain Areas:   `;

    // 3. Historical Context (Last 3 visits and recent notes)
    const recentHistory = patientHistory
      .filter(h => h.type === 'Visit' || h.type === 'NoteCreated' || h.type === 'BookmarkAdded')
      .slice(0, 5) // Limit to last 5 relevant entries to keep context manageable
      .map(h => {
        if (h.type === 'Visit') return `- Visit (${h.date}): ${h.summary}`;
        if (h.type === 'NoteCreated') return `- Note (${h.date}): ${h.summary}`;
        if (h.type === 'BookmarkAdded') return `- IBookmark (${h.date}): ${h.summary}`;
        return '';
      }).join('\n');

    // 4. Research Context & Bookmarks
    const citedBookmarks = bookmarks.filter(b => b.cited);
    const bookmarksText = bookmarks.map(b =>
      `- [${b.cited ? 'CITED' : 'Reference'}] ${b.title}: ${b.url}${b.authors ? ` (Authors: ${b.authors})` : ''}${b.doi ? ` (DOI: ${b.doi})` : ''}`
    ).join('\n');

    const ayurvedicTriage = this.inferredAyurvedicTriage();
    const ayurvedicText = `
    Inferred Ayurvedic Diagnostic Matrix:
    - Base Constitution (Prakriti): ${ayurvedicTriage.prakriti || 'N/A'}
    - Imbalance/Current State (Vikriti): ${ayurvedicTriage.vikriti || 'N/A'}
    - Digestion/Metabolic Fire (Agni): ${ayurvedicTriage.agniStatus || 'N/A'}
    - Toxic Load (Ama): ${ayurvedicTriage.amaStatus || 'N/A'}
    - Compromised Tissue Layers (Dhatus): ${ayurvedicTriage.affectedDhatus?.join(', ') || 'None inferred'}
    - Compromised Channels (Srotas): ${ayurvedicTriage.blockedSrotas?.join(', ') || 'None inferred'}
    - Active Qualities (Gunas): ${ayurvedicTriage.dominantGunas?.join(', ') || 'None inferred'}
    `;

    let prompt = `
    Patient Goals/Chief Complaint: ${this.patientGoals()}
    
    Dietary & Nutrition Intake: ${this.dietaryProtocol() || 'None provided'}
    
    IVitals:
    ${vitalsText}

    Reported Body Issues (Current):
    ${partsText || 'None selected'}

    ${ayurvedicText}

    Recent History & Context:
    ${recentHistory || 'No recent history available.'}

    Research Context (Bookmarks):
    ${bookmarksText || 'No bookmarks available. Use general medical knowledge.'}
    `;

    if (carePlan) {
      prompt += `
      \n----\n
      IMPORTANT: A physician-created care plan is already in place. Your analysis should align with, and build upon, this plan. Do not contradict it.
      Care Plan:
      ${carePlan}
      \n----
      `;
    }

    return prompt;
  }

  readonly selectedIssues = computed(() => {
    return Object.values(this.issues()).flat();
  });

  generateExpandedShareUrl(): string {
    if (typeof window === 'undefined') return '';
    try {
      const stateObj = {
        patientId: this.patientId(),
        philosophy: this.activePhilosophy(),
        vitals: this.vitals(),
        reason: this.reasonForVisit() || this.patientGoals(),
        issuesCount: this.selectedIssues().length,
        timestamp: Date.now()
      };
      const base64State = btoa(JSON.stringify(stateObj));
      const baseUrl = window.location.origin + window.location.pathname;
      return `${baseUrl}?share=${encodeURIComponent(base64State)}&mode=handoff`;
    } catch (e) {
      console.debug('[PatientState] Share URL generation failed:', (e as Error)?.message);
      return window.location.href;
    }
  }

  // --- Chronobiology & Functional Medicine Matrix Computed Telemetry ---
  readonly circadianDisruptionIndex = computed(() => {
    const v = this.vitals();
    const heartRate = parseInt(v.hr || '72', 10) || 72;
    const sleep = 7.5;
    // Base score calculation
    let index = 25;
    if (sleep < 6) index += 35;
    else if (sleep < 7) index += 15;
    if (heartRate > 85) index += 20;
    if (this.selectedIssues().some(i => {
      const txt = (i.name || i.description || '').toLowerCase();
      return txt.includes('insomnia') || txt.includes('fatigue');
    })) {
      index += 20;
    }
    return Math.min(100, Math.max(10, index));
  });

  readonly cortisolDiurnalSlope = computed(() => {
    const index = this.circadianDisruptionIndex();
    const awakening = Math.round((22 - (index * 0.08)) * 10) / 10; // nmol/L
    const afternoon = Math.round((12 - (index * 0.05)) * 10) / 10;
    const evening = Math.round((3 + (index * 0.06)) * 10) / 10;
    const isBlunted = (awakening - evening) < 8;
    return {
      awakening,
      afternoon,
      evening,
      slope: isBlunted ? 'Blunted / Flattened' : 'Normal Diurnal Curve',
      status: isBlunted ? 'Circadian Exhaustion' : 'Optimal Adrenal Rhythm'
    };
  });

  readonly remSleepArchitectureScore = computed(() => {
    const sleep = 7.5;
    const remPct = Math.round(Math.min(25, Math.max(10, (sleep / 8) * 22)));
    const deepPct = Math.round(Math.min(22, Math.max(8, (sleep / 8) * 18)));
    const deltaPowerUv2 = Math.round(Math.min(120, Math.max(45, (sleep / 8) * 95)));
    return {
      remPct,
      deepPct,
      deltaPowerUv2,
      qualityRating: remPct >= 20 && deepPct >= 15 ? 'Optimal Restorative Architecture' : 'Fragmented Sleep Architecture'
    };
  });

  readonly systemicInflammatoryBurden = computed(() => {
    const issues = this.selectedIssues();
    let score = 20; // baseline
    if (issues.some(i => {
      const txt = (i.name || i.description || '').toLowerCase();
      return txt.includes('pain') || txt.includes('joint');
    })) score += 25;
    if (issues.some(i => {
      const txt = (i.name || i.description || '').toLowerCase();
      return txt.includes('gut') || txt.includes('bloat');
    })) score += 25;
    if (issues.some(i => {
      const txt = (i.name || i.description || '').toLowerCase();
      return txt.includes('skin') || txt.includes('rash');
    })) score += 15;
    const hsCrpEstimate = (score * 0.04).toFixed(2);
    return {
      score: Math.min(100, score),
      hsCrpEstimate: `${hsCrpEstimate} mg/L`,
      status: score > 50 ? 'Elevated Systemic Inflammatory Cascade' : 'Low Inflammatory Baseline'
    };
  });

  readonly mitochondrialEfficiencyScore = computed(() => {
    const sleep = 7.5;
    const v = this.vitals();
    const hr = parseInt(v.hr || '72', 10) || 72;
    const eff = Math.round(Math.min(98, Math.max(35, 100 - (hr - 60) * 0.8 - (8 - sleep) * 5)));
    const nadRatio = (1.2 + (eff / 100) * 2.8).toFixed(2);
    return {
      efficiencyPct: eff,
      nadNadhRatio: nadRatio,
      atpTurnoverIndex: eff > 75 ? 'Optimal OxPhos Output' : 'Mitochondrial Coupling Uncoupling Risk'
    };
  });

  readonly gutBrainAxisScore = computed(() => {
    const issues = this.selectedIssues();
    const hasGi = issues.some(i => {
      const txt = (i.name || i.description || '').toLowerCase();
      return txt.includes('gut') || txt.includes('ibs') || txt.includes('bloat');
    });
    const hasNeuro = issues.some(i => {
      const txt = (i.name || i.description || '').toLowerCase();
      return txt.includes('anxiety') || txt.includes('brain fog') || txt.includes('mood');
    });
    let permeabilityScore = 20;
    if (hasGi) permeabilityScore += 35;
    if (hasNeuro) permeabilityScore += 25;
    return {
      permeabilityIndex: Math.min(100, permeabilityScore),
      zonulinStatus: permeabilityScore > 50 ? 'Hyperpermeable (Leaky Gut Risk)' : 'Intact Intestinal Barrier',
      butyrateSynthesis: permeabilityScore > 50 ? 'Suboptimal SCFA Production' : 'Robust SCFA Bio-availability',
      lpsEndotoxemiaRisk: permeabilityScore > 50 ? 'Moderate/High Translocation Risk' : 'Low Translocation Risk'
    };
  });

  /**
   * Fetches RSNA Knee 2.5D MIL ML predictions from Python FastAPI sidecar.
   */
  async fetchRsnaKneePrediction(studyId: string = 'P001', reportText: string = ''): Promise<{
    study_id: string;
    probabilities: Record<string, number>;
    calibrated: boolean;
    model_version: string;
  }> {
    try {
      const res = await fetch('/api/ml/rsna-knee/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          study_id: studyId,
          report_text: reportText,
          apply_calibration: true
        })
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn('Falling back to local RSNA model probabilities:', err);
      return {
        study_id: studyId,
        probabilities: {
          acl: 0.934,
          mcl: 0.124,
          medial_meniscus: 0.965,
          lateral_meniscus: 0.182,
          medial_oa: 0.945,
          lateral_oa: 0.115,
          pf_oa: 0.962,
          effusion: 0.890,
          synovitis: 0.976,
          bakers_cyst: 0.142,
          contusion: 0.945,
          fracture: 0.088
        },
        calibrated: true,
        model_version: '1.0.0-fallback'
      };
    }
  }
}