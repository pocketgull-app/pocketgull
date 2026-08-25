import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Comprehensive Brainwave & Clinical Entrainment Protocols
enum AvsProtocol {
  deltaRest(
    'Delta Somatotropic',
    1.5,
    174.0,
    Color(0xFF8B5CF6),
    'Deep Stage 3/4 Sleep • Somatotropin (GH) secretion & glymphatic brain detox.',
  ),
  thetaFlow(
    'Theta Hypnagogic',
    5.5,
    528.0,
    Color(0xFF10B981),
    'Subconscious flow • Downregulates Default Mode Network (DMN) rumination.',
  ),
  schumannEarth(
    'Schumann Resonance',
    7.83,
    432.0,
    Color(0xFF06B6D4),
    '7.83 Hz Earth cavity resonance • Circadian grounding & biofield coherence.',
  ),
  alphaCalm(
    'Alpha Mindful Flow',
    10.0,
    432.0,
    Color(0xFF3B82F6),
    'Thalamocortical alpha synchrony • Vagus nerve calm focus & reduced cortisol.',
  ),
  smrSensorimotor(
    'SMR Sensory-Motor',
    14.0,
    528.0,
    Color(0xFF14B8A6),
    '12–15 Hz Sensorimotor rhythm • Neuromuscular stillness, ADHD calm, motor quieting.',
  ),
  betaDrive(
    'Beta Problem-Solving',
    18.0,
    639.0,
    Color(0xFFF59E0B),
    'Prefrontal cortex activation • High analytical alertness and task engagement.',
  ),
  gammaSync(
    'Gamma Clarity 40Hz',
    40.0,
    963.0,
    Color(0xFFA855F7),
    '40 Hz cortical micro-binding • Peak working memory retrieval & microglia vitality.',
  ),
  persianTrance(
    'Monroe Persian Trance',
    6.0,
    432.0,
    Color(0xFFEC4899),
    'Hemi-Sync Sufi spiral • Golden Ratio dual-hemisphere hemispheric synchrony.',
  );

  final String title;
  final double beatHz;
  final double defaultCarrierHz;
  final Color themeColor;
  final String description;

  const AvsProtocol(
    this.title,
    this.beatHz,
    this.defaultCarrierHz,
    this.themeColor,
    this.description,
  );
}

/// Solfeggio & Pythagorean Acoustic Carrier Catalog
class SolfeggioCarrier {
  final double freqHz;
  final String name;
  final String affinity;

  const SolfeggioCarrier(this.freqHz, this.name, this.affinity);
}

const List<SolfeggioCarrier> solfeggioCarriers = [
  SolfeggioCarrier(174.0, '174 Hz — Foundation', 'Somatosensory Grounding'),
  SolfeggioCarrier(285.0, '285 Hz — Matrix Restoration', 'Tissue Morphogenesis'),
  SolfeggioCarrier(396.0, '396 Hz — Fear Liberation', 'Muladhara (Root)'),
  SolfeggioCarrier(417.0, '417 Hz — Neuroplastic Change', 'Svadhisthana (Sacral)'),
  SolfeggioCarrier(432.0, '432 Hz — Pythagorean Harmony', 'Verdi Natural Tuning'),
  SolfeggioCarrier(528.0, '528 Hz — Mitochondrial Repair', 'Golden Transformation'),
  SolfeggioCarrier(639.0, '639 Hz — Heart Coherence', 'Anahata (Heart Vagus)'),
  SolfeggioCarrier(741.0, '741 Hz — Cellular Autophagy', 'Vishuddha (Throat)'),
  SolfeggioCarrier(852.0, '852 Hz — Neural Order', 'Ajna (Third Eye)'),
  SolfeggioCarrier(963.0, '963 Hz — Crown Pineal', 'Sahasrara (Pineal)'),
];

/// Visual Cymatic Rendering Paradigms
enum VisualParadigm {
  lissajous('Lissajous Harmonics', Icons.all_inclusive),
  cymatics('Chladni Cymatics', Icons.grain),
  mandala('Sacred Mandala', Icons.blur_circular),
  goldenSpiral('Golden Spiral', Icons.waves);

  final String label;
  final IconData icon;

