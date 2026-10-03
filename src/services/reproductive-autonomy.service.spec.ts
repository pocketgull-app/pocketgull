import { ReproductiveAutonomyService } from './reproductive-autonomy.service';

describe('ReproductiveAutonomyService', () => {
  let service: ReproductiveAutonomyService;

  beforeEach(() => {
    service = new ReproductiveAutonomyService();
  });

  it('1. Initializes with baseline risk-free CDC MEC ratings', () => {
    const methods = service.evaluatedContraceptives();
    const coc = methods.find(m => m.id === 'meth-coc');
    expect(coc).toBeDefined();
    expect(coc?.mecScore).toBe(1);
  });

  it('2. Escalates Combined Oral Contraceptive to CDC MEC Category 4 when Migraine with Aura is present', () => {
    service.setRiskFactor('Migraine with Aura', true);
    const methods = service.evaluatedContraceptives();
    const coc = methods.find(m => m.id === 'meth-coc');
    expect(coc?.mecScore).toBe(4);
    expect(coc?.mecRationale).toContain('Unacceptable health risk');
  });

  it('3. Generates BMI-specific warning for Levonorgestrel emergency contraception', () => {
    service.setBmi(31);
    service.setElapsedHours(24);
    const guidance = service.dynamicEmergencyGuidance();
    const planB = guidance.find(g => g.type === 'Oral Progestin');
    expect(planB?.clinicalNote).toContain('WARNING: Efficacy significantly attenuated');
  });

  it('4. Correctly flags emergency contraception window expiry after 120 hours', () => {
    service.setElapsedHours(130);
    const guidance = service.dynamicEmergencyGuidance();
    guidance.forEach(g => {
      expect(g.isWithinWindow).toBe(false);
      expect(g.clinicalNote).toContain('Window expired');
    });
  });

  it('5. Executes emergency instant data scrub and switches to discreet decoy mode', () => {
    service.setRiskFactor('Migraine with Aura', true);
    service.setBmi(34);
    expect(service.enclaveState().discreetDecoyActive).toBe(false);

    service.executeEmergencyScrub();
    expect(service.enclaveState().discreetDecoyActive).toBe(true);
    expect(service.enclaveState().isDecrypted).toBe(false);
    expect(service.patientMedicalRiskFactors()).toEqual(['None']);
    expect(service.enclaveState().lastScrubTimestamp).not.toBeNull();
  });

  it('6. Exports FHIR R4 Bundle with Restricted ("R") security confidentiality tag', () => {
    const bundle = service.exportRestrictedFhirR4Bundle('patient-sovereign-01');
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.meta?.security?.[0]?.code).toBe('R');
    expect(bundle.entry?.length).toBeGreaterThan(0);
  });
});
