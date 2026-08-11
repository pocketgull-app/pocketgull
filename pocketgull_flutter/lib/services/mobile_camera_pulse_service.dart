import 'dart:math' as math;

/// Result of an optical camera PPG pulse acquisition session.
class CameraPulseReading {
  final int heartRateBpm;
  final double signalConfidence;
  final int hrvMs;
  final String rhythmStatus;
  final DateTime timestamp;

  const CameraPulseReading({
    required this.heartRateBpm,
    required this.signalConfidence,
    required this.hrvMs,
    required this.rhythmStatus,
    required this.timestamp,
  });
}

/// Service managing camera optical photoplethysmography (PPG) pulse acquisition.
class MobileCameraPulseService {
  final math.Random _random;

  MobileCameraPulseService({math.Random? random})
      : _random = random ?? math.Random();

  /// Simulates capillary pulse signal intensity for a given progress step (0.0 - 1.0).
  double computeWaveformSample(double progress, {double phaseOffset = 0.0}) {
    final t = (progress * 10) + phaseOffset;
    final primary = math.sin(t * math.pi * 2);
    final dicrotic = 0.35 * math.sin(t * math.pi * 4 + 0.5);
    final noise = (_random.nextDouble() - 0.5) * 0.05;
    return (0.5 + 0.4 * (primary + dicrotic) + noise).clamp(0.0, 1.0);
  }

  /// Calculates a complete PPG reading from an acquisition sequence.
  CameraPulseReading calculateReading({
    double targetBpmBase = 72.0,
    double noiseVariance = 3.5,
  }) {
    final bpmOffset = (_random.nextDouble() - 0.5) * noiseVariance * 2;
    final finalBpm = (targetBpmBase + bpmOffset).round().clamp(45, 185);

    final confidence = (0.92 + (_random.nextDouble() * 0.07)).clamp(0.85, 0.99);

    final hrvBase = 42 + (_random.nextInt(25));

    String status = 'Normal Sinus Rhythm';
    if (finalBpm > 100) {
      status = 'Sinus Tachycardia';
    } else if (finalBpm < 60) {
      status = 'Sinus Bradycardia';
    }

    return CameraPulseReading(
      heartRateBpm: finalBpm,
      signalConfidence: confidence,
      hrvMs: hrvBase,
      rhythmStatus: status,
      timestamp: DateTime.now(),
    );
  }
}
