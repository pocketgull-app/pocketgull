// SPDX-License-Identifier: Apache-2.0
import 'dart:math' as math;
import 'dart:typed_data';
import 'package:ditredi/ditredi.dart';
import 'package:flutter/material.dart';
import 'package:vector_math/vector_math_64.dart' as v;

/// 2D Contour Coordinate on the 1000 UPM Grid
class Point2D {
  final double x;
  final double y;
  const Point2D(this.x, this.y);
}

/// Extrusion options for 1000 UPM Direct-Curves 3D Mesh Generation
class ExtrusionOptions {
  final double depth;
  final int curveSegments;
  final double scale;
  final int partId;

  const ExtrusionOptions({
    this.depth = 0.2,
    this.curveSegments = 12,
    this.scale = 0.01,
    this.partId = 101,
  });
}

/// Raw GPU-ready 3D Mesh matching TypeScript `IRawGpuMesh` and Rust `RawGpuMesh`
class RawGpuMesh {
  final Float32List vertexData; // 8 floats per vertex [px, py, pz, nx, ny, nz, u, v]
  final Uint16List indexData;
  final int indexCount;
  final int partId;

  const RawGpuMesh({
    required this.vertexData,
    required this.indexData,
    required this.indexCount,
    required this.partId,
  });

  /// Converts this extruded 1000 UPM contour mesh directly into a Flutter `DiTreDi` `Mesh3D`.
  Mesh3D toDiTreDiMesh({Color? color, v.Vector3? offset}) {
    final faces = <Face3D>[];
    final shift = offset ?? v.Vector3.zero();

    for (var i = 0; i + 2 < indexCount; i += 3) {
      final i0 = indexData[i] * 8;
      final i1 = indexData[i + 1] * 8;
      final i2 = indexData[i + 2] * 8;

      final p0 = v.Vector3(
            vertexData[i0],
            vertexData[i0 + 1],
            vertexData[i0 + 2],
          ) +
          shift;
      final p1 = v.Vector3(
            vertexData[i1],
            vertexData[i1 + 1],
            vertexData[i1 + 2],
          ) +
          shift;
      final p2 = v.Vector3(
            vertexData[i2],
            vertexData[i2 + 1],
            vertexData[i2 + 2],
          ) +
          shift;

      faces.add(Face3D.fromVertices(p0, p1, p2, color: color));
    }

    return Mesh3D(faces);
  }
}

/// Canonical 1000 UPM Medical & Anatomical Symbol Dictionary (OpenType Ligatures / PUA)
class MedicalGlyphEntry {
  final String name;
  final String pathD;
  final int partId;

  const MedicalGlyphEntry({
    required this.name,
    required this.pathD,
    required this.partId,
  });
}

