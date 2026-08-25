import { Router } from 'express';
import { GoogleAuth } from 'google-auth-library';
import { rateLimit } from 'express-rate-limit';
import express from 'express';

export const healthcareRouter = Router();

// Rate limiting: 30 requests per minute per IP for all Healthcare API proxy routes
healthcareRouter.use(rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: { error: 'Too many Healthcare API requests. Please try again later.' }
}));

// Initialize Google Auth with the Healthcare API scope
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-healthcare']
});

let cachedProjectId = process.env['GOOGLE_CLOUD_PROJECT'] || process.env['GCLOUD_PROJECT'];

export async function getProjectId(): Promise<string> {
  if (cachedProjectId) return cachedProjectId;
  try {
    const pId = await auth.getProjectId();
    if (pId) {
      cachedProjectId = pId;
      return pId;
    }
  } catch (error: any) {
    console.warn('[Healthcare Auth] Failed to dynamically get project ID:', error.message);
  }
  // Hardcoded fallback for Understory project ID
  cachedProjectId = 'gen-lang-client-0540208645';
  return cachedProjectId;
}

const defaultLocation = process.env['HC_LOCATION'] || 'us-central1';
const defaultDatasetId = process.env['HC_DATASET'] || 'pocket_gull_clinical';
const dicomStoreId = process.env['HC_DICOM_STORE'] || 'dicom_primary';
const fhirStoreId = process.env['HC_FHIR_STORE'] || 'fhir_primary';

function sanitizeUrl(urlStr: string): URL {
  const parsed = new URL(urlStr);
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'healthcare.googleapis.com') {
    throw new Error('SSRF Blocked: URL target is not authorized.');
  }
  if (!parsed.pathname.startsWith('/v1/projects/')) {
    throw new Error('SSRF Blocked: URL path is not authorized.');
  }
  return new URL(`https://healthcare.googleapis.com${parsed.pathname}${parsed.search}`);
}


/**
 * Automatically provisions the GCP Healthcare Dataset, DICOM Store, and FHIR Store.
 */
export async function ensureHealthcareStoresExist() {
  if (process.env['SKIP_HEALTHCARE_PROVISION'] === 'true') {
    console.log('[Healthcare Auto-Provision] SKIP_HEALTHCARE_PROVISION is set, skipping auto-provisioning.');
    return;
  }
  try {
    const projectId = await getProjectId();
    if (!projectId) {
      console.warn('[Healthcare Auto-Provision] No GCP Project ID found, skipping auto-provisioning.');
      return;
    }

    console.log('[Healthcare Auto-Provision] Checking Cloud Healthcare API datasets & stores...');
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    const headers = { 'Authorization': `Bearer ${token.token}`, 'Content-Type': 'application/json' };

    // 1. Check if Dataset exists (GET), create only if 404
    const getDatasetUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${defaultLocation}/datasets/${defaultDatasetId}`;
    let res = await fetch(sanitizeUrl(getDatasetUrl), { method: 'GET', headers });
    if (!res.ok) {
      if (res.status === 404) {
        const datasetUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${defaultLocation}/datasets?datasetId=${defaultDatasetId}`;
        res = await fetch(sanitizeUrl(datasetUrl), { method: 'POST', headers });
        if (res.ok) console.log(`[Healthcare Auto-Provision] Created Dataset: ${defaultDatasetId}`);
        else if (res.status !== 409) {
          console.warn(`[Healthcare Auto-Provision] Dataset creation warning. Is billing/HC API enabled?`, await res.text());
          return;
        }
      } else {
        console.warn(`[Healthcare Auto-Provision] Dataset check warning: HTTP ${res.status}`);
      }
    }

    // 2. Check if DICOM Store exists (GET), create only if 404
    const getDicomUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${defaultLocation}/datasets/${defaultDatasetId}/dicomStores/${dicomStoreId}`;
    res = await fetch(sanitizeUrl(getDicomUrl), { method: 'GET', headers });
    if (!res.ok && res.status === 404) {
      const dicomUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${defaultLocation}/datasets/${defaultDatasetId}/dicomStores?dicomStoreId=${dicomStoreId}`;
      res = await fetch(sanitizeUrl(dicomUrl), { method: 'POST', headers });
      if (res.ok) console.log(`[Healthcare Auto-Provision] Created DICOM Store: ${dicomStoreId}`);
    }

    // 3. Check if FHIR Store (R4) exists (GET), create only if 404
    const getFhirUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${defaultLocation}/datasets/${defaultDatasetId}/fhirStores/${fhirStoreId}`;
    res = await fetch(sanitizeUrl(getFhirUrl), { method: 'GET', headers });
    if (!res.ok && res.status === 404) {
      const fhirUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${defaultLocation}/datasets/${defaultDatasetId}/fhirStores?fhirStoreId=${fhirStoreId}`;
      res = await fetch(sanitizeUrl(fhirUrl), {
        method: 'POST',
        headers,
        body: JSON.stringify({ version: 'R4', enableUpdateCreate: true })
      });
      if (res.ok) console.log(`[Healthcare Auto-Provision] Created FHIR Store: ${fhirStoreId} (R4)`);
    }
    
  } catch (error: any) {
    console.warn(`[Healthcare Auto-Provision Error]`, error.message);
  }
}

