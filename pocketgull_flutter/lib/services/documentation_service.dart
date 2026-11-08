import 'package:flutter/services.dart';

class DocumentationService {
  Future<String> loadMarkdown(String filename) async {
    try {
      // Strip redundant 'assets/' or 'docs/' prefixes to prevent asset 404 pathing bugs
      final String cleanName = filename
          .replaceAll('assets/docs/', '')
          .replaceAll('assets/', '')
          .replaceAll('docs/', '');
      return await rootBundle.loadString('assets/docs/$cleanName');
    } catch (e) {
      return '# Error\nCould not load documentation file: $filename ($e)';
    }
  }

  List<String> getAvailableDocs() {
    return [
      'llms.txt',
      'README.md',
      'ai_policy.md',
      'study/index.md',
    ];
  }
}
