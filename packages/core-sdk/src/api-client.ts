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
}