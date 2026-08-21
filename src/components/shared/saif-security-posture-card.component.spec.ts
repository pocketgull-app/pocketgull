import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { SaifSecurityPostureCardComponent } from './saif-security-posture-card.component';
import { GoogleSaifClinicalDefenseService } from '../../services/google-saif-clinical-defense.service';

describe('SaifSecurityPostureCardComponent', () => {
  const createComponent = () => {
    const saifService = new GoogleSaifClinicalDefenseService();
    const injector = Injector.create({
      providers: [
        { provide: GoogleSaifClinicalDefenseService, useValue: saifService }
      ]
    });
    return runInInjectionContext(injector, () => new SaifSecurityPostureCardComponent());
  };

  it('should instantiate and render the 6 SAIF pillars', () => {
    const comp = createComponent();
    expect(comp).toBeTruthy();
    expect(comp.saifService.pillarStatuses().length).toBe(6);
    expect(comp.saifService.overallPostureScore()).toBeGreaterThanOrEqual(95);
  });

  it('should trigger audit refresh when clicked', () => {
    const comp = createComponent();
    expect(() => comp.refreshAudit()).not.toThrow();
  });
});
