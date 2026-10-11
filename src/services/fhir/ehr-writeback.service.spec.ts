import { TestBed } from '@angular/core/testing';
import { EhrWritebackService, IEhrWritebackContext } from './ehr-writeback.service';
import { PatientStateService } from '../patient-state.service';
import { MimicOmopBenchmarkService } from '../research/mimic-omop-benchmark.service';

describe('EhrWritebackService', () => {
  let service: EhrWritebackService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EhrWritebackService,
        PatientStateService,
        MimicOmopBenchmarkService
      ]
    });
    service = TestBed.inject(EhrWritebackService);
  });

  it('should initialize with default RFC 7523 client configuration', () => {
    expect(service.clientId()).toBe('pocketgull-bi-directional-writeback-client-v1');
    expect(service.tokenEndpoint()).toContain('oauth2/token');
    expect(service.keyId()).toBe('pg-key-2026-rsa384');
    expect(service.activeVendor()).toBe('EPIC');
    expect(service.totalWritebacksCount()).toBe(0);
  });

  it('should generate valid RFC 7523 client_assertion JWT with RS384 header and 5-min expiration', async () => {
    const { assertion, header, payload } = await service.generateClientAssertion();

    expect(assertion).toBeDefined();
    expect(assertion.split('.').length).toBe(3); // standard JWT 3 segments

    expect(header.alg).toBe('RS384');
    expect(header.typ).toBe('JWT');
    expect(header.kid).toBe('pg-key-2026-rsa384');

    expect(payload.iss).toBe(service.clientId());
    expect(payload.sub).toBe(service.clientId());
    expect(payload.aud).toBe(service.tokenEndpoint());
    expect(payload.jti).toContain('jti_');
    expect(payload.exp).toBeGreaterThan(payload.iat);
    expect(payload.exp - payload.iat).toBe(300); // 5 minutes
  });

  it('should export public JWKS conforming to RFC 7517 for Epic Connection Hub registration', () => {
    const jwks = service.getPublicJwks();
    expect(jwks.keys).toBeDefined();
    expect(jwks.keys.length).toBe(1);

    const key = jwks.keys[0];
    expect(key.kty).toBe('RSA');
    expect(key.alg).toBe('RS384');
    expect(key.use).toBe('sig');
    expect(key.kid).toBe('pg-key-2026-rsa384');
    expect(key.e).toBe('AQAB');
    expect(key.status).toBe('ACTIVE_CERTIFIED');
  });

  it('should exchange assertion for system access token with write scopes', async () => {
    const token = await service.requestSystemAccessToken({ vendor: 'EPIC' });

    expect(token).toBeDefined();
    expect(token.token_type).toBe('Bearer');
    expect(token.scope).toContain('system/DocumentReference.write');
    expect(token.scope).toContain('system/CarePlan.write');
    expect(token.scope).toContain('system/Observation.write');
    expect(service.activeToken()).toEqual(token);
  });

  it('should build USCDI v4 compliant FHIR R4 DocumentReference from SBAR note', () => {
    const mockContext: IEhrWritebackContext = {
      patientId: 'pat-991',
      patientMrn: 'MRN-784920',
      patientName: 'Eleanor Vance',
      encounterId: 'enc-204',
      practitionerId: 'pract-44',
      practitionerName: 'Dr. Julian Reed',
      ehrVendor: 'EPIC',
      fhirBaseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4'
    };

    const sbarNote = {
      chiefComplaint: 'Post-op tachycardia',
      situation: 'HR 104 bpm, MAP 72 mmHg',
      background: 'Day 2 post-op',
      assessment: 'Mondrian Conformal Set {0, 1}',
      recommendation: 'Accelerate telemetry to 2m',
      timestamp: '2026-10-03T18:00:00.000Z'
    };

    const doc = service.buildSbarDocumentReference(sbarNote, mockContext);

    expect(doc.resourceType).toBe('DocumentReference');
    expect(doc.status).toBe('current');
    expect(doc.docStatus).toBe('final');
    expect(doc.type.coding[0].code).toBe('34133-9');
    expect(doc.type.coding[1].code).toBe('11506-3');
    expect(doc.subject.reference).toBe('Patient/pat-991');
    expect(doc.context.encounter[0].reference).toBe('Encounter/enc-204');
    expect(doc.content[0].attachment.contentType).toBe('text/plain');
    expect(doc.content[0].attachment.data).toBeDefined();
  });

  it('should build USCDI v4 compliant FHIR R4 CarePlan with verified CYP450 clearance', () => {
    const mockContext: IEhrWritebackContext = {
      patientId: 'pat-991',
      patientMrn: 'MRN-784920',
      patientName: 'Eleanor Vance',
      encounterId: 'enc-204',
      practitionerId: 'pract-44',
      practitionerName: 'Dr. Julian Reed',
      ehrVendor: 'EPIC',
      fhirBaseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4'
    };

    const pathway = {
      title: 'Tri-Paradigm Autonomic Stabilization',
      summary: 'Reconciling allopathic antimicrobials with TCM Qi tonics',
      threeActsStage: 'Act I' as const,
      cyp450ClearanceVerified: true,
      activities: [
        { category: 'Monitoring' as const, description: 'Continuous IoMT telemetry', timing: 'q2m' },
        { category: 'Botanical' as const, description: 'Ginger rhizome tea', timing: 'bid' }
      ]
    };

    const plan = service.buildCarePlan(pathway, mockContext);

    expect(plan.resourceType).toBe('CarePlan');
    expect(plan.status).toBe('active');
    expect(plan.intent).toBe('plan');
    expect(plan.category[0].coding[0].code).toBe('assess-plan');
    expect(plan.subject.reference).toBe('Patient/pat-991');
    expect(plan.description).toContain('CYP450 metabolic blockade clearance verified: YES');
    expect(plan.activity.length).toBe(2);
  });

  it('should build USCDI v4 compliant FHIR R4 Observation with LOINC 96766-1 for conformal sepsis intervals', () => {
    const mockContext: IEhrWritebackContext = {
      patientId: 'pat-991',
      patientMrn: 'MRN-784920',
      patientName: 'Eleanor Vance',
      encounterId: 'enc-204',
      practitionerId: 'pract-44',
      practitionerName: 'Dr. Julian Reed',
      ehrVendor: 'EPIC',
      fhirBaseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4'
    };

    const conformal = {
      predictionSet: '{0, 1}' as const,
      classification: 'Epistemic Abstention (Ambiguous Range)',
      marginalCoverage: 95.2,
      nonconformityScore: 0.0428,
      epistemicAbstentionActive: true,
      alarmAction: 'SUPPRESSED_NO_FATIGUE' as const,
      aurocBenchmark: 0.835,
      esmComparisonAUROC: 0.624
    };

    const obs = service.buildConformalObservation(conformal, mockContext);

    expect(obs.resourceType).toBe('Observation');
    expect(obs.status).toBe('final');
    expect(obs.code.coding[0].code).toBe('96766-1');
    expect(obs.valueCodeableConcept.coding[0].code).toBe('{0, 1}');
    expect(obs.component.length).toBe(5);

    const coverageComp = obs.component.find((c: any) => c.code.coding[0].code === 'coverage-guarantee');
    expect(coverageComp.valueQuantity.value).toBe(95.2);

    const abstentionComp = obs.component.find((c: any) => c.code.coding[0].code === 'epistemic-abstention-active');
    expect(abstentionComp.valueBoolean).toBe(true);

    const alarmComp = obs.component.find((c: any) => c.code.coding[0].code === 'alarm-fatigue-action');
    expect(alarmComp.valueString).toBe('SUPPRESSED_NO_FATIGUE');
  });

  it('should execute full batch writeback and stamp SHA-256 cryptographic attestation seals', async () => {
    const result = await service.executeWriteback({
      ehrVendor: 'EPIC',
      patientMrn: 'MRN-784920',
      patientName: 'Eleanor Vance'
    });

    expect(result.overallStatus).toBe('SUCCESS_FILED_TO_EHR');
    expect(result.authMethod).toBe('private_key_jwt (RFC 7523)');
    expect(result.receipts.length).toBe(3);

    const docReceipt = result.receipts.find(r => r.resourceType === 'DocumentReference');
    const carePlanReceipt = result.receipts.find(r => r.resourceType === 'CarePlan');
    const obsReceipt = result.receipts.find(r => r.resourceType === 'Observation');

    expect(docReceipt).toBeDefined();
    expect(docReceipt?.httpStatus).toBe(201);
    expect(docReceipt?.sha256AttestationSeal).toContain('sha256_');

    expect(carePlanReceipt).toBeDefined();
    expect(carePlanReceipt?.httpStatus).toBe(201);

    expect(obsReceipt).toBeDefined();
    expect(obsReceipt?.httpStatus).toBe(201);

    expect(service.totalWritebacksCount()).toBe(1);
    expect(service.lastBatchResult()).toEqual(result);
  });

  it('should accept custom SBAR and custom CarePathway from ambient scribe adjudication', async () => {
    const customSbar = {
      chiefComplaint: 'Severe Sciatica & Radiculopathy',
      situation: 'SBAR generated from ambient clinical scribe ingestion.',
      background: 'Patient taking gabapentin and clonazepam.',
      assessment: 'Critical lethal DDI detected; ISMP posology defects corrected.',
      recommendation: 'De-prescribe clonazepam; titrate gabapentin to bedtime.',
      timestamp: '2026-10-09T09:00:00Z'
    };

    const result = await service.executeWriteback(
      { patientName: 'Marcus Davis', patientMrn: 'MRN-449102' },
      customSbar
    );

    expect(result.overallStatus).toBe('SUCCESS_FILED_TO_EHR');
    const docRef = result.sbarDocumentReference;
    expect(docRef.subject.display).toBe('Marcus Davis');
    const docReceipt = result.receipts.find(r => r.resourceType === 'DocumentReference');
    expect(docReceipt?.httpStatus).toBe(201);
  });
});
