import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SummaryNodeComponent } from './summary-node.component';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { PatientStateService } from '../services/patient-state.service';
import { MarkdownService } from '../services/markdown.service';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';
import { DictationService } from '../services/dictation.service';
import { SecureStorageService } from '../services/secure-storage.service';
import { RichMediaService } from '../services/rich-media.service';
import { PatientManagementService } from '../services/patient-management.service';

describe('SummaryNodeComponent - Interactive Node Context & Telemetry Summary', () => {
  let component: SummaryNodeComponent;
  let mockPatientState: any;
  let mockMarkdown: any;
  let mockClinicalIntelligence: any;
  let mockDictation: any;
  let mockSecureStorage: any;
  let mockRichMedia: any;
  let mockPatientManagement: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockPatientState = {
      vitals: signal({ hr: '72', bp: '120/80', temp: '98.6°F', spO2: '98%' }),
      symptoms: signal([]),
      conditions: signal([])
    };

    mockMarkdown = {
      renderMarkdown: vi.fn().mockImplementation((t: string) => `<p>${t}</p>`)
    };

    mockClinicalIntelligence = {
      isLoading: signal(false),
      analyzeSymptomNode: vi.fn(),
      transcript: signal([])
    };

    mockDictation = {
      isListening: signal(false),
      startListening: vi.fn(),
      stopListening: vi.fn()
    };

    mockSecureStorage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn()
    };

    mockRichMedia = {
      resolveMediaCards: vi.fn().mockReturnValue([])
    };

    mockPatientManagement = {
      activePatient: signal({ id: 'P001', name: 'Anonymous Patient' })
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockPatientState },
      { provide: MarkdownService, useValue: mockMarkdown },
      { provide: ClinicalIntelligenceService, useValue: mockClinicalIntelligence },
      { provide: DictationService, useValue: mockDictation },
      { provide: SecureStorageService, useValue: mockSecureStorage },
      { provide: RichMediaService, useValue: mockRichMedia },
      { provide: PatientManagementService, useValue: mockPatientManagement }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new SummaryNodeComponent();
    });
  });

  it('should instantiate successfully with default signals', () => {
    expect(component).toBeTruthy();
    expect(component.proposalAccepted()).toBe(false);
    expect(component.isRejected()).toBe(false);
    expect(component.showChat()).toBe(false);
  });
});
