import '@angular/compiler';
import { OnnxWebGpuEngineService } from './onnx-webgpu-engine.service';

describe('OnnxWebGpuEngineService Unit Suite', () => {
  let service: OnnxWebGpuEngineService;

  beforeEach(() => {
    service = new OnnxWebGpuEngineService();
  });

  it('1. Initializes default model metadata with OOF ROC-AUC and conformal quantile', () => {
    const meta = service.modelMetadata();
    expect(meta.modelName).toBe('pocketgull_calibrated_clinical_edge_mlp');
    expect(meta.opsetVersion).toBe(17);
    expect(meta.inputDim).toBe(32);
    expect(meta.outputDim).toBe(1);
    expect(meta.oofRocAuc).toBeGreaterThanOrEqual(0.90);
    expect(meta.conformalQ95Quantile).toBeGreaterThan(0.0);
    expect(service.isReady()).toBe(false);
    expect(service.lastInference()).toBeNull();
  });

  it('2. Compiles compute kernels, runs warmup pass, and updates ready state', async () => {
    const ready = await service.initializeEngine();
    expect(ready).toBe(true);
    expect(service.isReady()).toBe(true);
    expect(service.modelMetadata().isWarmedUp).toBe(true);
  });

  it('3. Evaluates single-patient risk score with calibrated conformal intervals and recovery weeks', async () => {
    await service.initializeEngine();
    const features = new Array(32).fill(0.5);
    const result = await service.scorePatient('PT-JAX-001', features);

    expect(result.patientId).toBe('PT-JAX-001');
    expect(result.riskScore).toBeGreaterThanOrEqual(0.0);
    expect(result.riskScore).toBeLessThanOrEqual(1.0);
    expect(result.conformalLowerBound).toBeGreaterThanOrEqual(0.0);
    expect(result.conformalUpperBound).toBeLessThanOrEqual(1.0);
    expect(result.conformalLowerBound).toBeLessThanOrEqual(result.conformalUpperBound);
    expect(result.predictedRecoveryWeeks).toBeGreaterThan(0);
    expect(['STAT_EMERGENCY', 'URGENT', 'ROUTINE']).toContain(result.acuityLevel);
    expect(result.confidence).toBeGreaterThan(0.5);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0.0);
    expect(result.integrityDigest).toMatch(/^0x_onnx_/);
    expect(result.topDrivers.length).toBeGreaterThan(0);
    expect(service.lastInference()?.patientId).toBe('PT-JAX-001');
  });

  it('4. Extracts 32-dimensional feature vector from live patient state signals', () => {
    const mockVitals = { heartRate: 85, hrv: 35, spo2: 97, systolic: 135, diastolic: 88, vitality: 68 };
    const mockRadiomics = { duralCompressionPercent: 62, ariaDangerScore: 78 };

    const vec = service.extractFeaturesFromPatientState(mockVitals, mockRadiomics);
    expect(vec.length).toBe(32);
    expect(vec[4]).toBeCloseTo(0.68);
    expect(vec[5]).toBeCloseTo(85 / 120.0);
    expect(vec[12]).toBeCloseTo(0.62);
    expect(vec[13]).toBeCloseTo(0.78);
  });

  it('5. Executes vectorized batch scoring and computes throughput telemetry', async () => {
    await service.initializeEngine();
    const batch = [
      { patientId: 'PT-001', features: new Array(32).fill(0.2) },
      { patientId: 'PT-002', features: new Array(32).fill(0.8) },
      { patientId: 'PT-003', features: new Array(32).fill(0.5) }
    ];

    const batchRes = await service.scoreBatch(batch);
    expect(batchRes.results.length).toBe(3);
    expect(batchRes.totalLatencyMs).toBeGreaterThanOrEqual(0.0);
    expect(batchRes.throughputSamplesPerSec).toBeGreaterThanOrEqual(0.0);
    expect(batchRes.results[0].patientId).toBe('PT-001');
    expect(batchRes.results[1].patientId).toBe('PT-002');
    expect(batchRes.results[2].patientId).toBe('PT-003');
  });

  it('6. Projects high-risk oncogenic/fibrotic patient state to stiff matrix and polycomb epigenetic priors', () => {
    const mockHighRiskResult: any = { riskScore: 0.85 };
    const priors = service.projectPhysicalGenomicsPriors(mockHighRiskResult, { conditions: ['Pancreatic Adenocarcinoma (PDAC)'] });

    expect(priors.ecmStiffnessKPa).toBeGreaterThanOrEqual(20.0);
    expect(priors.actinTensionNn).toBeGreaterThan(3.0);
    expect(['POLYCOMB_H3K27ME3', 'HETEROCHROMATIN_H3K9ME3']).toContain(priors.epigeneticState);
    expect(priors.med1ConcentrationUm).toBeGreaterThanOrEqual(5.0);
    expect(priors.tubulinLys40AcetylationRatio).toBeLessThan(1.0);
    expect(priors.rationale).toContain('High-stiffness fibrotic/oncogenic stroma');
  });

  it('7. Projects neurodegenerative patient state to tubulin catastrophe and axonal transport deficit priors', () => {
    const mockNeuroRiskResult: any = { riskScore: 0.52 };
    const priors = service.projectPhysicalGenomicsPriors(mockNeuroRiskResult, { conditions: ['X-Linked Adrenoleukodystrophy (ALD)'] });

    expect(priors.ecmStiffnessKPa).toBe(8.5);
    expect(priors.epigeneticState).toBe('UNMODIFIED_CANONICAL');
    expect(priors.tubulinCatastropheRatePerMin).toBeGreaterThan(4.0);
    expect(priors.tubulinLys40AcetylationRatio).toBe(0.72);
    expect(priors.rationale).toContain('Neurodegenerative profile');
  });

  it('8. Projects low-risk homeostatic patient state to soft compliant matrix and hyperacetylated H3K27ac priors', () => {
    const mockLowRiskResult: any = { riskScore: 0.15 };
    const priors = service.projectPhysicalGenomicsPriors(mockLowRiskResult, { conditions: [] });

    expect(priors.ecmStiffnessKPa).toBe(2.8);
    expect(priors.epigeneticState).toBe('HYPERACETYLATED_H3K27AC');
    expect(priors.actinTensionNn).toBe(1.2);
    expect(priors.tubulinLys40AcetylationRatio).toBe(1.48);
    expect(priors.rationale).toContain('Compliant homeostatic matrix');
  });

  it('9. Predicts on-target CRISPR cleavage vs seed mismatch proofreading gating', () => {
    // 100% matched 20-nt guide & target
    const onTarget = service.predictCrisprCleavage(
      'GACUUGAGCUAGCUAGCUAG',
      'GACTTGAGCTAGCTAGCTAG',
      -0.07,
      0.85
    );
    expect(onTarget.isProofreadingPassed).toBe(true);
    expect(onTarget.cleavageProbability).toBeGreaterThan(0.70);
    expect(onTarget.netDeltaGKcalMol).toBeLessThan(-12.0);
    expect(onTarget.frameshiftScore).toBeGreaterThan(0.5);

    // Seed mismatch at position 2
    const offTarget = service.predictCrisprCleavage(
      'GACUUGAGCUAGCUAGCUAG',
      'GTCTTGAGCTAGCTAGCTAG',
      -0.07,
      0.85
    );
    expect(offTarget.isProofreadingPassed).toBe(false);
    expect(offTarget.cleavageProbability).toBeLessThan(0.15);
  });

  it('10. Predicts CTCF TAD boundary insulation and detects central motif deletion mega-TAD fusion', () => {
    const intact = service.predictCtcfTadBoundary(1.2, 0.15, false);
    expect(intact.tadInsulationScore).toBeGreaterThan(0.75);
    expect(intact.fractalGamma).toBe(1.02);
    expect(intact.loopSpanKb).toBe(500);

    const deleted = service.predictCtcfTadBoundary(1.2, 0.15, true);
    expect(deleted.tadInsulationScore).toBe(0.38);
    expect(deleted.fractalGamma).toBe(0.88);
    expect(deleted.loopSpanKb).toBe(1000);
  });

  it('11. Predicts Flory-Huggins liquid-liquid phase separation droplet radius and Pol II enrichment', () => {
    const dense = service.predictFloryHugginsLlps(6.0, 5.0, 3.0, 150.0);
    expect(dense.isPhaseSeparated).toBe(true);
    expect(dense.dropletRadiusNm).toBeGreaterThan(100.0);
    expect(dense.polIiEnrichmentFold).toBeGreaterThan(20.0);
    expect(dense.burstFrequencyPerHour).toBeGreaterThan(5.0);

    const diffuse = service.predictFloryHugginsLlps(1.0, 1.0, 0.5, 150.0);
    expect(diffuse.isPhaseSeparated).toBe(false);
    expect(diffuse.dropletRadiusNm).toBe(0.0);
  });

  it('12. Predicts LINC mechanotransduction force, nuclear pore dilation, and YAP/TAZ nuclear translocation', () => {
    const stiffMatrix = service.predictLincMechanotransduction(35.0, 4.5, 1.0);
    expect(stiffMatrix.lincForcePn).toBeGreaterThan(20.0);
    expect(stiffMatrix.poreDilationNm).toBeGreaterThan(13.0);
    expect(stiffMatrix.yapTazNuclearRatio).toBeGreaterThan(3.5);
    expect(stiffMatrix.nuclearAspectRatio).toBeGreaterThan(1.2);
  });
});

