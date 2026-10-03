import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FunctionalCircadianSynergyBridgeComponent } from './functional-circadian-synergy-bridge.component';
import { PatientStateService } from '../../services/patient-state.service';

describe('FunctionalCircadianSynergyBridgeComponent', () => {
  let component: FunctionalCircadianSynergyBridgeComponent;
  let fixture: ComponentFixture<FunctionalCircadianSynergyBridgeComponent>;
  let patientState: PatientStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FunctionalCircadianSynergyBridgeComponent],
      providers: [PatientStateService]
    }).compileComponents();

    fixture = TestBed.createComponent(FunctionalCircadianSynergyBridgeComponent);
    component = fixture.componentInstance;
    patientState = TestBed.inject(PatientStateService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders Functional-Circadian Cross-Lens Synergy Engine header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Functional-Circadian Cross-Lens Synergy Engine');
    expect(el.textContent).toContain('IFM 7-Node × SCN Diurnal Cross-Talk');
  });

  it('2. Computes and displays telemetry metrics for IFM node and SCN clock', () => {
    const fm = component.fmTelemetry();
    const chrono = component.chronoTelemetry();
    expect(fm).toBeDefined();
    expect(chrono).toBeDefined();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Systemic Inflammatory Node');
    expect(el.textContent).toContain('Circadian SCN Clock');
    expect(el.textContent).toContain(`${fm.inflammatoryScore}`);
    expect(el.textContent).toContain(`${chrono.circadianDisruptionIndex}`);
  });

  it('3. Renders synergy burden score and status badge', () => {
    const synergy = component.synergy();
    expect(synergy.score).toBeGreaterThanOrEqual(0);
    expect(synergy.status).toBeDefined();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Synergy Burden:');
    expect(el.textContent).toContain(`${synergy.score}/100`);
    expect(el.textContent).toContain(synergy.status);
  });

  it('4. Prescribes vagal HRV tool and cycles tool state in PatientStateService', () => {
    const cycleSpy = vi.spyOn(patientState, 'cycleToolState');
    component.prescribeVagalTool();
    expect(cycleSpy).toHaveBeenCalledWith('vagal');
  });

  it('5. Prescribes meal synchronization and sets Time-Restricted Feeding dietary protocol', () => {
    component.prescribeMealSync();
    expect(patientState.dietaryProtocol()).toBe('Time-Restricted Feeding (10:00 - 18:00)');
  });
});
