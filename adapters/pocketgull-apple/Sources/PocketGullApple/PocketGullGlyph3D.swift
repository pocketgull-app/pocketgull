// SPDX-License-Identifier: Apache-2.0
//
// PocketGullGlyph3D.swift
// Native Apple CoreGraphics / RealityKit 1000 UPM Direct-Curves 3D Extrusion Engine
// Supports iOS 17+, macOS 14+, visionOS 1+, watchOS 10+

import Foundation
#if canImport(CoreGraphics)
import CoreGraphics
#endif

/// 2D Coordinate on the 1000 UPM Typographic Grid
public struct Point2D: Equatable, Codable, Sendable {
    public let x: Float
    public let y: Float

    public init(x: Float, y: Float) {
        self.x = x
        self.y = y
    }
}

/// Extrusion options matching TypeScript, Rust, Go, and Dart
public struct ExtrusionOptions: Codable, Sendable {
    public var depth: Float
    public var curveSegments: Int
    public var scale: Float
    public var partId: UInt32

    public init(
        depth: Float = 0.2,
        curveSegments: Int = 12,
        scale: Float = 0.01,
        partId: UInt32 = 101
    ) {
        self.depth = depth
        self.curveSegments = curveSegments
        self.scale = scale
        self.partId = partId
    }
}

/// GPU-ready 3D Manifold Mesh matching IRawGpuMesh (TS), RawGpuMesh (Rust/Go/Dart)
public struct RawGpuMesh: Codable, Sendable {
    public let vertexData: [Float]
    public let indexData: [UInt16]
    public let indexCount: Int
    public let partId: UInt32
}

/// Canonical 1000 UPM Medical & Anatomical Symbol Entry
public struct MedicalGlyphEntry: Sendable {
    public let name: String
    public let pathD: String
    public let partId: UInt32
}

/// PocketGull 1000 UPM Direct-Curves 3D Extruder for Apple Platforms (Metal / RealityKit / SceneKit)
public enum PocketGullGlyph3D {
    public static let registry: [String: MedicalGlyphEntry] = [
        "[heart]": MedicalGlyphEntry(
            name: "Cardiac Ventricles & Atria",
            pathD: "M 0 30 C -20 0 -45 15 -45 45 C -45 75 -15 105 0 120 C 15 105 45 75 45 45 C 45 15 20 0 0 30 Z",
            partId: 101
        ),
        "[lungs]": MedicalGlyphEntry(
            name: "Bilateral Pulmonary Lobes",
            pathD: "M -5 10 C -25 15 -40 45 -38 85 C -35 115 -15 125 -5 105 Z M 5 10 C 25 15 40 45 38 85 C 35 115 15 125 5 105 Z",
            partId: 102
        ),
        "[brain]": MedicalGlyphEntry(
            name: "Cerebral Hemispheres & Sulci",
            pathD: "M 0 15 C -35 15 -45 45 -40 75 C -35 105 -15 115 0 115 C 15 115 35 105 40 75 C 45 45 35 15 0 15 Z",
            partId: 103
        ),
        "[acupoint_gv20]": MedicalGlyphEntry(
            name: "GV-20 Baihui Crown Convergence",
            pathD: "M 0 -20 L 6 -6 L 20 0 L 6 6 L 0 20 L -6 6 L -20 0 L -6 -6 Z",
            partId: 104
        ),
        "[chakra_anahata]": MedicalGlyphEntry(
            name: "Anahata Heart Chakra Hexagram Vortex",
            pathD: "M 0 -25 L 21.6 12.5 L -21.6 12.5 Z M 0 25 L 21.6 -12.5 L -21.6 -12.5 Z",
            partId: 105
        ),
        "[ecg_lead_ii]": MedicalGlyphEntry(
            name: "Eindhoven Lead II P-Q-R-S-T Waveform",
            pathD: "M -50 0 L -35 0 C -30 -6 -25 -6 -20 0 L -15 0 L -10 6 L 0 -45 L 8 18 L 15 0 L 25 0 C 32 -12 40 -12 48 0 L 60 0",
            partId: 106
        ),
        "[liver]": MedicalGlyphEntry(
            name: "Hepatic Lobes & Visceral Porta Hepatis",
            pathD: "M -40 45 C -30 20 10 15 45 35 C 52 50 48 78 38 88 C 20 94 8 85 -5 85 C -18 85 -35 70 -40 45 Z",
            partId: 107
        ),
        "[kidney]": MedicalGlyphEntry(
            name: "Bilateral Renal Lobes & Hilum Morphology",
            pathD: "M -30 25 C -50 25 -55 55 -52 80 C -50 100 -40 105 -30 105 C -18 105 -12 85 -18 65 C -22 50 -18 25 -30 25 Z M 30 25 C 18 25 22 50 18 65 C 12 85 18 105 30 105 C 40 105 50 100 52 80 C 55 55 50 25 30 25 Z",
            partId: 108
        ),
        "[spine]": MedicalGlyphEntry(
            name: "Vertebral Column & Facet Architecture",
            pathD: "M -18 18 L 18 18 L 26 28 L 14 34 L 14 40 L -14 40 L -14 34 L -26 28 Z M -20 48 L 20 48 L 30 60 L 16 66 L 16 74 L -16 74 L -16 66 L -30 60 Z M -24 82 L 24 82 L 36 96 L 18 104 L 18 114 L -18 114 L -18 104 L -36 96 Z",
            partId: 109
        ),
        "[knee]": MedicalGlyphEntry(
            name: "RSNA Articular Knee Cartilage & Meniscus",
            pathD: "M -36 20 L -36 50 C -36 68 -18 72 -8 62 C -3 56 3 56 8 62 C 18 72 36 68 36 50 L 36 20 Z M -38 78 C -24 76 -12 80 -4 72 L 0 66 L 4 72 C 12 80 24 76 38 78 C 40 96 32 110 18 114 L -18 114 C -32 110 -40 96 -38 78 Z",
            partId: 110
        )
    ]

