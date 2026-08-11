import 'dart:math';
import 'package:flutter/foundation.dart';

enum ToothSurface { M, O, D, F, L }

typedef TWIGrade = int; // 0..4

class ToothState {
  final int fdiNumber; // 11-18, 21-28, 31-38, 41-48
  final String name;
  final int quadrant; // 1..4
  final Set<ToothSurface> cariesSurfaces;
  final TWIGrade twiGrade;
  final double probingDepthMm;
  final bool hasBleedingOnProbing;

  const ToothState({
    required this.fdiNumber,
    required this.name,
    required this.quadrant,
    this.cariesSurfaces = const {},
    this.twiGrade = 0,
    this.probingDepthMm = 2.0,
    this.hasBleedingOnProbing = false,
  });

  ToothState copyWith({
    Set<ToothSurface>? cariesSurfaces,
    TWIGrade? twiGrade,
    double? probingDepthMm,
    bool? hasBleedingOnProbing,
  }) {
    return ToothState(
      fdiNumber: fdiNumber,
      name: name,
      quadrant: quadrant,
      cariesSurfaces: cariesSurfaces ?? this.cariesSurfaces,
      twiGrade: twiGrade ?? this.twiGrade,
      probingDepthMm: probingDepthMm ?? this.probingDepthMm,
      hasBleedingOnProbing: hasBleedingOnProbing ?? this.hasBleedingOnProbing,
    );
  }
}

class TeledentistryService with ChangeNotifier {
  List<ToothState> _teeth = [];
  double _hsCRP = 2.4; // mg/L baseline

  List<ToothState> get teeth => List.unmodifiable(_teeth);
  double get hsCRP => _hsCRP;

  TeledentistryService() {
    _teeth = _initOdontogram();
  }

  set hsCRP(double value) {
    _hsCRP = value;
    notifyListeners();
  }

  /// Number of deep periodontal pockets (PPD >= 4.0 mm)
  int get deepPocketsCount =>
      _teeth.where((t) => t.probingDepthMm >= 4.0).length;

  /// Percentage of tooth sites with Bleeding on Probing (BOP %)
  double get bleedingPercentage {
    if (_teeth.isEmpty) return 0.0;
    final bopCount = _teeth.where((t) => t.hasBleedingOnProbing).length;
    return (bopCount / _teeth.length) * 100.0;
  }

  /// Systemic Inflammatory Burden Index (SIBI 0-100)
  /// SIBI = min(100, (Deep Pockets * 6) + (%BOP * 0.8) + (hs-CRP * 12))
  int get sibiScore {
    final raw = (deepPocketsCount * 6.0) +
        (bleedingPercentage * 0.8) +
        (_hsCRP * 12.0);
    return min(100, raw.round());
  }

  /// Cardiovascular Risk Multiplier (1.0x - 2.8x)
  double get cvRiskMultiplier {
    final sibi = sibiScore;
    final multiplier = 1.0 + (sibi / 100.0) * 1.8;
    return double.parse(multiplier.toStringAsFixed(2));
  }

  /// Predicted HbA1c Elevation (+0.0% to +0.8%)
  double get predictedHbA1cElevation {
    final sibi = sibiScore;
    final elevation = (sibi / 100.0) * 0.8;
    return double.parse(elevation.toStringAsFixed(2));
  }

  void toggleSurface(int fdiNumber, ToothSurface surface) {
    _teeth = _teeth.map((t) {
      if (t.fdiNumber != fdiNumber) return t;
      final nextSurfaces = Set<ToothSurface>.from(t.cariesSurfaces);
      if (nextSurfaces.contains(surface)) {
        nextSurfaces.remove(surface);
      } else {
        nextSurfaces.add(surface);
      }
      return t.copyWith(cariesSurfaces: nextSurfaces);
    }).toList();
    notifyListeners();
  }

  void setTWIGrade(int fdiNumber, TWIGrade grade) {
    _teeth = _teeth.map((t) {
      if (t.fdiNumber != fdiNumber) return t;
      return t.copyWith(twiGrade: min(4, max(0, grade)));
    }).toList();
    notifyListeners();
  }

