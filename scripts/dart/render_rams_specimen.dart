import 'dart:io';
import 'dart:convert';

void main() async {
  print('\n======================================================================');
  print('  POCKETGULL: DIETER RAMS SYNAPTIC SPECIMEN GENERATOR (WSL / INKSCAPE)');
  print('======================================================================\n');

  final root = Directory.current.path;
  final backdropFile = File('$root/public/images/synaptic_quilling_backdrop.jpg');
  if (!backdropFile.existsSync()) {
    print('[ERROR] Backdrop image not found: ${backdropFile.path}');
    exitCode = 1;
    return;
  }

  print('  [1/5] Reading synaptic quilling artwork backdrop...');
  final backdropBytes = backdropFile.readAsBytesSync();
  final backdropBase64 = base64Encode(backdropBytes);
  final backdropDataUri = 'data:image/jpeg;base64,$backdropBase64';
  print('  [OK] Encoded ${backdropBytes.length} bytes into base64 data URI.');

  // Generate vector ECG polyline points
  final ecgPoints = StringBuffer();
  const startY = 66.0;
  const beatWidth = 115.0;
  for (int b = 0; b < 9; b++) {
    final ox = 24.0 + (b * beatWidth);
    ecgPoints.write('${ox.toStringAsFixed(1)},$startY ');
    ecgPoints.write('${(ox + 12).toStringAsFixed(1)},$startY ');
    ecgPoints.write('${(ox + 18).toStringAsFixed(1)},${(startY - 5).toStringAsFixed(1)} '); // P wave
    ecgPoints.write('${(ox + 25).toStringAsFixed(1)},$startY ');
    ecgPoints.write('${(ox + 35).toStringAsFixed(1)},$startY ');
    ecgPoints.write('${(ox + 40).toStringAsFixed(1)},${(startY + 4).toStringAsFixed(1)} '); // Q wave
    ecgPoints.write('${(ox + 46).toStringAsFixed(1)},${(startY - 26).toStringAsFixed(1)} '); // R wave peak
    ecgPoints.write('${(ox + 52).toStringAsFixed(1)},${(startY + 12).toStringAsFixed(1)} '); // S wave dip
    ecgPoints.write('${(ox + 60).toStringAsFixed(1)},$startY ');
    ecgPoints.write('${(ox + 72).toStringAsFixed(1)},${(startY - 8).toStringAsFixed(1)} '); // T wave
    ecgPoints.write('${(ox + 85).toStringAsFixed(1)},$startY ');
    ecgPoints.write('${(ox + beatWidth).toStringAsFixed(1)},$startY ');
  }

  const topBraille = '⠏⠕⠉⠅⠑⠞⠛⠥⠇⠇⠀⠞⠽⠏⠑⠋⠁⠉⠑⠀⠎⠥⠏⠑⠗⠋⠁⠍⠊⠇⠽⠀⠤⠀⠎⠽⠝⠁⠏⠞⠊⠉⠀⠟⠥⠊⠇⠇⠊⠝⠛⠀⠎⠏⠑⠉⠊⠍⠑⠝⠀⠼⠃⠚⠃⠋';
  const bottomBraille = '⠺⠑⠝⠊⠛⠑⠗⠀⠁⠃⠑⠗⠀⠃⠑⠎⠎⠑⠗⠀⠤⠀⠛⠕⠕⠙⠀⠙⠑⠎⠊⠛⠝⠀⠊⠎⠀⠁⠎⠀⠇⠊⠞⠞⠇⠑⠀⠙⠑⠎⠊⠛⠝⠀⠁⠎⠀⠏⠕⠎⠎⠊戀⠇⠑⠀⠤⠀⠙⠊⠑⠞⠑⠗⠀⠗⠁⠍⠎';
  const leftBraille = '⠇⠕⠥⠊⠎⠑⠀⠎⠇⠕⠁⠝⠀⠼⠑⠒⠁⠀⠤⠀⠓⠑⠗⠍⠁⠝⠀⠃⠕⠥⠍⠁⠀⠼⠚⠲⠁⠃⠑⠍⠀⠤⠀⠙⠊⠑⠞⠑⠗⠀⠗⠁⠍⠎⠀⠤⠀⠺⠑⠝⠊⠛⠑⠗⠀⠁⠃⠑⠗⠀⠃⠑⠎⠎⠑⠗';
  const rightBraille = '⠏⠕⠉⠅⠑⠞⠛⠥⠇⠇⠀⠍⠕⠝⠕⠀⠼⠋⠚⠚⠀⠥⠏⠍⠀⠤⠀⠊⠎⠍⠏⠀⠎⠁⠋⠑⠞⠽⠀⠤⠀⠙⠊⠎⠁⠍戀⠊⠛⠥⠁⠞⠊⠕⠝⠀⠤⠀⠼⠃⠚⠃⠋';

  // Build SVG for given theme
  String buildSvg({required bool isDark}) {
    const w = 1200;
    const h = 1720;

    final bgFill = isDark ? 'url(#obsidianGrad)' : '#F6F4EE';
    final gridStroke = isDark ? '#1E293B' : '#E2E8F0';
    final cardFill = isDark ? 'url(#cardGrad)' : '#FFFFFF';
    final cardStroke = isDark ? '#334155' : '#CBD5E1';
    final textMain = isDark ? '#F8FAFC' : '#0F172A';
    final textMuted = isDark ? '#94A3B8' : '#475569';
    final textFaint = isDark ? '#64748B' : '#94A3B8';
    final braillePillFill = isDark ? '#0A0F1D' : '#EDE8DC';
    final braillePillStroke = isDark ? '#1E293B' : '#D1C7B7';
    final brailleColor = isDark ? '#38BDF8' : '#0369A1';
    final sideBrailleColor = isDark ? '#0284C7' : '#0284C7';
    final hudBg = isDark ? '#02050D' : '#F8FAFC';
    final hudBorder = isDark ? '#2DD4BF' : '#0D9488';
    final hudHeaderBg = isDark ? '#0B132B' : '#E6FFFA';
    final hudHeaderText = isDark ? '#38BDF8' : '#0D9488';
    final ecgColor = isDark ? '#2DD4BF' : '#0F766E';
    final ribbonBg = isDark ? '#060913' : '#FFFFFF';
    final overlayGrad = isDark ? 'url(#quillOverlayDark)' : 'url(#quillOverlayLight)';

    final svg = StringBuffer();
    svg.writeln('<?xml version="1.0" encoding="UTF-8"?>');
    svg.writeln('<svg width="$w" height="$h" viewBox="0 0 $w $h" xmlns="http://www.w3.org/2000/svg">');
    svg.writeln('  <defs>');
    if (isDark) {
      svg.writeln('    <linearGradient id="obsidianGrad" x1="0" y1="0" x2="0" y2="1">');
      svg.writeln('      <stop offset="0%" stop-color="#05070B"/>');
      svg.writeln('      <stop offset="35%" stop-color="#090D15"/>');
      svg.writeln('      <stop offset="70%" stop-color="#070A10"/>');
      svg.writeln('      <stop offset="100%" stop-color="#030508"/>');
      svg.writeln('    </linearGradient>');
      svg.writeln('    <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">');
      svg.writeln('      <stop offset="0%" stop-color="#0E1626" stop-opacity="0.92"/>');
      svg.writeln('      <stop offset="100%" stop-color="#080C16" stop-opacity="0.96"/>');
      svg.writeln('    </linearGradient>');
      svg.writeln('    <linearGradient id="quillOverlayDark" x1="0" y1="0" x2="0" y2="1">');
      svg.writeln('      <stop offset="0%" stop-color="#05070B" stop-opacity="0.05"/>');
      svg.writeln('      <stop offset="60%" stop-color="#05070B" stop-opacity="0.45"/>');
      svg.writeln('      <stop offset="100%" stop-color="#05070B" stop-opacity="0.94"/>');
      svg.writeln('    </linearGradient>');
    } else {
      svg.writeln('    <linearGradient id="quillOverlayLight" x1="0" y1="0" x2="0" y2="1">');
      svg.writeln('      <stop offset="0%" stop-color="#F6F4EE" stop-opacity="0.02"/>');
      svg.writeln('      <stop offset="65%" stop-color="#F6F4EE" stop-opacity="0.30"/>');
      svg.writeln('      <stop offset="100%" stop-color="#F6F4EE" stop-opacity="0.92"/>');
      svg.writeln('    </linearGradient>');
    }
    svg.writeln('    <style>');
    svg.writeln('      @font-face { font-family: "PocketGull"; src: local("PocketGull"), local("PocketGull-Bold"); font-weight: bold; }');
    svg.writeln('      @font-face { font-family: "PocketGull Mono"; src: local("PocketGull Mono"), local("PocketGullMono-Regular"); }');
    svg.writeln('      .font-title { font-family: "PocketGull", -apple-system, sans-serif; font-weight: bold; }');
    svg.writeln('      .font-mono { font-family: "PocketGull Mono", "Courier New", monospace; }');
    svg.writeln('      .font-braille { font-family: "PocketGull", "DejaVu Sans", monospace; letter-spacing: 0.16em; }');
    svg.writeln('      .font-meta { font-family: "PocketGull Mono", -apple-system, sans-serif; letter-spacing: 0.06em; }');
    svg.writeln('    </style>');
    svg.writeln('  </defs>');

    // 1. Base Canvas Background
    svg.writeln('  <!-- 1. Base Canvas -->');
    svg.writeln('  <rect width="$w" height="$h" fill="$bgFill"/>');

    // Reference Grid
    svg.writeln('  <!-- Architectural 60px Reference Grid -->');
    for (int gy = 60; gy < h; gy += 60) {
      svg.writeln('  <line x1="60" y1="$gy" x2="${w - 60}" y2="$gy" stroke="$gridStroke" stroke-width="0.5" stroke-opacity="0.4"/>');
    }
    for (int gx = 60; gx < w; gx += 60) {
      svg.writeln('  <line x1="$gx" y1="60" x2="$gx" y2="${h - 60}" stroke="$gridStroke" stroke-width="0.5" stroke-opacity="0.4"/>');
    }

    // 2. Braille Outer Frame Perimeter
    svg.writeln('  <!-- 2. Braille Frame Perimeter -->');
    svg.writeln('  <rect x="60" y="24" width="1080" height="28" rx="6" fill="$braillePillFill" stroke="$braillePillStroke" stroke-width="0.8"/>');
    svg.writeln('  <text x="600" y="43" class="font-braille" font-size="13" fill="$brailleColor" text-anchor="middle">$topBraille</text>');

    svg.writeln('  <g transform="translate(36, 860) rotate(-90)">');
    svg.writeln('    <text x="0" y="0" class="font-braille" font-size="12" fill="$sideBrailleColor" fill-opacity="0.8" text-anchor="middle">$leftBraille</text>');
    svg.writeln('  </g>');
    svg.writeln('  <g transform="translate(1164, 860) rotate(90)">');
    svg.writeln('    <text x="0" y="0" class="font-braille" font-size="12" fill="$sideBrailleColor" fill-opacity="0.8" text-anchor="middle">$rightBraille</text>');
    svg.writeln('  </g>');

    // 3. Dieter Rams Modular Header
    svg.writeln('  <!-- 3. Dieter Rams Modular Header -->');
    svg.writeln('  <line x1="60" y1="65" x2="1140" y2="65" stroke="$cardStroke" stroke-width="1.2"/>');
    svg.writeln('  <text x="60" y="98" class="font-title" font-size="32" fill="$textMain" letter-spacing="-0.03em">POCKETGULL</text>');
    svg.writeln('  <circle cx="272" cy="90" r="7" fill="#F59E0B"/>'); // Braun orange indicator dial
    svg.writeln('  <text x="292" y="95" class="font-meta" font-size="14" fill="$textMuted" font-weight="bold">SYSTEM 01 // HUMANIST SANS-SERIF &amp; CLINICAL MONOSPACE SUPERFAMILY</text>');
    svg.writeln('  <text x="1140" y="95" class="font-mono" font-size="13" fill="${isDark ? '#2DD4BF' : '#0D9488'}" text-anchor="end" font-weight="bold">WENIGER, ABER BESSER • 1000 UPM</text>');
    svg.writeln('  <line x1="60" y1="116" x2="1140" y2="116" stroke="$cardStroke" stroke-width="1.2"/>');

    // 4. Synaptic Quilling Artwork Viewport
    svg.writeln('  <!-- 4. Synaptic Quilling Artwork Viewport -->');
    const qx = 60;
    const qy = 135;
    const qw = 1080;
    const qh = 560;
    svg.writeln('  <g id="synaptic-quilling-plate" transform="translate($qx, $qy)">');
    svg.writeln('    <clipPath id="quillClip"><rect width="$qw" height="$qh" rx="14"/></clipPath>');
    svg.writeln('    <image href="$backdropDataUri" x="0" y="-40" width="$qw" height="640" preserveAspectRatio="xMidYMid slice" clip-path="url(#quillClip)"/>');
    svg.writeln('    <rect width="$qw" height="$qh" rx="14" fill="$overlayGrad"/>');
    svg.writeln('    <rect width="$qw" height="$qh" rx="14" fill="none" stroke="${isDark ? '#2DD4BF' : '#0D9488'}" stroke-width="1.5" stroke-opacity="0.5"/>');

    // Architectural Precision Crosshairs (+)
    svg.writeln('    <path d="M-15 0 L15 0 M0 -15 L0 15" stroke="#F59E0B" stroke-width="1.8"/>');
    svg.writeln('    <path d="M${qw - 15} 0 L${qw + 15} 0 M$qw -15 L$qw 15" stroke="#F59E0B" stroke-width="1.8"/>');
    svg.writeln('    <path d="M-15 $qh L15 $qh M0 ${qh - 15} L0 ${qh + 15}" stroke="#F59E0B" stroke-width="1.8"/>');
    svg.writeln('    <path d="M${qw - 15} $qh L${qw + 15} $qh M$qw ${qh - 15} L$qw ${qh + 15}" stroke="#F59E0B" stroke-width="1.8"/>');

    // Quilling Plate Overlay HUD
    final plateHudBg = isDark ? '#030712' : '#FFFFFF';
    final plateHudBorder = isDark ? '#1E293B' : '#E2E8F0';
    svg.writeln('    <rect x="20" y="${qh - 46}" width="${qw - 40}" height="32" rx="6" fill="$plateHudBg" fill-opacity="0.88" stroke="$plateHudBorder" stroke-width="0.8"/>');
    svg.writeln('    <text x="36" y="${qh - 26}" class="font-mono" font-size="12" fill="${isDark ? '#2DD4BF' : '#0D9488'}" font-weight="bold">CODEX: SYNAPTIC VESICLE EXOCYTOSIS // [Ca²⁺]i: 100 nM // ΔΨm: -140 mV // ATP SYNTHASE: 600 RPM</text>');
    svg.writeln('    <text x="${qw - 36}" y="${qh - 26}" class="font-meta" font-size="11" fill="$textMuted" text-anchor="end">PLATE 01 • THE CELLULAR TYPEFOUNDRY</text>');
    svg.writeln('  </g>');

    // 5. Monotype ICU Telemetry HUD Strip
    svg.writeln('  <!-- 5. Monotype ICU Telemetry HUD Strip -->');
    const hudY = 715;
    const hudH = 124;
    svg.writeln('  <g id="telemetry-hud" transform="translate(60, $hudY)">');
    svg.writeln('    <rect width="1080" height="$hudH" rx="10" fill="$hudBg" stroke="$hudBorder" stroke-width="1.4"/>');
    svg.writeln('    <rect width="1080" height="28" rx="8" fill="$hudHeaderBg"/>');
    svg.writeln('    <text x="20" y="19" class="font-mono" font-size="12" fill="$hudHeaderText" font-weight="bold">┌─[ ICU.STATION#04 ]───[ TELEMETRY &amp; CLINICAL GLYPHS ]───[ GRID: 1000 UPM ]───[ PITCH: 600 ]───┐</text>');
    svg.writeln('    <text x="1060" y="19" class="font-mono" font-size="11" fill="${isDark ? '#10B981' : '#059669'}" text-anchor="end" font-weight="bold">● LIVE STREAMING</text>');
    svg.writeln('    <polyline points="${ecgPoints.toString().trim()}" fill="none" stroke="$ecgColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>');
    svg.writeln('    <line x1="20" y1="92" x2="1060" y2="92" stroke="${isDark ? '#1E293B' : '#E2E8F0'}" stroke-width="0.8"/>');
    svg.writeln('    <text x="24" y="111" class="font-mono" font-size="13" fill="$textMain" font-weight="bold">HR: 72 bpm  │  SpO2: 98%  │  MAP: 93 mmHg  │  rMSSD: 48 ms  │  BP: 120/80 mmHg  │  PARQUET: NOMINAL</text>');
    svg.writeln('    <text x="1060" y="111" class="font-meta" font-size="11" fill="$textFaint" text-anchor="end">ISMP DISAMBIGUATED TELEMETRY</text>');
    svg.writeln('  </g>');

    // 6. Four Parquet DB Limericks (2x2 Grid)
    svg.writeln('  <!-- 6. Parquet Knowledge DB Limericks (Swiss 2x2 Grid) -->');
    final cards = [
      {
        'x': 60,
        'y': 855,
        'w': 525,
        'h': 235,
        'num': '01',
        'title': 'LOUISE SLOAN 5:1 OPTOTYPE INVARIANT',
        'sub': 'EMPIRICAL OPTICS [E] • 55 CM SNELLEN 20/20',
        'accent': isDark ? '#2DD4BF' : '#0D9488',
        'node': 'sloan',
        'lines': [
          'An optotype measured in light,',
          'Five minutes of arc in the sight;',
          'With a stroke one-fifth wide,',
          'Where the cones safely glide,',
          'Louise gave clinicians their sight!',
        ]
      },
      {
        'x': 615,
        'y': 855,
        'w': 525,
        'h': 235,
        'num': '02',
        'title': "HERMAN BOUMA'S LATERAL CROWDING",
        'sub': 'NEURO-ERGONOMICS [E] • 0.12em CRITICAL SPACING',
        'accent': isDark ? '#38BDF8' : '#0284C7',
        'node': 'bouma',
        'lines': [
          'When numbers are squeezed on a chart,',
          'They blur and they wander apart;',
          'With Bouma’s wide space',
          'In the telemetry place,',
          'Clear reading becomes a fine art!',
        ]
      },
      {
        'x': 60,
        'y': 1105,
        'w': 525,
        'h': 235,
        'num': '03',
        'title': 'THE SYNAPTIC CLEFT & CELLULAR SPIRALS',
        'sub': 'BIOPHYSICS (+) • [Ca²⁺] INFLUX & VESICLES',
        'accent': isDark ? '#EC4899' : '#BE185D',
        'node': 'synapse',
        'lines': [
          'In the cleft where the quilled spirals turn,',
          'The calcium channels will burn;',
          'With vesicles bright',
          'In the cellular night,',
          'Each neurotransmitter will learn!',
        ]
      },
      {
        'x': 615,
        'y': 1105,
        'w': 525,
        'h': 235,
        'num': '04',
        'title': 'ISMP LIFE-CRITICAL DISAMBIGUATION',
        'sub': 'PATIENT SAFETY {D} • cv08 cv05 ss02',
        'accent': '#F59E0B',
        'node': 'ismp',
        'lines': [
          'A decimal wandering stray,',
          'Can lead dosage orders astray;',
          'With a slash in the nought',
          'And an \'l\' curved and caught,',
          'Safe healing is here for the day!',
        ]
      },
    ];

    for (final card in cards) {
      final cx = card['x'] as int;
      final cy = card['y'] as int;
      final cw = card['w'] as int;
      final ch = card['h'] as int;
      final num = card['num'] as String;
      final title = card['title'] as String;
      final sub = card['sub'] as String;
      final accent = card['accent'] as String;
      final node = card['node'] as String;
      final lines = card['lines'] as List<String>;

      svg.writeln('    <g transform="translate($cx, $cy)">');
      svg.writeln('      <rect width="$cw" height="$ch" rx="12" fill="$cardFill" stroke="$cardStroke" stroke-width="1.2"/>');
      svg.writeln('      <text x="22" y="28" class="font-meta" font-size="12" fill="$accent" font-weight="bold">[$num] $title</text>');
      svg.writeln('      <text x="22" y="44" class="font-mono" font-size="10" fill="$textFaint">$sub</text>');
      svg.writeln('      <line x1="20" y1="52" x2="${cw - 20}" y2="52" stroke="${isDark ? '#1E293B' : '#E2E8F0'}" stroke-width="1"/>');

      var ly = 78;
      for (int i = 0; i < lines.length; i++) {
        final isLast = i == lines.length - 1;
        final lineWeight = isLast ? 'bold' : 'normal';
        final lineFill = isLast ? textMain : (isDark ? '#CBD5E1' : '#334155');
        final fontSize = isLast ? 16 : 15;
        svg.writeln('      <text x="24" y="$ly" class="font-title" font-size="$fontSize" fill="$lineFill" font-weight="$lineWeight" font-style="italic">${lines[i]}</text>');
        ly += 26;
      }

      svg.writeln('      <line x1="20" y1="${ch - 24}" x2="${cw - 20}" y2="${ch - 24}" stroke="${isDark ? '#1E293B' : '#E2E8F0'}" stroke-width="0.8"/>');
      svg.writeln('      <text x="22" y="${ch - 9}" class="font-mono" font-size="10" fill="$textFaint">PARQUET.NODE: $node // DIETER RAMS PRINCIPLE #$num</text>');
      svg.writeln('      <text x="${cw - 22}" y="${ch - 9}" class="font-mono" font-size="10" fill="$accent" text-anchor="end">OPTOTYPE VERIFIED</text>');
      svg.writeln('    </g>');
    }

    // 7. Typographic Anatomy & Disambiguation Ribbon
    svg.writeln('  <!-- 7. Typographic Anatomy & Disambiguation Ribbon -->');
    const ribY = 1355;
    const ribH = 175;
    svg.writeln('  <g id="typography-ribbon" transform="translate(60, $ribY)">');
    svg.writeln('    <rect width="1080" height="$ribH" rx="12" fill="$ribbonBg" stroke="$cardStroke" stroke-width="1.2"/>');

    svg.writeln('    <text x="24" y="26" class="font-meta" font-size="12" fill="${isDark ? '#2DD4BF' : '#0D9488'}" font-weight="bold">POCKETGULL TYPEFACE SUPERFAMILY SKELETON // CLINICAL &amp; TELEMETRY OPTOTYPES</text>');
    svg.writeln('    <text x="1056" y="26" class="font-mono" font-size="11" fill="$textFaint" text-anchor="end">ISMP 500 mg (NOT 5.0 mg) • ZERO cv08 • CURVED l cv05</text>');
    svg.writeln('    <line x1="20" y1="36" x2="1060" y2="36" stroke="${isDark ? '#1E293B' : '#E2E8F0'}" stroke-width="1"/>');

    // Row 1: Full Alphabet
    svg.writeln('    <text x="24" y="66" class="font-title" font-size="20" fill="$textMain" letter-spacing="0.02em">Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz</text>');

    // Row 2: Disambiguation Quadrants
    svg.writeln('    <line x1="20" y1="84" x2="1060" y2="84" stroke="${isDark ? '#1E293B' : '#E2E8F0'}" stroke-width="0.8"/>');
    svg.writeln('    <g transform="translate(24, 96)">');
    final pillBg = isDark ? '#0B132B' : '#F1F5F9';
    svg.writeln('      <rect x="0" y="0" width="280" height="34" rx="6" fill="$pillBg" stroke="${isDark ? '#2DD4BF' : '#0D9488'}" stroke-width="0.8"/>');
    svg.writeln('      <text x="14" y="22" class="font-mono" font-size="14" fill="${isDark ? '#2DD4BF' : '#0D9488'}" font-weight="bold">0 vs O ∅  [cv08 Slashed Zero]</text>');

    svg.writeln('      <rect x="300" y="0" width="370" height="34" rx="6" fill="$pillBg" stroke="${isDark ? '#38BDF8' : '#0284C7'}" stroke-width="0.8"/>');
    svg.writeln('      <text x="314" y="22" class="font-mono" font-size="14" fill="${isDark ? '#38BDF8' : '#0284C7'}" font-weight="bold">1 vs l vs I  [cv05 Foot / ss02 Serif]</text>');

    svg.writeln('      <rect x="690" y="0" width="180" height="34" rx="6" fill="$pillBg" stroke="#F59E0B" stroke-width="0.8"/>');
    svg.writeln('      <text x="704" y="22" class="font-mono" font-size="14" fill="#F59E0B" font-weight="bold">Z vs 2  [Cross-bar]</text>');

    svg.writeln('      <rect x="890" y="0" width="146" height="34" rx="6" fill="$pillBg" stroke="${isDark ? '#10B981' : '#059669'}" stroke-width="0.8"/>');
    svg.writeln('      <text x="904" y="22" class="font-mono" font-size="14" fill="${isDark ? '#10B981' : '#059669'}" font-weight="bold">Snellen 20/20</text>');
    svg.writeln('    </g>');

    // Row 3: Tabular Numerals & Mathematical Operators
    svg.writeln('    <line x1="20" y1="142" x2="1060" y2="142" stroke="${isDark ? '#1E293B' : '#E2E8F0'}" stroke-width="0.8"/>');
    svg.writeln(r'    <text x="24" y="164" class="font-mono" font-size="17" fill="' + (isDark ? '#CBD5E1' : '#334155') + r'" letter-spacing="0.1em">0 1 2 3 4 5 6 7 8 9   . , : ; ! ? @ # $ % &amp; * - + = &lt; &gt; ( ) [ ] { } / \ | ~</text>');
    svg.writeln('  </g>');

    // 8. Bottom Braille Ruler & Dieter Rams Ten Principles Bar
    svg.writeln('  <!-- 8. Bottom Braille & Colophon -->');
    svg.writeln('  <rect x="60" y="1565" width="1080" height="28" rx="6" fill="$braillePillFill" stroke="$braillePillStroke" stroke-width="0.8"/>');
    svg.writeln('  <text x="600" y="1584" class="font-braille" font-size="13" fill="$brailleColor" text-anchor="middle">$bottomBraille</text>');

    svg.writeln('  <text x="600" y="1625" class="font-meta" font-size="11" fill="$textFaint" text-anchor="middle" letter-spacing="0.12em">1. INNOVATIVE • 2. USEFUL • 3. AESTHETIC • 4. UNDERSTANDABLE • 5. UNOBTRUSIVE • 6. HONEST • 7. LONG-LASTING • 8. THOROUGH • 9. SUSTAINABLE • 10. LESS, BUT BETTER</text>');

    svg.writeln('  <line x1="60" y1="1650" x2="1140" y2="1650" stroke="$cardStroke" stroke-width="0.8"/>');
    svg.writeln('  <text x="60" y="1685" class="font-meta" font-size="11" fill="$textMuted">DESIGNED BY PHILLIP GEAR // GEARARTS // ROOTED IN EMPIRICAL OPTICS. ENGINEERED FOR LIFE.</text>');
    svg.writeln('  <text x="1140" y="1685" class="font-mono" font-size="11" fill="${isDark ? '#2DD4BF' : '#0D9488'}" text-anchor="end" font-weight="bold">SIL OPEN FONT LICENSE 1.1 // POCKETGULL.APP // PHILGEAR.BIZ</text>');

    svg.writeln('</svg>');
    return svg.toString();
  }

  final typefaceDir = Directory('$root/../pocketgull-typeface/article');

  // Render both Dark and Light editions
  final themes = [
    {'name': 'Dark Obsidian Telemetry Edition', 'file': 'pocketgull_rams_synaptic_specimen', 'isDark': true},
    {'name': 'Classic Braun Ivory Edition', 'file': 'pocketgull_rams_synaptic_light', 'isDark': false},
  ];

  for (final t in themes) {
    final name = t['name'] as String;
    final filePrefix = t['file'] as String;
    final isDark = t['isDark'] as bool;

    print('\n----------------------------------------------------------------------');
    print('  Building: $name');
    print('----------------------------------------------------------------------');

    final svgContent = buildSvg(isDark: isDark);
    final svgFile = File('$root/public/images/$filePrefix.svg');
    svgFile.writeAsStringSync(svgContent);
    print('  [OK] Saved SVG: ${svgFile.path} (${svgContent.length} bytes)');

    if (typefaceDir.existsSync()) {
      File('${typefaceDir.path}/$filePrefix.svg').writeAsStringSync(svgContent);
      print('  [OK] Mirrored SVG to pocketgull-typeface: ${typefaceDir.path}/$filePrefix.svg');
    }

    final wslSvgPath = '/mnt/c/Users/philg/Pocketgull/pocketgull/public/images/$filePrefix.svg';
    final wslPngPath = '/mnt/c/Users/philg/Pocketgull/pocketgull/public/images/$filePrefix.png';

    print('  Rendering 300 DPI PNG via Inkscape in WSL (non-root)...');
    final renderProc = await Process.run('wsl', [
      'bash',
      '-c',
      'inkscape "$wslSvgPath" -o "$wslPngPath" --export-dpi=300'
    ]);

    if (renderProc.exitCode != 0) {
      print('[ERROR] Inkscape rendering failed: ${renderProc.stderr}');
      exitCode = 1;
      return;
    }

    final pngFile = File('$root/public/images/$filePrefix.png');
    if (pngFile.existsSync()) {
      print('  [SUCCESS] Rendered PNG: ${pngFile.path} (${pngFile.lengthSync()} bytes)');
      if (typefaceDir.existsSync()) {
        pngFile.copySync('${typefaceDir.path}/$filePrefix.png');
        print('  [OK] Mirrored PNG to pocketgull-typeface');
      }
    }
  }

  print('\n======================================================================');
  print('  COMPLETE: BOTH DIETER RAMS SYNAPTIC SPECIMEN POSTERS READY!');
  print('  1. Dark Obsidian: public/images/pocketgull_rams_synaptic_specimen.png');
  print('  2. Classic Braun: public/images/pocketgull_rams_synaptic_light.png');
  print('======================================================================\n');
}
