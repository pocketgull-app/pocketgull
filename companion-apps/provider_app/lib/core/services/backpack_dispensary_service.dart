// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

class WhoEmlProtocol {
  final String key;
  final String condition;
  final String firstLine;
  final String whoEmlSection;
  final String thermostability;
  final String? bedsideTest;
  final String? antidoteRequired;
  final List<String> harmfulPracticesToReject;
  final String? fieldLogistics;
  final String clinicalRationale;

  const WhoEmlProtocol({
    required this.key,
    required this.condition,
    required this.firstLine,
    required this.whoEmlSection,
    required this.thermostability,
    this.bedsideTest,
    this.antidoteRequired,
    this.harmfulPracticesToReject = const [],
    this.fieldLogistics,
    required this.clinicalRationale,
  });
}

class MuacTriageResult {
  final String classification;
  final String triageLocation;
  final String initialNutrition;
  final String? antibiotic;
  final String rationale;
  final bool isEmergency;

  const MuacTriageResult({
    required this.classification,
    required this.triageLocation,
    required this.initialNutrition,
    this.antibiotic,
    required this.rationale,
    required this.isEmergency,
  });
}

class BackpackDispensaryService {
  static const Map<String, WhoEmlProtocol> protocols = {
    'severe_malaria': WhoEmlProtocol(
      key: 'severe_malaria',
      condition: 'Severe Plasmodium Falciparum Malaria',
      firstLine: 'Artesunate IV/IM (2.4 mg/kg at 0, 12, 24 hours, then daily)',
      whoEmlSection: '6.5.3 (Antimalarial Medicines)',
      thermostability: 'Stable below 30°C; protect from humidity and direct sunlight',
      clinicalRationale: 'Artesunate significantly reduces mortality compared to Quinine with lower risk of hypoglycemia.',
    ),
    'severe_preeclampsia': WhoEmlProtocol(
      key: 'severe_preeclampsia',
      condition: 'Severe Pre-Eclampsia / Eclamptic Seizures',
      firstLine: 'Magnesium Sulfate IV/IM (Pritchard/Zuspan: 4g IV loading over 15 min + 1g/hr maintenance)',
      whoEmlSection: '22.1 (Oxytocics & Anticonvulsants)',
      thermostability: 'Store below 25°C; do not freeze',
      antidoteRequired: 'Calcium Gluconate 10% IV (1g over 5-10 min) must be at bedside',
      clinicalRationale: 'Superior to Diazepam/Phenytoin for seizure prevention and maternal-fetal survival in eclampsia.',
    ),
    'cholera_shock': WhoEmlProtocol(
      key: 'cholera_shock',
      condition: 'Acute Watery Diarrhea with Severe Dehydration (Cholera Shock)',
      firstLine: 'Plan C: IV Ringer\'s Lactate (100 ml/kg total: 30 ml/kg in first 30 min, then 70 ml/kg over 2.5 hrs) + Oral Zinc',
      whoEmlSection: '26.2 (Oral & Parenteral Rehydration Solutions)',
      thermostability: 'Ambient austere storage; verify bag seal integrity',
      fieldLogistics: 'WASH protocol: Chlorinated drinking water (0.5 mg/L free chlorine) and dedicated CTC cot isolation.',
      clinicalRationale: 'Rapid intravascular volume restoration prevents acute tubular necrosis and hypovolemic death.',
    ),
    'snakebite_hemotoxic': WhoEmlProtocol(
      key: 'snakebite_hemotoxic',
      condition: 'Viperid / Elapid Snakebite Envenomation with Coagulopathy',
      firstLine: 'Polyvalent Antivenom IV Infusion (diluted in 5-10 ml/kg Normal Saline over 30-60 min)',
      whoEmlSection: '19.2 (Sera and Immunoglobulins)',
      bedsideTest: '20-Minute Whole Blood Clotting Test (20WBCT) in clean dry glass tube',
      thermostability: 'Lyophilized antivenom stable without cold chain; reconstituted liquid requires cold storage',
      harmfulPracticesToReject: [
        'Tourniquet or arterial constriction bands (causes severe gangrene)',
        'Local wound incisions or razor cutting',
        'Mechanical or oral mouth suction',
        'Black stone application (ineffective and introduces tetanus)',
      ],
      clinicalRationale: '20WBCT detects venom-induced consumptive coagulopathy; antivenom neutralizes unbound circulating toxins.',
    ),
    'severe_acute_malnutrition': WhoEmlProtocol(
      key: 'severe_acute_malnutrition',
      condition: 'Severe Acute Malnutrition (Pediatric MUAC < 115 mm)',
      firstLine: 'Ready-to-Use Therapeutic Food (RUTF / Plumpy\'Nut) + Oral Amoxicillin 7-day course',
      whoEmlSection: 'Specialized Austere Nutrition Directive',
      thermostability: 'Lipid-based paste; extremely shelf-stable (24 months ambient)',
      fieldLogistics: 'Conduct appetite test: child must actively consume 1/4 sachet of RUTF within 30 minutes.',
      clinicalRationale: 'Outpatient ambulatory care prevents fatal nosocomial cross-infections in overburdened inpatient wards.',
    ),
    'visceral_leishmaniasis': WhoEmlProtocol(
      key: 'visceral_leishmaniasis',
      condition: 'Visceral Leishmaniasis (Kala-Azar)',
      firstLine: 'Sodium Stibogluconate (SSG 20 mg/kg/day IM) + Paromomycin (PM 15 mg/kg/day IM) for 17 days',
      whoEmlSection: '6.5.4 (Antiprotozoal Medicines)',
      thermostability: 'Store below 25°C; protect from freezing',
      clinicalRationale: 'SSG+PM combination therapy shortens treatment duration and reduces stibogluconate cardiotoxicity.',
    ),
  };

