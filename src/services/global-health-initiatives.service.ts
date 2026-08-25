import { Injectable } from '@angular/core';
import { IPatient, IPatientVitals } from './patient.types';

export interface IWhoCvdRiskResult {
  riskScorePercent: number; // 10-year risk
  riskTier: 'Low (<10%)' | 'Moderate (10-20%)' | 'High (20-30%)' | 'Critical (>=30%)';
  color: string;
  whoHeartsRecommendations: string[];
  sdg34TargetAssessment: string;
}

export interface IWhoIcd11TmMapping {
  syndromeName: string;
  paradigm: 'TCM' | 'Ayurveda';
  icd11Tm1Code: string;
  icd11Title: string;
  biomedicalCorrelates: string[];
  recommendedPhytotherapy: string;
}

export interface INihHealthspanAssessment {
  chronologicalAge: number;
  estimatedBiologicalAge: number;
  biologicalAgeDelta: number; // e.g. -4.2 years (younger) or +3.5 years (older)
  vagalToneScore: number; // 0-100
  autonomicState: 'High Vagal Tone (Resilient)' | 'Moderate Vagal Tone' | 'Vagal Suppression (Sympathetic Dominance)';
  recommended01HzPacingRate: string; // e.g. "4.0s Inhale / 6.0s Exhale (6 breaths/min)"
}

