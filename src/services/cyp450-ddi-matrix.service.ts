import { Injectable, signal, computed } from '@angular/core';

export type CypIsoform = 'CYP3A4' | 'CYP2D6' | 'CYP2C9' | 'CYP2C19' | 'CYP1A2';
export type InhibitionMechanism = 'Competitive Reversible' | 'Mechanism-Based Inactivation (MBI)';

export interface IVictimDrug {
  name: string;
  primaryIsoform: CypIsoform;
  fractionMetabolizedFm: number; // 0.0 to 1.0 (fraction of total clearance via this CYP)
  isProdrugRequiringBioactivation: boolean;
  standardDoseMg: number;
  therapeuticWindow: 'Narrow (Critical Toxicity)' | 'Moderate' | 'Wide';
  toxicityConsequences: string;
}

export interface IPerpetratorDrug {
  name: string;
  targetIsoform: CypIsoform;
  inhibitionType: 'Competitive Reversible' | 'Mechanism-Based Inactivation (MBI)';
  unboundConcentrationUm: number; // [I] in μM
  inhibitionConstantKiUm: number; // Ki in μM
  inactivationRateKinactHr?: number; // kinact in h^-1 (for MBI)
  inactivationConstantKiUm?: number; // KI in μM (for MBI)
  standardDoseMg: number;
}

export interface IDdiAssessment {
  victim: IVictimDrug;
  perpetrator: IPerpetratorDrug;
  aucRatio: number; // Fold change in victim drug exposure (or active metabolite if prodrug)
  interactionSeverity: 'Contraindicated / Severe Hazard' | 'Major Interaction' | 'Moderate Interaction' | 'Minor / Insignificant';
  mechanismDescription: string;
  clinicalActionProtocol: string;
  recommendedDoseAdjustment: string;
  ismpValidatedDosageText: string;
}

export type DdiPresetMode =
  | 'simvastatin_clarithromycin'
  | 'warfarin_amiodarone'
  | 'clopidogrel_omeprazole'
  | 'metoprolol_fluoxetine'
  | 'theophylline_ciprofloxacin'
  | 'atorvastatin_amlodipine';

@Injectable({
  providedIn: 'root'
})
export class Cyp450DdiMatrixService {
  readonly activePreset = signal<DdiPresetMode>('simvastatin_clarithromycin');

  readonly victimInput = signal<IVictimDrug>({
    name: 'Simvastatin',
    primaryIsoform: 'CYP3A4',
    fractionMetabolizedFm: 0.88,
    isProdrugRequiringBioactivation: false,
    standardDoseMg: 40,
    therapeuticWindow: 'Moderate',
    toxicityConsequences: 'Severe rhabdomyolysis, myoglobinuric acute renal failure, CPK > 10,000 U/L'
  });

  readonly perpetratorInput = signal<IPerpetratorDrug>({
    name: 'Clarithromycin',
    targetIsoform: 'CYP3A4',
    inhibitionType: 'Mechanism-Based Inactivation (MBI)',
    unboundConcentrationUm: 2.4, // [I] in μM
    inhibitionConstantKiUm: 0.25, // Ki in μM
    inactivationRateKinactHr: 0.082, // kinact (h^-1)
    inactivationConstantKiUm: 1.5, // KI (μM)
    standardDoseMg: 500
  });

