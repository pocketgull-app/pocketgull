import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RpmDashboardComponent } from './rpm-dashboard.component';
import { RpmAuditService } from '../services/rpm-audit.service';
import { PatientStateService } from '../services/patient-state.service';

describe('RpmDashboardComponent', () => {
  let component: RpmDashboardComponent;
  let fixture: ComponentFixture<RpmDashboardComponent>;
  let rpmService: RpmAuditService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RpmDashboardComponent],
      providers: [RpmAuditService, PatientStateService]
    }).compileComponents();

    fixture = TestBed.createComponent(RpmDashboardComponent);
    component = fixture.componentInstance;
    rpmService = TestBed.inject(RpmAuditService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders CMS Remote Patient Monitoring (RPM) Dashboard header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('CMS Remote Patient Monitoring (RPM) Dashboard');
    expect(el.textContent).toContain('Value-Based Care Reimbursement Audit');
  });

  it('2. Displays CPT code meters (CPT 99454, CPT 99457, CPT 99453)', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('CPT 99454 (16-Day Meter)');
    expect(el.textContent).toContain('CPT 99457 / 99458 (Time Log)');
    expect(el.textContent).toContain('CPT 99453 (Setup & Ed)');
  });

  it('3. Increments transmission days on simulate day action', () => {
    const incrementSpy = vi.spyOn(rpmService, 'incrementTransmissionDays');
    component.incrementDays();
    expect(incrementSpy).toHaveBeenCalledWith(1);
  });

  it('4. Logs clinical interaction time using addTime', () => {
    const logSpy = vi.spyOn(rpmService, 'logClinicalTime');
    component.addTime(15, 'Interactive patient telehealth consultation');
    expect(logSpy).toHaveBeenCalledWith(15, 'Interactive patient telehealth consultation');
  });

  it('5. Exports CMS 837P claim payload JSON without errors', () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockReturnValue();

    expect(() => component.exportClaimJson()).not.toThrow();

    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });
});
