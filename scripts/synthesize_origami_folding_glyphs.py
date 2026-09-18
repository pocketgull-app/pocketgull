#!/usr/bin/env python3
"""
PocketGull Typefoundry - Origami & Progressive Reveal Papercraft Glyphs Synthesizer
===================================================================================
Systematically synthesizes and injects origami, folding, and caregiver token glyphs
into the PocketGull Typeface Superfamily:

1. Circled Step Numbers (Enclosed Alphanumerics):
   - U+2460: ① (Step 1 Inward Fold)
   - U+2461: ② (Step 2 Booklet Fold)
   - U+2462: ③ (Step 3 Progressive Reveal)
   - U+2463: ④ (Step 4 Horizon)
   - U+2464: ⑤ (Step 5 Attestation)

2. Curved Folding Directional Arrows (Arrows block):
   - U+21B6: ↶ (Anticlockwise Fold Inward Left)
   - U+21B7: ↷ (Clockwise Fold Inward Right)
   - U+21BA: ↺ (Anticlockwise Open Circle)
   - U+21BB: ↻ (Clockwise Open Circle)

3. Scissors & Cutting Perforation Guides (Dingbats):
   - U+2702: ✂ (Black Scissors Cutting Guide)
   - U+2704: ✄ (White Scissors Perforation)

4. Symbolic Seals & Story Tokens (SMP / Pictographs):
   - U+1F54A: 🕊 (Dove / Pocket Sanctuary / Peace)
   - U+1FAB6: 🪶 (Feather Seal / Clinical Attestation)
   - U+1F91D: 🤝 (Caregiver Pocket Token / Pass-it-Forward)
   - U+1F381: 🎁 (Pandora's Box / Gift Token)
   - U+1F331: 🌱 (Vitality Seedling / Growth Horizon)

Ensures:
- 1000 UPM Em-square normalization and optimal optical sidebearings
- Monospace pitch invariant: All glyphs in PocketGullMono locked to 600 UPM
- 0x3F flag masking (Zero Bit 7 OTS violations)
- 0 duplicate nodes via contour point sanitation
- Dual Format 4 (BMP) and Format 12 (SMP) cmap mapping
- Brotli Quality 11 WOFF2 recompression
"""

import os
import shutil
import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.ttLib.tables._g_l_y_f import Glyph, GlyphCoordinates
from fontTools.ttLib.tables.ttProgram import Program
from fontTools.ttLib.woff2 import compress

ROOT_DIR = Path(__file__).resolve().parent.parent
PUBLIC_FONTS_DIR = ROOT_DIR / "public" / "fonts"
SUBMISSION_DIR = PUBLIC_FONTS_DIR / "google_fonts_submission" / "ofl" / "pocketgull"
ASSETS_FONTS_DIR = ROOT_DIR / "public" / "assets" / "fonts"
DIST_FONTS_DIR = ROOT_DIR / "dist" / "assets" / "fonts"

# Typeface sibling repo if present
TYPEFACE_REPO = ROOT_DIR.parent / "pocketgull-typeface"

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

def find_font(filename):
    candidates = [
        Path(r"C:\Windows\Fonts") / filename,
        Path("/mnt/c/Windows/Fonts") / filename,
        Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts" / filename,
    ]
    for p in candidates:
        if p.exists():
            return p
    raise FileNotFoundError(f"Reference font {filename} not found.")

def sanitize_contour_points(coords, endPts):
    """Eliminates consecutive identical points to guarantee 0 duplicate nodes and OTS safety."""
    start = 0
    for end in endPts:
        for i in range(start, end):
            if coords[i] == coords[i + 1]:
                coords[i + 1] = (coords[i + 1][0] + 1, coords[i + 1][1])
        if len(coords) > 1 and coords[start] == coords[end]:
            coords[end] = (coords[end][0] + 1, coords[end][1])
        start = end + 1

