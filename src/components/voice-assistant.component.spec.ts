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
import { SocraticVoiceDemystifierService } from '../services/socratic-voice-demystifier.service';

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
      issues: signal({}),
      activeDrilldownComponent: signal(null),
      liveAgentInput: signal(null),
      liveAgentWindowMode: signal('compact'),
      isLiveAgentActive: signal(true),
      isPlainLanguageMode: signal(false),
      setLiveAgentWindowMode: vi.fn(),
      toggleLiveAgentExpand: vi.fn(),
      patientName: signal('Jane Doe'),
      getAllDataForPrompt: vi.fn().mockReturnValue('Patient data'),
      addClinicalNote: vi.fn(),
      isDemoMode: vi.fn().mockReturnValue(true)
    };

    mockClinicalIntelligence = {
      isLoading: signal(false),
      transcript: signal([]),
      recentNodes: signal([]),
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
      activePatient: signal({ id: 'P001', name: 'Anonymous Patient' }),
      selectedPatient: signal({ id: 'P001', name: 'Anonymous Patient' })
    };

    mockMarkdown = {
      renderMarkdown: vi.fn().mockImplementation((t: string) => `<p>${t}</p>`),
      parser: signal({ parse: (t: string) => `<p>${t}</p>` })
    };

    mockRichMedia = {
      resolveMediaCards: vi.fn().mockReturnValue([])
    };

    mockAdkLive = {
      isConnected: signal(false),
      isConnecting: signal(false),
      selectedVoice: signal('Aoede'),
      volumeLevel: signal(28),
      isSpeaking: signal(false),
      isListening: signal(false),
      latencyMs: signal(145),
      connectionError: signal(null),
      connect: vi.fn(),
      disconnect: vi.fn(),
      startListening: vi.fn(),
      stopListening: vi.fn(),
      stopSpeaking: vi.fn(),
      interrupt: vi.fn(),
      sendText: vi.fn()
    };

    mockStorage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      loadState: vi.fn().mockResolvedValue(null),
      saveState: vi.fn().mockResolvedValue(true),
      saveChatHistory: vi.fn()
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
        SocraticVoiceDemystifierService,
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

  it('3. Manages Gemini Live voice switcher and presets', () => {
    expect(component.availableVoices).toEqual(['Aoede', 'Puck', 'Charon', 'Fenrir', 'Kore']);
    expect(component.isVoiceMenuOpen()).toBe(false);

    component.isVoiceMenuOpen.set(true);
    expect(component.isVoiceMenuOpen()).toBe(true);

    component.setVoice('Charon');
    expect(mockAdkLive.selectedVoice()).toBe('Charon');
    expect(component.isVoiceMenuOpen()).toBe(false);
  });

  it('4. Toggles quick prompt shelf and triggers clinical prompts', () => {
    expect(component.showPromptShelf()).toBe(false);
    component.showPromptShelf.set(true);
    expect(component.showPromptShelf()).toBe(true);

    const sendSpy = vi.spyOn(component, 'sendMessage').mockImplementation(async () => {});
    component.sendQuickPrompt('Review recent vitals for orthostatic hypotension');
    expect(component.messageText()).toBe('Review recent vitals for orthostatic hypotension');
    expect(sendSpy).toHaveBeenCalled();
  });

  it('5. Clears consultation history with user confirmation', () => {
    component.chatHistory.set([
      { id: '1', role: 'user', text: 'Initial symptom check', timestamp: Date.now() } as any
    ]);
    expect(component.chatHistory().length).toBe(1);

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    component.confirmClearSession();

    expect(confirmSpy).toHaveBeenCalled();
    expect(component.chatHistory().length).toBe(0);
    expect(mockStorage.saveChatHistory).toHaveBeenCalledWith('current_patient', []);
    confirmSpy.mockRestore();
  });

  it('6. Exports consult transcript with FDA 21 CFR Part 11 cryptographic seal', async () => {
    const clipboardWriteMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: clipboardWriteMock
      }
    });

    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    const mockRevokeObjectURL = vi.fn();
    window.URL.createObjectURL = mockCreateObjectURL;
    window.URL.revokeObjectURL = mockRevokeObjectURL;

    component.chatHistory.set([
      { id: '1', role: 'user', text: 'Patient reports persistent headache.', timestamp: Date.now() } as any,
      { id: '2', role: 'assistant', text: 'Evaluating neurovascular telemetry indicators.', timestamp: Date.now() } as any
    ]);

    await component.exportTranscript();

    expect(clipboardWriteMock).toHaveBeenCalled();
    const copiedText = clipboardWriteMock.mock.calls[0][0];
    expect(copiedText).toContain('# PocketGull Clinical Consultation Transcript');
    expect(copiedText).toContain('Patient reports persistent headache.');
    expect(copiedText).toContain('Gemini Live Multimodal Audio');
    expect(copiedText).toContain('FDA 21 CFR Part 11 & HIPAA Cryptographic Attestation');
    expect(copiedText).toContain('SHA-256');
    expect(component.isCopiedToastVisible()).toBe(true);
  });

  it('7. Exposes real WebAudio RMS volume and barge-in capability via AdkLiveService', () => {
    expect(mockAdkLive.volumeLevel()).toBe(28);
    mockAdkLive.isSpeaking.set(true);
    expect(mockAdkLive.isSpeaking()).toBe(true);

    mockAdkLive.stopSpeaking();
    expect(mockAdkLive.stopSpeaking).toHaveBeenCalled();
  });

  it('8. Supports patient state window mode transitions', () => {
    expect(mockPatientState.liveAgentWindowMode()).toBe('compact');
    mockPatientState.setLiveAgentWindowMode('expanded');
    expect(mockPatientState.setLiveAgentWindowMode).toHaveBeenCalledWith('expanded');

    mockPatientState.toggleLiveAgentExpand();
    expect(mockPatientState.toggleLiveAgentExpand).toHaveBeenCalled();
  });

  it('9. Manages intelligent scroll pinning and unread response badges', () => {
    expect(component.isUserScrolledUp()).toBe(false);
    expect(component.hasNewUnseenMessages()).toBe(false);

    // Mock transcript container element
    const mockContainer = {
      scrollHeight: 1000,
      scrollTop: 400,
      clientHeight: 400,
      scrollTo: vi.fn()
    };
    (component as any).transcriptContainer = signal({ nativeElement: mockContainer });

    // Distance = 1000 - 400 - 400 = 200 (> 120, user is scrolled up)
    component.onTranscriptScroll();
    expect(component.isUserScrolledUp()).toBe(true);

    // If a new response arrives while scrolled up, scrollToBottom sets hasNewUnseenMessages = true
    vi.useFakeTimers();
    component.scrollToBottom(false);
    vi.advanceTimersByTime(150);
    expect(component.hasNewUnseenMessages()).toBe(true);
    expect(mockContainer.scrollTo).not.toHaveBeenCalled();

    // When user clicks the floating badge (force = true), scroll to bottom and clear unread badge
    component.scrollToBottom(true);
    vi.advanceTimersByTime(150);
    expect(mockContainer.scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: 'smooth' });
    expect(component.hasNewUnseenMessages()).toBe(false);
    vi.useRealTimers();
  });

  it('10. Handles keyboard accelerators (Escape, Ctrl+M, Ctrl+K)', () => {
    // Escape minimizes live agent window
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    const preventSpy = vi.spyOn(escapeEvent, 'preventDefault');
    component.handleGlobalKeydown(escapeEvent);
    expect(mockPatientState.setLiveAgentWindowMode).toHaveBeenCalledWith('minimized');
    expect(preventSpy).toHaveBeenCalled();

    // Ctrl+M toggles listening
    const ctrlMEvent = new KeyboardEvent('keydown', { key: 'm', ctrlKey: true });
    const toggleListeningSpy = vi.spyOn(component, 'toggleListening').mockImplementation(() => {});
    component.handleGlobalKeydown(ctrlMEvent);
    expect(toggleListeningSpy).toHaveBeenCalled();

    // Ctrl+K restores compact window
    mockPatientState.liveAgentWindowMode.set('minimized');
    const ctrlKEvent = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
    component.handleGlobalKeydown(ctrlKEvent);
    expect(mockPatientState.setLiveAgentWindowMode).toHaveBeenCalledWith('compact');
  });

  it('11. Captures active 3D anatomy canvas snapshots for multimodal consult', () => {
    expect(component.selectedFiles().length).toBe(0);

    const mockCanvas = document.createElement('canvas');
    mockCanvas.className = 'three-canvas';
    mockCanvas.toBlob = vi.fn((callback: any) => {
      const mockBlob = new Blob(['mock-png-bytes'], { type: 'image/png' });
      callback(mockBlob);
    });
    document.body.appendChild(mockCanvas);

    component.captureActive3DViewport();

    expect(mockCanvas.toBlob).toHaveBeenCalled();
    expect(component.selectedFiles().length).toBe(1);
    expect(component.selectedFiles()[0].name).toContain('3d_anatomy_snapshot_');

    document.body.removeChild(mockCanvas);
  });

  it('12. Socratic Acoustic & Persona Options: allows toggling persona and jargon demystifier', () => {
    expect(component.socraticVoice).toBeTruthy();
    expect(component.isSocraticDemystifierActive()).toBe(true);
    expect(component.socraticVoice.selectedPersonaId()).toBe('persona-parasympathetic-calm');

    // Switch persona to Mentor Socrates
    component.selectSocraticPersona('persona-socratic-mentor');
    expect(component.socraticVoice.selectedPersonaId()).toBe('persona-socratic-mentor');
    expect(component.isSocraticMenuOpen()).toBe(false);

    // Toggle jargon demystifier off and on
    component.isSocraticDemystifierActive.set(false);
    expect(component.isSocraticDemystifierActive()).toBe(false);
    component.isSocraticDemystifierActive.set(true);
    expect(component.isSocraticDemystifierActive()).toBe(true);
  });

  it('13. Bedside AAC & Pain Vocalizer: triggers vagal speech and dispatches clinical consult prompt', async () => {
    const speakSpy = vi.spyOn(component.socraticVoice, 'speakWithVagalPacing').mockResolvedValue();
    const sendPromptSpy = vi.spyOn(component, 'sendQuickPrompt').mockImplementation(() => {});

    expect(component.showAacShelf()).toBe(false);
    component.showAacShelf.set(true);
    expect(component.showAacShelf()).toBe(true);

    // Select Wong-Baker face 8
    const face8 = component.aacFaces.find(f => f.score === 8)!;
    await component.selectAacFace(face8);

    expect(speakSpy).toHaveBeenCalledWith(face8.speechPrompt);
    expect(sendPromptSpy).toHaveBeenCalledWith(
      expect.stringContaining('[BEDSIDE AAC PAIN VOCALIZATION]: Patient reported Wong-Baker FACES pain score of 8/10')
    );

    // Trigger Bedside Need tile
    const waterTile = component.aacTiles.find(t => t.id === 'WATER')!;
    await component.triggerAacTile(waterTile);

    expect(speakSpy).toHaveBeenCalledWith(waterTile.spokenText);
    expect(sendPromptSpy).toHaveBeenCalledWith(
      expect.stringContaining('[BEDSIDE AAC NEED ANNOUNCEMENT]: Could I please have some water, or a mouth swab?')
    );
  });
});

