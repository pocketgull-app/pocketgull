import 'dart:math';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class FlutterEvidenceNode {
  final String id;
  final String title;
  final String conditionCode;
  final String trialReference;
  final int sampleSize;
  final double pValue;
  final String cochraneRiskOfBias;
  final double consensusScore;
  final int affirmativeVotes;
  final int totalVotes;
  final double quadraticStakeScore;
  final String sha256Hash;
  final bool isAttested;

  const FlutterEvidenceNode({
    required this.id,
    required this.title,
    required this.conditionCode,
    required this.trialReference,
    required this.sampleSize,
    required this.pValue,
    required this.cochraneRiskOfBias,
    required this.consensusScore,
    required this.affirmativeVotes,
    required this.totalVotes,
    required this.quadraticStakeScore,
    required this.sha256Hash,
    required this.isAttested,
  });

  FlutterEvidenceNode copyWith({
    double? consensusScore,
    int? affirmativeVotes,
    int? totalVotes,
    double? quadraticStakeScore,
  }) {
    return FlutterEvidenceNode(
      id: id,
      title: title,
      conditionCode: conditionCode,
      trialReference: trialReference,
      sampleSize: sampleSize,
      pValue: pValue,
      cochraneRiskOfBias: cochraneRiskOfBias,
      consensusScore: consensusScore ?? this.consensusScore,
      affirmativeVotes: affirmativeVotes ?? this.affirmativeVotes,
      totalVotes: totalVotes ?? this.totalVotes,
      quadraticStakeScore: quadraticStakeScore ?? this.quadraticStakeScore,
      sha256Hash: sha256Hash,
      isAttested: isAttested,
    );
  }
}

class EvidenceCommonsState {
  final List<FlutterEvidenceNode> nodes;
  final String merkleRoot;
  final int blockHeight;
  final bool isAttesting;

  const EvidenceCommonsState({
    required this.nodes,
    required this.merkleRoot,
    required this.blockHeight,
    required this.isAttesting,
  });

  int get supermajorityPassedCount =>
      nodes.where((n) => n.consensusScore >= 66.7).length;

  EvidenceCommonsState copyWith({
    List<FlutterEvidenceNode>? nodes,
    String? merkleRoot,
    int? blockHeight,
    bool? isAttesting,
  }) {
    return EvidenceCommonsState(
      nodes: nodes ?? this.nodes,
      merkleRoot: merkleRoot ?? this.merkleRoot,
      blockHeight: blockHeight ?? this.blockHeight,
      isAttesting: isAttesting ?? this.isAttesting,
    );
  }
}

final _initialEvidenceNodes = [
  const FlutterEvidenceNode(
    id: 'ev-sprint-2015',
    title: 'Intensive Blood-Pressure Control (SPRINT Trial)',
    conditionCode: 'I10',
    trialReference: 'NCT01206062 / NEJM',
    sampleSize: 9361,
    pValue: 0.0001,
    cochraneRiskOfBias: 'Low Risk',
    consensusScore: 94.2,
    affirmativeVotes: 142,
    totalVotes: 151,
    quadraticStakeScore: 1248.5,
    sha256Hash: 'a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    isAttested: true,
  ),
  const FlutterEvidenceNode(
    id: 'ev-predimed-2018',
    title: 'Primary Prevention of CVD with Mediterranean Diet',
    conditionCode: 'I25.1',
    trialReference: 'NCT00394862 / NEJM',
    sampleSize: 7447,
    pValue: 0.0015,
    cochraneRiskOfBias: 'Low Risk',
    consensusScore: 91.8,
    affirmativeVotes: 128,
    totalVotes: 139,
    quadraticStakeScore: 1102.3,
    sha256Hash: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    isAttested: true,
  ),
  const FlutterEvidenceNode(
    id: 'ev-empa-reg-2015',
    title: 'Empagliflozin Outcomes in Type 2 Diabetes',
    conditionCode: 'E11.9',
    trialReference: 'NCT01131676 / NEJM',
    sampleSize: 7020,
    pValue: 0.0004,
    cochraneRiskOfBias: 'Low Risk',
    consensusScore: 96.1,
    affirmativeVotes: 158,
    totalVotes: 164,
    quadraticStakeScore: 1410.8,
    sha256Hash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
    isAttested: true,
  ),
];

class OpenEvidenceCommonsNotifier extends StateNotifier<EvidenceCommonsState> {
  OpenEvidenceCommonsNotifier()
      : super(
          EvidenceCommonsState(
            nodes: _initialEvidenceNodes,
            merkleRoot: '0x9e8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a',
            blockHeight: 28491,
            isAttesting: false,
          ),
        );

  void castQuadraticVote(String nodeId, [int credits = 25]) {
    final effectiveWeight = sqrt(max(1, credits));
    final updatedList = state.nodes.map((node) {
      if (node.id == nodeId) {
        final newAffirmative = node.affirmativeVotes + 1;
        final newTotal = node.totalVotes + 1;
        final newScore = (newAffirmative / newTotal * 100).roundToDouble();
        return node.copyWith(
          affirmativeVotes: newAffirmative,
          totalVotes: newTotal,
          consensusScore: newScore,
          quadraticStakeScore: node.quadraticStakeScore + effectiveWeight,
        );
      }
      return node;
    }).toList();

    state = state.copyWith(nodes: updatedList);
  }

  Future<void> issueBlockAttestation() async {
    state = state.copyWith(isAttesting: true);
    await Future.delayed(const Duration(milliseconds: 500));
    state = state.copyWith(
      blockHeight: state.blockHeight + 1,
      isAttesting: false,
    );
  }
}

final openEvidenceCommonsProvider =
    StateNotifierProvider<OpenEvidenceCommonsNotifier, EvidenceCommonsState>(
  (ref) => OpenEvidenceCommonsNotifier(),
);
