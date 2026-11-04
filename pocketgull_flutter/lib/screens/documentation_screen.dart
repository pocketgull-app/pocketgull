// SPDX-License-Identifier: Apache-2.0
import 'package:flutter/material.dart';
import 'package:flutter_markdown_plus/flutter_markdown_plus.dart';
import '../services/documentation_service.dart';

class DocumentationScreen extends StatefulWidget {
  final bool hideAppBar;
  final String? initialDoc;
  const DocumentationScreen({super.key, this.hideAppBar = false, this.initialDoc});

  @override
  State<DocumentationScreen> createState() => _DocumentationScreenState();
}

class _DocumentationScreenState extends State<DocumentationScreen> {
  final DocumentationService _docService = DocumentationService();
  late String _selectedDoc;
  String _content = '';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _selectedDoc = widget.initialDoc ?? 'llms.txt';
    _loadDoc();
  }

  Future<void> _loadDoc() async {
    setState(() => _isLoading = true);
    final content = await _docService.loadMarkdown(_selectedDoc);
    setState(() {
      _content = content;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final body = _isLoading
        ? const Center(child: CircularProgressIndicator())
        : Markdown(
            data: _content,
            styleSheet: MarkdownStyleSheet(
              h1: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1C1C1C)),
              h2: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1C1C1C)),
              h3: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF416B1F), letterSpacing: 1.0),
              p: const TextStyle(fontSize: 14, color: Colors.black87, height: 1.6),
              code: TextStyle(backgroundColor: Colors.grey.shade100, fontSize: 13, color: Colors.indigo),
            ),
            imageDirectory: 'assets/docs/images',
          );

    final tabs = Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Colors.grey.shade100), bottom: BorderSide(color: Colors.grey.shade100)),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _buildTab('ARCHITECTURE', 'llms.txt'),
            _buildTab('GUIDE', 'README.md'),
            _buildTab('AI POLICY', 'ai_policy.md'),
          ],
        ),
      ),
    );

    if (widget.hideAppBar) {
      return Column(
        children: [
          tabs,
          Expanded(child: body),
        ],
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: const Text(
          'POCKET GULL KNOWLEDGE BASE',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            letterSpacing: 2.0,
            color: Color(0xFF1C1C1C),
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: tabs,
        ),
      ),
      body: body,
    );
  }

  Widget _buildTab(String label, String doc) {
    final bool isSelected = _selectedDoc == doc;
    return GestureDetector(
      onTap: () {
        setState(() => _selectedDoc = doc);
        _loadDoc();
      },
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF1C1C1C) : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF1C1C1C) : Colors.grey.shade300,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.0,
            color: isSelected ? Colors.white : Colors.grey.shade600,
          ),
        ),
      ),
    );
  }
}
