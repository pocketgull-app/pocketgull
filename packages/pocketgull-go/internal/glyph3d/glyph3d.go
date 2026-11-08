// SPDX-License-Identifier: Apache-2.0
// Package glyph3d implements the 1000 UPM Direct-Curves Font & Anatomical
// Contour 3D Extrusion Engine in pure Go.
package glyph3d

import (
	"fmt"
	"math"
	"strconv"
	"strings"
)

// Point2D represents a 2D coordinate on the 1000 UPM grid.
type Point2D struct {
	X float32 `json:"x"`
	Y float32 `json:"y"`
}

// ExtrusionOptions configures 1000 UPM contour-to-3D manifold extrusion.
type ExtrusionOptions struct {
	Depth         float32 `json:"depth"`
	CurveSegments int     `json:"curveSegments"`
	Scale         float32 `json:"scale"`
	PartID        uint32  `json:"partId"`
}

// DefaultOptions returns standard 1000 UPM extrusion parameters.
func DefaultOptions() ExtrusionOptions {
	return ExtrusionOptions{
		Depth:         0.2,
		CurveSegments: 12,
		Scale:         0.01,
		PartID:        101,
	}
}

// RawGpuMesh matches TypeScript IRawGpuMesh, Rust RawGpuMesh, and Dart RawGpuMesh.
type RawGpuMesh struct {
	VertexData []float32 `json:"vertexData"`
	IndexData  []uint16  `json:"indexData"`
	IndexCount int       `json:"indexCount"`
	PartID     uint32    `json:"partId"`
}

// MedicalGlyphEntry defines a canonical 1000 UPM OpenType medical ligature contour.
type MedicalGlyphEntry struct {
	Name   string `json:"name"`
	PathD  string `json:"pathD"`
	PartID uint32 `json:"partId"`
}

// Registry holds the 10 canonical 1000 UPM medical ligatures.
var Registry = map[string]MedicalGlyphEntry{
	"[heart]": {
		Name:   "Cardiac Ventricles & Atria",
		PathD:  "M 0 30 C -20 0 -45 15 -45 45 C -45 75 -15 105 0 120 C 15 105 45 75 45 45 C 45 15 20 0 0 30 Z",
		PartID: 101,
	},
	"[lungs]": {
		Name:   "Bilateral Pulmonary Lobes",
		PathD:  "M -5 10 C -25 15 -40 45 -38 85 C -35 115 -15 125 -5 105 Z M 5 10 C 25 15 40 45 38 85 C 35 115 15 125 5 105 Z",
		PartID: 102,
	},
	"[brain]": {
		Name:   "Cerebral Hemispheres & Sulci",
		PathD:  "M 0 15 C -35 15 -45 45 -40 75 C -35 105 -15 115 0 115 C 15 115 35 105 40 75 C 45 45 35 15 0 15 Z",
		PartID: 103,
	},
	"[acupoint_gv20]": {
		Name:   "GV-20 Baihui Crown Convergence",
		PathD:  "M 0 -20 L 6 -6 L 20 0 L 6 6 L 0 20 L -6 6 L -20 0 L -6 -6 Z",
		PartID: 104,
	},
	"[chakra_anahata]": {
		Name:   "Anahata Heart Chakra Hexagram Vortex",
		PathD:  "M 0 -25 L 21.6 12.5 L -21.6 12.5 Z M 0 25 L 21.6 -12.5 L -21.6 -12.5 Z",
		PartID: 105,
	},
	"[ecg_lead_ii]": {
		Name:   "Eindhoven Lead II P-Q-R-S-T Waveform",
		PathD:  "M -50 0 L -35 0 C -30 -6 -25 -6 -20 0 L -15 0 L -10 6 L 0 -45 L 8 18 L 15 0 L 25 0 C 32 -12 40 -12 48 0 L 60 0",
		PartID: 106,
	},
	"[liver]": {
		Name:   "Hepatic Lobes & Visceral Porta Hepatis",
		PathD:  "M -40 45 C -30 20 10 15 45 35 C 52 50 48 78 38 88 C 20 94 8 85 -5 85 C -18 85 -35 70 -40 45 Z",
		PartID: 107,
	},
	"[kidney]": {
		Name:   "Bilateral Renal Lobes & Hilum Morphology",
		PathD:  "M -30 25 C -50 25 -55 55 -52 80 C -50 100 -40 105 -30 105 C -18 105 -12 85 -18 65 C -22 50 -18 25 -30 25 Z M 30 25 C 18 25 22 50 18 65 C 12 85 18 105 30 105 C 40 105 50 100 52 80 C 55 55 50 25 30 25 Z",
		PartID: 108,
	},
	"[spine]": {
		Name:   "Vertebral Column & Facet Architecture",
		PathD:  "M -18 18 L 18 18 L 26 28 L 14 34 L 14 40 L -14 40 L -14 34 L -26 28 Z M -20 48 L 20 48 L 30 60 L 16 66 L 16 74 L -16 74 L -16 66 L -30 60 Z M -24 82 L 24 82 L 36 96 L 18 104 L 18 114 L -18 114 L -18 104 L -36 96 Z",
		PartID: 109,
	},
	"[knee]": {
		Name:   "RSNA Articular Knee Cartilage & Meniscus",
		PathD:  "M -36 20 L -36 50 C -36 68 -18 72 -8 62 C -3 56 3 56 8 62 C 18 72 36 68 36 50 L 36 20 Z M -38 78 C -24 76 -12 80 -4 72 L 0 66 L 4 72 C 12 80 24 76 38 78 C 40 96 32 110 18 114 L -18 114 C -32 110 -40 96 -38 78 Z",
		PartID: 110,
	},
}

