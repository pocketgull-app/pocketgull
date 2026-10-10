import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';

export type PhenolicChemicalClass = 
  | 'Flavonoid' 
  | 'Stilbene' 
  | 'Phenolic Acid' 
  | 'Lignan' 
  | 'Isothiocyanate' 
  | 'Curcuminoid';

export type ClinicalEvidenceTier = 
  | 'Level A (Meta-Analysis / Multi-Center RCT)' 
  | 'Level B (Well-Designed RCT)' 
  | 'Level C (Translational In-Vivo)';

export interface IPhenolicEntry {
  id: string;
  compoundName: string;
  chemicalClass: PhenolicChemicalClass;
  usdaFoodSource: string;
  usdaFoodCategory: string;
  concentrationMgPer100g: number;
  gutBioavailabilityPct: number;
  metabolicClearingHalfLifeHours: number;
  primaryReceptorOrPathway: string;
  targetOrgan: 'Liver' | 'Colon' | 'Brain' | 'Endothelium' | 'Pancreas' | 'Mitochondria';
  synergisticCofactors: string[];
  bioavailabilityMultiplier: number;
  clinicalEvidenceLevel: ClinicalEvidenceTier;
  mechanismSummary: string;
  contraindications: string[];
}

export interface IMealSynergyAnalysis {
  detectedCompounds: IPhenolicEntry[];
  activeSynergies: Array<{
    pair: string;
    multiplier: number;
    clinicalEffect: string;
  }>;
  overallSynergyScore: number; // 0 - 100
  nrf2ActivationPotential: 'Low' | 'Moderate' | 'High' | 'Maximal';
  mitochondrialBiogenesisTier: 'Baseline' | 'Enhanced' | 'Robust';
  frugalFoodPairingTip: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhenolicSynergyKnowledgeService {
  private readonly patientState = inject(PatientStateService);

  private readonly phenolicDatabase = signal<IPhenolicEntry[]>([
    {
      id: 'curcumin-01',
      compoundName: 'Curcumin (Diferuloylmethane)',
      chemicalClass: 'Curcuminoid',
      usdaFoodSource: 'Turmeric Rhizome (Curcuma longa)',
      usdaFoodCategory: 'Spices and Herbs',
      concentrationMgPer100g: 3140,
      gutBioavailabilityPct: 1.0, // notoriously poor free absorption
      metabolicClearingHalfLifeHours: 1.5,
      primaryReceptorOrPathway: 'NF-κB inhibition & Nrf2 antioxidant induction',
      targetOrgan: 'Liver',
      synergisticCofactors: ['Piperine (Black Pepper)', 'Monounsaturated Lipids (Extra Virgin Olive Oil / Ghee)'],
      bioavailabilityMultiplier: 20.0, // 2000% increase with piperine (Shoba et al., 1998)
      clinicalEvidenceLevel: 'Level A (Meta-Analysis / Multi-Center RCT)',
      mechanismSummary: 'Piperine inhibits hepatic and intestinal glucuronidation of curcumin, preserving active unconjugated curcumin in systemic circulation.',
      contraindications: ['Active gallstones / biliary obstruction', 'High-dose anticoagulant therapy (Warfarin)']
    },
    {
      id: 'sulforaphane-02',
      compoundName: 'Sulforaphane (1-isothiocyanato-4-methylsulfinylbutane)',
      chemicalClass: 'Isothiocyanate',
      usdaFoodSource: 'Broccoli Sprouts & Cruciferous Florets (Brassica oleracea)',
      usdaFoodCategory: 'Vegetables and Vegetable Products',
      concentrationMgPer100g: 115,
      gutBioavailabilityPct: 74.0,
      metabolicClearingHalfLifeHours: 2.2,
      primaryReceptorOrPathway: 'Keap1 cysteine alkylation -> Nrf2 Phase II xenobiotic enzyme induction',
      targetOrgan: 'Liver',
      synergisticCofactors: ['Active Myrosinase enzyme (Ground Mustard Seed / Raw Radish)'],
      bioavailabilityMultiplier: 4.5,
      clinicalEvidenceLevel: 'Level A (Meta-Analysis / Multi-Center RCT)',
      mechanismSummary: 'Thermal cooking denatures endogenous myrosinase; adding cold-milled raw mustard seed restores the hydrolytic conversion of glucoraphanin to active sulforaphane.',
      contraindications: ['Severe untreated iodine deficiency (excessive raw goitrogen load)']
    },
    {
      id: 'resveratrol-03',
      compoundName: 'Trans-Resveratrol (3,5,4\'-trihydroxy-trans-stilbene)',
      chemicalClass: 'Stilbene',
      usdaFoodSource: 'Red Grape Skin & Japanese Knotweed (Polygonum cuspidatum)',
      usdaFoodCategory: 'Fruits and Fruit Juices',
      concentrationMgPer100g: 2.8,
      gutBioavailabilityPct: 29.0,
      metabolicClearingHalfLifeHours: 9.2,
      primaryReceptorOrPathway: 'AMPK / SIRT1 activation -> PGC-1α mitochondrial biogenesis',
      targetOrgan: 'Mitochondria',
      synergisticCofactors: ['Quercetin (Red Onions / Capers)', 'Piperine (Black Pepper)'],
      bioavailabilityMultiplier: 3.1,
      clinicalEvidenceLevel: 'Level B (Well-Designed RCT)',
      mechanismSummary: 'Quercetin co-administration competitively inhibits sulfotransferases and glucuronosyltransferases, doubling peak plasma AUC of resveratrol.',
      contraindications: ['Hormone-sensitive breast/uterine cancers (mild phytoestrogenic activity)']
    },
    {
      id: 'quercetin-04',
      compoundName: 'Quercetin-3-O-glucoside',
      chemicalClass: 'Flavonoid',
      usdaFoodSource: 'Red Onion Flesh & Capers (Allium cepa)',
      usdaFoodCategory: 'Vegetables and Vegetable Products',
      concentrationMgPer100g: 45,
      gutBioavailabilityPct: 16.0,
      metabolicClearingHalfLifeHours: 16.8,
      primaryReceptorOrPathway: 'Mast cell stabilization, Zinc ionophore action, & Senolytic clearance',
      targetOrgan: 'Endothelium',
      synergisticCofactors: ['Ascorbic Acid (Vitamin C / Lemon Juice)', 'Bromelain (Pineapple core)'],
      bioavailabilityMultiplier: 2.8,
      clinicalEvidenceLevel: 'Level A (Meta-Analysis / Multi-Center RCT)',
      mechanismSummary: 'Vitamin C regenerates oxidized quercetin radicals back into active reduced flavonoids, preventing auto-oxidation in the gut lumen.',
      contraindications: ['Fluoroquinolone antibiotics (chelates antibiotic in stomach lumen)']
    },
    {
      id: 'egcg-05',
      compoundName: 'Epigallocatechin Gallate (EGCG)',
      chemicalClass: 'Flavonoid',
      usdaFoodSource: 'Matcha & Japanese Green Tea (Camellia sinensis)',
      usdaFoodCategory: 'Beverages',
      concentrationMgPer100g: 7380,
      gutBioavailabilityPct: 4.5,
      metabolicClearingHalfLifeHours: 5.0,
      primaryReceptorOrPathway: 'Catechol-O-methyltransferase (COMT) modulation & AMPK endothelial eNOS stimulation',
      targetOrgan: 'Endothelium',
      synergisticCofactors: ['Citric Acid / Vitamin C (Lemon slice)', 'Piperine'],
      bioavailabilityMultiplier: 3.5,
      clinicalEvidenceLevel: 'Level A (Meta-Analysis / Multi-Center RCT)',
      mechanismSummary: 'Citrus juice lowers intestinal pH to protect EGCG from alkaline autoxidation in the small intestine, increasing recovery up to 5-fold.',
      contraindications: ['Iron-deficiency anemia when consumed concurrently with high-iron meals', 'Fasting megadose toxicity']
    },
    {
      id: 'apigenin-06',
      compoundName: 'Apigenin (4\',5,7-trihydroxyflavone)',
      chemicalClass: 'Flavonoid',
      usdaFoodSource: 'Dried Chamomile & Flat-Leaf Parsley (Matricaria chamomilla)',
      usdaFoodCategory: 'Spices and Herbs',
      concentrationMgPer100g: 450,
      gutBioavailabilityPct: 30.0,
      metabolicClearingHalfLifeHours: 12.0,
      primaryReceptorOrPathway: 'CD38 NADase inhibition -> Cellular NAD+ preservation & GABAA receptor allosteric agonism',
      targetOrgan: 'Brain',
      synergisticCofactors: ['L-Theanine (Green Tea)', 'Magnesium Glycinate'],
      bioavailabilityMultiplier: 2.2,
      clinicalEvidenceLevel: 'Level B (Well-Designed RCT)',
      mechanismSummary: 'Apigenin potently suppresses the aging enzyme CD38, which destroys NAD+, restoring youthful mitochondrial sirtuin activation and deepening Stage 3 slow-wave sleep.',
      contraindications: ['Concurrent sedative/hypnotic benzodiazepine use (potentiates sedation)']
    },
    {
      id: 'anthocyanins-07',
      compoundName: 'Cyanidin-3-Glucoside (Anthocyanin)',
      chemicalClass: 'Flavonoid',
      usdaFoodSource: 'Wild Mountain Blueberries & Hibiscus Sabdariffa',
      usdaFoodCategory: 'Fruits and Fruit Juices',
      concentrationMgPer100g: 480,
      gutBioavailabilityPct: 2.5,
      metabolicClearingHalfLifeHours: 2.0,
      primaryReceptorOrPathway: 'Cerebrovascular blood-brain barrier crossing -> Hippocampal BDNF upregulation',
      targetOrgan: 'Brain',
      synergisticCofactors: ['Dietary Inulin / Resistant Starch (Gut microbiota colonic deglycosylation)'],
      bioavailabilityMultiplier: 3.8,
      clinicalEvidenceLevel: 'Level A (Meta-Analysis / Multi-Center RCT)',
      mechanismSummary: 'Colonic microflora break down parent anthocyanins into phenolic metabolites (protocatechuic acid) capable of crossing the blood-brain barrier.',
      contraindications: ['Severe oxalate nephrolithiasis history when consumed via raw concentrated spinach blends']
    },
    {
      id: 'chlorogenic-08',
      compoundName: '5-Caffeoylquinic Acid (Chlorogenic Acid)',
      chemicalClass: 'Phenolic Acid',
      usdaFoodSource: 'Green Coffee Bean & Unsweetened Hibiscus Calyces',
      usdaFoodCategory: 'Beverages',
      concentrationMgPer100g: 350,
      gutBioavailabilityPct: 33.0,
      metabolicClearingHalfLifeHours: 4.1,
      primaryReceptorOrPathway: 'Intestinal glucose-6-phosphatase inhibition & GLP-1 secretion stimulation',
      targetOrgan: 'Pancreas',
      synergisticCofactors: ['Soluble Beta-Glucan Fiber (Oats / Barley)'],
      bioavailabilityMultiplier: 2.0,
      clinicalEvidenceLevel: 'Level A (Meta-Analysis / Multi-Center RCT)',
      mechanismSummary: 'Delays intestinal sodium-dependent glucose transporter (SGLT1) uptake, blunting postprandial glycemic excursions by 15-25%.',
      contraindications: ['Severe GERD with acid hypersecretion']
    }
  ]);

  readonly allPhenolics = computed(() => this.phenolicDatabase());
  readonly selectedCompound = signal<IPhenolicEntry | null>(this.phenolicDatabase()[0]);

  /**
   * Search database by compound name, food source, or pathway.
   */
  searchPhenolics(query: string): IPhenolicEntry[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.phenolicDatabase();
    return this.phenolicDatabase().filter(p => 
      p.compoundName.toLowerCase().includes(q) ||
      p.usdaFoodSource.toLowerCase().includes(q) ||
      p.chemicalClass.toLowerCase().includes(q) ||
      p.primaryReceptorOrPathway.toLowerCase().includes(q) ||
      p.targetOrgan.toLowerCase().includes(q)
    );
  }

  /**
   * Evaluates a culinary dish or ingredient list for molecular phenolic synergies.
   */
  analyzeMealSynergies(ingredients: string[]): IMealSynergyAnalysis {
    const normalized = ingredients.map(i => i.toLowerCase());
    const matched: IPhenolicEntry[] = [];
    const synergies: Array<{ pair: string; multiplier: number; clinicalEffect: string }> = [];

    let score = 25; // baseline nutritional floor

    for (const entry of this.phenolicDatabase()) {
      const match = normalized.some(ing => 
        entry.usdaFoodSource.toLowerCase().includes(ing) || 
        entry.compoundName.toLowerCase().includes(ing) ||
        ing.includes(entry.compoundName.toLowerCase().split(' ')[0])
      );
      if (match) {
        matched.push(entry);
        score += 15;
      }
    }

    // Check specific synergistic pairs
    const hasTurmeric = normalized.some(i => i.includes('turmeric') || i.includes('curcumin'));
    const hasBlackPepper = normalized.some(i => i.includes('pepper') || i.includes('piperine'));
    if (hasTurmeric && hasBlackPepper) {
      synergies.push({
        pair: 'Curcumin (Turmeric) + Piperine (Black Pepper)',
        multiplier: 20.0,
        clinicalEffect: '2000% systemic bioavailability boost via hepatic glucuronidation inhibition'
      });
      score += 25;
    }

    const hasCruciferous = normalized.some(i => i.includes('broccoli') || i.includes('cabbage') || i.includes('kale'));
    const hasMustardSeed = normalized.some(i => i.includes('mustard') || i.includes('radish') || i.includes('horseradish'));
    if (hasCruciferous && hasMustardSeed) {
      synergies.push({
        pair: 'Broccoli / Cruciferous + Raw Mustard Seed (Myrosinase)',
        multiplier: 4.5,
        clinicalEffect: 'Restores heat-denatured myrosinase to maximize sulforaphane Nrf2 induction'
      });
      score += 20;
    }

    const hasGreenTea = normalized.some(i => i.includes('green tea') || i.includes('matcha') || i.includes('egcg'));
    const hasCitrus = normalized.some(i => i.includes('lemon') || i.includes('citrus') || i.includes('lime') || i.includes('orange'));
    if (hasGreenTea && hasCitrus) {
      synergies.push({
        pair: 'Matcha / EGCG + Lemon / Vitamin C',
        multiplier: 3.5,
        clinicalEffect: 'Acidic lumen stabilization prevents catechins from intestinal autoxidation'
      });
      score += 15;
    }

    const hasResveratrol = normalized.some(i => i.includes('grape') || i.includes('knotweed') || i.includes('resveratrol'));
    const hasQuercetin = normalized.some(i => i.includes('onion') || i.includes('caper') || i.includes('quercetin'));
    if (hasResveratrol && hasQuercetin) {
      synergies.push({
        pair: 'Resveratrol + Quercetin (Red Onion / Capers)',
        multiplier: 3.1,
        clinicalEffect: 'Competitive sulfotransferase inhibition doubles plasma resveratrol AUC for SIRT1/AMPK biogenesis'
      });
      score += 20;
    }

    const finalScore = Math.min(100, score);
    const nrf2Tier = finalScore >= 80 ? 'Maximal' : finalScore >= 60 ? 'High' : finalScore >= 40 ? 'Moderate' : 'Low';
    const mitoTier = finalScore >= 75 ? 'Robust' : finalScore >= 50 ? 'Enhanced' : 'Baseline';

    return {
      detectedCompounds: matched,
      activeSynergies: synergies,
      overallSynergyScore: finalScore,
      nrf2ActivationPotential: nrf2Tier,
      mitochondrialBiogenesisTier: mitoTier,
      frugalFoodPairingTip: synergies.length > 0 
        ? `Active synergy unlocked: ${synergies[0].pair}. Bioavailability multiplied by ${synergies[0].multiplier}x without costly synthetic supplements.`
        : 'Tip: Add a pinch of black pepper to turmeric dishes, or freshly cracked raw mustard seed to steamed broccoli to multiply bio-absorption up to 20x.'
    };
  }

  /**
   * Activates cellular / organ 3D visualization in the anatomical viewport.
   */
  trigger3dNutrigenomicDocking(compoundId: string): void {
    const compound = this.phenolicDatabase().find(p => p.id === compoundId);
    if (!compound) return;

    this.selectedCompound.set(compound);

    if (this.patientState && typeof this.patientState.anatomyViewMode?.set === 'function') {
      this.patientState.anatomyViewMode.set('nutrigenomics');
    }

    // eslint-disable-next-line no-console
    console.log(`[PocketGull 3D Docking] Activated phenolic ligand: ${compound.compoundName} targeting ${compound.targetOrgan} (${compound.primaryReceptorOrPathway}).`);
  }
}
