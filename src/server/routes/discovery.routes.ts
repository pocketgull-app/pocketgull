/**
 * Agentic Discovery Routes — Protocol introspection, tool registry,
 * entity resolution, taxonomy graphs, capability probing, pipeline DAGs,
 * and artifact schema endpoints for autonomous AI agents.
 *
 * @module server/routes/discovery.routes
 */
import { Router, json as expressJson } from 'express';
import type { Request, Response } from 'express';
import { APP_VERSION } from '../../version';
import { requireTier } from '../middleware/tier-enforcement.middleware';
import { TIER_DEFINITIONS } from '../services/tier-config';

// ── Interfaces ──────────────────────────────────────────────────────────

/** POST /v1/discovery/resolve — request body */
interface IResolveRequest {
  query: string;
  domain?: string;
}

/** POST /v1/discovery/resolve — response entity candidate */
interface IResolvedEntity {
  uri: string;
  type: string;
  label: string;
  confidence: number;
  description?: string;
}

/** POST /v1/discovery/capabilities/probe — request body */
interface ICapabilitiesProbeRequest {
  required_actions: string[];
}

/** POST /v1/discovery/capabilities/probe — response */
interface ICapabilitiesProbeResponse {
  supported: boolean;
  missing_prerequisites: string[];
  available_actions: string[];
  estimated_latency_ms: number;
}

// ── Tool Schema Definitions ─────────────────────────────────────────────

/**
 * Returns the canonical list of all WebMCP + server-side tools with full
 * JSON-Schema input signatures. This is the single source of truth
 * mirroring the 40 browser-side WebMcpRegistrationService tools and
 * 6 Genkit server flows.
 *
 * TSDoc: Kept inline to prevent drift between WebMcpRegistrationService
 * and the discovery endpoint. Each entry mirrors the `inputSchema` from
 * the corresponding tool registration.
 */
