// SPDX-License-Identifier: Apache-2.0
import 'dart:math' as math;
import 'package:equatable/equatable.dart';
import 'ble_wearables_service.dart';
import 'health_connect_bridge_service.dart';

enum ShiftRiskBand { green, amber, red }

enum ShiftPacingAction { optimal, pace, protect }

/// De-identified, zero-PHI physiological capacity summary for external
/// pacing tools (Flex Shift Guard, Quantum Debt Clock, philgear.dev).
class CapacitySignal extends Equatable {
  final int autonomicCoherence;
  final int sleepDebtMinutes;
  final ShiftRiskBand shiftRiskBand;
  final ShiftPacingAction pacingAction;
  final int recommendedMaxFocusMinutes;
  final double biologicalInterestRate;
  final double recoveryBufferHours;
  final DateTime generatedAt;
  final bool isSimulated;

  const CapacitySignal({
    required this.autonomicCoherence,
    required this.sleepDebtMinutes,
    required this.shiftRiskBand,
    required this.pacingAction,
    required this.recommendedMaxFocusMinutes,
    required this.biologicalInterestRate,
    required this.recoveryBufferHours,
    required this.generatedAt,
    this.isSimulated = false,
  });

  /// Strictly zero-PHI JSON contract (`pocketgull.capacity.v1`).
  Map<String, dynamic> toJson() => {
        'schema': 'pocketgull.capacity.v1',
        'autonomicCoherence': autonomicCoherence,
        'sleepDebtMinutes': sleepDebtMinutes,
        'shiftRiskBand': shiftRiskBand.name,
        'pacingAction': pacingAction.name,
        'recommendedMaxFocusMinutes': recommendedMaxFocusMinutes,
        'biologicalInterestRate': biologicalInterestRate,
        'recoveryBufferHours': recoveryBufferHours,
        'generatedAt': generatedAt.toUtc().toIso8601String(),
        'isSimulated': isSimulated,
      };

  @override
  List<Object?> get props => [
        autonomicCoherence,
        sleepDebtMinutes,
        shiftRiskBand,
        pacingAction,
        recommendedMaxFocusMinutes,
        biologicalInterestRate,
        recoveryBufferHours,
        generatedAt,
        isSimulated,
      ];
}

/// Computes a protective, non-punitive [CapacitySignal] from Health Connect
/// and BLE wearable telemetry without exposing raw PHI.
class CapacitySignalService {
  static const int targetSleepMinutes = 480;

  CapacitySignal compute({
    HealthConnectBiometrics? biometrics,
    BleWearablesService? bleService,
    DateTime? now,
  }) {
    final timestamp = now ?? DateTime.now();
    final isBleConnected =
        bleService != null && bleService.state == BleConnectionState.connected;

    final int coherence;
    if (isBleConnected) {
      coherence = bleService.autonomicCoherenceScore;
    } else if (biometrics != null) {
      final rmssd = biometrics.heartRateVariabilityRmssdMs;
      final hr = biometrics.restingHeartRateBpm;
      final raw =
          (rmssd / 60.0) * 50.0 + (1.0 - (math.max(0.0, hr - 60.0) / 60.0)) * 50.0;
      coherence = raw.clamp(0.0, 100.0).round();
    } else {
      coherence = 75;
    }

    final sleepMinutes = biometrics?.sleepDurationMinutes ?? targetSleepMinutes;
    final sleepDebt = math.max(0, targetSleepMinutes - sleepMinutes);

    final ShiftRiskBand band;
    if (sleepDebt >= 150 || coherence < 45) {
      band = ShiftRiskBand.red;
    } else if (sleepDebt >= 60 || coherence < 70) {
      band = ShiftRiskBand.amber;
    } else {
      band = ShiftRiskBand.green;
    }

    final (pacing, maxFocusMin, bioInterest, recoveryHrs) = switch (band) {
      ShiftRiskBand.green => (ShiftPacingAction.optimal, 90, 0.0, 0.5),
      ShiftRiskBand.amber => (ShiftPacingAction.pace, 45, 1.25, 1.5),
      ShiftRiskBand.red => (ShiftPacingAction.protect, 25, 2.5, 3.0),
    };

    final simulated = (biometrics?.isSimulated ?? true) &&
        (!isBleConnected || (bleService.isSimulationActive));

    return CapacitySignal(
      autonomicCoherence: coherence,
      sleepDebtMinutes: sleepDebt,
      shiftRiskBand: band,
      pacingAction: pacing,
      recommendedMaxFocusMinutes: maxFocusMin,
      biologicalInterestRate: bioInterest,
      recoveryBufferHours: recoveryHrs,
      generatedAt: timestamp,
      isSimulated: simulated,
    );
  }
}
