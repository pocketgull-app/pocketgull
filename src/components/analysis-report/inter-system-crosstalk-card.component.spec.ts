import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InterSystemCrosstalkCardComponent } from './inter-system-crosstalk-card.component';
import { PatientStateService } from '../../services/patient-state.service';
import { PharmacogenomicsService } from '../../services/pharmacogenomics.service';

describe('InterSystemCrosstalkCardComponent', () => {
  let component: InterSystemCrosstalkCardComponent;
  let fixture: ComponentFixture<InterSystemCrosstalkCardComponent>;
  let patientState: PatientStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterSystemCrosstalkCardComponent],
      providers: [PatientStateService, PharmacogenomicsService]
    }).compileComponents();

    fixture = TestBed.createComponent(InterSystemCrosstalkCardComponent);
    component = fixture.componentInstance;
    patientState = TestBed.inject(PatientStateService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders Donella Meadows Systems Model header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Inter-Organ Dynamical Cross-Talk');
    expect(el.textContent).toContain('Donella Meadows Systems Model');
  });

  it('2. Computes 4 systems axes by default with correct driver and target', () => {
    const axes = component.systemsAxes();
    expect(axes.length).toBe(4);

    const oralAxis = axes.find(a => a.id === 'oral-cardio');
    expect(oralAxis).toBeDefined();
    expect(oralAxis?.name).toBe('Oral-Endothelial Axis');
    expect(oralAxis?.target).toContain('Endothelial Nitric Oxide');

    const autonomicAxis = axes.find(a => a.id === 'autonomic-circadian');
    expect(autonomicAxis).toBeDefined();
    expect(autonomicAxis?.name).toBe('Autonomic-Circadian Axis');
  });

  it('3. Filters axes when selectedAxisFilter is changed to stressed', () => {
    expect(component.selectedAxisFilter()).toBe('all');
    expect(component.filteredAxes().length).toBe(4);

    component.selectedAxisFilter.set('stressed');
    fixture.detectChanges();

    const filtered = component.filteredAxes();
    for (const axis of filtered) {
      expect(['stressed', 'compensated']).toContain(axis.status);
    }
  });

  it('4. Updates axis status when patient has oral or cardiovascular issues', () => {
    patientState.reasonForVisit.set('Bleeding gums and severe periodontitis');
    patientState.vitals.update(v => ({
      temp: '98.6',
      spO2: '98%',
      weight: '70kg',
      height: '175cm',
      ...v,
      bp: '150/95',
      hr: '94'
    }));
    fixture.detectChanges();

    const oralAxis = component.systemsAxes().find(a => a.id === 'oral-cardio');
    expect(oralAxis?.status).toBe('stressed');

    const autonomicAxis = component.systemsAxes().find(a => a.id === 'autonomic-circadian');
    expect(autonomicAxis?.status).toBe('stressed');
  });

  it('5. Renders Meadows Leverage Point footer and highest-leverage intervention banner', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Meadows Leverage Point:');
    expect(el.textContent).toContain('Highest-Leverage Intervention:');
    expect(el.textContent).toContain('Circadian Vagal Reset + Targeted SIBI Decontamination');
  });
});
