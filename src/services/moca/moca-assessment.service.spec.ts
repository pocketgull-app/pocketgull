import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { MocaAssessmentService } from './moca-assessment.service';
import { PatientStateService } from '../patient-state.service';
import { PatientManagementService } from '../patient-management.service';
import { StorageService } from '../storage.service';

describe('MocaAssessmentService', () => {
  let service: MocaAssessmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MocaAssessmentService,
        {
          provide: PatientStateService,
          useValue: {
            addClinicalNote: vi.fn(),
            addChecklistItem: vi.fn()
          }
        },
        {
          provide: PatientManagementService,
          useValue: {
            selectedPatient: () => ({ id: 'patient-test-1', name: 'John Doe', age: 72, history: [] }),
            selectedPatientId: () => 'patient-test-1'
          }
        },
        {
          provide: StorageService,
          useValue: {
            savePatient: vi.fn()
          }
        }
      ]
    });

    service = TestBed.inject(MocaAssessmentService);
  });

  it('should initialize with initial state and zero raw score', () => {
    expect(service).toBeTruthy();
    expect(service.rawTotalScore()).toBe(0);
    expect(service.totalAdjustedScore()).toBe(1); // Default education <= 12 yrs grants +1
    expect(service.summaryResult().tier).toBe('SEVERE_IMPAIRMENT');
  });

  describe('Trail Making Test Validation', () => {
    it('should validate exact alternating sequence 1-A-2-B-3-C-4-D-5-E', () => {
      const correctPath = ['1', 'A', '2', 'B', '3', 'C', '4', 'D', '5', 'E'];
      expect(service.validateTrailMaking(correctPath)).toBe(true);
    });

    it('should reject incorrect or out-of-order paths', () => {
      const wrongPath = ['1', '2', 'A', 'B', '3', 'C', '4', 'D', '5', 'E'];
      expect(service.validateTrailMaking(wrongPath)).toBe(false);
    });

    it('should reject incomplete paths', () => {
      const incomplete = ['1', 'A', '2', 'B'];
      expect(service.validateTrailMaking(incomplete)).toBe(false);
    });
  });

  describe('30-Point Scoring Engine', () => {
    it('should accurately calculate perfect 30-point score across all domains', () => {
      // 1. Visuospatial (5 pts)
      service.setTrailMakingScore(true);
      service.setCubeCopyScore(true);
      service.setClockScore('contour', true);
      service.setClockScore('numbers', true);
      service.setClockScore('hands', true);
      expect(service.visuospatialScore()).toBe(5);

      // 2. Naming (3 pts)
      service.setAnimalScore('lion', true);
      service.setAnimalScore('rhinoceros', true);
      service.setAnimalScore('camel', true);
      expect(service.namingScore()).toBe(3);

      // 3. Attention (6 pts)
      service.setDigitSpan('forward', true);
      service.setDigitSpan('backward', true);
      service.sessionState.update(s => ({
        ...s,
        attention: { ...s.attention, vigilanceTapping: true }
      }));
      service.setSerial7Score(5); // 5 correct = 3 pts
      expect(service.attentionScore()).toBe(6);

      // 4. Language (3 pts)
      service.setSentenceRepetition(1, true);
      service.setSentenceRepetition(2, true);
      service.sessionState.update(s => ({
        ...s,
        language: { ...s.language, fluencyPassed: true, fluencyCount: 14 }
      }));
      expect(service.languageScore()).toBe(3);

      // 5. Abstraction (2 pts)
      service.setAbstractionScore('trainBicycle', true);
      service.setAbstractionScore('watchRuler', true);
      expect(service.abstractionScore()).toBe(2);

      // 6. Delayed Recall (5 pts)
      for (let i = 0; i < 5; i++) {
        service.setDelayedRecallSpontaneous(i, true);
      }
      expect(service.delayedRecallScore()).toBe(5);

      // 7. Orientation (6 pts)
      service.setOrientationScore('date', true);
      service.setOrientationScore('month', true);
      service.setOrientationScore('year', true);
      service.setOrientationScore('dayOfWeek', true);
      service.setOrientationScore('place', true);
      service.setOrientationScore('city', true);
      expect(service.orientationScore()).toBe(6);

      // Total raw should be 30
      expect(service.rawTotalScore()).toBe(30);
      expect(service.totalAdjustedScore()).toBe(30);
      expect(service.summaryResult().tier).toBe('NORMAL');
      expect(service.summaryResult().tierLabel).toBe('Normal Cognitive Function');
    });

    it('should correctly apply education adjustment rule', () => {
      // Set raw score to 24
      service.setAnimalScore('lion', true);
      service.setAnimalScore('rhinoceros', true);
      service.setAnimalScore('camel', true); // 3 pts
      for (let i = 0; i < 5; i++) {
        service.setDelayedRecallSpontaneous(i, true); // 5 pts (8 total)
      }
      service.setOrientationScore('date', true);
      service.setOrientationScore('month', true);
      service.setOrientationScore('year', true);
      service.setOrientationScore('dayOfWeek', true);
      service.setOrientationScore('place', true);
      service.setOrientationScore('city', true); // 6 pts (14 total)
      service.setSerial7Score(5); // 3 pts (17 total)
      service.setTrailMakingScore(true); // 1 pt (18 total)
      service.setCubeCopyScore(true); // 1 pt (19 total)
      service.setClockScore('contour', true); // 1 pt (20 total)
      service.setClockScore('numbers', true); // 1 pt (21 total)
      service.setClockScore('hands', true); // 1 pt (22 total)
      service.setAbstractionScore('trainBicycle', true); // 1 pt (23 total)
      service.setAbstractionScore('watchRuler', true); // 1 pt (24 total)

      expect(service.rawTotalScore()).toBe(24);

      // <= 12 years of education adds +1 point (capped at 30)
      service.setEducationYears(10);
      expect(service.educationBonus()).toBe(1);
      expect(service.totalAdjustedScore()).toBe(25);
      expect(service.summaryResult().tier).toBe('MILD_COGNITIVE_IMPAIRMENT');

      // > 12 years of education adds 0 points
      service.setEducationYears(16);
      expect(service.educationBonus()).toBe(0);
      expect(service.totalAdjustedScore()).toBe(24);
      expect(service.summaryResult().tier).toBe('MILD_COGNITIVE_IMPAIRMENT');
    });

    it('should classify Mild Cognitive Impairment tier (18-25 points)', () => {
      service.setEducationYears(16); // No bonus
      // Set to 22 points
      service.setTrailMakingScore(true);
      service.setCubeCopyScore(true);
      service.setClockScore('contour', true);
      service.setClockScore('numbers', true);
      service.setClockScore('hands', true); // 5
      service.setAnimalScore('lion', true);
      service.setAnimalScore('rhinoceros', true);
      service.setAnimalScore('camel', true); // +3 = 8
      service.setOrientationScore('date', true);
      service.setOrientationScore('month', true);
      service.setOrientationScore('year', true);
      service.setOrientationScore('dayOfWeek', true);
      service.setOrientationScore('place', true);
      service.setOrientationScore('city', true); // +6 = 14
      service.setSerial7Score(5); // +3 = 17
      service.setDelayedRecallSpontaneous(0, true);
      service.setDelayedRecallSpontaneous(1, true);
      service.setDelayedRecallSpontaneous(2, true); // +3 = 20
      service.setAbstractionScore('trainBicycle', true);
      service.setAbstractionScore('watchRuler', true); // +2 = 22

      expect(service.totalAdjustedScore()).toBe(22);
      expect(service.summaryResult().tier).toBe('MILD_COGNITIVE_IMPAIRMENT');
      expect(service.summaryResult().tierLabel).toContain('Mild Cognitive Impairment');
    });
  });

  describe('FHIR R4 Bundle Interoperability', () => {
    it('should generate a valid FHIR R4 Bundle with LOINC 72106-8 Observation and 7 domain components', () => {
      service.setTrailMakingScore(true);
      service.setAnimalScore('lion', true);

      const bundle = service.generateFhirR4Bundle();

      expect(bundle).toBeTruthy();
      expect(bundle.resourceType).toBe('Bundle');
      expect(bundle.type).toBe('collection');
      expect(bundle.entry.length).toBe(2);

      const obs = bundle.entry[0].resource;
      expect(obs.resourceType).toBe('Observation');
      expect(obs.status).toBe('final');
      expect(obs.code.coding.some((c: any) => c.code === '72106-8')).toBe(true);
      expect(obs.component.length).toBe(7);

      const qr = bundle.entry[1].resource;
      expect(qr.resourceType).toBe('QuestionnaireResponse');
      expect(qr.status).toBe('completed');
      expect(qr.questionnaire).toBe('http://loinc.org/q/72106-8');
    });
  });
});
