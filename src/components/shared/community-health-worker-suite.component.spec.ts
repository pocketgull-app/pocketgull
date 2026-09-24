import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunityHealthWorkerSuiteComponent } from './community-health-worker-suite.component';
import { WhoEssentialMedicinesService } from '../../services/who-essential-medicines.service';

describe('CommunityHealthWorkerSuiteComponent', () => {
  let component: CommunityHealthWorkerSuiteComponent;
  let fixture: ComponentFixture<CommunityHealthWorkerSuiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityHealthWorkerSuiteComponent],
      providers: [WhoEssentialMedicinesService]
    }).compileComponents();

    fixture = TestBed.createComponent(CommunityHealthWorkerSuiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the CHW Suite component', () => {
    expect(component).toBeTruthy();
  });

  it('should classify MUAC correctly for Severe Acute Malnutrition (SAM)', () => {
    component.muacMm.set(110); // <115mm
    component.edemaGrade.set('NONE');
    fixture.detectChanges();

    const triage = component.muacTriage();
    expect(triage.statusTier).toBe('SEVERE_ACUTE_MALNUTRITION');
    expect(triage.statusLabel).toContain('SAM');
    expect(triage.rutfSachetsPerDay).toBeGreaterThanOrEqual(2);
  });

  it('should flag SAM when bilateral pitting edema is present regardless of MUAC', () => {
    component.muacMm.set(135); // Normal circumference
    component.edemaGrade.set('GRADE_2'); // Edema present
    fixture.detectChanges();

    const triage = component.muacTriage();
    expect(triage.statusTier).toBe('SEVERE_ACUTE_MALNUTRITION');
    expect(triage.clinicalAction).toContain('Kwashiorkor');
  });

  it('should classify MUAC correctly for Moderate Acute Malnutrition (MAM)', () => {
    component.muacMm.set(120); // 115-124mm
    component.edemaGrade.set('NONE');
    fixture.detectChanges();

    const triage = component.muacTriage();
    expect(triage.statusTier).toBe('MODERATE_ACUTE_MALNUTRITION');
    expect(triage.statusLabel).toContain('MAM');
  });

  it('should classify tachypnea and fast breathing according to WHO IMCI age cutoffs', () => {
    // Age 2 to 11 months, cutoff is >=50 bpm
    component.respiratoryAgeGroup.set('2_11_MONTHS');
    component.respiratoryBpm.set(54);
    fixture.detectChanges();

    let pneu = component.pneumoniaTriage();
    expect(pneu.classification).toBe('PNEUMONIA');
    expect(pneu.recommendedTreatment).toContain('Amoxicillin');

    // Add chest indrawing -> triggers Severe Pneumonia (RED)
    component.chestIndrawing.set(true);
    fixture.detectChanges();

    pneu = component.pneumoniaTriage();
    expect(pneu.classification).toBe('SEVERE_PNEUMONIA');
    expect(pneu.recommendedTreatment).toContain('hospital referral');
  });

  it('should classify dehydration and calculate ORS volume according to WHO Plan B', () => {
    component.childWeightKg.set(10);
    component.generalState.set('IRRITABLE');
    component.thirstState.set('EAGER');
    fixture.detectChanges();

    const deh = component.dehydrationTriage();
    expect(deh.plan).toBe('PLAN_B');
    expect(deh.orsVolumeMl4Hours).toBe(750); // 10kg * 75 mL = 750 mL
    expect(deh.zincDoseMgDaily).toBe(20);
  });

  it('should compute compact QR handoff payload', () => {
    const payloadStr = component.qrPayloadString();
    expect(payloadStr).toContain('POCKETGULL_CHW_HANDOFF_V1');
    const parsed = JSON.parse(payloadStr);
    expect(parsed.patient.muacMm).toBe(128);
  });
});
