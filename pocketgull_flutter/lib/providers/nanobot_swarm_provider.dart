import 'dart:math' as math;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/nanobot_swarm_model.dart';

class NanobotSwarmNotifier extends Notifier<NanobotSwarmTelemetry> {
  @override
  NanobotSwarmTelemetry build() {
    return const NanobotSwarmTelemetry();
  }

  /// Purcell Scallop Theorem non-reciprocal corkscrew velocity (um/s)
  double computePurcellVelocity({
    required double omegaRadS,
    double helixAngleRad = math.pi / 4,
    double viscosityPaS = 0.0015,
  }) {
    if (omegaRadS == 0) return 0.0;
    const botLengthUm = 1.2;
    const botRadiusUm = 0.35;
    const helixPitchUm = 0.8;

    final xiParallel =
        (2.0 * math.pi * viscosityPaS) / math.log(botLengthUm / botRadiusUm);
    final xiPerp = 2.0 * xiParallel;
    final deltaXi = xiPerp - xiParallel;

    final num = deltaXi * omegaRadS * math.sin(2.0 * helixAngleRad);
    final den = 2.0 *
        (xiParallel * math.pow(math.cos(helixAngleRad), 2) +
            xiPerp * math.pow(math.sin(helixAngleRad), 2));

    return den != 0 ? (num / den) * helixPitchUm : 0.0;
  }

  /// Coronagraphic speckle nulling SNR gain (dB)
  double computeCoronagraphicGain({
    required double depthMm,
    required double nullingEfficiencyPercent,
  }) {
    final rawEff =
        (nullingEfficiencyPercent / 100.0).clamp(0.0, 0.9999);
    const muExt = 0.12;
    final attenuationDb = 4.343 * muExt * depthMm;
    final suppressionGainDb =
        10.0 * (math.log(1.0 / (1.0 - rawEff + 1e-6)) / math.ln10);

    return math.max(0.0, suppressionGainDb - (attenuationDb * 0.25));
  }

  void setOperationalMode(SwarmOperationalMode mode) {
    // Dynamic recalculation based on telescope-physics operational mode
    double coherence = state.kuramotoCoherence;
    double snrGain = state.coronagraphicSnrGainDb;
    double thrust = state.collectiveThrustNn;

    switch (mode) {
      case SwarmOperationalMode.acousticDrill:
        coherence = 0.92;
        snrGain = 24.5;
        thrust = 185.0;
        break;
      case SwarmOperationalMode.coronagraphicTracking:
        coherence = 0.81;
        snrGain = computeCoronagraphicGain(
            depthMm: state.tissueDepthMm, nullingEfficiencyPercent: 99.85);
        thrust = 95.0;
        break;
      case SwarmOperationalMode.durotacticHoming:
        coherence = 0.76;
        snrGain = 28.0;
        thrust = 120.0;
        break;
      case SwarmOperationalMode.sersAcidosis:
        coherence = 0.68;
        snrGain = 32.0;
        thrust = 80.0;
        break;
    }

    state = state.copyWith(
      mode: mode,
      kuramotoCoherence: double.parse(coherence.toStringAsFixed(2)),
      coronagraphicSnrGainDb: double.parse(snrGain.toStringAsFixed(1)),
      collectiveThrustNn: double.parse(thrust.toStringAsFixed(1)),
    );
  }

  void updateSteering({
    double? pitchDeg,
    double? yawDeg,
    double? pressureMpa,
  }) {
    final updated = state.steering.copyWith(
      pitchDeg: pitchDeg,
      yawDeg: yawDeg,
      acousticPressureMpa: pressureMpa,
    );

    // Thrust scales with acoustic drive pressure
    final newThrust = 120.0 * (updated.acousticPressureMpa / 1.0) * state.kuramotoCoherence;

    state = state.copyWith(
      steering: updated,
      collectiveThrustNn: double.parse(newThrust.toStringAsFixed(1)),
    );
  }

  void setTissueDepth(double depthMm) {
    final newGain = computeCoronagraphicGain(
      depthMm: depthMm,
      nullingEfficiencyPercent:
          state.mode == SwarmOperationalMode.coronagraphicTracking ? 99.85 : 60.0,
    );
    state = state.copyWith(
      tissueDepthMm: depthMm,
      coronagraphicSnrGainDb: double.parse(newGain.toStringAsFixed(1)),
    );
  }
}

final nanobotSwarmProvider =
    NotifierProvider<NanobotSwarmNotifier, NanobotSwarmTelemetry>(() {
  return NanobotSwarmNotifier();
});
