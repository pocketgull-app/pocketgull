#!/usr/bin/env python3
"""
Add OpenType Clinical Disambiguation Features to PocketGull Fonts
- zero / cv08: Slashed zero (zero.slash)
- cv05: Curved lowercase l (l.curved)
- ss02: Serifed capital I (I.serif)
- Compiles OpenType GSUB tables via fontTools.feaLib
"""

import sys
import os
from fontTools.ttLib import TTFont
from fontTools.pens.ttGlyphPen import TTGlyphPen
import fontTools.feaLib.builder as feaBuilder

def add_disambiguation_to_font(font_path):
    print(f"Processing clinical disambiguation for: {font_path}")
    font = TTFont(font_path)
    glyf = font['glyf']
    hmtx = font['hmtx']
    glyph_order = font.getGlyphOrder()
    
    # 1. Synthesize zero.slash
    if 'zero' in glyf:
        z = glyf['zero']
        pen = TTGlyphPen(glyf)
        z.draw(pen, glyf)
        
        # Calculate diagonal slash coordinates inside zero bbox
        x_min, y_min, x_max, y_max = z.xMin, z.yMin, z.xMax, z.yMax
        stroke = max(25, int((x_max - x_min) * 0.12))
        
        # Add diagonal slash contour
        pen.moveTo((x_min + stroke, y_min + int((y_max - y_min) * 0.15)))
        pen.lineTo((x_max - stroke, y_max - int((y_max - y_min) * 0.15)))
        pen.lineTo((x_max - stroke - stroke, y_max - int((y_max - y_min) * 0.15)))
        pen.lineTo((x_min + stroke - stroke, y_min + int((y_max - y_min) * 0.15)))
        pen.closePath()
        
        zero_slash_glyph = pen.glyph()
        zero_slash_glyph.flags = [f & 0x3F for f in zero_slash_glyph.flags] if hasattr(zero_slash_glyph, 'flags') else []
        glyf['zero.slash'] = zero_slash_glyph
        hmtx['zero.slash'] = hmtx['zero']
        if 'zero.slash' not in glyph_order:
            glyph_order.append('zero.slash')
            
    # 2. Synthesize I.serif
    if 'I' in glyf:
        stem = glyf['I']
        pen = TTGlyphPen(glyf)
        stem.draw(pen, glyf)
        
        x_min, y_min, x_max, y_max = stem.xMin, stem.yMin, stem.xMax, stem.yMax
        ser_w = max(50, int((x_max - x_min) * 0.8))
        ser_h = max(25, int((y_max - y_min) * 0.06))
        
        # Top crossbar
        pen.moveTo((x_min - ser_w, y_max))
        pen.lineTo((x_max + ser_w, y_max))
        pen.lineTo((x_max + ser_w, y_max - ser_h))
        pen.lineTo((x_min - ser_w, y_max - ser_h))
        pen.closePath()
        
        # Bottom crossbar
        pen.moveTo((x_min - ser_w, y_min + ser_h))
        pen.lineTo((x_max + ser_w, y_min + ser_h))
        pen.lineTo((x_max + ser_w, y_min))
        pen.lineTo((x_min - ser_w, y_min))
        pen.closePath()
        
        I_serif_glyph = pen.glyph()
        I_serif_glyph.flags = [f & 0x3F for f in I_serif_glyph.flags] if hasattr(I_serif_glyph, 'flags') else []
        glyf['I.serif'] = I_serif_glyph
        hmtx['I.serif'] = (hmtx['I'][0] + int(ser_w * 0.5), hmtx['I'][1])
        if 'I.serif' not in glyph_order:
            glyph_order.append('I.serif')
            
    # 3. Synthesize l.curved
    if 'l' in glyf:
        stem = glyf['l']
        pen = TTGlyphPen(glyf)
        stem.draw(pen, glyf)
        
        x_min, y_min, x_max, y_max = stem.xMin, stem.yMin, stem.xMax, stem.yMax
        tail_w = max(60, int((x_max - x_min) * 0.9))
        tail_h = max(50, int((y_max - y_min) * 0.12))
        
        # Bottom curved tail
        pen.moveTo((x_max, y_min + int(tail_h * 0.8)))
        pen.lineTo((x_max + tail_w, y_min + tail_h))
        pen.lineTo((x_max + tail_w - 15, y_min))
        pen.lineTo((x_min, y_min))
        pen.closePath()
        
        l_curved_glyph = pen.glyph()
        l_curved_glyph.flags = [f & 0x3F for f in l_curved_glyph.flags] if hasattr(l_curved_glyph, 'flags') else []
        glyf['l.curved'] = l_curved_glyph
        hmtx['l.curved'] = (hmtx['l'][0] + int(tail_w * 0.5), hmtx['l'][1])
        if 'l.curved' not in glyph_order:
            glyph_order.append('l.curved')
            
    font.setGlyphOrder(glyph_order)
    
    # 4. Compile OpenType GSUB feature code
    fea_code = """
languagesystem DFLT dflt;
languagesystem latn dflt;

feature zero {
    sub zero by zero.slash;
} zero;

feature cv08 {
    cvParameters {
        FeatUILabelNameID { name "Slashed Zero"; };
    };
    sub zero by zero.slash;
} cv08;

feature cv05 {
    cvParameters {
        FeatUILabelNameID { name "Curved Lowercase L"; };
    };
    sub l by l.curved;
} cv05;

feature ss02 {
    featureNames {
        name "Serifed Capital I";
    };
    sub I by I.serif;
} ss02;
"""
    
    # Build GSUB table into font
    import tempfile
    with tempfile.NamedTemporaryFile(mode='w', suffix='.fea', delete=False) as f:
        f.write(fea_code)
        fea_path = f.name
        
    try:
        feaBuilder.addOpenTypeFeatures(font, fea_path)
    finally:
        if os.path.exists(fea_path):
            os.remove(fea_path)
            
    font.save(font_path)
    print(f"[OK] Successfully added zero, cv08, cv05, ss02 features to: {font_path}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python add_clinical_disambiguation.py <font1.ttf> [font2.ttf ...]")
        sys.exit(1)
        
    for p in sys.argv[1:]:
        add_disambiguation_to_font(p)

if __name__ == '__main__':
    main()
