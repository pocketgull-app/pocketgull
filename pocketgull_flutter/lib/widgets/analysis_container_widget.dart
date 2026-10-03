import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/patient_provider.dart';
import '../models/patient_types.dart';
import 'sparse_clinical_canvas_widget.dart';

/// Analysis container — philosophy selector + analysis report shell.
///
/// Flutter parity with Angular `analysis-container.component.ts`.
/// Top toolbar with Western/Eastern/Ayurvedic philosophy picker,
/// generate/refresh button, and metadata footer.

class AnalysisContainerWidget extends ConsumerStatefulWidget {
  const AnalysisContainerWidget({super.key});

  @override
  ConsumerState<AnalysisContainerWidget> createState() =>
      _AnalysisContainerWidgetState();
}

class _AnalysisContainerWidgetState
    extends ConsumerState<AnalysisContainerWidget> {
  bool _justGenerated = false;
  bool _isLoading = false;
  bool _showSmoeCanvas = false;
  DateTime? _lastRefreshTime;

  void _selectPhilosophy(MedicalPhilosophy philosophy) {
    ref.read(patientProvider.notifier).updateActivePhilosophy(philosophy);
  }

  void _triggerGenerate() {
    setState(() {
      _isLoading = true;
      _justGenerated = false;
    });
    // Simulate analysis generation.
    Future.delayed(const Duration(milliseconds: 1500), () {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _justGenerated = true;
        _lastRefreshTime = DateTime.now();
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final patient = ref.watch(patientProvider);
    final activePhilosophy =
        patient.activePhilosophy ?? MedicalPhilosophy.western;
    final hasIssues = patient.issues.isNotEmpty;

    return Container(
      color: isDark ? const Color(0xFF09090B) : const Color(0xFFF3F4F6),
      child: Column(
        children: [
          // ── Toolbar ──────────────────────────────────
          Container(
            height: 56,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF09090B) : Colors.white,
              border: Border(
                bottom: BorderSide(
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.06)
                      : Colors.grey.shade200,
                ),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Philosophy selector & SMoE Canvas Toggle
                Row(
                  children: [
                    _PhilosophyPicker(
                      active: activePhilosophy,
                      onSelect: _selectPhilosophy,
                      isDark: isDark,
                    ),
                    const SizedBox(width: 8),
                    InkWell(
                      onTap: () {
                        HapticFeedback.selectionClick();
                        setState(() => _showSmoeCanvas = !_showSmoeCanvas);
                      },
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: _showSmoeCanvas
                              ? const Color(0xFF10B981)
                              : (isDark ? const Color(0xFF18181B) : Colors.grey.shade100),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: _showSmoeCanvas
                                ? const Color(0xFF10B981)
                                : (isDark ? const Color(0xFF27272A) : Colors.grey.shade300),
                          ),
                        ),
                        child: Text(
                          '🌐 SYNOPTIC CANVAS',
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: _showSmoeCanvas ? Colors.black : const Color(0xFF34D399),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                // Actions
                Row(
                  children: [
                    if (_justGenerated && !_isLoading)
                      Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: Color(0xFF10B981),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'ANALYSIS COMPLETE',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1.5,
                              color: isDark
                                  ? const Color(0xFF34D399)
                                  : const Color(0xFF15803D),
                            ),
                          ),
                          const SizedBox(width: 16),
                        ],
                      ),
                    if (!_isLoading)
                      ElevatedButton.icon(
                        onPressed: hasIssues ? _triggerGenerate : null,
                        icon: Icon(
                          _justGenerated ? Icons.refresh : Icons.arrow_forward,
                          size: 16,
                        ),
                        label: Text(
                          _justGenerated
                              ? 'Refresh Analysis'
                              : 'Generate Patient Summary',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF059669),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 8),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          disabledBackgroundColor: isDark
                              ? Colors.grey.shade800
                              : Colors.grey.shade300,
                        ),
                      ),
                    if (_isLoading)
                      const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                  ],
                ),
              ],
            ),
          ),
          // ── Report area ──────────────────────────────
          Expanded(
            child: _showSmoeCanvas
                ? const SparseClinicalCanvasWidget()
                : _justGenerated
                ? const Center(
                    child: Text(
                      'Analysis report renders here.',
                      style: TextStyle(color: Colors.grey),
                    ),
                  )
                : Center(
                    child: Text(
                      hasIssues
                          ? 'Press "Generate Patient Summary" to begin.'
                          : 'Add patient symptoms first.',
                      style: TextStyle(
                        fontSize: 13,
                        color: isDark
                            ? Colors.grey.shade600
                            : Colors.grey.shade400,
                      ),
                    ),
                  ),
          ),
          // ── Metadata footer ──────────────────────────
          if (_justGenerated)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              decoration: BoxDecoration(
                border: Border(
                  top: BorderSide(
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.06)
                        : Colors.grey.shade200,
                  ),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _metaColumn(
                    'System Identification',
                    'Pocket Gull Analysis Engine v 0.1',
                    isDark,
                  ),
                  _metaColumn(
                    'Analysis Metadata',
                    'Generated: ${_lastRefreshTime?.toIso8601String().substring(0, 19) ?? '-'}',
                    isDark,
                  ),
                  _metaColumn(
                    'Regulatory Status',
                    'AI Generated. Physician Oversight Mandated.',
                    isDark,
                    align: CrossAxisAlignment.end,
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _metaColumn(String label, String value, bool isDark,
      {CrossAxisAlignment align = CrossAxisAlignment.start}) {
    return Column(
      crossAxisAlignment: align,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            letterSpacing: 2,
            color: isDark ? Colors.grey.shade400 : Colors.black,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w500,
            letterSpacing: 1.5,
            color: isDark ? Colors.grey.shade500 : Colors.grey.shade600,
          ),
        ),
      ],
    );
  }
}

class _PhilosophyPicker extends StatelessWidget {
  final MedicalPhilosophy active;
  final void Function(MedicalPhilosophy) onSelect;
  final bool isDark;

  const _PhilosophyPicker({
    required this.active,
    required this.onSelect,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: isDark
            ? Colors.white.withValues(alpha: 0.03)
            : Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark
              ? Colors.white.withValues(alpha: 0.06)
              : Colors.grey.shade200,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _pill('Western', MedicalPhilosophy.western, const Color(0xFF0EA5E9)),
          _pill('Eastern (TCM)', MedicalPhilosophy.eastern,
              const Color(0xFF10B981)),
          _pill(
              'Ayurvedic', MedicalPhilosophy.ayurvedic, const Color(0xFFF59E0B)),
        ],
      ),
    );
  }

  Widget _pill(String label, MedicalPhilosophy philosophy, Color accentColor) {
    final isActive = active == philosophy;
    return GestureDetector(
      onTap: () => onSelect(philosophy),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isActive
              ? (isDark ? const Color(0xFF27272A) : Colors.white)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          boxShadow: isActive
              ? [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 4,
                  )
                ]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(
                color: accentColor,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.5,
                color: isActive
                    ? (isDark ? accentColor : accentColor)
                    : (isDark ? Colors.grey.shade400 : Colors.grey.shade500),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
