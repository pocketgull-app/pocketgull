import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { ClinicalTrajectoryReaderService } from './clinical-trajectory-reader.service';

describe('ClinicalTrajectoryReaderService Unit Suite', () => {
  let service: ClinicalTrajectoryReaderService;

  beforeEach(() => {
    const injector = Injector.create({ providers: [] });
    service = runInInjectionContext(injector, () => new ClinicalTrajectoryReaderService());
  });

  it('1. Generates structured 3-Act Trajectory profile for clinician persona', () => {
    const profile = service.getTrajectoryProfile('clinician');
    expect(profile.pastFoundation.length).toBeGreaterThan(0);
    expect(profile.presentFulcrum.length).toBeGreaterThan(0);
    expect(profile.futureHorizon.length).toBeGreaterThan(0);
    expect(profile.projectedVitalityScore).toBe(92);
    expect(profile.digestSeal).toContain('sha256-traj-');
  });

  it('2. Adapts vocabulary seamlessly for patient persona', () => {
    const patientProfile = service.getTrajectoryProfile('patient');
    expect(patientProfile.persona).toBe('patient');
    expect(patientProfile.pastFoundation[0].title).toBe('Your Genetic Starting Point');
    expect(patientProfile.futureHorizon[0].title).toContain('30 Days Ahead');
  });

  it('3. Converts plain text to Bionic Speed Reading HTML with fixation anchors', () => {
    const text = 'Hypertension Metformin 500 mg';
    const html = service.toBionicHtml(text);
    expect(html).toContain('<strong');
    expect(html).toContain('</strong>');
  });

  it('4. Tokenizes clinical sentences for RSVP teleprompter playback', () => {
    const text = 'Daily 4-7-8 vagal breathing enhances autonomic parasympathetic recovery.';
    const tokens = service.tokenizeForRsvp(text);
    expect(tokens.length).toBe(8);
    expect(tokens[0].fixation).toBeTruthy();
  });

  it('5. Exports standardized HL7 FHIR R4 CarePlan resource', () => {
    const fhirCarePlan = service.exportFhirCarePlan();
    expect(fhirCarePlan.resourceType).toBe('CarePlan');
    expect(fhirCarePlan.status).toBe('active');
    expect(fhirCarePlan.intent).toBe('plan');
    expect(fhirCarePlan.goal.length).toBeGreaterThan(0);
    expect(fhirCarePlan.meta.tag[0].system).toContain('pocketgull.app');
  });
});
