import 'package:flutter/material.dart';

/// Clinical token parsed for Bionic Fixation and Optimal Recognition Point (ORP) RSVP stream.
class ClinicalBionicToken {
  /// Leading punctuation, quotes, or brackets (e.g. '(', '"', '[')
  final String leadingPunct;

  /// Core alphanumeric word token
  final String coreWord;

  /// Fixation letters to bold/emphasize (e.g. medical prefix or leading 40-45%)
  final String fixation;

  /// Remaining letters completed by the brain
  final String suffix;

  /// Trailing punctuation (e.g. ')', '",', '.', ';')
  final String trailingPunct;

  /// Complete original word including punctuation
  final String fullWord;

  /// Clinical categorization
  final String category; // 'standard' | 'medical-morpheme' | 'medication-tallman' | 'vital'

  /// 0-based Optimal Recognition Point index within coreWord
  final int orpIndex;

  /// The single character physically centered on the foveal crosshair
  final String orpChar;

  /// Substring to the left of the ORP character
  final String leftOfOrp;

  /// Substring to the right of the ORP character
  final String rightOfOrp;

  /// Full Tall Man formatted string if medication
  final String? tallManWord;

  /// Pacing multiplier for RSVP engine (1.5x for sentence breaks, 1.25x for clauses, 1.0x standard)
  final double holdMultiplier;

  const ClinicalBionicToken({
    required this.leadingPunct,
    required this.coreWord,
    required this.fixation,
    required this.suffix,
    required this.trailingPunct,
    required this.fullWord,
    required this.category,
    required this.orpIndex,
    required this.orpChar,
    required this.leftOfOrp,
    required this.rightOfOrp,
    this.tallManWord,
    required this.holdMultiplier,
  });
}

/// Core Bionic Reading and Optimal Recognition Point (ORP) service for Pocket-Gull.
class BionicReadingService {
  /// Curated medical prefix/morpheme dictionary anchored for clinical speed reading.
  static const List<String> medicalPrefixes = [
    'hypercholestero', 'gastroenterolo', 'ophthalmolo', 'pharmacogeno',
    'atherosclero', 'electrocardio', 'cerebrovascu', 'encephalo',
    'brady', 'tachy', 'hyper', 'hypo', 'chole', 'osteo', 'nephro',
    'cardio', 'neuro', 'dermato', 'gastro', 'pneumo', 'pulmono',
    'hemo', 'myo', 'arthro', 'angio', 'immuno', 'carcino', 'pharma',
    'thrombo', 'endo', 'peri', 'meso', 'sub', 'inter', 'intra'
  ];

  /// FDA / ISMP Tall Man Look-Alike / Sound-Alike (LASA) Medication Dictionary.
  static const Map<String, String> ismpTallManMap = {
    'hydroxyzine': 'hydrOXYzine',
    'hydralazine': 'hydraLAZine',
    'prednisone': 'predniSONE',
    'prednisolone': 'prednisoLONE',
    'bupropion': 'buPROPion',
    'buspirone': 'busPIRone',
    'clomiphene': 'clomiPHENE',
    'clomipramine': 'clomiPRAMINE',
    'cyclosporine': 'cycloSPORINE',
    'cycloserine': 'cycloSERINE',
    'diazepam': 'diaZEPAM',
    'diltiazem': 'diltiaZEM',
    'doxorubicin': 'DOXOrubicin',
    'daunorubicin': 'DAUNOrubicin',
    'fluoxetine': 'FLUoxetine',
    'duloxetine': 'DULoxetine',
    'glipizide': 'glipiZIDE',
    'glyburide': 'glyBURIDE',
    'metformin': 'metFORMIN',
    'metronidazole': 'metroNIDAZOLE',
    'vinblastine': 'vinBLAStine',
    'vincristine': 'vinCRIStine',
    'alprazolam': 'alPRAZolam',
    'lorazepam': 'lorAZEpam',
    'clonazepam': 'cloNAZEpam',
  };

