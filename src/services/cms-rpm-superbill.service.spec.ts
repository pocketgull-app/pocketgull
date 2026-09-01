import '@angular/compiler';
import { CmsRpmSuperbillService } from './cms-rpm-superbill.service';

describe('CmsRpmSuperbillService', () => {
  let service: CmsRpmSuperbillService;

  beforeEach(() => {
    service = new CmsRpmSuperbillService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate a 30-day compliance calendar and verify 16-day transmission requirement', () => {
    const calendar = service.generateComplianceCalendar([]);
    expect(calendar.length).toBe(30);
    const qualifyingCount = calendar.filter(c => c.hasReading).length;
    expect(qualifyingCount).toBeGreaterThanOrEqual(16);
  });

  it('should map relevant ICD-10 diagnosis codes from patient conditions', () => {
    const mappings = service.mapIcd10Diagnoses({
      id: 'p_test',
      name: 'Test',
      preexistingConditions: ['Hypertension', 'Diabetes'],
      symptoms: [],
      history: []
    } as any);

    expect(mappings.some(m => m.code === 'I10')).toBe(true);
    expect(mappings.some(m => m.code === 'E11.9')).toBe(true);
    expect(mappings[0].isPrimary).toBe(true);
  });

  it('should generate a complete CMS Superbill with compliant claim codes and reimbursement', () => {
    const superbill = service.generateSuperbill(25);
    expect(superbill.claimId).toContain('CLM-RPM-');
    expect(superbill.isCompliant16DayRule).toBe(true);
    expect(superbill.totalEstimatedReimbursementUsd).toBeGreaterThan(100);
    expect(superbill.claimCodes.some(c => c.cptCode === '99454')).toBe(true);
    expect(superbill.claimCodes.some(c => c.cptCode === '99457')).toBe(true);
    expect(superbill.integritySealSha256).toBeDefined();
  });

  it('should export a compliant FHIR R4 Claim bundle resource', () => {
    const superbill = service.generateSuperbill(25);
    const fhirClaim = service.exportFhirR4Claim(superbill);
    expect(fhirClaim['resourceType']).toBe('Claim');
    expect(fhirClaim['use']).toBe('claim');
    expect(fhirClaim['patient']).toBeDefined();
    expect(Array.isArray(fhirClaim['diagnosis'])).toBe(true);
    expect(Array.isArray(fhirClaim['item'])).toBe(true);
  });
});
