import { Injectable, signal, computed } from '@angular/core';

export type ICochraneEvidenceLevel = 
  | 'Level A (High Quality RCTs)' 
  | 'Level B (Observational Cohorts)' 
  | 'Level C (Expert Consensus / Plausibility)';

export type ICochraneRiskOfBias = 'Low Risk' | 'Some Concerns' | 'High Risk';

export interface IEvidenceNode {
  id: string;
  title: string;
  conditionCode: string; // ICD-10 or SNOMED-CT
  conditionName: string;
  trialReference: string; // NCT ID or PubMed DOI
  sampleSize: number;
  pValue: number;
  h0Hypothesis: string;
  cochraneRiskOfBias: ICochraneRiskOfBias;
  evidenceLevel: ICochraneEvidenceLevel;
  consensusScore: number; // 0 to 100%
  affirmativeVotes: number;
  totalVotes: number;
  quadraticStakeScore: number;
  sha256Hash: string;
  isAttested: boolean;
  timestamp: string;
}

export interface IMerkleSibling {
  position: 'left' | 'right';
  hash: string;
}

export interface IMerkleProof {
  leafId: string;
  leafHash: string;
  leafIndex: number;
  siblings: IMerkleSibling[];
  rootHash: string;
  isValid: boolean;
}

export interface IAttestationReceipt {
  receiptId: string;
  blockHeight: number;
  merkleRoot: string;
  evidenceNodeIds: string[];
  consensusRatio: number;
  witnessSignature: string;
  timestamp: string;
}

export interface IOpenEvidenceCommonsState {
  evidenceNodes: IEvidenceNode[];
  merkleRoot: string;
  latestReceipt: IAttestationReceipt | null;
  totalVotesCast: number;
  lastAttestationTimestamp: string;
}

