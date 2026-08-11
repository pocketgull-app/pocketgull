import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/patient_provider.dart';
import '../models/patient_types.dart';

/// Biometric history chart — time-series line chart for telemetry.
///
/// Flutter parity with Angular `biometric-history-chart.component.ts`.
/// Renders HR, BP, SpO2, HRV, Coherence, Breathing metrics using
/// CustomPainter (replacing Chart.js on the web side).

class BiometricHistoryChartWidget extends ConsumerStatefulWidget {
  const BiometricHistoryChartWidget({super.key});

  @override
  ConsumerState<BiometricHistoryChartWidget> createState() =>
      _BiometricHistoryChartWidgetState();
}

class _BiometricHistoryChartWidgetState
    extends ConsumerState<BiometricHistoryChartWidget> {
  String _activeMetric = 'hr';
  Timer? _mockTimer;

  static const _metrics = ['hr', 'bp', 'spO2', 'hrv', 'coherence', 'breathing'];

  @override
  void initState() {
    super.initState();
    _startMockSimulation();
  }

  @override
  void dispose() {
    _mockTimer?.cancel();
    super.dispose();
  }

  void _startMockSimulation() {
    _mockTimer = Timer.periodic(const Duration(seconds: 2), (_) {
      if (!mounted) return;
      final timestamp = DateTime.now().toIso8601String();
      final seconds = DateTime.now().second;
      final rng = math.Random();

      final entries = <BiometricEntry>[];
      for (final t in _metrics) {
        String value;
        switch (t) {
          case 'hr':
            value = '${(72 + 6 * math.sin(seconds * 0.1) + rng.nextDouble() * 2).round()}';
          case 'bp':
            final sys = (118 + 5 * math.sin(seconds * 0.08) + rng.nextDouble() * 2).round();
            final dia = (76 + 4 * math.sin(seconds * 0.08) + rng.nextDouble() * 2).round();
            value = '$sys/$dia';
          case 'spO2':
            final spVal = math.min(100, (97 + 1.5 * math.sin(seconds * 0.05) + rng.nextDouble() * 0.5).round());
            value = '$spVal';
          case 'hrv':
            value = '${(55 + 12 * math.sin(seconds * 0.12) + rng.nextDouble() * 4).round()}';
          case 'coherence':
            final cohVal = math.min(1.0, math.max(0.0, 0.65 + 0.25 * math.sin(seconds * 0.09) + rng.nextDouble() * 0.05)).toStringAsFixed(2);
            value = cohVal;
          case 'breathing':
            value = '${(14 + 2 * math.sin(seconds * 0.1) + rng.nextDouble()).round()}';
          default:
            value = '0';
        }
        entries.add(BiometricEntry(
          timestamp: timestamp,
          type: t,
          value: value,
          source: 'Mock Telemetry Simulator',
        ));
      }

      // Add to patient state.
      for (final entry in entries) {
        ref.read(patientProvider.notifier).addBiometricEntry(entry);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final patient = ref.watch(patientProvider);
    final history = patient.biometricHistory ?? [];
    final filtered = history.where((e) => e.type == _activeMetric).toList();

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF111111) : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark
              ? Colors.white.withValues(alpha: 0.06)
              : Colors.grey.shade200,
        ),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'BIOMETRIC TRENDS',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 2,
                      color: isDark ? Colors.grey.shade500 : Colors.grey.shade500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          color: Color(0xFF4ADE80),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'Demo Mode (Mock Telemetry)',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1,
                          color: isDark
                              ? const Color(0xFF4ADE80)
                              : Colors.green.shade600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 8),
          // Metric selector (SingleLine horizontal scroll to prevent vertical height growth overflow)
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _metrics.map((m) {
                final isActive = _activeMetric == m;
                final label = switch (m) {
                  'hr' => 'HR',
                  'bp' => 'BP',
                  'spO2' => 'SpO2',
                  'hrv' => 'HRV',
                  'coherence' => 'Coherence',
                  'breathing' => 'Breath',
                  _ => m,
                };
                return Padding(
                  padding: const EdgeInsets.only(right: 4),
                  child: GestureDetector(
                    onTap: () => setState(() => _activeMetric = m),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: isActive
                            ? (isDark ? const Color(0xFF27272A) : Colors.white)
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(6),
                        boxShadow: isActive
                            ? [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 4)]
                            : null,
                      ),
                      child: Text(
                        label,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 1,
                          color: isActive
                              ? (isDark ? Colors.white : Colors.grey.shade900)
                              : (isDark ? Colors.grey.shade500 : Colors.grey.shade500),
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 12),
          // Chart area with bounded height constraint to prevent viewport overflow
          SizedBox(
            height: 160,
            width: double.infinity,
            child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.bar_chart, size: 32,
                            color: Colors.grey.withValues(alpha: 0.4)),
                        const SizedBox(height: 8),
                        Text(
                          'NO TELEMETRY RECORDED',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 2,
                            color: isDark ? Colors.grey.shade600 : Colors.grey.shade400,
                          ),
                        ),
                      ],
                    ),
                  )
                : CustomPaint(
                    painter: _ChartPainter(
                      data: filtered,
                      metricType: _activeMetric,
                      isDark: isDark,
                    ),
                    size: Size.infinite,
                  ),
          ),
        ],
      ),
    );
  }
}

