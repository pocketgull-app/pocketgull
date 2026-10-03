import 'dart:async';
import 'dart:math';

enum AutonomicTone {
  sympatheticAroused, // cEDA high, low HRV RMSSD
  vagalCoherent,      // 0.1 Hz respiratory sinus arrhythmia peak
  deepParasympathetic, // Low cEDA, elevated peripheral temp
}

enum AdaptiveSuggestion {
  holdAlphaBridge, // Pause downward ramp, hold 10 Hz with warm pink noise
  deepenToTheta,   // Patient is receptive, slide toward 6 Hz
  continuePacing,  // Autonomic coherence is high
}

class BiofeedbackSnapshot {
  final double heartRate;
  final double cedaMicrosiemens;
  final double skinTempCelsius;
  final double coherenceScore; // 0.0 to 100.0%
  final AutonomicTone tone;
  final AdaptiveSuggestion suggestion;
  final DateTime timestamp;

  BiofeedbackSnapshot({
    required this.heartRate,
    required this.cedaMicrosiemens,
    required this.skinTempCelsius,
    required this.coherenceScore,
    required this.tone,
    required this.suggestion,
    required this.timestamp,
  });
}

class CedaBiofeedbackService {
  static final CedaBiofeedbackService _instance = CedaBiofeedbackService._internal();
  factory CedaBiofeedbackService() => _instance;
  CedaBiofeedbackService._internal();

  final _controller = StreamController<BiofeedbackSnapshot>.broadcast();
  Stream<BiofeedbackSnapshot> get stream => _controller.stream;

  Timer? _pollingTimer;
  double _baselineCeda = 1.8;
  double _currentCeda = 1.8;
  double _currentHr = 72.0;
  double _currentTemp = 33.5;

  BiofeedbackSnapshot _latestSnapshot = BiofeedbackSnapshot(
    heartRate: 72.0,
    cedaMicrosiemens: 1.8,
    skinTempCelsius: 33.5,
    coherenceScore: 78.0,
    tone: AutonomicTone.vagalCoherent,
    suggestion: AdaptiveSuggestion.continuePacing,
    timestamp: DateTime.now(),
  );

  BiofeedbackSnapshot get latest => _latestSnapshot;

  void startMonitoring() {
    _pollingTimer?.cancel();
    _pollingTimer = Timer.periodic(const Duration(milliseconds: 800), (_) {
      _evaluateBiofeedback();
    });
  }

  void _evaluateBiofeedback() {
    // Physiological simulation for testing when sensors are in rest or dev mode
    final random = Random();
    final cedaNoise = (random.nextDouble() - 0.5) * 0.08;
    _currentCeda = (_currentCeda + cedaNoise).clamp(0.4, 6.0);
    
    final hrNoise = (random.nextDouble() - 0.5) * 1.5;
    _currentHr = (_currentHr + hrNoise).clamp(52.0, 115.0);

    // Warmth slightly increases during relaxation (peripheral vasodilation)
    if (_currentCeda < _baselineCeda) {
      _currentTemp = min(35.5, _currentTemp + 0.01);
    } else {
      _currentTemp = max(31.5, _currentTemp - 0.01);
    }

    // Determine autonomic tone
    final AutonomicTone tone;
    final AdaptiveSuggestion suggestion;
    double coherence;

    if (_currentCeda > _baselineCeda * 1.35) {
      tone = AutonomicTone.sympatheticAroused;
      suggestion = AdaptiveSuggestion.holdAlphaBridge;
      coherence = max(20.0, 85.0 - ((_currentCeda - _baselineCeda) * 30));
    } else if (_currentCeda < _baselineCeda * 0.8) {
      tone = AutonomicTone.deepParasympathetic;
      suggestion = AdaptiveSuggestion.deepenToTheta;
      coherence = min(98.0, 80.0 + ((_baselineCeda - _currentCeda) * 20));
    } else {
      tone = AutonomicTone.vagalCoherent;
      suggestion = AdaptiveSuggestion.continuePacing;
      coherence = 82.0 + (random.nextDouble() * 8.0);
    }

    _latestSnapshot = BiofeedbackSnapshot(
      heartRate: _currentHr,
      cedaMicrosiemens: _currentCeda,
      skinTempCelsius: _currentTemp,
      coherenceScore: coherence,
      tone: tone,
      suggestion: suggestion,
      timestamp: DateTime.now(),
    );

    _controller.add(_latestSnapshot);
  }

  /// Trigger an intentional sympathetic stress event (useful for verification)
  void simulateStressEvent() {
    _currentCeda += 1.2;
    _currentHr += 14.0;
    _evaluateBiofeedback();
  }

  /// Trigger parasympathetic release
  void simulateCalmDescent() {
    _currentCeda = max(0.6, _currentCeda - 0.9);
    _currentHr = max(58.0, _currentHr - 8.0);
    _evaluateBiofeedback();
  }

  void stopMonitoring() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
  }
}
