import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/dictation_service.dart';
import '../services/clinical_intelligence_service.dart';
import '../providers/services_providers.dart';

class DictationModalWidget extends ConsumerStatefulWidget {
  final DictationService dictationService;
  final String partId;
  final String historicalContext;
  final VoidCallback onCancel;
  final void Function(String, ClinicalIntelligenceResult?) onAccept;

  const DictationModalWidget({
    super.key,
    required this.dictationService,
    required this.partId,
    required this.historicalContext,
    required this.onCancel,
    required this.onAccept,
  });

  @override
  ConsumerState<DictationModalWidget> createState() => _DictationModalWidgetState();
}

class _DictationModalWidgetState extends ConsumerState<DictationModalWidget> {
  late ClinicalIntelligenceService _aiService;
  bool _isSynthesizing = false;
  String? _clarificationQuestion;
  ClinicalIntelligenceResult? _latestResult;

  @override
  void initState() {
    super.initState();
    _aiService = ref.read(clinicalIntelligenceProvider);
  }

  Future<void> _handleSynthesize() async {
    final text = widget.dictationService.interimText.value;
    if (text.isEmpty) {
      widget.onAccept(text, null);
      return;
    }

    setState(() {
      _isSynthesizing = true;
      _clarificationQuestion = null;
    });

    final result = await _aiService.analyzeDictation(text, widget.partId, historicalContext: widget.historicalContext);

    if (mounted) {
      setState(() {
        _isSynthesizing = false;
        _latestResult = result;
        _clarificationQuestion = result.clarificationQuestion;
      });

      // If no clarification needed, auto-accept
      if (_clarificationQuestion == null) {
        widget.onAccept(result.symptoms, result);
      }
    }
  }

  void _handleFinalAccept() {
    // Merge latest transcription with previous symptoms if any
    final currentText = widget.dictationService.interimText.value;
    final finalSymptoms = _latestResult != null 
        ? "${_latestResult!.symptoms} $currentText".trim()
        : currentText;
        
    final finalResult = ClinicalIntelligenceResult(
      painLevel: _latestResult?.painLevel,
      symptoms: finalSymptoms,
    );
    
    widget.onAccept(finalSymptoms, finalResult);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _isSynthesizing ? const Color(0xFF689F38) : Colors.grey.withValues(alpha: 0.1), width: _isSynthesizing ? 2 : 1),
        boxShadow: [
          BoxShadow(
            color: _isSynthesizing ? const Color(0xFF689F38).withValues(alpha: 0.2) : Colors.black.withValues(alpha: 0.15),
            blurRadius: 30,
            spreadRadius: _isSynthesizing ? 5 : 0,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  if (_isSynthesizing)
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: const Color(0xFF689F38).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Center(
                        child: SizedBox(
                          width: 20, height: 20,
                          child: CircularProgressIndicator(color: Color(0xFF689F38), strokeWidth: 2),
                        ),
                      ),
                    )
                  else
                    ValueListenableBuilder<bool>(
                      valueListenable: widget.dictationService.isListeningNotifier,
                      builder: (context, isListening, child) {
                        return Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: isListening ? Colors.red.shade50 : Colors.grey.shade100,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(
                            Icons.mic,
                            color: isListening ? Colors.red : Colors.grey,
                            size: 20,
                          ),
                        );
                      },
                    ),
                  const SizedBox(width: 16),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'CLINICAL AI ORCHESTRATION',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Colors.black54,
                          letterSpacing: 1.2,
                        ),
                      ),
                      if (_isSynthesizing)
                        const Text('Synthesizing multimodal context...', style: TextStyle(fontSize: 12, color: Color(0xFF689F38)))
                      else
                        ValueListenableBuilder<bool>(
                          valueListenable: widget.dictationService.isListeningNotifier,
                          builder: (context, isListening, child) {
                            return Text(
                              isListening ? 'Listening... Speak clearly.' : 'Paused. Review your text.',
                              style: TextStyle(
                                fontSize: 12,
                                color: isListening ? Colors.red.shade700 : Colors.grey,
                              ),
                            );
                          },
                        ),
                    ],
                  ),
                ],
              ),
              IconButton(
                onPressed: widget.onCancel,
                icon: const Icon(Icons.close, color: Colors.grey),
                visualDensity: VisualDensity.compact,
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Clarification Bubble
          if (_clarificationQuestion != null) ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFBBF7D0)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.auto_awesome, color: Color(0xFF16A34A), size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      _clarificationQuestion!,
                      style: const TextStyle(color: Color(0xFF166534), fontWeight: FontWeight.w600, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Text Area
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade100),
            ),
            constraints: const BoxConstraints(minHeight: 100, maxHeight: 180),
            child: ValueListenableBuilder<String>(
              valueListenable: widget.dictationService.interimText,
              builder: (context, text, child) {
                return SingleChildScrollView(
                  child: Text(
                    text.isEmpty ? 'Start speaking to extract pain, symptoms, and context...' : text,
                    style: TextStyle(
                      fontSize: 16,
                      height: 1.5,
                      color: text.isEmpty ? Colors.grey.shade400 : Colors.black87,
                      fontStyle: text.isEmpty ? FontStyle.italic : FontStyle.normal,
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 24),

          // Actions
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              ValueListenableBuilder<bool>(
                valueListenable: widget.dictationService.isListeningNotifier,
                builder: (context, isListening, child) {
                  return ElevatedButton.icon(
                    onPressed: _isSynthesizing ? null : () {
                      if (isListening) {
                        widget.dictationService.stopListening();
                      } else {
                        // Clear text if answering clarification
                        if (_clarificationQuestion != null) {
                           widget.dictationService.interimText.value = '';
                        }
                        widget.dictationService.startListening((text, isFinal) {});
                      }
                    },
                    icon: Icon(isListening ? Icons.pause : Icons.play_arrow, size: 18),
                    label: Text(isListening ? 'PAUSE' : 'SPEAK'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isListening ? Colors.grey.shade200 : Colors.red,
                      foregroundColor: isListening ? Colors.black87 : Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.0),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  );
                },
              ),
              Row(
                children: [
                  if (_clarificationQuestion != null)
                    TextButton(
                      onPressed: _handleFinalAccept, // Skip clarification
                      style: TextButton.styleFrom(
                        foregroundColor: Colors.grey.shade600,
                        textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.0),
                      ),
                      child: const Text('SKIP & INSERT'),
                    ),
                  const SizedBox(width: 12),
                  ElevatedButton(
                    onPressed: _isSynthesizing ? null : (_clarificationQuestion != null ? _handleFinalAccept : _handleSynthesize),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF111827),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.0),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: Text(_clarificationQuestion != null ? 'ACCEPT' : 'SYNTHESIZE'),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
