import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { GeolocationalHealthRelocationComponent } from './geolocational-health-relocation.component';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { ProduceRxNutritionReferralService } from '../services/produce-rx-nutrition-referral.service';
import { SeasonalHarvestStockingCalendarService } from '../services/seasonal-harvest-stocking-calendar.service';
import { OfflinePwaFoodshedCompanionService } from '../services/offline-pwa-foodshed-companion.service';
import { FoodInflationStockoutResilienceService } from '../services/food-inflation-stockout-resilience.service';

describe('GeolocationalHealthRelocationComponent Unit Suite', () => {
  let component: GeolocationalHealthRelocationComponent;

  beforeEach(async () => {
    const mockPatient = {
      id: 'p_frida_kahlo',
      name: 'Frida Kahlo',
      preexistingConditions: ['Spinal Trauma', 'Neuropathic Pain'],
      allergies: ['Sulfites']
    };

    const mockPatientManager = {
      selectedPatient: signal(mockPatient),
      selectedPatientId: signal('p_frida_kahlo')
    };

    const mockProduceRx = {
      issueProduceRxReferral: vi.fn().mockReturnValue({ id: 'ref-001', status: 'active' })
    };

    const mockSeasonal = {
      getSeasonalCalendar: vi.fn().mockReturnValue({
        regionId: 'dest_ojai',
        regionName: 'Ojai',
        currentMonth: 10,
        currentMonthName: 'October',
        harvestItems: [],
        seasonalAdvice: 'Autumn harvest in Ojai valley.'
      })
    };

    const mockOffline = {
      scanIngredientText: vi.fn().mockReturnValue({
        rawText: 'Ingredients: Organic Wild Blueberries',
        isSafeForPatient: true,
        flaggedAllergens: [],
        flaggedHarmfulAdditives: [],
        beneficialPhytonutrients: ['Anthocyanins'],
        ismpSafetyDirectives: [],
        offlineIntegrityHash: 'mock-hash-123'
      })
    };

    const mockInflation = {
      auditBasketForInflation: vi.fn().mockReturnValue({
        basketCategory: 'Anti-Inflammatory Staples',
        estimatedWeeklyInflationImpactUsd: 4.5,
        frugalSwaps: []
      })
    };

    await TestBed.configureTestingModule({
      imports: [GeolocationalHealthRelocationComponent],
      providers: [
        { provide: PatientStateService, useValue: { patientId: signal('p_frida_kahlo') } },
        { provide: PatientManagementService, useValue: mockPatientManager },
        { provide: ProduceRxNutritionReferralService, useValue: mockProduceRx },
        { provide: SeasonalHarvestStockingCalendarService, useValue: mockSeasonal },
        { provide: OfflinePwaFoodshedCompanionService, useValue: mockOffline },
        { provide: FoodInflationStockoutResilienceService, useValue: mockInflation }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(GeolocationalHealthRelocationComponent);
    component = fixture.componentInstance;
  });

  it('1. Instantiates successfully with default tab as destinations', () => {
    expect(component).toBeTruthy();
    expect(component.selectedTab()).toBe('destinations');
    expect(component.activePatientName()).toBe('Frida Kahlo');
  });

  it('2. Computes tailored recommended climate type for Frida Kahlo', () => {
    expect(component.recommendedClimateType()).toContain('Dry Thermal Heat');
  });

  it('3. Matches geolocational destinations based on active patient', () => {
    const destinations = component.matchedDestinations();
    expect(destinations.length).toBeGreaterThan(0);
    expect(destinations[0].cityName).toBe('Desert Hot Springs');
    expect(destinations[0].matchScore).toBeGreaterThanOrEqual(90);
  });

  it('4. Switches navigation tabs cleanly', () => {
    component.selectedTab.set('calendar');
    expect(component.selectedTab()).toBe('calendar');

    component.selectedTab.set('scanner');
    expect(component.selectedTab()).toBe('scanner');
  });

  it('5. Computes active seasonal calendar from service', () => {
    const cal = component.activeSeasonalCalendar();
    expect(cal).toBeDefined();
    expect(cal.regionName).toBe('Ojai');
  });

  it('6. Evaluates ingredient scanner against patient allergies', () => {
    const result = component.activeScanResult();
    expect(result).toBeDefined();
    expect(result.isSafeForPatient).toBe(true);
  });
});
