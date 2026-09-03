import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'draggable_window.dart';
import 'orp_foveal_reticle_widget.dart';
import '../providers/bionic_reading_provider.dart';

class ResearchFrameWidget extends ConsumerStatefulWidget {
  final VoidCallback onClose;

  const ResearchFrameWidget({super.key, required this.onClose});

  @override
  ConsumerState<ResearchFrameWidget> createState() => _ResearchFrameWidgetState();
}

class _ResearchFrameWidgetState extends ConsumerState<ResearchFrameWidget> {
  late final WebViewController _controller;
  final TextEditingController _searchController = TextEditingController();
  String _currentEngine = 'wiki';
  String _activeUrl = 'https://en.m.wikipedia.org/wiki/Special:Search?search=clinical+anatomy';

  static const String _defaultEvidenceText =
      'Physical genomics and mechanical stretch induce robust nuclear actin reorganization, '
      'modulating chromatin accessibility and transcriptional programs. In metabolic syndrome, '
      'wearable step cadence directly correlates with extracellular matrix stiffness (8.5 - 10.2 kPa) '
      'and cellular tension (2.4 - 3.1 nN). FDA and ISMP high-risk medication safety standards '
      'mandate Tall Man lettering for look-alike sound-alike drugs such as hydrOXYzine versus '
      'hydraLAZine, and buPROPion versus busPIRone, preventing catastrophic dispensing errors '
      'during urgent hospital triage.';

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
    if (_currentEngine == 'orp') {
      final textToLoad = query.trim().isEmpty ? _defaultEvidenceText : query.trim();
      ref.read(bionicReadingProvider.notifier).loadText(textToLoad);
      return;
    }

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
    if (_currentEngine == 'orp') return;
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
                          _buildEngineButton('pubmed', 'PubMed'),
                          _buildEngineButton('orp', 'ORP Reticle'),
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
                          hintText: _currentEngine == 'orp' ? 'Enter clinical text or search...' : 'Research patient complaint...',
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
                    if (_currentEngine != 'orp')
                      IconButton(
                        icon: const Icon(Icons.open_in_new, size: 20),
                        tooltip: 'Open in new tab',
                        onPressed: _openExternalUrl,
                        visualDensity: VisualDensity.compact,
                      ),
                  ],
                ),
              ],
            ),
          ),
          // Body: Either ORP Foveal Reticle or WebView
          Expanded(
            child: _currentEngine == 'orp'
                ? const SingleChildScrollView(
                    padding: EdgeInsets.all(16),
                    child: OrpFovealReticleWidget(),
                  )
                : WebViewWidget(controller: _controller),
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
          boxShadow: isSelected
              ? [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 2)
                ]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: isSelected
                ? (id == 'orp' ? const Color(0xFF0284C7) : Colors.black87)
                : Colors.grey,
          ),
        ),
      ),
    );
  }
}
