import { describe, it, expect, beforeEach } from 'vitest';
import { CircadianAlertGuardService } from './circadian-alert-guard.service';

describe('CircadianAlertGuardService (Pillar 2: Cyberchondria & Nocebo Prevention)', () => {
  let service: CircadianAlertGuardService;

  beforeEach(() => {
    service = new CircadianAlertGuardService();
  });

  it('1. Suppresses non-STAT notifications during Circadian Quiet Hours (23:30)', () => {
    const lateNightDate = new Date();
    lateNightDate.setHours(23, 30, 0, 0);

    const routineEval = service.evaluateAlertSuppression(lateNightDate, 'ROUTINE');
    expect(routineEval.shouldSuppress).toBe(true);
    expect(routineEval.suppressionReason).toContain('Circadian Quiet Hours active');
    expect(routineEval.scheduledDeliveryTime).not.toBeNull();
    expect(service.isNighttimeCalmActive()).toBe(true);

    const urgentEval = service.evaluateAlertSuppression(lateNightDate, 'URGENT');
    expect(urgentEval.shouldSuppress).toBe(true);
  });

  it('2. NEVER suppresses STAT_CRITICAL emergencies, even at 02:00 AM', () => {
    const deepNightDate = new Date();
    deepNightDate.setHours(2, 0, 0, 0);

    const statEval = service.evaluateAlertSuppression(deepNightDate, 'STAT_CRITICAL');
    expect(statEval.shouldSuppress).toBe(false);
    expect(statEval.alertPriority).toBe('STAT_CRITICAL');
    expect(statEval.suppressionReason).toBeNull();
  });

  it('3. Allows notifications during daytime active hours (14:00)', () => {
    const daytimeDate = new Date();
    daytimeDate.setHours(14, 0, 0, 0);

    const dayEval = service.evaluateAlertSuppression(daytimeDate, 'ROUTINE');
    expect(dayEval.shouldSuppress).toBe(false);
    expect(service.isNighttimeCalmActive()).toBe(false);
  });

  it('4. Normalizes benign physiological variance with reassuring explanation & parasympathetic prompt', () => {
    // Normal transient heart rate elevation from 70 to 105
    const hrContext = service.normalizePhysiologicalVariance('Heart Rate', 105, 70);
    expect(hrContext.isNormalVariance).toBe(true);
    expect(hrContext.calmingExplanation).toContain('Transient heart rate elevations are common');
    expect(hrContext.parasympatheticPromptRecommended).toBe(true);

    // Normal transient blood pressure reading
    const bpContext = service.normalizePhysiologicalVariance('Systolic Blood Pressure', 144, 120);
    expect(bpContext.isNormalVariance).toBe(true);
    expect(bpContext.calmingExplanation).toContain('white coat effect');
  });

  it('5. Provides Rachel Nabors 0.1 Hz vagal-resonant breathing cadence', () => {
    const cadence = service.getParasympatheticBreathingCadence();
    expect(cadence.frequencyHz).toBe(0.1);
    expect(cadence.cycleDurationSeconds).toBe(10);
    expect(cadence.inhaleSeconds).toBe(4);
    expect(cadence.exhaleSeconds).toBe(6);

    service.startCalmingExercise();
    expect(service.activeParasympatheticPacing()).toBe(true);
    service.stopCalmingExercise();
    expect(service.activeParasympatheticPacing()).toBe(false);
  });
});
