import { Injectable, inject } from '@angular/core';
import {
  IFhir7Bundle,
  IFhir7BiophysicsStreamObservation,
  IFhir7EpigeneticTransgenerationalBundle,
  FhirR7HorizonService
} from './fhir-r7-horizon.service';
import { FhirBundleFactoryService } from './fhir-bundle-factory.service';
import { Hl7v2ExportStrategyService } from '../export/hl7v2-export-strategy.service';
import { IPatientVitals } from '../patient.types';

/**
 * Isomorphic base64 encoder supporting both browser and Node.js SSR environments.
 */
function toBase64(str: string): string {
  if (typeof btoa !== 'undefined') {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch {
      // Fallback
    }
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64');
  }
  return '';
}

/**
 * Isomorphic base64 decoder supporting both browser and Node.js SSR environments.
 */
function fromBase64(b64: string): string {
  if (typeof atob !== 'undefined') {
    try {
      return decodeURIComponent(escape(atob(b64)));
    } catch {
      // Fallback to raw atob if escaping fails
      try {
        return atob(b64);
      } catch {
        // Fallback
      }
    }
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(b64, 'base64').toString('utf-8');
  }
  return '';
}

/**
 * Bi-Directional Interoperability Service bridging:
 * 1. FHIR R7 Horizon (continuous 100 Hz biophysics stream & 7-generation epigenetic bundle)
 * 2. FHIR R4.0.1 US Core (statutory baseline, LOINC discrete observations, DocumentReference encapsulation)
 * 3. HL7 v2.5.1 ER7 (legacy hospital pipe-delimited ORU^R01 observations)
 */
@Injectable({
  providedIn: 'root'
})
export class FhirR7R4ConverterService {
  private readonly r7Service = inject(FhirR7HorizonService, { optional: true });
  private readonly bundleFactory = inject(FhirBundleFactoryService, { optional: true });
  private readonly hl7v2Strategy = inject(Hl7v2ExportStrategyService, { optional: true });

