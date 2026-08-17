import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { ComponentDrilldownUnitComponent } from './component-drilldown-unit.component';
import { PatientStateService } from '../services/patient-state.service';
import { ThemeService } from '../services/theme.service';
import { ActuarialLongevityService } from '../services/actuarial-longevity.service';
import { StorageService } from '../services/storage.service';
import { GamificationService } from '../services/gamification.service';

describe('ComponentDrilldownUnitComponent', () => {
  let component: ComponentDrilldownUnitComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: ChangeDetectionScheduler, useValue: { schedule: () => {}, notify: () => {} } },
        { provide: PLATFORM_ID, useValue: 'server' },
        ThemeService,
        StorageService,
        GamificationService,
        ActuarialLongevityService,
        PatientStateService,
        ComponentDrilldownUnitComponent
      ]
    });
    component = runInInjectionContext(injector, () => injector.get(ComponentDrilldownUnitComponent));
  });

  it('1. Starts closed with null targetComponent', () => {
    expect(component.targetComponent()).toBeNull();
  });

  it('2. Opens drilldown target and supports Tri-Lens toggle', () => {
    component.open('biomarkers');
    expect(component.targetComponent()).toBe('biomarkers');
    expect(component.title()).toContain('Biomarker');

    component.activeLens.set('biophysics');
    expect(component.lensDescription()).toContain('Biophysics');

    component.close();
    expect(component.targetComponent()).toBeNull();
  });

  it('3. Supports opening new Kaggle and Network targets', () => {
    component.open('kaggle');
    expect(component.title()).toContain('Kaggle');

    component.open('network');
    expect(component.title()).toContain('Clinician Peer');
  });
});
