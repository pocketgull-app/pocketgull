import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KneeRecoveryRoadmapComponent } from './knee-recovery-roadmap.component';
import { ClinicalKneeRecoveryLoopService } from '../services/clinical-knee-recovery-loop.service';

describe('KneeRecoveryRoadmapComponent', () => {
  let component: KneeRecoveryRoadmapComponent;
  let fixture: ComponentFixture<KneeRecoveryRoadmapComponent>;
  let loopService: ClinicalKneeRecoveryLoopService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KneeRecoveryRoadmapComponent],
      providers: [ClinicalKneeRecoveryLoopService]
    }).compileComponents();

    fixture = TestBed.createComponent(KneeRecoveryRoadmapComponent);
    component = fixture.componentInstance;
    loopService = TestBed.inject(ClinicalKneeRecoveryLoopService);
    loopService.resetMriProfile();
    loopService.resetCheckInHistory();
    fixture.detectChanges();
  });

  it('1. Should instantiate KneeRecoveryRoadmapComponent', () => {
    expect(component).toBeTruthy();
  });

  it('2. Should render composite KOOS and 5-subscale telemetry readouts', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Composite KOOS');
    expect(compiled.textContent).toContain('Knee Injury Outcome Score');
    expect(compiled.textContent).toContain('Activities of Daily Living');
    expect(compiled.textContent).toContain('Sport & Recreation');
    expect(compiled.textContent).toContain('Knee Quality of Life');

    const telemetryElements = compiled.querySelectorAll('.font-clinical-telemetry');
    expect(telemetryElements.length).toBeGreaterThan(5);
  });

  it('3. Should render Arthrogenic Muscle Inhibition (AMI) risk shield for joint effusion', () => {
    // Default baseline has jointEffusion = 0.76 > 0.50
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Arthrogenic Muscle Inhibition (AMI)');
    expect(compiled.textContent).toContain('vastus medialis obliquus');
    expect(compiled.textContent).toContain('isometric quad sets');
  });

  it('4. Should load clinical scenario presets and adapt active phase', () => {
    component.loadScenario('acute_acl_effusion');
    fixture.detectChanges();

    expect(component.mri().aclTear).toBe(0.95);
    expect(component.mri().jointEffusion).toBe(0.92);
    expect(component.report().currentDay).toBe(4);
    expect(component.report().activePhase.phaseNumber).toBe(1);

    component.loadScenario('post_op_acl');
    fixture.detectChanges();

    expect(component.mri().aclTear).toBe(0.04);
    expect(component.report().currentDay).toBe(45);
    expect(component.report().activePhase.phaseNumber).toBe(3);
  });

  it('5. Should reactively recalculate recovery report when check-in sliders are adjusted', () => {
    const initialImprovement = component.report().observedImprovementScore;

    // Simulate improving VAS pain to 1.0 and flexion to 135 deg
    component.onVasChange({ target: { value: '1.0' } } as unknown as Event);
    component.onFlexionChange({ target: { value: '135' } } as unknown as Event);
    fixture.detectChanges();

    const improvedScore = component.report().observedImprovementScore;
    expect(improvedScore).toBeGreaterThanOrEqual(initialImprovement);
  });

  it('6. Should allow selecting different rehab phases to inspect exercise protocol', () => {
    component.selectedPhaseView.set(2);
    fixture.detectChanges();

    const details = component.getPhaseDetails(2);
    expect(details.title).toContain('Closed Kinetic Chain');
    expect(details.keyExercises.some(e => e.includes('Glute Bridges'))).toBe(true);

    component.selectedPhaseView.set(4);
    fixture.detectChanges();

    const phase4Details = component.getPhaseDetails(4);
    expect(phase4Details.title).toContain('Return-to-Sport');
    expect(phase4Details.keyExercises.some(e => e.includes('Agility Drills'))).toBe(true);
  });

  it('7. Starts Hands-Free Voice-Guided PT Coach session with parasympathetic hold timer', () => {
    component.startGuidedPtSession(1);
    fixture.detectChanges();

    expect(component.isCoachingActive()).toBe(true);
    expect(component.isCoachingPaused()).toBe(false);
    expect(component.coachingPhaseNumber()).toBe(1);
    expect(component.coachingCurrentSet()).toBe(1);
    expect(component.coachingStep()).toBe('contract');
    expect(component.activeHoldCountdown()).toBe(10);
    expect(component.currentCoachingExerciseName()).toContain('Isometric Quadriceps');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Hands-Free Voice PT Coach');
    expect(compiled.textContent).toContain('Phase 1 Regimen');
  });

  it('8. Toggles coach pause and resume gracefully', () => {
    component.startGuidedPtSession(1);
    expect(component.isCoachingPaused()).toBe(false);

    component.toggleCoachPause();
    expect(component.isCoachingPaused()).toBe(true);
    expect(component.coachingStatusMessage()).toContain('paused');

    component.toggleCoachPause();
    expect(component.isCoachingPaused()).toBe(false);
    expect(component.coachingStatusMessage()).toContain('resumed');
  });

  it('9. Advances isometric hold contraction to rest interval, and allows skipping exercises', () => {
    component.startGuidedPtSession(1);
    expect(component.coachingStep()).toBe('contract');

    // Advance to rest step
    component.advanceCoachingStep();
    expect(component.coachingStep()).toBe('rest');
    expect(component.activeHoldCountdown()).toBe(5);
    expect(component.coachingStatusMessage()).toContain('Rest interval');

    // Advance back to contract for set 2
    component.advanceCoachingStep();
    expect(component.coachingStep()).toBe('contract');
    expect(component.coachingCurrentSet()).toBe(2);

    // Skip to next exercise in phase
    const initialIndex = component.coachingExerciseIndex();
    component.skipToNextExercise();
    expect(component.coachingExerciseIndex()).toBe(initialIndex + 1);
    expect(component.coachingCurrentSet()).toBe(1);
  });

  it('10. Stops guided session cleanly and cleans up timers on destroy', () => {
    component.startGuidedPtSession(2);
    expect(component.isCoachingActive()).toBe(true);

    component.stopGuidedPtSession();
    expect(component.isCoachingActive()).toBe(false);
    expect(component.coachingStep()).toBe('idle');

    // Test ngOnDestroy does not throw
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('11. Exports HL7 FHIR R4 CarePlan Bundle with FDA 21 CFR Part 11 cryptographic seal', async () => {
    await component.exportFhirCarePlanBundle();
    fixture.detectChanges();

    expect(component.fhirExportSuccess()).toBe(true);
    expect(component.lastExportSeal()).toBeDefined();
    expect(component.lastExportSeal()?.length).toBe(64);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('HL7 FHIR R4 CarePlan Bundle Exported');
    expect(compiled.textContent).toContain('FDA 21 CFR Part 11 Certified');

    component.dismissExportAttestation();
    expect(component.fhirExportSuccess()).toBe(false);
  });

  it('12. Handles Web Speech API fallbacks defensively without unhandled exceptions', () => {
    // Should safely execute without throwing even when window.speechSynthesis is undefined or mocked
    expect(() => component.speakCoach('Quadriceps contraction test')).not.toThrow();
  });
});

