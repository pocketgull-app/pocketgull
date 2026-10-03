import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SdohNavigatorComponent } from './sdoh-navigator.component';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { IntelligenceProviderToken } from '../services/ai/intelligence.provider.token';

describe('SdohNavigatorComponent', () => {
  let component: SdohNavigatorComponent;
  let fixture: ComponentFixture<SdohNavigatorComponent>;
  let patientState: PatientStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SdohNavigatorComponent],
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

    fixture = TestBed.createComponent(SdohNavigatorComponent);
    component = fixture.componentInstance;
    patientState = TestBed.inject(PatientStateService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders SDOH header and composite score', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Social Determinants of Health (SDOH) Navigator');
    expect(el.textContent).toContain('Sec 4302 Auto-Screened');
    expect(component.overallSdohScore()).toBe(81); // (82 + 74 + 88) / 3 = 81.33 -> 81
    expect(el.textContent).toContain('SDOH Composite: 81/100');
  });

  it('2. Dynamically reflects active patient name from PatientStateService', () => {
    patientState.patientName.set('Ada Lovelace');
    fixture.detectChanges();

    expect(component.activePatientName()).toBe('Ada Lovelace');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Ada Lovelace');
  });

  it('3. Falls back to Homo Sapiens when patient name is empty', () => {
    patientState.patientName.set('');
    fixture.detectChanges();

    expect(component.activePatientName()).toBe('Homo Sapiens');
  });

  it('4. Computes SDOH domain metrics for Housing, Food, and Healthcare', () => {
    const metrics = component.sdohMetrics();
    expect(metrics.length).toBe(3);

    const housing = metrics.find(m => m.domain === 'Housing');
    expect(housing).toBeDefined();
    expect(housing?.status).toBe('Optimal');
    expect(housing?.score).toBe(82);
    expect(housing?.communityResources.length).toBeGreaterThan(0);

    const food = metrics.find(m => m.domain === 'Food');
    expect(food).toBeDefined();
    expect(food?.status).toBe('Moderate Risk');
    expect(food?.score).toBe(74);

    const healthcare = metrics.find(m => m.domain === 'Healthcare');
    expect(healthcare).toBeDefined();
    expect(healthcare?.status).toBe('Optimal');
    expect(healthcare?.score).toBe(88);
  });

  it('5. Renders domain cards with indicators, actions, and community resources', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Housing');
    expect(el.textContent).toContain('Food');
    expect(el.textContent).toContain('Healthcare');
    expect(el.textContent).toContain('Maintain indoor humidity below 45%');
    expect(el.textContent).toContain('HUD Healthy Homes Hotline');
    expect(el.textContent).toContain('USDA SNAP / Produce Prescription');
    expect(el.textContent).toContain('HRSA Community Health Center Search');
  });
});
