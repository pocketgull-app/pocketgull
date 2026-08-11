import 'package:flutter_test/flutter_test.dart';
import 'package:pocketgull_flutter/services/fhir_service.dart';
import 'package:pocketgull_flutter/models/patient_types.dart';

void main() {
  group('FHIR R4 Bundle Serialization & HIPAA Compliance Suite', () {
    late FhirService fhirService;

    setUp(() {
      fhirService = FhirService();
    });

    test('exports complete FHIR R4 Bundle JSON structure', () {
      const state = PatientState(
        name: 'Marie Curie',
        patientGoals: 'Maintain metabolic homeostasis',
        issues: {},
        vitals: PatientVitals(
          bp: '120/80',
          hr: '72',
          spO2: '98',
          temp: '98.6F',
          weight: '140 lbs',
          height: "5'6\"",
        ),
      );

      final bundle = fhirService.exportPatientToFhirBundle(state);

      expect(bundle['resourceType'], equals('Bundle'));
      expect(bundle['type'], equals('collection'));
      expect(bundle['entry'], isA<List>());

      final entries = bundle['entry'] as List;
      expect(entries.isNotEmpty, isTrue);

      final patientEntry = entries.firstWhere(
        (e) => e['resource']['resourceType'] == 'Patient',
      );
      expect(patientEntry['resource']['name'][0]['text'], equals('Marie Curie'));
    });

    test('sanitizes strings against HTML injection', () {
      const state = PatientState(
        name: '<script>alert("xss")</script>John Doe',
        patientGoals: 'Safe intake',
        issues: {},
        vitals: PatientVitals(
          bp: '118/76',
          hr: '70',
          temp: '98.2F',
          spO2: '98',
          weight: '160 lbs',
          height: "5'10\"",
        ),
      );

      final bundle = fhirService.exportPatientToFhirBundle(state);
      final entries = bundle['entry'] as List;
      final patientResource = entries[0]['resource'];

      expect(patientResource['name'][0]['text'], isNot(contains('<script>')));
      expect(patientResource['name'][0]['text'], contains('John Doe'));
    });
  });
}
