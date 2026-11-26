// SPDX-License-Identifier: Apache-2.0
import { Injectable, inject, signal } from '@angular/core';
import {
  GlobalJurisdictionMatrixService,
  IEmergencyDispatch,
  IJurisdictionProfile
} from './global-jurisdiction-matrix.service';
import { computeFipsSha256Hex } from './clinical-defense-guard.service';

export type EmergencyRedFlagCategory =
  | 'BE_FAST_STROKE'
  | 'ACS_STEMI_NSTEMI'
  | 'SEVERE_HYPOXEMIA'
  | 'CRITICAL_BP_EXTREME'
  | 'SEVERE_HYPOGLYCEMIA'
  | 'SEVERE_POSTPARTUM_PREECLAMPSIA'
  | 'SUICIDAL_IDEATION_CRISIS';

export interface IEmergencyDispatchGuidance {
  jurisdictionId: string;
  countryCode: string;
  emergencyNumber: string;
  emergencyServiceName: string;
  crisisNumber: string;
  crisisServiceName: string;
  dispatchLines: IEmergencyDispatch[];
}

export interface IEmergencyRedFlagMatch {
  category: EmergencyRedFlagCategory;
  acuity: 'STAT_EMERGENCY';
  triggerSummary: string;
  matchedSignal: string;
  protocolDirective: string;
  requiresCrisisLine: boolean;
}

export interface IEmergencyRedFlagInput {
  text?: string;
  vitals?: {
    spo2?: number | string;
    bp?: string;
    sbp?: number;
    dbp?: number;
    glucose?: number | string;
    cgm?: number | string;
    hr?: number | string;
  };
  phq9Item9Score?: number;
  cssrsScore?: number;
  cssrsPositive?: boolean;
  postpartum?: boolean;
  countryCode?: string;
  stateCode?: string;
}

export interface IEmergencyRedFlagEvaluation {
  isTriggered: boolean;
  acuity: 'STAT_EMERGENCY' | 'NON_STAT';
  haltStochasticGeneration: boolean;
  matches: IEmergencyRedFlagMatch[];
  dispatch: IEmergencyDispatchGuidance;
  deterministicProtocolMarkdown: string;
  evaluatedAt: string;
  integritySeal: string;
}

