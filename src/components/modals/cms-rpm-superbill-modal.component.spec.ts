import '@angular/compiler';
import { CmsRpmSuperbillModalComponent } from './cms-rpm-superbill-modal.component';
import { CmsRpmSuperbillService } from '../../services/cms-rpm-superbill.service';

describe('CmsRpmSuperbillModalComponent', () => {
  let component: CmsRpmSuperbillModalComponent;
  let service: CmsRpmSuperbillService;

  beforeEach(() => {
    service = new CmsRpmSuperbillService();
    component = new CmsRpmSuperbillModalComponent(service);
  });

  it('should create and compute superbill data', () => {
    expect(component).toBeTruthy();
    const data = component.superbill();
    expect(data.claimId).toContain('CLM-RPM-');
    expect(data.claimCodes.length).toBeGreaterThan(0);
    expect(data.complianceCalendar?.length).toBe(30);
  });

  it('should delegate toggleDay to superbillService', () => {
    const calendar = component.superbill().complianceCalendar || [];
    const targetDay = calendar[0];
    const initialReading = targetDay.hasReading;

    component.toggleDay(targetDay.date);

    const updated = component.superbill().complianceCalendar?.find(d => d.date === targetDay.date);
    expect(updated?.hasReading).toBe(!initialReading);
  });

  it('should allow setting care coordination minutes directly', () => {
    component.setMinutes(40);
    expect(service.clinicalMinutesSpent()).toBe(40);
    const superbill = component.superbill();
    expect(superbill.claimCodes.some(c => c.cptCode === '99458')).toBe(true);
  });

  it('should allow adding or subtracting care coordination minutes', () => {
    component.setMinutes(20);
    component.addMinutes(15);
    expect(service.clinicalMinutesSpent()).toBe(35);

    component.addMinutes(-10);
    expect(service.clinicalMinutesSpent()).toBe(25);
  });

  it('should copy EHR clinical note and toggle copied feedback notice', () => {
    expect(component.copiedNotice()).toBe(false);

    component.copyEhrNote();

    expect(component.copiedNotice()).toBe(true);
  });

  it('should export FHIR R4 Claim document safely', () => {
    expect(() => component.exportFhirClaim()).not.toThrow();
  });

  it('should trigger printSuperbill without error', () => {
    const originalPrint = window.print;
    let printed = false;
    window.print = () => { printed = true; };

    component.printSuperbill();
    expect(printed).toBe(true);

    window.print = originalPrint;
  });
});
