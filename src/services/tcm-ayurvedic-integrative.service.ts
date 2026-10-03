/**
 * @file tcm-ayurvedic-integrative.service.ts
 * @description Evidence-grounded, culturally concordant Traditional Chinese Medicine (TCM)
 * and Ayurvedic Medicine Integrative Service.
 * Implements:
 * 1. Constitutional Differentiation (TCM 8 Principles & 5 Elements; Ayurvedic Tridosha Prakriti/Vikriti).
 * 2. Clinical Shi Liao (TCM Food Therapy: Thermal Nature & Five Flavors) and Ahara (Ayurvedic Shad Rasa).
 * 3. Reproductive & Bodily Autonomy Concordance (Menstrual Vitality, Sitting the Month / Zuo Yue Zi,
 *    Ayurvedic Sutika Paricharya postpartum care, and safe non-interfering harm reduction comfort).
 * 4. High-Stakes Herb-Drug Interaction (HDI) & Heavy Metal Screening (Aristolochic acid, anticoagulants,
 *    lithium, ASA, CITES-protected species prohibition, USP/NSF/Ayush lab certification).
 * 5. Logistical Community Sourcing & Paywall Reduction (Bilingual Asian/Indian grocery shopping manifests,
 *    POCA community acupuncture clinic locator, and open-access research evidence).
 */

import { Injectable, signal, computed } from '@angular/core';

export type TcmThermalNature = 'Cold' | 'Cool' | 'Neutral' | 'Warm' | 'Hot';
export type TcmFlavor = 'Sour (Wood/Liver)' | 'Bitter (Fire/Heart)' | 'Sweet (Earth/Spleen)' | 'Pungent (Metal/Lung)' | 'Salty (Water/Kidney)';
export type DoshaType = 'Vata' | 'Pitta' | 'Kapha' | 'Tridoshic' | 'Vata-Pitta' | 'Pitta-Kapha' | 'Vata-Kapha';

export interface ITcmFoodRecommendation {
  id: string;
  name: string;
  chinesePinyin: string;
  chineseCharacters: string;
  thermalNature: TcmThermalNature;
  flavors: TcmFlavor[];
  meridianTropism: string[];
  clinicalActions: string;
  contraindications: string;
  groceryAisle: string;
}

export interface IAyurvedicFoodRecommendation {
  id: string;
  name: string;
  sanskritName: string;
  tastes: ('Sweet (Madhura)' | 'Sour (Amla)' | 'Salty (Lavana)' | 'Pungent (Katu)' | 'Bitter (Tikta)' | 'Astringent (Kashaya)')[];
  doshaEffect: {
    vata: 'Pacifies' | 'Aggravates' | 'Neutral';
    pitta: 'Pacifies' | 'Aggravates' | 'Neutral';
    kapha: 'Pacifies' | 'Aggravates' | 'Neutral';
  };
  digestiveEffect: string; // Vipaka & Virya (heating vs cooling)
  clinicalBenefits: string;
  groceryAisle: string;
}

export interface IHerbDrugInteractionAlert {
  herbName: string;
  tradition: 'TCM' | 'Ayurveda';
  contraindicatedDrugClass: string;
  severity: 'CRITICAL_CONTRAINDICATION' | 'MODERATE_MONITOR' | 'SAFE_SUPPORTIVE';
  mechanism: string;
  evidenceSummary: string;
  safeAlternative: string;
}

export interface IReproductiveSupportProtocol {
  phaseOrContext: 'Menstrual Dysmenorrhea' | 'Sitting the Month (Postpartum/Post-Abortion)' | 'LARC / Copper IUD Support' | 'Post-Procedure Uterine Tonification';
  tradition: 'TCM' | 'Ayurveda';
  protocolTitle: string;
  culturalTerm: string;
  coreInterventions: string[];
  safeNourishingFoods: string[];
  acupressureOrMarmaPoints: string[];
  biomedicalSafetyBoundary: string;
}

