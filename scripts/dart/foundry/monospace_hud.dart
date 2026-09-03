import 'models.dart';

/// Mission-Critical Monospace HUD & Telemetry Waveform Engine.
///
/// Strictly operates on a fixed 600 UPM grid:
/// - Baseline at y=0, floor at y=-200, ceiling at y=800 (Total height = 1000 UPM).
/// - Gapless Box Drawing (U+2500–257F): Lines touch the bounding borders with 0-pixel gap.
/// - Sub-cell Block Elements (U+2580–259F): Real-time high-resolution ECG, Pleth, and Resp sweeps.
/// - Powerline Chevrons (U+E0B0, U+E0B2): Gapless terminal prompt navigation.
class MonospaceHudEngine {
  static const int pitch = 600;
  static const int floor = -200;
  static const int ceiling = 800;
  static const int stroke = 40; // 40 UPM border stroke

  /// Gapless horizontal line (U+2500 ─).
  static GlyphRecord generateHLine(int gid) {
    final yCenter = 300;
    final halfStroke = stroke ~/ 2;
    final contour = GlyphContour()
      ..add(0, yCenter + halfStroke)
      ..add(pitch, yCenter + halfStroke)
      ..add(pitch, yCenter - halfStroke)
      ..add(0, yCenter - halfStroke);

    return GlyphRecord(
      glyphId: gid,
      codePoint: 0x2500,
      name: 'box.hline',
      advanceWidth: pitch,
      lsb: 0,
      contours: [contour],
    );
  }

  /// Gapless vertical line (U+2502 │).
  static GlyphRecord generateVLine(int gid) {
    final xCenter = pitch ~/ 2;
    final halfStroke = stroke ~/ 2;
    final contour = GlyphContour()
      ..add(xCenter - halfStroke, ceiling)
      ..add(xCenter + halfStroke, ceiling)
      ..add(xCenter + halfStroke, floor)
      ..add(xCenter - halfStroke, floor);

    return GlyphRecord(
      glyphId: gid,
      codePoint: 0x2502,
      name: 'box.vline',
      advanceWidth: pitch,
      lsb: xCenter - halfStroke,
      contours: [contour],
    );
  }

  /// Sub-cell block element (U+2581 through U+2588) for ECG and cardiac sweeps.
  /// eighths: 1 to 8 (1/8 block to Full Block).
  static GlyphRecord generateSubCellBlock(int gid, int eighths) {
    final codePoint = 0x2580 + eighths; // 0x2581 is 1/8, 0x2588 is 8/8 full block
    final totalH = ceiling - floor; // 1000 UPM
    final blockH = (totalH * eighths) ~/ 8;
    final topY = floor + blockH;

    final contour = GlyphContour()
      ..add(0, topY)
      ..add(pitch, topY)
      ..add(pitch, floor)
      ..add(0, floor);

    return GlyphRecord(
      glyphId: gid,
      codePoint: codePoint,
      name: 'block.${eighths}_eighths',
      advanceWidth: pitch,
      lsb: 0,
      contours: [contour],
    );
  }

  /// Powerline right chevron (U+E0B0 ).
  static GlyphRecord generatePowerlineRightChevron(int gid) {
    final contour = GlyphContour()
      ..add(0, ceiling)
      ..add(pitch, 300)
      ..add(0, floor);

    return GlyphRecord(
      glyphId: gid,
      codePoint: 0xE0B0,
      name: 'powerline.right',
      advanceWidth: pitch,
      lsb: 0,
      contours: [contour],
    );
  }

  /// Synthesizes the core ICU monospace HUD glyph set.
  static List<GlyphRecord> generateCoreSet(int startGid) {
    final list = <GlyphRecord>[];
    list.add(generateHLine(startGid++));
    list.add(generateVLine(startGid++));
    for (var i = 1; i <= 8; i++) {
      list.add(generateSubCellBlock(startGid++, i));
    }
    list.add(generatePowerlineRightChevron(startGid++));
    return list;
  }
}
