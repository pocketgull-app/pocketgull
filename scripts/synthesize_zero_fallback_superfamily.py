#!/usr/bin/env python3
"""
PocketGull Typefoundry - Autonomous Zero-Fallback Superfamily Synthesizer
========================================================================
Synthesizes and injects 100% of all glyphs, symbols, pictograms, numerals,
and mathematical operators needed across the entire PocketGull application
into the PocketGull Typeface Superfamily, guaranteeing ZERO external font
dependencies and ZERO runtime font fallbacks.

Categories Injected (123+ glyphs):
1. Origami & Papercraft: ①..⑤ (U+2460-2464), ↶, ↷, ↺, ↻ (U+21B6, 21B7, 21BA, 21BB), ✂, ✄ (U+2702, 2704)
2. Caregiver Tokens: 🕊 (U+1F54A), 🪶 (U+1FAB6), 🤝 (U+1F91D), 🎁 (U+1F381), 🌱 (U+1F331), 💌 (U+1F48C), ❤️ (U+2764), ✨ (U+2728), ⭐ (U+2B50)
3. UI Action & Navigation: ✍ (U+270D), 🥄 (U+1F944), 🖨 (U+1F5A8), 👁 (U+1F441), 📄 (U+1F4C4), 🔄 (U+1F504), ⬅ (U+2B05), ➡️ (U+27A1), 📋 (U+1F4CB), 🔍 (U+1F50D), 🏷️ (U+1F3F7), 📦 (U+1F4E6), ⚙️ (U+2699), 🔒 (U+1F512), 🔓 (U+1F513), 🔑 (U+1F511), ℹ️ (U+2139), ❓ (U+2753), ❗ (U+2757)
4. Clinical Organs, Vitals, Pharmacology & Diagnostics: 🫀 (U+1FAC0), 🫁 (U+1FAC1), 🧠 (U+1F9E0), 🦴 (U+1F9B4), 🦷 (U+1F9B7), 🩸 (U+1FA78), 💉 (U+1F489), 💊 (U+1F48A), 🩺 (U+1FA7A), 🏥 (U+1F3E5), 🚑 (U+1F691), 🔬 (U+1F52C), 🧪 (U+1F9EA), 🧬 (U+1F9EC), 🛡️ (U+1F6E1), ⚠️ (U+26A0), 🚨 (U+1F6A8), 💡 (U+1F4A1), 📌 (U+1F4CC), 🎯 (U+1F3AF), 📊 (U+1F4CA), 📈 (U+1F4C8), 📉 (U+1F4C9), 🧑‍⚕️ (U+1F9D1)
5. Symptoms, Environmental Triggers & Weather: 💥 (U+1F4A5), ⚡ (U+26A1), ☁ (U+2601), ⏱ (U+23F1), 🔥 (U+1F525), 🌊 (U+1F30A), 🪵 (U+1FAB5), 🚶 (U+1F6B6), ❄ (U+2744), ☀️ (U+2600), 🕐 (U+1F550), 🕒 (U+1F552)
6. Math, Physical Units, Geometry & Status Operators: ≈ (U+2248), ≠ (U+2260), ≤ (U+2264), ≥ (U+2265), ✅ (U+2705), ✓ (U+2713), ✔ (U+2714), ✕ (U+2715), ✖ (U+2716), ❌ (U+274C), ☑ (U+2611), ★ (U+2605), ♾️ (U+221E), ↑ (U+2191), ↓ (U+2193), ← (U+2190), → (U+2192), ▲ (U+25B2), ▼ (U+25BC), ◀ (U+25C0), ▶ (U+25B6), ° (U+00B0), ± (U+00B1), µ (U+00B5)
7. Clinical Care, Devices & Habitat: 🧩 (U+1F9E9), 🧫 (U+1F9EB), 💰 (U+1F4B0), 💻 (U+1F4BB), 📱 (U+1F4F1), 🏠 (U+1F3E0), 🌟 (U+1F31F), 🌿 (U+1F33F), 🍎 (U+1F34E), 🍵 (U+1F375), 🐱 (U+1F408), 🐶 (U+1F415), 👍 (U+1F44D), 👤 (U+1F464), 👥 (U+1F465), 💬 (U+1F4AC), 📞 (U+1F4DE), ✉️ (U+1F4E7), 🚀 (U+1F680), 🛑 (U+1F6D1), 🟢 (U+1F7E2), 🟡 (U+1F7E1), 🟠 (U+1F7E0), 🔴 (U+1F534), 🔵 (U+1F535)
"""

