import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/patient_types.dart';
import '../providers/patient_provider.dart';

/// Result of a file import operation.
class ParseResult {
  final bool success;
  final String message;
  final int scansAdded;
  final int conditionsAdded;
  final int medsAdded;

  const ParseResult({
    required this.success,
    required this.message,
    this.scansAdded = 0,
    this.conditionsAdded = 0,
    this.medsAdded = 0,
  });
}

/// Import service — processes external clinical data files.
///
/// Flutter parity with Angular `import.service.ts`.
/// Supports PocketGull Native exports and FHIR R4 JSON Bundles.
class ImportService {
  final Ref _ref;

  ImportService(this._ref);

  /// Process raw JSON text from a file upload.
  ParseResult processJsonText(String text) {
    try {
      final data = jsonDecode(text) as Map<String, dynamic>;

      // Check for PocketGull Native format
      if (data['_format'] == 'pocket-gull-native') {
        return _importNative(data);
      }

      // Check for FHIR Bundle format (Epic Lucy generally comes as a Bundle)
      if (data['resourceType'] == 'Bundle' && data['entry'] is List) {
        return _importFhirBundle(data);
      }

      return const ParseResult(
        success: false,
        message: 'Unrecognized file format. Expected a PocketGull Native export or a FHIR JSON Bundle.',
      );
    } catch (e) {
      debugPrint('[ImportService] JSON parse error: $e');
      return ParseResult(success: false, message: 'Failed to parse file: $e');
    }
  }

  /// Import PocketGull native export format.
  ParseResult _importNative(Map<String, dynamic> data) {
    final p = data['patient'] as Map<String, dynamic>?;
    if (p == null || p['name'] == null) {
      return const ParseResult(success: false, message: 'Invalid PocketGull export.');
    }

    final notifier = _ref.read(patientProvider.notifier);

    // Import vitals if present
    if (p['vitals'] != null) {
      final v = p['vitals'] as Map<String, dynamic>;
      notifier.updateVitals(PatientVitals(
        bp: v['bp']?.toString() ?? '',
        hr: v['hr']?.toString() ?? '',
        temp: v['temp']?.toString() ?? '',
        spO2: v['spO2']?.toString() ?? '',
        weight: v['weight']?.toString() ?? '',
        height: v['height']?.toString() ?? '',
      ));
    }

    // Import scans
    int scansAdded = 0;
    if (p['scans'] is List) {
      for (final rawScan in p['scans'] as List<dynamic>) {
        final s = rawScan as Map<String, dynamic>;
        notifier.addScan(DiagnosticScan(
          id: s['id'] as String? ?? 'imported_${DateTime.now().millisecondsSinceEpoch}',
          type: s['type'] as String? ?? 'Unknown',
          title: s['title'] as String? ?? 'Imported Scan',
          date: s['date'] as String? ?? DateTime.now().toIso8601String().split('T')[0],
          description: s['description'] as String? ?? '',
          status: s['status'] as String? ?? 'Pending',
        ));
        scansAdded++;
      }
    }

    return ParseResult(
      success: true,
      message: 'Successfully imported native data.',
      scansAdded: scansAdded,
    );
  }

  /// Import a FHIR R4 / Epic Lucy JSON bundle.
  ParseResult _importFhirBundle(Map<String, dynamic> bundle) {
    final notifier = _ref.read(patientProvider.notifier);
    int scansAdded = 0;
    int conditionsAdded = 0;
    int medsAdded = 0;

    final entries = (bundle['entry'] as List<dynamic>?) ?? <dynamic>[];

    for (final entry in entries) {
      final resource = (entry as Map<String, dynamic>)['resource'] as Map<String, dynamic>?;
      if (resource == null) continue;

      final resourceType = resource['resourceType'] as String?;
      switch (resourceType) {
        case 'DiagnosticReport':
          _importDiagnosticReport(resource, notifier);
          scansAdded++;
          break;
        case 'DocumentReference':
          _importDocumentReference(resource, notifier);
          scansAdded++;
          break;
        case 'Condition':
          _importCondition(resource, notifier);
          conditionsAdded++;
          break;
        case 'MedicationRequest':
        case 'MedicationStatement':
          _importMedication(resource, notifier);
          medsAdded++;
          break;
        case 'Observation':
          _importObservation(resource, notifier);
          break;
      }
    }

    return ParseResult(
      success: true,
      message: 'FHIR data imported. Added $scansAdded scans, $conditionsAdded conditions, $medsAdded medications.',
      scansAdded: scansAdded,
      conditionsAdded: conditionsAdded,
      medsAdded: medsAdded,
    );
  }

