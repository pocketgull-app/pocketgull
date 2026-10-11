import { describe, it, expect, beforeEach } from 'vitest';
import { SovereignFhirTaggerService } from './sovereign-fhir-tagger.service';
import { VagalCircadianShieldService, IBiometricTelemetry } from './vagal-circadian-shield.service';
import { SamdCryptographicLedgerService } from './samd-cryptographic-ledger.service';
import { BackpackDispensaryService } from './backpack-dispensary.service';
import { SovereignBrainService } from './sovereign-brain.service';

describe('Sovereign Brain & 4 Clinical Vectors Suite', () => {
  let fhirTagger: SovereignFhirTaggerService;
  let vagalShield: VagalCircadianShieldService;
  let samdLedger: SamdCryptographicLedgerService;
  let backpackDispensary: BackpackDispensaryService;
  let sovereignBrain: SovereignBrainService;

  beforeEach(() => {
    fhirTagger = new SovereignFhirTaggerService();
    vagalShield = new VagalCircadianShieldService();
    samdLedger = new SamdCryptographicLedgerService();
    backpackDispensary = new BackpackDispensaryService();
    sovereignBrain = new SovereignBrainService();
  });

  describe('Vector 1: FHIR R4 & SNOMED CT Semantic Auto-Tagger', () => {
    it('should extract pre-eclampsia and magnesium sulfate with canonical SNOMED & RxNorm codes', () => {
      const note = 'Patient presented with severe pre-eclampsia. Administer IV magnesium sulfate seizure prophylaxis.';
      const bundle = fhirTagger.extractEntitiesAndBuildFhir(note, 'PATIENT-77');

      expect(bundle.resourceType).toBe('Bundle');
      expect(bundle.entry.length).toBeGreaterThanOrEqual(2);

      const condition = bundle.entry.find(e => e.resource.resourceType === 'Condition');
      expect(condition).toBeDefined();
      expect(condition?.resource.code?.coding[0].code).toBe('398254007');

      const med = bundle.entry.find(e => e.resource.resourceType === 'MedicationRequest');
      expect(med).toBeDefined();
      expect(med?.resource.medicationCodeableConcept?.coding[0].code).toBe('6656');
    });

    it('should tag cholera and ringer lactate', () => {
      const note = 'Severe dehydration due to cholera outbreak. Infuse ringer lactate immediately.';
      const bundle = fhirTagger.extractEntitiesAndBuildFhir(note);

      const condition = bundle.entry.find(e => e.resource.resourceType === 'Condition');
      expect(condition?.resource.code?.coding[0].code).toBe('63650001');

      const med = bundle.entry.find(e => e.resource.resourceType === 'MedicationRequest');
      expect(med?.resource.medicationCodeableConcept?.coding[0].code).toBe('313002');
    });
  });

  describe('Vector 2: Vagal Baroreflex & Circadian Co-Regulation Shield', () => {
    it('should activate 0.1 Hz breathing pacer and scotopic 650nm theme during sympathetic storm', () => {
      const telemetry: IBiometricTelemetry = {
        rmssdMs: 16.5, // Below 25.0 ms threshold
        heartRateBpm: 98,
        respirationBpm: 22,
        cgmGlucoseMgDl: 110,
        timestampIso: '2026-10-10T14:30:00Z',
        minutesSinceMeal: 120
      };

      const result = vagalShield.evaluateTelemetry(telemetry);

      expect(result.vagalToneStatus).toBe('SYMPATHETIC_DOMINANCE');
      expect(result.ambientTheme).toBe('SCOTOPIC_650NM_RED');
      expect(result.breathingPacer.pacerActive).toBe(true);
      expect(result.breathingPacer.targetFrequencyHz).toBe(0.1);
      expect(result.breathingPacer.cadenceBpm).toBe(6.0);
    });

    it('should trigger GLUT4 non-insulin contraction walking prompt during postprandial glucose spike', () => {
      const telemetry: IBiometricTelemetry = {
        rmssdMs: 42.0, // Healthy parasympathetic tone
        heartRateBpm: 68,
        respirationBpm: 14,
        cgmGlucoseMgDl: 155, // Spike > 140 mg/dL
        timestampIso: '2026-10-10T12:30:00Z',
        minutesSinceMeal: 45 // 15 to 90 min window
      };

      const result = vagalShield.evaluateTelemetry(telemetry);

      expect(result.vagalToneStatus).toBe('STABLE_PARASYMPATHETIC');
      expect(result.metabolicAction.glut4WalkingPromptActive).toBe(true);
    });
  });

  describe('Vector 3: SaMD Cryptographic Audit Ledger', () => {
    it('should sign clinical recommendations with SHA-256 and verify record integrity', async () => {
      const record = await samdLedger.signClinicalRecommendation({
        modelId: 'pocketgull-clinical:latest',
        promptInput: 'Patient with severe pre-eclampsia at 34 weeks gestation.',
        recommendation: 'Administer IV Magnesium Sulfate 4g loading dose.'
      });

      expect(record.recordId.startsWith('SAMD-')).toBe(true);
      expect(record.statutoryCompliance.fda21CfrPart11Compliant).toBe(true);
      expect(record.inputSha256).toHaveLength(64);
      expect(record.recommendationSha256).toHaveLength(64);

      const isValid = await samdLedger.verifyAuditRecord(record);
      expect(isValid).toBe(true);
    });
  });

  describe('Vector 4: Backpack Dispensary & Multilingual Health Passport', () => {
    it('should retrieve offline WHO EML protocols for snakebite and severe malaria', () => {
      const snakebite = backpackDispensary.queryProtocol('snakebite_hemotoxic');
      expect(snakebite?.bedsideTest).toContain('20WBCT');
      expect(snakebite?.harmfulPracticesToReject).toContain('Tourniquet');

      const malaria = backpackDispensary.queryProtocol('severe_malaria');
      expect(malaria?.firstLine).toContain('Artesunate');
    });

    it('should calculate pediatric MUAC triage for uncomplicated SAM', () => {
      const result = backpackDispensary.calculatePediatricMuacTriage(112.0, false, true);
      expect(result.triage).toBe('OUTPATIENT_AMBULATORY_CARE');
      expect(result.initialNutrition).toContain('RUTF');
    });

    it('should generate de-identified health passports in English, French, and Swahili', () => {
      const payload = {
        subjectToken: 'PG-REF-8942',
        bloodType: 'O-Negative',
        pgxVariants: ['CYP2C19*2/*2_POOR_METABOLIZER'],
        allergies: ['Penicillin (Anaphylaxis)'],
        conditionsSctid: ['59621000 (Hypertension)']
      };

      const en = backpackDispensary.generateMultilingualPassportSummary({ ...payload, langCode: 'en' });
      const fr = backpackDispensary.generateMultilingualPassportSummary({ ...payload, langCode: 'fr' });
      const sw = backpackDispensary.generateMultilingualPassportSummary({ ...payload, langCode: 'sw' });

      expect(en.clinicalWarning).toContain('CLOPIDOGREL');
      expect(fr.clinicalWarning).toContain('CLOPIDOGREL');
      expect(sw.header).toBe('WASIFU WA MATIBABU YA DHARURA');

      const qr = backpackDispensary.generateCompactQrPayload(payload);
      expect(qr).toContain('PG-REF-8942');
    });
  });

  describe('Sovereign Brain Coordinator & Gull Squadron Routing', () => {
    it('should map Gulliver to pocketgull-clinical and Skimmer to pocketgull-edge', () => {
      expect(sovereignBrain.personaRoutings().gulliver.activeModel).toBe('pocketgull-clinical:latest');
      expect(sovereignBrain.personaRoutings().skimmer.activeModel).toBe('pocketgull-edge:3b');
      expect(sovereignBrain.personaRoutings().drift.specialty).toContain('Circadian');
    });

    it('should execute end-to-end clinical consultation with FHIR bundle and SaMD audit record', async () => {
      const result = await sovereignBrain.processClinicalConsultation(
        'Patient presenting with pre-eclampsia and autonomic tremor.'
      );

      expect(result.recommendation).toBeDefined();
      expect(result.fhirBundle.resourceType).toBe('Bundle');
      expect(result.auditRecord.statutoryCompliance.hipaaSafeHarborVerified).toBe(true);
    });
  });
});
