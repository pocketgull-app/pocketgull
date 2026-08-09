import { describe, it, expect, beforeEach } from 'vitest';
import { PdfExportStrategyService } from './pdf-export-strategy.service';

describe('PdfExportStrategyService', () => {
  let service: PdfExportStrategyService;

  beforeEach(() => {
    service = new PdfExportStrategyService();
  });

  it('should sanitize HTML tags from text', () => {
    const raw = '<strong>Hypertension</strong> <script>alert("xss")</script>';
    const cleaned = service.sanitizeText(raw);
    expect(cleaned).not.toContain('<script>');
    expect(cleaned).not.toContain('<strong>');
  });

  it('should build text summary for PDF generation', () => {
    const summary = service.buildPdfTextSummary({
      name: 'Jane Doe',
      age: 34,
      gender: 'Female',
      vitals: { hr: '72', bp: '120/80', spO2: '99', temp: '36.8', weight: '65', height: '170' }
    });

    expect(summary).toContain('PATIENT PROFILE:');
    expect(summary).toContain('Jane Doe');
    expect(summary).toContain('120/80');
  });
});
