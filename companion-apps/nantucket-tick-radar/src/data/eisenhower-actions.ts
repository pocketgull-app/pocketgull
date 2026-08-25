import { IEisenhowerAction } from '../types.js';

export const EISENHOWER_ACTIONS: IEisenhowerAction[] = [
  // ─── QUADRANT 1: URGENT & IMPORTANT (DO IMMEDIATELY) ───────────────
  {
    id: 'mech-removal-tweezers',
    title: 'Proper Mechanical Extraction with Fine-Tipped Tweezers',
    quadrant: 'q1_urgent_important',
    phase: 'bite_acute_0_2h',
    summary: 'Grasp the tick as close to the skin surface as possible and pull straight upward with steady, even pressure.',
    clinicalRationale: 'Twisting, squeezing the engorged abdomen, or jerking can cause mouthparts to break off or regurgitate gut contents (including Borrelia spirochetes and Babesia parasites) into the bloodstream.',
    evidenceTier: 'Level A (RCT / IDSA Standard)',
    actionSteps: [
      'Use fine-tipped forceps or tweezers; avoid blunt household tweezers.',
      'Pull straight up without twisting or yanking.',
      'Disinfect the bite area and hands with 70% isopropyl alcohol or soap and water.',
      'Store the tick in a sealed baggie or photograph its dorsal scute for identification.'
    ]
  },
  {
    id: 'prophylaxis-eval-72h',
    title: '72-Hour Single-Dose Doxycycline Assessment (200 mg)',
    quadrant: 'q1_urgent_important',
    phase: 'prophylaxis_window_2_72h',
    summary: 'Evaluate eligibility for single-dose oral Doxycycline (200 mg) within 72 hours of tick removal.',
    clinicalRationale: 'IDSA and CDC guidelines establish that 200 mg Doxycycline within 72h of removal reduces Lyme disease transmission risk by up to 87% if the tick was attached for >= 36 hours and is a blacklegged tick (Ixodes scapularis).',
    evidenceTier: 'Level A (RCT / IDSA Standard)',
    actionSteps: [
      'Verify tick is an Ixodes scapularis (deer tick nymph or adult).',
      'Confirm attachment time is >= 36 hours (visible engorgement scute index).',
      'Ensure less than 72 hours have elapsed since removal.',
      'Contact Nantucket Cottage Hospital Walk-in Clinic or primary provider immediately if eligible.'
    ]
  },
  {
    id: 'red-flag-emergency-triage',
    title: 'Red Flag Emergency Clinical Triage (NCH Emergency Dept)',
    quadrant: 'q1_urgent_important',
    phase: 'symptom_watch_3_30d',
    summary: 'Immediate evaluation at Nantucket Cottage Hospital if acute systemic red flags appear.',
    clinicalRationale: 'Lyme carditis (AV block), acute neuroborreliosis (facial palsy/Bell\'s palsy), and severe Babesiosis hemolytic crisis require urgent inpatient or emergency stabilization.',
    evidenceTier: 'Level A (RCT / IDSA Standard)',
    isRedFlag: true,
    actionSteps: [
      '🚨 Stiff neck, extreme photophobia, or sudden confusion (Meningoencephalitis).',
      '🚨 Palpitations, chest tightness, or syncope/fainting (Lyme Carditis / Heart Block).',
      '🚨 Facial asymmetry / inability to close one eye (Bell\'s Palsy / Cranial Nerve VII Neuropathy).',
      '🚨 High spike fevers (>102°F), drenching night sweats, and dark tea-colored urine (Babesia hemolytic crisis).'
    ]
  },

  // ─── QUADRANT 2: NOT URGENT BUT HIGHLY IMPORTANT (PLAN & STRATEGIZE) ─
  {
    id: 'symptom-watch-calendar',
    title: '30-Day Symptom Watch Calendar & Photo Journal',
    quadrant: 'q2_plan_decide',
    phase: 'symptom_watch_3_30d',
    summary: 'Mark the bite date and photograph the site every 48 hours for 30 days to measure lesion expansion.',
    clinicalRationale: 'Erythema migrans (EM) rashes take 3 to 30 days (median 7–10 days) to emerge. True EM expands to > 5 cm diameter, distinguishing it from immediate 24h hypersensitivity histamine reactions.',
    evidenceTier: 'Level A (RCT / IDSA Standard)',
    actionSteps: [
      'Draw a light pen circle around the initial redness boundary.',
      'Take photos in uniform natural lighting every 2 days.',
      'Log daily oral body temperature and note any flu-like body aches.',
      'Distinguish delayed >5cm expansion from immediate <2cm insect bite wheals.'
    ]
  },
  {
    id: 'citizen-science-logging',
    title: 'Log Encounter in Nantucket Citizen Science Bio-Tracker',
    quadrant: 'q2_plan_decide',
    phase: 'prevention_ecology',
    summary: 'Contribute anonymized encounter data (trail location, tick life stage, attachment time) to the island community database.',
    clinicalRationale: 'Hyper-local spatial surveillance helps Nantucket conservation rangers, health officials, and MIT researchers track vector density and seasonality across conservation parcels.',
    evidenceTier: 'Level B (Observational / CDC)',
    actionSteps: [
      'Record exact trail or property location (e.g. Sanford Farm, Coatue, Middle Moors).',
      'Identify tick species and nymph vs adult stage using the visual key.',
      'Submit anonymized report to support Nantucket health department telemetry.'
    ]
  },
  {
    id: 'permethrin-sock-armor',
    title: 'Permethrin Gear Treatment & High-Heat Dryer Protocol',
    quadrant: 'q2_plan_decide',
    phase: 'prevention_ecology',
    summary: 'Treat hiking shoes, socks, and trail pants with 0.5% permethrin spray; run post-hike clothes in high-heat dryer for 10 minutes.',
    clinicalRationale: 'Permethrin provides contact acaricidal knockdown (ticks drop off within seconds). Dry heat (10 min on high) desiccatestick nymphs that survive standard wash cycles.',
    evidenceTier: 'Level A (RCT / IDSA Standard)',
    actionSteps: [
      'Spray footwear and outer pants with 0.5% permethrin; allow to dry completely (lasts 6 washings).',
      'Tuck pant legs into permethrin-treated socks when entering Nantucket brush.',
      'Place dry clothing directly into hot dryer for 10 minutes immediately upon returning indoors.',
      'Perform a 360-degree mirror tick check focusing on scalp, waistband, axillae, and behind knees.'
    ]
  },

  // ─── QUADRANT 3: URGENT DISTRACTIONS (DELEGATE / DE-ESCALATE) ───────
  {
    id: 'tick-mail-testing-trap',
    title: 'De-escalate: Commercial Dead-Tick Mail-In Testing Reliance',
    quadrant: 'q3_delegate_deescalate',
    phase: 'prophylaxis_window_2_72h',
    summary: 'Do not wait for commercial dead-tick mail-in lab results before initiating clinical evaluation.',
    clinicalRationale: 'CDC and IDSA explicitly advise against delaying prophylaxis or treatment while waiting for dead-tick DNA panels. Presence of Borrelia in a tick does not guarantee transmission, and a negative result does not rule out unobserved co-infections.',
    evidenceTier: 'Level B (Observational / CDC)',
    actionSteps: [
      'Focus on clinical attachment hours and physical symptoms rather than commercial tick DNA panels.',
      'If submitting to UMass TickReport, treat as epidemiological curiosity, not primary diagnostic basis.',
      'Never delay medical care for clinical symptoms while waiting on a postal test.'
    ]
  },
  {
    id: 'social-media-panics',
    title: 'Filter Out Panicked Social Forum Advice',
    quadrant: 'q3_delegate_deescalate',
    phase: 'bite_acute_0_2h',
    summary: 'Avoid non-evidence-based social media diagnosis groups; adhere to vetted Nantucket health guidelines.',
    clinicalRationale: 'Unregulated online forums frequently promote unvalidated alternative protocols or ungrounded panic, creating decision fatigue and distracting from actionable clinical windows.',
    evidenceTier: 'Level C (Expert / Myth Disproven)',
    actionSteps: [
      'Rely on Nantucket Cottage Hospital and CDC/IDSA standard guidelines.',
      'Use the structured FHIR R4 clinical summary for primary care consultation.'
    ]
  },

  // ─── QUADRANT 4: HARMFUL & WASTEFUL MYTHS (ELIMINATE) ───────────────
  {
    id: 'folk-remedies-smothering',
    title: 'ELIMINATE: Folk Remedies (Matches, Vaseline, Rubbing Alcohol, Essential Oils)',
    quadrant: 'q4_eliminate_waste',
    phase: 'bite_acute_0_2h',
    summary: 'NEVER apply lit matches, petroleum jelly, nail polish, or essential oils to an attached tick.',
    clinicalRationale: 'Suffocating or burning the tick irritates its salivary glands, inducing acute trauma-induced regurgitation of stomach contents and infectious pathogens directly into the dermal capillary bed.',
    evidenceTier: 'Level C (Expert / Myth Disproven)',
    actionSteps: [
      '❌ DO NOT burn with hot matchheads or lighters.',
      '❌ DO NOT coat with petroleum jelly, nail polish, or dish soap.',
      '❌ DO NOT smother with tea tree or clove oil.',
      '✅ Use ONLY mechanical tweezer extraction.'
    ]
  },
  {
    id: 'early-serology-overtesting',
    title: 'ELIMINATE: Immediate Blood Serology (ELISA / Western Blot) in First 14 Days',
    quadrant: 'q4_eliminate_waste',
    phase: 'symptom_watch_3_30d',
    summary: 'Do not demand Lyme antibody blood tests within the first 1–2 weeks of a tick bite.',
    clinicalRationale: 'Humoral IgM/IgG antibody responses take 2 to 4 weeks to reach detectable titers. Testing in the acute phase yields up to 70% false-negative results, generating dangerous false reassurance.',
    evidenceTier: 'Level A (RCT / IDSA Standard)',
    actionSteps: [
      '❌ DO NOT order Lyme titer blood tests immediately following a bite.',
      'Clinical diagnosis of early Lyme is made visually via Erythema migrans, NOT blood serology.',
      'Blood tests (2-tier EIA + Immunoblot) are reserved for later disseminated disease or joint manifestations.'
    ]
  }
];
