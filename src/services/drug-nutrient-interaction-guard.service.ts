import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';

export type InteractionSeverity =
  | 'Contraindicated / Severe Hazard'
  | 'Major Precaution'
  | 'Moderate Caution'
  | 'Safe / Favorable Synergy';

export interface IDrugNutrientInteraction {
  id: string;
  medicationName: string;
  medicationClass: string;
  foodOrHerbTrigger: string;
  metabolicPathway: 'CYP3A4 Inhibition' | 'CYP2C9 Alteration' | 'P-glycoprotein (P-gp)' | 'Renal Potassium Sparing' | 'Vitamin K Coagulation' | 'Additive AMPK Hypoglycemia' | 'Absorption Chelation';
  severity: InteractionSeverity;
  clinicalImpactSummary: string;
  actionableClinicalProtocol: string;
  safeCulinaryAlternative: string;
}

@Injectable({
  providedIn: 'root'
})
export class DrugNutrientInteractionGuardService {
  private readonly patientState = inject(PatientStateService);

  readonly activeMedications = computed(() => {
    if (typeof this.patientState?.medications === 'function') {
      const meds = this.patientState.medications();
      if (Array.isArray(meds) && meds.length > 0) return meds.map((m: any) => typeof m === 'string' ? m : m.name || m.drugName);
    }
    // Default baseline clinical panel if no active patient medications specified
    return ['Atorvastatin 20mg', 'Lisinopril 10mg', 'Metformin 500mg'];
  });

