import 'dart:io';
import 'dart:typed_data';

/// Pure Dart 3.11 Glyph & Font Inspector.
/// Reads TrueType binary tables (`head`, `maxp`, `loca`, `glyf`, `cmap`, `hmtx`),
/// extracts coordinates and flags, detects W3C OTS violations, and exports visual SVG proofs.
class GlyphInspector {
  final Uint8List bytes;
  final ByteData data;

  final Map<String, (int offset, int length)> tables = {};
  bool isLongLoca = false;
  int numGlyphs = 0;
  final List<int> loca = [];
  final Map<int, int> unicodeToGid = {};
  final Map<int, (int adv, int lsb)> hmtx = {};

  GlyphInspector(this.bytes) : data = ByteData.sublistView(bytes) {
    _parseSfntDirectory();
    _parseHead();
    _parseMaxp();
    _parseLoca();
    _parseCmap();
    _parseHmtx();
  }

  static GlyphInspector fromFile(File file) {
    return GlyphInspector(file.readAsBytesSync());
  }

  void _parseSfntDirectory() {
    final numTables = data.getUint16(4);
    int offset = 12;
    for (int i = 0; i < numTables; i++) {
      final tag = String.fromCharCodes(bytes.sublist(offset, offset + 4));
      final tableOffset = data.getUint32(offset + 8);
      final tableLength = data.getUint32(offset + 12);
      tables[tag] = (tableOffset, tableLength);
      offset += 16;
    }
  }

  void _parseHead() {
    final head = tables['head'];
    if (head != null) {
      final indexToLocFormat = data.getInt16(head.$1 + 50);
      isLongLoca = indexToLocFormat == 1;
    }
  }

  void _parseMaxp() {
    final maxp = tables['maxp'];
    if (maxp != null) {
      numGlyphs = data.getUint16(maxp.$1 + 4);
    }
  }

  void _parseLoca() {
    final locaEntry = tables['loca'];
    if (locaEntry == null) return;
    final (offset, _) = locaEntry;

    loca.clear();
    if (isLongLoca) {
      for (int i = 0; i <= numGlyphs; i++) {
        loca.add(data.getUint32(offset + i * 4));
      }
    } else {
      for (int i = 0; i <= numGlyphs; i++) {
        loca.add(data.getUint16(offset + i * 2) * 2);
      }
    }
  }

  void _parseCmap() {
    final cmapEntry = tables['cmap'];
    if (cmapEntry == null) return;
    final (cmapOffset, _) = cmapEntry;
    final numSubtables = data.getUint16(cmapOffset + 2);

    for (int i = 0; i < numSubtables; i++) {
      final subOffset = cmapOffset + data.getUint32(cmapOffset + 8 + i * 8);
      final format = data.getUint16(subOffset);

      if (format == 4) {
        final segCountX2 = data.getUint16(subOffset + 6);
        final segCount = segCountX2 ~/ 2;
        final endCodesOffset = subOffset + 14;
        final startCodesOffset = endCodesOffset + segCountX2 + 2;
        final idDeltaOffset = startCodesOffset + segCountX2;
        final idRangeOffset = idDeltaOffset + segCountX2;

        for (int s = 0; s < segCount; s++) {
          final end = data.getUint16(endCodesOffset + s * 2);
          final start = data.getUint16(startCodesOffset + s * 2);
          final idDelta = data.getInt16(idDeltaOffset + s * 2);
          final rangeOffset = data.getUint16(idRangeOffset + s * 2);

          if (start == 0xFFFF) break;

          for (int c = start; c <= end; c++) {
            if (rangeOffset == 0) {
              final gid = (c + idDelta) & 0xFFFF;
              if (gid != 0) unicodeToGid[c] = gid;
            } else {
              final glyphOffset = idRangeOffset + s * 2 + rangeOffset + (c - start) * 2;
              if (glyphOffset + 2 <= bytes.length) {
                final rawGid = data.getUint16(glyphOffset);
                if (rawGid != 0) {
                  final gid = (rawGid + idDelta) & 0xFFFF;
                  if (gid != 0) unicodeToGid[c] = gid;
                }
              }
            }
          }
        }
        break; // Format 4 parsed
      }
    }
  }

