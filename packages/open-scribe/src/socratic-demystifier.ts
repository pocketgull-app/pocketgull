/**
 * @pocketgull/open-scribe
 * Socratic Plain-Language Demystifier & "Teaspoon" Explanation Engine.
 * Translates frightening, opaque clinical jargon into warm, empowering 5th-grade analogies and action steps.
 */

import { IDemystifiedExplanation } from './types';

export class SocraticDemystifier {
  private static readonly JARGON_KNOWLEDGE_BASE: Record<string, IDemystifiedExplanation> = {
    egfr: {
      term: 'eGFR (Estimated Glomerular Filtration Rate)',
      category: 'BIOMARKER',
      plainEnglish: 'A simple score measuring how quickly and thoroughly your kidneys clean waste and excess fluid from your bloodstream.',
      teaspoonAnalogy: 'Think of your kidneys like a coffee filter cleaning your kitchen water. A score of 90+ means the filter is flowing freely; lower numbers mean water is filtering more slowly, so we want to keep you hydrated and protect the filter mesh.',
      empoweringAction: 'Drink consistent pure water throughout the day, moderate salt intake, and avoid excessive NSAID pain relievers (like ibuprofen) which strain the filter.'
    },
    troponin: {
      term: 'Troponin I / T',
      category: 'BIOMARKER',
      plainEnglish: 'A special protein found inside heart muscle cells that only leaks into the bloodstream if the heart muscle experiences acute stress or injury.',
      teaspoonAnalogy: 'Think of troponin like the packing foam inside a safe. It only spills out into the room if the safe gets jostled or bumped. Checking troponin tells doctors whether your heart muscle is resting peacefully or needs immediate oxygen support.',
      empoweringAction: 'Rest completely, avoid physical exertion during active evaluation, and inform your care team immediately of any chest tightness or shortness of breath.'
    },
    hba1c: {
      term: 'HbA1c (Hemoglobin A1c)',
      category: 'BIOMARKER',
      plainEnglish: 'A 90-day biological average of your blood sugar levels, showing how much sugar has stuck to your red blood cells over their lifespan.',
      teaspoonAnalogy: 'Imagine dipping a coat hanger in sugar water each day. The thicker the sugar glaze on the hanger after 3 months, the higher the HbA1c. A single high day doesn\'t ruin the average, and steady daily movement steadily thins the glaze.',
      empoweringAction: 'A gentle 10-minute walk after meals helps your leg muscles vacuum up blood sugar naturally without needing extra insulin.'
    },
    radiculopathy: {
      term: 'Radiculopathy (Pinch / Nerve Irritation)',
      category: 'CLINICAL',
      plainEnglish: 'Irritation or mild pressure on an electrical nerve root as it exits the spinal column, often sending tingling or numbness down the leg or arm.',
      teaspoonAnalogy: 'Think of a garden hose with a foot gently resting on it in the backyard. The water (or nerve signal) flows sluggishly and creates a tingling sensation down at the garden sprinkler. Releasing the pressure restores smooth flow.',
      empoweringAction: 'Avoid deep forward bending with heavy weights; use gentle pelvic tilts and gentle walking to decompress the spinal disc.'
    },
    osteoarthritis: {
      term: 'Osteoarthritis (Joint Cartilage Wear)',
      category: 'CLINICAL',
      plainEnglish: 'The natural smooth cartilage cushion inside a joint has thinned over time, causing the bones to glide closer together.',
      teaspoonAnalogy: 'Like the brake pads on a well-loved bicycle that have worn down over thousands of miles. Moving the joint gently circulates warm fluid (like oil on a bike chain) to keep it gliding comfortably.',
      empoweringAction: 'Low-impact swimming, cycling, and daily gentle range-of-motion stretching keep joint lubrication fluid circulating.'
    },
    irmaa: {
      term: 'IRMAA (Medicare High-Income Surcharge)',
      category: 'FINANCIAL',
      plainEnglish: 'An extra monthly fee added to Medicare Part B & D premiums based on your tax return from two years ago.',
      teaspoonAnalogy: 'Like receiving a higher utility bill today based on how much electricity you used two years ago during a heatwave. If your income dropped recently (e.g. you retired), you can tell Medicare to update your bill today.',
      empoweringAction: 'Submit Social Security Form SSA-44 with proof of your life-changing event (retirement or job change) to eliminate the surcharge and save thousands.'
    },
    pdc: {
      term: 'PDC (Proportion of Days Covered)',
      category: 'MEDICATION',
      plainEnglish: 'The percentage of days in a year that you have your vital maintenance medication in your medicine cabinet.',
      teaspoonAnalogy: 'Like keeping enough fuel in your car\'s gas tank so you never get stranded on the highway. Aiming for 80%+ PDC means your body has constant, steady protection.',
      empoweringAction: 'Set up 90-day mail-order refills or pharmacy auto-refills so you never experience a gap.'
    },
    hypertension: {
      term: 'Hypertension (High Blood Pressure)',
      category: 'CLINICAL',
      plainEnglish: 'The physical pressure of blood pushing against the walls of your arteries is consistently higher than ideal.',
      teaspoonAnalogy: 'Think of water pressure in a garden hose. When water pressure is too high for years, it puts extra wear on the rubber hose lining and works the water pump (heart) harder than necessary.',
      empoweringAction: 'Practice Rachel Nabors 0.1 Hz breathing (10-second breath cycles: 4s in, 6s out) for 5 minutes to immediately signal your blood vessels to relax.'
    }
  };

  /**
   * Scans any clinical note or transcript, extracting all matched medical jargon terms
   * and providing structured 5th-grade plain-language translations.
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
   * Generates a warm, comforting plain-language summary paragraph for the patient.
   */
  public static generateTeaspoonSummary(rawTranscript: string): string {
    const demystified = this.demystify(rawTranscript);
    if (demystified.length === 0) {
      return 'Your clinical consultation reviewed your baseline health status, daily routines, and physiological balance. Your overall markers are stable and we have outlined clear, manageable daily steps for you below.';
    }

    const firstTerm = demystified[0];
    return `During today's visit, we focused on understanding ${firstTerm.term}. In simple terms, ${firstTerm.plainEnglish.toLowerCase()} ${firstTerm.teaspoonAnalogy}`;
  }
}
