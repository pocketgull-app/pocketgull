import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';

export interface IScfaProfile {
  butyrateMmolPerLiter: number; // Optimal: 15 - 30 mmol/L
  propionateMmolPerLiter: number; // Optimal: 15 - 25 mmol/L
  acetateMmolPerLiter: number; // Optimal: 40 - 70 mmol/L
  zonulinGutPermeabilityTier: 'Sealed & Intact' | 'Mild Permeability' | 'Leaky Gut Barrier Breach';
  tregImmuneToleranceScore: number; // 0 - 100
  clinicalSummary: string;
}

export interface IFermentationRecipe {
  id: string;
  title: string;
  microbialCulture: string;
  fermentationDurationDays: number;
  targetPhSafetyThreshold: number; // must be < 4.6 for C. botulinum safety
  prebioticSubstrate: string;
  scfaYieldRating: 'High Butyrate' | 'Balanced Trio' | 'High Acetate';
  oralSystemicBonus: string;
  ingredients: string[];
  protocolSteps: string[];
}

export interface IOralSystemicNitrateStatus {
  dailyNitrateMg: number; // Target: 250 - 500 mg
  veillonellaActivityScore: number; // 0 - 100 oral commensal reduction capacity
  predictedBloodPressureReductionMmHg: number;
  gingipainInhibitionStatus: 'Unprotected' | 'Shielded via Polyphenols';
  dietaryRecommendation: string;
}

@Injectable({
  providedIn: 'root'
})
export class MicrobiomeFermentationVaultService {
  private readonly patientState = inject(PatientStateService);

  readonly dailyPrebioticFiberGrams = signal<number>(24);
  readonly oralNitrateIntakeMg = signal<number>(310);
  readonly currentBatchPh = signal<number>(3.9);

  readonly scfaProfile = computed<IScfaProfile>(() => {
    const fiber = this.dailyPrebioticFiberGrams();
    // Butyrate production scales with fermentable prebiotic fibers (resistant starch, inulin, pectin)
    const butyrate = Math.round((8 + (fiber * 0.65)) * 10) / 10;
    const propionate = Math.round((7 + (fiber * 0.55)) * 10) / 10;
    const acetate = Math.round((25 + (fiber * 1.2)) * 10) / 10;

    let zonulinTier: IScfaProfile['zonulinGutPermeabilityTier'] = 'Sealed & Intact';
    let summary = 'Intact epithelial tight junction barrier. Butyrate HDAC inhibition robust.';

    if (butyrate < 12) {
      zonulinTier = 'Leaky Gut Barrier Breach';
      summary = 'Low luminal butyrate. Colonocyte energy deficit and elevated serum zonulin detected. Increase resistant starches and cold fermented kraut.';
    } else if (butyrate < 18) {
      zonulinTier = 'Mild Permeability';
      summary = 'Sub-optimal butyrate levels. Mild mucosal inflammation risk under high-stress conditions.';
    }

    const tregScore = Math.min(100, Math.round((butyrate / 25.0) * 85));

    return {
      butyrateMmolPerLiter: butyrate,
      propionateMmolPerLiter: propionate,
      acetateMmolPerLiter: acetate,
      zonulinGutPermeabilityTier: zonulinTier,
      tregImmuneToleranceScore: tregScore,
      clinicalSummary: summary
    };
  });

  readonly oralNitrateStatus = computed<IOralSystemicNitrateStatus>(() => {
    const nitrate = this.oralNitrateIntakeMg();
    const veillonellaScore = Math.min(100, Math.round((nitrate / 400.0) * 100));
    const bpReduction = Math.round((nitrate / 70.0) * 1.1 * 10) / 10;

    return {
      dailyNitrateMg: nitrate,
      veillonellaActivityScore: veillonellaScore,
      predictedBloodPressureReductionMmHg: Math.min(8.5, bpReduction),
      gingipainInhibitionStatus: 'Shielded via Polyphenols',
      dietaryRecommendation: 'Oral commensal bacteria (Veillonella, Actinomyces) successfully convert dietary nitrate from arugula/beets to nitrite -> stomach gastric acid forms Nitric Oxide (NO), dilating systemic vasculature.'
    };
  });

