import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pocketgull_flutter/providers/clinical_moe_router_provider.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  late ProviderContainer container;

  setUp(() {
    container = ProviderContainer();
  });

  tearDown(() {
    container.dispose();
  });

  group('ClinicalMoeRouterProvider Suite (Flutter SMoE Parity)', () {
    test('1. Initializes default Flutter SMoE state with primary, secondary, and dormant shelf', () {
      final state = container.read(clinicalMoeRouterProvider);

      expect(state.scores.length, equals(7)); // 7 registered experts
      expect(state.primaryExpert, isNotNull);
      expect(state.secondaryExpert, isNotNull);
      expect(state.latentExperts.length, equals(5));
      expect(state.noiseReductionPercent, equals(71)); // (1 - 2/7) * 100
    });

    test('2. Routes RSNA Knee OA scenario to DICOM Radiology and activates Cross-Attention Bridge', () {
      final notifier = container.read(clinicalMoeRouterProvider.notifier);
      notifier.loadDemoScenario('knee_oa');

      final state = container.read(clinicalMoeRouterProvider);
      expect(state.primaryExpert?.expert.id, equals('dicom-radiology'));
      expect(state.secondaryExpert?.expert.id, equals('cgm-telemetry'));

      expect(state.activeBridge, isNotNull);
      expect(state.activeBridge?.id, equals('bridge-dicom-cgm'));
      expect(state.activeBridge?.benchmarkMetric, equals('+14% Glucose Time in Range'));
    });

    test('3. Dynamically calculates Softmax Viewport Proportioning between 55% and 72%', () {
      final notifier = container.read(clinicalMoeRouterProvider.notifier);
      notifier.loadDemoScenario('knee_oa');

      final state = container.read(clinicalMoeRouterProvider);
      expect(state.primaryViewportRatio, greaterThanOrEqualTo(55));
      expect(state.primaryViewportRatio, lessThanOrEqualTo(72));
      expect(state.primaryViewportRatio + state.secondaryViewportRatio, equals(100));
    });

    test('4. Dynamically elevates teledentistry-sibi when speech cue mentions dental keywords', () {
      final notifier = container.read(clinicalMoeRouterProvider.notifier);
      notifier.setTranscriptQuery('patient has tooth caries and bleeding periodontal pockets');

      final state = container.read(clinicalMoeRouterProvider);
      expect(state.primaryExpert?.expert.id, equals('teledentistry-sibi'));
      expect(state.primaryExpert?.routingRationale, contains('Conversational cue match'));
    });

    test('5. Promotes latent expert to primary with manual clinician pin', () {
      final notifier = container.read(clinicalMoeRouterProvider.notifier);
      notifier.promoteLatentExpert('sentinel-triage');

      final state = container.read(clinicalMoeRouterProvider);
      expect(state.primaryExpert?.expert.id, equals('sentinel-triage'));
      expect(state.pinnedExpertId, equals('sentinel-triage'));

      notifier.clearOverrides();
      final resetState = container.read(clinicalMoeRouterProvider);
      expect(resetState.pinnedExpertId, isNull);
    });

    test('6. Adjusts kValue to 1 and yields increased noise reduction', () {
      final notifier = container.read(clinicalMoeRouterProvider.notifier);
      notifier.setKValue(1);

      final state = container.read(clinicalMoeRouterProvider);
      expect(state.kValue, equals(1));
      expect(state.latentExperts.length, equals(6));
      expect(state.noiseReductionPercent, equals(86)); // (1 - 1/7) * 100
    });
  });
}