function buildToolRegistry(): Record<string, unknown>[] {
  return [
    // ── WebMCP Browser Tools (mirror WebMcpRegistrationService) ───────
    {
      name: 'generate_medical_summary',
      category: 'clinical_intelligence',
      description: 'Generates a medical summary for the current patient based on clinical notes and current patient data.',
      inputSchema: { type: 'object', properties: {} },
      executionTimeout: 30000
    },
    {
      name: 'translate_clinical_text',
      category: 'clinical_intelligence',
      description: 'Translates clinical text to a specific reading level (simplified, child, dyslexia).',
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'The clinical text to translate.' },
          targetLevel: { type: 'string', enum: ['simplified', 'child', 'dyslexia'], description: 'The target reading level.' }
        },
        required: ['text', 'targetLevel']
      },
      executionTimeout: 15000
    },
    {
      name: 'get_current_patient_data',
      category: 'patient_state',
      description: 'Retrieves the current patient data context being viewed in the application.',
      inputSchema: { type: 'object', properties: {} },
      executionTimeout: 1000
    },
    {
      name: 'navigate_to_body_part',
      category: 'ui_navigation',
      description: 'Navigates the UI to focus on a specific body part and opens the analysis tab.',
      inputSchema: {
        type: 'object',
        properties: {
          partId: { type: 'string', description: 'The ID of the body part (e.g., "head", "right_knee").' }
        },
        required: ['partId']
      },
      executionTimeout: 2000
    },
    {
      name: 'inject_clinical_note',
      category: 'clinical_intelligence',
      description: 'Injects structured clinical data (a note) for a specific body part.',
      inputSchema: {
        type: 'object',
        properties: {
          partId: { type: 'string', description: 'The ID of the body part.' },
          painLevel: { type: 'number', description: 'Pain level from 0 to 10.' },
          description: { type: 'string', description: 'Clinical observations or description.' },
          recommendation: { type: 'string', description: 'Recommended treatments or next steps.' }
        },
        required: ['partId', 'painLevel', 'description']
      },
      executionTimeout: 2000
    },
    {
      name: 'load_research_url',
      category: 'research',
      description: 'Loads an external web URL or research document in the embedded research frame viewer.',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'The URL to load.' }
        },
        required: ['url']
      },
      executionTimeout: 5000
    },
    {
      name: 'add_research_bookmark',
      category: 'research',
      description: "Pre-stages a relevant literature link in the patient's bookmarks.",
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'The title of the bookmark.' },
          url: { type: 'string', description: 'The URL of the bookmark.' },
          authors: { type: 'string', description: 'The authors of the literature.' },
          doi: { type: 'string', description: 'The DOI of the literature.' },
          isPeerReviewed: { type: 'boolean', description: 'Whether the literature is peer-reviewed.' },
          cited: { type: 'boolean', description: 'Whether to include in summary references.' }
        },
        required: ['title', 'url']
      },
      executionTimeout: 1000
    },
    {
      name: 'export_patient_csv_telemetry',
      category: 'export',
      description: 'Exports active patient vital signs, biometric sensors, clinical assessment scores (PHQ-9, GAD-7, Y-BOCS, KSS), and telemetry metrics as RFC 4180 CSV.',
      inputSchema: {
        type: 'object',
        properties: {
          downloadFile: { type: 'boolean', description: 'Whether to trigger a client-side browser file download.' }
        }
      },
      executionTimeout: 5000
    },
    {
      name: 'export_patient_hl7v2_message',
      category: 'export',
      description: 'Exports HL7 v2.5.1 ER7 pipe-delimited ORU^R01 observation message containing patient clinical observations, vitals, and LOINC codes.',
      inputSchema: {
        type: 'object',
        properties: {
          downloadFile: { type: 'boolean', description: 'Whether to trigger a client-side browser file download.' }
        }
      },
      executionTimeout: 5000
    },
    {
      name: 'purge_transient_patient_state',
      category: 'privacy',
      description: 'Purges all active patient state, transient in-memory signals, and local storage caches for strict anti-surveillance privacy hygiene.',
      inputSchema: { type: 'object', properties: {} },
      executionTimeout: 2000
    },
    {
      name: 'toggle_ephemeral_privacy_mode',
      category: 'privacy',
      description: 'Toggles strict local edge privacy mode (enabling/disabling external network telemetry egress).',
      inputSchema: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean', description: 'Whether to enable strict local edge privacy mode.' }
        }
      },
      executionTimeout: 1000
    },
    {
      name: 'get_teledentistry_systemic_telemetry',
      category: 'teledentistry',
      description: 'Retrieves 32-tooth FDI odontogram, TWI grades, periodontal probing depth, BOP, and SIBI cross-talk to cardiovascular risk & HbA1c trajectory.',
      inputSchema: { type: 'object', properties: {} },
      executionTimeout: 2000
    },
    {
      name: 'update_tooth_periodontal_status',
      category: 'teledentistry',
      description: 'Updates periodontal probing depth, BOP, or TWI grade for a specific FDI tooth number (11-48).',
      inputSchema: {
        type: 'object',
        properties: {
          fdiNumber: { type: 'number', description: 'FDI tooth number (e.g. 16).' },
          probingDepthMm: { type: 'number', description: 'Periodontal probing depth in mm.' },
          hasBleedingOnProbing: { type: 'boolean', description: 'Whether BOP is present.' },
          twiGrade: { type: 'number', description: 'Smith & Knight TWI grade (0-4).' }
        },
        required: ['fdiNumber']
      },
      executionTimeout: 1000
    },
    {
      name: 'export_patient_care_plan_fhir_r4',
      category: 'export',
      description: 'Exports active patient care plan as de-identified HIPAA §164.514 compliant FHIR R4 Bundle JSON.',
      inputSchema: { type: 'object', properties: {} },
      executionTimeout: 5000
    },
    {
      name: 'trigger_hybrid_fhir_dual_sync',
      category: 'interoperability',
      description: 'Triggers hybrid dual-sync of de-identified FHIR R4 care plans across Google Cloud Healthcare API & AWS HealthLake.',
      inputSchema: { type: 'object', properties: {} },
      executionTimeout: 30000
    },
    {
      name: 'calculate_skeptical_falsifiability_score',
      category: 'evidence_quality',
      description: 'Evaluates Popperian p-value null-hypothesis testing, Cochrane RoB 2.0 rating, and FDA 21 CFR §520(o) CDS compliance.',
      inputSchema: {
        type: 'object',
        properties: {
          lensName: { type: 'string', description: 'Clinical lens scope.' },
          sampleSize: { type: 'number', description: 'Sample size N for null hypothesis evaluation.' }
        }
      },
      executionTimeout: 5000
    },
    {
      name: 'set_gemini_thinking_reasoning_budget',
      category: 'ai_configuration',
      description: 'Dynamically configures Gemini 2.5 Thinking model reasoning token budgets (1024, 4096, 8192).',
      inputSchema: {
        type: 'object',
        properties: {
          thinkingBudget: { type: 'number', description: 'Reasoning token budget.' },
          enabled: { type: 'boolean', description: 'Whether reasoning thinking process is enabled.' }
        },
        required: ['thinkingBudget']
      },
      executionTimeout: 1000
    },
    {
      name: 'analyze_systemic_inflammatory_burden',
      category: 'clinical_intelligence',
      description: 'Calculates Systemic Inflammatory Burden Index (SIBI) from CRP, PPD, and blood pressure.',
      inputSchema: {
        type: 'object',
        properties: {
          hsCrp: { type: 'number', description: 'Serum hs-CRP level in mg/L.' },
          ppd: { type: 'number', description: 'Max Periodontal Probing Depth in mm.' },
          sbp: { type: 'number', description: 'Systolic Blood Pressure in mmHg.' }
        },
        required: ['hsCrp', 'ppd', 'sbp']
      },
      executionTimeout: 1000
    },
    {
      name: 'assess_cochrane_risk_of_bias',
      category: 'evidence_quality',
      description: 'Evaluates literature citations for Cochrane RoB 2 study design biases.',
      inputSchema: {
        type: 'object',
        properties: {
          studyTitle: { type: 'string', description: 'Title of clinical trial or citation.' },
          randomization: { type: 'string', enum: ['LOW', 'SOME_CONCERNS', 'HIGH'], description: 'Randomization bias.' },
          missingData: { type: 'string', enum: ['LOW', 'SOME_CONCERNS', 'HIGH'], description: 'Missing outcome data bias.' }
        },
        required: ['studyTitle', 'randomization', 'missingData']
      },
      executionTimeout: 1000
    },
    {
      name: 'query_biophysical_substrate_params',
      category: 'anatomy_3d',
      description: 'Returns 3D anatomical WebGL PBR surface and biophysical tissue parameters.',
      inputSchema: {
        type: 'object',
        properties: {
          tissueType: { type: 'string', enum: ['bone', 'skin', 'vascular', 'dental'], description: 'Anatomical tissue type.' }
        },
        required: ['tissueType']
      },
      executionTimeout: 1000
    },
    {
      name: 'evaluate_irmaa_medicare_surcharge_and_ssa44_appeal',
      category: 'financial_health',
      description: 'Calculates Medicare Part B/D IRMAA surcharges, tax cliff buffer, and SSA-44 appeal eligibility.',
      inputSchema: {
        type: 'object',
        properties: {
          magi: { type: 'number', description: 'Modified Adjusted Gross Income.' },
          filingStatus: { type: 'string', enum: ['single', 'joint', 'separate'] },
          lifeChangingEvents: { type: 'array', items: { type: 'string' }, description: 'Qualifying SSA-44 events.' }
        },
        required: ['magi']
      },
      executionTimeout: 2000
    },
    {
      name: 'evaluate_medicare_billing_and_gfe_eligibility',
      category: 'financial_health',
      description: 'Evaluates IRA $2,000 Part D cap, MPPP smoothing, RPM/CCM CPT compliance, No Surprises Act GFE, and 501(r) Charity Care.',
      inputSchema: {
        type: 'object',
        properties: {
          annualRxCost: { type: 'number', description: 'Annual out-of-pocket Rx cost.' },
          daysDeviceTransmitted: { type: 'number', description: 'RPM physiological readings days in 30-day period.' },
          clinicalMinutesLogged: { type: 'number', description: 'Clinical staff management minutes.' },
          annualIncome: { type: 'number', description: 'Patient household annual income USD.' },
          householdSize: { type: 'number', description: 'Household size (default 1).' }
        },
        required: ['annualRxCost', 'annualIncome']
      },
      executionTimeout: 2000
    },
    {
      name: 'evaluate_hedis_quality_measures_and_care_gaps',
      category: 'quality_measures',
      description: 'Evaluates HEDIS quality measures (CBP, HBD, MAD, MAH, MAS, COL, EED), CMS 1-5 Star Ratings, and QBP eligibility.',
      inputSchema: {
        type: 'object',
        properties: {
          systolicBp: { type: 'number' },
          diastolicBp: { type: 'number' },
          hbA1c: { type: 'number' },
          diabetesRefillDays: { type: 'number' },
          hypertensionRefillDays: { type: 'number' },
          statinRefillDays: { type: 'number' },
          hasColorectalScreening: { type: 'boolean' },
          hasDiabeticEyeExam: { type: 'boolean' }
        }
      },
      executionTimeout: 2000
    },
    {
      name: 'submit_fhir_davinci_prior_authorization_claim',
      category: 'interoperability',
      description: 'Submits HL7 FHIR Da Vinci PAS prior-auth claim under CMS-0057-F for real-time medical necessity approval.',
      inputSchema: {
        type: 'object',
        properties: {
          patientId: { type: 'string' },
          payerId: { type: 'string' },
          cptCode: { type: 'string', description: 'CPT Procedure Code.' },
          icd10DiagnosisCodes: { type: 'array', items: { type: 'string' } },
          clinicalDocumentationText: { type: 'string' }
        },
        required: ['cptCode', 'icd10DiagnosisCodes']
      },
      executionTimeout: 10000
    },
    {
      name: 'crosswalk_snomed_ct_to_icd10_and_cpt',
      category: 'terminology',
      description: 'Cross-walks SNOMED CT clinical terms to ICD-10-CM, CPT, LOINC, and RxNorm CUIs.',
      inputSchema: {
        type: 'object',
        properties: {
          snomedCode: { type: 'string', description: 'SNOMED CT Concept Code.' }
        },
        required: ['snomedCode']
      },
      executionTimeout: 1000
    },
    {
      name: 'analyze_webgpu_bio_signal_tremor_and_rppg',
      category: 'biometric_signal',
      description: 'Executes client-side WebGPU zero-egress tremor frequency spectrum analysis and rPPG HRV extraction.',
      inputSchema: {
        type: 'object',
        properties: {
          displacementsMm: { type: 'array', items: { type: 'number' }, description: 'Spatial displacement array in mm.' },
          luminescenceSignal: { type: 'array', items: { type: 'number' }, description: 'Skin luminescence intensity for rPPG.' }
        }
      },
      executionTimeout: 5000
    },
    {
      name: 'calculate_clinical_game_theory_adherence_incentives',
      category: 'financial_health',
      description: 'Calculates Stackelberg/Nash equilibrium for medication adherence rebate subsidies.',
      inputSchema: {
        type: 'object',
        properties: {
          patientId: { type: 'string' },
          conditionName: { type: 'string' },
          annualCopayCostUsd: { type: 'number' },
          estAnnualHospitalizationRiskUsd: { type: 'number' }
        },
        required: ['annualCopayCostUsd', 'estAnnualHospitalizationRiskUsd']
      },
      executionTimeout: 2000
    },
    {
      name: 'prescribe_joy_and_playful_flourishing',
      category: 'wellness',
      description: 'Prescribes micro-joy and micro-play activities and calculates PERMA+ playfulness scorecards.',
      inputSchema: {
        type: 'object',
        properties: {
          patientId: { type: 'string' }
        }
      },
      executionTimeout: 2000
    },
    {
      name: 'match_clinical_trials_for_patient_conditions',
      category: 'research',
      description: 'Queries ClinicalTrials.gov API v2 for active recruiting clinical trials matching patient conditions.',
      inputSchema: {
        type: 'object',
        properties: {
          conditionName: { type: 'string', description: 'Condition name.' },
          recruitingOnly: { type: 'boolean' }
        },
        required: ['conditionName']
      },
      executionTimeout: 15000
    },
    {
      name: 'initiate_smart_on_fhir_ehr_launch',
      category: 'interoperability',
      description: 'Generates SMART-on-FHIR OAuth2 launch URL with PKCE S256 for Epic, Cerner, AthenaHealth EHR launches.',
      inputSchema: {
        type: 'object',
        properties: {
          vendor: { type: 'string', enum: ['EPIC', 'CERNER', 'ATHENAHEALTH', 'GENERIC_FHIR'] },
          fhirBaseUrl: { type: 'string' },
          clientId: { type: 'string' },
          launchToken: { type: 'string' }
        },
        required: ['vendor']
      },
      executionTimeout: 5000
    },
    {
      name: 'calculate_medicare_irmaa_and_ssa44_appeals',
      category: 'financial_health',
      description: 'Calculates 2026 Medicare IRMAA Part B/D surcharges and SSA-44 Life-Changing Event appeal eligibility.',
      inputSchema: {
        type: 'object',
        properties: {
          magiUsd: { type: 'number' },
          filingStatus: { type: 'string', enum: ['single', 'joint', 'separate'] },
          lifeChangingEvent: { type: 'string', enum: ['WORK_STOPPAGE', 'WORK_REDUCTION', 'MARRIAGE', 'DIVORCE_OR_ANNULMENT', 'INCOME_PROPERTY_LOSS'] }
        },
        required: ['magiUsd']
      },
      executionTimeout: 2000
    },
    {
      name: 'render_webgpu_3d_organ_digital_twin',
      category: 'anatomy_3d',
      description: 'Calculates real-time WebGPU 3D organ digital twin mesh deformation, perfusion rates, and WGSL compute shader parameters.',
      inputSchema: {
        type: 'object',
        properties: {
          organ: { type: 'string', enum: ['HEART', 'LUNGS', 'LIVER', 'KIDNEYS', 'BRAIN'] },
          heartRateBpm: { type: 'number' },
          spo2Percent: { type: 'number' }
        },
        required: ['organ']
      },
      executionTimeout: 5000
    },
    {
      name: 'guide_user_onboarding_walkthrough',
      category: 'ui_navigation',
      description: 'Starts or advances interactive onboarding walkthrough tours for PATIENT, CLINICIAN, or RESEARCHER personas.',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['START', 'NEXT', 'PREVIOUS', 'STOP'] },
          persona: { type: 'string', enum: ['PATIENT', 'CLINICIAN', 'RESEARCHER', 'ALL'] }
        },
        required: ['action']
      },
      executionTimeout: 1000
    },
    {
      name: 'navigate_user_way_back_home',
      category: 'ui_navigation',
      description: 'Resets user navigation to primary clinical chart, closes modal overlays, restores home view state.',
      inputSchema: { type: 'object', properties: {} },
      executionTimeout: 1000
    },
    {
      name: 'retrieve_helpful_community_and_clinical_lists',
      category: 'wellness',
      description: 'Retrieves curated quick-reference lists for emergency hotlines (988), living wills, HEDIS benchmarks, and SSA-44 checklists.',
      inputSchema: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: ['EMERGENCY_HOTLINES', 'PATIENT_RIGHTS_LIVING_WILLS', 'CLINICAL_CHECKLISTS', 'MEDICARE_FINANCIAL_RESOURCES', 'ALL'] }
        }
      },
      executionTimeout: 1000
    },
    {
      name: 'translate_clinical_care_plan_multilingual',
      category: 'accessibility',
      description: 'Translates clinical care plans into multilingual summaries across 10 global languages.',
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Clinical recommendation text.' },
          targetLanguageCode: { type: 'string', enum: ['en', 'es', 'zh', 'hi', 'ar', 'tl', 'fr', 'sw', 'de', 'ja'] }
        },
        required: ['text']
      },
      executionTimeout: 10000
    },
    {
      name: 'calculate_who_cdc_health_equity_index',
      category: 'social_determinants',
      description: 'Evaluates WHO GPW 14 and CDC Health Equity Index, SDOH PRAPARE risk vectors, and climate-health AQI vulnerability.',
      inputSchema: {
        type: 'object',
        properties: {
          sdoh: {
            type: 'object',
            properties: {
              housingInsecurity: { type: 'boolean' },
              foodInsecurity: { type: 'boolean' },
              transportationBarrier: { type: 'boolean' },
              utilityInsecurity: { type: 'boolean' },
              digitalLiteracyBarrier: { type: 'boolean' }
            }
          },
          climate: {
            type: 'object',
            properties: {
              airQualityIndex: { type: 'number' },
              pm25MicrogramsM3: { type: 'number' },
              extremeHeatRiskDaysYear: { type: 'number' }
            }
          }
        }
      },
      executionTimeout: 2000
    },
    {
      name: 'recommend_sustainability_and_eco_health_actions',
      category: 'sustainability',
      description: 'Generates green computing, EAT-Lancet planetary health nutrition, active transit, and circular waste recommendations.',
      inputSchema: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: ['COMPUTE_ENERGY', 'PLANETARY_DIET', 'ACTIVE_TRANSIT', 'CIRCULAR_WASTE_REDUCTION', 'JOYFUL_ECO_EXPERIENCE', 'ALL'] }
        }
      },
      executionTimeout: 2000
    },
    {
      name: 'localize_community_eco_health_hubs',
      category: 'sustainability',
      description: 'Finds local farmers markets, community gardens, forest bathing parks, greenways, and seed sharing libraries.',
      inputSchema: {
        type: 'object',
        properties: {
          hubType: { type: 'string', enum: ['FARMERS_MARKET', 'COMMUNITY_GARDEN', 'FOREST_PARK', 'GREENWAY_BIKE_PATH', 'SEED_TOOL_LIBRARY', 'ALL'] }
        }
      },
      executionTimeout: 2000
    },
    {
      name: 'export_complete_fhir_r4_health_sovereignty_bundle',
      category: 'export',
      description: 'Exports complete HIPAA-compliant FHIR R4 Bundle with patient demographics, observations, vitals, and tri-paradigm care plans.',
      inputSchema: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['JSON', 'COMPACT_JSON', 'SUMMARY'] }
        }
      },
      executionTimeout: 5000
    },

    // ── Genkit Server-Side Flows ──────────────────────────────────────────
    {
      name: 'generateMetricsFlow',
      category: 'genkit_flow',
      description: 'Analyzes clinical report text and extracts complexity, stability, and certainty metrics (0-10).',
      inputSchema: { type: 'string', description: 'Clinical report text' },
      executionTimeout: 30000
    },
    {
      name: 'synthesizeCarePlanFlow',
      category: 'genkit_flow',
      description: 'Synthesizes a comprehensive clinical care plan from patient data across Western, TCM, and Ayurvedic paradigms.',
      inputSchema: { type: 'string', description: 'Patient data prompt text' },
      executionTimeout: 60000
    },
    {
      name: 'detectChangeFlow',
      category: 'genkit_flow',
      description: 'Detects and summarizes clinical changes between two patient data snapshots.',
      inputSchema: {
        type: 'object',
        properties: {
          oldData: { type: 'string' },
          newData: { type: 'string' }
        },
        required: ['oldData', 'newData']
      },
      executionTimeout: 30000
    },
    {
      name: 'translateTextFlow',
      category: 'genkit_flow',
      description: 'Translates clinical text to a target cognitive reading level using Gemini AI.',
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          level: { type: 'string' }
        },
        required: ['text', 'level']
      },
      executionTimeout: 15000
    },
    {
      name: 'analyzeTranslationFlow',
      category: 'genkit_flow',
      description: 'Validates translation quality between original and translated clinical text.',
      inputSchema: {
        type: 'object',
        properties: {
          original: { type: 'string' },
          translated: { type: 'string' }
        },
        required: ['original', 'translated']
      },
      executionTimeout: 15000
    },
    {
      name: 'analyzeImageFlow',
      category: 'genkit_flow',
      description: 'Analyzes a medical image (base64 encoded) and provides clinical findings assessment.',
      inputSchema: {
        type: 'object',
        properties: {
          base64Image: { type: 'string' },
          context: { type: 'string' }
        },
        required: ['base64Image']
      },
      executionTimeout: 30000
    }
  ];
}

