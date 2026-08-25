import { describe, it, expect } from 'vitest';
import { CommunityPortalStore } from '../src/engine/community-portal-store.js';

describe('Island Community & Ranger Portal Engine', () => {
  it('1. Parses natural language SMS text from islanders into structured reports', () => {
    const store = new CommunityPortalStore();
    
    const report1 = store.parseSmsText('Found 2 blacklegged nymphs on dog at Sanford Farm main trail');
    expect(report1.matchedTrailId).toBe('sanford-farm');
    expect(report1.matchedSpecies).toBe('ixodes_nymph');
    expect(report1.matchedHost).toBe('Canine');
    expect(report1.tickCount).toBe(2);

    const report2 = store.parseSmsText('Dog tick crawling on my sock at Tupancy links');
    expect(report2.matchedTrailId).toBe('tupancy-links');
    expect(report2.matchedSpecies).toBe('dermacentor_dog');
    expect(report2.matchedHost).toBe('Gear');
    expect(report2.tickCount).toBe(1);
  });

  it('2. Records ranger maintenance logs and tracks barberry eradication status', () => {
    const store = new CommunityPortalStore();
    const initialLogsCount = store.getMaintenanceLogs().length;

    store.addMaintenanceLog({
      trailId: 'squam-swamp',
      trailName: 'Squam Swamp Nature Trail',
      stewardGroup: 'NCF (Nantucket Conservation Foundation)',
      date: '2026-08-22',
      actionType: 'Mowed & Widened Trail (6ft+)',
      shoulderWidthFeet: 7,
      barberryPatchesRemoved: 5,
      rangerNotes: 'Boardwalk vegetation cut back 4 feet on both sides.',
      verifiedByRanger: 'Ranger Test'
    });

    expect(store.getMaintenanceLogs().length).toBe(initialLogsCount + 1);

    const hotspots = store.getBarberryHotspots();
    expect(hotspots.length).toBeGreaterThan(0);
    store.updateBarberryStatus(hotspots[0].id, 'Cleared & Restored');
    expect(store.getBarberryHotspots()[0].status).toBe('Cleared & Restored');
  });

  it('3. Increments HIPAA-safe local pharmacy and clinic prophylaxis counters', () => {
    const store = new CommunityPortalStore();
    const beforeDans = store.getPharmacyData().dansPharmacyDoxyDispensedThisWeek;

    store.incrementPharmacyDoxy('dans');
    expect(store.getPharmacyData().dansPharmacyDoxyDispensedThisWeek).toBe(beforeDans + 1);
  });

  it('4. Generates structured CSV export for Nantucket Board of Health', () => {
    const store = new CommunityPortalStore();
    const csv = store.generateTownCouncilCsvExport();
    expect(csv).toContain('Dan\'s Pharmacy');
    expect(csv).toContain('Ranger Maintenance');
    expect(csv).toContain('Barberry Hotspot');
  });
});
