import 'package:flutter/material.dart';
import '../models/chat_message.dart';

class InlineAgentChatWidget extends StatefulWidget {
  final List<ChatMessage> messages;
  final bool isLoading;
  final void Function(String) onSendMessage;
  final VoidCallback onClear;

  const InlineAgentChatWidget({
    super.key,
    required this.messages,
    required this.isLoading,
    required this.onSendMessage,
    required this.onClear,
  });

  @override
  State<InlineAgentChatWidget> createState() => _InlineAgentChatWidgetState();
}

class _InlineAgentChatWidgetState extends State<InlineAgentChatWidget> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void didUpdateWidget(InlineAgentChatWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.messages.length > oldWidget.messages.length) {
      _scrollToBottom();
    }
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

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFFAFAFA),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: const BoxDecoration(
              color: Color(0xFFF3F4F6),
              border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(10),
                topRight: Radius.circular(10),
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.psychology, size: 16, color: Color(0xFF689F38)),
                const SizedBox(width: 8),
                const Text(
                  'EVIDENCE FOCUS',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.0,
                    color: Color(0xFF6B7280),
                  ),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close, size: 14),
                  onPressed: widget.onClear,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  visualDensity: VisualDensity.compact,
                ),
              ],
            ),
          ),

          // Messages
          ConstrainedBox(
            constraints: const BoxConstraints(maxHeight: 300),
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(12),
              shrinkWrap: true,
              itemCount: widget.messages.length + (widget.isLoading ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == widget.messages.length) {
                  return _buildThinking();
                }
                return _buildMessage(widget.messages[index]);
              },
            ),
          ),

          // Input
          Container(
            padding: const EdgeInsets.all(10),
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: Color(0xFFE5E7EB))),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    onSubmitted: (val) {
                      if (val.trim().isNotEmpty) {
                        widget.onSendMessage(val);
                        _controller.clear();
                      }
                    },
                    style: const TextStyle(fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Ask about this clinical claim...',
                      hintStyle: const TextStyle(fontSize: 12),
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: const BorderSide(color: Color(0xFF689F38)),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                CircleAvatar(
                  radius: 14,
                  backgroundColor: const Color(0xFF1C1C1C),
                  child: IconButton(
                    icon: const Icon(Icons.arrow_upward, size: 14, color: Colors.white),
                    onPressed: () {
                      if (_controller.text.trim().isNotEmpty) {
                        widget.onSendMessage(_controller.text);
                        _controller.clear();
                      }
                    },
                    padding: EdgeInsets.zero,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessage(ChatMessage message) {
    final isAgent = message.role == MessageRole.agent;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: isAgent ? MainAxisAlignment.start : MainAxisAlignment.end,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (isAgent) ...[
            const CircleAvatar(
              radius: 10,
              backgroundColor: Color(0xFF1C1C1C),
              child: Icon(Icons.shield, size: 10, color: Colors.white),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: isAgent ? Colors.white : const Color(0xFF1C1C1C),
                borderRadius: BorderRadius.circular(10),
                border: isAgent ? Border.all(color: const Color(0xFFE5E7EB)) : null,
              ),
              child: Text(
                message.text,
                style: TextStyle(
                  fontSize: 12,
                  color: isAgent ? const Color(0xFF374151) : Colors.white,
                  height: 1.5,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildThinking() {
    return const Padding(
      padding: EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          CircleAvatar(
            radius: 10,
            backgroundColor: Color(0xFF1C1C1C),
            child: Icon(Icons.shield, size: 10, color: Colors.white),
          ),
          SizedBox(width: 8),
          Text(
            'thinking...',
            style: TextStyle(
              fontSize: 12,
              fontStyle: FontStyle.italic,
              color: Colors.grey,
            ),
          ),
        ],
      ),
    );
  }
}
