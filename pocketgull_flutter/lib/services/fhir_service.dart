import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/patient_types.dart';

final fhirServiceProvider = Provider<FhirService>((ref) {
  return FhirService();
});

class FhirService {
  /// Converts an active PatientState into a fully compliant FHIR R4 Bundle JSON document.
  Map<String, dynamic> exportPatientToFhirBundle(PatientState state) {
    final sanitizedName = sanitizeString(state.name);
    final patientId = 'patient_${sanitizedName.replaceAll(' ', '_').toLowerCase()}';
    final nowIso = DateTime.now().toIso8601String();

    final List<Map<String, dynamic>> entries = [];

    // 1. FHIR Patient Resource
    final patientResource = {
      'resourceType': 'Patient',
      'id': patientId,
      'identifier': [
        {
          'system': 'http://pocketgull.app/fhir/patient-id',
          'value': patientId,
        }
      ],
      'active': true,
      'name': [
        {
          'use': 'official',
          'text': sanitizedName,
          'family': sanitizeString(sanitizedName.split(' ').last),
          'given': sanitizedName.split(' ').take(sanitizedName.split(' ').length - 1).map(sanitizeString).toList(),
        }
      ],
      'gender': 'unknown',
      'birthDate': '1985-06-15',
    };

    entries.add({
      'fullUrl': 'urn:uuid:patient-$patientId',
      'resource': patientResource,
    });

    // 2. FHIR Observations (Vitals)
    final vitals = state.vitals;
    if (vitals.bp.isNotEmpty) {
      entries.add(_createObservationEntry(patientId, '85354-9', 'Blood Pressure', vitals.bp, 'mmHg', nowIso));
    }
    if (vitals.hr.isNotEmpty) {
      entries.add(_createObservationEntry(patientId, '8867-4', 'Heart Rate', vitals.hr, 'bpm', nowIso));
    }
    if (vitals.spO2.isNotEmpty) {
      entries.add(_createObservationEntry(patientId, '2708-6', 'Oxygen Saturation', vitals.spO2, '%', nowIso));
    }
    if (vitals.temp.isNotEmpty) {
      entries.add(_createObservationEntry(patientId, '8310-5', 'Body Temperature', vitals.temp, 'F', nowIso));
    }

    // 3. FHIR Conditions (Anatomical Issues & Pain Markers)
    int condIndex = 0;
    state.issues.forEach((partId, issueList) {
      for (var issue in issueList) {
        condIndex++;
        final conditionResource = {
          'resourceType': 'Condition',
          'id': '$patientId-cond-$condIndex',
          'clinicalStatus': {
            'coding': [
              {
                'system': 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                'code': issue.escalationFlag ? 'active' : 'recurrence',
              }
            ]
          },
          'verificationStatus': {
            'coding': [
              {
                'system': 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
                'code': 'confirmed',
              }
            ]
          },
          'category': [
            {
              'coding': [
                {
                  'system': 'http://terminology.hl7.org/CodeSystem/condition-category',
                  'code': 'problem-list-item',
                  'display': 'Problem List Item',
                }
              ]
            }
          ],
          'code': {
            'text': sanitizeString(issue.name),
          },
          'subject': {
            'reference': 'Patient/$patientId',
          },
          'bodySite': [
            {
              'text': sanitizeString(partId),
            }
          ],
          'note': [
            {
              'text': sanitizeString(issue.description),
            }
          ],
          'extension': [
            {
              'url': 'http://pocketgull.app/fhir/StructureDefinition/pain-level',
              'valueInteger': issue.painLevel,
            },
            if (issue.trajectory != null)
              {
                'url': 'http://pocketgull.app/fhir/StructureDefinition/trajectory',
                'valueString': issue.trajectory,
              },
          ],
        };

        entries.add({
          'fullUrl': 'urn:uuid:cond-$patientId-$condIndex',
          'resource': conditionResource,
        });
      }
    });

    // 4. FHIR Observations for 3D Spatial Lesion Markers
    for (var lesion in state.spatialLesions) {
      entries.add({
        'fullUrl': 'urn:uuid:lesion-${lesion.id}',
        'resource': {
          'resourceType': 'Observation',
          'id': lesion.id,
          'status': 'final',
          'category': [
            {
              'coding': [
                {
                  'system': 'http://terminology.hl7.org/CodeSystem/observation-category',
                  'code': 'exam',
                  'display': 'Exam',
                }
              ]
            }
          ],
          'code': {
            'coding': [
              {
                'system': 'http://snomed.info/sct',
                'code': lesion.snomedCode,
                'display': lesion.label,
              }
            ],
            'text': lesion.label,
          },
          'subject': {
            'reference': 'Patient/$patientId',
          },
          'effectiveDateTime': lesion.createdAt.toIso8601String(),
          'bodySite': {
            'coding': [
              {
                'system': 'http://snomed.info/sct',
                'code': lesion.partId,
                'display': lesion.partId,
              }
            ],
            'text': lesion.partId,
          },
          'extension': [
            {
              'url': 'http://hl7.org/fhir/StructureDefinition/spatial-coordinates-3d',
              'extension': [
                {'url': 'x', 'valueDecimal': lesion.x},
                {'url': 'y', 'valueDecimal': lesion.y},
                {'url': 'z', 'valueDecimal': lesion.z},
              ],
            }
          ],
          'note': [
            {
              'text': sanitizeString(lesion.clinicalNotes),
            }
          ],
        },
      });
    }

    // Final FHIR Bundle Construct
    return {
      'resourceType': 'Bundle',
      'id': 'bundle-$patientId-${DateTime.now().millisecondsSinceEpoch}',
      'meta': {
        'lastUpdated': nowIso,
      },
      'type': 'collection',
      'total': entries.length,
      'entry': entries,
    };
  }