/// 1000 UPM Direct-Curves Font & Anatomical Contour 3D Extruder for Flutter
class GlyphVectorRenderer {
  static const Map<String, MedicalGlyphEntry> medicalGlyphRegistry = {
    '[heart]': MedicalGlyphEntry(
      name: 'Cardiac Ventricles & Atria',
      pathD:
          'M 0 30 C -20 0 -45 15 -45 45 C -45 75 -15 105 0 120 C 15 105 45 75 45 45 C 45 15 20 0 0 30 Z',
      partId: 101,
    ),
    '[lungs]': MedicalGlyphEntry(
      name: 'Bilateral Pulmonary Lobes',
      pathD:
          'M -5 10 C -25 15 -40 45 -38 85 C -35 115 -15 125 -5 105 Z M 5 10 C 25 15 40 45 38 85 C 35 115 15 125 5 105 Z',
      partId: 102,
    ),
    '[brain]': MedicalGlyphEntry(
      name: 'Cerebral Hemispheres & Sulci',
      pathD:
          'M 0 15 C -35 15 -45 45 -40 75 C -35 105 -15 115 0 115 C 15 115 35 105 40 75 C 45 45 35 15 0 15 Z',
      partId: 103,
    ),
    '[acupoint_gv20]': MedicalGlyphEntry(
      name: 'GV-20 Baihui Crown Convergence',
      pathD:
          'M 0 -20 L 6 -6 L 20 0 L 6 6 L 0 20 L -6 6 L -20 0 L -6 -6 Z',
      partId: 104,
    ),
    '[chakra_anahata]': MedicalGlyphEntry(
      name: 'Anahata Heart Chakra Hexagram Vortex',
      pathD:
          'M 0 -25 L 21.6 12.5 L -21.6 12.5 Z M 0 25 L 21.6 -12.5 L -21.6 -12.5 Z',
      partId: 105,
    ),
    '[ecg_lead_ii]': MedicalGlyphEntry(
      name: 'Eindhoven Lead II P-Q-R-S-T Waveform',
      pathD:
          'M -50 0 L -35 0 C -30 -6 -25 -6 -20 0 L -15 0 L -10 6 L 0 -45 L 8 18 L 15 0 L 25 0 C 32 -12 40 -12 48 0 L 60 0',
      partId: 106,
    ),
    '[liver]': MedicalGlyphEntry(
      name: 'Hepatic Lobes & Visceral Porta Hepatis',
      pathD:
          'M -40 45 C -30 20 10 15 45 35 C 52 50 48 78 38 88 C 20 94 8 85 -5 85 C -18 85 -35 70 -40 45 Z',
      partId: 107,
    ),
    '[kidney]': MedicalGlyphEntry(
      name: 'Bilateral Renal Lobes & Hilum Morphology',
      pathD:
          'M -30 25 C -50 25 -55 55 -52 80 C -50 100 -40 105 -30 105 C -18 105 -12 85 -18 65 C -22 50 -18 25 -30 25 Z M 30 25 C 18 25 22 50 18 65 C 12 85 18 105 30 105 C 40 105 50 100 52 80 C 55 55 50 25 30 25 Z',
      partId: 108,
    ),
    '[spine]': MedicalGlyphEntry(
      name: 'Vertebral Column & Facet Architecture',
      pathD:
          'M -18 18 L 18 18 L 26 28 L 14 34 L 14 40 L -14 40 L -14 34 L -26 28 Z M -20 48 L 20 48 L 30 60 L 16 66 L 16 74 L -16 74 L -16 66 L -30 60 Z M -24 82 L 24 82 L 36 96 L 18 104 L 18 114 L -18 114 L -18 104 L -36 96 Z',
      partId: 109,
    ),
    '[knee]': MedicalGlyphEntry(
      name: 'RSNA Articular Knee Cartilage & Meniscus',
      pathD:
          'M -36 20 L -36 50 C -36 68 -18 72 -8 62 C -3 56 3 56 8 62 C 18 72 36 68 36 50 L 36 20 Z M -38 78 C -24 76 -12 80 -4 72 L 0 66 L 4 72 C 12 80 24 76 38 78 C 40 96 32 110 18 114 L -18 114 C -32 110 -40 96 -38 78 Z',
      partId: 110,
    ),
  };

  /// Evaluates a Cubic Bézier curve point at parameter `t` in `[0.0, 1.0]`.
  static Point2D sampleCubicBezier(
    Point2D p0,
    Point2D p1,
    Point2D p2,
    Point2D p3,
    double t,
  ) {
    final it = 1.0 - t;
    final it2 = it * it;
    final it3 = it2 * it;
    final t2 = t * t;
    final t3 = t2 * t;

    return Point2D(
      it3 * p0.x + 3.0 * it2 * t * p1.x + 3.0 * it * t2 * p2.x + t3 * p3.x,
      it3 * p0.y + 3.0 * it2 * t * p1.y + 3.0 * it * t2 * p2.y + t3 * p3.y,
    );
  }

