import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pocketgull_flutter/models/physical_genomics_model.dart';
import 'package:pocketgull_flutter/services/physical_genomics_mobile_service.dart';
import 'package:pocketgull_flutter/providers/physical_genomics_provider.dart';

void main() {
  group('PhysicalGenomicsProvider Unit Tests', () {
    late PhysicalGenomicsMobileService service;

    setUp(() {
      service = PhysicalGenomicsMobileService();
    });

    test('1. Computes deterministic offline edge simulation correctly', () {
      const req = PhysicalGenomicsRequest(
        patientId: 'SYN-TEST-001',
        ecmStiffnessKpa: 8.5,
        actinTensionNn: 2.4,
        med1ConcUm: 4.5,
        brd4ConcUm: 3.2,
        hasCtcfMutation: false,
      );

      final pred = service.computeLocalEdgePrediction(req);

      expect(pred.patientId, equals('SYN-TEST-001'));
      expect(pred.tadInsulationScore, greaterThan(0.60));
      expect(pred.isPhaseSeparated, isTrue);
      expect(pred.dropletRadiusNm, greaterThan(100.0));
      expect(pred.cleavageProbability, greaterThan(0.70));
      expect(pred.lincForcePn, greaterThan(5.0));
      expect(pred.conformalIntervals.containsKey('tad_insulation'), isTrue);
    });

    test('2. Accurately simulates CTCF boundary mutation insulation loss', () {
      const req = PhysicalGenomicsRequest(
        hasCtcfMutation: true,
      );

      final pred = service.computeLocalEdgePrediction(req);

      expect(pred.tadInsulationScore, equals(0.38));
      expect(pred.fractalGlobuleGamma, equals(0.88));
      expect(pred.meanLoopSpanKb, equals(1000.0));
      expect(pred.activeLoopsCount, equals(1));
    });

    test('3. Riverpod Notifier updates paradigm, toggles dual view, and evaluates prediction', () async {
      final container = ProviderContainer(
        overrides: [
          physicalGenomicsServiceProvider.overrideWithValue(service),
        ],
      );
      addTearDown(container.dispose);

      final notifier = container.read(physicalGenomicsProvider.notifier);
      await notifier.evaluatePrediction();

      var state = container.read(physicalGenomicsProvider);
      expect(state.prediction.hasValue, isTrue);
      expect(state.activeParadigm, equals('chromatin'));
      expect(state.isDualView, isFalse);

      notifier.setActiveParadigm('linc');
      notifier.toggleDualView();
      notifier.setComparisonTarget('PHARMACOLOGICAL_RESCUE');

      state = container.read(physicalGenomicsProvider);
      expect(state.activeParadigm, equals('linc'));
      expect(state.isDualView, isTrue);
      expect(state.comparisonTarget, equals('PHARMACOLOGICAL_RESCUE'));
    });
  });
}
