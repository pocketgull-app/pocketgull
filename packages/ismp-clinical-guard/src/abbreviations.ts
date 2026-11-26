// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import { IDangerousAbbreviation } from './types.js';

/**
 * ISMP Official List of Error-Prone / Dangerous Abbreviations
 */
export const DANGEROUS_ABBREVIATIONS: ReadonlyArray<IDangerousAbbreviation> = [
  {
    pattern: /\b(\d+)\s*U\b/gi,
    replacement: '$1 units',
    description: 'Mistaken as zero (0), four (4), or cc. Write "units".'
  },
  {
    pattern: /\b(Q\.?D\.?|QD)\b/gi,
    replacement: 'daily',
    description: 'Mistaken for QOD. Write "daily".'
  },
  {
    pattern: /\b(Q\.?O\.?D\.?|QOD)\b/gi,
    replacement: 'every other day',
    description: 'Mistaken for QD. Write "every other day".'
  },
  {
    pattern: /\bMSO4\b/g,
    replacement: 'morphine sulfate',
    description: 'Confused with MgSO4. Write "morphine sulfate".'
  },
  {
    pattern: /\bMgSO4\b/g,
    replacement: 'magnesium sulfate',
    description: 'Confused with MSO4. Write "magnesium sulfate".'
  },
  {
    pattern: /\b(\d+(?:\.\d+)?)\s*(?:ug|µg)\b/gi,
    replacement: '$1 mcg',
    description: 'Mistaken for mg (1000-fold overdose). Write "mcg".'
  },
  {
    pattern: /\b(TIW|T\.I\.W\.)\b/gi,
    replacement: '3 times weekly',
    description: 'Mistaken for three times daily (TID). Write "3 times weekly".'
  },
  {
    pattern: /\b(D\/C|DC)\b/gi,
    replacement: 'discontinue',
    description: 'Mistaken for "discharge". Write "discontinue".'
  },
  {
    pattern: /\b(SQ|sub q)\b/gi,
    replacement: 'subcutaneously',
    description: 'Mistaken for SL (sublingual) or "5 every". Write "subcutaneously".'
  },
  {
    pattern: /\b(\d+(?:\.\d+)?)\s*IU\b/g,
    replacement: '$1 units',
    description: 'Mistaken for IV (intravenous) or 10 (ten). Write "units" or "International Units".'
  },
  {
    pattern: /\b(Q\.?H\.?S\.?|QHS|H\.?S\.?|HS)\b/gi,
    replacement: 'at bedtime',
    description: 'Mistaken for hourly or half-strength. Write "at bedtime".'
  },
  {
    pattern: /\b(\d+(?:\.\d+)?)\s*cc\b/gi,
    replacement: '$1 mL',
    description: 'Mistaken for U (units). Write "mL".'
  }
];