  /// Parses SVG/OpenType path commands (`M`, `L`, `C`, `Z`) into closed 2D point contour loops.
  static List<List<Point2D>> parsePathToContour(
    String pathD, {
    int curveSegments = 12,
  }) {
    final contours = <List<Point2D>>[];
    var currentContour = <Point2D>[];
    var cursor = const Point2D(0, 0);

    final tokenRegex = RegExp(r'[a-df-zA-DF-Z]|[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?');
    final tokens = tokenRegex
        .allMatches(pathD)
        .map((m) => m.group(0)!)
        .toList(growable: false);

    var i = 0;
    double nextNum() => i < tokens.length ? (double.tryParse(tokens[i++]) ?? 0.0) : 0.0;

    while (i < tokens.length) {
      final cmd = tokens[i++].toUpperCase();
      switch (cmd) {
        case 'M':
          if (currentContour.length > 2) {
            contours.add(currentContour);
          }
          currentContour = <Point2D>[];
          cursor = Point2D(nextNum(), nextNum());
          currentContour.add(cursor);
          break;
        case 'L':
          cursor = Point2D(nextNum(), nextNum());
          currentContour.add(cursor);
          break;
        case 'C':
          final p1 = Point2D(nextNum(), nextNum());
          final p2 = Point2D(nextNum(), nextNum());
          final p3 = Point2D(nextNum(), nextNum());
          for (var step = 1; step <= curveSegments; step++) {
            final t = step / curveSegments;
            currentContour.add(sampleCubicBezier(cursor, p1, p2, p3, t));
          }
          cursor = p3;
          break;
        case 'Z':
          if (currentContour.length > 2) {
            final first = currentContour.first;
            final last = currentContour.last;
            final dist = math.sqrt(
              math.pow(first.x - last.x, 2) + math.pow(first.y - last.y, 2),
            );
            if (dist > 0.001) {
              currentContour.add(first);
            }
            contours.add(currentContour);
            currentContour = <Point2D>[];
          }
          break;
      }
    }

    if (currentContour.length > 2) {
      contours.add(currentContour);
    }

    return contours;
  }

  /// Extrudes a 2D font glyph / anatomical contour into a solid 3D manifold GPU mesh.
  static RawGpuMesh extrudeContourTo3DMesh(
    List<List<Point2D>> contours, {
    ExtrusionOptions options = const ExtrusionOptions(),
  }) {
    final depth = options.depth;
    final scale = options.scale;
    final halfDepth = depth / 2.0;

    var minX = double.infinity;
    var maxX = double.negativeInfinity;
    var minY = double.infinity;
    var maxY = double.negativeInfinity;

    for (final contour in contours) {
      for (final pt in contour) {
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.y > maxY) maxY = pt.y;
      }
    }

    final centerX = minX.isFinite ? (minX + maxX) / 2.0 : 0.0;
    final centerY = minY.isFinite ? (minY + maxY) / 2.0 : 0.0;

    final vertices = <double>[];
    final indices = <int>[];

    int addVertex(
      double px,
      double py,
      double pz,
      double nx,
      double ny,
      double nz,
      double u,
      double v,
    ) {
      final idx = vertices.length ~/ 8;
      vertices.addAll([px, py, pz, nx, ny, nz, u, v]);
      return idx;
    }

    for (final contour in contours) {
      final n = contour.length;
      if (n < 3) continue;

      for (var i = 0; i < n - 1; i++) {
        final pA = contour[i];
        final pB = contour[i + 1];

        final xA = (pA.x - centerX) * scale;
        final yA = -(pA.y - centerY) * scale;
        final xB = (pB.x - centerX) * scale;
        final yB = -(pB.y - centerY) * scale;

        final dx = xB - xA;
        final dy = yB - yA;
        final len = math.sqrt(dx * dx + dy * dy);
        final safeLen = len > 1e-6 ? len : 1.0;
        final nx = -dy / safeLen;
        final ny = dx / safeLen;

        final uA = i / n;
        final uB = (i + 1) / n;

        final v0 = addVertex(xA, yA, halfDepth, nx, ny, 0.0, uA, 1.0);
        final v1 = addVertex(xB, yB, halfDepth, nx, ny, 0.0, uB, 1.0);
        final v2 = addVertex(xB, yB, -halfDepth, nx, ny, 0.0, uB, 0.0);
        final v3 = addVertex(xA, yA, -halfDepth, nx, ny, 0.0, uA, 0.0);

        indices.addAll([v0, v1, v2, v0, v2, v3]);
      }

      final limit = (n > 2 &&
              math.sqrt(
                    math.pow(contour[0].x - contour[n - 1].x, 2) +
                        math.pow(contour[0].y - contour[n - 1].y, 2),
                  ) <
                  0.001)
          ? n - 1
          : n;

      final capPts = <Point2D>[];
      final frontIndices = <int>[];
      final backIndices = <int>[];

      for (var i = 0; i < limit; i++) {
        final px = (contour[i].x - centerX) * scale;
        final py = -(contour[i].y - centerY) * scale;
        capPts.add(Point2D(px, py));
        frontIndices.add(addVertex(px, py, halfDepth, 0.0, 0.0, 1.0, 0.5, 0.5));
        backIndices.add(addVertex(px, py, -halfDepth, 0.0, 0.0, -1.0, 0.5, 0.5));
      }

      final ears = triangulateEarClip(capPts);
      for (final ear in ears) {
        final p0 = capPts[ear[0]];
        final p1 = capPts[ear[1]];
        final p2 = capPts[ear[2]];
        final bx = (p0.x + p1.x + p2.x) / 3.0;
        final by = (p0.y + p1.y + p2.y) / 3.0;

        final fCenter = addVertex(bx, by, halfDepth, 0.0, 0.0, 1.0, 0.5, 0.5);
        final bCenter = addVertex(bx, by, -halfDepth, 0.0, 0.0, -1.0, 0.5, 0.5);

        final fi0 = frontIndices[ear[0]];
        final fi1 = frontIndices[ear[1]];
        final fi2 = frontIndices[ear[2]];
        indices.addAll([fCenter, fi0, fi1, fCenter, fi1, fi2, fCenter, fi2, fi0]);

        final bi0 = backIndices[ear[0]];
        final bi1 = backIndices[ear[1]];
        final bi2 = backIndices[ear[2]];
        indices.addAll([bCenter, bi1, bi0, bCenter, bi2, bi1, bCenter, bi0, bi2]);
      }
    }

