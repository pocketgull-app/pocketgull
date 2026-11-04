import 'package:flutter/material.dart';

enum ButtonVariant { primary, secondary, danger, ghost, outline }

enum ButtonSize { xs, sm, md, lg }

class PocketGullButtonWidget extends StatefulWidget {
  final ButtonVariant variant;
  final ButtonSize size;
  final bool disabled;
  final bool loading;
  final Widget? icon;
  final Widget? trailingIcon;
  final String? ariaLabel;
  final String? testId;
  final VoidCallback? onPressed;
  final Widget? child;
  final String? label;

  const PocketGullButtonWidget({
    super.key,
    this.variant = ButtonVariant.primary,
    this.size = ButtonSize.md,
    this.disabled = false,
    this.loading = false,
    this.icon,
    this.trailingIcon,
    this.ariaLabel,
    this.testId,
    this.onPressed,
    this.child,
    this.label,
  });

  @override
  State<PocketGullButtonWidget> createState() => _PocketGullButtonWidgetState();
}

class _PocketGullButtonWidgetState extends State<PocketGullButtonWidget> {
  bool _isHovered = false;
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isDisabled = widget.disabled || widget.loading || widget.onPressed == null;

    // Resolve padding and font-size based on size
    EdgeInsets padding;
    double fontSize;
    double iconSize;
    double? minWidth;
    double? height;

    final hasContent = widget.label != null || widget.child != null;

    switch (widget.size) {
      case ButtonSize.xs:
        padding = hasContent
            ? const EdgeInsets.symmetric(horizontal: 12, vertical: 6)
            : const EdgeInsets.all(8);
        fontSize = 9;
        iconSize = 12;
        if (!hasContent) {
          minWidth = 36;
          height = 36;
        }
        break;
      case ButtonSize.sm:
        padding = hasContent
            ? const EdgeInsets.symmetric(horizontal: 16, vertical: 8)
            : const EdgeInsets.all(10);
        fontSize = 10;
        iconSize = 14;
        if (!hasContent) {
          minWidth = 44;
          height = 44;
        }
        break;
      case ButtonSize.md:
        padding = hasContent
            ? const EdgeInsets.symmetric(horizontal: 24, vertical: 12)
            : const EdgeInsets.all(12);
        fontSize = 12;
        iconSize = 16;
        if (!hasContent) {
          minWidth = 52;
          height = 52;
        }
        break;
      case ButtonSize.lg:
        padding = hasContent
            ? const EdgeInsets.symmetric(horizontal: 32, vertical: 16)
            : const EdgeInsets.all(16);
        fontSize = 14;
        iconSize = 18;
        if (!hasContent) {
          minWidth = 60;
          height = 60;
        }
        break;
    }

    // Styling logic
    Color bgColor;
    Color borderColor;
    Color textColor;
    List<BoxShadow> shadow = [];

