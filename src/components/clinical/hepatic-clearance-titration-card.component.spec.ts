import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HepaticClearanceTitrationCardComponent } from './hepatic-clearance-titration-card.component';
import { HepaticClearanceService } from '../../services/hepatic-clearance.service';
import { PatientStateService } from '../../services/patient-state.service';
import { IntelligenceProviderToken } from '../../services/ai/intelligence.provider.token';

describe('HepaticClearanceTitrationCardComponent', () => {
  let component: HepaticClearanceTitrationCardComponent;
  let fixture: ComponentFixture<HepaticClearanceTitrationCardComponent>;
  let hepaticService: HepaticClearanceService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HepaticClearanceTitrationCardComponent],
      providers: [
        HepaticClearanceService,
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

    fixture = TestBed.createComponent(HepaticClearanceTitrationCardComponent);
    component = fixture.componentInstance;
    hepaticService = TestBed.inject(HepaticClearanceService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders header, Child-Pugh, and MELD-Na telemetry dials', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Hepatic Child-Pugh & MELD-Na Cirrhosis Score Engine (Model P6)');
    expect(el.textContent).toContain('Child-Pugh Cirrhosis Tier');
    expect(el.textContent).toContain('UNOS MELD-Na Score');
    expect(el.textContent).toContain('Bilirubin & Albumin');
    expect(el.textContent).toContain('Creatinine & Sodium');
  });

  it('2. Lists audited hepatically cleared medications', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Acetaminophen');
    expect(el.textContent).toContain('Morphine');
    expect(el.textContent).toContain('Diazepam');
    expect(el.textContent).toContain('Atorvastatin');
    expect(el.textContent).toContain('Propranolol');
    expect(el.textContent).toContain('Pantoprazole');
    expect(el.textContent).toContain('Ibuprofen');
  });

  it('3. Simulates Compensated Cirrhosis (Class A) with stable liver function badge', () => {
    component.simulateScenario('compensated_class_a');
    fixture.detectChanges();

    expect(hepaticService.childPughClass()).toBe('Class A');
    expect(hepaticService.decompensatedFlag()).toBe(false);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Compensated Liver Function');
    expect(el.textContent).toContain('Child-Pugh Class A');
  });

  it('4. Simulates Decompensated Cirrhosis (Class C) and renders alert banner with Black Box warnings', () => {
    component.simulateScenario('decompensated_class_c');
    fixture.detectChanges();

    expect(hepaticService.childPughClass()).toBe('Class C');
    expect(hepaticService.decompensatedFlag()).toBe(true);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('DECOMPENSATED CIRRHOSIS');
    expect(el.textContent).toContain('Child-Pugh Class C');
    expect(el.textContent).toContain('BLACK BOX');
    expect(el.textContent).toContain('CONTRAINDICATED');
  });

  it('5. Simulates Hepatorenal Syndrome scenario and activates HRS-AKI hazard badge', () => {
    component.simulateScenario('hepatorenal_syndrome');
    fixture.detectChanges();

    expect(hepaticService.hepatorenalSyndromeRisk()).toBe(true);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('HRS-AKI Hazard');
  });

  it('6. Resets baseline labs back to normal physiological range', () => {
    component.simulateScenario('decompensated_class_c');
    fixture.detectChanges();
    expect(hepaticService.decompensatedFlag()).toBe(true);

    component.resetBaseline();
    fixture.detectChanges();

    expect(hepaticService.totalBilirubin()).toBe(1.2);
    expect(hepaticService.serumAlbumin()).toBe(3.8);
    expect(hepaticService.childPughClass()).toBe('Class A');
    expect(hepaticService.decompensatedFlag()).toBe(false);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Compensated Liver Function');
  });

  it('7. Formats clinical labels and grades accurately', () => {
    expect(component.formatActionBadge('contraindicated')).toBe('CONTRAINDICATED');
    expect(component.formatActionBadge('dose_reduction')).toBe('DOSE REDUCTION');
    expect(component.formatActionBadge('interval_extension')).toBe('INTERVAL EXTENSION');
    expect(component.formatActionBadge('standard')).toBe('STANDARD DOSE');

    expect(component.formatAscites('none')).toBe('None');
    expect(component.formatAscites('mild')).toBe('Mild (Diuretic-responsive)');
    expect(component.formatAscites('moderate_severe')).toBe('Severe / Refractory');

    expect(component.formatEncephalopathy('none')).toBe('None');
    expect(component.formatEncephalopathy('grade_1_2')).toBe('Grade 1-2 (Mild confusion)');
    expect(component.formatEncephalopathy('grade_3_4')).toBe('Grade 3-4 (Stupor / Coma)');
  });
});
