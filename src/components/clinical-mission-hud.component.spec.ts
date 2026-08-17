import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { ClinicalMissionHudComponent } from './clinical-mission-hud.component';
import { PivotPulseAgentService } from '../services/pivot-pulse-agent.service';
import { PartnerEcosystemService } from '../services/partner-ecosystem.service';
import { AvsEngineService } from '../services/avs-engine.service';

describe('ClinicalMissionHudComponent', () => {
  let component: ClinicalMissionHudComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        ClinicalMissionHudComponent,
        PivotPulseAgentService,
        PartnerEcosystemService,
        AvsEngineService
      ]
    });
    component = runInInjectionContext(injector, () => injector.get(ClinicalMissionHudComponent));
  });

  it('1. Renders Peregrine Pivot & Pulse Mission HUD with default missions', () => {
    expect(component).toBeTruthy();
    expect(component.missions().length).toBe(4);
    expect(component.completedMissionsCount()).toBe(1);
  });

  it('2. Computes pulse momentum percentage and toggles mission completion state', () => {
    expect(component.pulseMomentumPct()).toBeGreaterThan(0);
    
    component.toggleMission('m-002');
    expect(component.completedMissionsCount()).toBe(2);
  });
});
