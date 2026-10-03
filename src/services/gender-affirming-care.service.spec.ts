import { GenderAffirmingCareService } from './gender-affirming-care.service';

describe('GenderAffirmingCareService', () => {
  let service: GenderAffirmingCareService;

  beforeEach(() => {
    service = new GenderAffirmingCareService();
  });

  it('1. Computes baseline feminizing GAHT targets correctly', () => {
    const evalResult = service.gahtEvaluation();
    expect(evalResult.estradiolTargetMet).toBe(true);
    expect(evalResult.testosteroneTargetMet).toBe(true);
    expect(evalResult.hyperkalemiaWarning).toBe(false);
  });

  it('2. Flags Spironolactone hyperkalemia warning when potassium exceeds 5.2 mEq/L', () => {
    service.setBiomarkers(140, 25, 5.5, 41); // K = 5.5 mEq/L
    const evalResult = service.gahtEvaluation();
    expect(evalResult.hyperkalemiaWarning).toBe(true);
    expect(evalResult.actionableDoseGuidance.some(a => a.includes('Hyperkalemia'))).toBe(true);
  });

  it('3. Flags secondary erythrocytosis warning on masculinizing GAHT when hematocrit > 50%', () => {
    service.setTransitionRegimen('Masculinizing (Exogenous Testosterone)');
    service.setBiomarkers(30, 650, 4.2, 53); // Hct = 53%
    const evalResult = service.gahtEvaluation();
    expect(evalResult.erythrocytosisWarning).toBe(true);
    expect(evalResult.actionableDoseGuidance.some(a => a.includes('Secondary Erythrocytosis'))).toBe(true);
  });

  it('4. Triggers cervical cancer screening alerts based strictly on organ presence, regardless of administrative gender', () => {
    // Transmasculine patient with retained cervix
    service.setTransitionRegimen('Masculinizing (Exogenous Testosterone)');
    service.toggleOrgan('hasCervix'); // Set to true
    const alerts = service.screeningAlerts();
    const cervicalAlert = alerts.find(a => a.organOrTissue.includes('Cervix'));
    expect(cervicalAlert).toBeDefined();
    expect(cervicalAlert?.recommendedScreening).toContain('Pap Smear');
  });

  it('5. Triggers prostate cancer surveillance alert for transfeminine patient with retained prostate', () => {
    const alerts = service.screeningAlerts();
    const prostateAlert = alerts.find(a => a.organOrTissue.includes('Prostate'));
    expect(prostateAlert).toBeDefined();
    expect(prostateAlert?.clinicalGuideline).toContain('Transgender women retain their prostate');
  });

  it('6. Evaluates muscle-mass independent Cystatin-C based eGFR', () => {
    const renal = service.renalEvaluation();
    expect(renal.cystatinCBasedEgfr).toBeGreaterThan(0);
    expect(renal.preferredEgfr).toBe(renal.cystatinCBasedEgfr);
    expect(renal.interpretationNotes).toContain('Cystatin C');
  });

  it('7. Exports FHIR R4 Bundle with Restricted ("R") confidentiality security tag', () => {
    const bundle = service.exportFhirR4GenderAffirmingBundle('patient-diverse-01');
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.meta?.security?.[0]?.code).toBe('R');
    expect(bundle.entry?.length).toBe(3);
  });
});