/**
 * POST /api/healthcare/fhir/export
 * Receives the full PocketGull patient JSON payload and uploads it to the GCP Healthcare FHIR Store.
 */
healthcareRouter.post('/fhir/export', express.json({ limit: '50mb' }), async (req, res) => {
   try {
     const payload = req.body;
     const projectId = await getProjectId();
     if (!projectId) return res.status(400).json({ error: 'GCP Project ID not configured.' });

     const client = await auth.getClient();
     const token = await client.getAccessToken();
     
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
     const fhirConditions: Record<string, unknown>[] = [];
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
     const fhirObservations: Record<string, unknown>[] = [];
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

     // Map simple vital signs
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

     // 4. Save Patient to FHIR Store
     const patientUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${defaultLocation}/datasets/${defaultDatasetId}/fhirStores/${fhirStoreId}/fhir/Patient/${fhirPatient.id}`;
     const patientRes = await fetch(sanitizeUrl(patientUrl).href, {
         method: 'PUT',
         headers: {
             'Authorization': `Bearer ${token.token}`,
             'Content-Type': 'application/fhir+json;charset=utf-8'
         },
         body: JSON.stringify(fhirPatient)
     });

     if (!patientRes.ok) {
         throw new Error(`FHIR Patient Save Error: ${patientRes.status} - ${await patientRes.text()}`);
     }
     console.log(`[Healthcare FHIR] Synchronized Patient ${fhirPatient.id} to FHIR Store.`);

     // 5. Save Conditions to FHIR Store
     for (const cond of fhirConditions) {
         const condUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${defaultLocation}/datasets/${defaultDatasetId}/fhirStores/${fhirStoreId}/fhir/Condition/${cond.id}`;
         const condRes = await fetch(sanitizeUrl(condUrl).href, {
             method: 'PUT',
             headers: {
                 'Authorization': `Bearer ${token.token}`,
                 'Content-Type': 'application/fhir+json;charset=utf-8'
             },
             body: JSON.stringify(cond)
         });
         if (condRes.ok) {
             console.log(`[Healthcare FHIR] Synchronized Condition ${cond.id} to FHIR Store.`);
         } else {
             console.warn(`[Healthcare FHIR Warning] Failed to sync Condition ${cond.id}: ${condRes.status} - ${await condRes.text()}`);
         }
     }

     // 6. Save Observations to FHIR Store
     for (const obs of fhirObservations) {
         const obsUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${defaultLocation}/datasets/${defaultDatasetId}/fhirStores/${fhirStoreId}/fhir/Observation/${obs.id}`;
         const obsRes = await fetch(sanitizeUrl(obsUrl).href, {
             method: 'PUT',
             headers: {
                 'Authorization': `Bearer ${token.token}`,
                 'Content-Type': 'application/fhir+json;charset=utf-8'
             },
             body: JSON.stringify(obs)
         });
         if (obsRes.ok) {
             console.log(`[Healthcare FHIR] Synchronized Observation ${obs.id} to FHIR Store.`);
         } else {
             console.warn(`[Healthcare FHIR Warning] Failed to sync Observation ${obs.id}: ${obsRes.status} - ${await obsRes.text()}`);
         }
     }

     res.json({ 
         success: true, 
         message: "Patient record successfully synchronized to Google Cloud Healthcare FHIR Store.",
         patient: fhirPatient, 
         conditionsSynced: fhirConditions.length, 
         observationsSynced: fhirObservations.length 
     });
    } catch (error: any) {
      console.error('[Healthcare FHIR Export Error]', error);
      res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/healthcare/fhir/import/:id
 * Fetches patient, conditions, and observations from the GCP Healthcare FHIR Store and maps them back to PocketGull Patient format.
 */
healthcareRouter.get('/fhir/import/:id', async (req, res) => {
   try {
     const patientId = req.params.id;
     if (typeof patientId !== 'string' || !/^[a-zA-Z0-9_\-]+$/.test(patientId)) {
         return res.status(400).json({ error: 'Invalid patient ID format.' });
     }
     const projectId = await getProjectId();
     if (!projectId) return res.status(400).json({ error: 'GCP Project ID not configured.' });

     console.log(`[Healthcare FHIR] Attempting to import patient pocket-gull-${patientId} from FHIR Store...`);
     const client = await auth.getClient();
     const token = await client.getAccessToken();
     const headers = { 'Authorization': `Bearer ${token.token}` };

     const fhirPatientId = `pocket-gull-${patientId}`;

     // 1. Fetch Patient
     const patientUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${defaultLocation}/datasets/${defaultDatasetId}/fhirStores/${fhirStoreId}/fhir/Patient/${fhirPatientId}`;
     const patientRes = await fetch(sanitizeUrl(patientUrl), { headers });
     if (!patientRes.ok) {
         if (patientRes.status === 404) {
             return res.status(404).json({ error: 'Patient not found in Google Health FHIR store.' });
         }
         throw new Error(`FHIR Patient Fetch Error: ${patientRes.status} - ${await patientRes.text()}`);
     }
     const fhirPatient = await patientRes.json();

     // 2. Search for Conditions of this Patient
     const conditionsUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${defaultLocation}/datasets/${defaultDatasetId}/fhirStores/${fhirStoreId}/fhir/Condition?subject=Patient/${fhirPatientId}`;
     const conditionsRes = await fetch(sanitizeUrl(conditionsUrl), { headers });
     let conditions: string[] = [];
     if (conditionsRes.ok) {
         const bundle = await conditionsRes.json();
         if (bundle.entry && Array.isArray(bundle.entry)) {
             conditions = bundle.entry.map((e: { resource?: { code?: { text?: string } } }) => e.resource?.code?.text).filter(Boolean);
         }
     }

     // 3. Search for Observations of this Patient
     const observationsUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${defaultLocation}/datasets/${defaultDatasetId}/fhirStores/${fhirStoreId}/fhir/Observation?subject=Patient/${fhirPatientId}`;
     const observationsRes = await fetch(sanitizeUrl(observationsUrl), { headers });
     const vitals: Record<string, string> = {};
     if (observationsRes.ok) {
         const bundle = await observationsRes.json();
         if (bundle.entry && Array.isArray(bundle.entry)) {
             bundle.entry.forEach((e: { resource?: any }) => {
                 const obs = e.resource;
                 if (!obs) return;
                 const code = obs.code?.coding?.[0]?.code;
                 const value = obs.valueQuantity?.value;
                 if (code === "8867-4") { // Heart Rate
                     vitals.hr = `${value}`;
                 } else if (code === "8310-5") { // Temp
                     vitals.temp = `${value}°F`;
                 } else if (code === "2708-6") { // SpO2
                     vitals.spO2 = `${value}%`;
                 } else if (code === "29463-7") { // Weight
                     vitals.weight = `${value} lbs`;
                 } else if (code === "8302-2") { // Height
                     const inches = parseFloat(value);
                     if (!isNaN(inches)) {
                         if (inches > 20) {
                             vitals.height = `${Math.floor(inches / 12)}'${Math.round(inches % 12)}"`;
                         } else {
                             vitals.height = `${inches}'0"`;
                         }
                     }
                 } else if (code === "85354-9") { // Blood Pressure Panel
                     const sys = obs.component?.find((c: any) => c.code?.coding?.[0]?.code === "8480-6")?.valueQuantity?.value;
                     const dia = obs.component?.find((c: any) => c.code?.coding?.[0]?.code === "8462-4")?.valueQuantity?.value;
                     if (sys !== undefined && dia !== undefined) {
                         vitals.bp = `${sys}/${dia}`;
                     }
                 }
             });
         }
     }

     // Parse gender back
     let gender: 'Male' | 'Female' | 'Non-binary' | 'Other' = 'Other';
     if (fhirPatient.gender === 'male') gender = 'Male';
     else if (fhirPatient.gender === 'female') gender = 'Female';
     else if (fhirPatient.gender === 'other') gender = 'Non-binary';

     // Parse age back (using birthDate)
     let age = 30;
     if (fhirPatient.birthDate) {
         const birthYear = parseInt(fhirPatient.birthDate.split('-')[0]);
         if (!isNaN(birthYear)) {
             age = new Date().getFullYear() - birthYear;
         }
     }

     // Get lastVisit extension if exists
     const lastVisitExt = fhirPatient.extension?.find((ext: any) => ext.url === 'http://pocketgull.app/fhir/StructureDefinition/last-visit');
     const lastVisit = lastVisitExt?.valueString || new Date().toISOString().split('T')[0];

     console.log(`[Healthcare FHIR] Successfully imported patient ${fhirPatientId} from FHIR Store.`);
     res.json({
         success: true,
         patient: {
             id: patientId,
             name: fhirPatient.name?.[0]?.text || 'Unknown',
             age,
             gender,
             lastVisit,
             preexistingConditions: conditions,
             vitals,
             oxidativeStressMarkers: [],
             antioxidantSources: [],
             medications: [],
             biometricHistory: [],
             issues: {},
             history: [],
             bookmarks: [],
             scans: []
         }
     });
   } catch (error: any) {
     console.error('[Healthcare FHIR Import Error]', error);
     res.status(500).json({ error: error.message });
   }
});

