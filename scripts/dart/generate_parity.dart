import 'dart:io';

String findProjectRoot() {
  var dir = File(Platform.script.toFilePath()).parent;
  while (dir.path != dir.parent.path) {
    final pkgJson = File('${dir.path}${Platform.pathSeparator}package.json');
    if (pkgJson.existsSync()) {
      return dir.path;
    }
    dir = dir.parent;
  }
  return Directory.current.path;
}

List<File> getFiles(Directory dir) {
  if (!dir.existsSync()) return [];
  return dir.listSync(recursive: true).whereType<File>().toList();
}

String extractBasename(String filePath) {
  var base = filePath.split(Platform.pathSeparator).last.split('/').last;
  base = base.replaceAll(RegExp(r'\.(component|service|directive|pipe)\.ts$'), '');
  base = base.replaceAll(RegExp(r'\.(dart|ts)$'), '');
  base = base.replaceAll(RegExp(r'_(widget|screen|bloc|provider|model|types|cubit|event|service)$'), '');
  base = base.replaceAll(RegExp(r'[-_]'), ' ');
  return base.toLowerCase().trim();
}

void main() {
  print('\n⚖️  Pocket-Gull Angular <-> Flutter Feature Parity Auditor (Dart)\n');

  final root = findProjectRoot();
  final sep = Platform.pathSeparator;

  final angularRoot = Directory('$root${sep}src');
  final flutterRoot = Directory('$root${sep}pocketgull_flutter${sep}lib');

  final angularDirs = ['components', 'services', 'directives', 'pipes'];
  final flutterDirs = ['widgets', 'screens', 'services', 'providers', 'models', 'theme'];

  final angularFiles = <File>[];
  for (final d in angularDirs) {
    angularFiles.addAll(getFiles(Directory('${angularRoot.path}$sep$d')));
  }
  final cleanAngularFiles = angularFiles.where((f) => !f.path.endsWith('.spec.ts')).toList();

  final flutterFiles = <File>[];
  for (final d in flutterDirs) {
    flutterFiles.addAll(getFiles(Directory('${flutterRoot.path}$sep$d')));
  }

  final angularMap = <String, List<String>>{};
  for (final f in cleanAngularFiles) {
    final base = extractBasename(f.path);
    final relPath = f.path.replaceFirst('$root$sep', '').replaceAll('\\', '/');
    angularMap.putIfAbsent(base, () => []).add(relPath);
  }

  final flutterMap = <String, List<String>>{};
  for (final f in flutterFiles) {
    final base = extractBasename(f.path);
    final relPath = f.path.replaceFirst('$root$sep', '').replaceAll('\\', '/');
    flutterMap.putIfAbsent(base, () => []).add(relPath);
  }

  final allKeys = {...angularMap.keys, ...flutterMap.keys}.toList()..sort();

  final buffer = StringBuffer();
  buffer.writeln('# Feature Parity Matrix\n');
  buffer.writeln('This document maps the components and services from the live Angular application to the Flutter companion suite to track architectural parity.\n');
  buffer.writeln('| Feature / Base Name | Angular (Live) | Flutter (Companion) | Status |');
  buffer.writeln('| :--- | :--- | :--- | :--- |');

  var matchCount = 0;
  var missingFlutter = 0;
  var flutterOnly = 0;

  for (final key in allKeys) {
    final angFiles = angularMap[key] ?? [];
    final fltFiles = flutterMap[key] ?? [];

    String status;
    if (angFiles.isNotEmpty && fltFiles.isEmpty) {
      status = '❌ Missing in Flutter';
      missingFlutter++;
    } else if (angFiles.isEmpty && fltFiles.isNotEmpty) {
      status = '⚠️ Flutter Only';
      flutterOnly++;
    } else {
      status = '✅ Parity';
      matchCount++;
    }

    final angStr = angFiles.isNotEmpty ? angFiles.map((f) => '`$f`').join('<br>') : '-';
    final fltStr = fltFiles.isNotEmpty ? fltFiles.map((f) => '`$f`').join('<br>') : '-';

    buffer.writeln('| **$key** | $angStr | $fltStr | $status |');
  }

  buffer.writeln('\n## Summary');
  buffer.writeln('- **Matched Features**: $matchCount');
  buffer.writeln('- **Missing in Flutter (Needs Migration)**: $missingFlutter');
  buffer.writeln('- **Flutter Only (New Architecture/Components)**: $flutterOnly');

  final outputPath = '$root${sep}parity_matrix.md';
  final docsPath = '$root${sep}docs${sep}research${sep}parity_matrix.md';
  File(outputPath).writeAsStringSync(buffer.toString());
  if (File(docsPath).existsSync()) {
    File(docsPath).writeAsStringSync(buffer.toString());
  }

  print('  [OK] Matched Features: $matchCount');
  print('  [OK] Missing in Flutter: $missingFlutter');
  print('  [OK] Flutter Only: $flutterOnly');
  print('  [OK] Parity matrix generated at: $outputPath');
  print('  [OK] Parity matrix mirrored at: $docsPath');
  print('\n✅ Parity audit complete!\n');
}