// SampleCubicBezier evaluates a Cubic Bézier curve at t in [0, 1].
func SampleCubicBezier(p0, p1, p2, p3 Point2D, t float32) Point2D {
	it := 1.0 - t
	it2 := it * it
	it3 := it2 * it
	t2 := t * t
	t3 := t2 * t

	return Point2D{
		X: it3*p0.X + 3.0*it2*t*p1.X + 3.0*it*t2*p2.X + t3*p3.X,
		Y: it3*p0.Y + 3.0*it2*t*p1.Y + 3.0*it*t2*p2.Y + t3*p3.Y,
	}
}

// ParsePathToContour parses SVG/OpenType path commands (M, L, C, Z) into closed 2D loops.
func ParsePathToContour(pathD string, curveSegments int) [][]Point2D {
	if curveSegments < 1 {
		curveSegments = 12
	}
	var contours [][]Point2D
	var current []Point2D
	cursor := Point2D{}

	tokens := strings.Fields(pathD)
	i := 0
	nextF32 := func() float32 {
		if i < len(tokens) {
			v, _ := strconv.ParseFloat(tokens[i], 32)
			i++
			return float32(v)
		}
		return 0
	}

	for i < len(tokens) {
		cmd := strings.ToUpper(tokens[i])
		i++
		switch cmd {
		case "M":
			if len(current) > 2 {
				contours = append(contours, current)
			}
			current = nil
			cursor = Point2D{X: nextF32(), Y: nextF32()}
			current = append(current, cursor)
		case "L":
			cursor = Point2D{X: nextF32(), Y: nextF32()}
			current = append(current, cursor)
		case "C":
			p1 := Point2D{X: nextF32(), Y: nextF32()}
			p2 := Point2D{X: nextF32(), Y: nextF32()}
			p3 := Point2D{X: nextF32(), Y: nextF32()}
			for step := 1; step <= curveSegments; step++ {
				t := float32(step) / float32(curveSegments)
				current = append(current, SampleCubicBezier(cursor, p1, p2, p3, t))
			}
			cursor = p3
		case "Z":
			if len(current) > 2 {
				first := current[0]
				last := current[len(current)-1]
				dist := math.Hypot(float64(first.X-last.X), float64(first.Y-last.Y))
				if dist > 0.001 {
					current = append(current, first)
				}
				contours = append(contours, current)
				current = nil
			}
		}
	}
	if len(current) > 2 {
		contours = append(contours, current)
	}
	return contours
}

