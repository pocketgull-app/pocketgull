/**
 * @pocketgull/core-sdk — Typed API Client
 * Generated & typed client library for interacting with PocketGull Clinical ML engines.
 */

export interface ISurvivalHorizonDetail {
  survival_probability: number;
  cumulative_hazard: number;
  event_risk_pct: number;
}

export interface ISurvivalCurveRequest {
  age: number;
  egfr_current: number;
  egfr_annual_slope: number;
  uacr_mg_g: number;
  sbp_current: number;
  hba1c_current: number;
  horizons_days?: number[];
}

export interface ISurvivalCurveResponse {
  patient_partial_hazard_ratio: number;
  projected_median_event_free_days: number;
  curves: Record<string, ISurvivalHorizonDetail>;
}

export interface ICausalTreatmentRequest {
  age: number;
  baseline_sbp: number;
  baseline_rmssd: number;
  isi_score: number;
}

export interface ICausalTreatmentResponse {
  individual_treatment_effect_point: number;
  conformal_95_ci: [number, number];
  propensity_score: number;
  statistically_significant_benefit: boolean;
  effect_direction: 'BENEFICIAL_REDUCTION' | 'INCREASE_GAIN';
}

export interface IWaveformClassifyRequest {
  signal: number[];
}

export interface IWaveformClassifyResponse {
  predicted_rhythm: string;
  confidence: number;
  class_probabilities: Record<string, number>;
  telemetry: {
    heart_rate_bpm: number;
    rmssd_ms: number;
    pnn50_pct: number;
    rr_variance_ms: number;
    r_peaks_counted: number;
  };
  clinical_significance: string;
}

export interface IDrugHerbInteractionDetail {
  pair: string;
  status: string;
  risk_tier: 'LOW' | 'MODERATE' | 'MODERATE_TO_HIGH' | 'CRITICAL_CONTRAINDICATION';
  kinetic_shift_score: number;
  mechanism: string;
  clinical_directive: string;
}

export interface IDrugHerbSynergyRequest {
  drugs: string[];
  botanicals: string[];
}

export interface IDrugHerbSynergyResponse {
  regimen_summary: {
    drugs_evaluated: number;
    botanicals_evaluated: number;
    pairwise_comparisons: number;
    critical_contraindications: number;
    overall_safety_status: 'OPTIMAL_COMPATIBILITY' | 'MODERATE_MONITORING' | 'CRITICAL_ALERTS_PRESENT';
    peak_kinetic_shift_score: number;
  };
  interactions: IDrugHerbInteractionDetail[];
}

export interface IAnatomicalHotspot {
  anatomy_region: string;
  related_instrument: string;
  projected_tension_intensity: number;
  clinical_priority: 'CRITICAL' | 'ELEVATED';
}

export interface IComorbidityPropagationRequest {
  active_positive_instruments: string[];
}

export interface IComorbidityPropagationResponse {
  input_active_screens: string[];
  posterior_comorbidity_probabilities: Record<string, number>;
  anatomical_tension_hotspots: IAnatomicalHotspot[];
}

export interface IChronobiologyRequest {
  wake_time_workday?: string;
  sleep_time_workday?: string;
  wake_time_weekend?: string;
  sleep_time_weekend?: string;
  screen_cutoff_minutes_before_bed?: number;
  morning_outdoor_lux_minutes?: number;
  isi_insomnia_score?: number;
}

export interface IChronobiologyResponse {
  chronotype: string;
  circadian_stability_score: number;
  circadian_phase_markers: {
    estimated_dlmo_clock_time: string;
    core_temp_min_t_min: string;
    social_jetlag_hours: number;
    dlmo_phase_delay_minutes: number;
  };
  light_hygiene_protocol: {
    morning_outdoor_lux_window: string;
    evening_blue_light_curfew_starts: string;
    melatonin_protective_action: string;
  };
  clinical_interpretation: string;
}

