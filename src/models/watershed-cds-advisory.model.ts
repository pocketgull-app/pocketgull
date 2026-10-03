/**
 * Watershed-Aware Clinical Decision Support (CDS) Advisory Model
 * Integrates USGS Drinking Water Hardness, EPA UCMR5 PFAS Occurrence,
 * and NSF OKN Federal Knowledge Graph discovery paths into clinical intelligence.
 */
import { IOknCrossGraphPath } from './okn-knowledge-graph.model';

export interface IWatershedBasin {
  id: string; // HUC-8 Basin Identifier
  name: string;
  state: string;
  hardnessCaCO3: number; // mg/L CaCO3
  pfoaNgL: number; // ng/L (EPA MCL = 4.0 ng/L)
  pfosNgL: number; // ng/L (EPA MCL = 4.0 ng/L)
  genxNgL: number; // ng/L (EPA Health Advisory = 10.0 ng/L)
  microplasticsPerL: number;
  tier: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  remedy: string;
  estCost: string;
}

export type WatershedTriggerType = 'joint_pain' | 'statin_myopathy' | 'both';

export type WaterHardnessCategory =
  | 'Soft (<60 mg/L)'
  | 'Moderate (60-120 mg/L)'
  | 'Hard (120-180 mg/L)'
  | 'Very Hard (>180 mg/L)';

export function categorizeWaterHardness(hardnessCaCO3: number): WaterHardnessCategory {
  if (hardnessCaCO3 < 60) return 'Soft (<60 mg/L)';
  if (hardnessCaCO3 <= 120) return 'Moderate (60-120 mg/L)';
  if (hardnessCaCO3 <= 180) return 'Hard (120-180 mg/L)';
  return 'Very Hard (>180 mg/L)';
}

export const DEFAULT_WATERSHED_BASINS: IWatershedBasin[] = [
  {
    id: '17110019',
    name: 'Puget Sound / Cedar-Sammamish',
    state: 'WA',
    hardnessCaCO3: 34.2,
    pfoaNgL: 2.1,
    pfosNgL: 1.8,
    genxNgL: 0.4,
    microplasticsPerL: 14.5,
    tier: 'LOW',
    remedy: 'NSF-53 Solid Carbon Block Gravity Pitcher',
    estCost: '$25'
  },
  {
    id: '07010206',
    name: 'Upper Mississippi / Twin Cities',
    state: 'MN',
    hardnessCaCO3: 268.0,
    pfoaNgL: 14.8,
    pfosNgL: 18.2,
    genxNgL: 3.1,
    microplasticsPerL: 48.0,
    tier: 'HIGH',
    remedy: 'Multi-Stage Reverse Osmosis with Remineralization',
    estCost: '$180'
  },
  {
    id: '02040205',
    name: 'Delaware River Basin / Philadelphia',
    state: 'PA-NJ',
    hardnessCaCO3: 142.0,
    pfoaNgL: 16.4,
    pfosNgL: 19.8,
    genxNgL: 4.5,
    microplasticsPerL: 58.4,
    tier: 'HIGH',
    remedy: 'Point-of-Use Under-Sink Carbon Block + RO',
    estCost: '$160'
  },
  {
    id: '02050101',
    name: 'Upper Susquehanna River',
    state: 'NY-PA',
    hardnessCaCO3: 128.5,
    pfoaNgL: 8.6,
    pfosNgL: 9.2,
    genxNgL: 1.9,
    microplasticsPerL: 36.2,
    tier: 'MODERATE',
    remedy: 'NSF-53 / NSF-58 Dual Carbon Filter',
    estCost: '$85'
  },
  {
    id: '14010001',
    name: 'Colorado River Headwaters',
    state: 'CO',
    hardnessCaCO3: 165.0,
    pfoaNgL: 1.8,
    pfosNgL: 1.4,
    genxNgL: 0.2,
    microplasticsPerL: 8.5,
    tier: 'LOW',
    remedy: 'Basic Sediment + Coconut Carbon Filter',
    estCost: '$20'
  },
  {
    id: '05140201',
    name: 'Ohio River / Louisville Reach',
    state: 'KY-IN',
    hardnessCaCO3: 172.0,
    pfoaNgL: 22.5,
    pfosNgL: 28.4,
    genxNgL: 8.7,
    microplasticsPerL: 74.0,
    tier: 'SEVERE',
    remedy: 'Certified PFAS POU Reverse Osmosis + Remineralization',
    estCost: '$195'
  },
  {
    id: '03050106',
    name: 'Cape Fear River Basin / Wilmington',
    state: 'NC',
    hardnessCaCO3: 42.0,
    pfoaNgL: 28.0,
    pfosNgL: 34.5,
    genxNgL: 145.0,
    microplasticsPerL: 52.0,
    tier: 'SEVERE',
    remedy: 'High-Rejection Reverse Osmosis + Granular Activated Carbon',
    estCost: '$220'
  }
];

export interface IAntonovskyRemedy {
  remedy: string;
  estimatedCost: string;
  manageabilityRationale: string;
  ftcAffiliateDisclosure: string;
}

export interface IWatershedCdsAdvisory {
  trigger: WatershedTriggerType;
  triggerSummary: string;
  basin: IWatershedBasin;
  hardnessCategory: WaterHardnessCategory;
  totalPfasPpb: number;
  epaMclExceedance: boolean; // PFOA > 4.0 ng/L or PFOS > 4.0 ng/L
  oknTraversedPaths: IOknCrossGraphPath[];
  clinicalMechanism: string;
  antonovskyRemedy: IAntonovskyRemedy;
  directiveContext: string;
  generatedAt: string;
}
