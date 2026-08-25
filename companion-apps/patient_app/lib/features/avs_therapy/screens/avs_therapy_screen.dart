import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';

enum AvsProtocol {
  thetaCalm('Theta Calm (6 Hz)', 6.0, Color(0xFF10B981), 'Deep parasympathetic relaxation and sleep onset'),
  alphaFlow('Alpha Flow (10 Hz)', 10.0, Color(0xFF06B6D4), 'Creative flow, mindfulness, and cognitive equilibrium'),
  betaFocus('Beta Focus (18 Hz)', 18.0, Color(0xFFF59E0B), 'High alertness, task concentration, and energy'),
  gammaInsight('Gamma Clarity (40 Hz)', 40.0, Color(0xFFA855F7), 'Peak neural synchrony, memory recall, and acuity');

  final String title;
  final double frequencyHz;
  final Color themeColor;
  final String description;

  const AvsProtocol(this.title, this.frequencyHz, this.themeColor, this.description);
}

class AvsTherapyScreen extends StatefulWidget {
  const AvsTherapyScreen({super.key});

  @override
  State<AvsTherapyScreen> createState() => _AvsTherapyScreenState();
}

class _AvsTherapyScreenState extends State<AvsTherapyScreen> with SingleTickerProviderStateMixin {
  late AnimationController _flickerController;
  AvsProtocol _selectedProtocol = AvsProtocol.alphaFlow;
  double _frequencyHz = 10.0;
  bool _isPlaying = false;
  int _secondsRemaining = 300;
  Timer? _sessionTimer;
  double _autonomicCoherence = 84.5;

  @override
  void initState() {
    super.initState();
    _frequencyHz = _selectedProtocol.frequencyHz;
    _initFlickerController();
  }

