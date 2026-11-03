# SPDX-License-Identifier: Apache-2.0
"""Unit tests for the Python 1000 UPM Direct-Curves 3D Engine."""

from pocketgull_api.engines.glyph_3d_engine import (
    MEDICAL_GLYPH_REGISTRY,
    Point2D,
    compile_glyph_symbol_to_3d_mesh,
    triangulate_ear_clip,
)


def test_compile_all_medical_glyphs() -> None:
    """Verifies that all 10 canonical 1000 UPM medical ligatures compile cleanly."""
    for token, entry in MEDICAL_GLYPH_REGISTRY.items():
        mesh = compile_glyph_symbol_to_3d_mesh(token)
        assert mesh is not None, f"Failed to compile {token}"
        assert mesh.part_id == entry.part_id
        assert len(mesh.vertex_data) > 24
        assert mesh.index_count > 0
        assert mesh.index_count % 3 == 0


def test_triangulate_ear_clip_concave() -> None:
    """Verifies concave-safe ear-clipping on GV-20 8-vertex star polygon."""
    star = [
        Point2D(x=0.0, y=-20.0),
        Point2D(x=6.0, y=-6.0),
        Point2D(x=20.0, y=0.0),
        Point2D(x=6.0, y=6.0),
        Point2D(x=0.0, y=20.0),
        Point2D(x=-6.0, y=6.0),
        Point2D(x=-20.0, y=0.0),
        Point2D(x=-6.0, y=-6.0),
    ]
    ears = triangulate_ear_clip(star)
    assert len(ears) == 6
