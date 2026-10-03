import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmergencyNutritionalBypassComponent } from './emergency-nutritional-bypass.component';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { IntelligenceProviderToken } from '../services/ai/intelligence.provider.token';

describe('EmergencyNutritionalBypassComponent', () => {
  let component: EmergencyNutritionalBypassComponent;
  let fixture: ComponentFixture<EmergencyNutritionalBypassComponent>;
  let patientState: PatientStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmergencyNutritionalBypassComponent],
      providers: [
        PatientStateService,
        PatientManagementService,
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock CDS response'),
            streamContent: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmergencyNutritionalBypassComponent);
    component = fixture.componentInstance;
    patientState = TestBed.inject(PatientStateService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders Emergency Nutritional Bypass telemetry header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Emergency Bypass — Rapid Nutritional Triage Telemetry');
    expect(el.textContent).toContain('Location: Oregon Pacific Coast');
  });

  it('2. Shows fallback thermal broth when vitals are normal', () => {
    patientState.vitals.set({ bp: '118/75', hr: '72', spO2: '98%', temp: '98.6', weight: '70', height: '175' } as any);
    fixture.detectChanges();

    const suggestions = component.suggestions();
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].id).toBe('emerg-default');
    expect(suggestions[0].title).toBe('Coastal Field Thermal Gingerol Broth');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Coastal Field Thermal Gingerol Broth');
    expect(el.textContent).toContain('ADVISORY • Thermal Shivering Reset');
  });

  it('3. Generates Isotonic Electrolyte Osmotic Solution when BP is elevated (>= 130)', () => {
    patientState.vitals.set({ bp: '138/88', hr: '70', spO2: '98%', temp: '98.6', weight: '70', height: '175' } as any);
    fixture.detectChanges();

    const suggestions = component.suggestions();
    expect(suggestions.some(s => s.id === 'emerg-bp')).toBe(true);

    const bpItem = suggestions.find(s => s.id === 'emerg-bp');
    expect(bpItem?.category).toBe('Rapid Osmotic Hydration');
    expect(bpItem?.urgencyLevel).toBe('CRITICAL');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Isotonic Electrolyte Osmotic Hydration Solution');
    expect(el.textContent).toContain('CRITICAL • Rapid Osmotic Hydration');
  });

  it('4. Generates Chrysanthemum & Peppermint Infusion when HR is elevated (>= 85)', () => {
    patientState.vitals.set({ bp: '120/80', hr: '92', spO2: '98%', temp: '98.6', weight: '70', height: '175' } as any);
    fixture.detectChanges();

    const suggestions = component.suggestions();
    expect(suggestions.some(s => s.id === 'emerg-hr')).toBe(true);

    const hrItem = suggestions.find(s => s.id === 'emerg-hr');
    expect(hrItem?.category).toBe('Cardiovascular Cooling');
    expect(hrItem?.urgencyLevel).toBe('HIGH');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('TCM Cooling Chrysanthemum & Peppermint Infusion');
  });

  it('5. Generates Inorganic Nitrate Beetroot Elixir when SpO2 is hypoxic (< 95%)', () => {
    patientState.vitals.set({ bp: '120/80', hr: '72', spO2: '93%', temp: '98.6', weight: '70', height: '175' } as any);
    fixture.detectChanges();

    const suggestions = component.suggestions();
    expect(suggestions.some(s => s.id === 'emerg-spo2')).toBe(true);

    const spo2Item = suggestions.find(s => s.id === 'emerg-spo2');
    expect(spo2Item?.category).toBe('Tissue Oxygenation');
    expect(spo2Item?.urgencyLevel).toBe('CRITICAL');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Inorganic Nitrate Beetroot Elixir');
  });

  it('6. Logs triage meal to patient chart notes on prescribeEmergencyItem', () => {
    const addNoteSpy = vi.spyOn(patientState, 'addClinicalNote');
    const item = component.suggestions()[0];

    component.prescribeEmergencyItem(item);

    expect(addNoteSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceLens: 'EMT Handoff',
        text: expect.stringContaining('Emergency Bypass Triage Logged')
      })
    );
  });
});
