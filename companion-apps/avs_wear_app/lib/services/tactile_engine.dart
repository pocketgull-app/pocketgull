import 'dart:async';
import 'package:flutter/services.dart';

enum HapticCadence {
  idle,
  delta,       // 1.5 Hz: Deep slow-wave sleep
  theta,       // 6 Hz: Hypnagogia, deep meditation
  alpha,       // 10 Hz (subharmonic 5 Hz): Calm focus, flow state
  beta,        // 16 Hz (subharmonic 4 Hz): Alertness, athletic activation
  vagalWave,   // 0.1 Hz: Mayer wave resonant coherence (6 bpm)
}

class TactileEngine {
  static final TactileEngine _instance = TactileEngine._internal();
  factory TactileEngine() => _instance;
  TactileEngine._internal();

  static const _channel = MethodChannel('app.pocketgull.avs/haptics');
  Timer? _rhythmTimer;
  HapticCadence _currentCadence = HapticCadence.idle;

  HapticCadence get currentCadence => _currentCadence;

  /// Start entrainment haptics for a specific frequency band
  void startCadence(HapticCadence cadence) {
    stop();
    _currentCadence = cadence;

    switch (cadence) {
      case HapticCadence.delta: // 1.5 Hz = 666ms cycle
        _rhythmTimer = Timer.periodic(const Duration(milliseconds: 666), (_) {
          playMicroClick(amplitude: 80, durationMs: 40);
        });
        break;

      case HapticCadence.theta: // 6 Hz = 166ms cycle (or subharmonic 3 Hz = 333ms)
        _rhythmTimer = Timer.periodic(const Duration(milliseconds: 333), (_) {
          playMicroClick(amplitude: 70, durationMs: 25);
        });
        break;

      case HapticCadence.alpha: // 10 Hz = subharmonic 5 Hz (200ms) to avoid wrist numbness
        _rhythmTimer = Timer.periodic(const Duration(milliseconds: 200), (_) {
          playMicroClick(amplitude: 95, durationMs: 18);
        });
        break;

      case HapticCadence.beta: // 16 Hz = subharmonic 4 Hz (250ms double-tap)
        _rhythmTimer = Timer.periodic(const Duration(milliseconds: 250), (_) {
          playMicroClick(amplitude: 140, durationMs: 15);
        });
        break;

      case HapticCadence.vagalWave: // 0.1 Hz Mayer wave (10s breath cycle)
        _runVagalSinusoidalPacing();
        break;

      case HapticCadence.idle:
        break;
    }
  }

  void _runVagalSinusoidalPacing() {
    // 4s Inhale ramp (4 pulses crescendo), 2s pause, 6s Exhale decrescendo (6 pulses)
    int second = 0;
    _rhythmTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      second = (second + 1) % 10;
      if (second <= 4) {
        // Inhale crescendo
        final amp = 40 + (second * 25);
        playMicroClick(amplitude: amp, durationMs: 30);
      } else if (second <= 6) {
        // Top of breath hold - tiny heartbeat notch
        playMicroClick(amplitude: 30, durationMs: 10);
      } else {
        // Exhale decrescendo
        final dec = 10 - second; // 3, 2, 1
        final amp = 30 + (dec * 20);
        playMicroClick(amplitude: amp, durationMs: 25);
      }
    });
  }

  Future<void> playMicroClick({int amplitude = 100, int durationMs = 20}) async {
    try {
      await _channel.invokeMethod('playMicroClick', {
        'amplitude': amplitude,
        'durationMs': durationMs,
      });
    } catch (_) {
      // Fallback for non-Android platforms / simulator
      HapticFeedback.lightImpact();
    }
  }

  void stop() {
    _rhythmTimer?.cancel();
    _rhythmTimer = null;
    _currentCadence = HapticCadence.idle;
    try {
      _channel.invokeMethod('stopHaptics');
    } catch (_) {}
  }
}
