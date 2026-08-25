import { Injectable, signal } from '@angular/core';

export interface IVertexAiConfig {
  projectId: string;
  location: string;
  modelId: 'medlm-large' | 'medlm-medium' | 'gemini-1.5-pro' | 'gemini-1.5-flash';
  apiEndpoint: string;
}

@Injectable({
  providedIn: 'root'
})
export class VertexAiModelGardenService {
  readonly config = signal<IVertexAiConfig>({
    projectId: 'gen-lang-client-0540208645',
    location: 'us-central1',
    modelId: 'medlm-large',
    apiEndpoint: 'https://us-central1-aiplatform.googleapis.com/v1'
  });

  /**
   * Generates canonical Vertex AI Model Garden Predict REST URL.
   * e.g., https://us-central1-aiplatform.googleapis.com/v1/projects/{project}/locations/{location}/publishers/google/models/{model}:predict
   */
  getVertexAiEndpointUrl(): string {
    const cfg = this.config();
    return `${cfg.apiEndpoint}/projects/${cfg.projectId}/locations/${cfg.location}/publishers/google/models/${cfg.modelId}:predict`;
  }

  /**
   * Formats a clinical prompt for Vertex AI MedLM / Gemini Model Garden inference.
   */
  formatVertexAiPredictionBody(promptText: string, temperature: number = 0.2): Record<string, any> {
    return {
      instances: [
        {
          content: promptText
        }
      ],
      parameters: {
        temperature: temperature,
        maxOutputTokens: 2048,
        topP: 0.95,
        topK: 40
      }
    };
  }
}