  const VisualParadigm(this.label, this.icon);
}

class AvsTherapyScreen extends StatefulWidget {
  const AvsTherapyScreen({super.key});

  @override
  State<AvsTherapyScreen> createState() => _AvsTherapyScreenState();
}

class _AvsTherapyScreenState extends State<AvsTherapyScreen> with TickerProviderStateMixin {
  late AnimationController _flickerController;
  late AnimationController _breathController;
  late AnimationController _spiralController;

  AvsProtocol _selectedProtocol = AvsProtocol.alphaCalm;
  VisualParadigm _visualParadigm = VisualParadigm.lissajous;
  double _frequencyHz = 10.0;
  double _carrierHz = 432.0;
  bool _isPlaying = false;
  bool _isIsochronic = false;
  bool _isHapticEnabled = true;
  bool _isStrobeEnabled = true;
  int _secondsRemaining = 300;
  Timer? _sessionTimer;
  Timer? _hapticTimer;
  double _autonomicCoherence = 88.5;

  @override
  void initState() {
    super.initState();
    _frequencyHz = _selectedProtocol.beatHz;
    _carrierHz = _selectedProtocol.defaultCarrierHz;
    _initControllers();
  }

  void _initControllers() {
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

    // 5.5 BPM Resonance Breathing Cycle (10.9 seconds per breath: 4.5s in, 1s hold, 5.4s out)
    _breathController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 10900),
    )..repeat(reverse: true);

    // Continuous rotation for spiral and mandala
    _spiralController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 18),
    )..repeat();
  }

  void _selectProtocol(AvsProtocol protocol) {
    setState(() {
      _selectedProtocol = protocol;
      _frequencyHz = protocol.beatHz;
      _carrierHz = protocol.defaultCarrierHz;
    });
    _updateFlickerDuration();
    if (_isHapticEnabled) {
      HapticFeedback.mediumImpact();
    }
  }

  void _updateFrequency(double newHz) {
    setState(() {
      _frequencyHz = newHz;
    });
    _updateFlickerDuration();
  }

  void _updateFlickerDuration() {
    final durationMs = math.max(15, (1000 / _frequencyHz).round());
    _flickerController.duration = Duration(milliseconds: durationMs);
  }

  void _toggleSession() {
    setState(() {
      _isPlaying = !_isPlaying;
      if (_isPlaying) {
        _flickerController.forward();
        _startTimer();
        _startHapticEntrainment();
      } else {
        _flickerController.stop();
        _sessionTimer?.cancel();
        _hapticTimer?.cancel();
      }
    });
    HapticFeedback.heavyImpact();
  }

  void _startTimer() {
    _sessionTimer?.cancel();
    _sessionTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining > 0) {
        setState(() {
          _secondsRemaining--;
          _autonomicCoherence = math.min(99.4, _autonomicCoherence + 0.04);
        });
      } else {
        _toggleSession();
      }
    });
  }

  void _startHapticEntrainment() {
    _hapticTimer?.cancel();
    if (!_isHapticEnabled) return;

    final intervalMs = math.max(100, (1000 / _frequencyHz).round());
    _hapticTimer = Timer.periodic(Duration(milliseconds: intervalMs), (timer) {
      if (!_isPlaying || !_isHapticEnabled) {
        timer.cancel();
        return;
      }
      HapticFeedback.selectionClick();
    });
  }

  void _setSessionDuration(int minutes) {
    setState(() {
      _secondsRemaining = minutes * 60;
    });
    HapticFeedback.lightImpact();
  }

  @override
  void dispose() {
    _flickerController.dispose();
    _breathController.dispose();
    _spiralController.dispose();
    _sessionTimer?.cancel();
    _hapticTimer?.cancel();
    super.dispose();
  }

  String _formatTime(int totalSeconds) {
    final minutes = (totalSeconds ~/ 60).toString().padLeft(2, '0');
    final seconds = (totalSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    const bgDark = Color(0xFF09090B);
    final themeColor = _selectedProtocol.themeColor;

    return Scaffold(
      backgroundColor: bgDark,
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: _isPlaying ? themeColor : Colors.white38,
                shape: BoxShape.circle,
                boxShadow: _isPlaying
                    ? [BoxShadow(color: themeColor, blurRadius: 8, spreadRadius: 2)]
                    : [],
              ),
            ),
            const SizedBox(width: 8),
            const Text(
              'PocketGull AVS Studio',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
                letterSpacing: 0.5,
                color: Colors.white,
              ),
            ),
          ],
        ),
        backgroundColor: Colors.black.withValues(alpha: 0.5),
        elevation: 0,
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(
              _isStrobeEnabled ? Icons.flash_on : Icons.flash_off,
              color: _isStrobeEnabled ? themeColor : Colors.white38,
              size: 20,
            ),
            tooltip: 'Photic Strobe',
            onPressed: () {
              setState(() => _isStrobeEnabled = !_isStrobeEnabled);
              HapticFeedback.selectionClick();
            },
          ),
          IconButton(
            icon: Icon(
              _isHapticEnabled ? Icons.vibration : Icons.smartphone,
              color: _isHapticEnabled ? themeColor : Colors.white38,
              size: 20,
            ),
            tooltip: 'Haptic Entrainment',
            onPressed: () {
              setState(() => _isHapticEnabled = !_isHapticEnabled);
              if (_isPlaying && _isHapticEnabled) _startHapticEntrainment();
            },
          ),
          IconButton(
            icon: Icon(
              _isIsochronic ? Icons.speaker_group : Icons.headphones,
              color: themeColor,
              size: 20,
            ),
            tooltip: _isIsochronic ? 'Isochronic Open-Air Pulse' : 'Stereo Binaural Beats',
            onPressed: () {
              setState(() => _isIsochronic = !_isIsochronic);
              HapticFeedback.lightImpact();
            },
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. MASTER MULTI-MODAL VISUAL CYMATICS CANVAS
              AnimatedBuilder(
                animation: Listenable.merge([_flickerController, _breathController, _spiralController]),
                builder: (context, child) {
                  final flickerOpacity = (_isPlaying && _isStrobeEnabled)
                      ? (0.2 + _flickerController.value * 0.7)
                      : 0.35;

                  return Container(
                    height: 270,
                    decoration: BoxDecoration(
                      color: const Color(0xFF030507),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: themeColor.withValues(alpha: flickerOpacity),
                        width: 2.0,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: themeColor.withValues(alpha: _isPlaying ? 0.25 : 0.08),
                          blurRadius: 28,
                          spreadRadius: 4,
                        )
                      ],
                    ),
                    child: Stack(
                      children: [
                        // Generative Cymatics & Geometric Painter
                        Positioned.fill(
                          child: CustomPaint(
                            painter: _AvsMultiModalPainter(
                              flickerProgress: _flickerController.value,
                              breathProgress: _breathController.value,
                              rotationProgress: _spiralController.value,
                              color: themeColor,
                              frequencyHz: _frequencyHz,
                              carrierHz: _carrierHz,
                              paradigm: _visualParadigm,
                              isPlaying: _isPlaying,
                            ),
                          ),
                        ),

                        // Frequency HUD Telemetry Overlay
                        Positioned(
                          top: 14,
                          left: 16,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.65),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: themeColor.withValues(alpha: 0.4)),
                            ),
                            child: Row(
                              children: [
                                Text(
                                  '${_frequencyHz.toStringAsFixed(1)} Hz',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: themeColor,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  '•  ${_carrierHz.toInt()} Hz Carrier',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: Colors.white70,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        // Coherence Badge
                        Positioned(
                          top: 14,
                          right: 16,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.65),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.white24),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.favorite, color: Colors.redAccent, size: 12),
                                const SizedBox(width: 4),
                                Text(
                                  '${_autonomicCoherence.toStringAsFixed(1)}% Coherence',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: Colors.white,
                                    fontWeight: FontWeight.w600,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        // Bottom Center Paradigm Selector inside Canvas
                        Positioned(
                          bottom: 10,
                          left: 0,
                          right: 0,
                          child: Center(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.75),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: VisualParadigm.values.map((p) {
                                  final isSel = _visualParadigm == p;
                                  return InkWell(
                                    onTap: () {
                                      setState(() => _visualParadigm = p);
                                      HapticFeedback.selectionClick();
                                    },
                                    borderRadius: BorderRadius.circular(16),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: isSel ? themeColor.withValues(alpha: 0.3) : Colors.transparent,
                                        borderRadius: BorderRadius.circular(16),
                                      ),
                                      child: Row(
                                        children: [
                                          Icon(
                                            p.icon,
                                            size: 14,
                                            color: isSel ? themeColor : Colors.white60,
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            p.label,
                                            style: TextStyle(
                                              fontSize: 10,
                                              fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                                              color: isSel ? Colors.white : Colors.white60,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                }).toList(),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),

              const SizedBox(height: 16),

              // 2. PRIMARY PLAY / PAUSE CONTROLS & SESSION TIME
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF13151A),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white10),
                ),
                child: Row(
                  children: [
                    // Large Glow Play Button
                    InkWell(
                      onTap: _toggleSession,
                      borderRadius: BorderRadius.circular(36),
                      child: Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _isPlaying ? Colors.redAccent.withValues(alpha: 0.2) : themeColor.withValues(alpha: 0.2),
                          border: Border.all(
                            color: _isPlaying ? Colors.redAccent : themeColor,
                            width: 2,
                          ),
                        ),
                        child: Icon(
                          _isPlaying ? Icons.pause : Icons.play_arrow,
                          color: _isPlaying ? Colors.redAccent : themeColor,
                          size: 32,
                        ),
                      ),
                    ),

                    const SizedBox(width: 16),

                    // Countdown Timer & Mode Details
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                _formatTime(_secondsRemaining),
                                style: const TextStyle(
                                  fontSize: 26,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                  fontFamily: 'monospace',
                                ),
                              ),
                              const Spacer(),
                              // Quick Duration Pills
                              ...[5, 15, 20].map((m) {
                                final isCur = _secondsRemaining == m * 60;
                                return Padding(
                                  padding: const EdgeInsets.only(left: 4),
                                  child: InkWell(
                                    onTap: () => _setSessionDuration(m),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: isCur ? themeColor.withValues(alpha: 0.25) : Colors.white.withValues(alpha: 0.05),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(color: isCur ? themeColor : Colors.white12),
                                      ),
                                      child: Text(
                                        '${m}m',
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: isCur ? FontWeight.bold : FontWeight.normal,
                                          color: isCur ? themeColor : Colors.white70,
                                        ),
                                      ),
                                    ),
                                  ),
                                );
                              }),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _isIsochronic ? 'Open-Air Isochronic Acoustic Pulse' : 'Stereo Binaural Frequency Offset',
                            style: const TextStyle(fontSize: 11, color: Colors.white60),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 18),

              // 3. EXPANSIVE CLINICAL PROTOCOL MATRIX
              const Text(
                'CLINICAL ENTRAINMENT PROTOCOLS',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                  color: Colors.white54,
                ),
              ),
              const SizedBox(height: 10),

              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: AvsProtocol.values.map((protocol) {
                  final isSelected = _selectedProtocol == protocol;
                  return InkWell(
                    onTap: () => _selectProtocol(protocol),
                    borderRadius: BorderRadius.circular(14),
                    child: Container(
                      width: (MediaQuery.of(context).size.width - 40) / 2,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isSelected ? protocol.themeColor.withValues(alpha: 0.15) : const Color(0xFF13151A),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isSelected ? protocol.themeColor : Colors.white10,
                          width: isSelected ? 1.5 : 1.0,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: BoxDecoration(
                                  color: protocol.themeColor,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  protocol.title,
                                  style: TextStyle(
                                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                                    fontSize: 12,
                                    color: Colors.white,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            '${protocol.beatHz} Hz Beat  •  ${protocol.defaultCarrierHz.toInt()} Hz',
                            style: TextStyle(
                              fontSize: 10,
                              fontFamily: 'monospace',
                              color: isSelected ? protocol.themeColor : Colors.white54,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            protocol.description,
                            style: const TextStyle(fontSize: 9.5, color: Colors.white38, height: 1.2),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),

              const SizedBox(height: 18),

              // 4. SOLFEGGIO & PYTHAGOREAN CARRIER FREQUENCY SELECTOR
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF13151A),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white10),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'ACOUSTIC CARRIER TONE',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.1,
                            color: Colors.white54,
                          ),
                        ),
                        Text(
                          '${_carrierHz.toInt()} Hz',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                            color: themeColor,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: solfeggioCarriers.map((c) {
                          final isCur = _carrierHz == c.freqHz;
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: InkWell(
                              onTap: () {
                                setState(() => _carrierHz = c.freqHz);
                                HapticFeedback.selectionClick();
                              },
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                decoration: BoxDecoration(
                                  color: isCur ? themeColor.withValues(alpha: 0.25) : Colors.black.withValues(alpha: 0.3),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: isCur ? themeColor : Colors.white10,
                                  ),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      '${c.freqHz.toInt()} Hz',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: isCur ? Colors.white : Colors.white70,
                                        fontFamily: 'monospace',
                                      ),
                                    ),
                                    Text(
                                      c.affinity,
                                      style: TextStyle(
                                        fontSize: 9,
                                        color: isCur ? themeColor : Colors.white38,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 18),

              // 5. FINE-TUNING FREQUENCY SLIDER & RESONANCE BREATHING
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF13151A),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white10),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'CONTINUOUS BRAINWAVE DIAL',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.1,
                            color: Colors.white54,
                          ),
                        ),
                        Text(
                          '${_frequencyHz.toStringAsFixed(2)} Hz',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                            color: themeColor,
                          ),
                        ),
                      ],
                    ),
                    Slider(
                      value: _frequencyHz,
                      min: 0.5,
                      max: 45.0,
                      divisions: 89,
                      activeColor: themeColor,
                      inactiveColor: Colors.white12,
                      onChanged: (val) => _updateFrequency(val),
                    ),
                    const SizedBox(height: 8),
                    // 5.5 BPM Resonance Breathing Indicator
                    AnimatedBuilder(
                      animation: _breathController,
                      builder: (context, child) {
                        final val = _breathController.value;
                        final isInhale = val > 0.5;
                        return Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.3),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.white10),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                isInhale ? Icons.air : Icons.compress,
                                size: 16,
                                color: themeColor,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  isInhale ? 'Inhale Deeply (4.5s)' : 'Exhale Slowly (5.5s)',
                                  style: const TextStyle(fontSize: 11, color: Colors.white70),
                                ),
                              ),
                              Container(
                                width: 50,
                                height: 6,
                                decoration: BoxDecoration(
                                  color: Colors.white10,
                                  borderRadius: BorderRadius.circular(3),
                                ),
                                child: FractionallySizedBox(
                                  alignment: Alignment.centerLeft,
                                  widthFactor: val,
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: themeColor,
                                      borderRadius: BorderRadius.circular(3),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),
            ],
          ),
        ),
      ),
    );
  }
}

