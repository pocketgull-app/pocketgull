import '@angular/compiler';
import * as DOMPurify from 'dompurify'; // HIPAA Safe Harbor Sanitization
import { VoiceAssistantComponent } from './voice-assistant.component';
import { signal, Injector, runInInjectionContext } from '@angular/core';

vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    effect: () => ({ destroy: () => {} })
  };
});
import { PatientStateService } from '../services/patient-state.service';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';
import { DictationService } from '../services/dictation.service';
import { PatientManagementService } from '../services/patient-management.service';
import { MarkdownService } from '../services/markdown.service';
import { RichMediaService } from '../services/rich-media.service';
import { AdkLiveService } from '../services/ai/adk-live.service';
import { StorageService } from '../services/storage.service';
import { SecureStorageService } from '../services/secure-storage.service';
import { YbocsService } from '../services/ybocs/ybocs.service';
import { BionicReadingService } from '../services/bionic-reading.service';

import { OcularVocalTelemetryService } from '../services/ocular-vocal-telemetry.service';
import { OpticalCameraVisionService } from '../services/optical-camera-vision.service';
import { SpatialLesionMarkupService } from '../services/spatial-lesion-markup.service';

describe('VoiceAssistantComponent - Multimodal Voice Consultation & Speech Controls', () => {
  let component: VoiceAssistantComponent;
  let mockPatientState: any;
  let mockClinicalIntelligence: any;
  let mockDictation: any;
  let mockPatientManagement: any;
  let mockMarkdown: any;
  let mockRichMedia: any;
  let mockAdkLive: any;
  let mockStorage: any;
  let mockSecureStorage: any;
  let mockYbocs: any;
  let mockTelemetry: any;
  let mockOpticalVision: any;

  beforeEach(() => {
    mockPatientState = {
      vitals: signal({ hr: '72', bp: '120/80', temp: '98.6°F', spO2: '98%' }),
      symptoms: signal([]),
      conditions: signal([]),
      activeDrilldownComponent: signal(null),
      liveAgentInput: signal(null)
    };

    mockClinicalIntelligence = {
      isLoading: signal(false),
      transcript: signal([]),
      sendMessage: vi.fn().mockResolvedValue('Care plan updated')
    };

    mockDictation = {
      isListening: signal(false),
      transcript: signal(''),
      startListening: vi.fn(),
      stopListening: vi.fn(),
      speakResponse: vi.fn(),
      stopSpeaking: vi.fn(),
      speakAvianPersonaText: vi.fn()
    };

    mockPatientManagement = {
      activePatient: signal({ id: 'P001', name: 'Anonymous Patient' })
    };

    mockMarkdown = {
      renderMarkdown: vi.fn().mockImplementation((t: string) => `<p>${t}</p>`)
    };

    mockRichMedia = {
      resolveMediaCards: vi.fn().mockReturnValue([])
    };

    mockAdkLive = {
      isConnected: signal(false),
      isConnecting: signal(false),
      connect: vi.fn(),
      disconnect: vi.fn()
    };

    mockStorage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      loadState: vi.fn().mockResolvedValue(null),
      saveState: vi.fn().mockResolvedValue(true)
    };

    mockSecureStorage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn()
    };

    mockYbocs = {
      currentQuestionIndex: signal(0),
      scores: signal({})
    };

    mockTelemetry = {
      isHudActive: signal(false),
      toggleHud: vi.fn(),
      setTelemetryMode: vi.fn(),
      selectedTelemetryMode: signal('ALL'),
      overallNeuroVascularScore: signal(91),
      ocular: signal({
        leftPupilDiameterMm: 3.4,
        rightPupilDiameterMm: 3.5,
        anisocoriaAsymmetryPct: 2.9,
        blinkRatePerMin: 16,
        saccadicStabilityScore: 94,
        isPupilSymmetric: true,
        neuroAlertNotice: null
      }),
      vocal: signal({
        fundamentalFrequencyHz: 124.5,
        microTremorJitterPct: 0.62,
        shimmerLocalPct: 1.85,
        harmonicToNoiseRatioDb: 24.2,
        vocalStressIndex: 18,
        isVocalTremorDetected: false,
        acousticNote: 'Normal stability'
      }),
      rppg: signal({
        heartRateBpm: 72,
        hrvRmssdMs: 44.5,
        pulseWaveVelocityMps: 6.8,
        signalToNoiseRatioDb: 18.5,
        perfusionQualityIndex: 92
      })
    };

    mockOpticalVision = {
      currentLens: signal('RPPG_PULSE'),
      isCameraActive: signal(false)
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: ClinicalIntelligenceService, useValue: mockClinicalIntelligence },
        { provide: DictationService, useValue: mockDictation },
        { provide: PatientManagementService, useValue: mockPatientManagement },
        { provide: MarkdownService, useValue: mockMarkdown },
        { provide: RichMediaService, useValue: mockRichMedia },
        { provide: AdkLiveService, useValue: mockAdkLive },
        { provide: StorageService, useValue: mockStorage },
        { provide: SecureStorageService, useValue: mockSecureStorage },
        { provide: YbocsService, useValue: mockYbocs },
        { provide: OcularVocalTelemetryService, useValue: mockTelemetry },
        { provide: OpticalCameraVisionService, useValue: mockOpticalVision },
        SpatialLesionMarkupService,
        BionicReadingService
      ]
    });

    component = runInInjectionContext(injector, () => new VoiceAssistantComponent());
  });

  it('1. Instantiates successfully with empty message text signal', () => {
    expect(component).toBeTruthy();
    expect(component.messageText()).toBe('');
  });

  it('2. Integrates with OcularVocalTelemetryService for Tele-Consult HUD', () => {
    expect(component.telemetryService).toBeTruthy();
    expect(component.telemetryService.overallNeuroVascularScore()).toBe(91);
    component.telemetryService.toggleHud();
    expect(component.telemetryService.toggleHud).toHaveBeenCalled();
  });
});
