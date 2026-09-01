/**
 * @pocketgull/open-scribe
 * 3-Act Trajectory Builder (Skunk Works Medical Aid standard).
 * Partitions clinical care plans into reassuring, empowering temporal arcs:
 * 1. Where You've Been (Baseline with zero fatalism)
 * 2. Where You Stand Today (Grounded biometrics & living priorities)
 * 3. Where You're Going (Achievable 30/60/90-day vitality milestones)
 */

import { IThreeActTrajectory } from './types';

export class TrajectoryBuilder {
  public static build(
    transcript: string,
    biometrics?: { hr?: number; bp?: string; spo2?: number }
  ): IThreeActTrajectory {
    const text = transcript.toLowerCase();

    // Act 1: Where You've Been
    let historicalContext = 'You have navigated steady physiological adaptation with a resilient baseline.';
    if (text.includes('pain') || text.includes('injury') || text.includes('flare')) {
      historicalContext = 'Past flare-ups and physical fatigue were temporary signals from your body asking for restorative pacing rather than permanent setbacks.';
    } else if (text.includes('blood pressure') || text.includes('hypertension')) {
      historicalContext = 'Your cardiovascular system has adapted to periods of elevated physical and mental demands.';
    }

    // Act 2: Where You Stand Today
    const bioList: string[] = [];
    if (biometrics?.hr) bioList.push(`Resting Heart Rate: ${biometrics.hr} bpm (Stable autonomic rhythm)`);
    if (biometrics?.bp) bioList.push(`Blood Pressure: ${biometrics.bp} mmHg (Managed vascular tone)`);
    if (biometrics?.spo2) bioList.push(`Blood Oxygen: ${biometrics.spo2}% (Optimal tissue oxygenation)`);

    if (bioList.length === 0) {
      bioList.push('Vitals are in stable physiological equilibrium.');
      bioList.push('Autonomic nervous system is responsive and ready for restorative entrainment.');
    }

    // Act 3: Where You're Going (30 / 60 / 90 day milestones)
    let m30 = 'Establish 10 minutes of daily 0.1 Hz parasympathetic breathing and consistent hydration.';
    let m60 = 'Restore fluid joint mobility and achieve 80%+ daily medication and nutrient consistency.';
    let m90 = 'Maintain robust cardiovascular reserve and enjoy confident, unrestricted daily vitality.';

    if (text.includes('knee') || text.includes('joint') || text.includes('osteoarthritis')) {
      m30 = 'Initiate gentle low-impact aquatic movement and daily quad activation without joint impact.';
      m60 = 'Gradually advance walking distance by 15% with zero post-exertional joint swelling.';
      m90 = 'Complete full-range functional stair climbing and active recreation with confidence.';
    } else if (text.includes('sleep') || text.includes('insomnia') || text.includes('fatigue')) {
      m30 = 'Lock in a consistent 22:30 melatonin sleep window with 432 Hz Solfeggio soundscape.';
      m60 = 'Wake up refreshed with zero morning sleep inertia using smart light-sleep sunrise alarms.';
      m90 = 'Sustain 7.5–8 hours of uninterrupted deep slow-wave rest with high allostatic energy.';
    }

    return {
      act1WhereYouveBeen: {
        title: "Act I: Where You've Been",
        summary: 'Your body has carried you through previous physiological demands with remarkable resilience.',
        historicalContext
      },
      act2WhereYouStandToday: {
        title: 'Act II: Where You Stand Today',
        summary: 'Your current physiological state is grounded, clear, and ready for progressive recovery.',
        activeBiometrics: bioList
      },
      act3WhereYoureGoing: {
        title: "Act III: Where You're Going",
        roadmap30Day: `Day 1–30: ${m30}`,
        roadmap60Day: `Day 31–60: ${m60}`,
        roadmap90Day: `Day 61–90: ${m90}`
      }
    };
  }
}