  void _parseHmtx() {
    final hmtxEntry = tables['hmtx'];
    final hheaEntry = tables['hhea'];
    if (hmtxEntry == null || hheaEntry == null) return;

    final numOfLongHorMetrics = data.getUint16(hheaEntry.$1 + 34);
    final (hmtxOffset, _) = hmtxEntry;

    int lastAdv = 500;
    for (int i = 0; i < numGlyphs; i++) {
      if (i < numOfLongHorMetrics) {
        final adv = data.getUint16(hmtxOffset + i * 4);
        final lsb = data.getInt16(hmtxOffset + i * 4 + 2);
        hmtx[i] = (adv, lsb);
        lastAdv = adv;
      } else {
        final lsbOffset = hmtxOffset + numOfLongHorMetrics * 4 + (i - numOfLongHorMetrics) * 2;
        final lsb = data.getInt16(lsbOffset);
        hmtx[i] = (lastAdv, lsb);
      }
    }
  }

  /// Extracts coordinates, flags, and bounds for a given glyph ID.
  Map<String, dynamic> getGlyphData(int gid) {
    if (gid >= loca.length - 1) return {'empty': true};
    final glyfEntry = tables['glyf'];
    if (glyfEntry == null) return {'empty': true};

    final start = loca[gid];
    final end = loca[gid + 1];
    final length = end - start;
    if (length == 0) return {'empty': true, 'adv': hmtx[gid]?.$1 ?? 500};

    final glyfOffset = glyfEntry.$1 + start;
    final numContours = data.getInt16(glyfOffset);
    final xMin = data.getInt16(glyfOffset + 2);
    final yMin = data.getInt16(glyfOffset + 4);
    final xMax = data.getInt16(glyfOffset + 6);
    final yMax = data.getInt16(glyfOffset + 8);

    final adv = hmtx[gid]?.$1 ?? (xMax - xMin + 90);
    final lsb = hmtx[gid]?.$2 ?? xMin;

    if (numContours <= 0) {
      return {
        'composite': true,
        'numContours': numContours,
        'bounds': [xMin, yMin, xMax, yMax],
        'adv': adv,
        'lsb': lsb,
      };
    }

    final endPts = <int>[];
    for (int i = 0; i < numContours; i++) {
      endPts.add(data.getUint16(glyfOffset + 10 + i * 2));
    }
    final numPoints = endPts.last + 1;
    final instLength = data.getUint16(glyfOffset + 10 + numContours * 2);
    int p = glyfOffset + 12 + numContours * 2 + instLength;

    // Read flags
    final flags = <int>[];
    int ptIdx = 0;
    while (ptIdx < numPoints) {
      final flag = bytes[p++];
      flags.add(flag);
      ptIdx++;
      if ((flag & 0x08) != 0) {
        final repeat = bytes[p++];
        for (int r = 0; r < repeat; r++) {
          flags.add(flag);
          ptIdx++;
        }
      }
    }

    // Read X coords
    final xCoords = <int>[];
    int curX = 0;
    for (int i = 0; i < numPoints; i++) {
      final flag = flags[i];
      if ((flag & 0x02) != 0) {
        final b = bytes[p++];
        curX += (flag & 0x10) != 0 ? b : -b;
      } else if ((flag & 0x10) == 0) {
        curX += data.getInt16(p);
        p += 2;
      }
      xCoords.add(curX);
    }

    // Read Y coords
    final yCoords = <int>[];
    int curY = 0;
    for (int i = 0; i < numPoints; i++) {
      final flag = flags[i];
      if ((flag & 0x04) != 0) {
        final b = bytes[p++];
        curY += (flag & 0x20) != 0 ? b : -b;
      } else if ((flag & 0x20) == 0) {
        curY += data.getInt16(p);
        p += 2;
      }
      yCoords.add(curY);
    }

    return {
      'empty': false,
      'composite': false,
      'numContours': numContours,
      'bounds': [xMin, yMin, xMax, yMax],
      'adv': adv,
      'lsb': lsb,
      'endPts': endPts,
      'flags': flags,
      'xs': xCoords,
      'ys': yCoords,
      'badFlags': flags.where((f) => (f & 0x80) != 0).length,
    };
  }