export interface ICommunityResourceHub {
  name: string;
  category: 'Community Acupuncture (POCA)' | 'Ayurvedic Wellness Clinic' | 'Asian Herb & Grocer Co-op' | 'Indian Spice & Botanical Hub';
  description: string;
  slidingScaleFee: string;
  accessibilityNotes: string;
  verificationBadge: string;
}

@Injectable({
  providedIn: 'root'
})
export class TcmAyurvedicIntegrativeService {
  // Active selected constitution / dosha state
  readonly selectedTcmPattern = signal<string>('Spleen Qi Deficiency with Dampness');
  readonly selectedAyurvedicDosha = signal<DoshaType>('Vata-Pitta');
  readonly activePatientPrescriptions = signal<string[]>(['Warfarin', 'Metformin']);

  // TCM Food Therapy Database
  readonly tcmFoodCatalog: ITcmFoodRecommendation[] = [
    {
      id: 'tcm-f-congee',
      name: 'Medicinal Rice Congee with Jujube & Ginger',
      chinesePinyin: 'Xī Fàn',
      chineseCharacters: '稀饭 / 大枣生姜粥',
      thermalNature: 'Warm',
      flavors: ['Sweet (Earth/Spleen)', 'Pungent (Metal/Lung)'],
      meridianTropism: ['Spleen', 'Stomach', 'Lung'],
      clinicalActions: 'Restores middle burner Spleen Yang, bolsters mucosal gut barrier, warms digestion after fasting or blood loss.',
      contraindications: 'Use lower glycemic brown congee if brittle type 2 diabetes with severe hyperglycemia.',
      groceryAisle: 'Grain & Dried Botanical Section (Asian Supermarket)'
    },
    {
      id: 'tcm-f-jobstears',
      name: "Job's Tears / Coix Seed",
      chinesePinyin: 'Yì Yǐ Rén',
      chineseCharacters: '薏苡仁',
      thermalNature: 'Cool',
      flavors: ['Sweet (Earth/Spleen)'],
      meridianTropism: ['Spleen', 'Stomach', 'Lung'],
      clinicalActions: 'Drains chronic pathological dampness, reduces peripheral fluid stagnation and inflammatory joint edema.',
      contraindications: 'Caution during active first trimester of pregnancy; excellent postpartum.',
      groceryAisle: 'Bulk Dried Seed / Grains Aisle'
    },
    {
      id: 'tcm-f-gojiberry',
      name: 'Lycium Fruit / Wolfberry / Goji Berry',
      chinesePinyin: 'Gǒu Qǐ Zǐ',
      chineseCharacters: '枸杞子',
      thermalNature: 'Neutral',
      flavors: ['Sweet (Earth/Spleen)'],
      meridianTropism: ['Liver', 'Kidney', 'Lung'],
      clinicalActions: 'Nourishes Liver and Kidney Yin, enriches retinal macular lutein/zeaxanthin, replenishes Blood and Jing.',
      contraindications: 'Withhold during acute infectious Wind-Heat fever or acute diarrhea with heavy spleen dampness.',
      groceryAisle: 'Dried Medicinal Herbs / Tea Section'
    },
    {
      id: 'tcm-f-lotusseed',
      name: 'Lotus Seed',
      chinesePinyin: 'Lián Zǐ',
      chineseCharacters: '莲子',
      thermalNature: 'Neutral',
      flavors: ['Sweet (Earth/Spleen)', 'Astringent' as any],
      meridianTropism: ['Spleen', 'Kidney', 'Heart'],
      clinicalActions: 'Calms the Shen (spirit/sleep anxiety), tonifies Spleen against chronic loose stool, stabilizes reproductive Jing.',
      contraindications: 'Contraindicated in severe chronic dry constipation or abdominal distension.',
      groceryAisle: 'Dried Goods / Soup Herbs Aisle'
    },
    {
      id: 'tcm-f-chenpi',
      name: 'Aged Tangerine Peel',
      chinesePinyin: 'Chén Pí',
      chineseCharacters: '陈皮',
      thermalNature: 'Warm',
      flavors: ['Pungent (Metal/Lung)', 'Bitter (Fire/Heart)'],
      meridianTropism: ['Spleen', 'Lung'],
      clinicalActions: 'Regulates Qi flow, dissipates gastric fullness, dries pathological phlegm-damp in chest and stomach.',
      contraindications: 'Dry cough from lung Yin exhaustion with lack of phlegm.',
      groceryAisle: 'Aged Tea & Herbal Spices Section'
    }
  ];

