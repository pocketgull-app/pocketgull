import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PediatricClinicalTrajectoryHubComponent } from './pediatric-clinical-trajectory-hub.component';
import { PatientStateService } from '../../services/patient-state.service';
import { CoppaPrivacyShieldService } from '../../services/coppa-privacy-shield.service';

describe('PediatricClinicalTrajectoryHubComponent Suite', () => {
  let component: PediatricClinicalTrajectoryHubComponent;
  let fixture: ComponentFixture<PediatricClinicalTrajectoryHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PediatricClinicalTrajectoryHubComponent],
      providers: [
        PatientStateService,
        CoppaPrivacyShieldService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PediatricClinicalTrajectoryHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes PediatricClinicalTrajectoryHubComponent with default pediatric age and weight', () => {
    expect(component).toBeTruthy();
    expect(component.patientAgeYears()).toBe(7);
    expect(component.patientWeightKg()).toBe(23.5);
    expect(component.weightPercentile()).toBeGreaterThan(0);
  });

  it('2. Dynamically computes weight-calibrated ISMP doses', () => {
    component.patientWeightKg.set(20.0);
    fixture.detectChanges();

    const doses = component.dosageCalculations();
    const acetaminophen = doses.find(d => d.drugName.includes('Acetaminophen'));
    expect(acetaminophen).toBeDefined();
    // 12.5 mg/kg * 20 kg = 250 mg
    expect(acetaminophen?.computedDoseMg).toBe(250);

    const ibuprofen = doses.find(d => d.drugName.includes('Ibuprofen'));
    expect(ibuprofen).toBeDefined();
    // 7.5 mg/kg * 20 kg = 150 mg
    expect(ibuprofen?.computedDoseMg).toBe(150);
  });

  it('3. Enforces max single dose bounds on weight-based calculations', () => {
    // High weight child (60 kg)
    component.patientWeightKg.set(60.0);
    fixture.detectChanges();

    const doses = component.dosageCalculations();
    const acetaminophen = doses.find(d => d.drugName.includes('Acetaminophen'));
    // 12.5 * 60 = 750, capped at maxSingleDoseMg 650
    expect(acetaminophen?.computedDoseMg).toBe(650);
  });

  it('4. Emits selectQuery output when steering AAP evidence', () => {
    let emitted: { query: string; engine: 'pubmed' | 'gse' | 'google' } | undefined;
    component.selectQuery.subscribe((event) => {
      emitted = event;
    });

    const aapTopic = component.evidenceTopics.find(t => t.id === 'aap-fever-guideline');
    expect(aapTopic).toBeDefined();

    component.steerEvidence(aapTopic!);

    expect(emitted).toBeDefined();
    expect(emitted?.engine).toBe('pubmed');
    expect(emitted?.query).toContain('American Academy of Pediatrics');
  });
});
