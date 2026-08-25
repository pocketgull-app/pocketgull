import { Injectable, signal } from '@angular/core';

export interface MedicalEntity {
  text: string;
  type: string;
  coding?: {
    code: string;
    system: string;
    display: string;
  };
}

export interface NlpAnalysisResult {
  success: boolean;
  source: string;
  entities: MedicalEntity[];
  relationships?: any[];
}

export interface DeidentifyResult {
  success: boolean;
  source: string;
  deidentifiedText?: string;
  deidentifiedPayload?: any;
}

export interface BigQueryExportResult {
  success: boolean;
  status: string;
  operation?: string;
  targetUri?: string;
  message?: string;
}

export interface HealthcareSearchResult {
  success: boolean;
  query: string;
  count: number;
  results: any[];
}

@Injectable({
  providedIn: 'root'
})
export class HealthcareIntelligenceService {
  readonly isAnalyzing = signal<boolean>(false);
  readonly lastNlpResult = signal<NlpAnalysisResult | null>(null);

  /**
   * Analyzes raw clinical text using GCP Healthcare NLP API.
   */
  async analyzeClinicalText(text: string): Promise<NlpAnalysisResult> {
    this.isAnalyzing.set(true);
    try {
      const response = await fetch('/api/healthcare/nlp/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!response.ok) throw new Error(`Healthcare NLP failed with status ${response.status}`);
      const data: NlpAnalysisResult = await response.json();
      this.lastNlpResult.set(data);
      return data;
    } finally {
      this.isAnalyzing.set(false);
    }
  }

  /**
   * De-identifies text or JSON patient payload using HIPAA Safe Harbor rules.
   */
  async deidentifyPayload(text?: string, payload?: any): Promise<DeidentifyResult> {
    const response = await fetch('/api/healthcare/deidentify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, payload })
    });
    if (!response.ok) throw new Error(`De-identification failed with status ${response.status}`);
    return await response.json();
  }

  /**
   * Triggers export of FHIR store data into BigQuery analytics.
   */
  async exportToBigQuery(datasetId?: string): Promise<BigQueryExportResult> {
    const response = await fetch('/api/healthcare/fhir/export-to-bigquery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ datasetId })
    });
    if (!response.ok) throw new Error(`BigQuery Export failed with status ${response.status}`);
    return await response.json();
  }

  /**
   * Performs clinical search across FHIR resources.
   */
  async searchClinicalStore(query: string, resourceType: string = 'Observation'): Promise<HealthcareSearchResult> {
    const response = await fetch('/api/healthcare/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, resourceType })
    });
    if (!response.ok) throw new Error(`Healthcare Search failed with status ${response.status}`);
    return await response.json();
  }
}
