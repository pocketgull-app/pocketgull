import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssessmentsLensTabComponent } from './assessments-lens-tab.component';
import { PatientStateService } from '../../services/patient-state.service';
import { PatientManagementService } from '../../services/patient-management.service';
import { ThemeService } from '../../services/theme.service';
import { signal } from '@angular/core';

describe('AssessmentsLensTabComponent', () => {
  let component: AssessmentsLensTabComponent;
  let fixture: ComponentFixture<AssessmentsLensTabComponent>;

  const mockPatientManagement = {
    selectedPatientId: signal('pt-1'),
    selectedPatient: signal({ id: 'pt-1', name: 'Charles Darwin', history: [], vitals: { bp: '120/80', hr: '72' } }),
    patients: signal([{ id: 'pt-1', name: 'Charles Darwin', history: [], vitals: { bp: '120/80', hr: '72' } }]),
    getPatient: vi.fn(() => ({ id: 'pt-1', name: 'Charles Darwin', history: [] })),
    updatePatient: vi.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentsLensTabComponent],
      providers: [
        PatientStateService,
        ThemeService,
        { provide: PatientManagementService, useValue: mockPatientManagement }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentsLensTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and defaults to suite screener tab', () => {
    expect(component).toBeTruthy();
    expect(component.screenerTab()).toBe('suite');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-clinical-assessments-suite')).toBeTruthy();
  });

  it('2. Switches to Y-BOCs screener tab and renders app-ybocs-screener', () => {
    component.setScreenerTab('ybocs');
    fixture.detectChanges();

    expect(component.screenerTab()).toBe('ybocs');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-ybocs-screener')).toBeTruthy();
  });

  it('3. Switches to Venn consensus tab and renders app-multi-paradigm-venn', () => {
    component.setScreenerTab('venn');
    fixture.detectChanges();

    expect(component.screenerTab()).toBe('venn');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-multi-paradigm-venn')).toBeTruthy();
  });

  it('4. Switches to Kaizen quality suite tab and renders app-kaizen-quality-suite', () => {
    component.setScreenerTab('kaizen');
    fixture.detectChanges();

    expect(component.screenerTab()).toBe('kaizen');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-kaizen-quality-suite')).toBeTruthy();
  });

  it('5. Switches to Teledentistry, Intimacy, and Suggestions tabs', () => {
    component.setScreenerTab('teledentistry');
    fixture.detectChanges();
    expect(component.screenerTab()).toBe('teledentistry');
    let el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-teledentistry-systemic-lens')).toBeTruthy();

    component.setScreenerTab('intimacy');
    fixture.detectChanges();
    expect(component.screenerTab()).toBe('intimacy');
    el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-intimacy-relationship-vitality')).toBeTruthy();

    component.setScreenerTab('suggestions');
    fixture.detectChanges();
    expect(component.screenerTab()).toBe('suggestions');
    el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Dynamic Motivational Interviewing & Clinical Probe Prompts');
  });
});
