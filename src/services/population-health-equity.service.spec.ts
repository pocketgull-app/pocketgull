import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { PopulationHealthEquityService } from './population-health-equity.service';
import { createEnvironmentInjector, EnvironmentInjector, runInInjectionContext } from '@angular/core';

describe('PopulationHealthEquityService', () => {
  let service: PopulationHealthEquityService;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = createEnvironmentInjector([], undefined as any);

    runInInjectionContext(injector, () => {
      service = new PopulationHealthEquityService();
    });
  });

  it('should initialize with 5 demographic patient cohorts', () => {
    expect(service).toBeTruthy();
    expect(service.cohorts().length).toBe(5);
    expect(service.selectedCohort().demographicGroup).toBe('Pediatric');
  });

  it('should switch active cohort and compute Health Equity Burden Index (HEBI)', () => {
    service.selectCohort('cohort_maternal');
    expect(service.selectedCohort().demographicGroup).toBe('Maternal Health');
    expect(service.hebiIndex()).toBeGreaterThan(0);
  });

  it('should generate a valid de-identified synthetic FHIR R4 Bundle JSON export', () => {
    const bundle = service.generateSyntheticFhirBundle('cohort_pediatric');

    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('collection');
    expect(bundle.entry.length).toBe(3);
    expect(bundle.entry[0].resource.resourceType).toBe('Patient');
  });
});
