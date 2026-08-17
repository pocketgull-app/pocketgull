import { TestBed } from '@angular/core/testing';
import { ClinicalSteeringCommitteeDossierService } from './clinical-steering-committee-dossier.service';

describe('ClinicalSteeringCommitteeDossierService', () => {
  let service: ClinicalSteeringCommitteeDossierService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClinicalSteeringCommitteeDossierService]
    });
    service = TestBed.inject(ClinicalSteeringCommitteeDossierService);
  });

  it('should initialize with empty active dossiers', () => {
    expect(service.totalDossiersCount()).toBe(0);
    expect(service.selectedDossier()).toBeNull();
  });

  it('should generate a comprehensive Steering Committee Governance Dossier', () => {
    const dossier = service.generateGovernanceDossier({
      institutionName: 'Stanford Healthcare Consortia',
      reportingQuarter: '2026-Q3',
      totalConsults: 20000,
      saveToState: true
    });

    expect(dossier).toBeDefined();
    expect(dossier.institutionName).toBe('Stanford Healthcare Consortia');
    expect(dossier.reportingQuarter).toBe('2026-Q3');
    expect(dossier.fdaSection520oComplianceScore).toBeGreaterThanOrEqual(99);
    expect(dossier.cochraneEvidenceTiers.tierA_RCTsPercent).toBeGreaterThan(70);
    expect(dossier.sdohEquityAudits.length).toBeGreaterThanOrEqual(4);
    expect(dossier.regulatoryComplianceMatrix.length).toBeGreaterThanOrEqual(5);
    expect(dossier.hipaaSafeHarborZeroRetentionVerified).toBe(true);
    expect(service.totalDossiersCount()).toBe(1);
  });

  it('should verify optimal parity across all SDoH equity cohorts', () => {
    const dossier = service.generateGovernanceDossier();
    for (const audit of dossier.sdohEquityAudits) {
      expect(audit.parityRatio).toBeGreaterThanOrEqual(0.80);
      expect(audit.parityRatio).toBeLessThanOrEqual(1.25);
      expect(audit.status).toBe('OPTIMAL_PARITY');
    }
  });
});