// ExtrudeContourTo3DMesh extrudes 2D contours into a solid 3D manifold GPU mesh.
func ExtrudeContourTo3DMesh(contours [][]Point2D, opts ExtrusionOptions) RawGpuMesh {
	halfDepth := opts.Depth / 2.0
	scale := opts.Scale

	minX := float32(math.Inf(1))
	maxX := float32(math.Inf(-1))
	minY := float32(math.Inf(1))
	maxY := float32(math.Inf(-1))

	for _, c := range contours {
		for _, pt := range c {
			if pt.X < minX {
				minX = pt.X
			}
			if pt.X > maxX {
				maxX = pt.X
			}
			if pt.Y < minY {
				minY = pt.Y
			}
			if pt.Y > maxY {
				maxY = pt.Y
			}
		}
	}

	var centerX, centerY float32
	if !math.IsInf(float64(minX), 0) {
		centerX = (minX + maxX) / 2.0
		centerY = (minY + maxY) / 2.0
	}

	var vertices []float32
	var indices []uint16

	addVertex := func(px, py, pz, nx, ny, nz, u, v float32) uint16 {
		idx := uint16(len(vertices) / 8)
		vertices = append(vertices, px, py, pz, nx, ny, nz, u, v)
		return idx
	}

	for _, contour := range contours {
		n := len(contour)
		if n < 3 {
			continue
		}

		for i := 0; i < n-1; i++ {
			pA := contour[i]
			pB := contour[i+1]

			xA := (pA.X - centerX) * scale
			yA := -(pA.Y - centerY) * scale
			xB := (pB.X - centerX) * scale
			yB := -(pB.Y - centerY) * scale

			dx := xB - xA
			dy := yB - yA
			length := float32(math.Hypot(float64(dx), float64(dy)))
			if length < 1e-6 {
				length = 1.0
			}
			nx := -dy / length
			ny := dx / length

			uA := float32(i) / float32(n)
			uB := float32(i+1) / float32(n)

			v0 := addVertex(xA, yA, halfDepth, nx, ny, 0.0, uA, 1.0)
			v1 := addVertex(xB, yB, halfDepth, nx, ny, 0.0, uB, 1.0)
			v2 := addVertex(xB, yB, -halfDepth, nx, ny, 0.0, uB, 0.0)
			v3 := addVertex(xA, yA, -halfDepth, nx, ny, 0.0, uA, 0.0)

			indices = append(indices, v0, v1, v2, v0, v2, v3)
		}

		// 2. Front & Back Endcaps (Concave-Safe 2D Ear-Clipping Triangulation)
		limit := n
		if n > 2 && math.Hypot(float64(contour[0].X-contour[n-1].X), float64(contour[0].Y-contour[n-1].Y)) < 0.001 {
			limit = n - 1
		}

		capPts := make([]Point2D, 0, limit)
		frontIndices := make([]uint16, 0, limit)
		backIndices := make([]uint16, 0, limit)

		for i := 0; i < limit; i++ {
			px := (contour[i].X - centerX) * scale
			py := -(contour[i].Y - centerY) * scale
			capPts = append(capPts, Point2D{X: px, Y: py})
			frontIndices = append(frontIndices, addVertex(px, py, halfDepth, 0.0, 0.0, 1.0, 0.5, 0.5))
			backIndices = append(backIndices, addVertex(px, py, -halfDepth, 0.0, 0.0, -1.0, 0.5, 0.5))
		}

		ears := TriangulateEarClip(capPts)
		for _, ear := range ears {
			p0, p1, p2 := capPts[ear[0]], capPts[ear[1]], capPts[ear[2]]
			bx := (p0.X + p1.X + p2.X) / 3.0
			by := (p0.Y + p1.Y + p2.Y) / 3.0

			fCenter := addVertex(bx, by, halfDepth, 0.0, 0.0, 1.0, 0.5, 0.5)
			bCenter := addVertex(bx, by, -halfDepth, 0.0, 0.0, -1.0, 0.5, 0.5)

			fi0, fi1, fi2 := frontIndices[ear[0]], frontIndices[ear[1]], frontIndices[ear[2]]
			indices = append(indices, fCenter, fi0, fi1, fCenter, fi1, fi2, fCenter, fi2, fi0)

			bi0, bi1, bi2 := backIndices[ear[0]], backIndices[ear[1]], backIndices[ear[2]]
			indices = append(indices, bCenter, bi1, bi0, bCenter, bi2, bi1, bCenter, bi0, bi2)
		}
	}

	return RawGpuMesh{
		VertexData: vertices,
		IndexData:  indices,
		IndexCount: len(indices),
		PartID:     opts.PartID,
	}
}

