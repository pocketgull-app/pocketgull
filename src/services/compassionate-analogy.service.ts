import { Injectable } from '@angular/core';

export interface ICompassionateTranslation {
  personaTitle: string;
  greeting: string;
  overviewSummary: string;
  vitalsAnalogy: string;
  carePlanSteps: string[];
  reassuranceStatement: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompassionateAnalogyService {
  /**
   * Generates a clear, empowering, patient-facing plain language clinical summary.
   */
  public generateClinicalPatientTranslation(patientName: string, vitalsStr: string, issues: string[]): ICompassionateTranslation {
    const name = patientName || 'Patient';
    return {
      personaTitle: '🩺 Clinical Plain-Language Care Summary',
      greeting: `Welcome, ${name}. Here is a clear, plain-language summary of your care plan and current health status.`,
      overviewSummary: `Your body is resilient and adapting well. The symptoms currently flagged (${issues.join(', ') || 'routine follow-up status'}) are being actively managed through targeted, evidence-based clinical steps.`,
      vitalsAnalogy: `Vitals Baseline: Heart rate and blood pressure are being tracked (Vitals ${vitalsStr}). Oxygen saturation and systemic markers remain stable.`,
      carePlanSteps: [
        '🫀 Cardiovascular Hygiene: Daily moderate walking to support baroreflex sensitivity and circulation.',
        '💧 Cellular Hydration: 2.0 to 2.5L clean water daily to optimize renal filtration.',
        '😴 Sleep & Recovery: 7-8 hours of restful sleep to facilitate cellular repair and cognitive function.'
      ],
      reassuranceStatement: `You are in good hands, ${name}. We will continue monitoring your baseline closely and adjusting your care plan as needed.`
    };
  }

  /**
   * Generates a 3-chapter Clinical Trajectory Biography
   */
  public generateTrajectoryBiography(patientName: string): { title: string; chapters: Array<{ era: string; heading: string; body: string; badge: string }> } {
    const name = patientName || 'Patient';
    return {
      title: `📋 Clinical Care Trajectory: ${name}'s Journey`,
      chapters: [
        {
          era: 'Chapter I: Baseline Assessment',
          heading: 'Initial Intake & Vitals Mapping',
          body: `Initial evaluation established baseline biometrics, functional movement score, and symptom history. Core physiological systems were evaluated for risk factors.`,
          badge: '🩺 Baseline Established'
        },
        {
          era: 'Chapter II: Targeted Care & Intervention',
          heading: 'Therapeutic Optimization',
          body: `Implementation of targeted lifestyle interventions, nutritional guidance, and clinical consultation to address key identified symptoms.`,
          badge: '⚡ Active Care'
        },
        {
          era: 'Chapter III: Long-Term Maintenance',
          heading: 'Sustained Wellness & Prevention',
          body: `Ongoing monitoring, periodic biomarker tracking, and preventative adjustments to maintain long-term health trajectory and quality of life.`,
          badge: '🌟 Long-Term Health'
        }
      ]
    };
  }
}
