import { describe, it, expect, beforeEach } from 'vitest';
import { Ga4ghPhenopacketService } from './ga4gh-phenopacket.service';
import { IPatient } from './patient.types';

describe('Ga4ghPhenopacketService Suite', () => {
  let service: Ga4ghPhenopacketService;

  beforeEach(() => {
    service = new Ga4ghPhenopacketService();
  });

  it('should initialize successfully', () => {
    expect(service).toBeTruthy();
  });

  it('should resolve known clinical symptoms to precise HPO ontology codes', () => {
    const jointPain = service.resolveHpoTerm('Severe knee joint pain');
    expect(jointPain.id).toBe('HP:0034633');
    expect(jointPain.label).toBe('Knee joint pain');

    const headache = service.resolveHpoTerm('Occipital headache');
    expect(headache.id).toBe('HP:0002315');
    expect(headache.label).toBe('Headache');

    const chestPain = service.resolveHpoTerm('Substernal chest pain');
    expect(chestPain.id).toBe('HP:0100749');
    expect(chestPain.label).toBe('Chest pain');
  });

  it('should generate a valid GA4GH Phenopacket v2 document with metadata provenance', () => {
    const mockPatient: IPatient = {
      id: 'pat-udn-8821',
      name: 'Homo Sapiens (Rare Disease Cohort Participant)',
      gender: 'Female',
      age: 34,
      lastVisit: '2026-08-21',
      preexistingConditions: ['Osteoarthritis', 'Hypertension'],
      history: [],
      bookmarks: [],
      issues: {},
      patientGoals: 'Improve mobility',
      vitals: {
        bp: '124/80',
        hr: '74',
        temp: '98.6',
        spO2: '99',
        weight: '68',
        height: '170',
        cgmGlucoseMgDl: '92'
      }
    };

    (mockPatient as any).symptoms = ['knee joint pain', 'fatigue', 'headache'];
    (mockPatient as any).conditions = ['Osteoarthritis', 'Hypertension'];

    const phenopacket = service.generatePhenopacket(mockPatient);

    expect(phenopacket).toBeTruthy();
    expect(phenopacket.id).toContain('phenopacket-pat-udn-8821');
    expect(phenopacket.subject.sex).toBe('FEMALE');
    expect(phenopacket.subject.taxonomy.id).toBe('NCBITaxon:9606');
    expect(phenopacket.subject.timeAtLastEncounter?.age.iso8601duration).toBe('P34Y');

    // Phenotypic features
    expect(phenopacket.phenotypicFeatures.length).toBe(3);
    expect(phenopacket.phenotypicFeatures[0].type.id).toBe('HP:0034633');

    // Measurements
    expect(phenopacket.measurements.length).toBe(3); // HR, BP, Glucose
    const hr = phenopacket.measurements.find(m => m.assay.id === 'LOINC:8867-4');
    expect(hr?.value.quantity?.value).toBe(74);

    // Metadata Provenance (NPI, ORCID, Zenodo, UDN, OCTRI)
    expect(phenopacket.metaData.phenopacketSchemaVersion).toBe('2.0');
    expect(phenopacket.metaData.submittedBy).toContain('CMS NPI: 1487569752');
    expect(phenopacket.metaData.submittedBy).toContain('ORCID: 0009-0008-1372-5381');

    const refs = phenopacket.metaData.externalReferences;
    expect(refs.some(r => r.id === 'zenodo.20647514')).toBe(true);
    expect(refs.some(r => r.id === 'harvard-udn-consortium')).toBe(true);
    expect(refs.some(r => r.id === 'ohsu-octri-ctsa')).toBe(true);
  });

  it('should export formatted JSON string for download or API transmission', () => {
    const mockPatient: IPatient = {
      id: 'pat-demo',
      name: 'Sample Patient',
      gender: 'Male',
      age: 45,
      lastVisit: '2026-08-21',
      preexistingConditions: [],
      history: [],
      bookmarks: [],
      issues: {},
      patientGoals: 'Checkup',
      vitals: {
        bp: '120/80',
        hr: '80',
        temp: '98.6',
        spO2: '98',
        weight: '75',
        height: '180',
        cgmGlucoseMgDl: '100'
      }
    };

    (mockPatient as any).symptoms = ['cough'];

    const json = service.exportPhenopacketJson(mockPatient);
    expect(typeof json).toBe('string');
    const parsed = JSON.parse(json);
    expect(parsed.subject.sex).toBe('MALE');
    expect(parsed.metaData.phenopacketSchemaVersion).toBe('2.0');
  });
});