  void _importDiagnosticReport(Map<String, dynamic> r, PatientNotifier notifier) {
    final scanDesc = r['conclusion'] ?? (r['code'] as Map?)?['text'] ?? 'Imported Diagnostic Report';
    final firstCategory = (r['category'] as List<dynamic>?)?.firstOrNull as Map?;
    final firstCoding = (firstCategory?['coding'] as List<dynamic>?)?.firstOrNull as Map?;
    notifier.addScan(DiagnosticScan(
      id: r['id'] as String? ?? 'fhir_scan_${DateTime.now().millisecondsSinceEpoch}',
      type: firstCoding?['display'] as String? ?? 'Lab Report',
      title: (r['code'] as Map?)?['text'] as String? ?? 'Diagnostic Report',
      date: (r['effectiveDateTime'] as String?)?.split('T')[0] ?? DateTime.now().toIso8601String().split('T')[0],
      description: scanDesc.toString(),
      status: 'Pending',
    ));
  }

  void _importDocumentReference(Map<String, dynamic> r, PatientNotifier notifier) {
    final docTitle = (r['type'] as Map?)?['text'] as String? ?? 'Clinical Document';
    final docDate = (r['date'] as String?)?.split('T')[0] ?? DateTime.now().toIso8601String().split('T')[0];
    notifier.addScan(DiagnosticScan(
      id: r['id'] as String? ?? 'fhir_doc_${DateTime.now().millisecondsSinceEpoch}',
      type: 'Document',
      title: docTitle,
      date: docDate,
      description: 'Imported Document Reference',
      status: 'Pending',
    ));
  }

  void _importCondition(Map<String, dynamic> r, PatientNotifier notifier) {
    final codings = ((r['code'] as Map?)?['coding'] as List<dynamic>?) ?? <dynamic>[];
    String westernName = '';
    String tcmPattern = '';
    String ayurvedicImbalance = '';

    for (final c in codings) {
      final system = ((c as Map)['system'] ?? '').toString().toLowerCase();
      final display = (c['display'] ?? c['code'] ?? '').toString();
      if (system.contains('tcm') || system.contains('traditional-chinese-medicine')) {
        tcmPattern = display;
      } else if (system.contains('ayur')) {
        ayurvedicImbalance = display;
      } else {
        if (westernName.isEmpty) westernName = display;
      }
    }

    if (westernName.isEmpty) {
      westernName = (r['code'] as Map?)?['text'] as String? ?? 'Unspecified Condition';
    }

    // Map to body part
    String bodyPartId = 'full_body';
    final bodySite = (r['bodySite'] as List<dynamic>?)?.firstOrNull as Map?;
    final bodySiteDisplay = (bodySite?['coding'] as List<dynamic>?)?.firstOrNull is Map
        ? ((bodySite?['coding'] as List<dynamic>).first as Map)['display']
        : bodySite?['text'];
    if (bodySiteDisplay != null) {
      bodyPartId = bodyPartMapping[bodySiteDisplay.toString().toLowerCase()] ?? bodyPartId;
    }

    notifier.addIssue(bodyPartId, BodyPartIssue(
      id: bodyPartId,
      noteId: 'imported_cond_${DateTime.now().millisecondsSinceEpoch}',
      name: westernName,
      painLevel: 5,
      description: westernName,
      symptoms: const [],
      tcmPattern: tcmPattern.isNotEmpty ? tcmPattern : null,
      ayurvedicImbalance: ayurvedicImbalance.isNotEmpty ? ayurvedicImbalance : null,
    ));
  }

