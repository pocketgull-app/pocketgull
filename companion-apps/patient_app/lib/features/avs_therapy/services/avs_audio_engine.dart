import 'package:flutter/services.dart';

/// Low-latency real-time Audio Synthesis engine for PocketGull AVS Studio
class AvsAudioEngine {
  static const MethodChannel _channel = MethodChannel('com.pocketgull.patient_app/avs_audio');

  static bool _isPlaying = false;
  static bool get isPlaying => _isPlaying;

  /// Start stereo binaural or open-air isochronic sound synthesis
  static Future<void> start({
    required double carrierHz,
    required double beatHz,
    required bool isIsochronic,
    double volume = 0.65,
  }) async {
    try {
      await _channel.invokeMethod('start', {
        'carrierHz': carrierHz,
        'beatHz': beatHz,
        'isIsochronic': isIsochronic,
        'volume': volume,
      });
      _isPlaying = true;
    } catch (e) {
      // Graceful fallback if platform channel unavailable
    }
  }

  /// Update frequency or isochronic mode smoothly in real-time
  static Future<void> update({
    required double carrierHz,
    required double beatHz,
    required bool isIsochronic,
  }) async {
    if (!_isPlaying) return;
    try {
      await _channel.invokeMethod('update', {
        'carrierHz': carrierHz,
        'beatHz': beatHz,
        'isIsochronic': isIsochronic,
      });
    } catch (e) {
      // Graceful fallback
    }
  }

  /// Adjust master volume (0.0 to 1.0)
  static Future<void> setVolume(double volume) async {
    try {
      await _channel.invokeMethod('setVolume', {
        'volume': volume.clamp(0.0, 1.0),
      });
    } catch (e) {
      // Graceful fallback
    }
  }

  /// Stop audio playback
  static Future<void> stop() async {
    try {
      await _channel.invokeMethod('stop');
      _isPlaying = false;
    } catch (e) {
      // Graceful fallback
    }
  }
}
