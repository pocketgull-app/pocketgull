import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { runInInjectionContext, createEnvironmentInjector, signal } from '@angular/core';
import { Ga4ghPhenopacketsCardComponent } from './ga4gh-phenopackets-card.component';
import { Ga4ghPhenopacketService } from '../../services/ga4gh-phenopacket.service';
import { PatientStateService } from '../../services/patient-state.service';

describe('Ga4ghPhenopacketsCardComponent Suite', () => {
  let component: Ga4ghPhenopacketsCardComponent;
  let phenopacketService: Ga4ghPhenopacketService;
  let mockPatientState: any;

  beforeEach(() => {
    phenopacketService = new Ga4ghPhenopacketService();
    mockPatientState = {
      issues: signal({
        knee: [
          {
            id: 'knee',
            noteId: 'note-1',
            name: 'Osteoarthritis',
            painLevel: 6,
            description: 'Pain in right knee',
            symptoms: ['knee joint pain', 'stiffness']
          }
        ]
      }),
      vitals: signal({
        bp: '120/80',
        hr: '72',
        temp: '98.6',
        spO2: '99',
        weight: '70',
        height: '175',
        cgmGlucoseMgDl: '95'
      }),
      patientGoals: signal('Reduce inflammation and improve mobility')
    };

    const injector = createEnvironmentInjector([
      { provide: Ga4ghPhenopacketService, useValue: phenopacketService },
      { provide: PatientStateService, useValue: mockPatientState }
    ], undefined as any);

    component = runInInjectionContext(injector, () => new Ga4ghPhenopacketsCardComponent());
  });

  it('should render the GA4GH Phenopackets v2 component successfully', () => {
    expect(component).toBeTruthy();
    expect(component.copyStatus()).toBe('Copy JSON');
  });

  it('should compute valid phenopacket JSON matching schema v2.0', () => {
    const jsonStr = component.phenopacketJson();
    expect(typeof jsonStr).toBe('string');
    const parsed = JSON.parse(jsonStr);
    expect(parsed.metaData.phenopacketSchemaVersion).toBe('2.0');
    expect(parsed.subject.taxonomy.id).toBe('NCBITaxon:9606');
    expect(parsed.metaData.submittedBy).toContain('CMS NPI: 1487569752');
    expect(parsed.metaData.submittedBy).toContain('ORCID: 0009-0008-1372-5381');
  });

  it('should map current patient features and measurements into phenopacket structure', () => {
    const phenopacket = component.currentPhenopacket();
    expect(phenopacket).toBeTruthy();
    expect(phenopacket.phenotypicFeatures.length).toBeGreaterThan(0);
    expect(phenopacket.measurements.length).toBeGreaterThan(0);
  });
});
