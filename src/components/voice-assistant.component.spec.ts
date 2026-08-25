import '@angular/compiler';
import * as DOMPurify from 'dompurify'; // HIPAA Safe Harbor Sanitization

vi.mock('@angular/forms', () => ({
  FormsModule: class {},
  ReactiveFormsModule: class {},
  NgControl: class {},
  NgModel: class {}
}));

// Mock Angular constructor effects for headless Vitest environment
vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    effect: () => {
      return {
        destroy: () => {}
      };
    }
  };
});
import { VoiceAssistantComponent } from './voice-assistant.component';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
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
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockPatientState = {
      vitals: signal({ hr: '72', bp: '120/80', temp: '98.6°F', spO2: '98%' }),
      symptoms: signal([]),
      conditions: signal([]),
      activeDrilldownComponent: signal(null)
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

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockPatientState },
      { provide: ClinicalIntelligenceService, useValue: mockClinicalIntelligence },
      { provide: DictationService, useValue: mockDictation },
      { provide: PatientManagementService, useValue: mockPatientManagement },
      { provide: MarkdownService, useValue: mockMarkdown },
      { provide: RichMediaService, useValue: mockRichMedia },
      { provide: AdkLiveService, useValue: mockAdkLive },
      { provide: StorageService, useValue: mockStorage },
      { provide: SecureStorageService, useValue: mockSecureStorage },
      { provide: YbocsService, useValue: mockYbocs }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new VoiceAssistantComponent();
    });
  });

  it('should instantiate successfully with empty message text signal', () => {
    expect(component).toBeTruthy();
    expect(component.messageText()).toBe('');
  });


});
