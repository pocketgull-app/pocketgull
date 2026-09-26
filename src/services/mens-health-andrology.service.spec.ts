import { MensHealthAndrologyService } from './mens-health-andrology.service';

describe('MensHealthAndrologyService', () => {
  let service: MensHealthAndrologyService;

  beforeEach(() => {
    service = new MensHealthAndrologyService();
  });

  it('1. Computes baseline IPSS score correctly (Moderate 10)', () => {
    const res = service.ipssScore();
    expect(res.totalScore).toBe(10);
    expect(res.severity).toBe('Moderate (8-19)');
    expect(res.clinicalAction).toContain('Medical therapy candidate');
  });

  it('2. Escalates IPSS severity to Severe (>= 20) with elevated symptoms', () => {
    service.setIpssAnswer(0, 4);
    service.setIpssAnswer(1, 4);
    service.setIpssAnswer(2, 4);
    service.setIpssAnswer(3, 4);
    service.setIpssAnswer(4, 4);
    const res = service.ipssScore();
    expect(res.totalScore).toBeGreaterThanOrEqual(20);
    expect(res.severity).toBe('Severe (20-35)');
    expect(res.clinicalAction).toContain('Urology referral indicated');
  });

  it('3. Activates hard ISMP nitrate-PDE5 contraindication when patient takes nitroglycerin', () => {
    expect(service.princetonEvaluation().pde5PrescriptionSafe).toBe(true);
    service.setNitrateUsage(true);
    const evalResult = service.princetonEvaluation();
    expect(evalResult.nitrateContraindicationActive).toBe(true);
    expect(evalResult.pde5PrescriptionSafe).toBe(false);
  });

  it('4. Classifies high cardiovascular risk per Princeton III when prior MI is present', () => {
    service.setPriorMi(true);
    const evalResult = service.princetonEvaluation();
    expect(evalResult.riskTier).toBe('High Risk');
    expect(evalResult.endothelialWarning).toContain('CRITICAL: High cardiovascular risk');
    expect(evalResult.pde5PrescriptionSafe).toBe(false);
  });

  it('5. Evaluates St. Louis ADAM questionnaire for androgen deficiency', () => {
    expect(service.adamResult().isPositiveForHypogonadism).toBe(true);
    expect(service.adamResult().libidoDecreased).toBe(true);
    expect(service.adamResult().clinicalGuidance).toContain('two separate morning (8:00–10:00 AM) fasting');
  });

  it('6. Flags high PSA velocity (>0.75 ng/mL/yr) as high biopsy/mpMRI indication', () => {
    service.setPsaValues(5.2, 18, 4.0); // 5.2 - 4.0 = 1.2 ng/mL/yr velocity
    const psa = service.psaInterpretation();
    expect(psa.psaVelocityNgMlYr).toBe(1.2);
    expect(psa.riskCategory).toBe('High Biopsy / mpMRI Indication');
    expect(psa.clinicalRecommendation).toContain('Urgent multiparametric prostate MRI');
  });

  it('7. Exports standard FHIR R4 Bundle with IPSS and PSA observations', () => {
    const bundle = service.exportFhirR4MensHealthBundle('homo-sapiens-male-58y');
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.entry?.length).toBe(2);
    expect(bundle.entry[0].resource.resourceType).toBe('Observation');
    expect(bundle.entry[0].resource.code.coding[0].code).toBe('80976-4');
  });
});
