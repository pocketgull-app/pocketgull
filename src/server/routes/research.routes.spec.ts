import { createResearchRouter } from './research.routes';
import type { Request, Response } from 'express';

function createMockReqRes(body: Record<string, unknown> = {}, query: Record<string, string> = {}) {
  const req = {
    body,
    query,
    headers: { origin: 'https://pocketgull.app' },
    protocol: 'https',
    get: vi.fn(() => 'pocketgull.app')
  } as unknown as Request;

  let statusCode = 200;
  let jsonPayload: Record<string, unknown> | null = null;

  const res = {
    status: vi.fn((code: number) => {
      statusCode = code;
      return res;
    }),
    json: vi.fn((payload: Record<string, unknown>) => {
      jsonPayload = payload;
      return res;
    }),
    getStatus: () => statusCode,
    getJson: () => jsonPayload
  } as unknown as Response & { getStatus: () => number; getJson: () => Record<string, unknown> };

  return { req, res };
}

describe('Research Routes (/api/research)', () => {
  const router = createResearchRouter();

  // Extract handlers from router stack
  const getCohortsHandler = (router.stack.find((layer: any) => layer.route?.path === '/cohorts')?.route?.stack.slice(-1)[0] as any)?.handle;
  const enrollHandler = (router.stack.find((layer: any) => layer.route?.path === '/enroll')?.route?.stack.slice(-1)[0] as any)?.handle;
  const policyHandler = (router.stack.find((layer: any) => layer.route?.path === '/policy')?.route?.stack.slice(-1)[0] as any)?.handle;
  const stripeConnectLinkHandler = (router.stack.find((layer: any) => layer.route?.path === '/payout/stripe-connect-link')?.route?.stack.slice(-1)[0] as any)?.handle;
  const disburseHandler = (router.stack.find((layer: any) => layer.route?.path === '/payout/disburse')?.route?.stack.slice(-1)[0] as any)?.handle;
  const getBigQueryDatasetsHandler = (router.stack.find((layer: any) => layer.route?.path === '/bigquery/datasets')?.route?.stack.slice(-1)[0] as any)?.handle;
  const getBigQueryCrosswalkHandler = (router.stack.find((layer: any) => layer.route?.path === '/bigquery/crosswalk')?.route?.stack.slice(-1)[0] as any)?.handle;
  const getUnicefBenchmarksHandler = (router.stack.find((layer: any) => layer.route?.path === '/unicef/benchmarks')?.route?.stack.slice(-1)[0] as any)?.handle;
  const getMimicBenchmarkHandler = (router.stack.find((layer: any) => layer.route?.path === '/mimic-benchmark')?.route?.stack.slice(-1)[0] as any)?.handle;

  it('GET /api/research/cohorts should return accredited disease cohorts with k-anonymity scores and zero compensation', () => {
    const { req, res } = createMockReqRes();
    getCohortsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const data = res.getJson();
    expect(data['success']).toBe(true);
    const cohorts = data['cohorts'] as Array<Record<string, unknown>>;
    expect(cohorts.length).toBeGreaterThanOrEqual(5);
    expect(Number(cohorts[0]['kAnonymityScore'])).toBeGreaterThanOrEqual(8);
    expect(cohorts[0]['studyFundingModel']).toBe('open_science_commons');
    expect(cohorts[0]['grantEscrowStatus']).toBe('pure_open_science');
    expect(cohorts[0]['compensationPerQueryUsd']).toBe(0.00);
  });

  it('POST /api/research/enroll should validate digital signature and return authorization hash', () => {
    const { req, res } = createMockReqRes({
      patientId: 'patient_alpha',
      cohortIds: ['cohort_diabetes_cgm'],
      signatureName: 'Dr. Jane Doe'
    });
    enrollHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const data = res.getJson();
    expect(data['success']).toBe(true);
    expect(String(data['authorizationSignatureHash'])).toMatch(/^sha256_/);
  });

  it('GET /api/research/policy should enforce Belmont Report open science framework', () => {
    const { req, res } = createMockReqRes();
    policyHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const data = res.getJson();
    expect(data['success']).toBe(true);
    expect(data['model']).toBe('open_science_commons');
    expect(data['escrowEnforced']).toBe(true);
    expect(String(data['payoutPolicy'])).toContain('Pure Open Science');
  });

  describe('Stripe Connect Express Onboarding & Instant Payouts', () => {
    it('POST /payout/stripe-connect-link should generate valid Express onboarding link', () => {
      const { req, res } = createMockReqRes({
        patientId: 'patient_p001',
        email: 'patient@example.com'
      });

      stripeConnectLinkHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.getJson();
      expect(data['success']).toBe(true);
      expect(String(data['accountId'])).toMatch(/^acct_express_/);
      expect(String(data['onboardingUrl'])).toContain('connect.stripe.com/express/oauth/authorize');
    });

    it('POST /payout/stripe-connect-link should reject missing patientId or email', () => {
      const { req, res } = createMockReqRes({ patientId: '' });
      stripeConnectLinkHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      const data = res.getJson();
      expect(data['error']).toContain('Missing required fields');
    });

    it('POST /payout/disburse should disburse payouts < $500 without mandatory dual custody', () => {
      const { req, res } = createMockReqRes({
        patientId: 'patient_p001',
        amountUsd: 45.0,
        destinationStripeAccountId: 'acct_123'
      });

      disburseHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.getJson();
      expect(data['success']).toBe(true);
      expect(String(data['transferId'])).toMatch(/^tr_/);
      expect(data['dualCustodyAttestation']).toBeNull();
      expect(data['status']).toBe('paid_out');
    });

    it('POST /payout/disburse should reject disbursements >= $500 lacking dual-custody authorization', () => {
      const { req, res } = createMockReqRes({
        patientId: 'patient_p001',
        amountUsd: 750.0,
        destinationStripeAccountId: 'acct_123'
      });

      disburseHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      const data = res.getJson();
      expect(data['code']).toBe('DUAL_CUSTODY_REQUIRED');
    });

    it('POST /payout/disburse should reject identical requestor and authorizer roles (role separation violation)', () => {
      const { req, res } = createMockReqRes({
        patientId: 'patient_p001',
        amountUsd: 800.0,
        destinationStripeAccountId: 'acct_123',
        requestorRole: 'COMPLIANCE_OFFICER',
        authorizerRole: 'COMPLIANCE_OFFICER'
      });

      disburseHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      const data = res.getJson();
      expect(data['code']).toBe('DUAL_CUSTODY_ROLE_SEPARATION_FAILED');
    });

    it('POST /payout/disburse should accept disbursements >= $500 when distinct clinical/executive roles sign', () => {
      const { req, res } = createMockReqRes({
        patientId: 'patient_p001',
        amountUsd: 1250.0,
        destinationStripeAccountId: 'acct_123',
        requestorRole: 'CLINICAL_INVESTIGATOR',
        authorizerRole: 'COMPLIANCE_OFFICER'
      });

      disburseHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.getJson();
      expect(data['success']).toBe(true);
      expect(String(data['transferId'])).toMatch(/^tr_/);
      expect(String(data['dualCustodyAttestation'])).toContain('seal_sha256_');
      expect(data['amountUsd']).toBe(1250.0);
    });
  });

  describe('BigQuery Public Health Data Endpoints', () => {
    it('GET /api/research/bigquery/datasets should return public datasets and supported cohorts', () => {
      const { req, res } = createMockReqRes();
      getBigQueryDatasetsHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.getJson();
      expect(data['success']).toBe(true);
      expect(Number(data['count'])).toBeGreaterThanOrEqual(6);
      const datasets = data['datasets'] as Array<Record<string, unknown>>;
      expect(datasets.some(d => d['id'] === 'nih_clinical_trials')).toBe(true);
      expect(datasets.some(d => d['id'] === 'cms_synthetic_omop')).toBe(true);
      expect(datasets.some(d => d['id'] === 'epa_air_quality')).toBe(true);
    });

    it('GET /api/research/bigquery/crosswalk should generate federated crosswalk SQL', () => {
      const { req, res } = createMockReqRes({}, { cohortId: 'cohort_diabetes_cgm', targetDataset: 'nih_clinical_trials' });
      getBigQueryCrosswalkHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.getJson();
      expect(data['success']).toBe(true);
      expect(data['targetDataset']).toBe('nih_clinical_trials');
      expect(String(data['crosswalkSql'])).toContain('bigquery-public-data.nih_clinical_trials');
      expect(data['kAnonymityFloor']).toBe(8);
      expect(data['partitionHygieneDays']).toBe(7);
    });

    it('GET /api/research/bigquery/crosswalk should reject invalid target dataset', () => {
      const { req, res } = createMockReqRes({}, { cohortId: 'cohort_diabetes_cgm', targetDataset: 'invalid_target' });
      getBigQueryCrosswalkHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      const data = res.getJson();
      expect(data['error']).toContain('Invalid targetDataset');
    });
  });

  describe('UNICEF Global Benchmarks Endpoints', () => {
    it('GET /api/research/unicef/benchmarks should return active region and SDMX endpoint', () => {
      const { req, res } = createMockReqRes();
      getUnicefBenchmarksHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.getJson();
      expect(data['success']).toBe(true);
      expect(data['activeRegion']).toBe('GLOBAL');
      expect(String(data['sdmxEndpoint'])).toContain('sdmx.data.unicef.org');
      const profile = data['benchmarkProfile'] as Record<string, unknown>;
      expect(Number(profile['underFiveMortalityRatePer1k'])).toBeGreaterThan(0);
    });

    it('GET /api/research/unicef/benchmarks?region=SSA_WEST_CENTRAL should return West/Central Africa profile', () => {
      const { req, res } = createMockReqRes({}, { region: 'SSA_WEST_CENTRAL' });
      getUnicefBenchmarksHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.getJson();
      expect(data['success']).toBe(true);
      expect(data['activeRegion']).toBe('SSA_WEST_CENTRAL');
      const profile = data['benchmarkProfile'] as Record<string, unknown>;
      expect(profile['regionName']).toContain('West & Central');
    });
  });

  describe('MIMIC-IV & CMS OMOP Conformal Sepsis Benchmark Endpoint', () => {
    it('GET /api/research/mimic-benchmark should return full preprint model comparison and BigQuery SQL', () => {
      const { req, res } = createMockReqRes();
      getMimicBenchmarkHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.getJson();
      expect(data['success']).toBe(true);
      expect(data['activeCohort']).toBe('MULTI_CENTER_COMBINED');
      expect(data['cohortInfo']).toBeDefined();
      expect(data['modelComparisons']).toBeDefined();
      expect(data['fatigueReduction']).toBeDefined();
      expect(data['preprintMetadata']).toBeDefined();
      expect(data['bigQuerySql']).toContain('physionet-data.mimiciv_derived');
    });

    it('GET /api/research/mimic-benchmark?cohort=MIMIC_IV_ICU should return PhysioNet ICU specific cohort', () => {
      const { req, res } = createMockReqRes({}, { cohort: 'MIMIC_IV_ICU' });
      getMimicBenchmarkHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.getJson();
      expect(data['success']).toBe(true);
      expect(data['activeCohort']).toBe('MIMIC_IV_ICU');
      const cohortInfo = data['cohortInfo'] as Record<string, unknown>;
      expect(cohortInfo['cohortName']).toContain('MIMIC-IV');
    });
  });
});
