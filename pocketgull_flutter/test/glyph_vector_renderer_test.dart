// SPDX-License-Identifier: Apache-2.0
import 'package:flutter_test/flutter_test.dart';
import 'package:pocketgull_flutter/engine/glyph_vector_renderer.dart';

void main() {
  group('GlyphVectorRenderer 1000 UPM Direct-Curves 3D Extruder', () {
    test('compiles [heart] ligature into valid 3D manifold mesh and DiTreDi Mesh3D', () {
      final rawMesh = GlyphVectorRenderer.compileGlyphSymbolTo3DMesh('[heart]');
      expect(rawMesh, isNotNull);
      expect(rawMesh!.partId, equals(101));
      expect(rawMesh.vertexData.length, greaterThan(64));
      expect(rawMesh.indexCount, greaterThan(12));
      expect(rawMesh.indexCount % 3, equals(0));

      final ditrediMesh = rawMesh.toDiTreDiMesh();
      expect(ditrediMesh.faces.length, equals(rawMesh.indexCount ~/ 3));
    });

    test('compiles all 10 canonical medical glyphs with zero errors', () {
      for (final token in GlyphVectorRenderer.medicalGlyphRegistry.keys) {
        final mesh = GlyphVectorRenderer.compileGlyphSymbolTo3DMesh(token);
        expect(mesh, isNotNull, reason: 'Failed to extrude $token');
        expect(mesh!.indexCount, greaterThan(0));
      }
    });
  });
}
