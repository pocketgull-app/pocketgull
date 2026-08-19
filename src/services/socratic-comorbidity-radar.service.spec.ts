import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { SocraticComorbidityRadarService } from './socratic-comorbidity-radar.service';
import { PatientStateService } from './patient-state.service';
import { ClinicalAssessmentsService } from './clinical-assessments/clinical-assessments.service';

describe('SocraticComorbidityRadarService', () => {
  let service: SocraticComorbidityRadarService;
  let mockPatientState: {
    selectedPartId: ReturnType<typeof signal<string | null>>;
    issues: ReturnType<typeof signal<Record<string, any[]>>>;
  };
  let mockAssessments: {
    sibiScore: ReturnType<typeof signal<number>>;
  };

  beforeEach(() => {
    mockPatientState = {
      selectedPartId: signal<string | null>(null),
      issues: signal<Record<string, any[]>>({})
    };
    mockAssessments = {
      sibiScore: signal<number>(0)
    };

    const injector = Injector.create({
      providers: [
        SocraticComorbidityRadarService,
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: ClinicalAssessmentsService, useValue: mockAssessments }
      ]
    });

    service = runInInjectionContext(injector, () => injector.get(SocraticComorbidityRadarService));
  });

  it('should return empty referrals when no parts are selected or have issues', () => {
    expect(service.activeReferrals().length).toBe(0);
    expect(service.radarTargetPartIds().size).toBe(0);
  });

  it('should trigger Phrenic nerve referral to liver when right shoulder is selected', () => {
    mockPatientState.selectedPartId.set('r_shoulder');
    const referrals = service.activeReferrals();
    expect(referrals.length).toBeGreaterThan(0);
    const phrenic = referrals.find(r => r.id === 'ref_r_shoulder_phrenic');
    expect(phrenic).toBeDefined();
    expect(phrenic?.targetPartId).toBe('liver');
    expect(service.radarTargetPartIds().has('liver')).toBe(true);
  });

  it('should trigger Cardiac Angina referral when left arm is selected', () => {
    mockPatientState.selectedPartId.set('l_arm');
    const referrals = service.activeReferrals();
    const cardiac = referrals.find(r => r.id === 'ref_l_arm_cardiac');
    expect(cardiac).toBeDefined();
    expect(cardiac?.targetPartId).toBe('heart');
    expect(cardiac?.urgency).toBe('critical');
    expect(service.radarTargetPartIds().has('heart')).toBe(true);
  });

  it('should trigger Periodontal SIBI Cross-talk when knee has issues and SIBI score >= 4', () => {
    mockPatientState.issues.set({ 'r_knee': [{ text: 'Joint pain' }] });
    mockAssessments.sibiScore.set(5);

    const referrals = service.activeReferrals();
    const sibi = referrals.find(r => r.id === 'ref_sibi_periodontal_synovial');
    expect(sibi).toBeDefined();
    expect(sibi?.referralType).toBe('systemic_inflammatory');
    expect(service.radarTargetPartIds().has('oral_fdi_teeth')).toBe(true);
  });

  it('should allow dismissing and resetting referrals', () => {
    mockPatientState.selectedPartId.set('head');
    expect(service.activeReferrals().length).toBe(1);

    service.dismissReferral('ref_head_tmj_cervical');
    expect(service.activeReferrals().length).toBe(0);

    service.resetDismissed();
    expect(service.activeReferrals().length).toBe(1);
  });
});
