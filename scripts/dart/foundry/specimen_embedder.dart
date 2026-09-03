import 'dart:convert';
import 'dart:io';

/// Pure Dart 3.11 Specimen Font Embedder.
/// Reads sanitized, word-aligned TrueType fonts and embeds them as
/// in-memory base64 data URIs into index.html for 100% offline, zero-network
/// specimen previewing under file:/// and HTTP.
class SpecimenEmbedder {
  static void embedFonts({
    required Directory typefaceDir,
    required File htmlFile,
  }) {
    if (!htmlFile.existsSync()) {
      throw FileSystemException('index.html not found', htmlFile.path);
    }

    final fontsToEmbed = [
      ('PocketGull Bold', 'PocketGull-Bold.ttf', '700 800', 'normal'),
      ('PocketGull', 'PocketGull-Bold.ttf', '700 800', 'normal'),
      ('PocketGull Fineliner', 'PocketGull-Fineliner.ttf', '400', 'normal'),
      ('PocketGull', 'PocketGull-Fineliner.ttf', '400', 'normal'),
      ('PocketGull Chiseltip', 'PocketGull-Chiseltip.ttf', '900', 'normal'),
      ('PocketGull', 'PocketGull-Chiseltip.ttf', '900', 'normal'),
      ('PocketGull Mono', 'PocketGullMono-Regular.ttf', '400 500', 'normal'),
      ('PocketGull Antigravity', 'PocketGull-Antigravity.ttf', '400', 'normal'),
    ];

    final cssBuffer = StringBuffer();
    cssBuffer.writeln('  <style id="embedded-typefaces">');
    cssBuffer.writeln('    /* 100% W3C OTS Sanitized In-Memory TrueType Fonts for file:/// Protocol Offline Loading */');

    for (final (family, filename, weight, style) in fontsToEmbed) {
      final fontFile = File('${typefaceDir.path}${Platform.pathSeparator}$filename');
      if (!fontFile.existsSync()) {
        stderr.writeln('  ⚠️ Font binary missing for embed: ${fontFile.path}');
        continue;
      }

      final bytes = fontFile.readAsBytesSync();
      final b64 = base64Encode(bytes);
      final sizeKb = (bytes.length / 1024).toStringAsFixed(1);
      print('  [EMBED] $filename ($sizeKb KB) -> font-family: "$family" ($weight)');

      cssBuffer.writeln('    @font-face {');
      cssBuffer.writeln('      font-family: \'$family\';');
      cssBuffer.writeln('      font-weight: $weight;');
      cssBuffer.writeln('      font-style: $style;');
      cssBuffer.writeln('      font-display: swap;');
      cssBuffer.writeln('      src: url(data:font/ttf;charset=utf-8;base64,$b64) format(\'truetype\');');
      cssBuffer.writeln('    }');
    }

    cssBuffer.writeln('  </style>');

    final htmlContent = htmlFile.readAsStringSync();
    final styleRegex = RegExp(r'  <style id="embedded-typefaces">[\s\S]*?<\/style>', multiLine: true);

    String updatedHtml;
    if (styleRegex.hasMatch(htmlContent)) {
      updatedHtml = htmlContent.replaceFirst(styleRegex, cssBuffer.toString().trimRight());
      print('  [OK] Replaced existing embedded-typefaces style block in index.html');
    } else {
      updatedHtml = htmlContent.replaceFirst('</head>', '${cssBuffer.toString()}\n</head>');
      print('  [OK] Injected new embedded-typefaces style block into <head>');
    }

    htmlFile.writeAsStringSync(updatedHtml);
    print('  [SUCCESS] Successfully embedded pristine TrueType fonts into ${htmlFile.path}\n');
  }
}
