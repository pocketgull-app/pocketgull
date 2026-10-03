import 'dart:io';

void main() {
  final dir = Directory('src/components');
  if (!dir.existsSync()) {
    print('Directory src/components does not exist.');
    return;
  }

  final files = dir.listSync(recursive: true);
  final List<Map<String, dynamic>> results = [];

  for (final file in files) {
    if (file is File && file.path.endsWith('.component.ts') && !file.path.endsWith('.component.spec.ts')) {
      final lines = file.readAsLinesSync().length;
      final specPath = file.path.replaceAll('.component.ts', '.component.spec.ts');
      final hasSpec = File(specPath).existsSync();

      if (lines >= 200 && lines <= 250) {
        results.add({
          'path': file.path.replaceAll('\\', '/'),
          'name': file.uri.pathSegments.last,
          'lines': lines,
          'hasSpec': hasSpec,
        });
      }
    }
  }

  results.sort((a, b) => (b['lines'] as int).compareTo(a['lines'] as int));

  print('=== Components in 200-250 LOC tier ===');
  print('Total in tier: ${results.length}');
  final needingSpec = results.where((r) => r['hasSpec'] == false).toList();
  print('Needing spec: ${needingSpec.length}\n');

  print('${"Lines".padRight(8)} | ${"HasSpec".padRight(8)} | File');
  print('-' * 70);
  for (final r in results) {
    final status = r['hasSpec'] ? 'YES' : 'NO';
    print('${r['lines'].toString().padRight(8)} | ${status.padRight(8)} | ${r['path']}');
  }
}
