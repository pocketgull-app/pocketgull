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
import { describe, beforeEach, it, expect, vi } from 'vitest';

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
            evaluateOnResponse: vi.fn().mockImplementation((res) => res)
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
});
