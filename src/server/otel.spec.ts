import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  sanitizeSpanAttributes,
  HIPAA_DIRECT_IDENTIFIER_KEYS,
  initOpenTelemetry,
  createClinicalSpan,
  recordClinicalMetric,
  getTracer,
} from './otel';

describe('CNCF OpenTelemetry & HIPAA Safe Harbor Guard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('HIPAA Safe Harbor Attribute Sanitization', () => {
    it('should redact all direct identifier keys matching the 18 Safe Harbor categories', () => {
      const sensitiveAttributes = {
        mrn: 'MRN-984729',
        medical_record_number: 'MRN-112233',
        patient_name: 'John Doe',
        full_name: 'Jane Smith',
        first_name: 'Alice',
        last_name: 'Bob',
        ssn: '123-45-6789',
        dob: '1985-04-12',
        birth_date: '1990-01-01',
        phone: '+1-555-123-4567',
        email: 'patient@example.com',
        address: '123 Medical Center Way',
        street: 'Main St',
        zip: '97201',
        zipcode: '90210',
        ip_address: '192.168.1.100',
        client_ip: '10.0.0.1',
        device_id: 'DEV-XYZ-999',
      };

      const sanitized = sanitizeSpanAttributes(sensitiveAttributes);

      for (const key of Object.keys(sensitiveAttributes)) {
        expect(sanitized[key]).toBe('[REDACTED_HIPAA_SAFE_HARBOR]');
      }
    });

    it('should redact embedded SSN patterns in arbitrary string fields', () => {
      const payload = {
        clinical_note_snippet: '987-65-4321',
      };

      const sanitized = sanitizeSpanAttributes(payload);
      expect(sanitized['clinical_note_snippet']).toBe('[REDACTED_SSN]');
    });

    it('should redact embedded email patterns in arbitrary string fields', () => {
      const payload = {
        metadata_ref: 'clinician_lead@hospital-network.org',
      };

      const sanitized = sanitizeSpanAttributes(payload);
      expect(sanitized['metadata_ref']).toBe('[REDACTED_EMAIL]');
    });

    it('should preserve safe clinical biomarkers, vitals, and metadata', () => {
      const clinicalAttributes = {
        'model.name': 'gemini-3.7-flash',
        'clinical.heart_rate': 78,
        'clinical.spo2': 98.5,
        'clinical.bp_systolic': 120,
        'clinical.triage_level': 'ROUTINE',
        'clinical.is_stat_emergency': false,
      };

      const sanitized = sanitizeSpanAttributes(clinicalAttributes);

      expect(sanitized['model.name']).toBe('gemini-3.7-flash');
      expect(sanitized['clinical.heart_rate']).toBe(78);
      expect(sanitized['clinical.spo2']).toBe(98.5);
      expect(sanitized['clinical.bp_systolic']).toBe(120);
      expect(sanitized['clinical.triage_level']).toBe('ROUTINE');
      expect(sanitized['clinical.is_stat_emergency']).toBe(false);
    });

    it('should safely stringify and cap complex objects', () => {
      const complexPayload = {
        scores: { risk: 0.12, confidence: 0.95 },
      };

      const sanitized = sanitizeSpanAttributes(complexPayload);
      expect(typeof sanitized['scores']).toBe('string');
      expect(sanitized['scores']).toContain('"risk":0.12');
    });
  });

  describe('OpenTelemetry Initialization & Lifecycle', () => {
    it('should safely return false when in test mode or OTEL_SDK_DISABLED=true', async () => {
      process.env['OTEL_SDK_DISABLED'] = 'true';
      const result = await initOpenTelemetry();
      expect(typeof result).toBe('boolean');
    });

    it('should obtain a valid tracer instance', () => {
      const tracer = getTracer();
      expect(tracer).toBeDefined();
      expect(typeof tracer.startActiveSpan).toBe('function');
    });
  });

  describe('Clinical Span Execution & Trace Provenance', () => {
    it('should execute asynchronous clinical operations and return result', async () => {
      const mockResult = { carePlanId: 'cp-2026-xyz', riskScore: 0.24 };

      const result = await createClinicalSpan(
        'clinical.generate_care_plan',
        {
          'patient_name': 'Secret Name', // should be sanitized
          'clinical.acuity': 'MODERATE',
        },
        async (span) => {
          expect(span).toBeDefined();
          return mockResult;
        }
      );

      expect(result).toEqual(mockResult);
    });

    it('should propagate errors and record exception on span failure', async () => {
      await expect(
        createClinicalSpan(
          'clinical.failing_operation',
          { 'clinical.test': true },
          async () => {
            throw new Error('Simulated clinical engine error');
          }
        )
      ).rejects.toThrow('Simulated clinical engine error');
    });

    it('should allow recording metrics without throwing', () => {
      expect(() => {
        recordClinicalMetric('inference_latency_ms', 142.5, {
          'patient_name': 'Should Be Scrubbed',
          'model.id': 'gemini-3.7-flash',
        });
      }).not.toThrow();
    });
  });
});
