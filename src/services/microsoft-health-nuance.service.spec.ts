import { TestBed } from '@angular/core/testing';
import { MicrosoftHealthNuanceService } from './microsoft-health-nuance.service';

describe('MicrosoftHealthNuanceService', () => {
  let service: MicrosoftHealthNuanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MicrosoftHealthNuanceService);
  });

  it('1. Initializes Microsoft Nuance DAX ambient clinical listening session', () => {
    const nuance = service.nuanceSession();
    expect(nuance.providerName).toContain('Nuance DAX');
    expect(nuance.extractedSymptomEntities.length).toBeGreaterThan(0);
    expect(nuance.suggestedICD10Codes.length).toBeGreaterThan(0);
  });

  it('2. Triggers ambient listening and returns analyzed transcript summary', async () => {
    const session = await service.triggerNuanceAmbientListening();
    expect(session.status).toBe('SUMMARY_READY');
  });
});