  /// Converts a glyph's TrueType contours to an SVG path `d` string.
  String toSvgPath(int gid) {
    final g = getGlyphData(gid);
    if (g['empty'] == true || g['composite'] == true) return '';

    final endPts = g['endPts'] as List<int>;
    final flags = g['flags'] as List<int>;
    final xs = g['xs'] as List<int>;
    final ys = g['ys'] as List<int>;

    final sb = StringBuffer();
    int startIdx = 0;

    for (final endIdx in endPts) {
      if (startIdx > endIdx) continue;
      final contourLen = endIdx - startIdx + 1;
      final cXs = xs.sublist(startIdx, endIdx + 1);
      final cYs = ys.sublist(startIdx, endIdx + 1);
      final cFlags = flags.sublist(startIdx, endIdx + 1);

      // Start at first point
      sb.write('M${cXs[0]},${cYs[0]} ');
      for (int i = 1; i < contourLen; i++) {
        final onCurve = (cFlags[i] & 0x01) != 0;
        if (onCurve) {
          sb.write('L${cXs[i]},${cYs[i]} ');
        } else {
          // Quadratic Bézier off-curve
          final nextIdx = (i + 1) % contourLen;
          final nextOnCurve = (cFlags[nextIdx] & 0x01) != 0;
          if (nextOnCurve) {
            sb.write('Q${cXs[i]},${cYs[i]} ${cXs[nextIdx]},${cYs[nextIdx]} ');
            i++;
          } else {
            // Implied on-curve midpoint between two off-curve points
            final midX = (cXs[i] + cXs[nextIdx]) / 2.0;
            final midY = (cYs[i] + cYs[nextIdx]) / 2.0;
            sb.write('Q${cXs[i]},${cYs[i]} $midX,$midY ');
          }
        }
      }
      sb.write('Z ');
      startIdx = endIdx + 1;
    }

    return sb.toString().trim();
  }

  /// Generates a visual SVG sheet in pure Dart for a sequence of characters.
  static String generateSvgSheet(File fontFile, String characters) {
    final inspector = GlyphInspector.fromFile(fontFile);
    final sb = StringBuffer();
    sb.writeln('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" style="background:#09090b">');
    sb.writeln('  <style>text { font-family: sans-serif; fill: #71717a; font-size: 14px; }</style>');

    final cols = 8;
    int col = 0;
    int row = 0;

    for (int i = 0; i < characters.length; i++) {
      final ch = characters[i];
      final code = ch.codeUnitAt(0);
      final gid = inspector.unicodeToGid[code];
      if (gid == null) continue;

      final d = inspector.toSvgPath(gid);
      final data = inspector.getGlyphData(gid);
      final bounds = data['bounds'] as List<int>? ?? [0, 0, 0, 0];
      final badFlags = data['badFlags'] ?? 0;

      final gx = 60 + col * 185;
      final gy = 180 + row * 220;

      // Card background
      sb.writeln('  <rect x="${gx - 10}" y="${gy - 150}" width="170" height="200" rx="8" fill="#121217" stroke="${badFlags > 0 ? '#ef4444' : '#272732'}"/>');
      
      // Glyph path (scale 0.15, invert Y)
      sb.writeln('  <g transform="translate($gx, $gy) scale(0.15, -0.15)">');
      sb.writeln('    <path d="$d" fill="${badFlags > 0 ? '#ef4444' : '#14b8a6'}"/>');
      sb.writeln('  </g>');

      // Label
      sb.writeln('  <text x="$gx" y="${gy + 35}">"$ch" U+${code.toRadixString(16).padLeft(4, '0').toUpperCase()}</text>');
      sb.writeln('  <text x="$gx" y="${gy + 52}">w:${bounds[2] - bounds[0]} ${badFlags > 0 ? '⚠️ BAD FLAG' : '✓'}</text>');

      col++;
      if (col >= cols) {
        col = 0;
        row++;
      }
    }

    sb.writeln('</svg>');
    return sb.toString();
  }
}
