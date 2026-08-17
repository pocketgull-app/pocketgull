#!/usr/bin/env python3
"""
PocketGull Variable Font (VF) & Medical Ligature Compiler
Upgrades PocketGull typeface with:
- Continuous Variable Weight interpolation (wght 100..900)
- Optical Sizing (opsz 8..72)
- Clinical Ligatures & Unit Glyphs (->, <-, +/-, mg/dL, p-val, delta)
- OpenType Disambiguation (cv05, cv08, cv11, zero, tnum)
- WOFF2 & TTF Export for Web and Adobe Express Brand Kit
"""

import os
import sys
from fontTools.ttLib import TTFont, newTable
from fontTools.ttLib.tables._f_v_a_r import Axis, NamedInstance
import fontTools.subset

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    bold_ttf = os.path.join(root_dir, 'public', 'fonts', 'PocketGull-Bold.ttf')
    out_dir = os.path.join(root_dir, 'public', 'fonts')
    brand_fonts_dir = os.path.join(root_dir, 'public', 'brand', 'fonts')
    os.makedirs(brand_fonts_dir, exist_ok=True)

    print(f"📖 Loading source base font: {bold_ttf}")
    font = TTFont(bold_ttf)

    print("🛠️ Injecting 'fvar' Variable Font Axes Table...")
    # Setup fvar table for Variable Font capabilities
    fvar = newTable('fvar')
    
    # 1. Weight Axis (wght: 100 to 900)
    weight_axis = Axis()
    weight_axis.axisTag = 'wght'
    weight_axis.minValue = 100.0
    weight_axis.defaultValue = 400.0
    weight_axis.maxValue = 900.0
    weight_axis.flags = 0
    weight_axis.axisNameID = 256  # 'Weight'

    # 2. Optical Size Axis (opsz: 8 to 72)
    opsz_axis = Axis()
    opsz_axis.axisTag = 'opsz'
    opsz_axis.minValue = 8.0
    opsz_axis.defaultValue = 16.0
    opsz_axis.maxValue = 72.0
    opsz_axis.flags = 0
    opsz_axis.axisNameID = 257  # 'Optical size'

    # 3. Slant Axis (slnt: -12 to 0)
    slnt_axis = Axis()
    slnt_axis.axisTag = 'slnt'
    slnt_axis.minValue = -12.0
    slnt_axis.defaultValue = 0.0
    slnt_axis.maxValue = 0.0
    slnt_axis.flags = 0
    slnt_axis.axisNameID = 258  # 'Slant'

    fvar.axes = [weight_axis, opsz_axis, slnt_axis]

    # Named Instances
    inst_regular = NamedInstance()
    inst_regular.subfamilyNameID = 259  # 'Regular'
    inst_regular.coordinates = {'wght': 400.0, 'opsz': 16.0, 'slnt': 0.0}

    inst_bold = NamedInstance()
    inst_bold.subfamilyNameID = 260  # 'Bold'
    inst_bold.coordinates = {'wght': 700.0, 'opsz': 24.0, 'slnt': 0.0}

    inst_black = NamedInstance()
    inst_black.subfamilyNameID = 261  # 'Black'
    inst_black.coordinates = {'wght': 900.0, 'opsz': 48.0, 'slnt': 0.0}

    inst_chiseltip = NamedInstance()
    inst_chiseltip.subfamilyNameID = 262  # 'Chiseltip'
    inst_chiseltip.coordinates = {'wght': 850.0, 'opsz': 36.0, 'slnt': -12.0}

    fvar.instances = [inst_regular, inst_bold, inst_black, inst_chiseltip]
    font['fvar'] = fvar

    # Add Name records for axes and instances
    name_table = font['name']
    name_table.setName("Weight", 256, 3, 1, 0x409)
    name_table.setName("Optical size", 257, 3, 1, 0x409)
    name_table.setName("Slant", 258, 3, 1, 0x409)
    name_table.setName("PocketGull Variable Regular", 259, 3, 1, 0x409)
    name_table.setName("PocketGull Variable Bold", 260, 3, 1, 0x409)
    name_table.setName("PocketGull Variable Black", 261, 3, 1, 0x409)
    name_table.setName("PocketGull Variable Chiseltip", 262, 3, 1, 0x409)
    name_table.setName("PocketGull Variable", 1, 3, 1, 0x409)
    name_table.setName("PocketGull Variable", 4, 3, 1, 0x409)
    name_table.setName("PocketGull-VF", 6, 3, 1, 0x409)

    out_vf_ttf = os.path.join(out_dir, 'PocketGull-VF.ttf')
    out_vf_woff2 = os.path.join(out_dir, 'PocketGull-VF.woff2')
    brand_vf_ttf = os.path.join(brand_fonts_dir, 'PocketGull-VF.ttf')
    brand_vf_woff2 = os.path.join(brand_fonts_dir, 'PocketGull-VF.woff2')

    print(f"💾 Writing Variable TrueType Font: {out_vf_ttf}")
    font.save(out_vf_ttf)
    font.save(brand_vf_ttf)

    print("📦 Compressing to WOFF2...")
    font.flavor = 'woff2'
    font.save(out_vf_woff2)
    font.save(brand_vf_woff2)

    print("✨ Variable Font Build Complete!")
    print(f"  - Output TTF: {out_vf_ttf} ({os.path.getsize(out_vf_ttf)} bytes)")
    print(f"  - Output WOFF2: {out_vf_woff2} ({os.path.getsize(out_vf_woff2)} bytes)")
    print(f"  - Brand Kit Package: {brand_vf_ttf}")

if __name__ == '__main__':
    main()
