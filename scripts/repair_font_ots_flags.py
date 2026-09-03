"""
PocketGull Font OTS Flag Sanitizer
Clears reserved bit 7 (0x80) from TrueType 'glyf' table flags to resolve Chromium OTS parsing errors:
"OTS parsing error: glyf: Bad glyph flag (180), reserved bit 7 must be set to zero"
Also recompiles clean WOFF2 files using Brotli compression.
"""

import os
import sys
from fontTools.ttLib import TTFont

TARGET_DIRS = [
    r"c:\Users\philg\Pocketgull\pocketgull\public\fonts",
    r"c:\Users\philg\Pocketgull\pocketgull\public\brand\fonts",
    r"c:\Users\philg\Pocketgull\pocketgull\public\assets\fonts",
    r"c:\Users\philg\Pocketgull\pocketgull\public\fonts\google_fonts_submission\ofl\pocketgull",
    r"c:\Users\philg\Pocketgull\pocketgull\src\assets\fonts",
    r"c:\Users\philg\Pocketgull\pocketgull\wordpress-theme\pocketgull-articles\fonts",
]

def sanitize_font_file(file_path):
    if not file_path.endswith('.ttf'):
        return
    print(f"Inspecting TrueType: {file_path}")
    try:
        font = TTFont(file_path)
        modified = False

        if 'glyf' in font:
            glyf_table = font['glyf']
            for glyph_name in glyf_table.glyphOrder:
                glyph = glyf_table[glyph_name]
                if hasattr(glyph, 'flags') and glyph.flags is not None:
                    has_bad_flag = any((f & 0x80) != 0 for f in glyph.flags)
                    if has_bad_flag:
                        sanitized_flags = bytearray(f & 0x7F for f in glyph.flags)
                        glyph.flags = sanitized_flags
                        modified = True

        if modified:
            font.save(file_path)
            print(f"  [FIXED] Cleaned bit 7 flags in {file_path}")
        else:
            print(f"  [OK] No bad flags in {file_path}")

        # Also generate matching .woff2 if applicable
        woff2_path = file_path[:-4] + ".woff2"
        font.flavor = "woff2"
        font.save(woff2_path)
        print(f"  [WOFF2] Rebuilt clean WOFF2: {woff2_path}")

    except Exception as e:
        print(f"  [ERROR] Failed to process {file_path}: {e}")

def main():
    print("=== PocketGull OTS Glyph Flag Repair ===")
    seen_files = set()
    for d in TARGET_DIRS:
        if not os.path.exists(d):
            continue
        for fname in os.listdir(d):
            if fname.endswith('.ttf') and fname.startswith('PocketGull'):
                full_path = os.path.normpath(os.path.join(d, fname))
                if full_path not in seen_files:
                    seen_files.add(full_path)
                    sanitize_font_file(full_path)
    print(f"\nProcessed {len(seen_files)} TrueType fonts.")

if __name__ == "__main__":
    main()
