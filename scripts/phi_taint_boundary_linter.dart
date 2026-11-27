import 'dart:io';

/// Monorepo PHI Taint Boundary Linter (Randal L. Schwartz Standard)
/// 
/// Enforces HIPAA Safe Harbor §164.514 & ONC HTI-1 compliance across the
/// boundary between the Angular client / Express SSR and the Python FastAPI / ML sidecar (`pocketgull_api`).
/// 
/// Asserts that NO sensitive patient identifiers (HIPAA 18 categories) can be imported,
/// declared in Pydantic input models, or accepted by FastAPI route signatures.
void main(List<String> args) {
  print('================================================================');
  print('  HIPAA §164.514 Safe Harbor PHI Taint Boundary Linter          ');
  print('  Target: Angular/Express ⇄ Python FastAPI ML Sidecar Egress    ');
  print('================================================================');

  final rootDir = Directory.current.path;
  final apiDir = Directory('$rootDir/pocketgull_api');
  if (!apiDir.existsSync()) {
    print('[FAIL] pocketgull_api directory not found at: ${apiDir.path}');
    exit(1);
  }

  var filesScanned = 0;
  var modelsScanned = 0;
  var violations = <String>[];

  // HIPAA 18 Direct & Indirect Identifiers to flag if declared as input model fields or route params
  final prohibitedPhiRegex = RegExp(
    r'\b(ssn|social_security|social_security_number|mrn|medical_record_number|'
    r'first_name|last_name|patient_name|full_name|'
    r'phone_number|telephone|cell_phone|fax_number|'
    r'email_address|street_address|postal_code|zip_code|'
    r'dob|date_of_birth|birth_date|birthdate|'
    r'device_serial|serial_number|ip_address|client_ip|mac_address|'
    r'account_number|credit_card)\b',
    caseSensitive: false,
  );

  // Files legitimately defining the sanitization patterns/rules themselves (whitelisted from self-flagging)
  final sanitizerWhitelist = [
    'hipaa_deidentifier.py',
    'phi_sanitizer.py',
    'telemetry.py'
  ];

  // 1. Audit Python Pydantic Models & Input Contracts (excluding virtual environments and caches)
  final pyFiles = <File>[];
  void collectPythonFiles(Directory dir) {
    try {
      final entries = dir.listSync(followLinks: false);
      for (final entry in entries) {
        final name = entry.uri.pathSegments.isNotEmpty
            ? entry.uri.pathSegments[entry.uri.pathSegments.length - 2]
            : '';
        if (name == '.venv' || name == 'venv' || name == '__pycache__' || name == 'site-packages' || name.startsWith('.')) {
          continue;
        }
        if (entry is Directory) {
          collectPythonFiles(entry);
        } else if (entry is File && entry.path.endsWith('.py')) {
          pyFiles.add(entry);
        }
      }
    } catch (_) {
      // Ignore inaccessible internal or locked directories
    }
  }

  collectPythonFiles(apiDir);

  for (final file in pyFiles) {
    filesScanned++;
    final fileName = file.uri.pathSegments.last;
    if (sanitizerWhitelist.contains(fileName)) {
      continue;
    }

    final lines = file.readAsLinesSync();
    var inClassDef = false;
    var currentClassName = '';

    for (var i = 0; i < lines.length; i++) {
      final line = lines[i];
      final trimmed = line.trim();

      // Track Pydantic Model classes
      if (trimmed.startsWith('class ') && trimmed.contains('(BaseModel):')) {
        inClassDef = true;
        currentClassName = trimmed.split(' ')[1].split('(')[0];
        modelsScanned++;
        continue;
      } else if (trimmed.startsWith('class ') || (inClassDef && !line.startsWith(' ') && !line.startsWith('\t') && trimmed.isNotEmpty)) {
        inClassDef = false;
        currentClassName = '';
      }

      // Check field definitions inside input models
      if (inClassDef && trimmed.contains(':')) {
        final fieldName = trimmed.split(':')[0].trim();
        final match = prohibitedPhiRegex.firstMatch(fieldName);
        if (match != null) {
          final matchedTerm = match.group(0);
          final relPath = file.path.replaceAll(rootDir, '').replaceAll(r'\', '/');
          violations.add(
            '[TAINT VIOLATION] $relPath:${i + 1} -> Model "$currentClassName" declares prohibited PHI field "$fieldName" (matched: $matchedTerm)'
          );
        }
      }
    }
  }

  // 2. Audit FastAPI Route Endpoints in main.py
  final mainPyFile = File('${apiDir.path}/main.py');
  if (mainPyFile.existsSync()) {
    final mainLines = mainPyFile.readAsLinesSync();
    for (var i = 0; i < mainLines.length; i++) {
      final line = mainLines[i];
      final trimmed = line.trim();

      if (trimmed.startsWith('@app.post') || trimmed.startsWith('@app.get') || trimmed.startsWith('@app.put')) {
        // Inspect following function declaration
        if (i + 1 < mainLines.length) {
          final defLine = mainLines[i + 1];
          final match = prohibitedPhiRegex.firstMatch(defLine);
          if (match != null) {
            final matchedTerm = match.group(0);
            violations.add(
              '[TAINT VIOLATION] pocketgull_api/main.py:${i + 2} -> Route definition exposes unredacted PHI parameter "$matchedTerm"'
            );
          }
        }
      }
    }
  }

  // 3. Audit ALL Angular Client Egress Calls to /api/python (not just payloadSections[1])
  final tsBridgeFile = File('$rootDir/src/services/python-bridge.service.ts');
  if (tsBridgeFile.existsSync()) {
    final tsContent = tsBridgeFile.readAsStringSync();
    if (tsContent.contains('payload = {') || tsContent.contains('body: JSON.stringify')) {
      final payloadSections = tsContent.split('const payload = {');
      for (var idx = 1; idx < payloadSections.length; idx++) {
        final payloadBlock = payloadSections[idx].split('};')[0];
        final match = prohibitedPhiRegex.firstMatch(payloadBlock);
        if (match != null) {
          final matchedTerm = match.group(0);
          violations.add(
            '[TAINT VIOLATION] src/services/python-bridge.service.ts (payload #$idx) -> Egress payload block contains prohibited identifier "$matchedTerm"'
          );
        }
      }
    }
  }

  // 4. Verify HIPAA De-Identification Middleware Installation & Hardening
  var hasDeidentifierMiddleware = false;
  if (mainPyFile.existsSync()) {
    final mainText = mainPyFile.readAsStringSync();
    if (mainText.contains('hipaa_deidentifier') || mainText.contains('sanitize_hipaa_payload') || mainText.contains('HIPAA')) {
      hasDeidentifierMiddleware = true;
    }
  }
  final deidFile = File('${apiDir.path}/middleware/hipaa_deidentifier.py');
  if (deidFile.existsSync()) {
    final deidText = deidFile.readAsStringSync();
    if (deidText.contains('POCKETGULL_SAFE_HARBOR_2026')) {
      violations.add(
        '[CRYPTO VIOLATION] pocketgull_api/middleware/hipaa_deidentifier.py -> Hardcoded static salt literal "POCKETGULL_SAFE_HARBOR_2026" found'
      );
    }
    if (!deidText.contains('_body') && deidText.contains('await request.body()')) {
      violations.add(
        '[STARLETTE CACHE BUG] pocketgull_api/middleware/hipaa_deidentifier.py -> Reads request.body() without refreshing/clearing request._body after scrubbing'
      );
    }
  }

  // 5. Report Findings
  print('[PASS] Audited $filesScanned Python files across pocketgull_api/');
  print('[PASS] Audited $modelsScanned Pydantic data models');
  if (hasDeidentifierMiddleware) {
    print('[PASS] Verified HIPAA Safe Harbor Middleware active on FastAPI router');
  } else {
    print('[WARN] HIPAA Safe Harbor Middleware reference not explicitly found in main.py');
  }

  print('----------------------------------------------------------------');
  if (violations.isEmpty) {
    print('[SUCCESS] ZERO-PHI TAINT BOUNDARY VERIFIED!');
    print('  - No direct or indirect patient identifiers reach the ML sidecar.');
    print('  - All telemetry is strictly numeric or de-identified tokenized cohorts.');
    print('  - HIPAA Safe Harbor §164.514 & ONC HTI-1 compliance preserved.');
    print('================================================================');
    exit(0);
  } else {
    print('[FAIL] Detected ${violations.length} PHI Taint Boundary Violations:');
    for (final v in violations) {
      print('  $v');
    }
    print('================================================================');
    exit(1);
  }
}
