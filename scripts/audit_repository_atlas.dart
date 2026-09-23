import 'dart:io';
import 'dart:convert';

/// Pocket-Gull Architecture Atlas Auditor (Dart 3 Standard)
/// Classifies all components, services, and tests into the 6 Computational Spheres.
void main() async {
  final rootDir = Directory.current.path;
  print('🧭 Pocket-Gull Architecture Auditor starting in: $rootDir');

  final componentsDir = Directory('$rootDir/src/components');
  final servicesDir = Directory('$rootDir/src/services');

  if (!componentsDir.existsSync()) {
    stderr.writeln('Error: src/components directory not found.');
    exit(1);
  }

  final List<Map<String, dynamic>> components = [];
  final List<Map<String, dynamic>> services = [];

  // 1. Scan Components
  final compFiles = componentsDir
      .listSync(recursive: true)
      .whereType<File>()
      .where((f) => f.path.endsWith('.component.ts'))
      .toList();

  for (final file in compFiles) {
    final lines = await file.readAsLines();
    final relativePath = file.path.replaceAll('\\', '/').replaceAll('$rootDir/', '');
    final fileName = file.uri.pathSegments.last;
    final baseName = fileName.replaceAll('.component.ts', '');

    // Check for corresponding spec file
    final specFile = File(file.path.replaceAll('.component.ts', '.component.spec.ts'));
    final hasSpec = specFile.existsSync();
    final specLines = hasSpec ? (await specFile.readAsLines()).length : 0;

    // Extract selector & class name
    String selector = '';
    String className = '';
    for (final line in lines) {
      if (line.contains("selector:")) {
        final match = RegExp(r'''selector:\s*['"`]([^'"`]+)['"`]''').firstMatch(line);
        if (match != null) selector = match.group(1) ?? '';
      }
      if (line.contains("export class ")) {
        final match = RegExp(r"export class\s+([A-Za-z0-9_]+)").firstMatch(line);
        if (match != null) className = match.group(1) ?? '';
      }
    }

    final sphere = classifySphere(relativePath, lines.join('\n'));

    components.add({
      'name': baseName,
      'className': className.isNotEmpty ? className : '${baseName.split('-').map((s) => s.isNotEmpty ? s[0].toUpperCase() + s.substring(1) : '').join()}Component',
      'selector': selector.isNotEmpty ? selector : 'app-$baseName',
      'path': relativePath,
      'loc': lines.length,
      'hasSpec': hasSpec,
      'specLoc': specLines,
      'sphere': sphere['id'],
      'sphereName': sphere['name'],
      'sphereIcon': sphere['icon'],
      'description': extractDescription(lines, baseName),
    });
  }

  // 2. Scan Services
  if (servicesDir.existsSync()) {
    final servFiles = servicesDir
        .listSync(recursive: true)
        .whereType<File>()
        .where((f) => f.path.endsWith('.service.ts'))
        .toList();

    for (final file in servFiles) {
      final lines = await file.readAsLines();
      final relativePath = file.path.replaceAll('\\', '/').replaceAll('$rootDir/', '');
      final fileName = file.uri.pathSegments.last;
      final baseName = fileName.replaceAll('.service.ts', '');

      final specFile = File(file.path.replaceAll('.service.ts', '.service.spec.ts'));
      final hasSpec = specFile.existsSync();
      final specLines = hasSpec ? (await specFile.readAsLines()).length : 0;

      final sphere = classifySphere(relativePath, lines.join('\n'));

      services.add({
        'name': baseName,
        'path': relativePath,
        'loc': lines.length,
        'hasSpec': hasSpec,
        'specLoc': specLines,
        'sphere': sphere['id'],
      });
    }
  }

  // 3. Aggregate Stats by Sphere
  final Map<String, Map<String, dynamic>> sphereStats = {
    'biophysical_3d': {
      'id': 'biophysical_3d',
      'name': 'Biophysical & 3D WebGL',
      'icon': '🥽',
      'count': 0,
      'loc': 0,
      'specCount': 0,
      'components': <Map<String, dynamic>>[],
    },
    'turing_computation': {
      'id': 'turing_computation',
      'name': 'Turing-Complete Computation',
      'icon': '🧮',
      'count': 0,
      'loc': 0,
      'specCount': 0,
      'components': <Map<String, dynamic>>[],
    },
    'tri_paradigm_synthesis': {
      'id': 'tri_paradigm_synthesis',
      'name': 'Tri-Paradigm Clinical Synthesis',
      'icon': '🏛️',
      'count': 0,
      'loc': 0,
      'specCount': 0,
      'components': <Map<String, dynamic>>[],
    },
    'epistemic_invariants': {
      'id': 'epistemic_invariants',
      'name': 'Epistemic Invariants & Falsification',
      'icon': '⚖️',
      'count': 0,
      'loc': 0,
      'specCount': 0,
      'components': <Map<String, dynamic>>[],
    },
    'allometric_posology': {
      'id': 'allometric_posology',
      'name': 'Allometric Posology & Health Economics',
      'icon': '💊',
      'count': 0,
      'loc': 0,
      'specCount': 0,
      'components': <Map<String, dynamic>>[],
    },
    'sovereign_interop': {
      'id': 'sovereign_interop',
      'name': 'Sovereign Interoperability & Thin-Client',
      'icon': '🌐',
      'count': 0,
      'loc': 0,
      'specCount': 0,
      'components': <Map<String, dynamic>>[],
    },
  };

  int totalLoc = 0;
  int totalSpecLoc = 0;
  int testedCount = 0;

  for (final c in components) {
    final sphereId = c['sphere'] as String;
    final stat = sphereStats[sphereId]!;
    stat['count'] = (stat['count'] as int) + 1;
    stat['loc'] = (stat['loc'] as int) + (c['loc'] as int);
    if (c['hasSpec'] == true) {
      stat['specCount'] = (stat['specCount'] as int) + 1;
      testedCount++;
    }
    (stat['components'] as List).add(c);
    totalLoc += (c['loc'] as int);
    totalSpecLoc += (c['specLoc'] as int);
  }

  final summary = {
    'totalComponents': components.length,
    'totalServices': services.length,
    'totalComponentLoc': totalLoc,
    'totalSpecLoc': totalSpecLoc,
    'testedComponents': testedCount,
    'testCoverageRatio': components.isNotEmpty ? (testedCount / components.length * 100).toStringAsFixed(1) : '0',
    'spheres': sphereStats.values.toList(),
    'allComponents': components,
    'generatedAt': DateTime.now().toUtc().toIso8601String(),
  };

  // 4. Save JSON and TypeScript Datasets
  final outputFile = File('$rootDir/src/assets/architecture-atlas-data.json');
  outputFile.parent.createSync(recursive: true);
  final jsonString = const JsonEncoder.withIndent('  ').convert(summary);
  await outputFile.writeAsString(jsonString);
  print('✅ Written JSON Dataset to: ${outputFile.path}');

  final tsFile = File('$rootDir/src/assets/architecture-atlas-data.ts');
  await tsFile.writeAsString('''// Auto-generated by scripts/audit_repository_atlas.dart
export interface IComponentMetadata {
  name: string;
  className: string;
  selector: string;
  path: string;
  loc: number;
  hasSpec: boolean;
  specLoc: number;
  sphere: string;
  sphereName: string;
  sphereIcon: string;
  description: string;
}

export interface ISphereMetadata {
  id: string;
  name: string;
  icon: string;
  count: number;
  loc: number;
  specCount: number;
  components: IComponentMetadata[];
}

export interface IArchitectureAtlasSummary {
  totalComponents: number;
  totalServices: number;
  totalComponentLoc: number;
  totalSpecLoc: number;
  testedComponents: number;
  testCoverageRatio: string;
  spheres: ISphereMetadata[];
  allComponents: IComponentMetadata[];
  generatedAt: string;
}

export const ARCHITECTURE_ATLAS_DATA: IArchitectureAtlasSummary = $jsonString;
''');
  print('✅ Written TypeScript Dataset to: ${tsFile.path}');

  // 5. Generate Markdown Documentation
  final mdFile = File('$rootDir/docs/ARCHITECTURE_ATLAS.md');
  final mdBuffer = StringBuffer();
  mdBuffer.writeln('# 🏛️ Pocket-Gull Architectural Atlas & Visual Topology');
  mdBuffer.writeln('');
  mdBuffer.writeln('> *"From 3D WebGL biophysics and Turing-complete state machines to tri-paradigm clinical reasoning and allometric posology."*');
  mdBuffer.writeln('');
  mdBuffer.writeln('## 📊 Executive System Metrics');
  mdBuffer.writeln('');
  mdBuffer.writeln('| Metric | Total |');
  mdBuffer.writeln('| :--- | :--- |');
  mdBuffer.writeln('| **Total Standalone Components** | `${components.length}` |');
  mdBuffer.writeln('| **Total Clinical Services** | `${services.length}` |');
  mdBuffer.writeln('| **Total Component Lines of Code** | `${totalLoc.toString().replaceAllMapped(RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (m) => "${m[1]},")} LOC` |');
  mdBuffer.writeln('| **Total Unit Test Lines** | `${totalSpecLoc.toString().replaceAllMapped(RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (m) => "${m[1]},")} LOC` |');
  mdBuffer.writeln('| **Component Test Ratio** | `${summary['testCoverageRatio']}% (${testedCount}/${components.length} components tested)` |');
  mdBuffer.writeln('');
  mdBuffer.writeln('---');
  mdBuffer.writeln('');
  mdBuffer.writeln('## 🌐 The 6 Computational Spheres');
  mdBuffer.writeln('');
  mdBuffer.writeln('```mermaid');
  mdBuffer.writeln('graph TD');
  mdBuffer.writeln('    Atlas["Pocket-Gull Clinical Architecture Atlas"]');
  for (final s in sphereStats.values) {
    mdBuffer.writeln('    Atlas --> S_${s['id']}["${s['icon']} ${s['name']}<br/>(${s['count']} components, ${s['loc']} LOC)"]');
  }
  mdBuffer.writeln('```');
  mdBuffer.writeln('');

  for (final s in sphereStats.values) {
    final sComps = s['components'] as List;
    mdBuffer.writeln('### ${s['icon']} ${s['name']}');
    mdBuffer.writeln('- **Components**: `${s['count']}`');
    mdBuffer.writeln('- **Lines of Code**: `${s['loc']} LOC`');
    mdBuffer.writeln('- **Test Coverage**: `${s['specCount']}/${s['count']}` components with explicit `.spec.ts`');
    mdBuffer.writeln('');
    mdBuffer.writeln('| Component | Selector | LOC | Tested | Description |');
    mdBuffer.writeln('| :--- | :--- | :---: | :---: | :--- |');
    for (final c in sComps.take(15)) {
      final testBadge = c['hasSpec'] == true ? '✅' : '⏳';
      mdBuffer.writeln('| `[${c['className']}](file:///${c['path']})` | `<${c['selector']}>` | ${c['loc']} | $testBadge | ${c['description']} |');
    }
    if (sComps.length > 15) {
      mdBuffer.writeln('| *...and ${sComps.length - 15} more components* | | | | |');
    }
    mdBuffer.writeln('');
  }

  await mdFile.writeAsString(mdBuffer.toString());
  print('✅ Written Markdown Spec to: ${mdFile.path}');
  print('🎉 Audit completed: ${components.length} components analyzed across 6 spheres.');
}

