import '@angular/compiler';
import { BarrowsClinicalInquiryService } from './barrows-clinical-inquiry.service';

describe('BarrowsClinicalInquiryService', () => {
  let service: BarrowsClinicalInquiryService;

  beforeEach(() => {
    service = new BarrowsClinicalInquiryService();
  });

  it('should initialize with candidate hypotheses and living problem list', () => {
    const hypotheses = service.hypotheses();
    expect(hypotheses.length).toBeGreaterThanOrEqual(3);
    expect(hypotheses[0].title).toContain('Autonomic Dysregulation');

    const problemList = service.livingProblemList();
    expect(problemList.activeDrivers.length).toBeGreaterThanOrEqual(2);
    expect(problemList.compensatoryResponses.length).toBeGreaterThanOrEqual(2);
    expect(problemList.protectiveStrengths.length).toBeGreaterThanOrEqual(2);
  });

  it('should update hypothesis status and score when answering YES to falsification question', () => {
    const hypoId = 'hypo-2';
    service.testFalsificationQuestion(hypoId, 'YES');

    const updated = service.hypotheses().find(h => h.id === hypoId);
    expect(updated).toBeDefined();
    expect(updated?.falsificationStatus).toBe('SUPPORTED');
    expect(updated?.likelihoodScore).toBeGreaterThan(0.52);
  });

  it('should refute hypothesis and reduce score when answering NO to falsification question', () => {
    const hypoId = 'hypo-2';
    service.testFalsificationQuestion(hypoId, 'NO');

    const updated = service.hypotheses().find(h => h.id === hypoId);
    expect(updated).toBeDefined();
    expect(updated?.falsificationStatus).toBe('REFUTED');
    expect(updated?.likelihoodScore).toBeLessThan(0.52);
  });

  it('should compute an objective 60-second clinician handoff brief with top questions', () => {
    const brief = service.clinicianBrief();
    expect(brief.patientContext).toContain('Howard Barrows');
    expect(brief.topQuestionsForPhysician.length).toBe(3);
    expect(brief.fourteenDayTrends.length).toBe(3);
    expect(brief.redFlagsRuledOut.length).toBeGreaterThanOrEqual(2);
    expect(brief.integrityHash).toContain('SHA256:BARROWS');
  });

  it('should export formatted clinician brief text for appointment handoff', () => {
    const text = service.exportDoctorBriefAsText();
    expect(text).toContain('=== POCKETGULL CLINICIAN CONSULTATION BRIEF (DR. BARROWS MODEL) ===');
    expect(text).toContain('TOP QUESTIONS TO DISCUSS:');
    expect(text).toContain('RED FLAGS RULED OUT:');
    expect(text).toContain('INTEGRITY SEAL:');
  });
});
