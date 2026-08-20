import { Injectable, signal, computed } from '@angular/core';

export type CardiacExertionRiskTier = 'LOW_RISK' | 'INTERMEDIATE_RISK' | 'HIGH_RISK_CONTRAINDICATED';

export interface ICardiacSafetyAssessment {
  riskTier: CardiacExertionRiskTier;
  metCapacity: number; // 1 - 10 METs
  canClimbTwoFlightsStairs: boolean;
  hasRecentCardiacEvent: boolean; // < 6 weeks
  hasUnstableAnginaOrAorticStenosis: boolean;
  nitratePde5Status: {
    isContraindicated: boolean;
    nitrateDetected: boolean;
    pde5Detected: boolean;
    requiredWashoutHours: number; // 24h for sildenafil, 48h for tadalafil
    clinicalWarning: string;
  };
  recommendations: string[];
  evidenceReference: string; // Princeton Consensus III / AHA Guidelines
}

export interface IEnergyPacingPlan {
  planTitle: string;
  targetCondition: string; // e.g. 'ME/CFS, Fibromyalgia, Long COVID, Post-MI Fatigue'
  spoonAllocation: {
    prepPhase: string;
    connectionPhase: string;
    postRestPhase: string;
  };
  environmentalPacingTips: string[];
  nutritionDigestiveTiming: string;
}

export interface IAdaptivePositioningGuide {
  injuryOrCondition: string;
  snomedCode: string;
  icd10Code: string;
  primaryRiskToAvoid: string;
  recommendedSupports: string[];
  ergonomicTechniques: string[];
  anatomicalIllustrationNote: string;
}

@Injectable({
  providedIn: 'root'
})
export class IntimacyRelationshipVitalityService {
  // Common Nitrate medications
  private readonly NITRATE_DRUGS = [
    'nitroglycerin', 'nitrostat', 'nitrolingual', 'nitro-dur',
    'isosorbide mononitrate', 'imdur', 'isosorbide dinitrate', 'isordil'
  ];

  // Common PDE-5 inhibitors
  private readonly PDE5_INHIBITORS = [
    { name: 'sildenafil', brand: 'viagra / revatio', washoutHours: 24 },
    { name: 'tadalafil', brand: 'cialis / adcirca', washoutHours: 48 },
    { name: 'vardenafil', brand: 'levitra / staxyn', washoutHours: 24 },
    { name: 'avanafil', brand: 'stendra', washoutHours: 12 }
  ];

