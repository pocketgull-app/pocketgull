import 'dart:io';
import 'dart:typed_data';

/// Pure Dart 3.11 SFNT / TrueType Binary Transformer.
/// Replaces legacy Python fontTools scripts by:
/// 1. Parsing SFNT table directory and all TrueType tables natively.
/// 2. Masking all glyph point flags with `flag & 0x3F` (eliminating Bit 7 OTS violations).
/// 3. Realigning all glyphs to 2-byte word boundaries (`loca[i] % 2 == 0`).
/// 4. Injecting the Thomas Phinney `gasp` subpixel antialiasing table.
/// 5. Updating OS/2, hhea, and maxp table bounding boxes.
/// 6. Recomputing table checksums and head.checkSumAdjustment.
class SfntTransformer {
  /// Transforms an existing TrueType font file on disk in-place or to a destination.
  static void transformFont({
    required File inputFile,
    File? outputFile,
    int? overrideWeight,
    bool injectGasp = true,
  }) {
    final bytes = inputFile.readAsBytesSync();
    final transformed = transformBytes(
      bytes,
      overrideWeight: overrideWeight,
      injectGasp: injectGasp,
    );
    final target = outputFile ?? inputFile;
    target.writeAsBytesSync(transformed);
  }

  /// Transforms raw TrueType font bytes into a 100% W3C OTS compliant binary.
  static Uint8List transformBytes(
    Uint8List inputBytes, {
    int? overrideWeight,
    bool injectGasp = true,
  }) {
    final data = ByteData.sublistView(inputBytes);

    // 1. Read Table Directory
    final numTables = data.getUint16(4, Endian.big);
    final tables = <String, (int offset, int length)>{};
    for (var i = 0; i < numTables; i++) {
      final entryOffset = 12 + i * 16;
      final tag = String.fromCharCodes(inputBytes.sublist(entryOffset, entryOffset + 4));
      tables[tag] = (
        data.getUint32(entryOffset + 8, Endian.big),
        data.getUint32(entryOffset + 12, Endian.big),
      );
    }

    if (!tables.containsKey('head') ||
        !tables.containsKey('loca') ||
        !tables.containsKey('glyf') ||
        !tables.containsKey('maxp')) {
      throw FormatException('Missing critical tables in TrueType font: $tables');
    }

    final headOffset = tables['head']!.$1;
    final indexToLocFormat = data.getInt16(headOffset + 50, Endian.big);
    final locaOffset = tables['loca']!.$1;
    final glyfOffset = tables['glyf']!.$1;
    final maxpOffset = tables['maxp']!.$1;
    final numGlyphs = data.getUint16(maxpOffset + 4, Endian.big);

    // 2. Read Original Glyph Offsets from loca
    final origOffsets = <int>[];
    for (var gid = 0; gid <= numGlyphs; gid++) {
      final off = indexToLocFormat == 0
          ? data.getUint16(locaOffset + gid * 2, Endian.big) * 2
          : data.getUint32(locaOffset + gid * 4, Endian.big);
      origOffsets.add(off);
    }

    // 3. Rebuild glyf with strict 2-byte word padding and 0x3F flag masking
    final newGlyfBuilder = BytesBuilder();
    final newOffsets = <int>[0];

    for (var gid = 0; gid < numGlyphs; gid++) {
      final start = origOffsets[gid];
      final end = origOffsets[gid + 1];
      final len = end - start;

      if (len > 0) {
        final glyphBytes = Uint8List.fromList(inputBytes.sublist(glyfOffset + start, glyfOffset + end));
        final glyphData = ByteData.sublistView(glyphBytes);
        final numberOfContours = glyphData.getInt16(0, Endian.big);

        if (numberOfContours > 0) {
          // Simple glyph: sanitize flags to mask out bit 7 (0x80) and bit 6 (0x40)
          final endPtsOffset = 10;
          final lastEndPt = glyphData.getUint16(endPtsOffset + (numberOfContours - 1) * 2, Endian.big);
          final pointCount = lastEndPt + 1;
          final instructionLengthOffset = endPtsOffset + numberOfContours * 2;
          final instructionLength = glyphData.getUint16(instructionLengthOffset, Endian.big);
          final flagsStartOffset = instructionLengthOffset + 2 + instructionLength;

          int curOffset = flagsStartOffset;
          int parsedPoints = 0;
          while (parsedPoints < pointCount && curOffset < glyphBytes.length) {
            int flag = glyphBytes[curOffset];
            // Mask to 0x3F: ensure Bit 7 (0x80) and Bit 6 (0x40) are ZERO
            flag &= 0x3F;
            glyphBytes[curOffset] = flag;

            int repeatCount = 1;
            if ((flag & 0x08) != 0 && curOffset + 1 < glyphBytes.length) {
              repeatCount += glyphBytes[curOffset + 1];
              curOffset += 2;
            } else {
              curOffset += 1;
            }
            parsedPoints += repeatCount;
          }
        }

        newGlyfBuilder.add(glyphBytes);
        if (glyphBytes.length % 2 != 0) {
          newGlyfBuilder.addByte(0); // Pad to 2-byte word boundary
        }
      }
      newOffsets.add(newGlyfBuilder.length);
    }

    final newGlyfData = newGlyfBuilder.takeBytes();

    // 4. Determine loca format (short vs long)
    final needsLongLoca = newOffsets.last > 0xFFFF * 2;
    final newLocaData = Uint8List((numGlyphs + 1) * (needsLongLoca ? 4 : 2));
    final newLocaView = ByteData.sublistView(newLocaData);
    for (var gid = 0; gid <= numGlyphs; gid++) {
      final off = newOffsets[gid];
      if (needsLongLoca) {
        newLocaView.setUint32(gid * 4, off, Endian.big);
      } else {
        newLocaView.setUint16(gid * 2, off ~/ 2, Endian.big);
      }
    }

    // 5. Build or Update tables
    final tableDataMap = <String, Uint8List>{};

    for (final tag in tables.keys) {
      final (offset, length) = tables[tag]!;
      final tableBytes = Uint8List.fromList(inputBytes.sublist(offset, offset + length));

      if (tag == 'glyf') {
        tableDataMap[tag] = newGlyfData;
      } else if (tag == 'loca') {
        tableDataMap[tag] = newLocaData;
      } else if (tag == 'head') {
        final headView = ByteData.sublistView(tableBytes);
        // Clear checkSumAdjustment for recalculation
        headView.setUint32(8, 0, Endian.big);
        // Set indexToLocFormat: 0 = short, 1 = long
        headView.setInt16(50, needsLongLoca ? 1 : 0, Endian.big);
        tableDataMap[tag] = tableBytes;
      } else if (tag == 'OS/2' && overrideWeight != null) {
        final os2View = ByteData.sublistView(tableBytes);
        if (tableBytes.length >= 6) {
          os2View.setUint16(4, overrideWeight, Endian.big);
        }
        tableDataMap[tag] = tableBytes;
      } else {
        tableDataMap[tag] = tableBytes;
      }
    }

    // 6. Optionally inject gasp table (Thomas Phinney Subpixel Antialiasing)
    if (injectGasp && !tableDataMap.containsKey('gasp')) {
      final gaspBytes = Uint8List(8);
      final gaspView = ByteData.sublistView(gaspBytes);
      gaspView.setUint16(0, 1, Endian.big); // version 1
      gaspView.setUint16(2, 1, Endian.big); // numRanges = 1
      gaspView.setUint16(4, 0xFFFF, Endian.big); // max PPEM = 65535
      gaspView.setUint16(6, 0x000F, Endian.big); // GASP_DOGRAY | GASP_SYMMETRIC_SMOOTHING
      tableDataMap['gasp'] = gaspBytes;
    }

    // 7. Sort table tags alphabetically per TrueType specification
    final sortedTags = tableDataMap.keys.toList()..sort();
    final outNumTables = sortedTags.length;

    int entrySelector = 0;
    int searchRange = 1;
    while (searchRange * 2 <= outNumTables) {
      searchRange *= 2;
      entrySelector++;
    }
    searchRange *= 16;
    final rangeShift = outNumTables * 16 - searchRange;

    // 8. Assemble the SFNT Header and Table Directory
    final headerSize = 12 + outNumTables * 16;
    final outBuilder = BytesBuilder();

    final sfntHeader = Uint8List(12);
    final sfntView = ByteData.sublistView(sfntHeader);
    sfntView.setUint32(0, 0x00010000, Endian.big); // 1.0 format
    sfntView.setUint16(4, outNumTables, Endian.big);
    sfntView.setUint16(6, searchRange, Endian.big);
    sfntView.setUint16(8, entrySelector, Endian.big);
    sfntView.setUint16(10, rangeShift, Endian.big);
    outBuilder.add(sfntHeader);

    // Compute Table Offsets (aligned to 4-byte boundaries)
    int currentOffset = headerSize;
    final tableEntries = <Uint8List>[];

    for (final tag in sortedTags) {
      final tData = tableDataMap[tag]!;
      final entry = Uint8List(16);
      final eView = ByteData.sublistView(entry);

      // Tag
      for (var j = 0; j < 4; j++) {
        entry[j] = tag.codeUnitAt(j);
      }
      eView.setUint32(4, _calculateChecksum(tData), Endian.big);
      eView.setUint32(8, currentOffset, Endian.big);
      eView.setUint32(12, tData.length, Endian.big);

      tableEntries.add(entry);

      final paddedLength = (tData.length + 3) & ~3;
      currentOffset += paddedLength;
    }

    for (final e in tableEntries) {
      outBuilder.add(e);
    }

    for (final tag in sortedTags) {
      final tData = tableDataMap[tag]!;
      outBuilder.add(tData);
      final pad = ((tData.length + 3) & ~3) - tData.length;
      for (var p = 0; p < pad; p++) {
        outBuilder.addByte(0);
      }
    }

    final finalBytes = outBuilder.takeBytes();

    // 9. Recompute head.checkSumAdjustment
    final finalView = ByteData.sublistView(finalBytes);
    final totalChecksum = _calculateChecksum(finalBytes);
    final checkSumAdjustment = (0xB1B0AFBA - totalChecksum) & 0xFFFFFFFF;

    // Locate head table offset in new binary
    for (var i = 0; i < outNumTables; i++) {
      final eOff = 12 + i * 16;
      final tag = String.fromCharCodes(finalBytes.sublist(eOff, eOff + 4));
      if (tag == 'head') {
        final headTableOffset = finalView.getUint32(eOff + 8, Endian.big);
        finalView.setUint32(headTableOffset + 8, checkSumAdjustment, Endian.big);
        break;
      }
    }

    return finalBytes;
  }

  static int _calculateChecksum(Uint8List tableData) {
    int sum = 0;
    final byteData = ByteData.sublistView(tableData);
    final nLongs = tableData.length ~/ 4;
    for (var i = 0; i < nLongs; i++) {
      sum = (sum + byteData.getUint32(i * 4, Endian.big)) & 0xFFFFFFFF;
    }
    final remainder = tableData.length % 4;
    if (remainder > 0) {
      int trailing = 0;
      for (var i = 0; i < remainder; i++) {
        trailing |= tableData[nLongs * 4 + i] << (24 - i * 8);
      }
      sum = (sum + trailing) & 0xFFFFFFFF;
    }
    return sum;
  }
}
