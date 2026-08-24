import { Injectable, signal, computed } from '@angular/core';

export interface IArcadianBotanical {
  id: string;
  greekName: string;
  englishName: string;
  botanicalTaxonomy: string;
  altitudeZoneMeters: string;
  keyPhytochemicals: string[];
  mechanismOfAction: string;
  clinicalLongevityTarget: string;
  traditionalPreparation: string;
  dailyDoseOrFrequency: string;
  icon: string;
  polyphenolContentMgG: number;
}

export interface IArcadianSpringProfile {
  name: string;
  altitudeMeters: number;
  waterPh: number;
  magnesiumMgL: number;
  calciumMgL: number;
  dissolvedSolidsPpm: number;
  microplasticCountPpm: number;
  hydrologicalSource: string;
}

export interface IInclineCalculationResult {
  durationMinutes: number;
  inclineGradePercent: number;
  metabolicEquivalent: number;
  estimatedCaloriesBurned: number;
  eccentricGluteLoadMultiplier: number;
  postprandialGlucoseDropMgDl: number;
  longevityZone2MinutesEarned: number;
}

export const AKOVOS_BOTANICALS: IArcadianBotanical[] = [
  {
    id: 'sideritis-clandestina',
    greekName: 'Τσάι του Βουνού (Ταΰγετος)',
    englishName: 'Mount Taygetos Wild Mountain Tea',
    botanicalTaxonomy: 'Sideritis clandestina subsp. clandestina',
    altitudeZoneMeters: '900m – 1,800m (Endemic to Peloponnese)',
    keyPhytochemicals: ['Apigenin', 'Luteolin', 'Hypolaetin 8-O-glucoside', 'Carvacrol', 'Isoscutellarein'],
    mechanismOfAction: 'Inhibits acetylcholinesterase, prevents β-amyloid plaque aggregation, and downregulates pro-inflammatory cytokines (IL-6, TNF-α) via Nrf2 antioxidant pathway activation.',
    clinicalLongevityTarget: 'Neuroprotection, Cognitive Longevity, Gastroprotection & Deep Sleep Prep',
    traditionalPreparation: 'Simmer whole dried stems and flower bracts in fresh mountain spring water for 5–7 min, steep covered for 4 min, infuse with raw Taygetos thyme honey and lemon slice.',
    dailyDoseOrFrequency: '1–2 cups daily (ideal afternoon or 1 hr before bedtime)',
    icon: '🍵',
    polyphenolContentMgG: 48.6
  },
  {
    id: 'origanum-vulgare-hirtum',
    greekName: 'Αρκαδική Άγρια Ρίγανη',
    englishName: 'Arcadian High-Altitude Wild Oregano',
    botanicalTaxonomy: 'Origanum vulgare subsp. hirtum',
    altitudeZoneMeters: '850m – 1,200m (Limestone rocky terraces)',
    keyPhytochemicals: ['Carvacrol (82%)', 'Thymol', 'Rosmarinic Acid', 'p-Cymene', 'Gamma-Terpinene'],
    mechanismOfAction: 'Potent broad-spectrum anti-microbial disrupting bacterial lipid membranes, strong radical scavenger preventing LDL oxidation and preserving endothelial nitric oxide bioavailability.',
    clinicalLongevityTarget: 'Gut Microbiome Pathogen Balance, Endothelial Health & Lipid Protection',
    traditionalPreparation: 'Crushed raw over mountain salads, steeped in hot broths, or infused into cold-pressed Extra Virgin Olive Oil.',
    dailyDoseOrFrequency: '1–2 tsp dried herb daily with meals',
    icon: '🌿',
    polyphenolContentMgG: 72.4
  },
  {
    id: 'salvia-fruticosa',
    greekName: 'Ελληνικό Φασκόμηλο',
    englishName: 'Greek Mountain Sage',
    botanicalTaxonomy: 'Salvia fruticosa / Salvia triloba',
    altitudeZoneMeters: '700m – 1,100m',
    keyPhytochemicals: ['1,8-Cineole', 'Camphor', 'Carnosic Acid', 'Ursolic Acid', 'Salvianolic Acid B'],
    mechanismOfAction: 'Selective cholinergic receptor modulation enhancing working memory speed, carnosic acid provides cerebral antioxidant defense against mitochondrial ROS.',
    clinicalLongevityTarget: 'Working Memory, Neuroplasticity & Metabolic Insulin Sensitivity',
    traditionalPreparation: 'Infuse 1 tbsp dried leaf in 90°C spring water for 6 minutes. Avoid boiling to preserve delicate aromatic monoterpenes.',
    dailyDoseOrFrequency: '1 cup 3–4 days/week in the morning',
    icon: '🍃',
    polyphenolContentMgG: 54.1
  },
  {
    id: 'wild-horta-blend',
    greekName: 'Άγρια Χόρτα του Βουνού',
    englishName: 'Foraged Mountain Wild Greens (Radiki, Zochos, Stamnagathi)',
    botanicalTaxonomy: 'Taraxacum officinale, Sonchus oleraceus, Cichorium spinosum',
    altitudeZoneMeters: '800m – 1,300m (Terraces & alpine meadows)',
    keyPhytochemicals: ['Inulin (Prebiotic)', 'Lutein', 'Zeaxanthin', 'Sulforaphane Precursors', 'Cichoric Acid'],
    mechanismOfAction: 'Bitter sesquiterpene lactones stimulate bile secretion and liver detoxification; massive soluble inulin fiber drives Akkermansia muciniphila and Faecalibacterium prausnitzii microbiome proliferation.',
    clinicalLongevityTarget: 'Liver Glycogen Regulation, Microbiome Alpha-Diversity & Glycemic Control',
    traditionalPreparation: 'Lightly boiled (4–6 min) in spring water, drained, and served warm with generous raw mountain EVOO and fresh lemon juice.',
    dailyDoseOrFrequency: '1 generous bowl (200–300g) 4–5 times weekly',
    icon: '🥗',
    polyphenolContentMgG: 38.2
  },
  {
    id: 'arcadian-mountain-evoo',
    greekName: 'Εξαιρετικό Παρθένο Ελαιόλαδο Αρκαδίας',
    englishName: 'High-Phenolic Arcadian Mountain EVOO',
    botanicalTaxonomy: 'Olea europaea (Koroneiki / Manaki mountain clone)',
    altitudeZoneMeters: '650m – 950m (Steep sunny slopes)',
    keyPhytochemicals: ['Oleocanthal (>450 mg/kg)', 'Oleacein (>350 mg/kg)', 'Hydroxytyrosol', 'Oleuropein Aglycone'],
    mechanismOfAction: 'Oleocanthal acts as a natural COX-1 and COX-2 inhibitor with dose-dependent anti-inflammatory potency equivalent to 10% of adult ibuprofen, preventing vascular cell adhesion molecule (VCAM-1) upregulation.',
    clinicalLongevityTarget: 'Cardiovascular Vasodilation, Cellular Autophagy & Low Allostatic Inflammation',
    traditionalPreparation: 'Raw drizzle over warm greens, pulses, sourdough, or consumed as 1 tbsp straight upon morning waking.',
    dailyDoseOrFrequency: '30–45 mL (2–3 tbsp) raw daily',
    icon: '🫒',
    polyphenolContentMgG: 88.0
  }
];

