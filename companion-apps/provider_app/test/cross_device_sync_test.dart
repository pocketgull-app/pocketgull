import 'package:flutter_test/flutter_test.dart';
import 'package:provider_app/core/services/cross_device_sync_service.dart';

void main() {
  group('CrossDeviceSyncService Tests', () {
    late CrossDeviceSyncService service;

    setUp(() {
      service = CrossDeviceSyncService();
    });

    test('1. Initializes with peerSynced status and default simulated devices', () {
      expect(service.status, CrossDeviceSyncStatus.peerSynced);
      expect(service.devices.length, greaterThanOrEqualTo(2));
      expect(service.devices.any((d) => d.role == 'web-workstation'), isTrue);
    });

    test('2. Broadcasts mobile ESI triage update to outbox', () {
      final payload = service.broadcastEsiTriage(
        patientId: 'p_frida_kahlo',
        patientName: 'Frida Kahlo',
        acuityLevel: 2,
        acuityLabel: 'EMERGENT',
        rationale: 'Acute neuropathic crisis with elevated BP',
      );

      expect(service.outboxQueue.contains(payload), isTrue);
      expect(payload.type, SyncPayloadType.esiTriageUpdate);
      expect(payload.data['acuityLevel'], 2);
      expect(payload.senderRole, 'flutter-provider-mobile');
    });

    test('3. Broadcasts mobile START disaster tag to outbox', () {
      final payload = service.broadcastStartDisasterTag(
        casualtyId: 'CAS-201',
        tagColor: 'RED',
        category: 'IMMEDIATE',
        respirations: 32,
        perfusionSeconds: 3.2,
      );

      expect(service.outboxQueue.contains(payload), isTrue);
      expect(payload.type, SyncPayloadType.disasterStartUpdate);
      expect(payload.data['tagColor'], 'RED');
    });

    test('4. Ingests simulated workstation broadcast into incoming queue', () {
      final initialCount = service.incomingQueue.length;
      final payload = CrossDeviceSyncPayload(
        syncId: 'sync_test_01',
        type: SyncPayloadType.esiTriageUpdate,
        senderDeviceId: 'pg-workstation-main',
        senderRole: 'web-workstation',
        timestamp: DateTime.now().toIso8601String(),
        data: {
          'patientId': 'p_srinivasa_ramanujan',
          'acuityLevel': 2,
          'acuityLabel': 'EMERGENT',
        },
      );

      service.simulateWorkstationBroadcast(payload);
      expect(service.incomingQueue.length, initialCount + 1);
      expect(service.incomingQueue.first.senderRole, 'web-workstation');
    });
  });
}
