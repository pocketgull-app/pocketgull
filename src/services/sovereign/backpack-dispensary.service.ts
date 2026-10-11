import { Injectable } from '@angular/core';

export interface IWhoEmlProtocol {
  condition: string;
  firstLine: string;
  whoEmlSection: string;
  thermostability?: string;
  antidoteRequired?: string;
  contraindications?: string;
  bedsideTest?: string;
  fieldLogistics?: string;
  harmfulPracticesToReject?: string[];
  inpatientCriteria?: string;
}

export interface IPediatricMuacTriageResult {
  classification: string;
  triage: 'INPATIENT_STABILIZATION' | 'OUTPATIENT_AMBULATORY_CARE' | 'SUPPLEMENTARY_FEEDING_PROGRAM' | 'COMMUNITY_WELLNESS';
  initialNutrition: string;
  antibiotic?: string;
  rationale: string;
}

export interface IMultilingualPassportLabels {
  emergencyDirective: string;
  bloodGroup: string;
  criticalAllergies: string;
  pgxContraindications: string;
  chronicConditions: string;
  warning: string;
}

export interface IMultilingualPassportSummary {
  header: string;
  subjectAnonymousId: string;
  language: string;
  data: Record<string, any>;
  clinicalWarning: string;
}

@Injectable({
  providedIn: 'root'
})
export class BackpackDispensaryService {
  /**
   * Offline WHO Model List of Essential Medicines & MSF Field Guidance Database
   */
  readonly offlineEmlDatabase: Record<string, IWhoEmlProtocol> = {
    severe_malaria: {
      condition: 'Severe Plasmodium falciparum malaria',
      firstLine: 'Artesunate IV/IM (2.4 mg/kg at 0, 12, 24 hours, then daily)',
      whoEmlSection: '6.5.3',
      thermostability: 'Stable below 30°C; protect from moisture',
      contraindications: 'None in severe life-threatening malaria'
    },
    severe_preeclampsia: {
      condition: 'Severe pre-eclampsia / Eclampsia seizure prophylaxis',
      firstLine: 'Magnesium Sulfate IV/IM (Pritchard or Zuspan regimen: 4g IV loading + 1g/hr maintenance)',
      whoEmlSection: '22.1',
      thermostability: 'Store below 25°C; do not freeze',
      antidoteRequired: 'Calcium Gluconate 10% IV readily available'
    },
    cholera_shock: {
      condition: 'Acute watery diarrhea with severe dehydration (Cholera)',
      firstLine: "Plan C: IV Ringer's Lactate (100 ml/kg total over 3-6 hours) + Oral Zinc daily for children",
      whoEmlSection: '26.2',
      thermostability: 'Standard ambient storage',
      fieldLogistics: 'Prepare clean drinking water source (WASH containment)'
    },
    snakebite_hemotoxic: {
      condition: 'Viperid snakebite envenomation with coagulopathy',
      bedsideTest: '20-Minute Whole Blood Clotting Test (20WBCT) in clean dry glass tube',
      firstLine: 'Polyvalent Equine/Ovine Antivenom IV infusion',
      whoEmlSection: '19.2',
      harmfulPracticesToReject: ['Tourniquet', 'Wound incisions', 'Suction', 'Black stone']
    },
    severe_acute_malnutrition: {
      condition: 'Uncomplicated Severe Acute Malnutrition (MUAC < 115 mm, passed appetite test)',
      firstLine: 'Outpatient Therapeutic Program (OTP) with Ready-to-Use Therapeutic Food (RUTF / Plumpy\'Nut) + Oral Amoxicillin',
      whoEmlSection: 'Specialized Nutrition Protocol',
      inpatientCriteria: 'Failed appetite test, bilateral +++ edema, or acute medical complications (hypothermia, hypoglycemia)'
    }
  };

