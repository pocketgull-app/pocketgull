import 'dart:io';

const List<String> fontFiles = [
  'PocketGull-Bold.ttf',
  'PocketGull-Fineliner.ttf',
  'PocketGull-Chiseltip.ttf',
  'PocketGullMono-Regular.ttf',
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

void main() {
  print('\n🖋️  Pocket-Gull Typography Asset Deployer (Dart)\n');

  final root = findProjectRoot();
  final sep = Platform.pathSeparator;
  final sourceDir = Directory('$root${sep}public${sep}fonts${sep}google_fonts_submission${sep}ofl${sep}pocketgull');

  final targetDirs = [
    Directory('$root${sep}public${sep}assets${sep}fonts'),
    Directory('$root${sep}public${sep}fonts'),
  ];

  if (!sourceDir.existsSync()) {
    stderr.writeln('❌ Error: Source directory does not exist: ${sourceDir.path}');
    exit(1);
  }

  var copiedCount = 0;
  for (final target in targetDirs) {
    if (!target.existsSync()) {
      target.createSync(recursive: true);
    }
    for (final fontFile in fontFiles) {
      final srcFile = File('${sourceDir.path}$sep$fontFile');
      if (srcFile.existsSync()) {
        final dstFile = File('${target.path}$sep$fontFile');
        srcFile.copySync(dstFile.path);
        print('  [OK] Deployed $fontFile -> ${target.path}');
        copiedCount++;
      } else {
        print('  [WARN] Source font file missing: ${srcFile.path}');
      }
    }
  }

  print('\n✅ Font deployment complete! Deployed $copiedCount font files across targets.\n');
}
