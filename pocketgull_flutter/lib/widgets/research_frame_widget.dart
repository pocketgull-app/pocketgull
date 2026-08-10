import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'draggable_window.dart';

class ResearchFrameWidget extends StatefulWidget {
  final VoidCallback onClose;

  const ResearchFrameWidget({super.key, required this.onClose});

  @override
  State<ResearchFrameWidget> createState() => _ResearchFrameWidgetState();
}

class _ResearchFrameWidgetState extends State<ResearchFrameWidget> {
  late final WebViewController _controller;
  final TextEditingController _searchController = TextEditingController();
  String _currentEngine = 'wiki';
  String _activeUrl = 'https://en.m.wikipedia.org/wiki/Special:Search?search=clinical+anatomy';

  @override
  void initState() {
    super.initState();
    _controller = WebViewController();
    if (!kIsWeb) {
      _controller.setJavaScriptMode(JavaScriptMode.unrestricted);
    }
    _loadEngineUrl('clinical anatomy');
  }

  void _loadEngineUrl(String query) {
    final encoded = Uri.encodeComponent(query.trim().isEmpty ? 'clinical anatomy' : query.trim());
    String targetUrl;

    switch (_currentEngine) {
      case 'wiki':
        targetUrl = 'https://en.m.wikipedia.org/wiki/Special:Search?search=$encoded';
        break;
      case 'europepmc':
        targetUrl = 'https://europepmc.org/search?query=$encoded';
        break;
      case 'google':
        targetUrl = 'https://www.google.com/search?q=$encoded';
        break;
      case 'pubmed':
        targetUrl = 'https://pubmed.ncbi.nlm.nih.gov/?term=$encoded';
        break;
      default:
        targetUrl = 'https://en.m.wikipedia.org/wiki/Special:Search?search=$encoded';
    }

    setState(() => _activeUrl = targetUrl);
    _controller.loadRequest(Uri.parse(targetUrl));
  }

  void _performSearch() {
    _loadEngineUrl(_searchController.text);
  }

  Future<void> _openExternalUrl() async {
    final uri = Uri.parse(_activeUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return DraggableWindow(
      title: 'Research Frame',
      onClose: widget.onClose,
      child: Column(
        children: [
          // Toolbar
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    // Engine selector
                    Container(
                      padding: const EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        children: [
                          _buildEngineButton('wiki', 'Wiki'),
                          _buildEngineButton('europepmc', 'PMC'),
                          _buildEngineButton('google', 'Google'),
                          _buildEngineButton('pubmed', 'PubMed'),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Input
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        onSubmitted: (_) => _performSearch(),
                        decoration: InputDecoration(
                          hintText: 'Research patient complaint...',
                          hintStyle: const TextStyle(fontSize: 12),
                          isDense: true,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(6),
                            borderSide: BorderSide(color: Colors.grey.shade300),
                          ),
                          filled: true,
                          fillColor: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      icon: const Icon(Icons.search, size: 20),
                      onPressed: _performSearch,
                      visualDensity: VisualDensity.compact,
                    ),
                    IconButton(
                      icon: const Icon(Icons.open_in_new, size: 20),
                      tooltip: 'Open in new tab',
                      onPressed: _openExternalUrl,
                      visualDensity: VisualDensity.compact,
                    ),
                  ],
                ),
                if (_currentEngine == 'google' || _currentEngine == 'pubmed') ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFF6FF),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFFBFDBFE)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.info_outline, size: 14, color: Color(0xFF1D4ED8)),
                        const SizedBox(width: 8),
                        const Expanded(
                          child: Text(
                            'Google & PubMed restrict iframe embedding (X-Frame-Options). Click Open ↗ to view in browser.',
                            style: TextStyle(fontSize: 10, color: Color(0xFF1E40AF)),
                          ),
                        ),
                        InkWell(
                          onTap: _openExternalUrl,
                          child: const Text(
                            'Open ↗',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF1D4ED8)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
          // Browser
          Expanded(
            child: WebViewWidget(controller: _controller),
          ),
        ],
      ),
    );
  }

  Widget _buildEngineButton(String id, String label) {
    final isSelected = _currentEngine == id;
    return GestureDetector(
      onTap: () {
        setState(() => _currentEngine = id);
        _loadEngineUrl(_searchController.text);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(4),
          boxShadow: isSelected ? [
            BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 2)
          ] : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.black87 : Colors.grey,
          ),
        ),
      ),
    );
  }
}
