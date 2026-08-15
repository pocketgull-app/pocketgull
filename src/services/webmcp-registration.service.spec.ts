// @vitest-environment jsdom
import '@angular/compiler';
import { vi, expect } from 'vitest';
import { Injector, runInInjectionContext, NgZone } from '@angular/core';
import { WebMcpRegistrationService } from './webmcp-registration.service';
import { PatientStateService } from './patient-state.service';
import { ClinicalIntelligenceService } from './clinical-intelligence.service';
import { ExportService } from './export.service';
import { TeledentistryService } from './teledentistry.service';
import { GcpHealthcareApiService } from './fhir/gcp-healthcare-api.service';
import { SkepticalEpistemologyService } from './skeptical-epistemology.service';
import { ClinicalMoERouterService } from './clinical-moe-router.service';

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
  let mockSkepticalService: any;
  let mockMoeRouter: any;
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

    mockSkepticalService = {
      evaluateCdsCompliance: vi.fn().mockReturnValue({ isFdaSection520oCompliant: true, overallConfidencePercent: 88 })
    };

    mockMoeRouter = {
      setCustomThinkingBudget: vi.fn(),
      currentThinkingConfig: vi.fn().mockReturnValue({ thinkingBudget: 4096, enabled: true })
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
        { provide: SkepticalEpistemologyService, useValue: mockSkepticalService },
        { provide: ClinicalMoERouterService, useValue: mockMoeRouter },
        { provide: NgZone, useValue: mockNgZone }
      ]
    });

    service = runInInjectionContext(injector, () => new WebMcpRegistrationService());
  });

  it('should register all 42 WebMCP agentic tools on modelContext', () => {
    service.registerTools({});

    expect(registeredTools.size).toBe(42);
    expect(registeredTools.has('open_zen_sanctuary')).toBe(true);
    expect(registeredTools.has('get_healing_postcards')).toBe(true);
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
    expect(registeredTools.has('calculate_skeptical_falsifiability_score')).toBe(true);
    expect(registeredTools.has('set_gemini_thinking_reasoning_budget')).toBe(true);
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

  it('should execute calculate_skeptical_falsifiability_score tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('calculate_skeptical_falsifiability_score');

    const result = await tool.execute({ lensName: 'Summary Overview' });
    expect(result.content[0].text).toContain('"isFdaSection520oCompliant": true');
    expect(mockSkepticalService.evaluateCdsCompliance).toHaveBeenCalledWith('Summary Overview');
  });

  it('should execute set_gemini_thinking_reasoning_budget tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('set_gemini_thinking_reasoning_budget');

    const result = await tool.execute({ thinkingBudget: 8192, enabled: true });
    expect(result.content[0].text).toContain('"thinkingBudget":4096');
    expect(mockMoeRouter.setCustomThinkingBudget).toHaveBeenCalledWith(8192);
  });

  it('should execute analyze_systemic_inflammatory_burden tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('analyze_systemic_inflammatory_burden');

    const result = await tool.execute({ hsCrp: 4.5, ppd: 5.0, sbp: 135 });
    expect(result.content[0].text).toContain('sibiScore');
    expect(result.content[0].text).toContain('cvRiskMultiplier');
  });

  it('should execute assess_cochrane_risk_of_bias tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('assess_cochrane_risk_of_bias');

    const result = await tool.execute({ studyTitle: 'RCT of High Dose EPA/DHA', randomization: 'LOW', missingData: 'LOW' });
    expect(result.content[0].text).toContain('LOW_RISK_OF_BIAS');
  });

  it('should execute query_biophysical_substrate_params tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('query_biophysical_substrate_params');

    const result = await tool.execute({ tissueType: 'bone' });
    expect(result.content[0].text).toContain('microgravityResorptionRate');
  });

  it('should execute evaluate_irmaa_medicare_surcharge_and_ssa44_appeal tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('evaluate_irmaa_medicare_surcharge_and_ssa44_appeal');

    const result = await tool.execute({ magi: 140000, filingStatus: 'single', lifeChangingEvents: ['WORK_REDUCTION'] });
    expect(result.content[0].text).toContain('Tier 2 Surcharge');
    expect(result.content[0].text).toContain('estimatedAnnualSavings');
  });

  it('should execute evaluate_medicare_billing_and_gfe_eligibility tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('evaluate_medicare_billing_and_gfe_eligibility');

    const result = await tool.execute({ annualRxCost: 3500, daysDeviceTransmitted: 18, clinicalMinutesLogged: 22, annualIncome: 25000 });
    expect(result.content[0].text).toContain('Protected by Inflation Reduction Act');
    expect(result.content[0].text).toContain('100% Charity Care discount');
  });

  it('should execute evaluate_hedis_quality_measures_and_care_gaps tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('evaluate_hedis_quality_measures_and_care_gaps');

    const result = await tool.execute({ systolicBp: 125, diastolicBp: 80, hbA1c: 7.1 });
    expect(result.content[0].text).toContain('overallStarRating');
    expect(result.content[0].text).toContain('isQualityBonusEligible');
  });

  it('should execute submit_fhir_davinci_prior_authorization_claim tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('submit_fhir_davinci_prior_authorization_claim');

    const result = await tool.execute({ cptCode: '70553', icd10DiagnosisCodes: ['G30.9'] });
    expect(result.content[0].text).toContain('ClaimResponse');
    expect(result.content[0].text).toContain('approved');
  });

  it('should execute crosswalk_snomed_ct_to_icd10_and_cpt tool', async () => {
    service.registerTools({});
    expect(registeredTools.has('crosswalk_snomed_ct_to_icd10_and_cpt')).toBe(true);
    expect(registeredTools.has('analyze_webgpu_bio_signal_tremor_and_rppg')).toBe(true);
    const tool = registeredTools.get('crosswalk_snomed_ct_to_icd10_and_cpt');

    const result = await tool.execute({ snomedCode: '26929004' });
    expect(result.content[0].text).toContain('G30.9');
    expect(result.content[0].text).toContain('http://snomed.info/sct');
  });

  it('should execute analyze_webgpu_bio_signal_tremor_and_rppg tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('analyze_webgpu_bio_signal_tremor_and_rppg');

    const result = await tool.execute({ displacementsMm: [0, 2.5, -2.5, 2.5, -2.5] });
    expect(result.content[0].text).toContain('100% CLIENT-SIDE WEBGPU COMPUTE GUARANTEE');
    expect(result.content[0].text).toContain('tremor');
  });

  it('should execute calculate_clinical_game_theory_adherence_incentives tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('calculate_clinical_game_theory_adherence_incentives');

    const result = await tool.execute({ annualCopayCostUsd: 480, estAnnualHospitalizationRiskUsd: 12500 });
    expect(result.content[0].text).toContain('NASH EQUILIBRIUM REACHED');
    expect(result.content[0].text).toContain('optimalRebateSubsidyUsd');
  });

  it('should execute prescribe_joy_and_playful_flourishing tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('prescribe_joy_and_playful_flourishing');

    const result = await tool.execute({ patientId: 'p010' });
    expect(result.content[0].text).toContain('prescriptions');
    expect(result.content[0].text).toContain('compositeJoyIndex');
  });

  it('should execute match_clinical_trials_for_patient_conditions tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('match_clinical_trials_for_patient_conditions');

    const result = await tool.execute({ conditionName: 'Parkinson Disease' });
    expect(result.content[0].text).toContain('NCT05214789');
    expect(result.content[0].text).toContain('RECRUITING');
  });

  it('should execute initiate_smart_on_fhir_ehr_launch tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('initiate_smart_on_fhir_ehr_launch');

    const result = await tool.execute({ vendor: 'EPIC' });
    expect(result.content[0].text).toContain('fhir.epic.com');
    expect(result.content[0].text).toContain('authorizationUrl');
  });

  it('should execute calculate_medicare_irmaa_and_ssa44_appeals tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('calculate_medicare_irmaa_and_ssa44_appeals');

    const result = await tool.execute({ magiUsd: 105000, filingStatus: 'single' });
    expect(result.content[0].text).toContain('currentTier');
    expect(result.content[0].text).toContain('appealAssessment');
  });

  it('should execute render_webgpu_3d_organ_digital_twin tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('render_webgpu_3d_organ_digital_twin');

    const result = await tool.execute({ organ: 'HEART', heartRateBpm: 80 });
    expect(result.content[0].text).toContain('HEART');
    expect(result.content[0].text).toContain('biophysics');
  });

  it('should execute guide_user_onboarding_walkthrough tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('guide_user_onboarding_walkthrough');

    const result = await tool.execute({ action: 'START', persona: 'PATIENT' });
    expect(result.content[0].text).toContain('PATIENT');
    expect(result.content[0].text).toContain('currentStepIndex');
  });

  it('should execute navigate_user_way_back_home tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('navigate_user_way_back_home');

    const result = await tool.execute({});
    expect(result.content[0].text).toContain('SUCCESS');
    expect(result.content[0].text).toContain('chart');
  });

  it('should execute retrieve_helpful_community_and_clinical_lists tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('retrieve_helpful_community_and_clinical_lists');

    const result = await tool.execute({ category: 'EMERGENCY_HOTLINES' });
    expect(result.content[0].text).toContain('EMERGENCY_HOTLINES');
    expect(result.content[0].text).toContain('988');
  });

  it('should execute translate_clinical_care_plan_multilingual tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('translate_clinical_care_plan_multilingual');

    const result = await tool.execute({ text: 'Monitor vitals', targetLanguageCode: 'es' });
    expect(result.content[0].text).toContain('Resumen en Español');
    expect(result.content[0].text).toContain('es');
  });

  it('should execute calculate_who_cdc_health_equity_index tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('calculate_who_cdc_health_equity_index');

    const result = await tool.execute({ sdoh: { foodInsecurity: true } });
    expect(result.content[0].text).toContain('compositeEquityIndex');
    expect(result.content[0].text).toContain('SNAP');
  });

  it('should execute recommend_sustainability_and_eco_health_actions tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('recommend_sustainability_and_eco_health_actions');

    const result = await tool.execute({ category: 'COMPUTE_ENERGY' });
    expect(result.content[0].text).toContain('COMPUTE_ENERGY');
    expect(result.content[0].text).toContain('WebGPU');
  });

  it('should execute localize_community_eco_health_hubs tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('localize_community_eco_health_hubs');

    const result = await tool.execute({ hubType: 'FOREST_PARK' });
    expect(result.content[0].text).toContain('Golden Gate Park');
    expect(result.content[0].text).toContain('phytoncides');
  });

  it('should execute export_complete_fhir_r4_health_sovereignty_bundle tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('export_complete_fhir_r4_health_sovereignty_bundle');

    const result = await tool.execute({ format: 'JSON' });
    expect(result.content[0].text).toContain('Bundle');
    expect(result.content[0].text).toContain('collection');
  });

  it('should execute open_zen_sanctuary tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('open_zen_sanctuary');
    expect(tool).toBeDefined();

    const result = await tool.execute({});
    expect(result.content[0].text).toContain('ACTIVE');
    expect(result.content[0].text).toContain('432Hz Tibetan Singing Bowl');
  });

  it('should execute get_healing_postcards tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('get_healing_postcards');
    expect(tool).toBeDefined();

    const result = await tool.execute({ limit: 3 });
    expect(result.content[0].text).toContain('postcardsCount');
  });

  it('should unregister all tools when unregisterTools is called', () => {
    service.registerTools({});
    expect((service as any).mcpControllers.length).toBe(42);

    service.unregisterTools();
    expect((service as any).mcpControllers.length).toBe(0);
  });
});
