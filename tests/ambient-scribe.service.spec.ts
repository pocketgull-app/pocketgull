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

  it('should generate structured SOAP note from recorded conversation', async () => {
    service.loadScenario('hypertension_fatigue');
    expect(service.totalTurns()).toBeGreaterThan(0);

    await service.generateSoapNote();

    const soap = service.soapNote();
    expect(soap).not.toBeNull();
    expect(soap?.subjective.chiefComplaint).toContain('headaches');
    expect(soap?.assessment.icd10Code).toBe('I10');
    expect(soap?.plan.suggestedCptCodes.map(c => c.code)).toContain('99214');
    expect(service.hasGeneratedSoap()).toBe(true);
  });

  it('should export HL7 FHIR R4 Composition bundle', async () => {
    service.loadScenario('diabetes_neuropathy');
    await service.generateSoapNote();

    const fhirBundle = service.exportFhirR4SoapBundle();
    expect(fhirBundle).toBeDefined();
    expect(fhirBundle.resourceType).toBe('Bundle');
    expect(fhirBundle.type).toBe('document');
    expect(fhirBundle.entry.length).toBeGreaterThan(0);
    expect(fhirBundle.entry[0].resource.resourceType).toBe('Composition');
  });

  it('should purge all transient scribe dialogue and SOAP state', async () => {
    service.loadScenario('hypertension_fatigue');
    await service.generateSoapNote();

    expect(service.totalTurns()).toBeGreaterThan(0);
    expect(service.soapNote()).not.toBeNull();

    service.purgeScribeState();

    expect(service.totalTurns()).toBe(0);
    expect(service.soapNote()).toBeNull();
    expect(service.hasGeneratedSoap()).toBe(false);
  });
});
