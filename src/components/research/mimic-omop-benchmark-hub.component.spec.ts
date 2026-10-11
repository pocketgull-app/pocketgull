import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MimicOmopBenchmarkHubComponent } from './mimic-omop-benchmark-hub.component';
import { MimicOmopBenchmarkService } from '../../services/research/mimic-omop-benchmark.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('MimicOmopBenchmarkHubComponent', () => {
  let component: MimicOmopBenchmarkHubComponent;
  let fixture: ComponentFixture<MimicOmopBenchmarkHubComponent>;
  let service: MimicOmopBenchmarkService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MimicOmopBenchmarkHubComponent],
      providers: [MimicOmopBenchmarkService],
    }).compileComponents();

    fixture = TestBed.createComponent(MimicOmopBenchmarkHubComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(MimicOmopBenchmarkService);
    fixture.detectChanges();
  });

  it('should create the component successfully', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('comparison');
    expect(component.benchmarkService.activeCohort()).toBe('MULTI_CENTER_COMBINED');
  });

  it('should reflect active cohort metrics correctly', () => {
    const comparison = component.activeComparison();
    expect(comparison.pocketGull.auroc).toBe(0.835);
    expect(comparison.epicSepsisModel.auroc).toBe(0.624);
    expect(component.fatigueSummary().alertBurdenDropPct).toBe(90);

    service.selectCohort('MIMIC_IV_ICU');
    fixture.detectChanges();
    expect(component.activeCohortInfo().cohortName).toContain('MIMIC-IV');
    expect(component.activeComparison().pocketGull.auroc).toBe(0.842);
  });

  it('should switch tabs between comparison, calculator, calibration, and preprint', () => {
    component.activeTab.set('calculator');
    expect(component.activeTab()).toBe('calculator');

    component.activeTab.set('calibration');
    expect(component.activeTab()).toBe('calibration');
    expect(component.calibrationSweep().length).toBe(5);

    component.activeTab.set('preprint');
    expect(component.activeTab()).toBe('preprint');
    expect(component.preprint().title).toContain('Epistemic Conformal Prediction Overcomes Proprietary Sepsis Alarm Fatigue');
  });

  it('should update sim vitals and dynamically recalculate risk', () => {
    // Normal vitals -> singleton NON_SEPSIS
    component.updateSimVital('heartRate', 72);
    component.updateSimVital('systolicBp', 120);
    component.updateSimVital('respiratoryRate', 14);
    component.updateSimVital('temperatureC', 37.0);
    component.updateSimVital('lactateMmolL', 0.9);

    let res = component.simResult();
    expect(res.isSingletonAlert).toBe(false);
    expect(res.alarmTriggered).toBe(false);
    expect(res.predictionSet).toEqual(['NON_SEPSIS']);

    // Borderline vitals -> epistemic abstention
    component.updateSimVital('heartRate', 102);
    component.updateSimVital('systolicBp', 98);
    component.updateSimVital('respiratoryRate', 20);
    component.updateSimVital('lactateMmolL', 1.8);

    res = component.simResult();
    expect(res.isAbstention).toBe(true);
    expect(res.alarmTriggered).toBe(false);
    expect(res.predictionSet).toEqual(['NON_SEPSIS', 'SEPSIS_ALERT']);

    // Severe septic vitals -> high acuity alert
    component.updateSimVital('heartRate', 135);
    component.updateSimVital('systolicBp', 72);
    component.updateSimVital('respiratoryRate', 28);
    component.updateSimVital('lactateMmolL', 4.5);

    res = component.simResult();
    expect(res.isSingletonAlert).toBe(true);
    expect(res.alarmTriggered).toBe(true);
    expect(res.predictionSet).toEqual(['SEPSIS_ALERT']);
  });

  it('should copy BibTeX citation to clipboard and toggle copied indicator', () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    component.onCopyBibtex();
    expect(writeTextMock).toHaveBeenCalledWith(component.preprint().bibtexCitation);
    expect(component.bibtexCopied()).toBe(true);
  });

  it('should copy share URL to clipboard and toggle linkCopied indicator', () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    component.onCopyShareLink();
    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining('/research/mimic-benchmark'));
    expect(component.linkCopied()).toBe(true);
  });

  it('should emit close output when close button or method is invoked', () => {
    let closed = false;
    component.close.subscribe(() => {
      closed = true;
    });

    component.close.emit();
    expect(closed).toBe(true);
  });
});
