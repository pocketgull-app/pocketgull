/// Nanobot Swarm Biomechanics & Telescope-Inspired Physics Data Models.
///
/// Implements Low-Reynolds hydrodynamics, Kuramoto phase synchronization,
/// Roman coronagraphic speckle nulling, and durotactic strain tensors.
library;

enum SwarmOperationalMode {
  acousticDrill,
  coronagraphicTracking,
  durotacticHoming,
  sersAcidosis;

  String get label => switch (this) {
        SwarmOperationalMode.acousticDrill => 'Acoustic Drill',
        SwarmOperationalMode.coronagraphicTracking => 'Coronagraphic Nulling',
        SwarmOperationalMode.durotacticHoming => 'Durotactic Microlensing',
        SwarmOperationalMode.sersAcidosis => 'Warburg SERS Acidosis',
      };

  String get icon => switch (this) {
        SwarmOperationalMode.acousticDrill => '🌀',
        SwarmOperationalMode.coronagraphicTracking => '🔭',
        SwarmOperationalMode.durotacticHoming => '📐',
        SwarmOperationalMode.sersAcidosis => '🩸',
      };
}

class AcousticSteeringVector {
  final double pitchDeg;
  final double yawDeg;
  final double driveFrequencyKhz;
  final double acousticPressureMpa;

  const AcousticSteeringVector({
    this.pitchDeg = 15.0,
    this.yawDeg = 45.0,
    this.driveFrequencyKhz = 250.0,
    this.acousticPressureMpa = 1.2,
  });

  AcousticSteeringVector copyWith({
    double? pitchDeg,
    double? yawDeg,
    double? driveFrequencyKhz,
    double? acousticPressureMpa,
  }) {
    return AcousticSteeringVector(
      pitchDeg: pitchDeg ?? this.pitchDeg,
      yawDeg: yawDeg ?? this.yawDeg,
      driveFrequencyKhz: driveFrequencyKhz ?? this.driveFrequencyKhz,
      acousticPressureMpa: acousticPressureMpa ?? this.acousticPressureMpa,
    );
  }

  Map<String, dynamic> toJson() => {
        'pitchDeg': pitchDeg,
        'yawDeg': yawDeg,
        'driveFrequencyKhz': driveFrequencyKhz,
        'acousticPressureMpa': acousticPressureMpa,
      };

  factory AcousticSteeringVector.fromJson(Map<String, dynamic> json) =>
      AcousticSteeringVector(
        pitchDeg: (json['pitchDeg'] as num?)?.toDouble() ?? 15.0,
        yawDeg: (json['yawDeg'] as num?)?.toDouble() ?? 45.0,
        driveFrequencyKhz:
            (json['driveFrequencyKhz'] as num?)?.toDouble() ?? 250.0,
        acousticPressureMpa:
            (json['acousticPressureMpa'] as num?)?.toDouble() ?? 1.2,
      );
}

class NanobotTargetSite {
  final String name;
  final double x;
  final double y;
  final double z;
  final double radius;
  final String targetType;
  final double stiffnessKpa;
  final double ambientPh;

  const NanobotTargetSite({
    required this.name,
    required this.x,
    required this.y,
    required this.z,
    required this.radius,
    required this.targetType,
    required this.stiffnessKpa,
    required this.ambientPh,
  });

  Map<String, dynamic> toJson() => {
        'name': name,
        'x': x,
        'y': y,
        'z': z,
        'radius': radius,
        'targetType': targetType,
        'stiffnessKpa': stiffnessKpa,
        'ambientPh': ambientPh,
      };

  factory NanobotTargetSite.fromJson(Map<String, dynamic> json) =>
      NanobotTargetSite(
        name: json['name'] as String? ?? 'Microvascular Target',
        x: (json['x'] as num?)?.toDouble() ?? 4.5,
        y: (json['y'] as num?)?.toDouble() ?? 0.8,
        z: (json['z'] as num?)?.toDouble() ?? -1.2,
        radius: (json['radius'] as num?)?.toDouble() ?? 1.5,
        targetType: json['targetType'] as String? ?? 'THROMBOSIS',
        stiffnessKpa: (json['stiffnessKpa'] as num?)?.toDouble() ?? 35.0,
        ambientPh: (json['ambientPh'] as num?)?.toDouble() ?? 6.4,
      );
}

class NanobotSwarmTelemetry {
  final int agentCount;
  final double kuramotoCoherence; // 0.0 to 1.0
  final double collectiveThrustNn;
  final double coronagraphicSnrGainDb;
  final double targetCaptureRatePercent;
  final double tissueDepthMm;
  final int unlockedBotCount;
  final SwarmOperationalMode mode;
  final AcousticSteeringVector steering;
  final NanobotTargetSite target;

  const NanobotSwarmTelemetry({
    this.agentCount = 350,
    this.kuramotoCoherence = 0.84,
    this.collectiveThrustNn = 142.5,
    this.coronagraphicSnrGainDb = 38.2,
    this.targetCaptureRatePercent = 89.5,
    this.tissueDepthMm = 38.0,
    this.unlockedBotCount = 0,
    this.mode = SwarmOperationalMode.acousticDrill,
    this.steering = const AcousticSteeringVector(),
    this.target = const NanobotTargetSite(
      name: 'Microvascular Thrombus',
      x: 4.5,
      y: 0.8,
      z: -1.2,
      radius: 1.5,
      targetType: 'THROMBOSIS',
      stiffnessKpa: 35.0,
      ambientPh: 6.4,
    ),
  });

  NanobotSwarmTelemetry copyWith({
    int? agentCount,
    double? kuramotoCoherence,
    double? collectiveThrustNn,
    double? coronagraphicSnrGainDb,
    double? targetCaptureRatePercent,
    double? tissueDepthMm,
    int? unlockedBotCount,
    SwarmOperationalMode? mode,
    AcousticSteeringVector? steering,
    NanobotTargetSite? target,
  }) {
    return NanobotSwarmTelemetry(
      agentCount: agentCount ?? this.agentCount,
      kuramotoCoherence: kuramotoCoherence ?? this.kuramotoCoherence,
      collectiveThrustNn: collectiveThrustNn ?? this.collectiveThrustNn,
      coronagraphicSnrGainDb:
          coronagraphicSnrGainDb ?? this.coronagraphicSnrGainDb,
      targetCaptureRatePercent:
          targetCaptureRatePercent ?? this.targetCaptureRatePercent,
      tissueDepthMm: tissueDepthMm ?? this.tissueDepthMm,
      unlockedBotCount: unlockedBotCount ?? this.unlockedBotCount,
      mode: mode ?? this.mode,
      steering: steering ?? this.steering,
      target: target ?? this.target,
    );
  }

  Map<String, dynamic> toJson() => {
        'agentCount': agentCount,
        'kuramotoCoherence': kuramotoCoherence,
        'collectiveThrustNn': collectiveThrustNn,
        'coronagraphicSnrGainDb': coronagraphicSnrGainDb,
        'targetCaptureRatePercent': targetCaptureRatePercent,
        'tissueDepthMm': tissueDepthMm,
        'unlockedBotCount': unlockedBotCount,
        'mode': mode.name,
        'steering': steering.toJson(),
        'target': target.toJson(),
      };
}
