import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import '../models/chat_message.dart';
import 'inline_agent_chat_widget.dart';

enum VerificationStatus { verified, warning, error, unverified }

class SummaryNodeWidget extends StatelessWidget {
  final String title;
  final String content;
  final VerificationStatus status;
  final bool showChat;
  final List<ChatMessage> chatMessages;
  final bool isChatLoading;
  final Function(String) onSendMessage;
  final VoidCallback? onAskAgent;
  final VoidCallback onClearChat;
  final VoidCallback? onExportFhir;

  const SummaryNodeWidget({
    super.key,
    required this.title,
    required this.content,
    this.status = VerificationStatus.unverified,
    this.showChat = false,
    this.chatMessages = const [],
    this.isChatLoading = false,
    required this.onSendMessage,
    this.onAskAgent,
    required this.onClearChat,
    this.onExportFhir,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade100),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.01),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Wrap(
              alignment: WrapAlignment.spaceBetween,
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: 8,
              runSpacing: 4,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _buildStatusDot(),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Text(
                        title.toUpperCase(),
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey,
                          letterSpacing: 1.5,
                        ),
                      ),
                    ),
                  ],
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (onExportFhir != null)
                      TextButton.icon(
                        onPressed: onExportFhir,
                        icon: const Icon(Icons.file_download_outlined, size: 14),
                        label: const Text(
                          'FHIR',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.0,
                          ),
                        ),
                        style: TextButton.styleFrom(
                          foregroundColor: const Color(0xFF6B7280),
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                      ),
                    if (onAskAgent != null)
                      TextButton.icon(
                        onPressed: onAskAgent,
                        icon: Icon(
                          showChat ? Icons.close : Icons.psychology_outlined, 
                          size: 14
                        ),
                        label: Text(
                          showChat ? 'CLOSE' : 'AGENT',
                          style: const TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.0,
                          ),
                        ),
                        style: TextButton.styleFrom(
                          foregroundColor: showChat ? Colors.grey : const Color(0xFF416B1F),
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                MarkdownBody(
                  data: content,
                  styleSheet: MarkdownStyleSheet(
                    p: const TextStyle(
                      fontSize: 14,
                      height: 1.6,
                      color: Color(0xFF1C1C1C),
                    ),
                    h1: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    h2: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    listBullet: const TextStyle(color: Color(0xFF416B1F)),
                  ),
                ),
                if (showChat)
                  InlineAgentChatWidget(
                    messages: chatMessages,
                    isLoading: isChatLoading,
                    onSendMessage: onSendMessage,
                    onClear: onClearChat,
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusDot() {
    Color color;
    switch (status) {
      case VerificationStatus.verified:
        color = Colors.green;
        break;
      case VerificationStatus.warning:
        color = Colors.orange;
        break;
      case VerificationStatus.error:
        color = Colors.red;
        break;
      case VerificationStatus.unverified:
        color = Colors.grey.shade300;
        break;
    }

    return Container(
      width: 6,
      height: 6,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
      ),
    );
  }
}
