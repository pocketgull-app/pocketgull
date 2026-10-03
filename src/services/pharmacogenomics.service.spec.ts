import { PharmacogenomicsService } from './pharmacogenomics.service';

describe('PharmacogenomicsService (Clinical Model P4)', () => {
  let service: PharmacogenomicsService;

  beforeEach(() => {
    service = new PharmacogenomicsService();
  });

  it('1. Initializes with default pharmacogenomic profile', () => {
    const profile = service.activeProfile();
    expect(profile).not.toBeNull();
    expect(profile?.variants.length).toBeGreaterThan(0);
    expect(profile?.interactions.length).toBeGreaterThan(0);
    expect(service.hasHighRiskInteractions()).toBe(true);
  });

  it('2. Flags codeine contraindication for CYP2D6 Poor Metabolizers', () => {
    const interaction = service.checkDrugGeneSafety('Codeine');
    expect(interaction).not.toBeNull();
    expect(interaction?.severity).toBe('contraindicated');
    expect(interaction?.gene).toBe('CYP2D6');
  });

  it('3. Flags simvastatin statin myopathy warning for SLCO1B1', () => {
    const interaction = service.checkDrugGeneSafety('Simvastatin');
    expect(interaction).not.toBeNull();
    expect(interaction?.severity).toBe('warning');
    expect(interaction?.evidenceLevel).toBe('1A');
  });

  it('4. Calls CYP2D6 diplotypes and computes activity score and phenotype according to CPIC', () => {
    // *4/*4 -> Activity 0.0 -> Poor Metabolizer
    const pm = service.callDiplotype('CYP2D6', '*4', '*4');
    expect(pm.diplotype).toBe('*4/*4');
    expect(pm.activityScore).toBe(0);
    expect(pm.phenotype).toBe('Poor Metabolizer');

    // *1/*4 -> Activity 1.0 -> Intermediate Metabolizer
    const im = service.callDiplotype('CYP2D6', '*1', '*4');
    expect(im.diplotype).toBe('*1/*4');
    expect(im.activityScore).toBe(1.0);
    expect(im.phenotype).toBe('Intermediate Metabolizer');

    // *1/*1 -> Activity 2.0 -> Normal Metabolizer
    const nm = service.callDiplotype('CYP2D6', '*1', '*1');
    expect(nm.diplotype).toBe('*1/*1');
    expect(nm.activityScore).toBe(2.0);
    expect(nm.phenotype).toBe('Normal Metabolizer');

    // *1xN/*1 -> Activity 3.0 -> Ultra-Rapid Metabolizer
    const um = service.callDiplotype('CYP2D6', '*1xN', '*1');
    expect(um.diplotype).toBe('*1xN/*1');
    expect(um.activityScore).toBe(3.0);
    expect(um.phenotype).toBe('Ultra-Rapid Metabolizer');
  });

  it('5. Calls CYP2C19 diplotypes and correctly identifies Ultra-Rapid Metabolizers (*17/*17)', () => {
    const um = service.callDiplotype('CYP2C19', '*17', '*17');
    expect(um.activityScore).toBe(3.0);
    expect(um.phenotype).toBe('Ultra-Rapid Metabolizer');

    const pm = service.callDiplotype('CYP2C19', '*2', '*3');
    expect(pm.activityScore).toBe(0);
    expect(pm.phenotype).toBe('Poor Metabolizer');
  });

  it('6. Calls CYP3A4 diplotypes (*1/*22 vs *1/*1)', () => {
    const im = service.callDiplotype('CYP3A4', '*1', '*22');
    expect(im.activityScore).toBe(1.5);
    expect(im.phenotype).toBe('Normal Metabolizer');

    const pm = service.callDiplotype('CYP3A4', '*22', '*20');
    expect(pm.activityScore).toBe(0.5);
    expect(pm.phenotype).toBe('Poor Metabolizer');
  });

  it('7. Evaluates prodrug bioactivation failure for Codeine in CYP2D6 Poor Metabolizers', () => {
    // Default active profile has CYP2D6 *4/*4 (Poor Metabolizer)
    const risk = service.evaluateProdrugRisk('Codeine');
    expect(risk).not.toBeNull();
    expect(risk?.drugType).toBe('prodrug');
    expect(risk?.primaryEnzyme).toBe('CYP2D6');
    expect(risk?.activeMetabolite).toBe('Morphine');
    expect(risk?.patientPhenotype).toBe('Poor Metabolizer');
    expect(risk?.riskType).toBe('Therapeutic Inefficacy / Non-Response');
    expect(risk?.activationRiskScore).toBeGreaterThanOrEqual(85);
    expect(risk?.fdaBlackBoxWarning).toBe(true);
  });

  it('8. Dynamically switches CYP2D6 to Ultra-Rapid and identifies hyper-activation toxicity', () => {
    service.setDiplotype('CYP2D6', '*1xN', '*1');
    const risk = service.evaluateProdrugRisk('Codeine');
    expect(risk?.patientPhenotype).toBe('Ultra-Rapid Metabolizer');
    expect(risk?.riskType).toBe('Severe Toxicity / Hyper-Activation');
    expect(risk?.activationRiskScore).toBe(98);
    expect(risk?.clinicalRecommendation).toContain('CONTRAINDICATED');
  });

  it('9. Identifies Clopidogrel non-response risk when CYP2C19 is Poor Metabolizer', () => {
    service.setDiplotype('CYP2C19', '*2', '*2');
    const risk = service.evaluateProdrugRisk('Clopidogrel');
    expect(risk?.patientPhenotype).toBe('Poor Metabolizer');
    expect(risk?.riskType).toBe('Therapeutic Inefficacy / Non-Response');
    expect(risk?.activationRiskScore).toBe(95);
    expect(risk?.clinicalRecommendation).toContain('stent thrombosis');
  });

  it('10. Detects Grapefruit Juice inhibition of CYP3A4 Simvastatin metabolism', () => {
    const interactions = service.evaluateHerbDrugInteractions(['Simvastatin'], ['Grapefruit Juice']);
    expect(interactions.length).toBe(1);
    expect(interactions[0].affectedEnzyme).toBe('CYP3A4');
    expect(interactions[0].mechanism).toBe('mechanism_based_inactivation');
    expect(interactions[0].clinicalSeverity).toBe('contraindicated');
    expect(interactions[0].riskSummary).toContain('rhabdomyolysis');
  });

  it('11. Detects St. John\'s Wort transcription induction of CYP3A4 oral contraceptives', () => {
    const interactions = service.evaluateHerbDrugInteractions(['Oral Contraceptives'], ['St. John\'s Wort (Hypericum)']);
    expect(interactions.length).toBe(1);
    expect(interactions[0].affectedEnzyme).toBe('CYP3A4');
    expect(interactions[0].mechanism).toBe('transcription_induction');
    expect(interactions[0].clinicalSeverity).toBe('contraindicated');
  });

  it('12. Detects Goldenseal inhibition of CYP2D6 Metoprolol clearance', () => {
    const interactions = service.evaluateHerbDrugInteractions(['Metoprolol'], ['Goldenseal']);
    expect(interactions.length).toBe(1);
    expect(interactions[0].affectedEnzyme).toBe('CYP2D6');
    expect(interactions[0].clinicalSeverity).toBe('high_risk');
  });
});
