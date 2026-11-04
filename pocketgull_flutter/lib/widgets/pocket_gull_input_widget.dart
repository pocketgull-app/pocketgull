import 'package:flutter/material.dart';

class PocketGullInputWidget extends StatefulWidget {
  final String? label;
  final String? placeholder;
  final String value;
  final ValueChanged<String>? onChanged;
  final TextInputType keyboardType;
  final bool isPassword;
  final bool isMultiline;
  final int minLines;
  final int maxLines;
  final bool disabled;
  final String? error;
  final String? hint;
  final Widget? icon;
  final bool breathing;
  final bool autofocus;
  final String? ariaLabel;
  final bool isMinimal;

  const PocketGullInputWidget({
    super.key,
    this.label,
    this.placeholder,
    this.value = '',
    this.onChanged,
    this.keyboardType = TextInputType.text,
    this.isPassword = false,
    this.isMultiline = false,
    this.minLines = 4,
    this.maxLines = 8,
    this.disabled = false,
    this.error,
    this.hint,
    this.icon,
    this.breathing = true, // Enabled by default across active components
    this.autofocus = false,
    this.ariaLabel,
    this.isMinimal = false,
  });

  @override
  State<PocketGullInputWidget> createState() => _PocketGullInputWidgetState();
}

class _PocketGullInputWidgetState extends State<PocketGullInputWidget> with SingleTickerProviderStateMixin {
  late TextEditingController _controller;
  late FocusNode _focusNode;
  AnimationController? _breathingController;
  Animation<Color?>? _borderColorAnimation;
  Animation<double>? _glowAnimation;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.value);
    _focusNode = FocusNode();

    _focusNode.addListener(_handleFocusChange);

    if (widget.breathing) {
      _initBreathingAnimation();
    }

    if (widget.autofocus && !widget.disabled) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          _focusNode.requestFocus();
        }
      });
    }
  }

  void _handleFocusChange() {
    if (mounted) {
      setState(() {});
      if (_focusNode.hasFocus && _breathingController != null && !_breathingController!.isAnimating) {
        _breathingController!.repeat();
      }
    }
  }

  @override
  void didUpdateWidget(covariant PocketGullInputWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != _controller.text) {
      _controller.text = widget.value;
    }

    if (widget.breathing != oldWidget.breathing) {
      if (widget.breathing) {
        _initBreathingAnimation();
      } else {
        _disposeBreathingAnimation();
      }
    }
  }

  void _initBreathingAnimation() {
    _breathingController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 16),
    )..repeat();

    // Box Breathing 16s Cycle: Inhale (4s), Hold (4s), Exhale (4s), Hold (4s)
    // 0% -> 25% (Inhale): Fade to bio-green
    // 25% -> 50% (Hold): Steady bio-green
    // 50% -> 75% (Exhale): Fade back to base grey
    // 75% -> 100% (Hold): Resting state
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final baseColor = isDark ? const Color(0xFF27272A) : const Color(0xFFE5E7EB);
    final activeColor = isDark ? const Color(0xFF8BC34A) : const Color(0xFF689F38);

    _borderColorAnimation = TweenSequence<Color?>([
      TweenSequenceItem(
        tween: ColorTween(begin: baseColor, end: activeColor),
        weight: 25,
      ),
      TweenSequenceItem(
        tween: ConstantTween<Color?>(activeColor),
        weight: 25,
      ),
      TweenSequenceItem(
        tween: ColorTween(begin: activeColor, end: baseColor),
        weight: 25,
      ),
      TweenSequenceItem(
        tween: ConstantTween<Color?>(baseColor),
        weight: 25,
      ),
    ]).animate(_breathingController!);

    _glowAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: 0.0, end: 1.0),
        weight: 25,
      ),
      TweenSequenceItem(
        tween: ConstantTween<double>(1.0),
        weight: 25,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0, end: 0.0),
        weight: 25,
      ),
      TweenSequenceItem(
        tween: ConstantTween<double>(0.0),
        weight: 25,
      ),
    ]).animate(_breathingController!);

    _breathingController!.addListener(() {
      if (mounted) setState(() {});
    });
  }

  void _disposeBreathingAnimation() {
    _breathingController?.dispose();
    _breathingController = null;
    _borderColorAnimation = null;
    _glowAnimation = null;
  }

  @override
  void dispose() {
    _focusNode.removeListener(_handleFocusChange);
    _controller.dispose();
    _focusNode.dispose();
    _disposeBreathingAnimation();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Resolve border color & styling
    Color baseBorderColor;
    if (widget.error != null) {
      baseBorderColor = isDark ? const Color(0xFF991B1B) : const Color(0xFFFCA5A5);
    } else if (widget.isMinimal) {
      baseBorderColor = Colors.transparent;
    } else {
      baseBorderColor = isDark ? const Color(0xFF27272A) : const Color(0xFFE5E7EB);
    }

    final focusBorderColor = widget.error != null
        ? const Color(0xFFEF4444)
        : (isDark ? const Color(0xFF8BC34A) : const Color(0xFF689F38));

    Color currentBorderColor = _focusNode.hasFocus ? focusBorderColor : baseBorderColor;
    if ((widget.breathing || _focusNode.hasFocus) && _borderColorAnimation != null) {
      currentBorderColor = _borderColorAnimation!.value ?? currentBorderColor;
    }

    // Glow / Box Shadow
    List<BoxShadow> shadows = [];
    if (_focusNode.hasFocus && !widget.isMinimal) {
      shadows = [
        BoxShadow(
          color: focusBorderColor.withValues(alpha: 0.15),
          blurRadius: 0,
          spreadRadius: 4,
        ),
      ];
    } else if ((widget.breathing || _focusNode.hasFocus) && _glowAnimation != null && !widget.isMinimal) {
      final green = isDark ? const Color(0xFF8BC34A) : const Color(0xFF689F38);
      shadows = [
        BoxShadow(
          color: green.withValues(alpha: 0.12 * _glowAnimation!.value),
          blurRadius: 0,
          spreadRadius: 4 * _glowAnimation!.value,
        ),
      ];
    }

    final inputColor = widget.disabled
        ? (isDark ? const Color(0xFF09090B) : const Color(0xFFF9FAFB))
        : (widget.isMinimal
            ? Colors.transparent
            : (isDark ? const Color(0x9918181B) : const Color(0xCCFFFFFF)));

    final textColor = widget.disabled
        ? (isDark ? const Color(0xFF71717A) : const Color(0xFF9CA3AF))
        : (isDark ? const Color(0xFFFAFAFA) : const Color(0xFF111827));

    final Widget inputField = TextField(
      controller: _controller,
      focusNode: _focusNode,
      obscureText: widget.isPassword,
      keyboardType: widget.isMultiline ? TextInputType.multiline : widget.keyboardType,
      minLines: widget.isMultiline ? widget.minLines : 1,
      maxLines: widget.isMultiline ? widget.maxLines : 1,
      enabled: !widget.disabled,
      onChanged: widget.onChanged,
      style: TextStyle(
        fontSize: 14,
        color: textColor,
      ),
      decoration: InputDecoration(
        hintText: widget.placeholder,
        hintStyle: TextStyle(
          color: isDark ? const Color(0xFF71717A) : const Color(0xFF9CA3AF),
          fontSize: 14,
        ),
        prefixIcon: widget.icon != null
            ? IconTheme(
                data: IconThemeData(
                  color: isDark ? const Color(0xFF71717A) : const Color(0xFF9CA3AF),
                  size: 18,
                ),
                child: widget.icon!,
              )
            : null,
        contentPadding: EdgeInsets.symmetric(
          horizontal: widget.isMinimal ? 0 : 16,
          vertical: widget.isMultiline ? 16 : 12,
        ),
        border: InputBorder.none,
      ),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (widget.label != null) ...[
          Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  widget.label!,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: isDark ? const Color(0xFFE4E4E7) : const Color(0xFF374151),
                  ),
                ),
                if (widget.breathing)
                  Row(
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: (isDark ? const Color(0xFF8BC34A) : const Color(0xFF689F38))
                              .withValues(alpha: 0.4 + 0.6 * (_glowAnimation?.value ?? 0.0)),
                        ),
                      ),
                      const SizedBox(width: 4),
                      const Text(
                        '16s BOX PACE',
                        style: TextStyle(
                          fontSize: 8,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.0,
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ),
        ],
        AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          decoration: BoxDecoration(
            color: inputColor,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: currentBorderColor,
              width: _focusNode.hasFocus ? 1.5 : 1.0,
            ),
            boxShadow: shadows,
          ),
          child: inputField,
        ),
        if (widget.error != null) ...[
          Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(
              widget.error!,
              style: TextStyle(
                fontSize: 12,
                color: isDark ? const Color(0xFFF87171) : const Color(0xFFEF4444),
              ),
            ),
          ),
        ] else if (widget.hint != null) ...[
          Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(
              widget.hint!,
              style: TextStyle(
                fontSize: 12,
                color: isDark ? const Color(0xFF71717A) : const Color(0xFF9CA3AF),
              ),
            ),
          ),
        ],
      ],
    );
  }
}