export interface IEpigeneticLongevityRequest {
  chronological_age: number;
  albumin_g_dl?: number;
  creatinine_mg_dl?: number;
  glucose_mg_dl?: number;
  crp_mg_l?: number;
  lymphocyte_pct?: number;
  mean_cell_volume_fl?: number;
  red_cell_distribution_width_pct?: number;
  alkaline_phosphatase_u_l?: number;
  white_blood_cell_k_ul?: number;
  resting_rmssd_ms?: number;
  systolic_bp?: number;
}

export interface IEpigeneticLongevityResponse {
  chronological_age: number;
  biological_phenotypic_age: number;
  delta_age: number;
  aging_trajectory: string;
  senescence_velocity_ratio: number;
  organ_specific_ages: {
    renal_systemic_age: number;
    cardiovascular_arterial_age: number;
    autonomic_nervous_system_age: number;
    immunosenescence_index: number;
  };
  longevity_potential: {
    projected_qaly_extension: number;
    primary_driver: string;
  };
}

export interface IPerinatalTrajectoryRequest {
  gestational_age_weeks?: number;
  is_postpartum?: boolean;
  postpartum_weeks?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  current_epds_score?: number;
  prior_epds_score?: number;
  days_between_epds_screens?: number;
  is_lactating?: boolean;
  serum_ferritin_ug_l?: number;
}

export interface IPerinatalTrajectoryResponse {
  gestational_stage: string;
  mean_arterial_pressure_mmhg: number;
  preeclampsia_screening: {
    risk_tier: string;
    probability: number;
    sbp_dbp: string;
  };
  postpartum_mood_trajectory: {
    current_epds: number;
    prior_epds: number;
    epds_monthly_slope: number;
    trajectory_class: string;
    clinical_guidance: string;
  };
  lactation_micronutrient_protocol: string[];
}

export interface IPeriodontalBridgeRequest {
  bleeding_on_probing_pct?: number;
  mean_probing_depth_mm?: number;
  deep_pockets_count_over_5mm?: number;
  has_periodontitis_diagnosis?: boolean;
  baseline_hscrp_mg_l?: number;
  baseline_hba1c_pct?: number;
}

export interface IPeriodontalBridgeResponse {
  periodontal_inflammatory_surface_area_pisa_mm2: number;
  periodontal_severity: string;
  clinical_ulcer_analogy: string;
  systemic_inflammatory_impact: {
    baseline_hs_crp_mg_l: number;
    projected_oral_crp_contribution: number;
    projected_post_treatment_hs_crp: number;
    projected_hba1c_reduction_post_debridement: string;
    atherogenic_risk_tier: string;
  };
  co_management_directive: string[];
}

export interface ITransgenerationalStewardshipRequest {
  tap_water_unfiltered?: boolean;
  canned_food_weekly_servings?: number;
  synthetic_fragrance_exposure_daily?: boolean;
  pesticide_organic_food_pct?: number;
  homocysteine_umol_l?: number;
  serum_folate_ng_ml?: number;
  glutathione_peroxidase_u_g_hb?: number;
  heavy_metals_risk_score?: number;
  days_until_target_conception?: number;
}

export interface ITransgenerationalStewardshipResponse {
  cumulative_edc_xenobiotic_index: number;
  edc_exposure_tier: string;
  germline_methylation_resilience_score: number;
  methylation_status: string;
  preconception_90day_gamete_clock: {
    days_until_target_conception: number;
    gametogenesis_maturation_pct: number;
    current_biological_phase: string;
  };
  seven_generations_stewardship_protocol: string[];
}

export interface IBiophysicalTwinRequest {
  baseline_resting_hr?: number;
  baseline_rmssd_ms?: number;
  habitual_wake_hour?: number;
  habitual_sleep_hour?: number;
  caffeine_intake_hour?: number;
  caffeine_mg?: number;
  resonance_breathing_hour?: number;
  resonance_breathing_minutes?: number;
  blue_light_cutoff_hour?: number;
}

