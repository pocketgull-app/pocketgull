import { ClinicalBiochemistryService } from '../src/services/clinical-biochemistry.service';

describe('ClinicalBiochemistryService & Continuous Lactate Sensing', () => {
  let service: ClinicalBiochemistryService;

  beforeEach(() => {
    service = new ClinicalBiochemistryService();
  });

  it('should accurately categorize resting baseline lactate (1.0 mmol/L)', () => {
    const res = service.calculateContinuousLactateDynamics(1.0, 0.887);
    expect(res.lactateMmolL).toBe(1.0);
    expect(res.metabolicZone).toBe('Zone 1 (Baseline / Rest)');
    expect(res.clinicalSeverity).toBe('Normal Baseline');
    expect(res.mitochondrialClearanceCapacityPct).toBeGreaterThan(70);
  });

  it('should identify Zone 2 FatMax optimal mitochondrial clearance (1.7 mmol/L)', () => {
    const res = service.calculateContinuousLactateDynamics(1.7, 0.92);
    expect(res.metabolicZone).toBe('Zone 2 (FatMax / Optimal Mitochondrial Clearance)');
    expect(res.clinicalSeverity).toBe('Optimal Zone 2 Endurance');
    expect(res.recommendation).toContain('Peak lipid oxidation');
  });

  it('should detect anaerobic threshold inflexion in Zone 3 (3.2 mmol/L)', () => {
    const res = service.calculateContinuousLactateDynamics(3.2, 0.85);
    expect(res.metabolicZone).toBe('Zone 3 (Lactate Inflexion)');
    expect(res.clinicalSeverity).toBe('Metabolic Glycolytic Stress');
  });

  it('should trigger critical hyperlactatemia sepsis alert for critical lactate (8.5 mmol/L)', () => {
    const res = service.calculateContinuousLactateDynamics(8.5, 0.70);
    expect(res.metabolicZone).toBe('Critical Lactic Acidosis (Tissue Hypoperfusion Risk)');
    expect(res.clinicalSeverity).toBe('Critical Hyperlactatemia (Sepsis / Ischemia Alert)');
    expect(res.recommendation).toContain('qSOFA sepsis criteria');
  });
});