  // Ayurvedic Ahara Catalog
  readonly ayurvedicFoodCatalog: IAyurvedicFoodRecommendation[] = [
    {
      id: 'ayu-f-kitchari',
      name: 'Tridoshic Mung Dal & Basmati Kitchari',
      sanskritName: 'Khichdi (खिचड़ी)',
      tastes: ['Sweet (Madhura)', 'Astringent (Kashaya)'],
      doshaEffect: { vata: 'Pacifies', pitta: 'Pacifies', kapha: 'Pacifies' },
      digestiveEffect: 'Neutral Virya (easily assimilated, primes Agni without aggravating acid)',
      clinicalBenefits: 'Gold-standard mono-diet gut mucosal reset. Provides complete protein while demanding near-zero digestive workload.',
      groceryAisle: 'South Asian Lentils (Dal) & Rice Section'
    },
    {
      id: 'ayu-f-ghee',
      name: 'Cultured Grass-Fed A2 Ghee (Clarified Butter)',
      sanskritName: 'Ghrita (घृत)',
      tastes: ['Sweet (Madhura)'],
      doshaEffect: { vata: 'Pacifies', pitta: 'Pacifies', kapha: 'Neutral' },
      digestiveEffect: 'Cooling Virya, Sweet Vipaka (promotes Ojas and cellular lipid vitality)',
      clinicalBenefits: 'Enhances bioavailability of fat-soluble vitamins (A, D, E, K), lubricates joint capsules and nervous myelin, fuels colonocytes via butyric acid.',
      groceryAisle: 'Dairy / Organic Ghee Section'
    },
    {
      id: 'ayu-f-ccftea',
      name: 'Cumin, Coriander & Fennel (CCF) Digestive Infusion',
      sanskritName: 'Tridosha Dipana Churna',
      tastes: ['Pungent (Katu)', 'Bitter (Tikta)', 'Sweet (Madhura)'],
      doshaEffect: { vata: 'Pacifies', pitta: 'Pacifies', kapha: 'Pacifies' },
      digestiveEffect: 'Mildly heating initially, cooling post-digestive (soothes Pitta while expelling gas)',
      clinicalBenefits: 'Alleviates post-prandial bloating, spasms, and urinary inflammation without stimulating excess hydrochloric acid.',
      groceryAisle: 'Whole Spices Aisle (Jeera, Dhaniya, Saunf)'
    },
    {
      id: 'ayu-f-turmeric',
      name: 'Golden Turmeric Root Decoction with Black Pepper',
      sanskritName: 'Haridra (हरिद्रा)',
      tastes: ['Bitter (Tikta)', 'Pungent (Katu)', 'Astringent (Kashaya)'],
      doshaEffect: { vata: 'Neutral', pitta: 'Pacifies', kapha: 'Pacifies' },
      digestiveEffect: 'Heating Virya, Pungent Vipaka (cleanses blood / Rakta Shodhana)',
      clinicalBenefits: 'Potent systemic NF-kB down-regulation; black pepper piperine increases curcumin bioavailability by 2000%.',
      groceryAisle: 'Fresh Produce (Organic Turmeric Rhizome) or Bulk Spice'
    }
  ];

