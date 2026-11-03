// SPDX-License-Identifier: Apache-2.0
package glyph3d_test

import (
	"testing"

	"github.com/pocketgull-app/pocketgull/packages/pocketgull-go/internal/glyph3d"
)

func TestCompileAllMedicalGlyphs(t *testing.T) {
	for token, entry := range glyph3d.Registry {
		mesh, err := glyph3d.CompileSymbol(token, nil)
		if err != nil {
			t.Fatalf("expected token %s to compile, got error: %v", token, err)
		}
		if mesh.PartID != entry.PartID {
			t.Errorf("expected PartID %d for %s, got %d", entry.PartID, token, mesh.PartID)
		}
		if len(mesh.VertexData) < 64 {
			t.Errorf("expected >64 vertex floats for %s, got %d", token, len(mesh.VertexData))
		}
		if mesh.IndexCount == 0 || mesh.IndexCount%3 != 0 {
			t.Errorf("expected non-empty multiple of 3 indexCount for %s, got %d", token, mesh.IndexCount)
		}
	}
}

func TestUnknownGlyphSymbolReturnsError(t *testing.T) {
	_, err := glyph3d.CompileSymbol("[unknown_organ]", nil)
	if err == nil {
		t.Fatal("expected error for unknown glyph symbol, got nil")
	}
}
