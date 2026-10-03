import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { ClinicalIntelligenceService } from './clinical-intelligence.service';
import { DefensiveGuardrailsService } from './defensive-guardrails.service';
import { IntelligenceProviderToken } from './ai/intelligence.provider.token';
import { AiCacheService } from './ai-cache.service';
import { NetworkStateService } from './network-state.service';
import { RulesEngineService } from './rules-engine.service';
import { PatientStateService } from './patient-state.service';
import { OrcidService } from './orcid.service';
import { WebLLMProvider } from './ai/webllm.provider';

describe('ClinicalIntelligenceService - Philosophy Modes', () => {
  let service: ClinicalIntelligenceService;
  let mockPatientState: any;
  let mockIntelligenceProvider: any;
  let mockAiCache: any;
  let mockOrcidService: any;
  let injector: Injector;

  beforeEach(() => {
    mockPatientState = {
      activePhilosophy: signal<'western' | 'eastern' | 'ayurvedic'>('western'),
      isEmergencyMode: signal<boolean>(false),
      isDemoMode: signal<boolean>(false),
      patientId: signal<string | null>(null),
      patientName: signal<string>(''),
      patientAge: signal<number>(0),
      patientGender: signal<string>(''),
      patientHistory: signal<any[]>([]),
      vitals: signal<any>({}),
      patientGoals: signal<string>(''),
      issues: signal<any>({}),
      medications: signal<any[]>([]),
      reasonForVisit: signal<string>(''),
      environmentalIndex: signal<any>(null),
      oknProfile: signal<any>(null),
      selectPhilosophy(philosophy: 'western' | 'eastern' | 'ayurvedic') {
        this.activePhilosophy.set(philosophy);
      }
    };

    mockIntelligenceProvider = {
      generateReportStream$: vi.fn().mockImplementation(() => {
        return {
          async *[Symbol.asyncIterator]() {
            yield "Chunk 1";
          }
        };
      }),
      generateMetrics: vi.fn().mockResolvedValue({ complexity: 5, stability: 5, certainty: 5 }),
      verifySection: vi.fn().mockResolvedValue({ status: 'verified', issues: [] }),
      startChat: vi.fn().mockResolvedValue(undefined),
      getInitialGreeting: vi.fn().mockResolvedValue("Hello"),
      sendMessage: vi.fn().mockResolvedValue("Response")
    };

    mockAiCache = {
      generateKey: vi.fn().mockImplementation((components) => Promise.resolve(JSON.stringify(components))),
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined)
    };

    mockOrcidService = {
      orcidProfile: signal<any>(null),
      fetchRecord: vi.fn().mockResolvedValue({})
    };

    const mockWebLLMProvider = {
      loadingProgress: signal<string>(''),
      isLoadingProgress: signal<boolean>(false),
      loadEngine: vi.fn().mockResolvedValue(undefined)
    };

    injector = Injector.create({
      providers: [
        { provide: DefensiveGuardrailsService, useValue: new DefensiveGuardrailsService() },
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: IntelligenceProviderToken, useValue: mockIntelligenceProvider },
        { provide: AiCacheService, useValue: mockAiCache },
        { provide: OrcidService, useValue: mockOrcidService },
        { provide: WebLLMProvider, useValue: mockWebLLMProvider },
        { provide: NetworkStateService, useValue: {
            isOnline: () => true,
            useLocalInference: () => false
          }
        },
        { provide: RulesEngineService, useValue: {
            evaluateOnResponse: vi.fn().mockImplementation((res) => res),
            evaluateOnMessage: vi.fn().mockReturnValue(null)
          }
        }
      ]
    });

    runInInjectionContext(injector, () => {
      service = new ClinicalIntelligenceService();
    });
  });

  it('should prepend western philosophy instructions by default', async () => {
    await runInInjectionContext(injector, async () => {
      await service.generateComprehensiveReport('Patient age 45');

      expect(mockIntelligenceProvider.generateReportStream$).toHaveBeenCalled();
      const systemInstructionArg = mockIntelligenceProvider.generateReportStream$.mock.calls[0][2];
      expect(systemInstructionArg).toContain('CLINICAL PARADIGM: Western (Allopathic) Medicine');
    });
  });

  it('should prepend eastern philosophy instructions when selected', async () => {
    await runInInjectionContext(injector, async () => {
      mockPatientState.activePhilosophy.set('eastern');
      await service.generateComprehensiveReport('Patient age 45');

      expect(mockIntelligenceProvider.generateReportStream$).toHaveBeenCalled();
      const systemInstructionArg = mockIntelligenceProvider.generateReportStream$.mock.calls[0][2];
      expect(systemInstructionArg).toContain('CLINICAL PARADIGM: Eastern (Traditional Chinese Medicine - TCM)');
    });
  });

  it('should prepend ayurvedic philosophy instructions when selected', async () => {
    await runInInjectionContext(injector, async () => {
      mockPatientState.activePhilosophy.set('ayurvedic');
      await service.generateComprehensiveReport('Patient age 45');

      expect(mockIntelligenceProvider.generateReportStream$).toHaveBeenCalled();
      const systemInstructionArg = mockIntelligenceProvider.generateReportStream$.mock.calls[0][2];
      expect(systemInstructionArg).toContain('CLINICAL PARADIGM: Ayurvedic Medicine');
    });
  });



  it('should give emergency first aid mode absolute precedence over philosophy instructions', async () => {
    await runInInjectionContext(injector, async () => {
      mockPatientState.isEmergencyMode.set(true);
      mockPatientState.activePhilosophy.set('eastern');
      await service.generateComprehensiveReport('Patient age 45');

      expect(mockIntelligenceProvider.generateReportStream$).toHaveBeenCalled();
      const systemInstructionArg = mockIntelligenceProvider.generateReportStream$.mock.calls[0][2];
      expect(systemInstructionArg).toContain('EMERGENCY FIRST AID MODE: You are assisting a bystander under the Good Samaritan law');
      // Ensure it also includes the subsequent system instructions or rules
      expect(systemInstructionArg).toContain('CLINICAL PARADIGM: Eastern (Traditional Chinese Medicine - TCM)');
    });
  });

  it('should inject correct chat context based on western philosophy', async () => {
    await runInInjectionContext(injector, async () => {
      await service.startChatSession('Patient age 45');

      expect(mockIntelligenceProvider.startChat).toHaveBeenCalled();
      const contextArg = mockIntelligenceProvider.startChat.mock.calls[0][1];
      expect(contextArg).toContain('Active Medicine Mode: Western (Allopathic) Medicine');
    });
  });

  it('should inject correct chat context based on eastern philosophy', async () => {
    await runInInjectionContext(injector, async () => {
      mockPatientState.activePhilosophy.set('eastern');
      await service.startChatSession('Patient age 45');

      expect(mockIntelligenceProvider.startChat).toHaveBeenCalled();
      const contextArg = mockIntelligenceProvider.startChat.mock.calls[0][1];
      expect(contextArg).toContain('Active Medicine Mode: Eastern (Traditional Chinese Medicine)');
    });
  });

  it('should inject correct chat context based on ayurvedic philosophy', async () => {
    await runInInjectionContext(injector, async () => {
      mockPatientState.activePhilosophy.set('ayurvedic');
      await service.startChatSession('Patient age 45');

      expect(mockIntelligenceProvider.startChat).toHaveBeenCalled();
      const contextArg = mockIntelligenceProvider.startChat.mock.calls[0][1];
      expect(contextArg).toContain('Active Medicine Mode: Ayurvedic Medicine');
    });
  });



  it('should inject emergency context in chat session if emergency mode is active', async () => {
    await runInInjectionContext(injector, async () => {
      mockPatientState.isEmergencyMode.set(true);
      mockPatientState.activePhilosophy.set('ayurvedic');
      await service.startChatSession('Patient age 45');

      expect(mockIntelligenceProvider.startChat).toHaveBeenCalled();
      const contextArg = mockIntelligenceProvider.startChat.mock.calls[0][1];
      expect(contextArg).toContain('EMERGENCY FIRST-AID COMPANION');
      expect(contextArg).not.toContain('Active Medicine Mode: Ayurvedic Medicine');
    });
  });

  describe('Demo Mode Interceptions', () => {
    it('should return pre-baked report immediately in demo mode without calling AI provider', async () => {
      await runInInjectionContext(injector, async () => {
        mockPatientState.isDemoMode.set(true);
        mockPatientState.activePhilosophy.set('eastern');

        const report = await service.generateComprehensiveReport('Patient age 45');

        // Check that report has keys
        expect(report['Summary Overview']).toBeDefined();
        expect(report['Functional Protocols']).toBeDefined();
        // Since isDemoMode is true, generateReportStream$ should NOT have been called.
        expect(mockIntelligenceProvider.generateReportStream$).not.toHaveBeenCalled();
      });
    });

    it('should set appropriate demo metrics based on active philosophy in demo mode', async () => {
      await runInInjectionContext(injector, async () => {
        mockPatientState.isDemoMode.set(true);
        
        mockPatientState.activePhilosophy.set('ayurvedic');
        await service.generateComprehensiveReport('Patient age 45');
        expect(service.analysisMetrics()).toEqual({ complexity: 8, stability: 5, certainty: 7 });
      });
    });
  });

  describe('CARS Eliminative Self-Correction & Distractor Guard', () => {
    it('should flag absolute scope qualifiers (always, never, completely) lacking STAT indication', () => {
      const result = service.auditClinicalRecommendationWithCarsRules(
        'The clinician must always prescribe high-dose ACE inhibitors and never allow baseline titration.'
      );
      expect(result.issues.some(i => i.message.includes('CARS Extreme Scope Warning'))).toBe(true);
      expect(result.suggestedCorrections.length).toBeGreaterThan(0);
    });

    it('should flag keyword decoy trap on blanket cephalosporin ban for penicillin allergy', () => {
      const result = service.auditClinicalRecommendationWithCarsRules(
        'Patient reports penicillin allergy, which contraindicates all cephalosporins across all clinical encounters.'
      );
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.message.includes('CARS Keyword Decoy Trap'))).toBe(true);
      expect(result.issues[0].suggestedFix).toContain('R1 side-chain');
    });

    it('should flag polarity inversion for beta-blockers in febrile compensatory tachycardia', () => {
      const result = service.auditClinicalRecommendationWithCarsRules(
        'Patient presents with sinus tachycardia associated with acute fever; initiate beta-blocker therapy.'
      );
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.message.includes('CARS Polarity Inversion Warning'))).toBe(true);
    });

    it('should flag stale vital snapshot when weaning oxygen on a desaturating patient', () => {
      const result = service.auditClinicalRecommendationWithCarsRules(
        'Continue to wean oxygen by 1 L/min.',
        { spO2: 87, hr: 90 }
      );
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.message.includes('Stale Snapshot Warning'))).toBe(true);
      expect(result.issues[0].suggestedFix).toContain('Halt oxygen weaning');
    });

    it('should pass validation with zero high-severity issues for measured clinical guidance', () => {
      const result = service.auditClinicalRecommendationWithCarsRules(
        'Titrate supplemental oxygen to maintain SpO2 >= 92%. Monitor respiratory effort and consider pulmonary consultation if work of breathing increases.',
        { spO2: 95, hr: 78 }
      );
      expect(result.isValid).toBe(true);
      expect(result.issues.filter(i => i.severity === 'high').length).toBe(0);
    });

    it('should flag clinical fallacies and cognitive biases in AI recommendation', () => {
      const result = service.auditClinicalRecommendationWithCarsRules(
        'Because the senior attending with 30 years of experience recommends continuing Gentamicin despite acute kidney injury, we must adhere to authority.'
      );
      expect(result.issues.some(i => i.message.includes('Fallacy Audit Alert'))).toBe(true);
      expect(result.suggestedCorrections.some(s => s.toLowerCase().includes('authority') || s.toLowerCase().includes('fallacy'))).toBe(true);
    });
  });

  describe('Watershed-Aware CDS Advisory Stream & OKN Graph Grounding', () => {
    it('should detect joint pain triggers from patient state issues', () => {
      mockPatientState.issues.set({
        r_shin: [{
          id: 'knee_r',
          noteId: 'n1',
          name: 'Right Knee',
          painLevel: 7,
          description: 'Severe medial joint line pain, crepitus, and Kellgren-Lawrence grade 3 osteoarthritis',
          symptoms: ['knee stiffness', 'joint effusion']
        }]
      });
      const trigger = service.detectWatershedClinicalTriggers();
      expect(trigger).toBe('joint_pain');
    });

    it('should detect statin myopathy triggers when patient takes Atorvastatin and reports muscle pain', () => {
      mockPatientState.medications.set([
        { id: 'm1', name: 'Atorvastatin 40mg', value: 'daily' }
      ]);
      mockPatientState.issues.set({
        glutes: [{
          id: 'muscle_weakness',
          noteId: 'n2',
          name: 'Bilateral Thighs',
          painLevel: 6,
          description: 'SAMS muscle weakness and myalgia, suspect CoQ10 mitochondrial depletion',
          symptoms: ['muscle aches', 'cramping']
        }]
      });
      const trigger = service.detectWatershedClinicalTriggers();
      expect(trigger).toBe('statin_myopathy');
    });

    it('should detect both triggers when patient presents with knee osteoarthritis and statin myopathy', () => {
      mockPatientState.medications.set([
        { id: 'm1', name: 'Rosuvastatin 20mg', value: 'daily' }
      ]);
      mockPatientState.issues.set({
        r_shin: [{
          id: 'knee_r',
          noteId: 'n1',
          name: 'Right Knee',
          painLevel: 7,
          description: 'Knee osteoarthritis with joint stiffness',
          symptoms: ['arthralgia']
        }],
        upper_back: [{
          id: 'sams_ache',
          noteId: 'n2',
          name: 'Upper Back',
          painLevel: 5,
          description: 'Diffuse statin myalgia and muscle aches',
          symptoms: ['myopathy']
        }]
      });
      const trigger = service.detectWatershedClinicalTriggers();
      expect(trigger).toBe('both');
    });

    it('should evaluate watershed advisory with water hardness, UCMR5 data, and OKN graph traversal', async () => {
      mockPatientState.reasonForVisit.set('Follow-up on worsening knee osteoarthritis and joint stiffness in Twin Cities');
      mockPatientState.issues.set({
        r_shin: [{
          id: 'knee_r',
          noteId: 'n1',
          name: 'Right Knee',
          painLevel: 8,
          description: 'Cartilage degeneration and joint space narrowing',
          symptoms: ['osteoarthritis', 'knee pain']
        }]
      });

      const advisory = await service.evaluateWatershedCdsAdvisory();
      expect(advisory).not.toBeNull();
      expect(advisory!.trigger).toBe('joint_pain');
      expect(advisory!.basin.name).toContain('Upper Mississippi');
      expect(advisory!.basin.hardnessCaCO3).toBe(268.0);
      expect(advisory!.hardnessCategory).toBe('Very Hard (>180 mg/L)');
      expect(advisory!.epaMclExceedance).toBe(true);
      expect(advisory!.oknTraversedPaths.length).toBeGreaterThan(0);
      expect(advisory!.directiveContext).toContain('[WATERSHED EXPOSOME CDS ADVISORY]');
      expect(advisory!.directiveContext).toContain('Upper Mississippi');
      expect(advisory!.antonovskyRemedy.remedy).toContain('Reverse Osmosis');
      expect(service.watershedCdsAdvisory()).toEqual(advisory);
    });

    it('should ground live consult sendChatMessage with watershed advisory when statin myopathy is discussed', async () => {
      mockPatientState.medications.set([
        { id: 'm1', name: 'Atorvastatin 80mg', value: 'daily' }
      ]);
      const response = await service.sendChatMessage('Doctor, the patient is experiencing severe muscle aches and myalgia on Atorvastatin');
      expect(mockIntelligenceProvider.sendMessage).toHaveBeenCalled();
      const sentMessageArg = mockIntelligenceProvider.sendMessage.mock.calls[0][0];
      expect(sentMessageArg).toContain('[CLINICAL DIRECTIVE CONTEXT:');
      expect(sentMessageArg).toContain('[WATERSHED EXPOSOME CDS ADVISORY]');
      expect(sentMessageArg).toContain('Statin-Associated Muscle Symptoms');
      expect(response).toBe('Response');
    });
  });
});

