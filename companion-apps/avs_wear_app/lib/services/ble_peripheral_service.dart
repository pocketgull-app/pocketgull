import 'dart:async';
import 'package:flutter/services.dart';
import 'ceda_biofeedback_service.dart';
import 'tactile_engine.dart';

class BlePeripheralService {
  static final BlePeripheralService _instance = BlePeripheralService._internal();
  factory BlePeripheralService() => _instance;
  BlePeripheralService._internal();

  static const _bleMethodChannel = MethodChannel('app.pocketgull.avs/ble');
  static const _hapticEventChannel = EventChannel('app.pocketgull.avs/haptic_commands');

  bool _isAdvertising = false;
  bool get isAdvertising => _isAdvertising;

  StreamSubscription? _biofeedbackSub;
  StreamSubscription? _hapticEventSub;

  Future<bool> startServer() async {
    try {
      final success = await _bleMethodChannel.invokeMethod<bool>('startGattServer') ?? false;
      _isAdvertising = success;

      if (_isAdvertising) {
        // Stream local biofeedback into GATT characteristic notifications
        _biofeedbackSub = CedaBiofeedbackService().stream.listen((snapshot) {
          _updateGattBiofeedback(snapshot);
        });

        // Listen for incoming commands from Web Bluetooth
        _hapticEventSub = _hapticEventChannel.receiveBroadcastStream().listen((dynamic event) {
          _handleIncomingHapticCode(event);
        });
      }
      return _isAdvertising;
    } catch (_) {
      _isAdvertising = false;
      return false;
    }
  }

  void _updateGattBiofeedback(BiofeedbackSnapshot snapshot) {
    try {
      _bleMethodChannel.invokeMethod('updateBiofeedback', {
        'hr': snapshot.heartRate,
        'ceda': snapshot.cedaMicrosiemens,
        'temp': snapshot.skinTempCelsius,
      });
    } catch (_) {}
  }

  void _handleIncomingHapticCode(dynamic event) {
    if (event is int) {
      switch (event) {
        case 1:
          TactileEngine().startCadence(HapticCadence.delta);
          break;
        case 2:
          TactileEngine().startCadence(HapticCadence.theta);
          break;
        case 3:
          TactileEngine().startCadence(HapticCadence.alpha);
          break;
        case 4:
          TactileEngine().startCadence(HapticCadence.beta);
          break;
        case 5:
          TactileEngine().startCadence(HapticCadence.vagalWave);
          break;
        default:
          TactileEngine().stop();
          break;
      }
    }
  }

  Future<void> stopServer() async {
    await _biofeedbackSub?.cancel();
    await _hapticEventSub?.cancel();
    _biofeedbackSub = null;
    _hapticEventSub = null;
    try {
      await _bleMethodChannel.invokeMethod('stopGattServer');
    } catch (_) {}
    _isAdvertising = false;
  }
}
