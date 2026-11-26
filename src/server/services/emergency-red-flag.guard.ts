// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

/**
 * Deterministic Synchronous Clinical Emergency Red-Flag Guard
 *
 * Intercepts life-threatening clinical red flags BEFORE any stochastic LLM invocation
 * and emits deterministic, jurisdiction-mapped STAT emergency dispatch instructions
 * across Five Eyes (FVEY) territories (US, CA, UK, AU, NZ).
 *
 * Covered STAT Categories:
 * 1. BE-FAST Stroke (facial droop, arm weakness, slurred speech, sudden vision loss/ataxia)
 * 2. ACS / STEMI / NSTEMI (crushing chest pain + jaw/arm/back radiation, diaphoresis)
 * 3. Severe Hypoxemia (SpO2 < 90% or acute respiratory arrest/inability to breathe)
 * 4. Hemodynamic Crisis (SBP <= 85 mmHg shock or SBP >= 220 mmHg emergency, hemorrhagic shock)
 * 5. Severe Hypoglycemia (CGM/blood glucose < 54 mg/dL or < 3.0 mmol/L)
 * 6. Severe Postpartum / Obstetric Preeclampsia (BP >= 160/110 + headache/scotoma/vision changes)
 * 7. C-SSRS / PHQ-9 Item 9 Acute Suicidal Ideation or Self-Harm
 *
 * @module server/services/emergency-red-flag.guard
 */

export type FveyJurisdiction = 'US' | 'CA' | 'UK' | 'AU' | 'NZ';

export type EmergencyRedFlagCategory =
  | 'STROKE_BE_FAST'
  | 'ACS_CARDIAC'
  | 'HYPOXEMIA_CRITICAL'
  | 'HEMODYNAMIC_CRITICAL'
  | 'HYPOGLYCEMIA_SEVERE'
  | 'SEVERE_PREECLAMPSIA'
  | 'SUICIDAL_IDEATION_CSSRS';

export interface IEmergencyJurisdictionContacts {
  jurisdiction: FveyJurisdiction;
  emergencyNumber: string;
  crisisLine: string;
  crisisLabel: string;
  statutoryAuthority: string;
}

export interface IEmergencyRedFlagResult {
  isEmergency: boolean;
  category: EmergencyRedFlagCategory | null;
  severity: 'STAT_EMERGENCY' | 'NONE';
  matchedIndicators: string[];
  jurisdiction: FveyJurisdiction;
  emergencyNumber: string;
  crisisLine: string;
  immediateAction: string;
  clinicalGuidanceMarkdown: string;
  llmBypassed: boolean;
}

const JURISDICTION_CONTACTS: Record<FveyJurisdiction, IEmergencyJurisdictionContacts> = {
  US: {
    jurisdiction: 'US',
    emergencyNumber: '911',
    crisisLine: '988',
    crisisLabel: '988 Suicide & Crisis Lifeline (Call or Text 988)',
    statutoryAuthority: 'US EMS / HIPAA Emergency Disclosure'
  },
  CA: {
    jurisdiction: 'CA',
    emergencyNumber: '911',
    crisisLine: '988',
    crisisLabel: '988 Suicide Crisis Helpline (Call or Text 988)',
    statutoryAuthority: 'Canada EMS / PIPEDA'
  },
  UK: {
    jurisdiction: 'UK',
    emergencyNumber: '999',
    crisisLine: '111',
    crisisLabel: 'NHS 111 Mental Health Option (or 999 for immediate danger)',
    statutoryAuthority: 'UK NHS Emergency / DTAC'
  },
  AU: {
    jurisdiction: 'AU',
    emergencyNumber: '000',
    crisisLine: '13 11 14',
    crisisLabel: 'Lifeline Australia (13 11 14)',
    statutoryAuthority: 'Australia Triple Zero / APPs'
  },
  NZ: {
    jurisdiction: 'NZ',
    emergencyNumber: '111',
    crisisLine: '1737',
    crisisLabel: 'Need to Talk? (Call or Text 1737)',
    statutoryAuthority: 'New Zealand Emergency / HIPC'
  }
};

export function normalizeFveyJurisdiction(countryCode?: unknown): FveyJurisdiction {
  const code = typeof countryCode === 'string' ? countryCode.trim().toUpperCase() : 'US';
  if (code === 'CA') return 'CA';
  if (code === 'UK' || code === 'GB') return 'UK';
  if (code === 'AU') return 'AU';
  if (code === 'NZ') return 'NZ';
  return 'US';
}

