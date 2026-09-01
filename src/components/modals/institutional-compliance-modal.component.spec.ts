import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { InstitutionalComplianceModalComponent } from './institutional-compliance-modal.component';
import { InstitutionalComplianceService } from '../../services/institutional-compliance.service';

describe('InstitutionalComplianceModalComponent Unit Suite', () => {
  let component: InstitutionalComplianceModalComponent;
  let service: InstitutionalComplianceService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [InstitutionalComplianceModalComponent, InstitutionalComplianceService]
    });
    component = runInInjectionContext(injector, () => injector.get(InstitutionalComplianceModalComponent));
    service = injector.get(InstitutionalComplianceService);
  });

  it('1. Initializes cleanly and generates compliance certificate', () => {
    expect(component).toBeTruthy();
    expect(component.complianceService).toBe(service);
    expect(component.activeCertificate().overallComplianceScore).toBe(100);
    expect(component.activeCertificate().standards.length).toBe(10);
  });

  it('2. Copies certificate digest to clipboard', async () => {
    await component.copyCertificateDigest();
    expect(component.copyStatus()).toBeDefined();
  });
});