  /// Calculates the Optimal Recognition Point (ORP) index within a word of length [len].
  ///
  /// Formula:
  /// - len <= 1 -> 0
  /// - 2 <= len <= 5 -> 1
  /// - 6 <= len <= 9 -> 2
  /// - 10 <= len <= 13 -> 3
  /// - len >= 14 -> 4
  static int calculateOrpIndex(int len) {
    if (len <= 1) return 0;
    if (len <= 5) return 1;
    if (len <= 9) return 2;
    if (len <= 13) return 3;
    return 4;
  }

  /// Tokenizes a raw clinical string into a sequence of [ClinicalBionicToken]s.
  List<ClinicalBionicToken> tokenize(String text) {
    if (text.trim().isEmpty) return const [];

    final rawTokens = text.split(RegExp(r'\s+'));
    final List<ClinicalBionicToken> result = [];

    for (final raw in rawTokens) {
      if (raw.trim().isEmpty) continue;

      // Extract leading punctuation
      final leadingMatch = RegExp(r'^[^\w\d]+').firstMatch(raw);
      final leadingPunct = leadingMatch != null ? leadingMatch.group(0)! : '';

      // Extract trailing punctuation
      final trailingMatch = RegExp(r'[^\w\d]+$').firstMatch(raw);
      final trailingPunct = trailingMatch != null ? trailingMatch.group(0)! : '';

      // Extract core alphanumeric word
      int coreStart = leadingPunct.length;
      int coreEnd = raw.length - trailingPunct.length;
      if (coreEnd < coreStart) {
        coreStart = 0;
        coreEnd = raw.length;
      }
      final coreWord = raw.substring(coreStart, coreEnd);

      if (coreWord.isEmpty) {
        result.add(ClinicalBionicToken(
          leadingPunct: leadingPunct,
          coreWord: '',
          fixation: '',
          suffix: '',
          trailingPunct: trailingPunct,
          fullWord: raw,
          category: 'standard',
          orpIndex: 0,
          orpChar: raw.isNotEmpty ? raw[0] : '',
          leftOfOrp: '',
          rightOfOrp: raw.length > 1 ? raw.substring(1) : '',
          holdMultiplier: 1.0,
        ));
        continue;
      }

      final lower = coreWord.toLowerCase();
      String fixation = '';
      String suffix = '';
      String category = 'standard';
      String? tallManWord;

      // 1. ISMP Tall Man LASA Lookup
      if (ismpTallManMap.containsKey(lower)) {
        tallManWord = ismpTallManMap[lower]!;
        category = 'medication-tallman';

        // Fixation bolds up to the end of the capitalized Tall Man block
        int lastUpper = 0;
        for (int i = 0; i < tallManWord.length; i++) {
          final code = tallManWord.codeUnitAt(i);
          if (code >= 65 && code <= 90) {
            lastUpper = i;
          }
        }
        final fixLen = (lastUpper + 1).clamp(1, coreWord.length);
        fixation = coreWord.substring(0, fixLen);
        suffix = coreWord.substring(fixLen);
      }
      // 2. Curated Medical Morpheme Prefix Lookup
      else {
        String? matchedPrefix;
        for (final prefix in medicalPrefixes) {
          if (lower.startsWith(prefix) && coreWord.length >= prefix.length) {
            matchedPrefix = prefix;
            break;
          }
        }

        if (matchedPrefix != null) {
          category = 'medical-morpheme';
          final fixLen = matchedPrefix.length.clamp(1, coreWord.length);
          fixation = coreWord.substring(0, fixLen);
          suffix = coreWord.substring(fixLen);
        } else if (RegExp(r'^(allergy|allergic|contraindicated|anaphylaxis|blackbox|fatal|toxicity|overdose|warning)$', caseSensitive: false).hasMatch(coreWord)) {
          category = 'clinical-warning';
          final len = coreWord.length;
          final fixLen = (len * 0.45).ceil().clamp(1, len);
          fixation = coreWord.substring(0, fixLen);
          suffix = coreWord.substring(fixLen);
        } else if (RegExp(r'^\d+(\.\d+)?$').hasMatch(coreWord)) {
          // Vital or measurement numeric token
          category = 'vital';
          fixation = coreWord;
          suffix = '';
        } else {
          // Standard Bionic Fixation: bold first 40-45% of characters
          category = 'standard';
          final len = coreWord.length;
          int fixLen = 1;
          if (len == 1) {
            fixLen = 1;
          } else if (len <= 3) {
            fixLen = 1;
          } else if (len <= 6) {
            fixLen = 2;
          } else if (len <= 9) {
            fixLen = 3;
          } else {
            fixLen = (len * 0.45).ceil().clamp(1, len);
          }
          fixation = coreWord.substring(0, fixLen);
          suffix = coreWord.substring(fixLen);
        }
      }

      // Compute ORP
      final orpIdx = calculateOrpIndex(coreWord.length).clamp(0, coreWord.length - 1);
      final orpChar = coreWord[orpIdx];
      final leftOfOrp = coreWord.substring(0, orpIdx);
      final rightOfOrp = coreWord.substring(orpIdx + 1);

      // Compute hold multiplier for RSVP pacing with safety deceleration
      double hold = 1.0;
      if (category == 'medication-tallman') {
        hold = 2.5; // High-risk safety deceleration: slows from 700 WPM to ~280 WPM
      } else if (category == 'clinical-warning') {
        hold = 2.0; // Clinical safety warning hold
      } else if (trailingPunct.contains('.') || trailingPunct.contains('!') || trailingPunct.contains('?')) {
        hold = 1.5;
      } else if (trailingPunct.contains(',') || trailingPunct.contains(';') || trailingPunct.contains(':')) {
        hold = 1.25;
      }

      result.add(ClinicalBionicToken(
        leadingPunct: leadingPunct,
        coreWord: coreWord,
        fixation: fixation,
        suffix: suffix,
        trailingPunct: trailingPunct,
        fullWord: raw,
        category: category,
        orpIndex: orpIdx,
        orpChar: orpChar,
        leftOfOrp: leftOfOrp,
        rightOfOrp: rightOfOrp,
        tallManWord: tallManWord,
        holdMultiplier: hold,
      ));
    }

    return result;
  }