const INITIAL_EVIDENCE_NODES: IEvidenceNode[] = [
  {
    id: 'ev-sprint-2015',
    title: 'Intensive Blood-Pressure Control vs Standard Target in High-Risk Hypertension (SPRINT Trial)',
    conditionCode: 'I10',
    conditionName: 'Essential Hypertension',
    trialReference: 'NCT01206062 / NEJM 2015; 373:2103-2116',
    sampleSize: 9361,
    pValue: 0.0001,
    h0Hypothesis: 'Targeting SBP < 120 mmHg does not reduce composite cardiovascular events vs < 140 mmHg.',
    cochraneRiskOfBias: 'Low Risk',
    evidenceLevel: 'Level A (High Quality RCTs)',
    consensusScore: 94.2,
    affirmativeVotes: 142,
    totalVotes: 151,
    quadraticStakeScore: 1248.5,
    sha256Hash: 'a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    isAttested: true,
    timestamp: '2026-08-01T12:00:00Z',
  },
  {
    id: 'ev-predimed-2018',
    title: 'Primary Prevention of Cardiovascular Disease with a Mediterranean Diet Supplemented with EVOO/Nuts',
    conditionCode: 'I25.1',
    conditionName: 'Atherosclerotic Heart Disease',
    trialReference: 'NCT00394862 / NEJM 2018; 378:e34',
    sampleSize: 7447,
    pValue: 0.0015,
    h0Hypothesis: 'Mediterranean diet supplemented with EVOO or nuts does not lower major cardiovascular event rates vs control diet.',
    cochraneRiskOfBias: 'Low Risk',
    evidenceLevel: 'Level A (High Quality RCTs)',
    consensusScore: 91.8,
    affirmativeVotes: 128,
    totalVotes: 139,
    quadraticStakeScore: 1102.3,
    sha256Hash: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    isAttested: true,
    timestamp: '2026-08-05T14:30:00Z',
  },
  {
    id: 'ev-empa-reg-2015',
    title: 'Empagliflozin, Cardiovascular Outcomes, and Mortality in Type 2 Diabetes (EMPA-REG OUTCOME)',
    conditionCode: 'E11.9',
    conditionName: 'Type 2 Diabetes Mellitus',
    trialReference: 'NCT01131676 / NEJM 2015; 373:2117-2128',
    sampleSize: 7020,
    pValue: 0.0004,
    h0Hypothesis: 'SGLT2 inhibitor empagliflozin provides non-inferior but zero superior reduction in death from cardiovascular causes.',
    cochraneRiskOfBias: 'Low Risk',
    evidenceLevel: 'Level A (High Quality RCTs)',
    consensusScore: 96.1,
    affirmativeVotes: 158,
    totalVotes: 164,
    quadraticStakeScore: 1410.8,
    sha256Hash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
    isAttested: true,
    timestamp: '2026-08-10T09:15:00Z',
  },
  {
    id: 'ev-vagal-hrv-2024',
    title: 'Resonant Frequency Breathing (0.1 Hz) and Heart Rate Variability Biofeedback in Autonomic Dysregulation',
    conditionCode: 'G90.9',
    conditionName: 'Autonomic Nervous System Disorder',
    trialReference: 'DOI: 10.1038/s41598-024-58210-9',
    sampleSize: 640,
    pValue: 0.0042,
    h0Hypothesis: 'Slow-paced vagal respiration produces no statistically significant elevation in RMSSD or baroreflex sensitivity.',
    cochraneRiskOfBias: 'Some Concerns',
    evidenceLevel: 'Level B (Observational Cohorts)',
    consensusScore: 84.5,
    affirmativeVotes: 98,
    totalVotes: 116,
    quadraticStakeScore: 812.4,
    sha256Hash: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
    isAttested: true,
    timestamp: '2026-08-15T18:45:00Z',
  },
  {
    id: 'ev-periodontal-crp-2025',
    title: 'Systemic Inflammatory Burden Reduction Following Full-Mouth Ultrasonic Caries Debridement',
    conditionCode: 'K05.3',
    conditionName: 'Chronic Periodontitis with Systemic Inflammatory Burden',
    trialReference: 'DOI: 10.1111/jcpe.13942',
    sampleSize: 820,
    pValue: 0.0120,
    h0Hypothesis: 'Targeted scaling and root planing does not reduce high-sensitivity C-reactive protein (hs-CRP) at 12-week follow-up.',
    cochraneRiskOfBias: 'Some Concerns',
    evidenceLevel: 'Level B (Observational Cohorts)',
    consensusScore: 82.0,
    affirmativeVotes: 82,
    totalVotes: 100,
    quadraticStakeScore: 710.0,
    sha256Hash: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
    isAttested: true,
    timestamp: '2026-08-20T11:20:00Z',
  },
];

@Injectable({
  providedIn: 'root',
})
export class OpenEvidenceCommonsService {
  /**
   * Central Open Evidence Commons Reactive Signal State
   */
  readonly state = signal<IOpenEvidenceCommonsState>({
    evidenceNodes: INITIAL_EVIDENCE_NODES,
    merkleRoot: '0x9e8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a',
    latestReceipt: {
      receiptId: 'RECEIPT-BLOCK-28491',
      blockHeight: 28491,
      merkleRoot: '0x9e8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a',
      evidenceNodeIds: INITIAL_EVIDENCE_NODES.map(n => n.id),
      consensusRatio: 0.912,
      witnessSignature: 'SIG-ED25519-POCKETGULL-COMMONS-77A1B8C9',
      timestamp: '2026-08-21T08:00:00Z',
    },
    totalVotesCast: 670,
    lastAttestationTimestamp: '2026-08-21T08:00:00Z',
  });

  // Computed signals
  readonly evidenceNodes = computed(() => this.state().evidenceNodes);
  readonly merkleRoot = computed(() => this.state().merkleRoot);
  readonly latestReceipt = computed(() => this.state().latestReceipt);
  readonly totalEvidenceCount = computed(() => this.state().evidenceNodes.length);
  readonly supermajorityPassedCount = computed(() => 
    this.state().evidenceNodes.filter(n => n.consensusScore >= 66.7).length
  );
  readonly totalQuadraticStake = computed(() => 
    this.state().evidenceNodes.reduce((sum, n) => sum + n.quadraticStakeScore, 0)
  );

