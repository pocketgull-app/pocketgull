/**
 * @pocketgull/open-scribe
 * Socratic Plain-Language Demystifier & "Teaspoon" Explanation Engine.
 * Translates frightening, opaque clinical jargon into warm, empowering 5th-grade analogies and action steps.
 */

import { IDemystifiedExplanation, ISocraticQuestionCard } from './types';

export class SocraticDemystifier {
  private static readonly JARGON_KNOWLEDGE_BASE: Record<string, IDemystifiedExplanation> = {
    egfr: {
      term: 'eGFR (Estimated Glomerular Filtration Rate)',
      category: 'BIOMARKER',
      plainEnglish: 'A simple score measuring how quickly and thoroughly your kidneys clean waste and excess fluid from your bloodstream.',
      teaspoonAnalogy: 'Think of your kidneys like a coffee filter cleaning your kitchen water. A score of 90+ means the filter is flowing freely; lower numbers mean water is filtering more slowly, so we want to keep you hydrated and protect the filter mesh.',
      empoweringAction: 'Drink consistent pure water throughout the day, moderate salt intake, and avoid excessive NSAID pain relievers (like ibuprofen) which strain the filter.',
      socraticInquiry: 'Looking at your daily water intake and usual routines, where is one small window of the day where enjoying an extra glass of water feels most effortless for you?',
      falsifiabilityWarning: 'A single dip in eGFR during acute dehydration or illness is not permanent kidney failure; numbers often bounce back when you are well-hydrated.'
    },
    troponin: {
      term: 'Troponin I / T',
      category: 'BIOMARKER',
      plainEnglish: 'A special protein found inside heart muscle cells that only leaks into the bloodstream if the heart muscle experiences acute stress or injury.',
      teaspoonAnalogy: 'Think of troponin like the packing foam inside a safe. It only spills out into the room if the safe gets jostled or bumped. Checking troponin tells doctors whether your heart muscle is resting peacefully or needs immediate oxygen support.',
      empoweringAction: 'Rest completely, avoid physical exertion during active evaluation, and inform your care team immediately of any chest tightness or shortness of breath.',
      socraticInquiry: 'How is your breathing and chest comfort feeling right at this moment as you rest?',
      falsifiabilityWarning: 'Mild troponin elevations can also happen during strenuous endurance exercise, severe infections, or kidney strain—it is an indicator of heart work, not an immediate heart attack.'
    },
    hba1c: {
      term: 'HbA1c (Hemoglobin A1c)',
      category: 'BIOMARKER',
      plainEnglish: 'A 90-day biological average of your blood sugar levels, showing how much sugar has stuck to your red blood cells over their lifespan.',
      teaspoonAnalogy: 'Imagine dipping a coat hanger in sugar water each day. The thicker the sugar glaze on the hanger after 3 months, the higher the HbA1c. A single high day doesn\'t ruin the average, and steady daily movement steadily thins the glaze.',
      empoweringAction: 'A gentle 10-minute walk after meals helps your leg muscles vacuum up blood sugar naturally without needing extra insulin.',
      socraticInquiry: 'Which meal in your daily routine has the calmest space for a brief 10-minute stroll around the block or living room?',
      falsifiabilityWarning: 'An elevated HbA1c reflects a 3-month pattern, not a moral failing or permanent state; blood cells refresh completely every 90 to 120 days.'
    },
    radiculopathy: {
      term: 'Radiculopathy (Pinch / Nerve Irritation)',
      category: 'CLINICAL',
      plainEnglish: 'Irritation or mild pressure on an electrical nerve root as it exits the spinal column, often sending tingling or numbness down the leg or arm.',
      teaspoonAnalogy: 'Think of a garden hose with a foot gently resting on it in the backyard. The water (or nerve signal) flows sluggishly and creates a tingling sensation down at the garden sprinkler. Releasing the pressure restores smooth flow.',
      empoweringAction: 'Avoid deep forward bending with heavy weights; use gentle pelvic tilts and gentle walking to decompress the spinal disc.',
      socraticInquiry: 'What positions (like lying with knees bent or gentle walking) give your back and legs the most relief right now?',
      falsifiabilityWarning: 'Nerve tingling does not mean the nerve is severed; nerves are resilient biological wires that calm down once mechanical compression eases.'
    },
    osteoarthritis: {
      term: 'Osteoarthritis (Joint Cartilage Wear)',
      category: 'CLINICAL',
      plainEnglish: 'The natural smooth cartilage cushion inside a joint has thinned over time, causing the bones to glide closer together.',
      teaspoonAnalogy: 'Like the brake pads on a well-loved bicycle that have worn down over thousands of miles. Moving the joint gently circulates warm fluid (like oil on a bike chain) to keep it gliding comfortably.',
      empoweringAction: 'Low-impact swimming, cycling, and daily gentle range-of-motion stretching keep joint lubrication fluid circulating.',
      socraticInquiry: 'What low-impact activities (like warm water exercise, cycling, or seated stretches) feel smoothest on your joints?',
      falsifiabilityWarning: 'X-ray findings of arthritis do not dictate your pain level; many people with worn cartilage live active, pain-free lives with strong supporting muscles.'
    },
    irmaa: {
      term: 'IRMAA (Medicare High-Income Surcharge)',
      category: 'FINANCIAL',
      plainEnglish: 'An extra monthly fee added to Medicare Part B & D premiums based on your tax return from two years ago.',
      teaspoonAnalogy: 'Like receiving a higher utility bill today based on how much electricity you used two years ago during a heatwave. If your income dropped recently (e.g. you retired), you can tell Medicare to update your bill today.',
      empoweringAction: 'Submit Social Security Form SSA-44 with proof of your life-changing event (retirement or job change) to eliminate the surcharge and save thousands.',
      socraticInquiry: 'Has your household income changed since retirement or during the past two years that we can document on Form SSA-44?',
      falsifiabilityWarning: 'IRMAA surcharges are not locked forever; they can be appealed immediately upon any qualifying life-changing event.'
    },
    pdc: {
      term: 'PDC (Proportion of Days Covered)',
      category: 'MEDICATION',
      plainEnglish: 'The percentage of days in a year that you have your vital maintenance medication in your medicine cabinet.',
      teaspoonAnalogy: 'Like keeping enough fuel in your car\'s gas tank so you never get stranded on the highway. Aiming for 80%+ PDC means your body has constant, steady protection.',
      empoweringAction: 'Set up 90-day mail-order refills or pharmacy auto-refills so you never experience a gap.',
      socraticInquiry: 'What pharmacy system or pill-box routine makes it easiest for you to never miss a refill day?',
      falsifiabilityWarning: 'A temporary gap in medication coverage can be remedied immediately without penalty; your care team is here to help remove cost or delivery barriers.'
    },
    hypertension: {
      term: 'Hypertension (High Blood Pressure)',
      category: 'CLINICAL',
      plainEnglish: 'The physical pressure of blood pushing against the walls of your arteries is consistently higher than ideal.',
      teaspoonAnalogy: 'Think of water pressure in a garden hose. When water pressure is too high for years, it puts extra wear on the rubber hose lining and works the water pump (heart) harder than necessary.',
      empoweringAction: 'Practice 0.1 Hz autonomic vagal breathing (10-second breath cycles: 4s in, 6s out) for 5 minutes to immediately signal your blood vessels to relax.',
      socraticInquiry: 'During moments of rush or stress, what is one physical sensation in your shoulders or breath that tells you it is time for three slow exhales?',
      falsifiabilityWarning: 'A single high blood pressure reading at the doctor\'s office (white-coat effect) is not chronic hypertension; relaxed home morning averages provide the true picture.'
    },
    creatinine: {
      term: 'Serum Creatinine',
      category: 'BIOMARKER',
      plainEnglish: 'A natural breakdown product of muscle energy that your kidneys steadily filter out into urine.',
      teaspoonAnalogy: 'Think of creatinine like the sawdust produced when woodworking. A clean workshop vacuum (healthy kidneys) keeps sawdust levels low; if the vacuum slows down or muscle work surges, sawdust levels rise.',
      empoweringAction: 'Maintain steady daily hydration and retest when well-rested to get an accurate baseline.',
      socraticInquiry: 'Did you do any heavy muscular workouts or experience dehydration right before this lab test was drawn?',
      falsifiabilityWarning: 'Creatinine varies naturally based on muscle mass, dietary protein, and hydration; high muscle mass naturally produces higher baseline numbers.'
    },
    metformin: {
      term: 'Metformin',
      category: 'MEDICATION',
      plainEnglish: 'A foundational, plant-derived medication that gently helps your liver release less stored sugar and makes your muscles more sensitive to natural insulin.',
      teaspoonAnalogy: 'Think of metformin like a polite traffic warden at your liver\'s warehouse door, preventing excess sugar boxes from spilling onto the highway all at once.',
      empoweringAction: 'Take metformin with a substantial meal to ensure smooth digestion and support cellular energy balance.',
      socraticInquiry: 'Taking metformin with which meal of the day feels best on your stomach?',
      falsifiabilityWarning: 'Prescribing metformin does not mean your diabetes is worsening; it is often the safest, gentlest first-line foundation for metabolic longevity.'
    },
    crp: {
      term: 'CRP (C-Reactive Protein / High-Sensitivity CRP)',
      category: 'BIOMARKER',
      plainEnglish: 'A liver protein that temporarily increases in your bloodstream whenever there is active inflammation or immune activity in the body.',
      teaspoonAnalogy: 'Like the smoke detector in your hallway. It beeps when there is cooking smoke or a fire somewhere in the house, telling us the immune system is actively working.',
      empoweringAction: 'Incorporate anti-inflammatory antioxidant foods (berries, leafy greens, olive oil, turmeric) and prioritize 7–8 hours of restorative sleep.',
      socraticInquiry: 'Have you had any recent dental work, colds, minor injuries, or sleep disruptions leading up to this blood test?',
      falsifiabilityWarning: 'An elevated CRP is non-specific; even a mild common cold or dental cleaning can temporarily elevate CRP levels for several days.'
    },
    polypharmacy: {
      term: 'Polypharmacy (Medication Regimen Optimization)',
      category: 'MEDICATION',
      plainEnglish: 'Taking multiple daily prescription or over-the-counter medications that benefit from a structured safety review to prevent drug interactions.',
      teaspoonAnalogy: 'Like having several musical instruments playing in a room. When tuned together harmoniously they make beautiful music, but adding too many players without a conductor can create confusing noise.',
      empoweringAction: 'Bring all your prescription bottles, supplements, and vitamins in a "brown bag" to your annual wellness review for complete reconciliation.',
      socraticInquiry: 'Which of your current daily pills or supplements do you have the most questions about regarding why you are taking it?',
      falsifiabilityWarning: 'Taking multiple medications is not automatically bad when each has a clear clinical purpose; regular reviews ensure every pill is still actively helping you.'
    }
  };

