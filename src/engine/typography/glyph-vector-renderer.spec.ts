import { describe, it, expect } from 'vitest';
import { GlyphVectorRenderer, MEDICAL_GLYPH_REGISTRY } from './glyph-vector-renderer';

describe('GlyphVectorRenderer (Font Glyph & Anatomical Vector Engine)', () => {
  it('should interpolate a cubic Bezier curve accurately at t=0, t=0.5, and t=1.0', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 0, y: 10 };
    const p2 = { x: 10, y: 10 };
    const p3 = { x: 10, y: 0 };

    const start = GlyphVectorRenderer.sampleCubicBezier(p0, p1, p2, p3, 0.0);
    expect(start.x).toBeCloseTo(0, 4);
    expect(start.y).toBeCloseTo(0, 4);

    const mid = GlyphVectorRenderer.sampleCubicBezier(p0, p1, p2, p3, 0.5);
    expect(mid.x).toBeCloseTo(5, 4);
    expect(mid.y).toBeCloseTo(7.5, 4);

    const end = GlyphVectorRenderer.sampleCubicBezier(p0, p1, p2, p3, 1.0);
    expect(end.x).toBeCloseTo(10, 4);
    expect(end.y).toBeCloseTo(0, 4);
  });

  it('should parse an SVG/OpenType glyph path with lines and cubic Beziers into contours', () => {
    const pathD = 'M 0 0 L 10 0 C 15 5 15 15 10 20 L 0 20 Z';
    const contours = GlyphVectorRenderer.parsePathToContour(pathD, 8);

    expect(contours.length).toBe(1);
    expect(contours[0].length).toBeGreaterThan(10);
    expect(contours[0][0].x).toBe(0);
    expect(contours[0][0].y).toBe(0);
  });

  it('should extrude a 2D contour into a solid 3D manifold GPU mesh with valid normals and indices', () => {
    const square = [
      { x: -5, y: -5 },
      { x: 5, y: -5 },
      { x: 5, y: 5 },
      { x: -5, y: 5 },
      { x: -5, y: -5 }
    ];

    const mesh = GlyphVectorRenderer.extrudeContourTo3DMesh([square], {
      depth: 0.4,
      scale: 0.1,
      partId: 101
    });

    expect(mesh.vertexData.length % 8).toBe(0); // Valid 8-float stride
    expect(mesh.indexData.length % 3).toBe(0);  // Valid triangles
    expect(mesh.indexCount).toBe(mesh.indexData.length);
    expect(mesh.partId).toBe(101);

    // Verify side wall vertices have non-zero lateral normals
    let hasLateralNormal = false;
    for (let i = 0; i < mesh.vertexData.length; i += 8) {
      const nx = mesh.vertexData[i + 3];
      const ny = mesh.vertexData[i + 4];
      if (Math.hypot(nx, ny) > 0.5) {
        hasLateralNormal = true;
        break;
      }
    }
    expect(hasLateralNormal).toBe(true);
  });

  it('should compile medical OpenType ligature tokens into valid 3D anatomical meshes', () => {
    const tokens = [
      '[heart]',
      '[lungs]',
      '[brain]',
      '[acupoint_gv20]',
      '[chakra_anahata]',
      '[liver]',
      '[kidney]',
      '[spine]',
      '[knee]'
    ];

    for (const token of tokens) {
      const mesh = GlyphVectorRenderer.compileGlyphSymbolTo3DMesh(token, {
        depth: 0.25,
        curveSegments: 8
      });

      expect(mesh).not.toBeNull();
      expect(mesh!.vertexData.length).toBeGreaterThan(100);
      expect(mesh!.indexCount).toBeGreaterThan(50);
      expect(mesh!.partId).toBe(MEDICAL_GLYPH_REGISTRY[token].partId);
    }
  });

  it('should return null for unregistered glyph symbol tokens', () => {
    const mesh = GlyphVectorRenderer.compileGlyphSymbolTo3DMesh('[non_existent_token]');
    expect(mesh).toBeNull();
  });
});
