// @vitest-environment jsdom
import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Injector, runInInjectionContext, NgZone } from '@angular/core';
import { WebMcpRegistrationService } from './webmcp-registration.service';
import { PatientStateService } from './patient-state.service';
import { ClinicalIntelligenceService } from './clinical-intelligence.service';
import { ExportService } from './export.service';
import { TeledentistryService } from './teledentistry.service';
import { GcpHealthcareApiService } from './gcp-healthcare-api.service';

vi.mock('@mcp-b/webmcp-polyfill', () => ({
  initializeWebMCPPolyfill: vi.fn()
}));

describe('WebMcpRegistrationService', () => {
  let service: WebMcpRegistrationService;
  let mockPatientState: any;
  let mockClinicalIntelligence: any;
  let mockExportService: any;
  let mockTeledentistryService: any;
  let mockGcpHealthcareService: any;
  let mockModelContext: any;
  let registeredTools: Map<string, any>;

  beforeEach(() => {
    registeredTools = new Map();

    mockModelContext = {
      registerTool: vi.fn((tool: any, options: any) => {
        registeredTools.set(tool.name, tool);
      })
    };

    Object.defineProperty(document, 'modelContext', {
      value: mockModelContext,
      writable: true,
      configurable: true
    });
    if (typeof navigator !== 'undefined') {
      Object.defineProperty(navigator, 'modelContext', {
        value: mockModelContext,
        writable: true,
        configurable: true
      });
    }

    mockPatientState = {
      getAllDataForPrompt: vi.fn().mockReturnValue('Mock Patient Clinical Prompt Data'),
      getCurrentState: vi.fn().mockReturnValue({ patientId: 'p001', name: 'Charles Darwin', vitals: { hr: 72 } }),
      selectPart: vi.fn(),
      updateIssue: vi.fn(),
      selectNote: vi.fn(),
      requestResearchUrl: vi.fn(),
      toggleResearchFrame: vi.fn(),
      purgeTransientPatientState: vi.fn().mockReturnValue({ timestamp: '2026-08-09T00:00:00Z', purgedItemsCount: 3 }),
      toggleEphemeralPrivacyMode: vi.fn().mockReturnValue(true)
    };

    mockClinicalIntelligence = {
      generateComprehensiveReport: vi.fn().mockResolvedValue({ reportTitle: 'Clinical Analysis Report' }),
      translateReadingLevel: vi.fn().mockResolvedValue('Simplified clinical translation text.')
    };

    mockExportService = {
      exportCsvReport: vi.fn(),
      exportHl7v2Report: vi.fn(),
      exportFHIR: vi.fn().mockReturnValue({ resourceType: 'Bundle', entry: [] }),
      csvStrategy: {
        generatePatientCsv: vi.fn().mockReturnValue('patient_id,hr\np001,72')
      },
      hl7v2Strategy: {
        generateHl7v2Message: vi.fn().mockReturnValue('MSH|^~\\&|POCKETGULL|')
      }
    };

    mockTeledentistryService = {
      teeth: vi.fn().mockReturnValue([{ fdiNumber: 16, probingDepthMm: 5, hasBleedingOnProbing: true, cariesSurfaces: ['O'], twiGrade: 2 }]),
      hsCRP: vi.fn().mockReturnValue(2.4),
      deepPocketsCount: vi.fn().mockReturnValue(1),
      bleedingPercentage: vi.fn().mockReturnValue(25),
      sibiScore: vi.fn().mockReturnValue(42),
      cvRiskMultiplier: vi.fn().mockReturnValue(1.76),
      predictedHbA1cElevation: vi.fn().mockReturnValue(0.34),
      setProbingDepth: vi.fn(),
      toggleBOP: vi.fn(),
      setTWIGrade: vi.fn()
    };

    mockGcpHealthcareService = {
      deidentifyFhirPayload: vi.fn().mockImplementation((payload) => ({ ...payload, deidentified: true })),
      syncHybridFhirBundle: vi.fn().mockResolvedValue({ gcpSyncSuccess: true, awsSyncSuccess: true, timestamp: '2026-08-09T00:00:00Z' })
    };

    const mockNgZone = {
      run: (fn: Function) => fn()
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: ClinicalIntelligenceService, useValue: mockClinicalIntelligence },
        { provide: ExportService, useValue: mockExportService },
        { provide: TeledentistryService, useValue: mockTeledentistryService },
        { provide: GcpHealthcareApiService, useValue: mockGcpHealthcareService },
        { provide: NgZone, useValue: mockNgZone }
      ]
    });

    service = runInInjectionContext(injector, () => new WebMcpRegistrationService());
  });

  it('should register all 15 WebMCP agentic tools on modelContext', () => {
    service.registerTools({});

    expect(registeredTools.size).toBe(15);
    expect(registeredTools.has('generate_medical_summary')).toBe(true);
    expect(registeredTools.has('translate_clinical_text')).toBe(true);
    expect(registeredTools.has('get_current_patient_data')).toBe(true);
    expect(registeredTools.has('navigate_to_body_part')).toBe(true);
    expect(registeredTools.has('inject_clinical_note')).toBe(true);
    expect(registeredTools.has('load_research_url')).toBe(true);
    expect(registeredTools.has('add_research_bookmark')).toBe(true);
    expect(registeredTools.has('export_patient_csv_telemetry')).toBe(true);
    expect(registeredTools.has('export_patient_hl7v2_message')).toBe(true);
    expect(registeredTools.has('purge_transient_patient_state')).toBe(true);
    expect(registeredTools.has('toggle_ephemeral_privacy_mode')).toBe(true);
    expect(registeredTools.has('get_teledentistry_systemic_telemetry')).toBe(true);
    expect(registeredTools.has('update_tooth_periodontal_status')).toBe(true);
    expect(registeredTools.has('export_patient_care_plan_fhir_r4')).toBe(true);
    expect(registeredTools.has('trigger_hybrid_fhir_dual_sync')).toBe(true);
  });

  it('should execute generate_medical_summary tool successfully', async () => {
    service.registerTools({});
    const tool = registeredTools.get('generate_medical_summary');

    const result = await tool.execute({});
    expect(result.content[0].text).toContain('Clinical Analysis Report');
    expect(mockClinicalIntelligence.generateComprehensiveReport).toHaveBeenCalled();
  });

  it('should execute translate_clinical_text tool with valid parameters', async () => {
    service.registerTools({});
    const tool = registeredTools.get('translate_clinical_text');

    const result = await tool.execute({ text: 'Patient presents with arthralgia', targetLevel: 'simplified' });
    expect(result.content[0].text).toBe('Simplified clinical translation text.');
    expect(mockClinicalIntelligence.translateReadingLevel).toHaveBeenCalledWith('Patient presents with arthralgia', 'simplified');
  });

  it('should execute get_current_patient_data tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('get_current_patient_data');

    const result = await tool.execute({});
    expect(result.content[0].text).toContain('Charles Darwin');
  });

  it('should execute navigate_to_body_part tool for valid body part', async () => {
    const onNavSpy = vi.fn();
    service.registerTools({ onNavigateToBodyPart: onNavSpy });
    const tool = registeredTools.get('navigate_to_body_part');

    const result = await tool.execute({ partId: 'head' });
    expect(result.content[0].text).toContain('Head & Neck');
    expect(mockPatientState.selectPart).toHaveBeenCalledWith('head');
    expect(onNavSpy).toHaveBeenCalledWith('head');
  });

  it('should execute inject_clinical_note tool successfully', async () => {
    service.registerTools({});
    const tool = registeredTools.get('inject_clinical_note');

    const result = await tool.execute({
      partId: 'r_thigh',
      painLevel: 6,
      description: 'Right thigh strain noted.',
      recommendation: 'Cold compress and elevation.'
    });

    expect(result.content[0].text).toContain('Right Thigh');
    expect(mockPatientState.updateIssue).toHaveBeenCalled();
  });

  it('should execute export_patient_csv_telemetry tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('export_patient_csv_telemetry');

    const result = await tool.execute({ downloadFile: true });
    expect(result.content[0].text).toBe('patient_id,hr\np001,72');
    expect(mockExportService.exportCsvReport).toHaveBeenCalled();
  });

  it('should execute export_patient_hl7v2_message tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('export_patient_hl7v2_message');

    const result = await tool.execute({ downloadFile: true });
    expect(result.content[0].text).toBe('MSH|^~\\&|POCKETGULL|');
    expect(mockExportService.exportHl7v2Report).toHaveBeenCalled();
  });

  it('should execute export_patient_care_plan_fhir_r4 tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('export_patient_care_plan_fhir_r4');

    const result = await tool.execute({});
    expect(result.content[0].text).toContain('"deidentified": true');
    expect(mockExportService.exportFHIR).toHaveBeenCalled();
    expect(mockGcpHealthcareService.deidentifyFhirPayload).toHaveBeenCalled();
  });

  it('should execute trigger_hybrid_fhir_dual_sync tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('trigger_hybrid_fhir_dual_sync');

    const result = await tool.execute({});
    expect(result.content[0].text).toContain('"gcpSyncSuccess": true');
    expect(mockGcpHealthcareService.syncHybridFhirBundle).toHaveBeenCalled();
  });

  it('should execute purge_transient_patient_state tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('purge_transient_patient_state');

    const result = await tool.execute({});
    expect(result.content[0].text).toContain('Successfully purged 3 transient items');
    expect(mockPatientState.purgeTransientPatientState).toHaveBeenCalled();
  });

  it('should execute toggle_ephemeral_privacy_mode tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('toggle_ephemeral_privacy_mode');

    const result = await tool.execute({ enabled: true });
    expect(result.content[0].text).toContain('Ephemeral Privacy Mode set to: ENABLED');
    expect(mockPatientState.toggleEphemeralPrivacyMode).toHaveBeenCalledWith(true);
  });

  it('should execute get_teledentistry_systemic_telemetry tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('get_teledentistry_systemic_telemetry');

    const result = await tool.execute({});
    expect(result.content[0].text).toContain('"sibiScore": 42');
    expect(mockTeledentistryService.sibiScore).toHaveBeenCalled();
  });

  it('should execute update_tooth_periodontal_status tool for valid FDI tooth', async () => {
    service.registerTools({});
    const tool = registeredTools.get('update_tooth_periodontal_status');

    const result = await tool.execute({ fdiNumber: 16, probingDepthMm: 6, hasBleedingOnProbing: true });
    expect(result.content[0].text).toContain('Successfully updated FDI Tooth 16');
    expect(mockTeledentistryService.setProbingDepth).toHaveBeenCalledWith(16, 6);
  });

  it('should unregister all tools when unregisterTools is called', () => {
    service.registerTools({});
    expect((service as any).mcpControllers.length).toBe(15);

    service.unregisterTools();
    expect((service as any).mcpControllers.length).toBe(0);
  });
});