const NEGATION_PREFIX_RE =
  /(?:^|[\s,;.(])(?:no|not|without|denies|denied|negative\s+for|absent|ruled\s+out|rules\s+out|no\s+evidence\s+of|free\s+of|zero)\s+(?:acute\s+|current\s+|active\s+|any\s+)?$/i;

function findUnnegatedMatch(text: string, regex: RegExp): string | null {
  if (!text) return null;
  const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`;
  const scanner = new RegExp(regex.source, flags);
  let match: RegExpExecArray | null;
  while ((match = scanner.exec(text)) !== null) {
    const start = match.index;
    const prefix = text.slice(Math.max(0, start - 36), start);
    if (!NEGATION_PREFIX_RE.test(prefix)) {
      return match[0];
    }
    if (match[0].length === 0) {
      scanner.lastIndex++;
    }
  }
  return null;
}

function parseNumeric(val: number | string | undefined): number | null {
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  if (typeof val === 'string') {
    const m = val.match(/-?\d+(?:\.\d+)?/);
    if (m) {
      const parsed = Number(m[0]);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function parseBpString(bp: string | undefined): { sbp: number; dbp: number } | null {
  if (!bp) return null;
  const m = bp.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
  if (!m) return null;
  const sbp = Number(m[1]);
  const dbp = Number(m[2]);
  if (!Number.isFinite(sbp) || !Number.isFinite(dbp)) return null;
  return { sbp, dbp };
}

/**
 * Deterministic Synchronous Emergency Red-Flag Interception Guard.
 *
 * Executes BEFORE any stochastic LLM / AI generation to intercept life-threatening
 * emergencies (BE-FAST stroke, ACS/STEMI/NSTEMI, SpO2 < 90%, SBP <= 85 or >= 220,
 * CGM/glucose < 54 mg/dL, severe postpartum preeclampsia, and C-SSRS / PHQ-9 Item 9 > 0).
 * Maps local emergency and crisis dispatch numbers via GlobalJurisdictionMatrixService.
 */
@Injectable({
  providedIn: 'root'
})
export class EmergencyRedFlagGuard {
  private readonly jurisdictionMatrix =
    inject(GlobalJurisdictionMatrixService, { optional: true }) || new GlobalJurisdictionMatrixService();

  public readonly lastEvaluation = signal<IEmergencyRedFlagEvaluation | null>(null);

  /**
   * Resolves jurisdiction-aware emergency & crisis numbers (FVEY + global).
   * US/CA: 911 / 988 | UK (GB): 999 / 111 (NHS 111 & Samaritans 116 123)
   * AU: 000 / 13 11 14 | NZ: 111 / 1737
   */
  public resolveDispatchGuidance(countryCode?: string, stateCode?: string): IEmergencyDispatchGuidance {
    const profile: IJurisdictionProfile = countryCode
      ? this.jurisdictionMatrix.getProfileForCountry(countryCode, stateCode)
      : this.jurisdictionMatrix.activeProfile();

    const normalizedCountry = profile.countryCode.toUpperCase();
    const generalEmergency = profile.emergencyDispatch.find(d => d.specialtyType === 'General Emergency');
    const crisisLine = profile.emergencyDispatch.find(d => d.specialtyType === 'Crisis & Suicide');

    if (normalizedCountry === 'GB') {
      return {
        jurisdictionId: profile.jurisdictionId,
        countryCode: 'GB',
        emergencyNumber: '999',
        emergencyServiceName: '999 Emergency Services (Ambulance / A&E)',
        crisisNumber: '111',
        crisisServiceName: 'NHS 111 Mental Health Crisis (Option 2) / Samaritans 116 123',
        dispatchLines: profile.emergencyDispatch
      };
    }

    if (normalizedCountry === 'NZ') {
      return {
        jurisdictionId: profile.jurisdictionId,
        countryCode: 'NZ',
        emergencyNumber: '111',
        emergencyServiceName: '111 Emergency Services (Ambulance / ED)',
        crisisNumber: '1737',
        crisisServiceName: '1737 Need to Talk? (24/7 Free Call or Text)',
        dispatchLines: profile.emergencyDispatch
      };
    }

    if (normalizedCountry === 'AU') {
      return {
        jurisdictionId: profile.jurisdictionId,
        countryCode: 'AU',
        emergencyNumber: '000',
        emergencyServiceName: '000 Triple Zero Emergency',
        crisisNumber: '13 11 14',
        crisisServiceName: 'Lifeline Australia 24/7 Crisis Support (13 11 14)',
        dispatchLines: profile.emergencyDispatch
      };
    }

    if (normalizedCountry === 'CA') {
      return {
        jurisdictionId: profile.jurisdictionId,
        countryCode: 'CA',
        emergencyNumber: '911',
        emergencyServiceName: '911 Emergency Services',
        crisisNumber: '988',
        crisisServiceName: '988 Suicide Crisis Helpline (Canada)',
        dispatchLines: profile.emergencyDispatch
      };
    }

    if (normalizedCountry === 'US') {
      return {
        jurisdictionId: profile.jurisdictionId,
        countryCode: 'US',
        emergencyNumber: '911',
        emergencyServiceName: '911 Emergency Services',
        crisisNumber: '988',
        crisisServiceName: '988 Suicide & Crisis Lifeline (Call or Text)',
        dispatchLines: profile.emergencyDispatch
      };
    }

    return {
      jurisdictionId: profile.jurisdictionId,
      countryCode: normalizedCountry,
      emergencyNumber: generalEmergency?.number || '112',
      emergencyServiceName: generalEmergency?.serviceName || 'Emergency Medical Services',
      crisisNumber: crisisLine?.number || generalEmergency?.number || '112',
      crisisServiceName: crisisLine?.serviceName || 'National Crisis Lifeline',
      dispatchLines: profile.emergencyDispatch
    };
  }

  /**
   * Synchronously evaluates free-text clinical notes, structured vitals, and
   * suicide screening items against deterministic STAT red-flag criteria.
   */
  public evaluate(
    input: IEmergencyRedFlagInput | string,
    options?: { recordState?: boolean }
  ): IEmergencyRedFlagEvaluation {
    const normalized: IEmergencyRedFlagInput = typeof input === 'string' ? { text: input } : (input || {});
    const text = (normalized.text || '').trim();
    const matches: IEmergencyRedFlagMatch[] = [];
    const dispatch = this.resolveDispatchGuidance(normalized.countryCode, normalized.stateCode);

    // 1. BE-FAST Acute Stroke Interception
    const beFastMatch = findUnnegatedMatch(
      text,
      /\b(?:facial\s+droop|face\s+droop|asymmetric\s+smile|arm\s+weakness|arm\s+drift|unilateral\s+weakness|one[- ]sided\s+weakness|hemiparesis|hemiplegia|slurred\s+speech|dysarthria|acute\s+aphasia|sudden\s+vision\s+loss|vision\s+loss|sudden\s+blindness|monocular\s+blindness|acute\s+ataxia|sudden\s+loss\s+of\s+balance|be-?fast\s+(?:positive|stroke|alert)|acute\s+stroke|suspected\s+stroke)\b/i
    );
    if (beFastMatch) {
      matches.push({
        category: 'BE_FAST_STROKE',
        acuity: 'STAT_EMERGENCY',
        triggerSummary: 'BE-FAST Acute Stroke / Focal Neurological Deficit Detected',
        matchedSignal: beFastMatch,
        protocolDirective: `Call ${dispatch.emergencyNumber} immediately for EMS stroke-center transport. Record exact "Last Known Well" time. Do NOT administer aspirin, anticoagulants, or oral liquids prior to emergency CT imaging.`,
        requiresCrisisLine: false
      });
    }

    // 2. ACS / STEMI / NSTEMI Chest Pain Interception
    const acsMatch =
      findUnnegatedMatch(
        text,
        /\b(?:stemi|nstemi|acute\s+coronary\s+syndrome|acute\s+myocardial\s+infarction|acute\s+mi|crushing\s+chest\s+pain|substernal\s+chest\s+pain|tearing\s+chest\s+pain)\b/i
      ) ||
      findUnnegatedMatch(
        text,
        /\bchest\s+(?:pain|pressure|tightness|squeezing)[^.\n]{0,70}\b(?:radiat\w*|jaw|left\s+arm|arm\s+pain|shoulder|diaphores\w*|cold\s+sweat|dyspnea|shortness\s+of\s+breath)\b/i
      );
    if (acsMatch) {
      matches.push({
        category: 'ACS_STEMI_NSTEMI',
        acuity: 'STAT_EMERGENCY',
        triggerSummary: 'Acute Coronary Syndrome (ACS / STEMI / NSTEMI) Red Flag Detected',
        matchedSignal: acsMatch,
        protocolDirective: `Call ${dispatch.emergencyNumber} immediately. Keep patient seated/resting. Obtain immediate 12-lead ECG and emergency cardiac evaluation. Do NOT self-drive to the Emergency Department.`,
        requiresCrisisLine: false
      });
    }

    // 3. Severe Hypoxemia (SpO2 < 90%)
    let detectedSpo2: number | null = parseNumeric(normalized.vitals?.spo2);
    if (detectedSpo2 === null && text) {
      const spo2Match = text.match(/\b(?:spo2|sp02|o2\s*sat(?:uration)?|oxygen\s*saturation|pulse\s*ox(?:imetry)?)\s*(?:is|at|=|:|of|dropped\s+to)?\s*(\d{2,3})\s*%?/i);
      if (spo2Match) {
        const candidate = Number(spo2Match[1]);
        if (Number.isFinite(candidate) && candidate >= 20 && candidate <= 100) {
          detectedSpo2 = candidate;
        }
      }
    }
    const textHypoxemia = findUnnegatedMatch(
      text,
      /\b(?:spo2\s*<\s*90|severe\s+hypoxemia|acute\s+hypoxemia|central\s+cyanosis|respiratory\s+arrest)\b/i
    );
    if ((detectedSpo2 !== null && detectedSpo2 > 0 && detectedSpo2 < 90) || textHypoxemia) {
      matches.push({
        category: 'SEVERE_HYPOXEMIA',
        acuity: 'STAT_EMERGENCY',
        triggerSummary: 'Critical Hypoxemia (SpO2 < 90%) Detected',
        matchedSignal: detectedSpo2 !== null && detectedSpo2 < 90 ? `SpO2 ${detectedSpo2}% (< 90% threshold)` : (textHypoxemia || 'SpO2 < 90%'),
        protocolDirective: `Call ${dispatch.emergencyNumber} immediately. Sit patient upright to maximize airway mechanics, verify probe placement without delaying emergency dispatch, and initiate supplemental oxygen/emergency airway support per EMS.`,
        requiresCrisisLine: false
      });
    }

    // 4. Critical Blood Pressure Extremes (SBP <= 85 or >= 220 mmHg)
    let sbp: number | null = normalized.vitals?.sbp ?? null;
    let dbp: number | null = normalized.vitals?.dbp ?? null;
    if (sbp === null && normalized.vitals?.bp) {
      const parsedBp = parseBpString(normalized.vitals.bp);
      if (parsedBp) {
        sbp = parsedBp.sbp;
        dbp = parsedBp.dbp;
      }
    }
    if (sbp === null && text) {
      const bpRegex = /\b(?:bp|blood\s*pressure)\s*(?:is|at|=|:|of)?\s*(\d{2,3})\s*\/\s*(\d{2,3})\b/i;
      const bpTextMatch = text.match(bpRegex);
      if (bpTextMatch) {
        sbp = Number(bpTextMatch[1]);
        dbp = Number(bpTextMatch[2]);
      } else {
        const sbpOnlyMatch = text.match(/\b(?:sbp|systolic(?:\s+bp|\s+blood\s+pressure)?)\s*(?:is|at|=|:|of|<=|>=)?\s*(\d{2,3})\b/i);
        if (sbpOnlyMatch) {
          const val = Number(sbpOnlyMatch[1]);
          if (val >= 40 && val <= 320) sbp = val;
        }
      }
    }
    const shockOrCrisisText = findUnnegatedMatch(
      text,
      /\b(?:hypertensive\s+emergency|hemorrhagic\s+shock|anaphylactic\s+shock|septic\s+shock|cardiogenic\s+shock|sbp\s*<=\s*85|sbp\s*>=\s*220)\b/i
    );
    if ((sbp !== null && (sbp <= 85 || sbp >= 220)) || shockOrCrisisText) {
      const bpSignal =
        sbp !== null && (sbp <= 85 || sbp >= 220)
          ? `BP ${sbp}${dbp !== null ? `/${dbp}` : ''} mmHg (${sbp <= 85 ? 'SBP <= 85 hypotension/shock' : 'SBP >= 220 hypertensive emergency'})`
          : (shockOrCrisisText || 'Critical BP extreme');
      matches.push({
        category: 'CRITICAL_BP_EXTREME',
        acuity: 'STAT_EMERGENCY',
        triggerSummary: 'Critical Hemodynamic Blood Pressure Extreme (SBP <= 85 or >= 220 mmHg)',
        matchedSignal: bpSignal,
        protocolDirective: `Call ${dispatch.emergencyNumber} immediately for emergency hemodynamic stabilization. Do NOT attempt unmonitored rapid oral blood pressure reduction at home.`,
        requiresCrisisLine: false
      });
    }

    // 5. Severe Hypoglycemia (CGM / Blood Glucose < 54 mg/dL)
    let glucose: number | null = parseNumeric(normalized.vitals?.cgm ?? normalized.vitals?.glucose);
    if (glucose === null && text) {
      const glucMatch = text.match(/\b(?:cgm|blood\s+glucose|glucose|blood\s+sugar|bg)\s*(?:is|at|=|:|of|reading|dropped\s+to)?\s*(\d{1,3})\s*(?:mg\/dl)?\b/i);
      if (glucMatch) {
        const val = Number(glucMatch[1]);
        if (val >= 10 && val <= 600) glucose = val;
      }
    }
    const severeHypoText = findUnnegatedMatch(
      text,
      /\b(?:severe\s+hypoglycemia|level\s*2\s+hypoglycemia|hypoglycemic\s+(?:coma|seizure|unresponsive)|glucose\s*<\s*54|cgm\s*<\s*54)\b/i
    );
    if ((glucose !== null && glucose > 0 && glucose < 54) || severeHypoText) {
      matches.push({
        category: 'SEVERE_HYPOGLYCEMIA',
        acuity: 'STAT_EMERGENCY',
        triggerSummary: 'Level 2 / Severe Hypoglycemia (Glucose / CGM < 54 mg/dL)',
        matchedSignal: glucose !== null && glucose < 54 ? `Glucose ${glucose} mg/dL (< 54 mg/dL)` : (severeHypoText || 'Glucose < 54 mg/dL'),
        protocolDirective: `Treat immediately as a glycemic emergency. If conscious and able to swallow safely, administer 15 g fast-acting carbohydrates and recheck in 15 minutes; if altered, unable to swallow, seizing, or unresponsive, administer emergency glucagon if available and call ${dispatch.emergencyNumber} immediately.`,
        requiresCrisisLine: false
      });
    }

    // 6. Severe Postpartum Preeclampsia (BP >= 160/110 + headache/scotoma/visual changes)
    const obstetricContext =
      normalized.postpartum === true ||
      /\b(?:postpartum|post-partum|preeclampsia|pre-eclampsia|eclampsia|pregnant|pregnancy|gestational|obstetric|delivered\s+\d+\s+(?:days?|weeks?)\s+ago)\b/i.test(text);
    const neuroVisualSymptom = findUnnegatedMatch(
      text,
      /\b(?:severe\s+headache|headache|scotoma|scotomata|visual\s+changes|visual\s+disturbance|blurred\s+vision|flashing\s+lights|photopsia|epigastric\s+pain|right\s+upper\s+quadrant\s+pain|clonus|seizure)\b/i
    );
    const preeclampsiaBp = (sbp !== null && sbp >= 160) || (dbp !== null && dbp >= 110);
    const explicitSeverePreeclampsia = findUnnegatedMatch(
      text,
      /\b(?:severe\s+(?:postpartum\s+)?pre-?eclampsia|postpartum\s+eclampsia|eclampsia)\b/i
    );
    if ((obstetricContext && preeclampsiaBp && !!neuroVisualSymptom) || explicitSeverePreeclampsia) {
      matches.push({
        category: 'SEVERE_POSTPARTUM_PREECLAMPSIA',
        acuity: 'STAT_EMERGENCY',
        triggerSummary: 'Severe Postpartum / Obstetric Preeclampsia With Severe Features',
        matchedSignal: explicitSeverePreeclampsia
          ? explicitSeverePreeclampsia
          : `Obstetric BP ${sbp ?? '?'}/${dbp ?? '?'} mmHg (>= 160/110) + ${neuroVisualSymptom}`,
        protocolDirective: `Call ${dispatch.emergencyNumber} immediately for emergency obstetric/ED evaluation (IV antihypertensive therapy and magnesium sulfate seizure prophylaxis). Do NOT wait for an outpatient visit.`,
        requiresCrisisLine: false
      });
    }

    // 7. C-SSRS / PHQ-9 Item 9 > 0 / Suicidal Ideation Crisis Interception
    const phq9Item9Triggered = typeof normalized.phq9Item9Score === 'number' && normalized.phq9Item9Score > 0;
    const cssrsTriggered =
      normalized.cssrsPositive === true ||
      (typeof normalized.cssrsScore === 'number' && normalized.cssrsScore > 0);
    const suicideTextMatch = findUnnegatedMatch(
      text,
      /\b(?:phq-?9\s*(?:item|q|question)\s*9\s*(?:=|is|:|score|>=|>)\s*[1-9]|c-?ssrs\s*(?:positive|high|moderate|alert|score\s*(?:=|is|:)?\s*[1-9])|suicid\w*\s+(?:ideation|intent|plan|attempt|thoughts|crisis)|active\s+suicidal|want(?:s|ing)?\s+to\s+(?:die|end\s+my\s+life|kill\s+(?:myself|himself|herself|themselves))|thoughts?\s+(?:of|that\s+you\s+would\s+be)\s+(?:better\s+off\s+dead|hurting\s+(?:myself|yourself|themselves))|better\s+off\s+dead|self[- ]harm\s+(?:intent|plan|ideation|thoughts))\b/i
    );
    if (phq9Item9Triggered || cssrsTriggered || suicideTextMatch) {
      const signalParts: string[] = [];
      if (phq9Item9Triggered) signalParts.push(`PHQ-9 Item 9 = ${normalized.phq9Item9Score} (> 0)`);
      if (cssrsTriggered) signalParts.push(`C-SSRS positive${normalized.cssrsScore ? ` (score ${normalized.cssrsScore})` : ''}`);
      if (suicideTextMatch) signalParts.push(suicideTextMatch);
      matches.push({
        category: 'SUICIDAL_IDEATION_CRISIS',
        acuity: 'STAT_EMERGENCY',
        triggerSummary: 'STAT Suicide & Self-Harm Crisis Escalation (C-SSRS / PHQ-9 Item 9)',
        matchedSignal: signalParts.join(' | '),
        protocolDirective: `Immediate human safety intervention required. Contact ${dispatch.crisisServiceName} (${dispatch.crisisNumber}) immediately, or call ${dispatch.emergencyNumber} if there is imminent danger of self-harm. Do not leave the person alone; initiate formal C-SSRS clinician safety planning.`,
        requiresCrisisLine: true
      });
    }

    const isTriggered = matches.length > 0;
    const evaluatedAt = new Date().toISOString();
    const deterministicProtocolMarkdown = isTriggered
      ? this.formatDeterministicProtocol(matches, dispatch)
      : '';
    const integritySeal = `SHA256-ERFG-${computeFipsSha256Hex(
      `${isTriggered ? 'STAT' : 'CLEAR'}|${dispatch.jurisdictionId}|${matches.map(m => m.category).join(',')}|${evaluatedAt}`
    )}`;

    const evaluation: IEmergencyRedFlagEvaluation = {
      isTriggered,
      acuity: isTriggered ? 'STAT_EMERGENCY' : 'NON_STAT',
      haltStochasticGeneration: isTriggered,
      matches,
      dispatch,
      deterministicProtocolMarkdown,
      evaluatedAt,
      integritySeal
    };

    if (options?.recordState !== false) {
      this.lastEvaluation.set(evaluation);
    }
    return evaluation;
  }

  private formatDeterministicProtocol(
    matches: IEmergencyRedFlagMatch[],
    dispatch: IEmergencyDispatchGuidance
  ): string {
    const needsCrisis = matches.some(m => m.requiresCrisisLine);
    const triggerBullets = matches
      .map(
        m =>
          `- **${m.triggerSummary}** (\`${m.matchedSignal}\`): ${m.protocolDirective}`
      )
      .join('\n');

    const lines = [
      `## 🚨 STAT DETERMINISTIC EMERGENCY INTERCEPTION — STOCHASTIC AI HALTED`,
      ``,
      `**Jurisdiction:** ${dispatch.jurisdictionId} (${dispatch.countryCode})`,
      `**Emergency Medical Services:** **${dispatch.emergencyNumber}** — ${dispatch.emergencyServiceName}`,
      ...(needsCrisis
        ? [`**24/7 Suicide & Crisis Lifeline:** **${dispatch.crisisNumber}** — ${dispatch.crisisServiceName}`]
        : [`**Crisis Support Line (Reference):** ${dispatch.crisisNumber} — ${dispatch.crisisServiceName}`]),
      ``,
      `### Triggered Red-Flag Protocols`,
      triggerBullets,
      ``,
      `> **Clinical Safety Notice (MSA §14.i / Deterministic Precedence):** Automated generative AI synthesis has been halted because high-acuity life-safety criteria were detected. This deterministic protocol is not a substitute for emergency medical care—contact **${needsCrisis ? `${dispatch.crisisNumber} or ${dispatch.emergencyNumber}` : dispatch.emergencyNumber}** immediately.`
    ];

    return lines.join('\n');
  }
}
