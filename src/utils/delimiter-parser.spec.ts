import {
  parseDelimiterStream,
  parseClinicalCoTStream,
  parseWebMcpDispatchStream,
  parseTelemetryStream,
  parseVoiceAgentStream,
  parseFhirResourceStream
} from './delimiter-parser';

describe('Comprehensive 5-Paradigm Special Delimiter Token Parser Suite', () => {
  it('1. Parses Pair Medical Card stream text', () => {
    const rawStream = `
      <EVIDENCE>LEVEL_A|RoB2:Low Risk</EVIDENCE>
      <TITLE>Lisinopril in Diabetic Nephropathy RCT</TITLE>
      <TAKEAWAY>24% reduction in proteinuria over 12 weeks.</TAKEAWAY>
      <PATIENT_DELTA>Urine Albumin: 42 mg/g -> Target: <30 mg/g | Prescribe: Lisinopril 10mg</PATIENT_DELTA>
      <ANALOGY>Think of healthy kidney filters like a fine kitchen strainer.</ANALOGY>
      <SOCRATIC>Would you like to see how taking your morning blood pressure pill protects your kidney filters?</SOCRATIC>
      <SPANISH>El lisinopril reduce la proteína en la orina y protege sus riñones.</SPANISH>
    `;

    const card = parseDelimiterStream(rawStream);

    expect(card.title).toBe('Lisinopril in Diabetic Nephropathy RCT');
    expect(card.evidenceTier).toBe('LEVEL_A');
    expect(card.rob2Risk).toBe('Low Risk');
    expect(card.bottomLineTakeaway).toContain('24% reduction in proteinuria');
    expect(card.patientEducation.gradeLevel).toBe('Grade 6.2');
  });

  it('2. Parses Clinical CoT reasoning stream text', () => {
    const cotStream = `
      <NULL_HYPOTHESIS>H0: Symptoms reflect transient fatigue</NULL_HYPOTHESIS>
      <P_VALUE>p = 0.012</P_VALUE>
      <COCHRANE>Level A (RCT)</COCHRANE>
      <DIFFERENTIAL>Periodontal SIBI | Diabetic Glucotoxicity</DIFFERENTIAL>
      <SKEPTICAL_WARNING>Monitor 12-week HbA1c trajectory</SKEPTICAL_WARNING>
    `;

    const cot = parseClinicalCoTStream(cotStream);

    expect(cot.nullHypothesis).toContain('H0: Symptoms reflect transient fatigue');
    expect(cot.pValue).toBe('p = 0.012');
    expect(cot.cochraneTier).toBe('Level A (RCT)');
    expect(cot.differential.length).toBe(2);
    expect(cot.differential[0]).toBe('Periodontal SIBI');
    expect(cot.skepticalWarning).toContain('Monitor 12-week HbA1c');
  });

  it('3. Parses WebMCP autonomous tool dispatch call stream text', () => {
    const webmcpStream = `
      <TOOL_NAME>load_research_url</TOOL_NAME>
      <ARGS>{"url": "https://pubmed.ncbi.nlm.nih.gov/34215"}</ARGS>
    `;

    const call = parseWebMcpDispatchStream(webmcpStream);

    expect(call).not.toBeNull();
    expect(call?.toolName).toBe('load_research_url');
    expect(call?.args['url']).toBe('https://pubmed.ncbi.nlm.nih.gov/34215');
  });

  it('4. Parses bio-signal telemetry stream text', () => {
    const telemetryStream = `
      <ECG_PR_INTERVAL>142</ECG_PR_INTERVAL>
      <HRV_RMSSD>48</HRV_RMSSD>
      <AUTONOMIC_TONE>Parasympathetic Dominance</AUTONOMIC_TONE>
      <AROUSAL>Relaxed Homeostasis</AROUSAL>
    `;

    const telem = parseTelemetryStream(telemetryStream);

    expect(telem.prIntervalMs).toBe(142);
    expect(telem.hrvRmssdMs).toBe(48);
    expect(telem.autonomicTone).toBe('Parasympathetic Dominance');
  });

  it('5. Parses voice agent intent and disfluency stream text', () => {
    const voiceStream = `
      <SPEECH_INTENT>Symptom Report</SPEECH_INTENT>
      <EMOTIONAL_VALENCE>Anxious Grade 2</EMOTIONAL_VALENCE>
      <DISFLUENCY_REMOVED>Patient reported chest tightness after stairs.</DISFLUENCY_REMOVED>
      <AI_SPOKEN_RESPONSE>I hear that you experienced chest tightness. Let us check your vitals together.</AI_SPOKEN_RESPONSE>
    `;

    const voice = parseVoiceAgentStream(voiceStream);

    expect(voice.speechIntent).toBe('Symptom Report');
    expect(voice.emotionalValence).toBe('Anxious Grade 2');
    expect(voice.disfluencyRemovedText).toBe('Patient reported chest tightness after stairs.');
    expect(voice.aiSpokenResponse).toContain('I hear that you experienced chest tightness');
  });

  it('6. Parses FHIR R4 resource stream chunks', () => {
    const fhirStream = `
      <FHIR_RESOURCE type="Observation">{"resourceType": "Observation", "code": "883-9", "value": 72}</FHIR_RESOURCE>
      <FHIR_RESOURCE type="Condition">{"resourceType": "Condition", "code": "I10"}</FHIR_RESOURCE>
    `;

    const resources = parseFhirResourceStream(fhirStream);

    expect(resources.length).toBe(2);
    expect(resources[0].resourceType).toBe('Observation');
    expect(resources[0].payload['value']).toBe(72);
    expect(resources[1].resourceType).toBe('Condition');
  });
});
