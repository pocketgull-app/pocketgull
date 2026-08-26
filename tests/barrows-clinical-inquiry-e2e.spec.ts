import { describe, it, expect, beforeEach } from 'vitest';
import { BarrowsClinicalInquiryService } from '../src/services/barrows-clinical-inquiry.service';

describe('Barrows Clinical Inquiry & Epistemological Handoff (E2E Integration)', () => {
  let service: BarrowsClinicalInquiryService;

  beforeEach(() => {
    service = new BarrowsClinicalInquiryService();
  });

  it('should guide a patient through hypothetico-deductive reasoning without catastrophizing', () => {
    // 1. Initial State: Multi-hypothesis generation
    const initialHypotheses = service.hypotheses();
    expect(initialHypotheses.length).toBe(3);

    // 2. Patient tests mechanistic / autonomic hypothesis
    const hypoAutonomic = initialHypotheses.find(h => h.id === 'hypo-1');
    expect(hypoAutonomic).toBeDefined();
    expect(hypoAutonomic?.falsificationQuestion).toContain('4-7-8 diaphragmatic breathing');

    // 3. User verifies recovery with parasympathetic breathing
    service.testFalsificationQuestion('hypo-1', 'YES');
    const updatedHypo1 = service.hypotheses().find(h => h.id === 'hypo-1');
    expect(updatedHypo1?.falsificationStatus).toBe('SUPPORTED');
    expect(updatedHypo1?.likelihoodScore).toBeGreaterThanOrEqual(0.90);

    // 4. User refutes micronutrient hypothesis
    service.testFalsificationQuestion('hypo-2', 'NO');
    const updatedHypo2 = service.hypotheses().find(h => h.id === 'hypo-2');
    expect(updatedHypo2?.falsificationStatus).toBe('REFUTED');
    expect(updatedHypo2?.likelihoodScore).toBeLessThan(0.30);

    // 5. Living Problem Board is partitioned into Drivers, Adaptations, and Reserves
    const board = service.livingProblemList();
    expect(board.activeDrivers[0].priority).toBe('HIGH');
    expect(board.compensatoryResponses[0].autonomicState).toBe('SYMPATHETIC_DOMINANT');
    expect(board.protectiveStrengths[0].vagalResilienceScore).toBeGreaterThanOrEqual(80);

    // 6. Clinician Brief produces a 60-second doctor handoff with 3 precise questions
    const brief = service.clinicianBrief();
    expect(brief.topQuestionsForPhysician.length).toBe(3);
    expect(brief.topQuestionsForPhysician[0]).toContain('fasting ferritin');
    expect(brief.fourteenDayTrends.length).toBe(3);
    expect(brief.redFlagsRuledOut.length).toBe(3);
    expect(brief.integrityHash).toContain('SHA256:BARROWS-');

    // 7. Plain text export formatted for clinical appointment
    const exportText = service.exportDoctorBriefAsText();
    expect(exportText).toContain('POCKETGULL CLINICIAN CONSULTATION BRIEF');
    expect(exportText).toContain('PRIMARY WORKING HYPOTHESIS:');
  });
});
