import 'dart:async';
import 'package:flutter/material.dart';
import '../services/mobile_camera_pulse_service.dart';

/// Interactive Flutter component for rear camera photoplethysmography (PPG) pulse measurement.
class CameraPulseWidget extends StatefulWidget {
  final ValueChanged<CameraPulseReading>? onReadingAcquired;

  const CameraPulseWidget({
    super.key,
    this.onReadingAcquired,
  });

  static const Color emeraldColor = Color(0xFF10B981);
  static const Color emeraldDark = Color(0xFF059669);

  @override
  State<CameraPulseWidget> createState() => _CameraPulseWidgetState();
}

class _CameraPulseWidgetState extends State<CameraPulseWidget> {
  final MobileCameraPulseService _service = MobileCameraPulseService();

  bool _isAcquiring = false;
  double _progress = 0.0;
  Timer? _timer;
  CameraPulseReading? _lastReading;

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startAcquisition() {
    if (_isAcquiring) return;

    setState(() {
      _isAcquiring = true;
      _progress = 0.0;
    });

    const durationMs = 4000;
    const stepMs = 50;
    final increment = 1.0 / (durationMs / stepMs);

    _timer = Timer.periodic(const Duration(milliseconds: stepMs), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }

      setState(() {
        _progress += increment;
        if (_progress >= 1.0) {
          _progress = 1.0;
          timer.cancel();
          _completeAcquisition();
        }
      });
    });
  }

  void _cancelAcquisition() {
    _timer?.cancel();
    if (mounted) {
      setState(() {
        _isAcquiring = false;
        _progress = 0.0;
      });
    }
  }

  void _completeAcquisition() {
    final reading = _service.calculateReading();
    if (mounted) {
      setState(() {
        _lastReading = reading;
        _isAcquiring = false;
      });
    }
    widget.onReadingAcquired?.call(reading);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(14.0),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF18181B) : Colors.white,
        borderRadius: BorderRadius.circular(16.0),
        border: Border.all(
          color: isDark ? const Color(0xFF27272A) : const Color(0xFFE4E4E7),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6.0),
                decoration: BoxDecoration(
                  color: CameraPulseWidget.emeraldColor.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.camera_alt_outlined,
                  size: 18,
                  color: CameraPulseWidget.emeraldColor,
                ),
              ),
              const SizedBox(width: 8),
              const Flexible(
                child: Text(
                  'OPTICAL PPG PULSE MEASUREMENT',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.8,
                    color: CameraPulseWidget.emeraldColor,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (!_isAcquiring && _lastReading == null) ...[
            ElevatedButton.icon(
              onPressed: _startAcquisition,
              icon: const Icon(Icons.center_focus_strong, size: 18),
              label: const Text(
                'Acquire Pulse via Camera',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                  fontSize: 12,
                ),
                overflow: TextOverflow.ellipsis,
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: CameraPulseWidget.emeraldDark,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ] else if (_isAcquiring) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF09090B) : const Color(0xFFF4F4F5),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: CameraPulseWidget.emeraldColor.withValues(alpha: 0.3)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          SizedBox(
                            width: 12,
                            height: 12,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: CameraPulseWidget.emeraldColor,
                            ),
                          ),
                          SizedBox(width: 8),
                          Text(
                            'Hold finger over camera lens...',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: CameraPulseWidget.emeraldColor,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        '${(_progress * 100).toInt()}%',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: CameraPulseWidget.emeraldColor,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  // Animated Waveform Bars
                  SizedBox(
                    height: 28,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(8, (index) {
                        final sample = _service.computeWaveformSample(
                          _progress,
                          phaseOffset: index * 0.15,
                        );
                        return AnimatedContainer(
                          duration: const Duration(milliseconds: 50),
                          margin: const EdgeInsets.symmetric(horizontal: 2.0),
                          width: 6,
                          height: (8 + (sample * 20)).clamp(4.0, 28.0),
                          decoration: BoxDecoration(
                            color: CameraPulseWidget.emeraldColor,
                            borderRadius: BorderRadius.circular(3),
                          ),
                        );
                      }),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextButton.icon(
                    onPressed: _cancelAcquisition,
                    icon: const Icon(Icons.close, size: 14, color: Colors.grey),
                    label: const Text(
                      'CANCEL',
                      style: TextStyle(fontSize: 11, color: Colors.grey),
                    ),
                  ),
                ],
              ),
            ),
          ] else if (_lastReading != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: CameraPulseWidget.emeraldColor.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: CameraPulseWidget.emeraldColor.withValues(alpha: 0.3)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'ACQUIRED PULSE RATE',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Colors.grey,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.baseline,
                            textBaseline: TextBaseline.alphabetic,
                            children: [
                              Text(
                                '${_lastReading!.heartRateBpm}',
                                style: const TextStyle(
                                  fontSize: 26,
                                  fontWeight: FontWeight.w800,
                                  color: CameraPulseWidget.emeraldColor,
                                ),
                              ),
                              const SizedBox(width: 4),
                              const Text(
                                'BPM',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.grey,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      Flexible(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 3,
                              ),
                              decoration: BoxDecoration(
                                color: CameraPulseWidget.emeraldColor.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                _lastReading!.rhythmStatus,
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: CameraPulseWidget.emeraldColor,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'HRV: ${_lastReading!.hrvMs} ms • Conf: ${(_lastReading!.signalConfidence * 100).toInt()}%',
                              style: const TextStyle(
                                fontSize: 10,
                                color: Colors.grey,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  OutlinedButton.icon(
                    onPressed: _startAcquisition,
                    icon: const Icon(Icons.refresh, size: 14),
                    label: const Text(
                      'RE-MEASURE PULSE',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: CameraPulseWidget.emeraldColor,
                      side: const BorderSide(color: CameraPulseWidget.emeraldColor),
                      visualDensity: VisualDensity.compact,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
