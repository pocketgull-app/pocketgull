import 'package:flutter_test/flutter_test.dart';
import 'package:pocketgull_flutter/bridge/bridge_messages.dart';

void main() {
  group('NativeBridgeMessages Tests', () {
    test('parses incoming JSON request correctly', () {
      const rawJson = '{"id":"req-123","action":"GET_HEALTHKIT_VITALS","payload":{"days":7}}';
      final req = NativeBridgeRequest.fromJsonString(rawJson);

      expect(req.id, equals('req-123'));
      expect(req.action, equals(NativeBridgeAction.getHealthKitVitals));
      expect(req.payload['days'], equals(7));
    });

    test('serializes outgoing JSON response correctly', () {
      const res = NativeBridgeResponse(
        id: 'req-123',
        success: true,
        data: {'status': 'connected'},
      );

      final jsonStr = res.toJsonString();
      expect(jsonStr, contains('"id":"req-123"'));
      expect(jsonStr, contains('"success":true'));
      expect(jsonStr, contains('"status":"connected"'));
    });

    test('handles unknown action gracefully', () {
      const rawJson = '{"id":"req-999","action":"NON_EXISTENT_ACTION","payload":{}}';
      final req = NativeBridgeRequest.fromJsonString(rawJson);

      expect(req.action, equals(NativeBridgeAction.unknown));
    });
  });
}