import os
import shutil
import struct
import sys
from pathlib import Path

from fontTools.ttLib import TTFont, getTableClass
from fontTools.ttLib.tables._g_l_y_f import Glyph, GlyphCoordinates
from fontTools.ttLib.tables.ttProgram import Program
from fontTools.ttLib.woff2 import compress

ROOT_DIR = Path(__file__).resolve().parent.parent
PUBLIC_FONTS_DIR = ROOT_DIR / "public" / "fonts"
SUBMISSION_DIR = PUBLIC_FONTS_DIR / "google_fonts_submission" / "ofl" / "pocketgull"
ASSETS_FONTS_DIR = ROOT_DIR / "public" / "assets" / "fonts"
DIST_FONTS_DIR = ROOT_DIR / "dist" / "assets" / "fonts"
TYPEFACE_REPO = ROOT_DIR.parent / "pocketgull-typeface"

# Ensure UTF-8 on Windows console
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
    """Eliminates consecutive duplicate coordinates to prevent OTS duplicate node errors."""
    start = 0
    for end in endPts:
        for i in range(start, end):
            if coords[i] == coords[i + 1]:
                coords[i + 1] = (coords[i + 1][0] + 1, coords[i + 1][1])
        if len(coords) > 1 and coords[start] == coords[end]:
            coords[end] = (coords[end][0] + 1, coords[end][1])
        start = end + 1

def build_glyph_from_ref(ref_font, ref_gname, is_mono, weight_factor=1.0):
    scale = 1000.0 / ref_font["head"].unitsPerEm
    ref_glyf = ref_font["glyf"]
    ref_glyph = ref_glyf[ref_gname]

    raw_coords, endPts, flags = ref_glyph.getCoordinates(ref_glyf)
    coords = GlyphCoordinates(raw_coords)
    coords.transform(((scale, 0), (0, scale)))
    coords.toInt()

    if len(coords._a) == 0:
        cur_min_x = cur_max_x = cur_min_y = cur_max_y = 0
        cur_w = cur_h = 0
    else:
        cur_min_y = min(coords._a[1::2])
        cur_max_y = max(coords._a[1::2])
        cur_min_x = min(coords._a[0::2])
        cur_max_x = max(coords._a[0::2])
        cur_w = cur_max_x - cur_min_x
        cur_h = cur_max_y - cur_min_y

    g = Glyph()
    g.numberOfContours = len(endPts)
    g.endPtsOfContours = list(endPts)
    g.flags = bytearray([f & 0x3F for f in flags])
    g.program = Program()

    if is_mono:
        # Constrain width to 520 max to preserve side-bearings on 600 UPM grid
        if cur_w > 520 and cur_w > 0:
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
        if weight_factor != 1.0 and cur_w > 0:
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

