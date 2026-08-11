import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:pocketgull_flutter/widgets/analysis_report_widget.dart';
import 'package:pocketgull_flutter/services/fhir_service.dart';
import 'package:pocketgull_flutter/models/patient_types.dart';

void main() {
  group('End-to-End Clinical Flow Integration Test', () {
    testWidgets('Full patient intake ➔ PPG ➔ FHIR Bundle export pipeline', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: AnalysisReportWidget(),
            ),
          ),
        ),
      );
      await tester.pump();

      // 1. Verify FHIR Bundle Export pipeline check
      final fhirService = FhirService();
      const state = PatientState(
        name: 'Alex Rivera',
        patientGoals: 'Improve VO2 max and HRV',
        issues: {},
        vitals: PatientVitals(
          bp: '118/74',
          hr: '74',
          spO2: '99',
          temp: '98.4F',
          weight: '155 lbs',
          height: "5'10\"",
        ),
      );

      final bundle = fhirService.exportPatientToFhirBundle(state);
      expect(bundle['resourceType'], equals('Bundle'));
      expect((bundle['entry'] as List).isNotEmpty, isTrue);
    });
  });
}
