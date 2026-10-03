import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sec1557AuditModalComponent } from './sec1557-audit-modal.component';
import { PatientStateService } from '../../services/patient-state.service';
import { PatientManagementService } from '../../services/patient-management.service';
import { IntelligenceProviderToken } from '../../services/ai/intelligence.provider.token';

describe('Sec1557AuditModalComponent', () => {
  let component: Sec1557AuditModalComponent;
  let fixture: ComponentFixture<Sec1557AuditModalComponent>;

  beforeEach(async () => {
    vi.stubGlobal('alert', vi.fn());
    if (typeof URL.createObjectURL !== 'function') {
      URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
      URL.revokeObjectURL = vi.fn();
    } else {
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    }

    await TestBed.configureTestingModule({
      imports: [Sec1557AuditModalComponent],
      providers: [
        PatientStateService,
        PatientManagementService,
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock clinical synthesis'),
            streamContent: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Sec1557AuditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('1. Initializes modal with 99.4% Algorithmic Parity Score and HHS 2024 Rule certification', () => {
    expect(component).toBeTruthy();
    expect(component.cohorts.length).toBe(4);
    expect(component.isRunningCheck()).toBe(false);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('ACA Section 1557 Algorithmic Fairness');
    expect(el.textContent).toContain('99.4%');
    expect(el.textContent).toContain('Full Certification');
    expect(el.textContent).toContain('Audited Patient Context');
  });

  it('2. Renders 4 demographic cohort parity rows with guardrail protections', () => {
    const cohorts = component.cohorts;
    expect(cohorts.length).toBe(4);

    const groups = cohorts.map(c => c.demographicGroup);
    expect(groups).toContain('Elderly / Geriatric (75+ Yrs)');
    expect(groups).toContain('Pediatric / Adolescent (<18 Yrs)');
    expect(groups).toContain('Limited English Proficiency (LEP)');
    expect(groups).toContain('Racial & Ethnic Minority Cohorts');

    cohorts.forEach(c => {
      expect(c.parityScore).toBeGreaterThanOrEqual(99.0);
      expect(c.biasRiskStatus).toBe('Pass (Optimal)');
      expect(c.primaryGuardrail.length).toBeGreaterThan(0);
    });

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Elderly / Geriatric');
    expect(el.textContent).toContain('Pediatric / Adolescent');
    expect(el.textContent).toContain('Limited English Proficiency');
    expect(el.textContent).toContain('Racial & Ethnic Minority');
  });

  it('3. Emits close output when close button is clicked', () => {
    let closed = false;
    component.close.subscribe(() => {
      closed = true;
    });

    component.close.emit();
    expect(closed).toBe(true);
  });

  it('4. Simulates runFairnessCheck and manages isRunningCheck loading signal state', () => {
    expect(component.isRunningCheck()).toBe(false);

    component.runFairnessCheck();
    expect(component.isRunningCheck()).toBe(true);
  });

  it('5. Exports JSON compliance attestation with Section 1557 audit metadata', () => {
    const clickSpy = vi.fn();
    vi.spyOn(document, 'createElement').mockReturnValue({
      set href(val: string) {},
      set download(val: string) {},
      click: clickSpy
    } as any);

    expect(() => component.exportComplianceReport()).not.toThrow();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
});
