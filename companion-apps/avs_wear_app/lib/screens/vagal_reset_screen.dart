import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import '../services/tactile_engine.dart';
import '../services/ceda_biofeedback_service.dart';

class VagalResetScreen extends StatefulWidget {
  const VagalResetScreen({super.key});

  @override
  State<VagalResetScreen> createState() => _VagalResetScreenState();
}

class _VagalResetScreenState extends State<VagalResetScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _scaleAnimation;
  Timer? _sessionTimer;
  int _secondsRemaining = 180; // 3-minute reset
  static const int _totalSessionSeconds = 180;
  bool _isActive = false;
  double _initialCeda = 0.0;
  double _finalCeda = 0.0;
  bool _isCompleted = false;

  // Pixel Watch 2 Rotary Crown Cadence Control (4.5 to 7.5 bpm, default 6.0 = 0.1 Hz)
  double _cadenceBpm = 6.0;

  @override
  void initState() {
    super.initState();
    _initAnimationController();
  }

  void _initAnimationController() {
    final cycleDurationMs = (60000 / _cadenceBpm).round();
    _animController = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: cycleDurationMs),
    );

    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 0.48, end: 1.0).chain(CurveTween(curve: Curves.easeInOut)), weight: 40),
      TweenSequenceItem(tween: ConstantTween(1.0), weight: 20),
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 0.48).chain(CurveTween(curve: Curves.easeInOut)), weight: 40),
    ]).animate(_animController);
  }

  /// Handle physical digital crown rotation on Pixel Watch 2
  void _handleRotaryScroll(PointerScrollEvent event) {
    if (!_isActive) return;

    setState(() {
      if (event.scrollDelta.dy < 0) {
        // Crown turned up -> accelerate cadence
        _cadenceBpm = math.min(7.5, _cadenceBpm + 0.25);
      } else {
        // Crown turned down -> slow down cadence (deeper vagal pacing)
        _cadenceBpm = math.max(4.5, _cadenceBpm - 0.25);
      }

      // Re-time animation smoothly
      final cycleDurationMs = (60000 / _cadenceBpm).round();
      _animController.duration = Duration(milliseconds: cycleDurationMs);
      if (_animController.isAnimating) {
        _animController.repeat();
      }
    });

    // Provide immediate micro-haptic crown detent feedback
    TactileEngine().playMicroClick(amplitude: 45, durationMs: 12);
  }

  void _startReset() {
    setState(() {
      _isActive = true;
      _isCompleted = false;
      _secondsRemaining = _totalSessionSeconds;
      _initialCeda = CedaBiofeedbackService().latest.cedaMicrosiemens;
    });

    _animController.repeat();
    TactileEngine().startCadence(HapticCadence.vagalWave);

    _sessionTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining <= 1) {
        _finishReset();
      } else {
        setState(() {
          _secondsRemaining--;
        });
      }
    });
  }

  void _finishReset() {
    _sessionTimer?.cancel();
    _animController.stop();
    TactileEngine().stop();
    _finalCeda = CedaBiofeedbackService().latest.cedaMicrosiemens;

    setState(() {
      _isActive = false;
      _isCompleted = true;
    });
  }

  @override
  void dispose() {
    _sessionTimer?.cancel();
    _animController.dispose();
    TactileEngine().stop();
    super.dispose();
  }

  String _getBreathPhase(double value) {
    if (value < 0.4) return 'INHALE';
    if (value < 0.6) return 'HOLD';
    return 'EXHALE';
  }

  @override
  Widget build(BuildContext context) {
    final minutes = (_secondsRemaining ~/ 60).toString().padLeft(2, '0');
    final seconds = (_secondsRemaining % 60).toString().padLeft(2, '0');

    return Scaffold(
      backgroundColor: Colors.black,
      body: Listener(
        onPointerSignal: (pointerSignal) {
          if (pointerSignal is PointerScrollEvent) {
            _handleRotaryScroll(pointerSignal);
          }
        },
        child: Center(
          child: SizedBox(
            width: 384,
            height: 384,
            child: _isCompleted
                ? _buildCompletionSummary()
                : _isActive
                    ? _buildActiveSession(minutes, seconds)
                    : _buildReadyScreen(),
          ),
        ),
      ),
    );
  }

  Widget _buildReadyScreen() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.spa_rounded, color: Color(0xFF14B8A6), size: 36),
        const SizedBox(height: 8),
        const Text(
          '3-MIN VAGAL RESET',
          style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 1.2),
        ),
        const SizedBox(height: 4),
        Text(
          '0.1 Hz Mayer Wave (${_cadenceBpm.toStringAsFixed(1)} bpm)',
          style: const TextStyle(color: Colors.white70, fontSize: 11),
        ),
        const SizedBox(height: 16),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF14B8A6),
            foregroundColor: Colors.black,
            shape: const StadiumBorder(),
            minimumSize: const Size(130, 48),
          ),
          onPressed: _startReset,
          child: const Text('BEGIN', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        ),
      ],
    );
  }

  Widget _buildActiveSession(String minutes, String seconds) {
    return AnimatedBuilder(
      animation: _animController,
      builder: (context, child) {
        final phase = _getBreathPhase(_animController.value);
        final progress = (_totalSessionSeconds - _secondsRemaining) / _totalSessionSeconds;
        final bio = CedaBiofeedbackService().latest;

        return Stack(
          alignment: Alignment.center,
          children: [
            // Circular Biophilic AMOLED Outer Arc Gauge
            Positioned.fill(
              child: CustomPaint(
                painter: CircularBiophilicArcPainter(
                  sessionProgress: progress,
                  breathPhase: _animController.value,
                  tone: bio.tone,
                ),
              ),
            ),

            // Expanding / Contracting Biophilic Reticle
            Container(
              width: 175 * _scaleAnimation.value,
              height: 175 * _scaleAnimation.value,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFF14B8A6).withValues(alpha: 0.35),
                    const Color(0xFF14B8A6).withValues(alpha: 0.05),
                  ],
                ),
                border: Border.all(color: const Color(0xFF14B8A6), width: 2),
              ),
            ),

            // Text readout in center
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  phase,
                  style: const TextStyle(
                    color: Color(0xFF14B8A6),
                    fontWeight: FontWeight.w900,
                    fontSize: 16,
                    letterSpacing: 2,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '$minutes:$seconds',
                  style: const TextStyle(
                    color: Colors.white,
                    fontFamily: 'monospace',
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2),
                // Cadence indicator + Crown Hint
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.rotate_right, size: 10, color: Colors.white54),
                    const SizedBox(width: 2),
                    Text(
                      '${_cadenceBpm.toStringAsFixed(1)} bpm',
                      style: const TextStyle(color: Colors.white60, fontSize: 10, fontFamily: 'monospace'),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                InkWell(
                  onTap: _finishReset,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white12,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text('STOP', style: TextStyle(color: Colors.white60, fontSize: 10)),
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );
  }

  Widget _buildCompletionSummary() {
    final cedaReduction = _initialCeda > 0
        ? (((_initialCeda - _finalCeda) / _initialCeda) * 100).clamp(-100.0, 100.0)
        : 0.0;

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.check_circle_outline, color: Color(0xFF10B981), size: 36),
        const SizedBox(height: 6),
        const Text(
          'RESET COMPLETE',
          style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Text(
          'cEDA Shift: ${cedaReduction >= 0 ? '-' : '+'}${cedaReduction.abs().toStringAsFixed(1)}%',
          style: const TextStyle(color: Color(0xFF14B8A6), fontSize: 12, fontWeight: FontWeight.w600),
        ),
        const Text(
          'Vagal Tone: Elevated',
          style: TextStyle(color: Colors.white70, fontSize: 11),
        ),
        const SizedBox(height: 12),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.white24,
            foregroundColor: Colors.white,
            minimumSize: const Size(100, 36),
          ),
          onPressed: () {
            setState(() {
              _isCompleted = false;
            });
          },
          child: const Text('DONE', style: TextStyle(fontSize: 12)),
        ),
      ],
    );
  }
}