  void _initFlickerController() {
    // 1 cycle in milliseconds = (1 / frequency) * 1000
    final durationMs = math.max(15, (1000 / _frequencyHz).round());
    _flickerController = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: durationMs),
    )..addStatusListener((status) {
        if (status == AnimationStatus.completed) {
          _flickerController.reverse();
        } else if (status == AnimationStatus.dismissed && _isPlaying) {
          _flickerController.forward();
        }
      });
  }

  void _updateFrequency(double newHz) {
    setState(() {
      _frequencyHz = newHz;
    });
    final durationMs = math.max(15, (1000 / _frequencyHz).round());
    _flickerController.duration = Duration(milliseconds: durationMs);
  }

  void _toggleSession() {
    setState(() {
      _isPlaying = !_isPlaying;
      if (_isPlaying) {
        _flickerController.forward();
        _startTimer();
      } else {
        _flickerController.stop();
        _sessionTimer?.cancel();
      }
    });
  }

  void _startTimer() {
    _sessionTimer?.cancel();
    _sessionTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining > 0) {
        setState(() {
          _secondsRemaining--;
          _autonomicCoherence = math.min(99.0, _autonomicCoherence + 0.05);
        });
      } else {
        _toggleSession();
      }
    });
  }

  @override
  void dispose() {
    _flickerController.dispose();
    _sessionTimer?.cancel();
    super.dispose();
  }

  String _formatTime(int totalSeconds) {
    final minutes = (totalSeconds ~/ 60).toString().padLeft(2, '0');
    final seconds = (totalSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF09090B) : const Color(0xFFF4F4F5),
      appBar: AppBar(
        title: const Text(
          'AVS Therapy • Bio-Entrainment',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, fontFamily: 'monospace'),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Interactive Stroboscopic Optical Canvas
              AnimatedBuilder(
                animation: _flickerController,
                builder: (context, child) {
                  final flickerOpacity = _isPlaying
                      ? (0.15 + _flickerController.value * 0.75)
                      : 0.25;

                  return Container(
                    height: 260,
                    decoration: BoxDecoration(
                      color: const Color(0xFF05080C),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: _selectedProtocol.themeColor.withValues(alpha: flickerOpacity),
                        width: 2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: _selectedProtocol.themeColor.withValues(alpha: _isPlaying ? 0.35 : 0.1),
                          blurRadius: _isPlaying ? 24 : 8,
                          spreadRadius: _isPlaying ? 2 : 0,
                        ),
                      ],
                    ),
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        // Lissajous & Geometry Painter
                        CustomPaint(
                          size: const Size(double.infinity, 260),
                          painter: _AvsGeometryPainter(
                            progress: _flickerController.value,
                            color: _selectedProtocol.themeColor,
                            frequencyHz: _frequencyHz,
                            isPlaying: _isPlaying,
                          ),
                        ),

                        // Telemetry Badge Top-Left
                        Positioned(
                          top: 12,
                          left: 12,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF09090B).withValues(alpha: 0.85),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.white12),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: BoxDecoration(
                                    color: _isPlaying ? Colors.redAccent : Colors.grey,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  '${_frequencyHz.toStringAsFixed(1)} Hz Optical Pulse',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 11,
                                    fontFamily: 'monospace',
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        // Session Timer Badge Top-Right
                        Positioned(
                          top: 12,
                          right: 12,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF09090B).withValues(alpha: 0.85),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.white12),
                            ),
                            child: Text(
                              _formatTime(_secondsRemaining),
                              style: TextStyle(
                                color: _selectedProtocol.themeColor,
                                fontSize: 13,
                                fontFamily: 'monospace',
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),

                        // Center Resonance Badge
                        Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              _isPlaying ? 'ENTRAINING BRAINWAVES' : 'SESSION PAUSED',
                              style: TextStyle(
                                color: _selectedProtocol.themeColor,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 2.0,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Coherence: ${_autonomicCoherence.toStringAsFixed(1)}%',
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 11,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),

              const SizedBox(height: 16),

              // 2. Big Play / Pause Action Button
              SizedBox(
                height: 52,
                child: ElevatedButton.icon(
                  onPressed: _toggleSession,
                  icon: Icon(_isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded, size: 24),
                  label: Text(
                    _isPlaying ? 'PAUSE AVS SESSION' : 'START AVS ENTRAINMENT',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, letterSpacing: 1.0),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _isPlaying ? const Color(0xFFF43F5E) : _selectedProtocol.themeColor,
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 6,
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // 3. Preset Protocol Selector Chips
              const Text(
                'Clinical Protocols:',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, fontFamily: 'monospace'),
              ),
              const SizedBox(height: 8),

              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: AvsProtocol.values.map((protocol) {
                  final isSelected = _selectedProtocol == protocol;
                  return ChoiceChip(
                    label: Text(protocol.title),
                    selected: isSelected,
                    onSelected: (selected) {
                      if (selected) {
                        setState(() {
                          _selectedProtocol = protocol;
                          _updateFrequency(protocol.frequencyHz);
                        });
                      }
                    },
                    selectedColor: protocol.themeColor.withValues(alpha: 0.25),
                    backgroundColor: isDark ? const Color(0xFF18181B) : Colors.white,
                    side: BorderSide(
                      color: isSelected ? protocol.themeColor : Colors.white12,
                      width: isSelected ? 1.5 : 1,
                    ),
                    labelStyle: TextStyle(
                      color: isSelected ? protocol.themeColor : (isDark ? Colors.white70 : Colors.black87),
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      fontSize: 12,
                    ),
                  );
                }).toList(),
              ),

              const SizedBox(height: 16),

              // 4. Fine-Tuning Hz Slider
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF18181B) : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Frequency Modulation:',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          '${_frequencyHz.toStringAsFixed(1)} Hz',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                            color: _selectedProtocol.themeColor,
                          ),
                        ),
                      ],
                    ),
                    Slider(
                      value: _frequencyHz,
                      min: 1.0,
                      max: 45.0,
                      divisions: 88,
                      activeColor: _selectedProtocol.themeColor,
                      onChanged: (val) => _updateFrequency(val),
                    ),
                    Text(
                      _selectedProtocol.description,
                      style: TextStyle(
                        fontSize: 11,
                        color: isDark ? Colors.white60 : Colors.black54,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

class _AvsGeometryPainter extends CustomPainter {
  final double progress;
  final Color color;
  final double frequencyHz;
  final bool isPlaying;

  _AvsGeometryPainter({
    required this.progress,
    required this.color,
    required this.frequencyHz,
    required this.isPlaying,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width, size.height) * 0.38;

    final paint = Paint()
      ..color = color.withValues(alpha: isPlaying ? 0.8 : 0.3)
      ..strokeWidth = 2.0
      ..style = PaintingStyle.stroke;

    final path = Path();
    const numPoints = 180;
    final a = (frequencyHz > 20 ? 5 : 3).toDouble();
    const b = 2.0;
    final delta = progress * math.pi * 2;

    for (int i = 0; i <= numPoints; i++) {
      final theta = (i / numPoints) * math.pi * 2;
      final x = center.dx + math.sin(a * theta + delta) * radius;
      final y = center.dy + math.sin(b * theta) * (radius * 0.7);

      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }

    canvas.drawPath(path, paint);

    // Inner Concentric Pulse Ring
    final pulsePaint = Paint()
      ..color = color.withValues(alpha: isPlaying ? (0.2 + progress * 0.3) : 0.1)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, radius * (0.3 + (isPlaying ? progress * 0.2 : 0)), pulsePaint);
  }

  @override
  bool shouldRepaint(covariant _AvsGeometryPainter oldDelegate) {
    return oldDelegate.progress != progress ||
        oldDelegate.frequencyHz != frequencyHz ||
        oldDelegate.isPlaying != isPlaying;
  }
}
