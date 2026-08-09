import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { FoodSafetyGuardrailCardComponent } from './food-safety-guardrail-card.component';
import { PatientStateService } from '../services/patient-state.service';
import { ThemeService } from '../services/theme.service';
import { ActuarialLongevityService } from '../services/actuarial-longevity.service';

describe('FoodSafetyGuardrailCardComponent', () => {
  const createCard = (vitals = { bp: '138/88', hr: '84' }, meds: Array<{ id: string; name: string; value: string }> = [{ id: 'm1', name: 'Atorvastatin', value: '20mg' }], occupation = 'Polymath & Renaissance Scholar') => {
    const mockThemeService = {
      activeTheme: signal<'light' | 'dark'>('dark')
    };

    const mockPatientState = {
      vitals: signal(vitals),
      medications: signal(meds),
      occupation: signal(occupation)
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: ActuarialLongevityService, useValue: {} }
      ]
    });

    return runInInjectionContext(injector, () => new FoodSafetyGuardrailCardComponent());
  };

  it('should create the food safety guardrail card component', () => {
    const card = createCard();
    expect(card).toBeTruthy();
  });

  it('should dynamically generate food safety rules based on patient vitals and medications', () => {
    const card = createCard({ bp: '138/88', hr: '84' }, [{ id: 'm1', name: 'Atorvastatin', value: '20mg' }], 'Polymath & Renaissance Scholar');
    const rules = card.activeRules();

    expect(rules.length).toBeGreaterThanOrEqual(3);
    expect(rules.some(r => r.id === 'cyp3a4-grapefruit')).toBe(true);
    expect(rules.some(r => r.id === 'hypertension-food')).toBe(true);
    expect(rules.some(r => r.id === 'polymath-hyper-ideation')).toBe(true);
  });

  it('should generate shift worker, executive, outdoor laborer, and athlete safety rules based on profession', () => {
    const nurseCard = createCard({ bp: '120/80', hr: '72' }, [], 'Registered Nurse (Shift Work)');
    expect(nurseCard.activeRules().some(r => r.id === 'shift-worker-circadian')).toBe(true);

    const execCard = createCard({ bp: '120/80', hr: '72' }, [], 'Executive CEO & Trader');
    expect(execCard.activeRules().some(r => r.id === 'executive-caffeine-ceiling')).toBe(true);

    const gardenerCard = createCard({ bp: '120/80', hr: '72' }, [], 'Master Gardener & Landscaper');
    expect(gardenerCard.activeRules().some(r => r.id === 'outdoor-uv-heat-strain')).toBe(true);

    const devCard = createCard({ bp: '120/80', hr: '72' }, [], 'Software Engineer & Developer');
    expect(devCard.activeRules().some(r => r.id === 'sedentary-desk-eyestrain')).toBe(true);

    const runnerCard = createCard({ bp: '120/80', hr: '72' }, [], 'Marathon Runner');
    expect(runnerCard.activeRules().some(r => r.id === 'athlete-tendon-collagen')).toBe(true);
  });
});
