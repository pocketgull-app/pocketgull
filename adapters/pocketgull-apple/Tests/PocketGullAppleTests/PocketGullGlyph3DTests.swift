// SPDX-License-Identifier: Apache-2.0
import XCTest
@testable import PocketGullApple

final class PocketGullGlyph3DTests: XCTestCase {
    func testAllMedicalGlyphEntriesExist() {
        let expectedTokens = [
            "[heart]", "[lungs]", "[brain]", "[acupoint_gv20]",
            "[chakra_anahata]", "[ecg_lead_ii]", "[liver]",
            "[kidney]", "[spine]", "[knee]"
        ]
        for token in expectedTokens {
            XCTAssertNotNil(PocketGullGlyph3D.registry[token], "Missing 1000 UPM glyph token: \(token)")
        }
    }

    func testEarClippingTriangulationOnConcaveContour() {
        let starContour: [Point2D] = [
            Point2D(x: 0, y: -20),
            Point2D(x: 6, y: -6),
            Point2D(x: 20, y: 0),
            Point2D(x: 6, y: 6),
            Point2D(x: 0, y: 20),
            Point2D(x: -6, y: 6),
            Point2D(x: -20, y: 0),
            Point2D(x: -6, y: -6)
        ]
        let triangles = PocketGullGlyph3D.triangulateEarClip(contour: starContour)
        XCTAssertEqual(triangles.count, 6)
    }
}
