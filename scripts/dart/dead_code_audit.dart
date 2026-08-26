import 'dart:io';

void main() async {
  final stopwatch = Stopwatch()..start();
  print('===============================================================');
  print('🔍 Pocket-Gull Enterprise Dead Code & Symbol Audit (Dart 3)');
  print('===============================================================\n');

  final scriptFile = File.fromUri(Platform.script);
  final rootDir = scriptFile.parent.parent.parent.path.replaceAll('\\', '/');
  final srcDir = Directory('$rootDir/src');

  if (!srcDir.existsSync()) {
    print('❌ Error: src directory not found at ${srcDir.path}');
    exit(1);
  }

  // 1. Gather all source files
  final allSourceFiles = <File>[];
  final tsFiles = <File>[];
  final allFileContents = <String, String>{};

  await for (final entity in srcDir.list(recursive: true)) {
    if (entity is File) {
      final p = entity.path.replaceAll('\\', '/');
      if (p.endsWith('.ts') || p.endsWith('.html') || p.endsWith('.css')) {
        allSourceFiles.add(entity);
        if (p.endsWith('.ts') && !p.endsWith('.spec.ts') && !p.endsWith('.d.ts')) {
          tsFiles.add(entity);
        }
        allFileContents[p] = await entity.readAsString();
      }
    }
  }

  // Also include server.ts and e2e spec files for import tracking
  final extraDirs = [Directory('$rootDir/e2e'), Directory('$rootDir/scripts')];
  for (final dir in extraDirs) {
    if (dir.existsSync()) {
      await for (final entity in dir.list(recursive: true)) {
        if (entity is File && entity.path.endsWith('.ts')) {
          final p = entity.path.replaceAll('\\', '/');
          allFileContents[p] = await entity.readAsString();
        }
      }
    }
  }

  print('📂 Scanned ${allSourceFiles.length} source files (${tsFiles.length} TypeScript implementation units)...\n');

  // Pre-tokenize all file contents into word sets for sub-second indexing
  final fileWordSets = <String, Set<String>>{};
  final allWordsCombined = <String, int>{};

  for (final entry in allFileContents.entries) {
    final words = entry.value.split(RegExp(r'[^A-Za-z0-9_$]+')).toSet();
    fileWordSets[entry.key] = words;
    for (final w in words) {
      allWordsCombined[w] = (allWordsCombined[w] ?? 0) + 1;
    }
  }

  // 2. Identify unreferenced files
  final unreferencedFiles = <String>[];
  final entrypointExclusions = [
    'src/main.ts',
    'src/main.server.ts',
    'src/server.ts',
    'src/index.html',
    'src/styles.css',
    'src/app/app.config.ts',
    'src/app/app.config.server.ts',
    'src/app/app.routes.ts',
    'src/app/app.routes.server.ts',
    'src/app/app.component.ts',
    'src/utils/security-helper.ts',
    'src/public-api.ts',
    'src/index.ts',
  ];

  for (final file in tsFiles) {
    final relPath = file.path.replaceAll('\\', '/').replaceAll('$rootDir/', '');
    if (entrypointExclusions.any((e) => relPath.endsWith(e))) continue;

    final basenameWithoutExt = file.uri.pathSegments.last.replaceAll('.ts', '');
    var isReferenced = false;

    for (final entry in allFileContents.entries) {
      if (entry.key.replaceAll('\\', '/').endsWith(relPath)) continue;
      if (entry.value.contains(basenameWithoutExt)) {
        isReferenced = true;
        break;
      }
    }

    if (!isReferenced) {
      unreferencedFiles.add(relPath);
    }
  }

  // 3. Scan for unreferenced exported symbols in services/components
  final exportedSymbolRegex = RegExp(r'export\s+(?:class|interface|type|const|function|enum)\s+([A-Za-z0-9_]+)');
  final unreferencedSymbols = <String, List<String>>{};

  for (final file in tsFiles) {
    final relPath = file.path.replaceAll('\\', '/').replaceAll('$rootDir/', '');
    final content = allFileContents[file.path.replaceAll('\\', '/')] ?? '';
    final matches = exportedSymbolRegex.allMatches(content);

    for (final m in matches) {
      final symbol = m.group(1);
      if (symbol == null || symbol.isEmpty) continue;
      // Skip Angular standard framework interfaces/decorators/tokens
      if (symbol.startsWith('I') && symbol.length <= 2) continue;
      if (['routes', 'config', 'environment', 'AppModule'].contains(symbol)) continue;

      final count = allWordsCombined[symbol] ?? 0;
      if (count <= 1) {
        unreferencedSymbols.putIfAbsent(relPath, () => []).add(symbol);
      }
    }
  }

  // 4. Output Findings Report
  print('📊 --- DEAD CODE AUDIT RESULTS ---\n');

  if (unreferencedFiles.isEmpty) {
    print('✅ Zero Unreferenced Source Files Found (100% Import Graph Reachability)');
  } else {
    print('⚠️  Unreferenced Source Files (${unreferencedFiles.length}):');
    for (final f in unreferencedFiles) {
      print('   • $f');
    }
  }

  print('');
  final totalUnusedSymbols = unreferencedSymbols.values.fold<int>(0, (sum, list) => sum + list.length);
  print('🔎 Potential Unreferenced Exported Symbols ($totalUnusedSymbols across ${unreferencedSymbols.length} files):');

  var displayCount = 0;
  for (final entry in unreferencedSymbols.entries) {
    if (displayCount++ >= 15) {
      print('   ...and ${unreferencedSymbols.length - 15} more files with local-only exports.');
      break;
    }
    print('   📄 ${entry.key}:');
    for (final sym in entry.value.take(4)) {
      print('      └─ $sym');
    }
    if (entry.value.length > 4) {
      print('      └─ ... (${entry.value.length - 4} more)');
    }
  }

  stopwatch.stop();
  print('\n⏱️  Audit completed in ${stopwatch.elapsedMilliseconds}ms.');
  print('===============================================================');
}
