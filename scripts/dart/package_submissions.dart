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

Future<void> createZip(List<String> files, String zipPath, String rootDir) async {
  final sep = Platform.pathSeparator;
  final validFiles = files.where((f) => File('$rootDir$sep$f').existsSync()).toList();

  if (validFiles.isEmpty) {
    print('  [WARN] No matching files found for $zipPath');
    return;
  }

  final zipFile = File('$rootDir$sep$zipPath');
  if (zipFile.existsSync()) {
    zipFile.deleteSync();
  }

  if (Platform.isWindows) {
    // Use PowerShell Compress-Archive for cross-platform zero-dependency Windows zip
    final fileArgs = validFiles.map((f) => "'$rootDir$sep$f'").join(', ');
    final psCommand = 'Compress-Archive -Path $fileArgs -DestinationPath "${zipFile.path}" -Force';
    final res = await Process.run('powershell', ['-NoProfile', '-Command', psCommand]);
    if (res.exitCode != 0) {
      stderr.writeln('  [ERR] Failed to create zip: ${res.stderr}');
      return;
    }
  } else {
    // Linux / macOS zip command
    final args = ['-j', zipFile.path, ...validFiles.map((f) => '$rootDir$sep$f')];
    await Process.run('zip', args);
  }

  if (zipFile.existsSync()) {
    final sizeKb = (zipFile.lengthSync() / 1024).toStringAsFixed(1);
    print('  [OK] Created archive: $zipPath ($sizeKb KB with ${validFiles.length} files)');
  }
}

Future<void> main() async {
  print('\n📦  Pocket-Gull Competition Submission Packager (Dart)\n');

  final root = findProjectRoot();

  // 1. PhysioNet 2026 Submission Zip
  final pnFiles = [
    'python_example_2026/team_code.py',
    'python_example_2026/pocketgull_features.py',
    'python_example_2026/helper_code.py',
    'python_example_2026/requirements.txt',
    'python_example_2026/channel_table.csv',
    'python_example_2026/pocketgull_physionet_2026_challenge_entry.ipynb',
  ];
  await createZip(pnFiles, 'pocketgull_physionet_2026_v9.0.0.zip', root);

  // 2. RSNA Knee 2026 Submission Zip
  final rsnaFiles = [
    'contests/rsna_knee_2026/rsna_knee_gold_model.py',
    'contests/rsna_knee_2026/asymmetric_loss.py',
    'contests/rsna_knee_2026/cooccurrence_calibrator.py',
    'contests/rsna_knee_2026/meta_ensemble_stacker.py',
    'contests/rsna_knee_2026/threshold_optimizer.py',
    'contests/rsna_knee_2026/efficiency_engine.py',
    'contests/rsna_knee_2026/high_res_preprocessor.py',
    'contests/rsna_knee_2026/rsna_knee_submission.ipynb',
    'contests/rsna_knee_2026/rsna_knee_submission_v6.ipynb',
    'contests/rsna_knee_2026/rsna_knee_train_v6.ipynb',
  ];
  await createZip(rsnaFiles, 'contests/rsna_knee_2026/rsna_knee_v9_submission.zip', root);

  // 3. RSNA Knee Submission CSV Zip
  final csvFiles = [
    'contests/rsna_knee_2026/submission.csv',
  ];
  await createZip(csvFiles, 'contests/rsna_knee_2026/submission.zip', root);

  print('\n✅ Packaging complete!\n');
}
