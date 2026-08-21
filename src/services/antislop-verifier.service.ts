import { Injectable, signal } from '@angular/core';
import crypto from 'crypto';

export interface IAntiSlopAuditResult {
  isAntiSlopCertified: boolean;
  rigorScorePercent: number; // 0 to 100
  evidenceDensityPerHundredWords: number;
  slopPhrasesDetected: string[];
  quantitativeMetricsCount: number;
  epistemicGroundingTier: 'LEVEL_A_DETERMINISTIC' | 'LEVEL_B_EMPIRICAL' | 'UNVERIFIED_SLOP_WARNING';
  antislopSealHash: string;
  timestamp: string;
}

// Banned Sycophantic & Vague AI Slop Patterns
const SLOP_PATTERNS = [
  /\bas an ai language model\b/i,
  /\bdelve\b/i,
  /\btapestry\b/i,
  /\btestament to\b/i,
  /\bin conclusion\b/i,
  /\bit is important to remember\b/i,
  /\bthat is a great question\b/i,
  /\bharness the power of\b/i,
  /\bgame changer\b/i,
  /\bunlock the secrets\b/i,
  /\blook no further\b/i,
  /\bnavigating the complexities\b/i,
  /\bparadigm shift\b/i,
];

// Clinical Units & Deterministic Grounding Tokens
const CLINICAL_TOKENS = [
  /\b\d+(\.\d+)?\s*(mg|mcg|g|kg|ml|l|mmhg|bpm|µm|um|msv|ppm|meq|mmol\/l|mg\/dl)\b/i,
  /\b(loinc|snomed|icd-10|fhir|pubmed|doi:)\b/i,
  /\b(frisén|rnfl|jncs|jcsa|fast|ared|lbnp)\b/i,
];

@Injectable({
  providedIn: 'root',
})
export class AntiSlopVerifierService {
  /**
   * Evaluates text against the Pocket-Gull Anti-Slop & Epistemic Rigor Standard
   */
  evaluateText(content: string): IAntiSlopAuditResult {
    if (!content || !content.trim()) {
      return {
        isAntiSlopCertified: false,
        rigorScorePercent: 0,
        evidenceDensityPerHundredWords: 0,
        slopPhrasesDetected: ['EMPTY_CONTENT'],
        quantitativeMetricsCount: 0,
        epistemicGroundingTier: 'UNVERIFIED_SLOP_WARNING',
        antislopSealHash: 'SEAL:UNVERIFIED',
        timestamp: new Date().toISOString(),
      };
    }

    const words = content.trim().split(/\s+/);
    const wordCount = words.length;

    // 1. Detect Slop Phrases
    const slopHits: string[] = [];
    for (const pattern of SLOP_PATTERNS) {
      const match = content.match(pattern);
      if (match) {
        slopHits.push(match[0]);
      }
    }

    // 2. Count Quantitative Clinical Tokens
    let clinicalMetricsCount = 0;
    for (const tokenRegex of CLINICAL_TOKENS) {
      const matches = content.match(new RegExp(tokenRegex.source, 'gi'));
      if (matches) {
        clinicalMetricsCount += matches.length;
      }
    }

    const evidenceDensity = wordCount > 0 ? (clinicalMetricsCount / wordCount) * 100 : 0;

    // 3. Compute Rigor Score
    let score = 100;
    score -= slopHits.length * 25; // Massive penalty for generic LLM fillers
    if (evidenceDensity < 2.0) {
      score -= 20; // Penalty for lack of quantitative grounding
    } else {
      score += Math.min(15, evidenceDensity * 2);
    }
    const finalScore = Math.max(0, Math.min(100, Math.round(score)));

    const isCertified = finalScore >= 75 && slopHits.length === 0;
    const tier: IAntiSlopAuditResult['epistemicGroundingTier'] = 
      isCertified && evidenceDensity >= 4.0 ? 'LEVEL_A_DETERMINISTIC' :
      isCertified ? 'LEVEL_B_EMPIRICAL' : 'UNVERIFIED_SLOP_WARNING';

    const hashPayload = `${content.substring(0, 100)}:${finalScore}:${tier}:${Date.now()}`;
    const sealHash = `ANTISLOP-${crypto.createHash('sha256').update(hashPayload).digest('hex').substring(0, 16).toUpperCase()}`;

    return {
      isAntiSlopCertified: isCertified,
      rigorScorePercent: finalScore,
      evidenceDensityPerHundredWords: Math.round(evidenceDensity * 10) / 10,
      slopPhrasesDetected: slopHits,
      quantitativeMetricsCount: clinicalMetricsCount,
      epistemicGroundingTier: tier,
      antislopSealHash: sealHash,
      timestamp: new Date().toISOString(),
    };
  }
}
