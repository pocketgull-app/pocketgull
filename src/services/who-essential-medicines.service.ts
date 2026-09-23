import { Injectable } from '@angular/core';

export type WhoEmlCategory =
  | 'ANTIBIOTIC'
  | 'CARDIOVASCULAR'
  | 'ENDOCRINE_DIABETES'
  | 'RESPIRATORY'
  | 'ANALGESIC_ANTIINFLAMMATORY'
  | 'GASTROINTESTINAL_ORS'
  | 'MATERNAL_NEONATAL'
  | 'MENTAL_HEALTH'
  | 'ANTIMALARIAL_ANTIPARASITIC';

export interface IWhoEssentialMedicine {
  id: string;
  name: string;
  genericInn: string; // International Nonproprietary Name
  category: WhoEmlCategory;
  dosageForms: string[];
  atcCode: string;
  emlListingType: 'CORE' | 'COMPLEMENTARY';
  medianGlobalCostPerDoseUsd: number; // Median procurement cost per daily defined dose (DDD)
  standardRetailBenchmarkMonthlyCostUsd: number; // Standard Retail Benchmark / Typical uninsured cash price
  typicalUsMonopolyMonthlyCostUsd?: number; // Backwards-compatible alias for standardRetailBenchmarkMonthlyCostUsd
  savingsPercent: number; // Percentage savings when switching to global open generic
  openCompoundingMonograph: string; // USP / British Pharmacopoeia formulation guidance
  clinicalIndication: string;
  whoTargetTherapy: string;
  isPediatricFriendly: boolean;
}

export interface IWhoFormularySubstitution {
  searchedTerm: string;
  matchedMedicine: IWhoEssentialMedicine;
  originalMonthlyCostUsd: number;
  openGenericMonthlyCostUsd: number;
  monthlySavingsUsd: number;
  patientImpactNote: string;
}

export interface IWhoFormularyAuditResult {
  auditedCount: number;
  substitutions: IWhoFormularySubstitution[];
  estimatedRetailOutOfPocketTotalUsd: number; // Estimated Out-of-Pocket Total at standard retail benchmarks
  totalMonthlyMonopolyCostUsd: number; // Backwards-compatible alias for estimatedRetailOutOfPocketTotalUsd
  totalMonthlyEssentialCostUsd: number;
  netMonthlySavingsUsd: number;
  netAnnualSavingsUsd: number;
  universalAccessTier: 'UNIVERSALLY_FREE_OR_MICRO_COST (<$5/mo)' | 'HIGHLY_ACCESSIBLE (<$15/mo)' | 'NEEDS_COMMUNITY_SUBSIDY';
  clinicalSummary: string;
}

/**
 * 25 Canonical Essential Medicines from the WHO Model List of Essential Medicines (EML 23rd Edition).
 * Grounded in global health literature, showing how standard-of-care disease management
 * costs pennies per dose when open generic procurement and local compounding are enabled.
 */
