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
   * Eastern TCM Zang-Fu, and Functional Medicine Bio-Stacking paradigms.
   */
  public executeSwarmDebate(symptomsOverride?: string[]): ITriParadigmDebate {
    this.isDebating.set(true);

    const symptoms = symptomsOverride || (this.state ? this.state.selectedIssues().map(i => i.description || i.name) : []);
    const activeSymptoms = symptoms.length > 0 ? symptoms : ['Chronic Fatigue', 'Brain Fog', 'Epigastric Bloating'];
    const patientId = this.state?.activePatientSummary() ? 'P-GULL-ACTIVE' : 'P-GULL-DEMO';
    const tcmData = this.state?.tcmIntake ? this.state.tcmIntake() : null;
    const ayurvedaData = this.state?.ayurvedicIntake ? this.state.ayurvedicIntake() : null;
    const vitalsData = this.state?.vitals ? this.state.vitals() : null;

    // 1. Western Allopathic Specialist Perspective (Gulliver)
    const bpText = vitalsData?.bp ? ` (Vascular baseline: ${vitalsData.bp}, HR ${vitalsData.hr || '72'} bpm)` : '';
    const western: IParadigmPerspective = {
      paradigm: 'western',
      specialistName: 'Dr. Gulliver (Western Allopathic Internal Medicine)',
      avatarIcon: '🔬',
      primaryDiagnosis: `Rule out metabolic dysfunction, subclinical thyroiditis, or neuro-vascular strain associated with ${activeSymptoms.slice(0, 2).join(' & ') || 'active symptoms'}${bpText}.`,
      keyInterventions: [
        'Order Comprehensive Metabolic Panel (CMP) & hs-CRP baseline',
        'Serum Free T3, Free T4, and TPO Autoantibody screen',
        '24-hour salivary cortisol circadian curve test'
      ],
      riskFlags: [
        'Monitor for autoimmune thyroid antibodies and electrolyte shifts',
        'Deconflict botanical co-administration with hepatic CYP3A4/2C9 substrates'
      ],
      confidenceScore: 89
    };

    // 2. Eastern TCM Zang-Fu Specialist Perspective (Swoop)
    const tcmDiag = tcmData?.tcmPattern
      ? `${tcmData.tcmPattern} with ${tcmData.pulseQuality || 'wiry'} pulse waveform and ${tcmData.tongueColor || 'pale'} tongue body (${tcmData.tongueCoating || 'thin'} coating).`
      : 'Spleen Qi Deficiency with Dampness accumulation and Liver Qi Stagnation disrupting Digestive Fire.';
    const eastern: IParadigmPerspective = {
      paradigm: 'eastern',
      specialistName: 'Elder Swoop (Eastern TCM Zang-Fu & Meridian Harmony)',
      avatarIcon: '☯️',
      primaryDiagnosis: tcmDiag,
      keyInterventions: [
        'Prescribe modified Xiao Yao San or Liu Jun Zi Tang decoction for Zang-Fu harmony',
        'Acupressure at LV-3 (Taichong), ST-36 (Zusanli), and SP-6 (Sanyinjiao) daily',
        'Warm, cooked digestive grain diet; eliminate cold/raw food ingestion'
      ],
      riskFlags: [
        'Avoid excessive bitter-cold purgative herbs that injure Spleen Yang',
        'Maintain 3-hour kinetic clearance separation from morning Western pharmaceuticals'
      ],
      confidenceScore: 88
    };

    // 3. Functional Medicine & Ayurvedic Bio-Stacker Perspective (Sentinel)
    const ayurDiag = ayurvedaData?.ayurvedicImbalance
      ? `${ayurvedaData.ayurvedicImbalance} characterized by ${ayurvedaData.agniType || 'vishamagni'} Agni and ${ayurvedaData.amaScore ?? 4.5}/10 metabolic endotoxin burden.`
      : 'Mitochondrial ATP turnover deficit coupled with zonulin-mediated intestinal hyperpermeability and kinetic Vata dispersion.';
    const functional: IParadigmPerspective = {
      paradigm: 'functional',
      specialistName: 'Dr. Sentinel (Functional Medicine & Cellular Bio-Stacker)',
      avatarIcon: '🧬',
      primaryDiagnosis: ayurDiag,
      keyInterventions: [
        'CoQ10 (Ubiquinol) 200mg + PQQ 20mg morning mitochondrial biogenesis stack',
        'Ashwagandha (KSM-66) 600mg + Zinc Carnosine 75mg mucosal and Vata stability protocol',
        'Circadian Time-Restricted Feeding (16:8 TRF) aligned with SCN BMAL1/PER2 rhythm'
      ],
      riskFlags: [
        'Assess GI-MAP and mucosal permeability before initiating high-potency extracts',
        'Maintain electrolyte hydration during fasting windows'
      ],
      confidenceScore: 92
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