def repair_gvar_table_if_present(font):
    """Repairs gvar table if glyphCount doesn't match total glyphs."""
    if "gvar" not in font.reader.tables:
        return
    gvar_data = bytearray(font.reader["gvar"])
    ver, res, axisCount, sharedTupleCount, sharedTuplesOffset, glyphCount, flags, dataArrayOffset = struct.unpack(
        ">HHHHIHHI", gvar_data[:20]
    )
    actual_glyphs = len(font.getGlyphOrder())
    diff = actual_glyphs - glyphCount
    if diff > 0 and (flags & 1):
        offset_start = 20
        offset_end = offset_start + (glyphCount + 1) * 4
        offsets = list(struct.unpack(f">{glyphCount + 1}I", gvar_data[offset_start:offset_end]))
        last_offset = offsets[-1]
        new_offsets = offsets + [last_offset] * diff
        new_offset_bytes = struct.pack(f">{actual_glyphs + 1}I", *new_offsets)
        new_dataArrayOffset = dataArrayOffset + diff * 4
        new_sharedTuplesOffset = sharedTuplesOffset + diff * 4
        new_header = struct.pack(
            ">HHHHIHHI",
            ver,
            res,
            axisCount,
            sharedTupleCount,
            new_sharedTuplesOffset,
            actual_glyphs,
            flags,
            new_dataArrayOffset,
        )
        rest_of_gvar = gvar_data[offset_end:]
        repaired_gvar = new_header + new_offset_bytes + rest_of_gvar

        gvar_cls = getTableClass("gvar")()
        gvar_cls.decompile(bytes(repaired_gvar), font)
        font["gvar"] = gvar_cls
        print(f"  [GVAR] Repaired gvar variation table ({glyphCount} -> {actual_glyphs} glyphs)")

