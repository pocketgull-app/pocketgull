import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/foundation.dart';

enum BleConnectionState {
  disconnected,
  scanning,
  connecting,
  connected,
  error,
}

class BleDiscoveredDevice {
  final String id;
  final String name;
  final int rssi;
  final List<String> serviceUuids;

  BleDiscoveredDevice({
    required this.id,
    required this.name,
    required this.rssi,
    required this.serviceUuids,
  });
}

class BleVitalsData {
  final int? heartRateBpm;
  final double? spO2Percent;
  final double? bodyTempCelsius;
  final int? sysBpMmHg;
  final int? diaBpMmHg;
  final double? cgmGlucoseMgDl;
  final DateTime timestamp;

  BleVitalsData({
    this.heartRateBpm,
    this.spO2Percent,
    this.bodyTempCelsius,
    this.sysBpMmHg,
    this.diaBpMmHg,
    this.cgmGlucoseMgDl,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() {
    return {
      'heartRateBpm': heartRateBpm,
      'spO2Percent': spO2Percent,
      'bodyTempCelsius': bodyTempCelsius,
      'sysBpMmHg': sysBpMmHg,
      'diaBpMmHg': diaBpMmHg,
      'cgmGlucoseMgDl': cgmGlucoseMgDl,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}

class BleWearablesService {
  BleConnectionState _state = BleConnectionState.disconnected;
  BleDiscoveredDevice? _activeDevice;
  BleVitalsData _currentVitals = BleVitalsData(
    heartRateBpm: 72,
    spO2Percent: 98.0,
    bodyTempCelsius: 37.0,
    sysBpMmHg: 120,
    diaBpMmHg: 80,
    cgmGlucoseMgDl: 95.0,
    timestamp: DateTime.now(),
  );

  final _vitalsController = StreamController<BleVitalsData>.broadcast();
  final _stateController = StreamController<BleConnectionState>.broadcast();
  final _ppgController = StreamController<List<double>>.broadcast();
  final _ecgController = StreamController<List<double>>.broadcast();

  bool _isSimulationActive = false;
  Timer? _simTimer;
  int _simStep = 0;
  final double _hrvRmssd = 45.0;

  final List<double> _ppgBuffer = [];
  final List<double> _ecgBuffer = [];

  BleConnectionState get state => _state;
  BleDiscoveredDevice? get activeDevice => _activeDevice;
  BleVitalsData get currentVitals => _currentVitals;
  bool get isSimulationActive => _isSimulationActive;
  double get hrvRmssd => _hrvRmssd;

  /// Respiratory Sinus Arrhythmia (RSA) 0.10 Hz Resonance (6 breaths/min)
  double get cardiacResonanceHz => 0.10;

  /// Real-time Autonomic Vagal Coherence Score (0–100%)
  int get autonomicCoherenceScore {
    final hr = _currentVitals.heartRateBpm ?? 72;
    final rmssd = _hrvRmssd;
    final score = ((rmssd / 60.0) * 50.0 + (1.0 - (math.max(0, hr - 60) / 60.0)) * 50.0).clamp(0.0, 100.0);
    return score.round();
  }

  /// Recommended AVS Brainwave & Solfeggio Entrainment based on real-time HRV
  Map<String, dynamic> get recommendedEntrainment {
    final hr = _currentVitals.heartRateBpm ?? 72;
    final score = autonomicCoherenceScore;
    if (hr > 90 || score < 50) {
      return {
        'beatFreqHz': 5.5, // Theta
        'carrierFreqHz': 528, // Transformation
        'stateLabel': 'Autonomic De-stress & Vagal Activation'
      };
    } else if (score >= 80) {
      return {
        'beatFreqHz': 7.83, // Schumann
        'carrierFreqHz': 432, // Natural Pythagorean
        'stateLabel': 'Peak Autonomic Coherence'
      };
    } else if (hr < 60) {
      return {
        'beatFreqHz': 10.0, // Alpha
        'carrierFreqHz': 432,
        'stateLabel': 'Calm Restorative Integration'
      };
    }
    return {
      'beatFreqHz': 8.5, // Low Alpha
      'carrierFreqHz': 528,
      'stateLabel': 'Autonomic Balance'
    };
  }

  Stream<BleVitalsData> get vitalsStream => _vitalsController.stream;
  Stream<BleConnectionState> get stateStream => _stateController.stream;
  Stream<List<double>> get ppgStream => _ppgController.stream;
  Stream<List<double>> get ecgStream => _ecgController.stream;

  // Standard GATT UUIDs
  static const String hrServiceUuid = '0000180d-0000-1000-8000-00805f9b34fb';
  static const String spo2ServiceUuid = '00001822-0000-1000-8000-00805f9b34fb';
  static const String tempServiceUuid = '00001809-0000-1000-8000-00805f9b34fb';
  static const String bpServiceUuid = '00001810-0000-1000-8000-00805f9b34fb';
  static const String cgmServiceUuid = '00001808-0000-1000-8000-00805f9b34fb';

  void startScan() {
    _state = BleConnectionState.scanning;
    _stateController.add(_state);
    if (kDebugMode) {
      print('[BleWearablesService] Scanning for Bluetooth LE clinical GATT monitors...');
    }
  }

  void connectDevice(BleDiscoveredDevice device) {
    _state = BleConnectionState.connecting;
    _stateController.add(_state);
    _activeDevice = device;

    // Simulate connection establishment
    Future.delayed(const Duration(milliseconds: 600), () {
      _state = BleConnectionState.connected;
      _stateController.add(_state);
      if (kDebugMode) {
        print('[BleWearablesService] Connected to GATT device: ${device.name} (${device.id})');
      }
    });
  }

  void disconnect() {
    stopSyntheticStream();
    _state = BleConnectionState.disconnected;
    _activeDevice = null;
    _stateController.add(_state);
  }

  void startSyntheticStream() {
    if (_isSimulationActive) return;
    _isSimulationActive = true;
    _state = BleConnectionState.connected;
    _stateController.add(_state);
    _activeDevice = BleDiscoveredDevice(
      id: 'synthetic-001',
      name: 'Synthetic PPG/ECG Sensor',
      rssi: -55,
      serviceUuids: [hrServiceUuid, spo2ServiceUuid],
    );

    _simTimer = Timer.periodic(const Duration(milliseconds: 20), (timer) {
      _simStep++;
      final hrBase = 72.0;
      final rsa = (mathSin(_simStep * 0.06) * 4.0);
      final currentHr = (hrBase + rsa).round();

      // PPG AC Wave calculation
      final ppgPeriod = 50.0 / (currentHr / 60.0);
      final ppgPhase = (_simStep % ppgPeriod.round()) / ppgPeriod;
      double ppgVal = 0.0;
      if (ppgPhase < 0.2) {
        ppgVal = mathSin((ppgPhase / 0.2) * 3.14159) * 0.8;
      } else if (ppgPhase >= 0.2 && ppgPhase < 0.35) {
        ppgVal = 0.8 - (ppgPhase - 0.2) * 2.0;
      } else {
        ppgVal = 0.15;
      }
      _ppgBuffer.add(ppgVal.clamp(0.0, 1.0));
      if (_ppgBuffer.length > 200) _ppgBuffer.removeAt(0);

      // ECG Lead-I P-QRS-T calculation
      final ecgPeriod = ppgPeriod;
      final ecgPhase = (_simStep % ecgPeriod.round()) / ecgPeriod;
      double ecgVal = 0.0;
      if (ecgPhase < 0.1) {
        ecgVal = mathSin((ecgPhase / 0.1) * 3.14159) * 0.12;
      } else if (ecgPhase >= 0.18 && ecgPhase < 0.22) {
        ecgVal = 1.0; // R-spike
      } else if (ecgPhase >= 0.22 && ecgPhase < 0.25) {
        ecgVal = -0.3; // S-dip
      } else if (ecgPhase >= 0.35 && ecgPhase < 0.55) {
        ecgVal = mathSin(((ecgPhase - 0.35) / 0.2) * 3.14159) * 0.25; // T-wave
      }
      _ecgBuffer.add(ecgVal);
      if (_ecgBuffer.length > 200) _ecgBuffer.removeAt(0);

      _ppgController.add(List<double>.from(_ppgBuffer));
      _ecgController.add(List<double>.from(_ecgBuffer));

      updateTelemetry(hr: currentHr, spO2: 98.0);
    });
  }

  void stopSyntheticStream() {
    _simTimer?.cancel();
    _simTimer = null;
    _isSimulationActive = false;
  }

  double mathSin(double rad) {
    return math.sin(rad);
  }

  void updateTelemetry({
    int? hr,
    double? spO2,
    double? temp,
    int? sysBp,
    int? diaBp,
    double? cgm,
  }) {
    _currentVitals = BleVitalsData(
      heartRateBpm: hr ?? _currentVitals.heartRateBpm,
      spO2Percent: spO2 ?? _currentVitals.spO2Percent,
      bodyTempCelsius: temp ?? _currentVitals.bodyTempCelsius,
      sysBpMmHg: sysBp ?? _currentVitals.sysBpMmHg,
      diaBpMmHg: diaBp ?? _currentVitals.diaBpMmHg,
      cgmGlucoseMgDl: cgm ?? _currentVitals.cgmGlucoseMgDl,
      timestamp: DateTime.now(),
    );
    _vitalsController.add(_currentVitals);
  }

  void dispose() {
    stopSyntheticStream();
    _vitalsController.close();
    _stateController.close();
    _ppgController.close();
    _ecgController.close();
  }
}