def build_glyph_from_ref(ref_font, ref_gname, is_mono, weight_factor=1.0):
    """Scales, centers, and bounds-normalizes a reference glyph to PocketGull 1000 UPM em-square."""
    scale = 1000.0 / ref_font["head"].unitsPerEm
    ref_glyf = ref_font["glyf"]
    ref_glyph = ref_glyf[ref_gname]

    raw_coords, endPts, flags = ref_glyph.getCoordinates(ref_glyf)
    coords = GlyphCoordinates(raw_coords)
    coords.transform(((scale, 0), (0, scale)))
    coords.toInt()

    cur_min_y = min(coords._a[1::2])
    cur_max_y = max(coords._a[1::2])
    cur_min_x = min(coords._a[0::2])
    cur_max_x = max(coords._a[0::2])
    cur_w = cur_max_x - cur_min_x
    cur_h = cur_max_y - cur_min_y

    g = Glyph()
    g.numberOfContours = len(endPts)
    g.endPtsOfContours = list(endPts)
    # Mask to 0x3F: Bit 7 and Bit 6 must be 0 for W3C OTS compliance
    g.flags = bytearray([f & 0x3F for f in flags])
    g.program = Program()

    if is_mono:
        # Constrain width to 520 max to preserve 40 UPM side-bearings on 600 UPM grid
        if cur_w > 520:
            m_scale = 520.0 / cur_w
            mid_x = cur_min_x + cur_w / 2.0
            mid_y = cur_min_y + cur_h / 2.0
            coords.translate((-mid_x, -mid_y))
            coords.transform(((m_scale, 0), (0, m_scale)))
            coords.translate((mid_x, mid_y))
            coords.toInt()
            cur_min_x = min(coords._a[0::2])
            cur_max_x = max(coords._a[0::2])
            cur_w = cur_max_x - cur_min_x

        dx = int((600 - cur_w) / 2) - cur_min_x
        coords.translate((dx, 0))
        coords.toInt()
        g.coordinates = coords
        sanitize_contour_points(coords, g.endPtsOfContours)
        return g, 600
    else:
        # Proportional: normalize side bearings and scale by weight factor
        if weight_factor != 1.0:
            mid_x = cur_min_x + cur_w / 2.0
            mid_y = cur_min_y + cur_h / 2.0
            coords.translate((-mid_x, -mid_y))
            coords.transform(((weight_factor, 0), (0, weight_factor)))
            coords.translate((mid_x, mid_y))
            coords.toInt()
            cur_min_x = min(coords._a[0::2])
            cur_max_x = max(coords._a[0::2])
            cur_w = cur_max_x - cur_min_x

        adv = int(round(cur_w + 120))
        adv = max(adv, 500)
        dx = int((adv - cur_w) / 2) - cur_min_x
        coords.translate((dx, 0))
        coords.toInt()
        g.coordinates = coords
        sanitize_contour_points(coords, g.endPtsOfContours)
        return g, adv

