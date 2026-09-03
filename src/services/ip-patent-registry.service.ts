import { Injectable, signal, computed } from '@angular/core';

export interface IPatentClaimCluster {
  id: string;
  clusterNumber: number;
  title: string;
  claimRange: string;
  totalClaims: number;
  inventors: string[];
  primaryServicePath: string;
  abstract: string;
  mathematicalFormulation: string;
  filingTier: 'Provisional Ready' | 'PCT International Ready' | 'Trade Secret / Open Core';
  targetAgencies: string[];
}

export interface IStatutoryClause {
  id: string;
  article: string;
  section: string;
  title: string;
  summary: string;
  fullText: string;
  governingLaw: string;
}

export interface IPatentRegistrySummary {
  totalClaimClusters: number;
  totalClaimsCount: number;
  charterDocumentPath: string;
  clausesDocumentPath: string;
  lastUpdated: string;
  clusters: IPatentClaimCluster[];
  statutoryClauses: IStatutoryClause[];
}

@Injectable({
  providedIn: 'root'
})
export class IpPatentRegistryService {
  private readonly claimClusters = signal<IPatentClaimCluster[]>([
    {
      id: 'cluster-1-popperian-verifier',
      clusterNumber: 1,
      title: 'Autonomous Runtime Popperian Epistemological Verifier for Clinical AI',
      claimRange: 'Claims 1 – 20',
      totalClaims: 20,
      inventors: ['PocketGull Applied Clinical AI Consortium'],
      primaryServicePath: 'src/services/skeptical-epistemology.service.ts',
      abstract: 'Method and system for autonomous statistical falsification of AI clinical assertions via runtime two-tailed p-value computation against population null baselines (H0) and Cochrane RoB 2 discounting.',
      mathematicalFormulation: 'z = (x̄ - μ0) / (σ0 / √n),  p = 2·(1 - Φ(|z|)),  EvidenceScore = Σ wi · Π(1 - κj)',
      filingTier: 'Provisional Ready',
      targetAgencies: ['USPTO', 'EPO', 'WIPO PCT']
    },
    {
      id: 'cluster-2-webgpu-bio-signals',
      clusterNumber: 2,
      title: 'Zero-Cloud-Egress Optical rPPG & Tremor Decomposition via Client-Side WebGPU Shaders',
      claimRange: 'Claims 21 – 40',
      totalClaims: 20,
      inventors: ['PocketGull Biophysical Signal Processing Group'],
      primaryServicePath: 'src/services/webgpu-bio-signal.service.ts',
      abstract: 'Client-side WGSL compute shader pipeline decomposing optical chrominance (POS algorithm) and extracting rPPG pulses and differential tremor bands (3–6 Hz vs. 8–12 Hz) with zero cloud video transmission.',
      mathematicalFormulation: '[X; Y] = [[0, 1, -1]; [-2, 1, 1]] · [Rn; Gn; Bn],  rPPG(t) = X(t) + α(t)·Y(t)',
      filingTier: 'Provisional Ready',
      targetAgencies: ['USPTO', 'EPO', 'NSF SBIR']
    },
    {
      id: 'cluster-3-stackelberg-game-theory',
      clusterNumber: 3,
      title: 'Dynamic Stackelberg Game-Theoretic Health Adherence & HSA Incentive Bridge',
      claimRange: 'Claims 41 – 60',
      totalClaims: 20,
      inventors: ['PocketGull Health Economics & Actuarial Lab'],
      primaryServicePath: 'src/services/clinical-game-theory.service.ts',
      abstract: 'Mathematical game-theoretic model calculating optimal insurer adherence rebate splits (r*) and routing automated disbursements to IIAS §213(d) HSA/FSA debit card accounts.',
      mathematicalFormulation: 'r* = (S_avoided - β · ΔH) / 2,  a*(r) = min(1, (β·ΔH + r) / c)',
      filingTier: 'Provisional Ready',
      targetAgencies: ['USPTO', 'WIPO PCT']
    },
    {
      id: 'cluster-4-biometric-crypto-ink',
      clusterNumber: 4,
      title: 'Multi-Dimensional Hardware-Bound Biometric Pen Attestation (Crypto-Ink)',
      claimRange: 'Claims 61 – 80',
      totalClaims: 20,
      inventors: ['PocketGull Cryptographic Security & Identity Lab'],
      primaryServicePath: 'src/services/wacom-crypto-ink.service.ts',
      abstract: 'Dynamic 6-axis kinematic stylus telemetry (X, Y, pressure, tilt, azimuth, sample jitter) bound into SHA-256 Merkle tree proofs for tamper-evident living wills and consent records.',
      mathematicalFormulation: 'S(t) = [x, y, p, θ, φ, Δt]^T,  H_root = MerkleTree(SHA256(S(tk) || MRN || DocRef))',
      filingTier: 'Provisional Ready',
      targetAgencies: ['USPTO', 'EPO']
    },
    {
      id: 'cluster-5-tri-paradigm-swarm',
      clusterNumber: 5,
      title: 'Tri-Paradigm Swarm Knowledge Arbiter for Integrative Clinical Care Plans',
      claimRange: 'Claims 81 – 100',
      totalClaims: 20,
      inventors: ['PocketGull Integrative Epistemology Consortium'],
      primaryServicePath: 'src/services/tri-paradigm-swarm.service.ts',
      abstract: 'Multi-agent consensus projection resolving Allopathic (EBM), Traditional Chinese Medicine (Zang-Fu), and Ayurvedic (Tridosha) recommendations into a mathematically bounded metabolic interaction space.',
      mathematicalFormulation: 'min_C Σ wk · D(C, Pk) + λ · Ω(C),  s.t. CYP450_inhibition(C) < threshold',
      filingTier: 'Provisional Ready',
      targetAgencies: ['USPTO', 'NIH NCATS']
    },
    {
      id: 'cluster-6-dual-custody-defense',
      clusterNumber: 6,
      title: 'Dual-Custody Zero-Trust Clinical Governance Gateway',
      claimRange: 'Claims 101 – 120',
      totalClaims: 20,
      inventors: ['PocketGull Clinical Cybersecurity Group'],
      primaryServicePath: 'src/services/clinical-defense-guard.service.ts',
      abstract: 'Zero-trust multi-party (M-of-N) threshold cryptographic gatekeeper preventing unilateral AI voice mutations, enforcing hardware FIDO2 passkeys on high-impact clinical actions.',
      mathematicalFormulation: 'ThresholdSign(M, N, RequestHash),  Voice_Modality ≠ Auth_Credential',
      filingTier: 'Provisional Ready',
      targetAgencies: ['USPTO', 'CISO Specifications']
    },
    {
      id: 'cluster-7-deep-space-cds',
      clusterNumber: 7,
      title: 'Air-Gapped Microgravity Biophysical Telemetry Compensation (Deep Space CDS)',
      claimRange: 'Claims 121 – 140',
      totalClaims: 20,
      inventors: ['PocketGull Aerospace Telemedicine Division'],
      primaryServicePath: 'src/services/deep-space-cds.service.ts',
      abstract: 'Autonomous, zero-latency clinical decision support for interplanetary missions compensating for cephalad fluid shifts, SANS neuro-ocular syndrome, and cosmic radiation dosages.',
      mathematicalFormulation: 'ΔONSD = f(ICP_fluid_shift, t),  RadiationDose_eff = Σ w_R · D_absorbed',
      filingTier: 'Provisional Ready',
      targetAgencies: ['USPTO', 'NASA TRISH']
    },
    {
      id: 'cluster-8-actuarial-raf-forecasting',
      clusterNumber: 8,
      title: 'Real-Time Actuarial Risk Adjustment Factor (RAF) Score Forecasting & CMS Appeals',
      claimRange: 'Claims 141 – 160',
      totalClaims: 20,
      inventors: ['PocketGull Actuarial & Value-Based Care Group'],
      primaryServicePath: 'src/services/actuarial-longevity.service.ts',
      abstract: 'Real-time CMS-HCC Version 28 RAF score forecasting, Gompertz-Makeham longevity modeling, and automated SSA-44 / IRMAA Medicare appeal packet generation.',
      mathematicalFormulation: 'RAF_score = Base_demographic + Σ HCC_weights,  μ(x) = α · e^(βx) + γ',
      filingTier: 'Provisional Ready',
      targetAgencies: ['USPTO', 'CMS Health Informatics']
    },
    {
      id: 'cluster-9-federated-learning-secagg',
      clusterNumber: 9,
      title: 'Privacy-Preserving Federated Clinical Learning with Pairwise Zero-Sum Secure Aggregation',
      claimRange: 'Claims 161 – 180',
      totalClaims: 20,
      inventors: ['PocketGull Distributed AI & Privacy Consortium'],
      primaryServicePath: 'src/services/federated-learning.service.ts',
      abstract: 'Client-side differential privacy (ε=2.0, δ=10^-5) with L2 gradient clipping and pairwise zero-sum SecAgg masking, preventing model inversion and PHI leakage.',
      mathematicalFormulation: 'g̃_i = Clip(g_i, C) + N(0, σ²I),  Masked_g_i = g̃_i + Σ_{j} (s_{i,j} - s_{j,i})',
      filingTier: 'Provisional Ready',
      targetAgencies: ['USPTO', 'EPO', 'WIPO PCT']
    },
    {
      id: 'cluster-10-socratic-clinical-intake',
      clusterNumber: 10,
      title: 'Socratic Multilingual Clinical Intake with Dynamic Lexical Disambiguation',
      claimRange: 'Claims 181 – 200',
      totalClaims: 20,
      inventors: ['PocketGull Cognitive Linguistics & Equity Lab'],
      primaryServicePath: 'src/services/adaptive-intake.service.ts',
      abstract: 'FIFE clinical interview model with real-time jargon simplification, 50-language ontology-preserved translation, and automated FHIR QuestionnaireResponse synthesis.',
      mathematicalFormulation: 'FIFE_vector = ⟨Feelings, Ideas, Functioning, Expectations⟩,  Simplify(Jargon, GradeLevel)',
      filingTier: 'Provisional Ready',
      targetAgencies: ['USPTO', 'WIPO PCT']
    },
    {
      id: 'cluster-11-whispy-bioreactor',
      clusterNumber: 11,
      title: 'Closed-Loop Acoustic Holographic Containment Bioreactor for Supramolecular Healing Mists',
      claimRange: 'Claims 201 – 220',
      totalClaims: 20,
      inventors: ['PocketGull Biophysical Nanomedicine Lab'],
      primaryServicePath: 'src/services/whispy-swarm-bioreactor.service.ts',
      abstract: 'Volumetric ultrasound bio-fabrication containment chamber levitating and sculpting aerosolized peptide coacervate droplets via scan-inverted Gor\'kov potential fields into porous regenerative scaffolds.',
      mathematicalFormulation: 'U = 2πr³ρ₀ [⟨p²⟩/(3ρ₀²c₀²)·f₁ - ⟨v²⟩/2·f₂],  kgel ≈ [Ca²⁺]·e^(-ΔG/RT)',
      filingTier: 'Provisional Ready',
      targetAgencies: ['USPTO', 'EPO', 'FDA CDRH/CBER']
    },
    {
      id: 'cluster-12-popperian-falsification-cds',
      clusterNumber: 12,
      title: 'Popperian Epistemic Falsification Engine with Cryptographic FHIR R4 Provenance',
      claimRange: 'Claims 221 – 240',
      totalClaims: 20,
      inventors: ['PocketGull Applied Clinical Epistemology Group'],
      primaryServicePath: 'src/services/fhir-r4-bundle-export.service.ts',
      abstract: 'Clinical decision support method synthesizing 3 orthogonal disconfirming counter-hypotheses, computing runtime H0 rejection p-values, and gating diagnosis behind bedside exam checkboxes with FDA Part 11 seals.',
      mathematicalFormulation: 'H0: μ = μpop,  p = 2·(1 - Φ(|z|)),  SHA256(Condition || H0 || {H1,H2,H3} || Sig)',
      filingTier: 'Provisional Ready',
      targetAgencies: ['USPTO', 'WIPO PCT', 'Joint Commission']
    },
    {
      id: 'cluster-13-navier-stokes-turing-glymphatic',
      clusterNumber: 13,
      title: 'Coupled Navier-Stokes & Turing Reaction-Diffusion Glymphatic Modeling Engine',
      claimRange: 'Claims 241 – 260',
      totalClaims: 20,
      inventors: ['PocketGull Computational Fluid Dynamics & Neuro-Vascular Lab'],
      primaryServicePath: 'src/components/turing/navier-stokes-viewer.component.ts',
      abstract: 'Coupled microfluidic Navier-Stokes momentum advection and Turing morphogen reaction-diffusion solver computing endothelial wall shear stress heatmaps and glymphatic clearance kinetics in living charts.',
      mathematicalFormulation: '∂u/∂t + (u·∇)u = -(1/ρ)∇p + ν∇²u,  ∂Ci/∂t = Di∇²Ci + Ri(C) - u·∇Ci,  Pe = 48.5',
      filingTier: 'Provisional Ready',
      targetAgencies: ['USPTO', 'NIH NINDS']
    },
    {
      id: 'cluster-14-hermetic-nelder-mead-thresholds',
      clusterNumber: 14,
      title: 'Hermetic Client-Side Simplex Decision Threshold Calibration for Edge Medical AI',
      claimRange: 'Claims 261 – 280',
      totalClaims: 20,
      inventors: ['PocketGull Edge AI & Mathematical Optimization Group'],
      primaryServicePath: 'scripts/dart/rsna_threshold_benchmark_test.dart',
      abstract: 'Client-side Nelder-Mead simplex coordinate ascent optimizer executing in sub-200ms on edge hardware without external C-dependencies to calibrate target-specific multi-label clinical decision thresholds.',
      mathematicalFormulation: 'τ* = argmax_{τ∈[0,1]^K} Uclinical(y, ŷ > τ | OOF),  xr = x̄ + α(x̄ - x_{n+1})',
      filingTier: 'Provisional Ready',
      targetAgencies: ['USPTO', 'WIPO PCT']
    },
    {
      id: 'cluster-15-statutory-rpm-superbill',
      clusterNumber: 15,
      title: 'Automated 16-Day Statutory Remote Patient Monitoring (RPM) Superbill Claim Engine',
      claimRange: 'Claims 281 – 300',
      totalClaims: 20,
      inventors: ['PocketGull Telehealth & Healthcare Economics Division'],
      primaryServicePath: 'src/services/cms-rpm-superbill.service.ts',
      abstract: 'Automated compliance engine auditing asynchronous biometric device streams against CMS 16-day statutory thresholds (CPT 99453–99458) with NIST SP 800-90A CSPRNG SHA-256 digital attestation seals into FHIR Claims.',
      mathematicalFormulation: 'TransmissionDays(30d) ≥ 16 ⟹ CPT 99454,  Seal = HMAC-SHA256(T || KNIST)',
      filingTier: 'Provisional Ready',
      targetAgencies: ['USPTO', 'CMS Health Informatics']
    },
    {
      id: 'cluster-16-dichoptic-optical-photobiomodulation',
      clusterNumber: 16,
      title: 'Dichoptic Interocular Photostimulation, 670nm Mitochondrial Retinal Photobiomodulation & CIE S 026 ipRGC Engine',
      claimRange: 'Claims 301 – 320',
      totalClaims: 20,
      inventors: ['PocketGull Neuro-Visual & Ophthalmic Therapeutics Group'],
      primaryServicePath: 'src/services/optical-innovations.service.ts',
      abstract: 'Ophthalmic photobiomodulation apparatus delivering calibrated 670nm monochromatic deep red radiation with 180s automatic dosage control for RPE cytochrome c oxidase activation, coupled with drifting OKN/VOR sinusoidal gratings, CIE S 026 melanopic circadian tuning, and dichoptic interocular optical beating.',
      mathematicalFormulation: 'EML = K_m ∫ Ee,λ(λ) smel(λ) dλ,  Δfcortical = |fR - fL| = 0.5 Hz,  λPBM = 670 nm',
      filingTier: 'Provisional Ready',
      targetAgencies: ['USPTO', 'WIPO PCT', 'FDA CDRH']
    }
  ]);

