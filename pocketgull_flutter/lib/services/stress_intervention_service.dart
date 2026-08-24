/// Stress Intervention Service — automatic stress detection and AVS trigger.
///
/// Flutter parity with Angular `stress-intervention.service.ts` (52 lines).
/// Monitors patient vitals and triggers an emergency calming protocol
/// when high-stress heuristics are detected (HR > 100 or SBP > 140).
library;

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/patient_provider.dart';

class StressInterventionState {
  final bool isTriggered;
  final bool isAvsSessionActive;
  final String? brainwaveFrequency;
  final double? breathingRate;
  final int carrierFreqHz;
  final bool isIsochronicPulseEnabled;
  final bool isHapticsEnabled;

  const StressInterventionState({
    this.isTriggered = false,
    this.isAvsSessionActive = false,
    this.brainwaveFrequency,
    this.breathingRate,
    this.carrierFreqHz = 528,
    this.isIsochronicPulseEnabled = true,
    this.isHapticsEnabled = true,
  });

  StressInterventionState copyWith({
    bool? isTriggered,
    bool? isAvsSessionActive,
    String? brainwaveFrequency,
    double? breathingRate,
    int? carrierFreqHz,
    bool? isIsochronicPulseEnabled,
    bool? isHapticsEnabled,
  }) =>
      StressInterventionState(
        isTriggered: isTriggered ?? this.isTriggered,
        isAvsSessionActive: isAvsSessionActive ?? this.isAvsSessionActive,
        brainwaveFrequency: brainwaveFrequency ?? this.brainwaveFrequency,
        breathingRate: breathingRate ?? this.breathingRate,
        carrierFreqHz: carrierFreqHz ?? this.carrierFreqHz,
        isIsochronicPulseEnabled: isIsochronicPulseEnabled ?? this.isIsochronicPulseEnabled,
        isHapticsEnabled: isHapticsEnabled ?? this.isHapticsEnabled,
      );
}

class StressInterventionNotifier extends Notifier<StressInterventionState> {
  @override
  StressInterventionState build() {
    // Monitor vitals for high-stress heuristic.
    ref.listen(patientProvider, (prev, next) {
      final vitals = next.vitals;

      final hr = int.tryParse(vitals.hr) ?? 0;
      final sysParts = vitals.bp.split('/');
      final systolic = sysParts.isNotEmpty ? (int.tryParse(sysParts[0]) ?? 0) : 0;
      final isHighStress = hr > 100 || systolic > 140;

      if (isHighStress && !state.isTriggered) {
        _triggerStressProtocol();
      } else if (!isHighStress && state.isTriggered) {
        state = const StressInterventionState();
      }
    });
    return const StressInterventionState();
  }

  void _triggerStressProtocol() {
    state = state.copyWith(
      isTriggered: true,
      isAvsSessionActive: true,
      brainwaveFrequency: 'delta', // 432Hz carrier for calming
      breathingRate: 4.0, // 4.0 BPM = 15s cycle box breathing
    );
  }

  void dismiss() {
    state = const StressInterventionState();
  }
}

final stressInterventionProvider =
    NotifierProvider<StressInterventionNotifier, StressInterventionState>(() {
  return StressInterventionNotifier();
});