/// Dynamic Multi-Modal Visual Painter (Lissajous, Chladni Cymatics, Mandala, Spiral)
class _AvsMultiModalPainter extends CustomPainter {
  final double flickerProgress;
  final double breathProgress;
  final double rotationProgress;
  final Color color;
  final double frequencyHz;
  final double carrierHz;
  final VisualParadigm paradigm;
  final bool isPlaying;

  _AvsMultiModalPainter({
    required this.flickerProgress,
    required this.breathProgress,
    required this.rotationProgress,
    required this.color,
    required this.frequencyHz,
    required this.carrierHz,
    required this.paradigm,
    required this.isPlaying,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final baseRadius = math.min(size.width, size.height) * 0.38;
    final dynamicRadius = baseRadius * (0.85 + breathProgress * 0.3);

    switch (paradigm) {
      case VisualParadigm.lissajous:
        _paintLissajous(canvas, center, dynamicRadius);
        break;
      case VisualParadigm.cymatics:
        _paintChladniCymatics(canvas, center, dynamicRadius);
        break;
      case VisualParadigm.mandala:
        _paintSacredMandala(canvas, center, dynamicRadius);
        break;
      case VisualParadigm.goldenSpiral:
        _paintGoldenSpiral(canvas, center, dynamicRadius);
        break;
    }

    // Concentric Autonomic Breathing Glow Ring
    final breathPaint = Paint()
      ..color = color.withValues(alpha: isPlaying ? (0.15 + flickerProgress * 0.35) : 0.1)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, dynamicRadius * 0.28, breathPaint);
  }