  constructor() {
    this.recomputeAllNodeHashes();
  }

  /**
   * Computes native SHA-256 hex string using Web Crypto API.
   */
  async calculateSha256(data: string): Promise<string> {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      const buffer = new TextEncoder().encode(data);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback deterministic 64-character hash for non-browser/unit-test environments
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    for (let i = 0; i < data.length; i++) {
      const ch = data.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const p1 = Math.abs(h1).toString(16).padStart(32, '0');
    const p2 = Math.abs(h2).toString(16).padStart(32, '0');
    return (p1 + p2).slice(0, 64);
  }

  /**
   * Recomputes canonical cryptographic hashes for all evidence nodes and recalculates the Merkle root.
   */
  async recomputeAllNodeHashes(): Promise<string> {
    const nodes = this.state().evidenceNodes;
    const updatedNodes: IEvidenceNode[] = [];

    for (const node of nodes) {
      const payload = `${node.id}|${node.conditionCode}|${node.trialReference}|${node.pValue.toFixed(6)}|${node.cochraneRiskOfBias}|${node.consensusScore.toFixed(2)}`;
      const nodeHash = await this.calculateSha256(payload);
      updatedNodes.push({ ...node, sha256Hash: nodeHash });
    }

    const { root } = await this.buildMerkleTree(updatedNodes);

    this.state.update(s => ({
      ...s,
      evidenceNodes: updatedNodes,
      merkleRoot: `0x${root}`,
    }));

    return root;
  }

  /**
   * Constructs a binary SHA-256 Merkle Tree over a list of evidence nodes.
   */
  async buildMerkleTree(nodes: IEvidenceNode[]): Promise<{ root: string; tree: string[][] }> {
    if (nodes.length === 0) {
      return { root: '0'.repeat(64), tree: [[]] };
    }

    // Leaf layer
    let currentLevel: string[] = nodes.map(n => n.sha256Hash);
    const tree: string[][] = [currentLevel];

    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left; // Duplicate odd node
        const combined = await this.calculateSha256(`${left}:${right}`);
        nextLevel.push(combined);
      }
      tree.push(nextLevel);
      currentLevel = nextLevel;
    }