  private readonly statutoryClauses = signal<IStatutoryClause[]>([
    {
      id: 'clause-universal-copyright',
      article: 'Article I',
      section: 'Section 1.01',
      title: 'Universal Statutory Copyright Assertion',
      summary: 'Protects all source code, WebGPU shaders, 3D biophysical models, and UI assets under 17 U.S.C. §101 and the Berne Convention.',
      fullText: 'All text, computational source code, WebGPU Shading Language (WGSL) shaders, Three.js 3D biophysical mesh procedural generators, interactive SVG telemetry gauges, typography design files, clinical prompt architectures, and graphical user interfaces comprising PocketGull are protected under the United States Copyright Act of 1976 (17 U.S.C. § 101 et seq.), the Berne Convention, the Universal Copyright Convention, and the WIPO Copyright Treaty. Copyright © 2026 PocketGull Applied Clinical AI Consortium. All Rights Reserved.',
      governingLaw: '17 U.S.C. § 101 et seq. / Berne Convention'
    },
    {
      id: 'clause-marker-font-governance',
      article: 'Article I',
      section: 'Section 1.02',
      title: 'Marker Font & Brand Lettering Governance Standard',
      summary: 'Restricts display marker typography exclusively to official Brand Lettering and Copyright / Legal Footer lines to preserve optical legibility.',
      fullText: 'The custom handwritten/display Marker Font (PocketGull Bold, PocketGull Chiseltip, .font-pocketgull-brand, .font-pocketgull-marker) is an exclusive proprietary brand asset reserved solely for displaying official Brand Lettering ("PocketGull") and Copyright / Legal Footer Imprint lines. All clinical documentation, dosage tables, and telemetric navigation must strictly utilize clean, high-legibility clinical typography stacks (font-pocketgull-sans-clinical, font-pocketgull-inter, font-pocketgull-mono) to guarantee zero dosage misinterpretation.',
      governingLaw: 'PocketGull Brand Integrity Directive'
    },
    {
      id: 'clause-invention-reservation',
      article: 'Article II',
      section: 'Section 2.01',
      title: 'Statutory Invention Reservation & Patent Notice',
      summary: 'Formally reserves patent rights under 35 U.S.C. §101 et seq. for 10 core algorithm clusters across 200 staked patent claims.',
      fullText: 'Notice is hereby given that the computational algorithms, data pipelines, WebGPU shaders, and hardware integration architectures disclosed herein represent proprietary inventions subject to pending domestic and international patent applications under 35 U.S.C. § 101 et seq. and the Patent Cooperation Treaty (PCT), spanning 200 formal patent claims across 10 distinct invention clusters.',
      governingLaw: '35 U.S.C. § 101, 102, 103 / PCT'
    },
    {
      id: 'clause-open-core-dual-licensing',
      article: 'Article III',
      section: 'Section 3.01',
      title: 'Open-Core vs. Proprietary Dual Licensing Demarcation',
      summary: 'Public client SDK and FHIR interfaces are licensed under Apache 2.0; clinical AI shaders and optimization solvers remain proprietary.',
      fullText: 'The public interface definitions, FHIR R4 Bundle serializers, client-side WebMCP agent registration hooks, and UI component stubs contained within @pocketgull/core-sdk are licensed under the Apache License, Version 2.0. The proprietary inference orchestration engines, WGSL bio-signal compute shaders, Stackelberg equilibrium solvers, and dual-custody cryptographic gatekeepers are proprietary trade secrets and patented technologies.',
      governingLaw: 'Apache 2.0 / Commercial Trade Secret'
    },
    {
      id: 'clause-ftc-affiliate-governance',
      article: 'Article IV',
      section: 'Section 4.01',
      title: 'Mandatory FTC & Affiliate Governance Clause',
      summary: 'Mandates clear FTC affiliate disclosures and strictly prohibits patient PHI in outbound affiliate URLs or SMS messages.',
      fullText: 'Every product recommendation, medical supply listing, or assistive hardware reference card generated by the system MUST prominently display the statutory FTC disclosure: "As an Amazon Associate and verified healthcare affiliate partner, PocketGull earns from qualifying purchases. Product recommendations are supportive evidence-grounded adjuncts and do not constitute direct medical prescriptions." Affiliate links must never contain patient identifiers, diagnoses, or condition codes.',
      governingLaw: '16 CFR Part 255 (FTC Endorsement Guides)'
    },
    {
      id: 'clause-non-model-training',
      article: 'Article V',
      section: 'Section 5.01',
      title: 'Non-Model Training & Data Sovereignty Mandate',
      summary: 'Prohibits foundational LLM training on partner product catalog listings or private patient health data.',
      fullText: 'Partner product listings, prices, and reviews may be used strictly for runtime inference and zero-shot categorization; they must NEVER be utilized to train, fine-tune, or adjust foundational base LLM model weights. Patient health records, telemetry streams, and consultation transcripts are strictly sovereign to the patient and must never be pooled, retained, or utilized for foundational AI model training without explicit institutional IRB approval and differential privacy masking (ε ≤ 2.0).',
      governingLaw: 'HIPAA Safe Harbor / GDPR Art. 25'
    },
    {
      id: 'clause-dual-custody-governance',
      article: 'Article VI',
      section: 'Section 6.01',
      title: 'Dual-Custody Zero-Trust Multi-Signature Mandate',
      summary: 'Enforces M-of-N multi-party cryptographic authorization and hardware FIDO2 passkeys for high-impact clinical actions.',
      fullText: 'No single administrative account, Chief Medical Officer (CMO), or automated AI agent possesses the unilateral authority to execute high-impact actions. All bulk patient exports (>50 records), batch state purges, or disbursements ≥ $500 strictly require dual authenticated signatures verified via hardware FIDO2 physical passkeys and threshold cryptographic signatures.',
      governingLaw: 'NIST SP 800-207 Zero-Trust / HIPAA §164.312'
    }
  ]);

