import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardiacElectrophysiology3dLensComponent } from './cardiac-electrophysiology-3d-lens.component';
import { PatientStateService } from '../../services/patient-state.service';
import { IntelligenceProviderToken } from '../../services/ai/intelligence.provider.token';

describe('CardiacElectrophysiology3dLensComponent (Visual Model V6)', () => {
  let component: CardiacElectrophysiology3dLensComponent;
  let fixture: ComponentFixture<CardiacElectrophysiology3dLensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardiacElectrophysiology3dLensComponent],
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

    fixture = TestBed.createComponent(CardiacElectrophysiology3dLensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('1. Initializes and renders header, preset tabs, HUD, and 3D canvas container', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('3D Cardiac Electrophysiology & Action Potential Conduction Lens (Visual Model V6)');
    expect(el.textContent).toContain('Normal Sinus');
    expect(el.textContent).toContain('Long QTc (hERG Block)');
    expect(el.textContent).toContain('Torsades de Pointes');
    expect(el.textContent).toContain('Hypokalemic EAD');
    expect(el.textContent).toContain('Synchronized Lead II Rhythm Strip');
    expect(el.textContent).toContain('Phase 0 (I_Na)');
    expect(el.textContent).toContain('Phase 2 (I_Ca,L)');
    expect(el.textContent).toContain('Phase 3 (I_Kr)');
    expect(el.textContent).toContain('EAD / TdP Risk');
  });

  it('2. Initializes in normal sinus rhythm with pristine repolarization', () => {
    expect(component.regime()).toBe('normal_sinus');
    const tele = component.telemetry();
    expect(tele.heartRateBpm).toBe(72);
    expect(tele.qtcIntervalMs).toBe(410);
    expect(tele.qtcStatus).toBe('Normal (< 440ms)');
    expect(tele.conductionVelocityMs).toBe(1.0);
    expect(tele.eadInstabilityPercent).toBe(0);
    expect(tele.arrhythmiaRiskTier).toBe('Quiescent Sinus Homeostasis');
    expect(tele.dominantIonPhase).toBe('Phase 2 (I_Ca,L Plateau)');
  });

  it('3. Sets drug-induced long QTc regime with delayed repolarization', () => {
    component.setRegime('drug_induced_long_qtc');
    fixture.detectChanges();

    expect(component.regime()).toBe('drug_induced_long_qtc');
    const tele = component.telemetry();
    expect(tele.heartRateBpm).toBe(76);
    expect(tele.qtcIntervalMs).toBe(510);
    expect(tele.qtcStatus).toBe('Critical QTc (> 500ms)');
    expect(tele.eadInstabilityPercent).toBe(35);
    expect(tele.arrhythmiaRiskTier).toBe('Vulnerable Repolarization Window');
    expect(tele.dominantIonPhase).toBe('Phase 3 (I_Kr/I_Ks Repolarization)');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('510 ms');
    expect(el.textContent).toContain('PROLONGED REPOLARIZATION');
  });

  it('4. Sets severe Torsades de Pointes regime with high EAD instability and tachycardia', () => {
    component.setRegime('severe_torsades_de_pointes');
    fixture.detectChanges();

    expect(component.regime()).toBe('severe_torsades_de_pointes');
    const tele = component.telemetry();
    expect(tele.heartRateBpm).toBe(145);
    expect(tele.qtcIntervalMs).toBe(560);
    expect(tele.qtcStatus).toBe('Critical QTc (> 500ms)');
    expect(tele.eadInstabilityPercent).toBe(85);
    expect(tele.arrhythmiaRiskTier).toBe('Critical Torsades de Pointes Hazard');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('145 BPM');
    expect(el.textContent).toContain('560 ms');
    expect(el.textContent).toContain('85%');
    expect(el.textContent).toContain('Critical Torsades de Pointes Hazard');
  });

  it('5. Sets hypokalemic arrhythmia regime with marked EAD vulnerability', () => {
    component.setRegime('hypokalemia_arrhythmia');
    fixture.detectChanges();

    expect(component.regime()).toBe('hypokalemia_arrhythmia');
    const tele = component.telemetry();
    expect(tele.heartRateBpm).toBe(88);
    expect(tele.qtcIntervalMs).toBe(530);
    expect(tele.qtcStatus).toBe('Critical QTc (> 500ms)');
    expect(tele.eadInstabilityPercent).toBe(65);
    expect(tele.arrhythmiaRiskTier).toBe('Vulnerable Repolarization Window');
  });

  it('6. Toggles play/pause and cycles simulation flow speed', () => {
    expect(component.isPlaying()).toBe(true);
    component.togglePlay();
    expect(component.isPlaying()).toBe(false);
    component.togglePlay();
    expect(component.isPlaying()).toBe(true);

    expect(component.flowSpeed()).toBe(1.0);
    component.toggleSpeed();
    expect(component.flowSpeed()).toBe(1.5);
    component.toggleSpeed();
    expect(component.flowSpeed()).toBe(2.0);
    component.toggleSpeed();
    expect(component.flowSpeed()).toBe(0.5);
    component.toggleSpeed();
    expect(component.flowSpeed()).toBe(1.0);
  });

  it('7. Handles camera reset and cleanly disposes Three.js resources on destroy', () => {
    expect(() => component.resetCamera()).not.toThrow();
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
