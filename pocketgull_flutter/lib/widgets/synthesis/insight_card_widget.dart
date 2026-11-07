import 'package:flutter/material.dart';
import '../../services/knowledge_synthesis_service.dart';

/// Insight card — glassmorphism card for a single synthesized insight.
///
/// Flutter parity with Angular `insight-card.component.ts`.

class InsightCardWidget extends StatelessWidget {
  final InsightNode insight;

  const InsightCardWidget({super.key, required this.insight});

  Color _typeColor(InsightType type) => switch (type) {
        InsightType.urgentSignal => const Color(0xFFEF4444),
        InsightType.actionItem => const Color(0xFF3B82F6),
        InsightType.context => const Color(0xFF10B981),
        InsightType.unknown => const Color(0xFF6B7280),
      };

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = _typeColor(insight.type);

    return Container(
      decoration: BoxDecoration(
        color: isDark
            ? Colors.white.withValues(alpha: 0.04)
            : Colors.white.withValues(alpha: 0.7),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark
              ? Colors.white.withValues(alpha: 0.08)
              : Colors.white.withValues(alpha: 0.4),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.15 : 0.04),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: accent.withValues(alpha: isDark ? 0.15 : 0.08),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: accent.withValues(alpha: 0.2),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.bolt, size: 12, color: accent),
                    const SizedBox(width: 4),
                    Text(
                      insight.typeLabel,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.5,
                        color: accent,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                'Confidence: ${insight.confidence}%',
                style: TextStyle(
                  fontSize: 11,
                  fontFamily: 'PocketGullMono',
                  fontWeight: FontWeight.w500,
                  color: isDark ? Colors.grey.shade500 : Colors.grey.shade400,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            insight.title,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: isDark ? Colors.white : Colors.grey.shade800,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            insight.content,
            maxLines: 4,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 13,
              height: 1.6,
              color: isDark ? Colors.grey.shade300 : Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }
}