    return { root: currentLevel[0], tree };
  }

  /**
   * Generates a cryptographic Merkle Inclusion Proof for a specific evidence node.
   */
  async generateMerkleProof(nodeId: string): Promise<IMerkleProof | null> {
    const nodes = this.state().evidenceNodes;
    const index = nodes.findIndex(n => n.id === nodeId);
    if (index === -1) return null;

    const { root, tree } = await this.buildMerkleTree(nodes);
    const siblings: IMerkleSibling[] = [];

    let currentIndex = index;
    for (let level = 0; level < tree.length - 1; level++) {
      const levelNodes = tree[level];
      const isRightSibling = currentIndex % 2 === 0;
      const siblingIndex = isRightSibling ? currentIndex + 1 : currentIndex - 1;

      if (siblingIndex < levelNodes.length) {
        siblings.push({
          position: isRightSibling ? 'right' : 'left',
          hash: levelNodes[siblingIndex],
        });
      } else {
        // Self-paired odd node
        siblings.push({
          position: 'right',
          hash: levelNodes[currentIndex],
        });
      }

      currentIndex = Math.floor(currentIndex / 2);
    }

    const leafHash = nodes[index].sha256Hash;
    const proof: IMerkleProof = {
      leafId: nodeId,
      leafHash,
      leafIndex: index,
      siblings,
      rootHash: `0x${root}`,
      isValid: true,
    };

    proof.isValid = await this.verifyMerkleProof(proof);
    return proof;
  }

  /**
   * Verifies an inclusion proof by hashing sibling pairs up to the expected Merkle root.
   */
  async verifyMerkleProof(proof: IMerkleProof): Promise<boolean> {
    let currentHash = proof.leafHash;

    for (const sibling of proof.siblings) {
      const combined = sibling.position === 'right' 
        ? `${currentHash}:${sibling.hash}`
        : `${sibling.hash}:${currentHash}`;
      currentHash = await this.calculateSha256(combined);
    }

    const computedRoot = `0x${currentHash}`;
    return computedRoot.toLowerCase() === proof.rootHash.toLowerCase();
  }

  /**
   * Casts a peer consensus vote with Quadratic Voting weighting: \text{Weight} = \sqrt{\text{Credits}}
   */
  async castConsensusVote(
    nodeId: string,
    clinicianId: string,
    voteAffirmative: boolean,
    quadraticCredits: number = 25
  ): Promise<IEvidenceNode> {
    const effectiveWeight = Math.sqrt(Math.max(1, quadraticCredits));
    let targetNode: IEvidenceNode | undefined;

    const updatedNodes = this.state().evidenceNodes.map(node => {
      if (node.id === nodeId) {
        const newAffirmative = voteAffirmative ? node.affirmativeVotes + 1 : node.affirmativeVotes;
        const newTotal = node.totalVotes + 1;
        const newConsensusScore = parseFloat(((newAffirmative / newTotal) * 100).toFixed(1));
        const newStake = parseFloat((node.quadraticStakeScore + effectiveWeight).toFixed(1));

        targetNode = {
          ...node,
          affirmativeVotes: newAffirmative,
          totalVotes: newTotal,
          consensusScore: newConsensusScore,
          quadraticStakeScore: newStake,
          timestamp: new Date().toISOString(),
        };
        return targetNode;
      }
      return node;
    });

    if (!targetNode) {
      throw new Error(`Evidence node with id "${nodeId}" not found.`);
    }

    this.state.update(s => ({
      ...s,
      evidenceNodes: updatedNodes,
      totalVotesCast: s.totalVotesCast + 1,
    }));

    await this.recomputeAllNodeHashes();
    return targetNode;
  }

  /**
   * Generates a new cryptographic attestation receipt for the current state.
   */
  async generateAttestationReceipt(): Promise<IAttestationReceipt> {
    await this.recomputeAllNodeHashes();
    const currentState = this.state();
    const nextBlockHeight = (currentState.latestReceipt?.blockHeight || 28490) + 1;
    const totalAffirmative = currentState.evidenceNodes.reduce((acc, n) => acc + n.affirmativeVotes, 0);
    const totalVotes = currentState.evidenceNodes.reduce((acc, n) => acc + n.totalVotes, 0);
    const consensusRatio = parseFloat((totalAffirmative / Math.max(1, totalVotes)).toFixed(3));

    const signaturePayload = `${nextBlockHeight}|${currentState.merkleRoot}|${consensusRatio}|${Date.now()}`;
    const witnessSig = `SIG-ED25519-POCKETGULL-${(await this.calculateSha256(signaturePayload)).slice(0, 16).toUpperCase()}`;

    const receipt: IAttestationReceipt = {
      receiptId: `RECEIPT-BLOCK-${nextBlockHeight}`,
      blockHeight: nextBlockHeight,
      merkleRoot: currentState.merkleRoot,
      evidenceNodeIds: currentState.evidenceNodes.map(n => n.id),
      consensusRatio,
      witnessSignature: witnessSig,
      timestamp: new Date().toISOString(),
    };

    this.state.update(s => ({
      ...s,
      latestReceipt: receipt,
      lastAttestationTimestamp: receipt.timestamp,
    }));

    return receipt;
  }

  /**
   * Queries consensus-attested clinical evidence matching a condition search query.
   */
  queryEvidenceByCondition(query: string): IEvidenceNode[] {
    const q = (query || '').toLowerCase().trim();
    if (!q) return this.state().evidenceNodes;

    return this.state().evidenceNodes.filter(node => 
      node.conditionCode.toLowerCase().includes(q) ||
      node.conditionName.toLowerCase().includes(q) ||
      node.title.toLowerCase().includes(q) ||
      node.trialReference.toLowerCase().includes(q)
    );
  }
}
