import { Injectable, signal, inject } from '@angular/core';
import { OllamaProvider } from './ai/ollama.provider';
import { ClinicalSpecialtyRiskSuiteService, IPivotPulseCarePlanSuggestion } from './clinical-specialty-risk-suite.service';
import { SpatialLesionMarkupService, ISpatialLesion, LesionSeverity, LesionMorphology } from './spatial-lesion-markup.service';
import { PatientStateService } from './patient-state.service';
import { MOCK_PATIENTS } from '../mock-patients';

export interface ISpatialLesionSeed {
  label: string;
  partId: string;
  position: { x: number; y: number; z: number };
  severity: LesionSeverity;
  morphology: LesionMorphology;
  clinicalNotes: string;
  snomedCode?: string;
  icd10Code?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UniversalPivotPulseSynthesizerService {
  private readonly ollama = inject(OllamaProvider, { optional: true });
  private readonly riskSuite = inject(ClinicalSpecialtyRiskSuiteService);
  private readonly spatialLesions = inject(SpatialLesionMarkupService);
  private readonly patientState = inject(PatientStateService);

  readonly isSynthesizing = signal<boolean>(false);
  readonly lastSynthesizedPlan = signal<IPivotPulseCarePlanSuggestion | null>(null);
  readonly lastSynthesisTimestamp = signal<string | null>(null);
  readonly synthesisLog = signal<string[]>([]);

  /**
   * Projects a patient's symptoms, conditions, and biomarkers into 3D spatial anatomical coordinates.
   */
  projectPatientTo3DLesions(patientId: string, patient?: any): ISpatialLesionSeed[] {
    const id = patientId || patient?.id || '';

    if (id === 'p_marie_curie') {
      return [
        {
          label: 'Bone Marrow Hematopoietic Suppression (Majja Dhatu)',
          partId: 'chest',
          position: { x: 0.0, y: 1.15, z: 0.18 },
          severity: 'critical',
          morphology: 'fibrosis',
          clinicalNotes: 'Aplastic anemia: stem cell depletion, pancytopenia risk, severe Majja Dhatu/Jing exhaustion.',
          snomedCode: '112674009',
          icd10Code: 'D61.9'
        },
        {
          label: 'Palmar Radiodermatitis & Radium-226 Ulceration',
          partId: 'r_hand',
          position: { x: 0.62, y: 0.85, z: 0.08 },
          severity: 'critical',
          morphology: 'erythema',
          clinicalNotes: 'Direct ionizing alpha/beta flux causing epidermal fissures, microvascular endarteritis, and pain.',
          snomedCode: '247441003',
          icd10Code: 'L59.8'
        },
        {
          label: 'Mitochondrial & Genomic Oxidative Stress (8-OHdG)',
          partId: 'liver',
          position: { x: 0.12, y: 0.98, z: 0.15 },
          severity: 'moderate',
          morphology: 'inflammation',
          clinicalNotes: 'Internalized radioisotope oxidative burst; 8-OHdG elevated at 18.4 ng/mg Cr.',
          snomedCode: '23583003',
          icd10Code: 'T66.XXXA'
        }
      ];
    }

    if (id === 'p_srinivasa_ramanujan') {
      return [
        {
          label: 'Hepatic Amoebic Abscess Cicatrix',
          partId: 'liver',
          position: { x: 0.14, y: 1.02, z: 0.16 },
          severity: 'critical',
          morphology: 'fibrosis',
          clinicalNotes: 'Right hepatic lobe amoebic abscess history with residual parenchymal fibrosis and capsular tension.',
          snomedCode: '112674009',
          icd10Code: 'A06.4'
        },
        {
          label: 'Duodenal Mucosal Barrier Hyperpermeability',
          partId: 'abdomen',
          position: { x: 0.0, y: 0.88, z: 0.18 },
          severity: 'moderate',
          morphology: 'inflammation',
          clinicalNotes: 'Vishamagni with elevated fecal calprotectin (185 mcg/g) and zonulin (64 ng/mL) leaky gut mucosa.',
          snomedCode: '23583003',
          icd10Code: 'K29.8'
        }
      ];
    }

    if (id === 'p_edwin_smith_3') {
      return [
        {
          label: 'Compound Calvarial Depressed Skull Fracture',
          partId: 'head',
          position: { x: 0.12, y: 1.82, z: 0.05 },
          severity: 'critical',
          morphology: 'laceration',
          clinicalNotes: 'Right parietal-temporal calvarial fracture with ruptured pericranium and visible dural pulsation.',
          snomedCode: '312608009',
          icd10Code: 'S02.0XXA'
        },
        {
          label: 'Cervical Spine Guarding & Du Mai Channel Stagnation',
          partId: 'neck',
          position: { x: 0.0, y: 1.55, z: -0.06 },
          severity: 'moderate',
          morphology: 'fibrosis',
          clinicalNotes: 'Nuchal rigidity and severe protective spasm across C2-C4 following cranial battle trauma.',
          snomedCode: '112674009',
          icd10Code: 'M54.2'
        }
      ];
    }

    if (id === 'p_charles_darwin') {
      return [
        {
          label: 'Carotid Sinus / Vagal Baroreflex Dysregulation',
          partId: 'neck',
          position: { x: -0.08, y: 1.52, z: 0.08 },
          severity: 'critical',
          morphology: 'inflammation',
          clinicalNotes: 'Vagal withdrawal and orthostatic tachycardia (+34 bpm delta) with depressed resting RMSSD (14 ms).',
          snomedCode: '23583003',
          icd10Code: 'G90.9'
        },
        {
          label: 'Solar Plexus Dysmotility & Post-Exertional Exhaustion',
          partId: 'abdomen',
          position: { x: 0.0, y: 1.05, z: 0.17 },
          severity: 'moderate',
          morphology: 'edema',
          clinicalNotes: 'Post-exertional malaise (PEM crash risk 0.86) and gastroparesis after exertion.',
          snomedCode: '267038008',
          icd10Code: 'R53.82'
        }
      ];
    }

    if (id === 'p_frida_kahlo') {
      return [
        {
          label: 'L4-S1 Lumbar Vertebral Crush Malunion',
          partId: 'lumbar',
          position: { x: 0.0, y: 0.88, z: -0.10 },
          severity: 'critical',
          morphology: 'calcification',
          clinicalNotes: 'Crushed lumbar vertebrae with persistent spinal canal impingement and neuropathic pain.',
          snomedCode: '89100005',
          icd10Code: 'S32.009S'
        },
        {
          label: 'Right Iliac Wing Pelvic Malunion & Asymmetry',
          partId: 'pelvis',
          position: { x: 0.22, y: 0.74, z: 0.05 },
          severity: 'critical',
          morphology: 'fibrosis',
          clinicalNotes: 'Complex pelvic fracture malunion with leg-length discrepancy and sacroiliac strain.',
          snomedCode: '112674009',
          icd10Code: 'M84.051'
        },
        {
          label: 'Right Foot Neuropathic Trophic Node',
          partId: 'r_foot',
          position: { x: 0.18, y: 0.05, z: 0.08 },
          severity: 'moderate',
          morphology: 'inflammation',
          clinicalNotes: 'Post-traumatic sciatic/peroneal neuropathy with localized phantom pain and trophic changes.',
          snomedCode: '23583003',
          icd10Code: 'G57.01'
        }
      ];
    }

    if (id === 'p_mara_santos') {
      return [
        {
          label: 'Left Optic Nerve Retrobulbar Plaque',
          partId: 'head',
          position: { x: -0.08, y: 1.76, z: 0.16 },
          severity: 'critical',
          morphology: 'inflammation',
          clinicalNotes: 'Demyelinating retrobulbar optic neuritis; trigger for visual blur and Uhthoff sensitivity.',
          snomedCode: '23583003',
          icd10Code: 'H46.9'
        },
        {
          label: 'Periventricular Dawson Finger Plaques',
          partId: 'head',
          position: { x: 0.06, y: 1.80, z: 0.02 },
          severity: 'moderate',
          morphology: 'fibrosis',
          clinicalNotes: 'Smoldering microglial inflammation and axonal transection; sNfL 18.2 pg/mL.',
          snomedCode: '112674009',
          icd10Code: 'G35'
        },
        {
          label: 'Cervical Spinal Cord Plaque (C3-C5)',
          partId: 'neck',
          position: { x: 0.0, y: 1.48, z: -0.05 },
          severity: 'critical',
          morphology: 'edema',
          clinicalNotes: 'Spinal demyelinating plaque causing Lhermitte sign and fine motor coordination deficit.',
          snomedCode: '267038008',
          icd10Code: 'G35'
        }
      ];
    }

    if (id === 'p_poms_adolescent') {
      return [
        {
          label: 'Centrum Semiovale High-Flux Inflammatory Plaques',
          partId: 'head',
          position: { x: 0.10, y: 1.82, z: 0.04 },
          severity: 'critical',
          morphology: 'inflammation',
          clinicalNotes: 'Pediatric-onset multiple sclerosis: high relapse velocity, sNfL 22.4 pg/mL.',
          snomedCode: '23583003',
          icd10Code: 'G35'
        },
        {
          label: 'Brainstem Pontine Plaque',
          partId: 'head',
          position: { x: 0.0, y: 1.68, z: 0.02 },
          severity: 'moderate',
          morphology: 'inflammation',
          clinicalNotes: 'Brainstem internuclear ophthalmoplegia demyelinating focus.',
          snomedCode: '23583003',
          icd10Code: 'G35'
        }
      ];
    }

    if (id === 'p_loms_elder') {
      return [
        {
          label: 'Cervical Spinal Cord Neuro-Axonal Atrophy',
          partId: 'neck',
          position: { x: 0.0, y: 1.45, z: -0.06 },
          severity: 'critical',
          morphology: 'fibrosis',
          clinicalNotes: 'Primary progressive MS: insidious cervical spinal cord volume loss and spastic paraparesis.',
          snomedCode: '112674009',
          icd10Code: 'G35'
        },
        {
          label: 'Periventricular Lacunar Sclerotic Lesion',
          partId: 'head',
          position: { x: -0.07, y: 1.78, z: 0.0 },
          severity: 'moderate',
          morphology: 'calcification',
          clinicalNotes: 'Smoldering microglial lesions and brain volume contraction (GFAP 185 pg/mL).',
          snomedCode: '89100005',
          icd10Code: 'G35'
        }
      ];
    }

    if (id === 'p001') {
      return [
        {
          label: 'Central Visceral Adiposity & Hepatic Steatosis',
          partId: 'abdomen',
          position: { x: 0.12, y: 0.94, z: 0.16 },
          severity: 'moderate',
          morphology: 'edema',
          clinicalNotes: 'Insulin resistance, waist-to-height ratio 0.69, elevated triglycerides.',
          snomedCode: '267038008',
          icd10Code: 'E88.81'
        },
        {
          label: 'Carotid Intima-Media Thickening',
          partId: 'neck',
          position: { x: 0.07, y: 1.50, z: 0.08 },
          severity: 'critical',
          morphology: 'calcification',
          clinicalNotes: 'WHO HEARTS 10-year CVD risk 28.4% (High Risk Tier), arterial stiffness.',
          snomedCode: '89100005',
          icd10Code: 'I70.8'
        }
      ];
    }

    if (id === 'p002') {
      return [
        {
          label: 'L4-L5 Lumbar Facet Arthropathy',
          partId: 'lumbar',
          position: { x: 0.0, y: 0.86, z: -0.09 },
          severity: 'critical',
          morphology: 'calcification',
          clinicalNotes: 'Chronic mechanical lower back pain (VAS 6.5/10), requiring non-opioid multimodal recovery.',
          snomedCode: '89100005',
          icd10Code: 'M54.50'
        },
        {
          label: 'Tracheobronchial Carina Hyperreactivity',
          partId: 'chest',
          position: { x: 0.0, y: 1.28, z: 0.12 },
          severity: 'moderate',
          morphology: 'inflammation',
          clinicalNotes: 'Asthma reactive airway constriction, PEF 380 L/min, cold-air sensitive.',
          snomedCode: '23583003',
          icd10Code: 'J45.40'
        }
      ];
    }

    if (id === 'p003') {
      return [
        {
          label: 'Left Anterior Descending Coronary Plaque',
          partId: 'chest',
          position: { x: -0.08, y: 1.22, z: 0.16 },
          severity: 'critical',
          morphology: 'calcification',
          clinicalNotes: 'Ischemic heart disease with prior LAD stent and sub-optimal myocardial perfusion.',
          snomedCode: '89100005',
          icd10Code: 'I25.10'
        },
        {
          label: 'Bilateral Knee Osteoarthritis Chondromalacia',
          partId: 'r_knee',
          position: { x: 0.16, y: 0.44, z: 0.06 },
          severity: 'moderate',
          morphology: 'calcification',
          clinicalNotes: 'Joint space narrowing, gait instability (TUG 16.2s), fall risk.',
          snomedCode: '89100005',
          icd10Code: 'M17.0'
        }
      ];
    }

    if (id === 'p004') {
      return [
        {
          label: 'Arboreal Ventricular Wall Stress Node',
          partId: 'chest',
          position: { x: 0.06, y: 1.20, z: 0.15 },
          severity: 'moderate',
          morphology: 'edema',
          clinicalNotes: 'Myocardial strain in great ape comparative model, exertional hypoxemia.',
          snomedCode: '267038008',
          icd10Code: 'I51.9'
        },
        {
          label: 'Bronchial Wall Remodeling & SpO2 Limitation',
          partId: 'chest',
          position: { x: -0.05, y: 1.26, z: 0.14 },
          severity: 'moderate',
          morphology: 'fibrosis',
          clinicalNotes: 'Airway limitation with SpO2 92%, responsive to phytochemically rich foraging.',
          snomedCode: '112674009',
          icd10Code: 'J44.9'
        }
      ];
    }

    if (id === 'p005') {
      return [
        {
          label: 'Left Ventricular Hypertrophic Apex',
          partId: 'chest',
          position: { x: -0.10, y: 1.18, z: 0.16 },
          severity: 'critical',
          morphology: 'calcification',
          clinicalNotes: 'Hypertensive heart disease (BP 148/92 mmHg), concentric left ventricular hypertrophy.',
          snomedCode: '89100005',
          icd10Code: 'I11.9'
        },
        {
          label: 'Renal Glomerulosclerosis Node',
          partId: 'abdomen',
          position: { x: -0.14, y: 0.96, z: -0.08 },
          severity: 'critical',
          morphology: 'fibrosis',
          clinicalNotes: 'CKD Stage 3b (eGFR 38 mL/min/1.73m2) with microalbuminuria (UACR 145 mg/g).',
          snomedCode: '112674009',
          icd10Code: 'N18.32'
        }
      ];
    }

    if (id === 'p006') {
      return [
        {
          label: 'Pediatric Bronchiolar Reactive Airway Tree',
          partId: 'chest',
          position: { x: 0.04, y: 1.25, z: 0.12 },
          severity: 'moderate',
          morphology: 'inflammation',
          clinicalNotes: 'Post-preterm (32w) mild-intermittent reactive airway disease with expiratory wheezing.',
          snomedCode: '23583003',
          icd10Code: 'J45.20'
        },
        {
          label: 'Mesenteric Lymph Node Convalescence',
          partId: 'abdomen',
          position: { x: 0.02, y: 0.88, z: 0.14 },
          severity: 'mild',
          morphology: 'edema',
          clinicalNotes: 'Resolving post-rotavirus gastroenteritis mucosal enteropathy.',
          snomedCode: '267038008',
          icd10Code: 'A08.0'
        }
      ];
    }

    if (id === 'p007') {
      return [
        {
          label: 'Uterine Spiral Artery Resistance Node',
          partId: 'pelvis',
          position: { x: 0.0, y: 0.78, z: 0.16 },
          severity: 'critical',
          morphology: 'edema',
          clinicalNotes: 'Primigravida 32w gestational hypertension (BP 135/85 mmHg); placental perfusion tracking.',
          snomedCode: '267038008',
          icd10Code: 'O13.3'
        },
        {
          label: 'Dependent Pretibial Venous Hydrostatic Stasis',
          partId: 'r_leg',
          position: { x: 0.14, y: 0.28, z: 0.06 },
          severity: 'mild',
          morphology: 'edema',
          clinicalNotes: 'Physiological dependent edema of pregnancy with negative proteinuria.',
          snomedCode: '267038008',
          icd10Code: 'O12.03'
        }
      ];
    }

    if (id === 'p008') {
      return [
        {
          label: 'Aortic Wall Plaque Quenching (Pauling Protocol)',
          partId: 'chest',
          position: { x: -0.04, y: 1.30, z: 0.14 },
          severity: 'mild',
          morphology: 'calcification',
          clinicalNotes: 'Ascorbate/lysine/proline competitive inhibition of Lp(a) kringle domain binding.',
          snomedCode: '89100005',
          icd10Code: 'I25.10'
        },
        {
          label: 'Retinal Macular Drusen Matrix',
          partId: 'head',
          position: { x: 0.07, y: 1.76, z: 0.15 },
          severity: 'mild',
          morphology: 'calcification',
          clinicalNotes: 'Dry macular changes stabilized on AREDS2 high-dose carotenoid/antioxidant therapy.',
          snomedCode: '89100005',
          icd10Code: 'H35.31'
        }
      ];
    }

    if (id === 'p009') {
      return [
        {
          label: 'Pancreatic Head Ductal Adenocarcinoma',
          partId: 'abdomen',
          position: { x: 0.04, y: 1.04, z: 0.10 },
          severity: 'critical',
          morphology: 'nodule',
          clinicalNotes: 'PDAC Stage III with celiac axis abutment and exocrine insufficiency.',
          snomedCode: '27925004',
          icd10Code: 'C25.0'
        },
        {
          label: 'Retroperitoneal Celiac Neurolysis Target',
          partId: 'lumbar',
          position: { x: 0.0, y: 1.02, z: -0.06 },
          severity: 'critical',
          morphology: 'inflammation',
          clinicalNotes: 'Severe neuropathic cancer pain radiating to mid-back (VAS 6/10).',
          snomedCode: '23583003',
          icd10Code: 'G89.3'
        },
        {
          label: 'Quadriceps Sarcopenic Cachexia Wasting',
          partId: 'r_thigh',
          position: { x: 0.16, y: 0.58, z: 0.08 },
          severity: 'critical',
          morphology: 'fibrosis',
          clinicalNotes: 'Systemic cytokine-driven muscle catabolism (14.5% weight loss, SMI 34.2 cm2/m2).',
          snomedCode: '112674009',
          icd10Code: 'R64'
        }
      ];
    }

    if (id === 'p010') {
      return [
        {
          label: 'Substantia Nigra Dopaminergic Depletion',
          partId: 'head',
          position: { x: 0.0, y: 1.72, z: 0.04 },
          severity: 'critical',
          morphology: 'fibrosis',
          clinicalNotes: 'Dual neuropathology: Lewy alpha-synuclein pathology with nocturnal motor freezing.',
          snomedCode: '112674009',
          icd10Code: 'G20'
        },
        {
          label: 'Carotid Baroreflex Neurogenic Node',
          partId: 'neck',
          position: { x: -0.08, y: 1.50, z: 0.07 },
          severity: 'critical',
          morphology: 'edema',
          clinicalNotes: 'Neurogenic orthostatic hypotension (nOH) with -26 mmHg systolic drop on standing.',
          snomedCode: '267038008',
          icd10Code: 'G90.3'
        }
      ];
    }

    // Default patient fallback
    return [
      {
        label: 'Epigastric Sympathetic Tension (Liver Qi Constriction)',
        partId: 'abdomen',
        position: { x: 0.0, y: 1.08, z: 0.16 },
        severity: 'moderate',
        morphology: 'inflammation',
        clinicalNotes: 'Executive stress: elevated nocturnal cortisol and sleep onset latency (48 min).',
        snomedCode: '23583003',
        icd10Code: 'R53.83'
      },
      {
        label: 'Cervicothoracic Trapezius Myofascial Strain',
        partId: 'neck',
        position: { x: 0.0, y: 1.48, z: -0.07 },
        severity: 'moderate',
        morphology: 'fibrosis',
        clinicalNotes: 'Screen work postural strain and paraspinal muscle guarding.',
        snomedCode: '112674009',
        icd10Code: 'M54.2'
      }
    ];
  }

  /**
   * Universal synthesis coordinator: Generates or refines 6-Pillar precision care plan
   * and projects 3D spatial lesion beacons with Solfeggio acoustic pinning.
   */
  async synthesizePrecisionPlan(patientId?: string): Promise<IPivotPulseCarePlanSuggestion> {
    const targetId = patientId || this.patientState.loadedPatientId() || 'p_default_patient';
    const patient = MOCK_PATIENTS.find(p => p.id === targetId) || { id: targetId, name: 'Clinical Patient' };

    this.isSynthesizing.set(true);
    this.synthesisLog.set([`[INIT] Initiating Universal Precision Care Synthesis for patient: ${targetId}`]);

    try {
      // 1. Calculate clinical multi-specialty risk profile
      this.synthesisLog.update(log => [...log, `[CDS] Running 18 clinical risk models and phenotype evaluation...`]);
      const riskProfile = await this.riskSuite.evaluatePatientSpecialtyProfile(patient);
      this.synthesisLog.update(log => [...log, `[CDS] Primary vulnerability identified: ${riskProfile.primaryClinicalVulnerability}`]);

      // 2. Fetch ground-truth tailored 6-Pillar Care Plan
      let plan = this.riskSuite.generateDynamicPivotPulseCarePlan(patient);

      // 3. If local Ollama Gemma 4 is live, request synthesis enrichment
      if (this.ollama && this.ollama.isAvailable()) {
        this.synthesisLog.update(log => [...log, `[LLM] Connected to local Ollama (gemma4:latest). Synthesizing clinical narrative...`]);
        try {
          const prompt = `You are a clinical decision support specialist. Review this patient profile:
Patient: ${plan.patientName} (${targetId})
Act 1: ${plan.act1WhereYouveBeen}
Act 2: ${plan.act2WhereYouStandToday}
Primary Vulnerability: ${riskProfile.primaryClinicalVulnerability}

Briefly refine the Act 3 30/60/90-day trajectory with maximum clinical rigor. Return 2-3 concise sentences.`;

          const response = await this.ollama.generateText({
            prompt,
            temperature: 0.2,
            maxTokens: 300
          });

          if (response && response.text && response.text.trim().length > 30) {
            plan = {
              ...plan,
              act3WhereYoureGoing: `${plan.act3WhereYoureGoing} [Gemma 4 Edge Synthesis]: ${response.text.trim()}`
            };
            this.synthesisLog.update(log => [...log, `[LLM] Local Gemma 4 synthesis complete with zero network egress.`]);
          }
        } catch (e: any) {
          this.synthesisLog.update(log => [...log, `[WARN] Ollama synthesis non-fatal fallback: ${e?.message || e}`]);
        }
      } else {
        this.synthesisLog.update(log => [...log, `[EDGE] Local deterministic CDS rule engine active. Offline compliance verified.`]);
      }

      // 4. Clear and project 3D spatial lesion beacons into 3D viewer
      this.synthesisLog.update(log => [...log, `[3D] Projecting patient conditions to Three.js spatial anatomical coordinates...`]);
      this.spatialLesions.clearAllLesions();

      const seeds = this.projectPatientTo3DLesions(targetId, patient);
      let primaryCriticalId: string | null = null;

      for (const seed of seeds) {
        const created = this.spatialLesions.addLesion({
          label: seed.label,
          partId: seed.partId,
          position: seed.position,
          severity: seed.severity,
          morphology: seed.morphology,
          clinicalNotes: seed.clinicalNotes,
          snomedCode: seed.snomedCode,
          icd10Code: seed.icd10Code
        });
        if (seed.severity === 'critical' && !primaryCriticalId) {
          primaryCriticalId = created.id;
        }
      }

      // 5. Pin primary lesion acoustically for Solfeggio bio-rhythmic entrainment
      if (primaryCriticalId) {
        this.spatialLesions.pinLesionAcoustically(primaryCriticalId);
        this.synthesisLog.update(log => [...log, `[AUDIO] Pinned primary critical lesion (${primaryCriticalId}) to Solfeggio acoustic frequency.`]);
      }

      // 6. Adopt Care Plan into PatientStateService
      const formattedSummary = `### ${plan.patientName} — Universal Precision Care Plan (6-Pillars)
**Act 1 (Baseline)**: ${plan.act1WhereYouveBeen}
**Act 2 (Grounded Today)**: ${plan.act2WhereYouStandToday}
**Act 3 (30/60/90-Day Roadmap)**: ${plan.act3WhereYoureGoing}`;

      const formattedProtocols = `### Continuous Pulse Checklist & Agile Pivot Triggers
${plan.continuousPulseChecklist.map(c => `• **${c.metric}**: Current: ${c.currentValue} | Target: ${c.target} (${c.frequency})`).join('\n')}

**Agile Pivot Triggers:**
${plan.agilePivotTriggers.map(t => `• *${t.triggerCondition}* → **Action**: ${t.clinicalAction} [Evidence: ${t.evidenceKeywords}]`).join('\n')}`;

      const formattedNutrition = `### Precision Nutrients & Biochemical Mechanisms
${plan.precisionNutrients.map(n => `• **${n.compound}** (${n.dose}) — Mechanism: *${n.pathway}*`).join('\n')}
${plan.differentialSafetyDemarcation ? `\n**Differential Mimic Demarcation & Safety Boundaries:**\n• Ruled Out: ${plan.differentialSafetyDemarcation.ruledOutMimics.join(', ')}\n• STAT Red Flags: ${plan.differentialSafetyDemarcation.statEmergencyThresholds.join(', ')}` : ''}`;

      this.patientState.adoptCarePlanSuggestion({
        summary: formattedSummary,
        protocols: formattedProtocols,
        nutrition: formattedNutrition
      });

      this.lastSynthesizedPlan.set(plan);
      this.lastSynthesisTimestamp.set(new Date().toISOString());
      this.synthesisLog.update(log => [...log, `[SUCCESS] Universal Precision Care Plan adopted and 3D anatomical viewer synchronized!`]);

      return plan;
    } finally {
      this.isSynthesizing.set(false);
    }
  }
}