// ── Taxonomy Graph (Curated Subset) ─────────────────────────────────────

function buildTaxonomyGraph(): Record<string, unknown> {
  return {
    codeSystems: [
      {
        system: 'SNOMED CT',
        uri: 'http://snomed.info/sct',
        version: '2024-09-01',
        description: 'Systematized Nomenclature of Medicine — Clinical Terms',
        sampleConcepts: [
          { code: '26929004', display: 'Alzheimer disease' },
          { code: '49049000', display: 'Parkinson disease' },
          { code: '38341003', display: 'Hypertensive disorder' },
          { code: '73211009', display: 'Diabetes mellitus' },
          { code: '372130007', display: 'Malignant neoplasm of pancreas' },
          { code: '22298006', display: 'Myocardial infarction' },
          { code: '195967001', display: 'Asthma' }
        ]
      },
      {
        system: 'ICD-10-CM',
        uri: 'http://hl7.org/fhir/sid/icd-10-cm',
        version: 'FY2026',
        description: 'International Classification of Diseases, 10th Revision, Clinical Modification',
        sampleConcepts: [
          { code: 'G30.9', display: 'Alzheimer disease, unspecified' },
          { code: 'G20', display: 'Parkinson disease' },
          { code: 'I10', display: 'Essential hypertension' },
          { code: 'E11.9', display: 'Type 2 diabetes without complications' },
          { code: 'C25.0', display: 'Malignant neoplasm of head of pancreas' }
        ]
      },
      {
        system: 'LOINC',
        uri: 'http://loinc.org',
        version: '2.78',
        description: 'Logical Observation Identifiers Names and Codes',
        sampleConcepts: [
          { code: '8480-6', display: 'Systolic blood pressure' },
          { code: '8462-4', display: 'Diastolic blood pressure' },
          { code: '8867-4', display: 'Heart rate' },
          { code: '2710-2', display: 'Oxygen saturation in Blood' },
          { code: '4548-4', display: 'Hemoglobin A1c' },
          { code: '96790-1', display: 'SOFA score' },
          { code: '80299-1', display: 'LACE readmission risk index' },
          { code: '89269-5', display: 'CHA2DS2-VASc stroke risk score' }
        ]
      },
      {
        system: 'RxNorm',
        uri: 'http://www.nlm.nih.gov/research/umls/rxnorm',
        description: 'Normalized drug naming system',
        sampleConcepts: [
          { code: '161', display: 'Acetaminophen' },
          { code: '4337', display: 'Furosemide' },
          { code: '6809', display: 'Metformin' },
          { code: '36567', display: 'Simvastatin' }
        ]
      },
      {
        system: 'CPT',
        uri: 'http://www.ama-assn.org/go/cpt',
        description: 'Current Procedural Terminology',
        sampleConcepts: [
          { code: '99454', display: 'RPM device supply with daily recording' },
          { code: '99457', display: 'RPM treatment management 20 min' },
          { code: '70553', display: 'Brain MRI with/without contrast' },
          { code: '78607', display: 'DaTscan SPECT imaging' }
        ]
      }
    ],
    fhirResourceTypes: [
      'Patient', 'Observation', 'Condition', 'MedicationRequest',
      'CarePlan', 'AllergyIntolerance', 'Procedure', 'DiagnosticReport',
      'Encounter', 'Practitioner', 'Organization', 'Bundle',
      'ResearchSubject', 'Claim', 'ClaimResponse'
    ]
  };
}

