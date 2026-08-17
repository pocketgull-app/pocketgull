import { IPatientEducationFlipData } from '../directives/patient-education-flip.directive';

export interface IPairMedicalCard {
  title: string;
  evidenceTier: 'LEVEL_A' | 'LEVEL_B' | 'TRIALS';
  rob2Risk: 'Low Risk' | 'Some Concerns' | 'High Risk';
  bottomLineTakeaway: string;
  patientDelta: {
    biomarkerLabel: string;
    currentValue: string;
    targetValue: string;
    prescribeAction: string;
  };
  patientEducation: IPatientEducationFlipData;
}

export interface IClinicalCoTStream {
  nullHypothesis: string;
  pValue: string;
  cochraneTier: string;
  differential: string[];
  skepticalWarning: string | null;
}

export interface IWebMcpDispatchCall {
  toolName: string;
  args: Record<string, any>;
}

export interface IBioTelemetryStream {
  prIntervalMs: number;
  hrvRmssdMs: number;
  autonomicTone: string;
  arousalState: string;
}

export interface IVoiceAgentStream {
  speechIntent: string;
  emotionalValence: string;
  disfluencyRemovedText: string;
  aiSpokenResponse: string;
}

export interface IFhirResourceChunk {
  resourceType: string;
  payload: Record<string, any>;
}

