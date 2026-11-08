// SPDX-License-Identifier: Apache-2.0
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class VerificationIssue {
  final String severity;
  final String message;
  final String? suggestedFix;
  final String? claim;

  const VerificationIssue({
    required this.severity,
    required this.message,
    this.suggestedFix,
    this.claim,
  });

  factory VerificationIssue.fromJson(Map<String, dynamic> json) {
    return VerificationIssue(
      severity: json['severity'] as String? ?? 'low',
      message: json['message'] as String? ?? '',
      suggestedFix: json['suggestedFix'] as String?,
      claim: json['claim'] as String?,
    );
  }
}

class VerificationResult {
  final String status;
  final List<VerificationIssue> issues;

  const VerificationResult({required this.status, required this.issues});

  factory VerificationResult.fromJson(Map<String, dynamic> json) {
    final issuesList = json['issues'] as List<dynamic>? ?? const <dynamic>[];
    return VerificationResult(
      status: json['status'] as String? ?? 'warning',
      issues: issuesList
          .whereType<Map<String, dynamic>>()
          .map(VerificationIssue.fromJson)
          .toList(),
    );
  }
}

class VerifyAiService {
  final String apiKey;
  final http.Client _httpClient;

  VerifyAiService({required this.apiKey, http.Client? httpClient})
      : _httpClient = httpClient ?? http.Client();

  Future<VerificationResult> verifyReportSection(
    String sectionTitle,
    String sectionContent,
    String sourceTranscript,
  ) async {
    final prompt = '''
You are a Medical Auditor AI. Your task is to verify an AI-generated clinical report section against the source patient transcript.

SOURCE TRANSCRIPT:
$sourceTranscript

REPORT SECTION[$sectionTitle]:
$sectionContent

INSTRUCTIONS:
1. Cross-reference every clinical claim in the report with the source transcript.
2. Identify any:
   - Hallucinations (claims not found in transcript)
   - Inaccuracies (claims that distort transcript facts)
   - Critical Omissions (if the section title implies something that was missed)
3. Rate the overall verification status as:
   - "verified": All claims are supported by the transcript.
   - "warning": Minor inaccuracies or unsupported claims that don't change clinical intent.
   - "error": Major hallucinations or contradictory information.

OUTPUT FORMAT:
Return a JSON object with the following structure:
{
  "status": "verified" | "warning" | "error",
  "issues": [
    {
      "severity": "low" | "medium" | "high",
      "message": "Description of the issue",
      "suggestedFix": "Corrected text based on transcript",
      "claim": "The exact substring from the generated report that is problematic"
    }
  ]
}

Return ONLY the JSON.
''';

    try {
      final uri = Uri.parse(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=$apiKey',
      );
      final response = await _httpClient.post(
        uri,
        headers: const {'Content-Type': 'application/json'},
        body: jsonEncode({
          'contents': [
            {
              'role': 'user',
              'parts': [
                {'text': prompt},
              ],
            },
          ],
          'generationConfig': {
            'responseMimeType': 'application/json',
            'temperature': 0.1,
          },
        }),
      );
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw Exception('HTTP ${response.statusCode}');
      }
      final bodyMap = jsonDecode(response.body) as Map<String, dynamic>;
      final candidates = bodyMap['candidates'] as List<dynamic>?;
      final first = candidates?.firstOrNull as Map<String, dynamic>?;
      final content = first?['content'] as Map<String, dynamic>?;
      final parts = content?['parts'] as List<dynamic>?;
      final text = (parts?.firstOrNull as Map<String, dynamic>?)?['text'] as String?;
      if (text == null) throw Exception('Empty response');

      final resultMap = jsonDecode(text) as Map<String, dynamic>;
      return VerificationResult.fromJson(resultMap);
    } catch (e) {
      debugPrint('AI Verification failed: $e');
      return VerificationResult(
        status: 'warning',
        issues: [
          VerificationIssue(
            severity: 'low',
            message: 'Verification bridge failed. Please manually check transcript. Error: $e',
          ),
        ],
      );
    }
  }
}
