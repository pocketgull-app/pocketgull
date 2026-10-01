import 'package:flutter/services.dart';
import '../models/triage_evaluation.dart';

class HapticFeedbackService {
  /// Emits tuned vibrational feedback based on patient ESI Acuity level.
  static Future<void> triggerEsiAcuityHaptic(EsiLevel level) async {
    switch (level) {
      case EsiLevel.esi1Stat:
        // STAT: Urgent triple heavy-pulse cadence
        await HapticFeedback.heavyImpact();
        await Future.delayed(const Duration(milliseconds: 100));
        await HapticFeedback.heavyImpact();
        await Future.delayed(const Duration(milliseconds: 100));
        await HapticFeedback.heavyImpact();
        break;

      case EsiLevel.esi2Emergent:
        // Emergent: Double medium impact
        await HapticFeedback.mediumImpact();
        await Future.delayed(const Duration(milliseconds: 120));
        await HapticFeedback.mediumImpact();
        break;

      case EsiLevel.esi3Urgent:
        // Urgent: Single light impact
        await HapticFeedback.lightImpact();
        break;

      case EsiLevel.esi4LessUrgent:
      case EsiLevel.esi5NonUrgent:
        // Routine: Gentle selection click
        await HapticFeedback.selectionClick();
        break;
    }
  }

  /// Feedback when toggling filter tabs or viewing modes
  static Future<void> triggerModeSelection() async {
    await HapticFeedback.selectionClick();
  }

  /// Feedback when admitting a patient to the SMoE Sparse Canvas
  static Future<void> triggerAdmissionHaptic() async {
    await HapticFeedback.mediumImpact();
    await Future.delayed(const Duration(milliseconds: 80));
    await HapticFeedback.lightImpact();
  }
}
