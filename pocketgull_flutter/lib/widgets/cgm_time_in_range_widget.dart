import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/mobile_cgm_time_in_range_service.dart';

class CgmTimeInRangeWidget extends ConsumerWidget {
  final List<double> glucoseReadingsMgDl;

  const CgmTimeInRangeWidget({
    super.key,
    this.glucoseReadingsMgDl = const [],
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final service = ref.watch(cgmTimeInRangeServiceProvider);
    final metrics = service.calculateMetrics(glucoseReadingsMgDl);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF18181B) : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? const Color(0xFF27272A) : const Color(0xFFE5E7EB),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: metrics.isClinicalTargetMet
                          ? const Color(0xFF10B981)
                          : const Color(0xFFF59E0B),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'CGM TIME IN RANGE (TIR)',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                      color: isDark ? const Color(0xFFA1A1AA) : const Color(0xFF6B7280),
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: metrics.isClinicalTargetMet
                      ? (isDark ? const Color(0xFF064E3B) : const Color(0xFFECFDF5))
                      : (isDark ? const Color(0xFF78350F) : const Color(0xFFFFFBEB)),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  metrics.isClinicalTargetMet ? 'TARGET MET' : 'ATTENTION REQUIRED',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.8,
                    color: metrics.isClinicalTargetMet
                        ? const Color(0xFF10B981)
                        : const Color(0xFFD97706),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Multi-segment Glycemic Distribution Bar
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: SizedBox(
              height: 14,
              child: Row(
                children: [
                  if (metrics.timeBelowRangePercent > 0)
                    Expanded(
                      flex: (metrics.timeBelowRangePercent * 10).round(),
                      child: Container(color: const Color(0xFFEF4444)),
                    ),
                  if (metrics.tightRangePercent > 0)
                    Expanded(
                      flex: (metrics.tightRangePercent * 10).round(),
                      child: Container(color: const Color(0xFF059669)),
                    ),
                  if ((metrics.timeInRangePercent - metrics.tightRangePercent) > 0)
                    Expanded(
                      flex: (((metrics.timeInRangePercent - metrics.tightRangePercent)) * 10).round(),
                      child: Container(color: const Color(0xFF34D399)),
                    ),
                  if (metrics.timeAboveRangePercent > 0)
                    Expanded(
                      flex: (metrics.timeAboveRangePercent * 10).round(),
                      child: Container(color: const Color(0xFFF59E0B)),
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 8),

          // Legend Labels
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildLegendTile('TBR <70', '${metrics.timeBelowRangePercent}%', const Color(0xFFEF4444), isDark),
              _buildLegendTile('TIR 70-180', '${metrics.timeInRangePercent}%', const Color(0xFF10B981), isDark),
              _buildLegendTile('TAR >180', '${metrics.timeAboveRangePercent}%', const Color(0xFFF59E0B), isDark),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(height: 1, thickness: 1),
          const SizedBox(height: 12),

          // Metrics 3-Column Summary Grid
          Row(
            children: [
              Expanded(
                child: _buildMetricTile(
                  'GMI %',
                  '${metrics.glucoseManagementIndexGmi}%',
                  'Est. HbA1c',
                  isDark,
                ),
              ),
              Expanded(
                child: _buildMetricTile(
                  'MEAN',
                  '${metrics.meanGlucoseMgDl}',
                  'mg/dL',
                  isDark,
                ),
              ),
              Expanded(
                child: _buildMetricTile(
                  'CV %',
                  '${metrics.coefficientOfVariationPercent}%',
                  metrics.coefficientOfVariationPercent < 36.0 ? 'Stable' : 'Variable',
                  isDark,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLegendTile(String label, String value, Color color, bool isDark) {
    return Row(
      children: [
        Container(
          width: 6,
          height: 6,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 4),
        Text(
          '$label: ',
          style: TextStyle(
            fontSize: 9,
            color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
      ],
    );
  }

  Widget _buildMetricTile(String title, String mainValue, String subLabel, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.grey.shade400 : Colors.grey.shade500,
            letterSpacing: 1.0,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          mainValue,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : const Color(0xFF18181B),
          ),
        ),
        Text(
          subLabel,
          style: TextStyle(
            fontSize: 9,
            color: isDark ? const Color(0xFF10B981) : const Color(0xFF047857),
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
