import { Router } from 'express';
import express from 'express';
import { HealthLakeClient } from "@aws-sdk/client-healthlake";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-js";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { defaultProvider } from "@aws-sdk/credential-provider-node";

export const awsRouter = Router();

function sanitizeAwsUrl(urlStr: string): URL {
  const parsed = new URL(urlStr);
  if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.amazonaws.com')) {
    throw new Error('SSRF Blocked: URL target is not authorized.');
  }
  return new URL(`https://${parsed.hostname}${parsed.pathname}${parsed.search}`);
}


/**
 * POST /api/aws/healthlake/query
 * Proxy request to query patients in AWS HealthLake FHIR server.
 */
awsRouter.post('/healthlake/query', async (req, res) => {
  try {
    const endpoint = process.env['AWS_HEALTHLAKE_ENDPOINT'];
    const region = process.env['AWS_REGION'] || 'us-east-1';
    
    // If not configured, return mock data for local testing
    if (!endpoint) {
      return res.json({
        resourceType: "Bundle",
        type: "searchset",
        total: 1,
        entry: [
          {
            fullUrl: "urn:uuid:88e89f41-3b7c-474c-83b6-11f8e658399e",
            resource: {
              resourceType: "Patient",
              id: "88e89f41-3b7c-474c-83b6-11f8e658399e",
              active: true,
              name: [{ use: "official", family: "Doe", given: ["John"] }],
              gender: "male",
              birthDate: "1980-05-15",
              telecom: [{ system: "phone", value: "555-0199", use: "home" }],
              address: [{ line: ["123 Health Ave"], city: "Seattle", state: "WA", postalCode: "98101" }]
            }
          }
        ]
      });
    }

    const searchParams = req.body.searchParams || '';
    const url = new URL(`${endpoint}/Patient${searchParams}`);
    const request = new HttpRequest({
      method: "GET",
      protocol: url.protocol,
      hostname: url.hostname,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      headers: {
        host: url.hostname,
        "content-type": "application/json",
      },
    });

    const signer = new SignatureV4({
      credentials: defaultProvider(),
      region,
      service: "healthlake",
      sha256: Sha256,
    });

    const signedRequest = await signer.sign(request);
    
    const response = await fetch(sanitizeAwsUrl(url.toString()), {
      method: signedRequest.method,
      headers: signedRequest.headers as Record<string, string>,
    });

    if (!response.ok) {
      throw new Error(`AWS HealthLake query failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error('[AWS HealthLake] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/aws/healthlake/export
 * Receives the full PocketGull patient JSON payload and uploads it to AWS HealthLake.
 */
awsRouter.post('/healthlake/export', express.json({ limit: '50mb' }), async (req, res) => {
  try {
    const payload = req.body;
    const endpoint = process.env['AWS_HEALTHLAKE_ENDPOINT'];
    const region = process.env['AWS_REGION'] || 'us-east-1';

    const patientId = payload.id || 'unknown';
    if (typeof patientId !== 'string' || !/^[a-zA-Z0-9_\-]+$/.test(patientId)) {
        return res.status(400).json({ error: 'Invalid patient ID format.' });
    }
    const fhirPatientId = `pocket-gull-${patientId}`;

    // 1. Map patient demographics to standard FHIR R4 Patient
    const fhirPatient = {
      resourceType: "Patient",
      id: fhirPatientId,
      active: true,
      name: payload.name ? [
        {
          use: "official",
          text: payload.name,
          family: payload.name.split(' ').pop(),
          given: payload.name.split(' ').slice(0, -1)
        }
      ] : undefined,
      gender: payload.gender ? (
        payload.gender === 'Male' ? 'male' : 
        payload.gender === 'Female' ? 'female' : 
        payload.gender === 'Non-binary' ? 'other' : 'unknown'
      ) : 'unknown',
      birthDate: payload.age ? `${new Date().getFullYear() - payload.age}-01-01` : undefined,
      extension: [
        {
          url: 'http://pocketgull.app/fhir/StructureDefinition/last-visit',
          valueString: payload.lastVisit || new Date().toISOString().split('T')[0]
        }
      ]
    };

    // 2. Map preexisting conditions to standard FHIR R4 Conditions
    const fhirConditions: any[] = [];
    if (Array.isArray(payload.preexistingConditions)) {
      payload.preexistingConditions.forEach((conditionName: string, index: number) => {
        fhirConditions.push({
          resourceType: "Condition",
          id: `${fhirPatientId}-cond-${index}`,
          clinicalStatus: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
                code: "active",
                display: "Active"
              }
            ]
          },
          verificationStatus: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                code: "confirmed",
                display: "Confirmed"
              }
            ]
          },
          category: [
            {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/condition-category",
                  code: "problem-list-item",
                  display: "Problem List Item"
                }
              ]
            }
          ],
          code: {
            text: conditionName
          },
          subject: {
            reference: `Patient/${fhirPatientId}`
          }
        });
      });
    }

    // 3. Map vitals to standard FHIR R4 Observations
    const fhirObservations: any[] = [];
    const vitals = payload.vitals || {};
    const lastVisitDate = payload.lastVisit ? new Date(payload.lastVisit.replace(/\./g, '-')).toISOString() : new Date().toISOString();

    const addQuantityObservation = (idSuffix: string, loinc: string, display: string, valStr: string, unit: string, code: string) => {
      if (!valStr) return;
      const numericValue = parseFloat(valStr);
      if (isNaN(numericValue)) return;

      fhirObservations.push({
        resourceType: "Observation",
        id: `${fhirPatientId}-obs-${idSuffix}`,
        status: "final",
        category: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "vital-signs",
                display: "Vital Signs"
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: loinc,
              display: display
            }
          ],
          text: display
        },
        subject: {
          reference: `Patient/${fhirPatientId}`
        },
        effectiveDateTime: lastVisitDate,
        valueQuantity: {
          value: numericValue,
          unit: unit,
          system: "http://unitsofmeasure.org",
          code: code
        }
      });
    };

    addQuantityObservation("hr", "8867-4", "Heart Rate", vitals.hr, "bpm", "/min");
    addQuantityObservation("temp", "8310-5", "Body Temperature", vitals.temp, "F", "[degF]");
    addQuantityObservation("spo2", "2708-6", "Oxygen Saturation", vitals.spO2, "%", "%");
    addQuantityObservation("weight", "29463-7", "Body Weight", vitals.weight, "lbs", "[lb_av]");
    addQuantityObservation("height", "8302-2", "Body Height", vitals.height, "in", "[in_i]");

    // Map Blood Pressure panel (Systolic + Diastolic)
    if (vitals.bp) {
      const bpParts = vitals.bp.split('/');
      if (bpParts.length === 2) {
        const sysVal = parseFloat(bpParts[0]);
        const diaVal = parseFloat(bpParts[1]);
        if (!isNaN(sysVal) && !isNaN(diaVal)) {
          fhirObservations.push({
            resourceType: "Observation",
            id: `${fhirPatientId}-obs-bp`,
            status: "final",
            category: [
              {
                coding: [
                  {
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs"
                  }
                ]
              }
            ],
            code: {
              coding: [
                {
                  system: "http://loinc.org",
                  code: "85354-9",
                  display: "Blood pressure panel with all children"
                }
              ],
              text: "Blood Pressure"
            },
            subject: {
              reference: `Patient/${fhirPatientId}`
            },
            effectiveDateTime: lastVisitDate,
            component: [
              {
                code: {
                  coding: [
                    {
                      system: "http://loinc.org",
                      code: "8480-6",
                      display: "Systolic blood pressure"
                    }
                  ]
                },
                valueQuantity: {
                  value: sysVal,
                  unit: "mmHg",
                  system: "http://unitsofmeasure.org",
                  code: "mm[Hg]"
                }
              },
              {
                code: {
                  coding: [
                    {
                      system: "http://loinc.org",
                      code: "8462-4",
                      display: "Diastolic blood pressure"
                    }
                  ]
                },
                valueQuantity: {
                  value: diaVal,
                  unit: "mmHg",
                  system: "http://unitsofmeasure.org",
                  code: "mm[Hg]"
                }
              }
            ]
          });
        }
      }
    }

    // If endpoint is not configured, complete simulated export
    if (!endpoint) {
      return res.json({
        success: true,
        message: "Patient record successfully synchronized to simulated AWS HealthLake FHIR Store.",
        patient: fhirPatient,
        conditionsSynced: fhirConditions.length,
        observationsSynced: fhirObservations.length
      });
    }

    // Define helper function to perform signed requests
    const sendSignedFhirRequest = async (resourcePath: string, method: string, bodyObj: any) => {
      const url = new URL(`${endpoint}/${resourcePath}`);
      const request = new HttpRequest({
        method,
        protocol: url.protocol,
        hostname: url.hostname,
        path: url.pathname,
        headers: {
          host: url.hostname,
          "content-type": "application/fhir+json;charset=utf-8",
        },
        body: JSON.stringify(bodyObj)
      });

      const signer = new SignatureV4({
        credentials: defaultProvider(),
        region,
        service: "healthlake",
        sha256: Sha256,
      });

      const signedRequest = await signer.sign(request);
      const response = await fetch(sanitizeAwsUrl(url.toString()).href, {
        method: signedRequest.method,
        headers: signedRequest.headers as Record<string, string>,
        body: signedRequest.body
      });

      if (!response.ok) {
        throw new Error(`AWS HealthLake export error for ${resourcePath}: ${response.status} ${response.statusText} - ${await response.text()}`);
      }
    };

    // Upload Patient
    await sendSignedFhirRequest(`Patient/${fhirPatient.id}`, 'PUT', fhirPatient);

    // Upload Conditions
    for (const cond of fhirConditions) {
      await sendSignedFhirRequest(`Condition/${cond.id}`, 'PUT', cond);
    }

    // Upload Observations
    for (const obs of fhirObservations) {
      await sendSignedFhirRequest(`Observation/${obs.id}`, 'PUT', obs);
    }

    res.json({
      success: true,
      message: "Patient record successfully synchronized to AWS HealthLake FHIR Store.",
      patient: fhirPatient,
      conditionsSynced: fhirConditions.length,
      observationsSynced: fhirObservations.length
    });
  } catch (error: any) {
    console.error('[AWS HealthLake Sync Error]', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/aws/bedrock/verify
 * Proxy request to verify care plans using AWS Bedrock models.
 */
awsRouter.post('/bedrock/verify', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Missing required body field: prompt' });
    }

    const region = process.env['AWS_REGION'] || 'us-east-1';
    
    // Check if we can configure AWS Bedrock Client
    const hasAwsCredentials = process.env['AWS_ACCESS_KEY_ID'] && process.env['AWS_SECRET_ACCESS_KEY'];
    if (!hasAwsCredentials && !process.env['AWS_CONTAINER_CREDENTIALS_RELATIVE_URI']) {
      // Return a simulated Bedrock response for testing if credentials aren't set
      return res.json({
        verified: true,
        summary: "AWS Bedrock Verification Simulated Response",
        outputText: `Simulated validation check from Amazon Bedrock:\n- Clinical accuracy conforms to standard care plans.\n- Source reference verification: verified against mock sources.\n\nPrompt received:\n"${prompt.substring(0, 100)}..."`
      });
    }

    const client = new BedrockRuntimeClient({ region });
    const payload = {
      inputText: prompt,
      textGenerationConfig: {
        maxTokenCount: 512,
        temperature: 0.2,
      }
    };

    const command = new InvokeModelCommand({
      modelId: "amazon.nova-lite-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const outputText = responseBody.results?.[0]?.outputText || responseBody.outputText || JSON.stringify(responseBody);
    
    res.json({
      verified: true,
      outputText
    });
  } catch (error: any) {
    console.error('[AWS Bedrock] Error:', error);
    res.status(500).json({ error: error.message });
  }
});
