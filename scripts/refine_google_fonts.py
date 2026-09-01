import sys
import os
from fontTools.ttLib import TTFont
from fontTools.agl import UV2AGL, toUnicode
import unicodedata

def get_standard_glyph_name(unicode_val, current_name):
    if current_name in ('.notdef', '.null', 'nonmarkingreturn'):
        return current_name
    if current_name == '.':
        return 'period'
        
    u = unicode_val
    if u is None and len(current_name) == 1:
        u = ord(current_name)
    elif u is None and current_name.startswith('glyph_') and len(current_name) == 7:
        u = ord(current_name[6])
    elif u is None and current_name.startswith('glyph_glyph_') and len(current_name) == 13:
        u = ord(current_name[12])

    if u is not None:
        if u in UV2AGL:
            return UV2AGL[u]
        if u <= 0xFFFF:
            return f"uni{u:04X}"
        return f"u{u:06X}"

    # Clean alphanumeric name
    clean = "".join(c if c.isalnum() or c == '_' else '_' for c in current_name)
    if clean.startswith('_') or clean[0].isdigit():
        clean = f"g_{clean}"
    return clean

def sanitize_and_refine_font(font_path, output_path):
    print(f"Refining font: {font_path}")
    font = TTFont(font_path)
    
    # 1. Build unicode to old name mapping
    cmap = font.getBestCmap()
    rev_cmap = {}
    for u, gname in cmap.items():
        rev_cmap[gname] = u
        
    glyph_order = font.getGlyphOrder()
    new_glyph_order = []
    rename_map = {}
    
    for gname in glyph_order:
        if gname in ('.notdef', '.null', 'nonmarkingreturn'):
            new_glyph_order.append(gname)
            rename_map[gname] = gname
            continue
        u = rev_cmap.get(gname)
        new_name = get_standard_glyph_name(u, gname)
        # Ensure uniqueness
        if new_name in new_glyph_order:
            idx = 1
            cand = f"{new_name}_{idx}"
            while cand in new_glyph_order:
                idx += 1
                cand = f"{new_name}_{idx}"
            new_name = cand
        new_glyph_order.append(new_name)
        rename_map[gname] = new_name
        
    # 2. Fix glyf table flags and sanitize contours
    if 'glyf' in font:
        glyf_table = font['glyf']
        for gname in glyf_table.keys():
            glyph = glyf_table[gname]
            if glyph.numberOfContours > 0:
                # Mask flags if any
                if hasattr(glyph, 'flags'):
                    glyph.flags = [f & 0x3F for f in glyph.flags]
                    
    # 3. Apply rename map across all tables and add case-counterpart mappings
    if 'cmap' in font:
        for subtable in font['cmap'].tables:
            if subtable.isUnicode():
                new_cmap = {}
                for u, gname in subtable.cmap.items():
                    new_cmap[u] = rename_map.get(gname, gname)
                
                # Check for missing case counterparts
                additions = {}
                for u, gname in list(new_cmap.items()):
                    try:
                        char = chr(u)
                        lower_char = char.lower()
                        upper_char = char.upper()
                        if ord(lower_char) not in new_cmap:
                            additions[ord(lower_char)] = gname
                        if ord(upper_char) not in new_cmap:
                            additions[ord(upper_char)] = gname
                        # Special handling for mu / micro sign
                        if u in (0x00B5, 0x03BC, 0x039C):
                            additions[0x00B5] = gname
                            additions[0x03BC] = gname
                            additions[0x039C] = gname
                    except Exception:
                        pass
                new_cmap.update(additions)
                subtable.cmap = new_cmap
                
    if 'hmtx' in font:
        new_metrics = {}
        for gname, metrics in font['hmtx'].metrics.items():
            new_metrics[rename_map.get(gname, gname)] = metrics
        font['hmtx'].metrics = new_metrics
        
    if 'glyf' in font:
        new_glyphs = {}
        for gname, glyph in font['glyf'].glyphs.items():
            new_glyphs[rename_map.get(gname, gname)] = glyph
        font['glyf'].glyphs = new_glyphs
        
    font.setGlyphOrder(new_glyph_order)
    
    # 4. Ensure xAvgCharWidth is accurate
    if 'OS/2' in font and 'hmtx' in font:
        widths = [w for w, _ in font['hmtx'].metrics.values() if w > 0]
        if widths:
            font['OS/2'].xAvgCharWidth = int(sum(widths) / len(widths))
            
    # 5. Fix post table format
    if 'post' in font:
        font['post'].formatType = 2.0
        font['post'].extraNames = []
        
    # 6. Normalize name table for Adobe / OpenType standards
    if 'name' in font:
        base_name = os.path.basename(font_path)
        subfamily = "Regular"
        ps_name = "PocketGull-Regular"
        full_name = "PocketGull Regular"
        
        if "Fineliner" in base_name:
            subfamily = "Fineliner"
            ps_name = "PocketGull-Fineliner"
            full_name = "PocketGull Fineliner"
        elif "Bold" in base_name:
            subfamily = "Bold"
            ps_name = "PocketGull-Bold"
            full_name = "PocketGull Bold"
        elif "Chiseltip" in base_name:
            subfamily = "Chiseltip"
            ps_name = "PocketGull-Chiseltip"
            full_name = "PocketGull Chiseltip"
        elif "Antigravity" in base_name:
            subfamily = "Antigravity"
            ps_name = "PocketGull-Antigravity"
            full_name = "PocketGull Antigravity"
            
        font['name'].setName("PocketGull", 1, 3, 1, 0x409)
        font['name'].setName(subfamily, 2, 3, 1, 0x409)
        font['name'].setName(full_name, 4, 3, 1, 0x409)
        font['name'].setName(ps_name, 6, 3, 1, 0x409)
        font['name'].setName("PocketGull", 1, 1, 0, 0)
        font['name'].setName(subfamily, 2, 1, 0, 0)
        font['name'].setName(full_name, 4, 1, 0, 0)
        font['name'].setName(ps_name, 6, 1, 0, 0)
        
    # 7. Save refined font
    font.save(output_path)
    print(f"[OK] Saved refined font to: {output_path}")

if __name__ == '__main__':
    for path in sys.argv[1:]:
        sanitize_and_refine_font(path, path)
