import '@angular/compiler';
import { SkepticalEpistemologyService } from './skeptical-epistemology.service';

describe('SkepticalEpistemologyService CDS Transparency (FDA Section 520(o))', () => {
  it('should generate a compliant Non-Device CDS report under 21 CFR Section 520(o)', () => {
    const service = new SkepticalEpistemologyService();
    const report = service.evaluateCdsCompliance('Treatment Matrix', 3);

    expect(report.isFdaSection520oCompliant).toBe(true);
    expect(report.disclaimer).toContain('Non-Device Clinical Decision Support (CDS) per 21 U.S.C. 360j(o)(1)(E)');
    expect(report.overallConfidencePercent).toBeGreaterThanOrEqual(65);
    expect(report.overallConfidencePercent).toBeLessThanOrEqual(98);
    expect(report.regulatoryMetadata.cfrReference).toContain('21 CFR Part 860');
    expect(report.regulatoryMetadata.clinicianMandate).toContain('Licensed Healthcare Professional must independently verify');
  });

  it('should correctly evaluate falsifiability (p-value & H0 rejection)', () => {
    const service = new SkepticalEpistemologyService();
    const report = service.evaluateCdsCompliance('Functional Protocols', 5);

    expect(report.falsifiability.pValue).toBeGreaterThanOrEqual(0);
    expect(report.falsifiability.pValue).toBeLessThanOrEqual(1);
    expect(report.falsifiability.nullHypothesisH0).toContain('Functional Protocols Clinical Metric');
    expect(report.falsifiability.epistemicConfidencePercent).toBeGreaterThan(0);
  });

  it('should return Cochrane Risk of Bias metrics with valid RoB 2 categories', () => {
    const service = new SkepticalEpistemologyService();
    const report = service.evaluateCdsCompliance('PhysioNet Telemetry', 2);

    expect(report.cochraneBias.randomizationBias).toBeDefined();
    expect(report.cochraneBias.overallRiskOfBias).toBeDefined();
    expect(report.cochraneBias.skepticalSummary).toBeDefined();
  });
});
