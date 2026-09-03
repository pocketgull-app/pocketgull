import 'dart:io';
import 'sfnt_builder.dart';
import 'sloan_optotype.dart';
import 'braille_generator.dart';
import 'ismp_engine.dart';
import 'monospace_hud.dart';
import 'phinney_auditor.dart';

void main() {
  print('======================================================================');
  print('  POCKETGULL FOUNDRY: PURE DART AUTOMATED TEST SUITE');
  print('======================================================================\n');

  int passed = 0;
  int failed = 0;

  void test(String name, void Function() body) {
    stdout.write('  TEST: $name ... ');
    try {
      body();
      passed++;
      print('[PASS]');
    } catch (e) {
      failed++;
      print('[FAIL]: $e');
    }
  }

  // 1. Sloan 5:1 Optotype Invariant
  test('Louise Sloan 5:1 Snellen 20/20 & Herman Bouma Tracking', () {
    final letterO = SloanOptotypeEngine.generateLetterO(0);
    assert(letterO.advanceWidth >= 1000, 'Advance width must equal or exceed 1000 UPM');
    assert(letterO.contours.length == 2, 'Letter O must have outer and inner contours');
    final bouma = SloanOptotypeEngine.calculateBoumaPadding(1000);
    assert(bouma % 2 == 0, 'Bouma padding must be 2-byte word aligned');
    assert(SloanOptotypeEngine.checkThermal203DpiFit(200, 12), '200 UPM stroke at 12pt must fit 203 DPI grid');
  });

  // 2. Braille Generator
  test('256-Glyph Unicode Braille (U+2800–28FF) Conformance', () {
    final allBraille = BrailleGenerator.generateAll(0);
    assert(allBraille.length == 256, 'Must generate exactly 256 Braille glyphs');
    assert(allBraille.first.codePoint == 0x2800, 'First glyph must be U+2800 (blank Braille)');
    assert(allBraille.last.codePoint == 0x28FF, 'Last glyph must be U+28FF (all 8 dots)');
    assert(allBraille.last.contours.length == 8, 'U+28FF must contain exactly 8 dot contours');
    for (final g in allBraille) {
      assert(g.advanceWidth == BrailleGenerator.cellWidth, 'All Braille cells must share uniform cell width');
    }
  });

  // 3. ISMP Disambiguation
  test('ISMP & FDA Clinical Disambiguation (0 vs O, l vs 1 vs I, Z vs 2)', () {
    final zero = IsmpDisambiguationEngine.generateSlashedZero(0);
    assert(zero.contours.length == 3, 'Slashed zero must have outer, counter, and diagonal slash');
    final l = IsmpDisambiguationEngine.generateCurvedL(1);
    assert(l.contours.length == 1, 'Curved l must have outward terminal hook');
    final I = IsmpDisambiguationEngine.generateSerifedI(2);
    assert(I.contours.length == 1, 'Serifed I must have cap and baseline serifs');
    final Z = IsmpDisambiguationEngine.generateSlashedZ(3);
    assert(Z.contours.length == 2, 'Slashed Z must have main body and crossbar');
  });

  // 4. Monospace ICU HUD
  test('Mission-Critical Monospace 600 UPM & Gapless Box Drawing', () {
    final hLine = MonospaceHudEngine.generateHLine(0);
    final vLine = MonospaceHudEngine.generateVLine(1);
    assert(hLine.advanceWidth == 600, 'Horizontal line must be 600 UPM');
    assert(vLine.advanceWidth == 600, 'Vertical line must be 600 UPM');
    final bbox = vLine.boundingBox;
    assert(bbox.$2 == -200, 'Vertical line must touch floor y=-200');
    assert(bbox.$4 == 800, 'Vertical line must touch ceiling y=800');

    for (var i = 1; i <= 8; i++) {
      final block = MonospaceHudEngine.generateSubCellBlock(i + 1, i);
      assert(block.advanceWidth == 600, 'Sub-cell block must be 600 UPM');
      assert(block.codePoint == 0x2580 + i, 'Block codepoint must match U+2581..U+2588');
    }
  });

  // 5. SFNT Compilation & Word Alignment
  test('SFNT Compiler Enforces 2-Byte loca Alignment & Bit 7 Masking', () {
    final builder = SfntBuilder(familyName: 'PocketGull Test', upm: 1000);
    builder.addGlyph(SloanOptotypeEngine.generateLetterO(0));
    builder.addGlyph(IsmpDisambiguationEngine.generateSlashedZero(1));
    builder.addGlyph(IsmpDisambiguationEngine.generateCurvedL(2));
    final binary = builder.compile();
    assert(binary.length > 1000, 'Binary must contain complete SFNT font tables');

    // Write temporary test file and audit
    final tmpFile = File('${Directory.systemTemp.path}${Platform.pathSeparator}pg_test.ttf');
    tmpFile.writeAsBytesSync(binary);

    final audit = ThomasPhinneyAuditor.audit(tmpFile);
    assert(audit.passed, 'Generated SFNT binary must pass Thomas Phinney audit');
    assert(audit.oddLocaOffsets == 0, 'loca table must contain exactly 0 odd offsets');
    assert(audit.badBit7Flags == 0, 'glyf table must contain exactly 0 Bit 7 flags');

    tmpFile.deleteSync();
  });

  print('\n======================================================================');
  print('  RESULTS: $passed PASSED, $failed FAILED');
  print('======================================================================\n');

  if (failed > 0) exitCode = 1;
}
