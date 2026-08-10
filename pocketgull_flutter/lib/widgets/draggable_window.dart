import 'package:flutter/material.dart';

class DraggableWindow extends StatefulWidget {
  final Widget child;
  final String title;
  final VoidCallback onClose;
  final Size initialSize;
  final Offset initialPosition;

  const DraggableWindow({
    super.key,
    required this.child,
    required this.title,
    required this.onClose,
    this.initialSize = const Size(800, 600),
    this.initialPosition = const Offset(100, 100),
  });

  @override
  State<DraggableWindow> createState() => _DraggableWindowState();
}

class _DraggableWindowState extends State<DraggableWindow> {
  late Offset position;
  late Size size;

  @override
  void initState() {
    super.initState();
    position = widget.initialPosition;
    size = widget.initialSize;
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: position.dx,
      top: position.dy,
      child: Container(
        width: size.width,
        height: size.height,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade300),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.2),
              blurRadius: 30,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          children: [
            // Header / Drag Handle
            GestureDetector(
              onPanUpdate: (details) {
                setState(() {
                  position += details.delta;
                });
              },
              child: Container(
                height: 44,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                color: Colors.grey.shade100,
                child: Row(
                  children: [
                    Text(
                      widget.title.toUpperCase(),
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Colors.black54,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const Spacer(),
                    IconButton(
                      icon: const Icon(Icons.close, size: 18),
                      onPressed: widget.onClose,
                      visualDensity: VisualDensity.compact,
                    ),
                  ],
                ),
              ),
            ),
            // Content
            Expanded(child: widget.child),
            // Resize Handle
            Align(
              alignment: Alignment.bottomRight,
              child: GestureDetector(
                onPanUpdate: (details) {
                  setState(() {
                    size = Size(
                      (size.width + details.delta.dx).clamp(400.0, 1200.0),
                      (size.height + details.delta.dy).clamp(300.0, 900.0),
                    );
                  });
                },
                child: Container(
                  width: 20,
                  height: 20,
                  color: Colors.transparent,
                  child: const Icon(
                    Icons.south_east,
                    size: 12,
                    color: Colors.grey,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