  readonly fermentationRecipes = signal<IFermentationRecipe[]>([
    {
      id: 'ferm-kraut-01',
      title: 'Wild Cabbage & Juniper Kraut with Cold Myrosinase',
      microbialCulture: 'Wild Leuconostoc mesenteroides -> Lactobacillus plantarum',
      fermentationDurationDays: 14,
      targetPhSafetyThreshold: 3.8, // safe < 4.6
      prebioticSubstrate: 'Cruciferous Glucosinolates & Soluble Pectin',
      scfaYieldRating: 'High Butyrate',
      oralSystemicBonus: 'Lactic acid flora suppress oral Streptococcus mutans adherence',
      ingredients: [
        '1 medium head organic green cabbage (thinly shredded)',
        '1.5 tbsp unrefined sea salt (2.0% salt by weight)',
        '1 tsp raw cracked black mustard seeds (preserves myrosinase)',
        '4 dried juniper berries'
      ],
      protocolSteps: [
        'Massage cabbage firmly with salt for 8-10 minutes until natural brine pools generously.',
        'Pack tightly into a glass fermentation jar, ensuring all cabbage is fully submerged below brine line.',
        'Secure with fermentation weight and airlock lid. Store away from direct sunlight at 65-72°F.',
        'Test pH at Day 7 and Day 14. Must test below 4.6 (typically 3.5 - 3.8) before consuming.'
      ]
    },
    {
      id: 'ferm-baobab-02',
      title: 'Ancestral Baobab & Acacia Prebiotic SCFA Elixir',
      microbialCulture: 'Bifidobacterium longum subsp. infantis & Faecalibacterium prausnitzii enrichment',
      fermentationDurationDays: 3,
      targetPhSafetyThreshold: 4.1,
      prebioticSubstrate: 'Acacia Arabica Gum & Baobab Soluble Fruit Fiber',
      scfaYieldRating: 'High Butyrate',
      oralSystemicBonus: 'Natural ascorbic acid and polyphenols inhibit P. gingivalis gingipains',
      ingredients: [
        '1 tbsp raw wild baobab fruit pulp powder (rich in soluble pectin)',
        '1 tbsp organic acacia senegal gum powder (highly tolerogenic prebiotic)',
        '1 cup lukewarm clean spring water or water kefir',
        'Pinch of ground cinnamon'
      ],
      protocolSteps: [
        'Whisk baobab and acacia gum powder into water until smooth and frothy.',
        'Allow to culture at room temperature for 24-48 hours with active water kefir grains or consume immediately as a prebiotic prebiotic emulsion.',
        'Drink 30 minutes before the first meal of the day to prime colonocyte butyrate synthesis.'
      ]
    },
    {
      id: 'ferm-teff-03',
      title: 'Fermented Ethiopian Teff Sourdough (Injera Culture)',
      microbialCulture: 'Endogenous Teff yeasts (Candida / Pichia) & Heterofermentative Lactobacilli',
      fermentationDurationDays: 4,
      targetPhSafetyThreshold: 4.2,
      prebioticSubstrate: 'Teff Resistant Starch & Phytate-Degraded Bioavailable Iron',
      scfaYieldRating: 'Balanced Trio',
      oralSystemicBonus: 'Phytic acid breakdown unleashes non-heme zinc for oral epithelial healing',
      ingredients: [
        '2 cups 100% whole grain ivory or brown teff flour',
        '2.5 cups chlorine-free water',
        'Pinch of active sourdough starter or wild culture capture'
      ],
      protocolSteps: [
        'Mix teff flour and water in a ceramic bowl into a thin batter.',
        'Cover loosely with a clean linen cloth and let ferment at 70°F for 3 to 4 days until bubbly and pleasantly sour.',
        'Pour onto a hot non-stick pan or crepe maker, cover, and steam until characteristic honeycomb "eyes" form.'
      ]
    }
  ]);

  /**
   * Log a new batch pH measurement and verify food safety boundaries.
   */
  logBatchPh(ph: number): { isSafe: boolean; warning?: string } {
    this.currentBatchPh.set(ph);
    if (ph >= 4.6) {
      return {
        isSafe: false,
        warning: '⚠️ Food Safety Alert: pH >= 4.6. Pathogenic spores (Clostridium botulinum) are only inhibited below pH 4.6. Allow fermentation to proceed further or discard if stalled.'
      };
    }
    return {
      isSafe: true
    };
  }

  /**
   * Update daily prebiotic fiber intake.
   */
  updatePrebioticFiber(grams: number): void {
    this.dailyPrebioticFiberGrams.set(Math.max(0, grams));
  }

  /**
   * Update oral nitrate intake.
   */
  updateOralNitrate(mg: number): void {
    this.oralNitrateIntakeMg.set(Math.max(0, mg));
  }

  /**
   * Activates colonic SCFA or entero-salivary nitric oxide vasodilation simulation in 3D anatomy.
   */
  trigger3dScfaOrNitricOxideSimulation(type: 'butyrate' | 'nitric_oxide'): void {
    if (this.patientState && typeof this.patientState.anatomyViewMode?.set === 'function') {
      this.patientState.anatomyViewMode.set('nutrigenomics');
      if (typeof this.patientState.selectedNutrigenomicLigand?.set === 'function') {
        this.patientState.selectedNutrigenomicLigand.set(type);
      }
    }
    // eslint-disable-next-line no-console
    console.log(`[PocketGull 3D Simulation] Triggered 3D nutrigenomic pathway for: ${type}`);
  }
}
