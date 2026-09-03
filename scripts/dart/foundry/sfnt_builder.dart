import 'dart:typed_data';
import 'models.dart';

/// Pure Dart 3.11 SFNT / TrueType Binary Compiler.
/// Strictly enforces:
/// 1. 2-byte word alignment on every glyph entry in glyf and loca.
/// 2. Bit 7 masking (0x3F) on all point flags (Zero OTS violations).
/// 3. Accurate maxp and hhea bounds calculations.
/// 4. 0xB1B0AFBA head checksum adjustment.
class SfntBuilder {
  final int upm;
  final String familyName;
  final String subFamilyName;
  final int ascender;
  final int descender;
  final int lineGap;
  final List<GlyphRecord> glyphs = [];

  SfntBuilder({
    this.upm = 1000,
    required this.familyName,
    this.subFamilyName = 'Regular',
    this.ascender = 800,
    this.descender = -200,
    this.lineGap = 200,
  });

  void addGlyph(GlyphRecord glyph) {
    glyphs.add(glyph);
  }

  /// Encodes a single glyph into word-aligned TrueType glyf bytes.
  Uint8List _encodeSimpleGlyph(GlyphRecord glyph) {
    if (glyph.contours.isEmpty || glyph.contours.every((c) => c.isEmpty)) {
      return Uint8List(0); // Empty glyph has 0 length
    }

    final bbox = glyph.boundingBox;
    final numContours = glyph.contours.length;
    final totalPoints = glyph.totalPoints;

    final headerBytes = Uint8List(10 + numContours * 2 + 2); // 10 header + endPts + 0 instructions
    final headerView = ByteData.sublistView(headerBytes);

    headerView.setInt16(0, numContours, Endian.big);
    headerView.setInt16(2, bbox.$1, Endian.big); // xMin
    headerView.setInt16(4, bbox.$2, Endian.big); // yMin
    headerView.setInt16(6, bbox.$3, Endian.big); // xMax
    headerView.setInt16(8, bbox.$4, Endian.big); // yMax

    int ptCounter = 0;
    for (var c = 0; c < numContours; c++) {
      ptCounter += glyph.contours[c].length;
      headerView.setUint16(10 + c * 2, ptCounter - 1, Endian.big);
    }
    headerView.setUint16(10 + numContours * 2, 0, Endian.big); // instructionLength = 0

    // Encode flags and delta coordinates
    final allPoints = <GlyphPoint>[];
    for (final c in glyph.contours) {
      allPoints.addAll(c.points);
    }

    final flags = Uint8List(totalPoints);
    final xCoords = BytesBuilder();
    final yCoords = BytesBuilder();

    int prevX = 0;
    int prevY = 0;

    for (var i = 0; i < totalPoints; i++) {
      final pt = allPoints[i];
      int flag = pt.onCurve ? 0x01 : 0x00;

      final dx = pt.x - prevX;
      final dy = pt.y - prevY;

      // X coordinate encoding
      if (dx == 0) {
        flag |= 0x10; // Same X
      } else if (dx >= -255 && dx <= 255) {
        flag |= 0x02; // Short X
        if (dx > 0) flag |= 0x10; // Positive short
        xCoords.addByte(dx.abs());
      } else {
        // Signed 16-bit
        final b = ByteData(2)..setInt16(0, dx, Endian.big);
        xCoords.add(b.buffer.asUint8List());
      }

      // Y coordinate encoding
      if (dy == 0) {
        flag |= 0x20; // Same Y
      } else if (dy >= -255 && dy <= 255) {
        flag |= 0x04; // Short Y
        if (dy > 0) flag |= 0x20; // Positive short
        yCoords.addByte(dy.abs());
      } else {
        // Signed 16-bit
        final b = ByteData(2)..setInt16(0, dy, Endian.big);
        yCoords.add(b.buffer.asUint8List());
      }

      // Crucial Invariant: Mask flag to 0x3F (Bits 6 and 7 MUST BE ZERO!)
      flags[i] = flag & 0x3F;

      prevX = pt.x;
      prevY = pt.y;
    }

    final builder = BytesBuilder();
    builder.add(headerBytes);
    builder.add(flags);
    builder.add(xCoords.takeBytes());
    builder.add(yCoords.takeBytes());

    final rawBytes = builder.takeBytes();

    // Crucial Invariant: 2-Byte Word Alignment!
    if (rawBytes.length % 2 != 0) {
      final padded = Uint8List(rawBytes.length + 1);
      padded.setRange(0, rawBytes.length, rawBytes);
      padded[rawBytes.length] = 0; // 0x00 padding
      return padded;
    }
    return rawBytes;
  }

