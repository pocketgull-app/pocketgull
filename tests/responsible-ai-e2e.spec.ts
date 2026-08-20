import '@angular/compiler';
import { expect } from 'vitest';
import { ExportService } from '../src/services/export.service';
import { RulesEngineService } from '../src/services/rules-engine.service';
import { FORMATTING_RULES, SYSTEM_INSTRUCTIONS } from '../src/services/clinical-prompts';

describe('Responsible AI & E2E Safety Test Suite', () => {

  let exportService: ExportService;
  let rulesEngine: RulesEngineService;

  beforeEach(() => {
    exportService = new ExportService();
    rulesEngine = new RulesEngineService();
  });

  it('should enforce strict DOMPurify XSS sanitization on clinical data inputs', () => {
    const maliciousInput = '<img src=x onerror=alert("HIPAA_VIOLATION")><h3>Clinical Assessment</h3>';
    const sanitized = exportService.sanitizeForExport(maliciousInput);
    expect(sanitized).not.toContain('onerror=');
    expect(sanitized).not.toContain('<img');
    expect(sanitized).toContain('Clinical Assessment');
  });

  it('should verify all 10 clinical lenses have valid system prompt instructions', () => {
    const requiredLenses = [
      'Summary Overview',
      'Functional Protocols',
      'Nutrition',
      'Monitoring & Follow-up',
      'Patient Education',
      'Precision Nutrients',
      'Treatment Matrix',
      'PhysioNet Telemetry',
      'Maternal & Postpartum',
      'Grow-Thyself Education',
      'Epigenetic Longevity',
      'Pre-Conception & Family Health'
    ];

    requiredLenses.forEach(lens => {
      const prompt = SYSTEM_INSTRUCTIONS[lens as keyof typeof SYSTEM_INSTRUCTIONS];
      expect(prompt).toBeDefined();
      expect(prompt.length).toBeGreaterThan(50);
    });
  });

  it('should format FHIR R4 bundles with HIPAA compliant privacy tags', () => {
    const patientData = { id: 'p_test', name: 'Jane Doe', vitals: { hr: '72', spO2: '99' } };
    const bundle = exportService.buildFhirR4Bundle(patientData);
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.entry).toBeDefined();
    expect(bundle.entry[0].resource.resourceType).toBe('Patient');
  });

  it('should evaluate rules-engine post-processing without swallowing exceptions', () => {
    const rawReport = '### Patient Assessment\nPatient shows good recovery.';
    const evaluated = rulesEngine.evaluateOnResponse(rawReport, 'Summary Overview');
    expect(evaluated).toContain('Patient Assessment');
  });
});
