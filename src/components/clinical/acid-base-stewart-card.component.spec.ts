import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AcidBaseStewartCardComponent } from './acid-base-stewart-card.component';
import { AcidBaseStewartService } from '../../services/acid-base-stewart.service';
import { PatientStateService } from '../../services/patient-state.service';
import { IntelligenceProviderToken } from '../../services/ai/intelligence.provider.token';

describe('AcidBaseStewartCardComponent (Clinical Model P7)', () => {
  let component: AcidBaseStewartCardComponent;
  let fixture: ComponentFixture<AcidBaseStewartCardComponent>;
  let service: AcidBaseStewartService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcidBaseStewartCardComponent],
      providers: [
        AcidBaseStewartService,
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

    fixture = TestBed.createComponent(AcidBaseStewartCardComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(AcidBaseStewartService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders Acid-Base Stewart header and telemetry dials', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Acid-Base Stewart Physico-Chemical & Electrolyte Engine (Model P7)');
    expect(el.textContent).toContain('Arterial pH & pCO₂');
    expect(el.textContent).toContain('Corrected Anion Gap');
    expect(el.textContent).toContain('Stewart SID & SIG');
    expect(el.textContent).toContain('Electrolytes & Weak Acids');
  });

  it('2. Renders normal homeostasis state with balanced parameters', () => {
    expect(service.primaryDisorder()).toBe('Normal Acid-Base Homeostasis');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Normal Acid-Base Homeostasis');
    expect(el.textContent).toContain('Normal Electrochemical Balance');
  });

  it('3. Simulates DKA scenario and renders HAGMA badge and Winter\'s formula compensation', () => {
    component.simulateScenario('dka_hagma');
    fixture.detectChanges();

    expect(service.primaryDisorder()).toBe('High Anion Gap Metabolic Acidosis (HAGMA)');
    expect(service.wintersCompensation()).not.toBeNull();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('High Anion Gap Metabolic Acidosis (HAGMA)');
    expect(el.textContent).toContain("Winter's Formula Check");
    expect(el.textContent).toContain('Adequate Compensation');
  });

  it('4. Simulates Normal Saline Hyperchloremia and triggers balanced crystalloid guidance', () => {
    component.simulateScenario('saline_hyperchloremic_nagma');
    fixture.detectChanges();

    expect(service.primaryDisorder()).toBe('Normal Anion Gap Metabolic Acidosis (NAGMA / Hyperchloremic)');
    expect(service.stewartParameters().hyperchloremicAcidosisRisk).toBe(true);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Hyperchloremia Risk');
    expect(el.textContent).toContain('Balanced Crystalloid');
    expect(el.textContent).toContain('Normal Saline (Cl 154, SID 0) exacerbates acidosis');
  });

  it('5. Simulates Triple Mixed Disorder scenario with occult HAGMA and metabolic alkalosis', () => {
    component.simulateScenario('triple_mixed_disorder');
    fixture.detectChanges();

    expect(service.correctedAnionGap()).toBeGreaterThan(20);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Mixed HAGMA and Metabolic Alkalosis');
  });

  it('6. Simulates Severe Hyperkalemia Emergency and renders 3-phase emergency action plan', () => {
    component.simulateScenario('severe_hyperkalemia_emergency');
    fixture.detectChanges();

    expect(service.potassium()).toBe(6.8);
    expect(service.hyperkalemiaPlan().severity).toBe('Severe / Emergent (>= 6.5)');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Hyperkalemia Emergency Action Plan');
    expect(el.textContent).toContain('Calcium Gluconate');
    expect(el.textContent).toContain('Regular Insulin');
    expect(el.textContent).toContain('Lokelma');
  });

  it('7. Resets baseline labs back to normal physiological range', () => {
    component.simulateScenario('dka_hagma');
    fixture.detectChanges();
    expect(service.ph()).toBe(7.15);

    component.resetBaseline();
    fixture.detectChanges();

    expect(service.ph()).toBe(7.40);
    expect(service.primaryDisorder()).toBe('Normal Acid-Base Homeostasis');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Normal Acid-Base Homeostasis');
  });
});
