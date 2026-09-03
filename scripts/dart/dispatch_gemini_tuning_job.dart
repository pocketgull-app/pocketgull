import 'dart:io';
import 'dart:convert';

/// PocketGull - Google Vertex AI & Gemini Tuning Job Dispatcher in Dart 3
/// 
/// Target GCP Project: gen-lang-client-0540208645
/// Run with: `dart scripts/dart/dispatch_gemini_tuning_job.dart`

void main() async {
  final stopwatch = Stopwatch()..start();

  const projectId = 'gen-lang-client-0540208645';
  const baseModel = 'gemini-1.5-flash-002';
  const location = 'us-central1';

  print('================================================================');
  print('⚡ PocketGull Vertex AI & Gemini Fine-Tuning Dispatcher (Dart 3)');
  print('📌 Target Project : $projectId');
  print('📌 Location       : $location');
  print('📌 Base Model     : $baseModel');
  print('================================================================\n');

  final scriptDir = File.fromUri(Platform.script).parent;
  final rootDir = Directory(scriptDir.parent.parent.path);
  final sftFile = File('${rootDir.path}/scripts/gemini_tuning_dataset.jsonl');
  final dpoFile = File('${rootDir.path}/scripts/dpo_preference_dataset.jsonl');

  if (!await sftFile.exists()) {
    print('❌ Error: SFT dataset not found at ${sftFile.path}');
    exit(1);
  }

  // 1. Validate SFT lines
  final sftLines = (await sftFile.readAsString()).split('\n').where((l) => l.trim().isNotEmpty).toList();
  print('📊 SFT Dataset Loaded: ${sftLines.length} gold-standard records');

  int validSftCount = 0;
  for (final line in sftLines) {
    try {
      final json = jsonDecode(line) as Map<String, dynamic>;
      if (json.containsKey('contents')) {
        validSftCount++;
      }
    } catch (_) {}
  }
  print('  • Valid SFT Format: $validSftCount / ${sftLines.length}');

  // 2. Validate DPO lines
  int validDpoCount = 0;
  if (await dpoFile.exists()) {
    final dpoLines = (await dpoFile.readAsString()).split('\n').where((l) => l.trim().isNotEmpty).toList();
    for (final line in dpoLines) {
      try {
        final json = jsonDecode(line) as Map<String, dynamic>;
        if (json.containsKey('prompt') && json.containsKey('chosen') && json.containsKey('rejected')) {
          validDpoCount++;
        }
      } catch (_) {}
    }
    print('📊 DPO Preference Dataset Loaded: $validDpoCount / ${dpoLines.length} validated pairs');
  }

  // 3. Generate Staging Manifest
  final stagingManifest = {
    'projectId': projectId,
    'location': location,
    'baseModel': baseModel,
    'jobDisplayName': 'pocketgull-specialist-dart-tuning-${DateTime.now().millisecondsSinceEpoch}',
    'tuningType': 'SUPERVISED_SFT',
    'sftRecordCount': validSftCount,
    'dpoPairCount': validDpoCount,
    'hyperparameters': {
      'epochCount': 4,
      'learningRateMultiplier': 1.0,
      'adapterSize': 16,
    },
    'gcsStagingBucket': 'gs://$projectId-tuning-sources',
    'timestampUtc': DateTime.now().toUtc().toIso8601String(),
  };

  final scratchDir = Directory('${rootDir.path}/scratch');
  if (!await scratchDir.exists()) {
    await scratchDir.create(recursive: true);
  }

  final manifestFile = File('${scratchDir.path}/dart_vertex_tuning_manifest.json');
  await manifestFile.writeAsString(const JsonEncoder.withIndent('  ').convert(stagingManifest));

  stopwatch.stop();

  print('\n📝 Generated Staging Manifest: ${manifestFile.path}');
  print('⏱️ Dispatch Preparation Latency: ${stopwatch.elapsedMilliseconds} ms');
  print('================================================================');
  print('✅ Vertex AI / Gemini Fine-Tuning Job Staged Successfully');
  print('================================================================');
}
