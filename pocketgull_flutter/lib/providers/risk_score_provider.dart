import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'patient_provider.dart';
import '../models/patient_types.dart';
import '../services/clinical_risk_calculator.dart';
import '../services/python_bridge_service.dart';

class RiskScoreNotifier extends Notifier<RiskScoreResult> {
  bool _disposed = false;

  @override
  RiskScoreResult build() {
    _disposed = false;
    ref.onDispose(() {
      _disposed = true;
    });
    final patientState = ref.watch(patientProvider);
    Future.microtask(() => _fetchMlScore(patientState));
    return _calculateLocal(patientState);
  }

  void updateFromPatient(PatientState patientState) {
    // 1. Instantly update with local calculation
    state = _calculateLocal(patientState);

    // 2. Fetch ML score from Python backend in background
    _fetchMlScore(patientState);
  }

  static RiskScoreResult _calculateLocal(PatientState patientState) {
    int age = 0;
    final List<String> conditions = [];

    if (patientState is Patient) {
      age = patientState.age;
      conditions.addAll(patientState.preexistingConditions);
    }

    patientState.issues.forEach((partId, issuesList) {
      for (var issue in issuesList) {
        if (!conditions.contains(issue.name)) {
          conditions.add(issue.name);
        }
      }
    });

    return ClinicalRiskCalculator.calculate(
      patientState.vitals,
      age,
      conditions,
    );
  }

  Future<void> _fetchMlScore(PatientState patientState) async {
    if (_disposed) return;
    int age = 0;
    final List<String> conditions = [];

    if (patientState is Patient) {
      age = patientState.age;
      conditions.addAll(patientState.preexistingConditions);
    }

    patientState.issues.forEach((partId, issuesList) {
      for (var issue in issuesList) {
        if (!conditions.contains(issue.name)) {
          conditions.add(issue.name);
        }
      }
    });

    final hr = double.tryParse(patientState.vitals.hr) ?? 0.0;
    final bpParts = patientState.vitals.bp.split('/');
    final bpSystolic = bpParts.isNotEmpty ? (double.tryParse(bpParts[0]) ?? 0.0) : 0.0;
    final bpDiastolic = bpParts.length > 1 ? (double.tryParse(bpParts[1]) ?? 0.0) : 0.0;
    final spo2 = double.tryParse(patientState.vitals.spO2) ?? 0.0;

    final mlResult = await PythonBridgeService.fetchRiskScore(
      hr: hr,
      bpSystolic: bpSystolic,
      bpDiastolic: bpDiastolic,
      spo2: spo2,
      age: age,
      conditions: conditions,
    );

    if (!_disposed && mlResult != null) {
      // Only update state if it successfully returned
      state = mlResult;
    }
  }
}

final riskScoreProvider = NotifierProvider<RiskScoreNotifier, RiskScoreResult>(
  RiskScoreNotifier.new,
);