export interface IBiophysicalTwinResponse {
  simulation_horizon_hours: number;
  hourly_biophysical_twin: Array<{
    clock_hour: string;
    sleep_pressure_process_s: number;
    cortisol_index: number;
    melatonin_pg_ml: number;
    projected_rmssd_ms: number;
    cognitive_reaction_speed_pvt_ms: number;
    active_caffeine_mg: number;
  }>;
  key_physiological_milestones: {
    projected_peak_cognitive_alertness_window: string;
    projected_circadian_dip: string;
    bedtime_active_caffeine_mg: number;
    projected_slow_wave_deep_sleep_pct: number;
    vagal_resonance_protective_gain_ms: number;
  };
  counterfactual_summary: string;
}

export interface IContactlessBiomarkersRequest {
  rgb_mean_signals?: number[][];
  audio_waveform_sample?: number[];
  sampling_rate_hz?: number;
}

export interface IContactlessBiomarkersResponse {
  optical_rppg_telemetry: {
    estimated_heart_rate_bpm: number;
    rppg_signal_quality_snr_db: number;
    confidence_tier: string;
  };
  vocal_acoustic_biomarkers: {
    fundamental_frequency_f0_hz: number;
    acoustic_jitter_pct: number;
    acoustic_shimmer_pct: number;
    harmonic_to_noise_ratio_hnr_db: number;
    speech_pause_ratio: number;
    vocal_affective_strain_score: number;
  };
  clinical_inference: string;
}

export interface IDeprescribingRequest {
  current_medications?: string[];
  candidate_deprescribe_drugs?: string[];
  patient_age?: number;
  baseline_egfr?: number;
}

export interface IDeprescribingResponse {
  regimen_analysis: {
    total_current_medications: number;
    simulated_taper_targets: string[];
    detected_prescribing_cascades: Array<{
      trigger_drug: string;
      cascade_drug: string;
      mechanism: string;
      recommended_unwind_strategy: string;
    }>;
  };
  cognitive_and_fall_metrics: {
    baseline_anticholinergic_burden_acb: number;
    simulated_post_taper_acb: number;
    baseline_annual_fall_risk_pct: number;
    simulated_post_taper_fall_risk_pct: number;
    absolute_fall_risk_reduction_pct: number;
  };
  renal_preservation_trajectory: {
    baseline_egfr: number;
    projected_1year_egfr_with_taper: number;
    renal_hemodynamic_benefit: string;
  };
  deprescribing_schedule_directive: string[];
}

export interface INof1TrialRequest {
  intervention_name?: string;
  target_outcome_metric?: string;
  baseline_phase_a_data?: number[];
  intervention_phase_b_data?: number[];
  block_duration_days?: number;
  washout_duration_days?: number;
}

export interface INof1TrialResponse {
  n_of_1_trial_metadata: {
    intervention: string;
    target_metric: string;
    design_architecture: string;
    sample_days_analyzed: number;
  };
  empirical_statistical_analysis: {
    baseline_phase_a_mean: number;
    intervention_phase_b_mean: number;
    individual_treatment_effect_delta: number;
    cohens_d_effect_size: number;
    empirical_two_sided_p_value: number;
    bayesian_probability_of_true_benefit: number;
    statistically_conclusive: boolean;
  };
  protocol_schedule: Array<{
    phase: string;
    duration: string;
    action: string;
  }>;
  scientific_verdict: string;
}

export interface IEpigeneticLineageRequest {
  g1_grandparent_cardiometabolic_history?: boolean;
  g1_grandparent_toxic_industrial_exposure?: boolean;
  g2_parent_current_edc_burden_score?: number;
  g2_parent_homocysteine?: number;
  g2_parent_folate_repletion_active?: boolean;
  days_in_preconception_protocol?: number;
}

export interface IEpigeneticLineageResponse {
  '3_generation_epigenetic_tree': Array<{
    generation: string;

    epigenetic_heritage_vector: string;
    imprinting_burden_score?: number;
    active_xenobiotic_modulation?: string;
    "1_carbon_methylation_fidelity"?: string;
    baseline_inherited_vulnerability_pct?: number;
    optimized_post_protocol_vulnerability_pct?: number;
    transgenerational_protection_status?: string;
  }>;
  germline_fidelity_metrics: {
    raw_inherited_vulnerability_score: number;
    optimized_vulnerability_score: number;
    relative_risk_reduction_pct: number;
    preconception_window_completion_pct: number;
  };
  clinical_lineage_guidance: string;
}

