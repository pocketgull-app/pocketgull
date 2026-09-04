import 'dart:io';
import 'dart:convert';

void main() async {
  print('\n======================================================================');
  print('  POCKETGULL: SOCIAL CARDS & GALLERY PRINT GENERATOR (WSL / INKSCAPE)');
  print('  STANDARDS: COPPA SAFE • 6TH GRADE READING LEVEL • DIETER RAMS DESIGN');
  print('======================================================================\n');

  final root = Directory.current.path;

  // 1. Read and base64-encode device photos
  print('  [1/6] Reading Braun-inspired device photographs...');
  final dev16File = File('$root/public/images/braun_pocketgull_device_16x9.jpg');
  final dev1File = File('$root/public/images/braun_pocketgull_device_1x1.jpg');
  final quillFile = File('$root/public/images/synaptic_quilling_backdrop.jpg');

  if (!dev16File.existsSync() || !dev1File.existsSync()) {
    print('[ERROR] Missing Braun device photos in public/images/');
    exitCode = 1;
    return;
  }

  final dev16Uri = 'data:image/jpeg;base64,${base64Encode(dev16File.readAsBytesSync())}';
  final dev1Uri = 'data:image/jpeg;base64,${base64Encode(dev1File.readAsBytesSync())}';
  final quillUri = quillFile.existsSync()
      ? 'data:image/jpeg;base64,${base64Encode(quillFile.readAsBytesSync())}'
      : '';
  print('  [OK] Encoded photographs into self-contained data URIs.');

  // Common styles
  final svgStyles = '''
    @font-face { font-family: "PocketGull"; src: local("PocketGull"), local("PocketGull-Bold"); font-weight: bold; }
    @font-face { font-family: "PocketGull Mono"; src: local("PocketGull Mono"), local("PocketGullMono-Regular"); }
    .font-title { font-family: "PocketGull", -apple-system, sans-serif; font-weight: bold; }
    .font-mono { font-family: "PocketGull Mono", "Courier New", monospace; }
    .font-braille { font-family: "DejaVu Sans", "Liberation Mono", monospace; letter-spacing: 0.22em; font-weight: bold; }
    .font-body { font-family: "PocketGull", -apple-system, sans-serif; }
  ''';

  // Braille strings
  const braillePocketgull = '⠏⠕⠉⠅⠑⠞⠛⠥⠇⠇'; // pocketgull
  const brailleSimple = '⠺⠑⠝⠊⠛⠑⠗⠀⠁⠃⠑⠗⠀⠃⠑⠎⠎⠑⠗'; // weniger aber besser
  const brailleKindness = '⠉⠁⠗⠑⠀⠁⠝⠙⠀⠅⠊⠝⠙⠝⠑⠎⠎'; // care and kindness

  final typefaceArticleDir = Directory('$root/../pocketgull-typeface/article');

  // Helper to render an SVG with Inkscape in WSL
  Future<void> renderSvgToPng(String svgContent, String baseName, int width, int height) async {
    final svgFile = File('$root/public/images/$baseName.svg');
    svgFile.writeAsStringSync(svgContent);

    if (typefaceArticleDir.existsSync()) {
      File('${typefaceArticleDir.path}/$baseName.svg').writeAsStringSync(svgContent);
    }

    final wslSvgPath = '/mnt/c/Users/philg/Pocketgull/pocketgull/public/images/$baseName.svg';
    final wslPngPath = '/mnt/c/Users/philg/Pocketgull/pocketgull/public/images/$baseName.png';

    final proc = await Process.run('wsl', [
      'bash',
      '-c',
      'inkscape "$wslSvgPath" -o "$wslPngPath" --export-width=$width --export-height=$height'
    ]);

    if (proc.exitCode != 0) {
      print('[ERROR] Failed rendering $baseName: ${proc.stderr}');
      return;
    }

    final pngFile = File('$root/public/images/$baseName.png');
    if (pngFile.existsSync()) {
      print('  [OK] Generated: public/images/$baseName.png (${pngFile.lengthSync()} bytes) [$width x $height]');
      if (typefaceArticleDir.existsSync()) {
        pngFile.copySync('${typefaceArticleDir.path}/$baseName.png');
      }
    }
  }

  // --------------------------------------------------------------------------
  // FORMAT 1: GitHub Social Preview (1280 x 640 px, 2:1 ratio)
  // --------------------------------------------------------------------------
  print('\n  [2/6] Building GitHub Social Preview (1280 x 640 px)...');
  final ghSvg = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="1280" height="640" viewBox="0 0 1280 640" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>$svgStyles</style>
    <linearGradient id="ghBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#070A10"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <clipPath id="ghImgClip"><rect width="500" height="520" rx="16"/></clipPath>
  </defs>
  <rect width="1280" height="640" fill="url(#ghBg)"/>
  
  <!-- Subtle Grid -->
  <line x1="60" y1="60" x2="1220" y2="60" stroke="#334155" stroke-width="0.8"/>
  <line x1="60" y1="580" x2="1220" y2="580" stroke="#334155" stroke-width="0.8"/>
  
  <!-- Left Side: Braun Device Photo -->
  <g transform="translate(60, 60)">
    <image href="$dev1Uri" x="0" y="0" width="500" height="520" preserveAspectRatio="xMidYMid slice" clip-path="url(#ghImgClip)"/>
    <rect width="500" height="520" rx="16" fill="none" stroke="#2DD4BF" stroke-width="1.5" stroke-opacity="0.4"/>
    <text x="20" y="500" class="font-mono" font-size="11" fill="#2DD4BF" font-weight="bold">MODEL PG-01 // DIETER RAMS MINIMAL DESIGN</text>
  </g>

  <!-- Right Side: COPPA-Safe, 6th-Grade Content -->
  <g transform="translate(600, 75)">
    <!-- Badge -->
    <rect x="0" y="0" width="270" height="30" rx="15" fill="#0B132B" stroke="#2DD4BF" stroke-width="0.8"/>
    <circle cx="16" cy="15" r="5" fill="#F59E0B"/>
    <text x="32" y="20" class="font-mono" font-size="11" fill="#38BDF8" font-weight="bold">POCKETGULL TYPEFOUNDRY</text>

    <!-- Main Title -->
    <text x="0" y="80" class="font-title" font-size="44" fill="#F8FAFC" letter-spacing="-0.02em">Letters Made for</text>
    <text x="0" y="130" class="font-title" font-size="44" fill="#2DD4BF" letter-spacing="-0.02em">Healthy Eyes.</text>

    <!-- 6th Grade Plain Language Description -->
    <text x="0" y="180" class="font-body" font-size="18" fill="#CBD5E1">Good design is simple and kind. PocketGull is a clean,</text>
    <text x="0" y="210" class="font-body" font-size="18" fill="#CBD5E1">friendly typeface designed to help everyone read with ease.</text>
    <text x="0" y="240" class="font-body" font-size="18" fill="#CBD5E1">No tired eyes. No confusing numbers. Just pure clarity.</text>

    <!-- Feature Tags -->
    <g transform="translate(0, 275)">
      <rect x="0" y="0" width="180" height="38" rx="8" fill="#1E293B"/>
      <text x="16" y="24" class="font-mono" font-size="12" fill="#F8FAFC">✓ COPPA SAFE</text>

      <rect x="195" y="0" width="220" height="38" rx="8" fill="#1E293B"/>
      <text x="16" y="24" class="font-mono" font-size="12" fill="#F8FAFC" transform="translate(195, 0)">✓ 6TH GRADE FRIENDLY</text>

      <rect x="430" y="0" width="180" height="38" rx="8" fill="#1E293B"/>
      <text x="16" y="24" class="font-mono" font-size="12" fill="#F59E0B" transform="translate(430, 0)">★ SIL OFL 1.1 FREE</text>
    </g>

    <!-- Braille & Dieter Rams Rule -->
    <line x1="0" y1="345" x2="620" y2="345" stroke="#334155" stroke-width="0.8"/>
    <text x="0" y="380" class="font-braille" font-size="14" fill="#38BDF8">$braillePocketgull $brailleSimple</text>
    <text x="0" y="415" class="font-body" font-size="14" fill="#94A3B8" font-style="italic">“Weniger, aber besser” — Less, but better. Honest, gentle, and useful.</text>
    <text x="0" y="445" class="font-mono" font-size="12" fill="#64748B">Designed by Phil Gear // pocketgull.app // github.com/pocketgull-app</text>
  </g>
</svg>''';
  await renderSvgToPng(ghSvg, 'social_github_preview', 1280, 640);

  // --------------------------------------------------------------------------
  // FORMAT 2: Twitter / X Image Card (1200 x 675 px, 16:9 ratio)
  // --------------------------------------------------------------------------
  print('\n  [3/6] Building Twitter / X Social Card (1200 x 675 px)...');
  final twSvg = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>$svgStyles</style>
    <linearGradient id="twBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#060911"/>
      <stop offset="100%" stop-color="#0B132B"/>
    </linearGradient>
    <clipPath id="twImgClip"><rect width="470" height="535" rx="14"/></clipPath>
  </defs>
  <rect width="1200" height="675" fill="url(#twBg)"/>

  <!-- Left: Braun Device Photo -->
  <g transform="translate(60, 70)">
    <image href="$dev1Uri" x="0" y="0" width="470" height="535" preserveAspectRatio="xMidYMid slice" clip-path="url(#twImgClip)"/>
    <rect width="470" height="535" rx="14" fill="none" stroke="#2DD4BF" stroke-width="1.5" stroke-opacity="0.5"/>
    <rect x="15" y="485" width="440" height="35" rx="6" fill="#030712" fill-opacity="0.85"/>
    <text x="30" y="508" class="font-mono" font-size="11" fill="#2DD4BF" font-weight="bold">LESS, BUT BETTER • RAMS SYSTEM 01</text>
  </g>

  <!-- Right: The Gentle Healer Limerick Card -->
  <g transform="translate(570, 70)">
    <!-- Header -->
    <text x="0" y="30" class="font-mono" font-size="12" fill="#F59E0B" font-weight="bold">● THE GENTLE HEALER // PHIL GEAR</text>
    <text x="0" y="70" class="font-title" font-size="34" fill="#F8FAFC">A Story of Kind Ink</text>

    <!-- Limerick Box -->
    <rect x="0" y="95" width="570" height="230" rx="12" fill="#0E172A" stroke="#334155" stroke-width="1.2"/>
    <text x="30" y="140" class="font-title" font-size="20" fill="#CBD5E1" font-style="italic">In a circle where empathy grows,</text>
    <text x="30" y="175" class="font-title" font-size="20" fill="#CBD5E1" font-style="italic">And care like a mountain stream flows,</text>
    <text x="30" y="210" class="font-title" font-size="20" fill="#38BDF8" font-style="italic">He drew with kind ink</text>
    <text x="30" y="245" class="font-title" font-size="20" fill="#38BDF8" font-style="italic">To help everyone think,</text>
    <text x="30" y="285" class="font-title" font-size="21" fill="#2DD4BF" font-weight="bold">And soothe tired eyes from their woes!</text>

    <!-- 6th Grade Explanation -->
    <g transform="translate(0, 355)">
      <text x="0" y="20" class="font-body" font-size="15" fill="#E2E8F0">When you read books or look at a screen, your eyes work hard.</text>
      <text x="0" y="44" class="font-body" font-size="15" fill="#E2E8F0">PocketGull was drawn with friendly shapes and open spaces so</text>
      <text x="0" y="68" class="font-body" font-size="15" fill="#E2E8F0">reading feels like a gentle breeze. Safe, clear, and fun for all!</text>

      <line x1="0" y1="95" x2="570" y2="95" stroke="#334155" stroke-width="0.8"/>
      <text x="0" y="125" class="font-braille" font-size="13" fill="#38BDF8">$braillePocketgull — $brailleKindness</text>
      <text x="570" y="125" class="font-mono" font-size="11" fill="#64748B" text-anchor="end">COPPA SAFE • FAMILY FRIENDLY</text>
    </g>
  </g>
</svg>''';
  await renderSvgToPng(twSvg, 'social_twitter_card', 1200, 675);

  // --------------------------------------------------------------------------
  // FORMAT 3: Instagram Square (1080 x 1080 px, 1:1 ratio)
  // --------------------------------------------------------------------------
  print('\n  [4/6] Building Instagram Square Card (1080 x 1080 px)...');
  final igSquareSvg = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>$svgStyles</style>
    <linearGradient id="igSqBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#080C14"/>
      <stop offset="50%" stop-color="#0E1626"/>
      <stop offset="100%" stop-color="#05080E"/>
    </linearGradient>
    <clipPath id="igImgClip"><rect width="960" height="520" rx="14"/></clipPath>
  </defs>
  <rect width="1080" height="1080" fill="url(#igSqBg)"/>

  <!-- Braille Top Frame -->
  <rect x="60" y="30" width="960" height="26" rx="6" fill="#0A0F1D" stroke="#1E293B" stroke-width="0.8"/>
  <text x="540" y="48" class="font-braille" font-size="13" fill="#38BDF8" text-anchor="middle">$braillePocketgull $brailleSimple</text>

  <!-- Header -->
  <g transform="translate(60, 75)">
    <text x="0" y="30" class="font-title" font-size="34" fill="#F8FAFC">PocketGull</text>
    <circle cx="210" cy="22" r="6" fill="#F59E0B"/>
    <text x="228" y="28" class="font-mono" font-size="13" fill="#94A3B8" font-weight="bold">DESIGN THAT CARES // DIETER RAMS PRINCIPLES</text>
    <text x="960" y="28" class="font-mono" font-size="12" fill="#2DD4BF" text-anchor="end">COPPA SAFE</text>
    <line x1="0" y1="45" x2="960" y2="45" stroke="#334155" stroke-width="1"/>
  </g>

  <!-- Braun Device Photo Plate -->
  <g transform="translate(60, 140)">
    <image href="$dev16Uri" x="0" y="0" width="960" height="520" preserveAspectRatio="xMidYMid slice" clip-path="url(#igImgClip)"/>
    <rect width="960" height="520" rx="14" fill="none" stroke="#2DD4BF" stroke-width="1.5" stroke-opacity="0.5"/>
    <rect x="20" y="470" width="920" height="34" rx="6" fill="#030712" fill-opacity="0.85"/>
    <text x="36" y="492" class="font-mono" font-size="12" fill="#2DD4BF" font-weight="bold">HONEST MATERIALS • PAPER SCREEN • AMBER DIAL • MINIMAL DESIGN</text>
    <text x="924" y="492" class="font-mono" font-size="11" fill="#94A3B8" text-anchor="end">WENIGER, ABER BESSER</text>
  </g>

  <!-- Bottom Plain-Language Guide (6th Grade Reading Level) -->
  <g transform="translate(60, 690)">
    <!-- Card 1: Honest Design -->
    <rect x="0" y="0" width="465" height="155" rx="10" fill="#0B132B" stroke="#334155" stroke-width="1"/>
    <text x="20" y="32" class="font-mono" font-size="12" fill="#F59E0B" font-weight="bold">01. KEEP IT HONEST &amp; SIMPLE</text>
    <text x="20" y="65" class="font-body" font-size="15" fill="#E2E8F0">Good design doesn't try to fool anyone.</text>
    <text x="20" y="90" class="font-body" font-size="15" fill="#E2E8F0">It is calm, useful, and friendly to hold.</text>
    <text x="20" y="125" class="font-mono" font-size="11" fill="#38BDF8">Dieter Rams: "Less, but better."</text>

    <!-- Card 2: Letters for Tired Eyes -->
    <rect x="495" y="0" width="465" height="155" rx="10" fill="#0B132B" stroke="#334155" stroke-width="1"/>
    <text x="515" y="32" class="font-mono" font-size="12" fill="#2DD4BF" font-weight="bold">02. REST FOR TIRED EYES</text>
    <text x="515" y="65" class="font-body" font-size="15" fill="#E2E8F0">Every letter has space to breathe so</text>
    <text x="515" y="90" class="font-body" font-size="15" fill="#E2E8F0">words never look crowded or blurry.</text>
    <text x="515" y="125" class="font-mono" font-size="11" fill="#2DD4BF">Louise Sloan: "Clear 5:1 view."</text>

    <!-- Educational Limerick Snippet -->
    <rect x="0" y="175" width="960" height="135" rx="10" fill="#060913" stroke="#1E293B" stroke-width="1"/>
    <text x="24" y="210" class="font-title" font-size="16" fill="#F8FAFC" font-style="italic">“He drew with kind ink to help everyone think, and soothe tired eyes from their woes!”</text>
    <text x="24" y="245" class="font-body" font-size="14" fill="#94A3B8">Made with care for schools, families, and clinics. 100% free under SIL Open Font License.</text>
    <text x="24" y="280" class="font-mono" font-size="11" fill="#64748B">pocketgull.app // geararts.dev // Family Friendly &amp; COPPA Safe</text>
    <text x="936" y="280" class="font-braille" font-size="13" fill="#38BDF8" text-anchor="end">$brailleSimple</text>
  </g>

  <!-- Bottom Braille Ribbon -->
  <rect x="60" y="1025" width="960" height="26" rx="6" fill="#0A0F1D" stroke="#1E293B" stroke-width="0.8"/>
  <text x="540" y="1043" class="font-braille" font-size="13" fill="#38BDF8" text-anchor="middle">$brailleKindness — $brailleSimple</text>
</svg>''';
  await renderSvgToPng(igSquareSvg, 'social_instagram_square', 1080, 1080);

  // --------------------------------------------------------------------------
  // FORMAT 4: Instagram Portrait (1080 x 1350 px, 4:5 ratio)
  // --------------------------------------------------------------------------
  print('\n  [5/6] Building Instagram Portrait Story Card (1080 x 1350 px)...');
  final igPortraitSvg = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>$svgStyles</style>
    <linearGradient id="igPortBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#05070B"/>
      <stop offset="40%" stop-color="#0B101C"/>
      <stop offset="100%" stop-color="#04060A"/>
    </linearGradient>
    <clipPath id="igPortImgClip"><rect width="960" height="580" rx="16"/></clipPath>
  </defs>
  <rect width="1080" height="1350" fill="url(#igPortBg)"/>

  <!-- Top Braille Frame -->
  <rect x="60" y="30" width="960" height="28" rx="6" fill="#0A0F1D" stroke="#1E293B" stroke-width="0.8"/>
  <text x="540" y="49" class="font-braille" font-size="13" fill="#38BDF8" text-anchor="middle">$braillePocketgull $brailleSimple $brailleKindness</text>

  <!-- Header -->
  <g transform="translate(60, 80)">
    <text x="0" y="36" class="font-title" font-size="38" fill="#F8FAFC">PocketGull</text>
    <circle cx="240" cy="24" r="7" fill="#F59E0B"/>
    <text x="260" y="30" class="font-mono" font-size="14" fill="#94A3B8" font-weight="bold">THE GENTLE DESIGN CODEX</text>
    <text x="960" y="30" class="font-mono" font-size="12" fill="#2DD4BF" text-anchor="end">GRADE 6 READING LEVEL</text>
    <line x1="0" y1="52" x2="960" y2="52" stroke="#334155" stroke-width="1"/>
  </g>

  <!-- Device Plate -->
  <g transform="translate(60, 150)">
    <image href="$dev16Uri" x="0" y="0" width="960" height="580" preserveAspectRatio="xMidYMid slice" clip-path="url(#igPortImgClip)"/>
    <rect width="960" height="580" rx="16" fill="none" stroke="#2DD4BF" stroke-width="1.5" stroke-opacity="0.5"/>
    <rect x="20" y="525" width="920" height="38" rx="6" fill="#030712" fill-opacity="0.88"/>
    <text x="36" y="549" class="font-mono" font-size="12" fill="#2DD4BF" font-weight="bold">LESS, BUT BETTER // DESIGNED FOR HUMAN CARE // COPPA SAFE</text>
    <text x="924" y="549" class="font-mono" font-size="11" fill="#94A3B8" text-anchor="end">MODEL PG-01</text>
  </g>

  <!-- 3 Big Lessons in Good Design (6th Grade Reading Level) -->
  <g transform="translate(60, 765)">
    <text x="0" y="24" class="font-title" font-size="22" fill="#F8FAFC">Three Simple Rules for Healthy Reading:</text>

    <!-- Rule 1 -->
    <rect x="0" y="45" width="960" height="105" rx="10" fill="#0D1628" stroke="#334155" stroke-width="1"/>
    <text x="24" y="75" class="font-mono" font-size="13" fill="#2DD4BF" font-weight="bold">RULE 1: GIVE LETTERS ROOM TO BREATHE</text>
    <text x="24" y="105" class="font-body" font-size="15" fill="#E2E8F0">When letters stand too close, words get messy. Wide, open spacing keeps words easy to spot.</text>
    <text x="24" y="130" class="font-mono" font-size="11" fill="#64748B">Scientist Herman Bouma taught us how our eyes see edges.</text>

    <!-- Rule 2 -->
    <rect x="0" y="165" width="960" height="105" rx="10" fill="#0D1628" stroke="#334155" stroke-width="1"/>
    <text x="24" y="195" class="font-mono" font-size="13" fill="#F59E0B" font-weight="bold">RULE 2: NEVER CONFUSE A ZERO (0) AND AN 'O'</text>
    <text x="24" y="225" class="font-body" font-size="15" fill="#E2E8F0">A slashed zero (0) and a curved 'l' make sure doctors and nurses give the right medicine every time.</text>
    <text x="24" y="250" class="font-mono" font-size="11" fill="#64748B">ISMP Safety: Clear numbers protect patients and children.</text>

    <!-- Rule 3 -->
    <rect x="0" y="285" width="960" height="105" rx="10" fill="#0D1628" stroke="#334155" stroke-width="1"/>
    <text x="24" y="315" class="font-mono" font-size="13" fill="#38BDF8" font-weight="bold">RULE 3: KEEP IT SIMPLE AND KIND</text>
    <text x="24" y="345" class="font-body" font-size="15" fill="#E2E8F0">Dieter Rams said: "Less, but better." When we strip away junk, what remains is pure, honest help.</text>
    <text x="24" y="370" class="font-mono" font-size="11" fill="#64748B">Empathetic typography brings calm and peace.</text>
  </g>

  <!-- Limerick Quote Ribbon -->
  <g transform="translate(60, 1195)">
    <rect x="0" y="0" width="960" height="75" rx="10" fill="#070B14" stroke="#1E293B" stroke-width="1"/>
    <text x="30" y="32" class="font-title" font-size="16" fill="#F8FAFC" font-style="italic">“In a circle where empathy grows, and care like a mountain stream flows...”</text>
    <text x="30" y="58" class="font-mono" font-size="11" fill="#2DD4BF">FREE TO LEARN, READ, AND SHARE // SIL OPEN FONT LICENSE 1.1 // POCKETGULL.APP</text>
    <text x="930" y="58" class="font-mono" font-size="11" fill="#64748B" text-anchor="end">DESIGNED BY PHIL GEAR</text>
  </g>

  <!-- Bottom Braille Ribbon -->
  <rect x="60" y="1290" width="960" height="28" rx="6" fill="#0A0F1D" stroke="#1E293B" stroke-width="0.8"/>
  <text x="540" y="1309" class="font-braille" font-size="13" fill="#38BDF8" text-anchor="middle">$brailleSimple — $brailleKindness</text>
</svg>''';
  await renderSvgToPng(igPortraitSvg, 'social_instagram_portrait', 1080, 1350);

  // --------------------------------------------------------------------------
  // FORMAT 5: Large Archival Gallery Print (2400 x 3200 px, 300 DPI Archival)
  // --------------------------------------------------------------------------
  print('\n  [6/6] Building Master Gallery Exhibition Print (2400 x 3200 px, 300 DPI)...');
  // We construct a 1200 x 1600 vector and render at 2x (2400 x 3200) for pristine print sharpness!
  final printSvg = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="1600" viewBox="0 0 1200 1600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>$svgStyles</style>
    <linearGradient id="printBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F6F4EE"/>
      <stop offset="100%" stop-color="#EDE8DD"/>
    </linearGradient>
    <clipPath id="printDevClip"><rect width="520" height="420" rx="12"/></clipPath>
    <clipPath id="printQuillClip"><rect width="520" height="420" rx="12"/></clipPath>
  </defs>
  
  <!-- Museum Cardstock Canvas -->
  <rect width="1200" height="1600" fill="url(#printBg)"/>

  <!-- Outer Braille Perimeter Border -->
  <rect x="50" y="30" width="1100" height="26" rx="6" fill="#EDE8DC" stroke="#D1C7B7" stroke-width="0.8"/>
  <text x="600" y="48" class="font-braille" font-size="13" fill="#0369A1" text-anchor="middle">$braillePocketgull — $brailleSimple — $brailleKindness</text>

  <!-- Dieter Rams Exhibition Header -->
  <g transform="translate(50, 75)">
    <line x1="0" y1="0" x2="1100" y2="0" stroke="#CBD5E1" stroke-width="1"/>
    <text x="0" y="36" class="font-title" font-size="36" fill="#0F172A">POCKETGULL</text>
    <circle cx="280" cy="24" r="7" fill="#EA580C"/>
    <text x="300" y="30" class="font-mono" font-size="14" fill="#475569" font-weight="bold">SYSTEM 01 // HUMANIST SANS-SERIF &amp; TELEMETRY MONOSPACE</text>
    <text x="1100" y="30" class="font-mono" font-size="13" fill="#0D9488" text-anchor="end" font-weight="bold">WENIGER, ABER BESSER • 1000 UPM</text>
    <line x1="0" y1="50" x2="1100" y2="50" stroke="#CBD5E1" stroke-width="1"/>
  </g>

  <!-- Dual Plates: Left = Braun Device, Right = Synaptic Quilling -->
  <g transform="translate(50, 145)">
    <!-- Plate A: The Minimal Device -->
    <g transform="translate(0, 0)">
      <image href="$dev1Uri" x="0" y="0" width="535" height="430" preserveAspectRatio="xMidYMid slice" clip-path="url(#printDevClip)"/>
      <rect width="535" height="430" rx="12" fill="none" stroke="#CBD5E1" stroke-width="1.2"/>
      <rect x="15" y="380" width="505" height="34" rx="6" fill="#FFFFFF" fill-opacity="0.92" stroke="#E2E8F0" stroke-width="0.8"/>
      <text x="28" y="402" class="font-mono" font-size="11" fill="#EA580C" font-weight="bold">PLATE A: THE POCKET COMPANION // DIETER RAMS PRINCIPLES</text>
    </g>

    <!-- Plate B: The Synaptic Quilling Artwork -->
    <g transform="translate(565, 0)">
      <image href="$quillUri" x="0" y="0" width="535" height="430" preserveAspectRatio="xMidYMid slice" clip-path="url(#printQuillClip)"/>
      <rect width="535" height="430" rx="12" fill="none" stroke="#CBD5E1" stroke-width="1.2"/>
      <rect x="15" y="380" width="505" height="34" rx="6" fill="#FFFFFF" fill-opacity="0.92" stroke="#E2E8F0" stroke-width="0.8"/>
      <text x="28" y="402" class="font-mono" font-size="11" fill="#0D9488" font-weight="bold">PLATE B: CELLULAR QUILLED SKELETON // ORGANIC SCIENCE</text>
    </g>
  </g>

  <!-- Middle Section: The Gentle Healer Story (6th Grade Reading Level) -->
  <g transform="translate(50, 605)">
    <rect width="1100" height="235" rx="14" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
    
    <!-- Left Column: Limerick -->
    <g transform="translate(30, 25)">
      <text x="0" y="15" class="font-mono" font-size="12" fill="#EA580C" font-weight="bold">THE GENTLE HEALER // BY PHILLIP GEAR</text>
      <text x="0" y="50" class="font-title" font-size="18" fill="#334155" font-style="italic">In a circle where empathy grows,</text>
      <text x="0" y="80" class="font-title" font-size="18" fill="#334155" font-style="italic">And care like a mountain stream flows,</text>
      <text x="0" y="110" class="font-title" font-size="18" fill="#0369A1" font-style="italic">He drew with kind ink</text>
      <text x="0" y="140" class="font-title" font-size="18" fill="#0369A1" font-style="italic">To help everyone think,</text>
      <text x="0" y="175" class="font-title" font-size="19" fill="#0D9488" font-weight="bold">And soothe tired eyes from their woes!</text>
    </g>

    <!-- Vertical Divider -->
    <line x1="550" y1="20" x2="550" y2="215" stroke="#E2E8F0" stroke-width="1"/>

    <!-- Right Column: Plain Language Explanation for Kids and Families -->
    <g transform="translate(580, 25)">
      <text x="0" y="15" class="font-mono" font-size="12" fill="#0D9488" font-weight="bold">HOW GOOD DESIGN HELPS OUR EYES</text>
      <text x="0" y="45" class="font-body" font-size="15" fill="#1E293B">Did you know that reading can make your eyes tired if</text>
      <text x="0" y="70" class="font-body" font-size="15" fill="#1E293B">letters are too crowded? PocketGull was created with warm,</text>
      <text x="0" y="95" class="font-body" font-size="15" fill="#1E293B">open spaces so words look clean and bright.</text>
      <text x="0" y="130" class="font-body" font-size="15" fill="#1E293B">A slashed zero (0) and a curved 'l' make sure nobody ever</text>
      <text x="0" y="155" class="font-body" font-size="15" fill="#1E293B">mixes up medicine doses. It is 100% safe, gentle, and free!</text>
      <text x="0" y="185" class="font-mono" font-size="11" fill="#64748B">COPPA SAFE • FAMILY FRIENDLY • ZERO TRACKING</text>
    </g>
  </g>

  <!-- Lower Section: 10 Rules of Good Design (Simplified 6th Grade Version) -->
  <g transform="translate(50, 860)">
    <rect width="1100" height="235" rx="14" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
    <text x="30" y="32" class="font-mono" font-size="13" fill="#0F172A" font-weight="bold">DIETER RAMS: TEN RULES OF GOOD DESIGN (FOR YOUNG THINKERS &amp; CREATORS)</text>
    <line x1="20" y1="45" x2="1080" y2="45" stroke="#E2E8F0" stroke-width="1"/>

    <!-- Left 5 Rules -->
    <g transform="translate(30, 70)">
      <text x="0" y="0" class="font-body" font-size="14" fill="#334155"><tspan font-weight="bold" fill="#0D9488">1. Be Creative:</tspan> Invent new and helpful ways to solve problems.</text>
      <text x="0" y="28" class="font-body" font-size="14" fill="#334155"><tspan font-weight="bold" fill="#0D9488">2. Be Useful:</tspan> Make things that people actually need every day.</text>
      <text x="0" y="56" class="font-body" font-size="14" fill="#334155"><tspan font-weight="bold" fill="#0D9488">3. Be Beautiful:</tspan> Simple beauty makes us feel happy and calm.</text>
      <text x="0" y="84" class="font-body" font-size="14" fill="#334155"><tspan font-weight="bold" fill="#0D9488">4. Be Easy to Understand:</tspan> You should know how to use it right away.</text>
      <text x="0" y="112" class="font-body" font-size="14" fill="#334155"><tspan font-weight="bold" fill="#0D9488">5. Be Quiet:</tspan> Don't shout or brag. Keep it polite and gentle.</text>
    </g>

    <!-- Right 5 Rules -->
    <g transform="translate(580, 70)">
      <text x="0" y="0" class="font-body" font-size="14" fill="#334155"><tspan font-weight="bold" fill="#EA580C">6. Be Honest:</tspan> Never pretend to be something you are not.</text>
      <text x="0" y="28" class="font-body" font-size="14" fill="#334155"><tspan font-weight="bold" fill="#EA580C">7. Last for Years:</tspan> Good things don't get thrown away quickly.</text>
      <text x="0" y="56" class="font-body" font-size="14" fill="#334155"><tspan font-weight="bold" fill="#EA580C">8. Care for Details:</tspan> Every tiny line and curve matters.</text>
      <text x="0" y="84" class="font-body" font-size="14" fill="#334155"><tspan font-weight="bold" fill="#EA580C">9. Protect Nature:</tspan> Design with love for the Earth and trees.</text>
      <text x="0" y="112" class="font-body" font-size="14" fill="#334155"><tspan font-weight="bold" fill="#EA580C">10. Less, But Better:</tspan> Keep it simple. The simplest answer is best!</text>
    </g>
  </g>

  <!-- Complete Typographic Specimen Ribbon -->
  <g transform="translate(50, 1115)">
    <rect width="1100" height="235" rx="14" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
    <text x="30" y="32" class="font-mono" font-size="13" fill="#0F172A" font-weight="bold">POCKETGULL COMPLETE ALPHABET &amp; BRAILLE LEARNING CHART</text>
    <line x1="20" y1="45" x2="1080" y2="45" stroke="#E2E8F0" stroke-width="1"/>

    <text x="30" y="80" class="font-title" font-size="24" fill="#0F172A" letter-spacing="0.04em">Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz</text>
    
    <!-- Disambiguation Pills -->
    <g transform="translate(30, 105)">
      <rect x="0" y="0" width="240" height="34" rx="6" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="0.8"/>
      <text x="120" y="22" class="font-mono" font-size="13" fill="#0D9488" font-weight="bold" text-anchor="middle">0 vs O ∅  [Slashed Zero]</text>

      <rect x="260" y="0" width="340" height="34" rx="6" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="0.8"/>
      <text x="430" y="22" class="font-mono" font-size="13" fill="#0369A1" font-weight="bold" text-anchor="middle">1 vs l vs I  [Curved Foot &amp; Serif]</text>

      <rect x="620" y="0" width="200" height="34" rx="6" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="0.8"/>
      <text x="720" y="22" class="font-mono" font-size="13" fill="#EA580C" font-weight="bold" text-anchor="middle">Z vs 2  [Cross-bar]</text>

      <rect x="840" y="0" width="200" height="34" rx="6" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="0.8"/>
      <text x="940" y="22" class="font-mono" font-size="13" fill="#15803D" font-weight="bold" text-anchor="middle">Snellen 20/20 Safe</text>
    </g>

    <!-- Numerals & Punctuation -->
    <text x="30" y="175" class="font-mono" font-size="20" fill="#334155" letter-spacing="0.12em">0 1 2 3 4 5 6 7 8 9   . , : ; ! ? @ # \$ % &amp; * - + = ( ) [ ] { } / \\ | ~</text>

    <!-- Grade 1 Braille Alphabet for Kids -->
    <text x="30" y="212" class="font-braille" font-size="16" fill="#0284C7">⠁ ⠃ ⠉ ⠙ ⠑ ⠋ ⠛ ⠓ ⠊ ⠚ ⠅ ⠇ ⠍ ⠝ ⠕ ⠏ ⠟ ⠗ ⠎ ⠞ ⠥ ⠧ ⠺ ⠭ ⠽ ⠵</text>
    <text x="1070" y="212" class="font-mono" font-size="11" fill="#94A3B8" text-anchor="end">TACTILE BRAILLE A TO Z</text>
  </g>

  <!-- Bottom Colophon & Imprint -->
  <g transform="translate(50, 1370)">
    <line x1="0" y1="0" x2="1100" y2="0" stroke="#CBD5E1" stroke-width="1"/>
    <text x="0" y="35" class="font-mono" font-size="12" fill="#475569">DESIGNED BY PHILLIP GEAR // GEARARTS STUDIO // DEDICATED TO HEALTHY EYES AND KIND HEALING</text>
    <text x="1100" y="35" class="font-mono" font-size="12" fill="#0D9488" text-anchor="end" font-weight="bold">SIL OPEN FONT LICENSE 1.1 // POCKETGULL.APP // PHILGEAR.BIZ</text>
  </g>

  <!-- Bottom Braille Perimeter Frame -->
  <rect x="50" y="1545" width="1100" height="26" rx="6" fill="#EDE8DC" stroke="#D1C7B7" stroke-width="0.8"/>
  <text x="600" y="1563" class="font-braille" font-size="13" fill="#0369A1" text-anchor="middle">$braillePocketgull — $brailleSimple — $brailleKindness</text>
</svg>''';
  await renderSvgToPng(printSvg, 'print_gallery_exhibition', 2400, 3200);

  print('\n======================================================================');
  print('  ALL 5 SOCIAL CARDS & GALLERY PRINTS GENERATED SUCCESSFULLY!');
  print('  1. GitHub Social Preview:   public/images/social_github_preview.png (1280x640)');
  print('  2. Twitter/X Card:          public/images/social_twitter_card.png   (1200x675)');
  print('  3. Instagram Square:        public/images/social_instagram_square.png (1080x1080)');
  print('  4. Instagram Portrait Story:public/images/social_instagram_portrait.png (1080x1350)');
  print('  5. Gallery Exhibition Print:public/images/print_gallery_exhibition.png (2400x3200, 300 DPI)');
  print('======================================================================\n');
}
