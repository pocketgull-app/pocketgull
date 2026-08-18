import { Injectable, signal } from '@angular/core';

export type StoreCategoryType = 
  | 'local_coop' 
  | 'apothecary' 
  | 'compounding_pharmacy' 
  | 'whole_foods' 
  | 'sprouts' 
  | 'pharmacy' 
  | 'asian_herbal';

export interface ITinctureIngredient {
  name: string;
  botanicalName: string;
  percentage: number;
  activeConstituents: string;
  actionRole: 'Chief / Emperor' | 'Deputy / Minister' | 'Assistant / Harmonizer' | 'Envoy / Guiding';
}

export interface ITinctureFormula {
  id: string;
  title: string;
  indication: string;
  tradition: 'Tri-Paradigm Synergy' | 'TCM / Classical Herbal' | 'Ayurvedic Rasayana' | 'Western Eclectic Botanical';
  ingredients: ITinctureIngredient[];
  extractionRatio: string;
  menstruumType: string;
  alcoholFreeAlternative: string;
  suggestedDosage: string;
  contraindications: string[];
  vettedReadyMadeBrand: {
    brandName: string;
    productTitle: string;
    certifications: string[];
    priceRange: string;
  };
  bulkSourcingNote: string;
}

export interface IAffiliateStoreItem {
  id: string;
  category: 'art_framing' | 'somatic_vagal' | 'apothecary_craft' | 'clinical_hardware' | 'bulk_herbs';
  categoryLabel: string;
  title: string;
  subtitle: string;
  searchQuery: string;
  isHsaEligible: boolean;
  priceEstimate: string;
  recommendedBrands: string[];
  clinicalRationale: string;
}

@Injectable({
  providedIn: 'root'
})
export class StoreSourcingService {
  readonly amazonAffiliateTag = signal<string>('pocketgull-20');
  readonly iherbAffiliateCode = signal<string>('POCKETGULL');

