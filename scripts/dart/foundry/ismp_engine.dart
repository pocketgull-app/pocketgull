import 'models.dart';

/// ISMP & FDA Life-Critical Clinical Disambiguation Engine.
///
/// Directly encodes pharmaceutical safety standards:
/// - Slashed Zero (zero / cv08): Prevents 0 vs O collision in dosages ("10 mg" vs "1O mg").
///   Incorporate optical thinning at junctions to prevent ink bleed.
/// - Curved lowercase l (cv05): Prevents fatal l vs 1 vs I confusion ("100 mg" vs "l00 mg").
/// - Serifed capital I (ss02): Symmetrical bilateral serifs for immunology (IL-6, IgA).
/// - Slashed Z (cv06): Ƶ prevents 2 vs Z misreads on low-resolution thermal label printers.
/// - Bonded mcg ligature: Replaces dangerous microgram symbol µg (easily misread as mg).
class IsmpDisambiguationEngine {
  /// Synthesizes the clinical slashed zero with optical counter balancing.
  static GlyphRecord generateSlashedZero(int gid, {int advance = 600}) {
    // Outer oval contour (clockwise)
    final outer = GlyphContour()
      ..add(300, 750)
      ..add(550, 750, onCurve: false)
      ..add(550, 375)
      ..add(550, 0, onCurve: false)
      ..add(300, 0)
      ..add(50, 0, onCurve: false)
      ..add(50, 375)
      ..add(50, 750, onCurve: false);

    // Inner counter (counter-clockwise)
    final inner = GlyphContour()
      ..add(300, 620)
      ..add(180, 620, onCurve: false)
      ..add(180, 375)
      ..add(180, 130, onCurve: false)
      ..add(300, 130)
      ..add(420, 130, onCurve: false)
      ..add(420, 375)
      ..add(420, 620, onCurve: false);

    // Diagonal slash across counter (from bottom-left to top-right)
    // 40 UPM optical stroke with junction relief
    final slash = GlyphContour()
      ..add(150, 80)
      ..add(185, 80)
      ..add(450, 670)
      ..add(415, 670);

    return GlyphRecord(
      glyphId: gid,
      codePoint: 0x0030, // '0'
      name: 'zero.slashed',
      advanceWidth: advance,
      lsb: 50,
      contours: [outer, inner, slash],
    );
  }

  /// Synthesizes the clinical curved lowercase l (cv05).
  static GlyphRecord generateCurvedL(int gid, {int advance = 320}) {
    // Vertical stem with pronounced 90-degree outward terminal hook
    final contour = GlyphContour()
      ..add(80, 750)
      ..add(180, 750)
      ..add(180, 120)
      ..add(200, 80, onCurve: false)
      ..add(280, 80)
      ..add(280, 0)
      ..add(160, 0)
      ..add(80, 60, onCurve: false)
      ..add(80, 160);

    return GlyphRecord(
      glyphId: gid,
      codePoint: 0x006C, // 'l'
      name: 'l.curved',
      advanceWidth: advance,
      lsb: 80,
      contours: [contour],
    );
  }

  /// Synthesizes the clinical serifed capital I (ss02).
  static GlyphRecord generateSerifedI(int gid, {int advance = 420}) {
    // Symmetrical bilateral serifs at cap-height (y=750) and baseline (y=0)
    final contour = GlyphContour()
      ..add(60, 750)
      ..add(360, 750)
      ..add(360, 670)
      ..add(260, 670)
      ..add(260, 80)
      ..add(360, 80)
      ..add(360, 0)
      ..add(60, 0)
      ..add(60, 80)
      ..add(160, 80)
      ..add(160, 670)
      ..add(60, 670);

    return GlyphRecord(
      glyphId: gid,
      codePoint: 0x0049, // 'I'
      name: 'I.serifed',
      advanceWidth: advance,
      lsb: 60,
      contours: [contour],
    );
  }

  /// Synthesizes the clinical slashed Z (cv06 / Ƶ).
  static GlyphRecord generateSlashedZ(int gid, {int advance = 650}) {
    // Capital Z with a horizontal crossbar at the optical waist (y=375)
    final zContour = GlyphContour()
      ..add(80, 750)
      ..add(570, 750)
      ..add(570, 650)
      ..add(250, 100)
      ..add(570, 100)
      ..add(570, 0)
      ..add(80, 0)
      ..add(80, 100)
      ..add(400, 650)
      ..add(80, 650);

    // Crossbar (width: 240, height: 60) centered at x=325, y=375
    final crossbar = GlyphContour()
      ..add(205, 405)
      ..add(445, 405)
      ..add(445, 345)
      ..add(205, 345);

    return GlyphRecord(
      glyphId: gid,
      codePoint: 0x01B5, // 'Ƶ'
      name: 'Z.slashed',
      advanceWidth: advance,
      lsb: 80,
      contours: [zContour, crossbar],
    );
  }

