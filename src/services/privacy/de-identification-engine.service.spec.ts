import { DeIdentificationEngineService } from './de-identification-engine.service';

describe('DeIdentificationEngineService', () => {
  let service: DeIdentificationEngineService;

  beforeEach(() => {
    service = new DeIdentificationEngineService();
  });

  describe('HIPAA § 164.514 Safe Harbor 18-Identifier Stripping', () => {
    it('should strip all 18 categories of direct and indirect identifiers', () => {
      const comprehensiveRawRecord = {
        // 1. Names
        name: 'Eleanor Vance',
        firstName: 'Eleanor',
        lastName: 'Vance',
        // 2. Geographic subdivisions smaller than state
        street: '42 Hill House Lane',
        address: 'Suite 4B',
        city: 'Arkham',
        county: 'Essex',
        precinct: 'Precinct 9',
        zipCode: '01970',
        postalCode: '01970-1234',
        geocode: '42.5195,-70.8967',
        state: 'MA',
        // 3. Dates
        birthDate: '1984-06-15',
        admissionDate: '2026-03-10',
        dischargeDate: '2026-03-14',
        deathDate: '',
        encounterDate: '2026-03-10',
        procedureDate: '2026-03-11',
        // 4. Phone
        phone: '508-555-0144',
        telephone: '508-555-0145',
        mobilePhone: '508-555-0146',
        // 5. Fax
        fax: '508-555-0199',
        // 6. Email
        email: 'eleanor.vance@hillhouse.org',
        // 7. SSN
        ssn: '000-12-3456',
        // 8. MRN
        mrn: 'MRN-889900',
        // 9. Health plan
        healthPlanNumber: 'HP-998811',
        insuranceId: 'INS-4455',
        beneficiaryNumber: 'BEN-1122',
        // 10. Account numbers
        accountNumber: 'ACC-776655',
        billingAccount: 'BILL-3344',
        // 11. Certificates/licenses
        certificateNumber: 'CERT-9900',
        licenseNumber: 'MD-LIC-443322',
        // 12. Vehicles
        vehicleId: 'VEH-9988',
        vin: '1HGCR2F83HA123456',
        licensePlate: '7XYZ89',
        // 13. Devices
        deviceSerial: 'DEV-DEX-88392',
        deviceId: 'UDI-001928374',
        udi: '00884928374619',
        // 14. URLs
        url: 'https://example.com/portal/eleanor',
        webUrl: 'https://example.com/family',
        // 15. IP addresses
        ipAddress: '192.0.2.1',
        ipv4: '198.51.100.24',
        ipv6: '2001:db8::1',
        // 16. Biometrics
        biometricFingerprint: 'FP_SHA256_HASH_99182',
        voicePrint: 'VP_SPECTRAL_VECTOR_3382',
        retinalScan: 'RETINA_SCAN_4492',
        // 17. Full face photos
        photoUrl: 'https://example.com/photos/eleanor.jpg',
        facePhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
        avatarUrl: 'https://example.com/avatar.png',
        // 18. Other identifiers
        customIdentifier: 'CUST-ID-999',
        nationalId: 'US-NAT-119283',
        passportNumber: 'A12345678',
        // Clinical Non-PHI
        gender: 'F',
        biosignals: {
          cgm_glucose_mg_dl: 112.5,
          hrv_rmssd_ms: 38.4
        }
      };

      const result = service.deIdentifyPatientRecord(comprehensiveRawRecord);

      expect(result.studySubjectId).toMatch(/^SUBJ-[0-9a-f]{8}$/);
      expect(result.gender).toBe('F');
      expect(result.stateCode).toBe('MA');
      expect(result.ageBracket).toBe('30-49');
      expect(result.studyDayOffset).toBeGreaterThan(0);
      expect(result.strippedAttributesCount).toBeGreaterThanOrEqual(18);
      expect(result.strippedIdentifiersList).toContain('name');
      expect(result.strippedIdentifiersList).toContain('ssn');
      expect(result.strippedIdentifiersList).toContain('mrn');
      expect(result.strippedIdentifiersList).toContain('ipAddress');
      expect(result.strippedIdentifiersList).toContain('biometricFingerprint');
      expect(result.strippedIdentifiersList).toContain('facePhoto');
      expect(result.strippedIdentifiersList).toContain('deviceSerial');
    });

    it('should cap age > 89 to 90+ bracket per HIPAA Safe Harbor §164.514(b)(2)(i)(C)', () => {
      const elderlyRecord = {
        name: 'Centenarian Patient',
        birthDate: '1925-01-01',
        state: 'OR'
      };

      const deidentified = service.deIdentifyPatientRecord(elderlyRecord);
      expect(deidentified.ageBracket).toBe('90+');
    });

    it('should categorize pediatric age < 18 correctly', () => {
      const pediatricRecord = {
        name: 'Adolescent Patient',
        birthDate: '2015-05-10',
        state: 'CA'
      };

      const deidentified = service.deIdentifyPatientRecord(pediatricRecord);
      expect(deidentified.ageBracket).toBe('<18');
    });
  });

  describe('k-Anonymity Validation Engine (k >= 8)', () => {
    it('should validate single bucket k-anonymity density', () => {
      expect(service.validateKAnonymity(15)).toBe(true);
      expect(service.validateKAnonymity(8)).toBe(true);
      expect(service.validateKAnonymity(7)).toBe(false);
      expect(service.validateKAnonymity(1)).toBe(false);
      expect(service.validateKAnonymity(0)).toBe(false);
    });

    it('should pass cohort-level audit when all equivalence classes satisfy k >= 8', () => {
      const compliantCohort = [
        ...Array.from({ length: 10 }, () => ({ ageBracket: '30-49', gender: 'F', stateCode: 'OR' })),
        ...Array.from({ length: 8 }, () => ({ ageBracket: '50-69', gender: 'M', stateCode: 'WA' })),
        ...Array.from({ length: 12 }, () => ({ ageBracket: '90+', gender: 'F', stateCode: 'CA' }))
      ];

      const audit = service.validateCohortKAnonymity(compliantCohort);

      expect(audit.passed).toBe(true);
      expect(audit.kThreshold).toBe(8);
      expect(audit.totalRecords).toBe(30);
      expect(audit.equivalenceClassesCount).toBe(3);
      expect(audit.minBucketDensity).toBe(8);
      expect(audit.violatingClassesCount).toBe(0);
      expect(audit.violatingClasses).toHaveLength(0);
    });

    it('should fail cohort audit and pinpoint violating classes when a bucket has k < 8', () => {
      const violatingCohort = [
        ...Array.from({ length: 10 }, () => ({ ageBracket: '30-49', gender: 'F', stateCode: 'OR' })),
        // Rare outlier: only 2 records in this demographic partition
        ...Array.from({ length: 2 }, () => ({ ageBracket: '90+', gender: 'M', stateCode: 'AK' }))
      ];

      const audit = service.validateCohortKAnonymity(violatingCohort);

      expect(audit.passed).toBe(false);
      expect(audit.violatingClassesCount).toBe(1);
      expect(audit.minBucketDensity).toBe(2);
      expect(audit.violatingClasses[0].quasiIdentifierKey).toBe('90+::M::AK');
      expect(audit.violatingClasses[0].count).toBe(2);
      expect(audit.violatingClasses[0].deficit).toBe(6);
    });

    it('should return failed audit on empty cohort', () => {
      const audit = service.validateCohortKAnonymity([]);
      expect(audit.passed).toBe(false);
      expect(audit.totalRecords).toBe(0);
    });
  });

  describe('NIST SP 800-90A CSPRNG & Laplace Differential Privacy Perturbation', () => {
    it('should generate unbiased 53-bit floating point numbers in [0, 1)', () => {
      for (let i = 0; i < 50; i++) {
        const val = service.getUnbiasedCspRandomFloat();
        expect(val).toBeGreaterThanOrEqual(0.0);
        expect(val).toBeLessThan(1.0);
      }
    });

    it('should sample zero-mean Laplace noise centering near mu = 0', () => {
      const samples: number[] = [];
      for (let i = 0; i < 200; i++) {
        samples.push(service.sampleLaplaceNoise(0, 1.0));
      }

      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      expect(Math.abs(mean)).toBeLessThan(1.0);
    });

    it('should perturb continuous biosignals while preserving numerical validity', () => {
      const biosignals = {
        cgm_glucose_mg_dl: 120.0,
        hrv_rmssd_ms: 45.0,
        systolic_bp_mmhg: 118.0
      };

      const perturbed = service.perturbBiosignalVector(biosignals, 1.0);

      expect(typeof perturbed['cgm_glucose_mg_dl']).toBe('number');
      expect(Number.isFinite(perturbed['cgm_glucose_mg_dl'])).toBe(true);
      expect(perturbed['cgm_glucose_mg_dl']).not.toBeNaN();
      // Differential privacy noise with b = 1.0 centers near original reading
      expect(perturbed['cgm_glucose_mg_dl']).toBeGreaterThan(80.0);
      expect(perturbed['cgm_glucose_mg_dl']).toBeLessThan(160.0);
    });
  });

  describe('Mathematical Boundedness & Fuzzing Resilience', () => {
    it('should gracefully handle fuzzed and extreme inputs without throwing', () => {
      const fuzzedBiosignals: Record<string, number> = {
        zero: 0,
        negative: -45.6,
        extremeHigh: 1e6,
        fractional: 0.000001,
        nanValue: NaN,
        infiniteValue: Infinity,
        negativeInfinity: -Infinity
      };

      const perturbed = service.perturbBiosignalVector(fuzzedBiosignals, 0.5);

      // Invalid numerical keys must be filtered out
      expect(perturbed['nanValue']).toBeUndefined();
      expect(perturbed['infiniteValue']).toBeUndefined();
      expect(perturbed['negativeInfinity']).toBeUndefined();

      // Valid keys must remain finite numbers
      expect(Number.isFinite(perturbed['zero'])).toBe(true);
      expect(Number.isFinite(perturbed['negative'])).toBe(true);
      expect(Number.isFinite(perturbed['extremeHigh'])).toBe(true);
    });

    it('should withstand non-positive or extreme epsilon values safely', () => {
      const biosignals = { glucose: 100.0 };

      // Negative or zero epsilon falls back safely to DEFAULT_EPSILON
      const perturbedZeroEps = service.perturbBiosignalVector(biosignals, 0);
      expect(Number.isFinite(perturbedZeroEps['glucose'])).toBe(true);

      const perturbedNegEps = service.perturbBiosignalVector(biosignals, -5.0);
      expect(Number.isFinite(perturbedNegEps['glucose'])).toBe(true);

      const perturbedInfiniteEps = service.perturbBiosignalVector(biosignals, Infinity);
      expect(Number.isFinite(perturbedInfiniteEps['glucose'])).toBe(true);
    });
  });
});