  readonly totalClusters = computed(() => this.claimClusters().length);
  readonly totalClaims = computed(() => this.claimClusters().reduce((sum, c) => sum + c.totalClaims, 0));
  readonly totalClauses = computed(() => this.statutoryClauses().length);

  getSummary(): IPatentRegistrySummary {
    return this.getPatentSummary();
  }

  getClusters(): IPatentClaimCluster[] {
    return this.claimClusters();
  }

  getPatentSummary(): IPatentRegistrySummary {
    return {
      totalClaimClusters: this.totalClusters(),
      totalClaimsCount: this.totalClaims(),
      charterDocumentPath: 'docs/research/POCKETGULL_PRIMARY_PATENT_CLAIMS_CHARTER.md',
      clausesDocumentPath: 'docs/legal/INVENTION_ASSIGNMENT_AND_COPYRIGHT_CLAUSES.md',
      lastUpdated: '2026-08-23',
      clusters: this.claimClusters(),
      statutoryClauses: this.statutoryClauses()
    };
  }

  getClusterById(id: string): IPatentClaimCluster | undefined {
    return this.claimClusters().find(c => c.id === id);
  }

  getClusterByNumber(clusterNumber: number): IPatentClaimCluster | undefined {
    return this.claimClusters().find(c => c.clusterNumber === clusterNumber);
  }

  getClauseById(id: string): IStatutoryClause | undefined {
    return this.statutoryClauses().find(c => c.id === id);
  }

  getStatutoryClauses(): IStatutoryClause[] {
    return this.statutoryClauses();
  }
}
