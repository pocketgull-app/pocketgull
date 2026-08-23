import 'dart:math';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class FederatedNode {
  final String id;
  final String name;
  final String jurisdiction;
  final int cohortSize;
  final double epsilonSpent;
  final String status;

  const FederatedNode({
    required this.id,
    required this.name,
    required this.jurisdiction,
    required this.cohortSize,
    required this.epsilonSpent,
    required this.status,
  });
}

class FederatedLearningState {
  final int currentRound;
  final double totalEpsilonSpent;
  final double privacyBudgetMax;
  final double globalMetricR2;
  final double globalLoss;
  final bool isTraining;
  final String latestProofHash;
  final List<FederatedNode> activeNodes;

  const FederatedLearningState({
    required this.currentRound,
    required this.totalEpsilonSpent,
    required this.privacyBudgetMax,
    required this.globalMetricR2,
    required this.globalLoss,
    required this.isTraining,
    required this.latestProofHash,
    required this.activeNodes,
  });

  double get privacyLossPercent =>
      (totalEpsilonSpent / max(0.001, privacyBudgetMax) * 100).clamp(0.0, 100.0);

  double get privacyBudgetRemaining =>
      max(0.0, privacyBudgetMax - totalEpsilonSpent);

  FederatedLearningState copyWith({
    int? currentRound,
    double? totalEpsilonSpent,
    double? privacyBudgetMax,
    double? globalMetricR2,
    double? globalLoss,
    bool? isTraining,
    String? latestProofHash,
    List<FederatedNode>? activeNodes,
  }) {
    return FederatedLearningState(
      currentRound: currentRound ?? this.currentRound,
      totalEpsilonSpent: totalEpsilonSpent ?? this.totalEpsilonSpent,
      privacyBudgetMax: privacyBudgetMax ?? this.privacyBudgetMax,
      globalMetricR2: globalMetricR2 ?? this.globalMetricR2,
      globalLoss: globalLoss ?? this.globalLoss,
      isTraining: isTraining ?? this.isTraining,
      latestProofHash: latestProofHash ?? this.latestProofHash,
      activeNodes: activeNodes ?? this.activeNodes,
    );
  }
}

final _defaultNodes = [
  const FederatedNode(
    id: 'node-us-mayo',
    name: 'Mayo Clinic Clinical Hub',
    jurisdiction: 'US',
    cohortSize: 4250,
    epsilonSpent: 0.28,
    status: 'ACTIVE',
  ),
  const FederatedNode(
    id: 'node-uk-oxford',
    name: 'Oxford Radcliffe Hospitals Trust',
    jurisdiction: 'UK',
    cohortSize: 3100,
    epsilonSpent: 0.26,
    status: 'ACTIVE',
  ),
  const FederatedNode(
    id: 'node-ca-toronto',
    name: 'Toronto General Hospital',
    jurisdiction: 'CA',
    cohortSize: 2800,
    epsilonSpent: 0.24,
    status: 'ACTIVE',
  ),
  const FederatedNode(
    id: 'node-au-melbourne',
    name: 'Royal Melbourne Hospital',
    jurisdiction: 'AU',
    cohortSize: 1950,
    epsilonSpent: 0.22,
    status: 'ACTIVE',
  ),
  const FederatedNode(
    id: 'node-nz-auckland',
    name: 'Auckland City Hospital',
    jurisdiction: 'NZ',
    cohortSize: 1200,
    epsilonSpent: 0.20,
    status: 'ACTIVE',
  ),
];

class FederatedLearningNotifier extends StateNotifier<FederatedLearningState> {
  FederatedLearningNotifier()
      : super(
          FederatedLearningState(
            currentRound: 8,
            totalEpsilonSpent: 0.320,
            privacyBudgetMax: 2.000,
            globalMetricR2: 0.928,
            globalLoss: 0.246,
            isTraining: false,
            latestProofHash: '0x8f2a1b9c7d4e3f6a5b0c8d1e2f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a',
            activeNodes: _defaultNodes,
          ),
        );

  Future<void> executeSecAggRound() async {
    if (state.isTraining || state.privacyBudgetRemaining <= 0) return;

    state = state.copyWith(isTraining: true);
    await Future.delayed(const Duration(milliseconds: 600));

    final nextRound = state.currentRound + 1;
    final nextSpent = min(state.privacyBudgetMax, state.totalEpsilonSpent + 0.040);
    final nextR2 = min(0.985, state.globalMetricR2 + 0.005);
    final nextLoss = max(0.080, state.globalLoss * 0.96);

    state = state.copyWith(
      currentRound: nextRound,
      totalEpsilonSpent: nextSpent,
      globalMetricR2: nextR2,
      globalLoss: nextLoss,
      isTraining: false,
      latestProofHash: '0x${Random().nextInt(0xFFFFFFFF).toRadixString(16).padLeft(8, '0')}${'a' * 56}',
    );
  }

  void resetBudget([double maxBudget = 2.0]) {
    state = state.copyWith(
      totalEpsilonSpent: 0.0,
      privacyBudgetMax: maxBudget,
    );
  }
}

final federatedLearningProvider =
    StateNotifierProvider<FederatedLearningNotifier, FederatedLearningState>(
  (ref) => FederatedLearningNotifier(),
);
