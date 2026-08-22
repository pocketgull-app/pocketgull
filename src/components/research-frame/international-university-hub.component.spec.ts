import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { InternationalUniversityHubComponent } from './international-university-hub.component';
import { InternationalUniversityGeofenceService } from '../../services/international-university-geofence.service';

describe('InternationalUniversityHubComponent Suite', () => {
  let component: InternationalUniversityHubComponent;
  let geofenceService: InternationalUniversityGeofenceService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        InternationalUniversityGeofenceService
      ]
    });
    geofenceService = injector.get(InternationalUniversityGeofenceService);
    component = runInInjectionContext(injector, () => new InternationalUniversityHubComponent());
  });

  it('1. Initializes with US_NCAA default and shows US partner universities', () => {
    expect(component.service.activeJurisdiction()).toBe('US_NCAA');
    const partners = component.filteredPartners();
    expect(partners.length).toBeGreaterThanOrEqual(3);
    expect(partners.every(p => p.country === 'United States')).toBe(true);
  });

  it('2. Filters to UK and European universities when switching to UK_EU_GDPR', () => {
    component.service.setJurisdiction('UK_EU_GDPR');
    const partners = component.filteredPartners();

    expect(partners.length).toBeGreaterThanOrEqual(2);
    expect(partners.some(p => p.name.includes('Oxford'))).toBe(true);
    expect(partners.some(p => p.name.includes('Karolinska'))).toBe(true);
    expect(component.attestation().regulatoryStandard).toContain('GDPR Art. 9');
  });

  it('3. Filters to Asian-Pacific universities when switching to APAC_CROSS_BORDER', () => {
    component.service.setJurisdiction('APAC_CROSS_BORDER');
    const partners = component.filteredPartners();

    expect(partners.length).toBeGreaterThanOrEqual(3);
    expect(partners.some(p => p.name.includes('Melbourne'))).toBe(true);
    expect(partners.some(p => p.name.includes('Singapore'))).toBe(true);
    expect(partners.some(p => p.name.includes('Tokyo'))).toBe(true);
    expect(component.attestation().regulatoryStandard).toContain('APEC');
  });

  it('4. Filters to Canadian universities under PIPEDA and CCES', () => {
    component.service.setJurisdiction('CA_PIPEDA');
    const partners = component.filteredPartners();

    expect(partners.some(p => p.name.includes('Toronto'))).toBe(true);
    expect(component.attestation().antiDopingCompliance).toContain('CCES');
  });
});
