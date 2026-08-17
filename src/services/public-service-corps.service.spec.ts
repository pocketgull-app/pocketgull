import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { PublicServiceCorpsService } from './public-service-corps.service';

describe('PublicServiceCorpsService (Public Service Initiatives)', () => {
  let service: PublicServiceCorpsService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [PublicServiceCorpsService]
    });
    service = runInInjectionContext(injector, () => injector.get(PublicServiceCorpsService));
  });

  it('1. Initializes default public service initiatives and total beneficiaries served', () => {
    const initiatives = service.activeInitiatives();
    expect(initiatives.length).toBe(4);
    expect(service.totalBeneficiariesServed()).toBeGreaterThan(20000);
  });

  it('2. Verifies First Responder and Global Refugee Health initiatives', () => {
    const firstResponder = service.activeInitiatives().find(i => i.category === 'FIRST_RESPONDERS');
    expect(firstResponder?.emojiBadge).toContain('🚒');
    
    const refugee = service.activeInitiatives().find(i => i.category === 'GLOBAL_REFUGEE_HEALTH');
    expect(refugee?.targetBeneficiaries).toContain('Displaced');
  });
});
