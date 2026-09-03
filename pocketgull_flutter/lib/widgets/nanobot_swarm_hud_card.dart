import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/nanobot_swarm_model.dart';
import '../providers/nanobot_swarm_provider.dart';

class NanobotSwarmHudCard extends ConsumerWidget {
  const NanobotSwarmHudCard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final telemetry = ref.watch(nanobotSwarmProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      elevation: 4,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: isDark ? const Color(0xFF0F766E).withValues(alpha: 0.5) : const Color(0xFF0D9488),
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
                    const Text('🤖', style: TextStyle(fontSize: 22)),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'NANOBOT SWARM BIOMECHANICS',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.1,
                            color: isDark ? const Color(0xFF5EEAD4) : const Color(0xFF0F766E),
                          ),
                        ),
                        Text(
                          'Space-Telescope Physics Engine (Low-Re)',
                          style: TextStyle(
                            fontSize: 10,
                            color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF475569),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                // Kuramoto Coherence Badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF134E4A) : const Color(0xFFCCFBF1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: const Color(0xFF0D9488),
                      width: 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.sync, size: 12, color: Color(0xFF0D9488)),
                      const SizedBox(width: 4),
                      Text(
                        'Φ: ${telemetry.kuramotoCoherence}',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: isDark ? const Color(0xFF99F6E4) : const Color(0xFF115E59),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Mode Selector Bar
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: SwarmOperationalMode.values.map((mode) {
                  final isSelected = telemetry.mode == mode;
                  return Padding(
                    padding: const EdgeInsets.only(right: 6.0),
                    child: InkWell(
                      onTap: () {
                        ref.read(nanobotSwarmProvider.notifier).setOperationalMode(mode);
                      },
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        constraints: const BoxConstraints(minHeight: 44),
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? (isDark ? const Color(0xFF0D9488) : const Color(0xFF0F766E))
                              : (isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9)),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isSelected ? const Color(0xFF2DD4BF) : const Color(0xFF334155),
                          ),
                        ),
                        child: Row(
                          children: [
                            Text(mode.icon, style: const TextStyle(fontSize: 14)),
                            const SizedBox(width: 6),
                            Text(
                              mode.label,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: isSelected
                                    ? Colors.white
                                    : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF334155)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 14),

            // Telemetry Readouts Grid
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
                        label: 'Collective Thrust',
                        value: '${telemetry.collectiveThrustNn} nN',
                        icon: Icons.speed,
                        color: const Color(0xFF0D9488),
                        isDark: isDark,
                      ),
                      _buildMetric(
                        label: 'Coronagraphic Gain',
                        value: '+${telemetry.coronagraphicSnrGainDb} dB',
                        icon: Icons.visibility,
                        color: const Color(0xFFA855F7),
                        isDark: isDark,
                      ),
                    ],
                  ),
                  const Divider(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildMetric(
                        label: 'Capture Rate',
                        value: '${telemetry.targetCaptureRatePercent}%',
                        icon: Icons.track_changes,
                        color: const Color(0xFF10B981),
                        isDark: isDark,
                      ),
                      _buildMetric(
                        label: 'Target Stiffness',
                        value: '${telemetry.target.stiffnessKpa} kPa',
                        icon: Icons.grain,
                        color: const Color(0xFFF59E0B),
                        isDark: isDark,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Acoustic Steering Vector Sliders
            Text(
              'ACOUSTIC STEERING VECTOR',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.0,
                color: isDark ? const Color(0xFF2DD4BF) : const Color(0xFF0F766E),
              ),
            ),
            const SizedBox(height: 6),

            // Pitch Slider
            Row(
              children: [
                SizedBox(
                  width: 70,
                  child: Text(
                    'Pitch: ${telemetry.steering.pitchDeg.toInt()}°',
                    style: TextStyle(
                      fontSize: 11,
                      color: isDark ? Colors.white70 : Colors.black87,
                    ),
                  ),
                ),
                Expanded(
                  child: SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      activeTrackColor: const Color(0xFF0D9488),
                      thumbColor: const Color(0xFF2DD4BF),
                      trackHeight: 3,
                    ),
                    child: Slider(
                      value: telemetry.steering.pitchDeg,
                      min: -90,
                      max: 90,
                      onChanged: (val) {
                        ref.read(nanobotSwarmProvider.notifier).updateSteering(pitchDeg: val);
                      },
                    ),
                  ),
                ),
              ],
            ),

            // Acoustic Pressure Slider
            Row(
              children: [
                SizedBox(
                  width: 70,
                  child: Text(
                    'Pressure: ${telemetry.steering.acousticPressureMpa.toStringAsFixed(1)} MPa',
                    style: TextStyle(
                      fontSize: 11,
                      color: isDark ? Colors.white70 : Colors.black87,
                    ),
                  ),
                ),
                Expanded(
                  child: SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      activeTrackColor: const Color(0xFF0D9488),
                      thumbColor: const Color(0xFF2DD4BF),
                      trackHeight: 3,
                    ),
                    child: Slider(
                      value: telemetry.steering.acousticPressureMpa,
                      min: 0.1,
                      max: 2.5,
                      onChanged: (val) {
                        ref.read(nanobotSwarmProvider.notifier).updateSteering(pressureMpa: val);
                      },
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
