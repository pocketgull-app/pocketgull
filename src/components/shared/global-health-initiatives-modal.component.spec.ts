import { Injector, runInInjectionContext, signal } from '@angular/core';
import { GlobalHealthInitiativesModalComponent } from './global-health-initiatives-modal.component';
import { GlobalHealthInitiativesService } from '../../services/global-health-initiatives.service';
import { PatientStateService } from '../../services/patient-state.service';

describe('GlobalHealthInitiativesModalComponent', () => {
  const createComponent = () => {
    const mockPatientState = {
      patientName: signal('John Doe'),
      patientAge: signal(48),
      patientGender: signal('Male'),
      vitals: signal({ bp: '124/80', hr: '72', spO2: '98', temp: '36.6', weight: '74', height: '175' }),
      patientHistory: signal([{ summary: 'Fatigue and Stress' }]),
      issues: signal({}),
      patientGoals: signal('Cardiometabolic Health')
    };

    const injector = Injector.create({
      providers: [
        { provide: GlobalHealthInitiativesService, useClass: GlobalHealthInitiativesService },
        { provide: PatientStateService, useValue: mockPatientState }
      ]
    });

    return runInInjectionContext(injector, () => new GlobalHealthInitiativesModalComponent());
  };

  it('1. Initializes modal in closed state and toggles open/close', () => {
    const modal = createComponent();
    expect(modal.isOpen()).toBe(false);
    modal.open();
    expect(modal.isOpen()).toBe(true);
    modal.close();
    expect(modal.isOpen()).toBe(false);
  });

  it('2. Computes reactive WHO 10-year CVD risk and ICD-11 dual-coding mappings', () => {
    const modal = createComponent();
    const risk = modal.whoCvdRisk();
    expect(risk.riskScorePercent).toBeGreaterThan(0);
    expect(risk.whoHeartsRecommendations.length).toBeGreaterThan(0);

    const mappings = modal.whoIcd11Mappings();
    expect(mappings.length).toBeGreaterThan(0);
    expect(mappings[0].icd11Tm1Code).toContain('TM1:');
  });

  it('3. Computes reactive NIH Geroscience and ARPA-H triage data', () => {
    const modal = createComponent();
    const nih = modal.nihAssessment();
    expect(nih.estimatedBiologicalAge).toBeDefined();
    expect(nih.vagalToneScore).toBeGreaterThan(0);

    const arpah = modal.arpahTriage();
    expect(arpah.triageCategory).toBeDefined();
    expect(arpah.meshHandoffQrCodePayload).toContain('Active Patient');
  });

  it('4. Switches active agency tabs (who, nih, arpah)', () => {
    const modal = createComponent();
    expect(modal.activeAgencyTab()).toBe('who');
    modal.activeAgencyTab.set('nih');
    expect(modal.activeAgencyTab()).toBe('nih');
    modal.activeAgencyTab.set('arpah');
    expect(modal.activeAgencyTab()).toBe('arpah');
  });
});