/// Circular Biophilic Arc Painter rendering an organic progress rim along Wear OS edge
class CircularBiophilicArcPainter extends CustomPainter {
  final double sessionProgress; // 0.0 to 1.0
  final double breathPhase; // 0.0 to 1.0
  final AutonomicTone tone;

  CircularBiophilicArcPainter({
    required this.sessionProgress,
    required this.breathPhase,
    required this.tone,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width / 2) - 6.0;

    // Background circular rim
    final bgPaint = Paint()
      ..color = Colors.white10
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.5;
    canvas.drawCircle(center, radius, bgPaint);

    // Active session progress arc (starts at 12 o'clock = -pi/2)
    final progressColor = _getProgressColor(tone);
    final progressPaint = Paint()
      ..color = progressColor
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 4.0;

    final sweepAngle = 2 * math.pi * sessionProgress.clamp(0.0, 1.0);
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2,
      sweepAngle,
      false,
      progressPaint,
    );
  }

  Color _getProgressColor(AutonomicTone tone) {
    switch (tone) {
      case AutonomicTone.vagalCoherent:
        return const Color(0xFF14B8A6); // Gear Teal
      case AutonomicTone.sympatheticAroused:
        return const Color(0xFFF59E0B); // Amber Gold
      case AutonomicTone.deepParasympathetic:
        return const Color(0xFF8B5CF6); // Indigo / Violet
    }
  }

  @override
  bool shouldRepaint(covariant CircularBiophilicArcPainter oldDelegate) {
    return oldDelegate.sessionProgress != sessionProgress ||
        oldDelegate.breathPhase != breathPhase ||
        oldDelegate.tone != tone;
  }
}
