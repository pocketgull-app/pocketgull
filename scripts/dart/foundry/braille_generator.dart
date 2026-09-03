import 'models.dart';

/// 256-Glyph Universal Unicode Braille Transcriber (ISO/TR 11548).
///
/// Synthesizes the complete U+2800–28FF Unicode 8-dot computer Braille block.
/// Each codepoint represents an 8-bit bitfield mapped to tactile dot coordinates:
/// - Left column: Dots 1, 2, 3, 7 (bits 0, 1, 2, 6)
/// - Right column: Dots 4, 5, 6, 8 (bits 3, 4, 5, 7)
class BrailleGenerator {
  static const int cellWidth = 750;
  static const int dotRadius = 60;

  // 8-dot tactile coordinate matrix (UPM 1000)
  static const dotCoordinates = [
    (200, 700), // Dot 1 (bit 0)
    (200, 450), // Dot 2 (bit 1)
    (200, 200), // Dot 3 (bit 2)
    (520, 700), // Dot 4 (bit 3)
    (520, 450), // Dot 5 (bit 4)
    (520, 200), // Dot 6 (bit 5)
    (200, -50), // Dot 7 (bit 6)
    (520, -50), // Dot 8 (bit 7)
  ];

  /// Generates a single circular dot contour (clockwise for TrueType).
  static GlyphContour _buildDotContour(int cx, int cy, int r) {
    return GlyphContour()
      ..add(cx, cy + r)
      ..add(cx + r, cy + r, onCurve: false)
      ..add(cx + r, cy)
      ..add(cx + r, cy - r, onCurve: false)
      ..add(cx, cy - r)
      ..add(cx - r, cy - r, onCurve: false)
      ..add(cx - r, cy)
      ..add(cx - r, cy + r, onCurve: false);
  }

  /// Synthesizes a Braille glyph from its 8-bit pattern (0 to 255).
  static GlyphRecord generateBrailleGlyph(int gid, int bytePattern) {
    final codePoint = 0x2800 + bytePattern;
    final contours = <GlyphContour>[];

    for (var dot = 0; dot < 8; dot++) {
      if ((bytePattern & (1 << dot)) != 0) {
        final pos = dotCoordinates[dot];
        contours.add(_buildDotContour(pos.$1, pos.$2, dotRadius));
      }
    }

    return GlyphRecord(
      glyphId: gid,
      codePoint: codePoint,
      name: 'uni${codePoint.toRadixString(16).toUpperCase().padLeft(4, "0")}',
      advanceWidth: cellWidth,
      lsb: contours.isEmpty ? 0 : 200 - dotRadius,
      contours: contours,
    );
  }

  /// Synthesizes the full 256-glyph block into a list of GlyphRecords.
  static List<GlyphRecord> generateAll(int startingGid) {
    final list = <GlyphRecord>[];
    for (var b = 0; b < 256; b++) {
      list.add(generateBrailleGlyph(startingGid + b, b));
    }
    return list;
  }
}
