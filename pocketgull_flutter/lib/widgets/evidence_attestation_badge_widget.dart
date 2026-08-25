import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/open_evidence_commons_provider.dart';

class EvidenceAttestationBadgeWidget extends ConsumerWidget {
  final String nodeId;

  const EvidenceAttestationBadgeWidget({
    super.key,
    required this.nodeId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(openEvidenceCommonsProvider);
    final notifier = ref.read(openEvidenceCommonsProvider.notifier);

    final node = state.nodes.firstWhere(
      (n) => n.id == nodeId,
      orElse: () => state.nodes.first,
    );

    final isSupermajority = node.consensusScore >= 66.7;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF09090B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isSupermajority ? const Color(0xFF059669) : const Color(0xFF27272A),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          // Icon
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: isSupermajority
                  ? const Color(0xFF064E3B)
                  : const Color(0xFF18181B),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              isSupermajority ? Icons.verified_user : Icons.gavel,
              color: isSupermajority
                  ? const Color(0xFF34D399)
                  : const Color(0xFFA1A1AA),
              size: 16,
            ),
          ),
          const SizedBox(width: 10),

          // Title and consensus
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  node.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${node.consensusScore}% Consensus • Stake: ${node.quadraticStakeScore.toStringAsFixed(0)}',
                  style: TextStyle(
                    color: isSupermajority
                        ? const Color(0xFF34D399)
                        : const Color(0xFFA1A1AA),
                    fontSize: 10,
                    fontFamily: 'monospace',
                  ),
                ),
              ],
            ),
          ),

          // Quick Quadratic Vote Button (44px min touch target)
          SizedBox(
            height: 44,
            child: TextButton.icon(
              onPressed: () => notifier.castQuadraticVote(node.id, 25),
              icon: const Icon(Icons.thumb_up_alt_outlined, size: 14),
              label: const Text(
                '+25 Quad',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
              ),
              style: TextButton.styleFrom(
                foregroundColor: const Color(0xFF10B981),
                backgroundColor: const Color(0xFF064E3B).withAlpha(128),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
