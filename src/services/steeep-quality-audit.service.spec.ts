import { TestBed } from '@angular/core/testing';
import { SteeepQualityAuditService } from './steeep-quality-audit.service';
import { PatientStateService } from './patient-state.service';
import { SkepticalEpistemologyService } from './skeptical-epistemology.service';

describe('SteeepQualityAuditService (National Academy of Medicine)', () => {
  let service: SteeepQualityAuditService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SteeepQualityAuditService,
        {
          provide: PatientStateService,
          useValue: {
            isDemoMode: () => true,
            activePatient: () => ({ name: 'Jane Doe' })
          }
        },
        {
          provide: SkepticalEpistemologyService,
          useValue: {
            evaluateEvidence: () => ({ pValue: 0.0028, isSignificant: true })
          }
        }
      ]
    });

    service = TestBed.inject(SteeepQualityAuditService);
  });

  it('should initialize with an active NAM STEEEP report', () => {
    expect(service).toBeTruthy();
    const report = service.activeReport();
    expect(report).toBeTruthy();
    expect(report.compositeScore).toBeGreaterThanOrEqual(90);
    expect(report.compositeGrade).toBe('A');
    expect(report.dimensions.SAFE).toBeDefined();
    expect(report.dimensions.TIMELY).toBeDefined();
    expect(report.dimensions.EFFECTIVE).toBeDefined();
    expect(report.dimensions.EFFICIENT).toBeDefined();
    expect(report.dimensions.EQUITABLE).toBeDefined();
    expect(report.dimensions.PATIENT_CENTERED).toBeDefined();
  });

  it('should audit all 6 STEEEP dimensions with optimal scores', () => {
    const report = service.generateAuditReport('test-patient');
    expect(report.dimensions.SAFE.score).toBe(98);
    expect(report.dimensions.TIMELY.score).toBe(95);
    expect(report.dimensions.EFFECTIVE.score).toBe(96);
    expect(report.dimensions.EFFICIENT.score).toBe(94);
    expect(report.dimensions.EQUITABLE.score).toBe(97);
    expect(report.dimensions.PATIENT_CENTERED.score).toBe(99);
    expect(report.sha256Seal).toContain('sha256-nam-steeep-');
  });

  it('should generate a 1-page Refrigerator Care Card with 3-Act trajectory and traffic light plan', () => {
    const card = service.generateRefrigeratorCareCard();
    expect(card).toBeTruthy();
    expect(card.patientName).toBe('Jane Doe');
    expect(card.threeActTrajectory.whereYouveBeen).toBeTruthy();
    expect(card.threeActTrajectory.whereYouStandToday).toBeTruthy();
    expect(card.threeActTrajectory.whereYoureGoing).toBeTruthy();

    // Traffic Light Plan
    expect(card.trafficLightActionPlan.green.actions.length).toBeGreaterThan(0);
    expect(card.trafficLightActionPlan.yellow.actions.length).toBeGreaterThan(0);
    expect(card.trafficLightActionPlan.red.actions.length).toBeGreaterThan(0);

    // Teach-Back Verification
    expect(card.teachBackQuestions.length).toBe(3);
    expect(card.fleschKincaidGradeLevel).toBeLessThanOrEqual(5.0);
  });

  it('should serialize report into HL7 FHIR R4 MeasureReport with LOINC 96841-2', () => {
    const report = service.generateAuditReport('test-patient-123');
    const fhir = service.generateFhirMeasureReport(report);

    expect(fhir.resourceType).toBe('MeasureReport');
    expect(fhir.status).toBe('complete');
    expect(fhir.type).toBe('individual');
    expect(fhir.group.length).toBe(6);
    expect(fhir.group[0].code.coding[0].code).toBe('96841-2');
    expect(fhir.extension.find((e: any) => e.url.includes('steeep-composite-score'))?.valueDecimal).toBe(report.compositeScore);
    expect(fhir.extension.find((e: any) => e.url.includes('sha256-attestation-seal'))?.valueString).toBe(report.sha256Seal);
  });
});