// TriangulateEarClip performs concave-safe 2D polygon ear-clipping triangulation.
func TriangulateEarClip(contour []Point2D) [][3]int {
	n := len(contour)
	if n < 3 {
		return nil
	}

	polyIndices := make([]int, n)
	for i := 0; i < n; i++ {
		polyIndices[i] = i
	}
	var triangles [][3]int

	var area float32
	for i := 0; i < n; i++ {
		p1 := contour[i]
		p2 := contour[(i+1)%n]
		area += p1.X*p2.Y - p2.X*p1.Y
	}
	sign := float32(1.0)
	if area < 0 {
		sign = -1.0
	}

	guard := n * 3
	idx := 0
	for len(polyIndices) > 3 && guard > 0 {
		guard--
		m := len(polyIndices)
		i0 := polyIndices[(idx+m-1)%m]
		i1 := polyIndices[idx%m]
		i2 := polyIndices[(idx+1)%m]

		a, b, c := contour[i0], contour[i1], contour[i2]
		cross := ((b.X-a.X)*(c.Y-a.Y) - (b.Y-a.Y)*(c.X-a.X)) * sign
		if cross > 1e-6 {
			isEar := true
			for _, other := range polyIndices {
				if other == i0 || other == i1 || other == i2 {
					continue
				}
				p := contour[other]
				c1 := ((b.X-a.X)*(p.Y-a.Y) - (b.Y-a.Y)*(p.X-a.X)) * sign
				c2 := ((c.X-b.X)*(p.Y-b.Y) - (c.Y-b.Y)*(p.X-b.X)) * sign
				c3 := ((a.X-c.X)*(p.Y-c.Y) - (a.Y-c.Y)*(p.X-c.X)) * sign
				if c1 >= 0 && c2 >= 0 && c3 >= 0 {
					isEar = false
					break
				}
			}
			if isEar {
				triangles = append(triangles, [3]int{i0, i1, i2})
				cut := idx % m
				polyIndices = append(polyIndices[:cut], polyIndices[cut+1:]...)
				idx = 0
				continue
			}
		}
		idx++
	}

	if len(polyIndices) == 3 {
		triangles = append(triangles, [3]int{polyIndices[0], polyIndices[1], polyIndices[2]})
	}
	return triangles
}

// CompileSymbol extrudes a registered 1000 UPM medical ligature symbol into a 3D mesh.
func CompileSymbol(symbolToken string, opts *ExtrusionOptions) (*RawGpuMesh, error) {
	entry, ok := Registry[symbolToken]
	if !ok {
		return nil, fmt.Errorf("unknown 1000 UPM medical glyph symbol: %s", symbolToken)
	}
	effective := DefaultOptions()
	effective.PartID = entry.PartID
	effective.CurveSegments = 10
	if opts != nil {
		if opts.Depth > 0 {
			effective.Depth = opts.Depth
		}
		if opts.CurveSegments >= 4 {
			effective.CurveSegments = opts.CurveSegments
		}
		if opts.Scale > 0 {
			effective.Scale = opts.Scale
		}
		if opts.PartID > 0 {
			effective.PartID = opts.PartID
		}
	}
	contours := ParsePathToContour(entry.PathD, effective.CurveSegments)
	mesh := ExtrudeContourTo3DMesh(contours, effective)
	return &mesh, nil
}