  /**
   * 6-Language Cross-Border Emergency Translation Dictionary
   */
  readonly languageTranslations: Record<string, IMultilingualPassportLabels> = {
    en: {
      emergencyDirective: 'EMERGENCY MEDICAL PROFILE',
      bloodGroup: 'Blood Group',
      criticalAllergies: 'Critical Drug Allergies',
      pgxContraindications: 'Pharmacogenomic Contraindications',
      chronicConditions: 'Active Conditions',
      warning: 'DO NOT ADMINISTER CLOPIDOGREL IF CYP2C19 POOR METABOLIZER'
    },
    es: {
      emergencyDirective: 'PERFIL MÉDICO DE EMERGENCIA',
      bloodGroup: 'Grupo Sanguíneo',
      criticalAllergies: 'Alergias a Medicamentos Críticos',
      pgxContraindications: 'Contraindicaciones Farmacogenómicas',
      chronicConditions: 'Condiciones Activas',
      warning: 'NO ADMINISTRAR CLOPIDOGREL EN METABOLIZADOR LENTO DE CYP2C19'
    },
    fr: {
      emergencyDirective: "PROFIL MÉDICAL D'URGENCE",
      bloodGroup: 'Groupe Sanguin',
      criticalAllergies: 'Allergies Médicamenteuses Critiques',
      pgxContraindications: 'Contre-indications Pharmacogénomiques',
      chronicConditions: 'Pathologies Actives',
      warning: 'NE PAS ADMINISTRER DE CLOPIDOGREL SI MÉTABOLISEUR LENT CYP2C19'
    },
    ar: {
      emergencyDirective: 'الملف الطبي في حالات الطوارئ',
      bloodGroup: 'فصيلة الدم',
      criticalAllergies: 'الحساسية الدوائية الشديدة',
      pgxContraindications: 'موانع الاستعمال الدوائية الجينية',
      chronicConditions: 'الحالات المزمنة النشطة',
      warning: 'يحظر إعطاء كلوبيدوجريل لمن لديهم ضعف في التمثيل الغذائي لـ CYP2C19'
    },
    uk: {
      emergencyDirective: 'НЕВІДКЛАДНИЙ МЕДИЧНИЙ ПРОФІЛЬ',
      bloodGroup: 'Група крові',
      criticalAllergies: 'Критичні алергії на ліки',
      pgxContraindications: 'Фармакогеномні протипоказання',
      chronicConditions: 'Активні діагнози',
      warning: 'НЕ ПРИЗНАЧАТИ КЛОПІДОГРЕЛЬ ПРИ МЕТАБОЛІЧНІЙ НЕДОСТАТНОСТІ CYP2C19'
    },
    sw: {
      emergencyDirective: 'WASIFU WA MATIBABU YA DHARURA',
      bloodGroup: 'Kundi la Damu',
      criticalAllergies: 'Mizio Mikubwa ya Dawa',
      pgxContraindications: 'Mwingiliano wa Vinasaba na Dawa',
      chronicConditions: 'Magonjwa ya Sasa',
      warning: 'USITOE CLOPIDOGREL KAMA CYP2C19 HAIWEZI KUCHAKATA'
    }
  };

  /**
   * Retrieves an offline verified WHO EML protocol by key.
   */
  queryProtocol(conditionKey: string): IWhoEmlProtocol | null {
    return this.offlineEmlDatabase[conditionKey] || null;
  }

  /**
   * Calculates pediatric Severe Acute Malnutrition (SAM) triage under WHO & MSF guidelines.
   */
  calculatePediatricMuacTriage(muacMm: number, edemaPresent: boolean, passedAppetiteTest: boolean): IPediatricMuacTriageResult {
    if (muacMm < 115.0 || edemaPresent) {
      if (!passedAppetiteTest || edemaPresent) {
        return {
          classification: 'Complicated Severe Acute Malnutrition',
          triage: 'INPATIENT_STABILIZATION',
          initialNutrition: 'F-75 therapeutic milk',
          rationale: 'High mortality risk; requires metabolic and electrolyte stabilization before rapid catch-up.'
        };
      } else {
        return {
          classification: 'Uncomplicated Severe Acute Malnutrition',
          triage: 'OUTPATIENT_AMBULATORY_CARE',
          initialNutrition: 'Ready-to-Use Therapeutic Food (RUTF / Plumpy\'Nut)',
          antibiotic: 'Amoxicillin oral 7-day course',
          rationale: 'Avoids hospital admission, preventing lethal nosocomial infections.'
        };
      }
    } else if (muacMm >= 115.0 && muacMm < 125.0) {
      return {
        classification: 'Moderate Acute Malnutrition (MAM)',
        triage: 'SUPPLEMENTARY_FEEDING_PROGRAM',
        initialNutrition: 'Ready-to-Use Supplementary Food (RUSF)',
        rationale: 'Targeted caloric and micronutrient supplementation to prevent SAM deterioration.'
      };
    } else {
      return {
        classification: 'Normal Nutritional Status',
        triage: 'COMMUNITY_WELLNESS',
        initialNutrition: 'Standard local diet with breastfeeding support',
        rationale: 'Optimal anthropometry; maintain routine growth monitoring.'
      };
    }
  }

  /**
   * Generates a 6-language emergency medical passport summary.
   */
  generateMultilingualPassportSummary(params: {
    subjectToken: string;
    bloodType: string;
    pgxVariants: string[];
    allergies: string[];
    conditionsSctid: string[];
    langCode?: string;
  }): IMultilingualPassportSummary {
    const lang = params.langCode || 'en';
    const labels = this.languageTranslations[lang] || this.languageTranslations['en'];

    return {
      header: labels.emergencyDirective,
      subjectAnonymousId: params.subjectToken,
      language: lang,
      data: {
        [labels.bloodGroup]: params.bloodType,
        [labels.criticalAllergies]: params.allergies,
        [labels.pgxContraindications]: params.pgxVariants,
        [labels.chronicConditions]: params.conditionsSctid
      },
      clinicalWarning: labels.warning
    };
  }

  /**
   * Generates a compressed, high-density JSON string for QR matrix encoding.
   */
  generateCompactQrPayload(params: {
    subjectToken: string;
    bloodType: string;
    pgxVariants: string[];
    allergies: string[];
    conditionsSctid: string[];
  }): string {
    const compactData = {
      v: '1.0',
      id: params.subjectToken,
      bt: params.bloodType,
      pgx: params.pgxVariants,
      alg: params.allergies,
      sct: params.conditionsSctid
    };
    return JSON.stringify(compactData);
  }
}