  static MuacTriageResult calculatePediatricMuac({
    required double muacMm,
    required bool edemaPresent,
    required bool passedAppetiteTest,
  }) {
    if (muacMm < 115.0 || edemaPresent) {
      if (!passedAppetiteTest || edemaPresent) {
        return const MuacTriageResult(
          classification: 'Complicated Severe Acute Malnutrition (SAM)',
          triageLocation: 'INPATIENT STABILIZATION (ITFC)',
          initialNutrition: 'F-75 Therapeutic Milk (Cautious metabolic stabilization)',
          antibiotic: 'Ampicillin IV + Gentamicin IV',
          rationale: 'Failed appetite or bilateral edema indicates acute organ failure risk and refeeding syndrome hazard.',
          isEmergency: true,
        );
      } else {
        return const MuacTriageResult(
          classification: 'Uncomplicated Severe Acute Malnutrition (SAM)',
          triageLocation: 'OUTPATIENT AMBULATORY CARE (OTP / ATFC)',
          initialNutrition: 'Ready-to-Use Therapeutic Food (RUTF) 175 kcal/kg/day',
          antibiotic: 'Amoxicillin oral 7-day course',
          rationale: 'Ambulatory home feeding with RUTF avoids fatal hospital cross-infections.',
          isEmergency: false,
        );
      }
    } else if (muacMm >= 115.0 && muacMm < 125.0) {
      return const MuacTriageResult(
        classification: 'Moderate Acute Malnutrition (MAM)',
        triageLocation: 'SUPPLEMENTARY FEEDING PROGRAM (SFP)',
        initialNutrition: 'Ready-to-Use Supplementary Food (RUSF)',
        rationale: 'Targeted caloric supplementation prevents progression into severe acute malnutrition.',
        isEmergency: false,
      );
    } else {
      return const MuacTriageResult(
        classification: 'Well Nourished (Normal Nutritional Status)',
        triageLocation: 'COMMUNITY HEALTH POST',
        initialNutrition: 'Local balanced diet with continued maternal breastfeeding support',
        rationale: 'MUAC in safe green zone (>= 125 mm). Reinforce preventive vaccination and WASH.',
        isEmergency: false,
      );
    }
  }
}
