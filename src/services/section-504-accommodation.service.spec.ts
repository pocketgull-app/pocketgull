import { TestBed } from '@angular/core/testing';
import { Section504AccommodationService, Section504Category } from './section-504-accommodation.service';

describe('Section504AccommodationService', () => {
  let service: Section504AccommodationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Section504AccommodationService]
    });
    service = TestBed.inject(Section504AccommodationService);
  });

  it('should initialize with empty active plans', () => {
    expect(service.totalPlansCount()).toBe(0);
    expect(service.selectedPlan()).toBeNull();
  });

  it('should generate a comprehensive Section 504 plan for Type 1 Diabetes', () => {
    const plan = service.generateSection504Plan({
      patientId: 'p101',
      studentName: 'Maya Torres',
      conditionCategory: 'type1_diabetes',
      gradeLevel: 'Grade 5',
      schoolName: 'Lincoln Middle School',
      attendingPhysician: 'Dr. Elena Vance, MD',
      saveToState: true
    });

    expect(plan).toBeDefined();
    expect(plan.primaryDiagnosis).toContain('Type 1 Diabetes Mellitus');
    expect(plan.icd10Codes).toContain('E10.9');
    expect(plan.accommodations.length).toBeGreaterThanOrEqual(3);
    expect(plan.accommodations.some(a => a.id === 't1d-cgm')).toBe(true);
    expect(plan.emergencyActionPlan).toBeDefined();
    expect(plan.emergencyActionPlan?.rescueMedication?.name).toContain('Glucagon');
    expect(service.totalPlansCount()).toBe(1);
    expect(service.selectedPlan()?.studentName).toBe('Maya Torres');
  });

  it('should generate a POTS / Autonomic Dysfunction 504 Plan with hydration and elevator pass', () => {
    const plan = service.generateSection504Plan({
      patientId: 'p102',
      studentName: 'Lucas Campbell',
      conditionCategory: 'pots_dysautonomia',
      gradeLevel: 'Grade 10',
      customAccommodations: ['Permitted 5 minutes extra passing time between science building and gym']
    });

    expect(plan.primaryDiagnosis).toContain('Postural Orthostatic Tachycardia');
    expect(plan.accommodations.some(a => a.id === 'pots-hydration')).toBe(true);
    expect(plan.accommodations.some(a => a.id === 'pots-elevator')).toBe(true);
    expect(plan.accommodations.some(a => a.description.includes('extra passing time'))).toBe(true);
    expect(plan.peModifications.some(pe => pe.includes('recumbent stationary cycling'))).toBe(true);
  });

  it('should generate Anaphylaxis / Food Allergy 504 Plan with FARE emergency protocol', () => {
    const plan = service.generateSection504Plan({
      patientId: 'p103',
      studentName: 'Sammy Chen',
      conditionCategory: 'food_allergy_anaphylaxis',
      gradeLevel: 'Grade 2'
    });

    expect(plan.primaryDiagnosis).toContain('Anaphylaxis');
    expect(plan.accommodations.some(a => a.id === 'allergy-epipen')).toBe(true);
    expect(plan.emergencyActionPlan?.rescueMedication?.name).toContain('EpiPen');
    expect(plan.emergencyActionPlan?.call911Criteria[0]).toContain('Epinephrine');
  });

  it('should support all standard pediatric condition categories in catalog', () => {
    const categories: Section504Category[] = [
      'type1_diabetes',
      'adhd_executive_function',
      'food_allergy_anaphylaxis',
      'pots_dysautonomia',
      'epilepsy_seizure',
      'asthma_respiratory',
      'dyslexia_learning',
      'ibd_gastrointestinal',
      'juvenile_arthritis'
    ];

    categories.forEach(cat => {
      const entry = service.standardAccommodationCatalog[cat];
      expect(entry).toBeDefined();
      expect(entry.primaryDiagnosis.length).toBeGreaterThan(0);
      expect(entry.icd10.length).toBeGreaterThan(0);
      expect(entry.accommodations.length).toBeGreaterThan(0);
    });
  });
});
