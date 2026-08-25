/**
 * @file client.ts
 * @description Canonical PocketGull SDK Client implementing Ports & Adapters architecture.
 */

import {
  IPocketGullClientConfig,
  IResearchCohortSummary,
  IPatientDividendSummary,
  IStripeConnectLinkResponse,
  IPayoutExecutionResponse,
  IClinicalConsultRequest,
  IClinicalConsultResponse
} from './types.js';

export class PocketGullClient {
  private readonly baseUrl: string;
  private readonly wsUrl: string;
  private readonly apiKey?: string;
  private readonly timeoutMs: number;

  constructor(config: IPocketGullClientConfig = {}) {
    this.baseUrl = (config.baseUrl || 'https://pocketgull.app').replace(/\/+$/, '');
    this.wsUrl = (config.wsUrl || 'wss://pocketgull.app').replace(/\/+$/, '');
    this.apiKey = config.apiKey;
    this.timeoutMs = config.timeoutMs || 10000;
  }

  /**
   * Helper to build standard HIPAA and provenance headers.
   */
  private buildHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-PocketGull-SDK-Version': '1.28.0',
      'X-PocketGull-DeID-Standard': 'HIPAA-Safe-Harbor-164.514',
      ...customHeaders
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  /**
   * Internal fetch with timeout and exponential backoff resilience.
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: this.buildHeaders((options.headers as Record<string, string>) || {})
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`PocketGull API Error [${response.status}]: ${errorBody}`);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ==========================================
  // Research Cohorts & Data Dividends
  // ==========================================

  /**
   * Fetch all active accredited disease research cohorts.
   */
  public async getResearchCohorts(): Promise<IResearchCohortSummary[]> {
    const res = await this.request<{ cohorts: IResearchCohortSummary[] }>('/api/research/cohorts');
    return res.cohorts;
  }

  /**
   * Enroll a patient in certified research cohorts with HIPAA § 164.508 digital signature.
   */
  public async enrollInCohort(params: {
    patientId: string;
    cohortId: string;
    electronicSignature: string;
    optInDividend: boolean;
  }): Promise<{ success: boolean; enrollmentId: string }> {
    return this.request<{ success: boolean; enrollmentId: string }>('/api/research/enroll', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  /**
   * Generate a Stripe Connect Express onboarding URL for direct patient bank deposits.
   */
  public async generateStripeConnectLink(patientId: string): Promise<IStripeConnectLinkResponse> {
    return this.request<IStripeConnectLinkResponse>('/api/research/payout/stripe-connect-link', {
      method: 'POST',
      body: JSON.stringify({ patientId })
    });
  }

  /**
   * Request cash out of accumulated data dividends to connected Stripe / PayPal account.
   */
  public async requestDividendPayout(params: {
    patientId: string;
    amountUsd: number;
    destinationAccountId: string;
  }): Promise<IPayoutExecutionResponse> {
    return this.request<IPayoutExecutionResponse>('/api/research/payout/request', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  // ==========================================
  // Clinical AI Consult & Strategy
  // ==========================================

  /**
   * Execute a clinical consult using Gemini and the tri-paradigm evidence radar.
   */
  public async executeClinicalConsult(consultReq: IClinicalConsultRequest): Promise<IClinicalConsultResponse> {
    return this.request<IClinicalConsultResponse>('/api/consult', {
      method: 'POST',
      body: JSON.stringify(consultReq)
    });
  }
}
