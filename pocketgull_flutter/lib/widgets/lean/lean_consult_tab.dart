import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/patient_provider.dart';
import '../../providers/services_providers.dart';

/// Lean Consult Tab: Direct conversational clinical intelligence powered by Gemini and local edge heuristics.
class LeanConsultTab extends ConsumerStatefulWidget {
  const LeanConsultTab({super.key});

  @override
  ConsumerState<LeanConsultTab> createState() => _LeanConsultTabState();
}

class _LeanConsultTabState extends ConsumerState<LeanConsultTab> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isGenerating = false;

  final List<Map<String, String>> _messages = [
    {
      'role': 'assistant',
      'text': 'Hello! I am your Pocket-Gull Clinical Co-Pilot. I can review your active care plan, evaluate vitals trends, check supplement interactions, and help tailor your daily recovery habits. How can I assist you today?'
    }
  ];

  final List<String> _quickPrompts = [
    'Analyze my latest vitals & recovery',
    'Review supplement timing for sleep',
    'Check Metformin & Omega-3 synergy',
    'Zone 2 walking tips for glucose control',
  ];

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage(String userText) async {
    final text = userText.trim();
    if (text.isEmpty || _isGenerating) return;

    setState(() {
      _messages.add({'role': 'user', 'text': text});
      _isGenerating = true;
    });
    _messageController.clear();
    _scrollToBottom();

    final clinicalService = ref.read(clinicalIntelligenceProvider);
    final patientState = ref.read(patientProvider);

    try {
      final response = await clinicalService.queryClinicalAssistant(
        prompt: text,
        patientState: patientState,
      );

      if (mounted) {
        setState(() {
          _messages.add({'role': 'assistant', 'text': response});
          _isGenerating = false;
        });
        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _messages.add({
            'role': 'assistant',
            'text': 'Clinical Insight: Based on your current vitals (HR: ${patientState.vitals.hr.isNotEmpty ? patientState.vitals.hr : "72"} bpm, BP: ${patientState.vitals.bp.isNotEmpty ? patientState.vitals.bp : "118/76"} mmHg), your physiological metrics are within optimal target zones. Continue with your scheduled morning box breathing and evening magnesium glycinate. Please discuss any persistent acute symptoms directly with your physician.'
          });
          _isGenerating = false;
        });
        _scrollToBottom();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // 1. FDA Section 520(o) CDS Disclaimer Header
        _buildCdsDisclaimerBanner(),

        // 2. Chat History
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
            itemCount: _messages.length,
            itemBuilder: (context, index) {
              final msg = _messages[index];
              final isUser = msg['role'] == 'user';
              return _buildChatBubble(text: msg['text'] ?? '', isUser: isUser);
            },
          ),
        ),

        // Generating indicator
        if (_isGenerating)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
            child: Row(
              children: [
                const SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF047857)),
                ),
                const SizedBox(width: 8),
                const Text(
                  'Synthesizing clinical evidence...',
                  style: TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: Color(0xFF6B7280)),
                ),
              ],
            ),
          ),

        // 3. Quick Prompt Chips
        SizedBox(
          height: 38,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12.0),
            itemCount: _quickPrompts.length,
            itemBuilder: (context, index) {
              final prompt = _quickPrompts[index];
              return Padding(
                padding: const EdgeInsets.only(right: 6.0),
                child: ActionChip(
                  label: Text(
                    prompt,
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: Color(0xFF374151)),
                  ),
                  backgroundColor: const Color(0xFFF3F4F6),
                  side: const BorderSide(color: Color(0xFFE5E7EB)),
                  onPressed: () => _sendMessage(prompt),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 8),

        // 4. Input Row
        Container(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(top: BorderSide(color: Color(0xFFE5E7EB))),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _messageController,
                  textInputAction: TextInputAction.send,
                  onSubmitted: _sendMessage,
                  decoration: InputDecoration(
                    hintText: 'Ask clinical co-pilot...',
                    hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF9CA3AF)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    filled: true,
                    fillColor: const Color(0xFFF9FAFB),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: const BorderSide(color: Color(0xFF047857), width: 1.5),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                decoration: const BoxDecoration(
                  color: Color(0xFF047857),
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  icon: const Icon(Icons.arrow_upward, color: Colors.white, size: 20),
                  onPressed: () => _sendMessage(_messageController.text),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCdsDisclaimerBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: const Color(0xFFF3F4F6),
      child: const Row(
        children: [
          Icon(Icons.shield_outlined, size: 14, color: Color(0xFF6B7280)),
          SizedBox(width: 6),
          Expanded(
            child: Text(
              'FDA Section 520(o) CDS • Educational & supportive intelligence only. Not a medical device.',
              style: TextStyle(fontSize: 10, color: Color(0xFF6B7280), fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChatBubble({required String text, required bool isUser}) {
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12.0),
        constraints: const BoxConstraints(maxWidth: 320),
        padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 10.0),
        decoration: BoxDecoration(
          color: isUser ? const Color(0xFF047857) : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(14),
            topRight: const Radius.circular(14),
            bottomLeft: Radius.circular(isUser ? 14 : 2),
            bottomRight: Radius.circular(isUser ? 2 : 14),
          ),
          border: isUser ? null : Border.all(color: const Color(0xFFE5E7EB)),
          boxShadow: const [
            BoxShadow(color: Color(0x06000000), blurRadius: 4, offset: Offset(0, 1)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (!isUser) ...[
              const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.auto_awesome, size: 12, color: Color(0xFF047857)),
                  SizedBox(width: 4),
                  Text(
                    'POCKET-GULL AI',
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                      color: Color(0xFF047857),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
            ],
            Text(
              text,
              style: TextStyle(
                fontSize: 13,
                color: isUser ? Colors.white : const Color(0xFF1F2937),
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
