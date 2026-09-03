import os
import sys
from fontTools.ttLib import TTFont
from fontTools.pens.ttGlyphPen import TTGlyphPen

font_path = r'c:\Users\philg\Pocketgull\pocketgull\public\fonts\google_fonts_submission\ofl\pocketgull\PocketGull-Bold.ttf'
print(f"Fixing OpenType table headers and vertical metrics in {font_path}...")

font = TTFont(font_path)

# 1. Update OS/2 Table Flags & Metrics
if 'OS/2' in font:
    os2 = font['OS/2']
    os2.version = 4
    # Bit 5: BOLD
    # Bit 7: USE_TYPO_METRICS
    os2.fsSelection |= (1 << 5)  # Set BOLD
    os2.fsSelection &= ~(1 << 6) # Clear REGULAR
    os2.fsSelection |= (1 << 7)  # Set USE_TYPO_METRICS

    # Synchronize Typo Metrics with hhea ascent/descent (1136 / -325)
    os2.sTypoAscender = 1136
    os2.sTypoDescender = -325
    os2.sTypoLineGap = 0
    os2.usWinAscent = 1136
    os2.usWinDescent = 325
    os2.achVendID = 'PKGL' # Custom PocketGull Vendor ID

# 2. Update head Table macStyle
if 'head' in font:
    head = font['head']
    head.macStyle |= (1 << 0) # Set BOLD bit 0

# 3. Update hhea Table LineGap
if 'hhea' in font:
    hhea = font['hhea']
    hhea.ascent = 1136
    hhea.descent = -325
    hhea.lineGap = 0

# 4. Fix .notdef glyph drawing (ensure glyph 0 is non-blank)
if 'glyf' in font and '.notdef' in font['glyf']:
    glyf_table = font['glyf']
    notdef_glyph = glyf_table['.notdef']
    if notdef_glyph.numberOfContours <= 0:
        pen = TTGlyphPen(font.getGlyphSet())
        pen.moveTo((100, 0))
        pen.lineTo((100, 700))
        pen.lineTo((500, 700))
        pen.lineTo((500, 0))
        pen.closePath()
        pen.moveTo((150, 50))
        pen.lineTo((450, 50))
        pen.lineTo((450, 650))
        pen.lineTo((150, 650))
        pen.closePath()
        glyf_table['.notdef'] = pen.glyph()

font.save(font_path)
print("Successfully updated PocketGull-Bold.ttf OpenType headers, vertical metrics, and .notdef glyph!")