  /**
   * Universal privacy-preserving Google Maps Directions / Search URL generator.
   */
  generateLocalMapsUrl(storeType: StoreCategoryType, specificItem?: string): string {
    let query = '';
    const itemSnippet = specificItem ? ` ${specificItem}` : '';

    switch (storeType) {
      case 'local_coop':
        query = `independent natural food co-op organic grocer${itemSnippet} near me`;
        break;
      case 'apothecary':
        query = `herbal apothecary botanical dispensary${itemSnippet} near me`;
        break;
      case 'compounding_pharmacy':
        query = `independent compounding pharmacy medical supplies${itemSnippet} near me`;
        break;
      case 'whole_foods':
        query = `Whole Foods Market organic groceries${itemSnippet} near me`;
        break;
      case 'sprouts':
        query = `Sprouts Farmers Market or Natural Grocers${itemSnippet} near me`;
        break;
      case 'pharmacy':
        query = `24/7 CVS or Walgreens pharmacy${itemSnippet} near me`;
        break;
      case 'asian_herbal':
        query = `Asian supermarket herbal medicine dispensary${itemSnippet} near me`;
        break;
      default:
        query = `health food store or pharmacy${itemSnippet} near me`;
    }

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  /**
   * Formats a clean Amazon search URL with affiliate tag and optional HSA/FSA filter.
   */
  generateAmazonAffiliateUrl(searchQuery: string, isHsaEligible: boolean = false): string {
    const base = 'https://www.amazon.com/s';
    const tag = this.amazonAffiliateTag();
    const query = isHsaEligible ? `${searchQuery} HSA FSA eligible` : searchQuery;
    return `${base}?k=${encodeURIComponent(query)}&tag=${encodeURIComponent(tag)}`;
  }

  /**
   * Formats an iHerb search URL for certified organic and third-party tested botanical supplies.
   */
  generateIherbUrl(searchQuery: string): string {
    const base = 'https://www.iherb.com/search';
    const code = this.iherbAffiliateCode();
    return `${base}?kw=${encodeURIComponent(searchQuery)}&rcode=${encodeURIComponent(code)}`;
  }

  /**
   * Curated Amazon affiliate storefront catalog items.
   */
  getAffiliateStoreCatalog(): IAffiliateStoreItem[] {
    return [
      {
        id: 'aff-art-01',
        category: 'art_framing',
        categoryLabel: 'Museum Shadowboxes & Fine Art Framing',
        title: 'Solid Oak Deep Shadowbox Frame (16" × 20")',
        subtitle: 'UV-Filtering Conservation Acrylic Glass & Acid-Free Mat',
        searchQuery: 'solid oak deep shadowbox frame 16x20 UV protection',
        isHsaEligible: false,
        priceEstimate: '$38 - $58',
        recommendedBrands: ['Americanflat', 'Craig Frames', 'ArtToFrames'],
        clinicalRationale: 'Protects 3D paper quilling and delicate biological filigree from humidity and UV degradation for 100+ year archival longevity.'
      },
      {
        id: 'aff-art-02',
        category: 'art_framing',
        categoryLabel: 'Museum Shadowboxes & Fine Art Framing',
        title: 'Precision Slotted Paper Quilling Toolset & Slotted Needles',
        subtitle: 'Adaptive Ergonomic Grip for Fine-Motor Rehabilitation',
        searchQuery: 'paper quilling tools slotted needles gradient paper strips set',
        isHsaEligible: false,
        priceEstimate: '$14 - $24',
        recommendedBrands: ['Juya', 'Quilled Creations'],
        clinicalRationale: 'Calibrated tactile neuro-somatic therapy tool supporting neuroplastic hand-eye coordination.'
      },
      {
        id: 'aff-vagal-01',
        category: 'somatic_vagal',
        categoryLabel: 'Somatic Grounding & Autonomic Tone Tools',
        title: 'Weighted Somatic Lap Blanket & Grounding Pad (7 lbs)',
        subtitle: 'Deep Touch Pressure Stimulation for Parasympathetic Tone',
        searchQuery: 'weighted lap pad 7 lbs sensory calming washable',
        isHsaEligible: true,
        priceEstimate: '$29 - $49',
        recommendedBrands: ['YnM', 'Gravity Blanket', 'Luna'],
        clinicalRationale: 'Activates proprioceptive mechanoreceptors to down-regulate acute sympathetic adrenergic tone.'
      },
      {
        id: 'aff-vagal-02',
        category: 'somatic_vagal',
        categoryLabel: 'Somatic Grounding & Autonomic Tone Tools',
        title: '0.1Hz HRV Optical Pulse Ear-Clip Sensor',
        subtitle: 'Real-Time Respiratory Sinus Arrhythmia Biofeedback',
        searchQuery: 'HRV ear clip pulse sensor biofeedback monitor USB',
        isHsaEligible: true,
        priceEstimate: '$65 - $110',
        recommendedBrands: ['HeartMath Inner Balance', 'KYTO', 'Lief Therapeutics'],
        clinicalRationale: 'Direct optical telemetry measuring vagal nerve baroreflex gain during resonant breathing.'
      },
      {
        id: 'aff-apoth-01',
        category: 'apothecary_craft',
        categoryLabel: 'Botanical Apothecary & Tincture Crafting',
        title: 'Amber Glass Dropper Bottles with Calibrated Pipettes (2oz / 60mL, 12-Pack)',
        subtitle: 'UV-Blocking Boston Round Bottles with Tamper-Evident Seals',
        searchQuery: '2oz amber glass dropper bottles calibrated pipette pack of 12',
        isHsaEligible: false,
        priceEstimate: '$16 - $24',
        recommendedBrands: ['Vivaplex', 'BakingWorld'],
        clinicalRationale: 'Blocks light wavelengths (300-500nm) that oxidize active flavonoids, withanolides, and essential oils.'
      },
      {
        id: 'aff-apoth-02',
        category: 'apothecary_craft',
        categoryLabel: 'Botanical Apothecary & Tincture Crafting',
        title: 'Organic Food-Grade USP Vegetable Glycerin (32 fl oz)',
        subtitle: '100% Pure Palm-Derived Menstruum for Alcohol-Free Extracts',
        searchQuery: 'organic USP vegetable glycerin food grade 100 percent pure 32oz',
        isHsaEligible: false,
        priceEstimate: '$14 - $22',
        recommendedBrands: ['NOW Solutions', 'Essential Depot', 'Heritage Store'],
        clinicalRationale: 'Provides a safe, non-alcoholic botanical extraction vehicle ideal for pediatric, hepatic, or alcohol-sensitive protocols.'
      },
      {
        id: 'aff-diag-01',
        category: 'clinical_hardware',
        categoryLabel: 'Diagnostic & Continuous Monitoring Hardware',
        title: 'Omron Upper Arm Blood Pressure Monitor with Bluetooth',
        subtitle: 'AHA Validated Automatic Digital Sphygmomanometer',
        searchQuery: 'Omron upper arm blood pressure monitor bluetooth wireless',
        isHsaEligible: true,
        priceEstimate: '$59 - $89',
        recommendedBrands: ['Omron Healthcare', 'Withings', 'Beurer'],
        clinicalRationale: 'Clinical standard for tracking hemodynamic stability and postural orthostatic baroreflex tone.'
      },
      {
        id: 'aff-diag-02',
        category: 'clinical_hardware',
        categoryLabel: 'Diagnostic & Continuous Monitoring Hardware',
        title: 'Waterproof Continuous Glucose Monitor Adhesive Patches (25-Pack)',
        subtitle: 'Breathable Hypoallergenic Sensor Overpatch',
        searchQuery: 'CGM sensor overpatch waterproof hypoallergenic pack',
        isHsaEligible: true,
        priceEstimate: '$12 - $19',
        recommendedBrands: ['Skin Grip', 'Lexcam', 'Not Just a Patch'],
        clinicalRationale: 'Maintains sensor adhesion during hydrotherapy and autonomic cold exposure protocols.'
      },
      {
        id: 'aff-herb-01',
        category: 'bulk_herbs',
        categoryLabel: 'Certified Organic Bulk Herbs & Adaptogens',
        title: 'Organic Ashwagandha Root Powder (16 oz / 1 lb)',
        subtitle: 'KSM-66 Full-Spectrum Root Extract Powder',
        searchQuery: 'organic ashwagandha root powder USDA certified 1 lb',
        isHsaEligible: false,
        priceEstimate: '$16 - $28',
        recommendedBrands: ['Starwest Botanicals', 'Frontier Co-op', 'Mountain Rose Herbs'],
        clinicalRationale: 'Primary adaptogenic root for neuro-endocrine HPA axis regulation and cortisol balance.'
      },
      {
        id: 'aff-herb-02',
        category: 'bulk_herbs',
        categoryLabel: 'Certified Organic Bulk Herbs & Adaptogens',
        title: 'Organic Holy Basil / Rama Tulsi Leaf (1 lb)',
        subtitle: 'Cut & Sifted Fair-Trade Organic Botanical',
        searchQuery: 'organic holy basil tulsi leaf cut and sifted 1 lb',
        isHsaEligible: false,
        priceEstimate: '$18 - $26',
        recommendedBrands: ['Organic India', 'Frontier Co-op', 'Starwest Botanicals'],
        clinicalRationale: 'Eugenol-rich botanical supporting microvascular perfusion and respiratory sinus calm.'
      }
    ];
  }

  /**
   * Curated evidence-grounded botanical tincture and decoction formulas.
   */
  getTinctureFormulas(): ITinctureFormula[] {
    return [
      {
        id: 'formula-shen-calm',
        title: 'Vagal Neuro-Calm & Shen Stabilizing Tincture',
        indication: 'Autonomic nervous system dysregulation, sleep onset latency, chronic sympathetic tone',
        tradition: 'Tri-Paradigm Synergy',
        ingredients: [
          {
            name: 'Ashwagandha Root',
            botanicalName: 'Withania somnifera',
            percentage: 30,
            activeConstituents: 'Withanolides, Somniferine (GABA-A modulation)',
            actionRole: 'Chief / Emperor'
          },
          {
            name: 'Holy Basil / Tulsi',
            botanicalName: 'Ocimum sanctum',
            percentage: 25,
            activeConstituents: 'Eugenol, Ursolic acid (HPA axis cortisol support)',
            actionRole: 'Deputy / Minister'
          },
          {
            name: 'Milky Oat Tops',
            botanicalName: 'Avena sativa',
            percentage: 20,
            activeConstituents: 'Avenanthramides, Gramine (Nerve trophic restorative)',
            actionRole: 'Assistant / Harmonizer'
          },
          {
            name: 'Passionflower',
            botanicalName: 'Passiflora incarnata',
            percentage: 15,
            activeConstituents: 'Chrysin, Harman alkaloids (Glycine receptor support)',
            actionRole: 'Assistant / Harmonizer'
          },
          {
            name: 'Fresh Ginger Rhizome',
            botanicalName: 'Zingiber officinale',
            percentage: 10,
            activeConstituents: 'Gingerols, Shogaols (Bioavailability enhancer)',
            actionRole: 'Envoy / Guiding'
          }
        ],
        extractionRatio: '1:5 Dry Herb to Menstruum (w/v)',
        menstruumType: '55% Organic Cane Alcohol / 45% Distilled Spring Water',
        alcoholFreeAlternative: 'Pure Vegetable Glycerite (100% Palm-Free Organic Glycerin)',
        suggestedDosage: '30-40 drops (1.5-2.0 mL) in 2 oz warm water, 20 minutes before bedtime or during acute stress.',
        contraindications: ['Active pregnancy / lactation without OBGYN consult', 'Concomitant CNS sedatives (barbiturates)'],
        vettedReadyMadeBrand: {
          brandName: 'Herb Pharm',
          productTitle: 'Stress Manager Certified Organic Extract',
          certifications: ['USDA Organic', 'Non-GMO Project Verified', 'cGMP Lab Tested'],
          priceRange: '$16 - $24 (1-4 oz)'
        },
        bulkSourcingNote: 'Can be compounded at local herbal dispensaries or ordered via Mountain Rose Herbs / Frontier Co-op.'
      },
      {
        id: 'formula-huang-qi',
        title: 'Huang Qi & Spleen Yang Organic Decoction Pack',
        indication: 'Post-viral chronic fatigue, lymphatic stasis, mitochondrial energy deficit, low daytime stamina',
        tradition: 'TCM / Classical Herbal',
        ingredients: [
          {
            name: 'Astragalus Root (Huang Qi)',
            botanicalName: 'Astragalus membranaceus',
            percentage: 40,
            activeConstituents: 'Astragalosides I-IV, Polysaccharides (Cellular macrophage activation)',
            actionRole: 'Chief / Emperor'
          },
          {
            name: 'Codonopsis Root (Dang Shen)',
            botanicalName: 'Codonopsis pilosula',
            percentage: 25,
            activeConstituents: 'Codonopsine, Triterpenoids (Spleen Qi replenishment)',
            actionRole: 'Deputy / Minister'
          },
          {
            name: 'White Atractylodes (Bai Zhu)',
            botanicalName: 'Atractylodes macrocephala',
            percentage: 20,
            activeConstituents: 'Atractylone (Fluid metabolism & GI transport)',
            actionRole: 'Assistant / Harmonizer'
          },
          {
            name: 'Honey-Fried Licorice Root (Zhi Gan Cao)',
            botanicalName: 'Glycyrrhiza uralensis',
            percentage: 15,
            activeConstituents: 'Glycyrrhizin (Adrenal cortex & harmonic guide)',
            actionRole: 'Envoy / Guiding'
          }
        ],
        extractionRatio: 'Simmered Decoction (30g bulk herb pack in 4 cups water reduced to 2 cups)',
        menstruumType: 'Aqueous Thermal Decoction (Water Only, Zero Alcohol)',
        alcoholFreeAlternative: 'Naturally 100% Alcohol-Free Traditional Tea Decoction',
        suggestedDosage: '1 warm cup in the morning (7am-9am Spleen meridian hour) and 1 warm cup with lunch.',
        contraindications: ['Acute high fever / exterior pathogen invasion', 'Severe uncontrolled hypertension (due to Licorice)'],
        vettedReadyMadeBrand: {
          brandName: 'Plum Flower',
          productTitle: 'Bu Zhong Yi Qi Wan (Central Qi Tonic Pills)',
          certifications: ['Heavy Metal Tested', 'Sulfur-Free Herbs', 'cGMP Certified'],
          priceRange: '$14 - $20 (200 teapills)'
        },
        bulkSourcingNote: 'Sourced whole from Chinatown herbal dispensaries, Spring Wind Herbs, or Nuherbs.'
      },
      {
        id: 'formula-cardio-shield',
        title: 'Cardio-Shield Hawthorn & Arjuna Heart Tonic',
        indication: 'Elevated Systemic Inflammatory Burden (SIBI), microvascular endothelial support, arterial flexibility',
        tradition: 'Western Eclectic Botanical',
        ingredients: [
          {
            name: 'Hawthorn Berry & Leaf',
            botanicalName: 'Crataegus monogyna',
            percentage: 45,
            activeConstituents: 'Oligomeric Proanthocyanidins (OPCs), Vitexin (Coronary vasodilation)',
            actionRole: 'Chief / Emperor'
          },
          {
            name: 'Arjuna Bark',
            botanicalName: 'Terminalia arjuna',
            percentage: 30,
            activeConstituents: 'Arjunic acid, Flavonoids (Myocardial inotropic support)',
            actionRole: 'Deputy / Minister'
          },
          {
            name: 'Hibiscus Calyx',
            botanicalName: 'Hibiscus sabdariffa',
            percentage: 15,
            activeConstituents: 'Anthocyanins (Endothelial nitric oxide synthase stimulation)',
            actionRole: 'Assistant / Harmonizer'
          },
          {
            name: 'Green Cardamom Pods',
            botanicalName: 'Elettaria cardamomum',
            percentage: 10,
            activeConstituents: '1,8-Cineole, Terpinyl acetate (Digestive & circulation driver)',
            actionRole: 'Envoy / Guiding'
          }
        ],
        extractionRatio: '1:4 Dual Extract (Water/Alcohol)',
        menstruumType: '45% Organic Cane Alcohol / 55% Spring Water',
        alcoholFreeAlternative: 'Glycerin Infusion / Aqueous Solid Extract',
        suggestedDosage: '40-50 drops (2.5 mL) twice daily with meals in sparkling or spring water.',
        contraindications: ['Severe aortic stenosis', 'Consult cardiologist if taking Digoxin or Beta-blockers'],
        vettedReadyMadeBrand: {
          brandName: 'Gaia Herbs',
          productTitle: 'Hawthorn Supreme Liquid Phyto-Caps',
          certifications: ['Purity Tested by Gaia Trace', 'Certified B Corp', 'Vegan'],
          priceRange: '$22 - $32 (60 liquid capsules)'
        },
        bulkSourcingNote: 'Available as loose organic berries and bark at health food co-ops and apothecaries.'
      }
    ];
  }
}