  void setProbingDepth(int fdiNumber, double depthMm) {
    _teeth = _teeth.map((t) {
      if (t.fdiNumber != fdiNumber) return t;
      return t.copyWith(probingDepthMm: max(0.0, depthMm));
    }).toList();
    notifyListeners();
  }

  void toggleBOP(int fdiNumber) {
    _teeth = _teeth.map((t) {
      if (t.fdiNumber != fdiNumber) return t;
      return t.copyWith(hasBleedingOnProbing: !t.hasBleedingOnProbing);
    }).toList();
    notifyListeners();
  }

  static List<ToothState> _initOdontogram() {
    final list = <ToothState>[];

    String getToothName(int num) {
      const names = {
        18: 'Maxillary Right 3rd Molar', 17: 'Maxillary Right 2nd Molar', 16: 'Maxillary Right 1st Molar',
        15: 'Maxillary Right 2nd Premolar', 14: 'Maxillary Right 1st Premolar', 13: 'Maxillary Right Canine',
        12: 'Maxillary Right Lateral Incisor', 11: 'Maxillary Right Central Incisor',
        21: 'Maxillary Left Central Incisor', 22: 'Maxillary Left Lateral Incisor', 23: 'Maxillary Left Canine',
        24: 'Maxillary Left 1st Premolar', 25: 'Maxillary Left 2nd Premolar', 26: 'Maxillary Left 1st Molar',
        27: 'Maxillary Left 2nd Molar', 28: 'Maxillary Left 3rd Molar',
        48: 'Mandibular Right 3rd Molar', 47: 'Mandibular Right 2nd Molar', 46: 'Mandibular Right 1st Molar',
        45: 'Mandibular Right 2nd Premolar', 44: 'Mandibular Right 1st Premolar', 43: 'Mandibular Right Canine',
        42: 'Mandibular Right Lateral Incisor', 41: 'Mandibular Right Central Incisor',
        31: 'Mandibular Left Central Incisor', 32: 'Mandibular Left Lateral Incisor', 33: 'Mandibular Left Canine',
        34: 'Mandibular Left 1st Premolar', 35: 'Mandibular Left 2nd Premolar', 36: 'Mandibular Left 1st Molar',
        37: 'Mandibular Left 2nd Molar', 38: 'Mandibular Left 3rd Molar'
      };
      return names[num] ?? 'Tooth $num';
    }

    // Q1: 18..11
    for (var fdi = 18; fdi >= 11; fdi--) {
      list.add(ToothState(fdiNumber: fdi, name: getToothName(fdi), quadrant: 1));
    }
    // Q2: 21..28
    for (var fdi = 21; fdi <= 28; fdi++) {
      list.add(ToothState(fdiNumber: fdi, name: getToothName(fdi), quadrant: 2));
    }
    // Q4: 48..41
    for (var fdi = 48; fdi >= 41; fdi--) {
      list.add(ToothState(fdiNumber: fdi, name: getToothName(fdi), quadrant: 4));
    }
    // Q3: 31..38
    for (var fdi = 31; fdi <= 38; fdi++) {
      list.add(ToothState(fdiNumber: fdi, name: getToothName(fdi), quadrant: 3));
    }

    // Set clinical baseline demo state on key teeth (16, 26, 46)
    return list.map((t) {
      if (t.fdiNumber == 16) {
        return t.copyWith(
          cariesSurfaces: {ToothSurface.O, ToothSurface.M},
          twiGrade: 2,
          probingDepthMm: 5.0,
          hasBleedingOnProbing: true,
        );
      }
      if (t.fdiNumber == 46) {
        return t.copyWith(
          cariesSurfaces: {ToothSurface.O, ToothSurface.D},
          twiGrade: 1,
          probingDepthMm: 4.0,
          hasBleedingOnProbing: true,
        );
      }
      if (t.fdiNumber == 26) {
        return t.copyWith(
          twiGrade: 3,
          probingDepthMm: 4.0,
          hasBleedingOnProbing: true,
        );
      }
      return t;
    }).toList();
  }
}
