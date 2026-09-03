import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { AnalysisContainerComponent } from './analysis-container.component';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';
import { AiCacheService } from '../services/ai-cache.service';
import { GamificationService } from '../services/gamification.service';
import { ExportService } from '../services/export.service';
import { GcpHealthcareApiService } from '../services/fhir/gcp-healthcare-api.service';
import { NetworkStateService } from '../services/network-state.service';
import { IntelligenceProviderToken } from '../services/ai/intelligence.provider.token';

describe('AnalysisContainerComponent Unit Suite', () => {
  let component: AnalysisContainerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalysisContainerComponent],
      providers: [
        PatientStateService,
        PatientManagementService,
        ClinicalIntelligenceService,
        AiCacheService,
        GamificationService,
        ExportService,
        GcpHealthcareApiService,
        NetworkStateService,
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock clinical synthesis'),
            streamContent: vi.fn()
          }
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(AnalysisContainerComponent);
    component = fixture.componentInstance;
  });

  it('1. Initializes default view modes and modal state signals', () => {
    expect(component.viewMode()).toBe('lenses');
    expect(component.showEdgeAiModal()).toBe(false);
    expect(component.showSteeepModal()).toBe(false);
    expect(component.showSoapModal()).toBe(false);
    expect(component.showSimulatorModal()).toBe(false);
  });

  it('2. Toggles Edge AI and NAM STEEEP Quality HUD modals', () => {
    component.showEdgeAiModal.set(true);
    expect(component.showEdgeAiModal()).toBe(true);

    component.showSteeepModal.set(true);
    expect(component.showSteeepModal()).toBe(true);

    component.showEdgeAiModal.set(false);
    expect(component.showEdgeAiModal()).toBe(false);
  });

  it('3. Selects clinical philosophy and updates state', () => {
    component.selectPhilosophy('eastern');
    expect(component.state.activePhilosophy()).toBe('eastern');

    component.selectPhilosophy('ayurvedic');
    expect(component.state.activePhilosophy()).toBe('ayurvedic');

    component.selectPhilosophy('western');
    expect(component.state.activePhilosophy()).toBe('western');
  });
});