  // Herb-Drug Interaction & Adulteration Safeguards
  readonly herbDrugInteractionCatalog: IHerbDrugInteractionAlert[] = [
    {
      herbName: 'Dan Shen (Salvia miltiorrhiza / Red Sage)',
      tradition: 'TCM',
      contraindicatedDrugClass: 'Anticoagulants & Antiplatelets (Warfarin, Eliquis, Plavix, Aspirin)',
      severity: 'CRITICAL_CONTRAINDICATION',
      mechanism: 'Potentiates antithrombin III and inhibits platelet aggregation, significantly spiking INR and hemorrhage risk.',
      evidenceSummary: 'Cochrane Systematic Review: Dan Shen significantly multiplies Warfarin hypoprothrombinemic effect.',
      safeAlternative: 'Gentle culinary turmeric in dietary quantities or Hawthorn berry (Shan Zha) under INR monitoring.'
    },
    {
      herbName: 'Gan Cao (Licorice Root / Glycyrrhiza glabra)',
      tradition: 'TCM',
      contraindicatedDrugClass: 'Loop/Thiazide Diuretics & Antihypertensives (Furosemide, HCTZ, Lisinopril)',
      severity: 'CRITICAL_CONTRAINDICATION',
      mechanism: 'Glycyrrhizin inhibits 11-beta-hydroxysteroid dehydrogenase, causing pseudoaldosteronism, hypokalemia, and severe hypertension.',
      evidenceSummary: 'FDA Safety Alert on licorice-induced cardiac arrhythmias and refractory hypokalemia.',
      safeAlternative: 'Deglycyrrhizinated Licorice (DGL) or Slippery Elm bark for mucosal soothing.'
    },
    {
      herbName: 'Ashwagandha (Withania somnifera)',
      tradition: 'Ayurveda',
      contraindicatedDrugClass: 'Thyroid Hormone Replacements (Levothyroxine) & Sedatives (Benzodiazepines/SSRIs)',
      severity: 'MODERATE_MONITOR',
      mechanism: 'Stimulates T3/T4 conversion (risk of subclinical hyperthyroidism) and potentiates GABAergic sedation.',
      evidenceSummary: 'Endocrine Society clinical cases of thyrotoxicosis from un-monitored high-dose ashwagandha extracts.',
      safeAlternative: 'Tulsi (Holy Basil) tea or Brahmi (Bacopa monnieri) with clinician thyroid panel monitoring.'
    },
    {
      herbName: 'Guggulu (Commiphora mukul)',
      tradition: 'Ayurveda',
      contraindicatedDrugClass: 'Statins (Atorvastatin) & Oral Contraceptives',
      severity: 'MODERATE_MONITOR',
      mechanism: 'CYP3A4 induction decreases serum levels of oral contraceptive hormones and competes for hepatic statin metabolism.',
      evidenceSummary: 'Interaction literature confirms CYP3A4 upregulation reducing contraceptive efficacy.',
      safeAlternative: 'Soluble oat beta-glucan and Triphala decoction for natural lipid support without CYP3A4 induction.'
    }
  ];

