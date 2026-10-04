import { TestBed } from '@angular/core/testing';
import { UnicefOpenDataService } from './unicef-open-data.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

describe('UnicefOpenDataService Unit Suite', () => {
  let service: UnicefOpenDataService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UnicefOpenDataService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(UnicefOpenDataService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('1. Initializes with standard UNICEF dataflows (NUTRITION, CME, IMMUNISATION, MNCH, WASH, ECD)', () => {
    expect(service.dataflows.length).toBeGreaterThanOrEqual(6);
    const nutrition = service.dataflows.find(d => d.id === 'NUTRITION');
    expect(nutrition).toBeDefined();
    expect(nutrition?.agencyId).toBe('UNICEF');
    expect(nutrition?.defaultIndicators).toContain('NT_ANT_WH_Z_3');
  });

  it('2. Exposes core public health indicators with SDG alignment', () => {
    const stunting = service.coreIndicators.find(i => i.code === 'NT_ANT_HA_Z_2');
    expect(stunting).toBeDefined();
    expect(stunting?.sdgMapping).toBe('SDG 2.2.1');

    const u5mr = service.coreIndicators.find(i => i.code === 'CME_MRY0T4');
    expect(u5mr?.sdgMapping).toBe('SDG 3.2.1');

    const dtp1 = service.coreIndicators.find(i => i.code === 'IM_DTP1');
    expect(dtp1?.label).toContain('Zero-Dose');
  });

  it('3. Provides pre-compiled 2024-2026 regional benchmark profiles for offline use', () => {
    expect(service.regionalProfiles.length).toBeGreaterThanOrEqual(6);
    const globalProfile = service.activeRegionalProfile();
    expect(globalProfile.regionCode).toBe('GLOBAL');
    expect(globalProfile.underFiveMortalityRatePer1k).toBeGreaterThan(0);
    expect(globalProfile.zeroDoseChildrenPct).toBeGreaterThan(0);

    service.selectRegion('SSA_WEST_CENTRAL');
    const ssaProfile = service.activeRegionalProfile();
    expect(ssaProfile.regionCode).toBe('SSA_WEST_CENTRAL');
    expect(ssaProfile.priorityInterventions.length).toBeGreaterThan(0);
  });

  describe('UNICEF RUTF Sachet Dosing & SAM Appetite Test Protocol', () => {
    it('4. Correctly doses UNICEF-spec RUTF sachets based on child weight', () => {
      // 4.5 kg child -> 2 sachets/day, 14 sachets/week
      const tier1 = service.rutfDosingTiers.find(t => 4.5 >= t.weightMinKg && 4.5 <= t.weightMaxKg);
      expect(tier1?.sachetsPerDay).toBe(2.0);
      expect(tier1?.sachetsPerWeek).toBe(14);

      // 8.0 kg child -> 3 sachets/day, 21 sachets/week
      const tier2 = service.rutfDosingTiers.find(t => 8.0 >= t.weightMinKg && 8.0 <= t.weightMaxKg);
      expect(tier2?.sachetsPerDay).toBe(3.0);
      expect(tier2?.sachetsPerWeek).toBe(21);

      // 10.0 kg child -> 4 sachets/day, 28 sachets/week
      const tier3 = service.rutfDosingTiers.find(t => 10.0 >= t.weightMinKg && 10.0 <= t.weightMaxKg);
      expect(tier3?.sachetsPerDay).toBe(4.0);
      expect(tier3?.sachetsPerWeek).toBe(28);
    });

    it('5. Enrolls child in Outpatient Therapeutic Program (OTP) when appetite test passes and no complications', () => {
      // 8.0 kg, MUAC 110mm (SAM), no edema, consumed 0.5 sachet (pass), no complications
      const res = service.evaluateSamAppetiteAndTriage(8.0, 110, 'NONE', 0.5, false);
      expect(res.disposition).toBe('OUTPATIENT_THERAPEUTIC_PROGRAM');
      expect(res.therapeuticFeedType).toBe('RUTF_PLUMPYNUT');
      expect(res.dailyRutfSachets).toBe(3.0);
      expect(res.weeklyRutfSachets).toBe(21);
      expect(res.clinicalDirectives.some(d => d.includes('Plumpy\'Nut'))).toBe(true);
    });

    it('6. Escalates to STAT Inpatient Referral (F-75 milk) when appetite test fails', () => {
      // 8.0 kg, MUAC 110mm (SAM), no edema, consumed only 0.1 sachet (<0.25 fail)
      const res = service.evaluateSamAppetiteAndTriage(8.0, 110, 'NONE', 0.1, false);
      expect(res.disposition).toBe('INPATIENT_STABILIZATION_PHASE_1');
      expect(res.appetiteTestPassed).toBe(false);
      expect(res.therapeuticFeedType).toBe('F75_THERAPEUTIC_MILK');
      expect(res.dailyRutfSachets).toBe(0);
      expect(res.clinicalDirectives.some(d => d.includes('F-75'))).toBe(true);
    });

    it('7. Escalates to STAT Inpatient Referral when Grade 3 generalized edema is present', () => {
      // Bilateral pitting edema +++ generalized
      const res = service.evaluateSamAppetiteAndTriage(8.0, 120, 'GRADE_3', 0.5, false);
      expect(res.disposition).toBe('INPATIENT_STABILIZATION_PHASE_1');
      expect(res.therapeuticFeedType).toBe('F75_THERAPEUTIC_MILK');
    });

    it('8. Categorizes MAM correctly into Targeted Supplementary Feeding (TSFP)', () => {
      // MUAC 120 mm (MAM), no edema
      const res = service.evaluateSamAppetiteAndTriage(9.0, 120, 'NONE', 1.0, false);
      expect(res.disposition).toBe('SUPPLEMENTARY_FEEDING_MAM');
      expect(res.dailyRutfSachets).toBe(1);
      expect(res.therapeuticFeedType).toBe('RUSF_SUPPLEMENTARY');
    });

    it('9. Identifies well-nourished child with routine preventive directives', () => {
      // MUAC 130 mm (Normal), no edema
      const res = service.evaluateSamAppetiteAndTriage(11.0, 130, 'NONE', 1.0, false);
      expect(res.disposition).toBe('ROUTINE_PREVENTIVE_CARE');
      expect(res.dailyRutfSachets).toBe(0);
      expect(res.therapeuticFeedType).toBe('NONE');
    });
  });

  describe('UNICEF Zero-Dose Child Screening (IA2030)', () => {
    it('10. Detects Zero-Dose child when infant >= 2 months has missed DTP1', () => {
      const res = service.evaluateZeroDoseStatus(3, false, false, false);
      expect(res.isZeroDose).toBe(true);
      expect(res.statusBadge).toContain('bg-rose-950');
      expect(res.clinicalDirectives.some(d => d.includes('ZERO-DOSE CHILD ALERT'))).toBe(true);
    });

    it('11. Detects Under-Immunized child when DTP1 received but dropped out before DTP3 or MCV1', () => {
      // 6 months old, got DTP1 but missed DTP3
      const res = service.evaluateZeroDoseStatus(6, true, false, false);
      expect(res.isZeroDose).toBe(false);
      expect(res.isUnderImmunized).toBe(true);
      expect(res.clinicalDirectives.some(d => d.includes('UNDER-IMMUNIZED ALERT'))).toBe(true);
    });

    it('12. Confirms on-track status when child received all age-due vaccines', () => {
      const res = service.evaluateZeroDoseStatus(12, true, true, true);
      expect(res.isZeroDose).toBe(false);
      expect(res.isUnderImmunized).toBe(false);
      expect(res.statusBadge).toContain('bg-emerald-950');
    });
  });

  describe('UNICEF SDMX REST API Query Constructor & Fallback', () => {
    it('13. Constructs valid SDMX REST query URLs', () => {
      const url = service.buildSdmxQueryUrl('NUTRITION', 'NER', 'NT_ANT_WH_Z_3');
      expect(url).toContain('https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/data/NUTRITION/NER.NT_ANT_WH_Z_3');
      expect(url).toContain('format=sdmx-json');
    });

    it('14. Gracefully falls back to offline benchmark profile when live API fails', async () => {
      service.selectRegion('SOUTH_ASIA');
      const fetchPromise = service.fetchLiveSdmxData('NUTRITION', 'IND', 'NT_ANT_WH_Z_2');

      const req = httpTesting.expectOne(req => req.url.includes('sdmx.data.unicef.org'));
      req.error(new ProgressEvent('Network error'));

      const result = await fetchPromise;
      expect(result.success).toBe(true);
      expect(result.isFallback).toBe(true);
      expect(service.liveApiError()).toContain('Offline Fallback Active');
      expect(result.data).toEqual(service.activeRegionalProfile());
    });
  });
});