  /// Builds a [List<InlineSpan>] from [tokens] for high-density clinical rendering.
  static List<InlineSpan> formatBionicSpans(
    List<ClinicalBionicToken> tokens, {
    TextStyle? normalStyle,
    TextStyle? boldStyle,
    bool isBionicEnabled = true,
  }) {
    final effectiveNormal = normalStyle ?? const TextStyle(color: Color(0xFF1C1C1C), fontSize: 13, height: 1.4);
    final effectiveBold = boldStyle ?? effectiveNormal.copyWith(fontWeight: FontWeight.w800, color: const Color(0xFF0F172A));

    final List<InlineSpan> spans = [];

    for (int i = 0; i < tokens.length; i++) {
      final t = tokens[i];

      if (!isBionicEnabled) {
        spans.add(TextSpan(text: t.fullWord, style: effectiveNormal));
      } else {
        // Leading punctuation
        if (t.leadingPunct.isNotEmpty) {
          spans.add(TextSpan(text: t.leadingPunct, style: effectiveNormal));
        }

        // Fixation (bold)
        if (t.fixation.isNotEmpty) {
          spans.add(TextSpan(
            text: t.fixation,
            style: t.category == 'medication-tallman'
                ? effectiveBold.copyWith(color: const Color(0xFFD97706)) // Amber for LASA
                : effectiveBold,
          ));
        }

        // Suffix (regular)
        if (t.suffix.isNotEmpty) {
          spans.add(TextSpan(text: t.suffix, style: effectiveNormal));
        }

        // Trailing punctuation
        if (t.trailingPunct.isNotEmpty) {
          spans.add(TextSpan(text: t.trailingPunct, style: effectiveNormal));
        }
      }

      // Add space between tokens
      if (i < tokens.length - 1) {
        spans.add(TextSpan(text: ' ', style: effectiveNormal));
      }
    }

    return spans;
  }
}