// ── Entity Resolution Helpers ───────────────────────────────────────────

/**
 * Performs basic fuzzy substring matching against known entity labels.
 * In production, this would query a FHIR store or vector DB.
 */
function resolveEntities(query: string, domain?: string): IResolvedEntity[] {
  const q = query.toLowerCase().trim();
  const candidates: IResolvedEntity[] = [];

  // Body part entities (from BODY_PART_NAMES map)
  const bodyParts: Record<string, string> = {
    head: 'Head', neck: 'Neck', chest: 'Chest', abdomen: 'Abdomen',
    right_shoulder: 'Right Shoulder', left_shoulder: 'Left Shoulder',
    right_elbow: 'Right Elbow', left_elbow: 'Left Elbow',
    right_wrist: 'Right Wrist', left_wrist: 'Left Wrist',
    right_hip: 'Right Hip', left_hip: 'Left Hip',
    right_knee: 'Right Knee', left_knee: 'Left Knee',
    right_ankle: 'Right Ankle', left_ankle: 'Left Ankle',
    upper_back: 'Upper Back', lower_back: 'Lower Back',
    pelvis: 'Pelvis'
  };

  for (const [id, label] of Object.entries(bodyParts)) {
    if (label.toLowerCase().includes(q) || q.includes(label.toLowerCase())) {
      candidates.push({
        uri: `pocketgull://body-part/${id}`,
        type: 'BodyPartReference',
        label,
        confidence: label.toLowerCase() === q ? 1.0 : 0.75,
        description: `Anatomical body part: ${label}`
      });
    }
  }

  // FHIR resource type matching
  const fhirTypes = ['Patient', 'Observation', 'Condition', 'MedicationRequest', 'CarePlan',
    'AllergyIntolerance', 'Procedure', 'DiagnosticReport', 'Encounter', 'Bundle'];

  for (const rt of fhirTypes) {
    if (rt.toLowerCase().includes(q) || q.includes(rt.toLowerCase())) {
      candidates.push({
        uri: `http://hl7.org/fhir/StructureDefinition/${rt}`,
        type: 'FHIRResourceType',
        label: rt,
        confidence: rt.toLowerCase() === q ? 1.0 : 0.65,
        description: `HL7 FHIR R4 Resource Type: ${rt}`
      });
    }
  }

  // Clinical concept matching
  const clinicalConcepts: Array<{ code: string; system: string; display: string }> = [
    { code: '26929004', system: 'SNOMED', display: 'Alzheimer disease' },
    { code: '49049000', system: 'SNOMED', display: 'Parkinson disease' },
    { code: '38341003', system: 'SNOMED', display: 'Hypertensive disorder' },
    { code: '73211009', system: 'SNOMED', display: 'Diabetes mellitus' },
    { code: '8480-6', system: 'LOINC', display: 'Systolic blood pressure' },
    { code: '8867-4', system: 'LOINC', display: 'Heart rate' },
    { code: '2710-2', system: 'LOINC', display: 'Oxygen saturation' },
    { code: '4548-4', system: 'LOINC', display: 'Hemoglobin A1c' },
    { code: '96790-1', system: 'LOINC', display: 'SOFA score' }
  ];

  for (const concept of clinicalConcepts) {
    if (concept.display.toLowerCase().includes(q) || q.includes(concept.display.toLowerCase())) {
      const systemUri = concept.system === 'SNOMED' ? 'http://snomed.info/sct' : 'http://loinc.org';
      candidates.push({
        uri: `${systemUri}/${concept.code}`,
        type: `${concept.system}Concept`,
        label: `${concept.display} (${concept.code})`,
        confidence: concept.display.toLowerCase() === q ? 0.95 : 0.60,
        description: `${concept.system} code ${concept.code}: ${concept.display}`
      });
    }
  }

  // Sort by confidence descending
  candidates.sort((a, b) => b.confidence - a.confidence);
  return candidates.slice(0, 10);
}