export const WHO_ESSENTIAL_MEDICINES_CATALOG: IWhoEssentialMedicine[] = [
  // 1. Anti-Infectives & Antibiotics
  {
    id: 'who-eml-amoxicillin',
    name: 'Amoxicillin',
    genericInn: 'Amoxicillinum',
    category: 'ANTIBIOTIC',
    dosageForms: ['250 mg capsule', '500 mg capsule', '125 mg/5 mL dispersible oral suspension'],
    atcCode: 'J01CA04',
    emlListingType: 'CORE',
    medianGlobalCostPerDoseUsd: 0.03,
    standardRetailBenchmarkMonthlyCostUsd: 38.00,
    savingsPercent: 95.3,
    openCompoundingMonograph: 'USP/BP Monograph: Amoxicillin trihydrate micronized API in lactose or cellulose vehicle. Formulated as dispersible tablets for pediatric stability. Store <25°C dry.',
    clinicalIndication: 'Community-acquired pneumonia, otitis media, acute bacterial sinusitis, streptococcal pharyngitis.',
    whoTargetTherapy: 'First-line Access group antibiotic per WHO AWaRe classification.',
    isPediatricFriendly: true
  },
  {
    id: 'who-eml-artemether-lumefantrine',
    name: 'Artemether + Lumefantrine (Coartem)',
    genericInn: 'Artemetherum et lumefantrinum',
    category: 'ANTIMALARIAL_ANTIPARASITIC',
    dosageForms: ['20 mg / 120 mg fixed-dose dispersible tablet'],
    atcCode: 'P01BF01',
    emlListingType: 'CORE',
    medianGlobalCostPerDoseUsd: 0.08,
    standardRetailBenchmarkMonthlyCostUsd: 120.00,
    savingsPercent: 98.0,
    openCompoundingMonograph: 'WHO Technical Report Series 957: Artemether + Lumefantrine solid dispersion tablet formulation with polysorbate-80 to ensure lumefantrine bioavailability. Administer with fatty food or milk.',
    clinicalIndication: 'Uncomplicated Plasmodium falciparum malaria.',
    whoTargetTherapy: 'First-line Artemisinin-based Combination Therapy (ACT). Complete 3-day 6-dose curative regimen.',
    isPediatricFriendly: true
  },
  {
    id: 'who-eml-doxycycline',
    name: 'Doxycycline',
    genericInn: 'Doxycyclinum',
    category: 'ANTIBIOTIC',
    dosageForms: ['100 mg capsule / tablet'],
    atcCode: 'J01AA02',
    emlListingType: 'CORE',
    medianGlobalCostPerDoseUsd: 0.04,
    standardRetailBenchmarkMonthlyCostUsd: 65.00,
    savingsPercent: 96.3,
    openCompoundingMonograph: 'USP Monograph: Doxycycline hyclate or monohydrate. Rapid dissolution in standard gelatin capsules. Protect from light.',
    clinicalIndication: 'Atypical pneumonia, Lyme disease (Borrelia burgdorferi), malaria prophylaxis, pelvic inflammatory disease.',
    whoTargetTherapy: 'WHO AWaRe Access/Watch broad-spectrum tetracycline.',
    isPediatricFriendly: false
  },
  {
    id: 'who-eml-ceftriaxone',
    name: 'Ceftriaxone',
    genericInn: 'Ceftriaxonum',
    category: 'ANTIBIOTIC',
    dosageForms: ['500 mg powder for injection', '1 g vial'],
    atcCode: 'J01DD04',
    emlListingType: 'CORE',
    medianGlobalCostPerDoseUsd: 0.28,
    standardRetailBenchmarkMonthlyCostUsd: 180.00,
    savingsPercent: 95.3,
    openCompoundingMonograph: 'USP Monograph: Ceftriaxone sodium sterile crystalline powder. Reconstitute with 1% lidocaine for intramuscular or sterile water for IV infusion.',
    clinicalIndication: 'Severe bacterial sepsis, gonococcal infections, pyelonephritis, hospital-acquired bacteremia.',
    whoTargetTherapy: 'WHO AWaRe Watch tier parenterally administered 3rd generation cephalosporin.',
    isPediatricFriendly: true
  },

  // 2. Endocrine & Diabetes
  {
    id: 'who-eml-metformin',
    name: 'Metformin HCl',
    genericInn: 'Metformini hydrochloridum',
    category: 'ENDOCRINE_DIABETES',
    dosageForms: ['500 mg tablet', '850 mg tablet', '1000 mg tablet'],
    atcCode: 'A10BA02',
    emlListingType: 'CORE',
    medianGlobalCostPerDoseUsd: 0.02,
    standardRetailBenchmarkMonthlyCostUsd: 45.00,
    savingsPercent: 97.3,
    openCompoundingMonograph: 'USP/BP: Metformin hydrochloride compressed tablets with povidone and magnesium stearate excipient matrix. Negligible manufacturing margin.',
    clinicalIndication: 'Type 2 Diabetes Mellitus, insulin resistance, metabolic syndrome.',
    whoTargetTherapy: 'WHO HEARTS First-line Biguanide oral hypoglycemic agent with proven cardiovascular mortality deceleration.',
    isPediatricFriendly: false
  },
  {
    id: 'who-eml-insulin-human-regular',
    name: 'Human Regular Insulin (Short-Acting)',
    genericInn: 'Insulinum humanum',
    category: 'ENDOCRINE_DIABETES',
    dosageForms: ['100 IU/mL vial (10 mL)'],
    atcCode: 'A10AB01',
    emlListingType: 'CORE',
    medianGlobalCostPerDoseUsd: 0.15,
    standardRetailBenchmarkMonthlyCostUsd: 285.00,
    savingsPercent: 94.7,
    openCompoundingMonograph: 'Recombinant human insulin synthesized in E. coli or Pichia pastoris. Buffered with m-cresol, glycerol, and zinc chloride at pH 7.2-7.8. Open Insulin Foundation open-source biomanufacturing target.',
    clinicalIndication: 'Type 1 Diabetes Mellitus, severe hyperglycemic crisis, gestational diabetes.',
    whoTargetTherapy: 'WHO Essential Biologic: Life-sustaining hormone that must be globally priced at marginal cost of production (<$3/vial).',
    isPediatricFriendly: true
  },
  {
    id: 'who-eml-levothyroxine',
    name: 'Levothyroxine Sodium',
    genericInn: 'Levothyroxinum natricum',
    category: 'ENDOCRINE_DIABETES',
    dosageForms: ['25 mcg tablet', '50 mcg tablet', '100 mcg tablet'],
    atcCode: 'H03AA01',
    emlListingType: 'CORE',
    medianGlobalCostPerDoseUsd: 0.03,
    standardRetailBenchmarkMonthlyCostUsd: 36.00,
    savingsPercent: 95.0,
    openCompoundingMonograph: 'USP Monograph: Synthetic T4 crystalline powder. Homogeneous geometric dilution in calcium phosphate/cellulose base. Maintain airtight desiccated container.',
    clinicalIndication: 'Primary and secondary hypothyroidism, Hashimoto thyroiditis.',
    whoTargetTherapy: 'Essential endocrine replacement for normal neurocognitive and metabolic vitality.',
    isPediatricFriendly: true
  },

  // 3. Cardiovascular & Cardiometabolic (WHO HEARTS)
  {
    id: 'who-eml-amlodipine',
    name: 'Amlodipine Besylate',
    genericInn: 'Amlodipinum',
    category: 'CARDIOVASCULAR',
    dosageForms: ['5 mg tablet', '10 mg tablet'],
    atcCode: 'C08CA01',
    emlListingType: 'CORE',
    medianGlobalCostPerDoseUsd: 0.02,
    standardRetailBenchmarkMonthlyCostUsd: 42.00,
    savingsPercent: 97.1,
    openCompoundingMonograph: 'USP: Amlodipine besylate direct compression tableting with microcrystalline cellulose and sodium starch glycolate.',
    clinicalIndication: 'Essential hypertension, chronic stable angina.',
    whoTargetTherapy: 'WHO HEARTS First-line Dihydropyridine calcium channel blocker (long half-life, once-daily dosing).',
    isPediatricFriendly: false
  },
  {
    id: 'who-eml-lisinopril',
    name: 'Lisinopril',
    genericInn: 'Lisinoprilum',
    category: 'CARDIOVASCULAR',
    dosageForms: ['5 mg tablet', '10 mg tablet', '20 mg tablet'],
    atcCode: 'C09AA03',
    emlListingType: 'CORE',
    medianGlobalCostPerDoseUsd: 0.03,
    standardRetailBenchmarkMonthlyCostUsd: 40.00,
    savingsPercent: 95.5,
    openCompoundingMonograph: 'USP: Lisinopril dihydrate tableting with anhydrous lactose and starch. Hydrophilic, zero hepatic activation required.',
    clinicalIndication: 'Hypertension, heart failure with reduced ejection fraction, diabetic nephropathy renal protection.',
    whoTargetTherapy: 'WHO HEARTS Preferred ACE inhibitor for cardiorenal risk deceleration.',
    isPediatricFriendly: false
  },
  {
    id: 'who-eml-atorvastatin',
    name: 'Atorvastatin',
    genericInn: 'Atorvastatinum',
    category: 'CARDIOVASCULAR',
    dosageForms: ['10 mg tablet', '20 mg tablet', '40 mg tablet'],
    atcCode: 'C10AA05',
    emlListingType: 'CORE',
    medianGlobalCostPerDoseUsd: 0.04,
    standardRetailBenchmarkMonthlyCostUsd: 65.00,
    savingsPercent: 96.3,
    openCompoundingMonograph: 'USP: Atorvastatin calcium trihydrate stabilized with calcium carbonate to prevent lactone degradation.',
    clinicalIndication: 'Primary and secondary atherosclerotic cardiovascular disease prevention, hypercholesterolemia.',
    whoTargetTherapy: 'WHO HEARTS Core HMG-CoA reductase inhibitor for global stroke and myocardial infarction risk reduction.',
    isPediatricFriendly: false
  },
  {
    id: 'who-eml-hydrochlorothiazide',
    name: 'Hydrochlorothiazide (HCTZ)',
    genericInn: 'Hydrochlorothiazidum',
    category: 'CARDIOVASCULAR',
    dosageForms: ['12.5 mg tablet', '25 mg tablet'],
    atcCode: 'C03AA03',
    emlListingType: 'CORE',
    medianGlobalCostPerDoseUsd: 0.015,
    standardRetailBenchmarkMonthlyCostUsd: 30.00,
    savingsPercent: 98.5,
    openCompoundingMonograph: 'USP: Hydrochlorothiazide standard tableting. Thiazide diuretic with 60+ years of safety and RCT mortality data.',
    clinicalIndication: 'Hypertension, mild volume overload.',
    whoTargetTherapy: 'WHO HEARTS First-line combination partner with ACE-i/ARB or CCB.',
    isPediatricFriendly: false
  },

  // 4. Respiratory
  {
    id: 'who-eml-salbutamol',
    name: 'Salbutamol Inhaler (Albuterol)',
    genericInn: 'Salbutanolum',
    category: 'RESPIRATORY',
    dosageForms: ['100 mcg/dose pressurized metered-dose inhaler (200 actuations)'],
    atcCode: 'R03AC02',
    emlListingType: 'CORE',
    medianGlobalCostPerDoseUsd: 0.02,
    standardRetailBenchmarkMonthlyCostUsd: 74.00,
    savingsPercent: 94.6,
    openCompoundingMonograph: 'Salbutamol sulfate micronized powder suspended in HFA-134a propellant with oleic acid surfactant. Canister cost <$1.80 globally.',
    clinicalIndication: 'Acute bronchospasm, asthma exacerbation, exercise-induced asthma, COPD.',
    whoTargetTherapy: 'WHO Essential Rescue Bronchodilator. Short-Acting Beta-2 Agonist (SABA).',
    isPediatricFriendly: true
  },
  {
    id: 'who-eml-budesonide',
    name: 'Budesonide Inhaler',
    genericInn: 'Budesonidum',
    category: 'RESPIRATORY',
    dosageForms: ['100 mcg / 200 mcg per actuation metered dose inhaler / dry powder'],
    atcCode: 'R03BA02',
    emlListingType: 'CORE',
    medianGlobalCostPerDoseUsd: 0.05,
    standardRetailBenchmarkMonthlyCostUsd: 110.00,
    savingsPercent: 95.5,
    openCompoundingMonograph: 'Budesonide micronized particles in HFA propellant or lactose dry powder inhaler carrier. High first-pass hepatic metabolism minimizes systemic glucocorticoid exposure.',
    clinicalIndication: 'Persistent asthma controller therapy, severe COPD, croup (nebulized).',
    whoTargetTherapy: 'First-line Inhaled Corticosteroid (ICS) for airway inflammation suppression.',
    isPediatricFriendly: true
  },

  // 5. Gastrointestinal, Dehydration & Diarrhea
  {
    id: 'who-eml-ors',
    name: 'Oral Rehydration Salts (WHO Reduced Osmolarity Formula)',
    genericInn: 'Sales ad rehydratationem peroralem',
    category: 'GASTROINTESTINAL_ORS',
    dosageForms: ['20.5 g sachet for 1 liter of clean water'],
    atcCode: 'A07CA',
    emlListingType: 'CORE',
    medianGlobalCostPerDoseUsd: 0.06,
    standardRetailBenchmarkMonthlyCostUsd: 28.00,
    savingsPercent: 97.9,
    openCompoundingMonograph: 'WHO/UNICEF Standard Reduced Osmolarity Formula (Total Osmolarity: 245 mOsm/L): Sodium Chloride 2.6g, Anhydrous Glucose 13.5g, Potassium Chloride 1.5g, Trisodium Citrate Dihydrate 2.9g. Dissolve completely in 1000 mL boiled or potable water.',
    clinicalIndication: 'Dehydration secondary to acute diarrheal diseases, cholera, viral gastroenteritis, heat exhaustion.',
    whoTargetTherapy: 'Most significant medical breakthrough of the 20th century. Prevents >95% of dehydration deaths with zero IV equipment.',
    isPediatricFriendly: true
  },
  {
    id: 'who-eml-zinc-sulfate',
    name: 'Zinc Sulfate (Dispersible Pediatric)',
    genericInn: 'Zinci sulfas',
    category: 'GASTROINTESTINAL_ORS',
    dosageForms: ['20 mg dispersible tablet'],
    atcCode: 'A12CB01',
    emlListingType: 'CORE',
    medianGlobalCostPerDoseUsd: 0.02,
    standardRetailBenchmarkMonthlyCostUsd: 22.00,
    savingsPercent: 97.3,
    openCompoundingMonograph: 'USP: Zinc sulfate monohydrate or heptahydrate formulated with effervescent/dispersible disintegrants. Dissolves in 5 mL breastmilk or clean water in <60 seconds.',
    clinicalIndication: 'Pediatric acute diarrhea adjunctive therapy (reduces duration by 25% and recurrence for 3 months).',
    whoTargetTherapy: 'WHO Co-packaged with ORS: 20 mg/day for 14 days (10 mg/day if infant < 6 months).',
    isPediatricFriendly: true
  },
  {
    id: 'who-eml-omeprazole',
    name: 'Omeprazole',
    genericInn: 'Omeprazolum',
    category: 'GASTROINTESTINAL_ORS',
    dosageForms: ['20 mg delayed-release capsule / tablet'],
    atcCode: 'A02BC01',
    emlListingType: 'CORE',
    medianGlobalCostPerDoseUsd: 0.03,
    standardRetailBenchmarkMonthlyCostUsd: 38.00,
    savingsPercent: 95.3,
    openCompoundingMonograph: 'USP: Enteric-coated pellets in hard gelatin capsule to protect acid-labile proton pump inhibitor API from gastric degradation.',
    clinicalIndication: 'Gastroesophageal reflux disease (GERD), peptic ulcer disease, NSAID gastro-protection.',
    whoTargetTherapy: 'Core gastric acid suppressor on WHO EML.',
    isPediatricFriendly: false
  },

  // 6. Analgesics, Antipyretics & Anti-Inflammatory
  {
    id: 'who-eml-paracetamol',
    name: 'Paracetamol (Acetaminophen)',
    genericInn: 'Paracetamolum',
    category: 'ANALGESIC_ANTIINFLAMMATORY',
    dosageForms: ['500 mg tablet', '120 mg/5 mL oral syrup', '100 mg suppository'],
    atcCode: 'N02BE01',
    emlListingType: 'CORE',
    medianGlobalCostPerDoseUsd: 0.01,
    standardRetailBenchmarkMonthlyCostUsd: 15.00,
    savingsPercent: 96.7,
    openCompoundingMonograph: 'USP/BP: Acetaminophen direct compression tableting with pregelatinized starch. Liquid formulated with sorbitol vehicle.',
    clinicalIndication: 'Mild-to-moderate pain, febrile illness, headache, post-vaccination fever.',
    whoTargetTherapy: 'WHO Step 1 Pain Ladder analgesic with minimal gastrointestinal toxicity.',
    isPediatricFriendly: true
  },
  {
    id: 'who-eml-ibuprofen',
    name: 'Ibuprofen',
    genericInn: 'Ibuprofenum',
    category: 'ANALGESIC_ANTIINFLAMMATORY',
    dosageForms: ['200 mg tablet', '400 mg tablet', '100 mg/5 mL oral suspension'],
    atcCode: 'M01AE01',
    emlListingType: 'CORE',
    medianGlobalCostPerDoseUsd: 0.02,
    standardRetailBenchmarkMonthlyCostUsd: 22.00,
    savingsPercent: 94.5,
    openCompoundingMonograph: 'USP: Ibuprofen racemic crystalline powder with microcrystalline cellulose. Non-selective cyclooxygenase (COX-1/COX-2) inhibitor.',
    clinicalIndication: 'Musculoskeletal inflammatory pain, juvenile idiopathic arthritis, dysmenorrhea, tension headache.',
    whoTargetTherapy: 'WHO Step 1 Non-steroidal anti-inflammatory drug (NSAID).',
    isPediatricFriendly: true
  },
  {
    id: 'who-eml-dexamethasone',
    name: 'Dexamethasone',
    genericInn: 'Dexamethasonum',
    category: 'ANALGESIC_ANTIINFLAMMATORY',
    dosageForms: ['0.5 mg tablet', '2 mg tablet', '4 mg/mL injection'],
    atcCode: 'H02AB02',
    emlListingType: 'CORE',
    medianGlobalCostPerDoseUsd: 0.03,
    standardRetailBenchmarkMonthlyCostUsd: 48.00,
    savingsPercent: 96.3,
    openCompoundingMonograph: 'USP: Dexamethasone base or sodium phosphate. Long-acting potent systemic glucocorticoid with zero mineralocorticoid salt-retaining effect.',
    clinicalIndication: 'Acute pediatric croup, severe asthma/COPD exacerbations, COVID-19/ARDS respiratory support, bacterial meningitis adjunctive therapy.',
    whoTargetTherapy: 'Core life-saving steroid in the WHO RECOVERY trial (reduced COVID-19 mortality by 1/3 in ventilated patients).',
    isPediatricFriendly: true
  },

  // 7. Maternal, Neonatal & Reproductive Health
  {
    id: 'who-eml-oxytocin',
    name: 'Oxytocin',
    genericInn: 'Oxytocinum',
    category: 'MATERNAL_NEONATAL',
    dosageForms: ['10 IU in 1 mL ampoule for injection'],
    atcCode: 'H01BB02',
    emlListingType: 'CORE',
    medianGlobalCostPerDoseUsd: 0.22,
    standardRetailBenchmarkMonthlyCostUsd: 95.00,
    savingsPercent: 97.7,
    openCompoundingMonograph: 'Synthetic nonapeptide cyclic peptide identical to human neurohypophyseal hormone. Buffered at pH 3.0-5.0 with sodium chloride. Store refrigerated 2-8°C or use heat-stable formulations.',
    clinicalIndication: 'Postpartum hemorrhage (PPH) prevention and active management of third stage of labor.',
    whoTargetTherapy: 'Gold standard WHO intervention for reducing the #1 cause of maternal mortality worldwide.',
    isPediatricFriendly: false
  },
  {
    id: 'who-eml-misoprostol',
    name: 'Misoprostol',
    genericInn: 'Misoprostolum',
    category: 'MATERNAL_NEONATAL',
    dosageForms: ['200 mcg tablet (blister packed)'],
    atcCode: 'G02AD06',
    emlListingType: 'CORE',
    medianGlobalCostPerDoseUsd: 0.09,
    standardRetailBenchmarkMonthlyCostUsd: 65.00,
    savingsPercent: 97.2,
    openCompoundingMonograph: 'Synthetic prostaglandin E1 (PGE1) analog. Extremely hygroscopic; must be packaged in double-aluminum blister foils. Room temperature shelf-stable.',
    clinicalIndication: 'Postpartum hemorrhage prevention where oxytocin cold-chain is unavailable; cervical ripening; incomplete miscarriage management.',
    whoTargetTherapy: 'Essential community and austere field uterotonic where refrigeration does not exist.',
    isPediatricFriendly: false
  },
  {
    id: 'who-eml-magnesium-sulfate',
    name: 'Magnesium Sulfate',
    genericInn: 'Magnesii sulfas',
    category: 'MATERNAL_NEONATAL',
    dosageForms: ['500 mg/mL (50%) in 20 mL ampoule'],
    atcCode: 'B05CX02',
    emlListingType: 'CORE',
    medianGlobalCostPerDoseUsd: 0.35,
    standardRetailBenchmarkMonthlyCostUsd: 140.00,
    savingsPercent: 97.5,
    openCompoundingMonograph: 'USP: Magnesium sulfate heptahydrate sterile pyrogen-free aqueous solution. Pristine inorganic salt solution.',
    clinicalIndication: 'Pre-eclampsia and eclampsia seizure prophylaxis; neuroprotection in imminent preterm birth (<32 weeks).',
    whoTargetTherapy: 'WHO Pritchard or Zuspan regimen: proven superior to phenytoin and diazepam for maternal convulsion prevention.',
    isPediatricFriendly: false
  },
  {
    id: 'who-eml-iron-folate',
    name: 'Ferrous Sulfate + Folic Acid',
    genericInn: 'Ferrosi sulfas et acidum folicum',
    category: 'MATERNAL_NEONATAL',
    dosageForms: ['60 mg elemental iron + 400 mcg folic acid tablet'],
    atcCode: 'B03AA07',
    emlListingType: 'CORE',
    medianGlobalCostPerDoseUsd: 0.015,
    standardRetailBenchmarkMonthlyCostUsd: 18.00,
    savingsPercent: 97.5,
    openCompoundingMonograph: 'Dried ferrous sulfate (yielding 60 mg elemental Fe) and pharmaceutical grade folic acid in film-coated tablet to mask metallic taste and protect from oxidation.',
    clinicalIndication: 'Nutritional iron-deficiency anemia in pregnancy and lactation; neural tube defect prevention.',
    whoTargetTherapy: 'Universal antenatal supplementation standard across all global low- and middle-income health systems.',
    isPediatricFriendly: false
  },

  // 8. Mental Health & CNS
  {
    id: 'who-eml-fluoxetine',
    name: 'Fluoxetine',
    genericInn: 'Fluoxetinum',
    category: 'MENTAL_HEALTH',
    dosageForms: ['20 mg capsule / dispersible tablet'],
    atcCode: 'N06AB03',
    emlListingType: 'CORE',
    medianGlobalCostPerDoseUsd: 0.03,
    standardRetailBenchmarkMonthlyCostUsd: 55.00,
    savingsPercent: 96.7,
    openCompoundingMonograph: 'USP: Fluoxetine hydrochloride powder in gelatin capsule or dispersible tablet base. Long elimination half-life (active metabolite norfluoxetine 7-14 days) eliminates withdrawal crashes.',
    clinicalIndication: 'Major depressive disorder, generalized anxiety, panic disorder, obsessive-compulsive disorder.',
    whoTargetTherapy: 'WHO mhGAP First-line Selective Serotonin Reuptake Inhibitor (SSRI).',
    isPediatricFriendly: true
  }
];

