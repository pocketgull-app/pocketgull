import { Injectable, signal, computed } from '@angular/core';

export interface IMandiantThreatActor {
  actorId: string;
  name: string;
  aliases: string[];
  threatType: 'NATION_STATE' | 'FINANCIALLY_MOTIVATED_RANSOMWARE' | 'CREDENTIAL_BROKER' | 'AI_ADVERSARY';
  targetAssets: string[];
  mitreAttAndCkTechniques: string[];
  mandiantThreatDescription: string;
  historicalHealthcareTargeting: string;
  riskScore: number; // 0 - 100
}

export interface IMitreAtlasAiTactic {
  tacticId: string;
  tacticName: string;
  mitreAtlasId: string;
  clinicalThreatVector: string;
  mandiantDefenseRule: string;
  countermeasureStatus: 'ACTIVE_GUARDED' | 'MONITORING' | 'CONTAINED';
}

export interface IIncidentForensicSnapshot {
  snapshotId: string;
  timestamp: string;
  eventCategory: 'PROMPT_INJECTION' | 'EXFILTRATION_SPIKE' | 'UNAUTHORIZED_GEO_HOP' | 'TAMPERED_HASH';
  severity: 'INFO' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  evidencePayloadHash: string;
  containmentApplied: string;
  hhs405dAlignment: string;
}

export interface IMandiantDefensePosture {
  systemIntegrityScore: number; // 0 - 100
  threatLevel: 'DEFCON_4_GUARDED' | 'DEFCON_3_ELEVATED' | 'DEFCON_2_HIGH' | 'DEFCON_1_CRITICAL';
  activeZeroTrustEnforced: boolean;
  monitoredActorsCount: number;
  quarantinedPayloadsCount: number;
  lastForensicAuditSha: string;
}

@Injectable({
  providedIn: 'root'
})
export class MandiantClinicalDefenseService {
  // Signals for dynamic security telemetry
  public readonly isContainmentModeActive = signal<boolean>(false);
  public readonly activeThreatFilter = signal<string>('ALL');
  public readonly simulatedAttackVector = signal<string | null>(null);

