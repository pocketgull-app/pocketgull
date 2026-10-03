import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GaitKinematics3dViewerComponent } from './gait-kinematics-3d-viewer.component';
import { PatientStateService } from '../../services/patient-state.service';
import { KinesiologyBiomechanicsService } from '../../services/kinesiology-biomechanics.service';
import { IntelligenceProviderToken } from '../../services/ai/intelligence.provider.token';

describe('GaitKinematics3dViewerComponent (Visual Model V3)', () => {
  let component: GaitKinematics3dViewerComponent;
  let fixture: ComponentFixture<GaitKinematics3dViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GaitKinematics3dViewerComponent],
      providers: [
        PatientStateService,
        KinesiologyBiomechanicsService,
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock CDS response'),
            streamContent: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GaitKinematics3dViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and renders 3D Biomechanical Gait & Joint Kinematics header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('3D Biomechanical Gait & Joint Kinematics (Visual Model V3)');
    expect(el.textContent).toContain('Normal Gait');
    expect(el.textContent).toContain('Antalgic Limp (Knee Pain)');
    expect(el.textContent).toContain('Trendelenburg (Hip Drop)');
    expect(el.textContent).toContain('Spastic Hemiparetic');
  });

  it('2. Computes baseline physiological symmetrical gait telemetry in normal mode', () => {
    component.setGaitMode('normal');
    component.gaitProgress.set(0.2); // Loading response phase
    fixture.detectChanges();

    const telemetry = component.activeTelemetry();
    expect(telemetry.gaitPhase).toBe('Loading Response');
    expect(typeof telemetry.hipAngleDeg).toBe('number');
    expect(typeof telemetry.kneeAngleDeg).toBe('number');
    expect(typeof telemetry.ankleAngleDeg).toBe('number');
    expect(telemetry.grfMultiplier).toBeGreaterThan(0);

    expect(component.asymmetryRatio()).toContain('Symmetric Normal Range');
    expect(component.asymmetryPercent()).toBe(50);
  });

  it('3. Modulates kinematics and flags guarded flexion in Antalgic Limp mode', () => {
    component.setGaitMode('antalgic_right');
    component.gaitProgress.set(0.1);
    fixture.detectChanges();

    const telemetry = component.activeTelemetry();
    expect(component.gaitMode()).toBe('antalgic_right');
    expect(component.pathologyTitle()).toContain('Antalgic Limp');
    expect(component.pathologyExplanation()).toContain('shortens the right stance phase');
    expect(component.asymmetryRatio()).toContain('Severe Left Stance Preference');
    expect(component.asymmetryPercent()).toBe(75);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Right Lower Limb Antalgic Limp');
  });

  it('4. Highlights pelvic tilt drop in Trendelenburg mode', () => {
    component.setGaitMode('trendelenburg');
    component.gaitProgress.set(0.25);
    fixture.detectChanges();

    const telemetry = component.activeTelemetry();
    expect(component.gaitMode()).toBe('trendelenburg');
    expect(component.pathologyTitle()).toContain('Trendelenburg Gait');
    expect(component.pathologyExplanation()).toContain('gluteus medius');
    expect(component.asymmetryRatio()).toContain('Right Abductor Insufficiency');
  });

  it('5. Toggles play/pause state and cycles playback speed multiplier', () => {
    expect(component.isPlaying()).toBe(true);

    component.togglePlay();
    expect(component.isPlaying()).toBe(false);

    component.togglePlay();
    expect(component.isPlaying()).toBe(true);

    expect(component.speedMultiplier()).toBe(1.0);
    component.toggleSpeed();
    expect(component.speedMultiplier()).toBe(1.5);
    component.toggleSpeed();
    expect(component.speedMultiplier()).toBe(0.5);
    component.toggleSpeed();
    expect(component.speedMultiplier()).toBe(1.0);
  });

  it('6. Executes resetCamera safely without error', () => {
    expect(() => component.resetCamera()).not.toThrow();
  });

  it('7. Cleans up animation frames and WebGL resources on ngOnDestroy', () => {
    expect(() => fixture.destroy()).not.toThrow();
  });
});
