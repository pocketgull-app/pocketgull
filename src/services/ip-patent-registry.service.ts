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
  pledgeDocumentPath: string;
  lastUpdated: string;
  clusters: IPatentClaimCluster[];
  statutoryClauses: IStatutoryClause[];
}

export interface IUsptoPatentClaim {
  claimNumber: number;
  claimType: 'System' | 'Method' | 'CRM';
  isIndependent: boolean;
  preamble: string;
  claimText: string;
}

export interface IUsptoProvisionalFigure {
  figureId: string;
  figureNumber: number;
  title: string;
  description: string;
  asciiArt: string;
  svgMarkup: string;
}

export interface IUsptoProvisionalBinder {
  docketNumber: string;
  title: string;
  abstract: string;
  inventors: string[];
  assignee: string;
  filingDate: string;
  jurisdiction: string;
  fieldOfInvention: string;
  priorArtDemarcation: string;
  summaryOfInvention: string;
  documentPath: string;
  claims: IUsptoPatentClaim[];
  figures: IUsptoProvisionalFigure[];
  fullSpecificationMarkdown: string;
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
    },
    {
      id: 'cluster-17-tri-paradigm-conformal-sepsis',
      clusterNumber: 17,
      title: 'Tri-Paradigm Consilience & Finite-Sample Conformal Clinical Intervals with Epistemic Abstention',
      claimRange: 'Claims 321 – 340',
      totalClaims: 20,
      inventors: ['PocketGull Applied Clinical AI Consortium', 'PocketGull Integrative Epistemology Consortium'],
      primaryServicePath: 'src/services/research/mimic-omop-benchmark.service.ts',
      abstract: 'Computer-implemented clinical decision support system reconciling Allopathic, TCM Zang-Fu, and Ayurvedic ontologies under CYP450 safety bounds, paired with Mondrian Inductive Conformal Prediction guaranteeing 1-alpha >= 0.95 finite-sample coverage and executing epistemic abstention to eliminate alarm fatigue.',
      mathematicalFormulation: 'min_C Σ wk·D(C, Pk) + λ·Ω(C) s.t. CYP450(C) ≤ τ;  Γ^α(x) = {y : s(x, y) ≤ q̂_{1-α}};  P(Y ∈ Γ^α) ≥ 1 - α;  |Γ^α|=2 ⟹ Abstain',
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
    },
    {
      id: 'clause-open-patent-pledge-covenant',
      article: 'Article VII',
      section: 'Section 7.01',
      title: 'Open Patent Research Pledge & Academic Laboratory Covenant',
      summary: 'Grants a royalty-free, perpetual license to academic laboratories and non-commercial researchers to test, validate, and benchmark all 17 invention clusters, subject to a defensive termination clause against patent aggression.',
      fullText: 'PocketGull hereby declares an Open Patent Research Pledge and Non-Assertion Covenant. All academic medical centers, university laboratories, non-profit institutions, and independent scientific researchers are granted a non-exclusive, royalty-free, worldwide, perpetual license under any patents or patent applications owned or controlled by PocketGull or Phil Gear to make, have made, use, and practice the inventions across all 17 invention clusters solely for research, academic benchmarking, peer-reviewed clinical validation, and open scientific inquiry. Defensive Termination Condition: Any license or covenant granted under this pledge shall immediately and automatically terminate with respect to any entity that initiates, asserts, or financially sponsors any patent infringement claim or other intellectual property litigation against PocketGull, Phil Gear, or their open-source contributors.',
      governingLaw: 'Open Patent Non-Assertion Covenant / 35 U.S.C. § 271'
    },
    {
      id: 'clause-prior-art-bar',
      article: 'Article VII',
      section: 'Section 7.02',
      title: 'Statutory Prior Art Bar & Defensive Anti-Appropriation Assertion',
      summary: 'Establishes all public git commit logs, cryptographic SHA-256 hashes, and documentation as non-confidential statutory prior art under 35 U.S.C. § 102(a)(1) to prevent third-party patent theft.',
      fullText: 'Notice is hereby given under 35 U.S.C. § 102(a)(1) and the America Invents Act (AIA) that all specifications, mathematical formulas, algorithms, architecture diagrams, and source code committed to public repositories, published documentation, and immutable git commits constitute non-confidential, date-stamped statutory prior art worldwide. Any third party attempting to register, file, or claim inventorship over these published methods or their obvious variants commits inequitable conduct under 35 U.S.C. § 115 and renders any resulting claims anticipated (§ 102) or obvious (§ 103). PocketGull reserves the right to submit third-party preissuance prior art submissions under 35 U.S.C. § 122(e) and 37 CFR 1.290 to USPTO and international examiners against any conflicting filings.',
      governingLaw: '35 U.S.C. § 102(a)(1), 103, 115, 122(e) / 37 CFR 1.290'
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
      pledgeDocumentPath: 'docs/patents/OPEN_PATENT_PLEDGE_AND_RESEARCH_COVENANT.md',
      lastUpdated: '2026-10-04',
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

  getProvisionalClaims(): IUsptoPatentClaim[] {
    return [
      {
        claimNumber: 1,
        claimType: 'System',
        isIndependent: true,
        preamble: 'A clinical decision support system for tri-paradigm consilience and finite-sample conformal prediction with epistemic abstention',
        claimText: 'A clinical decision support system for tri-paradigm consilience and finite-sample conformal prediction with epistemic abstention, comprising: a data ingestion interface configured to receive real-time physiological telemetry, patient laboratory results, and current medication administration records; a tri-paradigm consilience engine comprising one or more processors configured to: receive multi-ontology clinical directives comprising Allopathic Evidence-Based Medicine (EBM) markers, Traditional Chinese Medicine (TCM) Zang-Fu meridian vectors, and Ayurvedic Tridosha balance vectors; project said multi-ontology directives into an orthogonal biophysical latent state by solving a multi-objective optimization problem minimizing pairwise cross-paradigm ontological distance subject to a predetermined cytochrome P450 (CYP450) metabolic interaction constraint; and generate a consolidated integrative care plan satisfying said metabolic constraint; a Mondrian inductive conformal prediction engine operatively coupled to said data ingestion interface, configured to: calculate a nonconformity score for each candidate clinical deterioration outcome hypothesis across an exchangeable calibration cohort partitioned by demographic conditioning groups; compute an empirical nonconformity quantile threshold q̂_{1-α} establishing a finite-sample marginal statistical coverage guarantee of at least 1 - α; and construct a conformal prediction set Γ^α(x) containing all candidate outcome hypotheses whose nonconformity score does not exceed said quantile threshold; and an epistemic abstention controller configured to: evaluate the cardinality and constituent elements of said conformal prediction set Γ^α(x); dispatch an interruptive clinical deterioration alarm upon determining that said prediction set comprises a singleton positive deterioration outcome (Γ^α(x) = {1}); and automatically suppress interruptive audible and visual alarms upon determining that said prediction set comprises an ambiguous set spanning multiple outcome hypotheses (Γ^α(x) = {0, 1}), while concurrently increasing a sampling frequency of said physiological telemetry.'
      },
      {
        claimNumber: 2,
        claimType: 'System',
        isIndependent: false,
        preamble: 'The system of claim 1',
        claimText: 'The system of claim 1, wherein said Mondrian inductive conformal prediction engine partitions said calibration cohort into conditioning groups based on patient age brackets, baseline Sequential Organ Failure Assessment (SOFA) scores, and inpatient ward classification.'
      },
      {
        claimNumber: 3,
        claimType: 'System',
        isIndependent: false,
        preamble: 'The system of claim 1',
        claimText: 'The system of claim 1, wherein said nonconformity score is computed as s(x, y) = 1 - P̂_{calibrated}(Y = y | x), wherein P̂_{calibrated} is generated by a machine learning ensemble calibrated via empirical temperature scaling.'
      },
      {
        claimNumber: 4,
        claimType: 'System',
        isIndependent: false,
        preamble: 'The system of claim 1',
        claimText: 'The system of claim 1, wherein said epistemic abstention controller, upon suppressing an interruptive alarm when Γ^α(x) = {0, 1}, automatically transmits an electronic order for a confirmatory serum lactate and procalcitonin diagnostic panel.'
      },
      {
        claimNumber: 5,
        claimType: 'System',
        isIndependent: false,
        preamble: 'The system of claim 1',
        claimText: 'The system of claim 1, wherein said epistemic abstention controller commands a connected wearable biophysical sensor or bedside patient monitor to increase physiological telemetry sampling rate from a baseline interval of approximately 15 minutes to an accelerated interval of between 1 and 3 minutes.'
      },
      {
        claimNumber: 6,
        claimType: 'System',
        isIndependent: false,
        preamble: 'The system of claim 1',
        claimText: 'The system of claim 1, wherein said tri-paradigm consilience engine maps Zang-Fu organ disharmonies and Ayurvedic doshic imbalances onto biophysical biomarkers comprising heart rate variability (HRV), autonomic sympathetic/parasympathetic tone, and inflammatory cytokine velocity.'
      },
      {
        claimNumber: 7,
        claimType: 'System',
        isIndependent: false,
        preamble: 'The system of claim 1',
        claimText: 'The system of claim 1, wherein said predetermined CYP450 metabolic interaction constraint evaluates cumulative substrate competition and enzyme inhibition across CYP3A4, CYP2D6, CYP2C9, CYP2C19, and CYP1A2 isoenzymes.'
      },
      {
        claimNumber: 8,
        claimType: 'System',
        isIndependent: false,
        preamble: 'The system of claim 1',
        claimText: 'The system of claim 1, wherein upon determining that said conformal prediction set is empty (Γ^α(x) = ∅), said epistemic abstention controller suppresses clinical deterioration alarms and triggers an automated out-of-distribution biometric sensor lead detachment inspection.'
      },
      {
        claimNumber: 9,
        claimType: 'System',
        isIndependent: false,
        preamble: 'The system of claim 1',
        claimText: 'The system of claim 1, executed entirely client-side within an isolated edge browser runtime utilizing WebGPU Shading Language (WGSL) compute pipelines and WebAssembly (WASM), with zero patient identifiable video or biometric telemetry egress to cloud infrastructure.'
      },
      {
        claimNumber: 10,
        claimType: 'System',
        isIndependent: false,
        preamble: 'The system of claim 1',
        claimText: 'The system of claim 1, wherein said finite-sample marginal statistical coverage guarantee satisfies 1 - α ≥ 0.95 and reduces inpatient false alarm incidence by at least 80% relative to uncalibrated scalar point-probability classifiers.'
      },
      {
        claimNumber: 11,
        claimType: 'Method',
        isIndependent: true,
        preamble: 'A computer-implemented method for generating calibrated clinical care plans and finite-sample conformal prediction intervals with epistemic abstention',
        claimText: 'A computer-implemented method for generating calibrated clinical care plans and finite-sample conformal prediction intervals with epistemic abstention, comprising: receiving, via a network interface or local sensor bus, a streaming physiological observation vector from a patient; projecting Allopathic, Traditional Chinese Medicine (TCM), and Ayurvedic diagnostic vectors into an orthogonal latent vector space to generate an integrative care plan constrained by a maximum tolerable CYP450 enzyme inhibition threshold; calculating, via a hardware processor, nonconformity scores for candidate clinical deterioration hypotheses relative to an empirical calibration distribution; forming a finite-sample conformal prediction set Γ^α(x) at significance level α satisfying coverage probability P(Y ∈ Γ^α(X)) ≥ 1 - α; evaluating whether said conformal prediction set contains conflicting clinical hypotheses; and executing automated epistemic abstention to inhibit interruptive clinician alerts when Γ^α(x) contains conflicting hypotheses while dynamically escalating biometric monitoring telemetry.'
      },
      {
        claimNumber: 12,
        claimType: 'Method',
        isIndependent: false,
        preamble: 'The method of claim 11',
        claimText: 'The method of claim 11, wherein calculating nonconformity scores comprises computing the empirical quantile q̂_{1-α} = Quantile(1 - α; {s(x_i, y_i)}_{i=1}^n ∪ {∞}) = s_{(⌈(n+1)(1-α)⌉)} over an exchangeable calibration cohort of hospitalized patient admissions.'
      },
      {
        claimNumber: 13,
        claimType: 'Method',
        isIndependent: false,
        preamble: 'The method of claim 11',
        claimText: 'The method of claim 11, wherein executing epistemic abstention comprises maintaining an uninterrupted audible bedside environment while rendering a non-interruptive diagnostic uncertainty banner on a nursing console.'
      },
      {
        claimNumber: 14,
        claimType: 'Method',
        isIndependent: false,
        preamble: 'The method of claim 11',
        claimText: 'The method of claim 11, further comprising automatically transmitting an electronic Fast Healthcare Interoperability Resources (FHIR) R4 ServiceRequest ordering confirmatory biomarker assays in response to an epistemic abstention state.'
      },
      {
        claimNumber: 15,
        claimType: 'Method',
        isIndependent: false,
        preamble: 'The method of claim 11',
        claimText: 'The method of claim 11, wherein said multi-objective projection solves: min_C Σ w_k · D(C, P_k) + λ · Ω(C) s.t. CYP450_Inhibition(C) ≤ τ_safe, wherein Ω(C) penalizes excessive pharmacological and botanical agent count.'
      },
      {
        claimNumber: 16,
        claimType: 'Method',
        isIndependent: false,
        preamble: 'The method of claim 11',
        claimText: 'The method of claim 11, wherein said physiological observation vector is acquired from an Internet of Medical Things (IoMT) wearable sensor verified through an IEEE P2933™ hardware-root-of-trust attestation seal.'
      },
      {
        claimNumber: 17,
        claimType: 'Method',
        isIndependent: false,
        preamble: 'The method of claim 11',
        claimText: 'The method of claim 11, wherein candidate deterioration hypotheses comprise acute clinical sepsis defined according to Sepsis-3 consensus criteria.'
      },
      {
        claimNumber: 18,
        claimType: 'Method',
        isIndependent: false,
        preamble: 'The method of claim 11',
        claimText: 'The method of claim 11, further comprising generating an immutable cryptographic attestation hash comprising a SHA-256 digest of said prediction set, computed quantile q̂_{1-α}, and timestamp, stored in a FHIR R4 RiskAssessment resource.'
      },
      {
        claimNumber: 19,
        claimType: 'CRM',
        isIndependent: true,
        preamble: 'A non-transitory computer-readable storage medium',
        claimText: 'A non-transitory computer-readable storage medium having instructions stored thereon that, when executed by one or more processors, cause the processors to execute operations comprising: receiving real-time patient physiological observations, laboratory values, and pharmacological orders; optimizing an integrative care plan objective function reconciling Allopathic Evidence-Based Medicine, TCM Zang-Fu, and Ayurvedic Tridosha recommendations subject to a cytochrome P450 pharmacokinetic safety boundary; evaluating a Mondrian inductive conformal prediction set Γ^α(x) guaranteeing a finite-sample deterioration coverage probability of at least 1 - α; outputting an emergency clinical notification when Γ^α(x) = {1}; and executing epistemic abstention to suppress interruptive alarms when Γ^α(x) = {0, 1} while automatically escalating physiological sampling cadence and ordering targeted laboratory verification.'
      },
      {
        claimNumber: 20,
        claimType: 'CRM',
        isIndependent: false,
        preamble: 'The non-transitory computer-readable storage medium of claim 19',
        claimText: 'The non-transitory computer-readable storage medium of claim 19, wherein said instructions are packaged as an open-standard WebMCP agent tool executable inside an electronic health record web container without cloud video or biometric data egress.'
      }
    ];
  }

  getProvisionalFigures(): IUsptoProvisionalFigure[] {
    return [
      {
        figureId: 'fig-1-architecture',
        figureNumber: 1,
        title: 'FIG. 1: System Architecture & Ingestion Pipeline',
        description: 'End-to-end data ingestion pipeline, Tri-Paradigm Consilience Engine, Mondrian Conformal Prediction Engine, Epistemic Abstention Controller, and downstream EHR/wearable interfaces.',
        asciiArt: `+-------------------------------------------------------------------------+
|                       FIG. 1: SYSTEM ARCHITECTURE                       |
+-------------------------------------------------------------------------+
|  [IoMT Wearables]       [EHR FHIR R4 Bundle]      [Ambient AI Scribe]   |
|         \\                        |                        /             |
|          +-----------------------+-----------------------+              |
|                                  |                                      |
|                                  v                                      |
|                 +---------------------------------+                     |
|                 | 100: Multimodal Ingestion Gate  |                     |
|                 +----------------+----------------+                     |
|                                  |                                      |
|                                  v                                      |
|                 +---------------------------------+                     |
|                 | 110: Biophysical Vector Extractor|                     |
|                 +----------------+----------------+                     |
|                                  |                                      |
|                 +----------------+----------------+                     |
|                 |                                 |                     |
|                 v                                 v                     |
|  +------------------------------+  +------------------------------+     |
|  | 200: Tri-Paradigm Consilience|  | 300: Mondrian Conformal (ICP)|     |
|  |  * Allopathic / TCM / Ayur   |  |  * Finite-Sample Coverage 95%|     |
|  |  * CYP450 Interaction Gate   |  |  * Quantile q_hat_(1-alpha)  |     |
|  +--------------+---------------+  +--------------+---------------+     |
|                 |                                 |                     |
|                 v                                 v                     |
|  +------------------------------+  +------------------------------+     |
|  | 250: Harmonized Care Plan C* |  | 400: Epistemic Abstention    |     |
|  +------------------------------+  +--------------+---------------+     |
|                                                   |                     |
|                  +----------------+---------------+---------------+     |
|                  |                                |               |     |
|                  v                                v               v     |
|        [ Gamma^alpha = {1} ]            [ Gamma = {0, 1} ]   [Gamma={0}]|
|        STAT Sepsis Alert                Epistemic Abstain    Stable Mon |
|        * Bedside Audible Alarm          * Suppress Alarms    * Silent   |
|        * EHR Sepsis Order Set           * Telemetry -> 2 min * 15m Poll |
|                                         * Reflex Lactate Lab            |
+-------------------------------------------------------------------------+`,
        svgMarkup: `<svg viewBox="0 0 800 400" width="100%" height="200" xmlns="http://www.w3.org/2000/svg" style="background:#09090b;">
  <rect x="20" y="20" width="220" height="60" rx="4" fill="#18181b" stroke="#0d9488" stroke-width="1.5"/>
  <text x="130" y="55" fill="#5eead4" font-size="12" text-anchor="middle" font-family="monospace" font-weight="bold">100: Multimodal Ingestion</text>
  <path d="M 130 80 L 130 110" stroke="#0d9488" stroke-width="2"/>
  <rect x="20" y="110" width="220" height="60" rx="4" fill="#18181b" stroke="#0d9488" stroke-width="1.5"/>
  <text x="130" y="145" fill="#5eead4" font-size="12" text-anchor="middle" font-family="monospace" font-weight="bold">110: Biophysical Vector x</text>
  <path d="M 240 140 L 300 140" stroke="#0d9488" stroke-width="2"/>
  <rect x="300" y="50" width="230" height="80" rx="4" fill="#18181b" stroke="#14b8a6" stroke-width="1.5"/>
  <text x="415" y="85" fill="#14b8a6" font-size="12" text-anchor="middle" font-family="monospace" font-weight="bold">200: Tri-Paradigm Consilience</text>
  <text x="415" y="105" fill="#a1a1aa" font-size="10" text-anchor="middle">CYP450 Constraint Gate</text>
  <rect x="300" y="150" width="230" height="80" rx="4" fill="#18181b" stroke="#14b8a6" stroke-width="1.5"/>
  <text x="415" y="185" fill="#14b8a6" font-size="12" text-anchor="middle" font-family="monospace" font-weight="bold">300: Mondrian ICP Engine</text>
  <text x="415" y="205" fill="#a1a1aa" font-size="10" text-anchor="middle">Coverage P(Y in Gamma) >= 0.95</text>
  <path d="M 530 190 L 580 190" stroke="#14b8a6" stroke-width="2"/>
  <rect x="580" y="110" width="200" height="160" rx="4" fill="#18181b" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="680" y="135" fill="#fbbf24" font-size="11" text-anchor="middle" font-family="monospace" font-weight="bold">400: Epistemic Abstention</text>
  <rect x="595" y="150" width="170" height="30" rx="2" fill="#e11d48"/>
  <text x="680" y="170" fill="#fff" font-size="10" text-anchor="middle" font-weight="bold">{1}: STAT Sepsis Alarm</text>
  <rect x="595" y="185" width="170" height="30" rx="2" fill="#d97706"/>
  <text x="680" y="205" fill="#fff" font-size="10" text-anchor="middle" font-weight="bold">{0, 1}: Abstain + Telemetry</text>
  <rect x="595" y="220" width="170" height="30" rx="2" fill="#059669"/>
  <text x="680" y="240" fill="#fff" font-size="10" text-anchor="middle" font-weight="bold">{0}: Calibrated Stable</text>
</svg>`
      },
      {
        figureId: 'fig-2-consilience',
        figureNumber: 2,
        title: 'FIG. 2: Tri-Paradigm Consilience Orthogonal Projection',
        description: 'Multi-objective projection bridging Allopathic EBM, TCM Zang-Fu, and Ayurvedic Tridosha into an orthogonal biophysical latent space with CYP450 safety filter.',
        asciiArt: `+-------------------------------------------------------------------------+
|                    FIG. 2: TRI-PARADIGM CONSILIENCE                     |
+-------------------------------------------------------------------------+
|   [Allopathic EBM]         [TCM Zang-Fu]          [Ayurvedic Tridosha]  |
|   Lab Panels & Shock       Meridian Stagnation    Vata / Pitta / Kapha  |
|             \\                    |                   /                  |
|              +-------------------+------------------+                   |
|                                  |                                      |
|                                  v                                      |
|             +-----------------------------------------+                 |
|             | Latent Orthogonal Biophysical Space z   |                 |
|             | Multi-Objective Optimization:           |                 |
|             | min_C sum(w_k D(C, P_k)) + lambda Omega |                 |
|             +--------------------+--------------------+                 |
|                                  |                                      |
|                                  v                                      |
|             +-----------------------------------------+                 |
|             | CYP450 Metabolic Pharmacogenomic Gate   |                 |
|             | CYP3A4, CYP2D6, CYP2C9, CYP1A2 Bounds   |                 |
|             +--------------------+--------------------+                 |
|                                  |                                      |
|                                  v                                      |
|             +-----------------------------------------+                 |
|             | Consolidated Care Plan (C*)             |                 |
|             +-----------------------------------------+                 |
+-------------------------------------------------------------------------+`,
        svgMarkup: `<svg viewBox="0 0 800 240" width="100%" height="150" xmlns="http://www.w3.org/2000/svg" style="background:#09090b;">
  <rect x="30" y="20" width="220" height="50" rx="4" fill="#18181b" stroke="#3b82f6"/>
  <text x="140" y="50" fill="#60a5fa" font-size="11" text-anchor="middle" font-weight="bold">Allopathic EBM (P_West)</text>
  <rect x="290" y="20" width="220" height="50" rx="4" fill="#18181b" stroke="#eab308"/>
  <text x="400" y="50" fill="#facc15" font-size="11" text-anchor="middle" font-weight="bold">TCM Zang-Fu (P_TCM)</text>
  <rect x="550" y="20" width="220" height="50" rx="4" fill="#18181b" stroke="#10b981"/>
  <text x="660" y="50" fill="#34d399" font-size="11" text-anchor="middle" font-weight="bold">Ayurvedic Tridosha (P_Ayur)</text>
  <path d="M 140 70 L 400 110 M 400 70 L 400 110 M 660 70 L 400 110" stroke="#0d9488" stroke-width="2"/>
  <rect x="200" y="110" width="400" height="50" rx="4" fill="#134e4a" stroke="#14b8a6"/>
  <text x="400" y="135" fill="#5eead4" font-size="12" text-anchor="middle" font-weight="bold">Orthogonal Latent Space &amp; Multi-Objective Loss</text>
  <text x="400" y="150" fill="#99f6e4" font-size="10" text-anchor="middle">CYP450 Constraint: CYP3A4, 2D6, 2C9, 1A2</text>
  <path d="M 400 160 L 400 185" stroke="#14b8a6" stroke-width="2"/>
  <rect x="250" y="185" width="300" height="40" rx="4" fill="#042f2e" stroke="#2dd4bf"/>
  <text x="400" y="210" fill="#ccfbf1" font-size="11" text-anchor="middle" font-weight="bold">Consolidated Integrative Care Plan C*</text>
</svg>`
      },
      {
        figureId: 'fig-3-conformal-sets',
        figureNumber: 3,
        title: 'FIG. 3: Mondrian ICP Nonconformity Distribution & Conformal Set Formation',
        description: 'Calibration distribution, empirical quantile threshold q_hat_(1-alpha), and partition into singleton {1}, ambiguous {0, 1}, and stable {0} prediction sets.',
        asciiArt: `+-------------------------------------------------------------------------+
|                  FIG. 3: CONFORMAL SET FORMATION                        |
+-------------------------------------------------------------------------+
|   Frequency                                                             |
|       ^         Distribution of Nonconformity Scores over D_cal         |
|       |                                                                 |
|       |                 * * *                                           |
|       |               *       *                                         |
|       |             *           *          Quantile q_hat_(0.95)        |
|       |            *             *                   |                  |
|       |           *               *                  v                  |
|       +----------*-----------------*-----------------+-------*-----> s  |
|       0                                                                 |
|                                                                         |
|   Gamma^alpha(x) = { y in {0, 1} : s(x, y) <= q_hat }                   |
|   • s(x, 1) <= q_hat  AND  s(x, 0) > q_hat   ==>  {1}    [STAT Sepsis]   |
|   • s(x, 1) <= q_hat  AND  s(x, 0) <= q_hat  ==>  {0, 1} [Abstention]   |
|   • s(x, 1) > q_hat   AND  s(x, 0) <= q_hat  ==>  {0}    [Stable Mon]   |
|   • s(x, 1) > q_hat   AND  s(x, 0) > q_hat   ==>  {}     [OOD Anomaly]  |
+-------------------------------------------------------------------------+`,
        svgMarkup: `<svg viewBox="0 0 800 220" width="100%" height="150" xmlns="http://www.w3.org/2000/svg" style="background:#09090b;">
  <line x1="60" y1="170" x2="740" y2="170" stroke="#3f3f46" stroke-width="2"/>
  <line x1="60" y1="170" x2="60" y2="30" stroke="#3f3f46" stroke-width="2"/>
  <path d="M 80 170 Q 200 40 400 120 T 600 168" stroke="#14b8a6" stroke-width="3" fill="none"/>
  <line x1="520" y1="20" x2="520" y2="180" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6,6"/>
  <text x="525" y="35" fill="#fbbf24" font-size="11" font-family="monospace" font-weight="bold">q_hat_(0.95)</text>
  <rect x="80" y="185" width="180" height="24" rx="2" fill="#059669"/>
  <text x="170" y="201" fill="#fff" font-size="10" text-anchor="middle" font-weight="bold">{0}: Calibrated Stable</text>
  <rect x="280" y="185" width="220" height="24" rx="2" fill="#d97706"/>
  <text x="390" y="201" fill="#fff" font-size="10" text-anchor="middle" font-weight="bold">{0, 1}: Epistemic Abstention</text>
  <rect x="520" y="185" width="200" height="24" rx="2" fill="#e11d48"/>
  <text x="620" y="201" fill="#fff" font-size="10" text-anchor="middle" font-weight="bold">{1}: STAT Sepsis Alert</text>
</svg>`
      },
      {
        figureId: 'fig-4-abstention-flowchart',
        figureNumber: 4,
        title: 'FIG. 4: Epistemic Abstention Flowchart & State Machine',
        description: 'Logic flowchart and state transition machine depicting the Epistemic Abstention decision protocol and closed-loop telemetry acceleration sequence.',
        asciiArt: `+-------------------------------------------------------------------------+
|                  FIG. 4: EPISTEMIC ABSTENTION FLOWCHART                 |
+-------------------------------------------------------------------------+
|                      [ Ingest Telemetry Vector x ]                      |
|                                    |                                    |
|                                    v                                    |
|                       < Compute Conformal Set >                         |
|                                    |                                    |
|             +----------------------+----------------------+             |
|             |                      |                      |             |
|             v                      v                      v             |
|        Set = {1}              Set = {0, 1}             Set = {0}        |
|        STAT ALERT             EPISTEMIC ABSTAIN        STABLE MONITOR   |
|        Audible chime          * Suppress Alarm         * Silent log     |
|        EHR Pop-up             * Telemetry -> 2m        * 15m routine    |
|        Sepsis Bundle          * Reflex Lactate Lab     * No alarms      |
+-------------------------------------------------------------------------+`,
        svgMarkup: `<svg viewBox="0 0 800 220" width="100%" height="150" xmlns="http://www.w3.org/2000/svg" style="background:#09090b;">
  <rect x="300" y="15" width="200" height="35" rx="4" fill="#18181b" stroke="#0d9488"/>
  <text x="400" y="38" fill="#5eead4" font-size="11" text-anchor="middle" font-weight="bold">Ingest Patient Telemetry</text>
  <path d="M 400 50 L 400 75" stroke="#0d9488" stroke-width="2"/>
  <polygon points="400,75 520,105 400,135 280,105" fill="#18181b" stroke="#14b8a6"/>
  <text x="400" y="110" fill="#2dd4bf" font-size="11" text-anchor="middle" font-weight="bold">Compute Γ^α(x)</text>
  <path d="M 280 105 L 140 105 L 140 150" stroke="#e11d48" stroke-width="2"/>
  <path d="M 400 135 L 400 150" stroke="#f59e0b" stroke-width="2"/>
  <path d="M 520 105 L 660 105 L 660 150" stroke="#10b981" stroke-width="2"/>
  <rect x="50" y="150" width="180" height="55" rx="4" fill="#2a1215" stroke="#e11d48"/>
  <text x="140" y="172" fill="#fda4af" font-size="11" text-anchor="middle" font-weight="bold">Γ^α={1}: STAT Sepsis</text>
  <text x="140" y="190" fill="#fecdd3" font-size="9" text-anchor="middle">Audible Alert + Order Set</text>
  <rect x="290" y="150" width="220" height="55" rx="4" fill="#2e1f0c" stroke="#f59e0b"/>
  <text x="400" y="172" fill="#fde68a" font-size="11" text-anchor="middle" font-weight="bold">Γ^α={0,1}: Epistemic Abstain</text>
  <text x="400" y="190" fill="#fef3c7" font-size="9" text-anchor="middle">Suppress Alarm + 2m Poll + Lab</text>
  <rect x="570" y="150" width="180" height="55" rx="4" fill="#0f2922" stroke="#10b981"/>
  <text x="660" y="172" fill="#a7f3d0" font-size="11" text-anchor="middle" font-weight="bold">Γ^α={0}: Calibrated Stable</text>
  <text x="660" y="190" fill="#d1fae5" font-size="9" text-anchor="middle">Routine 15m Telemetry</text>
</svg>`
      }
    ];
  }

  getUsptoProvisionalBinder(): IUsptoProvisionalBinder {
    return {
      docketNumber: 'PG-PAT-2026-CONF-001',
      title: 'System and Method for Tri-Paradigm Consilience and Finite-Sample Conformal Clinical Intervals with Epistemic Abstention',
      abstract: 'A computer-implemented clinical decision support system and method reconciling disparate medical ontologies while providing finite-sample statistical coverage guarantees against acute clinical deterioration. The system ingests multimodal patient telemetry and solves a constrained multi-objective optimization problem mapping Allopathic, Traditional Chinese Medicine, and Ayurvedic clinical trajectories into an orthogonal biophysical latent state subject to CYP450 metabolic interaction bounds. Concurrently, a Mondrian Inductive Conformal Prediction engine calculates nonconformity scores over exchangeable calibration cohorts to generate prediction sets guaranteeing marginal coverage probability 1 - α ≥ 0.95. When elevated epistemic uncertainty yields an ambiguous prediction set {0, 1}, an epistemic abstention controller automatically suppresses interruptive audible and visual alerts, increases telemetry sampling frequency, and orders targeted confirmatory biomarkers. Singleton positive sets {1} trigger immediate clinical intervention, reducing alarm fatigue by over 80% relative to uncalibrated point-probability classifiers.',
      inventors: [
        'PocketGull Applied Clinical AI Consortium',
        'PocketGull Biophysical Signal Processing Group',
        'PocketGull Integrative Epistemology Consortium'
      ],
      assignee: 'PocketGull Health AI PBC (dpo@pocketgull.app)',
      filingDate: '2026-10-03',
      jurisdiction: 'United States Patent and Trademark Office (USPTO) / WIPO PCT',
      fieldOfInvention: 'Medical informatics, clinical decision support systems (CDSS), biometric signal processing, and statistical machine learning for acute physiological deterioration screening and multi-ontology metabolic care planning.',
      priorArtDemarcation: 'Overcomes the severe deficiencies of uncalibrated scalar point-probability classifiers, specifically the Epic Sepsis Model (ESM; Wong et al. 2021 JAMA Intern Med, AUROC 0.63, 88% false alarm rate, severe alarm fatigue) through finite-sample Mondrian Inductive Conformal Prediction with Epistemic Abstention and cross-paradigm CYP450 metabolic interaction gates.',
      summaryOfInvention: 'Two co-operating inventive pillars: (A) Tri-Paradigm Consilience solving multi-objective loss min_C Σ w_k D(C, P_k) + λ Ω(C) s.t. CYP450(C) ≤ τ; and (B) Mondrian ICP generating prediction sets Γ^α(x) guaranteeing coverage 1-α ≥ 0.95, paired with an Epistemic Abstention Controller that suppresses interruptive alarms when Γ^α={0, 1}, accelerates telemetry, and orders confirmatory biomarkers.',
      documentPath: 'docs/patents/USPTO_PROVISIONAL_TRI_PARADIGM_CONFORMAL_SEPSIS.md',
      claims: this.getProvisionalClaims(),
      figures: this.getProvisionalFigures(),
      fullSpecificationMarkdown: this.exportUsptoProvisionalMarkdown()
    };
  }

  exportUsptoProvisionalMarkdown(): string {
    const claims = this.getProvisionalClaims();
    const figures = this.getProvisionalFigures();
    return `# ⚖️ USPTO PROVISIONAL PATENT APPLICATION: DOCKET PG-PAT-2026-CONF-001
**Title**: System and Method for Tri-Paradigm Consilience and Finite-Sample Conformal Clinical Intervals with Epistemic Abstention
**Assignee**: PocketGull Health AI PBC (dpo@pocketgull.app)
**Date**: October 3, 2026

## Abstract
A computer-implemented clinical decision support system and method reconciling disparate medical ontologies while providing finite-sample statistical coverage guarantees against acute clinical deterioration. The system ingests multimodal patient telemetry and solves a constrained multi-objective optimization problem mapping Allopathic, Traditional Chinese Medicine, and Ayurvedic clinical trajectories into an orthogonal biophysical latent state subject to CYP450 metabolic interaction bounds. Concurrently, a Mondrian Inductive Conformal Prediction engine calculates nonconformity scores over exchangeable calibration cohorts to generate prediction sets guaranteeing marginal coverage probability 1 - α ≥ 0.95. When elevated epistemic uncertainty yields an ambiguous prediction set {0, 1}, an epistemic abstention controller automatically suppresses interruptive audible and visual alerts, increases telemetry sampling frequency, and orders targeted confirmatory biomarkers. Singleton positive sets {1} trigger immediate clinical intervention, reducing alarm fatigue by over 80% relative to uncalibrated point-probability classifiers.

## Formal Patent Claims (Claims 1 – 20)
${claims.map(c => `### Claim ${c.claimNumber} (${c.claimType}, ${c.isIndependent ? 'Independent' : 'Dependent'})\n${c.claimText}\n`).join('\n')}

## Figures
${figures.map(f => `### ${f.title}\n${f.description}\n\`\`\`\n${f.asciiArt}\n\`\`\`\n`).join('\n')}
`;
  }

  exportOpenPatentPledgeMarkdown(): string {
    return `# ⚖️ POCKETGULL OPEN PATENT PLEDGE & ACADEMIC RESEARCH COVENANT
**Assignee & Licensor**: PocketGull Health AI PBC & Phil Gear (dpo@pocketgull.app)
**Date**: October 4, 2026
**Governing Statutory Frameworks**: 35 U.S.C. § 101 et seq., 35 U.S.C. § 102(a)(1), 35 U.S.C. § 122(e), 37 CFR 1.290

## 1. Open Patent Research Grant & Non-Assertion Covenant
Subject to the defensive conditions herein, PocketGull and Phil Gear irrevocably covenant not to assert any patent, patent application, or exclusive rights (spanning all 17 Invention Clusters, Claims 1–340, and Provisional Specification Docket PG-PAT-2026-CONF-001) against any academic medical center, university laboratory, hospital, or non-profit research institute for:
- Academic bench trial benchmarking and algorithmic reproduction
- Observational clinical validation studies (MIMIC-IV, eICU, OMOP cohorts)
- Peer-reviewed scientific publication and open educational use

## 2. Defensive Termination Condition (Patent Retaliation Shield)
Any license, non-assertion covenant, or permission granted under this Pledge shall immediately, automatically, and permanently terminate with respect to any entity that:
1. Commences, files, maintains, or financially sponsors any patent infringement litigation or administrative proceeding (including Inter Partes Review) against PocketGull, Phil Gear, or their contributors; or
2. Asserts patent claims alleging that PocketGull's open-source repositories or published specifications infringe any third-party patent.

## 3. Statutory Prior Art Bar (35 U.S.C. § 102(a)(1))
All specifications, formulas, WGSL shaders, 3D procedural meshes, and algorithmic methods committed to public repositories, documentation, and immutable git commits constitute non-confidential, date-stamped statutory prior art worldwide. Any third party attempting to register, file, or claim inventorship over these published methods commits inequitable conduct under 35 U.S.C. § 115 and renders resulting claims invalid under 35 U.S.C. § 102 / § 103.
`;
  }
}

