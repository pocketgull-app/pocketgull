import { TestBed } from '@angular/core/testing';
import { FhirDaVinciPasService } from './fhir-da-vinci-pas.service';

describe('FhirDaVinciPasService (HL7 FHIR Da Vinci Prior Authorization Automation)', () => {
  let service: FhirDaVinciPasService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FhirDaVinciPasService]
    });
    service = TestBed.inject(FhirDaVinciPasService);
  });

  it('should initialize with active seed prior authorization request', () => {
    expect(service.activeRequests().length).toBeGreaterThan(0);
    const req = service.currentRequest();
    expect(req).toBeDefined();
    expect(req?.patientName).toBe('Marie Curie');
    expect(req?.items[0].serviceCode).toBe('81415');
    expect(req?.x12Transaction278Payload).toContain('ST*278*0001*005010X217~');
  });

  it('should transition status through CRD/DTR validation and achieve instant approval', () => {
    const req = service.createPriorAuthRequest({
      patientId: 'p_test_pas',
      patientName: 'Ada Lovelace',
      patientDob: '1970-12-10',
      payerId: 'PAYER-AETNA',
      payerName: 'Aetna Better Health',
      orderingProviderNpi: '1234567890',
      orderingProviderName: 'Dr. Charles Babbage, MD',
      claimType: 'professional',
      items: [
        {
          sequence: 1,
          serviceCode: '93458',
          serviceDescription: 'Left heart catheterization with coronary angiography',
          quantity: 1,
          unitPriceUsd: 4200.00,
          primaryDiagnosisCode: 'I25.10',
          priorAuthRequired: true,
          payerGuidelineRef: 'Aetna Clinical Policy Bulletin #0028'
        }
      ],
      attachedEvidenceNotes: [
        'Patient presents with refractory angina and positive myocardial perfusion stress test.',
        'High clinical suspicion of multivessel coronary disease warranting urgent coronary angiography.'
      ]
    });

    expect(req.status).toBe('DRAFT');

    const validated = service.executeCrdAndDtr(req.requestId);
    expect(validated.status).toBe('DTR_VALIDATED');

    const adjudicated = service.submitPasBundle(req.requestId);
    expect(adjudicated.status).toBe('INSTANT_APPROVED');
    expect(adjudicated.adjudicationOutcome?.decision).toBe('APPROVED');
    expect(adjudicated.adjudicationOutcome?.authorizationNumber).toMatch(/^AUTH-PAS-\d+/);
  });
});