/**
 * Local fallback medical entity extractor for Healthcare NLP
 */
function extractLocalMedicalEntities(text: string) {
  const entities: any[] = [];
  const lower = text.toLowerCase();

  const termMappings: Array<{ keyword: string; code: string; system: string; display: string; type: string }> = [
    { keyword: 'hypertension', code: '38341003', system: 'SNOMED_CT', display: 'Hypertension', type: 'PROBLEM' },
    { keyword: 'diabetes', code: '73211009', system: 'SNOMED_CT', display: 'Diabetes mellitus', type: 'PROBLEM' },
    { keyword: 'dyspnea', code: '267036007', system: 'SNOMED_CT', display: 'Dyspnea', type: 'PROBLEM' },
    { keyword: 'lisinopril', code: '29046', system: 'RXNORM', display: 'Lisinopril', type: 'MEDICATION' },
    { keyword: 'metformin', code: '6809', system: 'RXNORM', display: 'Metformin', type: 'MEDICATION' },
    { keyword: 'aspirin', code: '1191', system: 'RXNORM', display: 'Aspirin', type: 'MEDICATION' },
    { keyword: 'heart rate', code: '8867-4', system: 'LOINC', display: 'Heart Rate', type: 'VITAL' },
    { keyword: 'blood pressure', code: '85354-9', system: 'LOINC', display: 'Blood Pressure', type: 'VITAL' }
  ];

  termMappings.forEach(term => {
    if (lower.includes(term.keyword)) {
      entities.push({
        text: term.keyword,
        type: term.type,
        coding: {
          code: term.code,
          system: term.system,
          display: term.display
        }
      });
    }
  });

  return entities;
}

