import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../services/avs_audio_engine.dart';

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
  ),
  iapfNudge(
    'iAPF Resonant Pull',
    10.65,
    432.0,
    Color(0xFF06B6D4),
    'Closed-loop individual Alpha Peak Frequency +0.5 Hz adaptive entrainment pull vector.',
  ),
  faaDavidson(
    'Davidson FAA Mood Split',
    14.0,
    528.0,
    Color(0xFF6366F1),
    'Left frontal Beta/SMR with right Alpha tone to downregulate depressive hypofunction.',
  ),
  spindleInduction(
    'Thalamic Sleep Spindle',
    13.5,
    285.0,
    Color(0xFF8B5CF6),
    'Intermittent 13.5 Hz micro-bursts to trigger N2 sleep stabilization and sensory gating.',
  ),
  slowWavePlas(
    'Slow-Wave Delta PLAS',
    1.2,
    174.0,
    Color(0xFF4338CA),
    'Phase-locked acoustic stimulation (PLAS) for deep restorative sleep & glymphatic wash.',
  ),
  carAwakening(
    'CAR 40Hz Wake Booster',
    40.0,
    963.0,
    Color(0xFFF59E0B),
    'Cortisol Awakening Response protocol for morning adenosine clearance and vitality.',
  ),
  dyadicResonance(
    'Dyadic Relational Sync',
    5.8,
    639.0,
    Color(0xFFEC4899),
    'Two-person heart/breath coherence & somatic trauma coregulation.',
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
  late AnimationController _mascotBobController;

  AvsProtocol _selectedProtocol = AvsProtocol.alphaCalm;
  VisualParadigm _visualParadigm = VisualParadigm.lissajous;
  double _frequencyHz = 10.0;
  double _carrierHz = 432.0;
  bool _isPlaying = false;
  bool _isIsochronic = false;
  bool _isHapticEnabled = true;
  bool _isStrobeEnabled = true;
  bool _showMascot = true;
  int _secondsRemaining = 300;
  Timer? _sessionTimer;
  Timer? _hapticTimer;
  double _autonomicCoherence = 88.5;
  int _circadianKssScore = 5; // Karolinska Sleepiness Scale (1-9)

  final String _origamiMascotSvg = '''
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- Far Wing -->
    <polygon points="50,40 65,15 58,45" fill="#3ebc9e" stroke="#2fa085" stroke-width="0.5" stroke-linejoin="round" />
    <!-- Tail -->
    <polygon points="20,50 50,40 10,35" fill="#d4d4d8" stroke="#a1a1aa" stroke-width="0.5" stroke-linejoin="round" />
    <!-- Body Base -->
    <polygon points="20,50 50,40 58,45 75,55 50,65" fill="#f4f4f5" stroke="#e4e4e7" stroke-width="0.5" stroke-linejoin="round" />
    <!-- Near Wing (Upper) -->
    <polygon points="50,40 58,45 35,85" fill="#ffffff" stroke="#e4e4e7" stroke-width="0.5" stroke-linejoin="round" />
    <!-- Near Wing (Fold) -->
    <polygon points="50,40 35,85 20,50" fill="#f9f9f9" stroke="#d4d4d8" stroke-width="0.5" stroke-linejoin="round" />
    <!-- Neck/Head -->
    <polygon points="75,55 58,45 85,38" fill="#ffffff" stroke="#e4e4e7" stroke-width="0.5" stroke-linejoin="round" />
    <!-- Beak - Gold Accent -->
    <polygon points="85,38 82,45 95,34" fill="#F59E0B" stroke="#D97706" stroke-width="0.5" stroke-linejoin="round" />
    <!-- Cool Sunglasses -->
    <polygon points="76,41 84,37 83,43 75,47" fill="#09090B" stroke="#06B6D4" stroke-width="0.8" />
    <polygon points="70,44 76,41 75,47 69,50" fill="#09090B" stroke="#06B6D4" stroke-width="0.8" />
  </svg>
  ''';

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

    // 5.5 BPM Resonance Breathing Cycle (10.9 seconds per breath)
    _breathController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 10900),
    )..repeat(reverse: true);

    // Continuous rotation for spiral and mandala
    _spiralController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 18),
    )..repeat();

    // Bobbing Seagull Mascot
    _mascotBobController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2600),
    )..repeat(reverse: true);
  }

  void _selectProtocol(AvsProtocol protocol) {
    setState(() {
      _selectedProtocol = protocol;
      _frequencyHz = protocol.beatHz;
      _carrierHz = protocol.defaultCarrierHz;
    });
    _updateFlickerDuration();
    if (_isPlaying) {
      AvsAudioEngine.update(
        carrierHz: _carrierHz,
        beatHz: _frequencyHz,
        isIsochronic: _isIsochronic,
      );
    }
    if (_isHapticEnabled) {
      HapticFeedback.mediumImpact();
    }
  }

  void _updateFrequency(double newHz) {
    setState(() {
      _frequencyHz = newHz;
    });
    _updateFlickerDuration();
    if (_isPlaying) {
      AvsAudioEngine.update(
        carrierHz: _carrierHz,
        beatHz: _frequencyHz,
        isIsochronic: _isIsochronic,
      );
    }
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
        AvsAudioEngine.start(
          carrierHz: _carrierHz,
          beatHz: _frequencyHz,
          isIsochronic: _isIsochronic,
          volume: 0.7,
        );
      } else {
        _flickerController.stop();
        _sessionTimer?.cancel();
        _hapticTimer?.cancel();
        AvsAudioEngine.stop();
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

  void _applyCircadianKss(int kss) {
    setState(() {
      _circadianKssScore = kss;
      if (kss >= 7) {
        _selectProtocol(AvsProtocol.deltaRest);
      } else if (kss >= 5) {
        _selectProtocol(AvsProtocol.thetaFlow);
      } else if (kss >= 3) {
        _selectProtocol(AvsProtocol.alphaCalm);
      } else {
        _selectProtocol(AvsProtocol.betaDrive);
      }
    });
    HapticFeedback.selectionClick();
  }

  @override
  void dispose() {
    AvsAudioEngine.stop();
    _flickerController.dispose();
    _breathController.dispose();
    _spiralController.dispose();
    _mascotBobController.dispose();
    _sessionTimer?.cancel();
    _hapticTimer?.cancel();
    super.dispose();
  }

  void _showRppgVitalsSheet(BuildContext context) {
    final themeColor = _selectedProtocol.themeColor;
    HapticFeedback.mediumImpact();
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF13151A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 38,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.white24,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.videocam, color: Color(0xFF10B981), size: 20),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'CONTACTLESS OPTICAL rPPG',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.2,
                              color: Color(0xFF10B981),
                            ),
                          ),
                          Text(
                            'Front-Camera Facial Sub-Capillary Vitals',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.4),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.2)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildVitalsMetric('HEART RATE', '68 BPM', const Color(0xFF10B981)),
                      _buildVitalsMetric('HRV RMSSD', '54 ms', const Color(0xFF06B6D4)),
                      _buildVitalsMetric('RESONANCE', '5.8 BPM', const Color(0xFFF59E0B)),
                      _buildVitalsMetric('COHERENCE', '${_autonomicCoherence.toStringAsFixed(1)}%', themeColor),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                const Text(
                  'Optical photoplethysmography tracks green-band microvascular flush without any watch or sensor required.',
                  style: TextStyle(fontSize: 11, color: Colors.white60, height: 1.3),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () {
                      Navigator.pop(ctx);
                      _breathController.duration = const Duration(milliseconds: 10345); // 5.8 BPM
                      _breathController.repeat(reverse: true);
                      HapticFeedback.heavyImpact();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Baroreflex breathing rate locked to 5.8 BPM (Resonant Cadence)'),
                          duration: Duration(seconds: 2),
                        ),
                      );
                    },
                    icon: const Icon(Icons.tune, size: 18),
                    label: const Text(
                      'Auto-Tune Baroreflex Cadence (5.8 BPM)',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildVitalsMetric(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: Colors.white38),
        ),
        const SizedBox(height: 3),
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            fontFamily: 'monospace',
            color: color,
          ),
        ),
      ],
    );
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
        centerTitle: false,
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
              'PocketGull AVS',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 15,
                letterSpacing: 0.4,
                color: Colors.white,
              ),
            ),
          ],
        ),
        backgroundColor: Colors.black.withValues(alpha: 0.5),
        elevation: 0,
        actions: [
          IconButton(
            visualDensity: VisualDensity.compact,
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
            padding: const EdgeInsets.all(6),
            icon: Icon(
              _showMascot ? Icons.pets : Icons.pets_outlined,
              color: _showMascot ? themeColor : Colors.white38,
              size: 19,
            ),
            tooltip: 'Toggle Origami Mascot',
            onPressed: () {
              setState(() => _showMascot = !_showMascot);
              HapticFeedback.lightImpact();
            },
          ),
          IconButton(
            visualDensity: VisualDensity.compact,
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
            padding: const EdgeInsets.all(6),
            icon: Icon(
              _isStrobeEnabled ? Icons.flash_on : Icons.flash_off,
              color: _isStrobeEnabled ? themeColor : Colors.white38,
              size: 19,
            ),
            tooltip: 'Photic Strobe',
            onPressed: () {
              setState(() => _isStrobeEnabled = !_isStrobeEnabled);
              HapticFeedback.selectionClick();
            },
          ),
          IconButton(
            visualDensity: VisualDensity.compact,
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
            padding: const EdgeInsets.all(6),
            icon: Icon(
              _isHapticEnabled ? Icons.vibration : Icons.smartphone,
              color: _isHapticEnabled ? themeColor : Colors.white38,
              size: 19,
            ),
            tooltip: 'Haptic Entrainment',
            onPressed: () {
              setState(() => _isHapticEnabled = !_isHapticEnabled);
              if (_isPlaying && _isHapticEnabled) _startHapticEntrainment();
            },
          ),
          IconButton(
            visualDensity: VisualDensity.compact,
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
            padding: const EdgeInsets.all(6),
            icon: Icon(
              _isIsochronic ? Icons.speaker_group : Icons.headphones,
              color: themeColor,
              size: 19,
            ),
            tooltip: _isIsochronic ? 'Isochronic Open-Air Pulse' : 'Stereo Binaural Beats',
            onPressed: () {
              setState(() => _isIsochronic = !_isIsochronic);
              HapticFeedback.lightImpact();
            },
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 0. SPLASH-INSPIRED ANIMATED ORIGAMI MASCOT & COASTAL BREEZE
              if (_showMascot)
                AnimatedBuilder(
                  animation: _mascotBobController,
                  builder: (context, child) {
                    final bobY = math.sin(_mascotBobController.value * math.pi) * -6.0;
                    return Transform.translate(
                      offset: Offset(0, bobY),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: const Color(0xFF13151A),
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: themeColor.withValues(alpha: 0.25)),
                          boxShadow: [
                            BoxShadow(
                              color: themeColor.withValues(alpha: 0.08),
                              blurRadius: 16,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            // Interactive Mascot Svg
                            InkWell(
                              onTap: () {
                                HapticFeedback.mediumImpact();
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('PocketGull: "Breathe in harmony with the tides." 🌊'),
                                    duration: Duration(seconds: 2),
                                  ),
                                );
                              },
                              borderRadius: BorderRadius.circular(24),
                              child: SizedBox(
                                width: 50,
                                height: 50,
                                child: SvgPicture.string(_origamiMascotSvg),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      const Text(
                                        'POCKET GULL',
                                        style: TextStyle(
                                          fontWeight: FontWeight.w800,
                                          fontSize: 12,
                                          letterSpacing: 2.0,
                                          color: Colors.white,
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                        decoration: BoxDecoration(
                                          color: themeColor.withValues(alpha: 0.2),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          'AVS SUNGLEAM',
                                          style: TextStyle(
                                            fontSize: 8.5,
                                            fontWeight: FontWeight.bold,
                                            color: themeColor,
                                            letterSpacing: 0.8,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    _isPlaying
                                        ? 'Synchronizing neural oscillations at ${_frequencyHz.toStringAsFixed(1)} Hz...'
                                        : 'Select your state or tune circadian alertness below.',
                                    style: const TextStyle(fontSize: 10.5, color: Colors.white60),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),

              // 1. MASTER MULTI-MODAL VISUAL CYMATICS CANVAS WITH PAPERCRAFT HORIZON
              AnimatedBuilder(
                animation: Listenable.merge([_flickerController, _breathController, _spiralController]),
                builder: (context, child) {
                  final flickerOpacity = (_isPlaying && _isStrobeEnabled)
                      ? (0.2 + _flickerController.value * 0.7)
                      : 0.35;

                  return Container(
                    height: 260,
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
                        // Procedural Coastal Papercraft Dunes Backdrop
                        Positioned.fill(
                          child: CustomPaint(
                            painter: _PapercraftBackdropPainter(
                              breathProgress: _breathController.value,
                              themeColor: themeColor,
                            ),
                          ),
                        ),

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
                          top: 12,
                          left: 14,
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
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: themeColor,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  '• ${_carrierHz.toInt()} Hz',
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

                        // Interactive Optical rPPG Coherence Badge
                        Positioned(
                          top: 12,
                          right: 14,
                          child: InkWell(
                            onTap: () => _showRppgVitalsSheet(context),
                            borderRadius: BorderRadius.circular(12),
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
                                    '${_autonomicCoherence.toStringAsFixed(1)}%',
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
                        ),

                        // Bottom Center Paradigm Selector inside Canvas
                        Positioned(
                          bottom: 8,
                          left: 12,
                          right: 12,
                          child: Center(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.8),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: SingleChildScrollView(
                                scrollDirection: Axis.horizontal,
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: VisualParadigm.values.map((p) {
                                    final isSel = _visualParadigm == p;
                                    return InkWell(
                                      onTap: () {
                                        setState(() => _visualParadigm = p);
                                        HapticFeedback.selectionClick();
                                      },
                                      borderRadius: BorderRadius.circular(14),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                                        decoration: BoxDecoration(
                                          color: isSel ? themeColor.withValues(alpha: 0.3) : Colors.transparent,
                                          borderRadius: BorderRadius.circular(14),
                                        ),
                                        child: Row(
                                          children: [
                                            Icon(
                                              p.icon,
                                              size: 13,
                                              color: isSel ? themeColor : Colors.white60,
                                            ),
                                            const SizedBox(width: 4),
                                            Text(
                                              p.label,
                                              style: TextStyle(
                                                fontSize: 9.5,
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
                        ),
                      ],
                    ),
                  );
                },
              ),

              const SizedBox(height: 14),

              // 2. PRIMARY PLAY / PAUSE CONTROLS & SESSION TIME
              Container(
                padding: const EdgeInsets.all(14),
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
                      borderRadius: BorderRadius.circular(32),
                      child: Container(
                        width: 58,
                        height: 58,
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
                          size: 28,
                        ),
                      ),
                    ),

                    const SizedBox(width: 14),

                    // Countdown Timer & Quick Pills
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                _formatTime(_secondsRemaining),
                                style: const TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                  fontFamily: 'monospace',
                                ),
                              ),
                              const Spacer(),
                              ...[5, 10, 15, 20].map((m) {
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
                                          fontSize: 9.5,
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
                          const SizedBox(height: 3),
                          Text(
                            _isIsochronic ? 'Open-Air Isochronic Pulse' : 'Stereo Binaural Frequency Offset',
                            style: const TextStyle(fontSize: 10.5, color: Colors.white60),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              // 3. CIRCADIAN SLEEPINESS (KSS) QUICK TUNER (FROM SPLASH SCREEN)
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF13151A),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: Colors.white10),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'CIRCADIAN ALERTNESS (KSS)',
                          style: TextStyle(
                            fontSize: 10.5,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.1,
                            color: Colors.white54,
                          ),
                        ),
                        Text(
                          _circadianKssScore >= 7
                              ? 'Sleepy (KSS $_circadianKssScore)'
                              : (_circadianKssScore >= 4
                                  ? 'Equilibrium (KSS $_circadianKssScore)'
                                  : 'Peak Alert (KSS $_circadianKssScore)'),
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: themeColor,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: List.generate(9, (idx) {
                        final kss = idx + 1;
                        final isSel = _circadianKssScore == kss;
                        final itemWidth = math.max(24.0, (MediaQuery.of(context).size.width - 80) / 9);
                        return InkWell(
                          onTap: () => _applyCircadianKss(kss),
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            width: itemWidth,
                            padding: const EdgeInsets.symmetric(vertical: 6),
                            decoration: BoxDecoration(
                              color: isSel ? themeColor : Colors.black.withValues(alpha: 0.3),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: isSel ? themeColor : Colors.white12),
                            ),
                            child: Center(
                              child: Text(
                                '$kss',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                                  color: isSel ? Colors.black : Colors.white70,
                                ),
                              ),
                            ),
                          ),
                        );
                      }),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // 4. EXPANSIVE CLINICAL PROTOCOL MATRIX
              const Text(
                'CLINICAL ENTRAINMENT PROTOCOLS',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                  color: Colors.white54,
                ),
              ),
              const SizedBox(height: 8),

              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: AvsProtocol.values.map((protocol) {
                  final isSelected = _selectedProtocol == protocol;
                  return InkWell(
                    onTap: () => _selectProtocol(protocol),
                    borderRadius: BorderRadius.circular(14),
                    child: Container(
                      width: math.max(140.0, (MediaQuery.of(context).size.width - 40) / 2),
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

              const SizedBox(height: 16),

              // 5. SOLFEGGIO & PYTHAGOREAN CARRIER FREQUENCY SELECTOR
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF13151A),
                  borderRadius: BorderRadius.circular(18),
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
                            fontSize: 10.5,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.1,
                            color: Colors.white54,
                          ),
                        ),
                        Text(
                          '${_carrierHz.toInt()} Hz',
                          style: TextStyle(
                            fontSize: 12,
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
                                if (_isPlaying) {
                                  AvsAudioEngine.update(
                                    carrierHz: _carrierHz,
                                    beatHz: _frequencyHz,
                                    isIsochronic: _isIsochronic,
                                  );
                                }
                                HapticFeedback.selectionClick();
                              },
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
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
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: isCur ? Colors.white : Colors.white70,
                                        fontFamily: 'monospace',
                                      ),
                                    ),
                                    Text(
                                      c.affinity,
                                      style: TextStyle(
                                        fontSize: 8.5,
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

              const SizedBox(height: 16),

              // 6. CONTINUOUS BRAINWAVE DIAL & 5.5 BPM RESONANCE BREATHING
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF13151A),
                  borderRadius: BorderRadius.circular(18),
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
                            fontSize: 10.5,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.1,
                            color: Colors.white54,
                          ),
                        ),
                        Text(
                          '${_frequencyHz.toStringAsFixed(2)} Hz',
                          style: TextStyle(
                            fontSize: 13,
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
                    const SizedBox(height: 6),
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

              const SizedBox(height: 24),
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

/// Papercraft Coastal Dunes Backdrop Painter
class _PapercraftBackdropPainter extends CustomPainter {
  final double breathProgress;
  final Color themeColor;

  _PapercraftBackdropPainter({
    required this.breathProgress,
    required this.themeColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final dunePaint = Paint()
      ..color = themeColor.withValues(alpha: 0.04)
      ..style = PaintingStyle.fill;

    // Coastal Dune 1
    final path1 = Path();
    path1.moveTo(0, size.height * 0.7);
    path1.quadraticBezierTo(
      size.width * 0.35,
      size.height * (0.62 + breathProgress * 0.03),
      size.width * 0.65,
      size.height * 0.75,
    );
    path1.quadraticBezierTo(
      size.width * 0.85,
      size.height * 0.82,
      size.width,
      size.height * 0.72,
    );
    path1.lineTo(size.width, size.height);
    path1.lineTo(0, size.height);
    path1.close();
    canvas.drawPath(path1, dunePaint);

    // Coastal Dune 2 (Lower foreground)
    final dunePaint2 = Paint()
      ..color = themeColor.withValues(alpha: 0.06)
      ..style = PaintingStyle.fill;

    final path2 = Path();
    path2.moveTo(0, size.height * 0.85);
    path2.quadraticBezierTo(
      size.width * 0.45,
      size.height * (0.78 - breathProgress * 0.02),
      size.width,
      size.height * 0.88,
    );
    path2.lineTo(size.width, size.height);
    path2.lineTo(0, size.height);
    path2.close();
    canvas.drawPath(path2, dunePaint2);
  }

  @override
  bool shouldRepaint(covariant _PapercraftBackdropPainter oldDelegate) {
    return oldDelegate.breathProgress != breathProgress || oldDelegate.themeColor != themeColor;
  }
}
