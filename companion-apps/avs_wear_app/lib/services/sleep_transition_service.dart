import 'dart:async';
import 'tactile_engine.dart';
import 'ceda_biofeedback_service.dart';

enum SleepState {
  awakeSettling,
  hypnagogaDrowsy,
  sleepSpindleConfirmed,
  dormantProtected,
}

class SleepTransitionService {
  static final SleepTransitionService _instance = SleepTransitionService._internal();
  factory SleepTransitionService() => _instance;
  SleepTransitionService._internal();

  final _controller = StreamController<SleepState>.broadcast();
  Stream<SleepState> get stateStream => _controller.stream;

  SleepState _currentState = SleepState.awakeSettling;
  SleepState get currentState => _currentState;

  int _stillnessCounter = 0;
  Timer? _evaluationTimer;

  void startSleepTracking() {
    _currentState = SleepState.awakeSettling;
    _stillnessCounter = 0;
    _controller.add(_currentState);

    // Initial hypnagogic pacing: Soft Theta 6 Hz
    TactileEngine().startCadence(HapticCadence.theta);

    _evaluationTimer?.cancel();
    _evaluationTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      _evaluateHypnagogicProgress();
    });
  }

  void _evaluateHypnagogicProgress() {
    final bio = CedaBiofeedbackService().latest;
    _stillnessCounter++;

    // Simulated sleep onset condition: Stillness > 20s + low cEDA + drop in HR
    if (_stillnessCounter > 4 && bio.heartRate < 68.0 && bio.cedaMicrosiemens < 1.4) {
      if (_currentState == SleepState.awakeSettling) {
        _currentState = SleepState.hypnagogaDrowsy;
        _controller.add(_currentState);
        // Transition down to Delta 1.5 Hz
        TactileEngine().startCadence(HapticCadence.delta);
      } else if (_stillnessCounter > 8) {
        _currentState = SleepState.sleepSpindleConfirmed;
        _controller.add(_currentState);
        _executeGracefulFadeout();
      }
    }
  }

  void _executeGracefulFadeout() {
    // 3 gentle farewell pulses, then complete quiet
    Timer(const Duration(seconds: 4), () {
      TactileEngine().playMicroClick(amplitude: 40, durationMs: 50);
    });
    Timer(const Duration(seconds: 8), () {
      TactileEngine().playMicroClick(amplitude: 25, durationMs: 40);
    });
    Timer(const Duration(seconds: 12), () {
      TactileEngine().stop();
      _currentState = SleepState.dormantProtected;
      _controller.add(_currentState);
      _evaluationTimer?.cancel();
      _evaluationTimer = null;
    });
  }

  void stopSleepTracking() {
    _evaluationTimer?.cancel();
    _evaluationTimer = null;
    TactileEngine().stop();
    _currentState = SleepState.awakeSettling;
  }
}