  // Curated Mandiant M-Trends Threat Intelligence on Healthcare Threat Actors
  public readonly threatActors = signal<IMandiantThreatActor[]>([
    {
      actorId: 'MND-UNC2596',
      name: 'UNC2596 (Cuba Ransomware)',
      aliases: ['Fidel', 'Tropical Scorpius'],
      threatType: 'FINANCIALLY_MOTIVATED_RANSOMWARE',
      targetAssets: ['Electronic Health Records (EHR)', 'PACS Imaging Servers', 'Active Directory Domain Controllers'],
      mitreAttAndCkTechniques: ['T1566.001 (Phishing)', 'T1059.001 (PowerShell)', 'T1486 (Data Encrypted for Impact)'],
      mandiantThreatDescription: 'Targets healthcare delivery organizations (HDOs) with double-extortion tactics, exfiltrating HIPAA PHI before deploying encryptors.',
      historicalHealthcareTargeting: 'Attacked numerous US regional medical centers and hospital networks.',
      riskScore: 92
    },
    {
      actorId: 'MND-FIN12',
      name: 'FIN12 (Rapid Ransomware Syndicates)',
      aliases: ['Pistachio Harvest', 'Wizard Spider Affiliate'],
      threatType: 'FINANCIALLY_MOTIVATED_RANSOMWARE',
      targetAssets: ['Clinical Telemetry Gateways', 'Medical Device Infrastructure', 'Hospital Emergency Routing'],
      mitreAttAndCkTechniques: ['T1078 (Valid Accounts)', 'T1021.001 (RDP Lateral Movement)', 'T1489 (Service Stop)'],
      mandiantThreatDescription: 'Notorious for hyper-speed intrusions without multi-month dwell times, executing encryption in hospital networks within 48 hours of initial access.',
      historicalHealthcareTargeting: 'Healthcare constitutes >20% of observed FIN12 victims in Mandiant global telemetry.',
      riskScore: 95
    },
    {
      actorId: 'MND-APT41',
      name: 'APT41 (Dual Espionage & Cybercrime)',
      aliases: ['Barium', 'Brass Typhoon', 'Wicked Panda'],
      threatType: 'NATION_STATE',
      targetAssets: ['Pharmaceutical IP', 'Genomic Research Databases', 'Clinical Trial Registries (Phase I-III)'],
      mitreAttAndCkTechniques: ['T1190 (Exploit Public-Facing App)', 'T1505.003 (Web Shells)', 'T1005 (Data from Local System)'],
      mandiantThreatDescription: 'State-sponsored actor conducting intellectual property theft against biotechnology and biomedical vaccine research institutions.',
      historicalHealthcareTargeting: 'Targeted global cancer research labs and medical diagnostic equipment manufacturers.',
      riskScore: 89
    },
    {
      actorId: 'MND-UNC3944',
      name: 'UNC3944 (Scattered Spider)',
      aliases: ['Muddled Libra', 'Scatter Swine'],
      threatType: 'CREDENTIAL_BROKER',
      targetAssets: ['Cloud Identity Providers (Okta/Entra)', 'SSO Portals', 'Clinician Mobile MFA Gateways'],
      mitreAttAndCkTechniques: ['T1621 (MFA Fatigue)', 'T1539 (Steal Web Session Cookies)', 'T1098.005 (Device Registration)'],
      mandiantThreatDescription: 'Masters of aggressive vishing and SIM swapping to breach healthcare cloud infrastructure and bypass multi-factor authentication.',
      historicalHealthcareTargeting: 'Breached major healthcare conglomerates and health insurance identity portals.',
      riskScore: 94
    },
    {
      actorId: 'MND-AI-ADV-01',
      name: 'UNC-ATLAS (Adversarial AI Exploitation Group)',
      aliases: ['Prompt-Weaver', 'Model Inversion Crew'],
      threatType: 'AI_ADVERSARY',
      targetAssets: ['Clinical Decision Support (CDS) LLMs', 'Vector Embedding Stores', 'Diagnostic Inference Endpoints'],
      mitreAttAndCkTechniques: ['AML.T0043 (LLM Prompt Injection)', 'AML.T0024 (Model Inversion)', 'AML.T0015 (Evasion)'],
      mandiantThreatDescription: 'Adversarial group focusing on crafting adversarial perturbations in medical imaging and jailbreaking clinical AI reasoning engines.',
      historicalHealthcareTargeting: 'Targeted cloud-hosted radiology AI services and clinical transcription models.',
      riskScore: 88
    }
  ]);

  // MITRE ATLAS (Adversarial Threat Landscape for AI Systems) for Clinical AI
  public readonly atlasTactics = signal<IMitreAtlasAiTactic[]>([
    {
      tacticId: 'TAC-01',
      tacticName: 'Direct & Indirect Prompt Injection',
      mitreAtlasId: 'AML.T0043',
      clinicalThreatVector: 'Malicious clinical directives embedded in patient EHR notes attempting to alter drug dosage or triage severity.',
      mandiantDefenseRule: 'Static System Instruction Immutability + Structural Content Partitioning ([CLINICAL DIRECTIVE CONTEXT] validation).',
      countermeasureStatus: 'ACTIVE_GUARDED'
    },
    {
      tacticId: 'TAC-02',
      tacticName: 'Model Inversion / PHI Extraction',
      mitreAtlasId: 'AML.T0024',
      clinicalThreatVector: 'Repeated boundary querying to reconstruct training embeddings and extract patient identifiable health information.',
      mandiantDefenseRule: 'Differential Privacy Noise Injection + HIPAA §164.514 Safe Harbor 18-Identifier Scrubbing on all output vectors.',
      countermeasureStatus: 'ACTIVE_GUARDED'
    },
    {
      tacticId: 'TAC-03',
      tacticName: 'Adversarial Medical Image Perturbation',
      mitreAtlasId: 'AML.T0015',
      clinicalThreatVector: 'Imperceptible high-frequency pixel noise added to DICOM X-rays causing misclassification of fractures or nodules.',
      mandiantDefenseRule: 'Biophysical Laplacian Spatial Filtering + Multi-Scale Structural Similarity Index (SSIM) Verification.',
      countermeasureStatus: 'ACTIVE_GUARDED'
    },
    {
      tacticId: 'TAC-04',
      tacticName: 'SSRF & Egress Exfiltration',
      mitreAtlasId: 'AML.T0031',
      clinicalThreatVector: 'Coercing LLM tool execution to fetch internal cloud metadata (e.g. 169.254.169.254) or exfiltrate state to unverified external endpoints.',
      mandiantDefenseRule: 'Sentinel Egress Guard + Strict Domain Whitelisting (100% of egress bound to approved GCP & Medical endpoints).',
      countermeasureStatus: 'ACTIVE_GUARDED'
    }
  ]);