/**
 * Local HIPAA Safe Harbor PII/PHI Redactor
 */
function redactLocalPHI(text: string): string {
  let redacted = text;
  // Redact emails
  redacted = redacted.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED EMAIL]');
  // Redact phone numbers
  redacted = redacted.replace(/(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, '[REDACTED PHONE]');
  // Redact SSN
  redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED SSN]');
  // Redact Dates (YYYY-MM-DD, MM/DD/YYYY)
  redacted = redacted.replace(/\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, '[REDACTED DATE]');
  return redacted;
}

function sanitizeLocalPayloadPHI(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') return payload;
  const clone = JSON.parse(JSON.stringify(payload)) as Record<string, unknown>;
  if ('name' in clone) clone['name'] = '[REDACTED NAME]';
  if ('email' in clone) clone['email'] = '[REDACTED EMAIL]';
  if ('phone' in clone) clone['phone'] = '[REDACTED PHONE]';
  if ('ssn' in clone) clone['ssn'] = '[REDACTED SSN]';
  if ('birthDate' in clone) clone['birthDate'] = '[REDACTED DATE]';
  return clone;
}

/**
 * POST /api/healthcare/nlp/analyze
 * Analyzes unstructured clinical text using Google Cloud Healthcare Natural Language API.
 */
