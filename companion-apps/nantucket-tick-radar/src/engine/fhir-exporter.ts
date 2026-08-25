import { IDwellTimeAssessment, ICoInfectionScore, TickSpecies } from '../types.js';

export interface IFhirExportPayload {
  encounterDate: string;
  patientDeIdentifiedId: string;
  geographicLocus: string;
  tickSpecies: TickSpecies;
  dwellAssessment: IDwellTimeAssessment;
  coInfectionScores: ICoInfectionScore[];
  reportedSymptoms: string[];
  clinicalDirectives: string[];
}

export function generateFhirR4Bundle(payload: IFhirExportPayload): object {
  const timestamp = new Date().toISOString();
  const bundleId = `ack-tick-bundle-${Date.now()}`;

  return {
    resourceType: 'Bundle',
    id: bundleId,
    type: 'document',
    timestamp: timestamp,
    identifier: {
      system: 'urn:ietf:rfc:3986',
      value: `urn:uuid:${bundleId}`
    },
    entry: [
      {
        fullUrl: `urn:uuid:composition-${bundleId}`,
        resource: {
          resourceType: 'Composition',
          id: `comp-${bundleId}`,
          status: 'final',
          type: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '11488-4',
                display: 'Consultation note'
              }
            ],
            text: 'Nantucket Island Tick-Borne Disease Clinical Intake Assessment'
          },
          subject: {
            display: `De-Identified Patient (${payload.patientDeIdentifiedId})`
          },
          date: timestamp,
          author: [
            {
              display: 'PocketGull Nantucket Tick Defense Engine (FHIR R4 Core)'
            }
          ],
          title: 'Nantucket Cottage Hospital Emergency / Urgent Care Tick Hand-off Document',
          section: [
            {
              title: 'Vector Exposure & Dwell Time Assessment',
              code: {
                coding: [
                  {
                    system: 'http://snomed.info/sct',
                    code: '283680004',
                    display: 'Tick bite (disorder)'
                  }
                ]
              },
              text: {
                status: 'generated',
                div: `<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Geographic Locus:</b> ${payload.geographicLocus}</p><p><b>Identified Species:</b> ${payload.tickSpecies}</p><p><b>Estimated Attachment:</b> ${payload.dwellAssessment.estimatedHours} hours (${payload.dwellAssessment.dwellTier})</p><p><b>Single-Dose Doxycycline Prophylaxis:</b> ${payload.dwellAssessment.doxycyclineProphylaxisEligible ? 'INDICATED (within 72h window)' : 'NOT INDICATED'}</p></div>`
              }
            },
            {
              title: 'Multi-Vector Differential & Symptoms',
              text: {
                status: 'generated',
                div: `<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Active Symptoms:</b> ${payload.reportedSymptoms.join(', ') || 'None reported (asymptomatic acute bite)'}</p><p><b>Suspected Pathogen Top Vector:</b> ${payload.coInfectionScores[0]?.pathogenName} (${payload.coInfectionScores[0]?.probabilityPercent}%)</p></div>`
              }
            }
          ]
        }
      },
      {
        fullUrl: `urn:uuid:obs-dwell-${bundleId}`,
        resource: {
          resourceType: 'Observation',
          status: 'final',
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'exam'
                }
              ]
            }
          ],
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '283680004',
                display: 'Duration of tick attachment'
              }
            ],
            text: 'Tick Attachment Duration'
          },
          valueQuantity: {
            value: payload.dwellAssessment.estimatedHours,
            unit: 'hours',
            system: 'http://unitsofmeasure.org',
            code: 'h'
          }
        }
      },
      {
        fullUrl: `urn:uuid:flag-prophylaxis-${bundleId}`,
        resource: {
          resourceType: 'Flag',
          status: 'active',
          code: {
            text: payload.dwellAssessment.doxycyclineProphylaxisEligible
              ? 'IDSA 72-Hour Doxycycline Prophylaxis Indicated'
              : 'Standard 30-Day Symptom Watch Indicated'
          }
        }
      }
    ]
  };
}

export function generatePrintableClinicalSummary(payload: IFhirExportPayload): string {
  const dateStr = new Date().toLocaleString();
  return `================================================================================
NANTUCKET COTTAGE HOSPITAL / MGB CLINICAL INTAKE HAND-OFF
Nantucket Island Tick Defense & Co-Infection Radar
Generated: ${dateStr}
================================================================================

[PATIENT & EXPOSURE TELEMETRY]
De-Identified ID: ${payload.patientDeIdentifiedId}
Exposure Location: ${payload.geographicLocus}
Identified Species: ${payload.tickSpecies.toUpperCase()}
Estimated Dwell Time: ${payload.dwellAssessment.estimatedHours} hours (${payload.dwellAssessment.dwellTier})
Lyme Transmission Risk Index: ${payload.dwellAssessment.lymeTransmissionProbability}%

[PROPHYLAXIS ASSESSMENT - IDSA / CDC GUIDELINES]
72-Hour Doxycycline (200 mg) Eligible: ${payload.dwellAssessment.doxycyclineProphylaxisEligible ? 'YES (HIGH INDICATION)' : 'NO'}
Hours Remaining in 72h Window: ${payload.dwellAssessment.hoursRemainingIn72hWindow} hours
Clinical Recommendation:
${payload.dwellAssessment.clinicalRecommendation}

[PRESENTING SYMPTOM CLUSTER]
Reported Symptoms: ${payload.reportedSymptoms.length > 0 ? payload.reportedSymptoms.join(', ') : 'Asymptomatic acute tick bite'}

[MULTI-VECTOR CO-INFECTION DIFFERENTIAL]
${payload.coInfectionScores.map(s => `* ${s.pathogenName} (${s.organism}): ${s.probabilityPercent}% [${s.riskLevel}] -> ${s.clinicalFlag}`).join('\n')}

[ACTIONABLE DIRECTIVES FOR CLINICIAN]
1. If EM rash > 5 cm is present, treat as definitive early Lyme disease (10-14d Doxycycline).
2. If drenching sweats or dark urine present, order immediate Giemsa blood smear for Babesia microti.
3. If unexplained leukopenia or transaminitis, evaluate for Anaplasma phagocytophilum.
4. If single-dose prophylaxis is given, counsel patient that 30-day symptom vigilance is still mandatory.

Local Contact:
Nantucket Cottage Hospital Walk-in Clinic: 508-825-1000
Hospital Emergency Department: 57 Prospect Street, Nantucket, MA 02554
================================================================================`;
}