/// Simple line chart painter for biometric data.
class _ChartPainter extends CustomPainter {
  final List<BiometricEntry> data;
  final String metricType;
  final bool isDark;

  _ChartPainter({
    required this.data,
    required this.metricType,
    required this.isDark,
  });

  Color get _lineColor => switch (metricType) {
        'hr' => const Color(0xFFE11D48),
        'bp' => const Color(0xFFFF4500),
        'spO2' => const Color(0xFF0284C7),
        'hrv' => const Color(0xFF8B5CF6),
        'coherence' => const Color(0xFF10B981),
        'breathing' => const Color(0xFFF59E0B),
        _ => const Color(0xFFE11D48),
      };

  @override
  void paint(Canvas canvas, Size size) {
    if (data.isEmpty) return;

    // Take last 30 entries.
    final points = data.length > 30 ? data.sublist(data.length - 30) : data;

    // Parse values.
    final values = <double>[];
    for (final p in points) {
      if (metricType == 'bp') {
        final parts = p.value.split('/');
        if (parts.length == 2) {
          values.add(double.tryParse(parts[0]) ?? 0);
        }
      } else {
        values.add(double.tryParse(p.value) ?? 0);
      }
    }

    if (values.isEmpty) return;

    final minVal = values.reduce(math.min) - 5;
    final maxVal = values.reduce(math.max) + 5;
    final range = maxVal - minVal;
    if (range == 0) return;

    // Draw line.
    final path = Path();
    for (int i = 0; i < values.length; i++) {
      final x = (i / (values.length - 1).clamp(1, double.infinity)) * size.width;
      final y = size.height - ((values[i] - minVal) / range) * size.height;
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }

    final linePaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round
      ..color = _lineColor;
    canvas.drawPath(path, linePaint);

    // Fill area.
    final fillPath = Path.from(path)
      ..lineTo(size.width, size.height)
      ..lineTo(0, size.height)
      ..close();
    final fillPaint = Paint()
      ..style = PaintingStyle.fill
      ..color = _lineColor.withValues(alpha: 0.08);
    canvas.drawPath(fillPath, fillPaint);

    // Draw points.
    for (int i = 0; i < values.length; i++) {
      final x = (i / (values.length - 1).clamp(1, double.infinity)) * size.width;
      final y = size.height - ((values[i] - minVal) / range) * size.height;

      // Point fill.
      canvas.drawCircle(Offset(x, y), 3,
          Paint()..color = isDark ? const Color(0xFF18181B) : Colors.white);
      // Point border.
      canvas.drawCircle(
          Offset(x, y),
          3,
          Paint()
            ..style = PaintingStyle.stroke
            ..strokeWidth = 1.5
            ..color = _lineColor);
    }
  }

  @override
  bool shouldRepaint(covariant _ChartPainter oldDelegate) =>
      oldDelegate.data.length != data.length ||
      oldDelegate.metricType != metricType;
}
