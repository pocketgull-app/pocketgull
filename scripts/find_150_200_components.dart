import 'dart:io';

void main() {
  final dir = Directory('src/components');
  if (!dir.existsSync()) {
    print('Directory src/components not found.');
    return;
  }

  final files = dir
      .listSync(recursive: true)
      .whereType<File>()
      .where((f) => f.path.endsWith('.component.ts') && !f.path.endsWith('.spec.ts'))
      .toList();

  final tierComponents = <Map<String, dynamic>>[];

  for (final file in files) {
    final lines = file.readAsLinesSync().length;
    if (lines >= 150 && lines <= 200) {
      final specPath = file.path.replaceAll('.component.ts', '.component.spec.ts');
      final hasSpec = File(specPath).existsSync();
      tierComponents.add({
        'path': file.path.replaceAll('\\', '/'),
        'lines': lines,
        'hasSpec': hasSpec,
      });
    }
  }

  // Sort descending by line count
  tierComponents.sort((a, b) => (b['lines'] as int).compareTo(a['lines'] as int));

  final needingSpec = tierComponents.where((c) => !(c['hasSpec'] as bool)).toList();

  print('=== Components in 150-200 LOC tier ===');
  print('Total in tier: ${tierComponents.length}');
  print('Has spec: ${tierComponents.length - needingSpec.length}');
  print('Needing spec: ${needingSpec.length}\n');

  print('Lines    | HasSpec  | File');
  print('----------------------------------------------------------------------');
  for (final c in tierComponents) {
    final linesStr = c['lines'].toString().padRight(8);
    final hasSpecStr = (c['hasSpec'] ? 'YES' : 'NO ').padRight(8);
    print('$linesStr | $hasSpecStr | ${c['path']}');
  }
}
