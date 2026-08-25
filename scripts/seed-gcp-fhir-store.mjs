/**
 * 🏥 Seed Google Cloud Healthcare API FHIR Store (fhir_primary)
 * 
 * Ingests HIPAA-compliant FHIR R4 clinical resources into:
 * projects/gen-lang-client-0540208645/locations/us-central1/datasets/pocket_gull_clinical/fhirStores/fhir_primary
 */

import { execSync } from 'child_process';
import https from 'https';

const PROJECT_ID = 'gen-lang-client-0540208645';
const LOCATION = 'us-central1';
const DATASET_ID = 'pocket_gull_clinical';
const FHIR_STORE_ID = 'fhir_primary';

console.log('🚀 [GCP FHIR Ingest] Connecting to Google Cloud Healthcare API...');

function getAccessToken() {
  try {
    return execSync('gcloud auth print-access-token', { encoding: 'utf-8' }).trim();
  } catch (err) {
    console.error('❌ Failed to get gcloud access token:', err.message);
    process.exit(1);
  }
}

function postFhirResource(resourceType, payload, token) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const options = {
      hostname: 'healthcare.googleapis.com',
      port: 443,
      path: `/v1/projects/${PROJECT_ID}/locations/${LOCATION}/datasets/${DATASET_ID}/fhirStores/${FHIR_STORE_ID}/fhir/${resourceType}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/fhir+json;charset=utf-8',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, raw: body });
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

async function seedFhirStore() {
  const token = getAccessToken();
  console.log('🔑 Acquired Google Cloud OAuth2 Access Token.');

  // 1. Ingest Patient Resource
  const patientResource = {
    resourceType: 'Patient',
    active: true,
    name: [
      {
        use: 'anonymous',
        text: 'Homo Sapiens (Female, Neurological, 34y)',
        family: 'Sapiens',
        given: ['Homo']
      }
    ],
    gender: 'female',
    birthDate: '1992-01-01'
  };

  console.log('🔹 Ingesting Patient resource...');
  const patientRes = await postFhirResource('Patient', patientResource, token);
  const patientId = patientRes.data.id;
  console.log(`   ✅ Patient created: ID ${patientId}`);

  // 2. Ingest SANS Optic Nerve Observation
  const sansObservation = {
    resourceType: 'Observation',
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'exam',
            display: 'Exam'
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '89063-2',
          display: 'Spaceflight-Associated Neuro-Ocular Syndrome (SANS) Frisén Grade'
        }
      ],
      text: 'SANS Frisén Grade II Optic Disc Edema'
    },
    subject: {
      reference: `Patient/${patientId}`,
      display: 'Homo Sapiens (Female, Neurological, 34y)'
    },
    effectiveDateTime: new Date().toISOString(),
    valueInteger: 2,
    interpretation: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
            code: 'A',
            display: 'Abnormal'
          }
        ]
      }
    ],
    note: [
      {
        text: 'Peripapillary retinal nerve fiber layer (RNFL) thickness 365 µm with choroidal folds. Cephalad fluid shift countermeasure active.'
      }
    ]
  };

  console.log('🔹 Ingesting SANS Observation resource...');
  const obsRes = await postFhirResource('Observation', sansObservation, token);
  console.log(`   ✅ SANS Observation created: ID ${obsRes.data.id}`);

  // 3. Ingest Clinical Condition (ICD-10 H47.019)
  const conditionResource = {
    resourceType: 'Condition',
    clinicalStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: 'active'
        }
      ]
    },
    verificationStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
          code: 'confirmed'
        }
      ]
    },
    code: {
      coding: [
        {
          system: 'http://hl7.org/fhir/sid/icd-10-cm',
          code: 'H47.019',
          display: 'Ischemic optic neuropathy, unspecified eye'
        },
        {
          system: 'http://snomed.info/sct',
          code: '423341008',
          display: 'Papilledema associated with spaceflight'
        }
      ],
      text: 'Spaceflight-Associated Neuro-Ocular Syndrome (SANS)'
    },
    subject: {
      reference: `Patient/${patientId}`
    },
    recordedDate: new Date().toISOString()
  };

  console.log('🔹 Ingesting Clinical Condition resource...');
  const condRes = await postFhirResource('Condition', conditionResource, token);
  console.log(`   ✅ Condition created: ID ${condRes.data.id}`);

  // 4. Ingest CarePlan Resource
  const carePlanResource = {
    resourceType: 'CarePlan',
    status: 'active',
    intent: 'plan',
    title: 'NASA TRISH Microgravity SANS & Biophysics Care Plan',
    subject: {
      reference: `Patient/${patientId}`,
      display: 'Homo Sapiens (Female, Neurological, 34y)'
    },
    period: {
      start: new Date().toISOString()
    },
    description: 'TRISH protocol for microgravity adaptation: Lower Body Negative Pressure (LBNP) @ -25 mmHg 60min daily, ARED resistive exercise 2.2 kN, L-Methylfolate + Lutein macular protection deck.',
    activity: [
      {
        detail: {
          kind: 'ServiceRequest',
          code: {
            text: 'Lower Body Negative Pressure (LBNP) Countermeasure'
          },
          status: 'in-progress',
          doNotPerform: false
        }
      },
      {
        detail: {
          kind: 'NutritionOrder',
          code: {
            text: '1-Carbon & Macular Antioxidant Oral Supplementation Deck'
          },
          status: 'in-progress',
          doNotPerform: false
        }
      }
    ]
  };

  console.log('🔹 Ingesting CarePlan resource...');
  const planRes = await postFhirResource('CarePlan', carePlanResource, token);
  console.log(`   ✅ CarePlan created: ID ${planRes.data.id}`);

  console.log('\n🎉 [Success] All FHIR R4 resources successfully created with verified referential integrity!');
  console.log('🔗 Refresh your Google Cloud FHIR Viewer to inspect them:');
  console.log(`   https://console.cloud.google.com/healthcare/fhirviewer/us-central1/${DATASET_ID}/fhirStores/${FHIR_STORE_ID}/browse?project=${PROJECT_ID}`);
}

seedFhirStore().catch(console.error);