  // Pre-loaded adaptive occupational therapy positioning guides
  private readonly ADAPTIVE_GUIDES: IAdaptivePositioningGuide[] = [
    {
      injuryOrCondition: 'Total Hip Arthroplasty (Posterior Approach)',
      snomedCode: '52734007',
      icd10Code: 'Z96.641',
      primaryRiskToAvoid: 'Excessive hip flexion (>90°), adduction across midline, and internal rotation that could dislocate prosthesis.',
      recommendedSupports: [
        'High-density triangular wedge pillow under lower back and thighs',
        'Firm mattress support to prevent pelvic sinkage',
        'Side-lying with abduction pillow between knees'
      ],
      ergonomicTechniques: [
        'Adopt side-lying (Sims position) with operative leg supported in neutral alignment.',
        'Keep hip angle greater than 100° in supine posture.',
        'Avoid bearing full partner weight on the operative hip.'
      ],
      anatomicalIllustrationNote: 'Maintains femoral head seated firmly within acetabular cup without impingement.'
    },
    {
      injuryOrCondition: 'Severe Knee Osteoarthritis / Chondromalacia',
      snomedCode: '239873007',
      icd10Code: 'M17.9',
      primaryRiskToAvoid: 'Deep patellofemoral hyperflexion (>110°) and direct weight-bearing pressure on the patella.',
      recommendedSupports: [
        'Contoured cylindrical memory-foam bolster under popliteal fossa (behind knees)',
        'Zero-pressure side-lying lateral support cushions'
      ],
      ergonomicTechniques: [
        'Avoid prolonged kneeling on hard surfaces; use side-by-side or reclined postures.',
        'Keep knees in gentle 15° to 30° flexion supported by bolsters.',
        'Apply warm moist towels or topical capsaicin to quadriceps tendon 20 minutes prior.'
      ],
      anatomicalIllustrationNote: 'Eliminates compressive force across worn articular hyaline cartilage.'
    },
    {
      injuryOrCondition: 'Post-Stroke Hemiparesis / Hemiplegia',
      snomedCode: '230690007',
      icd10Code: 'I69.359',
      primaryRiskToAvoid: 'Traction on flaccid shoulder causing subluxation, and sudden spastic reflex triggers.',
      recommendedSupports: [
        'Elevated arm trough pillow supporting the affected forearm and wrist',
        'Contoured lumbar and head cradle pillows'
      ],
      ergonomicTechniques: [
        'Position the paretic arm forward and supported on a pillow to prevent inferior glenohumeral subluxation.',
        'Partner approaches from the unaffected side to enhance visual field and tactile comfort.',
        'Gentle slow transitions to avoid triggering extensor spasticity tone.'
      ],
      anatomicalIllustrationNote: 'Protects the rotator cuff and brachial plexus from over-stretching during movement.'
    },
    {
      injuryOrCondition: 'Lumbar Spinal Canal Stenosis (Neurogenic Claudication)',
      snomedCode: '202794008',
      icd10Code: 'M48.061',
      primaryRiskToAvoid: 'Lumbar hyperextension (swayback) which narrows the neural foramina and pinches the cauda equina.',
      recommendedSupports: [
        'Pelvic wedge cushion promoting gentle forward lumbar flexion (kyphosis)',
        'Leg-elevation bolster'
      ],
      ergonomicTechniques: [
        'Favor flexion-friendly positions: side-lying curled position or supine with knees bent over pillows.',
        'Avoid sustained prone backward bending.',
        'Perform gentle pelvic tilts before and after activity.'
      ],
      anatomicalIllustrationNote: 'Opens the neuroforaminal exit pathways, relieving nerve root compression.'
    }
  ];

  // Energy pacing plan templates
  private readonly ENERGY_PLANS: IEnergyPacingPlan[] = [
    {
      planTitle: 'Couples Date-Night Energy Pacing & Spoon Conservation',
      targetCondition: 'Chronic Fatigue (ME/CFS), Long COVID & Post-Viral Malaise',
      spoonAllocation: {
        prepPhase: '1 Spoon: 60-minute quiet horizontal rest in low light before changing clothes.',
        connectionPhase: '2 Spoons: Seated shared dinner with light candle lighting or quiet acoustic music.',
        postRestPhase: '1 Spoon: Gentle hydration, 8 hours restorative sleep without early alarms.'
      },
      environmentalPacingTips: [
        'Dim overhead lights to 2700K warm incandescent or candlelight to avoid sensory overload.',
        'Play calming 528 Hz or 432 Hz Solfeggio soundscapes to support vagal tone.',
        'Keep room temperature at a comfortable 68°F (20°C) to prevent autonomic orthostatic strain.'
      ],
      nutritionDigestiveTiming: 'Finish meals at least 2 hours before intimacy to prevent splanchnic blood pooling, which steals circulation from the brain and skeletal muscles.'
    }
  ];

  public getAdaptiveGuides(): IAdaptivePositioningGuide[] {
    return this.ADAPTIVE_GUIDES;
  }

  public getEnergyPlans(): IEnergyPacingPlan[] {
    return this.ENERGY_PLANS;
  }

