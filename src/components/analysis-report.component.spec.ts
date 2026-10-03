import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AnalysisReportComponent } from './analysis-report.component';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { DictationService } from '../services/dictation.service';
import { AuditService } from '../services/audit.service';
import { ExportService } from '../services/export.service';
import { ClinicalActLensMapperService } from '../services/clinical-act-lens-mapper.service';
import { MedicalDecoderService } from '../services/medical-decoder.service';
import { ParadigmLyricsService } from '../services/paradigm-lyrics.service';
import { ThemeService } from '../services/theme.service';
import { CompassionateAnalogyService } from '../services/compassionate-analogy.service';
import { SkepticalEpistemologyService } from '../services/skeptical-epistemology.service';
import { FhirIntegrationService } from '../services/fhir/fhir-integration.service';
import { AvsEngineService } from '../services/avs-engine.service';
import { AiCacheService } from '../services/ai-cache.service';
import { MarkdownService } from '../services/markdown.service';
import { BionicReadingService } from '../services/bionic-reading.service';

describe('AnalysisReportComponent Unit Suite', () => {
  let component: AnalysisReportComponent;
  let mockExport: any;
  let mockSkepticalService: any;
  let mockAvsService: any;

  beforeEach(async () => {
    mockExport = {
      exportCsvReport: vi.fn(),
      exportHl7v2Report: vi.fn(),
      exportSmartOnFhirBundle: vi.fn()
    };

    mockSkepticalService = {
      evaluateCdsCompliance: vi.fn().mockReturnValue({ score: 95, overallConfidencePercent: 95, pass: true, alerts: [] })
    };

    mockAvsService = {
      bitrateTier: signal('balanced'),
      setBitrateTier: vi.fn()
    };

    const mockState = {
      patientId: signal('p001'),
      patientName: signal('Jane Doe'),
      patientAge: signal(42),
      patientGender: signal('Female'),
      occupation: signal('Engineer'),
      vitals: signal({ bp: '120/80', hr: '72', temp: '98.6', spO2: '98', weight: '70kg', height: '175cm', cgmGlucoseMgDl: '110' }),
      issues: signal({}),
      symptoms: signal([]),
      conditions: signal([]),
      activePhilosophy: signal('western'),
      isEmergencyMode: signal(false),
      hoveredPartIdForOverlay: signal(null),
      hoveredViewModeForOverlay: signal(null),
      selectedPartId: signal(null),
      anatomyViewMode: signal(null),
      lensAnnotations: signal({}),
      analysisUpdateRequest: signal(0)
    };

    const mockIntel = {
      analysisResults: signal<Record<string, string>>({}),
      isLoading: signal(false),
      analysisMetrics: signal(null),
      streamingLens: signal(null),
      selectedPhilosophy: signal('western'),
      verificationResults: signal({})
    };

    await TestBed.configureTestingModule({
      imports: [AnalysisReportComponent],
      providers: [
        { provide: ClinicalIntelligenceService, useValue: mockIntel },
        { provide: PatientStateService, useValue: mockState },
        {
          provide: PatientManagementService,
          useValue: {
            selectedPatient: signal(null),
            selectedPatientId: signal('p001'),
            patients: signal([]),
            getPatientHistory: vi.fn().mockReturnValue([]),
            updateHistoryEntry: vi.fn(),
            addHistoryEntry: vi.fn()
          }
        },
        { provide: DictationService, useValue: { isDictating: signal(false), lastCommand: signal(null) } },
        { provide: AuditService, useValue: { logEvent: vi.fn(), logAction: vi.fn() } },
        { provide: ExportService, useValue: mockExport },
        { provide: ClinicalActLensMapperService, useValue: { getActTitleForLens: () => 'Act I', getActProposal: () => ({ title: 'Act I' }) } },
        { provide: MedicalDecoderService, useValue: { readingLevel: signal('patient') } },
        { provide: ParadigmLyricsService, useValue: { currentSong: signal(null), isPlaying: signal(false) } },
        { provide: ThemeService, useValue: { currentTheme: signal('dark') } },
        { provide: CompassionateAnalogyService, useValue: { getAnalogy: vi.fn() } },
        { provide: SkepticalEpistemologyService, useValue: mockSkepticalService },
        { provide: FhirIntegrationService, useValue: { buildFhirR4CarePlanBundle: vi.fn() } },
        { provide: AvsEngineService, useValue: mockAvsService },
        { provide: AiCacheService, useValue: { get: vi.fn(), set: vi.fn(), getAllEntries: vi.fn().mockResolvedValue([]) } },
        { provide: MarkdownService, useValue: { parse: (s: string) => s } },
        { provide: BionicReadingService, useValue: { isEnabled: signal(false) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(AnalysisReportComponent);
    component = fixture.componentInstance;
  }, 30000);

  it('1. Instantiates successfully with default activeLens as Summary Overview', () => {
    expect(component).toBeTruthy();
    expect(component.activeLens()).toBe('Summary Overview');
  });

  it('2. Navigates through available clinical lenses', () => {
    expect(component.availableLenses.length).toBeGreaterThan(5);
    expect(component.activeLensIndex()).toBe(0);

    if (component.hasNextLens()) {
      const nextTitle = component.getNextLensName();
      component.navigateToNextLens();
      expect(component.activeLens()).toBe(nextTitle);
      expect(component.activeLensIndex()).toBe(1);
    }
  });

  it('3. Selects explicit clinical lens directly via changeLens', () => {
    component.changeLens('Nutrition');
    expect(component.activeLens()).toBe('Nutrition');
  });

  it('4. Toggles clinical modal states correctly', () => {
    expect(component.showHandoffModal()).toBe(false);
    component.showHandoffModal.set(true);
    expect(component.showHandoffModal()).toBe(true);

    expect(component.showSec1557Modal()).toBe(false);
    component.showSec1557Modal.set(true);
    expect(component.showSec1557Modal()).toBe(true);
  });

  it('5. Exports CSV telemetry and triggers export service', () => {
    component.exportCsvTelemetry();
    expect(mockExport.exportCsvReport).toHaveBeenCalled();
    expect(component.flowToastMessage()).toContain('CSV Telemetry Exported');
  });

  it('6. Exports HL7 v2.5.1 ER7 message and triggers export service', () => {
    component.exportHl7v2Message();
    expect(mockExport.exportHl7v2Report).toHaveBeenCalled();
    expect(component.flowToastMessage()).toContain('HL7 v2.5.1');
  });

  it('7. Computes CDS compliance report through skeptical service', () => {
    const report = component.cdsReport();
    expect(report).toBeDefined();
    expect(report.overallConfidencePercent).toBe(95);
    expect(mockSkepticalService.evaluateCdsCompliance).toHaveBeenCalledWith('Summary Overview', 0);
  });

  it('8. Updates AVS engine bitrate tier', () => {
    component.setAvsBitrate('ultra' as any);
    expect(mockAvsService.setBitrateTier).toHaveBeenCalledWith('ultra');
  });
});
