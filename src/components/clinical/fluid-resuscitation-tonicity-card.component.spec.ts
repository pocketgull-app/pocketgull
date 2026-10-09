import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FluidResuscitationTonicityCardComponent } from './fluid-resuscitation-tonicity-card.component';
import { FluidTonicityResuscitationService } from '../../services/fluid-tonicity-resuscitation.service';

describe('FluidResuscitationTonicityCardComponent (Clinical Model P14)', () => {
  let component: FluidResuscitationTonicityCardComponent;
  let fixture: ComponentFixture<FluidResuscitationTonicityCardComponent>;
  let service: FluidTonicityResuscitationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FluidResuscitationTonicityCardComponent],
      providers: [FluidTonicityResuscitationService]
    }).compileComponents();

    fixture = TestBed.createComponent(FluidResuscitationTonicityCardComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(FluidTonicityResuscitationService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders the IV fluid resuscitation card header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('IV Fluid Resuscitation & Tonicity Shift Engine (Model P14)');
    expect(el.textContent).toContain('Tri-Compartment Fluid Translocation Matrix');
    expect(el.textContent).toContain('Intravascular Plasma');
    expect(el.textContent).toContain('Interstitial Fluid (ISF)');
    expect(el.textContent).toContain('Intracellular Fluid (ICF)');
  });

  it('2. Loads clinical preset for acute cerebral edema (3% NaCl) and renders hypertonic osmotherapy guidance', () => {
    component.loadPreset('cerebral_edema_3pct');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(service.inputs().fluidType).toBe('hypertonic_saline_3');
    expect(el.textContent).toContain('Hypertonic Osmotherapy');
    expect(el.textContent).toContain('3% Hypertonic Saline (NaCl)');
  });

  it('3. Loads severe burn shock preset and displays Parkland formula directives', () => {
    component.loadPreset('severe_burn_parkland');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(service.inputs().burnTbsaPercent).toBe(35);
    expect(el.textContent).toContain('Parkland Formula Target');
    expect(el.textContent).toContain('9800 mL');
  });

  it('4. Switches fluid type to 0.9% Normal Saline and displays acidosis risk warning on large volumes', () => {
    service.updateInput('fluidType', 'normal_saline_09');
    service.updateInput('infusionVolumeMl', 3000);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(service.simulation().hyperchloremicAcidosisRisk).toBe('Severe');
    expect(el.textContent).toContain('High Normal Saline Volume');
  });

  it('5. Triggers ODS alert badge when predicted sodium rise exceeds safe threshold', () => {
    service.updateInput('baselineSerumSodiumMEq', 115);
    service.updateInput('fluidType', 'hypertonic_saline_3');
    service.updateInput('infusionVolumeMl', 1500);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(service.simulation().osmoticDemyelinationRisk).toBe(true);
    expect(el.textContent).toContain('ODS RISK');
  });
});
