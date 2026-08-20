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
}