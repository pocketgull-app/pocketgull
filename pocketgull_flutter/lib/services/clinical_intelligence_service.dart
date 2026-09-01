import 'dart:convert';
import 'package:google_generative_ai/google_generative_ai.dart';
import '../models/orcid_profile.dart';

enum AnalysisLens {
  summaryOverview('Summary Overview'),
  functionalProtocols('Functional Protocols'),
  monitoringFollowUp('Monitoring & Follow-up'),
  patientEducation('Patient Education'),
  ybocsScreener('Y-BOCS Screener'),
  research('Research & Proteomics');

  final String title;
  const AnalysisLens(this.title);
}

class ClinicalMetrics {
  final int complexity;
  final int stability;
  final int certainty;

  ClinicalMetrics({
    required this.complexity,
    required this.stability,
    required this.certainty,
  });
}

class ClinicalIntelligenceService {
  final GenerativeModel _model;
  final String apiKey;
  ChatSession? _chatSession;

  void resetAIState() {
    _chatSession = null;
  }

  ClinicalIntelligenceService({required this.apiKey})
      : _model = GenerativeModel(
          model: 'gemini-3.5-flash',
          apiKey: apiKey.isNotEmpty ? apiKey : 'placeholder_key',
          generationConfig: GenerationConfig(
            temperature: 0.2,
          ),
        );

  final String _formattingRules = '''
FORMATTING RULES (you MUST follow these exactly):
- Use ONLY ### level headings. Never use # or ##.
- Keep paragraphs to 2–3 sentences maximum. Be concise and clinical.
- Use **bold** for key clinical terms. Never use ALL CAPS.
- Prefer bullet lists over numbered lists unless ordering matters clinically.
- Use markdown tables for structured data (labs, dosing, schedules, vitals).
- Never output raw URLs.
- Do NOT repeat the patient data back — synthesize and advise.
- Write in third person clinical voice ("The patient presents with..." not "You have...").
- CITATION INTEGRITY (UKRIO): When referencing medical literature, you MUST use a parenthetical citation [Author et al., Year].
- ACCURACY: Only cite a source if it directly supports the specific clinical claim being made.
''';

  String _getSystemInstruction(AnalysisLens lens) {
    switch (lens) {
      case AnalysisLens.summaryOverview:
        return '''You are a world-class care plan recommendation engine for a clinical decision-support tool.
Analyze the patient overview and generate a **Visit Summary Overview** structured as follows:
### Clinical Assessment
A concise 2–3 sentence synthesis of the patient's current clinical picture — key diagnoses, functional status, and risk factors.
### Priority List
A bullet list of the top 3–5 clinical priorities, ordered by urgency.
### Expanded Plan of Care
Provide a comprehensive, expanded analysis of the care plan. Break down actionable treatment steps organized by priority. For each step, include the clinical rationale, expected physiological mechanism of action, and potential alternatives.
### Goals
Short-term (2 weeks) and long-term (3 months) measurable clinical goals as bullet points.
### References (UKRIO Compliant)
A structured list of all sources cited in this report.
$_formattingRules''';
      case AnalysisLens.functionalProtocols:
        return '''You are an expert functional and integrative medicine strategist.
### Targeted Nutritional Interventions
### Lifestyle & Circadian Optimization
### Biometric Micro-Interventions
$_formattingRules''';
      case AnalysisLens.monitoringFollowUp:
        return '''You are a clinical coordinator.
### Immediate Next Steps (0-30 days)
### Ongoing (Month 1-3)
### Long-term Trajectory (6+ months)
$_formattingRules''';
      case AnalysisLens.patientEducation:
        return '''You are a patient education specialist. Translate clinical findings into plain language.
### Understanding Your Condition
### What Was Found
### Current Plan
### Important Notes
$_formattingRules''';
      default:
        return 'You are a clinical decision intelligence helper.';
    }
  }

  bool get _isMockMode => apiKey.isEmpty || apiKey == 'placeholder_key';

  Stream<String> generateReportStream(String patientData, AnalysisLens lens, {OrcidProfile? orcidProfile}) async* {
    if (_isMockMode) {
      await Future.delayed(const Duration(milliseconds: 300));
      
      final String dynamicReport = _generateDynamicFallbackReport(patientData, lens);
      final List<String> chunks = dynamicReport.split('\n');
      for (final chunk in chunks) {
        await Future.delayed(const Duration(milliseconds: 30));
        yield '$chunk\n';
      }
      return;
    }

    String sysInst = _getSystemInstruction(lens);
    if (orcidProfile != null) {
      final worksList = orcidProfile.works.map((w) {
        final year = w.year ?? 'N/A';
        final type = w.type ?? 'publication';
        final urlStr = w.url != null ? ' (URL: ${w.url!})' : '';
        return '- "${w.title}" ($year) - $type$urlStr';
      }).join('\n');

      sysInst += '\n\nCLINICIAN RESEARCH CONTEXT (ORCID ID: ${orcidProfile.orcidId}):\n'
          'The consulting clinician is ${orcidProfile.name}.\n'
          'Their research keywords include: ${orcidProfile.keywords.join(', ')}.\n'
          '$worksList';
    }

    final prompt = [
      Content.text('SYSTEM INSTRUCTIONS:\n$sysInst\n\nPATIENT DATA:\n$patientData')
    ];
    
    final responseStream = _model.generateContentStream(prompt);
    
    await for (final chunk in responseStream) {
      if (chunk.text != null) {
        yield chunk.text!;
      }
    }
  }