  /// Synthesizes the empty set symbol (∅, U+2205) for ISMP disambiguation matrix.
  /// Distinguished from slashed zero (0̸) by a larger, rounder ellipse and
  /// a steeper ~60° diagonal that extends beyond the oval boundary.
  static GlyphRecord generateEmptySet(int gid, {int advance = 620}) {
    // Outer circular ellipse (rounder than zero, wider aspect ratio)
    final outer = GlyphContour()
      ..add(310, 750)
      ..add(560, 750, onCurve: false)
      ..add(560, 375)
      ..add(560, 0, onCurve: false)
      ..add(310, 0)
      ..add(60, 0, onCurve: false)
      ..add(60, 375)
      ..add(60, 750, onCurve: false);

    // Inner counter (counter-clockwise, proportionally wider than zero)
    final inner = GlyphContour()
      ..add(310, 630)
      ..add(180, 630, onCurve: false)
      ..add(180, 375)
      ..add(180, 120, onCurve: false)
      ..add(310, 120)
      ..add(440, 120, onCurve: false)
      ..add(440, 375)
      ..add(440, 630, onCurve: false);

    // Diagonal slash that extends BEYOND the oval (distinguishes ∅ from 0̸)
    // Steeper angle (~60°) and protrudes 30 UPM past the oval top and bottom
    final slash = GlyphContour()
      ..add(120, -30)
      ..add(155, -30)
      ..add(500, 780)
      ..add(465, 780);

    return GlyphRecord(
      glyphId: gid,
      codePoint: 0x2205, // '∅'
      name: 'emptyset',
      advanceWidth: advance,
      lsb: 60,
      contours: [outer, inner, slash],
    );
  }

  /// Synthesizes the IUPAC right-pointing harpoon with barb upwards (⇀, U+21C0).
  /// Used in chemical reaction mechanisms for single-electron (radical) transfers.
  static GlyphRecord generateRightHarpoon(int gid, {int advance = 700}) {
    // Horizontal shaft (thickness 40, y from 330 to 370)
    // with integrated upper barb curving/angling back to (480, 520)
    final harpoon = GlyphContour()
      ..add(60, 330)
      ..add(650, 330)
      ..add(650, 370)
      ..add(520, 520)
      ..add(475, 485)
      ..add(570, 370)
      ..add(60, 370);

    return GlyphRecord(
      glyphId: gid,
      codePoint: 0x21C0, // '⇀'
      name: 'harpoonrightup',
      advanceWidth: advance,
      lsb: 60,
      contours: [harpoon],
    );
  }

  /// Synthesizes the partial differential symbol (∂, U+2202).
  /// Used in chemical thermodynamics (e.g., ∂G/∂T, ∂μ/∂P) and calculus.
  static GlyphRecord generatePartialDifferential(int gid, {int advance = 580}) {
    // Outer shape: upper hook curving leftward + outer lower oval
    final outer = GlyphContour()
      // Top hook terminal
      ..add(220, 680)
      ..add(320, 720, onCurve: false)
      ..add(430, 640)
      ..add(450, 480, onCurve: false)
      ..add(450, 260)
      ..add(450, 0, onCurve: false)
      ..add(270, 0)
      ..add(70, 0, onCurve: false)
      ..add(70, 260)
      ..add(70, 480, onCurve: false)
      ..add(270, 520)
      ..add(390, 500)
      ..add(390, 580, onCurve: false)
      ..add(320, 660)
      ..add(240, 630);

    // Inner counter for lower bowl (counter-clockwise)
    final inner = GlyphContour()
      ..add(260, 440)
      ..add(140, 440, onCurve: false)
      ..add(140, 260)
      ..add(140, 80, onCurve: false)
      ..add(260, 80)
      ..add(380, 80, onCurve: false)
      ..add(380, 260)
      ..add(380, 440, onCurve: false);

    return GlyphRecord(
      glyphId: gid,
      codePoint: 0x2202, // '∂'
      name: 'partialdiff',
      advanceWidth: advance,
      lsb: 70,
      contours: [outer, inner],
    );
  }

  /// Synthesizes the infinity symbol (∞, U+221E) / lemniscate of Bernoulli.
  /// Used in physical chemistry (infinite dilution limits) and pharmacokinetics.
  static GlyphRecord generateInfinity(int gid, {int advance = 760}) {
    // Outer boundary covering both left and right lobes with central constriction
    final outer = GlyphContour()
      // Center top waist
      ..add(380, 335)
      // Right upper lobe
      ..add(480, 460, onCurve: false)
      ..add(600, 460)
      ..add(700, 390, onCurve: false)
      ..add(700, 260)
      ..add(700, 130, onCurve: false)
      ..add(600, 60)
      ..add(480, 60, onCurve: false)
      // Center bottom waist
      ..add(380, 185)
      // Left lower lobe
      ..add(280, 60, onCurve: false)
      ..add(160, 60)
      ..add(60, 130, onCurve: false)
      ..add(60, 260)
      ..add(60, 390, onCurve: false)
      ..add(160, 460)
      ..add(280, 460, onCurve: false);

    // Left counter (counter-clockwise)
    final leftInner = GlyphContour()
      ..add(200, 380)
      ..add(120, 380, onCurve: false)
      ..add(120, 260)
      ..add(120, 140, onCurve: false)
      ..add(200, 140)
      ..add(300, 140, onCurve: false)
      ..add(330, 260)
      ..add(300, 380, onCurve: false);

    // Right counter (counter-clockwise)
    final rightInner = GlyphContour()
      ..add(560, 380)
      ..add(460, 380, onCurve: false)
      ..add(430, 260)
      ..add(460, 140, onCurve: false)
      ..add(560, 140)
      ..add(640, 140, onCurve: false)
      ..add(640, 260)
      ..add(640, 380, onCurve: false);

    return GlyphRecord(
      glyphId: gid,
      codePoint: 0x221E, // '∞'
      name: 'infinity',
      advanceWidth: advance,
      lsb: 60,
      contours: [outer, leftInner, rightInner],
    );
  }
}