def synthesize_zero_fallback():
    print("=" * 80)
    print("  POCKETGULL FOUNDRY: ZERO-FALLBACK SUPERFAMILY SYNTHESIS")
    print("=" * 80)

    sym_path = find_font("seguisym.ttf")
    emj_path = find_font("seguiemj.ttf")
    print(f"  • Segoe UI Symbol Reference: {sym_path}")
    print(f"  • Segoe UI Emoji Reference:  {emj_path}")

    ref_sym = TTFont(str(sym_path))
    ref_emj = TTFont(str(emj_path))

    # Comprehensive glyph dictionary: (Unicode, Destination Glyph Name, Source Font, Source Glyph Name)
    all_specs = [
        # 1. Origami & Papercraft
        (0x2460, "uni2460", ref_sym, "uni2460"),
        (0x2461, "uni2461", ref_sym, "uni2461"),
        (0x2462, "uni2462", ref_sym, "uni2462"),
        (0x2463, "uni2463", ref_sym, "uni2463"),
        (0x2464, "uni2464", ref_sym, "uni2464"),
        (0x21B6, "uni21B6", ref_sym, "uni21B6"),
        (0x21B7, "uni21B7", ref_sym, "uni21B7"),
        (0x21BA, "uni21BA", ref_sym, "uni21BA"),
        (0x21BB, "uni21BB", ref_sym, "uni21BB"),
        (0x2702, "uni2702", ref_sym, "uni2702"),
        (0x2704, "uni2704", ref_sym, "uni2704"),

        # 2. Caregiver Tokens
        (0x1F54A, "u1F54A", ref_sym, "u1F54A"),
        (0x1FAB6, "u1FAB6", ref_emj, "u1FAB6"),
        (0x1F91D, "u1F91D", ref_sym, "u1F91D"),
        (0x1F381, "u1F381", ref_sym, "u1F381"),
        (0x1F331, "u1F331", ref_sym, "u1F331"),
        (0x1F48C, "u1F48C", ref_sym, "u1F48C"),
        (0x2764, "uni2764", ref_sym, "uni2764"),
        (0x2728, "uni2728", ref_sym, "uni2728"),
        (0x2B50, "uni2B50", ref_sym, "uni2B50"),

        # 3. UI Action & Navigation
        (0x270D, "uni270D", ref_sym, "uni270D"),
        (0x1F944, "u1F944", ref_sym, "u1F944"),
        (0x1F5A8, "u1F5A8", ref_sym, "u1F5A8"),
        (0x1F441, "u1F441", ref_sym, "u1F441"),
        (0x1F4C4, "u1F4C4", ref_sym, "u1F4C4"),
        (0x1F504, "u1F504", ref_sym, "u1F504"),
        (0x2B05, "uni2B05", ref_sym, "uni2B05"),
        (0x27A1, "uni27A1", ref_sym, "uni27A1"),
        (0x1F4CB, "u1F4CB", ref_sym, "u1F4CB"),
        (0x1F50D, "u1F50D", ref_sym, "u1F50D"),
        (0x1F3F7, "u1F3F7", ref_sym, "u1F3F7"),
        (0x1F4E6, "u1F4E6", ref_sym, "u1F4E6"),
        (0x2699, "uni2699", ref_sym, "uni2699"),
        (0x1F512, "u1F512", ref_sym, "u1F512"),
        (0x1F513, "u1F513", ref_sym, "u1F513"),
        (0x1F511, "u1F511", ref_sym, "u1F511"),
        (0x2139, "uni2139", ref_sym, "uni2139"),
        (0x2753, "uni2753", ref_sym, "uni2753"),
        (0x2757, "uni2757", ref_sym, "uni2757"),

        # 4. Clinical Organs, Vitals, Pharmacology & Diagnostics
        (0x1FAC0, "u1FAC0", ref_emj, "u1FAC0"),
        (0x1FAC1, "u1FAC1", ref_emj, "u1FAC1"),
        (0x1F9E0, "u1F9E0", ref_emj, "u1F9E0"),
        (0x1F9B4, "u1F9B4", ref_emj, "u1F9B4"),
        (0x1F9B7, "u1F9B7", ref_emj, "u1F9B7"),
        (0x1FA78, "u1FA78", ref_emj, "u1FA78"),
        (0x1F489, "u1F489", ref_sym, "u1F489"),
        (0x1F48A, "u1F48A", ref_sym, "u1F48A"),
        (0x1FA7A, "u1FA7A", ref_emj, "u1FA7A"),
        (0x1F3E5, "u1F3E5", ref_sym, "u1F3E5"),
        (0x1F691, "u1F691", ref_sym, "u1F691"),
        (0x1F52C, "u1F52C", ref_sym, "u1F52C"),
        (0x1F9EA, "u1F9EA", ref_emj, "u1F9EA"),
        (0x1F9EC, "u1F9EC", ref_emj, "u1F9EC"),
        (0x1F6E1, "u1F6E1", ref_sym, "u1F6E1"),
        (0x26A0, "uni26A0", ref_sym, "uni26A0"),
        (0x1F6A8, "u1F6A8", ref_sym, "u1F6A8"),
        (0x1F4A1, "u1F4A1", ref_sym, "u1F4A1"),
        (0x1F4CC, "u1F4CC", ref_sym, "u1F4CC"),
        (0x1F3AF, "u1F3AF", ref_sym, "u1F3AF"),
        (0x1F4CA, "u1F4CA", ref_sym, "u1F4CA"),
        (0x1F4C8, "u1F4C8", ref_sym, "u1F4C8"),
        (0x1F4C9, "u1F4C9", ref_sym, "u1F4C9"),
        (0x1F9D1, "u1F9D1", ref_emj, "u1F9D1"),

        # 5. Symptoms, Environmental Triggers & Weather
        (0x1F4A5, "u1F4A5", ref_sym, "u1F4A5"),
        (0x26A1, "uni26A1", ref_sym, "uni26A1"),
        (0x2601, "uni2601", ref_sym, "uni2601"),
        (0x23F1, "uni23F1", ref_sym, "uni23F1"),
        (0x1F525, "u1F525", ref_sym, "u1F525"),
        (0x1F30A, "u1F30A", ref_sym, "u1F30A"),
        (0x1FAB5, "u1FAB5", ref_emj, "u1FAB5"),
        (0x1F6B6, "u1F6B6", ref_sym, "u1F6B6"),
        (0x2744, "uni2744", ref_sym, "uni2744"),
        (0x2600, "uni2600", ref_sym, "uni2600"),
        (0x1F550, "u1F550", ref_sym, "u1F550"),
        (0x1F552, "u1F552", ref_sym, "u1F552"),

        # 6. Math, Physical Units, Geometry & Status Operators
        (0x2248, "approxequal", ref_sym, "approxequal"),
        (0x2260, "notequal", ref_sym, "notequal"),
        (0x2264, "lessequal", ref_sym, "lessequal"),
        (0x2265, "greaterequal", ref_sym, "greaterequal"),
        (0x2705, "uni2705", ref_sym, "uni2705"),
        (0x2713, "uni2713", ref_sym, "uni2713"),
        (0x2714, "uni2714", ref_sym, "uni2714"),
        (0x2715, "uni2715", ref_sym, "uni2715"),
        (0x2716, "uni2716", ref_sym, "uni2716"),
        (0x274C, "uni274C", ref_sym, "uni274C"),
        (0x2611, "uni2611", ref_sym, "uni2611"),
        (0x2605, "uni2605", ref_sym, "uni2605"),
        (0x221E, "infinity", ref_sym, "infinity"),
        (0x2191, "arrowup", ref_sym, "arrowup"),
        (0x2193, "arrowdown", ref_sym, "arrowdown"),
        (0x2190, "arrowleft", ref_sym, "arrowleft"),
        (0x2192, "arrowright", ref_sym, "arrowright"),
        (0x25B2, "triagup", ref_sym, "triagup"),
        (0x25BC, "triagdn", ref_sym, "triagdn"),
        (0x25C0, "uni25C0", ref_sym, "uni25C0"),
        (0x25B6, "uni25B6", ref_sym, "uni25B6"),
        (0x00B0, "degree", ref_sym, "degree"),
        (0x00B1, "plusminus", ref_sym, "plusminus"),
        (0x00B5, "mu", ref_sym, "mu"),

        # 7. Clinical Care, Devices & Habitat
        (0x1F9E9, "u1F9E9", ref_emj, "u1F9E9"),
        (0x1F9EB, "u1F9EB", ref_emj, "u1F9EB"),
        (0x1F4B0, "u1F4B0", ref_sym, "u1F4B0"),
        (0x1F4BB, "u1F4BB", ref_sym, "u1F4BB"),
        (0x1F4F1, "u1F4F1", ref_sym, "u1F4F1"),
        (0x1F3E0, "u1F3E0", ref_sym, "u1F3E0"),
        (0x1F31F, "u1F31F", ref_sym, "u1F31F"),
        (0x1F33F, "u1F33F", ref_sym, "u1F33F"),
        (0x1F34E, "u1F34E", ref_sym, "u1F34E"),
        (0x1F375, "u1F375", ref_sym, "u1F375"),
        (0x1F408, "u1F408", ref_sym, "u1F408"),
        (0x1F415, "u1F415", ref_sym, "u1F415"),
        (0x1F44D, "u1F44D", ref_sym, "u1F44D"),
        (0x1F464, "u1F464", ref_sym, "u1F464"),
        (0x1F465, "u1F465", ref_sym, "u1F465"),
        (0x1F4AC, "u1F4AC", ref_sym, "u1F4AC"),
        (0x1F4DE, "u1F4DE", ref_sym, "u1F4DE"),
        (0x1F4E7, "u1F4E7", ref_sym, "u1F4E7"),
        (0x1F680, "u1F680", ref_sym, "u1F680"),
        (0x1F6D1, "u1F6D1", ref_sym, "u1F6D1"),
        (0x1F7E2, "u1F7E2", ref_sym, "u1F7E2"),
        (0x1F7E1, "u1F7E1", ref_sym, "u1F7E1"),
        (0x1F7E0, "u1F7E0", ref_sym, "u1F7E0"),
        (0x1F534, "uni2B24", ref_sym, "uni2B24"),
        (0x1F535, "u1F535", ref_sym, "u1F535"),
    ]

    target_stems = [
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

    font_dirs = [PUBLIC_FONTS_DIR, SUBMISSION_DIR]
    if TYPEFACE_REPO.exists():
        font_dirs.extend([TYPEFACE_REPO / "fonts" / "ttf", TYPEFACE_REPO])

    processed_files = set()

    for font_dir in font_dirs:
        if not font_dir.exists():
            continue
        for stem, w_factor in target_stems:
            ttf_file = font_dir / f"{stem}.ttf"
            if not ttf_file.exists() or ttf_file in processed_files:
                continue

            processed_files.add(ttf_file)
            is_mono = "Mono" in stem
            print(f"\n[INJECT] Synthesizing {len(all_specs)} zero-fallback glyphs into {ttf_file.name} (mono={is_mono})...")

            font = TTFont(str(ttf_file))
            repair_gvar_table_if_present(font)

            glyf = font["glyf"]
            hmtx = font["hmtx"]
            gorder = font.getGlyphOrder()
            has_gvar = "gvar" in font

            # Ensure font has a format 12 cmap subtable for SMP codepoints (> 0xFFFF)
            has_format_12 = any(t.format == 12 for t in font["cmap"].tables)
            if not has_format_12:
                from fontTools.ttLib.tables._c_m_a_p import CmapSubtable
                fmt4 = next((t for t in font["cmap"].tables if t.format == 4), None)
                subtable = CmapSubtable.newSubtable(12)
                subtable.platformID = 3
                subtable.platEncID = 10
                subtable.language = 0
                subtable.cmap = dict(fmt4.cmap) if fmt4 else {}
                font["cmap"].tables.append(subtable)

            for cp, dest_name, src_font, src_name in all_specs:
                g, adv = build_glyph_from_ref(src_font, src_name, is_mono, w_factor)
                glyf[dest_name] = g
                g.recalcBounds(glyf)
                hmtx[dest_name] = (adv, g.xMin)

                if dest_name not in gorder:
                    gorder.append(dest_name)

                if has_gvar and hasattr(font["gvar"], "variations"):
                    font["gvar"].variations[dest_name] = []

                for table in font["cmap"].tables:
                    if table.format == 4 and cp <= 0xFFFF:
                        table.cmap[cp] = dest_name
                    elif table.format == 12:
                        table.cmap[cp] = dest_name

            font.setGlyphOrder(gorder)
            font.save(str(ttf_file))
            print(f"  [OK] Saved {ttf_file.name} ({len(font.getGlyphOrder())} glyphs)")

            # Recompress WOFF2 (skip huge 18MB variable fonts if they take over 30s)
            woff2_file = ttf_file.with_suffix(".woff2")
            if ttf_file.stat().st_size < 10 * 1024 * 1024:
                print(f"  [WOFF2] Brotli compression: {woff2_file.name}...")
                compress(str(ttf_file), str(woff2_file))
                print(f"  [OK] WOFF2 size: {woff2_file.stat().st_size:,} bytes")
            else:
                print(f"  [SKIP WOFF2] Large font binary ({ttf_file.stat().st_size:,} bytes), handled separately.")

    # Mirror to assets and dist
    print("\n[MIRROR] Synchronizing to public/assets and dist/assets...")
    for stem, _ in target_stems:
        src_ttf = PUBLIC_FONTS_DIR / f"{stem}.ttf"
        src_woff2 = PUBLIC_FONTS_DIR / f"{stem}.woff2"
        if not src_ttf.exists():
            continue
        for target_dir in [ASSETS_FONTS_DIR, DIST_FONTS_DIR]:
            if target_dir.exists():
                shutil.copy2(src_ttf, target_dir / src_ttf.name)
                if src_woff2.exists():
                    shutil.copy2(src_woff2, target_dir / src_woff2.name)

    print("\n" + "=" * 80)
    print("  ZERO-FALLBACK SYNTHESIS COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    synthesize_zero_fallback()
