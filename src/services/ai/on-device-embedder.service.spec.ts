import { OnDeviceEmbedderService } from './on-device-embedder.service';

describe('OnDeviceEmbedderService', () => {
  let service: OnDeviceEmbedderService;

  beforeEach(() => {
    service = new OnDeviceEmbedderService();
  });

  it('1. Computes deterministic fallback vector when native API is absent', async () => {
    const vec1 = await service.computeEmbedding('Cardiovascular arrhythmia palpitations');
    expect(vec1).toBeInstanceOf(Float32Array);
    expect(vec1.length).toBe(256);

    // Magnitude should be normalized to ~1.0
    let norm = 0;
    for (let i = 0; i < vec1.length; i++) {
      norm += vec1[i] * vec1[i];
    }
    expect(Math.sqrt(norm)).toBeCloseTo(1.0, 3);
  });

  it('2. Computes accurate cosine similarity for identical and orthogonal inputs', async () => {
    const vecA = new Float32Array([1, 0, 0]);
    const vecB = new Float32Array([1, 0, 0]);
    const vecC = new Float32Array([0, 1, 0]);

    expect(service.cosineSimilarity(vecA, vecB)).toBeCloseTo(1.0, 4);
    expect(service.cosineSimilarity(vecA, vecC)).toBeCloseTo(0.0, 4);
  });

  it('3. Finds top semantic matches correctly among clinical candidates', async () => {
    const candidates = [
      { id: 'I48.91', text: 'Unspecified atrial fibrillation' },
      { id: 'J45.909', text: 'Unspecified asthma uncomplicated' },
      { id: 'M54.5', text: 'Low back pain lumbar spine' }
    ];

    const results = await service.findTopMatches('Atrial fibrillation heart flutter', candidates, 2);
    expect(results.length).toBe(2);
    expect(results[0].id).toBe('I48.91');
    expect(results[0].score).toBeGreaterThan(results[1].score);
  });

  it('4. Handles empty candidates gracefully', async () => {
    const results = await service.findTopMatches('Headache', [], 5);
    expect(results).toEqual([]);
  });
});
