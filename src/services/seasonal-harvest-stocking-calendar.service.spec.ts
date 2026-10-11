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

  it('should accurately provide Sahelian agroecological crops (Fonio, Moringa, Cowpeas, Baobab)', () => {
    const sahelCal = service.getSeasonalCalendar('dest_sahel_dakar', 9); // September
    expect(sahelCal.regionName).toContain('Sahel');
    expect(sahelCal.harvestItems.length).toBe(4);

    const fonio = sahelCal.harvestItems.find(i => i.id === 'sahel_fonio');
    expect(fonio).toBeDefined();
    expect(fonio?.isCurrentlyInPeak).toBe(true);
    expect(fonio?.phytonutrientHighlight).toContain('Low glycemic index');

    const moringa = sahelCal.harvestItems.find(i => i.id === 'sahel_moringa');
    expect(moringa?.isCurrentlyInPeak).toBe(true); // year-round
    expect(moringa?.phytonutrientHighlight).toContain('vitamin C');

    const baobab = sahelCal.harvestItems.find(i => i.id === 'sahel_baobab');
    expect(baobab?.phytonutrientHighlight).toContain('prebiotic pectin');
  });

  it('should accurately provide Ethiopian Highlands orphan crops (Teff, Sorghum)', () => {
    const ethiopiaCal = service.getSeasonalCalendar('dest_ethiopia_highlands', 11); // November
    expect(ethiopiaCal.regionName).toContain('Ethiopian Highlands');
    const teff = ethiopiaCal.harvestItems.find(i => i.id === 'ethiopia_teff');
    expect(teff).toBeDefined();
    expect(teff?.isCurrentlyInPeak).toBe(true);
    expect(teff?.clinicalTargetBenefit).toContain('microcytic anemia');
  });
});
