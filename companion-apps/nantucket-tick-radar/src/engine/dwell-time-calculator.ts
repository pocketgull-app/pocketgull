import { AttachmentDwellTier, IDwellTimeAssessment, TickSpecies } from '../types.js';

/**
 * Calculates biological transmission risk and 72-hour prophylaxis eligibility
 * based on IDSA (Infectious Diseases Society of America) and CDC guidelines.
 */
export function assessDwellTimeAndProphylaxis(
  hoursAttached: number,
  hoursSinceRemoval: number,
  species: TickSpecies,
  ageInYears = 30,
  isPregnant = false
): IDwellTimeAssessment {
  let dwellTier: AttachmentDwellTier = 'unattached';
  let transmissionProb = 0;

  if (hoursAttached <= 0) {
    dwellTier = 'unattached';
    transmissionProb = 0;
  } else if (hoursAttached < 24) {
    dwellTier = 'under_24h';
    // Very low risk: Borrelia spirochetes require midgut protein upregulation (OspC)
    // taking ~24–36 hours before migrating to tick salivary glands.
    transmissionProb = Math.min(2, Math.round((hoursAttached / 24) * 2));
  } else if (hoursAttached <= 36) {
    dwellTier = '24_to_36h';
    // Early transition phase
    transmissionProb = Math.round(2 + ((hoursAttached - 24) / 12) * 12); // 2% to 14%
  } else if (hoursAttached <= 72) {
    dwellTier = '36_to_72h';
    // Rapid transmission escalation
    transmissionProb = Math.round(14 + ((hoursAttached - 36) / 36) * 55); // 14% to 69%
  } else {
    dwellTier = 'over_72h';
    // Peak transmission plateau
    transmissionProb = Math.min(92, Math.round(69 + ((hoursAttached - 72) / 24) * 15));
  }

  // IDSA Criteria for Single-Dose Doxycycline Prophylaxis (200 mg):
  // 1. Attached tick is an identified blacklegged tick (Ixodes scapularis)
  // 2. Tick estimated to have been attached >= 36 hours (engorgement / dwell time)
  // 3. Prophylaxis can be started within 72 hours of tick removal
  // 4. Local rate of tick Borrelia infection is >= 20% (Nantucket is ~40-60%)
  // 5. Doxycycline is not contraindicated (e.g. pregnancy, though AAP now approves short-course doxycycline for children of all ages).
  const isBlacklegged = species === 'ixodes_nymph' || species === 'ixodes_adult';
  const attachedAtLeast36h = hoursAttached >= 36;
  const removedWithin72h = hoursSinceRemoval <= 72 && hoursSinceRemoval >= 0;
  const noContraindications = !isPregnant; // simplified clinical rule

  const doxycyclineEligible = 
    isBlacklegged && 
    attachedAtLeast36h && 
    removedWithin72h && 
    noContraindications;

  const hoursRemaining = Math.max(0, 72 - hoursSinceRemoval);

  let recommendation = '';
  if (doxycyclineEligible) {
    recommendation = `✅ High Clinical Indication for Prophylaxis: Single-dose oral Doxycycline (200 mg for adults, 4.4 mg/kg up to 200 mg for children) is recommended within the next ${hoursRemaining} hours. Contact Nantucket Cottage Hospital Walk-in Clinic (508-825-1000) or your clinician immediately.`;
  } else if (!isBlacklegged) {
    recommendation = `ℹ️ Prophylaxis Not Indicated for Non-Blacklegged Ticks: Dog ticks and Lone Star ticks do not transmit Lyme disease. Monitor for species-specific signs (e.g. Rocky Mountain Spotted Fever or Alpha-Gal meat allergy symptoms).`;
  } else if (!attachedAtLeast36h) {
    recommendation = `ℹ️ Prophylaxis Not Indicated (Attachment < 36 Hours): Transmission of Borrelia burgdorferi is extremely rare (<2%) under 36 hours of attachment. Routine prophylactic antibiotics are not indicated. Initiate a 30-day symptom watch calendar.`;
  } else if (!removedWithin72h) {
    recommendation = `⚠️ Past 72-Hour Prophylaxis Window: More than 72 hours have elapsed since tick removal. Single-dose prophylaxis is no longer effective. Monitor closely for Erythema migrans rash, fever, or joint pain; seek prompt evaluation for a full treatment course if symptoms emerge.`;
  } else if (isPregnant) {
    recommendation = `⚠️ Pregnancy Precaution: Doxycycline is typically avoided during pregnancy. Consult with your obstetrician / primary care provider for personalized clinical monitoring or alternative assessment.`;
  }

  return {
    estimatedHours: hoursAttached,
    dwellTier,
    lymeTransmissionProbability: isBlacklegged ? transmissionProb : 0,
    doxycyclineProphylaxisEligible: doxycyclineEligible,
    prophylaxisCriteriaMet: {
      attachedAtLeast36h,
      removedWithin72h,
      speciesIsBlacklegged: isBlacklegged,
      noContraindications
    },
    clinicalRecommendation: recommendation,
    hoursRemainingIn72hWindow: hoursRemaining
  };
}
