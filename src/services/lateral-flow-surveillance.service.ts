import { Injectable } from '@angular/core';

export type LateralFlowStatus = 'NEGATIVE' | 'WEAK_POSITIVE' | 'STRONG_POSITIVE' | 'INVALID_NO_CONTROL';

export interface ILateralFlowAnalysisResult {
  status: LateralFlowStatus;
  controlLinePeakIntensity: number; // 0.0 - 1.0
  testLinePeakIntensity: number; // 0.0 - 1.0
  relativeIntensityRatio: number; // Test / Control
  isValidTest: boolean;
  opticalDensityProfile: number[];
  pathogenTarget: string;
  epidemiologicalSurveillanceCode: string; // LOINC / SNOMED
  fhirObservationPayload: Record<string, unknown>;
  clinicalInterpretation: string;
}

@Injectable({
  providedIn: 'root'
})
export class LateralFlowSurveillanceService {
  private readonly CONTROL_LINE_MIN_THRESHOLD = 0.18;
  private readonly WEAK_POSITIVE_THRESHOLD = 0.06;
  private readonly STRONG_POSITIVE_THRESHOLD = 0.25;

  /**
   * Evaluates a 1D optical intensity line scan across a rapid diagnostic test strip.
   * Strip scanned from Sample Pad -> Test Line (T) -> Control Line (C) -> Absorbent Pad.
   */
  public analyzeStripIntensityProfile(
    intensityScan: number[],
    pathogenTarget = 'SARS-CoV-2 / Influenza A+B Rapid Antigen',
    loincCode = '94558-4'
  ): ILateralFlowAnalysisResult {
    const n = intensityScan.length;
    if (n < 20) {
      return this.generateInvalidResult(pathogenTarget, loincCode, 'Profile array too short for optical line identification.');
    }

    // Identify Test Region (indices ~30% to 55%) and Control Region (~60% to 85%)
    const testRegionStart = Math.floor(n * 0.28);
    const testRegionEnd = Math.floor(n * 0.55);
    const controlRegionStart = Math.floor(n * 0.58);
    const controlRegionEnd = Math.floor(n * 0.88);

    // Compute baseline background optical noise from pre-test strip zone (0 to 20%)
    const bgSamples = intensityScan.slice(0, Math.floor(n * 0.20));
    const backgroundNoise = bgSamples.length > 0 ? sum(bgSamples) / bgSamples.length : 0.0;

    // Peak search in Control Zone
    let maxControlVal = 0.0;
    for (let i = controlRegionStart; i < controlRegionEnd; i++) {
      const netVal = Math.max(0, intensityScan[i] - backgroundNoise);
      if (netVal > maxControlVal) maxControlVal = netVal;
    }

    // Peak search in Test Zone
    let maxTestVal = 0.0;
    for (let i = testRegionStart; i < testRegionEnd; i++) {
      const netVal = Math.max(0, intensityScan[i] - backgroundNoise);
      if (netVal > maxTestVal) maxTestVal = netVal;
    }

    // Check validity
    const isValid = maxControlVal >= this.CONTROL_LINE_MIN_THRESHOLD;
    if (!isValid) {
      return this.generateInvalidResult(
        pathogenTarget,
        loincCode,
        `Invalid Assay: Control line optical peak (${maxControlVal.toFixed(3)}) fell below diagnostic validation threshold (${this.CONTROL_LINE_MIN_THRESHOLD}). Repeat with fresh test cassette.`
      );
    }

    const ratio = Math.round((maxTestVal / maxControlVal) * 1000) / 1000;

    let status: LateralFlowStatus = 'NEGATIVE';
    let interpretation = `Negative for ${pathogenTarget}. Control line verified (${maxControlVal.toFixed(2)} OD). No test band detected (ratio: ${ratio}).`;

    if (ratio >= this.STRONG_POSITIVE_THRESHOLD) {
      status = 'STRONG_POSITIVE';
      interpretation = `Strong Positive for ${pathogenTarget} (Optical Ratio: ${ratio}). High viral/biomarker antigen concentration detected. Initiate infection control & clinical protocol.`;
    } else if (ratio >= this.WEAK_POSITIVE_THRESHOLD) {
      status = 'WEAK_POSITIVE';
      interpretation = `Weak / Faint Positive for ${pathogenTarget} (Optical Ratio: ${ratio}). Low-abundance antigen detected near lower limit of analytical sensitivity. Recommend confirmatory RT-qPCR or serial re-test in 24 hours.`;
    }

    // Construct FHIR R4 Observation representation
    const fhirObservation = {
      resourceType: 'Observation',
      status: 'final',
      category: [
        {
          coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'laboratory', display: 'Laboratory' }]
        }
      ],
      code: {
        coding: [{ system: 'http://loinc.org', code: loincCode, display: pathogenTarget }]
      },
      valueCodeableConcept: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: status === 'NEGATIVE' ? '260385009' : '10828004',
            display: status === 'NEGATIVE' ? 'Negative' : 'Positive'
          }
        ]
      },
      component: [
        {
          code: { text: 'Test-to-Control Optical Ratio' },
          valueQuantity: { value: ratio, unit: 'ratio', system: 'http://unitsofmeasure.org' }
        },
        {
          code: { text: 'Assay Validity' },
          valueString: isValid ? 'VALID' : 'INVALID'
        }
      ]
    };

    return {
      status,
      controlLinePeakIntensity: Math.round(maxControlVal * 1000) / 1000,
      testLinePeakIntensity: Math.round(maxTestVal * 1000) / 1000,
      relativeIntensityRatio: ratio,
      isValidTest: true,
      opticalDensityProfile: intensityScan,
      pathogenTarget,
      epidemiologicalSurveillanceCode: loincCode,
      fhirObservationPayload: fhirObservation,
      clinicalInterpretation: interpretation
    };
  }

  private generateInvalidResult(target: string, code: string, explanation: string): ILateralFlowAnalysisResult {
    return {
      status: 'INVALID_NO_CONTROL',
      controlLinePeakIntensity: 0.0,
      testLinePeakIntensity: 0.0,
      relativeIntensityRatio: 0.0,
      isValidTest: false,
      opticalDensityProfile: [],
      pathogenTarget: target,
      epidemiologicalSurveillanceCode: code,
      fhirObservationPayload: { resourceType: 'Observation', status: 'preliminary', error: 'INVALID_ASSAY' },
      clinicalInterpretation: explanation
    };
  }
}

function sum(arr: number[]): number {
  let s = 0;
  for (const v of arr) s += v;
  return s;
}
