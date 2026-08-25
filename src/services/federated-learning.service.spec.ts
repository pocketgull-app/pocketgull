import '@angular/compiler';
import { FederatedLearningService } from './federated-learning.service';

describe('FederatedLearningService Unit Suite', () => {
  let service: FederatedLearningService;

  beforeEach(() => {
    service = new FederatedLearningService();
  });

  it('1. Initializes with default active clinical nodes and round state', () => {
    expect(service).toBeTruthy();
    expect(service.activeNodesCount()).toBe(5);
    expect(service.currentRound()).toBe(8);
    expect(service.isTrainingActive()).toBe(false);
    expect(service.privacyBudgetRemaining()).toBeGreaterThan(0);
  });

  it('2. Clips gradient vectors strictly to L2 norm threshold C', () => {
    const unclippedGrad = [3.0, 4.0]; // L2 norm is 5.0
    const thresholdC = 1.0;

    const result = service.clipGradient(unclippedGrad, thresholdC);

    expect(result.originalNorm).toBeCloseTo(5.0, 4);
    expect(result.clippedNorm).toBeCloseTo(1.0, 4);
    expect(result.clipped[0]).toBeCloseTo(0.6, 4);
    expect(result.clipped[1]).toBeCloseTo(0.8, 4);

    const clippedL2 = Math.sqrt(result.clipped[0] ** 2 + result.clipped[1] ** 2);
    expect(clippedL2).toBeCloseTo(1.0, 4);
  });

  it('3. Leaves gradients smaller than threshold untouched', () => {
    const smallGrad = [0.2, 0.3];
    const thresholdC = 1.0;

    const result = service.clipGradient(smallGrad, thresholdC);
    expect(result.clipped[0]).toBeCloseTo(0.2, 4);
    expect(result.clipped[1]).toBeCloseTo(0.3, 4);
  });

  it('4. Generates pairwise SecAgg masks that sum to exactly zero across all nodes', () => {
    const nodeIds = ['node-us', 'node-uk', 'node-ca', 'node-au', 'node-nz'];
    const dimension = 8;

    const masks = service.generatePairwiseSecAggMasks(nodeIds, dimension);
    expect(masks.size).toBe(5);

    const sumVector = new Array(dimension).fill(0);
    for (const mask of masks.values()) {
      for (let d = 0; d < dimension; d++) {
        sumVector[d] += mask[d];
      }
    }

    for (let d = 0; d < dimension; d++) {
      expect(sumVector[d]).toBeCloseTo(0, 6);
    }
  });

  it('5. Injects Gaussian differential privacy noise without returning NaN', () => {
    const clipped = [0.5, -0.5, 0.2];
    const noisy = service.injectDifferentialPrivacyNoise(clipped, 1.0, 1.1, 1000);

    expect(noisy.length).toBe(3);
    for (const val of noisy) {
      expect(Number.isNaN(val)).toBe(false);
      expect(Number.isFinite(val)).toBe(true);
    }
  });

  it('6. Executes a full DP-SecAgg federated round and updates model telemetry', async () => {
    const initialRound = service.currentRound();
    const initialEpsilon = service.totalEpsilonSpent();

    const result = await service.executeSecAggRound();

    expect(result.roundNumber).toBe(initialRound + 1);
    expect(result.participatingNodeIds.length).toBe(5);
    expect(result.globalMetricR2).toBeGreaterThan(0.9);
    expect(result.secAggProofHash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(service.currentRound()).toBe(initialRound + 1);
    expect(service.totalEpsilonSpent()).toBeGreaterThan(initialEpsilon);
    expect(service.latestRound()?.roundNumber).toBe(initialRound + 1);
  });

  it('7. Resets privacy budget and clears spent epsilon counters', async () => {
    await service.executeSecAggRound();
    expect(service.totalEpsilonSpent()).toBeGreaterThan(0);

    service.resetPrivacyBudget(3.0);
    expect(service.totalEpsilonSpent()).toBe(0);
    expect(service.privacyBudgetRemaining()).toBe(3.0);
    expect(service.privacyLossPercent()).toBe(0);
  });
});