const NEGATION_PREFIX_RE = /(?:^|[\s,.;:(])(?:no|not|denies|denied|without|negative\s+for|absent|ruled\s+out|never|zero)\s+(?:any\s+|current\s+|active\s+|acute\s+)?$/i;

function hasUnnegatedMatch(text: string, regex: RegExp): string | null {
  const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`;
  const scanner = new RegExp(regex.source, flags);
  let match: RegExpExecArray | null;
  while ((match = scanner.exec(text)) !== null) {
    const start = match.index;
    const prefix = text.slice(Math.max(0, start - 36), start);
    if (!NEGATION_PREFIX_RE.test(prefix)) {
      return match[0];
    }
    if (match.index === scanner.lastIndex) {
      scanner.lastIndex++;
    }
  }
  return null;
}

function buildEmergencyResult(
  category: EmergencyRedFlagCategory,
  matchedIndicators: string[],
  jurisdiction: FveyJurisdiction
): IEmergencyRedFlagResult {
  const contacts = JURISDICTION_CONTACTS[jurisdiction];
  const isMentalHealthCrisis = category === 'SUICIDAL_IDEATION_CSSRS';

  const categoryTitles: Record<EmergencyRedFlagCategory, string> = {
    STROKE_BE_FAST: 'STAT NEUROLOGICAL RED FLAG (BE-FAST STROKE ALERT)',
    ACS_CARDIAC: 'STAT CARDIAC RED FLAG (SUSPECTED ACUTE CORONARY SYNDROME / STEMI)',
    HYPOXEMIA_CRITICAL: 'STAT RESPIRATORY RED FLAG (CRITICAL HYPOXEMIA / AIRWAY DISTRESS)',
    HEMODYNAMIC_CRITICAL: 'STAT HEMODYNAMIC RED FLAG (SHOCK / HYPERTENSIVE EMERGENCY)',
    HYPOGLYCEMIA_SEVERE: 'STAT METABOLIC RED FLAG (LEVEL 2 SEVERE HYPOGLYCEMIA < 54 mg/dL)',
    SEVERE_PREECLAMPSIA: 'STAT OBSTETRIC RED FLAG (SEVERE PREECLAMPSIA / POSTPARTUM EMERGENCY)',
    SUICIDAL_IDEATION_CSSRS: 'STAT BEHAVIORAL HEALTH CRISIS (C-SSRS / PHQ-9 ITEM 9 POSITIVE)'
  };

  const immediateAction = isMentalHealthCrisis
    ? `Call or text ${contacts.crisisLine} (${contacts.crisisLabel}) immediately, or call ${contacts.emergencyNumber} if in immediate physical danger. Do not leave the person alone.`
    : `Call ${contacts.emergencyNumber} immediately for Emergency Medical Services (EMS) dispatch. Do not drive yourself to the emergency department.`;

  const clinicalGuidanceMarkdown = [
    `### 🚨 ${categoryTitles[category]}`,
    '',
    `**DETERMINISTIC SAFETY INTERCEPT ACTIVE** — Stochastic AI generation has been bypassed to prevent delay in emergency care.`,
    '',
    `**Immediate Action (${contacts.jurisdiction}):** ${immediateAction}`,
    '',
    `- **Emergency Dispatch (${contacts.jurisdiction}):** **${contacts.emergencyNumber}**`,
    `- **24/7 Crisis Support (${contacts.jurisdiction}):** **${contacts.crisisLabel}**`,
    `- **Triggered Deterministic Indicators:** ${matchedIndicators.join('; ')}`,
    `- **Governance:** Deterministic Precedence Guard (FVEY ${contacts.statutoryAuthority})`,
    '',
    `> *This is an automated emergency safety escalation. Seek in-person emergency medical evaluation immediately.*`
  ].join('\n');

  return {
    isEmergency: true,
    category,
    severity: 'STAT_EMERGENCY',
    matchedIndicators,
    jurisdiction: contacts.jurisdiction,
    emergencyNumber: contacts.emergencyNumber,
    crisisLine: contacts.crisisLine,
    immediateAction,
    clinicalGuidanceMarkdown,
    llmBypassed: true
  };
}

/**
 * Synchronously evaluates clinical input text for deterministic STAT emergency red flags.
 * Guaranteed O(n) linear-time evaluation with zero network or LLM calls.
 */
