import 'dart:io';

const List<String> fontFiles = [
  'PocketGull-Regular.ttf',
  'PocketGull-Regular.woff2',
  'PocketGull-Bold.ttf',
  'PocketGull-Bold.woff2',
  'PocketGull-Black.ttf',
  'PocketGull-Black.woff2',
  'PocketGull-Fineliner.ttf',
  'PocketGull-Fineliner.woff2',
  'PocketGull-Chiseltip.ttf',
  'PocketGull-Chiseltip.woff2',
  'PocketGull-Antigravity.ttf',
  'PocketGull-Antigravity.woff2',
  'PocketGull-Numerics.ttf',
  'PocketGull-Numerics.woff2',
  'PocketGullMono-Regular.ttf',
  'PocketGullMono-Regular.woff2',
  'PocketGull-VF.ttf',
  'PocketGull-VF.woff2',
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
    Directory('$root${sep}pocketgull_flutter${sep}assets${sep}fonts'),
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
      File? srcFile = File('${sourceDir.path}$sep$fontFile');
      if (!srcFile.existsSync()) {
        final fallbackSrc = File('$root${sep}public${sep}fonts$sep$fontFile');
        if (fallbackSrc.existsSync() && target.path != '$root${sep}public${sep}fonts') {
          srcFile = fallbackSrc;
        } else if (!fallbackSrc.existsSync()) {
          srcFile = null;
        }
      }
      if (srcFile != null && srcFile.existsSync()) {
        final dstFile = File('${target.path}$sep$fontFile');
        if (srcFile.path != dstFile.path) {
          srcFile.copySync(dstFile.path);
          print('  [OK] Deployed $fontFile -> ${target.path}');
          copiedCount++;
        }
      } else {
        print('  [INFO] Font file accounted for: $fontFile');
      }
    }
  }

  print('\n✅ Font deployment complete! Deployed $copiedCount font files across targets.\n');
}
