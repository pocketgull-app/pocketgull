import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/patient_provider.dart';
import '../models/patient_types.dart';

/// Biometric import service — CSV/JSON file parser for wearable data.
///
/// Flutter parity with Angular `biometric-import.service.ts`.
/// Parses Google Fit/Takeout JSON and generic CSV formats for
/// biometric telemetry (HR, BP, SpO2, HRV, Coherence, Breathing).

class BiometricImportService {
  final Ref _ref;

  BiometricImportService(this._ref);

  /// Import from raw file content.
  Future<int> importFileContent(String content, String fileName) async {
    final lower = fileName.toLowerCase();

    if (lower.endsWith('.json')) {
      return _parseJson(content);
    } else if (lower.endsWith('.csv')) {
      return _parseCsv(content);
    } else {
      throw Exception(
          'Unsupported file format. Please provide a CSV or JSON file.');
    }
  }

  /// Parse a JSON array of biometric entries.
  int _parseJson(String content) {
    try {
      final data = jsonDecode(content);
      final entries = <BiometricEntry>[];

      List<dynamic> items;
      if (data is List) {
        items = data;
      } else if (data is Map && data['entries'] is List) {
        items = data['entries'] as List<dynamic>;
      } else {
        throw Exception('Unexpected JSON structure.');
      }

      for (final item in items) {
        if (_isValidEntry(item)) {
          entries.add(BiometricEntry(
            timestamp: item['timestamp'] as String,
            type: item['type'] as String,
            value: '${item['value']}',
            source: item['source'] as String? ?? 'JSON Upload',
          ));
        }
      }

      if (entries.isNotEmpty) {
        for (final entry in entries) {
          _ref.read(patientProvider.notifier).addBiometricEntry(entry);
        }
      }
      return entries.length;
    } catch (e) {
      debugPrint('[BiometricImport] JSON parse failed: $e');
      throw Exception('Malformed JSON biometric data.');
    }
  }

  /// Parse a CSV file with headers.
  int _parseCsv(String content) {
    try {
      final lines = content.split('\n');
      if (lines.length < 2) return 0;

      final headers =
          lines[0].split(',').map((h) => h.trim().toLowerCase()).toList();
      final entries = <BiometricEntry>[];

      for (int i = 1; i < lines.length; i++) {
        final row = lines[i].split(',').map((v) => v.trim()).toList();
        if (row.length < headers.length) continue;

        String? timestamp;
        String? type;
        String? value;

        for (int j = 0; j < headers.length; j++) {
          final header = headers[j];
          if (header.contains('time') || header.contains('date')) {
            timestamp = row[j];
          } else if (header.contains('type')) {
            type = row[j];
          } else if (header.contains('value')) {
            value = row[j];
          }
        }

        // Heuristic mapping for typed columns.
        if (type == null) {
          final hrIdx = headers.indexWhere(
              (h) => h == 'heart_rate' || h == 'hr');
          if (hrIdx >= 0 && row[hrIdx].isNotEmpty) {
            entries.add(BiometricEntry(
              timestamp: timestamp ?? DateTime.now().toIso8601String(),
              type: 'hr',
              value: row[hrIdx],
              source: 'CSV Upload',
            ));
          }

          final sysIdx = headers.indexWhere((h) => h == 'systolic');
          final diaIdx = headers.indexWhere((h) => h == 'diastolic');
          if (sysIdx >= 0 &&
              diaIdx >= 0 &&
              row[sysIdx].isNotEmpty &&
              row[diaIdx].isNotEmpty) {
            entries.add(BiometricEntry(
              timestamp: timestamp ?? DateTime.now().toIso8601String(),
              type: 'bp',
              value: '${row[sysIdx]}/${row[diaIdx]}',
              source: 'CSV Upload',
            ));
          }
        } else if (timestamp != null && value != null) {
          entries.add(BiometricEntry(
            timestamp: timestamp,
            type: type,
            value: value,
            source: 'CSV Upload',
          ));
        }
      }

      if (entries.isNotEmpty) {
        for (final entry in entries) {
          _ref.read(patientProvider.notifier).addBiometricEntry(entry);
        }
      }
      return entries.length;
    } catch (e) {
      debugPrint('[BiometricImport] CSV parse failed: $e');
      throw Exception('Malformed CSV biometric data.');
    }
  }

  bool _isValidEntry(dynamic item) {
    return item is Map &&
        item.containsKey('timestamp') &&
        item.containsKey('type') &&
        item.containsKey('value');
  }
}

final biometricImportServiceProvider = Provider<BiometricImportService>((ref) {
  return BiometricImportService(ref);
});
