import { VertexAiModelGardenService } from './vertex-ai-model-garden.service';

describe('VertexAiModelGardenService', () => {
  const service = new VertexAiModelGardenService();

  it('1. Generates canonical Vertex AI Model Garden Predict URL', () => {
    const url = service.getVertexAiEndpointUrl();
    expect(url).toContain('gen-lang-client-0540208645');
    expect(url).toContain('us-central1-aiplatform.googleapis.com');
    expect(url).toContain('medlm-large:predict');
  });

  it('2. Formats clinical prediction payload for MedLM / Gemini Model Garden', () => {
    const body = service.formatVertexAiPredictionBody('Analyze patient vital trends');
    expect(body['instances'][0]['content']).toContain('Analyze patient');
    expect(body['parameters']['temperature']).toBe(0.2);
  });
});