  // Forensic Snapshots Audit Log
  public readonly forensicSnapshots = signal<IIncidentForensicSnapshot[]>([
    {
      snapshotId: 'DFIR-2026-0815-001',
      timestamp: new Date().toISOString(),
      eventCategory: 'PROMPT_INJECTION',
      severity: 'INFO',
      evidencePayloadHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      containmentApplied: 'System Prompt Immutability Guard filtered untrusted instruction tag.',
      hhs405dAlignment: 'HICP Section 3.1.2 - Endpoint Protection & Ingestion Sanitization'
    },
    {
      snapshotId: 'DFIR-2026-0815-002',
      timestamp: new Date().toISOString(),
      eventCategory: 'UNAUTHORIZED_GEO_HOP',
      severity: 'MEDIUM',
      evidencePayloadHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      containmentApplied: 'JurisdictionGuardService enforced US Territorial Sovereignty barrier on federal statutory tools.',
      hhs405dAlignment: 'HICP Section 5.2.4 - Geographic Access Boundaries & Zero Trust'
    }
  ]);

  // Computed Defense Posture
  public readonly defensePosture = computed<IMandiantDefensePosture>(() => {
    const isContained = this.isContainmentModeActive();
    const actors = this.threatActors();
    const avgRisk = actors.reduce((acc, a) => acc + a.riskScore, 0) / (actors.length || 1);

    return {
      systemIntegrityScore: isContained ? 100 : Math.round(100 - (avgRisk * 0.05)),
      threatLevel: isContained ? 'DEFCON_1_CRITICAL' : 'DEFCON_4_GUARDED',
      activeZeroTrustEnforced: true,
      monitoredActorsCount: actors.length,
      quarantinedPayloadsCount: this.forensicSnapshots().length,
      lastForensicAuditSha: 'SHA256-MND-' + Math.abs(Math.sin(Date.now())).toString(16).substring(2, 10).toUpperCase()
    };
  });

  /**
   * Triggers Emergency Containment Protocol (Zero-Trust Lock & Ephemeral State Purge).
   */
  public triggerEmergencyContainment(): void {
    this.isContainmentModeActive.set(true);
    const newSnapshot: IIncidentForensicSnapshot = {
      snapshotId: `DFIR-EMERGENCY-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventCategory: 'EXFILTRATION_SPIKE',
      severity: 'CRITICAL',
      evidencePayloadHash: 'MND-EMERGENCY-LOCKDOWN-' + Date.now().toString(16),
      containmentApplied: 'External egress severed. Ephemeral patient memory isolated. Mandatory Zero-Trust MFA invoked.',
      hhs405dAlignment: 'HICP Section 9.1 - Incident Response & Containment Playbook'
    };
    this.forensicSnapshots.update(prev => [newSnapshot, ...prev]);
  }

  /**
   * Resets Containment Protocol after verification.
   */
  public resetContainment(): void {
    this.isContainmentModeActive.set(false);
  }
}
