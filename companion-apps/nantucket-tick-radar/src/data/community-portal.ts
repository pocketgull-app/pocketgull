export interface IRangerMaintenanceLog {
  id: string;
  trailId: string;
  trailName: string;
  stewardGroup: 'NCF (Nantucket Conservation Foundation)' | 'Nantucket Land Bank' | 'Linda Loring Nature Foundation' | 'Private Landscaper' | 'Town DPW';
  date: string;
  actionType: 'Mowed & Widened Trail (6ft+)' | 'Japanese Barberry Eradication' | 'Brush Clearing' | 'Trailhead Signage & QR Refresh';
  shoulderWidthFeet: number;
  barberryPatchesRemoved: number;
  rangerNotes: string;
  verifiedByRanger: string;
}

export interface IBarberryHotspot {
  id: string;
  locationName: string;
  lat: number;
  lng: number;
  clusterSizeSqFt: number;
  status: 'Flagged for Removal' | 'Volunteer Crew Assigned' | 'Cleared & Restored';
  flaggedBy: string;
  dateFlagged: string;
}

export interface IPharmacyTickerData {
  dansPharmacyDoxyDispensedThisWeek: number;
  nantucketPharmacyDoxyDispensedThisWeek: number;
  nchWalkInTriageCasesThisWeek: number;
  lastUpdatedDate: string;
}

export const INITIAL_MAINTENANCE_LOGS: IRangerMaintenanceLog[] = [
  {
    id: 'maint-001',
    trailId: 'sanford-farm',
    trailName: 'Sanford Farm & Ram Pasture',
    stewardGroup: 'NCF (Nantucket Conservation Foundation)',
    date: '2026-08-22',
    actionType: 'Mowed & Widened Trail (6ft+)',
    shoulderWidthFeet: 8,
    barberryPatchesRemoved: 0,
    rangerNotes: 'Full Barn to Ocean loop mowed with 8ft wide center path. Minimal brush overhang.',
    verifiedByRanger: 'Ranger M. Gardner (Badge #14)'
  },
  {
    id: 'maint-002',
    trailId: 'squam-swamp',
    trailName: 'Squam Swamp Nature Trail',
    stewardGroup: 'NCF (Nantucket Conservation Foundation)',
    date: '2026-08-20',
    actionType: 'Japanese Barberry Eradication',
    shoulderWidthFeet: 4,
    barberryPatchesRemoved: 14,
    rangerNotes: 'Removed 14 invasive Japanese barberry root clusters near vernal pool boardwalk.',
    verifiedByRanger: 'Ranger E. Coffin (Badge #08)'
  },
  {
    id: 'maint-003',
    trailId: 'tupancy-links',
    trailName: 'Tupancy Links Cliff Walk',
    stewardGroup: 'Nantucket Land Bank',
    date: '2026-08-21',
    actionType: 'Mowed & Widened Trail (6ft+)',
    shoulderWidthFeet: 12,
    barberryPatchesRemoved: 2,
    rangerNotes: 'Wide grassland mowing completed. Ocean breeze providing high desiccation.',
    verifiedByRanger: 'Steward T. Folger'
  }
];

export const INITIAL_BARBERRY_HOTSPOTS: IBarberryHotspot[] = [
  {
    id: 'barb-001',
    locationName: 'Squam Swamp Eastern Edge',
    lat: 41.3140,
    lng: -69.9970,
    clusterSizeSqFt: 240,
    status: 'Volunteer Crew Assigned',
    flaggedBy: 'ACK Moorlands Crew',
    dateFlagged: '2026-08-19'
  },
  {
    id: 'barb-002',
    locationName: 'Middle Moors Altar Rock Spur',
    lat: 41.2760,
    lng: -70.0390,
    clusterSizeSqFt: 180,
    status: 'Flagged for Removal',
    flaggedBy: 'Island Landscaper S. Macy',
    dateFlagged: '2026-08-21'
  },
  {
    id: 'barb-003',
    locationName: 'Sanford Farm North Gate',
    lat: 41.2680,
    lng: -70.1570,
    clusterSizeSqFt: 90,
    status: 'Cleared & Restored',
    flaggedBy: 'NCF Volunteer Day',
    dateFlagged: '2026-08-15'
  }
];

export const INITIAL_PHARMACY_DATA: IPharmacyTickerData = {
  dansPharmacyDoxyDispensedThisWeek: 9,
  nantucketPharmacyDoxyDispensedThisWeek: 6,
  nchWalkInTriageCasesThisWeek: 11,
  lastUpdatedDate: '2026-08-22'
};
