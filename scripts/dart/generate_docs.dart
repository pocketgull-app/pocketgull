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

const String flutterReadmeContent = r'''# 🕊️ POCKET GULL (Flutter Edition)
**Aerial Perspective for the Clinical Ocean**

---

### PREPARED FOR
**Google Gemini Live Agent Challenge** / 2026

### CATEGORY
**Live Agents 🗣️** (Multimodal Synthesis & Agent Orchestration)

### VISION
*"To provide practitioners with the 'Gull's Eye View'—the ability to rise above the turbulent sea of medical data and see the clear, actionable patterns beneath."*

---

## 📋 THE STORY OF THE SEAGULL

In modern medicine, practitioners are often drowning in a "Sea of Information"—fragmented vitals, sprawling patient histories, and an ever-shifting tide of clinical literature. **Pocket Gull** was conceived as an aerial navigator. 

Like its namesake, the agent is **agile**, **interruptible**, and **highly observant**. It doesn't just process data; it provides **Uplift**. By synthesizing multimodal inputs (3D spatial data, voice dictation, and biometric telemetry) into a singular, high-integrity strategy, it allows the clinician to maintain perspective without losing sight of the patient.

> **Industrial Grace:** We believe medical tools should be as beautiful as they are functional. Our design language combines the clinical precision of a laboratory with the "Less, but better" philosophy of Dieter Rams.

---

## 🛠️ SCIENTIFIC RIGOR & CORE CAPABILITIES

#### 🧠 EVIDENCE-GROUNDED REASONING (EGR)
Pocket Gull eliminates "Black Box" AI anxiety. Every recommendation is anchored by an **Evidence Trail** generated through real-time integration with local PubGemma and Gemini models. The agent doesn't just suggest; it cites.

#### 🎙️ MULTIMODAL SYNTHESIS & CONTEXTUAL ORCHESTRATION
Powered by Native Flutter Speech-to-Text and contextual pop-out dictation windows. Specialized experts operate in a "Patient BLoC" environment, maintaining **context-aware memory** of report nodes, allowing for fluid, multi-turn reasoning across voice and visual UI.

#### 📐 PRECISION 3D ANATOMICAL MODELING (DRILL-DOWN)
Using `flutter_3d_controller`, we provide a procedurally detailed skeletal and surface model. The new **2D coordinate-based hit detection** allows for micro-level anatomical drill-downs. Severity is visualized through dynamic mesh layers (Orthomolecular, Muscular, Vascular), translating abstract pain descriptions into **spatial clinical data**.

#### 📄 COGNITIVE LOCALIZATION (COLO)
Moving beyond simple translation, the **COLO Engine** adjusts the "Clinical Strategy" to the patient's cognitive state (Standard, Dyslexia-Friendly, Pediatric) without losing clinical accuracy, ensuring **Informed Consent** is truly inclusive.

---

## 🧩 TECHNICAL ARCHITECTURE & FEATURES

**Core Features (Flutter Migration):**
- **Secure Authentication Gateway:** Biometric (FaceID/Fingerprint) or PIN code unlock with secure configuration of API keys.
- **Triage Dashboard (Macro Drill-Down):** Grid view of all active patients with global 'CLINICAL MESH LAYER' toggles.
- **Precise 3D Body Mapping (Micro Drill-Down):** Advanced hit detection filters clinical intake notes dynamically based on anatomical region tapped.
- **Contextual Pop-Out Voice Dictation:** Floating, proximity-aware voice capture UI.
- **Patient Management & Local Persistence:** Full CRUD capabilities managed securely via `Hive` NoSQL local storage with zero PII leakage.
- **Care Plan Recommendation Engine:** Structured strategies organized by diagnostic lenses (Overview, Interventions, Monitoring, Education).

**Technologies Used:**
- **Framework:** Flutter & Dart 3
- **State Management:** Riverpod / BLoC
- **Visualization:** `flutter_3d_controller`
- **Local Storage:** `Hive` NoSQL
- **Intelligence:** Google GenAI SDK (`gemini-2.5-flash`) & PubGemma

---

## 📜 RESPONSIBLE AI & ETHICS
- **Task Bracketing:** Clinicians must manually validate and edit AI suggestions before archiving.
- **Explainability:** Surfacing reasoning lenses (Intervention, Monitoring, Education) for every recommendation.
- **Privacy Core:** Zero PII persistence to remote databases.

*© 2026 Pocket Gull. Industrial Grace & Clinical Intelligence.*
''';

const Map<String, String> studyPages = {
  'index.mdx': '# Overview\n\nPocket Gull is an AI-augmented clinical strategy application designed for rapid triage and micro-anatomical drill-downs via a 3D interface.\n',
  'architecture.mdx': '# Architecture\n\nThe application uses Flutter, Riverpod/BLoC for state management, Hive for encrypted local persistence, and Three.js / Flutter 3D for biophysical visualization.\n',
  'features.mdx': '# Features\n\n- **Triage Dashboard**: Macro drill-down views.\n- **3D Hit-Detection**: Micro anatomical drill-downs.\n- **Contextual Dictation**: Proximity-aware voice capture.\n- **Secure Gateway**: Biometric and PIN authentication.\n',
  'data.mdx': '# Data & Privacy\n\nAll Patient Health Information (PHI) is kept strictly local on device using encrypted boxes. Zero telemetry is sent to untrusted centralized databases.\n',
  'responsible-ai.mdx': '# Responsible AI\n\nPocket Gull strictly enforces Human-In-The-Loop (HITL) operations. AI suggestions are drafted and must be manually verified by the clinician.\n',
  'getting-started.mdx': '# Getting Started\n\nRun `flutter pub get` and `flutter run` to launch the application.\n',
};

void main() {
  print('\n📚  Pocket-Gull Multi-Platform Documentation Generator (Dart)\n');

  final root = findProjectRoot();
  final sep = Platform.pathSeparator;
  final docsDir = Directory('$root${sep}pocketgull_flutter${sep}assets${sep}docs${sep}study${sep}src${sep}pages');
  final flutterDocsDir = Directory('$root${sep}pocketgull_flutter${sep}assets${sep}docs');

  if (!docsDir.existsSync()) {
    docsDir.createSync(recursive: true);
  }

  // 1. Write Flutter Assets README
  File('${flutterDocsDir.path}${sep}README.md').writeAsStringSync(flutterReadmeContent);
  print('  [OK] Generated: ${flutterDocsDir.path}${sep}README.md');

  // 2. Write Study Documentation Pages
  for (final entry in studyPages.entries) {
    final filePath = '${docsDir.path}${sep}${entry.key}';
    File(filePath).writeAsStringSync(entry.value);
    print('  [OK] Generated page: ${entry.key}');
  }

  // 3. Write Case Study
  final caseStudyFile = File('${flutterDocsDir.path}${sep}case_study.md');
  caseStudyFile.writeAsStringSync(
    '# Case Study: Pocket Gull\n\n'
    'Pocket Gull achieves 60fps rendering of 3D anatomical meshes alongside real-time voice transcription and AI inference on consumer hardware.\n'
  );
  print('  [OK] Generated case study: ${caseStudyFile.path}');

  print('\n✅ Documentation generation complete!\n');
}
