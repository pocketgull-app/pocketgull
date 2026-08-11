import 'package:flutter/material.dart';

enum GaugeType { complexity, stability, certainty }

class ClinicalGaugeWidget extends StatefulWidget {
  final String label;
  final double value; // 0 to 10
  final String? description;
  final GaugeType type;

  const ClinicalGaugeWidget({
    super.key,
    required this.label,
    required this.value,
    this.description,
    this.type = GaugeType.certainty,
  });

  @override
  State<ClinicalGaugeWidget> createState() => _ClinicalGaugeWidgetState();
}

class _ClinicalGaugeWidgetState extends State<ClinicalGaugeWidget> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _widthAnimation;
  late Animation<double> _shineAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    _widthAnimation = Tween<double>(begin: 0, end: widget.value / 10).animate(
      CurvedAnimation(parent: _controller, curve: Curves.elasticOut),
    );

    _shineAnimation = Tween<double>(begin: -1, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: Curves.linear),
    );

    _controller.forward();
    
    // Repeat shine animation
    _controller.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        // We only want to repeat the shine, not the width expansion.
        // But for simplicity, we'll just run it once or use a separate controller.
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.7),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withValues(alpha: 0.5)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Flexible(
                    child: Text(
                      widget.label.toUpperCase(),
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF718096),
                        letterSpacing: 1.5,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Text(
                    '${widget.value.toStringAsFixed(1)}/10',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF1A202C),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                height: 10,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: const Color(0xFFEDF2F7),
                  borderRadius: BorderRadius.circular(5),
                ),
                child: FractionallySizedBox(
                  alignment: Alignment.centerLeft,
                  widthFactor: _widthAnimation.value,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: _getGradient(),
                      borderRadius: BorderRadius.circular(5),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(5),
                      child: Stack(
                        children: [
                          Transform(
                            transform: Matrix4.translationValues(
                              MediaQuery.of(context).size.width * _shineAnimation.value,
                              0,
                              0,
                            ),
                            child: Container(
                              width: 100,
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    Colors.white.withValues(alpha: 0),
                                    Colors.white.withValues(alpha: 0.3),
                                    Colors.white.withValues(alpha: 0),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              if (widget.description != null) ...[
                const SizedBox(height: 12),
                Text(
                  widget.description!,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF4A5568),
                    height: 1.5,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }

  LinearGradient _getGradient() {
    final val = widget.value;
    if (widget.type == GaugeType.stability) {
      if (val > 7) return const LinearGradient(colors: [Color(0xFF48BB78), Color(0xFF38A169)]);
      if (val > 4) return const LinearGradient(colors: [Color(0xFFECC94B), Color(0xFFD69E2E)]);
      return const LinearGradient(colors: [Color(0xFFF56565), Color(0xFFE53E3E)]);
    }

    if (widget.type == GaugeType.complexity) {
      if (val > 7) return const LinearGradient(colors: [Color(0xFF805AD5), Color(0xFF6B46C1)]);
      if (val > 4) return const LinearGradient(colors: [Color(0xFF4299E1), Color(0xFF3182CE)]);
      return const LinearGradient(colors: [Color(0xFF4FD1C5), Color(0xFF38B2AC)]);
    }

    // Default/Certainty
    if (val > 8) return const LinearGradient(colors: [Color(0xFF4FD1C5), Color(0xFF38B2AC)]);
    if (val > 5) return const LinearGradient(colors: [Color(0xFF4299E1), Color(0xFF3182CE)]);
    return const LinearGradient(colors: [Color(0xFFA0AEC0), Color(0xFF718096)]);
  }
}
