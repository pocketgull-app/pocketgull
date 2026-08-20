import '@angular/compiler';
import { expect } from 'vitest';
import { AmbientClinicalScribeService } from './ambient-clinical-scribe.service';
import { IPatient } from './patient.types';

describe('AmbientClinicalScribeService - Ambient Dialogue-to-SOAP Scribe Suite', () => {
  let service: AmbientClinicalScribeService;

  const mockPatient: IPatient = {
    id: 'p001',
    name: 'Homo Sapiens (Male, Metabolic Syndrome, 58y)',
    age: 58,
    gender: 'Male',
    lastVisit: '2026-08-19',
    preexistingConditions: ['Essential Hypertension', 'Type 2 Diabetes'],
    history: [],
    bookmarks: [],
    issues: {},
    patientGoals: '',
    medications: [],
    dietarySupplements: [],
    vitals: { bp: '148/92', hr: '76', spO2: '98%', temp: '36.6', weight: '82', height: '175' }
  };

  beforeEach(() => {
    service = new AmbientClinicalScribeService();
  });

  it('1. Synthesizes structured SOAP note with Subjective, Objective, Assessment, and Plan', () => {
    const transcript = 'Patient: I felt dizzy when standing. Doctor: We will review your BP and lab orders.';
    const note = service.generateSoapNote(transcript, mockPatient);

    expect(note.subjective.chiefComplaint).toBeDefined();
    expect(note.objective.vitalSigns.bp).toBe('148/92');
    expect(note.assessment.icd10Code).toBe('I10');
    expect(note.plan.diagnosticOrders.length).toBeGreaterThan(0);
    expect(note.snomedCodes.length).toBeGreaterThan(0);
  });

  it('2. Formats and exports a valid FHIR R4 Encounter resource', () => {
    const note = service.generateSoapNote('', mockPatient);
    expect(note.fhirEncounterResource['resourceType']).toBe('Encounter');
    expect(note.fhirEncounterResource['status']).toBe('finished');
  });
});
