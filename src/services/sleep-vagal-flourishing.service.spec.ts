import { SleepVagalFlourishingService } from './sleep-vagal-flourishing.service';

describe('SleepVagalFlourishingService - Autonomic Vagal & Sleep Recovery Suite', () => {
  let service: SleepVagalFlourishingService;

  beforeEach(() => {
    service = new SleepVagalFlourishingService();
  });

  afterEach(() => {
    service.stopPacer();
  });

  describe('1. 0.10 Hz Baroreceptor Respiratory Pacer', () => {
    it('initializes in resting state with baseline sympathetic posture', () => {
      const tel = service.vagalTelemetry();
      expect(tel.respiratoryRateBpm).toBe(6.0);
      expect(tel.rmssdEstimateMs).toBe(28);
      expect(tel.vagalBrakeStatus).toBe('WITHDRAWN (Sympathetic Alarm)');
      expect(service.isPacerActive()).toBe(false);
    });

    it('engages vagal brake and enhances RMSSD as completed cycles accumulate', () => {
      service.isPacerActive.set(true);
      service.completedCycles.set(7); // 7 full 10-second cycles = 70s entrainment (RMSSD 28+24.5=53, Coherence 45+56=98)

      const tel = service.vagalTelemetry();
      expect(tel.rmssdEstimateMs).toBeGreaterThan(45);
      expect(tel.coherenceScorePercent).toBeGreaterThanOrEqual(75);
      expect(tel.vagalBrakeStatus).toBe('ENGAGED (Cardio-Protective Vagal Brake)');
      expect(tel.glymphaticClearanceReadiness).toBe('Peak Restorative State');
      expect(tel.clinicalSummary).toContain('cholinergic anti-inflammatory pathway');
    });
  });

  describe('2. Slow-Wave Sleep & Glymphatic Clearance Forecaster', () => {
    it('calculates elevated glymphatic drainage efficiency when circadian hygiene is optimized', () => {
      service.updateCircadianInputs(25, true, 13); // 25 min sun, blue filtered, caffeine cutoff 1 PM
      const window = service.sleepGlymphaticWindow();

      expect(window.glymphaticDrainageEfficiency).toBeGreaterThanOrEqual(90);
      expect(window.projectedSlowWaveMinutes).toBeGreaterThan(100);
      expect(window.recommendations.some(r => r.includes('0.10 Hz vagal breathing'))).toBe(true);
    });

    it('warns about delayed melatonin and sub-optimal glymphatics when morning sun is absent and blue light is unshielded', () => {
      service.updateCircadianInputs(0, false, 18); // 0 min sun, no filter, caffeine at 6 PM
      const window = service.sleepGlymphaticWindow();

      expect(window.glymphaticDrainageEfficiency).toBeLessThanOrEqual(70);
      expect(window.recommendations.some(r => r.includes('Increase morning outdoor light'))).toBe(true);
      expect(window.recommendations.some(r => r.includes('warm amber display filtering'))).toBe(true);
    });
  });

  describe('3. Screen Apnea Shield', () => {
    it('tracks diaphragmatic apnea release events', () => {
      expect(service.apneaDetectedCounter()).toBe(0);
      service.triggerScreenApneaRelease();
      expect(service.apneaDetectedCounter()).toBe(1);
    });
  });
});