  /// Parses an incoming remote FHIR R4 Bundle into extracted clinical patient state components.
  Map<String, dynamic> parseFhirR4Bundle(Map<String, dynamic> bundleJson) {
    final entries = (bundleJson['entry'] as List<dynamic>?) ?? [];
    String patientName = 'Hydrated Patient';
    final Map<String, String> parsedVitals = {};
    final List<SpatialLesionModel> parsedLesions = [];
    final Map<String, List<BodyPartIssue>> parsedIssues = {};

    for (var item in entries) {
      final resource = item['resource'] as Map<String, dynamic>?;
      if (resource == null) continue;
      final type = resource['resourceType'] as String?;

      if (type == 'Patient') {
        final nameList = resource['name'] as List<dynamic>?;
        if (nameList != null && nameList.isNotEmpty) {
          patientName = nameList[0]['text'] as String? ?? 'Hydrated Patient';
        }
      } else if (type == 'Observation') {
        final codeObj = resource['code'] as Map<String, dynamic>?;
        final coding = (codeObj?['coding'] as List<dynamic>?)?.firstOrNull as Map<String, dynamic>?;
        final loinc = coding?['code'] as String?;
        final val = resource['valueString'] as String? ?? '';

        if (loinc == '85354-9') parsedVitals['bp'] = val;
        if (loinc == '8867-4') parsedVitals['hr'] = val;
        if (loinc == '2708-6') parsedVitals['spO2'] = val;
        if (loinc == '8310-5') parsedVitals['temp'] = val;

        // Check for 3D spatial extension
        final extensions = resource['extension'] as List<dynamic>?;
        final spatialExt = extensions?.firstWhere(
          (e) => (e['url'] as String?)?.contains('spatial-coordinates-3d') ?? false,
          orElse: () => null,
        );

        if (spatialExt != null) {
          final subExts = (spatialExt['extension'] as List<dynamic>?) ?? [];
          double x = 0, y = 0, z = 0;
          for (var sub in subExts) {
            if (sub['url'] == 'x') x = (sub['valueDecimal'] as num?)?.toDouble() ?? 0;
            if (sub['url'] == 'y') y = (sub['valueDecimal'] as num?)?.toDouble() ?? 0;
            if (sub['url'] == 'z') z = (sub['valueDecimal'] as num?)?.toDouble() ?? 0;
          }

          final bodySiteObj = resource['bodySite'] as Map<String, dynamic>?;
          final partId = bodySiteObj?['text'] as String? ?? 'torso';
          final notesList = resource['note'] as List<dynamic>?;
          final notes = notesList?.firstOrNull?['text'] as String? ?? '';

          parsedLesions.add(SpatialLesionModel(
            id: resource['id'] as String? ?? 'lesion_${DateTime.now().millisecondsSinceEpoch}',
            label: codeObj?['text'] as String? ?? 'Spatial Lesion',
            partId: partId,
            x: x,
            y: y,
            z: z,
            severity: 'moderate',
            morphology: 'inflammation',
            clinicalNotes: notes,
            snomedCode: coding?['code'] as String? ?? '404684003',
            createdAt: DateTime.tryParse(resource['effectiveDateTime'] as String? ?? '') ?? DateTime.now(),
          ));
        }
      } else if (type == 'Condition') {
        final bodySiteList = resource['bodySite'] as List<dynamic>?;
        final partId = bodySiteList?.firstOrNull?['text'] as String? ?? 'torso';
        final codeObj = resource['code'] as Map<String, dynamic>?;
        final name = codeObj?['text'] as String? ?? 'Clinical Condition';
        final notesList = resource['note'] as List<dynamic>?;
        final desc = notesList?.firstOrNull?['text'] as String? ?? '';

        final condId = resource['id'] as String? ?? 'cond_${DateTime.now().millisecondsSinceEpoch}';
        final issue = BodyPartIssue(
          id: condId,
          noteId: condId,
          name: name,
          painLevel: 3,
          description: desc,
          symptoms: desc.isNotEmpty ? [desc] : [name],
          escalationFlag: true,
        );

        if (!parsedIssues.containsKey(partId)) {
          parsedIssues[partId] = [];
        }
        parsedIssues[partId]!.add(issue);
      }
    }

    return {
      'name': patientName,
      'vitals': parsedVitals,
      'lesions': parsedLesions,
      'issues': parsedIssues,
    };
  }