  /**
   * Scans any clinical note or transcript, extracting all matched medical jargon terms
   * and providing structured 5th-grade plain-language translations with Socratic prompts.
   */
  public static demystify(text: string): IDemystifiedExplanation[] {
    if (!text) return [];

    const lower = text.toLowerCase();
    const matches: IDemystifiedExplanation[] = [];
    const seen = new Set<string>();

    for (const [key, entry] of Object.entries(this.JARGON_KNOWLEDGE_BASE)) {
      if (lower.includes(key) && !seen.has(entry.term)) {
        seen.add(entry.term);
        matches.push(entry);
      }
    }

    return matches;
  }

  /**
   * Extracts interactive Socratic inquiry cards from the clinical text to guide
   * the patient in reflective dialogue with their care team.
   */
  public static generateSocraticInquiry(text: string): ISocraticQuestionCard[] {
    const demystified = this.demystify(text);
    return demystified
      .filter(item => Boolean(item.socraticInquiry))
      .map(item => ({
        term: item.term,
        question: item.socraticInquiry!,
        rationale: item.plainEnglish,
        suggestedFocusArea: item.empoweringAction
      }));
  }

  /**
   * Translates abstract medical risk or odds ratios into intuitive, non-catastrophizing
   * Bayesian natural frequencies (e.g., "94 out of 100 people...").
   */
  public static toNaturalFrequency(favorableCount: number, totalCohort: number = 100): string {
    const safeTotal = Math.max(1, totalCohort);
    const safeFavorable = Math.min(safeTotal, Math.max(0, favorableCount));
    return `Out of ${safeTotal} people sharing your exact profile, ${safeFavorable} maintain stable health when following these daily baseline steps.`;
  }

  /**
   * Generates a warm, comforting plain-language summary paragraph for the patient.
   */
  public static generateTeaspoonSummary(rawTranscript: string): string {
    const demystified = this.demystify(rawTranscript);
    if (demystified.length === 0) {
      return 'Your clinical consultation reviewed your baseline health status, daily routines, and physiological balance. Your overall markers are stable and we have outlined clear, manageable daily steps for you below.';
    }

    const firstTerm = demystified[0];
    const falsifiabilityNote = firstTerm.falsifiabilityWarning
      ? ` Remember: ${firstTerm.falsifiabilityWarning}`
      : '';
    return `During today's visit, we focused on understanding ${firstTerm.term}. In simple terms, ${firstTerm.plainEnglish.toLowerCase()} ${firstTerm.teaspoonAnalogy}${falsifiabilityNote}`;
  }
}

