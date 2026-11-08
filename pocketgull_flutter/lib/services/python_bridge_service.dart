import 'dart:convert';
import 'package:http/http.dart' as http;
import 'dart:developer' as developer;
import '../services/clinical_risk_calculator.dart';

class PythonBridgeService {
  // Use 10.0.2.2 for Android emulator to reach localhost
  // Note: For iOS simulator, localhost or 127.0.0.1 is usually sufficient, 
  // but Android emulator requires this specific alias.
  static const String baseUrl = 'http://10.0.2.2:8000';

  static Future<RiskScoreResult?> fetchRiskScore({
    required double hr,
    required double bpSystolic,
    required double bpDiastolic,
    required double spo2,
    required int age,
    required List<String> conditions,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/ml/risk-score'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'hr': hr,
          'bp_systolic': bpSystolic,
          'bp_diastolic': bpDiastolic,
          'spo2': spo2,
          'age': age,
          'conditions': conditions,
        }),
      ).timeout(const Duration(milliseconds: 1500));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        
        final String rawLevel = data['riskLevel']?.toString().toLowerCase() ?? 'low';
        RiskLevel mappedLevel;
        switch (rawLevel) {
          case 'critical':
            mappedLevel = RiskLevel.critical;
            break;
          case 'high':
            mappedLevel = RiskLevel.high;
            break;
          case 'moderate':
            mappedLevel = RiskLevel.moderate;
            break;
          case 'low':
          default:
            mappedLevel = RiskLevel.low;
        }

        final List<String> factors = (data['contributingFactors'] as List<dynamic>?)
                ?.map((e) => e.toString())
                .toList() ??
            [];

        return RiskScoreResult(
          riskLevel: mappedLevel,
          score: (data['score'] as num?)?.toDouble() ?? 0.0,
          confidence: (data['confidence'] as num?)?.toDouble() ?? 0.0,
          contributingFactors: factors,
          note: data['note'] as String? ?? 'ML Predictive Risk Engine',
        );
      } else {
        developer.log('[PythonBridgeService] Server error: ${response.statusCode}');
      }
    } catch (e) {
      developer.log('[PythonBridgeService] Fetch error or timeout: $e');
    }
    
    return null;
  }
}
