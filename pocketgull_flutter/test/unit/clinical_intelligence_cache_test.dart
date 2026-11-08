import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:pocketgull_flutter/services/clinical_intelligence_service.dart';

void main() {
  group('ClinicalIntelligenceService KV Cache & Prefix Isolation', () {
    test('1. Separates systemInstruction from contents and preserves append-only multi-turn history', () async {
      final capturedRequests = <Map<String, dynamic>>[];

      final mockClient = MockClient((http.Request request) async {
        final body = jsonDecode(request.body) as Map<String, dynamic>;
        capturedRequests.add(body);

        final turnNumber = capturedRequests.length;
        return http.Response(
          jsonEncode({
            'candidates': [
              {
                'content': {
                  'parts': [
                    {'text': 'Response turn $turnNumber'},
                  ],
                },
              },
            ],
            'usageMetadata': {
              'promptTokenCount': 8000 + turnNumber * 100,
              'cachedContentTokenCount': turnNumber == 1 ? 0 : 7500,
              'candidatesTokenCount': 45,
            },
          }),
          200,
        );
      });

      final service = ClinicalIntelligenceService(
        apiKey: 'live_test_api_key',
        httpClient: mockClient,
      );

      await service.startChatSession('Patient: Charles Darwin, BP 128/82');
      final r1 = await service.sendChatMessage('What is the first-line vagal protocol?');
      final r2 = await service.sendChatMessage('How should we titrate morning lux?');

      expect(r1, equals('Response turn 1'));
      expect(r2, equals('Response turn 2'));
      expect(capturedRequests.length, equals(2));

      // Verify systemInstruction is isolated at top-level rather than concatenated into user text
      expect(capturedRequests[0].containsKey('systemInstruction'), isTrue);
      final sysParts = (capturedRequests[0]['systemInstruction'] as Map<String, dynamic>)['parts'] as List<dynamic>;
      expect((sysParts.first as Map<String, dynamic>)['text'], contains('Cerebella'));

      // Verify Turn 2 sent full append-only 3-turn history (user1, model1, user2)
      final turn2Contents = capturedRequests[1]['contents'] as List<dynamic>;
      expect(turn2Contents.length, equals(3));
      expect((turn2Contents[0] as Map<String, dynamic>)['role'], equals('user'));
      expect((turn2Contents[1] as Map<String, dynamic>)['role'], equals('model'));
      expect((turn2Contents[2] as Map<String, dynamic>)['role'], equals('user'));
      expect(service.lastCachedTokens, equals(7500));
      expect(service.lastTurnCacheDropped, isFalse);
    });

    test('2. Pins Explicit Context Cache (cachedContent) and detects mid-session KV cache drops', () async {
      var callIdx = 0;
      final capturedRequests = <Map<String, dynamic>>[];

      final mockClient = MockClient((http.Request request) async {
        callIdx++;
        final body = jsonDecode(request.body) as Map<String, dynamic>;
        capturedRequests.add(body);

        // Turn 1: high cache (24,500). Turn 2: sudden drop to 0!
        final cached = callIdx == 1 ? 24500 : 0;
        return http.Response(
          jsonEncode({
            'candidates': [
              {
                'content': {
                  'parts': [
                    {'text': 'Clinical output $callIdx'},
                  ],
                },
              },
            ],
            'usageMetadata': {
              'promptTokenCount': 28000,
              'cachedContentTokenCount': cached,
              'candidatesTokenCount': 60,
            },
          }),
          200,
        );
      });

      final service = ClinicalIntelligenceService(
        apiKey: 'live_test_api_key',
        httpClient: mockClient,
      );
      service.setExplicitCachedContent('cachedContents/pg-pinned-001');

      await service.startChatSession('FHIR Bundle Context');
      await service.sendChatMessage('Turn 1');
      expect(capturedRequests.first['cachedContent'], equals('cachedContents/pg-pinned-001'));
      expect(capturedRequests.first.containsKey('systemInstruction'), isFalse);
      expect(service.lastTurnCacheDropped, isFalse);

      await service.sendChatMessage('Turn 2');
      expect(service.lastTurnCacheDropped, isTrue);
    });
  });
}
