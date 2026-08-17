import { TestBed } from '@angular/core/testing';
import { ClinicalCodingCopilotService } from './clinical-coding-copilot.service';

describe('ClinicalCodingCopilotService (HIM & Clinical Coder Copilot)', () => {
  let service: ClinicalCodingCopilotService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClinicalCodingCopilotService]
    });
    service = TestBed.inject(ClinicalCodingCopilotService);
  });

  it('should initialize with null audit report', () => {
    expect(service.activeAuditReport()).toBeNull();
    expect(service.totalRafScore()).toBe(0);
  });

  it('should extract Diabetic Neuropathy ICD-10 and HCC 37 from clinical note', () => {
    const note = 'Patient with long standing T2DM presenting with bilateral foot tingling, diagnosed with diabetic neuropathy. Heart failure with reduced ejection fraction 30%.';
    const report = service.auditChartText(note, 'p_test_99');

    expect(report.suggestions.length).toBeGreaterThanOrEqual(2);

    const dmCode = report.suggestions.find(s => s.code === 'E11.40');
    expect(dmCode).toBeDefined();
    expect(dmCode?.hccCategory).toContain('HCC 37');
    expect(dmCode?.rafWeight).toBeGreaterThan(0.2);

    const chfCode = report.suggestions.find(s => s.code === 'I50.22');
    expect(chfCode).toBeDefined();
    expect(chfCode?.hccCategory).toContain('HCC 226');
  });

  it('should calculate RAF score dynamically as codes are accepted', () => {
    const note = 'Patient has T2DM with diabetic neuropathy and CKD stage 4.';
    service.auditChartText(note);

    expect(service.totalRafScore()).toBe(0); // Pending initially

    const report = service.activeAuditReport()!;
    service.acceptCode(report.suggestions[0].id);

    expect(service.totalRafScore()).toBeGreaterThan(0);
  });

  it('should generate 1-click Denial Defense dossier packet with CMS-HCC evidence', () => {
    const note = 'Chronic systolic heart failure with severe food insecurity noted.';
    service.auditChartText(note);
    service.acceptAll();

    const dossier = service.generateDenialDefensePacket();
    expect(dossier).toContain('CLINICAL CODING & AUDIT DEFENSE JUSTIFICATION DOSSIER');
    expect(dossier).toContain('I50.22');
    expect(dossier).toContain('Z59.41');
    expect(dossier).toContain('HIM AUDITOR ATTESTATION');
  });
});
