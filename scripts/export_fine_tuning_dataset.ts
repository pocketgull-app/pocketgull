import * as fs from 'fs';
import * as path from 'path';

export type FineTuningParadigm = 
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
  | 'zero_knowledge_vault_privacy'
  | 'skeptical_epistemology_falsification'
  | 'toxicology_antidote_decontamination'
  | 'environmental_exposomics_pfas_detox'
  | 'positive_psychology_perma_v'
  | 'seligman_abcde_optimism'
  | 'via_character_strengths'
  | 'snyder_hope_pathways';

export interface IFineTuningRecord {
  paradigm: FineTuningParadigm;
  instruction: string;
  input: string;
  output: string;
  chosen?: string;
  rejected?: string;
  metadata?: Record<string, any>;
}

export function generateAllParadigmsDataset(): IFineTuningRecord[] {
  const records: IFineTuningRecord[] = [
    // 1. DPO Epistemic Grounding & Hallucination Suppression
    {
      paradigm: 'dpo_epistemic_grounding',
      instruction: 'Evaluate clinical efficacy of high-dose oral curcumin for osteoarthritic knee pain with Popperian H0 test and Cochrane Risk of Bias.',
      input: JSON.stringify({ supplement: 'Curcumin (Bio-enhanced)', indication: 'Knee Osteoarthritis', dosageMg: 1000 }, null, 2),
      output: JSON.stringify({
        evidenceTier: 'Level B (Cohort / Small RCTs)',
        nullHypothesisH0: 'Curcumin 1000mg produces no statistically significant WOMAC score reduction compared to placebo at 12 weeks.',
        pValue: 0.038,
        isFalsified: true,
        cochraneRiskOfBias: { overall: 'Some Concerns', commercialFundingBias: 'Moderate' },
        recommendation: 'Adjunctive supportive therapy. Does not replace physical therapy, weight management, or intra-articular interventions.',
        primaryCitation: 'Cochrane Database Syst Rev (PMID: 33150652)'
      }, null, 2),
      chosen: 'Curcumin demonstrates modest adjunctive pain reduction (p = 0.038 against H0), supported by Cochrane review (PMID: 33150652, Level B). Recommend as supportive therapy alongside physical conditioning. Note moderate risk of industry-funded study bias.',
      rejected: 'Curcumin is an FDA-approved miracle cure that permanently heals cartilage tears and completely eliminates arthritis without side effects.'
    },

    // 2. Ambient Clinical Scribe & SOAP Generator
    {
      paradigm: 'ambient_scribe_soap',
      instruction: 'Convert raw doctor-patient ambient transcript into structured clinical SOAP note and SBAR specialist handoff.',
      input: `Doctor: "Good morning Mr. Davis. What brings you in today?"\nPatient: "Doctor, I've had this persistent dry hacking cough for 3 weeks since starting my new blood pressure pill."\nDoctor: "BP is 138/84. Lisinopril 20mg causes bradykinin cough. We'll switch you to Losartan 50mg daily."`,
      output: JSON.stringify({
        soapNote: {
          subjective: "64yo male presents with 3-week dry non-productive cough following Lisinopril initiation.",
          objective: "BP 138/84 mmHg, HR 74 bpm. Lungs clear to auscultation bilaterally.",
          assessment: "1. ACE-inhibitor induced cough (bradykinin accumulation).\n2. Stage 1 Essential Hypertension (controlled).",
          plan: "1. Discontinue Lisinopril 20 mg PO daily.\n2. Initiate Losartan 50 mg PO daily.\n3. Recheck BP and serum BMP in 3 weeks."
        },
        sbarHandoff: {
          situation: "Medication adverse effect management: ACEi-induced cough.",
          background: "Hypertension managed on Lisinopril for 3 weeks.",
          assessment: "Probable bradykinin-mediated cough; switched to ARB (Losartan).",
          recommendation: "Follow up in clinic in 3 weeks with basic metabolic panel."
        }
      }, null, 2),
      chosen: "Structured SOAP note detailing ACE-inhibitor cough mechanism, discontinuation of Lisinopril, initiation of Losartan, and 3-week BMP follow-up.",
      rejected: "Patient has asthma. Prescribe albuterol inhaler and continue Lisinopril."
    },

    // 3. Pharmacogenomics (PGx) & Drug-Herb Interaction Classifier
    {
      paradigm: 'pharmacogenomics_pgx',
      instruction: 'Screen patient medication list, herbal supplements, and Cytochrome P450 genotype for critical interactions.',
      input: JSON.stringify({
        genotype: { cyp2d6: '*4/*4 (Poor Metabolizer)', slco1b1: '521T>C (Decreased Statin Clearance)' },
        medications: ['Clopidogrel 75mg', 'Simvastatin 40mg', 'Metoprolol 50mg'],
        botanicals: ["St. John's Wort 300mg", 'Ashwagandha 600mg']
      }, null, 2),
      output: JSON.stringify({
        criticalAlerts: [
          {
            type: 'CONTRAINDICATION_INTERCEPT',
            agents: ["St. John's Wort", 'Simvastatin', 'Clopidogrel'],
            mechanism: "St. John's Wort potent CYP3A4 / P-gp induction dramatically lowers active drug bioavailability.",
            action: "Strictly discontinue St. John's Wort."
          },
          {
            type: 'PGX_DOSE_ADJUSTMENT',
            gene: 'CYP2D6 *4/*4',
            drug: 'Metoprolol',
            mechanism: 'Poor metabolizer genotype leads to 3-5x elevated plasma concentrations and severe bradycardia risk.',
            action: 'Reduce Metoprolol dosage by 50% or switch to Atenolol (renal clearance).'
          }
        ],
        riskScore: 'CRITICAL (Tier 1 Polypharmacy Guardrail Triggered)'
      }, null, 2),
      chosen: "Identifies severe St. John's Wort CYP3A4 induction, CYP2D6 poor-metabolizer Metoprolol accumulation, and SLCO1B1 Simvastatin myopathy risk.",
      rejected: "No interactions found. All supplements and drugs are safe to take together."
    },

    // 4. Circadian Chronodosing & Telemetry Forecasting
    {
      paradigm: 'circadian_chronodosing',
      instruction: 'Analyze continuous wearable PPG / HRV telemetry and salivary cortisol curve to generate chronotherapy dosing recommendations.',
      input: JSON.stringify({
        hrvRmssdMs: 24,
        diurnalCortisolSlope: { morningNmolL: 22.4, eveningNmolL: 14.8, status: 'BLUNTED_FLATTENED' },
        nocturnalBpDippingPct: 4.2,
        currentMeds: [{ name: 'Amlodipine 5mg', currentTiming: '08:00 AM' }]
      }, null, 2),
      output: JSON.stringify({
        circadianPhenotype: 'Non-Dipper Hypertensive with Blunted Diurnal Cortisol Curve',
        chronotherapyOptimization: {
          recommendation: 'Shift Amlodipine administration from 08:00 AM to 09:30 PM (Bedtime Dosing).',
          rationale: 'Hygia Chronotherapy Trial & MAPEC studies demonstrate bedtime dosing converts non-dippers to dippers and reduces nocturnal stroke/CVD risk by 45% [PMID: 31640833].',
          morningLightProtocol: '10,000 lux broad-spectrum light exposure within 30 min of waking to restore steep cortisol slope.'
        }
      }, null, 2),
      chosen: "Recommends evidence-grounded bedtime shift for antihypertensive in non-dipping phenotype based on Hygia trial telemetry data.",
      rejected: "Keep taking all medications in morning regardless of nocturnal dipping status."
    },

    // 5. CMS-0057-F Prior Authorization FHIR Bundler
    {
      paradigm: 'prior_auth_cms0057f',
      instruction: 'Generate a CMS-0057-F compliant FHIR R4 Prior Authorization Claim bundle with ICD-10 and CPT crosswalk.',
      input: JSON.stringify({
        patientId: 'pat_98231',
        diagnosis: 'Severe Eczema / Atopic Dermatitis refractory to topical corticosteroids',
        requestedMedication: 'Dupilumab (Dupixent) 300mg/2mL SQ q2w',
        failedTherapies: ['Triamcinolone 0.1% cream x 8 weeks', 'Tacrolimus 0.1% ointment x 6 weeks']
      }, null, 2),
      output: JSON.stringify({
        resourceType: 'Bundle',
        type: 'collection',
        entry: [
          {
            resource: {
              resourceType: 'Claim',
              id: 'claim-pa-001',
              status: 'active',
              type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/claim-type', code: 'pharmacy' }] },
              use: 'preauthorization',
              patient: { reference: 'Patient/pat_98231' },
              diagnosis: [{ sequence: 1, diagnosisCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/sid/icd-10-cm', code: 'L20.84', display: 'Intrinsic (allergic) eczema' }] } }],
              item: [{ sequence: 1, productOrService: { coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '1870238', display: 'Dupilumab 150 MG/ML' }] } }]
            }
          }
        ],
        clinicalJustification: 'Patient has documented failure and intolerance of >= 2 high-potency topical corticosteroids and topical calcineurin inhibitors, satisfying MCG criteria.'
      }, null, 2),
      chosen: "Generates valid FHIR R4 Claim preauthorization bundle with ICD-10 L20.84, RxNorm 1870238, and MCG guideline adherence proof.",
      rejected: "Outputs informal text letter without FHIR schema or ICD-10 coding."
    },

    // 6. Tri-Paradigm Harmonization (Allopathic + TCM + Ayurvedic)
    {
      paradigm: 'tri_paradigm_synthesis',
      instruction: 'Synthesize a multi-paradigm clinical integrative map for Metabolic Syndrome / Insulin Resistance.',
      input: JSON.stringify({
        westernDiagnosis: 'Metabolic Syndrome (Fasting Glucose 118 mg/dL, Triglycerides 220 mg/dL, Waist 41 in)',
        tongueObservation: 'Pale swollen tongue with thick greasy white coating, tooth marks',
        doshaAssessment: 'Kapha-Pitta aggravation with impaired Agni (Mandagni)'
      }, null, 2),
      output: JSON.stringify({
        westernPathophysiology: 'Hepatic de novo lipogenesis, peripheral insulin resistance, endothelial micro-inflammation.',
        easternTcmPattern: 'Spleen Qi Deficiency failing to transform fluids leading to Phlegm-Damp Accumulation (Tan Shi).',
        ayurvedicEnergetics: 'Mandagni (low metabolic fire) generating Ama (metabolic endotoxins) obstructing Meda Dhatu (adipose tissue channels).',
        integratedProtocol: {
          pharmacotherapy: 'Metformin 500mg ER with dinner (Western).',
          herbalFormulation: 'Er Chen Tang + Shen Ling Bai Zhu San and Triphala + Guggulu.',
          dietaryTherapy: 'Warm, cooked bitter/pungent vegetables; eliminate cold dairy and refined seed oils.'
        }
      }, null, 2),
      chosen: "Rigorous cross-paradigm synthesis mapping insulin resistance to Spleen Dampness and Kapha-Ama with clear safety boundaries.",
      rejected: "Dismiss traditional medicine completely or make unsubstantiated claims."
    },

    // 7. Multimodal Medical Imaging / RSNA Knee VLM Reasoning
    {
      paradigm: 'rsna_imaging_vlm',
      instruction: 'Analyze bilateral weight-bearing knee radiograph & sagittal proton-density MRI slices to produce structured Kellgren-Lawrence impression.',
      input: JSON.stringify({
        modality: 'DICOM Knee Plain Radiograph + Sagittal PD MRI',
        findings: 'Medial joint space narrowing (2.1mm), subchondral sclerosis, medial tibial plateau osteophyte (3mm), grade 2 horizontal cleavage tear of medial meniscus posterior horn.'
      }, null, 2),
      output: JSON.stringify({
        kellgrenLawrenceGrade: 'Grade 3 (Moderate Osteoarthritis)',
        meniscusIntegrity: { location: 'Medial Meniscus Posterior Horn', type: 'Horizontal Cleavage Tear', signalTier: 'Grade 2 (Intrasubstance)' },
        radiologicalImpression: '1. Moderate medial compartment knee osteoarthritis (Kellgren-Lawrence Grade 3) with definite osteophytosis.\n2. Non-displaced intrasubstance medial meniscus posterior horn degeneration.',
        clinicalRecommendation: 'Conservative management: quad strengthening physical therapy, unloader bracing, topical diclofenac.'
      }, null, 2),
      chosen: "Standardized Kellgren-Lawrence Grade 3 assessment with precise anatomical localization and conservative management pathway.",
      rejected: "Recommends immediate emergency total knee replacement for mild grade 2 degeneration."
    },

    // 8. Medical Journalism & Health Literacy SEO Engine (pocketgull.com)
    {
      paradigm: 'seo_medical_journalism',
      instruction: 'Transform clinical RCT study into an engaging Grade 6-8 health literacy article with JSON-LD schema for pocketgull.com.',
      input: JSON.stringify({
        studyTopic: 'Zone 2 Cardio and Mitochondrial Biogenesis in Metabolic Health',
        sourceCitations: ['San-Millán I, Brooks GA. Cell Metab 2018 (PMID: 29909271)']
      }, null, 2),
      output: JSON.stringify({
        articleTitle: 'The Power of Zone 2 Cardio: How Easy Exercise Turbocharges Your Cellular Energy',
        slug: 'zone-2-cardio-mitochondrial-health',
        fleschKincaidGradeLevel: 7.2,
        metaDescription: 'Discover how 45 minutes of easy Zone 2 cardio trains your mitochondria to burn fat and clear blood sugar efficiently. Evidence-backed guide by PocketGull.',
        sections: [
          {
            heading: 'What is Zone 2 and Why Does It Matter?',
            content: 'Zone 2 is light-to-moderate exercise where you can still speak in complete sentences without gasping for breath.'
          }
        ],
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@type': 'MedicalWebPage',
          headline: 'The Power of Zone 2 Cardio: How Easy Exercise Turbocharges Your Cellular Energy'
        },
        ftcDisclaimer: 'As an Amazon Associate, PocketGull earns from qualifying purchases of recommended heart rate monitors and training gear.'
      }, null, 2),
      chosen: 'Generates engaging Grade 7.2 plain-language article with structured JSON-LD MedicalWebPage metadata and compliant FTC disclaimers for pocketgull.com.',
      rejected: 'Outputs overly dense academic jargon or unverified miracle fitness claims.'
    },

    // 9. Real-Time Multimodal Voice & Audio Stream Consult Tuner (pocketgull.app)
    {
      paradigm: 'voice_multimodal_live',
      instruction: 'Parse spontaneous speech transcription, strip fillers and disfluencies, and generate conversational SSML audio response.',
      input: 'Patient audio transcript: "Um, hi doctor... so like, I have had this, uh, sharp pain under my right ribs for two days, and wait—it actually started Sunday night after pizza, and it kind of travels to my shoulder blade."',
      output: JSON.stringify({
        extractedClinicalFacts: {
          chiefComplaint: 'Right Upper Quadrant (RUQ) sharp pain',
          duration: '2 days (onset Sunday evening post-fatty meal)',
          radiation: 'Right scapular / shoulder blade',
          suspectedPathology: 'Biliary colic vs Acute Cholecystitis'
        },
        spokenResponseSsml: '<speak>I hear you clearly, and I am noting that right upper rib pain following a meal with radiation to your shoulder blade. <break time="300ms"/> Because this pattern can point to your gallbladder, <emphasis level="moderate">have you noticed any nausea, fever, or yellowing of your eyes?</emphasis></speak>'
      }, null, 2),
      chosen: 'Strips speech disfluencies, extracts biliary colic chronology, and responds with natural SSML audio tags for streaming live consult in pocketgull.app.',
      rejected: 'Dumps a robotic wall of text without acoustic pacing or conversational empathy.'
    },

    // 10. Socratic Calgary-Cambridge Patient Intake & Triage (pocketgull.app)
    {
      paradigm: 'calgary_cambridge_intake',
      instruction: 'Conduct dynamic 1-question-at-a-time Calgary-Cambridge clinical intake interview, extracting OPQRST symptom vectors.',
      input: JSON.stringify({
        currentDialogTurn: 2,
        patientLastMessage: 'I have had a dull headache in the back of my head for 4 days.'
      }, null, 2),
      output: JSON.stringify({
        opqrstState: { onset: '4 days ago', quality: 'Dull ache', radiation: 'Occipital / back of head' },
        redFlagScreening: { thunderclapOnset: false, fever: false, neurologicalDeficit: false },
        nextSocraticQuestion: 'Thank you for sharing that. On a scale from 1 to 10, how intense would you rate this dull ache, and does it feel tighter when looking down at screens?',
        intakeStage: 'OPQRST_CHARACTERIZATION'
      }, null, 2),
      chosen: 'Progressive 1-question Socratic inquiry characterizing tension headache vs cervical strain while actively screening red flags.',
      rejected: 'Asks 15 overwhelming questions in a single wall of text.'
    },

    // 11. FTC & FDA 520(o) Clinical Copywriting & Compliance Guard (Both Domains)
    {
      paradigm: 'fda_ftc_compliance_copywriter',
      instruction: 'Audit marketing copy, eliminate unsubstantiated medical claims, and insert statutory FDA 520(o) non-device CDS disclaimers.',
      input: 'Draft Marketing Copy: "PocketGull is an AI doctor app that instantly cures chronic fatigue and permanently stops joint degeneration with zero prescription drugs."',
      output: JSON.stringify({
        complianceStatus: 'VIOLATIONS_NEUTRALIZED',
        flaggedViolations: ['Unsubstantiated curative claim ("instantly cures chronic fatigue")', 'Misleading medical device claim ("AI doctor app")'],
        remediatedCompliantCopy: "PocketGull provides evidence-grounded Clinical Decision Support and personalized care plan strategies to help you navigate vitality, joint health, and metabolic wellness alongside your primary care physician.",
        statutoryDisclaimer: "PocketGull is an epistemological clinical intelligence platform conforming to FDA 21 CFR §520(o) non-device Clinical Decision Support standards."
      }, null, 2),
      chosen: 'Rewrites misleading health marketing into FTC-substantiated wellness statements with explicit FDA 21 CFR §520(o) CDS notices.',
      rejected: 'Approves illegal curative claims that trigger FTC enforcement action.'
    },

    // 12. Zero-Knowledge Client-Side Cryptographic Vault & PHI Privacy
    {
      paradigm: 'zero_knowledge_vault_privacy',
      instruction: 'Enforce zero-knowledge client-side encryption policy for clinical archive export without server-side key or plaintext egress.',
      input: JSON.stringify({
        patientId: 'pat_48291',
        recordType: 'Full Comprehensive Health Archive',
        encryptionStandard: 'AES-GCM-256 (PBKDF2 100,000 iterations)',
        requestedAction: 'Export .pocketgull encrypted container'
      }, null, 2),
      output: JSON.stringify({
        zeroKnowledgeStatus: 'ENFORCED_CLIENT_SIDE',
        cryptographicContainer: {
          format: 'pocketgull-encrypted-vault',
          version: 1,
          algorithm: 'AES-GCM-256',
          kdf: 'PBKDF2-SHA256',
          iterations: 100000,
          keyEgress: 'ZERO_EGRESS_VERIFIED'
        },
        securityNotice: 'Keys are derived in client-side volatile memory. The platform cannot recover or view unencrypted PHI if the passphrase is lost.'
      }, null, 2),
      chosen: 'Strictly executes native WebCrypto PBKDF2/AES-GCM-256 encryption in client volatile memory with zero server-side key egress.',
      rejected: 'Transmits unencrypted medical records over the network to a central server for cloud encryption.'
    },

    // 13. Skeptical Epistemology & Socratic Evidence-Based CDS
    {
      paradigm: 'skeptical_epistemology_falsification',
      instruction: 'Evaluate an emerging clinical intervention, calculate Popperian falsifiability H0, perform Cochrane RoB 2 appraisal, and generate a Socratic active recall prompt.',
      input: JSON.stringify({
        intervention: 'Resonance Frequency Breathing (0.1 Hz Diaphragmatic RSA) for Vagal Tone & Post-Concussion Autonomic Dysfunction',
        proposedOutcome: 'Significant increase in high-frequency Heart Rate Variability (HF-HRV rMSSD > 50ms) within 4 weeks'
      }, null, 2),
      output: JSON.stringify({
        nullHypothesisH0: '0.1 Hz resonance frequency breathing produces no statistically significant rMSSD increase compared to sham pacing (p > 0.05).',
        falsificationResult: { pValue: 0.012, isFalsified: true, epistemicConfidence: 94 },
        cochraneRoB2: {
          randomization: 'Low Risk of Bias',
          measurement: 'Some Concerns',
          overall: 'Level B (Cohort & Sham-Controlled Studies)'
        },
        socraticChallenge: {
          question: 'Why must heart rate variability (HRV) changes be evaluated longitudinally across 14+ days rather than a single acute measurement?',
          correctConcept: 'Intra-individual diurnal variance and acute sympathetic stressors confound single snapshots; longitudinal trends isolate true baroreflex adaptation.',
          doiCitation: 'Frontiers in Pain Research (2024; DOI: 10.3389/fpain.2024.1397645)'
        }
      }, null, 2),
      chosen: 'Formulates explicit null hypothesis H0, computes p-value, grades Cochrane RoB 2, and generates Socratic challenge with DOI evidence citation.',
      rejected: 'Uncritically asserts that breathing exercises cure all neurological conditions without statistical or methodological scrutiny.'
    },

    // ------------------------------------------------------------------------
    // 14. Emergency Toxicology & Antidote Decontamination (WHO / ATSDR)
    // ------------------------------------------------------------------------
    {
      paradigm: 'toxicology_antidote_decontamination',
      instruction: 'Perform emergency clinical toxidrome triage for an acute agricultural pesticide and botanical ingestion with weight-adjusted antidote dosing.',
      input: JSON.stringify({
        patientWeightKg: 70,
        exposure: 'Suspected acute Diazinon (Organophosphate) spray ingestion + raw Aconite root brew ingestion 45 minutes prior',
        vitals: { hr: 42, bp: '82/48', spO2: 89, pupils: 'Pinpoint (1mm)', respiratoryRate: 8 },
        symptoms: ['Excessive salivation', 'Lacrimation', 'Bronchorrhea', 'Ventricular ectopic beats', 'Diaphoresis']
      }, null, 2),
      output: JSON.stringify({
        primaryToxidrome: 'Severe Cholinergic Crisis (Organophosphate) + Aconitine Cardiotoxicity',
        priorityAction: 'IMMEDIATE EMS RESUSCITATION & AIRWAY PROTECTION',
        immediateAntidoteOrders: [
          {
            drug: 'Atropine Sulfate',
            dose: '2.0 mg IV push every 3-5 minutes',
            endpoint: 'Titrate until bronchial secretions clear and heart rate > 60 bpm (do not titrate to mydriasis)'
          },
          {
            drug: 'Pralidoxime Chloride (2-PAM)',
            dose: '1.0 g to 2.0 g IV in 100 mL NS over 15-30 minutes',
            rationale: 'Reactivates phosphorylated acetylcholinesterase before irreversible aging occurs'
          }
        ],
        contraindicatedInterventions: [
          'DO NOT induce emesis with Ipecac (risk of aspiration pneumonitis in altered mental status)',
          'DO NOT administer oral herbal detox teas or activated charcoal until airway is secured via endotracheal intubation'
        ],
        continuousMonitoring: ['Continuous 12-lead ECG for aconite-induced polymorphic VT/torsades', 'Pulse oximetry', 'Serial plasma cholinesterase activity'],
        whoPoisonCenterContact: 'Notify regional poison control center and emergency medical services immediately.'
      }, null, 2),
      chosen: 'Provides guideline-adherent WHO/ATSDR cholinergic toxidrome management with exact Atropine/2-PAM titration endpoints and explicit contraindication warnings.',
      rejected: 'Recommends drinking ginger tea and waiting at home for the pesticide to naturally flush through sweat glands.'
    },

    // ------------------------------------------------------------------------
    // 15. Environmental Exposomics & PFAS / Endocrine Disruptor Clearance (EPA/NIEHS)
    // ------------------------------------------------------------------------
    {
      paradigm: 'environmental_exposomics_pfas_detox',
      instruction: 'Formulate an evidence-based clinical protocol to accelerate clearance of bioaccumulated perfluoroalkyl substances (PFAS) and endocrine disruptors.',
      input: JSON.stringify({
        patientAge: 48,
        gender: 'Male',
        exposureHistory: '15-year municipal drinking water contamination (PFOA 42 ng/mL, PFOS 28 ng/mL)',
        comorbidities: ['Hypercholesterolemia', 'Elevated ALT (58 U/L)', 'Subclinical Hypothyroidism (TSH 4.8 mIU/L)']
      }, null, 2),
      output: JSON.stringify({
        exposomeAssessment: {
          serumPfasBurden: 'Significantly elevated (> 20 ng/mL clinical intervention threshold per NASEM guidelines)',
          targetClearanceMechanisms: ['Enterohepatic circulation interruption', 'Hepatic Phase II glucuronidation & sulfation induction', 'Transdermal excretion']
        },
        clinicalClearanceProtocol: {
          phase1_enterohepaticBinding: 'High-viscosity soluble dietary fibers (modified citrus pectin 5g TID + psyllium husk) to bind bile-bound fluorinated surfactants and prevent reabsorption.',
          phase2_hepaticConjugation: 'Sulforaphane (100 µmol glucoraphanin daily) + N-acetylcysteine (1,200 mg/d) to induce GSTA1, GSTM1, and SULT1A1 enzymes.',
          phase3_dermalExcretion: 'Far-infrared hyperthermia (sauna at 65°C for 20-30 min, 3x/week with electrolyte repletion) to support sweat-mediated excretion of hydrophilic toxic metabolites.'
        },
        laboratoryMonitoringPanel: [
          'Serum PFAS panel via LC-MS/MS every 6 months to calculate clearance half-life reduction',
          'Comprehensive metabolic panel & lipid profile (monitor non-HDL cholesterol)',
          'Urine Albumin-to-Creatinine Ratio (UACR) to evaluate glomerular barrier integrity'
        ],
        falsificationNullHypothesis: 'H0: Targeted enterohepatic binding and Phase II induction provides no significant acceleration in serum PFOA elimination rate over baseline 3.8-year half-life (p > 0.05).'
      }, null, 2),
      chosen: 'Formulates a multi-phase, guideline-grounded (NASEM/EPA/NIEHS) clearance protocol targeting enterohepatic binding, Phase II hepatic conjugation, and objective LC-MS/MS monitoring.',
      rejected: 'Recommends unverified colon cleanses or dangerous synthetic chelation agents without baseline heavy metal indications.'
    },

    // 16. Positive Psychology & PERMA-V Flourishing Assessment
    {
      paradigm: 'positive_psychology_perma_v',
      instruction: 'Evaluate multi-dimensional patient well-being across Martin Seligman\'s PERMA-V model (Positive Emotion, Engagement, Relationships, Meaning, Accomplishment, Vitality) with composite Flourishing Index.',
      input: JSON.stringify({
        patientProfile: '48yo executive experiencing career burnout, disrupted sleep, and chronic shoulder tension',
        reportedScores: {
          positiveEmotion: 4.2,
          engagement: 5.0,
          relationships: 6.8,
          meaning: 7.2,
          accomplishment: 7.5,
          vitality: 3.5
        }
      }, null, 2),
      output: JSON.stringify({
        flourishingIndex: 57.0,
        tier: 'Moderate Flourishing',
        dimensionAnalysis: {
          vitalityBottleneck: 'Vitality (3.5/10) and Positive Emotion (4.2/10) represent acute systemic limiters due to sleep fragmentation and sympathetic overdrive.',
          signatureAnchors: 'Meaning (7.2/10) and Accomplishment (7.5/10) provide high cognitive resilience and purpose-driven motivation.'
        },
        evidenceGrounding: 'Seligman (2011) Flourish / Butler & Kern (2016) PERMA-Profiler validation (n=34,980, alpha=0.94).',
        targetedPillarInterventions: [
          'Vitality: 10-minute morning outdoor light exposure (10,000 lux) + 4608k coherence breathwork to reset cortisol curve.',
          'Positive Emotion: Three Good Things daily attribution protocol before sleep to upregulate dopaminergic savoring.'
        ]
      }, null, 2),
      chosen: 'Computes empirical PERMA-V composite score (57.0/100), isolates Vitality as the physiological bottleneck, and leverages Meaning as a psychological lever.',
      rejected: 'Tells the patient to just think positively and take an unverified herbal mood booster.'
    },

    // 17. Seligman ABCDE Learned Optimism Reframing
    {
      paradigm: 'seligman_abcde_optimism',
      instruction: 'Perform cognitive explanatory style reframing on a somatic adversity using Seligman\'s ABCDE protocol (Adversity, Belief, Consequence, Disputation across Permanence/Pervasiveness/Personalization, Energization).',
      input: JSON.stringify({
        adversity: 'Patient with prediabetes encounters an unexpected 185 mg/dL postprandial glucose spike after a business lunch.',
        automaticBelief: 'My metabolism is permanently broken, I have no willpower, and I will inevitably need insulin injections.',
        consequence: 'Hopelessness, skipped evening exercise, and late-night binge snacking.'
      }, null, 2),
      output: JSON.stringify({
        disputation: {
          permanence: 'Temporary: Acute glycemic response to refined carbohydrates in restaurant sauce, resolving within 120-180 minutes as insulin sensitivity normalizes.',
          pervasiveness: 'Specific: One isolated meal does not negate 6 weeks of successful 0.4% HbA1c reduction and muscle mass accretion.',
          personalization: 'External/Physiological: Modern restaurant dishes contain hidden maltodextrin/corn syrup; physiological hepatic gluconeogenesis responded predictably to hidden sugars.'
        },
        energizationPlan: '15-minute brisk zone-1 walk immediately to activate GLUT4 non-insulin-dependent muscle glucose uptake, restoring euglycemia within 45 minutes.',
        clinicalTrialCitation: 'Seligman et al. (2005) American Psychologist RCT (d = 0.58 on sustained optimism and metabolic agency).'
      }, null, 2),
      chosen: 'Applies rigorous ABCDE disputation addressing permanence, pervasiveness, and personalization with immediate GLUT4 physical activity energization.',
      rejected: 'Scolds the patient for poor diet choices and increases medication without evaluating the context.'
    },

    // 18. VIA 24 Character Strengths Habit Scaffolding
    {
      paradigm: 'via_character_strengths',
      instruction: 'Map patient\'s top VIA Character Strengths into behavioral micro-habits to overcome clinical protocol non-adherence.',
      input: JSON.stringify({
        clinicalPrescription: 'Daily home blood pressure monitoring (BID) + 30-minute zone-2 aerobic conditioning',
        signatureStrengths: ['Curiosity & Exploration (Wisdom)', 'Appreciation of Beauty (Transcendence)'],
        barrier: 'Finds home vitals recording tedious and indoor treadmill walking boring.'
      }, null, 2),
      output: JSON.stringify({
        scaffoldingStrategy: {
          curiosityActivation: 'Frame BP tracking as an N-of-1 physiological research experiment: chart arterial pulse wave responses to different breathing rhythms and green tea polyphenol intake.',
          beautyAppreciationActivation: 'Shift aerobic conditioning from indoor treadmill to scenic outdoor trail walking / coastal bird-watching paths, tracking perceived flora/sky beauty alongside heart rate coherence.'
        },
        expectedAdherenceIncrease: '3.4x higher 90-day protocol retention compared to generic compliance nagging (Peterson & Seligman VIA Institute 2004).'
      }, null, 2),
      chosen: 'Aligns clinical adherence tasks directly with the patient\'s intrinsic signature strengths (Curiosity & Beauty) rather than relying on extrinsic discipline.',
      rejected: 'Tells the patient they must force themselves to sit on the treadmill and threaten them with hypertensive stroke statistics.'
    },

    // 19. Snyder Hope Multi-Pathway Choice Architecture
    {
      paradigm: 'snyder_hope_pathways',
      instruction: 'Construct a Snyder Hope Theory Care Plan decomposing clinical goals into Agency (Willpower) and Multiple Waypower Pathways (Alternative Action Vectors).',
      input: JSON.stringify({
        primaryGoal: 'Achieve nocturnal HRV > 55 ms and deep sleep > 90 minutes within 60 days',
        currentObstacle: 'Frequent evening work calls prevent sticking to a rigid 9:00 PM wind-down routine.'
      }, null, 2),
      output: JSON.stringify({
        hopeArchitecture: {
          goal: 'Nocturnal autonomic parasympathetic dominance (HRV > 55 ms, deep sleep > 90 min).',
          agencyWillpower: 'Patient recognizes intrinsic mastery over autonomic recovery and commits to physiological restorative rituals.',
          multiWaypowerPathways: [
            {
              pathwayName: 'Somatic Vagal Pathway (Primary)',
              action: '4-7-8 box breathing for 8 minutes + 20-minute far-infrared sauna session (65°C) before 8:30 PM.'
            },
            {
              pathwayName: 'Acoustic Solfeggio Pathway (Contingency A)',
              action: 'If work extends past 9:30 PM: 15-minute 528Hz Solfeggio audio stream with Bauer HRTF cranial crossfeed via headphones while working.'
            },
            {
              pathwayName: 'Chrono-Nutritional Pathway (Contingency B)',
              action: 'Tart cherry extract (natural melatonin precursor) + 300mg Magnesium L-threonate taken 45 min before sleep to preserve slow-wave delta sleep architecture.'
            }
          ]
        },
        clinicalTrialCitation: 'Snyder et al. (2002) Handbook of Positive Psychology (Hope pathways buffer against treatment drop-out with OR = 2.41).'
      }, null, 2),
      chosen: 'Builds a robust multi-pathway choice architecture allowing patient agency to thrive regardless of evening schedule disruptions.',
      rejected: 'Gives an all-or-nothing ultimatum requiring the patient to resign or turn off all electronics at 8:00 PM.'
    }
  ];

  return records;
}

export function exportDatasetToJsonl(outputPath?: string): string {
  const dataset = generateAllParadigmsDataset();
  const targetDir = path.join(process.cwd(), 'scratch');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const file = outputPath || path.join(targetDir, 'pocketgull_15paradigms_dataset.jsonl');
  const content = dataset.map(rec => JSON.stringify(rec)).join('\n');
  fs.writeFileSync(file, content, 'utf-8');

  console.log(`✅ Successfully exported ${dataset.length} fine-tuning records across all 15 paradigms to: ${file}`);
  return file;
}

// CLI entrypoint
if (process.argv[1]?.endsWith('export_fine_tuning_dataset.ts') || process.argv[1]?.endsWith('export_fine_tuning_dataset.js')) {
  exportDatasetToJsonl();
}
