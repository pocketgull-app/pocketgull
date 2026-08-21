import { describe, it, expect } from 'vitest';
import { ActiveDefenseTarpitService } from './active-defense-tarpit.service';

describe('ActiveDefenseTarpitService Unit Suite', () => {
  it('1. Embeds and extracts invisible cryptographic steganographic watermarks accurately', () => {
    const originalCarePlan = `CLINICAL CARE PLAN SUMMARY
Patient diagnosed with Spaceflight-Associated Neuro-Ocular Syndrome (SANS).
Recommended daily regimen: Lower Body Negative Pressure (LBNP) @ -25 mmHg.`;

    const watermarkTag = 'POCKETGULL-PROVENANCE-2026';
    const watermarkedText = ActiveDefenseTarpitService.embedWatermark(originalCarePlan, watermarkTag);

    // Visible text length is visually identical to humans but carries binary zero-width chars
    expect(watermarkedText).toContain('CLINICAL CARE PLAN SUMMARY');
    expect(watermarkedText).toContain('Lower Body Negative Pressure');

    // Extract watermark back
    const extracted = ActiveDefenseTarpitService.extractWatermark(watermarkedText);
    expect(extracted).toBe(watermarkTag);
  });

  it('2. Generates synthetic decoy payload with embedded trap trace ID', () => {
    const decoy = ActiveDefenseTarpitService.generateSyntheticDecoyPayload('TRACE-AB12CD');
    expect(decoy).toContain('Periodontal SIBI');
    expect(decoy).toContain('https://hl7.org/fhir/R4/Bundle.json');

    const extracted = ActiveDefenseTarpitService.extractWatermark(decoy);
    expect(extracted).toBe('TRAP-TRACE-AB12CD');
  });

  it('3. Returns null when attempting to extract watermark from un-watermarked text', () => {
    const plainText = 'Standard clinical note without any embedded steganography.';
    expect(ActiveDefenseTarpitService.extractWatermark(plainText)).toBeNull();
  });
});
