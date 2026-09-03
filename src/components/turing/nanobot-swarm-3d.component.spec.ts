import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NanobotSwarm3dComponent } from './nanobot-swarm-3d.component';
import { NanobotSwarmPhysicsService } from '../../services/nanobot-swarm-physics.service';

describe('NanobotSwarm3dComponent Unit Suite', () => {
  let component: NanobotSwarm3dComponent;
  let fixture: ComponentFixture<NanobotSwarm3dComponent>;
  let physicsService: NanobotSwarmPhysicsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NanobotSwarm3dComponent],
      providers: [NanobotSwarmPhysicsService]
    }).compileComponents();

    fixture = TestBed.createComponent(NanobotSwarm3dComponent);
    component = fixture.componentInstance;
    physicsService = TestBed.inject(NanobotSwarmPhysicsService);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('1. Initializes cleanly with default acoustic drill mode and telemetry readouts', () => {
    expect(component).toBeTruthy();
    expect(component.activeMode()).toBe('ACOUSTIC_DRILL');
    expect(component.coherence()).toBeGreaterThanOrEqual(0.0);
    expect(component.coherence()).toBeLessThanOrEqual(1.0);
    expect(component.collectiveThrust()).toBeGreaterThan(0.0);
    expect(component.targetSite().targetType).toBe('THROMBOSIS');
  });

  it('2. Switches operational modes across all 4 space-telescope paradigms', () => {
    component.setMode('CORONAGRAPHIC_TRACKING');
    expect(component.activeMode()).toBe('CORONAGRAPHIC_TRACKING');
    expect(component.coronagraphicTelemetry().speckleNullingEfficiencyPercent).toBeGreaterThan(99.0);

    component.setMode('DUROTACTIC_HOMING');
    expect(component.activeMode()).toBe('DUROTACTIC_HOMING');

    component.setMode('SERS_ACIDOSIS');
    expect(component.activeMode()).toBe('SERS_ACIDOSIS');

    component.setMode('ACOUSTIC_DRILL');
    expect(component.activeMode()).toBe('ACOUSTIC_DRILL');
  });

  it('3. Updates acoustic steering pitch, yaw, and pressure from slider events', () => {
    const mockPitchEvent = { target: { value: '45' } } as unknown as Event;
    component.onPitchChange(mockPitchEvent);
    expect(component.steering().pitchDeg).toBe(45);

    const mockYawEvent = { target: { value: '180' } } as unknown as Event;
    component.onYawChange(mockYawEvent);
    expect(component.steering().yawDeg).toBe(180);

    const mockPressureEvent = { target: { value: '2.2' } } as unknown as Event;
    component.onPressureChange(mockPressureEvent);
    expect(component.steering().acousticPressureMpa).toBe(2.2);
  });

  it('4. Computes coronagraphic SNR gain reflecting Roman space observatory nulling', () => {
    component.setMode('CORONAGRAPHIC_TRACKING');
    const tele = component.coronagraphicTelemetry();
    expect(tele.coronagraphicSnrGainDb).toBeGreaterThan(20.0);
    expect(tele.tissuePenetrationDepthMm).toBe(38.0);
  });
});