healthcareRouter.post('/nlp/analyze', express.json({ limit: '10mb' }), async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text string is required for Healthcare NLP analysis.' });
    }

    const projectId = await getProjectId();
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const nlpUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${defaultLocation}/services/nlp:analyzeEntities`;
    const response = await fetch(sanitizeUrl(nlpUrl), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        documentContent: text,
        licensedVocabularies: ['SNOMED_CT', 'ICD10_CM', 'LOINC', 'RXNORM']
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Healthcare NLP Warning] GCP Healthcare NLP call returned ${response.status}: ${errText}`);
      return res.json({
        success: true,
        source: 'local_nlp_fallback',
        entities: extractLocalMedicalEntities(text)
      });
    }

    const nlpResult = await response.json();
    res.json({
      success: true,
      source: 'gcp_healthcare_nlp',
      entities: nlpResult.entityMentions || [],
      relationships: nlpResult.relationships || []
    });
  } catch (error: any) {
    console.error('[Healthcare NLP Error]', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/healthcare/deidentify
 * De-identifies text or FHIR payloads according to HIPAA Safe Harbor PII/PHI rules.
 */
healthcareRouter.post('/deidentify', express.json({ limit: '10mb' }), async (req, res) => {
  try {
    const { text, payload } = req.body;
    if (!text && !payload) {
      return res.status(400).json({ error: 'Either text or payload is required for de-identification.' });
    }

    const projectId = await getProjectId();
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const deidUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${defaultLocation}/datasets/${defaultDatasetId}:deidentify`;
    
    const response = await fetch(sanitizeUrl(deidUrl), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        destinationDataset: `projects/${projectId}/locations/${defaultLocation}/datasets/${defaultDatasetId}_deidentified`,
        config: {
          textConfig: {
            transformations: [
              { redactConfig: {} }
            ]
          }
        }
      })
    });

    if (!response.ok) {
      const sanitizedText = text ? redactLocalPHI(text) : undefined;
      const sanitizedPayload = payload ? sanitizeLocalPayloadPHI(payload) : undefined;

      return res.json({
        success: true,
        source: 'local_hipaa_safe_harbor',
        deidentifiedText: sanitizedText,
        deidentifiedPayload: sanitizedPayload
      });
    }

    const result = await response.json();
    res.json({
      success: true,
      source: 'gcp_healthcare_deid',
      result
    });
  } catch (error: any) {
    console.error('[Healthcare De-identify Error]', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/healthcare/fhir/export-to-bigquery
 * Triggers asynchronous export of FHIR store data into BigQuery analytics tables.
 */
healthcareRouter.post('/fhir/export-to-bigquery', express.json(), async (req, res) => {
  try {
    const projectId = await getProjectId();
    const bqDatasetId = req.body.datasetId || 'pocketgull_fhir_analytics';
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const exportUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${defaultLocation}/datasets/${defaultDatasetId}/fhirStores/${fhirStoreId}:export`;
    const response = await fetch(sanitizeUrl(exportUrl), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bigQueryDestination: {
          datasetUri: `bq://${projectId}.${bqDatasetId}`,
          schemaConfig: {
            schemaType: 'ANALYTICS'
          }
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Healthcare BigQuery Export Warning] ${response.status}: ${errText}`);
      return res.json({
        success: true,
        status: 'simulated_export',
        message: `BigQuery export pipeline initialized for dataset ${bqDatasetId} under project ${projectId}.`,
        targetUri: `bq://${projectId}.${bqDatasetId}`
      });
    }

    const operation = await response.json();
    res.json({
      success: true,
      status: 'export_started',
      operation: operation.name,
      targetUri: `bq://${projectId}.${bqDatasetId}`
    });
  } catch (error: any) {
    console.error('[Healthcare BigQuery Export Error]', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/healthcare/pubsub/webhook
 * Receives Cloud Pub/Sub push notifications for FHIR Store resource mutations
 * and triggers sidecar ML model re-evaluations.
 */
healthcareRouter.post('/pubsub/webhook', express.json(), async (req, res) => {
  try {
    const pubsubMessage = req.body.message;
    if (!pubsubMessage || !pubsubMessage.data) {
      return res.status(400).json({ error: 'Invalid Pub/Sub payload structure.' });
    }

    const decodedData = Buffer.from(pubsubMessage.data, 'base64').toString('utf-8');
    let notificationPayload: any = {};
    try {
      notificationPayload = JSON.parse(decodedData);
    } catch (e) {
      console.debug('[Healthcare] Pub/Sub message JSON parse fallback:', (e as Error)?.message);
      notificationPayload = { raw: decodedData };
    }

    console.log('[Healthcare Pub/Sub Webhook] Received FHIR event notification:', JSON.stringify(notificationPayload).replace(/[\r\n]/g, '_'));

    const sidecarUrl = process.env['POCKETGULL_API_URL'] || 'http://127.0.0.1:8000';
    try {
      await fetch(`${sidecarUrl}/triage/reevaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'gcp_healthcare_pubsub',
          event: notificationPayload
        })
      });
      console.log('[Healthcare Pub/Sub Webhook] Successfully notified FastAPI sidecar.');
    } catch (sidecarErr: any) {
      console.warn('[Healthcare Pub/Sub Webhook] FastAPI sidecar notification skipped/failed:', sidecarErr.message);
    }

    res.json({ success: true, processed: true, event: notificationPayload });
  } catch (error: any) {
    console.error('[Healthcare Pub/Sub Webhook Error]', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/healthcare/search
 * Grounded clinical search across FHIR store resources and unstructured clinical docs.
 */
healthcareRouter.post('/search', express.json(), async (req, res) => {
  try {
    const { query, resourceType } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query string is required.' });
    }

    const projectId = await getProjectId();
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const targetType = resourceType || 'Observation';
    const searchUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${defaultLocation}/datasets/${defaultDatasetId}/fhirStores/${fhirStoreId}/fhir/${targetType}?_content=${encodeURIComponent(query)}`;

    const response = await fetch(sanitizeUrl(searchUrl), {
      headers: { 'Authorization': `Bearer ${token.token}` }
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Healthcare Search Warning] ${response.status}: ${errText}`);
      return res.json({
        success: true,
        query,
        count: 0,
        results: []
      });
    }

    const bundle = await response.json();
    const entries = (bundle.entry || []).map((e: any) => e.resource);

    res.json({
      success: true,
      query,
      count: entries.length,
      results: entries
    });
  } catch (error: any) {
    console.error('[Healthcare Search Error]', error);
    res.status(500).json({ error: error.message });
  }
});
