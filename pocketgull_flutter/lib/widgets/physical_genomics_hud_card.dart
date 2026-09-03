import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/physical_genomics_provider.dart';

/// Physical Genomics & 3D Spatial Hologram Telemetry HUD Card
/// Built with Dark Obsidian WCAG AAA contrast, Riverpod reactivity, and LOINC 98253-8 metrics.

class PhysicalGenomicsHudCard extends ConsumerWidget {
  const PhysicalGenomicsHudCard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final uiState = ref.watch(physicalGenomicsProvider);
    final notifier = ref.read(physicalGenomicsProvider.notifier);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0D1117),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF30363D), width: 1.5),
        boxShadow: const [
          BoxShadow(
            color: Colors.black54,
            blurRadius: 16,
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header & LOINC Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 10,
                    height: 10,
                    decoration: const BoxDecoration(
                      color: Color(0xFF00FFC2),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'Physical Genomics Mobile HUD',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF00382E),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF00FFC2).withAlpha(100)),
                ),
                child: const Text(
                  'LOINC 98253-8',
                  style: TextStyle(
                    color: Color(0xFF00FFC2),
                    fontFamily: 'monospace',
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Paradigm Selector Tabs
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildTab(notifier, uiState.activeParadigm, 'chromatin', '🧬 Chromatin'),
                const SizedBox(width: 6),
                _buildTab(notifier, uiState.activeParadigm, 'condensates', '💧 Condensates'),
                const SizedBox(width: 6),
                _buildTab(notifier, uiState.activeParadigm, 'crispr', '✂️ CRISPR'),
                const SizedBox(width: 6),
                _buildTab(notifier, uiState.activeParadigm, 'nucleosome', '🪢 Nucleosome'),
                const SizedBox(width: 6),
                _buildTab(notifier, uiState.activeParadigm, 'linc', '🏛️ LINC'),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Main Telemetry Display
          uiState.prediction.when(
            loading: () => const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: CircularProgressIndicator(color: Color(0xFF00FFC2)),
              ),
            ),
            error: (err, _) => Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red.withAlpha(30),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                'Evaluation Error: $err',
                style: const TextStyle(color: Colors.redAccent, fontSize: 12),
              ),
            ),
            data: (pred) => Column(
              children: [
                _buildTelemetryGrid(pred, uiState.activeParadigm),
                const SizedBox(height: 12),
                _buildDualViewBar(uiState, notifier),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTab(PhysicalGenomicsNotifier notifier, String current, String id, String label) {
    final isSelected = current == id;
    return GestureDetector(
      onTap: () => notifier.setActiveParadigm(id),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF00382E) : const Color(0xFF161B22),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? const Color(0xFF00FFC2) : const Color(0xFF30363D),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? const Color(0xFF00FFC2) : Colors.grey[400],
            fontSize: 11,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _buildTelemetryGrid(dynamic pred, String paradigm) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF161B22),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF30363D)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildMetricCol('TAD Insulation', '${(pred.tadInsulationScore * 100).toStringAsFixed(0)}%', const Color(0xFF00FFC2)),
          _buildMetricCol('LLPS Droplet', '${pred.dropletRadiusNm.toStringAsFixed(0)} nm', const Color(0xFF58A6FF)),
          _buildMetricCol('Cas9 Cleavage', '${(pred.cleavageProbability * 100).toStringAsFixed(1)}%', const Color(0xFFFFA657)),
          _buildMetricCol('YAP/TAZ Ratio', '${pred.yapTazNuclearRatio.toStringAsFixed(2)}x', const Color(0xFFFF7B72)),
        ],
      ),
    );
  }

  Widget _buildMetricCol(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            color: color,
            fontSize: 14,
            fontWeight: FontWeight.bold,
            fontFamily: 'monospace',
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: TextStyle(
            color: Colors.grey[400],
            fontSize: 9,
          ),
        ),
      ],
    );
  }

  Widget _buildDualViewBar(PhysicalGenomicsUiState state, PhysicalGenomicsNotifier notifier) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          state.isDualView ? '🪞 Dual Comparison Active' : '🎯 Single Focus View',
          style: TextStyle(
            color: state.isDualView ? const Color(0xFFFFA657) : Colors.grey[500],
            fontSize: 11,
            fontWeight: FontWeight.w500,
          ),
        ),
        GestureDetector(
          onTap: () => notifier.toggleDualView(),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: state.isDualView ? const Color(0xFF4C2800) : const Color(0xFF21262D),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: state.isDualView ? const Color(0xFFFFA657) : const Color(0xFF30363D),
              ),
            ),
            child: Text(
              state.isDualView ? 'Exit Dual' : 'Compare WT vs Rescued',
              style: TextStyle(
                color: state.isDualView ? const Color(0xFFFFA657) : Colors.white70,
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
