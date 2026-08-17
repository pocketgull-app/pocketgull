import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalHealthUtilityFolioComponent } from './global-health-utility-folio.component';
import { GlobalHealthUtilityService } from '../services/global-health-utility.service';

describe('GlobalHealthUtilityFolioComponent', () => {
  let component: GlobalHealthUtilityFolioComponent;
  let fixture: ComponentFixture<GlobalHealthUtilityFolioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalHealthUtilityFolioComponent],
      providers: [GlobalHealthUtilityService]
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalHealthUtilityFolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the global health utility folio component', () => {
    expect(component).toBeTruthy();
  });

  it('should compute initial report metrics', () => {
    const report = component.report();
    expect(report.totalQalyGainedPerDecade).toBeGreaterThan(1000);
    expect(report.domains.length).toBe(5);
  });

  it('should reactively update when cohort slider changes', () => {
    component.activeCohort.set(5000);
    fixture.detectChanges();

    const report = component.report();
    expect(report.patientCohortSize).toBe(5000);
    expect(report.totalClinicianHoursSavedAnnual).toBe(92000);
  });

  it('should emit close output', () => {
    let closed = false;
    component.close.subscribe(() => closed = true);

    component.close.emit();
    expect(closed).toBe(true);
  });
});
