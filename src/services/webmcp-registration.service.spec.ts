// @vitest-environment jsdom
import '@angular/compiler';
import { vi } from 'vitest';
import { Injector, runInInjectionContext, NgZone } from '@angular/core';
import { WebMcpRegistrationService } from './webmcp-registration.service';
import { PatientStateService } from './patient-state.service';
import { ClinicalIntelligenceService } from './clinical-intelligence.service';
import { ExportService } from './export.service';
import { TeledentistryService } from './teledentistry.service';
import { GcpHealthcareApiService } from './fhir/gcp-healthcare-api.service';
import { SkepticalEpistemologyService } from './skeptical-epistemology.service';
import { ClinicalMoERouterService } from './clinical-moe-router.service';
import { ClinicalGraphQLService } from './clinical-graphql.service';
import { ClinicalContextModeService } from './clinical-context-mode.service';
import { AcademicCitationService } from './academic-citation.service';
import { GlobalHealthUtilityService } from './global-health-utility.service';
import { SocialPragmaticsGymService } from './social-pragmatics-gym.service';
import { SocraticEvidenceLiteracyService } from './socratic-evidence-literacy.service';
import { WebBluetoothTelemetryService } from './hardware/web-bluetooth-telemetry.service';

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

    const mockGraphqlService = {
      executeQuery: vi.fn().mockResolvedValue({
        data: {
          patient: { name: 'Maya Torres', vitals: { heartRate: 74 } }
        }
      })
    };

    const mockContextModeService = {
      setMode: vi.fn()
    };

    const mockCitationService = {
      exportCitationDossier: vi.fn().mockReturnValue({
        queryTopic: 'Section504FolioComponent',
        totalCitations: 1,
        entries: [{ id: 'cite-cgm', title: 'Beck RW' }],
        amaBibliography: ['Beck RW. JAMA 2017.']
      })
    };

    const mockUtilityService = {
      evaluateUtility: vi.fn().mockReturnValue({
        patientCohortSize: 1000,
        totalQalyGainedPerDecade: 2100,
        totalClinicianHoursSavedAnnual: 18400
      })
    };

    const mockSocialGymService = {
      resetSession: vi.fn(),
      processUserResponse: vi.fn(),
      generateTelemetryReport: vi.fn().mockReturnValue({
        sessionId: 'SOC-TEST-1',
        personaName: 'Maya',
        curiosityRatio: 60,
        empathyDepthTier: 'Level 3 (Resonant Attunement)'
      })
    };

    const mockSocraticService = {
      evaluateClaim: vi.fn().mockReturnValue({
        claimId: 'SOC-EVID-TEST-1',
        analyzedTopic: 'Periodontal-Systemic Cross-Talk (SIBI)',
        evidenceTier: 'Level A (Meta-Analysis / Large RCTs)'
      })
    };

    const mockBleService = {
      startSimulatedTelemetry: vi.fn(),
      disconnect: vi.fn(),
      getTelemetrySnapshot: vi.fn().mockReturnValue({
        deviceName: 'Polar H10 BLE Sensor',
        connected: true,
        heartRateBpm: 74,
        hrvRmssdMs: 62,
        spo2Pct: 98
      })
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
        { provide: ClinicalGraphQLService, useValue: mockGraphqlService },
        { provide: ClinicalContextModeService, useValue: mockContextModeService },
        { provide: AcademicCitationService, useValue: mockCitationService },
        { provide: GlobalHealthUtilityService, useValue: mockUtilityService },
        { provide: SocialPragmaticsGymService, useValue: mockSocialGymService },
        { provide: SocraticEvidenceLiteracyService, useValue: mockSocraticService },
        { provide: WebBluetoothTelemetryService, useValue: mockBleService },
        { provide: NgZone, useValue: mockNgZone }
      ]
    });

    service = runInInjectionContext(injector, () => new WebMcpRegistrationService());
  });

  it('should register all 80 WebMCP agentic tools on modelContext', () => {
    service.registerTools({});

    expect(registeredTools.size).toBe(80);
    expect(registeredTools.has('open_zen_sanctuary')).toBe(true);
    expect(registeredTools.has('get_healing_postcards')).toBe(true);
    expect(registeredTools.has('evaluate_ssa_disability_and_blue_book_listings')).toBe(true);
    expect(registeredTools.has('get_jurisdictional_compliance_and_regulatory_matrix')).toBe(true);
    expect(registeredTools.has('query_mandiant_threat_intelligence_and_defense')).toBe(true);
    expect(registeredTools.has('administer_clinical_mandarinate_exam')).toBe(true);
    expect(registeredTools.has('precision_medicine_might_reasoning')).toBe(true);
    expect(registeredTools.has('harvard_udn_case_triage')).toBe(true);
    expect(registeredTools.has('simulate_n_of_one_bayesian_trial')).toBe(true);
    expect(registeredTools.has('matchmaker_exchange_patient_crossmatch')).toBe(true);
    expect(registeredTools.has('generate_precision_regulatory_dossier')).toBe(true);
    expect(registeredTools.has('create_amazon_wall_art_listing')).toBe(true);
    expect(registeredTools.has('generate_amazon_marketplace_listings')).toBe(true);
    expect(registeredTools.has('train_intergenerational_wisdom_nexus')).toBe(true);
    expect(registeredTools.has('optimize_youth_cognitive_and_circadian_hygiene')).toBe(true);
    expect(registeredTools.has('generate_future_care_and_longevity_plan')).toBe(true);
    expect(registeredTools.has('navigate_clinical_social_work_and_sdoh')).toBe(true);
    expect(registeredTools.has('evaluate_addiction_recovery_and_harm_reduction')).toBe(true);
    expect(registeredTools.has('resolve_clinical_nlp_context')).toBe(true);
    expect(registeredTools.has('audit_clinical_coding_and_hcc_risk')).toBe(true);
    expect(registeredTools.has('issue_him_ceu_microcredential')).toBe(true);
    expect(registeredTools.has('execute_fhir_da_vinci_prior_auth_pas')).toBe(true);
    expect(registeredTools.has('evaluate_maternal_postpartum_sentinel')).toBe(true);
    expect(registeredTools.has('screen_female_cardiac_atypical_ischemia')).toBe(true);
    expect(registeredTools.has('reduce_autoimmune_and_endometriosis_diagnostic_delay')).toBe(true);
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

  it('should execute evaluate_ssa_disability_and_blue_book_listings tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('evaluate_ssa_disability_and_blue_book_listings');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      claimantAge: 58,
      primaryDiagnosis: 'Chronic Heart Failure',
      ejectionFractionPercent: 25
    });
    expect(result.content[0].text).toContain('SSA-FHIR-PROV-');
    expect(result.content[0].text).toContain('4.02');
  });

  it('should register all 80 WebMCP agentic tools on modelContext', () => {
    service.registerTools({});

    expect(registeredTools.size).toBe(80);
    expect(registeredTools.has('open_zen_sanctuary')).toBe(true);
    expect(registeredTools.has('get_healing_postcards')).toBe(true);
    expect(registeredTools.has('evaluate_ssa_disability_and_blue_book_listings')).toBe(true);
    expect(registeredTools.has('get_jurisdictional_compliance_and_regulatory_matrix')).toBe(true);
    expect(registeredTools.has('query_mandiant_threat_intelligence_and_defense')).toBe(true);
    expect(registeredTools.has('administer_clinical_mandarinate_exam')).toBe(true);
    expect(registeredTools.has('precision_medicine_might_reasoning')).toBe(true);
    expect(registeredTools.has('harvard_udn_case_triage')).toBe(true);
    expect(registeredTools.has('simulate_n_of_one_bayesian_trial')).toBe(true);
    expect(registeredTools.has('matchmaker_exchange_patient_crossmatch')).toBe(true);
    expect(registeredTools.has('generate_precision_regulatory_dossier')).toBe(true);
    expect(registeredTools.has('create_amazon_wall_art_listing')).toBe(true);
    expect(registeredTools.has('generate_amazon_marketplace_listings')).toBe(true);
    expect(registeredTools.has('train_intergenerational_wisdom_nexus')).toBe(true);
    expect(registeredTools.has('optimize_youth_cognitive_and_circadian_hygiene')).toBe(true);
    expect(registeredTools.has('generate_future_care_and_longevity_plan')).toBe(true);
    expect(registeredTools.has('navigate_clinical_social_work_and_sdoh')).toBe(true);
    expect(registeredTools.has('evaluate_addiction_recovery_and_harm_reduction')).toBe(true);
    expect(registeredTools.has('resolve_clinical_nlp_context')).toBe(true);
    expect(registeredTools.has('audit_clinical_coding_and_hcc_risk')).toBe(true);
    expect(registeredTools.has('issue_him_ceu_microcredential')).toBe(true);
    expect(registeredTools.has('execute_fhir_da_vinci_prior_auth_pas')).toBe(true);
    expect(registeredTools.has('evaluate_maternal_postpartum_sentinel')).toBe(true);
    expect(registeredTools.has('screen_female_cardiac_atypical_ischemia')).toBe(true);
    expect(registeredTools.has('reduce_autoimmune_and_endometriosis_diagnostic_delay')).toBe(true);
  });

  it('should execute evaluate_maternal_postpartum_sentinel tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('evaluate_maternal_postpartum_sentinel');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      systolicBp: 162,
      diastolicBp: 110,
      daysPostpartum: 10,
      symptoms: { severeHeadacheUnrelievedByMeds: true }
    });
    expect(result.content[0].text).toContain('CRITICAL_EMERGENCY');
    expect(result.content[0].text).toContain('Late Postpartum Preeclampsia');
    expect(result.content[0].text).toContain('ACOG AIM Equity Protocol');
  });

  it('should execute screen_female_cardiac_atypical_ischemia tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('screen_female_cardiac_atypical_ischemia');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      patientAge: 52,
      highSensitivityTroponinI_ng_L: 20.0,
      symptoms: { epigastricBurningOrNausea: true, unexplainedProfoundFatigue: true }
    });
    expect(result.content[0].text).toContain('isElevatedByFemaleStandard');
    expect(result.content[0].text).toContain('YENTL SYNDROME PREVENTION');
  });

  it('should execute reduce_autoimmune_and_endometriosis_diagnostic_delay tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('reduce_autoimmune_and_endometriosis_diagnostic_delay');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      patientAge: 31,
      symptomsDurationMonths: 36,
      symptoms: { severeCyclicalPelvicPainOrDysmenorrhea: true, deepDyspareuniaOrInfertility: true }
    });
    expect(result.content[0].text).toContain('ENDOMETRIOSIS_RASRM');
    expect(result.content[0].text).toContain('diagnosticDelayReductionYearsEstimate');
    expect(result.content[0].text).toContain('OBJECTIVE CLINICAL DISMISSAL DEFENSE');
  });

  it('should execute issue_him_ceu_microcredential tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('issue_him_ceu_microcredential');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      trackId: 'track-ai-cdis',
      recipientName: 'Sarah Jenkins, RHIA'
    });
    expect(result.content[0].text).toContain('CEU-AHIMA-');
    expect(result.content[0].text).toContain('Sarah Jenkins, RHIA');
    expect(result.content[0].text).toContain('AI-Supervised Clinical Documentation Integrity');
  });

  it('should execute execute_fhir_da_vinci_prior_auth_pas tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('execute_fhir_da_vinci_prior_auth_pas');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      patientId: 'p_test_davinci',
      patientName: 'Marie Curie',
      payerId: 'UHC',
      serviceCode: '81415',
      diagnosisCode: 'G35',
      clinicalEvidence: [
        'Progressive neurodegenerative symptoms refractory to treatment.',
        'High probability of monogenic mitochondrial defect.'
      ]
    });
    expect(result.content[0].text).toContain('INSTANT_APPROVED');
    expect(result.content[0].text).toContain('AUTH-PAS-');
    expect(result.content[0].text).toContain('x12Transaction278Sample');
  });

  it('should execute audit_clinical_coding_and_hcc_risk tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('audit_clinical_coding_and_hcc_risk');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      chartText: 'Patient has long-standing T2DM with diabetic peripheral neuropathy and chronic systolic heart failure.'
    });
    expect(result.content[0].text).toContain('E11.40');
    expect(result.content[0].text).toContain('I50.22');
    expect(result.content[0].text).toContain('HCC 37');
    expect(result.content[0].text).toContain('denialDefensePacketText');
  });

  it('should execute resolve_clinical_nlp_context tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('resolve_clinical_nlp_context');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      clinicalText: 'Patient denies chest pain and palpitations, but experiences severe dyspnea after walking up stairs. Mother had breast cancer.'
    });
    expect(result.content[0].text).toContain('Dyspnea');
    expect(result.content[0].text).toContain('Chest Pain');
    expect(result.content[0].text).toContain('Malignant Neoplasm of Breast');
    expect(result.content[0].text).toContain('ConText/NegEx');
  });

  it('should execute create_amazon_wall_art_listing tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('create_amazon_wall_art_listing');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      sku: 'CELL',
      includeSpApiFeed: true
    });
    expect(result.content[0].text).toContain('PG-ART-CELL-001-3X4');
    expect(result.content[0].text).toContain('PocketGull Fine Art');
    expect(result.content[0].text).toContain('spApiBatchFeed');
  });

  it('should execute matchmaker_exchange_patient_crossmatch tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('matchmaker_exchange_patient_crossmatch');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      gene: 'AXIN2'
    });
    expect(result.content[0].text).toContain('AXIN2');
    expect(result.content[0].text).toContain('Broad CMG');
    expect(result.content[0].text).toContain('matchCount');
  });

  it('should execute generate_precision_regulatory_dossier tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('generate_precision_regulatory_dossier');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      gene: 'NGLY1',
      dossierType: 'both'
    });
    expect(result.content[0].text).toContain('NGLY1');
    expect(result.content[0].text).toContain('NIH U54');
    expect(result.content[0].text).toContain('21 CFR §312.310');
  });

  it('should execute simulate_n_of_one_bayesian_trial tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('simulate_n_of_one_bayesian_trial');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      drugCandidate: 'N-Acetylglucosamine',
      targetGene: 'NGLY1',
      trueEffectSize: 0.75
    });
    expect(result.content[0].text).toContain('N-Acetylglucosamine');
    expect(result.content[0].text).toContain('NGLY1');
    expect(result.content[0].text).toContain('finalProbabilityEfficacy');
  });

  it('should execute precision_medicine_might_reasoning tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('precision_medicine_might_reasoning');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      gene: 'NGLY1',
      mutation: 'c.1201A>T',
      exportFhirBundle: true
    });
    expect(result.content[0].text).toContain('NGLY1');
    expect(result.content[0].text).toContain('N-Acetylglucosamine');
    expect(result.content[0].text).toContain('fhir-might-precision-');
  });

  it('should execute harvard_udn_case_triage tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('harvard_udn_case_triage');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      gene: 'AXIN2',
      exportGatewayBundle: true
    });
    expect(result.content[0].text).toContain('AXIN2');
    expect(result.content[0].text).toContain('Danio rerio');
    expect(result.content[0].text).toContain('fhir-udn-harvard-');
  });

  it('should execute administer_clinical_mandarinate_exam tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('administer_clinical_mandarinate_exam');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      caseId: 'CASE-CARDIO-01'
    });
    expect(result.content[0].text).toContain('CASE-CARDIO-01');
    expect(result.content[0].text).toContain('overallScore');
    expect(result.content[0].text).toContain('KEJU-CERT-');
  });

  it('should execute evaluate_addiction_recovery_and_harm_reduction tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('evaluate_addiction_recovery_and_harm_reduction');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      patientAge: 29,
      primarySubstance: 'Opioids_Fentanyl',
      durationOfUseMonths: 14,
      lastUseHoursAgo: 10,
      priorPrecipitatedWithdrawalHistory: true,
      currentWithdrawalSymptoms: {
        tachycardiaPulseOver100: true,
        diaphoresisSweating: true,
        tremorsOrRestlessness: true
      }
    });
    expect(result.content[0].text).toContain('SUD-REC-');
    expect(result.content[0].text).toContain('Bernese Micro-Induction');
    expect(result.content[0].text).toContain('Naloxone');
  });

  it('should register tool #66: generate_section_504_school_accommodation_plan', async () => {
    service.registerTools({});
    const tool = registeredTools.get('generate_section_504_school_accommodation_plan');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      patientId: 'p202',
      studentName: 'Maya Vance',
      conditionCategory: 'type1_diabetes',
      gradeLevel: 'Grade 7',
      schoolName: 'Westview Middle School'
    });
    expect(result.content[0].text).toContain('Type 1 Diabetes Mellitus');
    expect(result.content[0].text).toContain('t1d-cgm');
    expect(result.content[0].text).toContain('Baqsimi');
  });

  it('should register tool #67: generate_steering_committee_governance_dossier', async () => {
    service.registerTools({});
    const tool = registeredTools.get('generate_steering_committee_governance_dossier');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      institutionName: 'Stanford Healthcare Consortia',
      reportingQuarter: '2026-Q3'
    });
    expect(result.content[0].text).toContain('Stanford Healthcare Consortia');
    expect(result.content[0].text).toContain('2026-Q3');
    expect(result.content[0].text).toContain('fdaSection520oComplianceScore');
  });

  it('should register tool #68: generate_pediatric_substitute_teacher_and_courage_card', async () => {
    service.registerTools({});
    const tool = registeredTools.get('generate_pediatric_substitute_teacher_and_courage_card');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      patientId: 'p303',
      studentName: 'Maya Torres',
      conditionCategory: 'type1_diabetes'
    });
    expect(result.content[0].text).toContain('substituteCard');
    expect(result.content[0].text).toContain('courageBadge');
    expect(result.content[0].text).toContain('Glucose Harmony');
  });

  it('should register tool #69: execute_clinical_graphql_query', async () => {
    service.registerTools({});
    const tool = registeredTools.get('execute_clinical_graphql_query');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      query: `
        query GetContext($id: ID!) {
          patient(id: $id) {
            name
            vitals { heartRate }
          }
        }
      `,
      variables: { id: 'p001' }
    });
    expect(result.content[0].text).toContain('data');
    expect(result.content[0].text).toContain('patient');
    expect(result.content[0].text).toContain('74');
  });

  it('should register tool #70: set_clinical_interface_context_mode', async () => {
    service.registerTools({});
    const tool = registeredTools.get('set_clinical_interface_context_mode');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      mode: 'school_safety',
      reason: 'School nurse reviewing emergency protocol'
    });
    expect(result.content[0].text).toContain('school_safety');
    expect(result.content[0].text).toContain('School nurse reviewing emergency protocol');
  });

  it('should register tool #71: generate_academic_citation_dossier', async () => {
    service.registerTools({});
    const tool = registeredTools.get('generate_academic_citation_dossier');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      queryTopic: 'Section504FolioComponent'
    });
    expect(result.content[0].text).toContain('Section504FolioComponent');
    expect(result.content[0].text).toContain('Beck RW');
  });

  it('should register tool #72: inspect_active_view_citations', async () => {
    service.registerTools({});
    const tool = registeredTools.get('inspect_active_view_citations');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      lensOrTopic: 'Section 504'
    });
    expect(result.content[0].text).toContain('status');
    expect(result.content[0].text).toContain('success');
    expect(result.content[0].text).toContain('matchedEvidenceEntries');
  });

  it('should register tool #73: calculate_global_health_and_humanitarian_utility', async () => {
    service.registerTools({});
    const tool = registeredTools.get('calculate_global_health_and_humanitarian_utility');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      cohortSize: 1000
    });
    expect(result.content[0].text).toContain('patientCohortSize');
    expect(result.content[0].text).toContain('totalQalyGainedPerDecade');
  });

  it('should register tool #74: evaluate_social_conversational_pragmatics', async () => {
    service.registerTools({});
    const tool = registeredTools.get('evaluate_social_conversational_pragmatics');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      personaId: 'warm_friend',
      userStatement: 'Congratulations Maya! Tell me about the exhibition!'
    });
    expect(result.content[0].text).toContain('sessionId');
    expect(result.content[0].text).toContain('Maya');
  });

  it('should register tool #75: validate_clinical_claim_socratic_epistemology', async () => {
    service.registerTools({});
    const tool = registeredTools.get('validate_clinical_claim_socratic_epistemology');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      claimText: 'Treating active periodontal pockets reduces hs-CRP inflammation.'
    });
    expect(result.content[0].text).toContain('claimId');
    expect(result.content[0].text).toContain('Periodontal-Systemic Cross-Talk (SIBI)');
  });

  it('should register tool #76: connect_bluetooth_biometric_device_or_parse_healthkit', async () => {
    service.registerTools({});
    const tool = registeredTools.get('connect_bluetooth_biometric_device_or_parse_healthkit');
    expect(tool).toBeDefined();

    const result = await tool.execute({ action: 'get_snapshot' });
    expect(result.content[0].text).toContain('Polar H10 BLE Sensor');
    expect(result.content[0].text).toContain('heartRateBpm');
  });

  it('should register tool #77: evaluate_pharmacogenomics_and_cpic_guidelines', async () => {
    service.registerTools({});
    const tool = registeredTools.get('evaluate_pharmacogenomics_and_cpic_guidelines');
    expect(tool).toBeDefined();

    const result = await tool.execute({ drugName: 'Codeine' });
    expect(result.content[0].text).toContain('queriedDrug');
    expect(result.content[0].text).toContain('CYP2D6');
  });

  it('should register tool #78: generate_ai_branding_package', async () => {
    service.registerTools({});
    const tool = registeredTools.get('generate_ai_branding_package');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      brandName: 'PocketGull Sanctuary',
      industry: 'Clinical Art Therapy',
      archetype: 'The Scholar'
    });
    expect(result.content[0].text).toContain('PocketGull Sanctuary');
    expect(result.content[0].text).toContain('--brand-color-primary');
  });

  it('should register tool #79: auto_extract_and_crosswalk_clinical_codes', async () => {
    service.registerTools({});
    const tool = registeredTools.get('auto_extract_and_crosswalk_clinical_codes');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      clinicalText: 'Patient has long standing T2DM presenting with diabetic neuropathy and congestive heart failure.'
    });
    expect(result.content[0].text).toContain('E11.40');
    expect(result.content[0].text).toContain('I50.22');
    expect(result.content[0].text).toContain('Bundle');
  });

  it('should register tool #80: crosswalk_snomed_icd10_cpt', async () => {
    service.registerTools({});
    const tool = registeredTools.get('crosswalk_snomed_icd10_cpt');
    expect(tool).toBeDefined();

    const resSnomed = await tool.execute({ snomedCode: '38341003' });
    expect(resSnomed.content[0].text).toContain('I10');
    expect(resSnomed.content[0].text).toContain('Essential hypertension');

    const resIcd = await tool.execute({ icd10Code: 'G30.9' });
    expect(resIcd.content[0].text).toContain('26929004');
    expect(resIcd.content[0].text).toContain("Alzheimer's disease");
  });

  it('should unregister all tools when unregisterTools is called', () => {
    service.registerTools({});
    expect((service as any).mcpControllers.length).toBe(80);

    service.unregisterTools();
    expect((service as any).mcpControllers.length).toBe(0);
  });
});