  String _generateDynamicFallbackReport(String patientData, AnalysisLens lens) {
    // Extract patient name or key parameters if present
    String patientName = 'Patient';
    if (patientData.contains('Charles Darwin')) {
      patientName = 'Charles Darwin';
    } else if (patientData.contains('Frida Kahlo')) {
      patientName = 'Frida Kahlo';
    } else if (patientData.contains('Phil Gear')) {
      patientName = 'Dr. Phil Gear';
    }

    switch (lens) {
      case AnalysisLens.summaryOverview:
        return '''### Clinical Assessment
$patientName presents with complex multi-system clinical indicators requiring targeted micro-interventions. Diagnostic review confirms stable cardiovascular metrics with opportunity for metabolic and autonomic optimization.

### Priority List
- **Autonomic Tone Regularization**: Implement HRV-guided respiratory pacing.
- **Inflammatory Modulation**: Reduce oxidative stress markers via targeted micronutrient timing.
- **Sleep Architecture Optimization**: Stabilize REM onset and deep slow-wave duration.

### Expanded Plan of Care
- Initiate **Circadian Light Entrainment** (10,000 lux exposure within 30 min of waking).
  *Rationale*: Resets the suprachiasmatic nucleus to stabilize cortisol rhythms.
  *Mechanism*: Suppression of early-morning melatonin and alignment of circadian phase.
- Maintain continuous vital tracking with threshold alerts for resting HR spikes > 85 bpm.
  *Rationale*: Early detection of autonomic stress or overtraining.
  *Mechanism*: Sympathetic nervous system hyperactivation tracking.
- Schedule bi-weekly biomarker matrix review.
  *Rationale*: Ensure targeted interventions are achieving metabolic stability.

### Goals
- **Short-Term (2 Weeks)**: Achieve > 15% increase in nocturnal HRV baseline.
- **Long-Term (3 Months)**: Complete functional metabolic protocol with verified biomarker stabilization.

### References (UKRIO Compliant)
- [Gull et al., 2026] *Multimodal Autonomic Optimization in Clinical Consultations.*
- [Darwin et al., 1859] *Adaptation & Stress Resilience in Biological Systems.*''';

      case AnalysisLens.functionalProtocols:
        return '''### Targeted Nutritional Interventions
- **Omega-3 Index Enhancement**: 2,000 mg EPA/DHA daily to support neuronal cell membrane fluidity.
- **Mitochondrial Support**: CoQ10 200 mg + Magnesium L-Threonate before sleep.

### Lifestyle & Circadian Optimization
- **Sleep Hygiene**: Maintain strict 22:00 sleep anchor with blue-light blockade 90 min prior.
- **Thermal Conditioning**: Contrast hydrotherapy (cold plunge 3 min at 55°F) post-exercise.

### Biometric Micro-Interventions
- Real-time breathwork pacing at 5.5 breaths/min during acute stress signals.''';

      case AnalysisLens.monitoringFollowUp:
        return '''### Immediate Next Steps (0-30 days)
- Conduct baseline blood panel (hs-CRP, Fasting Insulin, ApoB, Vitamin D3).
- Sync telemetry vitals daily via Pocket-Gull mobile suite.

### Ongoing (Month 1-3)
- Adjust nutritional protocol based on mid-term biomarker velocity.
- Re-assess Y-BOCS and stress resilience scores every 14 days.

### Long-term Trajectory (6+ months)
- Maintain preventive care plan with quarterly clinical strategy sessions.''';

      case AnalysisLens.patientEducation:
        return '''### Understanding Your Condition
Your body is adjusting well to current care steps. We are focusing on improving your energy levels, sleep quality, and daily stress resilience.

### What Was Found
Your heart rate and vital signs are steady. Small adjustments to your morning sunlight exposure and evening wind-down will help optimize recovery.

### Current Plan
- Drink 16 oz of hydration with electrolytes upon waking.
- Take 10-minute daylight walks every morning.
- Practice 5 minutes of guided breathing when feeling fatigued.

### Important Notes
Contact your care team immediately if you notice sudden changes in resting heart rate or severe fatigue.''';

      default:
        return '''### Clinical Intelligence Strategy
Strategy synthesized for $patientName based on active clinical parameters.''';
    }
  }

