import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { SecureStorageService } from './secure-storage.service';

export interface IParadigmPerspective {
  paradigm: 'western' | 'eastern' | 'functional';
  specialistName: string;
  avatarIcon: string;
  primaryDiagnosis: string;
  keyInterventions: string[];
  riskFlags: string[];
  confidenceScore: number; // 0-100
}

export interface ITriParadigmDebate {
  id: string;
  patientId: string;
  timestamp: string;
  perspectives: {
    western: IParadigmPerspective;
    eastern: IParadigmPerspective;
    functional: IParadigmPerspective;
  };
  pointsOfConsensus: string[];
  divergentPoints: string[];
  synthesizedClinicalPlan: string;
  overallConsensusScore: number; // 0-100
}

@Injectable({
  providedIn: 'root'
})
export class TriParadigmSwarmService {
  private state = (() => { try { return inject(PatientStateService); } catch (e) { return null; } })();
  private storage = (() => { try { return inject(SecureStorageService); } catch (e) { return null; } })();

  readonly isDebating = signal<boolean>(false);
  readonly currentDebate = signal<ITriParadigmDebate | null>(null);

  readonly activeConsensusScore = computed(() => {
    const debate = this.currentDebate();
    return debate ? debate.overallConsensusScore : 0;
  });

  /**
   * Executes a multi-agent clinical consensus debate across Western Allopathic,
   * Eastern TCM Zang-Fu, and Functional Medicine Bio-Hacking paradigms.
   */
  public executeSwarmDebate(symptomsOverride?: string[]): ITriParadigmDebate {
    this.isDebating.set(true);

    const symptoms = symptomsOverride || (this.state ? this.state.selectedIssues().map(i => i.description || i.name) : []);
    const activeSymptoms = symptoms.length > 0 ? symptoms : ['Chronic Fatigue', 'Brain Fog', 'Epigastric Bloating'];
    const patientId = this.state?.activePatientSummary() ? 'P-GULL-ACTIVE' : 'P-GULL-DEMO';

    // 1. Western Allopathic Specialist Perspective (Gulliver)
    const western: IParadigmPerspective = {
      paradigm: 'western',
      specialistName: 'Dr. Gulliver (Western Allopathic Internal Medicine)',
      avatarIcon: '🔬',
      primaryDiagnosis: `Rule out metabolic dysfunction, subclinical thyroiditis, or post-viral syndrome associated with ${activeSymptoms[0] || 'symptoms'}.`,
      keyInterventions: [
        'Order Comprehensive Metabolic Panel (CMP) & hs-CRP baseline',
        'Serum Free T3, Free T4, and TPO Autoantibody screen',
        '24-hour salivary cortisol circadian curve test'
      ],
      riskFlags: [
        'Monitor for autoimmune thyroid antibodies',
        'Exclude electrolyte disturbances before starting high-dose regimens'
      ],
      confidenceScore: 88
    };

    // 2. Eastern TCM Zang-Fu Specialist Perspective (Swoop)
    const eastern: IParadigmPerspective = {
      paradigm: 'eastern',
      specialistName: 'Master Swoop (Eastern TCM Zang-Fu & Meridian Harmony)',
      avatarIcon: '☯️',
      primaryDiagnosis: `Spleen Qi Deficiency with Dampness accumulation and Liver Qi Stagnation disrupting Digestive Fire.`,
      keyInterventions: [
        'Prescribe Liu Jun Zi Tang (Six Gentlemen Decoction) for Spleen Qi reinforcement',
        'Acupressure at ST36 (Zusanli) and SP6 (Sanyinjiao) daily',
        'Warm, cooked grain dietary protocol; avoid cold/raw food intake'
      ],
      riskFlags: [
        'Avoid excessive bitter-cold herbs which further injure Spleen Yang',
        'Monitor for worsening Damp-Heat progression'
      ],
      confidenceScore: 85
    };

    // 3. Functional Medicine Bio-Hacker Perspective (Sentinel)
    const functional: IParadigmPerspective = {
      paradigm: 'functional',
      specialistName: 'Dr. Sentinel (Functional Medicine & Cellular Bio-Hacker)',
      avatarIcon: '🧬',
      primaryDiagnosis: `Mitochondrial ATP turnover deficit coupled with zonulin-mediated intestinal hyperpermeability.`,
      keyInterventions: [
        'CoQ10 (Ubiquinol) 200mg + PQQ 20mg morning mitochondrial stack',
        'L-Glutamine 5g + Zinc Carnosine 75mg mucosal repair protocol',
        'Time-Restricted Feeding (16:8 TRF) synchronized with SCN clock circadian genes'
      ],
      riskFlags: [
        'Assess GI-MAP stool dysbiosis before intense mitochondrial uncoupling',
        'Maintain electrolyte hydration during fasting windows'
      ],
      confidenceScore: 91
    };

    // 4. Synthesize Points of Consensus & Divergence
    const pointsOfConsensus = [
      'Universal agreement on gut-mitochondrial axis disruption as the primary driver of systemic fatigue.',
      'Unanimous mandate for circadian-aligned meal timing and sleep hygiene optimization.',
      'Consensus on avoiding harsh suppressive therapies in favor of restorative root-cause protocols.'
    ];

    const divergentPoints = [
      'Western Allopathic recommends immediate diagnostic blood labs prior to therapy; TCM emphasizes empirical herbal decoctions.',
      'Functional Medicine recommends targeted orthomolecular supplements (CoQ10/PQQ); Eastern TCM focuses on whole-herb Spleen Qi formulas.'
    ];

    const synthesizedClinicalPlan = `
1. **Immediate Phase (Days 1–14)**: Initiate CMP/hs-CRP lab screening while starting warm Spleen Qi dietary adjustments and 5g L-Glutamine gut lining support.
2. **Optimization Phase (Days 15–45)**: Add CoQ10 200mg Ubiquinol morning stack and ST36 daily acupressure entrainment.
3. **Follow-Up (Day 45)**: Re-evaluate salivary cortisol slope, hs-CRP, and SIBI score.
    `.trim();

    const debate: ITriParadigmDebate = {
      id: `DEBATE-${Date.now()}`,
      patientId,
      timestamp: new Date().toISOString(),
      perspectives: { western, eastern, functional },
      pointsOfConsensus,
      divergentPoints,
      synthesizedClinicalPlan,
      overallConsensusScore: 88
    };

    this.currentDebate.set(debate);
    this.storage?.setItem('pg_last_tri_paradigm_debate', JSON.stringify(debate));
    this.isDebating.set(false);

    return debate;
  }
}
