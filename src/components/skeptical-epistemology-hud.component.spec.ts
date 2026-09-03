import '@angular/compiler';
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

  it('5. Computes filtered biohacks by selected category', () => {
    expect(component.filteredBiohacks().length).toBeGreaterThanOrEqual(8);

    component.selectedCategory.set('Thermal');
    expect(component.filteredBiohacks().length).toBe(2);
    expect(component.filteredBiohacks().every(b => b.category === 'Thermal')).toBe(true);

    component.selectedCategory.set('Nutraceutical');
    expect(component.filteredBiohacks().every(b => b.category === 'Nutraceutical')).toBe(true);
  });

  it('6. Selects and evaluates active biohack in HUD', () => {
    component.selectBiohack('photobiomodulation');
    expect(component.activeBiohackId()).toBe('photobiomodulation');

    const active = component.activeBiohack();
    expect(active?.id).toBe('photobiomodulation');
    expect(active?.evidenceTier).toBe('Level A (Replicated RCTs)');
    expect(active?.falsifiability.pValue).toBeLessThan(0.05);
  });

  it('7. Returns correct Tailwind color classes for Cochrane risk levels', () => {
    expect(component.getBiasColorClass('Low Risk of Bias')).toContain('text-emerald');
    expect(component.getBiasColorClass('Some Concerns')).toContain('text-amber');
    expect(component.getBiasColorClass('High Risk of Bias')).toContain('text-rose');
  });

  it('8. Computes biophysical falsification catalog and supports tab switching', () => {
    const catalog = component.biophysicalCatalog();
    expect(catalog.protacPolypharmacy).toBeDefined();
    expect(catalog.llpsPhaseBoundary).toBeDefined();
    expect(catalog.quantumThermalNoise).toBeDefined();
    expect(catalog.quantumDualSpin).toBeDefined();
    expect(catalog.reticularPoreSieve).toBeDefined();

    expect(component.activeBiophysTab()).toBe('protac');
    component.activeBiophysTab.set('llps');
    expect(component.activeBiophysTab()).toBe('llps');
    component.activeBiophysTab.set('quantum');
    expect(component.activeBiophysTab()).toBe('quantum');
    component.activeBiophysTab.set('dualspin');
    expect(component.activeBiophysTab()).toBe('dualspin');
    component.activeBiophysTab.set('pore');
    expect(component.activeBiophysTab()).toBe('pore');
  });
});

