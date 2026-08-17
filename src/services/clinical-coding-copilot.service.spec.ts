import { TestBed } from '@angular/core/testing';
import { ClinicalCodingCopilotService } from './clinical-coding-copilot.service';
import { SnomedIcdCrosswalkService } from './snomed-icd-crosswalk.service';

describe('ClinicalCodingCopilotService (HIM & Clinical Coder Copilot)', () => {
  let service: ClinicalCodingCopilotService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClinicalCodingCopilotService, SnomedIcdCrosswalkService]
    });
    service = TestBed.inject(ClinicalCodingCopilotService);
  });

  it('should initialize with null audit report', () => {
    expect(service.activeAuditReport()).toBeNull();
    expect(service.totalRafScore()).toBe(0);
    expect(service.totalWorkRvus()).toBe(0);
  });

  it('should extract Diabetic Neuropathy ICD-10, SNOMED 44054006, and HCC 37 from clinical note', () => {
    const note = 'Patient with long standing T2DM presenting with bilateral foot tingling, diagnosed with diabetic neuropathy. Heart failure with reduced ejection fraction 30%.';
    const report = service.auditChartText(note, 'p_test_99');

    expect(report.suggestions.length).toBeGreaterThanOrEqual(2);

    const dmCode = report.suggestions.find(s => s.code === 'E11.40');
    expect(dmCode).toBeDefined();
    expect(dmCode?.snomedCode).toBe('44054006');
    expect(dmCode?.hccCategory).toContain('HCC 37');
    expect(dmCode?.rafWeight).toBeGreaterThan(0.2);
    expect(dmCode?.loincCode).toBe('4548-4');

    const chfCode = report.suggestions.find(s => s.code === 'I50.22');
    expect(chfCode).toBeDefined();
    expect(chfCode?.snomedCode).toBe('88805009');
    expect(chfCode?.hccCategory).toContain('HCC 226');
    expect(chfCode?.cptCodes).toContain('93306');
  });

  it('should calculate E/M MDM Level and Work RVUs based on clinical complexity', () => {
    const complexNote = 'Patient with heart failure, diabetic neuropathy, chronic kidney disease stage 4, and severe food insecurity.';
    const report = service.auditChartText(complexNote, 'p_complex_patient');

    expect(report.mdmAudit.emLevel).toBe('99215');
    expect(report.mdmAudit.mdmLevel).toBe('HIGH');
    expect(report.mdmAudit.workRvu).toBeGreaterThan(3.0);
    expect(report.totalEstimatedReimbursement).toBeGreaterThan(100);
  });

  it('should calculate RAF and reimbursement dynamically as codes are accepted', () => {
    const note = 'Patient has diabetic neuropathy and CKD stage 4.';
    service.auditChartText(note);

    expect(service.totalAcceptedRafScore()).toBe(0); // None accepted yet

    const report = service.activeAuditReport()!;
    service.acceptCode(report.suggestions[0].id);

    expect(service.totalAcceptedRafScore()).toBeGreaterThan(0);
    expect(service.totalWorkRvus()).toBeGreaterThan(0);
  });

  it('should export valid FHIR R4 Claim Bundle for active suggestions', () => {
    const note = 'Patient with hypertension and chronic systolic heart failure.';
    service.auditChartText(note, 'p_fhir_test');
    service.acceptAll();

    const bundle = service.exportFhirR4ClaimBundle();
    expect(bundle).not.toBeNull();
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.entry.length).toBeGreaterThanOrEqual(1);
    expect(bundle.entry[0].resource.resourceType).toBe('Condition');
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

