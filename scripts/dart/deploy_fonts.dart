// SPDX-License-Identifier: Apache-2.0
import 'dart:io';

/// PocketGull v4.0.0 Font Deployer (npm @pocketgull/font + CDN-First GreenOps)
///
/// Web builds pull core WOFF2 fonts directly from `@pocketgull/font@4.0.0` (npm)
/// and extended cuts from `https://font.pocketgull.app/fonts/woff2/` (CDN-first).
/// Raw `.ttf` files are ONLY synced to native Flutter (`pocketgull_flutter/assets/fonts/`).
const String kPocketGullFontVersion = '4.0.0';

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

void syncCdnFirstFontsCss(File upstreamCss, File destCss) {
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
    return "url('https://font.pocketgull.app/fonts/woff2/$fileName?v=$kPocketGullFontVersion') format('woff2')";
  });
  transformed = transformed.replaceAll(RegExp(r',\s*;'), ';');
  destCss.writeAsStringSync(transformed);
  print('  [OK] Compiled v$kPocketGullFontVersion CDN-first WOFF2 fonts.css -> ${destCss.path}');
}

void main() {
  print('\n🖋️  Pocket-Gull v$kPocketGullFontVersion Asset Deployer (npm @pocketgull/font + Native Flutter)\n');

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

  // Sync TTF to native Flutter desktop/mobile target ONLY (GreenOps web uses @pocketgull/font npm + CDN)
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
    print('  [OK] Synced $flutterSynced native v$kPocketGullFontVersion TTFs -> ${flutterDir.path}');
  }

  syncCdnFirstFontsCss(
    File('${sourceRoot.path}${sep}fonts.css'),
    File('$root${sep}public${sep}fonts${sep}fonts.css'),
  );

  print('\n✅ PocketGull v$kPocketGullFontVersion sync complete (web core via @pocketgull/font npm; zero duplicate web binaries).\n');
}