    switch (widget.variant) {
      case ButtonVariant.primary:
        if (isDark) {
          bgColor = isDisabled
              ? const Color(0xFFFAFAFA).withValues(alpha: 0.5)
              : (_isHovered ? const Color(0xFF8BC34A) : const Color(0xFFFAFAFA));
          borderColor = bgColor;
          textColor = const Color(0xFF09090B);
        } else {
          bgColor = isDisabled
              ? const Color(0xFF1C1C1C).withValues(alpha: 0.5)
              : (_isHovered ? const Color(0xFF558B2F) : const Color(0xFF1C1C1C));
          borderColor = bgColor;
          textColor = Colors.white;
          if (_isHovered && !isDisabled) {
            shadow = [
              BoxShadow(
                color: const Color(0xFF558B2F).withValues(alpha: 0.2),
                blurRadius: 12,
                offset: const Offset(0, 4),
              )
            ];
          }
        }
        break;

      case ButtonVariant.secondary:
        if (isDark) {
          bgColor = isDisabled
              ? const Color(0xFF18181B).withValues(alpha: 0.5)
              : (_isHovered ? const Color(0xFF27272A) : const Color(0xFF18181B));
          borderColor = _isHovered ? const Color(0xFF3F3F46) : const Color(0xFF27272A);
          textColor = _isHovered ? const Color(0xFFFAFAFA) : const Color(0xFFE4E4E7);
        } else {
          bgColor = isDisabled
              ? Colors.white.withValues(alpha: 0.5)
              : (_isHovered ? const Color(0xFFF9FAFB) : Colors.white);
          borderColor = _isHovered ? const Color(0xFFD1D5DB) : const Color(0xFFE5E7EB);
          textColor = _isHovered ? const Color(0xFF111827) : const Color(0xFF374151);
        }
        break;

      case ButtonVariant.danger:
        if (isDark) {
          bgColor = isDisabled
              ? const Color(0xFF18181B).withValues(alpha: 0.5)
              : (_isHovered ? const Color(0xFF450A0A) : const Color(0xFF18181B));
          borderColor = _isHovered ? const Color(0xFF991B1B) : const Color(0xFF7F1D1D);
          textColor = const Color(0xFFF87171);
        } else {
          bgColor = isDisabled
              ? Colors.white.withValues(alpha: 0.5)
              : (_isHovered ? const Color(0xFFFEF2F2) : Colors.white);
          borderColor = _isHovered ? const Color(0xFFDC2626) : const Color(0xFFFCA5A5);
          textColor = const Color(0xFFDC2626);
        }
        break;

      case ButtonVariant.ghost:
        bgColor = Colors.transparent;
        borderColor = Colors.transparent;
        if (isDark) {
          textColor = _isHovered ? const Color(0xFFFAFAFA) : const Color(0xFFA1A1AA);
          if (_isHovered && !isDisabled) {
            bgColor = Colors.white.withValues(alpha: 0.1);
          }
        } else {
          textColor = _isHovered ? const Color(0xFF111827) : const Color(0xFF6B7280);
          if (_isHovered && !isDisabled) {
            bgColor = Colors.black.withValues(alpha: 0.05);
          }
        }
        break;

      case ButtonVariant.outline:
        bgColor = Colors.transparent;
        if (isDark) {
          textColor = _isHovered ? const Color(0xFF09090B) : const Color(0xFFFAFAFA);
          borderColor = const Color(0xFFFAFAFA);
          if (_isHovered && !isDisabled) {
            bgColor = const Color(0xFFFAFAFA);
          }
        } else {
          textColor = _isHovered ? Colors.white : const Color(0xFF1C1C1C);
          borderColor = const Color(0xFF1C1C1C);
          if (_isHovered && !isDisabled) {
            bgColor = const Color(0xFF1C1C1C);
          }
        }
        if (isDisabled) {
          borderColor = borderColor.withValues(alpha: 0.5);
          textColor = textColor.withValues(alpha: 0.5);
        }
        break;
    }

    final Widget content = Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        if (widget.loading) ...[
          SizedBox(
            width: iconSize,
            height: iconSize,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(textColor),
            ),
          ),
          if (hasContent) SizedBox(width: widget.size == ButtonSize.xs ? 4 : 8),
        ] else if (widget.icon != null) ...[
          IconTheme(
            data: IconThemeData(color: textColor, size: iconSize),
            child: widget.icon!,
          ),
          if (hasContent) SizedBox(width: widget.size == ButtonSize.xs ? 4 : 8),
        ],
        if (hasContent)
          Flexible(
            child: widget.child ??
                Text(
                  widget.label!.toUpperCase(),
                  style: TextStyle(
                    color: textColor,
                    fontSize: fontSize,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.0,
                  ),
                  textAlign: TextAlign.center,
                ),
          ),
        if (widget.trailingIcon != null && !widget.loading) ...[
          if (hasContent) SizedBox(width: widget.size == ButtonSize.xs ? 4 : 8),
          IconTheme(
            data: IconThemeData(color: textColor, size: iconSize),
            child: widget.trailingIcon!,
          ),
        ],
      ],
    );

    final transform = (_isHovered && !_isPressed && !isDisabled && widget.variant == ButtonVariant.primary)
        ? Matrix4.translationValues(0, -1, 0)
        : Matrix4.identity();

    Widget button = MouseRegion(
      cursor: isDisabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTapDown: isDisabled ? null : (_) => setState(() => _isPressed = true),
        onTapUp: isDisabled ? null : (_) => setState(() => _isPressed = false),
        onTapCancel: () => setState(() => _isPressed = false),
        onTap: isDisabled ? null : widget.onPressed,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          transform: transform,
          constraints: BoxConstraints(
            minWidth: minWidth ?? 0,
            minHeight: height ?? 0,
          ),
          padding: padding,
          decoration: BoxDecoration(
            color: bgColor,
            border: Border.all(color: borderColor, width: 1),
            borderRadius: BorderRadius.circular(2),
            boxShadow: shadow,
          ),
          child: content,
        ),
      ),
    );

    if (widget.ariaLabel != null) {
      button = Semantics(
        label: widget.ariaLabel,
        button: true,
        enabled: !isDisabled,
        child: Tooltip(
          message: widget.ariaLabel!,
          child: button,
        ),
      );
    }

    return button;
  }
}
