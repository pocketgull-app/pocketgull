import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SepsisShockSofaCardComponent } from './sepsis-shock-sofa-card.component';
import { SepsisShockSofaService } from '../../services/sepsis-shock-sofa.service';

describe('SepsisShockSofaCardComponent (Clinical Model P8)', () => {
  let fixture: ComponentFixture<SepsisShockSofaCardComponent>;
  let component: SepsisShockSofaCardComponent;
  let service: SepsisShockSofaService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SepsisShockSofaCardComponent],
      providers: [SepsisShockSofaService]
    }).compileComponents();

    fixture = TestBed.createComponent(SepsisShockSofaCardComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(SepsisShockSofaService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders header, dials, and default homeostasis badges', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Sepsis Microvascular Shock & SOFA-2 Phenotyper');
    expect(el.textContent).toContain('Non-Septic Infection / Homeostasis');
    expect(el.textContent).toContain('SOFA Organ Failure');
    expect(el.textContent).toContain('Capillary Refill (CRT)');
  });

  it('2. Applies early sepsis preset and updates SOFA, qSOFA, and diagnosis', () => {
    component.applyPreset('early_sepsis');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(service.diagnosis().category).toBe('Sepsis (Organ Dysfunction Present)');
    expect(el.textContent).toContain('Sepsis (Organ Dysfunction Present)');
    expect(service.sofa().totalSofa).toBeGreaterThanOrEqual(3);
    expect(service.sofa().deltaSofa).toBeGreaterThanOrEqual(2);
  });

  it('3. Applies septic shock preset and renders vasopressor and lactate alerts', () => {
    component.applyPreset('septic_shock_ne');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(service.diagnosis().category).toContain('Septic Shock');
    expect(el.textContent).toContain('Septic Shock');
    expect(el.textContent).toContain('Impaired Microcirculation');
    expect(service.microvascular().isCrtNormal).toBe(false);
  });

  it('4. Applies refractory vasoplegia preset and displays Hydrocortisone recommendation', () => {
    component.applyPreset('refractory_vasoplegia');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(service.vasopressorGuidance().isHydrocortisoneIndicated).toBe(true);
    expect(service.vasopressorGuidance().currentTier).toBe('Tier 4: Refractory Shock Hydrocortisone');
    expect(el.textContent).toContain('Hydrocortisone 200 mg/day');
  });

  it('5. Displays microvascular uncoupling warning banner when MAP restored but CRT impaired', () => {
    service.updateInputs({
      meanArterialPressureMmhg: 74,
      capillaryRefillTimeSec: 4.8,
      mottlingScore: 2
    });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(service.microvascular().isMicrovascularUncoupled).toBe(true);
    expect(el.textContent).toContain('Microvascular Uncoupling Alert');
  });

  it('6. Applies ANDROMEDA resuscitation cleared preset and verifies normalized CRT and clearance', () => {
    component.applyPreset('andromeda_cleared');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(service.microvascular().isCrtNormal).toBe(true);
    expect(service.microvascular().isLactateClearanceAdequate).toBe(true);
    expect(service.microvascular().lactateClearancePercent).toBe(45);
    expect(el.textContent).toContain('Pristine (<= 3.0s)');
  });
});