export interface ITcmMeridianRequest {
  stress_irritability_level?: number;
  fatigue_postprandial_heaviness?: number;
  insomnia_palpitations?: number;
  lumbar_soreness_cold_aversion?: number;
  cough_dry_throat?: number;
  tongue_body_color?: string;
  tongue_coating?: string;
  radial_pulse_type?: string;
}

export interface ITcmMeridianResponse {
  tcm_diagnostic_summary: {
    primary_zang_fu_pattern: string;
    tongue_diagnosis: string;
    radial_pulse_synthesis: string;
    classical_herbal_formula: string;
  };
  wu_xing_5_element_balance: {
    wood_liver_gallbladder: number;
    fire_heart_small_intestine: number;
    earth_spleen_stomach: number;
    metal_lung_large_intestine: number;
    water_kidney_urinary_bladder: number;
  };
  prescribed_acupoint_protocol: Array<{
    code: string;
    location: string;
    function: string;
  }>;
  dietary_thermal_guidance: string;
}

export interface IAyurvedicTridoshaRequest {
  vata_symptoms_score?: number;
  pitta_symptoms_score?: number;
  kapha_symptoms_score?: number;
  bowel_regularity_index?: number;
  tongue_ama_coating?: string;
  energy_stability?: number;
}

export interface IAyurvedicTridoshaResponse {
  tridosha_vikriti_distribution: {
    vata_pct: number;
    pitta_pct: number;
    kapha_pct: number;
    predominant_imbalance: string;
  };
  metabolic_agni_state: {
    classification: string;
    clinical_description: string;
    ama_endotoxin_score: number;
    ama_tier: string;
  };
  seven_dhatu_tissue_cascade: Array<{
    dhatu: string;
    status: string;
    biomarker: string;
  }>;
  ojas_vitality_reserve_score: number;
  prescribed_rasayana_protocol: string;
  dinacharya_lifestyle_guidance: string;
}

export interface IAllopathicBridgeRequest {
  current_allopathic_drugs?: string[];
  candidate_tcm_herbs?: string[];
  candidate_ayurvedic_rasayanas?: string[];
}

export interface IAllopathicBridgeResponse {
  cyp450_pharmacokinetic_interactions: Array<{
    drug: string;
    botanical: string;
    affected_enzymes: string[];
    effect: string;
    severity: string;
  }>;
  pharmacodynamic_synergies_and_warnings: Array<{
    interaction: string;
    mechanism: string;
    clinical_significance: string;
    action_plan: string;
  }>;
  thermal_energetic_harmonization: string[];
  hour_by_hour_dosing_schedule: Array<{
    time: string;
    items: string;
  }>;
  overall_safety_tier: string;
}

