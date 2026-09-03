import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/whispy_bioreactor_provider.dart';

class WhispyBioreactorHudCard extends ConsumerWidget {
  const WhispyBioreactorHudCard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final telemetry = ref.watch(whispyBioreactorProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      elevation: 4,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: isDark ? const Color(0xFF047857).withValues(alpha: 0.5) : const Color(0xFF059669),
          width: 1.5,
        ),
      ),
      color: isDark ? const Color(0xFF020617) : const Color(0xFFFAF8F0),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Text('🧪', style: TextStyle(fontSize: 22)),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'ACOUSTIC BIOREACTOR TANK',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.1,
                            color: isDark ? const Color(0xFF34D399) : const Color(0xFF065F46),
                          ),
                        ),
                        Text(
                          'Scan-Inverted Volumetric Assembly',
                          style: TextStyle(
                            fontSize: 10,
                            color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF475569),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                // Patent Pending Badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF064E3B) : const Color(0xFFD1FAE5),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: const Color(0xFF059669),
                      width: 1,
                    ),
                  ),
                  child: Text(
                    'PAT. PEND.',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                      color: isDark ? const Color(0xFFA7F3D0) : const Color(0xFF065F46),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Current Phase Stepper Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF064E3B).withValues(alpha: 0.4) : const Color(0xFFECFDF5),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: const Color(0xFF10B981).withValues(alpha: 0.4),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Text(telemetry.phase.icon, style: const TextStyle(fontSize: 16)),
                      const SizedBox(width: 8),
                      Text(
                        telemetry.phase.label,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isDark ? const Color(0xFF6EE7B7) : const Color(0xFF047857),
                        ),
                      ),
                    ],
                  ),
                  Text(
                    '${(telemetry.gelationFraction * 100).toInt()}% Gel',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isDark ? const Color(0xFFFBBF24) : const Color(0xFFB45309),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Main Chamber Telemetry Metrics
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF090D16) : Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
                ),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildMetric(
                        label: 'Chamber Pressure',
                        value: '${telemetry.chamberPressureKpa} kPa',
                        icon: Icons.compress,
                        color: const Color(0xFF10B981),
                        isDark: isDark,
                      ),
                      _buildMetric(
                        label: 'Gor\'kov Potential',
                        value: '${telemetry.gorkovPotentialNn} nJ',
                        icon: Icons.waves,
                        color: const Color(0xFF06B6D4),
                        isDark: isDark,
                      ),
                    ],
                  ),
                  const Divider(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildMetric(
                        label: 'Structural Fidelity',
                        value: '${telemetry.structuralFidelityPercent}%',
                        icon: Icons.check_circle_outline,
                        color: const Color(0xFF34D399),
                        isDark: isDark,
                      ),
                      _buildMetric(
                        label: 'Bioelectric Bias',
                        value: '${telemetry.bioelectricFieldMvMm} mV/mm',
                        icon: Icons.bolt,
                        color: const Color(0xFFF59E0B),
                        isDark: isDark,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Acoustic Pressure Slider Control
            Row(
              children: [
                SizedBox(
                  width: 80,
                  child: Text(
                    'Pressure: ${telemetry.config.acousticPressureMpa.toStringAsFixed(1)} MPa',
                    style: TextStyle(
                      fontSize: 10.5,
                      color: isDark ? Colors.white70 : Colors.black87,
                    ),
                  ),
                ),
                Expanded(
                  child: SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      activeTrackColor: const Color(0xFF059669),
                      thumbColor: const Color(0xFF10B981),
                      trackHeight: 3,
                    ),
                    child: Slider(
                      value: telemetry.config.acousticPressureMpa,
                      min: 0.2,
                      max: 2.5,
                      onChanged: (val) {
                        ref.read(whispyBioreactorProvider.notifier).updateAcousticPressure(val);
                      },
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Interactive Actions (Fitts's Law Target >= 44px)
            Row(
              children: [
                Expanded(
                  flex: 3,
                  child: InkWell(
                    onTap: () {
                      ref.read(whispyBioreactorProvider.notifier).advancePhase();
                    },
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      constraints: const BoxConstraints(minHeight: 44),
                      decoration: BoxDecoration(
                        color: const Color(0xFF059669),
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF059669).withValues(alpha: 0.3),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.skip_next, size: 18, color: Colors.white),
                            SizedBox(width: 6),
                            Text(
                              'ADVANCE PHASE',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.8,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  flex: 2,
                  child: InkWell(
                    onTap: () {
                      ref.read(whispyBioreactorProvider.notifier).resetChamber();
                    },
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      constraints: const BoxConstraints(minHeight: 44),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1),
                        ),
                      ),
                      child: Center(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.refresh,
                              size: 16,
                              color: isDark ? Colors.white70 : Colors.black87,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'RESET',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: isDark ? Colors.white70 : Colors.black87,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetric({
    required String label,
    required String value,
    required IconData icon,
    required Color color,
    required bool isDark,
  }) {
    return Row(
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: 6),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                color: isDark ? const Color(0xFF64748B) : const Color(0xFF64748B),
              ),
            ),
            Text(
              value,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
