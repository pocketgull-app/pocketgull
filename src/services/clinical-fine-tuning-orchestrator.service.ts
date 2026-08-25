import { Injectable, signal, computed } from '@angular/core';

export type FineTuningParadigmId =
  | 'dpo_epistemic_grounding'
  | 'ambient_scribe_soap'
  | 'pharmacogenomics_pgx'
  | 'circadian_chronodosing'
  | 'prior_auth_cms0057f'
  | 'tri_paradigm_synthesis'
  | 'rsna_imaging_vlm'
  | 'seo_medical_journalism'
  | 'voice_multimodal_live'
  | 'calgary_cambridge_intake'
  | 'fda_ftc_compliance_copywriter';

export interface IFineTuningParadigmMeta {
  id: FineTuningParadigmId;
  name: string;
  category: 'Epistemic & Safety' | 'Ambient Documentation' | 'Specialty CDS' | 'Chronobiology' | 'Interoperability' | 'Integrative' | 'Multimodal Vision' | 'Medical Journalism' | 'Voice & Audio' | 'Patient Triage' | 'Legal & Compliance';
  targetDomain: 'pocketgull.app' | 'pocketgull.com' | 'Cross-Domain (Both)';
  recommendedBaseModel: string;
  defaultTrainer: 'SFT' | 'DPO' | 'ORPO';
  quantizationTarget: 'Q4_K_M (Edge)' | 'Q8_0 (Balanced)' | 'FP16 (Cloud)';
  estimatedVramGb: number;
  description: string;
  clinicalImpact: string;
  sampleInput: string;
  sampleOutput: string;
  chosenPreference?: string;
  rejectedPreference?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalFineTuningOrchestratorService {
  readonly paradigms = signal<IFineTuningParadigmMeta[]>([
    {
      id: 'dpo_epistemic_grounding',
      name: 'DPO Epistemic Grounding & Hallucination Suppression',
      category: 'Epistemic & Safety',
      targetDomain: 'Cross-Domain (Both)',
      recommendedBaseModel: 'google/gemma-3-27b-it',
      defaultTrainer: 'DPO',
      quantizationTarget: 'Q8_0 (Balanced)',
      estimatedVramGb: 16.5,
      description: 'Aligns model responses with Popperian null-hypothesis testability (H0) and Cochrane RoB 2 tiers, suppressing ungrounded curative claims.',
      clinicalImpact: 'Enforces DORA cognitive trust calibration and eliminates dangerous overconfident medical claims.',
      sampleInput: JSON.stringify({ supplement: 'Curcumin (Bio-enhanced)', indication: 'Knee Osteoarthritis', dosageMg: 1000 }, null, 2),
      sampleOutput: JSON.stringify({
        evidenceTier: 'Level B (Cohort / Small RCTs)',
        nullHypothesisH0: 'No statistically significant WOMAC score reduction compared to placebo at 12 weeks.',
        pValue: 0.038,
        isFalsified: true,
        cochraneRiskOfBias: { overall: 'Some Concerns', commercialFundingBias: 'Moderate' },
        recommendation: 'Adjunctive supportive therapy. Does not replace physical conditioning.',
        primaryCitation: 'Cochrane Database Syst Rev (PMID: 33150652)'
      }, null, 2),
      chosenPreference: 'Curcumin demonstrates modest adjunctive pain reduction (p = 0.038 against H0), supported by Cochrane review (PMID: 33150652, Level B). Recommend as supportive therapy alongside physical conditioning.',
      rejectedPreference: 'Curcumin is an FDA-approved miracle cure that permanently heals cartilage tears and completely eliminates arthritis without side effects.'
    },
    {
      id: 'ambient_scribe_soap',
      name: 'Ambient Clinical Scribe & SOAP Generator',
      category: 'Ambient Documentation',
      targetDomain: 'pocketgull.app',
      recommendedBaseModel: 'google/gemma-3-2b-it',
      defaultTrainer: 'SFT',
      quantizationTarget: 'Q4_K_M (Edge)',
      estimatedVramGb: 1.8,
      description: 'Converts multi-speaker doctor-patient audio transcripts into structured SOAP notes and SBAR specialist handoffs on-device.',
      clinicalImpact: 'Saves up to 2 hours of daily EHR charting per clinician with zero cloud PHI egress.',
      sampleInput: `Doctor: "Good morning Mr. Davis. What brings you in today?"\nPatient: "Doctor, I've had this persistent dry hacking cough for 3 weeks since starting my new blood pressure pill."\nDoctor: "BP is 138/84. Lisinopril 20mg causes bradykinin cough. We'll switch you to Losartan 50mg daily."`,
      sampleOutput: JSON.stringify({
        soapNote: {
          subjective: "64yo male presents with 3-week dry cough following Lisinopril initiation.",
          objective: "BP 138/84 mmHg, HR 74 bpm. Lungs clear to auscultation bilaterally.",
          assessment: "1. ACE-inhibitor induced cough (bradykinin accumulation).\n2. Stage 1 Essential Hypertension.",
          plan: "1. Discontinue Lisinopril 20 mg PO daily.\n2. Initiate Losartan 50 mg PO daily.\n3. Recheck BP and BMP in 3 weeks."
        },
        sbarHandoff: {
          situation: "Medication adverse effect management: ACEi-induced cough.",
          background: "Hypertension managed on Lisinopril.",
          assessment: "Probable bradykinin-mediated cough; switched to ARB.",
          recommendation: "Follow up in 3 weeks with basic metabolic panel."
        }
      }, null, 2),
      chosenPreference: 'Structured SOAP note detailing ACE-inhibitor cough mechanism, switch to Losartan, and 3-week follow-up.',
      rejectedPreference: 'Patient has asthma. Prescribe albuterol inhaler and continue Lisinopril.'
    },
    {
      id: 'pharmacogenomics_pgx',
      name: 'Pharmacogenomics (PGx) & Drug-Herb Intercept',
      category: 'Specialty CDS',
      targetDomain: 'pocketgull.app',
      recommendedBaseModel: 'google/gemma-3-9b-it',
      defaultTrainer: 'SFT',
      quantizationTarget: 'Q4_K_M (Edge)',
      estimatedVramGb: 5.5,
      description: 'Screens patient Cytochrome P450 genotypes against active prescriptions, botanical herbs, and OTC supplements for lethal polypharmacy interactions.',
      clinicalImpact: 'Prevents adverse hepatic/cardiovascular polypharmacy events and provides precise genetic dosage titrations.',
      sampleInput: JSON.stringify({
        genotype: { cyp2d6: '*4/*4 (Poor Metabolizer)', slco1b1: '521T>C' },
        medications: ['Clopidogrel 75mg', 'Simvastatin 40mg', 'Metoprolol 50mg'],
        botanicals: ["St. John's Wort 300mg"]
      }, null, 2),
      sampleOutput: JSON.stringify({
        criticalAlerts: [
          {
            type: 'CONTRAINDICATION_INTERCEPT',
            agents: ["St. John's Wort", 'Simvastatin'],
            mechanism: "Potent CYP3A4 / P-gp induction reduces statin efficacy.",
            action: "Discontinue St. John's Wort."
          },
          {
            type: 'PGX_DOSE_ADJUSTMENT',
            gene: 'CYP2D6 *4/*4',
            drug: 'Metoprolol',
            mechanism: 'Poor metabolizer leads to 3-5x elevated plasma concentrations.',
            action: 'Reduce Metoprolol dosage by 50% or switch to Atenolol.'
          }
        ],
        riskScore: 'CRITICAL'
      }, null, 2),
      chosenPreference: "Identifies severe St. John's Wort CYP3A4 induction and CYP2D6 poor-metabolizer Metoprolol accumulation with dosage adjustments.",
      rejectedPreference: 'No interactions found. All supplements and drugs are safe to take together.'
    },
    {
      id: 'circadian_chronodosing',
      name: 'Circadian Chronodosing & Telemetry Forecasting',
      category: 'Chronobiology',
      targetDomain: 'pocketgull.app',
      recommendedBaseModel: 'google/gemma-3-9b-it',
      defaultTrainer: 'SFT',
      quantizationTarget: 'Q4_K_M (Edge)',
      estimatedVramGb: 5.5,
      description: 'Translates continuous wearable PPG, HRV, and salivary cortisol slopes into chronotherapy medication administration timing windows.',
      clinicalImpact: 'Converts non-dipping hypertensive phenotypes to dipping status, reducing cardiovascular events by 45%.',
      sampleInput: JSON.stringify({
        hrvRmssdMs: 24,
        diurnalCortisolSlope: { morningNmolL: 22.4, eveningNmolL: 14.8, status: 'BLUNTED_FLATTENED' },
        nocturnalBpDippingPct: 4.2,
        currentMeds: [{ name: 'Amlodipine 5mg', currentTiming: '08:00 AM' }]
      }, null, 2),
      sampleOutput: JSON.stringify({
        circadianPhenotype: 'Non-Dipper Hypertensive with Blunted Diurnal Cortisol Curve',
        chronotherapyOptimization: {
          recommendation: 'Shift Amlodipine administration from 08:00 AM to 09:30 PM (Bedtime Dosing).',
          rationale: 'Hygia Chronotherapy Trial & MAPEC studies demonstrate bedtime dosing converts non-dippers to dippers [PMID: 31640833].'
        }
      }, null, 2),
      chosenPreference: 'Recommends evidence-grounded bedtime shift for antihypertensive in non-dipping phenotype based on Hygia trial.',
      rejectedPreference: 'Keep morning administration regardless of nocturnal dipping status.'
    },
    {
      id: 'prior_auth_cms0057f',
      name: 'CMS-0057-F Prior Authorization FHIR Bundler',
      category: 'Interoperability',
      targetDomain: 'pocketgull.app',
      recommendedBaseModel: 'google/gemma-3-9b-it',
      defaultTrainer: 'SFT',
      quantizationTarget: 'Q8_0 (Balanced)',
      estimatedVramGb: 6.2,
      description: 'Transforms clinical encounter documentation into CMS-0057-F compliant FHIR R4 Claim preauthorization resource bundles with ICD-10 and CPT crosswalks.',
      clinicalImpact: 'Reduces prior-authorization turnaround from weeks to sub-second automated payer verification.',
      sampleInput: JSON.stringify({
        patientId: 'pat_98231',
        diagnosis: 'Severe Eczema refractory to topical steroids',
        requestedMedication: 'Dupilumab 300mg/2mL SQ q2w'
      }, null, 2),
      sampleOutput: JSON.stringify({
        resourceType: 'Bundle',
        type: 'collection',
        entry: [
          {
            resource: {
              resourceType: 'Claim',
              id: 'claim-pa-001',
              status: 'active',
              use: 'preauthorization',
              patient: { reference: 'Patient/pat_98231' },
              diagnosis: [{ sequence: 1, diagnosisCodeableConcept: { coding: [{ code: 'L20.84' }] } }],
              item: [{ sequence: 1, productOrService: { coding: [{ code: '1870238', display: 'Dupilumab' }] } }]
            }
          }
        ],
        clinicalJustification: 'Patient has documented failure of >= 2 high-potency topical corticosteroids.'
      }, null, 2),
      chosenPreference: 'Generates valid CMS-0057-F FHIR R4 Claim preauthorization bundle with ICD-10 L20.84.',
      rejectedPreference: 'Outputs non-standard text letter without FHIR schema.'
    },
    {
      id: 'tri_paradigm_synthesis',
      name: 'Tri-Paradigm Integrative Clinical Harmonization',
      category: 'Integrative',
      targetDomain: 'pocketgull.app',
      recommendedBaseModel: 'google/gemma-3-27b-it',
      defaultTrainer: 'SFT',
      quantizationTarget: 'Q8_0 (Balanced)',
      estimatedVramGb: 16.5,
      description: 'Synthesizes Western allopathic pathophysiology with Eastern TCM Zang-Fu organ patterns and Ayurvedic Dosha energetics with strict safety bounds.',
      clinicalImpact: 'Empowers culturally competent, integrative whole-person care without ungrounded medical pseudoscience.',
      sampleInput: JSON.stringify({
        westernDiagnosis: 'Metabolic Syndrome (Fasting Glucose 118 mg/dL)',
        tongueObservation: 'Pale swollen tongue with greasy white coating',
        doshaAssessment: 'Kapha-Pitta aggravation with impaired Agni'
      }, null, 2),
      sampleOutput: JSON.stringify({
        westernPathophysiology: 'Hepatic de novo lipogenesis and peripheral insulin resistance.',
        easternTcmPattern: 'Spleen Qi Deficiency with Phlegm-Damp Accumulation (Tan Shi).',
        ayurvedicEnergetics: 'Mandagni generating Ama obstructing Meda Dhatu.',
        integratedProtocol: {
          pharmacotherapy: 'Metformin 500mg ER (Western).',
          herbalFormulation: 'Er Chen Tang + Triphala.',
          dietaryTherapy: 'Warm, cooked bitter vegetables; eliminate cold dairy.'
        }
      }, null, 2),
      chosenPreference: 'Cross-paradigm integration mapping insulin resistance to Spleen Dampness and Kapha-Ama.',
      rejectedPreference: 'Unsubstantiated claims without clinical safety bounds.'
    },
    {
      id: 'rsna_imaging_vlm',
      name: 'Multimodal RSNA Knee & Radiological Reasoning',
      category: 'Multimodal Vision',
      targetDomain: 'pocketgull.app',
      recommendedBaseModel: 'google/gemma-3-27b-vision-it',
      defaultTrainer: 'SFT',
      quantizationTarget: 'FP16 (Cloud)',
      estimatedVramGb: 28.0,
      description: 'Visual instruction tuning on multi-slice knee radiographs and MRI series to produce Kellgren-Lawrence osteoarthritis grades and meniscus tear classifications.',
      clinicalImpact: 'Standardizes musculoskeletal radiological reporting and aligns imaging findings with conservative physical rehabilitation pathways.',
      sampleInput: JSON.stringify({
        modality: 'DICOM Knee Plain Radiograph + Sagittal PD MRI',
        findings: 'Medial joint space narrowing, subchondral sclerosis, 3mm osteophyte, medial meniscus grade 2 cleavage tear.'
      }, null, 2),
      sampleOutput: JSON.stringify({
        kellgrenLawrenceGrade: 'Grade 3 (Moderate Osteoarthritis)',
        radiologicalImpression: '1. Moderate medial compartment knee osteoarthritis (KL Grade 3).\n2. Non-displaced intrasubstance medial meniscus posterior horn degeneration.',
        clinicalRecommendation: 'Conservative physical therapy, unloader bracing, topical NSAIDs.'
      }, null, 2),
      chosenPreference: 'Standardized Kellgren-Lawrence Grade 3 assessment with precise anatomical localization and conservative management pathway.',
      rejectedPreference: 'Recommends immediate emergency total knee replacement.'
    },
    // ------------------------------------------------------------------------
    // Web & Domain Superchargers (pocketgull.app & pocketgull.com)
    // ------------------------------------------------------------------------
    {
      id: 'seo_medical_journalism',
      name: 'Medical Journalism & Health Literacy SEO Engine',
      category: 'Medical Journalism',
      targetDomain: 'pocketgull.com',
      recommendedBaseModel: 'google/gemma-3-9b-it',
      defaultTrainer: 'SFT',
      quantizationTarget: 'Q8_0 (Balanced)',
      estimatedVramGb: 5.5,
      description: 'Transforms complex Cochrane and PubMed trials into engaging Grade 6-8 plain-language articles with structured JSON-LD MedicalWebPage schemas for pocketgull.com.',
      clinicalImpact: 'Drives organic patient search traffic, elevates health literacy, and converts search visitors into pocketgull.app users.',
      sampleInput: JSON.stringify({
        studyTopic: 'Zone 2 Cardio and Mitochondrial Biogenesis in Metabolic Health',
        sourceCitations: ['San-Millán I, Brooks GA. Cell Metab 2018 (PMID: 29909271)']
      }, null, 2),
      sampleOutput: JSON.stringify({
        articleTitle: 'The Power of Zone 2 Cardio: How Easy Exercise Turbocharges Your Cellular Energy',
        slug: 'zone-2-cardio-mitochondrial-health',
        fleschKincaidGradeLevel: 7.2,
        metaDescription: 'Discover how 45 minutes of easy Zone 2 cardio trains your mitochondria to burn fat efficiently.',
        ftcDisclaimer: 'As an Amazon Associate, PocketGull earns from qualifying purchases.'
      }, null, 2),
      chosenPreference: 'Generates engaging Grade 7.2 plain-language article with structured JSON-LD MedicalWebPage metadata and compliant FTC disclaimers for pocketgull.com.',
      rejectedPreference: 'Outputs overly dense academic jargon or unverified miracle fitness claims.'
    },
    {
      id: 'voice_multimodal_live',
      name: 'Real-Time Multimodal Voice & Audio Stream Consult Tuner',
      category: 'Voice & Audio',
      targetDomain: 'pocketgull.app',
      recommendedBaseModel: 'google/gemma-3-4b-it',
      defaultTrainer: 'SFT',
      quantizationTarget: 'Q4_K_M (Edge)',
      estimatedVramGb: 2.8,
      description: 'Cleans spontaneous patient speech disfluencies and generates empathetic spoken audio responses with Speech Synthesis Markup Language (SSML) for live voice consults.',
      clinicalImpact: 'Creates a natural, low-latency conversational telemedicine consult experience in pocketgull.app with zero audio lag.',
      sampleInput: 'Patient audio transcript: "Um, hi doctor... so like, I have had this, uh, sharp pain under my right ribs for two days, and wait—it actually started Sunday night after pizza, and it kind of travels to my shoulder blade."',
      sampleOutput: JSON.stringify({
        extractedClinicalFacts: {
          chiefComplaint: 'Right Upper Quadrant (RUQ) sharp pain',
          duration: '2 days (onset Sunday evening post-fatty meal)',
          radiation: 'Right scapular / shoulder blade'
        },
        spokenResponseSsml: '<speak>I hear you clearly. <break time="300ms"/> Because this pattern can point to your gallbladder, <emphasis level="moderate">have you noticed any nausea, fever, or yellowing of your eyes?</emphasis></speak>'
      }, null, 2),
      chosenPreference: 'Strips speech disfluencies, extracts biliary colic chronology, and responds with natural SSML audio tags for streaming live consult in pocketgull.app.',
      rejectedPreference: 'Dumps a robotic wall of text without acoustic pacing or conversational empathy.'
    },
    {
      id: 'calgary_cambridge_intake',
      name: 'Socratic Calgary-Cambridge Patient Intake & Triage',
      category: 'Patient Triage',
      targetDomain: 'pocketgull.app',
      recommendedBaseModel: 'google/gemma-3-4b-it',
      defaultTrainer: 'SFT',
      quantizationTarget: 'Q4_K_M (Edge)',
      estimatedVramGb: 2.8,
      description: 'Guides patients through progressive, empathetic 1-question-at-a-time clinical triage adhering to the Calgary-Cambridge guide and OPQRST framework.',
      clinicalImpact: 'Eliminates form abandonment in pocketgull.app and extracts nuanced symptom chronologies before clinician handoff.',
      sampleInput: JSON.stringify({
        currentDialogTurn: 2,
        patientLastMessage: 'I have had a dull headache in the back of my head for 4 days.'
      }, null, 2),
      sampleOutput: JSON.stringify({
        opqrstState: { onset: '4 days ago', quality: 'Dull ache', radiation: 'Occipital / back of head' },
        redFlagScreening: { thunderclapOnset: false, fever: false, neurologicalDeficit: false },
        nextSocraticQuestion: 'Thank you for sharing that. On a scale from 1 to 10, how intense would you rate this dull ache, and does it feel tighter when you are looking down at screens?'
      }, null, 2),
      chosenPreference: 'Progressive 1-question Socratic inquiry characterizing tension headache vs cervical strain while actively screening red flags.',
      rejectedPreference: 'Asks 15 overwhelming questions in a single wall of text.'
    },
    {
      id: 'fda_ftc_compliance_copywriter',
      name: 'FTC & FDA 520(o) Clinical Copywriting & Compliance Guard',
      category: 'Legal & Compliance',
      targetDomain: 'Cross-Domain (Both)',
      recommendedBaseModel: 'google/gemma-3-9b-it',
      defaultTrainer: 'DPO',
      quantizationTarget: 'Q8_0 (Balanced)',
      estimatedVramGb: 5.5,
      description: 'Audits public copy, marketing pages, and UI cards across pocketgull.com and pocketgull.app to ensure FTC substantiation and statutory FDA 520(o) non-device CDS notices.',
      clinicalImpact: 'Protects brand reputation, prevents regulatory enforcement, and guarantees medical marketing integrity.',
      sampleInput: 'Draft Marketing Copy: "PocketGull is an AI doctor app that instantly cures chronic fatigue and permanently stops joint degeneration with zero prescription drugs."',
      sampleOutput: JSON.stringify({
        complianceStatus: 'VIOLATIONS_NEUTRALIZED',
        flaggedViolations: ['Unsubstantiated curative claim', 'Misleading medical device claim'],
        remediatedCompliantCopy: "PocketGull provides evidence-grounded Clinical Decision Support and personalized care plan strategies alongside your physician.",
        statutoryDisclaimer: "PocketGull is an epistemological clinical intelligence platform conforming to FDA 21 CFR §520(o) non-device CDS standards."
      }, null, 2),
      chosenPreference: 'Rewrites misleading health marketing into FTC-substantiated statements with explicit FDA 21 CFR §520(o) CDS notices.',
      rejectedPreference: 'Approves illegal curative claims that trigger FTC enforcement action.'
    }
  ]);

  readonly selectedParadigmId = signal<FineTuningParadigmId>('dpo_epistemic_grounding');

  readonly activeParadigm = computed(() => {
    return this.paradigms().find(p => p.id === this.selectedParadigmId()) || this.paradigms()[0];
  });

  readonly totalParadigms = computed(() => this.paradigms().length);

  selectParadigm(id: FineTuningParadigmId): void {
    this.selectedParadigmId.set(id);
  }

  generateCliCommand(paradigmId: FineTuningParadigmId, outputDir = './lora_adapter'): string {
    const p = this.paradigms().find(x => x.id === paradigmId) || this.paradigms()[0];
    const trainerFlag = p.defaultTrainer === 'DPO' ? '--trainer_type dpo' : '--trainer_type sft';
    const ggufFlag = p.quantizationTarget.includes('Q4_K_M') ? '--export_gguf q4_k_m' : '';
    return `python scripts/finetune_gemma_lora.py --paradigm ${p.id} --model_name ${p.recommendedBaseModel} ${trainerFlag} ${ggufFlag} --output_dir ${outputDir}`.trim();
  }

  generateVertexModelGardenUploadCommand(paradigmId: FineTuningParadigmId, projectId = 'gen-lang-client-0540208645', region = 'us-central1'): string {
    const p = this.paradigms().find(x => x.id === paradigmId) || this.paradigms()[0];
    const modelDisplayName = `pocketgull-${p.id.replace(/_/g, '-')}-gemma3-lora`;
    const artifactUri = `gs://${projectId}-vertex-model-garden/adapters/${p.id}`;
    return `gcloud ai models upload \\\n  --project=${projectId} \\\n  --region=${region} \\\n  --display-name=${modelDisplayName} \\\n  --container-image-uri=us-docker.pkg.dev/vertex-ai/prediction/vllm-openai:latest \\\n  --artifact-uri=${artifactUri} \\\n  --description="PocketGull ${p.name} Fine-Tuned Gemma 3 LoRA Adapter (${p.category})"`;
  }

  generateVertexEndpointDeployCommand(paradigmId: FineTuningParadigmId, projectId = 'gen-lang-client-0540208645', region = 'us-central1'): string {
    const p = this.paradigms().find(x => x.id === paradigmId) || this.paradigms()[0];
    const endpointName = `pocketgull-${p.id.replace(/_/g, '-')}-endpoint`;
    return `gcloud ai endpoints create \\\n  --project=${projectId} \\\n  --region=${region} \\\n  --display-name=${endpointName}\n\n# Deploy Model to Vertex Endpoint (Auto-scales to 0 when idle):\ngcloud ai endpoints deploy-model $(gcloud ai endpoints list --filter="displayName:${endpointName}" --format="value(name)" --region=${region} | head -n 1) \\\n  --project=${projectId} \\\n  --region=${region} \\\n  --model=$(gcloud ai models list --filter="displayName:pocketgull-${p.id.replace(/_/g, '-')}-gemma3-lora" --format="value(name)" --region=${region} | head -n 1) \\\n  --display-name=v1-active \\\n  --machine-type=g2-standard-4 \\\n  --accelerator=type=nvidia-l4,count=1 \\\n  --min-replica-count=0 \\\n  --max-replica-count=2`;
  }

  generateVertexCustomJobCommand(paradigmId: FineTuningParadigmId, projectId = 'gen-lang-client-0540208645', region = 'us-central1'): string {
    const p = this.paradigms().find(x => x.id === paradigmId) || this.paradigms()[0];
    return `gcloud ai custom-jobs create \\\n  --project=${projectId} \\\n  --region=${region} \\\n  --display-name=train-pocketgull-${p.id.replace(/_/g, '-')} \\\n  --worker-pool-spec=machine-type=g2-standard-8,accelerator-type=NVIDIA_L4,accelerator-count=1,container-image-uri=us-docker.pkg.dev/vertex-ai/training/pytorch-gpu.2-1:latest \\\n  --args="scripts/finetune_gemma_lora.py,--paradigm,${p.id},--model_name,${p.recommendedBaseModel},--trainer_type,${p.defaultTrainer.toLowerCase()}"`;
  }

  generateVertexModelCardYaml(paradigmId: FineTuningParadigmId): string {
    const p = this.paradigms().find(x => x.id === paradigmId) || this.paradigms()[0];
    return `model_card:
  name: "PocketGull ${p.name}"
  publisher: "GEARARTS / PocketGull Clinical Intelligence"
  version: "1.16.0"
  base_model: "${p.recommendedBaseModel}"
  target_paradigm: "${p.id}"
  category: "${p.category}"
  primary_domain: "${p.targetDomain}"
  license: "Apache-2.0 / CC-BY-4.0"
  hipaa_compliance: "HIPAA §164.514 Safe Harbor De-Identified"
  open_science:
    zenodo_doi: "10.5281/zenodo.20647514"
    npi: "1487569752"
    orcid: "0009-0008-1372-5381"
  serving:
    container_image: "us-docker.pkg.dev/vertex-ai/prediction/vllm-openai:latest"
    recommended_accelerator: "NVIDIA L4 (24GB VRAM) / TPU v5e"
    estimated_vram_gb: ${p.estimatedVramGb}
    min_replicas: 0
    max_replicas: 2`;
  }

  exportDatasetJsonl(): string {
    return this.paradigms().map(p => JSON.stringify({
      paradigm: p.id,
      instruction: p.description,
      input: p.sampleInput,
      output: p.sampleOutput,
      chosen: p.chosenPreference,
      rejected: p.rejectedPreference
    })).join('\n');
  }
}