  /// Compiles the complete TrueType SFNT binary.
  Uint8List compile() {
    final numGlyphs = glyphs.length;
    final encodedGlyphs = <Uint8List>[];
    final locaOffsets = <int>[0];

    int currentGlyfOffset = 0;
    int maxPoints = 0;
    int maxContours = 0;
    int xMaxExtent = -32768;
    int minLsb = 32767;
    int minRsb = 32767;
    int maxAdvance = 0;

    for (var gid = 0; gid < numGlyphs; gid++) {
      final g = glyphs[gid];
      final gBytes = _encodeSimpleGlyph(g);
      encodedGlyphs.add(gBytes);

      currentGlyfOffset += gBytes.length;
      locaOffsets.add(currentGlyfOffset);

      final pts = g.totalPoints;
      final cnts = g.contours.length;
      if (pts > maxPoints) maxPoints = pts;
      if (cnts > maxContours) maxContours = cnts;

      final bbox = g.boundingBox;
      if (g.advanceWidth > maxAdvance) maxAdvance = g.advanceWidth;
      if (g.lsb < minLsb) minLsb = g.lsb;

      final rsb = g.advanceWidth - bbox.$3;
      if (rsb < minRsb) minRsb = rsb;

      final extent = g.lsb + (bbox.$3 - bbox.$1);
      if (extent > xMaxExtent) xMaxExtent = extent;
    }

    final glyfData = BytesBuilder();
    for (final b in encodedGlyphs) {
      glyfData.add(b);
    }
    final glyfTableData = glyfData.takeBytes();

    final needsLongLoca = locaOffsets.last > 0xFFFF * 2;
    final locaTableData = Uint8List((numGlyphs + 1) * (needsLongLoca ? 4 : 2));
    final locaView = ByteData.sublistView(locaTableData);
    for (var i = 0; i <= numGlyphs; i++) {
      if (needsLongLoca) {
        locaView.setUint32(i * 4, locaOffsets[i], Endian.big);
      } else {
        locaView.setUint16(i * 2, locaOffsets[i] ~/ 2, Endian.big);
      }
    }

    // 1. head Table
    final headData = Uint8List(54);
    final headView = ByteData.sublistView(headData);
    headView.setUint32(0, 0x00010000, Endian.big); // Version 1.0
    headView.setUint32(4, 0x00010000, Endian.big); // Font revision
    headView.setUint32(8, 0, Endian.big); // checkSumAdjustment (recomputed later)
    headView.setUint32(12, 0x5F0F3CF5, Endian.big); // magicNumber
    headView.setUint16(16, 0x0003, Endian.big); // flags (baseline at y=0, lsb at x=0)
    headView.setUint16(18, upm, Endian.big); // unitsPerEm
    headView.setInt16(36, -100, Endian.big); // xMin
    headView.setInt16(38, descender, Endian.big); // yMin
    headView.setInt16(40, maxAdvance, Endian.big); // xMax
    headView.setInt16(42, ascender, Endian.big); // yMax
    headView.setUint16(44, 0, Endian.big); // macStyle
    headView.setUint16(46, 8, Endian.big); // lowestRecPPEM
    headView.setInt16(48, 2, Endian.big); // fontDirectionHint
    headView.setInt16(50, needsLongLoca ? 1 : 0, Endian.big); // indexToLocFormat
    headView.setInt16(52, 0, Endian.big); // glyphDataFormat

    // 2. hhea Table
    final hheaData = Uint8List(36);
    final hheaView = ByteData.sublistView(hheaData);
    hheaView.setUint32(0, 0x00010000, Endian.big);
    hheaView.setInt16(4, ascender, Endian.big);
    hheaView.setInt16(6, descender, Endian.big);
    hheaView.setInt16(8, lineGap, Endian.big);
    hheaView.setUint16(10, maxAdvance, Endian.big);
    hheaView.setInt16(12, minLsb == 32767 ? 0 : minLsb, Endian.big);
    hheaView.setInt16(14, minRsb == 32767 ? 0 : minRsb, Endian.big);
    hheaView.setInt16(16, xMaxExtent == -32768 ? maxAdvance : xMaxExtent, Endian.big);
    hheaView.setInt16(18, 1, Endian.big); // caretSlopeRise
    hheaView.setInt16(20, 0, Endian.big); // caretSlopeRun
    hheaView.setInt16(22, 0, Endian.big); // caretOffset
    hheaView.setUint16(34, numGlyphs, Endian.big); // numberOfHMetrics

    // 3. maxp Table
    final maxpData = Uint8List(32);
    final maxpView = ByteData.sublistView(maxpData);
    maxpView.setUint32(0, 0x00010000, Endian.big);
    maxpView.setUint16(4, numGlyphs, Endian.big);
    maxpView.setUint16(6, maxPoints, Endian.big);
    maxpView.setUint16(8, maxContours, Endian.big);
    maxpView.setUint16(10, 0, Endian.big); // maxCompositePoints
    maxpView.setUint16(12, 0, Endian.big); // maxCompositeContours
    maxpView.setUint16(14, 2, Endian.big); // maxZones
    maxpView.setUint16(16, 0, Endian.big); // maxTwilightPoints
    maxpView.setUint16(18, 0, Endian.big); // maxStorage
    maxpView.setUint16(20, 0, Endian.big); // maxFunctionDefs
    maxpView.setUint16(22, 0, Endian.big); // maxInstructionDefs
    maxpView.setUint16(24, 0, Endian.big); // maxStackElements
    maxpView.setUint16(26, 0, Endian.big); // maxSizeOfInstructions
    maxpView.setUint16(28, 0, Endian.big); // maxComponentElements
    maxpView.setUint16(30, 0, Endian.big); // maxComponentDepth

    // 4. hmtx Table
    final hmtxData = Uint8List(numGlyphs * 4);
    final hmtxView = ByteData.sublistView(hmtxData);
    for (var gid = 0; gid < numGlyphs; gid++) {
      hmtxView.setUint16(gid * 4, glyphs[gid].advanceWidth, Endian.big);
      hmtxView.setInt16(gid * 4 + 2, glyphs[gid].lsb, Endian.big);
    }

    // 5. cmap Table (Format 4 - Unicode BMP)
    final cmapTableData = _buildCmapTable();

    // 6. OS/2 Table
    final os2TableData = _buildOs2Table(maxAdvance);

    // 7. post Table
    final postTableData = _buildPostTable();

    // Collect and assemble SFNT tables
    final tables = <String, Uint8List>{
      'OS/2': os2TableData,
      'cmap': cmapTableData,
      'glyf': glyfTableData,
      'head': headData,
      'hhea': hheaData,
      'hmtx': hmtxData,
      'loca': locaTableData,
      'maxp': maxpData,
      'post': postTableData,
    };

    final sortedTags = tables.keys.toList()..sort();
    final headerLength = 12 + sortedTags.length * 16;
    int currentOffset = headerLength;
    final tableRecords = <String, (int csum, int off, int len)>{};

    for (final tag in sortedTags) {
      final tData = tables[tag]!;
      final csum = SfntTable.computeChecksum(tData);
      tableRecords[tag] = (csum, currentOffset, tData.length);
      currentOffset += (tData.length + 3) & ~3; // 4-byte align tables
    }

    final outBytes = Uint8List(currentOffset);
    final outView = ByteData.sublistView(outBytes);

    outView.setUint32(0, 0x00010000, Endian.big); // TrueType scaler type
    outView.setUint16(4, sortedTags.length, Endian.big);
    int searchRange = 1;
    int entrySelector = 0;
    while (searchRange * 2 <= sortedTags.length) {
      searchRange *= 2;
      entrySelector++;
    }
    searchRange *= 16;
    outView.setUint16(6, searchRange, Endian.big);
    outView.setUint16(8, entrySelector, Endian.big);
    outView.setUint16(10, sortedTags.length * 16 - searchRange, Endian.big);

    for (var i = 0; i < sortedTags.length; i++) {
      final tag = sortedTags[i];
      final rec = tableRecords[tag]!;
      final rOff = 12 + i * 16;
      for (var j = 0; j < 4; j++) {
        outBytes[rOff + j] = tag.codeUnitAt(j);
      }
      outView.setUint32(rOff + 4, rec.$1, Endian.big);
      outView.setUint32(rOff + 8, rec.$2, Endian.big);
      outView.setUint32(rOff + 12, rec.$3, Endian.big);

      outBytes.setRange(rec.$2, rec.$2 + tables[tag]!.length, tables[tag]!);
    }

    // Compute font-wide checkSumAdjustment
    final fontChecksum = SfntTable.computeChecksum(outBytes);
    final checkSumAdjustment = (0xB1B0AFBA - fontChecksum) & 0xFFFFFFFF;
    final newHeadOffset = tableRecords['head']!.$2;
    outView.setUint32(newHeadOffset + 8, checkSumAdjustment, Endian.big);

    return outBytes;
  }

