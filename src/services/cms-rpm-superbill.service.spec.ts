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

  it('should toggle day transmission state and update customDayOverrides', () => {
    const calendar = service.generateComplianceCalendar([]);
    const firstDay = calendar[0];
    const originalState = firstDay.hasReading;

    service.toggleDayTransmission(firstDay.date);
    const updatedCalendar = service.generateComplianceCalendar([]);
    const updatedDay = updatedCalendar.find(d => d.date === firstDay.date);

    expect(updatedDay?.hasReading).toBe(!originalState);
  });

  it('should enforce the CMS 16-day statutory boundary condition for CPT 99454', () => {
    // Generate base calendar
    const calendar = service.generateComplianceCalendar([]);
    
    // Force transmissions to be fewer than 16 days (e.g. exactly 10 days)
    calendar.forEach((day, index) => {
      service.customDayOverrides.update(prev => ({
        ...prev,
        [day.date]: index < 10
      }));
    });

    const nonCompliantSuperbill = service.generateSuperbill();
    expect(nonCompliantSuperbill.qualifyingDaysCount).toBe(10);
    expect(nonCompliantSuperbill.isCompliant16DayRule).toBe(false);

    const cpt99454NonCompliant = nonCompliantSuperbill.claimCodes.find(c => c.cptCode === '99454');
    expect(cpt99454NonCompliant?.isEligible).toBe(false);
    expect(cpt99454NonCompliant?.totalUsd).toBe(0);
    expect(cpt99454NonCompliant?.complianceRule).toContain('Non-compliant');

    // Now force transmissions to 16 days
    calendar.forEach((day, index) => {
      service.customDayOverrides.update(prev => ({
        ...prev,
        [day.date]: index < 16
      }));
    });

    const compliantSuperbill = service.generateSuperbill();
    expect(compliantSuperbill.qualifyingDaysCount).toBe(16);
    expect(compliantSuperbill.isCompliant16DayRule).toBe(true);

    const cpt99454Compliant = compliantSuperbill.claimCodes.find(c => c.cptCode === '99454');
    expect(cpt99454Compliant?.isEligible).toBe(true);
    expect(cpt99454Compliant?.totalUsd).toBe(48.56);
    expect(cpt99454Compliant?.complianceRule).toContain('CMS 16-Day Statutory Rule Satisfied');
  });

  it('should correctly scale care management codes (CPT 99457 & CPT 99458) based on clinical minutes', () => {
    // 0 minutes: Neither 99457 nor 99458
    service.setClinicalMinutes(0);
    const bill0 = service.generateSuperbill();
    expect(bill0.claimCodes.some(c => c.cptCode === '99457')).toBe(false);
    expect(bill0.claimCodes.some(c => c.cptCode === '99458')).toBe(false);

    // 20 minutes: 99457 (1 unit), no 99458
    service.setClinicalMinutes(20);
    const bill20 = service.generateSuperbill();
    const cpt99457_20 = bill20.claimCodes.find(c => c.cptCode === '99457');
    expect(cpt99457_20?.units).toBe(1);
    expect(cpt99457_20?.totalUsd).toBe(50.18);
    expect(bill20.claimCodes.some(c => c.cptCode === '99458')).toBe(false);

    // 40 minutes: 99457 (1 unit) + 99458 (1 unit)
    service.setClinicalMinutes(40);
    const bill40 = service.generateSuperbill();
    const cpt99458_40 = bill40.claimCodes.find(c => c.cptCode === '99458');
    expect(cpt99458_40?.units).toBe(1);
    expect(cpt99458_40?.totalUsd).toBe(39.86);

    // 60 minutes: 99457 (1 unit) + 99458 (2 units)
    service.setClinicalMinutes(60);
    const bill60 = service.generateSuperbill();
    const cpt99458_60 = bill60.claimCodes.find(c => c.cptCode === '99458');
    expect(cpt99458_60?.units).toBe(2);
    expect(cpt99458_60?.totalUsd).toBe(79.72);
  });

  it('should clamp clinical minutes within [0, 300]', () => {
    service.setClinicalMinutes(-10);
    expect(service.clinicalMinutesSpent()).toBe(0);

    service.setClinicalMinutes(500);
    expect(service.clinicalMinutesSpent()).toBe(300);
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

  it('should fallback to R03.0 when no specific preexisting conditions match', () => {
    const mappings = service.mapIcd10Diagnoses({
      id: 'p_test_none',
      name: 'No Match',
      preexistingConditions: [],
      symptoms: [],
      history: []
    } as any);

    expect(mappings.length).toBe(1);
    expect(mappings[0].code).toBe('R03.0');
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

  it('should generate a standardized EHR clinical SOAP/RPM note with statutory grounding and cryptographic seal', () => {
    const superbill = service.generateSuperbill(25);
    const note = service.generateEhrClinicalNote(superbill);

    expect(note).toContain('CMS REMOTE PHYSIOLOGIC MONITORING (RPM) MONTHLY ATTESTATION NOTE');
    expect(note).toContain(superbill.claimId);
    expect(note).toContain('42 CFR § 410.78');
    expect(note).toContain('CPT 99454');
    expect(note).toContain('CPT 99457');
    expect(note).toContain('FDA 21 CFR Part 11 & NIST SP 800-90A');
    expect(note).toContain(superbill.integritySealSha256);
  });

  it('should maintain a reactive rpmSummary computed signal for top-bar telemetry', () => {
    service.setClinicalMinutes(20);
    const summary = service.rpmSummary();

    expect(summary.totalDays).toBe(30);
    expect(summary.qualifyingDays).toBeGreaterThan(0);
    expect(summary.clinicalMinutes).toBe(20);
    expect(typeof summary.isCompliant).toBe('boolean');
    expect(summary.statusBadge).toContain('/16d');
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