// Helper token extractor
function extractToken(rawText: string, tag: string, fallback = ''): string {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)(?:<\\/${tag}>|$)`, 'i');
  const match = rawText.match(regex);
  return match ? match[1].trim() : fallback;
}

/**
 * 1. Pair Medical Card Delimiter Stream Parser
 */
export function parseDelimiterStream(rawText: string): IPairMedicalCard {
  const rawEvidence = extractToken(rawText, 'EVIDENCE', 'LEVEL_A|RoB2:Low Risk');
  const title = extractToken(rawText, 'TITLE', 'Clinical Research Study');
  const takeaway = extractToken(rawText, 'TAKEAWAY', 'Demonstrates significant therapeutic benefit at point of care.');
  const rawDelta = extractToken(rawText, 'PATIENT_DELTA', 'Biomarker Target: Normal Range | Prescribe: Standard Care');
  const analogy = extractToken(rawText, 'ANALOGY', 'Think of your body systems working together like a synchronized orchestra.');
  const socratic = extractToken(rawText, 'SOCRATIC', 'Would you like to explore how this treatment helps your daily energy?');
  const spanish = extractToken(rawText, 'SPANISH', 'Estudio de investigación clínica con evidencia directa para su cuidado.');

  let evidenceTier: 'LEVEL_A' | 'LEVEL_B' | 'TRIALS' = 'LEVEL_A';
  let rob2Risk: 'Low Risk' | 'Some Concerns' | 'High Risk' = 'Low Risk';

  if (rawEvidence.includes('LEVEL_B') || rawEvidence.includes('PREPRINT')) {
    evidenceTier = 'LEVEL_B';
  } else if (rawEvidence.includes('TRIAL')) {
    evidenceTier = 'TRIALS';
  }

  if (rawEvidence.includes('High')) rob2Risk = 'High Risk';
  else if (rawEvidence.includes('Some')) rob2Risk = 'Some Concerns';

  const deltaParts = rawDelta.split('|');
  const valueMatch = (deltaParts[0] || '').split('->');

  const biomarkerLabel = (valueMatch[0] || 'Biomarker Target').trim();
  const targetValue = (valueMatch[1] || 'Target Threshold').trim();
  const prescribeAction = (deltaParts[1] || 'Prescribe Protocol').replace(/Prescribe:\s*/i, '').trim();

  return {
    title,
    evidenceTier,
    rob2Risk,
    bottomLineTakeaway: takeaway,
    patientDelta: {
      biomarkerLabel,
      currentValue: biomarkerLabel,
      targetValue,
      prescribeAction
    },
    patientEducation: {
      title,
      gradeLevel: 'Grade 6.2',
      diagnosis: `Clinical Summary: ${title.substring(0, 60)}...`,
      analogy,
      socraticInquiry: socratic,
      spanishTranslation: spanish,
      homeCareSteps: [
        'Review finding with care provider',
        'Adhere to prescribed medication / protocol',
        'Monitor daily vitals'
      ]
    }
  };
}

/**
 * 2. Clinical CoT Reasoning Stream Parser
 */
export function parseClinicalCoTStream(rawText: string): IClinicalCoTStream {
  const nullHypothesis = extractToken(rawText, 'NULL_HYPOTHESIS', 'H0: Baseline population health profile');
  const pValue = extractToken(rawText, 'P_VALUE', 'p = 0.05');
  const cochraneTier = extractToken(rawText, 'COCHRANE', 'Level B (Cohort)');
  const rawDifferential = extractToken(rawText, 'DIFFERENTIAL', 'Primary Clinical Target');
  const skepticalWarning = extractToken(rawText, 'SKEPTICAL_WARNING', '');

  const differential = rawDifferential
    .split('|')
    .map(s => s.trim())
    .filter(Boolean);

  return {
    nullHypothesis,
    pValue,
    cochraneTier,
    differential: differential.length > 0 ? differential : [rawDifferential],
    skepticalWarning: skepticalWarning || null
  };
}

/**
 * 3. WebMCP Autonomous Tool Dispatch Stream Parser
 */
export function parseWebMcpDispatchStream(rawText: string): IWebMcpDispatchCall | null {
  const toolName = extractToken(rawText, 'TOOL_NAME');
  const rawArgs = extractToken(rawText, 'ARGS');

  if (!toolName) return null;

  let args: Record<string, any> = {};
  try {
    args = rawArgs ? JSON.parse(rawArgs) : {};
  } catch {
    args = { raw: rawArgs };
  }

  return { toolName, args };
}

/**
 * 4. Bio-Signal Telemetry Stream Parser
 */
export function parseTelemetryStream(rawText: string): IBioTelemetryStream {
  const prMs = parseFloat(extractToken(rawText, 'ECG_PR_INTERVAL', '160'));
  const hrvMs = parseFloat(extractToken(rawText, 'HRV_RMSSD', '42'));
  const autonomicTone = extractToken(rawText, 'AUTONOMIC_TONE', 'Sympathovagal Balance');
  const arousalState = extractToken(rawText, 'AROUSAL', 'Baseline Homeostasis');

  return {
    prIntervalMs: isNaN(prMs) ? 160 : prMs,
    hrvRmssdMs: isNaN(hrvMs) ? 42 : hrvMs,
    autonomicTone,
    arousalState
  };
}

/**
 * 5. Voice Agent Intent & Disfluency Stream Parser
 */
export function parseVoiceAgentStream(rawText: string): IVoiceAgentStream {
  const speechIntent = extractToken(rawText, 'SPEECH_INTENT', 'General Health Query');
  const emotionalValence = extractToken(rawText, 'EMOTIONAL_VALENCE', 'Calm');
  const disfluencyRemovedText = extractToken(rawText, 'DISFLUENCY_REMOVED', rawText);
  const aiSpokenResponse = extractToken(rawText, 'AI_SPOKEN_RESPONSE', disfluencyRemovedText);

  return {
    speechIntent,
    emotionalValence,
    disfluencyRemovedText,
    aiSpokenResponse
  };
}

/**
 * 6. FHIR R4 Streaming Ingestion Parser
 */
export function parseFhirResourceStream(rawText: string): IFhirResourceChunk[] {
  const chunks: IFhirResourceChunk[] = [];
  const regex = /<FHIR_RESOURCE\s+type=["']([^"']+)["']>([\s\S]*?)(?:<\/FHIR_RESOURCE>|$)/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(rawText)) !== null) {
    const resourceType = match[1];
    const rawJson = match[2].trim();
    let payload: Record<string, any> = {};
    try {
      payload = JSON.parse(rawJson);
    } catch {
      payload = { raw: rawJson };
    }
    chunks.push({ resourceType, payload });
  }

  return chunks;
}
