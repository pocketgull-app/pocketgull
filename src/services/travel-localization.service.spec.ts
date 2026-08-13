import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { TravelLocalizationService } from './travel-localization.service';

describe('TravelLocalizationService (Travel Jetlag Realignment & Wellness Budget Stacking)', () => {
  let service: TravelLocalizationService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [TravelLocalizationService]
    });
    service = runInInjectionContext(injector, () => injector.get(TravelLocalizationService));
  });

  it('1. Initializes default travel state and wellness budget catalog', () => {
    const catalog = service.catalog();
    expect(catalog.length).toBe(4);
    expect(service.monthlyBudgetCapUsd()).toBe(50);
    expect(service.affordableItems().length).toBe(4);
  });

  it('2. Filters affordable wellness items based on custom budget cap', () => {
    service.setBudgetCap(20);
    expect(service.affordableItems().length).toBe(3); // $0, $0, $15
    expect(service.totalSelectedCost()).toBe(15);
  });

  it('3. Updates travel destination timezone for circadian jetlag realignment', () => {
    service.setTravelDestination('Asia/Tokyo', 17);
    expect(service.currentTravelState().destinationTimezone).toBe('Asia/Tokyo');
    expect(service.currentTravelState().timezoneOffsetHours).toBe(17);
  });
});