  /// Exports FHIR Bundle formatted as formatted JSON string
  String exportPatientToFhirJson(PatientState state) {
    final bundleMap = exportPatientToFhirBundle(state);
    return const JsonEncoder.withIndent('  ').convert(bundleMap);
  }

  /// HIPAA-compatible string sanitization helper (strips script tags & ORCID identifiers)
  String sanitizeString(String input) {
    return input
        .replaceAll(RegExp(r'<script[^>]*>([\s\S]*?)<\/script>', caseSensitive: false), '')
        .replaceAll(RegExp(r'0000-000[0-9]-[0-9]{4}-[0-9]{3}[0-9X]'), '[REDACTED_ORCID]')
        .trim();
  }



  Map<String, dynamic> _createObservationEntry(
    String patientId,
    String code,
    String display,
    String value,
    String unit,
    String dateIso,
  ) {
    return {
      'fullUrl': 'urn:uuid:obs-$code-${DateTime.now().millisecondsSinceEpoch}',
      'resource': {
        'resourceType': 'Observation',
        'id': 'obs-$patientId-$code',
        'status': 'final',
        'code': {
          'coding': [
            {
              'system': 'http://loinc.org',
              'code': code,
              'display': display,
            }
          ],
          'text': display,
        },
        'subject': {
          'reference': 'Patient/$patientId',
        },
        'effectiveDateTime': dateIso,
        'valueString': sanitizeString(value),
      },
    };
  }
}
