import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/clinical_moe_router_provider.dart';
import 'analysis_report_widget.dart';
import 'body_viewer_widget.dart';
import 'cgm_time_in_range_widget.dart';
import 'dicom_viewer_widget.dart';
import 'sentinel_triage_widget.dart';
import 'teledentistry_odontogram_widget.dart';

const Color _emerald = Color(0xFF10B981);
const Color _emeraldAccent = Color(0xFF34D399);

class SparseClinicalCanvasWidget extends ConsumerStatefulWidget {
  const SparseClinicalCanvasWidget({super.key});

  @override
  ConsumerState<SparseClinicalCanvasWidget> createState() =>
      _SparseClinicalCanvasWidgetState();
}

class _SparseClinicalCanvasWidgetState
    extends ConsumerState<SparseClinicalCanvasWidget> {
  final TextEditingController _transcriptController = TextEditingController();

  @override
  void dispose() {
    _transcriptController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(clinicalMoeRouterProvider);
    final notifier = ref.read(clinicalMoeRouterProvider.notifier);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      color: isDark ? const Color(0xFF09090B) : const Color(0xFFF3F4F6),
      child: Column(
        children: [
          // ── Header HUD: Telemetry & Gating Controls ─────────────
          _buildTelemetryHeader(context, state, notifier, isDark),

          // ── Synapse Cross-Attention Bridge ──────────────────────
          if (state.activeBridge != null)
            _buildCrossAttentionBridge(context, state.activeBridge!, isDark),

          // ── Main Viewport Canvas (Responsive Top-k) ─────────────
          Expanded(
            child: LayoutBuilder(
              builder: (context, constraints) {
                final isWide = constraints.maxWidth >= 800;

                if (isWide) {
                  return _buildWideLayout(context, state, notifier, isDark);
                } else {
                  return _buildMobileLayout(context, state, notifier, isDark);
                }
              },
            ),
          ),

          // ── Dormant Experts Shelf ───────────────────────────────
          _buildLatentShelf(context, state, notifier, isDark),
        ],
      ),
    );
  }

  Widget _buildTelemetryHeader(
    BuildContext context,
    ClinicalMoeState state,
    ClinicalMoeRouterNotifier notifier,
    bool isDark,
  ) {
    final primary = state.primaryExpert;
    final secondary = state.secondaryExpert;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF18181B) : Colors.white,
        border: Border(
          bottom: BorderSide(
            color: isDark ? const Color(0xFF27272A) : Colors.grey.shade300,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Row 1: Brand & Metrics
          Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: _emerald.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: _emerald.withValues(alpha: 0.3)),
                ),
                alignment: Alignment.center,
                child: const Text('⚡', style: TextStyle(fontSize: 18)),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          'SMoE CLINICAL CANVAS',
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                            color: isDark ? Colors.white : Colors.black87,
                            letterSpacing: 0.8,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: _emerald.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: _emerald.withValues(alpha: 0.4)),
                          ),
                          child: Text(
                            'Top-${state.kValue} Gating',
                            style: const TextStyle(
                              fontFamily: 'monospace',
                              fontWeight: FontWeight.bold,
                              fontSize: 10,
                              color: _emeraldAccent,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Primary: ${primary?.expert.shortLabel ?? "None"}'
                      '${state.kValue > 1 && secondary != null ? " + ${secondary.expert.shortLabel}" : ""}',
                      style: TextStyle(
                        fontSize: 11,
                        color: isDark ? Colors.grey.shade400 : Colors.grey.shade700,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),

              // Noise Shield Metric Pill
              _buildMetricBadge(
                label: 'Shield',
                value: '+${state.noiseReductionPercent}%',
                color: _emerald,
                isDark: isDark,
              ),
              const SizedBox(width: 6),

              // Cognitive Load Metric Pill
              _buildMetricBadge(
                label: 'Load',
                value: '${state.cognitiveLoadScore}/100',
                color: state.cognitiveLoadScore < 50 ? Colors.teal : Colors.amber,
                isDark: isDark,
              ),
              const SizedBox(width: 6),

              // k-Value Selector
              Container(
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF09090B) : Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: isDark ? const Color(0xFF27272A) : Colors.grey.shade300),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [1, 2, 3].map((k) {
                    final isSelected = state.kValue == k;
                    return InkWell(
                      onTap: () {
                        HapticFeedback.selectionClick();
                        notifier.setKValue(k);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                        decoration: BoxDecoration(
                          color: isSelected ? _emerald : Colors.transparent,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '$k',
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: isSelected ? Colors.black : (isDark ? Colors.white70 : Colors.black87),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          // Row 2: Scenario Quick Switchers & Conversational Speech Cue Simulator
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildScenarioPill(
                  label: '📄 Default',
                  scenario: 'default',
                  current: state.activeScenario,
                  onTap: () {
                    HapticFeedback.lightImpact();
                    notifier.loadDemoScenario('default');
                  },
                ),
                const SizedBox(width: 6),
                _buildScenarioPill(
                  label: '🩻 RSNA Knee OA',
                  scenario: 'knee_oa',
                  current: state.activeScenario,
                  onTap: () {
                    HapticFeedback.lightImpact();
                    notifier.loadDemoScenario('knee_oa');
                  },
                ),
                const SizedBox(width: 6),
                _buildScenarioPill(
                  label: '💊 Diabetic Neuropathy',
                  scenario: 'diabetic_neuropathy',
                  current: state.activeScenario,
                  onTap: () {
                    HapticFeedback.lightImpact();
                    notifier.loadDemoScenario('diabetic_neuropathy');
                  },
                ),
                const SizedBox(width: 6),
                _buildScenarioPill(
                  label: '⚡ Acute Vitals',
                  scenario: 'acute_vitals',
                  current: state.activeScenario,
                  onTap: () {
                    HapticFeedback.lightImpact();
                    notifier.loadDemoScenario('acute_vitals');
                  },
                ),
              ],
            ),
          ),

          const SizedBox(height: 8),

          // Ambient Speech Cue Input Simulator
          TextField(
            controller: _transcriptController,
            onChanged: (text) => notifier.setTranscriptQuery(text),
            style: const TextStyle(fontSize: 12),
            decoration: InputDecoration(
              isDense: true,
              hintText: 'Simulate speech cue (e.g. "knee clicking", "glucose spike", "stat emergency")...',
              hintStyle: TextStyle(fontSize: 11, color: isDark ? Colors.grey.shade500 : Colors.grey.shade600),
              prefixIcon: const Icon(Icons.mic, size: 16, color: _emeraldAccent),
              suffixIcon: _transcriptController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, size: 14),
                      onPressed: () {
                        _transcriptController.clear();
                        notifier.setTranscriptQuery('');
                      },
                    )
                  : null,
              filled: true,
              fillColor: isDark ? const Color(0xFF09090B) : Colors.grey.shade100,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide(color: isDark ? const Color(0xFF27272A) : Colors.grey.shade300),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide(color: isDark ? const Color(0xFF27272A) : Colors.grey.shade300),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: _emerald),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCrossAttentionBridge(
    BuildContext context,
    CrossAttentionBridge bridge,
    bool isDark,
  ) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            _emerald.withValues(alpha: 0.2),
            isDark ? const Color(0xFF18181B) : Colors.white,
            Colors.teal.withValues(alpha: 0.15),
          ],
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _emerald.withValues(alpha: 0.4)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: _emerald.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text('🧬', style: TextStyle(fontSize: 14)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                      decoration: BoxDecoration(
                        color: _emerald.withValues(alpha: 0.3),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'SYNAPSE BRIDGE',
                        style: TextStyle(
                          fontFamily: 'monospace',
                          fontWeight: FontWeight.bold,
                          fontSize: 9,
                          color: _emeraldAccent,
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        bridge.title,
                        style: TextStyle(
                          fontFamily: 'monospace',
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  bridge.clinicalImplication,
                  style: TextStyle(fontSize: 11, color: isDark ? Colors.grey.shade300 : Colors.grey.shade800),
                ),
                const SizedBox(height: 3),
                Text(
                  'Action: ${bridge.actionableVector}',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.tealAccent),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF09090B) : Colors.grey.shade100,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: _emerald.withValues(alpha: 0.3)),
            ),
            child: Text(
              bridge.benchmarkMetric,
              style: const TextStyle(
                fontFamily: 'monospace',
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: _emeraldAccent,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWideLayout(
    BuildContext context,
    ClinicalMoeState state,
    ClinicalMoeRouterNotifier notifier,
    bool isDark,
  ) {
    final primary = state.primaryExpert;
    final secondary = state.secondaryExpert;

    return Padding(
      padding: const EdgeInsets.all(12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Primary Slot
          if (primary != null)
            Flexible(
              flex: state.kValue == 1 || secondary == null ? 100 : state.primaryViewportRatio,
              child: _buildExpertCard(
                context,
                primary,
                isPrimary: true,
                isDark: isDark,
                onPin: () => notifier.pinExpert(primary.expert.id),
              ),
            ),

          if (state.kValue >= 2 && secondary != null) ...[
            const SizedBox(width: 12),
            // Secondary Slot
            Flexible(
              flex: state.secondaryViewportRatio,
              child: _buildExpertCard(
                context,
                secondary,
                isPrimary: false,
                isDark: isDark,
                onPromote: () => notifier.promoteLatentExpert(secondary.expert.id),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildMobileLayout(
    BuildContext context,
    ClinicalMoeState state,
    ClinicalMoeRouterNotifier notifier,
    bool isDark,
  ) {
    final primary = state.primaryExpert;
    final secondary = state.secondaryExpert;

    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        if (primary != null)
          SizedBox(
            height: 480,
            child: _buildExpertCard(
              context,
              primary,
              isPrimary: true,
              isDark: isDark,
              onPin: () => notifier.pinExpert(primary.expert.id),
            ),
          ),

        if (state.kValue >= 2 && secondary != null) ...[
          const SizedBox(height: 12),
          SizedBox(
            height: 380,
            child: _buildExpertCard(
              context,
              secondary,
              isPrimary: false,
              isDark: isDark,
              onPromote: () => notifier.promoteLatentExpert(secondary.expert.id),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildExpertCard(
    BuildContext context,
    UiGatingScore score, {
    required bool isPrimary,
    required bool isDark,
    VoidCallback? onPin,
    VoidCallback? onPromote,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF18181B) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isPrimary ? _emerald.withValues(alpha: 0.5) : const Color(0xFF27272A),
          width: isPrimary ? 1.5 : 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Slot Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF27272A).withValues(alpha: 0.4) : Colors.grey.shade100,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
              border: Border(
                bottom: BorderSide(
                  color: isDark ? const Color(0xFF27272A) : Colors.grey.shade300,
                ),
              ),
            ),
            child: Row(
              children: [
                Text(score.expert.icon, style: const TextStyle(fontSize: 16)),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              score.expert.name,
                              style: TextStyle(
                                fontFamily: 'monospace',
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                                color: isDark ? Colors.white : Colors.black87,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                            decoration: BoxDecoration(
                              color: isPrimary
                                  ? _emerald.withValues(alpha: 0.2)
                                  : Colors.teal.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '${(score.weight * 100).round()}%',
                              style: TextStyle(
                                fontFamily: 'monospace',
                                fontWeight: FontWeight.bold,
                                fontSize: 10,
                                color: isPrimary ? _emeraldAccent : Colors.tealAccent,
                              ),
                            ),
                          ),
                        ],
                      ),
                      Text(
                        '⚡ ${score.expert.telemetrySource} • ${score.routingRationale}',
                        style: TextStyle(
                          fontSize: 10,
                          color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                if (onPin != null)
                  IconButton(
                    icon: const Icon(Icons.push_pin_outlined, size: 16),
                    tooltip: 'Pin Expert',
                    onPressed: () {
                      HapticFeedback.selectionClick();
                      onPin();
                    },
                  ),
                if (onPromote != null)
                  IconButton(
                    icon: const Icon(Icons.arrow_upward, size: 16),
                    tooltip: 'Promote to Primary',
                    onPressed: () {
                      HapticFeedback.selectionClick();
                      onPromote();
                    },
                  ),
              ],
            ),
          ),

          // Dynamic Component Outlet
          Expanded(
            child: ClipRRect(
              borderRadius: const BorderRadius.vertical(bottom: Radius.circular(15)),
              child: _renderExpertComponent(score.expert.id),
            ),
          ),
        ],
      ),
    );
  }

  Widget _renderExpertComponent(String expertId) {
    switch (expertId) {
      case 'dicom-radiology':
        return const DicomViewerWidget();
      case 'body-viewer':
        return const BodyViewerWidget();
      case 'cgm-telemetry':
        return const CgmTimeInRangeWidget();
      case 'teledentistry-sibi':
        return const TeledentistryOdontogramWidget();
      case 'sentinel-triage':
        return const SentinelTriageWidget();
      case 'analysis-report':
      default:
        return const AnalysisReportWidget();
    }
  }

  Widget _buildLatentShelf(
    BuildContext context,
    ClinicalMoeState state,
    ClinicalMoeRouterNotifier notifier,
    bool isDark,
  ) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF09090B) : Colors.white,
        border: Border(
          top: BorderSide(
            color: isDark ? const Color(0xFF27272A) : Colors.grey.shade300,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'LATENT EXPERTS SHELF (DORMANT — 0 FLOP / 0 GPU MEMORY)',
                style: TextStyle(
                  fontFamily: 'monospace',
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.grey.shade500 : Colors.grey.shade600,
                  letterSpacing: 0.5,
                ),
              ),
              if (state.pinnedExpertId != null)
                InkWell(
                  onTap: () {
                    HapticFeedback.lightImpact();
                    notifier.clearOverrides();
                  },
                  child: const Text(
                    'Reset Pins ✕',
                    style: TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.amberAccent,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 6),
          SizedBox(
            height: 34,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: state.latentExperts.length,
              separatorBuilder: (_, _) => const SizedBox(width: 6),
              itemBuilder: (context, index) {
                final latent = state.latentExperts[index];
                return InkWell(
                  onTap: () {
                    HapticFeedback.lightImpact();
                    notifier.promoteLatentExpert(latent.expert.id);
                  },
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF18181B) : Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: isDark ? const Color(0xFF27272A) : Colors.grey.shade300,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(latent.expert.icon, style: const TextStyle(fontSize: 12)),
                        const SizedBox(width: 6),
                        Text(
                          latent.expert.shortLabel,
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: isDark ? Colors.white70 : Colors.black87,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF09090B) : Colors.grey.shade300,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            '${(latent.weight * 100).round()}%',
                            style: TextStyle(
                              fontFamily: 'monospace',
                              fontSize: 9,
                              color: isDark ? Colors.grey.shade400 : Colors.grey.shade800,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricBadge({
    required String label,
    required String value,
    required Color color,
    required bool isDark,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF09090B) : Colors.grey.shade100,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            '$label: ',
            style: TextStyle(
              fontSize: 10,
              fontFamily: 'monospace',
              color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 11,
              fontFamily: 'monospace',
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScenarioPill({
    required String label,
    required String scenario,
    required String current,
    required VoidCallback onTap,
  }) {
    final isSelected = current == scenario;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? _emerald.withValues(alpha: 0.2) : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? _emerald : const Color(0xFF27272A),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontFamily: 'monospace',
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            color: isSelected ? _emeraldAccent : Colors.white70,
          ),
        ),
      ),
    );
  }
}