export interface IArpahTriageResult {
  triageCategory: 'IMMEDIATE (Red)' | 'DELAYED (Yellow)' | 'MINOR (Green)' | 'EXPECTANT (Black)';
  triageColor: string;
  triageProtocol: 'START' | 'SALT';
  actionableDirectives: string[];
  meshHandoffQrCodePayload: string;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalHealthInitiativesService {

  /**
   * 1. WHO SDG 3.4 & HEARTS Package: 10-Year Cardiovascular & Cardiometabolic Risk Engine
   */
  calculateWhoCvdRisk(patient: IPatient): IWhoCvdRiskResult {
    const age = patient.age || 45;
    const isMale = patient.gender?.toLowerCase() === 'male';
    const systolicBp = this.parseSystolic(patient.vitals?.bp) || 125;
    const isSmoker = patient.preexistingConditions?.some(c => c.toLowerCase().includes('tobacco') || c.toLowerCase().includes('smoke')) || false;
    const hasDiabetes = patient.preexistingConditions?.some(c => c.toLowerCase().includes('diabetes') || c.toLowerCase().includes('glucose')) || false;

    // WHO non-laboratory risk approximation based on age, sex, SBP, smoking & diabetes
    let points = 0;
    if (age >= 70) points += 12;
    else if (age >= 60) points += 9;
    else if (age >= 50) points += 6;
    else if (age >= 40) points += 3;

    if (isMale) points += 2;
    if (isSmoker) points += 4;
    if (hasDiabetes) points += 5;

    if (systolicBp >= 160) points += 8;
    else if (systolicBp >= 140) points += 5;
    else if (systolicBp >= 130) points += 2;

    let riskPercent = Math.min(65, Math.max(2, Math.round(points * 1.6)));
    let riskTier: IWhoCvdRiskResult['riskTier'] = 'Low (<10%)';
    let color = 'text-emerald-500';

    if (riskPercent >= 30) {
      riskTier = 'Critical (>=30%)';
      color = 'text-rose-600';
    } else if (riskPercent >= 20) {
      riskTier = 'High (20-30%)';
      color = 'text-orange-500';
    } else if (riskPercent >= 10) {
      riskTier = 'Moderate (10-20%)';
      color = 'text-amber-500';
    }

    const recs: string[] = [
      'WHO HEARTS Lifestyle: Restrict dietary sodium to < 2.0g/day (< 5g salt/day).',
      'Target 150-300 min/week moderate-intensity aerobic physical activity (Zone 2).',
      systolicBp >= 140 ? 'Initiate protocolized dual antihypertensive therapy per WHO HEARTS guidelines.' : 'Maintain annual blood pressure and metabolic surveillance.',
      hasDiabetes ? 'Achieve tight glycemic control (HbA1c < 7.0%) to prevent microvascular injury.' : 'Annual fasting glucose / HbA1c screening.'
    ];

    return {
      riskScorePercent: riskPercent,
      riskTier,
      color,
      whoHeartsRecommendations: recs,
      sdg34TargetAssessment: `Alignment with UN SDG 3.4 (NCD Mortality Deceleration): 10-year estimated risk is ${riskPercent}%. ${riskTier === 'Low (<10%)' ? 'Optimal risk baseline.' : 'Requires active multi-modal risk mitigation.'}`
    };
  }

  /**
   * 2. WHO TCIM Global Strategy: ICD-11 Chapter 26 (Traditional Medicine Module 1) Dual-Coder
   */
  mapToWhoIcd11Chapter26(conditionsOrIssues: string[]): IWhoIcd11TmMapping[] {
    const text = conditionsOrIssues.join(' ').toLowerCase();
    const mappings: IWhoIcd11TmMapping[] = [];

    // TCM Spleen Qi Deficiency & Phlegm Damp
    if (text.includes('fatigue') || text.includes('digest') || text.includes('bloat') || text.includes('metabolic') || text.includes('spleen')) {
      mappings.push({
        syndromeName: 'Spleen Qi Deficiency with Damp Encumbrance (Pi Qi Xu)',
        paradigm: 'TCM',
        icd11Tm1Code: 'TM1: SF01.0',
        icd11Title: 'Spleen Qi Deficiency pattern',
        biomedicalCorrelates: ['Functional Dyspepsia (K30)', 'Metabolic Syndrome (E88.81)', 'Chronic Fatigue (R53.82)'],
        recommendedPhytotherapy: 'Shen Ling Bai Zhu San / Si Jun Zi Tang (Poria, Atractylodes, Ginseng)'
      });
    }

    // TCM Liver Qi Stagnation & Heat
    if (text.includes('stress') || text.includes('headache') || text.includes('tension') || text.includes('irritab') || text.includes('liver')) {
      mappings.push({
        syndromeName: 'Liver Qi Stagnation with Depressive Heat (Gan Qi Yu Jie)',
        paradigm: 'TCM',
        icd11Tm1Code: 'TM1: SF20.1',
        icd11Title: 'Liver Qi Stagnation pattern',
        biomedicalCorrelates: ['Tension Headache (G44.2)', 'Generalized Anxiety (F41.1)', 'Dysmenorrhea (N94.6)'],
        recommendedPhytotherapy: 'Xiao Yao San (Bupleurum, Angelica, White Peony)'
      });
    }

    // Ayurveda Vata Aggravation & Prana Vata Derangement
    if (text.includes('insomnia') || text.includes('anxiety') || text.includes('joint') || text.includes('vata') || text.includes('ache')) {
      mappings.push({
        syndromeName: 'Prana Vata Aggravation with Majja Dhatu Depletion',
        paradigm: 'Ayurveda',
        icd11Tm1Code: 'TM1: AY01.2',
        icd11Title: 'Vata Dosha Imbalance pattern',
        biomedicalCorrelates: ['Insomnia (G47.0)', 'Autonomic Dysregulation (G90.9)', 'Osteoarthritis (M19.9)'],
        recommendedPhytotherapy: 'Ashwagandha (Withania somnifera) + Brahmi (Bacopa monnieri) with warm sesame oil Abhyanga'
      });
    }

    // Fallback baseline mapping
    if (mappings.length === 0) {
      mappings.push({
        syndromeName: 'Harmonious Zang-Fu & Tridoshic Equilibrium',
        paradigm: 'TCM',
        icd11Tm1Code: 'TM1: SF99.0',
        icd11Title: 'Balanced Constitution pattern',
        biomedicalCorrelates: ['General Adult Medical Examination (Z00.00)'],
        recommendedPhytotherapy: 'Seasonal adaptogenic dietary balance (Astragalus, Tulsi, Green Tea)'
      });
    }

    return mappings;
  }

  /**
   * 3. NIH All of Us & BRAIN Initiative: Vagal Autonomic & Biological Healthspan Assessment
   */
  assessNihGeroscienceAndVagalTone(patient: IPatient): INihHealthspanAssessment {
    const chronAge = patient.age || 44;
    const hr = Number(patient.vitals?.hr) || 72;
    const systolicBp = this.parseSystolic(patient.vitals?.bp) || 120;
    const diastolicBp = this.parseDiastolic(patient.vitals?.bp) || 80;

    // Vagal score computation (optimal resting HR 55-65, optimal pulse pressure 35-45)
    const pulsePressure = systolicBp - diastolicBp;
    let vagalScore = 80;

    if (hr > 85) vagalScore -= 25;
    else if (hr > 75) vagalScore -= 12;
    else if (hr < 60 && hr >= 50) vagalScore += 10;

    if (pulsePressure > 55) vagalScore -= 15;
    else if (pulsePressure < 30) vagalScore -= 10;

    vagalScore = Math.max(10, Math.min(98, vagalScore));

    let autonomicState: INihHealthspanAssessment['autonomicState'] = 'Moderate Vagal Tone';
    if (vagalScore >= 75) autonomicState = 'High Vagal Tone (Resilient)';
    else if (vagalScore < 50) autonomicState = 'Vagal Suppression (Sympathetic Dominance)';

    // Biological age calculation (Gompertz-Makeham proxy)
    let bioAgeDelta = 0;
    if (hr < 65 && systolicBp <= 118) bioAgeDelta -= 3.5;
    else if (hr > 80 || systolicBp >= 135) bioAgeDelta += 4.0;

    if (patient.preexistingConditions && patient.preexistingConditions.length > 2) {
      bioAgeDelta += 2.0;
    }

    const estimatedBioAge = Math.round((chronAge + bioAgeDelta) * 10) / 10;

    return {
      chronologicalAge: chronAge,
      estimatedBiologicalAge: estimatedBioAge,
      biologicalAgeDelta: Math.round(bioAgeDelta * 10) / 10,
      vagalToneScore: vagalScore,
      autonomicState,
      recommended01HzPacingRate: '4.0s Inhale (Nasal) / 6.0s Exhale (Pursed-Lip) — 0.1 Hz RSA Resonance Frequency'
    };
  }

  /**
   * 4. ARPA-H Resilient Point-of-Care: Mass-Casualty SALT / START Triage Engine
   */
  assessArpahEmergencyTriage(patient: IPatient): IArpahTriageResult {
    const hr = Number(patient.vitals?.hr) || 75;
    const spO2 = Number(patient.vitals?.spO2) || 98;
    const issues = Object.values(patient.issues || {}).flat();
    const maxPain = issues.reduce((m, i) => Math.max(m, i.painLevel || 0), 0);

    let triageCategory: IArpahTriageResult['triageCategory'] = 'MINOR (Green)';
    let triageColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500/40';
    let directives: string[] = ['Ambulatory walking wounded. Directed to secondary staging area.'];

    if (spO2 < 90 || hr > 130 || maxPain >= 9) {
      triageCategory = 'IMMEDIATE (Red)';
      triageColor = 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 border-rose-500/50 animate-pulse';
      directives = [
        'Immediate airway control & high-flow oxygen administration.',
        'Hemorrhage intervention & rapid intravenous access.',
        'Priority 1 medical evacuation / trauma bay handover.'
      ];
    } else if (spO2 < 94 || hr > 105 || maxPain >= 6) {
      triageCategory = 'DELAYED (Yellow)';
      triageColor = 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-500/40';
      directives = [
        'Non-ambulatory but hemodynamically stable.',
        'Continuous pulse oximetry and vitals logging every 15 min.',
        'Analgesia and wound dressing stabilization.'
      ];
    }

    const qrPayload = JSON.stringify({
      id: patient.id,
      name: patient.name,
      triage: triageCategory,
      vitals: { hr, spO2, bp: patient.vitals?.bp },
      timestamp: new Date().toISOString(),
      seal: `urn:pocketgull:arpah:triage:${Date.now()}`
    });

    return {
      triageCategory,
      triageColor,
      triageProtocol: 'START',
      actionableDirectives: directives,
      meshHandoffQrCodePayload: qrPayload
    };
  }

  private parseSystolic(bpStr?: string): number | null {
    if (!bpStr) return null;
    const parts = bpStr.split('/');
    const val = parseInt(parts[0], 10);
    return isNaN(val) ? null : val;
  }

  private parseDiastolic(bpStr?: string): number | null {
    if (!bpStr) return null;
    const parts = bpStr.split('/');
    if (parts.length < 2) return null;
    const val = parseInt(parts[1], 10);
    return isNaN(val) ? null : val;
  }
}