export const AKOVOS_SPRINGS: IArcadianSpringProfile[] = [
  {
    name: 'Vrysi tou Akovou (Main Village Spring Fountain)',
    altitudeMeters: 940,
    waterPh: 8.1,
    magnesiumMgL: 28.4,
    calciumMgL: 64.2,
    dissolvedSolidsPpm: 185,
    microplasticCountPpm: 0.0,
    hydrologicalSource: 'Mount Taygetos deep subterranean limestone aquifers'
  },
  {
    name: 'Agia Paraskevi Mountain Cascade',
    altitudeMeters: 1020,
    waterPh: 8.2,
    magnesiumMgL: 32.1,
    calciumMgL: 58.0,
    dissolvedSolidsPpm: 172,
    microplasticCountPpm: 0.0,
    hydrologicalSource: 'High alpine snowmelt & fractured dolomite karst reservoirs'
  }
];

@Injectable({
  providedIn: 'root'
})
export class AkovosLongevityService {
  readonly botanicals = signal<IArcadianBotanical[]>(AKOVOS_BOTANICALS);
  readonly springProfiles = signal<IArcadianSpringProfile[]>(AKOVOS_SPRINGS);
  readonly selectedBotanicalId = signal<string>('sideritis-clandestina');

  readonly selectedBotanical = computed<IArcadianBotanical>(() => {
    const id = this.selectedBotanicalId();
    return this.botanicals().find(b => b.id === id) || this.botanicals()[0];
  });

  /**
   * Calculates the metabolic and longevity benefits of walking Akovos's sloped village stone paths (Kalderimia).
   */
  calculateInclineBiomechanics(weightKg: number = 75, durationMinutes: number = 45, inclineGradePercent: number = 18): IInclineCalculationResult {
    // Sloped mountain walking uses higher METs than flat surface
    const baseMet = 3.5;
    const gradeModifier = 1 + (inclineGradePercent / 100) * 4.2;
    const metabolicEquivalent = parseFloat((baseMet * gradeModifier).toFixed(2));

    // Calories: (MET * 3.5 * weightKg / 200) * durationMinutes
    const estimatedCaloriesBurned = Math.round((metabolicEquivalent * 3.5 * weightKg / 200) * durationMinutes);
    const eccentricGluteLoadMultiplier = parseFloat((1 + (inclineGradePercent / 100) * 2.8).toFixed(2));

    // Postprandial glucose reduction: steep incline increases GLUT-4 translocation by up to 34%
    const postprandialGlucoseDropMgDl = Math.min(48, Math.round(18 + (durationMinutes / 10) * 3.8 + (inclineGradePercent / 5) * 2.1));

    return {
      durationMinutes,
      inclineGradePercent,
      metabolicEquivalent,
      estimatedCaloriesBurned,
      eccentricGluteLoadMultiplier,
      postprandialGlucoseDropMgDl,
      longevityZone2MinutesEarned: durationMinutes
    };
  }

  selectBotanical(id: string) {
    this.selectedBotanicalId.set(id);
  }
}
