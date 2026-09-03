import '@angular/compiler';
import { Injector, runInInjectionContext, NgZone } from '@angular/core';
import { WebMcpRegistrationService, normalizeToolInputSchema } from './webmcp-registration.service';
import { PatientStateService } from './patient-state.service';
import { ClinicalIntelligenceService } from './clinical-intelligence.service';
import { ExportService } from './export.service';
import { TeledentistryService } from './teledentistry.service';
import { GcpHealthcareApiService } from './fhir/gcp-healthcare-api.service';
import { SkepticalEpistemologyService } from './skeptical-epistemology.service';
import { ClinicalMoERouterService } from './clinical-moe-router.service';
import { FederatedLearningService } from './federated-learning.service';
import { OpenEvidenceCommonsService } from './open-evidence-commons.service';
import { IpPatentRegistryService } from './ip-patent-registry.service';
import { OpticalInnovationsService } from './optical-innovations.service';
import { PatientTrajectoryService } from './patient-trajectory.service';

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
        const wrapped = {
          ...tool,
          execute: tool.execute || tool.handler
        };
        registeredTools.set(tool.name, wrapped);
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
      evaluateCdsCompliance: vi.fn().mockReturnValue({ isFdaSection520oCompliant: true, overallConfidencePercent: 88 }),
      evaluateProtacHookEffectFalsification: vi.fn().mockReturnValue({
        id: 'protac-polypharmacy-hook-effect',
        totalSupplementsCount: 8,
        optimalDoseCopt: 5,
        hookRatio: 1.6,
        isHookEffectSuppressed: true,
        falsifiability: { pValue: 0.380 }
      }),
      evaluateLlpsPhaseBoundaryFalsification: vi.fn().mockReturnValue({
        id: 'llps-phase-boundary',
        moleculeName: 'Curcumin Liposomal + Resveratrol',
        hydrophobicFloryChi: 1.42,
        isPhaseBoundaryAchieved: false,
        falsifiability: { pValue: 0.412 }
      }),
      evaluateQuantumThermalFalsification: vi.fn().mockReturnValue({
        id: 'quantum-thermal-noise',
        deviceOrClaimName: 'Scalar Bio-Resonance Frequency Harmonizer',
        thermalNoiseKbTJoule: 4.28e-21,
        isThermalNoiseOvercome: false,
        falsifiability: { pValue: 0.945 }
      }),
      evaluateCannabinoidMicrotubuleFalsification: vi.fn().mockReturnValue({
        id: 'cannabinoid-microtubules',
        compound: 'CBD',
        doseMicroMolar: 3.5,
        tubulinAcetylationRatio: 1.45,
        catastropheRateReductionPercent: 42.0,
        gsk3BetaInhibitionPercent: 68.0,
        isStabilizationFalsified: true,
        falsifiability: { pValue: 0.018 }
      })
    };

    mockMoeRouter = {
      setCustomThinkingBudget: vi.fn(),
      currentThinkingConfig: vi.fn().mockReturnValue({ thinkingBudget: 4096, enabled: true })
    };

    const mockNgZone = {
      run: (fn: Function) => fn()
    };

    const mockTrajectory = {
      teaspoonExplanations: vi.fn().mockReturnValue([
        {
          clinicalTerm: 'L4-L5 Lumbar Disc Herniation with Radiculopathy',
          teaspoonExplanation: 'Think of your spinal disc like a dense jelly cushion between two wooden blocks.',
          anatomicalAnchor: 'Lumbar Spine (L4-L5)',
          historicalTrigger: 'Prolonged sitting without lumbar lordosis support.',
          empowermentReframe: 'Your body is signaling a mechanical adaptation request.'
        }
      ]),
      dailyHabits: vi.fn().mockReturnValue([
        { id: 'morning-priming', title: 'Morning Priming', isCompleted: true },
        { id: 'midday-fuel', title: 'Midday Fuel', isCompleted: false },
        { id: 'evening-restoration', title: 'Evening Restoration', isCompleted: false }
      ]),
      dailyAdherenceScore: vi.fn().mockReturnValue(33),
      horizonMilestones: vi.fn().mockReturnValue([
        { dayTarget: 30, phaseTitle: 'Phase I', completionPercent: 78 },
        { dayTarget: 60, phaseTitle: 'Phase II', completionPercent: 82 },
        { dayTarget: 90, phaseTitle: 'Phase III', completionPercent: 92 }
      ]),
      vitalityCertificate: vi.fn().mockReturnValue({
        certificateId: 'PG-VIT-TEST',
        patientName: 'Charles Darwin',
        completedMilestone: '90-Day Functional Restoration'
      }),
      generateVitalityCertificate: vi.fn().mockReturnValue({
        certificateId: 'PG-VIT-90DAY',
        patientName: 'Charles Darwin',
        completedMilestone: '90-Day Functional Restoration'
      }),
      recentEdgeConsult: vi.fn().mockReturnValue(null),
      consultEdgeScribe: vi.fn().mockResolvedValue({
        source: 'Chrome Built-in AI (Gemma 4 Edge)',
        userNote: 'My lower back feels tight after sitting today',
        anatomicalLinkage: 'Lumbar Spine (L4-L5 Disc & Paraspinal Musculature)',
        teaspoonInsight: 'Sitting compresses the lumbar disc cushion.',
        recommendedImmediateAction: 'Stand up, do 5 gentle standing lumbar extension glides.',
        timestamp: '16:20',
        egressAuditedZeroEgress: true
      })
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
        { provide: FederatedLearningService, useValue: new FederatedLearningService() },
        { provide: OpenEvidenceCommonsService, useValue: new OpenEvidenceCommonsService() },
        { provide: IpPatentRegistryService, useValue: new IpPatentRegistryService() },
        { provide: OpticalInnovationsService, useValue: new OpticalInnovationsService() },
        { provide: PatientTrajectoryService, useValue: mockTrajectory },
        { provide: NgZone, useValue: mockNgZone }
      ]
    });

    service = runInInjectionContext(injector, () => new WebMcpRegistrationService());
  });

  it('should register all 65 WebMCP agentic tools on modelContext', () => {
    service.registerTools({});

    expect(registeredTools.size).toBe(65);
    expect(registeredTools.has('get_clinical_evidence_citations')).toBe(true);
    expect(registeredTools.has('get_patient_3act_trajectory')).toBe(true);
    expect(registeredTools.has('configure_optical_therapy')).toBe(true);
    expect(registeredTools.has('export_scaffold_geometry')).toBe(true);
    expect(registeredTools.has('evaluate_protac_hook_effect')).toBe(true);
    expect(registeredTools.has('evaluate_llps_phase_boundary')).toBe(true);
    expect(registeredTools.has('evaluate_quantum_thermal_noise')).toBe(true);
    expect(registeredTools.has('simulate_cahn_hilliard_llps')).toBe(true);
    expect(registeredTools.has('evaluate_cannabinoid_microtubule_stabilization')).toBe(true);
    expect(registeredTools.has('simulate_chromatin_loop_extrusion')).toBe(true);
    expect(registeredTools.has('compute_transcriptional_condensate_phase')).toBe(true);
    expect(registeredTools.has('evaluate_crispr_r_loop_energetics')).toBe(true);
    expect(registeredTools.has('simulate_nucleosome_force_spectroscopy')).toBe(true);
    expect(registeredTools.has('evaluate_linc_mechanotransduction')).toBe(true);
    expect(registeredTools.has('get_staked_patent_claims_summary')).toBe(true);
    expect(registeredTools.has('open_zen_sanctuary')).toBe(true);
    expect(registeredTools.has('get_healing_postcards')).toBe(true);
    expect(registeredTools.has('evaluate_ssa_disability_and_blue_book_listings')).toBe(true);
    expect(registeredTools.has('get_jurisdictional_compliance_and_regulatory_matrix')).toBe(true);

    expect(registeredTools.has('query_mandiant_threat_intelligence_and_defense')).toBe(true);
    expect(registeredTools.has('administer_clinical_mandarinate_exam')).toBe(true);
    expect(registeredTools.has('pocketgull_trigger_federated_round')).toBe(true);
    expect(registeredTools.has('pocketgull_verify_evidence_attestation')).toBe(true);
    expect(registeredTools.has('pocketgull_query_evidence_commons')).toBe(true);
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

  it('should register all 65 WebMCP agentic tools on modelContext including IP Patent Registry', () => {
    service.registerTools({});

    expect(registeredTools.size).toBe(65);
    expect(registeredTools.has('get_clinical_evidence_citations')).toBe(true);
    expect(registeredTools.has('get_patient_3act_trajectory')).toBe(true);
    expect(registeredTools.has('configure_optical_therapy')).toBe(true);
    expect(registeredTools.has('export_scaffold_geometry')).toBe(true);
    expect(registeredTools.has('get_staked_patent_claims_summary')).toBe(true);
    expect(registeredTools.has('open_zen_sanctuary')).toBe(true);
    expect(registeredTools.has('get_healing_postcards')).toBe(true);
    expect(registeredTools.has('evaluate_ssa_disability_and_blue_book_listings')).toBe(true);
    expect(registeredTools.has('get_jurisdictional_compliance_and_regulatory_matrix')).toBe(true);
    expect(registeredTools.has('query_mandiant_threat_intelligence_and_defense')).toBe(true);
    expect(registeredTools.has('administer_clinical_mandarinate_exam')).toBe(true);
    expect(registeredTools.has('pocketgull_trigger_federated_round')).toBe(true);
    expect(registeredTools.has('pocketgull_verify_evidence_attestation')).toBe(true);
    expect(registeredTools.has('pocketgull_query_evidence_commons')).toBe(true);
  });

  it('should execute get_staked_patent_claims_summary tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('get_staked_patent_claims_summary');
    expect(tool).toBeDefined();

    const result = await tool.execute();
    expect(result.content[0].text).toContain('totalClusters');
    expect(result.content[0].text).toContain('Popperian');
  });

  it('should execute pocketgull_trigger_federated_round tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('pocketgull_trigger_federated_round');
    expect(tool).toBeDefined();

    const result = await tool.execute({ roundReason: 'Routine swarm sync' });
    expect(result.content[0].text).toContain('SUCCESS');
    expect(result.content[0].text).toContain('Executed Federated Learning Round');
  });

  it('should execute pocketgull_verify_evidence_attestation tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('pocketgull_verify_evidence_attestation');
    expect(tool).toBeDefined();

    const result = await tool.execute({ nodeId: 'ev-sprint-2015' });
    expect(result.content[0].text).toContain('isCryptographicallyVerified');
    expect(result.content[0].text).toContain('ev-sprint-2015');
  });

  it('should execute pocketgull_query_evidence_commons tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('pocketgull_query_evidence_commons');
    expect(tool).toBeDefined();

    const result = await tool.execute({ conditionOrQuery: 'Hypertension' });
    expect(result.content[0].text).toContain('totalMatches');
    expect(result.content[0].text).toContain('ev-sprint-2015');
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

  it('should execute evaluate_protac_hook_effect tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('evaluate_protac_hook_effect');
    expect(tool).toBeDefined();

    const result = await tool.execute({ totalSupplementsCount: 8, cyp3a4SubstrateCount: 3, optimalDoseCopt: 5 });
    expect(result.content[0].text).toContain('protac-polypharmacy-hook-effect');
    expect(mockSkepticalService.evaluateProtacHookEffectFalsification).toHaveBeenCalledWith(8, 3, 5);
  });

  it('should execute evaluate_llps_phase_boundary tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('evaluate_llps_phase_boundary');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      moleculeName: 'Curcumin Liposomal + Resveratrol',
      claimedAggregateTarget: 'Amyloid-β & Hyperphosphorylated Tau Fibrils',
      hydrophobicFloryChi: 1.42,
      freeEnergyDeltaFMix: 0.12
    });
    expect(result.content[0].text).toContain('llps-phase-boundary');
    expect(mockSkepticalService.evaluateLlpsPhaseBoundaryFalsification).toHaveBeenCalledWith(
      'Curcumin Liposomal + Resveratrol',
      'Amyloid-β & Hyperphosphorylated Tau Fibrils',
      1.42,
      0.12
    );
  });

  it('should execute evaluate_quantum_thermal_noise tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('evaluate_quantum_thermal_noise');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      deviceOrClaimName: 'Scalar Bio-Resonance Frequency Harmonizer',
      claimedFieldTesla: 1e-6,
      frequencyHz: 7.83
    });
    expect(result.content[0].text).toContain('quantum-thermal-noise');
    expect(mockSkepticalService.evaluateQuantumThermalFalsification).toHaveBeenCalledWith(
      'Scalar Bio-Resonance Frequency Harmonizer',
      1e-6,
      7.83
    );
  });

  it('should execute simulate_cahn_hilliard_llps tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('simulate_cahn_hilliard_llps');
    expect(tool).toBeDefined();

    const result = await tool.execute({ timesteps: 25, mobility: 1.0, gradientEnergy: 0.5, meanConcentration: 0.0 });
    expect(result.content[0].text).toContain('freeEnergyEvolution');
    expect(result.content[0].text).toContain('gridSize');
  });

  it('should execute evaluate_cannabinoid_microtubule_stabilization tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('evaluate_cannabinoid_microtubule_stabilization');
    expect(tool).toBeDefined();

    const result = await tool.execute({ compound: 'CBD', doseMicroMolar: 3.5 });
    expect(result.content[0].text).toContain('acetylationLys40Ratio');
    expect(result.content[0].text).toContain('axonalTransportVelocityUmPerSec');
  });

  it('should execute simulate_chromatin_loop_extrusion tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('simulate_chromatin_loop_extrusion');
    expect(tool).toBeDefined();

    const result = await tool.execute({ locusLengthKb: 2000, cohesinSpeedKbPerSec: 1.2 });
    expect(result.content[0].text).toContain('tadInsulationScore');
    expect(result.content[0].text).toContain('fractalGlobuleScalingGamma');
  });

  it('should execute compute_transcriptional_condensate_phase tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('compute_transcriptional_condensate_phase');
    expect(tool).toBeDefined();

    const result = await tool.execute({ med1ConcentrationUm: 5.0, brd4ConcentrationUm: 4.0 });
    expect(result.content[0].text).toContain('dropletRadiusNm');
    expect(result.content[0].text).toContain('transcriptionalBurstFrequencyPerHour');
  });

  it('should execute evaluate_crispr_r_loop_energetics tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('evaluate_crispr_r_loop_energetics');
    expect(tool).toBeDefined();

    const result = await tool.execute({ guideRnaSeq: 'GACUUGACAGUCUACGAUCG', targetDnaSeq: 'GACTTGACAGTCTACGATCG' });
    expect(result.content[0].text).toContain('netFreeEnergyDeltaGKcalPerMol');
    expect(result.content[0].text).toContain('cleavageFalsificationVerdict');
  });

  it('should execute simulate_nucleosome_force_spectroscopy tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('simulate_nucleosome_force_spectroscopy');
    expect(tool).toBeDefined();

    const result = await tool.execute({ epigeneticState: 'HYPERACETYLATED_H3K27AC' });
    expect(result.content[0].text).toContain('outerTurnRuptureForcePn');
    expect(result.content[0].text).toContain('chromatinAccessibilityPercent');
  });

  it('should execute evaluate_linc_mechanotransduction tool', async () => {
    service.registerTools({});
    const tool = registeredTools.get('evaluate_linc_mechanotransduction');
    expect(tool).toBeDefined();

    const result = await tool.execute({ ecmStiffnessKPa: 12.0 });
    expect(result.content[0].text).toContain('yapTazNuclearToCytoplasmicRatio');
    expect(result.content[0].text).toContain('transcriptionalMechanostate');
  });

  it('should execute export_scaffold_geometry tool for STL and glTF bundle', async () => {
    service.registerTools({});
    const tool = registeredTools.get('export_scaffold_geometry');
    expect(tool).toBeDefined();

    const result = await tool.execute({
      lesionRadiusX: 11.5,
      targetOrgan: 'Lumbar Disc Herniation',
      format: 'all'
    });
    expect(result.content[0].text).toContain('asciiStl');
    expect(result.content[0].text).toContain('gltfJson');
    expect(result.content[0].text).toContain('acousticPhaseMap');
    expect(result.content[0].text).toContain('bioprinterProfile');
  });

  it('should unregister all tools when unregisterTools is called', () => {
    service.registerTools({});
    expect((service as any).mcpControllers.length).toBe(65);

    service.unregisterTools();
    expect((service as any).mcpControllers.length).toBe(0);
  });


  describe('normalizeToolInputSchema & getRegisteredTools (Chrome Model Context API update)', () => {
    it('should normalize native Object schema directly', () => {
      const nativeSchema = { type: 'object', properties: { patientId: { type: 'string' } } };
      const normalized = normalizeToolInputSchema(nativeSchema);
      expect(normalized).toEqual(nativeSchema);
      expect(typeof normalized).toBe('object');
    });

    it('should safely parse stringified JSON schema (DOMString backward compatibility)', () => {
      const stringifiedSchema = JSON.stringify({ type: 'object', properties: { text: { type: 'string' } } });
      const normalized = normalizeToolInputSchema(stringifiedSchema);
      expect(normalized).toEqual({ type: 'object', properties: { text: { type: 'string' } } });
      expect(typeof normalized).toBe('object');
    });

    it('should return fallback object for null or invalid schema', () => {
      expect(normalizeToolInputSchema(null)).toEqual({ type: 'object', properties: {} });
      expect(normalizeToolInputSchema('invalid-json{')).toEqual({ type: 'object', properties: {} });
    });

    it('should retrieve registered tools and normalize inputSchema objects', async () => {
      mockModelContext.getTools = vi.fn().mockResolvedValue([
        {
          name: 'tool_with_object_schema',
          description: 'Tool with native object schema',
          inputSchema: { type: 'object', properties: { q: { type: 'string' } } }
        },
        {
          name: 'tool_with_string_schema',
          description: 'Tool with DOMString schema',
          inputSchema: '{"type":"object","properties":{"id":{"type":"number"}}}'
        }
      ]);

      const tools = await service.getRegisteredTools();
      expect(tools.length).toBe(2);
      expect(typeof tools[0].inputSchema).toBe('object');
      expect(tools[0].inputSchema.properties.q.type).toBe('string');
      expect(typeof tools[1].inputSchema).toBe('object');
      expect(tools[1].inputSchema.properties.id.type).toBe('number');
    });

    it('should execute configure_optical_therapy tool and return telemetry', async () => {
      service.registerTools({});
      const tool = registeredTools.get('configure_optical_therapy');
      expect(tool).toBeDefined();

      const res = await tool.execute({
        mode: 'photobiomodulation-670nm',
        pbmAction: 'start',
        circadianPhase: 'dawn-alert',
        oknDirection: 'bilateral-respiratory',
        dichopticLeftHz: 10.0,
        dichopticRightHz: 10.5
      });

      expect(res.content[0].text).toContain('photobiomodulation-670nm');
      expect(res.content[0].text).toContain('ISCEV Photosensitive Epilepsy (PSE) Shutter Active');
    });

    it('should execute get_patient_3act_trajectory tool and return 3-act clinical data', async () => {
      service.registerTools({});
      const tool = registeredTools.get('get_patient_3act_trajectory');
      expect(tool).toBeDefined();

      const res = await tool.execute({
        symptomQuery: 'My lower back feels tight after sitting today',
        generateCertificate: true
      });

      expect(res.content[0].text).toContain("Where You've Been");
      expect(res.content[0].text).toContain("Where You Stand Today");
      expect(res.content[0].text).toContain("Where You're Going");
      expect(res.content[0].text).toContain('L4-L5');
      expect(res.content[0].text).toContain('PG-VIT-');
    });

    it('should execute get_clinical_evidence_citations tool and return citations by category and PMID', async () => {
      service.registerTools({});
      const tool = registeredTools.get('get_clinical_evidence_citations');
      expect(tool).toBeDefined();

      // Query by category
      const resCat = await tool.execute({
        category: 'optical_pbm',
        style: 'APA'
      });
      expect(resCat.content[0].text).toContain('optical_pbm');
      expect(resCat.content[0].text).toContain('32559297');
      expect(resCat.content[0].text).toContain('Shinhmar');

      // Query by exact PMID
      const resPmid = await tool.execute({
        pmid: '35298459', // Brown 2022 CIE S 026
        style: 'Vancouver'
      });
      expect(resPmid.content[0].text).toContain('PLOS Biol');
      expect(resPmid.content[0].text).toContain('Recommendations for daytime');
    });
  });
});
