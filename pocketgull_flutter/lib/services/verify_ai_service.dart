import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:google_generative_ai/google_generative_ai.dart';

class VerificationIssue {
  final String severity;
  final String message;
  final String? suggestedFix;
  final String? claim;

  VerificationIssue({
    required this.severity,
    required this.message,
    this.suggestedFix,
    this.claim,
  });

  factory VerificationIssue.fromJson(Map<String, dynamic> json) {
    return VerificationIssue(
      severity: json['severity'] ?? 'low',
      message: json['message'] ?? '',
      suggestedFix: json['suggestedFix'],
      claim: json['claim'],
    );
  }
}

class VerificationResult {
  final String status;
  final List<VerificationIssue> issues;

  VerificationResult({required this.status, required this.issues});

  factory VerificationResult.fromJson(Map<String, dynamic> json) {
    var issuesList = json['issues'] as List? ?? [];
    return VerificationResult(
      status: json['status'] ?? 'warning',
      issues: issuesList.map((i) => VerificationIssue.fromJson(i)).toList(),
    );
  }
}

class VerifyAiService {
  final GenerativeModel _model;

  VerifyAiService({required String apiKey}) 
      : _model = GenerativeModel(
          model: 'gemini-3.5-flash',
          apiKey: apiKey,
          generationConfig: GenerationConfig(
            responseMimeType: 'application/json',
            temperature: 0.1,
          ),
        );

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
      final response = await _model.generateContent([Content.text(prompt)]);
      if (response.text == null) throw Exception("Empty response");
      
      final resultMap = jsonDecode(response.text!) as Map<String, dynamic>;
      return VerificationResult.fromJson(resultMap);
    } catch (e) {
      debugPrint('AI Verification failed: $e');
      return VerificationResult(
        status: 'warning',
        issues: [
          VerificationIssue(
            severity: 'low',
            message: 'Verification bridge failed. Please manually check transcript. Error: $e',
          )
        ],
      );
    }
  }
}
