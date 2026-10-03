import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfflineEdgeControlsComponent } from './offline-edge-controls.component';
import { OfflineEdgeAiService } from '../services/offline-edge-ai.service';
import { NetworkStateService } from '../services/network-state.service';

describe('OfflineEdgeControlsComponent', () => {
  let component: OfflineEdgeControlsComponent;
  let fixture: ComponentFixture<OfflineEdgeControlsComponent>;
  let networkService: NetworkStateService;
  let edgeAiService: OfflineEdgeAiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfflineEdgeControlsComponent],
      providers: [OfflineEdgeAiService, NetworkStateService]
    }).compileComponents();

    fixture = TestBed.createComponent(OfflineEdgeControlsComponent);
    component = fixture.componentInstance;
    networkService = TestBed.inject(NetworkStateService);
    edgeAiService = TestBed.inject(OfflineEdgeAiService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders Offline PWA & WebAssembly Edge AI header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Offline PWA & WebAssembly Edge AI Controls');
    expect(el.textContent).toContain('WASM / ONNX On-Device Engine');
  });

  it('2. Toggles force offline mode via network service', () => {
    expect(networkService.forceOffline()).toBe(false);
    component.toggleForceOffline();
    expect(networkService.forceOffline()).toBe(true);

    component.toggleForceOffline();
    expect(networkService.forceOffline()).toBe(false);
  });

  it('3. Triggers prefetchModel on OfflineEdgeAiService', () => {
    const prefetchSpy = vi.spyOn(edgeAiService, 'prefetchModelWeights');
    component.prefetchModel();
    expect(prefetchSpy).toHaveBeenCalledWith('gemma-2b-quantized-wasm');
  });

  it('4. Runs test inference for SBAR Synthesis and displays output', async () => {
    vi.spyOn(edgeAiService, 'synthesizeOfflineClinicalReport').mockResolvedValue('SBAR: Situation stable.');
    await component.runTestInference();
    fixture.detectChanges();

    expect(component.testOutput()).toBe('SBAR: Situation stable.');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('SBAR: Situation stable.');
  });

  it('5. Runs Acuity Classifier test and formats on-device output', async () => {
    vi.spyOn(edgeAiService, 'classifyAcuity').mockResolvedValue({
      category: 'STAT_EMERGENCY',
      confidence: 0.95,
      modelEngine: 'Chrome Built-in AI (Prompt API)',
      latencyMs: 14,
      rationale: 'Acute chest pain detected',
      ismpSafetyAudit: { isSafe: true, violations: [] }
    } as any);

    await component.runAcuityClassifierTest();
    fixture.detectChanges();

    expect(component.testOutput()).toContain('[ON-DEVICE ACUITY CLASSIFICATION]');
    expect(component.testOutput()).toContain('STAT_EMERGENCY');
    expect(component.testOutput()).toContain('95%');
  });
});