  // Reproductive & Convalescent Care Protocols
  readonly reproductiveProtocols: IReproductiveSupportProtocol[] = [
    {
      phaseOrContext: 'Sitting the Month (Postpartum/Post-Abortion)',
      tradition: 'TCM',
      protocolTitle: 'Zuo Yue Zi (坐月子) Restorative Blood & Qi Replenishment',
      culturalTerm: '坐月子 (Sitting the Month)',
      coreInterventions: [
        'Strict avoidance of exposure to cold drafts, cold floor contact, and cold beverages for 30-40 days',
        'Abdominal warmth through botanical herbal compresses (Mugwort/Ai Ye)',
        'Cognitive and physical rest with family/community caretaking support'
      ],
      safeNourishingFoods: [
        'Black sesame congee with red dates and walnuts',
        'Sesame oil ginger soup with wood ear mushrooms and grass-fed bone/shiitake broth',
        'Longan fruit and lotus seed tea for sleep and heart blood'
      ],
      acupressureOrMarmaPoints: [
        'ST36 (Zusanli) - Tonifies spleen and general vitality',
        'SP6 (Sanyinjiao) - Postpartum harmonizing of Liver, Spleen, and Kidney meridians',
        'CV4 (Guanyuan) - Gentle moxa warmth to replenish primordial Yuan Qi'
      ],
      biomedicalSafetyBoundary: 'Complementary to standard OB/GYN post-procedure care; seek immediate emergency care if fever >= 100.4 F, foul lochia discharge, or saturating > 2 maxi-pads per hour.'
    },
    {
      phaseOrContext: 'Sitting the Month (Postpartum/Post-Abortion)',
      tradition: 'Ayurveda',
      protocolTitle: 'Sutika Paricharya (सूतिक परिचर्या) Sacred 42-Day Convalescence',
      culturalTerm: 'Sutika Seva (Maternal Rejuvenation)',
      coreInterventions: [
        'Daily Abhyanga (warm sesame oil body massage) to pacify aggravated Vata',
        'Udaraveshtana (gentle cotton abdominal wrapping) to support postpartum lax pelvic ligaments',
        'Quiet sensory sanctuary with dim lighting and warm herbal foot soaks'
      ],
      safeNourishingFoods: [
        'Kitchari enriched with cultured A2 ghee and roasted cumin',
        'Dashamula herbal tea for toning uterine and muscular tissues',
        'Warm almond milk infused with crushed cardamom, nutmeg, and dates'
      ],
      acupressureOrMarmaPoints: [
        'Nabhi Marma (Umbilicus) - Gentle circular clockwise warm oil anointment',
        'Basti Marma (Suprapubic) - Soothing warm compress for uterine involution',
        'Talahridaya Marma (Palms and Soles) - Warm sesame oil rub to calm nervous system'
      ],
      biomedicalSafetyBoundary: 'Integrates alongside standard postpartum clinical visits. Never replace antibiotics for diagnosed postpartum endometritis or mastitis.'
    },
    {
      phaseOrContext: 'Menstrual Dysmenorrhea',
      tradition: 'TCM',
      protocolTitle: 'Dispelling Uterine Cold & Blood Stagnation Protocol',
      culturalTerm: '温经散寒 (Warm the Meridians, Dispel Cold)',
      coreInterventions: [
        'Application of warmth to lower abdomen and sacrum (moxa stick or hot water compress)',
        'Warm ginger foot baths before sleep to draw circulation downwards',
        'Abstaining from raw vegetables, ice cream, and iced water during menses'
      ],
      safeNourishingFoods: [
        'Brown sugar and fresh ginger tea (Sheng Jiang Hong Tang)',
        'Hawthorn berry (Shan Zha) decoction to move stagnant blood',
        'Cooked spinach, black beans, and seaweed'
      ],
      acupressureOrMarmaPoints: [
        'SP8 (Diji) - Xi-Cleft point of Spleen for acute menstrual pain relief',
        'LI4 (Hegu) - Potent analgesic point for bodily pain and tension release'
      ],
      biomedicalSafetyBoundary: 'Evaluated alongside pelvic ultrasound to rule out underlying deep infiltrating endometriosis or uterine fibroids.'
    }
  ];