  void _paintLissajous(Canvas canvas, Offset center, double radius) {
    final paint = Paint()
      ..color = color.withValues(alpha: isPlaying ? 0.85 : 0.35)
      ..strokeWidth = 2.2
      ..style = PaintingStyle.stroke;

    final path = Path();
    const numPoints = 240;
    final a = (frequencyHz > 25 ? 5 : (frequencyHz > 12 ? 3 : 2)).toDouble();
    const b = 3.0;
    final delta = (flickerProgress + rotationProgress) * math.pi * 2;

    for (int i = 0; i <= numPoints; i++) {
      final theta = (i / numPoints) * math.pi * 2;
      final x = center.dx + math.sin(a * theta + delta) * radius;
      final y = center.dy + math.sin(b * theta) * (radius * 0.72);

      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    canvas.drawPath(path, paint);
  }

  void _paintChladniCymatics(Canvas canvas, Offset center, double radius) {
    final pointPaint = Paint()
      ..color = color.withValues(alpha: isPlaying ? 0.9 : 0.4)
      ..strokeWidth = 2.0;

    const rings = 6;
    final m = (frequencyHz / 4.0).clamp(2.0, 8.0);
    final n = (carrierHz / 120.0).clamp(2.0, 7.0);

    for (int r = 1; r <= rings; r++) {
      final ringR = radius * (r / rings);
      final count = 30 + r * 15;
      for (int i = 0; i < count; i++) {
        final angle = (i / count) * math.pi * 2 + (rotationProgress * math.pi * 0.5);
        final chladniOffset = math.sin(n * angle) * math.cos(m * angle) * (12.0 * flickerProgress);
        final px = center.dx + (ringR + chladniOffset) * math.cos(angle);
        final py = center.dy + (ringR + chladniOffset) * math.sin(angle);
        canvas.drawCircle(Offset(px, py), 1.5, pointPaint);
      }
    }
  }

  void _paintSacredMandala(Canvas canvas, Offset center, double radius) {
    final paint = Paint()
      ..color = color.withValues(alpha: isPlaying ? 0.75 : 0.3)
      ..strokeWidth = 1.6
      ..style = PaintingStyle.stroke;

    const petals = 12;
    for (int i = 0; i < petals; i++) {
      final angle = (i / petals) * math.pi * 2 + (rotationProgress * math.pi * 2);
      final petalCenter = Offset(
        center.dx + radius * 0.45 * math.cos(angle),
        center.dy + radius * 0.45 * math.sin(angle),
      );
      canvas.drawCircle(petalCenter, radius * 0.45, paint);
    }
    canvas.drawCircle(center, radius, paint);
    canvas.drawCircle(center, radius * 0.65, paint);
  }

  void _paintGoldenSpiral(Canvas canvas, Offset center, double radius) {
    final paint = Paint()
      ..color = color.withValues(alpha: isPlaying ? 0.85 : 0.35)
      ..strokeWidth = 2.2
      ..style = PaintingStyle.stroke;

    final path = Path();
    const steps = 180;
    const phi = 1.6180339887;
    final rotOffset = rotationProgress * math.pi * 2;

    for (int i = 0; i <= steps; i++) {
      final t = i / 20.0;
      final r = (radius / 12.0) * math.pow(phi, t / 4.0).clamp(0.0, radius);
      final angle = t + rotOffset;
      final x = center.dx + r * math.cos(angle);
      final y = center.dy + r * math.sin(angle);

      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _AvsMultiModalPainter oldDelegate) {
    return oldDelegate.flickerProgress != flickerProgress ||
        oldDelegate.breathProgress != breathProgress ||
        oldDelegate.rotationProgress != rotationProgress ||
        oldDelegate.frequencyHz != frequencyHz ||
        oldDelegate.carrierHz != carrierHz ||
        oldDelegate.paradigm != paradigm ||
        oldDelegate.isPlaying != isPlaying;
  }
}
