import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RenalClearanceTitrationCardComponent } from './renal-clearance-titration-card.component';
import { RenalClearanceService } from '../../services/renal-clearance.service';
import { PatientStateService } from '../../services/patient-state.service';
import { IntelligenceProviderToken } from '../../services/ai/intelligence.provider.token';

describe('RenalClearanceTitrationCardComponent', () => {
  let component: RenalClearanceTitrationCardComponent;
  let fixture: ComponentFixture<RenalClearanceTitrationCardComponent>;
  let renalService: RenalClearanceService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RenalClearanceTitrationCardComponent],
      providers: [
        RenalClearanceService,
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

    fixture = TestBed.createComponent(RenalClearanceTitrationCardComponent);
    component = fixture.componentInstance;
    renalService = TestBed.inject(RenalClearanceService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders header, eGFR, CrCl, and CKD stage badges', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Renal Clearance & Drug Dosing Titration Engine (Model P5)');
    expect(el.textContent).toContain('eGFR (CKD-EPI 2021)');
    expect(el.textContent).toContain('CrCl (Cockcroft-Gault)');
    expect(el.textContent).toContain('Serum Creatinine');
    expect(el.textContent).toContain('Urine Output Kinetics');
  });

  it('2. Lists audited renally cleared medications (Metformin, Gabapentin, Apixaban, Empagliflozin)', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Metformin');
    expect(el.textContent).toContain('Gabapentin');
    expect(el.textContent).toContain('Apixaban');
    expect(el.textContent).toContain('Empagliflozin');
    expect(el.textContent).toContain('Renal Clearance: 90%');
  });

  it('3. Simulates contrast nephropathy (Stage 1 AKI) and renders KDIGO warning banner', () => {
    component.simulateScenario('stage1_aki');
    fixture.detectChanges();

    expect(renalService.akiRiskFlag()).toBe(true);
    expect(renalService.akiStage()).toBe('KDIGO Stage 1');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('KDIGO Acute Kidney Injury Warning');
    expect(el.textContent).toContain('KDIGO Stage 1 ACTIVE');
  });

  it('4. Simulates septic AKI spike and triggers Metformin contraindication with Black Box flag', () => {
    component.simulateScenario('sepsis_aki');
    fixture.detectChanges();

    expect(renalService.serumCreatinine()).toBe(2.8);
    expect(renalService.egfrCkdEpi()).toBeLessThan(30);

    const metformin = renalService.dosingTitrations().find(m => m.drugName === 'Metformin');
    expect(metformin?.actionRequired).toBe('contraindicated');
    expect(metformin?.fdaBlackBoxWarning).toBe(true);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('CONTRAINDICATED');
    expect(el.textContent).toContain('BLACK BOX');
    expect(el.textContent).toContain('DISCONTINUE METFORMIN IMMEDIATELY');
  });

  it('5. Resets baseline creatinine back to normal physiological range', () => {
    component.simulateScenario('sepsis_aki');
    fixture.detectChanges();
    expect(renalService.akiRiskFlag()).toBe(true);

    component.resetBaseline();
    fixture.detectChanges();

    expect(renalService.serumCreatinine()).toBe(0.9);
    expect(renalService.akiRiskFlag()).toBe(false);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Renal Function Stable');
  });

  it('6. Correctly maps CKD stage to descriptive labels', () => {
    expect(component.getCkdDescription('G1')).toBe('Normal/High Function');
    expect(component.getCkdDescription('G3b')).toBe('Moderate-Severe CKD');
    expect(component.getCkdDescription('G5')).toBe('Kidney Failure (ESRD)');
  });
});
