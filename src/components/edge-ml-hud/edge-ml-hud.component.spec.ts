import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { EdgeMlHudComponent } from './edge-ml-hud.component';
import { OnnxWebGpuEngineService } from '../../services/onnx-webgpu-engine.service';
import { PatientStateService } from '../../services/patient-state.service';
import { ClinicalMoERouterService } from '../../services/clinical-moe-router.service';

describe('EdgeMlHudComponent Unit Suite', () => {
  let component: EdgeMlHudComponent;
  let onnxService: OnnxWebGpuEngineService;
  let moeRouter: ClinicalMoERouterService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdgeMlHudComponent],
      providers: [OnnxWebGpuEngineService, PatientStateService, ClinicalMoERouterService]
    }).compileComponents();

    const fixture = TestBed.createComponent(EdgeMlHudComponent);
    component = fixture.componentInstance;
    onnxService = TestBed.inject(OnnxWebGpuEngineService);
    moeRouter = TestBed.inject(ClinicalMoERouterService);
    moeRouter.clearOverrides();
  });

  afterEach(() => {
    moeRouter.clearOverrides();
  });

  it('1. Initializes component and executes current patient edge inference pass', async () => {
    await component.ngOnInit();
    expect(onnxService.isReady()).toBe(true);
    expect(component.latestResult()).toBeTruthy();
    expect(component.latestResult()?.patientId).toBe('CURRENT_ACTIVE_PATIENT');
  });

  it('2. Evaluates 95% conformal prediction intervals and recovery trajectory', async () => {
    await component.ngOnInit();
    const res = component.latestResult();
    expect(res).not.toBeNull();
    if (res) {
      expect(res.conformalLowerBound).toBeGreaterThanOrEqual(0.0);
      expect(res.conformalUpperBound).toBeLessThanOrEqual(1.0);
      expect(res.conformalLowerBound).toBeLessThanOrEqual(res.conformalUpperBound);
      expect(res.predictedRecoveryWeeks).toBeGreaterThan(0);
      expect(res.topDrivers.length).toBe(3);
    }
  });

  it('3. Runs 50-patient batch throughput benchmark and calculates samples/sec', async () => {
    await component.ngOnInit();
    await component.runBatchBenchmark();

    const batch = component.batchResult();
    expect(batch).not.toBeNull();
    expect(batch?.totalLatencyMs).toBeGreaterThanOrEqual(0.0);
    expect(batch?.throughputSamplesPerSec).toBeGreaterThan(0);
  });

  it('4. Emits hemodynamic-posology Synapse pulse on evaluation, collapses exploratory sub-panels under stat-focused density, and records 64-char hex attestation receipt', async () => {
    await component.ngOnInit();
    expect(component.isHemodynamicSynapseActive()).toBe(true);
    expect(moeRouter.activeSynapsePulse()?.token).toBe('hemodynamic-posology-coupling');

    expect(component.isExploratoryCollapsed()).toBe(false);
    moeRouter.setMicroSkillDensityOverride('stat-focused');
    expect(component.isExploratoryCollapsed()).toBe(true);

    component.attestAndRetireEdgeHud();
    const receipt = moeRouter.completedSkillReceipts().find(r => r.expertId === 'edge-ml-hud');
    expect(receipt).toBeDefined();
    expect(receipt?.sha256DigestHex).toMatch(/^[0-9a-f]{64}$/);
  });
});
