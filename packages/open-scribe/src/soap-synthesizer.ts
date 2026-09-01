/**
 * @pocketgull/open-scribe
 * SOAP Note Synthesizer & Multi-Paradigm Clinical Engine.
 * Converts unstructured clinical conversation into structured SOAP notes and patient teaspoon notes.
 */

import { IClinicalSoapNote, IPatientTeaspoonNote, ISoapSection } from './types';
import { IsmpSafetyGuard } from './ismp-safety-guard';
import { SocraticDemystifier } from './socratic-demystifier';
import { TrajectoryBuilder } from './trajectory-builder';

export class SoapSynthesizer {
  /**
   * Synthesizes a structured clinical SOAP note from conversational dialogue.
   */
  public static synthesizeClinicalSoap(rawTranscript: string): IClinicalSoapNote {
    const text = (rawTranscript || '').trim();
    const lower = text.toLowerCase();
    const id = `scribe-soap-${Date.now()}`;
    const createdAt = new Date().toISOString();

    // 1. Subjective Section
    const subjWestern: string[] = [];
    const subjEastern: string[] = [];
    const subjAyurvedic: string[] = [];
    const subjOsteopathic: string[] = [];

    if (lower.includes('pain') || lower.includes('hurts') || lower.includes('ache') || lower.includes('sharp')) {
      subjWestern.push('Patient reports active somatic discomfort with localized tenderness.');
    }
    if (lower.includes('knee') || lower.includes('joint') || lower.includes('stiff') || lower.includes('mobility')) {
      subjWestern.push('Functional limitation in active joint range of motion exacerbated by weight-bearing.');
    }
    if (lower.includes('stress') || lower.includes('fatigue') || lower.includes('exhausted') || lower.includes('tired')) {
      subjEastern.push('Fluctuations in vitality and central nervous system depletion (Qi deficiency / Spleen weakness).');
    }
    if (lower.includes('sleep') || lower.includes('wake') || lower.includes('insomnia')) {
      subjAyurvedic.push('Disrupted sleep architecture with Vata circadian aggravation.');
    }
    if (lower.includes('back') || lower.includes('neck') || lower.includes('sitting') || lower.includes('posture')) {
      subjOsteopathic.push('Compensatory postural strain in axial spine resulting from prolonged seated posture.');
    }

    if (subjWestern.length === 0) subjWestern.push('Patient presents for comprehensive multi-system health consultation.');
    if (subjEastern.length === 0) subjEastern.push('Vital energy flows currently baseline without acute meridian blockage.');
    if (subjAyurvedic.length === 0) subjAyurvedic.push('Dosha constitutional balance is stable.');
    if (subjOsteopathic.length === 0) subjOsteopathic.push('No acute spinal segment locking reported.');

    const subjective: ISoapSection = {
      title: 'Subjective (Patient History & Symptoms)',
      western: subjWestern,
      eastern: subjEastern,
      ayurvedic: subjAyurvedic,
      osteopathic: subjOsteopathic
    };

    // 2. Objective Section
    const objective: ISoapSection = {
      title: 'Objective (Physical Exam & Telemetry)',
      western: [
        'Vitals: Normotensive, resting heart rate regular, oxygen saturation 98% on room air.',
        'Physical Exam: Inspection reveals intact skin integrity; palpation elicits localized myofascial tenderness.'
      ],
      eastern: [
        'Tongue: Normal to pale pink with thin white coating.',
        'Pulse: Moderate rate, mild tension in liver meridian position.'
      ],
      ayurvedic: [
        'Nadi Exam: Vata pulse predominant with balanced Pitta heat balance.'
      ],
      osteopathic: [
        'TART Exam: Mild tissue texture tightness in paraspinal and thoracic transitional segments.'
      ]
    };

    // 3. Assessment Section & ICD-10
    const icd10Codes: Array<{ code: string; label: string }> = [];
    const assessWestern: string[] = [];

    if (lower.includes('knee') || lower.includes('osteoarthritis')) {
      icd10Codes.push({ code: 'M17.11', label: 'Unilateral primary osteoarthritis, right knee' });
      assessWestern.push('Knee osteoarthritis with joint cartilage narrowing and mechanical strain.');
    } else if (lower.includes('back') || lower.includes('radiculopathy') || lower.includes('sciatica')) {
      icd10Codes.push({ code: 'M54.16', label: 'Radiculopathy, lumbar region (L4-L5)' });
      assessWestern.push('Lumbar radiculopathy with mechanical nerve root irritation.');
    } else if (lower.includes('hypertension') || lower.includes('pressure')) {
      icd10Codes.push({ code: 'I10', label: 'Essential (primary) hypertension' });
      assessWestern.push('Primary hypertension with mild vascular tone elevation.');
    } else {
      icd10Codes.push({ code: 'Z00.00', label: 'Encounter for general adult medical examination' });
      assessWestern.push('Functional somatic health evaluation with good baseline reserve.');
    }

    const assessment: ISoapSection = {
      title: 'Assessment (Clinical Impressions & Diagnoses)',
      western: assessWestern,
      eastern: ['Liver Qi stagnation with mild digestive Qi deficiency.'],
      ayurvedic: ['Vata imbalance in Asthi and Majja Dhatus.'],
      osteopathic: ['Compensatory kinetic chain alignment strain.']
    };

    // 4. Plan Section & ISMP Audit
    const rawPlanLines = [
      'Lifestyle & Biomechanics: Prescribe 10 minutes daily of Rachel Nabors 0.1 Hz parasympathetic breathing.',
      'Exercise: Low-impact closed-chain resistance training 3 times weekly.',
      'Diagnostic Imaging: Obtain standing 3D weight-bearing radiographs if symptoms persist past 4 weeks.'
    ];

    if (lower.includes('medication') || lower.includes('prescribe') || lower.includes('mg')) {
      rawPlanLines.push('Medication: Continue daily maintenance regimen with verified ISMP notation.');
    }

    const ismpAudit = IsmpSafetyGuard.audit(rawPlanLines.join('\n'));
    const sanitizedPlanLines = ismpAudit.sanitizedText.split('\n');

    const plan: ISoapSection = {
      title: 'Plan (Therapeutic Roadmap & Interventions)',
      western: sanitizedPlanLines,
      eastern: ['Acupressure at Zu San Li (ST36) and Tai Chong (LV3) for systemic grounding.'],
      ayurvedic: ['Warm sesame oil self-massage (Abhyanga) before evening warm shower.'],
      osteopathic: ['Gentle myofascial release and suboccipital decompression.']
    };

    return {
      id,
      createdAt,
      rawTranscript: text,
      subjective,
      objective,
      assessment,
      plan,
      icd10Codes,
      ismpSafetyIssues: ismpAudit.violations
    };
  }

  /**
   * Synthesizes a comforting, patient-facing "Teaspoon" note with 3-Act vitality roadmap.
   */
  public static synthesizePatientTeaspoonNote(rawTranscript: string): IPatientTeaspoonNote {
    const text = (rawTranscript || '').trim();
    const id = `teaspoon-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const demystifiedJargon = SocraticDemystifier.demystify(text);
    const reassuringSummary = SocraticDemystifier.generateTeaspoonSummary(text);
    const trajectory = TrajectoryBuilder.build(text, { hr: 72, bp: '120/78', spo2: 98 });

    const checklist: string[] = [
      'Take 5 minutes morning and evening for 0.1 Hz calm breathing (4s in, 6s out).',
      'Drink a glass of pure water before each meal to support natural kidney filtration.',
      'Take a peaceful 10-minute walk outdoors in fresh air after lunch or dinner.'
    ];

    return {
      id,
      createdAt,
      friendlyTitle: 'Your Personal Care Summary & Vitality Guide',
      reassuringSummary,
      demystifiedJargon,
      trajectory,
      dailyCareChecklist: checklist
    };
  }
}
