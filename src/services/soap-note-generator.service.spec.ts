import { SoapNoteGeneratorService } from './soap-note-generator.service';

describe('SoapNoteGeneratorService', () => {
  let service: SoapNoteGeneratorService;

  beforeEach(() => {
    service = new SoapNoteGeneratorService();
  });

  it('should initialize with default SOAP sections', () => {
    expect(service.subjective()).toBeTruthy();
    expect(service.objective()).toBeTruthy();
    expect(service.assessment()).toBeTruthy();
    expect(service.plan()).toBeTruthy();
  });

  it('should append transcript snippet to subjective section safely', () => {
    const initialLen = service.subjective().length;
    service.appendTranscriptSnippet('Patient reported joint stiffness after morning run.');
    expect(service.subjective().length).toBeGreaterThan(initialLen);
    expect(service.subjective()).toContain('joint stiffness');
  });

  it('should generate FHIR R4 DocumentReference bundle JSON string', () => {
    const fhirJson = service.generateFhirR4DocumentReference();
    const parsed = JSON.parse(fhirJson);
    expect(parsed.resourceType).toBe('Bundle');
    expect(parsed.type).toBe('document');
    expect(parsed.entry[0].resource.resourceType).toBe('DocumentReference');
  });
});