  Uint8List _buildCmapTable() {
    // Collect non-zero codepoints mapped to glyph IDs
    final mapEntries = <int, int>{};
    for (var gid = 0; gid < glyphs.length; gid++) {
      final cp = glyphs[gid].codePoint;
      if (cp > 0 && cp <= 0xFFFF) {
        mapEntries[cp] = gid;
      }
    }

    final sortedCodes = mapEntries.keys.toList()..sort();
    final segCount = sortedCodes.length + 1; // + 0xFFFF sentinel segment

    int searchRange = 1;
    int entrySelector = 0;
    while (searchRange * 2 <= segCount) {
      searchRange *= 2;
      entrySelector++;
    }
    searchRange *= 2;

    final subtableLen = 16 + segCount * 8;
    final totalLen = 4 + 8 + subtableLen; // cmap header (4) + 1 encoding rec (8) + subtable
    final bytes = Uint8List(totalLen);
    final view = ByteData.sublistView(bytes);

    // cmap header
    view.setUint16(0, 0, Endian.big); // version
    view.setUint16(2, 1, Endian.big); // numTables = 1

    // Encoding record (Platform 3: Windows, Encoding 1: Unicode BMP)
    view.setUint16(4, 3, Endian.big);
    view.setUint16(6, 1, Endian.big);
    view.setUint32(8, 12, Endian.big); // offset to subtable

    // Format 4 Subtable
    final stOff = 12;
    view.setUint16(stOff, 4, Endian.big); // format 4
    view.setUint16(stOff + 2, subtableLen, Endian.big);
    view.setUint16(stOff + 4, 0, Endian.big); // language 0
    view.setUint16(stOff + 6, segCount * 2, Endian.big);
    view.setUint16(stOff + 8, searchRange, Endian.big);
    view.setUint16(stOff + 10, entrySelector, Endian.big);
    view.setUint16(stOff + 12, segCount * 2 - searchRange, Endian.big);

    final endCodeOff = stOff + 14;
    final startCodeOff = endCodeOff + segCount * 2 + 2; // + 2 for reservedPad
    final idDeltaOff = startCodeOff + segCount * 2;
    final idRangeOff = idDeltaOff + segCount * 2;

    for (var s = 0; s < sortedCodes.length; s++) {
      final code = sortedCodes[s];
      final gid = mapEntries[code]!;
      view.setUint16(endCodeOff + s * 2, code, Endian.big);
      view.setUint16(startCodeOff + s * 2, code, Endian.big);
      view.setInt16(idDeltaOff + s * 2, (gid - code) & 0xFFFF, Endian.big);
      view.setUint16(idRangeOff + s * 2, 0, Endian.big);
    }

    // Final 0xFFFF sentinel segment
    final lastSeg = segCount - 1;
    view.setUint16(endCodeOff + lastSeg * 2, 0xFFFF, Endian.big);
    view.setUint16(startCodeOff + lastSeg * 2, 0xFFFF, Endian.big);
    view.setInt16(idDeltaOff + lastSeg * 2, 1, Endian.big);
    view.setUint16(idRangeOff + lastSeg * 2, 0, Endian.big);

    return bytes;
  }

  Uint8List _buildOs2Table(int maxAdvance) {
    final bytes = Uint8List(96);
    final view = ByteData.sublistView(bytes);
    view.setUint16(0, 4, Endian.big); // version 4
    view.setInt16(2, (maxAdvance * 0.55).round(), Endian.big); // xAvgCharWidth
    view.setUint16(4, 700, Endian.big); // usWeightClass
    view.setUint16(6, 5, Endian.big); // usWidthClass
    view.setUint16(8, 0, Endian.big); // fsType (0 = Installable embedding)
    view.setInt16(68, ascender, Endian.big); // sTypoAscender
    view.setInt16(70, descender, Endian.big); // sTypoDescender
    view.setInt16(72, lineGap, Endian.big); // sTypoLineGap
    view.setUint16(74, ascender, Endian.big); // usWinAscent
    view.setUint16(76, descender.abs(), Endian.big); // usWinDescent
    return bytes;
  }

  Uint8List _buildPostTable() {
    final bytes = Uint8List(32);
    final view = ByteData.sublistView(bytes);
    view.setUint32(0, 0x00030000, Endian.big); // Version 3.0 (no glyph names)
    return bytes;
  }
}
