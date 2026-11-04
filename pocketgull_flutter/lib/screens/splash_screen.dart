import 'package:flutter/material.dart';
import '../widgets/origami_seagull.dart';
import 'dashboard_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  late AnimationController _foldController;
  late Animation<double> _paperScale;
  late Animation<double> _paperRotation;
  late Animation<double> _paperOpacity;

  bool _showLockScreen = false;
  bool _usePinMode = false;
  String _pinCode = '';
  final TextEditingController _apiKeyController = TextEditingController();
  bool _usePubGemma = false;

  // Draw Pad Gesture State
  final List<List<Offset>> _strokes = [];
  List<Offset> _currentStroke = [];
  bool _isDrawingError = false;

  @override
  void initState() {
    super.initState();
    
    _foldController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2400),
    );

    _paperScale = TweenSequence([
      TweenSequenceItem(tween: Tween<double>(begin: 1.0, end: 0.8), weight: 40),
      TweenSequenceItem(tween: Tween<double>(begin: 0.8, end: 0.0), weight: 60),
    ]).animate(CurvedAnimation(parent: _foldController, curve: Curves.easeIn));

    _paperRotation = Tween<double>(begin: 0, end: 6.28).animate(
      CurvedAnimation(parent: _foldController, curve: Curves.easeInOut),
    );

    _paperOpacity = TweenSequence([
      TweenSequenceItem(tween: Tween<double>(begin: 1.0, end: 1.0), weight: 80),
      TweenSequenceItem(tween: Tween<double>(begin: 1.0, end: 0.0), weight: 20),
    ]).animate(_foldController);

    _foldController.forward().then((_) {
      Future.delayed(const Duration(milliseconds: 600), () {
        if (mounted) {
          setState(() {
            _showLockScreen = true;
          });
        }
      });
    });
  }

  @override
  void dispose() {
    _foldController.dispose();
    _apiKeyController.dispose();
    super.dispose();
  }

  void _clearDrawing() {
    setState(() {
      _strokes.clear();
      _currentStroke.clear();
      _isDrawingError = false;
    });
  }

  void _verifyDrawingAndUnlock() {
    if (_strokes.isEmpty && _currentStroke.isEmpty) return;

    final int totalPoints = _strokes.fold(0, (sum, s) => sum + s.length) + _currentStroke.length;
    if (totalPoints > 10 || _strokes.isNotEmpty) {
      _unlockAndNavigate();
    } else {
      setState(() => _isDrawingError = true);
      Future.delayed(const Duration(milliseconds: 1000), () {
        if (mounted) _clearDrawing();
      });
    }
  }

  void _handlePinPress(String digit) {
    if (_pinCode.length < 4) {
      setState(() {
        _pinCode += digit;
      });
      if (_pinCode.length == 4) {
        _unlockAndNavigate();
      }
    }
  }

  void _handleBiometricUnlock() {
    _unlockAndNavigate();
  }

  void _unlockAndNavigate() {
    Navigator.of(context).pushReplacement(
      PageRouteBuilder<void>(
        pageBuilder: (_, _, _) => const DashboardScreen(),
        transitionsBuilder: (_, a, _, c) => FadeTransition(opacity: a, child: c),
        transitionDuration: const Duration(milliseconds: 800),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final double centerOffset = (size.height * 0.5) - 200;

    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      body: SafeArea(
        child: Stack(
          children: [
            // Background Dieter Rams Linear Grid Details
            Positioned.fill(
              child: Opacity(
                opacity: 0.04,
                child: CustomPaint(
                  painter: _GridPatternPainter(),
                ),
              ),
            ),

            // Logo & Pocket Canvas Container
            AnimatedPositioned(
              duration: const Duration(milliseconds: 800),
              curve: Curves.easeInOut,
              top: _showLockScreen ? (size.height < 900 ? 10 : 20) : centerOffset,
              left: 0,
              right: 0,
              child: AnimatedScale(
                scale: _showLockScreen ? (size.height < 900 ? 0.6 : 0.75) : 1.0,
                duration: const Duration(milliseconds: 800),
                curve: Curves.easeInOut,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    SizedBox(
                      width: 280,
                      height: 200,
                      child: Stack(
                        alignment: Alignment.bottomCenter,
                        children: [
                          // Pocket Container
                          Container(
                            width: 180,
                            height: 70,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              border: Border.all(color: const Color(0xFFE5E7EB)),
                              borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.03),
                                  blurRadius: 15,
                                  offset: const Offset(0, -6),
                                )
                              ],
                            ),
                            child: Center(
                              child: Container(
                                width: 70,
                                height: 4,
                                decoration: BoxDecoration(
                                  color: const Color(0xFF111827),
                                  borderRadius: BorderRadius.circular(2),
                                ),
                              ),
                            ),
                          ),
                          
                          // Paper Folding
                          AnimatedBuilder(
                            animation: _foldController,
                            builder: (context, child) {
                              return Opacity(
                                opacity: _paperOpacity.value,
                                child: Transform.translate(
                                  offset: const Offset(0, -50),
                                  child: Transform.rotate(
                                    angle: _paperRotation.value,
                                    child: Transform.scale(
                                      scale: _paperScale.value,
                                      child: Container(
                                        width: 70,
                                        height: 90,
                                        decoration: BoxDecoration(
                                          color: Colors.white,
                                          border: Border.all(color: const Color(0xFFE5E7EB)),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),

                          // Origami Seagull
                          const OrigamiSeagull(size: 170),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'POCKET GULL',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 4.0,
                        color: Color(0xFF111827),
                      ),
                    ),
                    const Text(
                      'DIETER RAMS EDITION • CLINICAL ENGINE',
                      style: TextStyle(
                        fontSize: 8.5,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 2.0,
                        color: Colors.grey,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: const Color(0xFFBFDBFE)),
                      ),
                      child: const Text(
                        'v1.4.0 • GEMINI 3.6 GA • PUBGEMMA 27B',
                        style: TextStyle(
                          fontSize: 8.5,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.2,
                          color: Color(0xFF1D4ED8),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
            // Lock Screen Canvas / PIN UI
            if (_showLockScreen)
              Positioned(
                top: size.height < 900 ? 170 : 210,
                bottom: 0,
                left: 0,
                right: 0,
                child: TweenAnimationBuilder<double>(
                  tween: Tween<double>(begin: 0.0, end: 1.0),
                  duration: const Duration(milliseconds: 600),
                  curve: Curves.easeIn,
                  builder: (context, opacity, child) {
                    return Opacity(
                      opacity: opacity,
                      child: child,
                    );
                  },
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Center(
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 380),
                        child: Material(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          elevation: 2,
                          child: Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0xFFE5E7EB)),
                            ),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                              // Minimalist Dieter Rams Header Bar
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Flexible(
                                    child: Text(
                                      'SECURITY GATEWAY',
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2.0, color: Colors.grey),
                                    ),
                                  ),
                                  Row(
                                    children: [
                                      IconButton(
                                        icon: Icon(_usePinMode ? Icons.gesture : Icons.pin, size: 18, color: const Color(0xFF1C1C1C)),
                                        tooltip: _usePinMode ? 'Draw Mode' : 'PIN Mode',
                                        onPressed: () => setState(() => _usePinMode = !_usePinMode),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.fingerprint, size: 22, color: Color(0xFF416B1F)),
                                        tooltip: 'Biometric Unlock',
                                        onPressed: _handleBiometricUnlock,
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),

                              if (!_usePinMode) ...[
                                // Draw Your Way In Canvas Pad
                                const Text(
                                  'DRAW YOUR WAY IN TO UNLOCK',
                                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 1.5, color: Color(0xFF111827)),
                                ),
                                const SizedBox(height: 12),
                                Container(
                                  width: 260,
                                  height: 220,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFAFAFA),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: _isDrawingError ? Colors.red : const Color(0xFFE5E7EB),
                                      width: _isDrawingError ? 2.0 : 1.0,
                                    ),
                                  ),
                                  child: Stack(
                                    children: [
                                      // Subtle Guide SVG Grid
                                      Positioned.fill(
                                        child: Opacity(
                                          opacity: 0.15,
                                          child: Center(
                                            child: Icon(Icons.shield_outlined, size: 120, color: Colors.grey.shade400),
                                          ),
                                        ),
                                      ),
                                      // Gesture Canvas
                                      GestureDetector(
                                        onPanStart: (details) {
                                          setState(() {
                                            _currentStroke = [details.localPosition];
                                          });
                                        },
                                        onPanUpdate: (details) {
                                          setState(() {
                                            _currentStroke.add(details.localPosition);
                                          });
                                        },
                                        onPanEnd: (details) {
                                          setState(() {
                                            _strokes.add(List.from(_currentStroke));
                                            _currentStroke.clear();
                                          });
                                          _verifyDrawingAndUnlock();
                                        },
                                        child: CustomPaint(
                                          size: const Size(260, 220),
                                          painter: _GesturePainter(_strokes, _currentStroke),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    TextButton(
                                      onPressed: _clearDrawing,
                                      child: const Text('CLEAR PAD', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.2, color: Colors.grey)),
                                    ),
                                    const SizedBox(width: 16),
                                    ElevatedButton.icon(
                                      onPressed: _verifyDrawingAndUnlock,
                                      icon: const Icon(Icons.lock_open, size: 14),
                                      label: const Text('UNLOCK'),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFF1C1C1C),
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                        textStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                                      ),
                                    ),
                                  ],
                                ),
                              ] else ...[
                                // PIN Mode UI
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: List.generate(4, (index) => Container(
                                    margin: const EdgeInsets.symmetric(horizontal: 6),
                                    width: 10,
                                    height: 10,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: index < _pinCode.length ? const Color(0xFF1C1C1C) : Colors.grey.shade300,
                                    ),
                                  )),
                                ),
                                const SizedBox(height: 16),
                                GridView.count(
                                  crossAxisCount: 3,
                                  childAspectRatio: 2.0,
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  children: [
                                    for (var i = 1; i <= 9; i++) _buildPinButton(i.toString()),
                                    const SizedBox.shrink(),
                                    _buildPinButton('0'),
                                    IconButton(
                                      icon: const Icon(Icons.backspace_outlined, size: 18, color: Colors.grey),
                                      onPressed: () {
                                        if (_pinCode.isNotEmpty) {
                                          setState(() {
                                            _pinCode = _pinCode.substring(0, _pinCode.length - 1);
                                          });
                                        }
                                      },
                                    ),
                                  ],
                                ),
                              ],

                              const SizedBox(height: 16),
                              // Dieter Rams Minimalist Config Section
                              ExpansionTile(
                                tilePadding: EdgeInsets.zero,
                                title: const Text('ENGINE PARAMETERS', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1.5, color: Colors.grey)),
                                children: [
                                  TextField(
                                    controller: _apiKeyController,
                                    obscureText: true,
                                    style: const TextStyle(fontSize: 12),
                                    decoration: InputDecoration(
                                      hintText: 'Enter API Key',
                                      hintStyle: const TextStyle(fontSize: 11, color: Colors.grey),
                                      filled: true,
                                      fillColor: const Color(0xFFFAFAFA),
                                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: BorderSide.none),
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      const Text('PubGemma High-Efficiency Mode', style: TextStyle(fontSize: 11, color: Colors.black87)),
                                      Switch(
                                        value: _usePubGemma,
                                        onChanged: (val) => setState(() => _usePubGemma = val),
                                        activeThumbColor: const Color(0xFF416B1F),
                                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPinButton(String digit) {
    return TextButton(
      onPressed: () => _handlePinPress(digit),
      style: TextButton.styleFrom(
        foregroundColor: const Color(0xFF1C1C1C),
        shape: const CircleBorder(),
      ),
      child: Text(digit, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w400)),
    );
  }
}

// Custom Painter for Draw Pad Gesture
class _GesturePainter extends CustomPainter {
  final List<List<Offset>> strokes;
  final List<Offset> currentStroke;

  _GesturePainter(this.strokes, this.currentStroke);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF1C1C1C)
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 3.5
      ..style = PaintingStyle.stroke;

    for (final stroke in strokes) {
      for (int i = 0; i < stroke.length - 1; i++) {
        canvas.drawLine(stroke[i], stroke[i + 1], paint);
      }
    }

    for (int i = 0; i < currentStroke.length - 1; i++) {
      canvas.drawLine(currentStroke[i], currentStroke[i + 1], paint);
    }
  }

  @override
  bool shouldRepaint(covariant _GesturePainter oldDelegate) => true;
}

// Custom Painter for Dieter Rams Background Grid
class _GridPatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.black
      ..strokeWidth = 1.0;

    const double step = 20;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
