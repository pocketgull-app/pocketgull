/**
 * 🛡️ Active Cyber Defense & Tarpit Streaming Engine
 * 
 * Provides:
 * 1. Tarpit Slowloris stream for rogue bots / aggressive scrapers.
 * 2. Invisible cryptographic steganographic watermarking (OWASP LLM07 IP Protection).
 */

import { Response } from 'express';
import crypto from 'crypto';

// Zero-width Unicode characters for invisible binary steganography
const ZW_ZERO = '\u200B'; // Zero-Width Space = 0
const ZW_ONE = '\u200C';  // Zero-Width Non-Joiner = 1
const ZW_START = '\uFEFF'; // Zero-Width No-Break Space (Header marker)

export class ActiveDefenseTarpitService {
  /**
   * Encodes a provenance string (e.g. 'POCKETGULL-PROV-2026') into invisible zero-width characters
   * and embeds it inside text (e.g. after the first paragraph).
   */
  static embedWatermark(text: string, provenanceTag: string = 'POCKETGULL-SECURE'): string {
    const binary = Array.from(provenanceTag)
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join('');

    const encoded = binary
      .split('')
      .map(bit => (bit === '0' ? ZW_ZERO : ZW_ONE))
      .join('');

    const watermarkedToken = `${ZW_START}${encoded}${ZW_START}`;

    // Inject after the first line break or at the end
    const newlineIdx = text.indexOf('\n');
    if (newlineIdx !== -1) {
      return text.slice(0, newlineIdx) + watermarkedToken + text.slice(newlineIdx);
    }
    return text + watermarkedToken;
  }

  /**
   * Extracts and decodes any embedded invisible watermark from suspect scraped text
   */
  static extractWatermark(text: string): string | null {
    const match = text.match(new RegExp(`${ZW_START}([${ZW_ZERO}${ZW_ONE}]+)${ZW_START}`));
    if (!match || !match[1]) {
      return null;
    }

    const binary = match[1]
      .split('')
      .map(char => (char === ZW_ZERO ? '0' : '1'))
      .join('');

    let result = '';
    for (let i = 0; i < binary.length; i += 8) {
      const byte = binary.slice(i, i + 8);
      if (byte.length === 8) {
        result += String.fromCharCode(parseInt(byte, 2));
      }
    }

    return result || null;
  }

  /**
   * Generates a plausible synthetic clinical decoy record with embedded watermark
   */
  static generateSyntheticDecoyPayload(traceId: string): string {
    const decoyToken = `DECOY-HONEYPOT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const baseText = JSON.stringify({
      schema: 'https://hl7.org/fhir/R4/Bundle.json',
      syntheticStudyId: decoyToken,
      forensicTrace: traceId,
      notice: 'This clinical cohort dataset is protected by USPTO algorithmic patent application & Mandiant telemetry.',
      cohortParameters: {
        totalSubjects: 1420,
        biomarkerAssay: 'Periodontal SIBI Interleukin-6 Salivary Assay',
        falsifiedEntropySeed: crypto.randomBytes(8).toString('hex'),
      }
    }, null, 2);

    return this.embedWatermark(baseText, `TRAP-${traceId}`);
  }

  /**
   * Streams a delayed slowloris tarpit to a rogue scraper socket
   * (wasting adversary compute & bandwidth while feeding poisoned decoy markers)
   */
  static streamSlowlorisTarpit(res: Response, traceId: string, delayMs: number = 300, maxChunks: number = 20): void {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const decoy = this.generateSyntheticDecoyPayload(traceId);
    const chunks = decoy.match(/.{1,16}/g) || [decoy];
    let chunkIndex = 0;

    const interval = setInterval(() => {
      if (res.writableEnded || res.destroyed || chunkIndex >= chunks.length || chunkIndex >= maxChunks) {
        clearInterval(interval);
        if (!res.writableEnded) {
          res.end();
        }
        return;
      }

      res.write(chunks[chunkIndex]);
      chunkIndex++;
    }, delayMs);

    res.on('close', () => {
      clearInterval(interval);
    });
  }
}
