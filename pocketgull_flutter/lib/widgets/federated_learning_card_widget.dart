import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/federated_learning_provider.dart';

class FederatedLearningCardWidget extends ConsumerWidget {
  const FederatedLearningCardWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(federatedLearningProvider);
    final notifier = ref.read(federatedLearningProvider.notifier);

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF09090B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFF27272A),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(128),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF134E4A),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF14B8A6).withAlpha(100)),
                ),
                child: const Icon(
                  Icons.shield_outlined,
                  color: Color(0xFF2DD4BF),
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      'Federated ML Swarm',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.2,
                      ),
                    ),
                    Text(
                      'DP (ε=2.0, δ=1e-5) • SecAgg Zero-Sum',
                      style: TextStyle(
                        color: Color(0xFFA1A1AA),
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
              // Active node badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF064E3B),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF10B981).withAlpha(100)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: Color(0xFF34D399),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${state.activeNodes.length} Nodes',
                      style: const TextStyle(
                        color: Color(0xFF6EE7B7),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Metric Grid
          Row(
            children: [
              // Round
              Expanded(
                child: _buildMetricTile(
                  label: 'Round',
                  value: '#${state.currentRound}',
                  subtext: '/ 50 max',
                  valueColor: Colors.white,
                ),
              ),
              const SizedBox(width: 8),
              // Epsilon spent
              Expanded(
                child: _buildMetricTile(
                  label: 'DP Spent ε',
                  value: state.totalEpsilonSpent.toStringAsFixed(3),
                  subtext: '/ ${state.privacyBudgetMax.toStringAsFixed(1)}',
                  valueColor: const Color(0xFFFBBF24),
                ),
              ),
              const SizedBox(width: 8),
              // R2 Fit
              Expanded(
                child: _buildMetricTile(
                  label: 'Model R²',
                  value: state.globalMetricR2.toStringAsFixed(3),
                  subtext: 'Convergence',
                  valueColor: const Color(0xFF2DD4BF),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // DP Budget Progress Bar
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: state.privacyLossPercent / 100,
              backgroundColor: const Color(0xFF27272A),
              valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF14B8A6)),
              minHeight: 6,
            ),
          ),
          const SizedBox(height: 14),

          // SecAgg Trigger Button
          SizedBox(
            width: double.infinity,
            height: 44, // Fitts's law touch target minimum
            child: ElevatedButton.icon(
              onPressed: state.isTraining
                  ? null
                  : () => notifier.executeSecAggRound(),
              icon: state.isTraining
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.sync, size: 18),
              label: Text(
                state.isTraining
                    ? 'Aggregating Clinical Swarm...'
                    : 'Execute SecAgg Round ${state.currentRound + 1}',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0D9488),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                elevation: 0,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricTile({
    required String label,
    required String value,
    required String subtext,
    required Color valueColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF18181B),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF27272A)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: Color(0xFFA1A1AA),
              fontSize: 10,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(
              color: valueColor,
              fontSize: 14,
              fontWeight: FontWeight.bold,
              fontFamily: 'monospace',
            ),
          ),
          Text(
            subtext,
            style: const TextStyle(
              color: Color(0xFF71717A),
              fontSize: 9,
            ),
          ),
        ],
      ),
    );
  }
}
