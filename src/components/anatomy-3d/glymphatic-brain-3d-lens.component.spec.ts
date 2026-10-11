import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlymphaticBrain3dLensComponent } from './glymphatic-brain-3d-lens.component';
import { PatientStateService } from '../../services/patient-state.service';

describe('GlymphaticBrain3dLensComponent (Visual Model V10)', () => {
  let component: GlymphaticBrain3dLensComponent;
  let fixture: ComponentFixture<GlymphaticBrain3dLensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlymphaticBrain3dLensComponent],
      providers: [PatientStateService]
    }).compileComponents();

    fixture = TestBed.createComponent(GlymphaticBrain3dLensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and renders the Glymphatic Brain 3D lens header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('3D Glymphatic Flow & Periarterial AQP4 Convection Lens (Model V10)');
    expect(el.textContent).toContain('Astrocytic Aquaporin-4 (AQP4) Water Channels');
    expect(el.textContent).toContain('Virchow-Robin Periarterial CSF Influx');
  });

  it('2. Defaults to Deep Slow-Wave Sleep (Stage N3) with +60% interstitial expansion', () => {
    expect(component.sleepState()).toBe('deep_sws');
    const tel = component.telemetry();
    expect(tel.interstitialSpaceExpansionPct).toBe(60);
    expect(tel.aqp4PolarizationIndexPct).toBe(96);
    expect(tel.convectiveFluxVelocityUmS).toBe(4.8);
    expect(tel.amyloidClearanceRatePctHr).toBe(18.5);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Deep Slow-Wave Sleep (Stage N3)');
    expect(el.textContent).toContain('+60%');
  });

  it('3. Transitions to Awake state and reduces convective flush velocity', () => {
    component.setSleepState('awake');
    fixture.detectChanges();

    expect(component.sleepState()).toBe('awake');
    const tel = component.telemetry();
    expect(tel.interstitialSpaceExpansionPct).toBe(0);
    expect(tel.convectiveFluxVelocityUmS).toBe(0.8);
    expect(tel.amyloidClearanceRatePctHr).toBe(2.1);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Awake / Active Mental State');
  });

  it('4. Transitions to Fragmented Sleep / OSA and updates clinical guidance', () => {
    component.setSleepState('sleep_fragmentation');
    fixture.detectChanges();

    const tel = component.telemetry();
    expect(tel.activeStateLabel).toContain('Fragmented Sleep / OSA Disruption');
    expect(tel.clinicalTakeaway).toContain('Recurrent micro-arousals');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Fragmented Sleep / OSA Disruption');
  });

  it('5. Toggles visibility of amyloid-beta and phosphorylated tau aggregates', () => {
    expect(component.showDebrisParticles()).toBe(true);
    component.toggleDebris();
    expect(component.showDebrisParticles()).toBe(false);
    component.toggleDebris();
    expect(component.showDebrisParticles()).toBe(true);
  });
});