export class PocketGullApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/python') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async postJson<TReq, TRes>(path: string, payload: TReq): Promise<TRes> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`[PocketGullApiClient] HTTP ${response.status} ${response.statusText}: ${errorText}`);
    }

    return response.json() as Promise<TRes>;
  }

  async predictSurvivalCurve(req: ISurvivalCurveRequest): Promise<ISurvivalCurveResponse> {
    return this.postJson<ISurvivalCurveRequest, ISurvivalCurveResponse>('/ml/survival-curve', req);
  }

  async predictCausalTreatmentEffect(req: ICausalTreatmentRequest): Promise<ICausalTreatmentResponse> {
    return this.postJson<ICausalTreatmentRequest, ICausalTreatmentResponse>('/ml/causal-treatment-effect', req);
  }

  async classifyWaveform(req: IWaveformClassifyRequest): Promise<IWaveformClassifyResponse> {
    return this.postJson<IWaveformClassifyRequest, IWaveformClassifyResponse>('/ml/classify-waveform', req);
  }

  async evaluateDrugHerbSynergy(req: IDrugHerbSynergyRequest): Promise<IDrugHerbSynergyResponse> {
    return this.postJson<IDrugHerbSynergyRequest, IDrugHerbSynergyResponse>('/ml/drug-herb-synergy', req);
  }

  async propagateComorbidities(req: IComorbidityPropagationRequest): Promise<IComorbidityPropagationResponse> {
    return this.postJson<IComorbidityPropagationRequest, IComorbidityPropagationResponse>('/ml/comorbidity-propagation', req);
  }

  async evaluateChronobiology(req: IChronobiologyRequest): Promise<IChronobiologyResponse> {
    return this.postJson<IChronobiologyRequest, IChronobiologyResponse>('/ml/chronobiology-matrix', req);
  }

  async evaluateEpigeneticLongevity(req: IEpigeneticLongevityRequest): Promise<IEpigeneticLongevityResponse> {
    return this.postJson<IEpigeneticLongevityRequest, IEpigeneticLongevityResponse>('/ml/epigenetic-longevity', req);
  }

  async evaluatePerinatalTrajectory(req: IPerinatalTrajectoryRequest): Promise<IPerinatalTrajectoryResponse> {
    return this.postJson<IPerinatalTrajectoryRequest, IPerinatalTrajectoryResponse>('/ml/perinatal-trajectory', req);
  }

  async evaluatePeriodontalBridge(req: IPeriodontalBridgeRequest): Promise<IPeriodontalBridgeResponse> {
    return this.postJson<IPeriodontalBridgeRequest, IPeriodontalBridgeResponse>('/ml/periodontal-systemic-bridge', req);
  }

  async evaluateTransgenerationalStewardship(req: ITransgenerationalStewardshipRequest): Promise<ITransgenerationalStewardshipResponse> {
    return this.postJson<ITransgenerationalStewardshipRequest, ITransgenerationalStewardshipResponse>('/ml/transgenerational-stewardship', req);
  }

  async simulateBiophysicalTwin(req: IBiophysicalTwinRequest): Promise<IBiophysicalTwinResponse> {
    return this.postJson<IBiophysicalTwinRequest, IBiophysicalTwinResponse>('/ml/biophysical-twin-simulate', req);
  }

  async extractContactlessBiomarkers(req: IContactlessBiomarkersRequest): Promise<IContactlessBiomarkersResponse> {
    return this.postJson<IContactlessBiomarkersRequest, IContactlessBiomarkersResponse>('/ml/contactless-biomarkers', req);
  }

  async simulateDeprescribing(req: IDeprescribingRequest): Promise<IDeprescribingResponse> {
    return this.postJson<IDeprescribingRequest, IDeprescribingResponse>('/ml/deprescribing-simulation', req);
  }

  async designNof1Trial(req: INof1TrialRequest): Promise<INof1TrialResponse> {
    return this.postJson<INof1TrialRequest, INof1TrialResponse>('/ml/nof1-trial-design', req);
  }

  async evaluateEpigeneticLineage(req: IEpigeneticLineageRequest): Promise<IEpigeneticLineageResponse> {
    return this.postJson<IEpigeneticLineageRequest, IEpigeneticLineageResponse>('/ml/epigenetic-lineage', req);
  }

  async evaluateTcmMeridian(req: ITcmMeridianRequest): Promise<ITcmMeridianResponse> {
    return this.postJson<ITcmMeridianRequest, ITcmMeridianResponse>('/ml/tcm-meridian-evaluate', req);
  }

  async evaluateAyurvedicTridosha(req: IAyurvedicTridoshaRequest): Promise<IAyurvedicTridoshaResponse> {
    return this.postJson<IAyurvedicTridoshaRequest, IAyurvedicTridoshaResponse>('/ml/ayurvedic-tridosha-evaluate', req);
  }

  async evaluateAllopathicBridge(req: IAllopathicBridgeRequest): Promise<IAllopathicBridgeResponse> {
    return this.postJson<IAllopathicBridgeRequest, IAllopathicBridgeResponse>('/ml/allopathic-integrative-bridge', req);
  }
}