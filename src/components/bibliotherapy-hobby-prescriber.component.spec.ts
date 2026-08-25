import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { BibliotherapyHobbyPrescriberComponent } from './bibliotherapy-hobby-prescriber.component';
import { BioHapticFeedbackService } from '../services/bio-haptic-feedback.service';

describe('BibliotherapyHobbyPrescriberComponent', () => {
  const createComponent = () => {
    const mockBioHaptic = {
      triggerHapticPulse: () => {}
    };

    const injector = Injector.create({
      providers: [
        { provide: BioHapticFeedbackService, useValue: mockBioHaptic }
      ]
    });

    return runInInjectionContext(injector, () => new BibliotherapyHobbyPrescriberComponent());
  };

  it('should create component and initialize with Woodworking as default hobby', () => {
    const comp = createComponent();
    expect(comp).toBeTruthy();
    expect(comp.selectedHobby().snomedCode).toBe('SCTID 281084008');
  });

  it('should switch selected hobby and update Amazon affiliate URL with tag=pgdpo-20', () => {
    const comp = createComponent();
    const gardeningHobby = comp.hobbies[1];
    comp.selectHobby(gardeningHobby);
    expect(comp.selectedHobby().snomedCode).toBe('SCTID 226065003');
    expect(comp.amazonStoreUrl()).toContain('tag=pgdpo-20');
  });
});
