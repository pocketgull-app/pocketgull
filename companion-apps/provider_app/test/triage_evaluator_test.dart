import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider_app/core/models/patient.dart';
import 'package:provider_app/core/models/triage_evaluation.dart';
import 'package:provider_app/core/services/triage_evaluator.dart';
import 'package:provider_app/core/services/triage_cache_service.dart';

void main() {
  group('TriageEvaluator & Cache Service Suite', () {
    test('1. Classifies STAT trauma patient as ESI-1 with immediate wait time', () {
      final statPatient = Patient(
        id: 'emergency_casualty',
        name: 'Trauma Casualty',
        age: 28,
        gender: 'Other',
        lastVisit: '2026-10-01',
        preexistingConditions: const ['Blunt Force Trauma'],
        state: PatientState(
          vitals: const {
            'bp': '68/42',
            'hr': '155',
            'spO2': '82',
            'temp': '35.0',
          },
          patientGoals: 'Immediate life support',
        ),
      );

      final eval = TriageEvaluator.evaluate(statPatient);
      expect(eval.esiLevel, EsiLevel.esi1Stat);
      expect(eval.targetMaxWaitMinutes, 0);
      expect(eval.news2Score, greaterThanOrEqualTo(8));
      expect(eval.vitalsSummary.hasCriticalOutlier, isTrue);
      expect(eval.vitalsSummary.criticalOutliers, contains(contains('Tachycardia')));
      expect(eval.vitalsSummary.criticalOutliers, contains(contains('Hypoxemia')));
    });

    test('2. Classifies Ramanujan as ESI-2 Emergent with high NEWS2', () {
      final ramanujan = TriageCacheService.fallbackPatients.firstWhere((p) => p.id == 'p_srinivasa_ramanujan');
      final eval = TriageEvaluator.evaluate(ramanujan);

      expect(eval.esiLevel, EsiLevel.esi2Emergent);
      expect(eval.targetMaxWaitMinutes, 10);
      expect(eval.news2Score, greaterThanOrEqualTo(5));
      expect(eval.vitalsSummary.hasCriticalOutlier, isTrue);
    });

    test('3. Enforces COPPA Guardian Shield for pediatric adolescent', () {
      final poms = TriageCacheService.fallbackPatients.firstWhere((p) => p.id == 'p_poms_adolescent');
      final eval = TriageEvaluator.evaluate(poms);

      expect(eval.age, lessThan(18));
      expect(eval.accompaniedBy, isNotNull);
      expect(eval.accompaniedBy!.role, 'PARENT');
      expect(eval.accompaniedBy!.label, contains('Legal Guardian'));
    });

    test('4. Enforces ACA § 1557 Language Access for Frida Kahlo', () {
      final frida = TriageCacheService.fallbackPatients.firstWhere((p) => p.id == 'p_frida_kahlo');
      final eval = TriageEvaluator.evaluate(frida);

      expect(eval.languageAccess, isNotNull);
      expect(eval.languageAccess!.interpreterNeeded, isTrue);
      expect(eval.languageAccess!.preferredLanguage, contains('Spanish'));
      expect(eval.languageAccess!.modality, 'Certified Medical Interpreter');
      expect(eval.accompaniedBy, isNotNull);
      expect(eval.accompaniedBy!.label, contains('Mobility Aide'));
    });

    test('5. Pre-allocates SMoE Top-2 Experts with Softmax gating', () {
      final frida = TriageCacheService.fallbackPatients.firstWhere((p) => p.id == 'p_frida_kahlo');
      final eval = TriageEvaluator.evaluate(frida);

      expect(eval.predictedTopExperts.length, 2);
      expect(eval.predictedTopExperts[0].category, 'musculoskeletal');
      expect(eval.predictedTopExperts[0].icon, '🦴');
      expect(eval.predictedTopExperts[0].probabilityPercent, greaterThan(50));
      expect(eval.crossAttentionSynapse, isNotNull);
      expect(eval.crossAttentionSynapse!.title, contains('Neuro-Biomechanic'));
    });

    test('6. Exports compliant FHIR R4 Bundle with Patient and Observation entries', () {
      final evals = TriageCacheService.loadTriageEvaluations(TriageCacheService.fallbackPatients);
      expect(evals.isNotEmpty, isTrue);

      final fhirJson = TriageCacheService.exportToFhirR4Bundle();
      final Map<String, dynamic> parsed = jsonDecode(fhirJson);

      expect(parsed['resourceType'], 'Bundle');
      expect(parsed['type'], 'searchset');
      expect(parsed['total'], greaterThan(0));

      final List entries = parsed['entry'];
      final patientEntries = entries.where((e) => e['resource']['resourceType'] == 'Patient').toList();
      final obsEntries = entries.where((e) => e['resource']['resourceType'] == 'Observation').toList();

      expect(patientEntries.isNotEmpty, isTrue);
      expect(obsEntries.isNotEmpty, isTrue);

      // Verify Frida Kahlo has language-access FHIR extension
      final fridaEntry = patientEntries.firstWhere((e) => e['resource']['id'] == 'p_frida_kahlo');
      final extensions = fridaEntry['resource']['extension'] as List;
      final langExt = extensions.firstWhere((ext) => ext['url'].contains('language-access'));
      expect(langExt['valueCodeableConcept']['text'], contains('Spanish'));
    });
  });
}
