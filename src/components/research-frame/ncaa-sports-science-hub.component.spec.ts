import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { NcaaSportsScienceHubComponent } from './ncaa-sports-science-hub.component';
import { NcaaSportsScienceService } from '../../services/ncaa-sports-science.service';

describe('NcaaSportsScienceHubComponent Suite', () => {
  let component: NcaaSportsScienceHubComponent;
  let sportsScienceService: NcaaSportsScienceService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        NcaaSportsScienceService
      ]
    });
    sportsScienceService = injector.get(NcaaSportsScienceService);
    component = runInInjectionContext(injector, () => new NcaaSportsScienceHubComponent());
  });

  it('1. Initializes with D1 / R1 / Big Ten Network default silo', () => {
    expect(component.service.selectedDivision()).toBe('D1');
    expect(component.service.selectedResearchTier()).toBe('R1');
    expect(component.service.selectedNetwork()).toBe('Big Ten Network (BTN)');
    expect(component.siloEnv().dataSiloBoundaryHash).toContain('SILO-');
  });

  it('2. Navigates between specialized sports science tabs', () => {
    expect(component.activeTab()).toBe('concussion');
    component.activeTab.set('supplements');
    expect(component.activeTab()).toBe('supplements');

    component.activeTab.set('workload');
    expect(component.activeTab()).toBe('workload');
  });

  it('3. Dynamically screens supplements and updates reactive result', () => {
    component.searchQuery = 'caffeine_high';
    component.onSearchSupplement();
    expect(component.screenResult()?.isBannedByNcaa).toBe(true);
    expect(component.screenResult()?.category).toBe('Stimulants');

    component.searchQuery = 'tart cherry extract';
    component.onSearchSupplement();
    expect(component.screenResult()?.isBannedByNcaa).toBe(false);
    expect(component.screenResult()?.nsfCertifiedForSport).toBe(true);
  });

  it('4. Updates workload and travel plans when switching route orientations', () => {
    component.originTz.set('PST');
    component.destTz.set('EST');
    const plan = component.travelPlan();
    expect(plan.timeShiftHours).toBe(3);
    expect(plan.optimalTrainingWindow).toContain('EST');
  });

  it('5. Maintains silo separation when switching to D3 / R3 scholar athlete tier', () => {
    const d1Hash = component.siloEnv().dataSiloBoundaryHash;
    component.service.setDivision('D3');
    component.service.setResearchTier('R3');
    const d3Hash = component.siloEnv().dataSiloBoundaryHash;

    expect(d1Hash).not.toBe(d3Hash);
    expect(component.workload().weeklyTravelHours).toBe(2);
    expect(component.workload().recoveryGuideline).toContain('D3 Scholar-Athlete');
  });
});
