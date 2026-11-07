import 'package:flutter/material.dart';

class BoxBreathingWrapper extends StatefulWidget {
  final Widget child;
  final bool isBreathing;

  const BoxBreathingWrapper({
    super.key,
    required this.child,
    this.isBreathing = false,
  });

  @override
  State<BoxBreathingWrapper> createState() => _BoxBreathingWrapperState();
}

class _BoxBreathingWrapperState extends State<BoxBreathingWrapper>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _borderAnimation;
  late Animation<double> _shadowAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 16),
    )..repeat();

    // 0-4s: Inhale (Expand)
    // 4-8s: Hold
    // 8-12s: Exhale (Contract)
    // 12-16s: Hold

    _borderAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: 0.0, end: 1.0).chain(CurveTween(curve: Curves.easeInOut)),
        weight: 25, // 4s
      ),
      TweenSequenceItem(
        tween: ConstantTween<double>(1.0),
        weight: 25, // 4s
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0, end: 0.0).chain(CurveTween(curve: Curves.easeInOut)),
        weight: 25, // 4s
      ),
      TweenSequenceItem(
        tween: ConstantTween<double>(0.0),
        weight: 25, // 4s
      ),
    ]).animate(_controller);

    _shadowAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: 0.0, end: 1.0).chain(CurveTween(curve: Curves.easeInOut)),
        weight: 25, // 4s
      ),
      TweenSequenceItem(
        tween: ConstantTween<double>(1.0),
        weight: 25, // 4s
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0, end: 0.0).chain(CurveTween(curve: Curves.easeInOut)),
        weight: 25, // 4s
      ),
      TweenSequenceItem(
        tween: ConstantTween<double>(0.0),
        weight: 25, // 4s
      ),
    ]).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  String _getPhaseLabel(double value) {
    if (value < 0.25) {
      final sec = ((value / 0.25) * 4).ceil().clamp(1, 4);
      return '🫁 INHALE ($sec/4s)';
    } else if (value < 0.50) {
      final sec = (((value - 0.25) / 0.25) * 4).ceil().clamp(1, 4);
      return '🛑 HOLD ($sec/4s)';
    } else if (value < 0.75) {
      final sec = (((value - 0.50) / 0.25) * 4).ceil().clamp(1, 4);
      return '🌬️ EXHALE ($sec/4s)';
    } else {
      final sec = (((value - 0.75) / 0.25) * 4).ceil().clamp(1, 4);
      return '🧘 REST ($sec/4s)';
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.isBreathing) return widget.child;

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final phaseLabel = _getPhaseLabel(_controller.value);
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // 4x4 Phase Header Indicator
            Padding(
              padding: const EdgeInsets.only(bottom: 6.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    phaseLabel,
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.2,
                      color: Color(0xFF416B1F),
                      fontFamily: 'PocketGullMono',
                    ),
                  ),
                  const Text(
                    '4s × 4s BOX CADENCE',
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            ),
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: Color.lerp(
                    const Color(0xFFE5E7EB),
                    const Color(0xFF689F38),
                    _borderAnimation.value,
                  )!,
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF689F38).withValues(alpha: 0.25 * _shadowAnimation.value),
                    blurRadius: 6.0 * _shadowAnimation.value,
                    spreadRadius: 2.0 * _shadowAnimation.value,
                  ),
                ],
              ),
              child: Stack(
                children: [
                  child!,
                  // Subtle top progress bar indicating exact 16s cycle position
                  Positioned(
                    top: 0,
                    left: 0,
                    right: 0,
                    child: LinearProgressIndicator(
                      value: _controller.value,
                      backgroundColor: Colors.transparent,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        const Color(0xFF689F38).withValues(alpha: 0.6),
                      ),
                      minHeight: 2,
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      },
      child: widget.child,
    );
  }
}