  Future<void> startChatSession(String patientData, {OrcidProfile? orcidProfile}) async {
    if (_isMockMode) {
      _chatSession = null;
      return;
    }
    String context = 'You are a collaborative care plan co-pilot named "Cerebella". You are assisting a doctor in refining a strategy for their patient.\n\n'
        'PATIENT DATA CONTEXT:\n$patientData\n';
        
    _chatSession = _model.startChat(history: [
      Content.model([TextPart('Understood. I am ready to assist.')])
    ]);
    
    await _chatSession!.sendMessage(Content.text('SYSTEM CONTEXT: $context'));
  }

  Future<String> sendChatMessage(String message) async {
    if (_isMockMode) {
      await Future.delayed(const Duration(milliseconds: 500));
      return 'I have analyzed the current patient data. Strategy updated for: "$message". All vital indicators and functional protocols remain aligned with clinical guidelines.';
    }
    if (_chatSession == null) {
      throw Exception('Chat session not initialized. Call startChatSession first.');
    }
    
    final response = await _chatSession!.sendMessage(Content.text(message));
    return response.text ?? 'No response generated.';
  }

  Future<String> getInitialGreeting() async {
    if (_isMockMode) {
      return 'Hello Doctor, I have reviewed the patient file and am ready to assist with care plan strategies.';
    }
    if (_chatSession == null) {
       throw Exception('Chat session not initialized.');
    }
    final response = await _chatSession!.sendMessage(
      Content.text("Start the conversation with a friendly and professional tone. Greet the doctor and confirm you have reviewed the patient's file and are ready for questions.")
    );
    return response.text ?? 'Hello Doctor, I have reviewed the patient file and am ready to assist.';
  }

  Future<String> translateReadingLevel(String text, String level) async {
    if (_isMockMode) {
      await Future.delayed(const Duration(milliseconds: 100));
      return text;
    }
    final prompt = 'REWRITE RULES:\nRewrite text for level: $level\n\nTEXT:\n$text';
    final response = await _model.generateContent([Content.text(prompt)]);
    return response.text ?? text;
  }

  Future<ClinicalIntelligenceResult> analyzeDictation(String transcription, String partId, {String historicalContext = ""}) async {
    final prompt = '''
You are a medical intake triage assistant. Analyze the patient's dictated symptoms.
Body part: $partId
Historical Context: $historicalContext
Transcription: "$transcription"

Extract the following in strict JSON format:
{
  "painLevel": int (1-10) or null if not mentioned,
  "symptoms": string (summarized concise clinical symptoms),
  "clarificationQuestion": string or null (e.g., "Is the pain sharp or dull?" if ambiguous),
  "trajectory": string or null (e.g., "rapidly_escalating", "stable", "improving"),
  "requiresEscalation": boolean (true if symptoms imply a medical emergency or immediate attention needed)
}
Return ONLY valid JSON. Do not include markdown code block formatting.
''';

    try {
      final response = await _model.generateContent([Content.text(prompt)]);
      final text = response.text?.trim() ?? '{}';
      
      // Clean up markdown block if model ignored the instruction
      final jsonString = text.replaceAll('```json', '').replaceAll('```', '').trim();
      
      final data = jsonDecode(jsonString) as Map<String, dynamic>;
      
      return ClinicalIntelligenceResult(
        painLevel: data['painLevel'] as int?,
        symptoms: data['symptoms'] as String? ?? transcription,
        clarificationQuestion: data['clarificationQuestion'] as String?,
        trajectory: data['trajectory'] as String?,
        requiresEscalation: data['requiresEscalation'] as bool? ?? false,
      );
    } catch (e) {
      // Fallback logic if AI fails or returns invalid JSON
      int? mockPain;
      String? mockQuestion;
      String? mockTrajectory;
      bool mockEscalation = false;
      
      if (transcription.toLowerCase().contains('pain') && !transcription.contains(RegExp(r'\d'))) {
        mockQuestion = 'What is the pain severity on a scale of 1-10?';
      } else if (transcription.contains(RegExp(r'\d'))) {
        final match = RegExp(r'\d').firstMatch(transcription);
        if (match != null) mockPain = int.parse(match.group(0)!);
      }

      if (transcription.toLowerCase().contains('worse') || transcription.toLowerCase().contains('escalating')) {
         mockTrajectory = 'rapidly_escalating';
         mockEscalation = true;
      }

      return ClinicalIntelligenceResult(
        painLevel: mockPain,
        symptoms: transcription,
        clarificationQuestion: mockQuestion,
        trajectory: mockTrajectory,
        requiresEscalation: mockEscalation,
      );
    }
  }
}

class ClinicalIntelligenceResult {
  final int? painLevel;
  final String symptoms;
  final String? clarificationQuestion;
  final String? trajectory;
  final bool requiresEscalation;

  ClinicalIntelligenceResult({
    this.painLevel,
    required this.symptoms,
    this.clarificationQuestion,
    this.trajectory,
    this.requiresEscalation = false,
  });
}
