import '@angular/compiler';
import { describe, beforeEach, it, expect } from 'vitest';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { SkepticalEpistemologyHudComponent } from './skeptical-epistemology-hud.component';
import { SkepticalEpistemologyService } from '../services/skeptical-epistemology.service';

describe('SkepticalEpistemologyHudComponent', () => {
  let component: SkepticalEpistemologyHudComponent;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = createEnvironmentInjector([
      { provide: SkepticalEpistemologyService, useClass: SkepticalEpistemologyService }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new SkepticalEpistemologyHudComponent();
    });
  });

  it('1. Creates component instance cleanly', () => {
    expect(component).toBeTruthy();
  });

  it('2. Computes FDA CDS compliance report and Cochrane bias grid', () => {
    const r = component.report();
    expect(r.isFdaSection520oCompliant).toBe(true);
    expect(r.cochraneBias.randomizationBias).toBe('Low Risk of Bias');
    expect(r.cochraneBias.overallRiskOfBias).toBe('Some Concerns');
    expect(r.overallConfidencePercent).toBeGreaterThan(50);
  });

  it('3. Generates Socratic critical reasoning challenges for active lens', () => {
    const challenges = component.challenges();
    expect(challenges.length).toBeGreaterThan(0);
    expect(challenges[0].question).toBeTruthy();
  });

  it('4. Allows user option selection during Socratic challenge', () => {
    expect(component.selectedOptionIndex()).toBeNull();
    component.selectOption(1);
    expect(component.selectedOptionIndex()).toBe(1);
  });
});
