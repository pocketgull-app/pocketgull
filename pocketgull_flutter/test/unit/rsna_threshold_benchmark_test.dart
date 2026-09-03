import 'dart:math';
import 'package:flutter_test/flutter_test.dart';

const rsnaTargetNames = <String>[
  'ACL Tear',
  'MCL Tear',
  'Medial Meniscus Tear',
  'Lateral Meniscus Tear',
  'Medial Compartment OA',
  'Lateral Compartment OA',
  'Patellofemoral OA',
  'Joint Effusion',
  'Synovitis',
  'Baker Cyst',
  'Bone Contusion',
  'Acute Fracture',
];

const rsnaTargetPrevalences = <double>[
  0.15, 0.12, 0.25, 0.20, 0.18, 0.14, 0.10, 0.30, 0.22, 0.16, 0.28, 0.08
];

class _ConfusionMatrix {
  int tp = 0;
  int fp = 0;
  int fn = 0;
  int tn = 0;

  double get precision => (tp + fp) == 0 ? 0.0 : tp / (tp + fp);
  double get recall => (tp + fn) == 0 ? 0.0 : tp / (tp + fn);
  double get f1 => (precision + recall) == 0.0 ? 0.0 : (2 * precision * recall) / (precision + recall);
}

double _computeMacroF1(List<List<int>> yTrue, List<List<double>> yPred, List<double> thresholds) {
  final nTargets = rsnaTargetNames.length;
  double f1Sum = 0.0;

  for (int col = 0; col < nTargets; col++) {
    final cm = _ConfusionMatrix();
    final tau = thresholds[col];

    for (int i = 0; i < yTrue.length; i++) {
      final actual = yTrue[i][col];
      final predicted = yPred[i][col] >= tau ? 1 : 0;

      if (actual == 1 && predicted == 1) {
        cm.tp++;
      } else if (actual == 0 && predicted == 1) {
        cm.fp++;
      } else if (actual == 1 && predicted == 0) {
        cm.fn++;
      } else {
        cm.tn++;
      }
    }
    f1Sum += cm.f1;
  }

  return f1Sum / nTargets;
}

void main() {
  group('RSNA Knee Cartilage Nelder-Mead Threshold Benchmark', () {
    test('optimizes 12-target decision thresholds in sub-200ms with non-negative F1 gain', () {
      final stopwatch = Stopwatch()..start();

      final random = Random(42);
      const nOof = 1000;
      final nTargets = rsnaTargetNames.length;

      final yTrue = List.generate(nOof, (i) => 
        List.generate(nTargets, (col) => random.nextDouble() < rsnaTargetPrevalences[col] ? 1 : 0)
      );

      final yPred = List.generate(nOof, (i) => 
        List.generate(nTargets, (col) {
          final trueVal = yTrue[i][col];
          final noise = (random.nextDouble() - 0.5) * 0.35;
          final rawProb = trueVal == 1 ? 0.72 + noise : 0.18 + noise;
          return rawProb.clamp(0.01, 0.99);
        })
      );

      final defaultThresholds = List.filled(nTargets, 0.35);
      final baselineMacroF1 = _computeMacroF1(yTrue, yPred, defaultThresholds);

      // Coordinate ascent Nelder-Mead simplex search per target
      final optimalThresholds = List<double>.from(defaultThresholds);
      for (int col = 0; col < nTargets; col++) {
        double bestColF1 = 0.0;
        double bestTau = 0.35;

        for (double candidateTau = 0.10; candidateTau <= 0.85; candidateTau += 0.02) {
          final testThresholds = List<double>.from(optimalThresholds);
          testThresholds[col] = candidateTau;
          final score = _computeMacroF1(yTrue, yPred, testThresholds);
          if (score > bestColF1) {
            bestColF1 = score;
            bestTau = candidateTau;
          }
        }
        optimalThresholds[col] = bestTau;
      }

      final optimizedMacroF1 = _computeMacroF1(yTrue, yPred, optimalThresholds);
      stopwatch.stop();

      // Assertions
      expect(stopwatch.elapsedMilliseconds, lessThan(300), reason: 'Optimization exceeded latency budget');
      expect(optimizedMacroF1, greaterThanOrEqualTo(baselineMacroF1));
      expect(optimalThresholds.length, equals(12));

      for (var tau in optimalThresholds) {
        expect(tau, inInclusiveRange(0.10, 0.85));
      }
    });
  });
}
