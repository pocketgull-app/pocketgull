import '@angular/compiler';
import { runInInjectionContext, createEnvironmentInjector, EnvironmentInjector, signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { LifeCourseScreeningNavigatorComponent, LIFE_COURSE_HORIZONS, TRADITIONS_METADATA } from './life-course-screening-navigator.component';
import { PatientStateService } from '../services/patient-state.service';

describe('LifeCourseScreeningNavigatorComponent', () => {
  let component: LifeCourseScreeningNavigatorComponent;
  let injector: EnvironmentInjector;
  let mockPatientAgeSignal: ReturnType<typeof signal<number>>;

  beforeEach(() => {
    mockPatientAgeSignal = signal<number>(38);

    injector = createEnvironmentInjector([
      {
        provide: PatientStateService,
        useValue: {
          patientAge: mockPatientAgeSignal
        }
      }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new LifeCourseScreeningNavigatorComponent();
    });
  });

  it('should instantiate successfully with 6 distinct life-course horizons and 8 traditions metadata', () => {
    expect(component).toBeTruthy();
    expect(component.horizons.length).toBe(6);
    expect(LIFE_COURSE_HORIZONS.length).toBe(6);
    expect(TRADITIONS_METADATA.length).toBe(8);
    expect(component.horizons.map(h => h.id)).toEqual([
      'horizon-1',
      'horizon-2',
      'horizon-3',
      'horizon-4',
      'horizon-5',
      'horizon-6'
    ]);
  });

  it('should map age 38 to Horizon II (Age 30–35) by default', () => {
    expect(component.patientAge()).toBe(38);
    expect(component.autoRecommendedHorizonId()).toBe('horizon-2');
    expect(component.selectedHorizonId()).toBe('horizon-2');
    expect(component.activeHorizon().decade).toBe('Age 30–35');
    expect(component.activeHorizon().title).toContain('Metabolic Hearth');
  });

  it('should correctly determine recommended horizon across all life-course decades', () => {
    // Horizon I: Age <= 29
    mockPatientAgeSignal.set(24);
    expect(component.autoRecommendedHorizonId()).toBe('horizon-1');

    // Horizon II: Age 30-39
    mockPatientAgeSignal.set(33);
    expect(component.autoRecommendedHorizonId()).toBe('horizon-2');

    // Horizon III: Age 40-44
    mockPatientAgeSignal.set(41);
    expect(component.autoRecommendedHorizonId()).toBe('horizon-3');

    // Horizon IV: Age 45-59
    mockPatientAgeSignal.set(48);
    expect(component.autoRecommendedHorizonId()).toBe('horizon-4');

    // Horizon V: Age 60-74
    mockPatientAgeSignal.set(65);
    expect(component.autoRecommendedHorizonId()).toBe('horizon-5');

    // Horizon VI: Age 75+
    mockPatientAgeSignal.set(80);
    expect(component.autoRecommendedHorizonId()).toBe('horizon-6');
  });

  it('should allow manual horizon selection', () => {
    component.selectHorizon('horizon-3');
    expect(component.selectedHorizonId()).toBe('horizon-3');
    expect(component.activeHorizon().decade).toBe('Age 40');
    expect(component.activeHorizon().title).toContain('The 40-Year Vascular Window');
    expect(component.activeHorizon().quilledArtUrl).toBe('/assets/art/coronary-retinal-quilling-art.jpg');
  });

  it('should toggle between navigation views including grand-traditions', () => {
    expect(component.activeView()).toBe('all');

    component.activeView.set('screenings');
    expect(component.activeView()).toBe('screenings');

    component.activeView.set('grand-traditions');
    expect(component.activeView()).toBe('grand-traditions');

    component.activeView.set('scanxiety-pricing');
    expect(component.activeView()).toBe('scanxiety-pricing');
  });

  it('should filter traditions by category (licensed, ancient, systems, all)', () => {
    expect(component.traditionFilter()).toBe('all');
    expect(component.shouldShowTradition('allopathic')).toBe(true);
    expect(component.shouldShowTradition('unani')).toBe(true);

    component.traditionFilter.set('licensed');
    expect(component.shouldShowTradition('allopathic')).toBe(true);
    expect(component.shouldShowTradition('osteopathic')).toBe(true);
    expect(component.shouldShowTradition('naturopathic')).toBe(true);
    expect(component.shouldShowTradition('tcm')).toBe(false);
    expect(component.shouldShowTradition('unani')).toBe(false);

    component.traditionFilter.set('ancient');
    expect(component.shouldShowTradition('tcm')).toBe(true);
    expect(component.shouldShowTradition('ayurvedic')).toBe(true);
    expect(component.shouldShowTradition('unani')).toBe(true);
    expect(component.shouldShowTradition('allopathic')).toBe(false);

    component.traditionFilter.set('systems');
    expect(component.shouldShowTradition('functional')).toBe(true);
    expect(component.shouldShowTradition('chronobiology')).toBe(true);
    expect(component.shouldShowTradition('allopathic')).toBe(false);
  });

  it('should contain robust data for all 8 Grand Traditions across all 6 horizons', () => {
    for (const horizon of component.horizons) {
      const gt = horizon.grandTraditions;

      // 1. Allopathic (MD)
      expect(gt.allopathic.title).toBeTruthy();
      expect(gt.allopathic.keyMetrics.length).toBeGreaterThan(0);

      // 2. Osteopathic (DO)
      expect(gt.osteopathic.title).toBeTruthy();
      expect(gt.osteopathic.somaticFocus).toBeTruthy();
      expect(gt.osteopathic.biomechanicalMechanism).toBeTruthy();
      expect(gt.osteopathic.omtSelfCare).toBeTruthy();

      // 3. Naturopathic (ND)
      expect(gt.naturopathic.title).toBeTruthy();
      expect(gt.naturopathic.botanicalPhytotherapy).toBeTruthy();

      // 4. Functional Systems
      expect(gt.functional.title).toBeTruthy();
      expect(gt.functional.keyBiomarkers.length).toBeGreaterThan(0);

      // 5. TCM
      expect(gt.tcm.organMeridian).toBeTruthy();
      expect(gt.tcm.pathology).toBeTruthy();

      // 6. Ayurvedic
      expect(gt.ayurvedic.doshaEpoch).toBeTruthy();
      expect(gt.ayurvedic.dhatuFocus).toBeTruthy();

      // 7. Unani-Tibb
      expect(gt.unani.humoralFocus).toBeTruthy();
      expect(gt.unani.mizajMechanism).toBeTruthy();

      // 8. Chronobiology & Exposome
      expect(gt.chronobiology.circadianFocus).toBeTruthy();
      expect(gt.chronobiology.zeitgeberAction).toBeTruthy();
    }
  });

  it('should contain quilled art assets and bias guards for all horizons', () => {
    for (const horizon of component.horizons) {
      expect(horizon.quilledArtUrl).toMatch(/\/assets\/art\/.*\.jpg/);
      expect(horizon.scanxiety.goldenRule).toBeTruthy();
      expect(horizon.scanxiety.naturalFrequencyStatistic).toContain('1,000');
      expect(horizon.pricing.genericPharmacyBenchmark).toBeTruthy();
      expect(horizon.physicianQuestions.length).toBe(3);
    }
  });

  it('should toggle and manage the 1-Page Multi-Disciplinary Visit Prep Sheet modal', () => {
    expect(component.showPrepSheetModal()).toBe(false);

    component.togglePrepSheetModal(true);
    expect(component.showPrepSheetModal()).toBe(true);

    component.togglePrepSheetModal(false);
    expect(component.showPrepSheetModal()).toBe(false);
    expect(component.copiedText()).toBe(false);
  });
});
