import 'dart:io';

void main() {
  final componentsDir = Directory('src/components');
  if (!componentsDir.existsSync()) {
    print('Components directory does not exist.');
    return;
  }

  final files = componentsDir
      .listSync(recursive: true)
      .whereType<File>()
      .where((f) => f.path.endsWith('.component.ts') && !f.path.endsWith('.component.spec.ts'))
      .toList();

  final tierFiles = <File, int>{};

  for (final file in files) {
    final lines = file.readAsLinesSync().length;
    if (lines >= 100 && lines < 150) {
      tierFiles[file] = lines;
    }
  }

  print('=== 100-150 LOC Component Survey ===');
  print('Total components in tier: ${tierFiles.length}');

  int needingSpec = 0;
  int hasSpec = 0;

  final sortedEntries = tierFiles.entries.toList()..sort((a, b) => b.value.compareTo(a.value));

  for (final entry in sortedEntries) {
    final specPath = entry.key.path.replaceAll('.component.ts', '.component.spec.ts');
    final exists = File(specPath).existsSync();
    if (exists) {
      hasSpec++;
    } else {
      needingSpec++;
      print('[NEED SPEC] (${entry.value} LOC) ${entry.key.path.replaceAll('\\\\', '/')}');
    }
  }

  print('\nSummary: Total in tier: ${tierFiles.length} | Has spec: $hasSpec | Needing spec: $needingSpec');
}
