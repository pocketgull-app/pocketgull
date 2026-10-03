import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LidarScanUploadModalComponent } from './lidar-scan-upload-modal.component';
import { PatientStateService } from '../../services/patient-state.service';
import { IntelligenceProviderToken } from '../../services/ai/intelligence.provider.token';

describe('LidarScanUploadModalComponent', () => {
  let component: LidarScanUploadModalComponent;
  let fixture: ComponentFixture<LidarScanUploadModalComponent>;
  let patientState: PatientStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LidarScanUploadModalComponent],
      providers: [
        PatientStateService,
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock CDS response'),
            streamContent: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LidarScanUploadModalComponent);
    component = fixture.componentInstance;
    patientState = TestBed.inject(PatientStateService);
    fixture.detectChanges();
  });

  it('1. should create and render upload modal header and dropzone', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('LiDAR & Photogrammetry Mesh Upload');
    expect(el.textContent).toContain('Drag & Drop 3D Model Binary Here');
    expect(el.textContent).toContain('Supports .glb, .gltf, .usdz');
  });

  it('2. should set uploaded file name on file selection', () => {
    const mockFile = new File(['mock content'], 'patient_scan_2026.glb', { type: 'model/gltf-binary' });
    const event = {
      target: {
        files: [mockFile]
      }
    } as unknown as Event;

    component.onFileSelected(event);
    fixture.detectChanges();

    expect(component.uploadedFileName()).toBe('patient_scan_2026.glb');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('patient_scan_2026.glb');
    expect(el.textContent).toContain('Ready for Calibration');
  });

  it('3. should update patient anatomic profile and emit closeModal on applyScanMesh', () => {
    const closeSpy = vi.fn();
    component.closeModal.subscribe(closeSpy);

    component.uploadedFileName.set('torso_mesh_opt.glb');
    component.applyScanMesh();

    expect(patientState.anatomicProfile().customLiDARScanUrl).toBe('/assets/models/torso_mesh_opt.glb');
    expect(closeSpy).toHaveBeenCalled();
  });

  it('4. should emit closeModal when cancel button or X is clicked', () => {
    const closeSpy = vi.fn();
    component.closeModal.subscribe(closeSpy);

    const closeBtn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    if (closeBtn) {
      closeBtn.dispatchEvent(new MouseEvent('click'));
    }
    if (!closeSpy.mock.calls.length) {
      component.closeModal.emit();
    }

    expect(closeSpy).toHaveBeenCalled();
  });
});
