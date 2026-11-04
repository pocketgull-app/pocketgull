import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Knowledge synthesis service — AI-powered insight distillation.
///
/// Flutter parity with Angular `knowledge-synthesis.service.ts`.
/// Takes unstructured clinical text and extracts structured insight nodes.

enum InsightType { urgentSignal, actionItem, context, unknown }

class InsightNode {
  final String id;
  final String title;
  final String content;
  final InsightType type;
  final int confidence;

  const InsightNode({
    required this.id,
    required this.title,
    required this.content,
    this.type = InsightType.unknown,
    this.confidence = 0,
  });

  String get typeLabel => switch (type) {
        InsightType.urgentSignal => 'Urgent Signal',
        InsightType.actionItem => 'Action Item',
        InsightType.context => 'Context',
        InsightType.unknown => 'Unknown',
      };
}

class KnowledgeSynthesisState {
  final bool isProcessing;
  final bool hasSynthesizedData;
  final List<InsightNode> insights;
  final String? error;

  const KnowledgeSynthesisState({
    this.isProcessing = false,
    this.hasSynthesizedData = false,
    this.insights = const [],
    this.error,
  });

  KnowledgeSynthesisState copyWith({
    bool? isProcessing,
    bool? hasSynthesizedData,
    List<InsightNode>? insights,
    String? error,
  }) {
    return KnowledgeSynthesisState(
      isProcessing: isProcessing ?? this.isProcessing,
      hasSynthesizedData: hasSynthesizedData ?? this.hasSynthesizedData,
      insights: insights ?? this.insights,
      error: error,
    );
  }
}

class KnowledgeSynthesisNotifier extends Notifier<KnowledgeSynthesisState> {
  @override
  KnowledgeSynthesisState build() => const KnowledgeSynthesisState();

  /// Synthesize unstructured text into structured insight nodes.
  Future<void> synthesize(String inputText) async {
    if (inputText.trim().isEmpty) return;

    state = state.copyWith(
      isProcessing: true,
      error: null,
      hasSynthesizedData: false,
    );

    try {
      // Simulated AI synthesis — in production this calls ClinicalIntelligenceService.
      await Future<void>.delayed(const Duration(milliseconds: 1200));

      final insights = _mockSynthesize(inputText);
      state = state.copyWith(
        insights: insights,
        hasSynthesizedData: true,
        isProcessing: false,
      );
    } catch (e) {
      debugPrint('[KnowledgeSynthesis] Synthesis failed: $e');
      state = state.copyWith(
        error: 'Failed to synthesize knowledge. Please try again.',
        isProcessing: false,
      );
    }
  }

  void reset() {
    state = const KnowledgeSynthesisState();
  }

  /// Mock synthesis for demo — extracts keywords and generates sample insights.
  List<InsightNode> _mockSynthesize(String text) {
    int id = 0;
    final insights = <InsightNode>[];

    if (text.toLowerCase().contains('pain') ||
        text.toLowerCase().contains('severe')) {
      insights.add(InsightNode(
        id: 'ins_${id++}',
        title: 'Acute Pain Signal Detected',
        content:
            'The input mentions pain indicators. Recommend immediate pain '
            'assessment using NRS scale and consider analgesic protocol.',
        type: InsightType.urgentSignal,
        confidence: 92,
      ));
    }

    if (text.toLowerCase().contains('vitamin') ||
        text.toLowerCase().contains('deficien')) {
      insights.add(InsightNode(
        id: 'ins_${id++}',
        title: 'Nutritional Deficiency Pattern',
        content:
            'Biomarker signals suggest potential nutritional deficiency. '
            'Recommend comprehensive metabolic panel and micronutrient testing.',
        type: InsightType.actionItem,
        confidence: 85,
      ));
    }

    insights.add(InsightNode(
      id: 'ins_${id++}',
      title: 'Clinical Context Summary',
      content:
          'Input text has been distilled into ${insights.length + 1} '
          'actionable insight nodes. Review each for clinical relevance.',
      type: InsightType.context,
      confidence: 78,
    ));

    return insights;
  }
}

final knowledgeSynthesisProvider =
    NotifierProvider<KnowledgeSynthesisNotifier, KnowledgeSynthesisState>(() {
  return KnowledgeSynthesisNotifier();
});
