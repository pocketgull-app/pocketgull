import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { EdgeMlHudComponent } from './edge-ml-hud.component';
import { OnnxWebGpuEngineService } from '../../services/onnx-webgpu-engine.service';
import { PatientStateService } from '../../services/patient-state.service';

describe('EdgeMlHudComponent Unit Suite', () => {
  let component: EdgeMlHudComponent;
  let onnxService: OnnxWebGpuEngineService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdgeMlHudComponent],
      providers: [OnnxWebGpuEngineService, PatientStateService]
    }).compileComponents();

    const fixture = TestBed.createComponent(EdgeMlHudComponent);
    component = fixture.componentInstance;
    onnxService = TestBed.inject(OnnxWebGpuEngineService);
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
});