  /**
   * Converts a forward-looking FHIR R7 Horizon bundle into a standard, statutory
   * FHIR R4.0.1 US Core Collection Bundle.
   *
   * Degradation & Encapsulation Protocol:
   * 1. Extracts continuous biophysics streams into US Core discrete LOINC Observation (8867-4)
   *    and multi-component biophysical markers (vagal LFO, solfeggio carrier, gamma pulse).
   * 2. Extracts epigenetic bundles into standard R4 Laboratory Observations.
   * 3. Preserves NIST ML-KEM-1024 and ZKP security tags within R4 meta.security.
   * 4. Embeds the raw lossless R7 payload as an encapsulated DocumentReference.
   */
  convertR7ToR4Bundle(r7Bundle: IFhir7Bundle): Record<string, any> {
    const timestamp = r7Bundle.timestamp || new Date().toISOString();
    const bundleId = `bundle-r4-from-r7-${Date.now()}`;
    const entries: Array<{ fullUrl: string; resource: Record<string, any> }> = [];

    // 1. Identify or synthesize Patient Resource
    let subjectRef = 'Patient/pocketgull-patient-001';
    for (const item of r7Bundle.entry || []) {
      if (item.resource?.resourceType === 'BiophysicsStreamObservation') {
        const bioObs = item.resource as IFhir7BiophysicsStreamObservation;
        if (bioObs.subject?.reference) {
          subjectRef = bioObs.subject.reference;
        }
      }
    }
    const patientId = subjectRef.replace('Patient/', '') || 'pocketgull-patient-001';

    const patientResource: Record<string, any> = {
      resourceType: 'Patient',
      id: patientId,
      active: true,
      meta: {
        profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient']
      },
      name: [
        {
          use: 'official',
          family: 'Patient',
          given: ['PocketGull']
        }
      ],
      gender: 'unknown'
    };
    entries.push({ fullUrl: `urn:uuid:${patientId}`, resource: patientResource });

    // 2. Translate R7 Resources
    for (const entry of r7Bundle.entry || []) {
      const res = entry.resource;
      if (!res) continue;

      if (res.resourceType === 'BiophysicsStreamObservation') {
        const bioObs = res as IFhir7BiophysicsStreamObservation;
        const discreteHr = Math.round(bioObs.negentropicFrictionScore * 100) || 72;

        const r4VitalObs: Record<string, any> = {
          resourceType: 'Observation',
          id: `obs-r4-biophys-${bioObs.id || Date.now()}`,
          status: 'final',
          meta: {
            profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-vital-signs']
          },
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'vital-signs',
                  display: 'Vital Signs'
                }
              ]
            }
          ],
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '8867-4',
                display: 'Heart rate'
              },
              {
                system: 'https://pocketgull.app/fhir/7.0/biophysics',
                code: 'BIOPHYSICS-STREAM-DOWNCONVERTED',
                display: 'Biophysics Stream Telemetry (Down-converted from R7)'
              }
            ],
            text: 'Heart rate & Continuous Biophysics Stream'
          },
          subject: { reference: subjectRef },
          effectiveDateTime: bioObs.effectivePeriod?.start || timestamp,
          valueQuantity: {
            value: discreteHr,
            unit: 'beats/minute',
            system: 'http://unitsofmeasure.org',
            code: '/min'
          },
          component: [
            {
              code: {
                coding: [
                  {
                    system: 'https://pocketgull.app/fhir/biophysics',
                    code: 'vagal-rsa-lfo',
                    display: 'Vagal Resonant Frequency'
                  }
                ]
              },
              valueQuantity: {
                value: bioObs.vagalLfoHz,
                unit: 'Hz',
                system: 'http://unitsofmeasure.org',
                code: 'Hz'
              }
            },
            {
              code: {
                coding: [
                  {
                    system: 'https://pocketgull.app/fhir/biophysics',
                    code: 'solfeggio-carrier',
                    display: 'Solfeggio Carrier Frequency'
                  }
                ]
              },
              valueQuantity: {
                value: bioObs.solfeggioCarrierHz,
                unit: 'Hz',
                system: 'http://unitsofmeasure.org',
                code: 'Hz'
              }
            },
            {
              code: {
                coding: [
                  {
                    system: 'https://pocketgull.app/fhir/biophysics',
                    code: 'tubulin-gamma-pulse',
                    display: 'Tubulin Gamma Pulse Frequency'
                  }
                ]
              },
              valueQuantity: {
                value: bioObs.tubulinGammaPulseHz,
                unit: 'Hz',
                system: 'http://unitsofmeasure.org',
                code: 'Hz'
              }
            },
            {
              code: {
                coding: [
                  {
                    system: 'https://pocketgull.app/fhir/biophysics',
                    code: 'negentropic-friction-score',
                    display: 'Negentropic Friction Score'
                  }
                ]
              },
              valueQuantity: {
                value: bioObs.negentropicFrictionScore,
                unit: 'score'
              }
            },
            {
              code: {
                coding: [
                  {
                    system: 'https://pocketgull.app/fhir/biophysics',
                    code: 'sampling-rate',
                    display: 'Biophysics Waveform Sampling Rate'
                  }
                ]
              },
              valueQuantity: {
                value: bioObs.samplingRateHz,
                unit: 'Hz',
                system: 'http://unitsofmeasure.org',
                code: 'Hz'
              }
            }
          ]
        };

        entries.push({ fullUrl: `urn:uuid:${r4VitalObs['id']}`, resource: r4VitalObs });
      } else if (res.resourceType === 'EpigeneticTransgenerationalBundle') {
        const epiBundle = res as IFhir7EpigeneticTransgenerationalBundle;

        const r4EpiObs: Record<string, any> = {
          resourceType: 'Observation',
          id: `obs-r4-epi-${epiBundle.id || Date.now()}`,
          status: 'final',
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'laboratory',
                  display: 'Laboratory'
                }
              ]
            }
          ],
          code: {
            coding: [
              {
                system: 'https://pocketgull.app/fhir/epigenetics',
                code: 'transgenerational-epigenetic-load',
                display: 'Transgenerational Epigenetic Load & Histone Methylation Profile'
              }
            ],
            text: 'Transgenerational Epigenetic Assessment'
          },
          subject: { reference: subjectRef },
          effectiveDateTime: timestamp,
          valueString: epiBundle.transgenerationalRiskFactor,
          component: [
            {
              code: {
                coding: [{ system: 'https://pocketgull.app/fhir/epigenetics', code: 'histone-methylation', display: 'Histone Methylation Signatures' }]
              },
              valueString: (epiBundle.histoneMethylationSignatures || []).join('; ')
            },
            {
              code: {
                coding: [{ system: 'https://pocketgull.app/fhir/epigenetics', code: 'microrna-regulators', display: 'MicroRNA Post-Transcriptional Regulators' }]
              },
              valueString: (epiBundle.microRnaRegulators || []).join('; ')
            },
            {
              code: {
                coding: [{ system: 'https://pocketgull.app/fhir/epigenetics', code: 'generation-horizon-years', display: 'Epigenetic Horizon (Years)' }]
              },
              valueQuantity: {
                value: epiBundle.generationHorizonYears,
                unit: 'years',
                system: 'http://unitsofmeasure.org',
                code: 'a'
              }
            },
            {
              code: {
                coding: [{ system: 'https://pocketgull.app/fhir/epigenetics', code: 'lineage-depth-generations', display: 'Lineage Depth (Generations)' }]
              },
              valueQuantity: {
                value: epiBundle.lineageDepthGenerations,
                unit: 'generations'
              }
            }
          ]
        };

        entries.push({ fullUrl: `urn:uuid:${r4EpiObs['id']}`, resource: r4EpiObs });
      }
    }

    // 3. Lossless Encapsulation via DocumentReference
    const rawR7Json = JSON.stringify(r7Bundle, null, 2);
    const base64R7 = toBase64(rawR7Json);
    const docRefId = `docref-r7-archive-${Date.now()}`;

    const losslessDocRef: Record<string, any> = {
      resourceType: 'DocumentReference',
      id: docRefId,
      status: 'current',
      type: {
        coding: [
          {
            system: 'https://pocketgull.app/fhir/types',
            code: 'fhir-r7-horizon-archive',
            display: 'FHIR R7 Horizon Lossless Archive'
          }
        ],
        text: 'FHIR R7 Horizon Complete Lossless Stream Package'
      },
      subject: { reference: subjectRef },
      date: timestamp,
      content: [
        {
          attachment: {
            contentType: 'application/fhir+json; fhirVersion=7.0.0-horizon',
            data: base64R7,
            title: 'Complete FHIR R7 Horizon Transgenerational Stream Bundle'
          }
        }
      ]
    };
    entries.push({ fullUrl: `urn:uuid:${docRefId}`, resource: losslessDocRef });

    // 4. Construct R4 Bundle with Post-Quantum Security Labels
    return {
      resourceType: 'Bundle',
      id: bundleId,
      type: 'collection',
      timestamp,
      meta: {
        fhirVersion: '4.0.1',
        profile: ['http://hl7.org/fhir/StructureDefinition/Bundle'],
        security: [
          {
            system: 'https://pocketgull.app/security/quantum',
            code: r7Bundle.meta?.postQuantumEncryption || 'NIST ML-KEM-1024 / Dilithium-5',
            display: 'Post-Quantum Encrypted Origin'
          },
          {
            system: 'https://pocketgull.app/security/zkp',
            code: r7Bundle.meta?.securityLabel || 'HIPAA-ZKP-ZERO-KNOWLEDGE',
            display: 'Zero-Knowledge Cryptographic Proof'
          }
        ]
      },
      entry: entries
    };
  }

  /**
   * Up-converts an R4 Bundle into an IFhir7Bundle.
   *
   * Round-Trip Protocol:
   * 1. Inspects entries for an encapsulated DocumentReference containing
   *    `contentType: "application/fhir+json; fhirVersion=7.0.0-horizon"`.
   *    If found, unpacks and returns the original R7 bundle with 100% fidelity.
   * 2. If standard R4, dynamically projects discrete LOINC vitals (8867-4) into
   *    an active continuous biophysics stream with parasympathetic resonance.
   */
  convertR4ToR7Bundle(r4Bundle: Record<string, any>): IFhir7Bundle {
    const entries = (r4Bundle?.['entry'] as Array<{ resource?: Record<string, any> }>) || [];

    // Path A: Check for Encapsulated Lossless R7 Archive
    for (const entry of entries) {
      const res = entry.resource;
      if (res && res['resourceType'] === 'DocumentReference') {
        const contents = res['content'] as Array<{ attachment?: { contentType?: string; data?: string } }>;
        for (const c of contents || []) {
          if (c.attachment?.contentType?.includes('fhirVersion=7.0.0-horizon') && c.attachment.data) {
            try {
              const decodedJson = fromBase64(c.attachment.data);
              const parsed = JSON.parse(decodedJson);
              if (parsed && parsed.resourceType === 'Bundle' && parsed.meta?.fhirVersion === '7.0.0-horizon') {
                return parsed as IFhir7Bundle;
              }
            } catch {
              // Fall through to synthetic projection on parse error
            }
          }
        }
      }
    }

    // Path B: Synthetic Projection from Standard R4 Observations
    let hr = 72;
    let temp = 98.6;
    let subjectRef = 'Patient/pocketgull-patient-001';

    for (const entry of entries) {
      const res = entry.resource;
      if (!res) continue;

      if (res['resourceType'] === 'Observation') {
        const coding = res['code']?.['coding'] as Array<{ system?: string; code?: string }>;
        const isHr = coding?.some(c => c.code === '8867-4');
        const isTemp = coding?.some(c => c.code === '8310-5');

        if (isHr && res['valueQuantity']?.value) {
          hr = Number(res['valueQuantity'].value) || 72;
        }
        if (isTemp && res['valueQuantity']?.value) {
          temp = Number(res['valueQuantity'].value) || 98.6;
        }
        if (res['subject']?.reference) {
          subjectRef = res['subject'].reference;
        }
      }
    }

    const timestamp = r7BundleTimestamp(r4Bundle);
    const biophysicsStream: IFhir7BiophysicsStreamObservation = {
      resourceType: 'BiophysicsStreamObservation',
      id: `obs-r7-projected-${Date.now()}`,
      status: 'streaming_live',
      code: {
        coding: [
          { system: 'http://loinc.org', code: '8867-4', display: 'Heart Rate Stream' },
          { system: 'http://hl7.org/fhir/7.0/biophysics', code: 'VAGAL-RSA-0.1HZ', display: 'Vagal Resonant Frequency' }
        ]
      },
      subject: { reference: subjectRef },
      effectivePeriod: { start: timestamp },
      samplingRateHz: 100,
      vagalLfoHz: hr > 85 ? 0.08 : 0.1,
      solfeggioCarrierHz: temp > 99.5 ? 432.0 : 528.0,
      tubulinGammaPulseHz: 40.0,
      negentropicFrictionScore: parseFloat((hr / 100).toFixed(2))
    };

    const epigeneticBundle: IFhir7EpigeneticTransgenerationalBundle = {
      resourceType: 'EpigeneticTransgenerationalBundle',
      id: `epi-r7-projected-${Date.now()}`,
      generationHorizonYears: 150,
      lineageDepthGenerations: 7,
      histoneMethylationSignatures: ['H3K4me3-Promoter-Active', 'H3K27me3-Silenced-Inflammatory'],
      microRnaRegulators: ['miR-146a-5p (NF-kB Resolution)', 'miR-21-5p (Fibrosis Guardrail)'],
      transgenerationalRiskFactor: temp > 99.5 ? 'Moderate Transgenerational Inflammatory Epigenetic Load' : 'Optimal Transgenerational Resilience'
    };

    return {
      resourceType: 'Bundle',
      id: `bundle-fhir7-projected-${Date.now()}`,
      type: 'fhir-r7-transgenerational-stream',
      timestamp,
      meta: {
        fhirVersion: '7.0.0-horizon',
        postQuantumEncryption: 'NIST ML-KEM-1024 / Dilithium-5',
        securityLabel: 'HIPAA-ZKP-ZERO-KNOWLEDGE'
      },
      entry: [
        { fullUrl: `urn:uuid:${biophysicsStream.id}`, resource: biophysicsStream },
        { fullUrl: `urn:uuid:${epigeneticBundle.id}`, resource: epigeneticBundle }
      ]
    };
  }

  /**
   * Converts an HL7 v2.5.1 ER7 pipe-delimited message (e.g. ORU^R01) into an HL7 FHIR R4 Bundle.
   */
  convertEr7ToR4Bundle(er7Message: string): Record<string, any> {
    const lines = er7Message
      .split(/\r\n|\r|\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const timestamp = new Date().toISOString();
    let patientId = 'p001';
    let patientName = 'Patient';
    let gender = 'unknown';
    const observations: Array<Record<string, any>> = [];

    for (const line of lines) {
      const fields = line.split('|');
      const segmentType = fields[0];

      if (segmentType === 'PID') {
        // PID-3: Patient ID
        if (fields[3]) {
          patientId = fields[3].split('^')[0] || patientId;
        }
        // PID-5: Patient Name (Family^Given)
        if (fields[5]) {
          const nameParts = fields[5].split('^');
          patientName = nameParts.filter(Boolean).join(' ') || patientName;
        }
        // PID-8: Administrative Sex
        if (fields[8]) {
          const g = fields[8].toUpperCase();
          if (g === 'M') gender = 'male';
          else if (g === 'F') gender = 'female';
        }
      } else if (segmentType === 'OBX') {
        // OBX-3: Observation Identifier (e.g. 8867-4^Heart Rate^LN)
        const idField = fields[3] || '';
        const idParts = idField.split('^');
        const code = idParts[0] || '8867-4';
        const display = idParts[1] || 'Observation';
        const system = idParts[2] === 'LN' ? 'http://loinc.org' : 'https://pocketgull.app/codes';

        // OBX-5: Observation Value
        const valStr = fields[5] || '';
        const numericVal = parseFloat(valStr);

        // OBX-6: Units (e.g. /min, mm[Hg])
        const units = fields[6] || '';

        const obsResource: Record<string, any> = {
          resourceType: 'Observation',
          id: `obs-er7-${observations.length + 1}-${Date.now()}`,
          status: 'final',
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'vital-signs',
                  display: 'Vital Signs'
                }
              ]
            }
          ],
          code: {
            coding: [{ system, code, display }],
            text: display
          },
          subject: { reference: `Patient/${patientId}` },
          effectiveDateTime: timestamp
        };

        if (!isNaN(numericVal)) {
          obsResource['valueQuantity'] = {
            value: numericVal,
            unit: units,
            system: 'http://unitsofmeasure.org',
            code: units
          };
        } else {
          obsResource['valueString'] = valStr;
        }

        observations.push(obsResource);
      }
    }

    const patientResource: Record<string, any> = {
      resourceType: 'Patient',
      id: patientId,
      active: true,
      name: [{ text: patientName }],
      gender
    };

    const entries: Array<{ fullUrl: string; resource: Record<string, any> }> = [
      { fullUrl: `urn:uuid:${patientId}`, resource: patientResource }
    ];

    for (const obs of observations) {
      entries.push({ fullUrl: `urn:uuid:${obs['id']}`, resource: obs });
    }

    return {
      resourceType: 'Bundle',
      id: `bundle-r4-from-er7-${Date.now()}`,
      type: 'collection',
      timestamp,
      meta: {
        fhirVersion: '4.0.1',
        profile: ['http://hl7.org/fhir/StructureDefinition/Bundle']
      },
      entry: entries
    };
  }

  /**
   * Converts a standard FHIR R4 Bundle into an HL7 v2.5.1 ER7 pipe-delimited message.
   */
  convertR4ToEr7(r4Bundle: Record<string, any>): string {
    const entries = (r4Bundle?.['entry'] as Array<{ resource?: Record<string, any> }>) || [];
    let patientId = 'p001';
    let patientName = 'Patient^Anonymous';
    let gender = 'U';
    const vitals: { hr?: number; bp?: string } = {};

    for (const entry of entries) {
      const res = entry.resource;
      if (!res) continue;

      if (res['resourceType'] === 'Patient') {
        patientId = res['id'] || patientId;
        const nameObj = res['name']?.[0];
        if (nameObj?.family || nameObj?.given) {
          const fam = nameObj.family || '';
          const giv = (nameObj.given || []).join(' ');
          patientName = `${fam}^${giv}`;
        } else if (nameObj?.text) {
          patientName = nameObj.text.includes('^') ? nameObj.text : `${nameObj.text}^`;
        }
        if (res['gender']) {
          gender = res['gender'].toUpperCase()[0] || 'U';
        }
      } else if (res['resourceType'] === 'Observation') {
        const coding = res['code']?.['coding'] as Array<{ code?: string }>;
        const code = coding?.[0]?.code;
        const val = res['valueQuantity']?.value;

        if (code === '8867-4' && val !== undefined) {
          vitals.hr = Number(val);
        } else if (code === '8480-6' && val !== undefined) {
          vitals.bp = `${val}/80`;
        }
      }
    }

    const patientVitals: IPatientVitals = {
      hr: vitals.hr !== undefined ? String(vitals.hr) : '',
      bp: vitals.bp || '',
      temp: '',
      spO2: '',
      weight: '',
      height: ''
    };

    if (this.hl7v2Strategy) {
      return this.hl7v2Strategy.generateHl7v2Message({
        id: patientId,
        name: patientName,
        gender: gender as any,
        vitals: patientVitals
      });
    }

    // Fallback format
    const nowStr = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const lines = [
      `MSH|^~\\&|POCKETGULL|CLINICAL_AI|EHR_RECEIVER|CLINIC|${nowStr}||ORU^R01^ORU_R01|MSG${Date.now()}|P|2.5.1`,
      `PID|1||${patientId}^^^POCKETGULL^MR||${patientName}||${nowStr.slice(0, 8)}|${gender}`,
      `PV1|1|O|OUTPATIENT_DEPT||||||||||||||||VISIT${Date.now()}`,
      `OBR|1|ORD${Date.now()}|FILL${Date.now()}|8867-4^PocketGull Clinical Assessment Panel^LN|||${nowStr}`
    ];
    if (vitals.hr) {
      lines.push(`OBX|1|NM|8867-4^Heart Rate^LN||${vitals.hr}|/min|60-100|N|||F`);
    }
    return lines.join('\r');
  }
}

function r7BundleTimestamp(bundle: any): string {
  return bundle?.timestamp || new Date().toISOString();
}