Map<String, String> classifySphere(String path, String content) {
  final lowerPath = path.toLowerCase();
  final lowerContent = content.toLowerCase();

  // 1. Biophysical & 3D WebGL
  if (lowerPath.contains('anatomy-3d') ||
      lowerPath.contains('shader') ||
      lowerPath.contains('woodcut') ||
      lowerPath.contains('dicom') ||
      lowerPath.contains('three') ||
      lowerPath.contains('holodeck') ||
      lowerPath.contains('knee-hologram') ||
      lowerPath.contains('cymatics') ||
      lowerPath.contains('bio-symphony') ||
      lowerPath.contains('spatial-scanner') ||
      lowerContent.contains('three.scene') ||
      lowerContent.contains('webgl') ||
      lowerContent.contains('raycast')) {
    return {
      'id': 'biophysical_3d',
      'name': 'Biophysical & 3D WebGL',
      'icon': '🥽',
    };
  }

  // 2. Turing-Complete Computation
  if (lowerPath.contains('turing') ||
      lowerPath.contains('petri') ||
      lowerPath.contains('automata') ||
      lowerPath.contains('navier-stokes') ||
      lowerPath.contains('biomolecular-physics') ||
      lowerPath.contains('nanobot') ||
      lowerPath.contains('bioreactor') ||
      lowerPath.contains('lhc') ||
      lowerContent.contains('petrinet') ||
      lowerContent.contains('cellularautomata')) {
    return {
      'id': 'turing_computation',
      'name': 'Turing-Complete Computation',
      'icon': '🧮',
    };
  }

  // 3. Tri-Paradigm Clinical Synthesis
  if (lowerPath.contains('tri-paradigm') ||
      lowerPath.contains('tcm') ||
      lowerPath.contains('ayurved') ||
      lowerPath.contains('eastern') ||
      lowerPath.contains('zang-fu') ||
      lowerPath.contains('tridosha') ||
      lowerPath.contains('synthesis') ||
      lowerPath.contains('functional-medicine') ||
      lowerPath.contains('pantry') ||
      lowerPath.contains('chronobiology') ||
      lowerContent.contains('zangfu') ||
      lowerContent.contains('vata/pitta/kapha') ||
      lowerContent.contains('tri-paradigm')) {
    return {
      'id': 'tri_paradigm_synthesis',
      'name': 'Tri-Paradigm Clinical Synthesis',
      'icon': '🏛️',
    };
  }

  // 4. Epistemic Invariants & Falsification
  if (lowerPath.contains('skeptical') ||
      lowerPath.contains('epistem') ||
      lowerPath.contains('falsif') ||
      lowerPath.contains('invariant') ||
      lowerPath.contains('fuzzer') ||
      lowerPath.contains('onc-dsi') ||
      lowerPath.contains('kaizen') ||
      lowerPath.contains('anti-confirmation') ||
      lowerPath.contains('counterfactual') ||
      lowerContent.contains('counter-hypotheses') ||
      lowerContent.contains('cochrane risk of bias') ||
      lowerContent.contains('falsifiability')) {
    return {
      'id': 'epistemic_invariants',
      'name': 'Epistemic Invariants & Falsification',
      'icon': '⚖️',
    };
  }

  // 5. Allometric Posology & Health Economics
  if (lowerPath.contains('posology') ||
      lowerPath.contains('rx-guard') ||
      lowerPath.contains('pricing') ||
      lowerPath.contains('billing') ||
      lowerPath.contains('qaly') ||
      lowerPath.contains('actuarial') ||
      lowerPath.contains('hsa-incentive') ||
      lowerPath.contains('cost-benefit') ||
      lowerPath.contains('deprescrib') ||
      lowerPath.contains('pharmacogenomics') ||
      lowerContent.contains('kleiber') ||
      lowerContent.contains('allometric') ||
      lowerContent.contains('financial toxicity') ||
      lowerContent.contains('cyp450')) {
    return {
      'id': 'allometric_posology',
      'name': 'Allometric Posology & Health Economics',
      'icon': '💊',
    };
  }

  // 6. Sovereign Interoperability & Thin-Client Delivery
  return {
    'id': 'sovereign_interop',
    'name': 'Sovereign Interoperability & Thin-Client',
    'icon': '🌐',
  };
}

String extractDescription(List<String> lines, String baseName) {
  for (int i = 0; i < lines.length && i < 40; i++) {
    final line = lines[i].trim();
    if (line.startsWith('*') && line.length > 5 && !line.contains('@')) {
      return line.replaceFirst(RegExp(r'^\*\s*'), '').trim();
    }
    if (line.startsWith('//') && line.length > 5 && !line.contains('eslint')) {
      return line.replaceFirst(RegExp(r'^//\s*'), '').trim();
    }
  }
  return 'Clinical component for $baseName telemetry and interactive workflow.';
}
