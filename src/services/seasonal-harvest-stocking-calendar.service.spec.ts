import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SeasonalHarvestStockingCalendarService } from './seasonal-harvest-stocking-calendar.service';

describe('SeasonalHarvestStockingCalendarService', () => {
  let service: SeasonalHarvestStockingCalendarService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SeasonalHarvestStockingCalendarService]
    });
    service = TestBed.inject(SeasonalHarvestStockingCalendarService);
  });

  it('should initialize successfully', () => {
    expect(service).toBeDefined();
  });

  it('should identify spring peak harvest items in Ojai Valley (Month 4 / April)', () => {
    const calendar = service.getSeasonalCalendar('dest_ojai', 4);
    expect(calendar.regionName).toContain('Ojai');
    expect(calendar.currentMonthName).toBe('April');
    
    const pixie = calendar.harvestItems.find(i => i.id === 'ojai_pixie');
    expect(pixie).toBeDefined();
    expect(pixie?.isCurrentlyInPeak).toBe(true);
    expect(pixie?.estimatedRetailPriceIndex).toBe('Low / Peak Abundance');
    expect(pixie?.clinicalTargetBenefit).toContain('Vascular');
  });

  it('should correctly flag off-season crops (Month 7 in Ojai for olives)', () => {
    const calendar = service.getSeasonalCalendar('dest_ojai', 7);
    const olive = calendar.harvestItems.find(i => i.id === 'ojai_mission_olive');
    expect(olive).toBeDefined();
    expect(olive?.isCurrentlyInPeak).toBe(false);
    expect(olive?.estimatedRetailPriceIndex).toBe('Moderate');
  });

  it('should identify Maine fiddlehead ferns as peak in May (Month 5)', () => {
    const calendar = service.getSeasonalCalendar('dest_lewiston', 5);
    const fiddlehead = calendar.harvestItems.find(i => i.id === 'lew_fiddlehead');
    expect(fiddlehead).toBeDefined();
    expect(fiddlehead?.isCurrentlyInPeak).toBe(true);
    expect(fiddlehead?.phytonutrientHighlight).toContain('Omega-3 ALA');
  });
});
