import 'dart:ui';
import 'package:flutter/material.dart';

enum MetricStatus { normal, warning, critical }

enum TrendDirection { up, down, stable }

class MetricCardWidget extends StatefulWidget {
  final String title;
  final String value;
  final String unit;
  final MetricStatus status;
  final TrendDirection trendDirection;
  final String? trendText;

  const MetricCardWidget({
    super.key,
    required this.title,
    required this.value,
    this.unit = '',
    this.status = MetricStatus.normal,
    this.trendDirection = TrendDirection.stable,
    this.trendText,
  });

  @override
  State<MetricCardWidget> createState() => _MetricCardWidgetState();
}

class _MetricCardWidgetState extends State<MetricCardWidget> with SingleTickerProviderStateMixin {
  bool _isHovered = false;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _initPulseController();
  }

  @override
  void didUpdateWidget(covariant MetricCardWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.status != oldWidget.status) {
      _pulseController.dispose();
      _initPulseController();
    }
  }

  void _initPulseController() {
    // Critical pulses faster (1s) vs warning/normal (3s)
    final duration = widget.status == MetricStatus.critical
        ? const Duration(seconds: 1)
        : const Duration(seconds: 3);

    _pulseController = AnimationController(
      vsync: this,
      duration: duration,
    )..repeat();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Status Colors
    Color statusColor;
    Color pulseColor;
    switch (widget.status) {
      case MetricStatus.critical:
        statusColor = const Color(0xFFEF4444); // bg-red-500
        pulseColor = const Color(0xFFF87171); // bg-red-400
        break;
      case MetricStatus.warning:
        statusColor = const Color(0xFFF59E0B); // bg-amber-500
        pulseColor = const Color(0xFFFBBF24); // bg-amber-400
        break;
      case MetricStatus.normal:
        statusColor = const Color(0xFF10B981); // bg-emerald-500
        pulseColor = const Color(0xFF34D399); // bg-emerald-400
        break;
    }

    // Trend Colors
    Color trendColor;
    IconData trendIcon;
    switch (widget.trendDirection) {
      case TrendDirection.up:
        trendColor = const Color(0xFFEF4444);
        trendIcon = Icons.arrow_upward_rounded;
        break;
      case TrendDirection.down:
        trendColor = const Color(0xFF3B82F6);
        trendIcon = Icons.arrow_downward_rounded;
        break;
      case TrendDirection.stable:
        trendColor = const Color(0xFF10B981);
        trendIcon = Icons.remove_rounded;
        break;
    }

    // Card Colors
    final bgColor = isDark
        ? const Color(0xFF1E1E1E).withValues(alpha: 0.7)
        : Colors.white.withValues(alpha: 0.7);

    final borderColor = isDark
        ? const Color(0xFF27272A).withValues(alpha: 0.8)
        : Colors.white.withValues(alpha: 0.5);

    final transform = _isHovered ? Matrix4.translationValues(0, -4, 0) : Matrix4.identity();
    final shadowColor = isDark ? Colors.black.withValues(alpha: 0.3) : Colors.black.withValues(alpha: 0.05);
    final shadowBlur = _isHovered ? 20.0 : 8.0;

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        transform: transform,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: borderColor, width: 1),
          boxShadow: [
            BoxShadow(
              color: shadowColor,
              blurRadius: shadowBlur,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(15),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
            child: Container(
              color: bgColor,
              padding: const EdgeInsets.all(20),
              child: Stack(
                children: [
                  // Dieter Rams grill top light bar
                  Positioned(
                    top: 0,
                    left: 0,
                    right: 0,
                    child: AnimatedOpacity(
                      opacity: _isHovered ? 0.6 : 0.3,
                      duration: const Duration(milliseconds: 300),
                      child: Row(
                        children: [
                          Expanded(
                            child: Container(
                              height: 1,
                              color: statusColor,
                            ),
                          ),
                          const SizedBox(width: 2),
                          Expanded(
                            child: Container(
                              height: 1,
                              color: statusColor,
                            ),
                          ),
                          const SizedBox(width: 2),
                          Expanded(
                            child: Container(
                              height: 1,
                              color: statusColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SizedBox(height: 4),
                      // Header: Title & Status Indicator
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              widget.title.toUpperCase(),
                              style: TextStyle(
                                color: isDark ? const Color(0xFFA1A1AA) : const Color(0xFF6B7280),
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1.5,
                                fontFamily: 'PocketGullMono', // monospace simulation
                              ),
                            ),
                          ),
                          // Status Dot with pulse ping animation
                          Stack(
                            alignment: Alignment.center,
                            children: [
                              AnimatedBuilder(
                                animation: _pulseController,
                                builder: (context, child) {
                                  return Opacity(
                                    opacity: 1.0 - _pulseController.value,
                                    child: Transform.scale(
                                      scale: 1.0 + (_pulseController.value * 1.2),
                                      child: Container(
                                        width: 10,
                                        height: 10,
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          color: pulseColor,
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),
                              Container(
                                width: 10,
                                height: 10,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: statusColor,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),

                      const SizedBox(height: 16),

                      // Value & Unit row
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text(
                            widget.value,
                            style: TextStyle(
                              fontSize: 30,
                              fontWeight: FontWeight.bold,
                              letterSpacing: -0.5,
                              color: isDark ? const Color(0xFFF3F4F6) : const Color(0xFF111827),
                            ),
                          ),
                          if (widget.unit.isNotEmpty) ...[
                            const SizedBox(width: 8),
                            Text(
                              widget.unit.toUpperCase(),
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1.5,
                                color: isDark ? const Color(0xFF71717A) : const Color(0xFF9CA3AF),
                              ),
                            ),
                          ],
                        ],
                      ),

                      // Trend Text line
                      if (widget.trendText != null) ...[
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Icon(
                              trendIcon,
                              color: trendColor,
                              size: 12,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              widget.trendText!.toUpperCase(),
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1.0,
                                color: trendColor,
                                fontFamily: 'PocketGullMono',
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
