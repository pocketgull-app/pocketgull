// SPDX-License-Identifier: Apache-2.0
import 'dart:io';

const String kPocketGullFontVersion = '4.0.0';

const List<String> kCoreSrcWoff2 = [
  'PocketGull-Antigravity.woff2',
  'PocketGull-Bold.woff2',
  'PocketGull-Chiseltip.woff2',
  'PocketGull-Fineliner.woff2',
  'PocketGull-Numerics.woff2',
  'PocketGull-VF.woff2',
  'PocketGullMono-Regular.woff2',
];

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

void syncLocalFontsCss(File upstreamCss, File destCss) {
  if (!upstreamCss.existsSync()) return;
  final raw = upstreamCss.readAsStringSync();
  final woff2UrlPattern = RegExp(
    r"url\('(?:fonts/woff2/)?([^']+\.woff2)(?:\?v=[^']*)?'\)\s*format\('woff2'\)",
  );
  final ttfLinePattern = RegExp(
    r"^[ \t]*url\('[^']+\.ttf[^']*'\)\s*format\('truetype'\)[,;].*\r?\n?",
    multiLine: true,
  );

  var transformed = raw.replaceAll(ttfLinePattern, '');
  transformed = transformed.replaceAllMapped(woff2UrlPattern, (match) {
    final fileName = match.group(1)!;
    return "url('/fonts/$fileName?v=$kPocketGullFontVersion') format('woff2'), "
        "url('https://font.pocketgull.app/fonts/woff2/$fileName?v=$kPocketGullFontVersion') format('woff2')";
  });
  // Normalize any trailing comma before semicolon after stripping ttf lines
  transformed = transformed.replaceAll(RegExp(r',\s*;'), ';');
  destCss.writeAsStringSync(transformed);
  print('  [OK] Compiled v$kPocketGullFontVersion local-first fonts.css -> ${destCss.path}');
}

void main() {
  print('\n🖋️  Pocket-Gull v$kPocketGullFontVersion WOFF2 Asset Deployer (Dart)\n');

  final root = findProjectRoot();
  final sep = Platform.pathSeparator;

  final candidateSourceRoots = [
    Directory('$root${sep}..${sep}pocketgull-typeface'),
    Directory('$root${sep}..${sep}pocketgull-font'),
  ];

  Directory? sourceRoot;
  for (final dir in candidateSourceRoots) {
    if (dir.existsSync()) {
      sourceRoot = dir;
      break;
    }
  }

  if (sourceRoot == null) {
    stderr.writeln('❌ Error: Could not locate sibling ../pocketgull-typeface or ../pocketgull-font repository.');
    exit(1);
  }

  final woff2Map = <String, File>{};
  final candidateWoff2Dirs = [
    sourceRoot,
    Directory('${sourceRoot.path}${sep}fonts${sep}woff2'),
  ];

  for (final dir in candidateWoff2Dirs) {
    if (!dir.existsSync()) continue;
    for (final entry in dir.listSync()) {
      if (entry is File && entry.path.toLowerCase().endsWith('.woff2')) {
        final name = entry.uri.pathSegments.last;
        woff2Map[name] = entry;
      }
    }
  }

  if (woff2Map.isEmpty) {
    stderr.writeln('❌ Error: No .woff2 files found under ${sourceRoot.path}.');
    exit(1);
  }

  print('📦 Source Repo: ${sourceRoot.path} (${woff2Map.length} WOFF2 masters/cuts)');

  final webTargets = [
    Directory('$root${sep}public${sep}fonts'),
    Directory('$root${sep}public${sep}assets${sep}fonts'),
    Directory('$root${sep}..${sep}pocketgull-com${sep}public${sep}fonts'),
  ];

  var copiedCount = 0;
  for (final target in webTargets) {
    if (!target.parent.existsSync() && target.path.contains('pocketgull-com')) {
      continue;
    }
    if (!target.existsSync()) {
      target.createSync(recursive: true);
    }
    for (final entry in woff2Map.entries) {
      final dstFile = File('${target.path}$sep${entry.key}');
      if (entry.value.path != dstFile.path) {
        entry.value.copySync(dstFile.path);
        copiedCount++;
      }
    }
    print('  [OK] Synced ${woff2Map.length} WOFF2 files -> ${target.path}');
  }

  // Sync bundled src/assets/fonts core WOFF2 subset for CSS/Angular bundling
  final srcAssetsDir = Directory('$root${sep}src${sep}assets${sep}fonts');
  if (srcAssetsDir.existsSync()) {
    var coreSynced = 0;
    for (final coreName in kCoreSrcWoff2) {
      final srcFile = woff2Map[coreName];
      if (srcFile != null) {
        srcFile.copySync('${srcAssetsDir.path}$sep$coreName');
        coreSynced++;
        copiedCount++;
      }
    }
    print('  [OK] Synced $coreSynced core WOFF2 files -> ${srcAssetsDir.path}');
  }

  // Sync TTF + WOFF2 to native Flutter desktop/mobile target only (GreenOps web zero-TTF)
  final flutterDir = Directory('$root${sep}pocketgull_flutter${sep}assets${sep}fonts');
  final upstreamTtfDir = Directory('${sourceRoot.path}${sep}fonts${sep}ttf');
  if (flutterDir.existsSync() && upstreamTtfDir.existsSync()) {
    var flutterSynced = 0;
    for (final entity in upstreamTtfDir.listSync()) {
      if (entity is File && entity.path.toLowerCase().endsWith('.ttf')) {
        final name = entity.uri.pathSegments.last;
        entity.copySync('${flutterDir.path}$sep$name');
        flutterSynced++;
      }
    }
    print('  [OK] Synced $flutterSynced native TTFs -> ${flutterDir.path}');
  }

  syncLocalFontsCss(
    File('${sourceRoot.path}${sep}fonts.css'),
    File('$root${sep}public${sep}fonts${sep}fonts.css'),
  );

  print('\n✅ PocketGull v$kPocketGullFontVersion deployment complete! Copied $copiedCount WOFF2 assets.\n');
}