// ── Pipeline DAG Definitions ────────────────────────────────────────────

function buildPipelineDAGs(): Record<string, Record<string, unknown>> {
  return {
    generateMetricsFlow: {
      pipelineId: 'generateMetricsFlow',
      runtime: 'genkit',
      description: 'Clinical report metric extraction pipeline',
      nodes: [
        { id: 'input', type: 'input', label: 'Clinical Report Text', outputShape: { type: 'string' } },
        { id: 'gemini_generate', type: 'llm_call', label: 'Gemini 2.5 Flash Generate', model: 'gemini-2.5-flash', config: { temperature: 0, responseMimeType: 'application/json' } },
        { id: 'parse_json', type: 'transform', label: 'JSON Parse & Validate' },
        { id: 'output', type: 'output', label: 'Metrics Object', outputShape: { type: 'object', properties: { complexity: { type: 'number' }, stability: { type: 'number' }, certainty: { type: 'number' } } } }
      ],
      edges: [
        { from: 'input', to: 'gemini_generate' },
        { from: 'gemini_generate', to: 'parse_json' },
        { from: 'parse_json', to: 'output' }
      ]
    },
    synthesizeCarePlanFlow: {
      pipelineId: 'synthesizeCarePlanFlow',
      runtime: 'genkit',
      description: 'Multi-paradigm care plan synthesis pipeline',
      nodes: [
        { id: 'input', type: 'input', label: 'Patient Data Prompt', outputShape: { type: 'string' } },
        { id: 'gemini_generate', type: 'llm_call', label: 'Gemini 2.5 Flash Generate', model: 'gemini-2.5-flash', config: { temperature: 0.3 } },
        { id: 'output', type: 'output', label: 'Care Plan Report', outputShape: { type: 'string' } }
      ],
      edges: [
        { from: 'input', to: 'gemini_generate' },
        { from: 'gemini_generate', to: 'output' }
      ]
    },
    readmission_sepsis_ml: {
      pipelineId: 'readmission_sepsis_ml',
      runtime: 'python_fastapi_sidecar',
      description: 'XGBoost 30-Day Hospital Readmission & qSOFA Sepsis Scoring Pipeline',
      nodes: [
        { id: 'input', type: 'input', label: 'Patient Clinical Features', outputShape: { type: 'object' } },
        { id: 'feature_engineering', type: 'transform', label: 'LACE Index + qSOFA Feature Engineering' },
        { id: 'xgboost_predict', type: 'ml_model', label: 'XGBoost Classifier (calibrated)' },
        { id: 'conformal_intervals', type: 'transform', label: '95% Conformal Prediction Intervals' },
        { id: 'output', type: 'output', label: 'Risk Score + Sepsis Probability', outputShape: { type: 'object', properties: { riskScore: { type: 'number' }, acuteTriage: { type: 'string' }, sepsisEscalation: { type: 'number' } } } }
      ],
      edges: [
        { from: 'input', to: 'feature_engineering' },
        { from: 'feature_engineering', to: 'xgboost_predict' },
        { from: 'xgboost_predict', to: 'conformal_intervals' },
        { from: 'conformal_intervals', to: 'output' }
      ]
    },
    physionet_pcg_cardiac: {
      pipelineId: 'physionet_pcg_cardiac',
      runtime: 'python_fastapi_sidecar',
      description: 'PhysioNet 2022 PCG Cardiac Murmur Classification Pipeline',
      nodes: [
        { id: 'input', type: 'input', label: 'PCG Audio Waveform', outputShape: { type: 'array', items: { type: 'number' } } },
        { id: 'mel_spectrogram', type: 'transform', label: 'Mel Spectrogram Extraction' },
        { id: 'cnn_classify', type: 'ml_model', label: 'CNN Murmur Classifier' },
        { id: 'output', type: 'output', label: 'Murmur Present/Absent/Unknown', outputShape: { type: 'object' } }
      ],
      edges: [
        { from: 'input', to: 'mel_spectrogram' },
        { from: 'mel_spectrogram', to: 'cnn_classify' },
        { from: 'cnn_classify', to: 'output' }
      ]
    }
  };
}