def inject_origami_glyphs():
    print("=" * 80)
    print("  POCKETGULL TYPEFOUNDRY: ORIGAMI & PROGRESSIVE REVEAL PAPERCRAFT GLYPHS")
    print("=" * 80)

    sym_path = find_font("seguisym.ttf")
    emj_path = find_font("seguiemj.ttf")
    print(f"  • Segoe UI Symbol Reference: {sym_path}")
    print(f"  • Segoe UI Emoji Reference:  {emj_path}")

    ref_sym = TTFont(str(sym_path))
    ref_emj = TTFont(str(emj_path))

    # Glyph specifications: (Unicode, Destination Glyph Name, Font Source, Source Glyph Name)
    origami_specs = [
        # Circled Numbers (①, ②, ③, ④, ⑤)
        (0x2460, "uni2460", ref_sym, "uni2460"),
        (0x2461, "uni2461", ref_sym, "uni2461"),
        (0x2462, "uni2462", ref_sym, "uni2462"),
        (0x2463, "uni2463", ref_sym, "uni2463"),
        (0x2464, "uni2464", ref_sym, "uni2464"),

        # Curved Folding Arrows (↶, ↷, ↺, ↻)
        (0x21B6, "uni21B6", ref_sym, "uni21B6"),
        (0x21B7, "uni21B7", ref_sym, "uni21B7"),
        (0x21BA, "uni21BA", ref_sym, "uni21BA"),
        (0x21BB, "uni21BB", ref_sym, "uni21BB"),

        # Scissors & Cut Guidelines (✂, ✄)
        (0x2702, "uni2702", ref_sym, "uni2702"),
        (0x2704, "uni2704", ref_sym, "uni2704"),

        # Symbolic Seals & Story Tokens (🕊, 🪶, 🤝, 🎁, 🌱)
        (0x1F54A, "u1F54A", ref_sym, "u1F54A"),
        (0x1FAB6, "u1FAB6", ref_emj, "u1FAB6"),
        (0x1F91D, "u1F91D", ref_sym, "u1F91D"),
        (0x1F381, "u1F381", ref_sym, "u1F381"),
        (0x1F331, "u1F331", ref_sym, "u1F331"),
    ]

    target_font_stems = [
        ("PocketGull-Regular", 1.0),
        ("PocketGull-Bold", 1.02),
        ("PocketGull-Black", 1.05),
        ("PocketGull-Fineliner", 0.95),
        ("PocketGull-Chiseltip", 1.05),
        ("PocketGull-Antigravity", 1.0),
        ("PocketGull-Numerics", 1.0),
        ("PocketGullMono-Regular", 1.0),
        ("PocketGull-VF", 1.0),
    ]

    # Target directories to search and update
    font_dirs = [PUBLIC_FONTS_DIR, SUBMISSION_DIR]
    if TYPEFACE_REPO.exists():
        font_dirs.extend([TYPEFACE_REPO / "fonts" / "ttf", TYPEFACE_REPO])

    processed_files = set()

    for font_dir in font_dirs:
        if not font_dir.exists():
            continue
        for stem, w_factor in target_font_stems:
            ttf_file = font_dir / f"{stem}.ttf"
            if not ttf_file.exists() or ttf_file in processed_files:
                continue

            processed_files.add(ttf_file)
            is_mono = "Mono" in stem
            print(f"\n[SYNTHESIZE] Injecting {len(origami_specs)} origami glyphs into {ttf_file.name} (mono={is_mono})...")

            font = TTFont(str(ttf_file))
            glyf = font["glyf"]
            hmtx = font["hmtx"]
            gorder = font.getGlyphOrder()

            injected_count = 0
            for cp, dest_name, src_font, src_name in origami_specs:
                g, adv = build_glyph_from_ref(src_font, src_name, is_mono, w_factor)
                glyf[dest_name] = g
                g.recalcBounds(glyf)
                hmtx[dest_name] = (adv, g.xMin)

                if dest_name not in gorder:
                    gorder.append(dest_name)

                # Map across all cmap tables
                for table in font["cmap"].tables:
                    if table.format == 4 and cp <= 0xFFFF:
                        table.cmap[cp] = dest_name
                    elif table.format == 12:
                        table.cmap[cp] = dest_name

                injected_count += 1

            font.setGlyphOrder(gorder)
            font.save(str(ttf_file))
            print(f"  [OK] Saved {ttf_file.name} ({len(font.getGlyphOrder())} total glyphs)")

            # Recompress WOFF2
            woff2_file = ttf_file.with_suffix(".woff2")
            print(f"  [WOFF2] Compressing {woff2_file.name} with Brotli Q11...")
            compress(str(ttf_file), str(woff2_file))
            print(f"  [OK] WOFF2 size: {woff2_file.stat().st_size:,} bytes")

    # Mirror to secondary directories (assets/fonts, dist/assets/fonts)
    print("\n[MIRROR] Synchronizing updated font binaries across project targets...")
    for stem, _ in target_font_stems:
        src_ttf = PUBLIC_FONTS_DIR / f"{stem}.ttf"
        src_woff2 = PUBLIC_FONTS_DIR / f"{stem}.woff2"
        if not src_ttf.exists():
            continue

        for target_dir in [ASSETS_FONTS_DIR, DIST_FONTS_DIR]:
            if target_dir.exists():
                shutil.copy2(src_ttf, target_dir / src_ttf.name)
                shutil.copy2(src_woff2, target_dir / src_woff2.name)
                print(f"  • Mirrored {stem} (.ttf & .woff2) -> {target_dir}")

    print("\n" + "=" * 80)
    print("  ORIGAMI & PAPERCRAFT GLYPH SYNTHESIS COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    inject_origami_glyphs()
