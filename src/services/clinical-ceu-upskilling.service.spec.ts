import { TestBed } from '@angular/core/testing';
import { ClinicalCeuUpskillingService } from './clinical-ceu-upskilling.service';

describe('ClinicalCeuUpskillingService (AAPC & AHIMA CEU Engine)', () => {
  let service: ClinicalCeuUpskillingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClinicalCeuUpskillingService]
    });
    service = TestBed.inject(ClinicalCeuUpskillingService);
  });

  it('should initialize with predefined specialty micro-credential tracks', () => {
    expect(service.tracks().length).toBe(3);
    expect(service.totalCompletedCredits()).toBeGreaterThanOrEqual(12);
  });

  it('should increment chart counts and hours when logging an audit session', () => {
    const initialCharts = service.totalChartsAudited();
    const initialHours = service.totalCeuHoursLogged();

    service.logAuditSession(2, 30); // 2 charts, 30 mins = 0.5 hours

    expect(service.totalChartsAudited()).toBe(initialCharts + 2);
    expect(service.totalCeuHoursLogged()).toBeCloseTo(initialHours + 0.5, 2);
  });

  it('should generate official verifiable CEU certificate with hash', () => {
    const cert = service.issueCertificate('track-ai-cdis', 'Sarah Jenkins, RHIA');

    expect(cert.certificateId).toContain('CEU-AHIMA-');
    expect(cert.recipientName).toBe('Sarah Jenkins, RHIA');
    expect(cert.ceuCreditsAwarded).toBe(12.0);
    expect(cert.verificationHash).toMatch(/^0x[0-9a-f]+/);
    expect(service.activeCertificates().length).toBe(1);
  });
});
