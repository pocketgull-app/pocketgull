"""
Inspect PocketGull-Math font binary metrics, cmap coverage, and OpenType MATH table.
"""

import os
from fontTools.ttLib import TTFont

FONT_PATH = r"c:\Users\philg\Pocketgull\pocketgull-typeface\PocketGull-Math.ttf"

if not os.path.exists(FONT_PATH):
    print(f"[ERROR] Font not found at {FONT_PATH}")
    exit(1)

font = TTFont(FONT_PATH)
print("=" * 60)
print(f"POCKETGULL-MATH OPENTYPE FONT AUDIT")
print("=" * 60)
print(f"  File:          {FONT_PATH}")
print(f"  Size:          {os.path.getsize(FONT_PATH) / 1024 / 1024:.2f} MB")
print(f"  Glyphs:        {len(font.getGlyphOrder()):,}")
print(f"  UPM:           {font['head'].unitsPerEm}")
print(f"  Tables:        {', '.join(font.keys())}")
print(f"  Has MATH table:{'MATH' in font}")

# Check key mathematical symbols in cmap
cmap = font.getBestCmap()
symbols = {
    "Cross / Cartesian (U+00D7)": 0x00D7,
    "Dot operator (U+22C5)": 0x22C5,
    "Partial differential (U+2202)": 0x2202,
    "Summation (U+2211)": 0x2211,
    "Integral (U+222B)": 0x222B,
    "Square root (U+221A)": 0x221A,
    "Infinity (U+221E)": 0x221E,
    "Proportional to (U+221D)": 0x221D,
    "Less than or equal (U+2264)": 0x2264,
    "Greater than or equal (U+2265)": 0x2265,
    "Approximately equal (U+2248)": 0x2248,
    "Greek alpha (U+03B1)": 0x03B1,
    "Greek gamma (U+03B3)": 0x03B3,
    "Greek eta (U+03B7)": 0x03B7,
    "Greek sigma (U+03C3)": 0x03C3
}

print("\n  [Mathematical Coverage in cmap]")
for name, cp in symbols.items():
    supported = cp in cmap
    print(f"    {'[OK]' if supported else '[--]'} {name}: Glyph '{cmap.get(cp, 'None')}'")

print("=" * 60)
