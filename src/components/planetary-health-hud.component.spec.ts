import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { PlanetaryHealthHudComponent } from './planetary-health-hud.component';
import { GreenComputingSustainabilityService } from '../services/green-computing-sustainability.service';

describe('PlanetaryHealthHudComponent Unit Suite', () => {
  let comp: PlanetaryHealthHudComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        PlanetaryHealthHudComponent,
        GreenComputingSustainabilityService
      ]
    });
    comp = runInInjectionContext(injector, () => injector.get(PlanetaryHealthHudComponent));
  });

  it('1. Initializes and computes default active CO2 savings and sustainability score', () => {
    expect(comp).toBeTruthy();
    expect(comp.recommendations().length).toBeGreaterThanOrEqual(5);
    expect(comp.activeCo2SavingsKg()).toBeGreaterThan(100);
    expect(comp.sustainabilityScore()).toBeGreaterThanOrEqual(70);
  });

  it('2. Toggles eco-health habits and re-evaluates active carbon offset', () => {
    const initialSavings = comp.activeCo2SavingsKg();
    comp.toggleHabit('eco_2'); // EAT-Lancet Plant-Forward Nutrition (180kg)
    expect(comp.isSelected('eco_2')).toBe(false);
    expect(comp.activeCo2SavingsKg()).toBeLessThan(initialSavings);

    // Toggle back on
    comp.toggleHabit('eco_2');
    expect(comp.isSelected('eco_2')).toBe(true);
    expect(comp.activeCo2SavingsKg()).toBe(initialSavings);
  });

  it('3. Selects all habits and evaluates top tier ECO LEADER status', () => {
    comp.selectAll();
    expect(comp.selectedCount()).toBe(comp.totalCount());
    expect(comp.sustainabilityScore()).toBe(100);
    expect(comp.activeTier()).toBe('🏆 ECO LEADER');
  });
});
