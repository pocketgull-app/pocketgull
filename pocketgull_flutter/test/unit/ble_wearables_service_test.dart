import 'package:flutter_test/flutter_test.dart';
import 'package:pocketgull_flutter/services/ble_wearables_service.dart';

void main() {
  group('BleWearablesService Lifecycle & Synthetic Stream Suite', () {
    late BleWearablesService bleService;

    setUp(() {
      bleService = BleWearablesService();
    });

    tearDown(() {
      bleService.disconnect();
    });

    test('initial state is disconnected with no active device', () {
      expect(bleService.state, equals(BleConnectionState.disconnected));
      expect(bleService.activeDevice, isNull);
      expect(bleService.isSimulationActive, isFalse);
    });

    test('startScan emits scanning connection state', () async {
      final states = <BleConnectionState>[];
      final subscription = bleService.stateStream.listen(states.add);

      bleService.startScan();

      await Future<void>.delayed(Duration.zero);
      expect(states, contains(BleConnectionState.scanning));
      expect(bleService.state, equals(BleConnectionState.scanning));

      await subscription.cancel();
    });

    test('connectDevice transitions through connecting and connected states', () async {
      final states = <BleConnectionState>[];
      final subscription = bleService.stateStream.listen(states.add);

      final mockDevice = BleDiscoveredDevice(
        id: 'dev-123',
        name: 'Clinical ECG Monitor',
        rssi: -48,
        serviceUuids: [BleWearablesService.hrServiceUuid],
      );

      bleService.connectDevice(mockDevice);
      expect(bleService.activeDevice, equals(mockDevice));

      // Allow simulated delay in connectDevice to fire
      await Future<void>.delayed(const Duration(milliseconds: 700));

      expect(states, containsAllInOrder([BleConnectionState.connecting, BleConnectionState.connected]));
      expect(bleService.state, equals(BleConnectionState.connected));

      await subscription.cancel();
    });

    test('startSyntheticStream streams PPG and ECG waveform buffer updates', () async {
      final ppgTraces = <List<double>>[];
      final ecgTraces = <List<double>>[];
      final vitalsList = <BleVitalsData>[];

      final subPpg = bleService.ppgStream.listen(ppgTraces.add);
      final subEcg = bleService.ecgStream.listen(ecgTraces.add);
      final subVitals = bleService.vitalsStream.listen(vitalsList.add);

      bleService.startSyntheticStream();
      expect(bleService.isSimulationActive, isTrue);

      // Wait for synthetic timer ticks (20ms interval)
      await Future<void>.delayed(const Duration(milliseconds: 150));

      expect(ppgTraces.isNotEmpty, isTrue);
      expect(ecgTraces.isNotEmpty, isTrue);
      expect(vitalsList.isNotEmpty, isTrue);

      // Verify waveform values stay bounded within valid clinical ranges
      final latestPpg = ppgTraces.last;
      final latestEcg = ecgTraces.last;

      for (final val in latestPpg) {
        expect(val >= 0.0 && val <= 1.0, isTrue);
      }
      for (final val in latestEcg) {
        expect(val >= -0.5 && val <= 1.5, isTrue);
      }

      bleService.stopSyntheticStream();
      expect(bleService.isSimulationActive, isFalse);

      await subPpg.cancel();
      await subEcg.cancel();
      await subVitals.cancel();
    });
  });
}