  void _importMedication(Map<String, dynamic> r, PatientNotifier notifier) {
    final medConcept = r['medicationCodeableConcept'] as Map?;
    final medCodings = medConcept?['coding'] as List<dynamic>?;
    final medName = medConcept?['text'] ??
        (r['medicationReference'] as Map?)?['display'] ??
        (medCodings?.firstOrNull is Map
            ? (medCodings!.first as Map)['display']
            : null);
    if (medName != null) {
      String dosage = '';
      if (r['dosageInstruction'] is List && (r['dosageInstruction'] as List<dynamic>).isNotEmpty) {
        final firstDosage = (r['dosageInstruction'] as List<dynamic>).first as Map?;
        dosage = firstDosage?['text'] as String? ?? '';
      }
      final state = _ref.read(patientProvider);
      final meds = List<DynamicMarker>.from(state.medications ?? <DynamicMarker>[]);
      meds.add(DynamicMarker(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        name: medName.toString(),
        value: dosage,
      ));
      notifier.updateMedications(meds);
    }
  }

  void _importObservation(Map<String, dynamic> obs, PatientNotifier notifier) {
    final codings = ((obs['code'] as Map?)?['coding'] as List<dynamic>?) ?? <dynamic>[];
    final loincEntry = codings.cast<Map<dynamic, dynamic>>().firstWhere(
      (c) => c['system'] == 'http://loinc.org',
      orElse: () => <dynamic, dynamic>{},
    );
    final loincCode = loincEntry['code'];
    final value = (obs['valueQuantity'] as Map?)?['value'];
    if (loincCode == null || value == null) return;

    final state = _ref.read(patientProvider);
    final vitals = state.vitals;

    switch (loincCode) {
      case '8867-4': // Heart Rate
        notifier.updateVitals(PatientVitals(
          bp: vitals.bp, hr: value.toString(), temp: vitals.temp,
          spO2: vitals.spO2, weight: vitals.weight, height: vitals.height,
        ));
        break;
      case '3141-9':
      case '29463-7': // Weight
        final unit = (obs['valueQuantity'] as Map?)?['unit'] ?? 'lbs';
        notifier.updateVitals(PatientVitals(
          bp: vitals.bp, hr: vitals.hr, temp: vitals.temp,
          spO2: vitals.spO2, weight: '$value $unit', height: vitals.height,
        ));
        break;
      case '85354-9': // Blood Pressure panel
        final components = (obs['component'] as List<dynamic>?) ?? <dynamic>[];
        String sys = '', dia = '';
        for (final comp in components) {
          final compMap = comp as Map;
          final compCodings = ((compMap['code'] as Map?)?['coding'] as List<dynamic>?) ?? <dynamic>[];
          final compLoinc = compCodings.cast<Map<dynamic, dynamic>>().firstWhere(
            (c) => c['system'] == 'http://loinc.org',
            orElse: () => <dynamic, dynamic>{},
          );
          final valQuantity = compMap['valueQuantity'] as Map?;
          if (compLoinc['code'] == '8480-6') sys = (valQuantity?['value'] ?? '').toString();
          if (compLoinc['code'] == '8462-4') dia = (valQuantity?['value'] ?? '').toString();
        }
        if (sys.isNotEmpty && dia.isNotEmpty) {
          notifier.updateVitals(PatientVitals(
            bp: '$sys/$dia', hr: vitals.hr, temp: vitals.temp,
            spO2: vitals.spO2, weight: vitals.weight, height: vitals.height,
          ));
        }
        break;
    }
  }
}

final importServiceProvider = Provider<ImportService>((ref) {
  return ImportService(ref);
});