export function evaluateEmergencyRedFlags(
  rawText: unknown,
  countryCode?: unknown
): IEmergencyRedFlagResult {
  const jurisdiction = normalizeFveyJurisdiction(countryCode);
  const contacts = JURISDICTION_CONTACTS[jurisdiction];

  if (typeof rawText !== 'string' || !rawText.trim()) {
    return {
      isEmergency: false,
      category: null,
      severity: 'NONE',
      matchedIndicators: [],
      jurisdiction,
      emergencyNumber: contacts.emergencyNumber,
      crisisLine: contacts.crisisLine,
      immediateAction: '',
      clinicalGuidanceMarkdown: '',
      llmBypassed: false
    };
  }

  // Strip zero-width obfuscation characters before deterministic matching
  const text = rawText.replace(/[\u200B-\u200D\uFEFF]/g, '').slice(0, 50_000);

  // 1. C-SSRS / PHQ-9 Item 9 Suicidal Ideation & Self-Harm
  const suicideMatch = hasUnnegatedMatch(
    text,
    /\b(?:want\s+to\s+(?:die|kill\s+myself|end\s+my\s+life)|going\s+to\s+kill\s+myself|suicidal\s+(?:ideation|thoughts|intent|plan)|suicide\s+(?:plan|attempt|intent)|actively\s+suicidal|hurt\s+myself|harm\s+myself|better\s+off\s+dead|c-ssrs\s*(?:positive|high|grade\s*[345]|level\s*[345]|score\s*[:=]?\s*[345])|phq-?9\s+item\s*9\s*[:=]?\s*[123])\b/i
  );
  if (suicideMatch) {
    return buildEmergencyResult('SUICIDAL_IDEATION_CSSRS', [suicideMatch], jurisdiction);
  }

  // 2. BE-FAST Stroke Signs
  const strokeMatch = hasUnnegatedMatch(
    text,
    /\b(?:facial\s+droop(?:ing)?|face\s+droop(?:ing)?|arm\s+weakness|one-sided\s+(?:weakness|numbness|paralysis)|hemiparesis|hemiplegia|slurred\s+speech|acute\s+aphasia|sudden\s+(?:vision\s+loss|blindness|double\s+vision|diplopia|loss\s+of\s+balance|ataxia|confusion)|thunderclap\s+headache|worst\s+headache\s+of\s+(?:my|their)\s+life)\b/i
  );
  if (strokeMatch) {
    return buildEmergencyResult('STROKE_BE_FAST', [strokeMatch], jurisdiction);
  }

  // 3. ACS / STEMI / NSTEMI Cardiac Emergency
  const acsMatch = hasUnnegatedMatch(
    text,
    /\b(?:crushing\s+chest\s+pain|substernal\s+chest\s+(?:pain|pressure)|chest\s+(?:pain|pressure|tightness)[^.\n]{0,60}(?:jaw|left\s+arm|arm|back|shoulder|diaphoresis|sweating|shortness\s+of\s+breath)|(?:jaw|left\s+arm)\s+pain[^.\n]{0,50}chest\s+(?:pain|pressure)|stemi\b|nstemi\b|acute\s+coronary\s+syndrome|acute\s+myocardial\s+infarction|having\s+a\s+heart\s+attack)\b/i
  );
  if (acsMatch) {
    return buildEmergencyResult('ACS_CARDIAC', [acsMatch], jurisdiction);
  }

  // 4. Severe Hypoxemia (SpO2 < 90% or acute inability to breathe)
  const spo2Matches = Array.from(
    text.matchAll(/\b(?:spo2|sp02|o2\s*sat(?:uration)?|oxygen\s*sat(?:uration)?)\s*(?:is|of|at|=|:|<)?\s*(\d{2,3})\s*%?/gi)
  );
  for (const m of spo2Matches) {
    const val = Number(m[1]);
    if (Number.isFinite(val) && val >= 40 && val < 90) {
      return buildEmergencyResult('HYPOXEMIA_CRITICAL', [`SpO2 ${val}% (< 90%)`], jurisdiction);
    }
  }
  const airwayMatch = hasUnnegatedMatch(
    text,
    /\b(?:can'?t\s+breathe|cannot\s+breathe|unable\s+to\s+breathe|gasping\s+for\s+air|lips\s+turning\s+blue|central\s+cyanosis|respiratory\s+arrest)\b/i
  );
  if (airwayMatch) {
    return buildEmergencyResult('HYPOXEMIA_CRITICAL', [airwayMatch], jurisdiction);
  }

  // 5. Obstetric / Severe Postpartum Preeclampsia (check before general BP so specific obstetric alert fires)
  const isObstetricContext = /\b(?:postpartum|preeclampsia|pre-eclampsia|eclampsia|pregnant|pregnancy|gestation|weeks\s+pregnant|delivered\s+\d+\s+days?\s+ago)\b/i.test(text);
  const bpMatches = Array.from(text.matchAll(/\b(?:bp|blood\s+pressure)?\s*[:=]?\s*(\d{2,3})\s*\/\s*(\d{2,3})\b/gi));
  const sbpOnlyMatches = Array.from(text.matchAll(/\b(?:sbp|systolic(?:\s+bp)?)\s*(?:is|of|at|=|:)?\s*(\d{2,3})\b/gi));

  if (isObstetricContext) {
    let severeObsBp: string | null = null;
    for (const m of bpMatches) {
      const sbp = Number(m[1]);
      const dbp = Number(m[2]);
      if (sbp >= 160 && sbp <= 300 && dbp >= 40 && dbp <= 200) {
        severeObsBp = `BP ${sbp}/${dbp}`;
      } else if (dbp >= 110 && dbp <= 200 && sbp >= 100 && sbp <= 300) {
        severeObsBp = `BP ${sbp}/${dbp}`;
      }
    }
    const obsSymptom = hasUnnegatedMatch(
      text,
      /\b(?:severe\s+headache|headache|scotoma|visual\s+(?:disturbance|changes|spots)|flashing\s+lights|blurred\s+vision|ruq\s+pain|epigastric\s+pain|seizure)\b/i
    );
    if (severeObsBp && obsSymptom) {
      return buildEmergencyResult('SEVERE_PREECLAMPSIA', [severeObsBp, obsSymptom], jurisdiction);
    }
  }

  // 6. Hemodynamic Crisis (SBP <= 85 or >= 220, hemorrhagic/anaphylactic shock)
  for (const m of bpMatches) {
    const sbp = Number(m[1]);
    const dbp = Number(m[2]);
    // Guard against dates like 12/25 or fractions by checking plausible physiological BP ranges
    const hasBpKeyword = /bp|blood\s+pressure/i.test(m[0]) || /\b(?:bp|blood\s+pressure)\b/i.test(text.slice(Math.max(0, (m.index ?? 0) - 24), m.index ?? 0));
    if (!hasBpKeyword && (sbp < 50 || dbp < 25 || sbp <= dbp)) {
      continue;
    }
    if (sbp >= 30 && sbp <= 85 && dbp >= 20 && dbp < sbp) {
      return buildEmergencyResult('HEMODYNAMIC_CRITICAL', [`Critical Hypotension BP ${sbp}/${dbp} (SBP <= 85 mmHg)`], jurisdiction);
    }
    if (sbp >= 220 && sbp <= 320 && dbp >= 40 && dbp <= 200) {
      return buildEmergencyResult('HEMODYNAMIC_CRITICAL', [`Hypertensive Emergency BP ${sbp}/${dbp} (SBP >= 220 mmHg)`], jurisdiction);
    }
  }
  for (const m of sbpOnlyMatches) {
    const sbp = Number(m[1]);
    if (sbp >= 30 && sbp <= 85) {
      return buildEmergencyResult('HEMODYNAMIC_CRITICAL', [`Critical Hypotension SBP ${sbp} mmHg (<= 85)`], jurisdiction);
    }
    if (sbp >= 220 && sbp <= 320) {
      return buildEmergencyResult('HEMODYNAMIC_CRITICAL', [`Hypertensive Emergency SBP ${sbp} mmHg (>= 220)`], jurisdiction);
    }
  }
  const shockMatch = hasUnnegatedMatch(
    text,
    /\b(?:hemorrhagic\s+shock|anaphylactic\s+shock|septic\s+shock|cardiogenic\s+shock|severe\s+uncontrolled\s+bleeding|massive\s+hemorrhage)\b/i
  );
  if (shockMatch) {
    return buildEmergencyResult('HEMODYNAMIC_CRITICAL', [shockMatch], jurisdiction);
  }

  // 7. Severe Hypoglycemia (CGM / Glucose < 54 mg/dL or < 3.0 mmol/L)
  const mgdlMatches = Array.from(
    text.matchAll(/\b(?:cgm|blood\s*glucose|glucose|blood\s*sugar|bg)\s*(?:is|of|at|=|:|<)?\s*(\d{2,3}(?:\.\d+)?)\s*(?:mg\/?dl)?\b/gi)
  );
  for (const m of mgdlMatches) {
    const rawUnitCheck = text.slice((m.index ?? 0), (m.index ?? 0) + m[0].length + 12);
    const val = Number(m[1]);
    if (/mmol/i.test(rawUnitCheck)) {
      if (Number.isFinite(val) && val >= 0.5 && val < 3.0) {
        return buildEmergencyResult('HYPOGLYCEMIA_SEVERE', [`Glucose ${val} mmol/L (< 3.0 mmol/L)`], jurisdiction);
      }
    } else if (Number.isFinite(val) && val >= 10 && val < 54) {
      return buildEmergencyResult('HYPOGLYCEMIA_SEVERE', [`Glucose ${val} mg/dL (< 54 mg/dL)`], jurisdiction);
    }
  }

  return {
    isEmergency: false,
    category: null,
    severity: 'NONE',
    matchedIndicators: [],
    jurisdiction,
    emergencyNumber: contacts.emergencyNumber,
    crisisLine: contacts.crisisLine,
    immediateAction: '',
    clinicalGuidanceMarkdown: '',
    llmBypassed: false
  };
}
