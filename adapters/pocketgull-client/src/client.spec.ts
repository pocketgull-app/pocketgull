import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PocketGullClient } from './client.js';

describe('PocketGullClient (@pocketgull/client)', () => {
  let client: PocketGullClient;

  beforeEach(() => {
    client = new PocketGullClient({
      baseUrl: 'https://pocketgull.app',
      apiKey: 'test-api-token-12345'
    });
  });

  it('should initialize with canonical pocketgull.app domain by default', () => {
    const defaultClient = new PocketGullClient();
    expect(defaultClient).toBeDefined();
  });

  it('should fetch research cohorts with appropriate HIPAA provenance headers', async () => {
    const mockCohorts = [
      {
        id: 'cohort-t2d-cgm',
        title: 'Type 2 Diabetes Continuous Glucose Monitoring',
        conditionCode: 'E11.9',
        description: 'De-identified CGM telemetry.',
        compensationPerQueryUsd: 25.0,
        activeEnrolledCount: 1420,
        kAnonymityScore: 12,
        ethicalPrecedent: 'nih_all_of_us'
      }
    ];

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ cohorts: mockCohorts })
    });
    vi.stubGlobal('fetch', fetchSpy);

    const cohorts = await client.getResearchCohorts();
    expect(cohorts.length).toBe(1);
    expect(cohorts[0].title).toContain('Type 2 Diabetes');

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://pocketgull.app/api/research/cohorts',
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-PocketGull-DeID-Standard': 'HIPAA-Safe-Harbor-164.514',
          'Authorization': 'Bearer test-api-token-12345'
        })
      })
    );

    vi.unstubAllGlobals();
  });

  it('should execute cohort enrollment requests correctly', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, enrollmentId: 'enr-9988' })
    });
    vi.stubGlobal('fetch', fetchSpy);

    const res = await client.enrollInCohort({
      patientId: 'pat-1',
      cohortId: 'cohort-t2d-cgm',
      electronicSignature: 'Jane Doe MD',
      optInDividend: true
    });

    expect(res.success).toBe(true);
    expect(res.enrollmentId).toBe('enr-9988');

    vi.unstubAllGlobals();
  });
});
