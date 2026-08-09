import { Injectable } from '@angular/core';
import { IPatient } from '../patient.types';
import * as DOMPurify from 'dompurify';

export interface IPdfExportOptions {
  title?: string;
  author?: string;
  includeVitals?: boolean;
  includeConditions?: boolean;
  watermarkText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PdfExportStrategyService {
  /**
   * Sanitizes input text string before including it in PDF text blocks.
   */
  public sanitizeText(text: string): string {
    if (!text) return '';
    try {
      const purifyObj = DOMPurify as unknown as { default?: { sanitize?: (s: string, opts?: unknown) => string }; sanitize?: (s: string, opts?: unknown) => string };
      const purify = purifyObj.default || purifyObj;
      if (purify && typeof purify.sanitize === 'function') {
        return purify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
      }
    } catch {
      // Fallback manual tag stripping
    }
    let previous: string;
    let current = text;
    do {
      previous = current;
      current = current.replace(/<[^>]*>/g, '');
    } while (current !== previous);
    return current;
  }

  /**
   * Generates a plain text / HTML summary document suitable for PDF printing or canvas download.
   */
  public buildPdfTextSummary(patient: Partial<IPatient>, options?: IPdfExportOptions): string {
    const name = this.sanitizeText(patient.name || 'Anonymous');
    const age = patient.age || 'N/A';
    const gender = patient.gender || 'Unspecified';
    const title = options?.title || 'HIPAA De-Identified Patient Summary';
    const exportedAt = new Date().toLocaleString();

    let doc = `========================================================\n`;
    doc += `${title.toUpperCase()}\n`;
    doc += `Generated: ${exportedAt}\n`;
    doc += `========================================================\n\n`;
    doc += `PATIENT PROFILE:\n`;
    doc += `  Name: ${name}\n`;
    doc += `  Age: ${age}\n`;
    doc += `  Gender: ${gender}\n\n`;

    if (options?.includeVitals !== false && patient.vitals) {
      doc += `VITAL SIGNS:\n`;
      doc += `  Heart Rate: ${patient.vitals.hr || 'N/A'} bpm\n`;
      doc += `  Blood Pressure: ${patient.vitals.bp || 'N/A'} mmHg\n`;
      doc += `  SpO2: ${patient.vitals.spO2 || 'N/A'} %\n`;
      doc += `  Temperature: ${patient.vitals.temp || 'N/A'} °C\n\n`;
    }

    if (options?.includeConditions !== false && patient.preexistingConditions?.length) {
      doc += `PRE-EXISTING CONDITIONS:\n`;
      patient.preexistingConditions.forEach((cond) => {
        doc += `  - ${this.sanitizeText(cond)}\n`;
      });
      doc += `\n`;
    }

    doc += `========================================================\n`;
    doc += `CONFIDENTIAL MEDICAL RECORD -- FOR AUTHORIZED CLINICAL USE ONLY\n`;
    doc += `========================================================\n`;

    return doc;
  }
}
