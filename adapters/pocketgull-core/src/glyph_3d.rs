// SPDX-License-Identifier: Apache-2.0
//! 1000 UPM Direct-Curves Font & Anatomical Contour 3D Extrusion Engine
//!
//! Transforms 1000 UPM OpenType/SVG Cubic Bézier contours (`M`, `L`, `C`, `Z`)
//! into 3D manifold GPU meshes (`vertices` + `indices`) with zero external asset weight.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct Point2D {
    pub x: f32,
    pub y: f32,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct ExtrusionOptions {
    pub depth: f32,
    pub curve_segments: usize,
    pub scale: f32,
    pub part_id: u32,
}

impl Default for ExtrusionOptions {
    fn default() -> Self {
        Self {
            depth: 0.2,
            curve_segments: 12,
            scale: 0.01,
            part_id: 101,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RawGpuMesh {
    /// Interleaved 8 floats per vertex: [px, py, pz, nx, ny, nz, u, v]
    pub vertex_data: Vec<f32>,
    /// Triangle indices
    pub index_data: Vec<u16>,
    pub index_count: usize,
    pub part_id: u32,
}

/// Evaluates a Cubic Bézier curve point at parameter `t` in `[0.0, 1.0]`.
#[inline]
pub fn sample_cubic_bezier(p0: Point2D, p1: Point2D, p2: Point2D, p3: Point2D, t: f32) -> Point2D {
    let it = 1.0 - t;
    let it2 = it * it;
    let it3 = it2 * it;
    let t2 = t * t;
    let t3 = t2 * t;

    Point2D {
        x: it3 * p0.x + 3.0 * it2 * t * p1.x + 3.0 * it * t2 * p2.x + t3 * p3.x,
        y: it3 * p0.y + 3.0 * it2 * t * p1.y + 3.0 * it * t2 * p2.y + t3 * p3.y,
    }
}

/// Resolves a canonical 1000 UPM OpenType medical ligature token to its `(name, path_d, part_id)`.
pub fn resolve_medical_glyph(symbol_token: &str) -> Option<(&'static str, &'static str, u32)> {
    match symbol_token {
        "[heart]" => Some((
            "Cardiac Ventricles & Atria",
            "M 0 30 C -20 0 -45 15 -45 45 C -45 75 -15 105 0 120 C 15 105 45 75 45 45 C 45 15 20 0 0 30 Z",
            101,
        )),
        "[lungs]" => Some((
            "Bilateral Pulmonary Lobes",
            "M -5 10 C -25 15 -40 45 -38 85 C -35 115 -15 125 -5 105 Z M 5 10 C 25 15 40 45 38 85 C 35 115 15 125 5 105 Z",
            102,
        )),
        "[brain]" => Some((
            "Cerebral Hemispheres & Sulci",
            "M 0 15 C -35 15 -45 45 -40 75 C -35 105 -15 115 0 115 C 15 115 35 105 40 75 C 45 45 35 15 0 15 Z",
            103,
        )),
        "[acupoint_gv20]" => Some((
            "GV-20 Baihui Crown Convergence",
            "M 0 -20 L 6 -6 L 20 0 L 6 6 L 0 20 L -6 6 L -20 0 L -6 -6 Z",
            104,
        )),
        "[chakra_anahata]" => Some((
            "Anahata Heart Chakra Hexagram Vortex",
            "M 0 -25 L 21.6 12.5 L -21.6 12.5 Z M 0 25 L 21.6 -12.5 L -21.6 -12.5 Z",
            105,
        )),
        "[ecg_lead_ii]" => Some((
            "Eindhoven Lead II P-Q-R-S-T Waveform",
            "M -50 0 L -35 0 C -30 -6 -25 -6 -20 0 L -15 0 L -10 6 L 0 -45 L 8 18 L 15 0 L 25 0 C 32 -12 40 -12 48 0 L 60 0",
            106,
        )),
        "[liver]" => Some((
            "Hepatic Lobes & Visceral Porta Hepatis",
            "M -40 45 C -30 20 10 15 45 35 C 52 50 48 78 38 88 C 20 94 8 85 -5 85 C -18 85 -35 70 -40 45 Z",
            107,
        )),
        "[kidney]" => Some((
            "Bilateral Renal Lobes & Hilum Morphology",
            "M -30 25 C -50 25 -55 55 -52 80 C -50 100 -40 105 -30 105 C -18 105 -12 85 -18 65 C -22 50 -18 25 -30 25 Z M 30 25 C 18 25 22 50 18 65 C 12 85 18 105 30 105 C 40 105 50 100 52 80 C 55 55 50 25 30 25 Z",
            108,
        )),
        "[spine]" => Some((
            "Vertebral Column & Facet Architecture",
            "M -18 18 L 18 18 L 26 28 L 14 34 L 14 40 L -14 40 L -14 34 L -26 28 Z M -20 48 L 20 48 L 30 60 L 16 66 L 16 74 L -16 74 L -16 66 L -30 60 Z M -24 82 L 24 82 L 36 96 L 18 104 L 18 114 L -18 114 L -18 104 L -36 96 Z",
            109,
        )),
        "[knee]" => Some((
            "RSNA Articular Knee Cartilage & Meniscus",
            "M -36 20 L -36 50 C -36 68 -18 72 -8 62 C -3 56 3 56 8 62 C 18 72 36 68 36 50 L 36 20 Z M -38 78 C -24 76 -12 80 -4 72 L 0 66 L 4 72 C 12 80 24 76 38 78 C 40 96 32 110 18 114 L -18 114 C -32 110 -40 96 -38 78 Z",
            110,
        )),
        _ => None,
    }
}

/// Parses SVG/OpenType path commands (`M`, `L`, `C`, `Z`) into closed 2D contour loops.
pub fn parse_path_to_contour(path_d: &str, curve_segments: usize) -> Vec<Vec<Point2D>> {
    let segs = curve_segments.max(1);
    let mut contours: Vec<Vec<Point2D>> = Vec::new();
    let mut current: Vec<Point2D> = Vec::new();
    let mut cursor = Point2D { x: 0.0, y: 0.0 };

    let tokens: Vec<&str> = path_d.split_whitespace().collect();
    let mut i = 0;

    let next_f32 = |tokens: &[&str], idx: &mut usize| -> f32 {
        if *idx < tokens.len() {
            let val = tokens[*idx].parse::<f32>().unwrap_or(0.0);
            *idx += 1;
            val
        } else {
            0.0
        }
    };

    while i < tokens.len() {
        let cmd = tokens[i];
        i += 1;
        match cmd {
            "M" | "m" => {
                if current.len() > 2 {
                    contours.push(current);
                }
                current = Vec::new();
                let x = next_f32(&tokens, &mut i);
                let y = next_f32(&tokens, &mut i);
                cursor = Point2D { x, y };
                current.push(cursor);
            }
            "L" | "l" => {
                let x = next_f32(&tokens, &mut i);
                let y = next_f32(&tokens, &mut i);
                cursor = Point2D { x, y };
                current.push(cursor);
            }
            "C" | "c" => {
                let p1 = Point2D {
                    x: next_f32(&tokens, &mut i),
                    y: next_f32(&tokens, &mut i),
                };
                let p2 = Point2D {
                    x: next_f32(&tokens, &mut i),
                    y: next_f32(&tokens, &mut i),
                };
                let p3 = Point2D {
                    x: next_f32(&tokens, &mut i),
                    y: next_f32(&tokens, &mut i),
                };
                for step in 1..=segs {
                    let t = (step as f32) / (segs as f32);
                    current.push(sample_cubic_bezier(cursor, p1, p2, p3, t));
                }
                cursor = p3;
            }
            "Z" | "z" => {
                if current.len() > 2 {
                    let first = current[0];
                    let last = current[current.len() - 1];
                    let dist = ((first.x - last.x).powi(2) + (first.y - last.y).powi(2)).sqrt();
                    if dist > 0.001 {
                        current.push(first);
                    }
                    contours.push(current);
                    current = Vec::new();
                }
            }
            _ => {}
        }
    }

    if current.len() > 2 {
        contours.push(current);
    }

    contours
}

/// Extrudes 2D font glyph / anatomical contours into a solid 3D manifold GPU mesh.
pub fn extrude_contour_to_3d_mesh(
    contours: &[Vec<Point2D>],
    options: ExtrusionOptions,
) -> RawGpuMesh {
    let half_depth = options.depth / 2.0;
    let scale = options.scale;

    let mut min_x = f32::INFINITY;
    let mut max_x = f32::NEG_INFINITY;
    let mut min_y = f32::INFINITY;
    let mut max_y = f32::NEG_INFINITY;

    for contour in contours {
        for pt in contour {
            if pt.x < min_x { min_x = pt.x; }
            if pt.x > max_x { max_x = pt.x; }
            if pt.y < min_y { min_y = pt.y; }
            if pt.y > max_y { max_y = pt.y; }
        }
    }

    let center_x = if min_x.is_finite() { (min_x + max_x) / 2.0 } else { 0.0 };
    let center_y = if min_y.is_finite() { (min_y + max_y) / 2.0 } else { 0.0 };

    let mut vertices: Vec<f32> = Vec::new();
    let mut indices: Vec<u16> = Vec::new();

    let mut add_vertex = |px: f32, py: f32, pz: f32, nx: f32, ny: f32, nz: f32, u: f32, v: f32| -> u16 {
        let idx = (vertices.len() / 8) as u16;
        vertices.extend_from_slice(&[px, py, pz, nx, ny, nz, u, v]);
        idx
    };

    for contour in contours {
        let n = contour.len();
        if n < 3 {
            continue;
        }

        // 1. Side Ribbon Quads (Extruded Walls)
        for i in 0..(n - 1) {
            let p_a = contour[i];
            let p_b = contour[i + 1];

            let x_a = (p_a.x - center_x) * scale;
            let y_a = -(p_a.y - center_y) * scale;
            let x_b = (p_b.x - center_x) * scale;
            let y_b = -(p_b.y - center_y) * scale;

            let dx = x_b - x_a;
            let dy = y_b - y_a;
            let len = (dx * dx + dy * dy).sqrt().max(1e-6);
            let nx = -dy / len;
            let ny = dx / len;

            let u_a = (i as f32) / (n as f32);
            let u_b = ((i + 1) as f32) / (n as f32);

            let v0 = add_vertex(x_a, y_a, half_depth, nx, ny, 0.0, u_a, 1.0);
            let v1 = add_vertex(x_b, y_b, half_depth, nx, ny, 0.0, u_b, 1.0);
            let v2 = add_vertex(x_b, y_b, -half_depth, nx, ny, 0.0, u_b, 0.0);
            let v3 = add_vertex(x_a, y_a, -half_depth, nx, ny, 0.0, u_a, 0.0);

            indices.extend_from_slice(&[v0, v1, v2, v0, v2, v3]);
        }

        // 2. Front & Back Endcaps (Concave-Safe 2D Ear-Clipping Triangulation)
        let limit = if n > 2
            && ((contour[0].x - contour[n - 1].x).powi(2)
                + (contour[0].y - contour[n - 1].y).powi(2))
                .sqrt()
                < 0.001
        {
            n - 1
        } else {
            n
        };

        let mut cap_pts: Vec<Point2D> = Vec::with_capacity(limit);
        let mut front_indices: Vec<u16> = Vec::with_capacity(limit);
        let mut back_indices: Vec<u16> = Vec::with_capacity(limit);

        for pt in contour.iter().take(limit) {
            let px = (pt.x - center_x) * scale;
            let py = -(pt.y - center_y) * scale;
            cap_pts.push(Point2D { x: px, y: py });
            front_indices.push(add_vertex(px, py, half_depth, 0.0, 0.0, 1.0, 0.5, 0.5));
            back_indices.push(add_vertex(px, py, -half_depth, 0.0, 0.0, -1.0, 0.5, 0.5));
        }

        let ears = triangulate_ear_clip(&cap_pts);
        for (i0, i1, i2) in ears {
            let p0 = cap_pts[i0];
            let p1 = cap_pts[i1];
            let p2 = cap_pts[i2];
            let bx = (p0.x + p1.x + p2.x) / 3.0;
            let by = (p0.y + p1.y + p2.y) / 3.0;

            let f_center = add_vertex(bx, by, half_depth, 0.0, 0.0, 1.0, 0.5, 0.5);
            let b_center = add_vertex(bx, by, -half_depth, 0.0, 0.0, -1.0, 0.5, 0.5);

            let (fi0, fi1, fi2) = (front_indices[i0], front_indices[i1], front_indices[i2]);
            indices.extend_from_slice(&[f_center, fi0, fi1, f_center, fi1, fi2, f_center, fi2, fi0]);

            let (bi0, bi1, bi2) = (back_indices[i0], back_indices[i1], back_indices[i2]);
            indices.extend_from_slice(&[b_center, bi1, bi0, b_center, bi2, bi1, b_center, bi0, bi2]);
        }
    }

    let index_count = indices.len();
    RawGpuMesh {
        vertex_data: vertices,
        index_data: indices,
        index_count,
        part_id: options.part_id,
    }
}

/// Concave-safe 2D polygon ear-clipping triangulation for glyph endcaps.
pub fn triangulate_ear_clip(contour: &[Point2D]) -> Vec<(usize, usize, usize)> {
    let n = contour.len();
    if n < 3 {
        return Vec::new();
    }

    let mut poly_indices: Vec<usize> = (0..n).collect();
    let mut triangles: Vec<(usize, usize, usize)> = Vec::new();

    let mut area: f32 = 0.0;
    for i in 0..n {
        let p1 = contour[i];
        let p2 = contour[(i + 1) % n];
        area += p1.x * p2.y - p2.x * p1.y;
    }
    let sign: f32 = if area >= 0.0 { 1.0 } else { -1.0 };

    let mut guard = n * 3;
    let mut idx = 0;
    while poly_indices.len() > 3 && guard > 0 {
        guard -= 1;
        let m = poly_indices.len();
        let i0 = poly_indices[(idx + m - 1) % m];
        let i1 = poly_indices[idx % m];
        let i2 = poly_indices[(idx + 1) % m];

        let a = contour[i0];
        let b = contour[i1];
        let c = contour[i2];

        let cross = ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) * sign;
        if cross > 1e-6 {
            let mut is_ear = true;
            for &other in &poly_indices {
                if other == i0 || other == i1 || other == i2 {
                    continue;
                }
                let p = contour[other];
                let c1 = ((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)) * sign;
                let c2 = ((c.x - b.x) * (p.y - b.y) - (c.y - b.y) * (p.x - b.x)) * sign;
                let c3 = ((a.x - c.x) * (p.y - c.y) - (a.y - c.y) * (p.x - c.x)) * sign;
                if c1 >= 0.0 && c2 >= 0.0 && c3 >= 0.0 {
                    is_ear = false;
                    break;
                }
            }
            if is_ear {
                triangles.push((i0, i1, i2));
                poly_indices.remove(idx % m);
                idx = 0;
                continue;
            }
        }
        idx += 1;
    }

    if poly_indices.len() == 3 {
        triangles.push((poly_indices[0], poly_indices[1], poly_indices[2]));
    }
    triangles
}

/// Compiles a 1000 UPM OpenType medical ligature token directly into an extruded 3D mesh.
pub fn compile_glyph_symbol_to_3d_mesh(
    symbol_token: &str,
    options: Option<ExtrusionOptions>,
) -> Option<RawGpuMesh> {
    let (_name, path_d, default_part_id) = resolve_medical_glyph(symbol_token)?;
    let mut opts = options.unwrap_or_default();
    if opts.part_id == 0 {
        opts.part_id = default_part_id;
    } else if options.is_none() {
        opts.part_id = default_part_id;
    }
    let contours = parse_path_to_contour(path_d, opts.curve_segments);
    Some(extrude_contour_to_3d_mesh(&contours, opts))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compile_heart_glyph_to_3d_mesh() {
        let mesh = compile_glyph_symbol_to_3d_mesh("[heart]", None).expect("should compile [heart]");
        assert_eq!(mesh.part_id, 101);
        assert!(mesh.vertex_data.len() > 64);
        assert!(mesh.index_count > 12);
        assert_eq!(mesh.index_count % 3, 0);
    }

    #[test]
    fn test_compile_all_medical_glyphs() {
        let tokens = [
            "[heart]", "[lungs]", "[brain]", "[acupoint_gv20]",
            "[chakra_anahata]", "[ecg_lead_ii]", "[liver]",
            "[kidney]", "[spine]", "[knee]",
        ];
        for token in tokens {
            let mesh = compile_glyph_symbol_to_3d_mesh(token, None);
            assert!(mesh.is_some(), "Token {} failed to compile", token);
        }
    }
}
