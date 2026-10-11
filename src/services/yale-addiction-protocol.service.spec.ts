import { TestBed } from '@angular/core/testing';
import { YaleAddictionProtocolService, COWS_QUESTIONNAIRE_ITEMS } from './yale-addiction-protocol.service';
import { EhrWritebackService } from './fhir/ehr-writeback.service';
import { PatientStateService } from './patient-state.service';
import { provideHttpClient } from '@angular/common/http';

describe('YaleAddictionProtocolService', () => {
  let service: YaleAddictionProtocolService;
  let ehrWriteback: EhrWritebackService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        YaleAddictionProtocolService,
        EhrWritebackService,
        PatientStateService,
        provideHttpClient()
      ]
    });
    service = TestBed.inject(YaleAddictionProtocolService);
    ehrWriteback = TestBed.inject(EhrWritebackService);
  });

  it('1. Initializes with 11 standardized COWS items and null latest assessment', () => {
    expect(service).toBeTruthy();
    expect(COWS_QUESTIONNAIRE_ITEMS.length).toBe(11);
    expect(service.latestAssessment()).toBeNull();
    expect(service.assessmentHistory().length).toBe(0);
    expect(service.activeWithdrawalAcuity()).toBe('NONE');
  });

  it('2. Calculates zero score as NONE withdrawal tier', async () => {
    const answers: Record<string, number> = {};
    const result = await service.calculateCows(answers);

    expect(result.totalScore).toBe(0);
    expect(result.severity).toBe('NONE');
    expect(result.decisionSupport.buprenorphinePermitted).toBe(false);
    expect(result.decisionSupport.protocolType).toBe('NON_OPIOID_COMFORT_MEASURES');
  });

  it('3. Withholds standard buprenorphine when COWS < 8 to prevent precipitated withdrawal', async () => {
    // Score of 6 (Mild withdrawal)
    const answers = {
      resting_pulse: 1, // Pulse 81-100
      sweating: 1,      // Chills/flushing
      restlessness: 1,  // Difficulty sitting still
      pupil_size: 1,    // Pupils possibly larger
      bone_joint_aches: 1, // Mild discomfort
      yawning: 1        // Once or twice
    };

    const result = await service.calculateCows(answers);

    expect(result.totalScore).toBe(6);
    expect(result.severity).toBe('MILD');
    expect(result.decisionSupport.buprenorphinePermitted).toBe(false);
    expect(result.decisionSupport.protocolType).toBe('NON_OPIOID_COMFORT_MEASURES');
    expect(result.decisionSupport.precipitatedWithdrawalRisk).toBe('CRITICAL_HIGH');
    expect(result.decisionSupport.primaryRecommendation).toContain('Withhold standard buprenorphine');
    
    // Checks comfort cocktail presence
    const clonidine = result.decisionSupport.medicationOrders.find(m => m.drugName.includes('Clonidine'));
    const ondansetron = result.decisionSupport.medicationOrders.find(m => m.drugName.includes('Ondansetron'));
    const naloxone = result.decisionSupport.medicationOrders.find(m => m.drugName.includes('Naloxone'));
    expect(clonidine).toBeDefined();
    expect(ondansetron).toBeDefined();
    expect(naloxone).toBeDefined();
  });

  it('4. Authorizes Yale Standard Rapid Induction when COWS >= 8', async () => {
    // Score of 16 (Moderate withdrawal)
    const answers = {
      resting_pulse: 2,   // 101-120 bpm (+2)
      sweating: 2,        // Visible beads (+2)
      restlessness: 3,    // Frequent shifting (+3)
      pupil_size: 2,      // Moderately dilated (+2)
      bone_joint_aches: 2,// Severe diffuse aching (+2)
      runny_nose_tearing: 2, // Running/tearing (+2)
      tremor: 2,          // Observable tremor (+2)
      yawning: 1          // 1-2 times (+1)
    };

    const result = await service.calculateCows(answers);

    expect(result.totalScore).toBe(16);
    expect(result.severity).toBe('MODERATE');
    expect(result.decisionSupport.buprenorphinePermitted).toBe(true);
    expect(result.decisionSupport.protocolType).toBe('YALE_STANDARD_RAPID_INDUCTION');
    expect(result.decisionSupport.precipitatedWithdrawalRisk).toBe('LOW_SAFE');
    expect(result.decisionSupport.primaryRecommendation).toContain('Administer Buprenorphine/Naloxone 8 mg SL');
    expect(result.decisionSupport.reassessmentIntervalMinutes).toBe(45);

    // Verify sublingual Suboxone order
    const bupOrder = result.decisionSupport.medicationOrders.find(m => m.drugName.includes('Buprenorphine'));
    expect(bupOrder).toBeDefined();
    expect(bupOrder?.dose).toContain('8 mg');
    expect(bupOrder?.route).toBe('Sublingual (hold under tongue until completely dissolved, ~5-10 min)');
  });

  it('5. Triggers Low-Dose Initiation (LDI / Bernese protocol) when synthetic fentanyl exposure is suspected', async () => {
    // Mild withdrawal (Score 7), but fentanyl is suspected
    const answers = {
      resting_pulse: 1,
      sweating: 2,
      pupil_size: 1,
      bone_joint_aches: 2,
      anxiety_irritability: 1
    };

    const result = await service.calculateCows(answers, { fentanylSuspected: true });

    expect(result.totalScore).toBe(7);
    expect(result.fentanylExposureSuspected).toBe(true);
    expect(result.decisionSupport.protocolType).toBe('LOW_DOSE_MICRO_INDUCTION_LDI');
    expect(result.decisionSupport.buprenorphinePermitted).toBe(true);
    expect(result.decisionSupport.precipitatedWithdrawalRisk).toBe('CONTROLLED_MICRO');
    expect(result.decisionSupport.primaryRecommendation).toContain('Yale Low-Dose Buprenorphine Initiation');
    expect(result.decisionSupport.medicationOrders[0].dose).toContain('0.5 mg');
  });

  it('6. Generates 4-Phase Whole-Person Restorative Plan', async () => {
    const answers = { resting_pulse: 4, sweating: 3, restlessness: 5, pupil_size: 5, gi_upset: 5, gooseflesh_skin: 5 };
    const result = await service.calculateCows(answers);

    expect(result.totalScore).toBe(27);
    expect(result.severity).toBe('MODERATELY_SEVERE');

    const plan = result.fourPhaseRestorativePlan;
    expect(plan.phase1Acute.length).toBeGreaterThan(0);
    expect(plan.phase1Acute.some(p => p.includes('Naloxone'))).toBe(true);

    expect(plan.phase2NeuroplasticSleep.length).toBeGreaterThan(0);
    expect(plan.phase2NeuroplasticSleep.some(p => p.includes('CBT-I') || p.includes('Dopamine'))).toBe(true);

    expect(plan.phase3EntericBiomechanics.length).toBeGreaterThan(0);
    expect(plan.phase3EntericBiomechanics.some(p => p.includes('OIBD') || p.includes('McKenzie'))).toBe(true);

    expect(plan.phase4SocialFlourishing.length).toBeGreaterThan(0);
    expect(plan.phase4SocialFlourishing.some(p => p.includes('Peer Recovery') || p.includes('Social Prescribing'))).toBe(true);
  });

  it('7. Emits compliant FHIR R4 Observation with LOINC 72514-3', async () => {
    const answers = { resting_pulse: 2, sweating: 2, bone_joint_aches: 2, runny_nose_tearing: 2 };
    const result = await service.calculateCows(answers);

    const fhir = result.fhirObservationPayload;
    expect(fhir.resourceType).toBe('Observation');
    expect(fhir.code.coding[0].system).toBe('http://loinc.org');
    expect(fhir.code.coding[0].code).toBe('72514-3');
    expect(fhir.valueInteger).toBe(8);
    expect(fhir.interpretation[0].text).toContain('Score: 8/48');
  });

  it('8. Computes SHA-256 digital attestation seal (FDA 21 CFR Part 11)', async () => {
    const answers = { resting_pulse: 1 };
    const result = await service.calculateCows(answers);

    expect(result.integrityDigest).toBeDefined();
    expect(result.integrityDigest.length).toBeGreaterThanOrEqual(16);
  });

  it('9. Executes automated EHR writeback via EhrWritebackService', async () => {
    const writebackSpy = vi.spyOn(ehrWriteback, 'executeWriteback').mockResolvedValue({
      batchId: 'rcpt_cows_test_123',
      ehrVendor: 'EPIC',
      timestamp: new Date().toISOString(),
      authMethod: 'private_key_jwt (RFC 7523)',
      clientId: 'pocketgull-client',
      receipts: [{
        resourceType: 'Observation',
        fhirId: 'obs_cows_123',
        loincCode: '72514-3',
        timestamp: new Date().toISOString(),
        httpStatus: 201,
        locationUrl: 'https://fhir.epic.com/R4/Observation/obs_cows_123',
        sha256AttestationSeal: 'seal_sha256_mock_cows'
      }],
      sbarDocumentReference: {},
      carePlan: {},
      conformalObservation: {},
      clientAssertionJwtHeader: {},
      clientAssertionJwtPayload: {},
      overallStatus: 'SUCCESS_FILED_TO_EHR'
    });

    const answers = { resting_pulse: 2, sweating: 2, restlessness: 3, pupil_size: 2 };
    const result = await service.calculateCows(answers);
    const receipt = await service.writeBackToEhr(result);

    expect(writebackSpy).toHaveBeenCalled();
    expect(receipt).toBeDefined();
    expect(receipt?.ehrVendor).toBe('EPIC');
    expect(receipt?.receipts[0]?.httpStatus).toBe(201);
  });
});
