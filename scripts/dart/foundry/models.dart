import 'dart:typed_data';

/// A 2D point on a TrueType quadratic Bézier curve.
class GlyphPoint {
  final int x;
  final int y;
  final bool onCurve;

  const GlyphPoint(this.x, this.y, {this.onCurve = true});

  @override
  String toString() => 'GlyphPoint($x, $y, onCurve: $onCurve)';
}

/// A closed contour composed of TrueType points.
class GlyphContour {
  final List<GlyphPoint> points;

  GlyphContour([List<GlyphPoint>? pts]) : points = pts ?? [];

  void add(int x, int y, {bool onCurve = true}) {
    points.add(GlyphPoint(x, y, onCurve: onCurve));
  }

  bool get isEmpty => points.isEmpty;
  int get length => points.length;
}

/// An assembled TrueType glyph geometry record.
class GlyphRecord {
  final int glyphId;
  final int codePoint;
  final String name;
  final int advanceWidth;
  final int lsb;
  final List<GlyphContour> contours;

  GlyphRecord({
    required this.glyphId,
    required this.codePoint,
    required this.name,
    required this.advanceWidth,
    required this.lsb,
    required this.contours,
  });

  /// Computes the exact bounding box [xMin, yMin, xMax, yMax].
  (int xMin, int yMin, int xMax, int yMax) get boundingBox {
    if (contours.isEmpty || contours.every((c) => c.isEmpty)) {
      return (0, 0, 0, 0);
    }
    int xMin = 32767;
    int yMin = 32767;
    int xMax = -32768;
    int yMax = -32768;

    for (final c in contours) {
      for (final pt in c.points) {
        if (pt.x < xMin) xMin = pt.x;
        if (pt.x > xMax) xMax = pt.x;
        if (pt.y < yMin) yMin = pt.y;
        if (pt.y > yMax) yMax = pt.y;
      }
    }
    return (xMin, yMin, xMax, yMax);
  }

  int get totalPoints => contours.fold(0, (sum, c) => sum + c.length);
}

/// An OpenType SFNT table representation.
class SfntTable {
  final String tag;
  final Uint8List data;
  final int checksum;

  SfntTable(this.tag, this.data) : checksum = computeChecksum(data);

  static int computeChecksum(Uint8List tableBytes) {
    final bd = ByteData.sublistView(tableBytes);
    int sum = 0;
    final nLongs = tableBytes.length ~/ 4;
    for (var i = 0; i < nLongs; i++) {
      sum = (sum + bd.getUint32(i * 4, Endian.big)) & 0xFFFFFFFF;
    }
    final remainder = tableBytes.length % 4;
    if (remainder > 0) {
      int lastLong = 0;
      for (var i = 0; i < remainder; i++) {
        lastLong |= tableBytes[nLongs * 4 + i] << (24 - i * 8);
      }
      sum = (sum + lastLong) & 0xFFFFFFFF;
    }
    return sum;
  }
}