// ── Artifact Schema Definitions ─────────────────────────────────────────

function buildArtifactSchemas(): Record<string, unknown>[] {
  return [
    {
      artifactType: 'fhir_r4_bundle',
      description: 'HIPAA §164.514 de-identified FHIR R4 Bundle containing Patient, Observation, Condition, CarePlan resources.',
      mimeType: 'application/fhir+json',
      schema: {
        type: 'object',
        properties: {
          resourceType: { type: 'string', const: 'Bundle' },
          type: { type: 'string', enum: ['collection', 'transaction', 'batch'] },
          entry: { type: 'array', items: { type: 'object', properties: { resource: { type: 'object' } } } }
        },
        required: ['resourceType', 'type', 'entry']
      }
    },
    {
      artifactType: 'hl7v2_oru_r01',
      description: 'HL7 v2.5.1 ER7 pipe-delimited ORU^R01 observation message with LOINC-coded observations.',
      mimeType: 'application/hl7-v2',
      schema: { type: 'string', description: 'Pipe-delimited HL7v2 segments (MSH|PID|OBR|OBX)' }
    },
    {
      artifactType: 'csv_telemetry',
      description: 'RFC 4180 CSV file with patient vitals, biometric sensors, and clinical assessment scores.',
      mimeType: 'text/csv',
      schema: {
        type: 'string',
        description: 'RFC 4180 comma-separated values with header row',
        columns: ['timestamp', 'hr_bpm', 'systolic_bp', 'diastolic_bp', 'spo2_pct', 'temp_f', 'cgm_glucose_mg_dl', 'phq9_score', 'gad7_score', 'ybocs_score', 'kss_score']
      }
    },
    {
      artifactType: 'clinical_care_plan_report',
      description: 'Multi-paradigm clinical care plan report (Western, TCM, Ayurvedic) generated by Gemini AI.',
      mimeType: 'text/markdown',
      schema: { type: 'string', description: 'Structured Markdown report with sections per clinical paradigm.' }
    },
    {
      artifactType: 'clinical_metrics',
      description: 'Extracted clinical complexity, stability, and certainty metrics.',
      mimeType: 'application/json',
      schema: {
        type: 'object',
        properties: {
          complexity: { type: 'number', minimum: 0, maximum: 10 },
          stability: { type: 'number', minimum: 0, maximum: 10 },
          certainty: { type: 'number', minimum: 0, maximum: 10 }
        },
        required: ['complexity', 'stability', 'certainty']
      }
    },
    {
      artifactType: 'davinci_pas_claim_response',
      description: 'HL7 FHIR Da Vinci PAS prior authorization claim response.',
      mimeType: 'application/fhir+json',
      schema: {
        type: 'object',
        properties: {
          resourceType: { type: 'string', const: 'ClaimResponse' },
          outcome: { type: 'string', enum: ['complete', 'error', 'partial', 'queued'] }
        }
      }
    }
  ];
}