    /// Evaluates a Cubic Bézier curve point at parameter t in [0, 1].
    public static func sampleCubicBezier(
        p0: Point2D,
        p1: Point2D,
        p2: Point2D,
        p3: Point2D,
        t: Float
    ) -> Point2D {
        let it = 1.0 - t
        let it2 = it * it
        let it3 = it2 * it
        let t2 = t * t
        let t3 = t2 * t

        return Point2D(
            x: it3 * p0.x + 3.0 * it2 * t * p1.x + 3.0 * it * t2 * p2.x + t3 * p3.x,
            y: it3 * p0.y + 3.0 * it2 * t * p1.y + 3.0 * it * t2 * p2.y + t3 * p3.y
        )
    }

    /// Ear-clipping 2D polygon triangulation for concave & counter-hole glyph endcaps.
    public static func triangulateEarClip(contour: [Point2D]) -> [(Int, Int, Int)] {
        var n = contour.count
        if n < 3 { return [] }
        if abs(contour.first!.x - contour.last!.x) < 1e-4 && abs(contour.first!.y - contour.last!.y) < 1e-4 {
            n -= 1
        }
        if n < 3 { return [] }

        var indices = Array(0..<n)
        var triangles: [(Int, Int, Int)] = []

        var area: Float = 0
        for i in 0..<n {
            let p1 = contour[i]
            let p2 = contour[(i + 1) % n]
            area += (p1.x * p2.y - p2.x * p1.y)
        }
        let sign: Float = area >= 0 ? 1.0 : -1.0

        var guardCount = n * 3
        var idx = 0
        while indices.count > 3 && guardCount > 0 {
            guardCount -= 1
            let m = indices.count
            let i0 = indices[(idx + m - 1) % m]
            let i1 = indices[idx % m]
            let i2 = indices[(idx + 1) % m]

            let a = contour[i0]
            let b = contour[i1]
            let c = contour[i2]

            let cross = ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) * sign
            if cross > 1e-6 {
                var isEar = true
                for other in indices where other != i0 && other != i1 && other != i2 {
                    let p = contour[other]
                    let c1 = ((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)) * sign
                    let c2 = ((c.x - b.x) * (p.y - b.y) - (c.y - b.y) * (p.x - b.x)) * sign
                    let c3 = ((a.x - c.x) * (p.y - c.y) - (a.y - c.y) * (p.x - c.x)) * sign
                    if c1 >= 0 && c2 >= 0 && c3 >= 0 {
                        isEar = false
                        break
                    }
                }
                if isEar {
                    triangles.append((i0, i1, i2))
                    indices.remove(at: idx % m)
                    idx = 0
                    continue
                }
            }
            idx += 1
        }
        if indices.count == 3 {
            triangles.append((indices[0], indices[1], indices[2]))
        }
        return triangles
    }
}
