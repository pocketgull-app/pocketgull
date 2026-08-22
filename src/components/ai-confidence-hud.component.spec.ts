import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { AiConfidenceHudComponent } from './ai-confidence-hud.component';
import { AiConfidenceCalibrationService } from '../services/ai-confidence-calibration.service';

describe('AiConfidenceHudComponent', () => {
  const createComponent = (inputText = '') => {
    const calibrationService = new AiConfidenceCalibrationService();
    const injector = Injector.create({
      providers: [
        { provide: AiConfidenceCalibrationService, useValue: calibrationService }
      ]
    });

    const comp = runInInjectionContext(injector, () => new AiConfidenceHudComponent());
    (comp as any).inputText = signal(inputText);
    return comp;
  };

  it('should create and compute default metrics', () => {
    const comp = createComponent();
    expect(comp).toBeTruthy();
    expect(comp.metrics().overallConfidencePercent).toBeGreaterThan(0);
    expect(comp.metrics().isFda520oCompliant).toBe(true);
  });

  it('should reactively calculate metrics for provided input text', () => {
    const comp = createComponent('AHA/ACC 2024 Guidelines standard of care first-line therapy [PMID: 32014521].');
    const metrics = comp.metrics();
    expect(metrics.overallConfidencePercent).toBeGreaterThanOrEqual(80);
    expect(metrics.citationCount).toBeGreaterThanOrEqual(1);
    expect(metrics.guidelineConcordanceGrade).toBe('Grade A (RCT/Guideline)');
  });
});
