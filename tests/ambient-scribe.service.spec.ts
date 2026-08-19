import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AmbientScribeService } from '../src/services/ambient-scribe.service';

describe('AmbientScribeService', () => {
  let service: AmbientScribeService;

  beforeEach(() => {
    service = new AmbientScribeService();
  });

  it('should initialize with idle state and empty dialogue', () => {
    expect(service.isListening()).toBe(false);
    expect(service.isProcessingSoap()).toBe(false);
    expect(service.totalTurns()).toBe(0);
    expect(service.soapNote()).toBeNull();
    expect(service.hasGeneratedSoap()).toBe(false);
  });

  it('should start listening and set audio level', () => {
    service.startListening();
    expect(service.isListening()).toBe(true);
    expect(service.audioLevel()).toBeGreaterThan(0);
  });

  it('should stop listening and reset audio level', () => {
    service.startListening();
    service.stopListening();
    expect(service.isListening()).toBe(false);
    expect(service.audioLevel()).toBe(0);
  });

  it('should add spoken turns and update computed dialogue count', () => {
    service.addTurn('clinician', 'Patient presents with morning occipital headaches.');
    service.addTurn('patient', 'The pain is worse around 3 PM.');

    expect(service.totalTurns()).toBe(2);
    expect(service.latestTurn()?.speaker).toBe('patient');
    expect(service.latestTurn()?.text).toBe('The pain is worse around 3 PM.');
  });

  it('should generate structured SOAP note from simulation scenario', async () => {
    vi.useFakeTimers();

    service.startListening('hypertension-fatigue');
    expect(service.isListening()).toBe(true);

    // Fast-forward all dialogue delays
    vi.runAllTimers();

    expect(service.soapNote()).not.toBeNull();
    const soap = service.soapNote()!;

    expect(soap.subjective.chiefComplaint).toContain('headaches');
    expect(soap.objective.vitals.bloodPressure).toBe('146/92 mmHg');
    expect(soap.assessment.icd10Code).toBe('I10');
    expect(soap.plan.pharmacotherapy.length).toBeGreaterThan(0);
    expect(soap.plan.suggestedCptCodes[0]?.code).toBe('99214');
    expect(soap.evidenceSummary.nullHypothesisPValue).toBeLessThan(0.05);

    vi.useRealTimers();
  });

  it('should export valid FHIR R4 Composition Document Bundle', () => {
    const scenario = service.simulationScenarios[0]!;
    service.updateSoapNote(scenario.expectedSoap);

    const fhirBundle = service.exportFhirR4SoapBundle();

    expect(fhirBundle['resourceType']).toBe('Bundle');
    expect(fhirBundle['type']).toBe('document');
    expect(fhirBundle['entry']).toBeDefined();
    expect(fhirBundle['entry'][0]['resource']['resourceType']).toBe('Composition');
    expect(fhirBundle['entry'][0]['resource']['type']['coding'][0]['code']).toBe('11488-4'); // Consultation note
    expect(fhirBundle['entry'][0]['resource']['section'].length).toBe(4); // S, O, A, P
  });

  it('should purge all transient scribe state for HIPAA compliance', () => {
    service.addTurn('clinician', 'Blood pressure is 150/90.');
    const scenario = service.simulationScenarios[0]!;
    service.updateSoapNote(scenario.expectedSoap);

    service.purgeScribeState();

    expect(service.isListening()).toBe(false);
    expect(service.totalTurns()).toBe(0);
    expect(service.soapNote()).toBeNull();
    expect(service.audioLevel()).toBe(0);
  });
});
