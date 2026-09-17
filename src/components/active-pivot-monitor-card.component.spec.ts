import '@angular/compiler';
import { runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { ActivePivotMonitorCardComponent } from './active-pivot-monitor-card.component';
import { ActivePivotMonitorService } from '../services/active-pivot-monitor.service';
import { ClinicalSpecialtyRiskSuiteService } from '../services/clinical-specialty-risk-suite.service';
import { PatientStateService } from '../services/patient-state.service';

describe('ActivePivotMonitorCardComponent', () => {
  let component: ActivePivotMonitorCardComponent;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = createEnvironmentInjector([
      ActivePivotMonitorCardComponent,
      ActivePivotMonitorService,
      ClinicalSpecialtyRiskSuiteService,
      PatientStateService
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new ActivePivotMonitorCardComponent();
    });
  });

  it('1. Instantiates properly with default active triggers', () => {
    expect(component).toBeTruthy();
    expect(component.monitor.activeTriggers().length).toBe(4);
    expect(component.monitor.pendingTriggersCount()).toBe(4);
  });

  it('2. Computes and displays Tri-Pulse Fusion metrics', () => {
    const fusion = component.monitor.triPulseSummary();
    expect(fusion.westernHrv.hrBpm).toBeGreaterThan(0);
    expect(fusion.tcmSphygmology.predominantQuality).toBeDefined();
    expect(fusion.ayurvedicNadi.dominantDosha).toBeDefined();
    expect(fusion.fusedVitalityIndex).toBeGreaterThan(0);
  });

  it('3. Executes 1-click order with FDA 21 CFR Part 11 digital attestation', () => {
    component.executeOrder('trig_ms_uhthoff_thermal');
    const trig = component.monitor.activeTriggers().find(t => t.id === 'trig_ms_uhthoff_thermal');
    expect(trig?.isExecuted).toBe(true);
    expect(trig?.attestationSeal).toContain('sha256-fda-part11-');
    expect(component.monitor.executionReceipts().length).toBe(1);
  });

  it('4. Runs What-If simulation and populates counterfactual results', async () => {
    await component.runSimulation();
    const res = component.simulationResult();
    expect(res).not.toBeNull();
    expect(res?.isNetPositive).toBe(true);
    expect(res?.after.deliriumRiskPct).toBeLessThan(res?.before.deliriumRiskPct!);
    expect(res?.benefitSummary).toContain('Delirium/Fall risk reduced');
  });
});
