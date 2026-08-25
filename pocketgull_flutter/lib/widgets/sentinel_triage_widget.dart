import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/sentinel_types.dart';
import '../models/patient_types.dart';

/// Sentinel triage — WHO/NHI Outbreak Triage & Connectivity dashboard.
///
/// Flutter parity with Angular `sentinel-triage.component.ts`.
/// Features a live Canvas connectivity map with animated data packets,
/// sentinel node topology, alert broadcast, and AI containment protocols.

class SentinelTriageWidget extends ConsumerStatefulWidget {
  final Patient? selectedPatient;
  const SentinelTriageWidget({super.key, this.selectedPatient});

  @override
  ConsumerState<SentinelTriageWidget> createState() =>
      _SentinelTriageWidgetState();
}

class _SentinelTriageWidgetState extends ConsumerState<SentinelTriageWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late List<SentinelPacket> _packets;
  Timer? _metricsTimer;

  bool _isAlertActive = false;
  int _activeLatency = 45;
  int _activeBps = 128;
  bool _isGeneratingProtocol = false;

  double _syncRippleRadius = 0;
  bool _syncRippleActive = false;

  String _containmentRecommendation =
      '1. Establish respiratory isolation ward immediately.\n'
      '2. Set up local surveillance telemetry nodes within 5km radius.\n'
      '3. Initiate diagnostic PCR tests for suspected respiratory cases.\n'
      '4. Queue national stockpile inventory allocation for critical antiviral agents.';

  @override
  void initState() {
    super.initState();
    _packets = defaultSentinelPackets();

    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat();

    // Fluctuate network metrics periodically.
    _metricsTimer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (math.Random().nextDouble() > 0.5 && mounted) {
        setState(() {
          _activeLatency = 40 + math.Random().nextInt(20);
          _activeBps = 120 + math.Random().nextInt(40);
        });
      }
    });
  }

  @override
  void dispose() {
    _animController.dispose();
    _metricsTimer?.cancel();
    super.dispose();
  }

  String _threatLevelLabel(String? patientId) {
    switch (patientId) {
      case 'p004':
        return 'Pandemic Watch (Lvl 8.5)';
      case 'p005':
        return 'Regional Incident (Lvl 6.2)';
      case 'p006':
        return 'Under-5 Outbreak (Lvl 9.1)';
      case 'p007':
        return 'Critical Care Delivery (Lvl 7.8)';
      default:
        return 'Observation';
    }
  }

  void _syncRegistry() {
    setState(() {
      _syncRippleRadius = 0;
      _syncRippleActive = true;
    });
  }

  void _toggleBroadcastAlert() {
    setState(() {
      _isAlertActive = !_isAlertActive;
    });
  }

  void _generateProtocols() {
    final selectedId = widget.selectedPatient?.id;
    setState(() {
      _isGeneratingProtocol = true;
    });

    Future.delayed(const Duration(milliseconds: 1200), () {
      if (!mounted) return;
      setState(() {
        if (selectedId == 'p006') {
          _containmentRecommendation =
              '1. Deploy pediatric rehydration caches to regions showing elevated enteric caseloads.\n'
              '2. Formulate public health notice recommending mosquito net deployments in catchment sectors.\n'
              '3. Trigger Sentinel alert notification to local community health workers.';
        } else if (selectedId == 'p007') {
          _containmentRecommendation =
              '1. Direct emergency blood banks to maintain hyper-responsive protocols.\n'
              '2. Setup intensive sepsis monitoring checks at local birth registries.\n'
              '3. Dispatch specialized maternal support telemetry packs to outlying field clinics.';
        } else {
          _containmentRecommendation =
              '1. Enforce quarantine and border isolation restrictions in Sector 4.\n'
              '2. Escalate regional clinical coordination channels with local CDC partners.\n'
              '3. Trigger daily telemetry sync protocol for active hospital records.';
        }
        _isGeneratingProtocol = false;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final selectedPatient = widget.selectedPatient;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF18181B) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark
              ? Colors.white.withValues(alpha: 0.08)
              : Colors.grey.shade200,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.06),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title Bar
          _buildTitleBar(isDark, selectedPatient?.id),
          Padding(
            padding: const EdgeInsets.all(16),
            child: LayoutBuilder(
              builder: (context, constraints) {
                final isWide = constraints.maxWidth > 600;
                if (isWide) {
                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Left: Connectivity map
                      SizedBox(
                        width: constraints.maxWidth * 0.4,
                        child: _buildLeftPanel(isDark),
                      ),
                      const SizedBox(width: 16),
                      // Right: Metrics & protocol
                      Expanded(
                        child: _buildRightPanel(isDark, selectedPatient),
                      ),
                    ],
                  );
                }
                return Column(
                  children: [
                    _buildLeftPanel(isDark),
                    const SizedBox(height: 16),
                    _buildRightPanel(isDark, selectedPatient),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTitleBar(bool isDark, String? patientId) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: isDark
                ? Colors.white.withValues(alpha: 0.06)
                : Colors.grey.shade100,
          ),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'WHO / NHI Sentinel Outbreak Triage & Connectivity',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: isDark ? Colors.grey.shade200 : Colors.grey.shade800,
            ),
          ),
          Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.red.withValues(alpha: isDark ? 0.15 : 0.08),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(
                    color: Colors.red.withValues(alpha: 0.2),
                  ),
                ),
                child: Text(
                  _threatLevelLabel(patientId),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.5,
                    color: isDark
                        ? Colors.red.shade300
                        : Colors.red.shade600,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'Registry v4.12',
                style: TextStyle(
                  fontSize: 11,
                  fontFamily: 'monospace',
                  color: isDark ? Colors.grey.shade600 : Colors.grey.shade400,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLeftPanel(bool isDark) {
    return Column(
      children: [
        // Connectivity Map
        AspectRatio(
          aspectRatio: 4 / 3,
          child: Container(
            decoration: BoxDecoration(
              color: const Color(0xFF0A0A0A),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.08),
              ),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: Stack(
                children: [
                  // Canvas animation
                  AnimatedBuilder(
                    animation: _animController,
                    builder: (context, child) {
                      return CustomPaint(
                        painter: _SentinelMapPainter(
                          nodes: defaultSentinelNodes(),
                          packets: _packets,
                          isAlert: _isAlertActive,
                          syncRippleActive: _syncRippleActive,
                          syncRippleRadius: _syncRippleRadius,
                          animProgress: _animController.value,
                          onUpdateState: (rippleRadius, rippleActive) {
                            _syncRippleRadius = rippleRadius;
                            _syncRippleActive = rippleActive;
                          },
                        ),
                        size: Size.infinite,
                      );
                    },
                  ),
                  // Top HUD
                  Positioned(
                    left: 12,
                    right: 12,
                    top: 10,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                color: Color(0xFF4285F4),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 6),
                            const Text(
                              'PUBLIC HEALTH UPLINK',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 2,
                                color: Color(0xFF4285F4),
                              ),
                            ),
                          ],
                        ),
                        Text(
                          'Latency: ${_activeLatency}ms',
                          style: const TextStyle(
                            fontSize: 10,
                            fontFamily: 'monospace',
                            color: Color(0xFF6B7280),
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Bottom HUD
                  Positioned(
                    left: 12,
                    right: 12,
                    bottom: 10,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _hudBadge(
                          'Connected Nodes: 5 / 5',
                          Colors.white.withValues(alpha: 0.06),
                          Colors.grey.shade400,
                        ),
                        _hudBadge(
                          'Data rate: $_activeBps kb/s',
                          const Color(0xFF052E16),
                          const Color(0xFF4ADE80),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        // Action buttons
        Row(
          children: [
            Expanded(
              child: _actionButton(
                label: 'SYNC REGISTRY',
                icon: Icons.sync,
                color: const Color(0xFF2563EB),
                onPressed: _syncRegistry,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _actionButton(
                label: _isAlertActive ? 'MUTE ALERT' : 'BROADCAST ALERT',
                icon: Icons.warning_amber_rounded,
                color: _isAlertActive
                    ? Colors.red.shade600
                    : const Color(0xFF3F3F46),
                onPressed: _toggleBroadcastAlert,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildRightPanel(bool isDark, dynamic selectedPatient) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Patient context
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF09090B) : Colors.grey.shade50,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.06)
                  : Colors.grey.shade200,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${selectedPatient?.name ?? 'No Patient'} Profile',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: isDark ? Colors.white : Colors.grey.shade900,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Sentinel ID: ${selectedPatient?.id ?? '-'} • '
                        'Age: ${selectedPatient?.age ?? '-'} • '
                        'Gender: ${selectedPatient?.gender ?? '-'}',
                        style: TextStyle(
                          fontSize: 11,
                          color: isDark
                              ? Colors.grey.shade500
                              : Colors.grey.shade500,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.05)
                          : Colors.grey.shade200,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      selectedPatient?.id == 'p004'
                          ? 'WHO-GSD-99'
                          : 'CDC-USA-02',
                      style: TextStyle(
                        fontSize: 11,
                        fontFamily: 'monospace',
                        color: isDark
                            ? Colors.grey.shade300
                            : Colors.grey.shade700,
                      ),
                    ),
                  ),
                ],
              ),
              if (selectedPatient?.patientGoals != null &&
                  selectedPatient!.patientGoals.toString().isNotEmpty) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.only(left: 12),
                  decoration: const BoxDecoration(
                    border: Border(
                      left: BorderSide(
                        color: Color(0xFF3B82F6),
                        width: 2,
                      ),
                    ),
                  ),
                  child: Text(
                    selectedPatient.patientGoals.toString(),
                    style: TextStyle(
                      fontSize: 12,
                      fontStyle: FontStyle.italic,
                      height: 1.5,
                      color: isDark
                          ? Colors.grey.shade300
                          : Colors.grey.shade600,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 14),
        // Containment Protocol
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFF3B82F6).withValues(alpha: isDark ? 0.08 : 0.04),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.shield,
                        size: 16,
                        color: isDark
                            ? const Color(0xFF60A5FA)
                            : const Color(0xFF2563EB),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'AI CONTAINMENT & ACTION DIRECTIVE',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.5,
                          color: isDark
                              ? const Color(0xFF60A5FA)
                              : const Color(0xFF2563EB),
                        ),
                      ),
                    ],
                  ),
                  GestureDetector(
                    onTap:
                        _isGeneratingProtocol ? null : _generateProtocols,
                    child: Text(
                      _isGeneratingProtocol
                          ? 'Generating...'
                          : 'Refresh AI Protocol',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1,
                        color: _isGeneratingProtocol
                            ? Colors.grey.shade500
                            : isDark
                                ? const Color(0xFF60A5FA)
                                : const Color(0xFF2563EB),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                _containmentRecommendation,
                style: TextStyle(
                  fontSize: 12,
                  fontFamily: 'monospace',
                  height: 1.6,
                  color: isDark ? Colors.grey.shade300 : Colors.grey.shade700,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _hudBadge(String text, Color bgColor, Color textColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.05),
        ),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 10,
          fontFamily: 'monospace',
          color: textColor,
        ),
      ),
    );
  }

  Widget _actionButton({
    required String label,
    required IconData icon,
    required Color color,
    required VoidCallback onPressed,
  }) {
    return Material(
      color: color,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 16, color: Colors.white),
              const SizedBox(width: 6),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.5,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Custom painter for the sentinel connectivity map.
///
/// Renders the hub-and-spoke node topology, animated data packets,
/// grid overlay, sync ripple effect, and alert mode visuals.
class _SentinelMapPainter extends CustomPainter {
  final List<SentinelNode> nodes;
  final List<SentinelPacket> packets;
  final bool isAlert;
  final bool syncRippleActive;
  final double syncRippleRadius;
  final double animProgress;
  final void Function(double radius, bool active)? onUpdateState;

  _SentinelMapPainter({
    required this.nodes,
    required this.packets,
    required this.isAlert,
    required this.syncRippleActive,
    required this.syncRippleRadius,
    required this.animProgress,
    this.onUpdateState,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    // Map normalized node positions to pixel coords.
    final pixelNodes = nodes
        .map((n) => _PixelNode(
              id: n.id,
              name: n.name,
              x: n.x * w,
              y: n.y * h,
            ))
        .toList();

    final hub = pixelNodes.firstWhere((n) => n.id == 'hub');

    // Grid overlay
    final gridPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.5
      ..color = Colors.white.withValues(alpha: 0.02);
    const gridSize = 25.0;
    for (double x = 0; x < w; x += gridSize) {
      canvas.drawLine(Offset(x, 0), Offset(x, h), gridPaint);
    }
    for (double y = 0; y < h; y += gridSize) {
      canvas.drawLine(Offset(0, y), Offset(w, y), gridPaint);
    }

    // Connections
    for (final node in pixelNodes) {
      if (node.id == 'hub') continue;
      final paint = Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5;

      if (isAlert) {
        final flash = (math.sin(animProgress * math.pi * 2) * 0.5 + 0.5);
        paint.color = Color.fromRGBO(239, 68, 68, 0.15 + flash * 0.35);
      } else {
        paint.color = const Color.fromRGBO(66, 133, 244, 0.15);
      }
      canvas.drawLine(
        Offset(node.x, node.y),
        Offset(hub.x, hub.y),
        paint,
      );
    }

    // Packets
    for (final packet in packets) {
      final from = pixelNodes.firstWhere(
        (n) => n.id == packet.fromNodeId,
        orElse: () => hub,
      );

      packet.progress += packet.speed * (isAlert ? 1.8 : 1);
      if (packet.progress >= 1.0) {
        packet.progress = 0;
        packet.speed = 0.003 + math.Random().nextDouble() * 0.006;
      }

      final px = from.x + (hub.x - from.x) * packet.progress;
      final py = from.y + (hub.y - from.y) * packet.progress;

      final color = isAlert
          ? const Color(0xFFEF4444)
          : packet.color;

      final paint = Paint()
        ..style = PaintingStyle.fill
        ..color = color;
      canvas.drawCircle(Offset(px, py), 3.5, paint);

      // Glow
      final glowPaint = Paint()
        ..style = PaintingStyle.fill
        ..color = color.withValues(alpha: 0.3)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 6);
      canvas.drawCircle(Offset(px, py), 5, glowPaint);
    }

    // Sync ripple
    if (syncRippleActive) {
      final newRadius = syncRippleRadius + 3.5;
      final opacity = math.max(0.0, 1.0 - (newRadius / (w * 0.5)));

      final ripplePaint = Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2
        ..color = Color.fromRGBO(52, 168, 83, opacity * 0.6);
      canvas.drawCircle(Offset(hub.x, hub.y), newRadius, ripplePaint);

      onUpdateState?.call(newRadius, opacity > 0);
    }

    // Nodes
    for (final node in pixelNodes) {
      final size = node.id == 'hub' ? 8.0 : 5.5;

      Color fill;
      if (isAlert && node.id != 'hub') {
        final pulse = (animProgress * 5).floor() % 2 == 0;
        fill = pulse ? const Color(0xFFEF4444) : const Color(0xFF7F1D1D);
      } else if (node.id == 'hub') {
        fill = syncRippleActive
            ? const Color(0xFF34A853)
            : const Color(0xFF4285F4);
      } else {
        fill = const Color(0xFF5F6368);
      }

      // Node fill
      final nodePaint = Paint()
        ..style = PaintingStyle.fill
        ..color = fill;
      canvas.drawCircle(Offset(node.x, node.y), size, nodePaint);

      // Ring
      final ringPaint = Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1
        ..color = node.id == 'hub'
            ? const Color.fromRGBO(66, 133, 244, 0.2)
            : Colors.white.withValues(alpha: 0.05);
      canvas.drawCircle(Offset(node.x, node.y), size + 4, ringPaint);

      // Label
      final textSpan = TextSpan(
        text: node.name,
        style: const TextStyle(
          fontSize: 8,
          color: Color(0xFF9CA3AF),
          fontFamily: 'sans-serif',
        ),
      );
      final tp = TextPainter(
        text: textSpan,
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(
        canvas,
        Offset(node.x - tp.width / 2, node.y - size - 12),
      );
    }
  }

  @override
  bool shouldRepaint(covariant _SentinelMapPainter oldDelegate) => true;
}

class _PixelNode {
  final String id;
  final String name;
  final double x;
  final double y;

  const _PixelNode({
    required this.id,
    required this.name,
    required this.x,
    required this.y,
  });
}
