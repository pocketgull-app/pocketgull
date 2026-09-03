import 'package:flutter_test/flutter_test.dart';
import 'package:pocketgull_flutter/models/patient_types.dart';
import 'package:pocketgull_flutter/models/epistemic_models.dart';
import 'package:pocketgull_flutter/services/fhir_service.dart';

void main() {
  group('FhirService FHIR R4 Bundle Validation', () {
    late FhirService fhirService;

    setUp(() {
      fhirService = FhirService();
    });

    test('exports valid FHIR R4 collection bundle with patient, vitals, and conditions', () {
      final state = PatientState(
        name: 'Jane Curie',
        patientGoals: 'Improve stress resilience and sleep quality',
        vitals: const PatientVitals(
          bp: '120/80',
          hr: '72',
          spO2: '98%',
          temp: '98.6',
          weight: '65kg',
          height: '170cm',
        ),
        issues: {
          'head': [
            const BodyPartIssue(
              id: 'issue-1',
              noteId: 'note-1',
              name: 'Tension Headache',
              description: 'Mild throbbing pain in temporal region',
              painLevel: 4,
              symptoms: ['headache', 'tightness'],
              escalationFlag: false,
              trajectory: 'improving',
            ),
          ],
        },
      );

      final bundle = fhirService.exportPatientToFhirBundle(state);

      expect(bundle['resourceType'], equals('Bundle'));
      expect(bundle['type'], equals('collection'));

      final entries = bundle['entry'] as List<dynamic>;
      expect(entries.isNotEmpty, isTrue);

      // Verify Patient resource
      final patientEntry = entries.firstWhere((e) => e['resource']['resourceType'] == 'Patient');
      expect(patientEntry['resource']['name'][0]['text'], equals('Jane Curie'));

      // Verify Observations (Vitals)
      final obsEntries = entries.where((e) => e['resource']['resourceType'] == 'Observation').toList();
      expect(obsEntries.length, equals(4)); // BP, HR, SpO2, Temp

      // Verify Condition
      final condEntries = entries.where((e) => e['resource']['resourceType'] == 'Condition').toList();
      expect(condEntries.length, equals(1));
      expect(condEntries[0]['resource']['code']['text'], equals('Tension Headache'));
      expect(condEntries[0]['resource']['bodySite'][0]['text'], equals('head'));
    });

    test('sanitizes malicious script tags and redacts ORCID from string inputs', () {
      final state = PatientState(
        name: '<script>alert("xss")</script>Marie Curie',
        patientGoals: 'Maintain metabolic health',
        vitals: const PatientVitals(bp: '', hr: '70', spO2: '', temp: '', weight: '', height: ''),
        issues: {
          'chest': [
            const BodyPartIssue(
              id: 'issue-2',
              noteId: 'note-2',
              name: 'Chest tightness 0000-0002-1825-0097',
              description: 'Attributed to research by 0000-0003-1234-5678',
              painLevel: 2,
              symptoms: ['tightness'],
            ),
          ],
        },
      );

      final bundle = fhirService.exportPatientToFhirBundle(state);
      final jsonStr = fhirService.exportPatientToFhirJson(state);

      expect(jsonStr.contains('<script>'), isFalse, reason: 'jsonStr contains <script>: $jsonStr');
      expect(jsonStr.contains('alert("xss")'), isFalse);
      expect(jsonStr.contains('0000-0002-1825-0097'), isFalse);
      expect(jsonStr.contains('[REDACTED_ORCID]'), isTrue);

      final patientEntry = (bundle['entry'] as List<dynamic>)
          .firstWhere((e) => e['resource']['resourceType'] == 'Patient');
      expect(patientEntry['resource']['name'][0]['text'], equals('Marie Curie'));
    });

    test('exports grounded epistemic assertion and FDA Part 11 provenance seal', () {
      final state = PatientState(
        name: 'Phil Gear',
        patientGoals: 'Spinal rehabilitation and disc decompression',
        vitals: const PatientVitals(bp: '120/80', hr: '68', spO2: '99', temp: '98.6', weight: '74', height: '180'),
        issues: {},
      );

      final assertion = GroundedClinicalAssertion.defaultForPatient1();
      final bundle = fhirService.exportPatientToFhirBundle(state, assertion: assertion);

      final entries = bundle['entry'] as List<dynamic>;

      // Grounded Condition exists with extensions
      final condEntry = entries.firstWhere(
        (e) => e['resource']['resourceType'] == 'Condition' &&
               e['resource']['id'].toString().contains('epistemic-formulation'),
      );
      expect(condEntry, isNotNull);
      final condResource = condEntry['resource'] as Map<String, dynamic>;
      expect(condResource['code']['coding'][0]['code'], equals('M51.26'));

      final ext = (condResource['extension'] as List<dynamic>).firstWhere(
        (x) => x['url'] == 'http://pocketgull.app/fhir/StructureDefinition/grounded-clinical-assertion',
      );
      final nested = ext['extension'] as List<dynamic>;
      expect(nested.any((n) => n['url'] == 'null-hypothesis-h0'), isTrue);
      expect(nested.firstWhere((n) => n['url'] == 'p-value')['valueDecimal'], lessThan(0.05));
      expect(nested.firstWhere((n) => n['url'] == 'counter-hypotheses')['valueString'], contains('Sacroiliac joint'));

      // Provenance resource with signature digest
      final provEntry = entries.firstWhere((e) => e['resource']['resourceType'] == 'Provenance');
      expect(provEntry, isNotNull);
      final provResource = provEntry['resource'] as Map<String, dynamic>;
      expect(provResource['signature'], isNotEmpty);
      expect(provResource['target'], isNotEmpty);
    });
  });
}

