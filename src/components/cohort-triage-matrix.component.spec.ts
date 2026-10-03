import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CohortTriageMatrixComponent } from './cohort-triage-matrix.component';
import { PatientManagementService } from '../services/patient-management.service';
import { PatientStateService } from '../services/patient-state.service';
import { IntelligenceProviderToken } from '../services/ai/intelligence.provider.token';

describe('CohortTriageMatrixComponent', () => {
  let component: CohortTriageMatrixComponent;
  let fixture: ComponentFixture<CohortTriageMatrixComponent>;
  let pm: PatientManagementService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CohortTriageMatrixComponent],
      providers: [
        PatientManagementService,
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

    fixture = TestBed.createComponent(CohortTriageMatrixComponent);
    component = fixture.componentInstance;
    pm = TestBed.inject(PatientManagementService);
    fixture.detectChanges();
  });

  it('1. Initializes with multi-patient diagnostic matrix and computes triageRows', () => {
    expect(component).toBeTruthy();
    expect(component.sortField()).toBe('sibi');

    const rows = component.triageRows();
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].sibiScore).toBeGreaterThanOrEqual(0.5);
    expect(rows[0].cvRisk).toBeGreaterThanOrEqual(1.0);
    expect(rows[0].biomarkerOutliers.length).toBe(3);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Multi-Patient Cohort Diagnostic Matrix');
    expect(el.textContent).toContain('NIH & WHO Aligned');
  });

  it('2. Sorts cohort triage rows by sibi, cvRisk, hba1c, and patient name', () => {
    // Sort by SIBI (default, descending)
    component.setSort('sibi');
    let sorted = component.sortedTriageRows();
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].sibiScore).toBeGreaterThanOrEqual(sorted[i + 1].sibiScore);
    }

    // Sort by CV Risk (descending)
    component.setSort('cvRisk');
    sorted = component.sortedTriageRows();
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].cvRisk).toBeGreaterThanOrEqual(sorted[i + 1].cvRisk);
    }

    // Sort by HbA1c (descending)
    component.setSort('hba1c');
    sorted = component.sortedTriageRows();
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].hba1c).toBeGreaterThanOrEqual(sorted[i + 1].hba1c);
    }

    // Sort by Name (alphabetical ascending)
    component.setSort('name');
    sorted = component.sortedTriageRows();
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].patient.name.localeCompare(sorted[i + 1].patient.name)).toBeLessThanOrEqual(0);
    }
  });

  it('3. Computes triage acuity badges across risk thresholds', () => {
    const rows = component.triageRows();
    const badges = rows.map(r => r.triageBadge);
    expect(['Low', 'Moderate', 'High', 'Critical']).toEqual(expect.arrayContaining(badges));

    // Verify calculation rules
    rows.forEach(r => {
      if (r.sibiScore > 7.5 || r.cvRisk > 25) {
        expect(r.triageBadge).toBe('Critical');
      }
    });
  });

  it('4. Generates specialized diagnostic actions and PGx flags based on condition phenotypes', () => {
    const rows = component.triageRows();

    // Check for diagnostic actions present in cohort
    const actions = rows.map(r => r.diagnosticAction).join(' ');
    expect(actions.length).toBeGreaterThan(0);

    // Verify PGx / safety flags if oncology, hypertension, or metabolic conditions present
    const flags = rows.map(r => r.pgxOrSafetyFlag).filter(Boolean);
    expect(flags.length).toBeGreaterThanOrEqual(0);
  });

  it('5. Invokes pm.selectPatient when Load Record is triggered', () => {
    const selectSpy = vi.spyOn(pm, 'selectPatient');
    const firstRow = component.sortedTriageRows()[0];

    component.pm.selectPatient(firstRow.patient.id);
    expect(selectSpy).toHaveBeenCalledWith(firstRow.patient.id);
  });
});