  /**
   * Evaluates the dynamic Area Under the Curve Ratio (AUCR)
   * using FDA / Rowan pharmacokinetic guidance.
   */
  readonly ddiAssessment = computed<IDdiAssessment>(() => {
    const victim = this.victimInput();
    const perp = this.perpetratorInput();

    const fm = Math.min(1.0, Math.max(0.0, victim.fractionMetabolizedFm));
    const I = Math.max(0.0, perp.unboundConcentrationUm);
    const Ki = Math.max(0.001, perp.inhibitionConstantKiUm);

    let aucRatio = 1.0;

    if (victim.primaryIsoform === perp.targetIsoform) {
      if (perp.inhibitionType === 'Mechanism-Based Inactivation (MBI)') {
        // MBI calculation: k_deg of hepatic CYP3A4/2D6 ~ 0.015 - 0.019 h^-1
        const kDeg = victim.primaryIsoform === 'CYP2D6' ? 0.015 : 0.019;
        const kinact = perp.inactivationRateKinactHr || 0.08;
        const KI_mbi = perp.inactivationConstantKiUm || Ki;
        const kObs = (kinact * I) / (KI_mbi + I);
        const apparentActivityFraction = kDeg / (kDeg + kObs);
        let hepaticAucr = 1.0 / ((1.0 - fm) + fm * apparentActivityFraction);

        // For oral CYP3A4 victim drugs (simvastatin), intestinal CYP3A4 first-pass
        // inactivation significantly multiplies total systemic AUC exposure (Rowan / FDA guidance)
        if (victim.primaryIsoform === 'CYP3A4') {
          const gutWallMultiplier = 3.6;
          hepaticAucr *= gutWallMultiplier;
        }

        aucRatio = hepaticAucr;
      } else {
        // Competitive reversible inhibition
        const inhibitionFactor = 1.0 / (1.0 + (I / Ki));
        aucRatio = 1.0 / ((1.0 - fm) + fm * inhibitionFactor);
      }

      // If the victim is a prodrug requiring CYP bioactivation (like clopidogrel),
      // enzyme inhibition causes active metabolite exposure to plummet:
      if (victim.isProdrugRequiringBioactivation) {
        aucRatio = 1.0 / aucRatio;
      }
    }

    const roundedAucr = Math.round(aucRatio * 100) / 100;

    // Categorize severity
    let severity: IDdiAssessment['interactionSeverity'] = 'Minor / Insignificant';
    if (victim.isProdrugRequiringBioactivation) {
      if (roundedAucr <= 0.60) {
        severity = 'Contraindicated / Severe Hazard';
      } else if (roundedAucr <= 0.80) {
        severity = 'Major Interaction';
      }
    } else {
      if (roundedAucr >= 5.0 || (roundedAucr >= 2.0 && victim.therapeuticWindow === 'Narrow (Critical Toxicity)')) {
        severity = 'Contraindicated / Severe Hazard';
      } else if (roundedAucr >= 2.0) {
        severity = 'Major Interaction';
      } else if (roundedAucr >= 1.25) {
        severity = 'Moderate Interaction';
      }
    }

    // Mechanism narrative
    let mechanism = '';
    if (victim.primaryIsoform !== perp.targetIsoform) {
      mechanism = `Discordant metabolic pathways: ${victim.name} is primarily cleared via ${victim.primaryIsoform}, whereas ${perp.name} acts on ${perp.targetIsoform}. Minimal pharmacokinetic collision anticipated.`;
    } else if (victim.isProdrugRequiringBioactivation) {
      mechanism = `${perp.name} competitively inhibits ${perp.targetIsoform}, impairing hepatic bioactivation of prodrug ${victim.name}. Active antiplatelet thiol metabolite concentration drops by ${Math.round((1 - roundedAucr) * 100)}%, leaving patient unprotected against thrombosis.`;
    } else {
      mechanism = `${perp.name} strongly inhibits hepatic ${perp.targetIsoform} (${perp.inhibitionType}), suppressing ${Math.round(fm * 100)}% of ${victim.name} metabolic clearance. Systemic exposure (AUC) surges by ${roundedAucr}-fold.`;
    }

    // Action protocol & dose adjustment
    let action = '';
    let doseAdj = '';

    if (severity === 'Contraindicated / Severe Hazard') {
      if (victim.isProdrugRequiringBioactivation) {
        action = `DO NOT CO-PRESCRIBE. Discontinue ${perp.name} or replace with pantoprazole (minimal CYP2C19 affinity), or substitute antiplatelet to ticagrelor/prasugrel which do not depend on CYP2C19 bioactivation.`;
        doseAdj = 'Switch agent immediately; dose escalation of clopidogrel is insufficient and non-compensatory.';
      } else {
        action = `CONTRAINDICATED COMBINATION. Temporarily withhold ${victim.name} during ${perp.name} course, or substitute with a non-CYP3A4 statin (e.g., rosuvastatin or pravastatin). Monitor renal function and CK.`;
        doseAdj = `Hold ${victim.name} completely until 3 days post-completion of ${perp.name}.`;
      }
    } else if (severity === 'Major Interaction') {
      action = `Significant pharmacokinetic collision. Empirically reduce ${victim.name} maintenance dose and monitor clinical endpoints (INR, heart rate, or drug levels) within 48 to 72 hours.`;
      const recommendedPct = Math.round((1.0 / roundedAucr) * 100);
      doseAdj = `Reduce ${victim.name} dosage by ${100 - recommendedPct}% (target ~${recommendedPct}% of current dose).`;
    } else if (severity === 'Moderate Interaction') {
      action = `Moderate exposure increase expected. Monitor patient for enhanced pharmacological effect or mild adverse events; routine dose reduction may not be mandatory.`;
      doseAdj = `Consider dose reduction of ${victim.name} by 20% to 30% if patient experiences adverse symptoms.`;
    } else {
      action = `Clinically benign interaction. No empirical dosage adjustment indicated. Continue standard monitoring.`;
      doseAdj = `Maintain standard ${victim.name} posology.`;
    }

    const ismpText = this.formatIsmpDosage(victim.name, victim.standardDoseMg);

    return {
      victim,
      perpetrator: perp,
      aucRatio: roundedAucr,
      interactionSeverity: severity,
      mechanismDescription: mechanism,
      clinicalActionProtocol: action,
      recommendedDoseAdjustment: doseAdj,
      ismpValidatedDosageText: ismpText
    };
  });