// ── Factory: Creates the discovery router ───────────────────────────────

export function createDiscoveryRouter(): Router {
  const router = Router();

  router.use(expressJson({ limit: '100kb' }));

  // ── GET /v1/discovery/tools ───────────────────────────────────────────
  router.get('/v1/discovery/tools', (_req: Request, res: Response) => {
    const tools = buildToolRegistry();
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json({
      '@context': 'https://schema.org',
      '@type': 'AgenticToolRegistry',
      name: 'Pocket Gull Agentic Tool Registry',
      version: APP_VERSION,
      totalTools: tools.length,
      generatedAt: new Date().toISOString(),
      categories: [...new Set(tools.map((t: Record<string, unknown>) => t.category as string))].sort(),
      pricing: {
        tiers: Object.values(TIER_DEFINITIONS).map(t => ({
          name: t.name,
          label: t.label,
          priceMonthlyUsd: t.priceMonthlyUsd,
          features: t.features,
          quotas: t.quotas
        })),
        checkout_url: '/api/billing/checkout'
      },
      tools
    });
  });

  // ── GET /v1/discovery/context-schema ──────────────────────────────────
  router.get('/v1/discovery/context-schema', (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.json({
      contextEnvelope: {
        session: {
          type: 'object',
          description: 'Session metadata for stateful interactions.',
          properties: {
            sessionId: { type: 'string', format: 'uuid', description: 'Unique session identifier.' },
            patientId: { type: 'string', description: 'Active patient identifier (e.g., p010).' },
            demoMode: { type: 'boolean', description: 'Whether the application is in demo mode with mock patient data.' },
            activeParadigm: { type: 'string', enum: ['western', 'eastern', 'ayurvedic', 'integrated'], description: 'Active clinical paradigm lens.' },
            activeLens: { type: 'string', description: 'Active specialized lens (e.g., Summary Overview, Treatment Matrix).' }
          }
        },
        authentication: {
          type: 'object',
          description: 'Role-based authentication context.',
          properties: {
            role: { type: 'string', enum: ['PATIENT', 'CLINICIAN', 'RESEARCHER', 'ADMIN'], description: 'User role.' },
            apiKeyHeader: { type: 'string', const: 'X-Gemini-API-Key', description: 'API key header name.' },
            tenantId: { type: 'string', description: 'Multi-tenant identifier (injected from validated API key).' },
            smartLaunchContext: { type: 'string', description: 'SMART on FHIR EHR launch context token.' }
          }
        },
        tracing: {
          type: 'object',
          description: 'Distributed tracing and observability context.',
          properties: {
            traceId: { type: 'string', description: 'OpenTelemetry trace ID.' },
            spanId: { type: 'string', description: 'OpenTelemetry span ID.' },
            requestTimestamp: { type: 'string', format: 'date-time', description: 'ISO 8601 request timestamp.' }
          }
        },
        privacy: {
          type: 'object',
          description: 'Privacy and data sovereignty context.',
          properties: {
            ephemeralMode: { type: 'boolean', description: 'Whether strict local edge privacy mode is enabled.' },
            hipaaDeidentified: { type: 'boolean', description: 'Whether data has been HIPAA §164.514 Safe Harbor de-identified.' },
            consentStatus: { type: 'string', enum: ['granted', 'pending', 'revoked'], description: 'Patient consent status.' }
          }
        }
      }
    });
  });

  // ── POST /v1/discovery/resolve (metered: explorer+ with quota) ────────
  router.post('/v1/discovery/resolve', requireTier('explorer', 'discovery_resolve', true), (req: Request, res: Response) => {
    const body = req.body as IResolveRequest | undefined;
    if (!body?.query || typeof body.query !== 'string') {
      return res.status(400).json({ error: 'Missing required field: query (string).' });
    }

    const entities = resolveEntities(body.query, body.domain);
    res.json({
      query: body.query,
      domain: body.domain || 'general',
      resolvedAt: new Date().toISOString(),
      totalCandidates: entities.length,
      candidates: entities
    });
  });

  // ── GET /v1/discovery/taxonomy ────────────────────────────────────────
  router.get('/v1/discovery/taxonomy', (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'public, max-age=86400');
    const taxonomy = buildTaxonomyGraph();
    res.json({
      '@context': 'https://schema.org',
      '@type': 'MedicalCodeSystem',
      name: 'Pocket Gull Clinical Taxonomy Registry',
      version: APP_VERSION,
      generatedAt: new Date().toISOString(),
      ...taxonomy
    });
  });

  // ── POST /v1/discovery/capabilities/probe (metered: explorer+ with quota) ──
  router.post('/v1/discovery/capabilities/probe', requireTier('explorer', 'discovery_probe', true), (req: Request, res: Response) => {
    const body = req.body as ICapabilitiesProbeRequest | undefined;
    if (!body?.required_actions || !Array.isArray(body.required_actions)) {
      return res.status(400).json({ error: 'Missing required field: required_actions (string[]).' });
    }

    const toolRegistry = buildToolRegistry();
    const toolNames = new Set(toolRegistry.map((t: Record<string, unknown>) => t.name as string));
    const available: string[] = [];
    const missing: string[] = [];

    for (const action of body.required_actions) {
      if (toolNames.has(action)) {
        available.push(action);
      } else {
        missing.push(action);
      }
    }

    const supported = missing.length === 0;
    // Estimate latency: sum of execution timeouts for available tools / 2 (optimistic)
    const estimatedLatencyMs = available.reduce((sum, name) => {
      const tool = toolRegistry.find((t: Record<string, unknown>) => t.name === name);
      return sum + (((tool?.executionTimeout as number) || 5000) / 2);
    }, 0);

    const result: ICapabilitiesProbeResponse = {
      supported,
      missing_prerequisites: missing,
      available_actions: available,
      estimated_latency_ms: Math.round(estimatedLatencyMs)
    };

    res.json(result);
  });

  // ── GET /v1/discovery/pipelines/:pipelineId/graph (metered: practitioner+) ──
  router.get('/v1/discovery/pipelines/:pipelineId/graph', requireTier('practitioner', 'pipeline_graph'), (req: Request, res: Response) => {
    const pipelineId = String(req.params['pipelineId'] || '');
    const dags = buildPipelineDAGs();

    if (!pipelineId || !dags[pipelineId]) {
      return res.status(404).json({
        error: `Pipeline not found: ${pipelineId}`,
        availablePipelines: Object.keys(dags)
      });
    }

    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json(dags[pipelineId]);
  });

  // ── GET /v1/discovery/artifacts/schema ─────────────────────────────────
  router.get('/v1/discovery/artifacts/schema', (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'public, max-age=3600');
    const schemas = buildArtifactSchemas();
    res.json({
      '@context': 'https://schema.org',
      '@type': 'ArtifactSchemaRegistry',
      name: 'Pocket Gull Artifact Schema Registry',
      version: APP_VERSION,
      generatedAt: new Date().toISOString(),
      totalSchemas: schemas.length,
      schemas
    });
  });

  // ── GET /.well-known/smart-configuration (SMART on FHIR v2 Discovery) ─────
  router.get('/.well-known/smart-configuration', (req: Request, res: Response) => {
    const host = req.get('host') || 'pocketgull.app';
    const protocol = req.protocol || 'https';
    const baseUrl = `${protocol}://${host}`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.json({
      authorization_endpoint: `${baseUrl}/api/fitbit/auth`,
      token_endpoint: `${baseUrl}/api/fitbit/callback`,
      token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post', 'private_key_jwt'],
      registration_endpoint: `${baseUrl}/api/smart/register`,
      scopes_supported: [
        'openid',
        'profile',
        'fhirUser',
        'launch',
        'launch/patient',
        'patient/*.read',
        'patient/*.rs',
        'user/*.read',
        'offline_access'
      ],
      response_types_supported: ['code'],
      management_endpoint: `${baseUrl}/api/smart/manage`,
      introspection_endpoint: `${baseUrl}/api/smart/introspect`,
      revocation_endpoint: `${baseUrl}/api/fitbit/revoke`,
      capabilities: [
        'launch-ehr',
        'launch-standalone',
        'client-public',
        'client-confidential-symmetric',
        'client-confidential-asymmetric',
        'context-ehr-patient',
        'context-standalone-patient',
        'permission-offline',
        'permission-patient',
        'permission-user'
      ],
      code_challenge_methods_supported: ['S256']
    });
  });

  // ── GET /api/smart/launch (EHR Launch Handshake) ─────────────────────────
  router.get('/api/smart/launch', (req: Request, res: Response) => {
    const launch = req.query['launch'] as string | undefined;
    const iss = req.query['iss'] as string | undefined;

    if (!iss) {
      return res.status(400).json({ error: 'Missing mandatory FHIR server issuance URL (iss parameter).' });
    }

    const safeIss = encodeURIComponent(iss);
    const safeLaunch = launch ? encodeURIComponent(launch) : '';
    res.redirect(`/?smart_iss=${safeIss}&smart_launch=${safeLaunch}&smart_mode=ehr`);
  });

  return router;
}