  /**
   * Assesses cardiovascular safety and exertion tolerance based on Princeton Consensus III and AHA guidelines.
   */
  public evaluateCardiacSafety(input: {
    canClimbTwoFlightsStairs: boolean;
    medications: string[];
    hasRecentMI?: boolean;
    hasUnstableAngina?: boolean;
    systolicBP?: number;
    restingHeartRate?: number;
  }): ICardiacSafetyAssessment {
    const medsLower = (input.medications || []).map(m => m.toLowerCase());
    
    // 1. Check for Nitrates
    const hasNitrate = medsLower.some(m => 
      this.NITRATE_DRUGS.some(n => m.includes(n))
    );

    // 2. Check for PDE-5 Inhibitors
    const detectedPde5 = this.PDE5_INHIBITORS.find(p => 
      medsLower.some(m => m.includes(p.name) || m.includes(p.brand.split('/')[0].trim()))
    );

    const isContraindicated = hasNitrate && !!detectedPde5;
    const requiredWashout = detectedPde5 ? detectedPde5.washoutHours : (hasNitrate ? 24 : 0);

    // 3. Exertion & MET Stratification
    const metCapacity = input.canClimbTwoFlightsStairs ? 4.5 : 2.5;
    const hasHighRiskSigns = !!input.hasRecentMI || !!input.hasUnstableAngina;

    let riskTier: CardiacExertionRiskTier = 'LOW_RISK';
    const recs: string[] = [];

    if (hasHighRiskSigns || isContraindicated) {
      riskTier = 'HIGH_RISK_CONTRAINDICATED';
    } else if (!input.canClimbTwoFlightsStairs || (input.systolicBP && input.systolicBP > 160)) {
      riskTier = 'INTERMEDIATE_RISK';
    } else {
      riskTier = 'LOW_RISK';
    }

    if (isContraindicated) {
      recs.push(`🚨 ABSOLUTE CONTRAINDICATION: Co-administration of Nitrates and PDE-5 inhibitors (${detectedPde5?.name}) causes profound, life-threatening hypotension. Minimum ${requiredWashout}h washout required.`);
    } else if (hasNitrate) {
      recs.push(`⚠️ Nitrate Prescription Active: Never take PDE-5 inhibitors (Viagra, Cialis) without consulting your cardiologist. Maintain at least 24–48h separation if ever cleared.`);
    }

    if (riskTier === 'LOW_RISK') {
      recs.push('✅ Low Cardiovascular Risk (Princeton III): Performing $\\ge 4$ METs (climbing 2 flights of stairs without chest pain) indicates physical intimacy is safe without advanced stress testing.');
      recs.push('💡 Practice relaxed pacing and avoid heavy alcohol or cold drafts immediately following exertion.');
    } else if (riskTier === 'INTERMEDIATE_RISK') {
      recs.push('⚠️ Intermediate Risk: Treadmill exercise tolerance test (ETT) recommended prior to vigorous exertion.');
      recs.push('🛋️ Favor low-exertion, restful intimacy postures with partner-supported positioning.');
    } else {
      recs.push('🛑 High Risk / Defer Activity: Sexual activity should be deferred until cardiovascular stabilization and formal cardiologist clearance.');
    }

    return {
      riskTier,
      metCapacity,
      canClimbTwoFlightsStairs: input.canClimbTwoFlightsStairs,
      hasRecentCardiacEvent: !!input.hasRecentMI,
      hasUnstableAnginaOrAorticStenosis: !!input.hasUnstableAngina,
      nitratePde5Status: {
        isContraindicated,
        nitrateDetected: hasNitrate,
        pde5Detected: !!detectedPde5,
        requiredWashoutHours: requiredWashout,
        clinicalWarning: isContraindicated
          ? `Dangerous synergistic cGMP accumulation. Do not combine ${detectedPde5?.name} with Nitrates.`
          : 'No active nitrate + PDE-5 conflict detected.'
      },
      recommendations: recs,
      evidenceReference: 'Princeton Consensus III / American Heart Association (AHA) Guidelines on Sexual Activity and Cardiovascular Disease'
    };
  }
}