// Backward-compatibility mapping for existing callers
WHO_ESSENTIAL_MEDICINES_CATALOG.forEach(m => {
  m.typicalUsMonopolyMonthlyCostUsd = m.standardRetailBenchmarkMonthlyCostUsd;
});

@Injectable({
  providedIn: 'root'
})
export class WhoEssentialMedicinesService {
  /**
   * Retrieves all WHO Essential Medicines.
   */
  getAllEssentialMedicines(): IWhoEssentialMedicine[] {
    return WHO_ESSENTIAL_MEDICINES_CATALOG;
  }

  /**
   * Filters the WHO EML by therapeutic clinical category.
   */
  getByCategory(category: WhoEmlCategory): IWhoEssentialMedicine[] {
    return WHO_ESSENTIAL_MEDICINES_CATALOG.filter(m => m.category === category);
  }

  /**
   * Searches for a medication by name, brand equivalent, ATC code, or indication.
   */
  searchMedicines(query: string): IWhoEssentialMedicine[] {
    const q = query.trim().toLowerCase();
    if (!q) return WHO_ESSENTIAL_MEDICINES_CATALOG;

    return WHO_ESSENTIAL_MEDICINES_CATALOG.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.genericInn.toLowerCase().includes(q) ||
      m.atcCode.toLowerCase().includes(q) ||
      m.clinicalIndication.toLowerCase().includes(q) ||
      m.whoTargetTherapy.toLowerCase().includes(q)
    );
  }

  /**
   * Audits a patient's current prescription list or proposed regimen.
   * Identifies WHO Essential Medicines alternatives, computes actual global procurement
   * costs (<$0.05/dose), and demonstrates how universal coverage costs pennies per month.
   */
  auditPrescriptionRegimen(medications: string[]): IWhoFormularyAuditResult {
    const substitutions: IWhoFormularySubstitution[] = [];
    let totalMonopolyCost = 0;
    let totalEssentialCost = 0;

    for (const medStr of medications) {
      const lower = medStr.toLowerCase();
      let matched: IWhoEssentialMedicine | null = null;

      // Match against catalog by name or common brand names
      if (lower.includes('amox') || lower.includes('augmentin') || lower.includes('penicillin')) {
        matched = this.getById('who-eml-amoxicillin');
      } else if (lower.includes('malaria') || lower.includes('coartem') || lower.includes('artemether')) {
        matched = this.getById('who-eml-artemether-lumefantrine');
      } else if (lower.includes('doxy') || lower.includes('vibramycin')) {
        matched = this.getById('who-eml-doxycycline');
      } else if (lower.includes('ceftriaxone') || lower.includes('rocephin')) {
        matched = this.getById('who-eml-ceftriaxone');
      } else if (lower.includes('metformin') || lower.includes('glucophage') || lower.includes('berberine')) {
        matched = this.getById('who-eml-metformin');
      } else if (lower.includes('insulin') || lower.includes('humulin') || lower.includes('novolin')) {
        matched = this.getById('who-eml-insulin-human-regular');
      } else if (lower.includes('levothyroxine') || lower.includes('synthroid') || lower.includes('tirosint')) {
        matched = this.getById('who-eml-levothyroxine');
      } else if (lower.includes('amlodipine') || lower.includes('norvasc') || lower.includes('calcium channel')) {
        matched = this.getById('who-eml-amlodipine');
      } else if (lower.includes('lisinopril') || lower.includes('zestril') || lower.includes('prinivil') || lower.includes('ace-i')) {
        matched = this.getById('who-eml-lisinopril');
      } else if (lower.includes('atorvastatin') || lower.includes('lipitor') || lower.includes('statin')) {
        matched = this.getById('who-eml-atorvastatin');
      } else if (lower.includes('hctz') || lower.includes('hydrochlorothiazide') || lower.includes('microzide')) {
        matched = this.getById('who-eml-hydrochlorothiazide');
      } else if (lower.includes('salbutamol') || lower.includes('albuterol') || lower.includes('proair') || lower.includes('ventolin')) {
        matched = this.getById('who-eml-salbutamol');
      } else if (lower.includes('budesonide') || lower.includes('pulmicort') || lower.includes('flovent')) {
        matched = this.getById('who-eml-budesonide');
      } else if (lower.includes('ors') || lower.includes('rehydration') || lower.includes('pedialyte') || lower.includes('gastrolyte')) {
        matched = this.getById('who-eml-ors');
      } else if (lower.includes('zinc') || lower.includes('zinc sulfate')) {
        matched = this.getById('who-eml-zinc-sulfate');
      } else if (lower.includes('omeprazole') || lower.includes('prilosec') || lower.includes('nexium')) {
        matched = this.getById('who-eml-omeprazole');
      } else if (lower.includes('paracetamol') || lower.includes('tylenol') || lower.includes('acetaminophen')) {
        matched = this.getById('who-eml-paracetamol');
      } else if (lower.includes('ibuprofen') || lower.includes('advil') || lower.includes('motrin')) {
        matched = this.getById('who-eml-ibuprofen');
      } else if (lower.includes('dexamethasone') || lower.includes('decadron') || lower.includes('prednisone')) {
        matched = this.getById('who-eml-dexamethasone');
      } else if (lower.includes('fluoxetine') || lower.includes('prozac') || lower.includes('lexapro') || lower.includes('zoloft') || lower.includes('sertraline')) {
        matched = this.getById('who-eml-fluoxetine');
      } else if (lower.includes('iron') || lower.includes('ferrous') || lower.includes('folic')) {
        matched = this.getById('who-eml-iron-folate');
      }

      if (matched) {
        const originalCost = matched.standardRetailBenchmarkMonthlyCostUsd || matched.typicalUsMonopolyMonthlyCostUsd || 0;
        // 30 days * daily dose
        const genericMonthly = Math.round(matched.medianGlobalCostPerDoseUsd * 30 * 100) / 100;
        const savings = Math.max(0, Math.round((originalCost - genericMonthly) * 100) / 100);

        totalMonopolyCost += originalCost;
        totalEssentialCost += genericMonthly;

        substitutions.push({
          searchedTerm: medStr,
          matchedMedicine: matched,
          originalMonthlyCostUsd: originalCost,
          openGenericMonthlyCostUsd: genericMonthly,
          monthlySavingsUsd: savings,
          patientImpactNote: `Switching from standard retail cash prices to WHO open generic ${matched.name} saves $${savings.toFixed(2)}/mo (${matched.savingsPercent}% reduction).`
        });
      }
    }

    const netSavings = Math.max(0, Math.round((totalMonopolyCost - totalEssentialCost) * 100) / 100);
    const annualSavings = Math.round(netSavings * 12 * 100) / 100;

    let tier: IWhoFormularyAuditResult['universalAccessTier'] = 'UNIVERSALLY_FREE_OR_MICRO_COST (<$5/mo)';
    if (totalEssentialCost > 15) {
      tier = 'NEEDS_COMMUNITY_SUBSIDY';
    } else if (totalEssentialCost > 5) {
      tier = 'HIGHLY_ACCESSIBLE (<$15/mo)';
    }

    return {
      auditedCount: substitutions.length,
      substitutions,
      estimatedRetailOutOfPocketTotalUsd: totalMonopolyCost,
      totalMonthlyMonopolyCostUsd: totalMonopolyCost,
      totalMonthlyEssentialCostUsd: totalEssentialCost,
      netMonthlySavingsUsd: netSavings,
      netAnnualSavingsUsd: annualSavings,
      universalAccessTier: tier,
      clinicalSummary: `Audit of ${substitutions.length} mapped therapies reveals an Estimated Out-of-Pocket Total of $${totalMonopolyCost.toFixed(2)}/month at standard retail benchmarks. Utilizing WHO Model List of Essential Medicines open generics reduces total monthly cost to $${totalEssentialCost.toFixed(2)}/month, unlocking $${annualSavings.toFixed(2)} in annual household financial toxicity relief.`
    };
  }

  private getById(id: string): IWhoEssentialMedicine | null {
    return WHO_ESSENTIAL_MEDICINES_CATALOG.find(m => m.id === id) || null;
  }
}
