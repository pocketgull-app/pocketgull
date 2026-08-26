import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
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
  });
});