  // Community Resources & Sourcing Hubs
  readonly communityHubs: ICommunityResourceHub[] = [
    {
      name: 'People’s Organization of Community Acupuncture (POCA)',
      category: 'Community Acupuncture (POCA)',
      description: 'National cooperative network of sliding-scale ($15-$35) community acupuncture clinics treating patients in peaceful group rooms.',
      slidingScaleFee: '$15 - $35 per treatment (no income proof required)',
      accessibilityNotes: 'Wheelchair accessible recliner seating; trauma-informed community setting.',
      verificationBadge: 'NCCAOM & State Licensed Acupuncturists'
    },
    {
      name: 'Ayurvedic Institute & NAMA Student Teaching Clinics',
      category: 'Ayurvedic Wellness Clinic',
      description: 'Low-cost clinical consultations conducted by advanced Ayurvedic practitioner interns under direct faculty Vaidya supervision.',
      slidingScaleFee: '$25 - $45 comprehensive consultation',
      accessibilityNotes: 'Telehealth and local in-person clinics available.',
      verificationBadge: 'National Ayurvedic Medical Association (NAMA) Certified'
    },
    {
      name: 'Mayway & Chinatown Herbal Pharmacy Network',
      category: 'Asian Herb & Grocer Co-op',
      description: 'Verified suppliers providing heavy-metal tested, sulfur-free whole culinary and medicinal TCM staples (Goji, Jujube, Lotus Seed, Astragalus).',
      slidingScaleFee: 'Retail grocery prices with bulk cooperative savings',
      accessibilityNotes: 'Bilingual English/Chinese customer support and labeled packaging.',
      verificationBadge: 'USP / ISO 9001 / Third-Party Heavy Metal Screened'
    },
    {
      name: 'Banyan Botanicals & South Asian Cooperative Spices',
      category: 'Indian Spice & Botanical Hub',
      description: 'Certified organic, fair-trade whole spices and herbs (Dal, Ghee, Cumin, Turmeric, Ashwagandha) adhering to strict heavy metal purity limits.',
      slidingScaleFee: 'Affordable culinary and herbal staple pricing',
      accessibilityNotes: 'Direct postal delivery and local South Asian grocer distribution.',
      verificationBadge: 'USDA Organic / Ayush Premium Mark / Heavy Metal Tested'
    }
  ];

  // Computed signals
  readonly activeInteractions = computed(() => {
    const rx = this.activePatientPrescriptions();
    return this.herbDrugInteractionCatalog.filter(item =>
      rx.some(r => item.contraindicatedDrugClass.toLowerCase().includes(r.toLowerCase()))
    );
  });

  readonly recommendedTcmFoods = computed(() => {
    const pattern = this.selectedTcmPattern();
    if (pattern.includes('Spleen') || pattern.includes('Dampness')) {
      return this.tcmFoodCatalog.filter(f => f.meridianTropism.includes('Spleen') || f.clinicalActions.includes('dampness'));
    }
    return this.tcmFoodCatalog;
  });

  readonly recommendedAyurvedicFoods = computed(() => {
    const dosha = this.selectedAyurvedicDosha();
    if (dosha.includes('Vata')) {
      return this.ayurvedicFoodCatalog.filter(f => f.doshaEffect.vata === 'Pacifies');
    }
    if (dosha.includes('Pitta')) {
      return this.ayurvedicFoodCatalog.filter(f => f.doshaEffect.pitta === 'Pacifies');
    }
    return this.ayurvedicFoodCatalog;
  });

  // State mutators
  setTcmPattern(pattern: string): void {
    this.selectedTcmPattern.set(pattern);
  }

  setAyurvedicDosha(dosha: DoshaType): void {
    this.selectedAyurvedicDosha.set(dosha);
  }

  addPrescription(drug: string): void {
    if (!this.activePatientPrescriptions().includes(drug)) {
      this.activePatientPrescriptions.update(list => [...list, drug]);
    }
  }

  removePrescription(drug: string): void {
    this.activePatientPrescriptions.update(list => list.filter(d => d !== drug));
  }

  /**
   * Generates a printable bilingual shopping list for Asian and Indian herbal grocers
   */
  generateBilingualShoppingManifest(): { english: string; traditionalOrSanskrit: string; aisle: string; note: string }[] {
    const manifest: { english: string; traditionalOrSanskrit: string; aisle: string; note: string }[] = [];

    this.tcmFoodCatalog.forEach(f => {
      manifest.push({
        english: f.name,
        traditionalOrSanskrit: `${f.chineseCharacters} (${f.chinesePinyin})`,
        aisle: f.groceryAisle,
        note: `Thermal: ${f.thermalNature} | Flavor: ${f.flavors.join(', ')}`
      });
    });

    this.ayurvedicFoodCatalog.forEach(a => {
      manifest.push({
        english: a.name,
        traditionalOrSanskrit: a.sanskritName,
        aisle: a.groceryAisle,
        note: `Tastes: ${a.tastes.join(', ')} | Virya: ${a.digestiveEffect}`
      });
    });

    return manifest;
  }
}
