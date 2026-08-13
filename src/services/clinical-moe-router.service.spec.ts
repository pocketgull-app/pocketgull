import '@angular/compiler';
import { ClinicalMoERouterService } from './clinical-moe-router.service';

describe('ClinicalMoERouterService', () => {
  let service: ClinicalMoERouterService;

  beforeEach(() => {
    service = new ClinicalMoERouterService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should activate base Gulliver Core synthesizer by default', () => {
    const cluster = service.activeExpertCluster();
    expect(cluster.length).toBe(1);
    expect(cluster[0].id).toBe('gulliver-core');
    expect(service.computeEfficiencySavingsPercent()).toBe(36); // 1.2 / 1.88 GFLOPs active = ~36% savings
  });

  it('should dynamically activate Acoustic Sidecar when acoustic telemetry is enabled', () => {
    service.setAcousticTelemetryState(true);
    const cluster = service.activeExpertCluster();
    const ids = cluster.map(e => e.id);

    expect(ids).toContain('gulliver-core');
    expect(ids).toContain('acoustic-sidecar');
    expect(service.computeEfficiencySavingsPercent()).toBe(28); // (1.2 + 0.15) / 1.88 GFLOPs active
  });

  it('should dynamically activate SIBI Bridge when lens is Teledentistry & Systemic Health', () => {
    service.setActiveLens('Teledentistry & Systemic Health');
    const cluster = service.activeExpertCluster();
    const ids = cluster.map(e => e.id);

    expect(ids).toContain('gulliver-core');
    expect(ids).toContain('sibi-bridge');
    expect(service.computeEfficiencySavingsPercent()).toBe(32); // (1.2 + 0.08) / 1.88 GFLOPs active
  });

  it('should dynamically activate Spatial 3D DICOM Shader when DICOM volume is present', () => {
    service.setDICOMVolumeState(true);
    const cluster = service.activeExpertCluster();
    const ids = cluster.map(e => e.id);

    expect(ids).toContain('gulliver-core');
    expect(ids).toContain('dicom-spatial-shader');
    expect(service.computeEfficiencySavingsPercent()).toBe(12); // (1.2 + 0.45) / 1.88 GFLOPs active
  });

  it('should activate all subnets when all triggers are active', () => {
    service.setAcousticTelemetryState(true);
    service.setDICOMVolumeState(true);
    service.setActiveLens('Teledentistry & Systemic Health');

    const cluster = service.activeExpertCluster();
    expect(cluster.length).toBe(4);
    expect(service.computeEfficiencySavingsPercent()).toBe(0); // 100% of dense pass active
  });

  it('should assign Fast (Low Latency) thinking budget for Summary Overview by default', () => {
    const config = service.currentThinkingConfig();
    expect(config.thinkingBudget).toBe(1024);
    expect(config.reasoningTier).toBe('Fast (Low Latency)');
    expect(config.includeThoughts).toBe(true);
  });

  it('should assign Deep Clinical Synthesis (High Acuity) thinking budget for high-complexity lenses', () => {
    service.setActiveLens('RSNA Knee Abnormality');
    const config = service.currentThinkingConfig();
    expect(config.thinkingBudget).toBe(8192);
    expect(config.reasoningTier).toBe('Deep Clinical Synthesis (High Acuity)');
  });

  it('should allow custom thinking budget overrides', () => {
    service.setCustomThinkingBudget(16384);
    const config = service.currentThinkingConfig();
    expect(config.thinkingBudget).toBe(16384);
    expect(config.reasoningTier).toBe('Deep Clinical Synthesis (High Acuity)');

    service.setCustomThinkingBudget(512);
    expect(service.currentThinkingConfig().reasoningTier).toBe('Fast (Low Latency)');

    service.setCustomThinkingBudget(null);
    expect(service.currentThinkingConfig().thinkingBudget).toBe(1024);
  });
});

