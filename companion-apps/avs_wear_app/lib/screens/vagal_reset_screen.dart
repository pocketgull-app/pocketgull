import 'dart:async';
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
  bool _isActive = false;
  double _initialCeda = 0.0;
  double _finalCeda = 0.0;
  bool _isCompleted = false;

  @override
  void initState() {
    super.initState();
    // 10-second breath cycle: 4s inhale, 2s hold, 4s exhale (0.1 Hz Mayer wave)
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    );

    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 0.5, end: 1.0).chain(CurveTween(curve: Curves.easeInOut)), weight: 40),
      TweenSequenceItem(tween: ConstantTween(1.0), weight: 20),
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 0.5).chain(CurveTween(curve: Curves.easeInOut)), weight: 40),
    ]).animate(_animController);
  }

  void _startReset() {
    setState(() {
      _isActive = true;
      _isCompleted = false;
      _secondsRemaining = 180;
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
      body: Center(
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
        const Text(
          '0.1 Hz Coherence Pacing',
          style: TextStyle(color: Colors.white70, fontSize: 11),
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
        return Stack(
          alignment: Alignment.center,
          children: [
            // Expanding / Contracting Biophilic Reticle
            Container(
              width: 190 * _scaleAnimation.value,
              height: 190 * _scaleAnimation.value,
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
                const SizedBox(height: 4),
                Text(
                  '$minutes:$seconds',
                  style: const TextStyle(
                    color: Colors.white,
                    fontFamily: 'monospace',
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
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