  /**
   * Strictly enforces ISMP rules:
   * 1. No trailing zeros (e.g., '5.0 mg' -> '5 mg')
   * 2. No naked decimals (e.g., '.5 mg' -> '0.5 mg')
   * 3. Clean spacing before unit
   */
  formatIsmpDosage(drugName: string, doseMg: number): string {
    let doseStr = doseMg.toString();

    // Prevent naked decimal: '.5' -> '0.5'
    if (doseStr.startsWith('.')) {
      doseStr = '0' + doseStr;
    }

    // Eliminate trailing zeros after decimal point: '5.0' -> '5', '5.50' -> '5.5'
    if (doseStr.includes('.')) {
      doseStr = doseStr.replace(/\.?0+$/, '');
    }

    return `${drugName} ${doseStr} mg`;
  }

  /**
   * Sanitizes arbitrary clinical posology string adhering to ISMP standards
   */
  sanitizeIsmpPosologyText(rawText: string): string {
    // Replace naked decimal: e.g. " .5 mg" or "( .5mg)" -> " 0.5 mg"
    let sanitized = rawText.replace(/(^|\s)\.(\d+)/g, '$10.$2');

    // Replace trailing zero: e.g. "5.0 mg" or "10.00 mg" -> "5 mg" or "10 mg"
    sanitized = sanitized.replace(/(\d+)\.0+(\s*(?:mg|mcg|g|units|mL))/gi, '$1$2');

    // Replace trailing zero in multi-digit decimal: e.g. "5.50 mg" -> "5.5 mg"
    sanitized = sanitized.replace(/(\d+\.\d*[1-9])0+(\s*(?:mg|mcg|g|units|mL))/gi, '$1$2');

    return sanitized;
  }

