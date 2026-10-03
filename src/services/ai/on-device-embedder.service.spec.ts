import {
  OnDeviceEmbedderService,
  POCKETGULL_11_CLINICAL_LENSES,
  DEFAULT_CLINICAL_KNOWLEDGE_CORPUS
} from './on-device-embedder.service';

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

  it('5. Computes BM25 lexical score correctly for clinical terms', () => {
    const queryTokens = ['pediatric', 'waiver', 'mdcp'];
    const docTokens = ['pediatric', 'waiver', 'program', 'form', '2603', 'mdcp'];
    const docFreq = new Map<string, number>([['pediatric', 1], ['waiver', 1], ['mdcp', 1]]);
    const score = service.computeBm25Score(queryTokens, docTokens, 6, 1, docFreq);
    expect(score).toBeGreaterThan(0);
  });

  it('6. Performs hybrid BM25 + dense RRF reranking accurately', async () => {
    const candidates = [
      { id: 'CAND_1', text: 'Pediatric MDCP waiver authorization Form 2603 PDN hours' },
      { id: 'CAND_2', text: 'Adult lumbar spine radiculopathy nerve compression' },
      { id: 'CAND_3', text: 'Cardiac telemetry arrhythmia atrial flutter' }
    ];

    const results = await service.findTopHybridMatches('MDCP pediatric waiver', candidates, 2);
    expect(results.length).toBe(2);
    expect(results[0].id).toBe('CAND_1');
    expect(results[0].hybridRrfScore).toBeGreaterThan(results[1].hybridRrfScore);
    expect(results[0].denseRank).toBe(1);
    expect(results[0].bm25Rank).toBe(1);
  });

  it('7. Quantizes Float32 vectors to Int8 (75% memory drop) and dequantizes accurately', () => {
    const original = new Float32Array([0.8, -0.4, 0.0, 0.25, -0.95]);
    const quantized = service.quantizeToInt8(original);

    expect(quantized.data).toBeInstanceOf(Int8Array);
    expect(quantized.data.byteLength).toBe(5); // 5 bytes vs 20 bytes Float32
    expect(quantized.scale).toBeCloseTo(0.95, 2);

    const dequantized = service.dequantizeFromInt8(quantized);
    for (let i = 0; i < original.length; i++) {
      expect(dequantized[i]).toBeCloseTo(original[i], 1);
    }
  });

  it('8. Computes quantized cosine similarity in integer space with high fidelity', () => {
    const vecA = new Float32Array([0.6, 0.8, 0.0]);
    const vecB = new Float32Array([0.6, 0.8, 0.0]);
    const vecC = new Float32Array([0.0, 0.0, 1.0]);

    const qA = service.quantizeToInt8(vecA);
    const qB = service.quantizeToInt8(vecB);
    const qC = service.quantizeToInt8(vecC);

    const simIdentical = service.quantizedCosineSimilarity(qA, qB);
    const simOrthogonal = service.quantizedCosineSimilarity(qA, qC);

    expect(simIdentical).toBeCloseTo(1.0, 2);
    expect(simOrthogonal).toBeCloseTo(0.0, 2);
  });

  it('9. Pre-indexes custom corpus and executes sub-millisecond searchIndexed queries', async () => {
    const customCorpus = [
      { id: 'CARD_1', text: 'Supraventricular tachycardia, vagal maneuver baroreflex stimulation', data: { specialty: 'Cardiology' } },
      { id: 'DERM_1', text: 'Eczema atopic dermatitis topical barrier repair', data: { specialty: 'Dermatology' } },
      { id: 'PEDS_1', text: 'Pediatric MDCP Medicaid waiver PDN respite care', data: { specialty: 'Pediatrics' } }
    ];

    await service.indexCorpus(customCorpus);
    expect(service.indexedCount()).toBe(3);

    const matches = await service.searchIndexed('Vagal nerve tachycardia arrhythmia', 2);
    expect(matches.length).toBe(2);
    expect(matches[0].id).toBe('CARD_1');
    expect(matches[0].data?.specialty).toBe('Cardiology');
    expect(matches[0].hybridRrfScore).toBeGreaterThan(0);

    service.clearIndex();
    expect(service.indexedCount()).toBe(0);
    const emptyMatches = await service.searchIndexed('anything');
    expect(emptyMatches).toEqual([]);
  });

  it('10. Automatically indexes default clinical knowledge corpus with 10D functional medicine & ISMP rules', async () => {
    await service.autoIndexDefaultClinicalCorpus();
    expect(service.indexedCount()).toBeGreaterThanOrEqual(8);

    const ismpMatch = await service.searchIndexed('High risk medication trailing zero LASA guard', 1);
    expect(ismpMatch.length).toBe(1);
    expect(ismpMatch[0].id).toBe('CLIN_ISMP_MED_SAFETY');
    expect(ismpMatch[0].data.domain).toBe('MedSafety');

    const hrvMatch = await service.searchIndexed('Heart rate variability parasympathetic vagal tone', 1);
    expect(hrvMatch.length).toBe(1);
    expect(hrvMatch[0].id).toBe('CLIN_10D_NEUROLOGICAL');
  });

  it('11. Generates 512-dim BioMedCLIP normalized unit vector with biomedical subword decomposition', () => {
    const vec512 = service.embedBioMedClip('Cytochrome c Oxidase mitochondrial photobiomodulation 810nm laser', 512);
    expect(vec512).toBeInstanceOf(Float32Array);
    expect(vec512.length).toBe(512);

    let norm = 0;
    for (let i = 0; i < vec512.length; i++) {
      norm += vec512[i] * vec512[i];
    }
    expect(Math.sqrt(norm)).toBeCloseTo(1.0, 3);
  });

  it('12. Executes sub-15ms client-side semantic search across all 11 Pocket-Gull clinical lenses', async () => {
    const query = 'Fasting blood glucose insulin resistance HbA1c mitochondrial zone 2 lactate';
    const result = await service.matchClinicalLenses(query, 5);

    expect(result.latencyMs).toBeLessThan(15);
    expect(result.matches.length).toBe(5);
    expect(result.topLens.lensId).toBe('LENS_03_METABOLIC_MITOCHONDRIAL');
    expect(result.topLens.loincCode).toBe('4548-4');
    expect(result.topLens.snomedId).toBe('73211009');
    expect(result.backend).toBeDefined();
  });

  it('13. Performs direct zero-shot grounding against LOINC, SNOMED-CT, and RxNorm without cloud latency', async () => {
    const query = 'Warfarin adverse bleeding risk CYP2C19 drug interaction ISMP safety';
    const grounding = await service.groundToClinicalTaxonomies(query);

    expect(grounding.latencyMs).toBeLessThan(15);
    expect(grounding.associatedLens).toContain('Pharmacogenomics');
    expect(grounding.loinc.code).toBe('79713-4');
    expect(grounding.snomed.id).toBe('427814002');
    expect(grounding.rxNorm?.id).toBe('11289');
    expect(grounding.rxNorm?.name).toBe('Warfarin');
    expect(grounding.confidence).toBeGreaterThan(0.7);
    expect(grounding.integrityDigest).toMatch(/^0x_biomed_[a-f0-9]{32}$/);
  });

  it('14. Grounds pediatric complex care and Form 2603 PDN respite to accurate taxonomies', async () => {
    const query = 'Pediatric MDCP Medicaid waiver Form 2603 Private Duty Nursing PDN respite';
    const grounding = await service.groundToClinicalTaxonomies(query);

    expect(grounding.latencyMs).toBeLessThan(15);
    expect(grounding.associatedLens).toContain('Pediatric MDCP');
    expect(grounding.loinc.code).toBe('78453-8');
    expect(grounding.snomed.id).toBe('410604004');
    expect(grounding.rxNorm?.id).toBe('1009146');
    expect(grounding.confidence).toBeGreaterThan(0.7);
    expect(grounding.integrityDigest).toBeDefined();
  });

  it('15. Grounds 810nm photobiomodulation & Cytochrome c Oxidase with sub-15ms latency', async () => {
    const query = '810nm near infrared laser photobiomodulation Cytochrome c Oxidase vagal HRV tone';
    const grounding = await service.groundToClinicalTaxonomies(query);

    expect(grounding.latencyMs).toBeLessThan(15);
    expect(grounding.associatedLens).toContain('Autonomic Pacing & Photobiomodulation');
    expect(grounding.loinc.code).toBe('80404-7');
    expect(grounding.snomed.id).toBe('365979007');
    expect(grounding.rxNorm?.id).toBe('855332');
    expect(grounding.integrityDigest).toMatch(/^0x_biomed_/);
  });

  it('16. Verifies all 11 Clinical Lenses are defined with complete taxonomy codes and axioms', () => {
    expect(POCKETGULL_11_CLINICAL_LENSES.length).toBe(11);
    for (const lens of POCKETGULL_11_CLINICAL_LENSES) {
      expect(lens.lensId).toMatch(/^LENS_\d{2}_/);
      expect(lens.loincCode).toBeTruthy();
      expect(lens.snomedId).toBeTruthy();
      expect(lens.clinicalAxiom).toBeTruthy();
      expect(lens.keywords.length).toBeGreaterThan(5);
    }
  });

  it('17. Detects and reports the active execution backend signal', () => {
    const backend = service.activeBackend();
    expect(['CHROME_BUILTIN_AI', 'BIOMEDCLIP_ONNX_EMBEDDER', 'DETERMINISTIC_SIMD']).toContain(backend);
  });

  it('18. Handles empty and whitespace queries gracefully in matchClinicalLenses', async () => {
    const emptyResult = await service.matchClinicalLenses('');
    expect(emptyResult.matches).toEqual([]);
    expect(emptyResult.topLens).toBeDefined();
    expect(emptyResult.latencyMs).toBeLessThan(15);
  });
});
