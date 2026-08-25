import { Injectable, signal, computed } from '@angular/core';

export interface IOsceScenario {
  id: string;
  title: string;
  category: 'Cardiovascular / Teledentistry' | 'Trauma / Surgical Codex' | 'Longevity / Functional Medicine';
  difficulty: 'Medical Student' | 'Resident Physician' | 'Attending Fellow';
  chiefComplaint: string;
  vitals: { hr: string; bp: string; spO2: string; temp: string };
  keyClinicalFindings: string[];
  correctDiagnoses: string[];
  recommendedOrders: string[];
}

export interface IOsceEvaluationResult {
  overallScore: number; // 0 - 100
  diagnosticAccuracyScore: number; // 0 - 100
  patientSafetyScore: number; // 0 - 100
  status: 'PASSED WITH DISTINCTION' | 'PASSED' | 'NEEDS REVISION';
  examinerFeedback: string;
  matchedDiagnoses: string[];
  matchedOrders: string[];
}

@Injectable({
  providedIn: 'root'
})
export class OsceTrainerService {
  readonly scenarios = signal<IOsceScenario[]>([
    {
      id: 'osce_sibi_cardio',
      title: 'Case #101: Systemic Periodontal Inflammatory Burden (SIBI) & CV Trajectory',
      category: 'Cardiovascular / Teledentistry',
      difficulty: 'Resident Physician',
      chiefComplaint: '34yo female presents with recurring gingival bleeding, elevated hs-CRP (3.8 mg/L), and mild exertional dyspnea.',
      vitals: { hr: '78 bpm', bp: '132/84 mmHg', spO2: '98%', temp: '36.8°C' },
      keyClinicalFindings: [
        'FDI Odontogram: 4 periodontal sites with probing depth PPD >= 4mm (Teeth 16, 26, 36, 46)',
        'Salivary pH: 6.2 (Acidic biofilm favoring P. gingivalis bacteremia)',
        'SIBI Score: 68 / 100 (Elevated Systemic Inflammatory Burden)',
        'CV Risk Multiplier: 2.22x baseline'
      ],
      correctDiagnoses: ['Generalized Stage II Periodontitis', 'Systemic Inflammatory Endothelial Strain', 'Elevated Cardiovascular Risk'],
      recommendedOrders: ['hs-CRP repeat panel', 'Periodontal scaling & root planing (SRP)', 'Lipid panel & HbA1c screening', 'Vagal HRV biofeedback']
    },
    {
      id: 'osce_edwin_smith',
      title: 'Case #102: Cervical Vertebral Perforation & Mandibular Strain (Edwin Smith Codex Case IV)',
      category: 'Trauma / Surgical Codex',
      difficulty: 'Attending Fellow',
      chiefComplaint: '38yo male presenting post-trauma with neck stiffness, restricted lateral shoulder gaze, and TMJ crepitus.',
      vitals: { hr: '84 bpm', bp: '128/80 mmHg', spO2: '97%', temp: '37.0°C' },
      keyClinicalFindings: [
        '3D Spatial Lens: C3-C5 Cervical Spine facet stiffness with mandibular joint strain',
        'Biophysical Substrate: Type I/III Collagen dermal strain with Subsurface Scattering (SSS) refraction',
        'Edwin Smith Codex Classification: Verdict II (An ailment with which I will contend)'
      ],
      correctDiagnoses: ['Cervical Spine Facet Strain', 'Mandibular Joint Subluxation', 'C3-C5 Myofascial Spasm'],
      recommendedOrders: ['C-spine CT scan without contrast', 'Mandibular joint MRI', 'Cervical collar stabilization', 'Targeted physical therapy']
    },
    {
      id: 'osce_gompertz_longevity',
      title: 'Case #103: Accelerated Biological Aging & Vagal HRV Baroreflex Gain',
      category: 'Longevity / Functional Medicine',
      difficulty: 'Medical Student',
      chiefComplaint: '52yo executive reporting chronic fatigue, circadian rhythm disruption, and reduced heart rate variability.',
      vitals: { hr: '68 bpm', bp: '138/88 mmHg', spO2: '99%', temp: '36.6°C' },
      keyClinicalFindings: [
        'Gompertz-Makeham Longevity Curve: Aging acceleration beta elevated by +18%',
        'Vagal HRV Baroreflex Gain: Low High-Frequency (HF) power spectrum',
        'Phase II Nrf2 Level: Sub-optimal antioxidant response'
      ],
      correctDiagnoses: ['Accelerated Functional Aging', 'Autonomic Nervous System Dysregulation', 'Sub-clinical Metabolic Stress'],
      recommendedOrders: ['BMAL1 14-hour circadian fasting protocol', 'Vagal nerve diaphragmatic breathing (60 BPM sea shanty deck)', 'Nrf2 activator supplementation (Sulforaphane)', '24-hour Holter monitoring']
    }
  ]);

  readonly activeScenarioId = signal<string>('osce_sibi_cardio');
  readonly selectedScenario = computed(() =>
    this.scenarios().find(s => s.id === this.activeScenarioId()) || this.scenarios()[0]
  );
  readonly evaluationResult = signal<IOsceEvaluationResult | null>(null);

  selectScenario(id: string) {
    this.activeScenarioId.set(id);
    this.evaluationResult.set(null);
  }

  evaluateAttempt(userDiagnosis: string, userOrders: string): IOsceEvaluationResult {
    const scenario = this.selectedScenario();
    const diagLower = userDiagnosis.toLowerCase();
    const ordersLower = userOrders.toLowerCase();

    const matchedDiagnoses = scenario.correctDiagnoses.filter(d => diagLower.includes(d.toLowerCase()) || diagLower.includes('periodont') || diagLower.includes('cardio') || diagLower.includes('strain') || diagLower.includes('aging'));
    const matchedOrders = scenario.recommendedOrders.filter(o => ordersLower.includes(o.toLowerCase()) || ordersLower.includes('hba1c') || ordersLower.includes('panel') || ordersLower.includes('therapy') || ordersLower.includes('fasting'));

    const diagPercent = Math.min(100, Math.round((matchedDiagnoses.length / scenario.correctDiagnoses.length) * 100));
    const ordersPercent = Math.min(100, Math.round((matchedOrders.length / scenario.recommendedOrders.length) * 100));
    
    // Safety score baseline
    const safetyScore = (diagPercent > 0 && ordersPercent > 0) ? 95 : 70;
    const overallScore = Math.round((diagPercent * 0.45) + (ordersPercent * 0.45) + (safetyScore * 0.10));

    let status: 'PASSED WITH DISTINCTION' | 'PASSED' | 'NEEDS REVISION' = 'NEEDS REVISION';
    if (overallScore >= 85) status = 'PASSED WITH DISTINCTION';
    else if (overallScore >= 65) status = 'PASSED';

    const result: IOsceEvaluationResult = {
      overallScore,
      diagnosticAccuracyScore: diagPercent,
      patientSafetyScore: safetyScore,
      status,
      examinerFeedback: `Examiner Evaluation: Candidate demonstrated ${overallScore >= 65 ? 'strong' : 'preliminary'} clinical reasoning for ${scenario.title}. Matched ${matchedDiagnoses.length} key diagnostic criteria and ${matchedOrders.length} evidence-based orders.`,
      matchedDiagnoses,
      matchedOrders
    };

    this.evaluationResult.set(result);
    return result;
  }
}
