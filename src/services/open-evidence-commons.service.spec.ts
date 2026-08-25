import '@angular/compiler';
import { OpenEvidenceCommonsService } from './open-evidence-commons.service';

describe('OpenEvidenceCommonsService Unit Suite', () => {
  let service: OpenEvidenceCommonsService;

  beforeEach(() => {
    service = new OpenEvidenceCommonsService();
  });

  it('1. Initializes with landmark clinical trial evidence nodes and Merkle state', () => {
    expect(service).toBeTruthy();
    expect(service.totalEvidenceCount()).toBe(5);
    expect(service.merkleRoot()).toMatch(/^0x[a-f0-9]{64}$/i);
    expect(service.supermajorityPassedCount()).toBeGreaterThanOrEqual(4);
    expect(service.totalQuadraticStake()).toBeGreaterThan(1000);
  });

  it('2. Computes valid SHA-256 Merkle tree root over evidence nodes', async () => {
    const nodes = service.evidenceNodes();
    const { root, tree } = await service.buildMerkleTree(nodes);

    expect(root).toBeDefined();
    expect(root.length).toBe(64);
    expect(tree.length).toBeGreaterThanOrEqual(2);
  });

  it('3. Generates and verifies cryptographic Merkle inclusion proof for a valid node', async () => {
    const proof = await service.generateMerkleProof('ev-sprint-2015');

    expect(proof).not.toBeNull();
    expect(proof!.leafId).toBe('ev-sprint-2015');
    expect(proof!.siblings.length).toBeGreaterThan(0);
    expect(proof!.isValid).toBe(true);

    const isVerified = await service.verifyMerkleProof(proof!);
    expect(isVerified).toBe(true);
  });

  it('4. Rejects tampered Merkle proofs', async () => {
    const proof = await service.generateMerkleProof('ev-sprint-2015');
    expect(proof).not.toBeNull();

    // Tamper with the leaf hash
    const tamperedProof = {
      ...proof!,
      leafHash: '0000000000000000000000000000000000000000000000000000000000000000',
    };

    const isVerified = await service.verifyMerkleProof(tamperedProof);
    expect(isVerified).toBe(false);
  });

  it('5. Casts quadratic consensus votes and recalculates stake score', async () => {
    const initialNode = service.evidenceNodes().find(n => n.id === 'ev-periodontal-crp-2025')!;
    const initialVotes = initialNode.totalVotes;
    const initialAffirmative = initialNode.affirmativeVotes;

    const updatedNode = await service.castConsensusVote(
      'ev-periodontal-crp-2025',
      'clinician-dr-curie',
      true,
      36 // sqrt(36) = 6 credits
    );

    expect(updatedNode.totalVotes).toBe(initialVotes + 1);
    expect(updatedNode.affirmativeVotes).toBe(initialAffirmative + 1);
    expect(updatedNode.quadraticStakeScore).toBeCloseTo(initialNode.quadraticStakeScore + 6.0, 1);
  });

  it('6. Generates new cryptographic attestation receipts with incremented block height', async () => {
    const initialBlock = service.latestReceipt()?.blockHeight || 28490;

    const receipt = await service.generateAttestationReceipt();

    expect(receipt.blockHeight).toBe(initialBlock + 1);
    expect(receipt.receiptId).toBe(`RECEIPT-BLOCK-${initialBlock + 1}`);
    expect(receipt.witnessSignature).toMatch(/^SIG-ED25519-POCKETGULL-[A-F0-9]{16}$/);
    expect(receipt.evidenceNodeIds.length).toBe(5);
  });

  it('7. Queries evidence nodes by ICD-10 code, condition name, or keyword', () => {
    const hypertensionMatches = service.queryEvidenceByCondition('I10');
    expect(hypertensionMatches.length).toBeGreaterThanOrEqual(1);
    expect(hypertensionMatches[0].id).toBe('ev-sprint-2015');

    const diabetesMatches = service.queryEvidenceByCondition('Diabetes');
    expect(diabetesMatches.length).toBeGreaterThanOrEqual(1);
    expect(diabetesMatches[0].id).toBe('ev-empa-reg-2015');
  });
});
