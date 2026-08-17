import { Injectable, signal } from '@angular/core';

export interface IYouthDigitalHygieneProfile {
  ageYears: number;
  dailyScreenTimeHours: number;
  lateNightScreenUseMinutes: number; // minutes after 10 PM
  attentionalFragmentationScore: number; // 1 to 10 (10 = severe distraction)
  subjectiveExamOrSocialAnxietyScale: number; // 1 to 10
  isEarlyCareerClinicianOrStudent: boolean;
  menstrualCyclePhase?: 'Follicular' | 'Ovulatory' | 'Luteal' | 'Menstrual' | 'Not_Applicable';
}

export interface IYouthHygieneReport {
  reportId: string;
  digitalDopamineLoadIndex: number; // 0 to 100 (lower is healthier)
  circadianMelatoninSuppressionRisk: 'HIGH_SUPPRESSION' | 'MODERATE_DELAY' | 'OPTIMAL_SYNCHRONY';
  attentiveRestorationPlan: {
    kaplanNatureResetMinutes: number;
    binauralAutonomicPacingFrequencyHz: number; // e.g. 10Hz Alpha / 6Hz Theta
    fractalVisualRelaxationProtocol: string;
  };
  hormonalOrMetabolicSovereigntyDirectives: string[];
  earlyCareerClinicianScaffolding?: {
    socraticDiagnosticCoachingTip: string;
    burnoutMitigationAction: string;
    electronicDocumentationEliminationMinutes: number;
  };
  actionableDailyRegimen: Array<{
    timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Pre_Sleep';
    directive: string;
    biophysicalRationale: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class YouthNeurodevelopmentHygieneService {
  readonly activeReports = signal<IYouthHygieneReport[]>([]);

  /**
   * Generates a tailored digital hygiene, circadian restoration, and cognitive scaffolding protocol
   * for youth, adolescents, digital natives, and early-career healthcare trainees.
   */
  evaluateYouthHygiene(profile: IYouthDigitalHygieneProfile): IYouthHygieneReport {
    // 1. Calculate Digital Dopamine Load Index (0-100)
    let dopamineLoad = Math.min(100, Math.round(
      (profile.dailyScreenTimeHours * 6.5) +
      (profile.lateNightScreenUseMinutes / 120 * 25) +
      (profile.attentionalFragmentationScore * 4.0)
    ));
    dopamineLoad = Math.max(10, Math.min(99, dopamineLoad));

    // 2. Circadian Melatonin Suppression Risk
    let circadianRisk: IYouthHygieneReport['circadianMelatoninSuppressionRisk'] = 'OPTIMAL_SYNCHRONY';
    if (profile.lateNightScreenUseMinutes > 90 || profile.dailyScreenTimeHours > 8) {
      circadianRisk = 'HIGH_SUPPRESSION';
    } else if (profile.lateNightScreenUseMinutes > 30 || profile.dailyScreenTimeHours > 5) {
      circadianRisk = 'MODERATE_DELAY';
    }

    // 3. Kaplan Attention Restoration Protocol
    const natureMinutes = dopamineLoad > 70 ? 25 : dopamineLoad > 40 ? 15 : 10;
    const binauralHz = profile.subjectiveExamOrSocialAnxietyScale >= 7 ? 6.0 : 10.0; // 6Hz Theta for high anxiety, 10Hz Alpha for focus

    // 4. Hormonal / Infradian Directives
    const hormonalDirectives: string[] = [
      'Prioritize qualitative micronutrient density and healthy fats (avocado, walnuts, olive oil) over calorie restriction.',
      'Maintain 20–30g morning protein within 60 minutes of waking to stabilize peripheral glucose sensors and blunt mid-day dopamine crashes.'
    ];

    if (profile.menstrualCyclePhase === 'Luteal') {
      hormonalDirectives.push('Luteal Phase Focus: Increase magnesium glycinate (300mg) and complex carbohydrates to support natural progesterone synthesis and reduce premenstrual anxiety.');
    } else if (profile.menstrualCyclePhase === 'Follicular') {
      hormonalDirectives.push('Follicular Phase Focus: Estrogen rise supports peak neuroplasticity and strength training adaptation; optimize antioxidant cruciferous intake.');
    }

    // 5. Early Career Clinician Scaffolding
    let clinicalScaffolding: IYouthHygieneReport['earlyCareerClinicianScaffolding'];
    if (profile.isEarlyCareerClinicianOrStudent) {
      clinicalScaffolding = {
        socraticDiagnosticCoachingTip: 'Before committing to a diagnosis, practice formulating at least two high-consequence "cannot-miss" alternatives and one non-pathological physiological mimicker.',
        burnoutMitigationAction: 'Deploy PocketGull ambient scribing to capture bedside dialogue, completely eliminating 2.5 hours of post-shift EHR note typing.',
        electronicDocumentationEliminationMinutes: 150
      };
    }

    const report: IYouthHygieneReport = {
      reportId: `YOUTH-COG-${Date.now().toString(36).toUpperCase()}`,
      digitalDopamineLoadIndex: dopamineLoad,
      circadianMelatoninSuppressionRisk: circadianRisk,
      attentiveRestorationPlan: {
        kaplanNatureResetMinutes: natureMinutes,
        binauralAutonomicPacingFrequencyHz: binauralHz,
        fractalVisualRelaxationProtocol: '2-minute immersion in 3D procedural Three.js nature fractals to lower prefrontal cortex beta-wave hyperarousal.'
      },
      hormonalOrMetabolicSovereigntyDirectives: hormonalDirectives,
      earlyCareerClinicianScaffolding: clinicalScaffolding,
      actionableDailyRegimen: [
        {
          timeOfDay: 'Morning',
          directive: '10–15 minutes of direct natural outdoor sunlight before viewing high-intensity OLED phone screens.',
          biophysicalRationale: 'Anchors the suprachiasmatic nucleus (SCN) central circadian pacemaker and sets the 14-hour melatonin synthesis countdown timer.'
        },
        {
          timeOfDay: 'Afternoon',
          directive: 'Take a 5-minute visual break looking at objects >20 feet away (20-20-20 rule) with diaphragmatic 4-7-8 breathing.',
          biophysicalRationale: 'Relieves ciliary muscle accommodation spasm and engages the parasympathetic vagal brake.'
        },
        {
          timeOfDay: 'Evening',
          directive: 'Switch personal devices to greyscale / warm shift filter (2700K) 90 minutes prior to intended sleep time.',
          biophysicalRationale: 'Prevents melanopsin-mediated retinal ganglion cell excitation that blocks pineal melatonin release.'
        },
        {
          timeOfDay: 'Pre_Sleep',
          directive: 'Zero social comparison browsing in bed; engage in offline reading or tactile relaxation.',
          biophysicalRationale: 'Eliminates dopamine spike anticipation, allowing transition into Stage 3 slow-wave deep sleep.'
        }
      ]
    };

    this.activeReports.update(reports => [report, ...reports.slice(0, 19)]);
    return report;
  }
}
