import 'package:flutter/material.dart';
import '../../../core/models/triage_evaluation.dart';
import '../../../core/services/haptic_feedback_service.dart';
import '../../../core/services/triage_cache_service.dart';

class SmoeCanvasScreen extends StatelessWidget {
  final PatientTriageEvaluation evaluation;

  const SmoeCanvasScreen({
    super.key,
    required this.evaluation,
  });

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF09090B) : const Color(0xFFF9FAFB);
    final surfaceColor = isDark ? const Color(0xFF18181B) : Colors.white;
    final borderColor = isDark ? const Color(0xFF27272A) : const Color(0xFFE4E4E7);
    final textColor = isDark ? const Color(0xFFFAFAFA) : const Color(0xFF1C1C1C);
    final subColor = isDark ? const Color(0xFFA1A1AA) : const Color(0xFF71717A);

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: Column(
          children: [
            const Text(
              'SPARSE MIXTURE OF EXPERTS',
              style: TextStyle(letterSpacing: 1.5, fontSize: 13, fontWeight: FontWeight.w900),
            ),
            Text(
              'Bedside Clinical Intelligence • Top-2 Gated Active',
              style: TextStyle(fontSize: 10, color: subColor),
            ),
          ],
        ),
        centerTitle: true,
        backgroundColor: surfaceColor,
        elevation: 0,
        iconTheme: IconThemeData(color: textColor),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            tooltip: 'Export FHIR R4 Bundle',
            onPressed: () {
              HapticFeedbackService.triggerModeSelection();
              final fhirJson = TriageCacheService.exportToFhirR4Bundle();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  backgroundColor: const Color(0xFF0D9488),
                  content: Text(
                    'Exported FHIR R4 Bundle for ${evaluation.patientName} (${fhirJson.length} bytes)',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              );
            },
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Patient Header Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: surfaceColor,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: borderColor),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.4 : 0.05),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              evaluation.patientName,
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: textColor,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'ID: ${evaluation.patientId} • ${evaluation.age}y • ${evaluation.gender}',
                              style: TextStyle(fontSize: 12, color: subColor, fontFamily: 'monospace'),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: _getEsiBadgeColor(evaluation.esiLevel, isDark),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              evaluation.esiLabel,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w900,
                                color: _getEsiTextColor(evaluation.esiLevel),
                              ),
                            ),
                            Text(
                              'NEWS2: ${evaluation.news2Score}',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: _getEsiTextColor(evaluation.esiLevel).withValues(alpha: 0.8),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  // Accompanied Status Ribbon
                  if (evaluation.accompaniedBy != null) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFA855F7).withValues(alpha: isDark ? 0.2 : 0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFA855F7).withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        children: [
                          const Text('👤', style: TextStyle(fontSize: 14)),
                          const SizedBox(width: 6),
                          const Text(
                            'With Patient: ',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFA855F7)),
                          ),
                          Expanded(
                            child: Text(
                              evaluation.accompaniedBy!.label,
                              style: TextStyle(fontSize: 11, color: textColor),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  // Language Access / Certified Interpreter Ribbon
                  if (evaluation.languageAccess != null) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: evaluation.languageAccess!.interpreterNeeded
                            ? const Color(0xFFF59E0B).withValues(alpha: isDark ? 0.2 : 0.1)
                            : (isDark ? const Color(0xFF27272A) : const Color(0xFFF4F4F5)),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: evaluation.languageAccess!.interpreterNeeded
                              ? const Color(0xFFF59E0B).withValues(alpha: 0.5)
                              : borderColor,
                        ),
                      ),
                      child: Row(
                        children: [
                          Text(evaluation.languageAccess!.interpreterNeeded ? '🗣️' : '🌐', style: const TextStyle(fontSize: 14)),
                          const SizedBox(width: 6),
                          if (evaluation.languageAccess!.interpreterNeeded)
                            const Text(
                              'Interpreter Required: ',
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFFD97706)),
                            ),
                          Expanded(
                            child: Text(
                              '${evaluation.languageAccess!.preferredLanguage} (${evaluation.languageAccess!.modality})',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: evaluation.languageAccess!.interpreterNeeded ? FontWeight.bold : FontWeight.normal,
                                color: textColor,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  // Physiological Vitals Strip
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF121214) : const Color(0xFFF4F4F5),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: borderColor),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _vitalItem('BP', evaluation.vitalsSummary.bp, textColor, subColor),
                        _vitalItem('HR', '${evaluation.vitalsSummary.hr} bpm', textColor, subColor),
                        _vitalItem(
                          'SpO2',
                          '${evaluation.vitalsSummary.spO2}%',
                          int.tryParse(evaluation.vitalsSummary.spO2) != null && int.parse(evaluation.vitalsSummary.spO2) <= 92
                              ? Colors.red
                              : const Color(0xFF10B981),
                          subColor,
                        ),
                        _vitalItem('Temp', '${evaluation.vitalsSummary.temp}°C', textColor, subColor),
                      ],
                    ),
                  ),

                  // Critical Outlier Pills
                  if (evaluation.vitalsSummary.hasCriticalOutlier) ...[
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      children: evaluation.vitalsSummary.criticalOutliers.map((outlier) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.red.withValues(alpha: isDark ? 0.2 : 0.1),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: Colors.red.withValues(alpha: 0.4)),
                          ),
                          child: Text(
                            '⚠️ $outlier',
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.redAccent),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Pre-Gated SMoE Expert Slots Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '⚡ PRE-GATED SMoE EXPERTS',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.2,
                    color: subColor,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0D9488).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'Softmax Top-2',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF0D9488)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Expert Slots List
            ...evaluation.predictedTopExperts.asMap().entries.map((entry) {
              final idx = entry.key;
              final slot = entry.value;
              final isPrimary = idx == 0;
              final slotColor = isPrimary ? const Color(0xFF0D9488) : const Color(0xFF6366F1);

              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: surfaceColor,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: slotColor.withValues(alpha: isPrimary ? 0.6 : 0.3)),
                  boxShadow: [
                    BoxShadow(
                      color: slotColor.withValues(alpha: 0.08),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: slotColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      alignment: Alignment.center,
                      child: Text(slot.icon, style: const TextStyle(fontSize: 22)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                isPrimary ? 'PRIMARY EXPERT SLOT' : 'SECONDARY EXPERT SLOT',
                                style: TextStyle(
                                  fontSize: 9.5,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 1,
                                  color: slotColor,
                                ),
                              ),
                              const Spacer(),
                              Text(
                                '${slot.probabilityPercent}% Confidence',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: slotColor,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            slot.name,
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: textColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            }),

            // Synapse Cross-Attention Bridge Card (if present)
            if (evaluation.crossAttentionSynapse != null) ...[
              Container(
                margin: const EdgeInsets.only(top: 4, bottom: 16),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF59E0B).withValues(alpha: isDark ? 0.15 : 0.08),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.4)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('⚡', style: TextStyle(fontSize: 18)),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Active Synapse: ${evaluation.crossAttentionSynapse!.title}',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFFD97706),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            evaluation.crossAttentionSynapse!.description,
                            style: TextStyle(fontSize: 11, color: textColor),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 12),

            // Bedside Quick Actions
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      HapticFeedbackService.triggerAdmissionHaptic();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Starting Live Gemini Bedside Consult...'),
                          duration: Duration(seconds: 2),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0D9488),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    icon: const Text('🎙️'),
                    label: const Text('Live Audio Consult', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 10),
                ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: surfaceColor,
                    foregroundColor: textColor,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: BorderSide(color: borderColor),
                    ),
                  ),
                  child: const Text('Back to Triage'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _vitalItem(String label, String value, Color valueColor, Color labelColor) {
    return Column(
      children: [
        Text(label, style: TextStyle(fontSize: 10, color: labelColor, fontFamily: 'monospace')),
        const SizedBox(height: 2),
        Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: valueColor, fontFamily: 'monospace')),
      ],
    );
  }

  Color _getEsiBadgeColor(EsiLevel level, bool isDark) {
    switch (level) {
      case EsiLevel.esi1Stat:
        return Colors.red.withValues(alpha: isDark ? 0.3 : 0.15);
      case EsiLevel.esi2Emergent:
        return Colors.orange.withValues(alpha: isDark ? 0.3 : 0.15);
      case EsiLevel.esi3Urgent:
        return Colors.amber.withValues(alpha: isDark ? 0.3 : 0.15);
      case EsiLevel.esi4LessUrgent:
        return Colors.green.withValues(alpha: isDark ? 0.3 : 0.15);
      case EsiLevel.esi5NonUrgent:
        return Colors.grey.withValues(alpha: isDark ? 0.3 : 0.15);
    }
  }

  Color _getEsiTextColor(EsiLevel level) {
    switch (level) {
      case EsiLevel.esi1Stat:
        return Colors.redAccent;
      case EsiLevel.esi2Emergent:
        return Colors.deepOrangeAccent;
      case EsiLevel.esi3Urgent:
        return Colors.amber[800]!;
      case EsiLevel.esi4LessUrgent:
        return Colors.green[700]!;
      case EsiLevel.esi5NonUrgent:
        return Colors.grey[700]!;
    }
  }
}
