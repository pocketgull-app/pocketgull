import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { CostBenefitAnalysisComponent } from './cost-benefit-analysis.component';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';
import { ThemeService } from '../services/theme.service';

describe('CostBenefitAnalysisComponent Unit Suite', () => {
  let component: CostBenefitAnalysisComponent;

  beforeEach(async () => {
    const mockState = {
      patientAge: signal(68),
      paretoWeights: signal({ cost: 0.5, efficacy: 0.5 }),
      banditState: signal({ pulls: 0 }),
      clinicianRole: signal('attending'),
      genomicProfile: signal(null),
      lensAnnotations: signal({}),
      clinicalNotes: signal([]),
      addClinicalNote: vi.fn()
    };

    const mockPatientManager = {
      selectedPatientId: signal('p004'),
      patients: signal([
        { id: 'p004', name: 'Sentinel Alpha' }
      ])
    };

    const mockTheme = {
      isPlainLanguageMode: signal(false)
    };

    await TestBed.configureTestingModule({
      imports: [CostBenefitAnalysisComponent],
      providers: [
        { provide: PatientStateService, useValue: mockState },
        { provide: PatientManagementService, useValue: mockPatientManager },
        { provide: ClinicalIntelligenceService, useValue: { analysisResults: signal({}) } },
        { provide: ThemeService, useValue: mockTheme }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(CostBenefitAnalysisComponent);
    component = fixture.componentInstance;
  });

  it('1. Instantiates successfully with default mode as treatment', () => {
    expect(component).toBeTruthy();
    expect(component.activeMode()).toBe('treatment');
    expect(component.compliancePricingMode()).toBe('cash');
  });

  it('2. Computes Medicare financial eligibility based on patient age', () => {
    expect(component.isMedicareEligible).toBe(true);
    expect(component.monthlyMpppCapUsd).toBe(167);
  });

  it('3. Identifies sentinel patient profile via computed signal', () => {
    expect(component.isSentinel()).toBe(true);
  });

  it('4. Toggles active mode between treatment and prevention', () => {
    component.activeMode.set('prevention');
    expect(component.activeMode()).toBe('prevention');
  });

  it('5. Switches compliance pricing mode between cash and aca', () => {
    component.compliancePricingMode.set('aca');
    expect(component.compliancePricingMode()).toBe('aca');
  });
});
