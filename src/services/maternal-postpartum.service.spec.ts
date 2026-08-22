import { MaternalPostpartumService } from './maternal-postpartum.service';

describe('MaternalPostpartumService', () => {
  let service: MaternalPostpartumService;

  beforeEach(() => {
    service = new MaternalPostpartumService();
  });

  it('should initialize with baseline maternal state', () => {
    expect(service.activePostpartumDay()).toBe(21);
    expect(service.maternalVitals().restingHeartRateBpm).toBe(68);
    expect(service.epdsAnswers().length).toBe(10);
  });

  it('should compute EPDS score and update on item change', () => {
    const initialScore = service.epdsScore();
    expect(initialScore.instrumentName).toBe('Edinburgh Postnatal Depression Scale (EPDS)');
    expect(initialScore.maxScore).toBe(30);

    // Set all to 0
    for (let i = 0; i < 10; i++) {
      service.setEpdsAnswer(i, 0);
    }
    expect(service.epdsScore().totalScore).toBe(0);
    expect(service.epdsScore().severity).toBe('Low Depression Risk');
    expect(service.isHighRiskEpds()).toBe(false);

    // Set high score
    for (let i = 0; i < 10; i++) {
      service.setEpdsAnswer(i, 2);
    }
    expect(service.epdsScore().totalScore).toBe(20);
    expect(service.isHighRiskEpds()).toBe(true);
    expect(service.epdsScore().criticalAlert).toBe(true);
  });

  it('should look up medications in LactMed catalog', () => {
    const advil = service.lookupLactMedSafety('ibuprofen');
    expect(advil).toBeDefined();
    expect(advil?.riskTier).toBe('L1 — Safest');
    expect(advil?.relativeInfantDosePercent).toBeLessThan(10);

    const codeine = service.lookupLactMedSafety('codeine');
    expect(codeine).toBeDefined();
    expect(codeine?.riskTier).toBe('L4 — Possibly Hazardous');

    const missing = service.lookupLactMedSafety('nonexistent_experimental_drug');
    expect(missing).toBeNull();
  });

  it('should toggle recovery milestone completion', () => {
    const initialStatus = service.recoveryMilestones()[2]!.completed;
    service.toggleMilestone(2);
    expect(service.recoveryMilestones()[2]!.completed).toBe(!initialStatus);
  });

  it('should export standard FHIR R4 Postpartum Bundle', () => {
    const bundle = service.exportFhirR4PostpartumBundle('test-mother-1');
    expect(bundle['resourceType']).toBe('Bundle');
    expect(bundle['type']).toBe('collection');
    expect(bundle['entry'].length).toBe(2);

    const epdsObs = bundle['entry'][0]['resource'];
    expect(epdsObs['code']['coding'][0]['code']).toBe('71354-5');
    expect(epdsObs['subject']['reference']).toBe('Patient/test-mother-1');
  });
});