  /**
   * Master Knowledge Base of Evidence-Grounded Drug-Nutrient & Herbal Interactions
   */
  readonly interactionCatalog: IDrugNutrientInteraction[] = [
    {
      id: 'inter-statin-grapefruit',
      medicationName: 'Atorvastatin / Simvastatin',
      medicationClass: 'HMG-CoA Reductase Inhibitor',
      foodOrHerbTrigger: 'Grapefruit, Seville Bitter Oranges & Bergamot',
      metabolicPathway: 'CYP3A4 Inhibition',
      severity: 'Contraindicated / Severe Hazard',
      clinicalImpactSummary: 'Furanocoumarins irreversibly inhibit intestinal CYP3A4 enzymes, raising systemic statin AUC by up to 300-500%, precipitating severe rhabdomyolysis and acute kidney injury.',
      actionableClinicalProtocol: 'Strictly avoid whole grapefruit juice and Seville orange marmalade. Space statin dosing to bedtime if consuming mild citrus.',
      safeCulinaryAlternative: 'Sweet Naval Oranges, Pixie Tangerines, Meyer Lemons, or Limes (which lack CYP3A4-inhibiting furanocoumarins).'
    },
    {
      id: 'inter-acei-high-potassium',
      medicationName: 'Lisinopril / Losartan',
      medicationClass: 'ACE Inhibitor / Angiotensin Receptor Blocker',
      foodOrHerbTrigger: 'Potassium Salt Substitutes, Excessive Coconut Water & Concentrated Avocados',
      metabolicPathway: 'Renal Potassium Sparing',
      severity: 'Major Precaution',
      clinicalImpactSummary: 'Inhibition of aldosterone synthesis combined with high dietary potassium intake can trigger acute hyperkalemia (> 5.5 mEq/L), cardiac dysrhythmias, and muscular paralysis in patients with mild renal impairment.',
      actionableClinicalProtocol: 'Check baseline serum potassium and eGFR before prescribing aggressive high-potassium mineral salts or consuming > 2 whole avocados daily.',
      safeCulinaryAlternative: 'Flavor with unrefined Celtic sea salt or Himalayan mineral salt, fresh lemon juice, garlic, and fresh rosemary instead of potassium chloride salt substitutes.'
    },
    {
      id: 'inter-warfarin-vitamin-k',
      medicationName: 'Warfarin (Coumadin)',
      medicationClass: 'Vitamin K Antagonist Anticoagulant',
      foodOrHerbTrigger: 'Irregular Spikes in Kale, Spinach, Swiss Chard & Natto',
      metabolicPathway: 'Vitamin K Coagulation',
      severity: 'Major Precaution',
      clinicalImpactSummary: 'Phylloquinone directly bypasses hepatic VKORC1 enzyme inhibition, plummeting INR below therapeutic target (INR < 2.0) and sharply escalating thromboembolic / stroke risk.',
      actionableClinicalProtocol: 'Do NOT eliminate leafy greens! Maintain a strict, consistent weekly baseline intake so anticoagulation dosing can be calibrated safely.',
      safeCulinaryAlternative: 'Consistent daily moderate servings (1/2 cup) of steamed greens; avoid sudden acute 5-day juice cleanses or raw natto ferments.'
    },
    {
      id: 'inter-metformin-berberine',
      medicationName: 'Metformin',
      medicationClass: 'Biguanide Insulin Sensitizer',
      foodOrHerbTrigger: 'High-Dose Berberine Extract & Bitter Melon (Charantin)',
      metabolicPathway: 'Additive AMPK Hypoglycemia',
      severity: 'Moderate Caution',
      clinicalImpactSummary: 'Dual simultaneous activation of hepatic 5’-AMP-activated protein kinase (AMPK) can drive synergistic blood glucose lowering, increasing the risk of symptomatic hypoglycemia (< 70 mg/dL) and gastrointestinal cramping.',
      actionableClinicalProtocol: 'Monitor real-time continuous glucose (CGM) telemetry closely when pairing botanical insulin sensitizers with metformin. Titrate botanicals under physician supervision.',
      safeCulinaryAlternative: 'Cinnamon bark infusion (Ceylon), apple cider vinegar prior to high-carbohydrate meals, or whole dietary fiber which gently blunts spikes without enzymatic competition.'
    },
    {
      id: 'inter-levothyroxine-calcium-soy',
      medicationName: 'Levothyroxine (Synthroid)',
      medicationClass: 'Synthetic Thyroid Hormone (T4)',
      foodOrHerbTrigger: 'Calcium-Fortified Dairy, Soy Isoflavones & Raw Walnuts',
      metabolicPathway: 'Absorption Chelation',
      severity: 'Major Precaution',
      clinicalImpactSummary: 'Divalent cations (calcium, iron) and soy isoflavones bind to oral levothyroxine in the jejunum, forming insoluble chelates that reduce systemic bioavailability by up to 50%, exacerbating hypothyroid symptoms.',
      actionableClinicalProtocol: 'Take levothyroxine on an empty stomach with a full glass of water at least 60 minutes before breakfast, or 4 hours after consuming calcium or soy.',
      safeCulinaryAlternative: 'Enjoy morning herbal teas (peppermint, chamomile) or black coffee 1 hour post-dose; schedule calcium-rich foods and walnuts for lunch or dinner.'
    },
    {
      id: 'inter-ssri-st-johns-wort',
      medicationName: 'Sertraline / Fluoxetine / Escitalopram',
      medicationClass: 'Selective Serotonin Reuptake Inhibitor (SSRI)',
      foodOrHerbTrigger: 'St. John’s Wort & High-Dose Fermented Tyramine',
      metabolicPathway: 'CYP3A4 Inhibition',
      severity: 'Contraindicated / Severe Hazard',
      clinicalImpactSummary: 'Hyperforin combined with SSRIs triggers excessive intrasynaptic serotonin accumulation, risking fatal Serotonin Syndrome (hyperthermia, clonus, autonomic instability). St. John’s Wort also induces CYP3A4, clearing other medications prematurely.',
      actionableClinicalProtocol: 'Strictly prohibit St. John’s Wort teas or extracts when taking prescription antidepressants.',
      safeCulinaryAlternative: 'Lemon balm (Melissa officinalis), saffron (Crocus sativus), or Holy Basil (Tulsi) teas, which modulate GABA without triggering serotonin toxicity.'
    }
  ];

  /**
   * Screen active medications against the knowledge base
   */
  readonly identifiedInteractions = computed(() => {
    const meds = this.activeMedications().map(m => m.toLowerCase());
    return this.interactionCatalog.filter(interaction => {
      const medName = interaction.medicationName.toLowerCase();
      const medClass = interaction.medicationClass.toLowerCase();
      return meds.some(m => medName.includes(m) || m.includes(medName.split('/')[0].trim()) || medClass.includes(m));
    });
  });

  readonly highestSeverity = computed(() => {
    const active = this.identifiedInteractions();
    if (active.some(i => i.severity === 'Contraindicated / Severe Hazard')) return 'Contraindicated / Severe Hazard';
    if (active.some(i => i.severity === 'Major Precaution')) return 'Major Precaution';
    if (active.some(i => i.severity === 'Moderate Caution')) return 'Moderate Caution';
    return 'Safe / Favorable Synergy';
  });
}
