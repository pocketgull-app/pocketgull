import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { ClinicalKneeRecoveryLoopService, IMriTargetProbabilities } from './clinical-knee-recovery-loop.service';

describe('ClinicalKneeRecoveryLoopService Unit Suite', () => {
  let service: ClinicalKneeRecoveryLoopService;

  beforeEach(() => {
    const injector = Injector.create({ providers: [] });
    service = runInInjectionContext(injector, () => new ClinicalKneeRecoveryLoopService());
  });

  it('1. Translates 12 RSNA MRI targets into validated KOOS subscales', () => {
    const mri: IMriTargetProbabilities = {
      aclTear: 0.1,
      pclTear: 0.05,
      mclTear: 0.2,
      medialMeniscusTear: 0.85,
      lateralMeniscusTear: 0.1,
      patellofemoralCartilageDefect: 0.3,
      medialFemorotibialCartilageDefect: 0.4,
      lateralFemorotibialCartilageDefect: 0.1,
      jointEffusion: 0.75,
      boneMarrowEdema: 0.5,
      extensorMechanismDisruption: 0.02,
      osteophytes: 0.15
    };

    const koos = service.translateMriToKoos(mri);
    expect(koos.pain).toBeGreaterThan(20);
    expect(koos.pain).toBeLessThan(80);
    expect(koos.symptoms).toBeLessThan(75);
    expect(koos.adl).toBeGreaterThan(30);
    expect(koos.sportRec).toBeLessThan(70);
    expect(koos.compositeKoos).toBeGreaterThan(30);
  });

  it('2. Computes Dynamic Recovery Velocity and tracks remodeling progress', () => {
    const report = service.currentRecoveryReport();
    expect(report.currentDay).toBe(14);
    expect(report.observedImprovementScore).toBeGreaterThan(0);
    expect(report.expectedBenchmarkScore).toBeGreaterThan(0);
    expect(report.velocityRatio).toBeGreaterThan(0.5);
    expect(report.activePhase.phaseNumber).toBeDefined();
    expect(report.projectedFullRecoveryDay).toBeGreaterThan(14);
  });

  it('3. Flags Arthrogenic Muscle Inhibition (AMI) when joint effusion is prominent', () => {
    const report = service.currentRecoveryReport();
    const amiVulnerability = report.kineticVulnerabilities.find(v => v.name.includes('Arthrogenic'));
    expect(amiVulnerability?.biomechanicalMechanism.toLowerCase()).toContain('capsular effusion');
    expect(amiVulnerability?.clinicalAction).toContain('isometric quad sets');
  });

  it('4. Prescribes 4-phase physical therapy roadmap with safe progression criteria', () => {
    const report = service.currentRecoveryReport();
    expect(report.activePhase.keyExercises.length).toBeGreaterThan(2);
    expect(report.activePhase.contraindicatedMovements.length).toBeGreaterThan(0);
  });

  it('5. Updates recovery log reactively upon new daily check-in', () => {
    const initialHistoryLength = service.checkInHistory().length;
    service.logDailyCheckIn({
      dayNumber: 21,
      morningStiffnessMinutes: 10,
      vasPain: 2.0,
      activeFlexionDegrees: 125,
      dailyStepTolerance: 7500,
      compliancePhaseExercise: true
    });

    expect(service.checkInHistory().length).toBe(initialHistoryLength + 1);
    const updatedReport = service.currentRecoveryReport();
    expect(updatedReport.currentDay).toBe(21);
  });
});