  applyPreset(preset: DdiPresetMode): void {
    this.activePreset.set(preset);

    switch (preset) {
      case 'simvastatin_clarithromycin':
        this.victimInput.set({
          name: 'Simvastatin',
          primaryIsoform: 'CYP3A4',
          fractionMetabolizedFm: 0.88,
          isProdrugRequiringBioactivation: false,
          standardDoseMg: 40,
          therapeuticWindow: 'Moderate',
          toxicityConsequences: 'Severe rhabdomyolysis, myoglobinuric acute renal failure, CPK > 10,000 U/L'
        });
        this.perpetratorInput.set({
          name: 'Clarithromycin',
          targetIsoform: 'CYP3A4',
          inhibitionType: 'Mechanism-Based Inactivation (MBI)',
          unboundConcentrationUm: 2.4,
          inhibitionConstantKiUm: 0.25,
          inactivationRateKinactHr: 0.082,
          inactivationConstantKiUm: 1.5,
          standardDoseMg: 500
        });
        break;

      case 'warfarin_amiodarone':
        this.victimInput.set({
          name: 'Warfarin (S-enantiomer)',
          primaryIsoform: 'CYP2C9',
          fractionMetabolizedFm: 0.85,
          isProdrugRequiringBioactivation: false,
          standardDoseMg: 5,
          therapeuticWindow: 'Narrow (Critical Toxicity)',
          toxicityConsequences: 'Supratherapeutic INR >= 5.0, spontaneous hemorrhage, fatal intracranial bleed'
        });
        this.perpetratorInput.set({
          name: 'Amiodarone',
          targetIsoform: 'CYP2C9',
          inhibitionType: 'Competitive Reversible',
          unboundConcentrationUm: 1.8,
          inhibitionConstantKiUm: 0.45,
          standardDoseMg: 200
        });
        break;

      case 'clopidogrel_omeprazole':
        this.victimInput.set({
          name: 'Clopidogrel (Prodrug)',
          primaryIsoform: 'CYP2C19',
          fractionMetabolizedFm: 0.80,
          isProdrugRequiringBioactivation: true,
          standardDoseMg: 75,
          therapeuticWindow: 'Narrow (Critical Toxicity)',
          toxicityConsequences: 'Loss of antiplatelet effect, catastrophic stent thrombosis, recurrent MI'
        });
        this.perpetratorInput.set({
          name: 'Omeprazole',
          targetIsoform: 'CYP2C19',
          inhibitionType: 'Competitive Reversible',
          unboundConcentrationUm: 2.2,
          inhibitionConstantKiUm: 0.55,
          standardDoseMg: 20
        });
        break;

      case 'metoprolol_fluoxetine':
        this.victimInput.set({
          name: 'Metoprolol',
          primaryIsoform: 'CYP2D6',
          fractionMetabolizedFm: 0.82,
          isProdrugRequiringBioactivation: false,
          standardDoseMg: 50,
          therapeuticWindow: 'Moderate',
          toxicityConsequences: 'Profound sinus bradycardia (HR < 40 bpm), syncope, high-grade AV block'
        });
        this.perpetratorInput.set({
          name: 'Fluoxetine',
          targetIsoform: 'CYP2D6',
          inhibitionType: 'Mechanism-Based Inactivation (MBI)',
          unboundConcentrationUm: 1.5,
          inhibitionConstantKiUm: 0.05,
          inactivationRateKinactHr: 0.12,
          inactivationConstantKiUm: 0.10,
          standardDoseMg: 20
        });
        break;

      case 'theophylline_ciprofloxacin':
        this.victimInput.set({
          name: 'Theophylline',
          primaryIsoform: 'CYP1A2',
          fractionMetabolizedFm: 0.90,
          isProdrugRequiringBioactivation: false,
          standardDoseMg: 300,
          therapeuticWindow: 'Narrow (Critical Toxicity)',
          toxicityConsequences: 'Intractable seizures, ventricular tachyarrhythmias, neurotoxicity'
        });
        this.perpetratorInput.set({
          name: 'Ciprofloxacin',
          targetIsoform: 'CYP1A2',
          inhibitionType: 'Competitive Reversible',
          unboundConcentrationUm: 3.5,
          inhibitionConstantKiUm: 1.2,
          standardDoseMg: 500
        });
        break;

      case 'atorvastatin_amlodipine':
        this.victimInput.set({
          name: 'Atorvastatin',
          primaryIsoform: 'CYP3A4',
          fractionMetabolizedFm: 0.70,
          isProdrugRequiringBioactivation: false,
          standardDoseMg: 20,
          therapeuticWindow: 'Moderate',
          toxicityConsequences: 'Mild myalgia, transaminase elevation'
        });
        this.perpetratorInput.set({
          name: 'Amlodipine',
          targetIsoform: 'CYP3A4',
          inhibitionType: 'Competitive Reversible',
          unboundConcentrationUm: 0.35,
          inhibitionConstantKiUm: 0.80,
          standardDoseMg: 10
        });
        break;
    }
  }
}