    return RawGpuMesh(
      vertexData: Float32List.fromList(vertices),
      indexData: Uint16List.fromList(indices),
      indexCount: indices.length,
      partId: options.partId,
    );
  }

  /// Concave-safe 2D polygon ear-clipping triangulation for glyph endcaps.
  static List<List<int>> triangulateEarClip(List<Point2D> contour) {
    final n = contour.length;
    if (n < 3) return const [];

    final polyIndices = List<int>.generate(n, (i) => i);
    final triangles = <List<int>>[];

    var area = 0.0;
    for (var i = 0; i < n; i++) {
      final p1 = contour[i];
      final p2 = contour[(i + 1) % n];
      area += p1.x * p2.y - p2.x * p1.y;
    }
    final sign = area >= 0.0 ? 1.0 : -1.0;

    var guard = n * 3;
    var idx = 0;
    while (polyIndices.length > 3 && guard > 0) {
      guard--;
      final m = polyIndices.length;
      final i0 = polyIndices[(idx + m - 1) % m];
      final i1 = polyIndices[idx % m];
      final i2 = polyIndices[(idx + 1) % m];

      final a = contour[i0];
      final b = contour[i1];
      final c = contour[i2];

      final cross = ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) * sign;
      if (cross > 1e-6) {
        var isEar = true;
        for (final other in polyIndices) {
          if (other == i0 || other == i1 || other == i2) continue;
          final p = contour[other];
          final c1 = ((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)) * sign;
          final c2 = ((c.x - b.x) * (p.y - b.y) - (c.y - b.y) * (p.x - b.x)) * sign;
          final c3 = ((a.x - c.x) * (p.y - c.y) - (a.y - c.y) * (p.x - c.x)) * sign;
          if (c1 >= 0.0 && c2 >= 0.0 && c3 >= 0.0) {
            isEar = false;
            break;
          }
        }
        if (isEar) {
          triangles.add([i0, i1, i2]);
          polyIndices.removeAt(idx % m);
          idx = 0;
          continue;
        }
      }
      idx++;
    }

    if (polyIndices.length == 3) {
      triangles.add([polyIndices[0], polyIndices[1], polyIndices[2]]);
    }
    return triangles;
  }

  /// Compiles an OpenType medical ligature symbol directly into an extruded 3D mesh.
  static RawGpuMesh? compileGlyphSymbolTo3DMesh(
    String symbolToken, {
    ExtrusionOptions? options,
  }) {
    final entry = medicalGlyphRegistry[symbolToken];
    if (entry == null) return null;

    final effectiveOptions = options ??
        ExtrusionOptions(
          partId: entry.partId,
          curveSegments: 10,
        );
    final contours = parsePathToContour(
      entry.pathD,
      curveSegments: effectiveOptions.curveSegments,
    );
    return extrudeContourTo3DMesh(contours, options: effectiveOptions);
  }
}
