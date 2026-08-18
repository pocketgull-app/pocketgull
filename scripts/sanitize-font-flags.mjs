import fs from 'fs';
import path from 'path';

function calculateTableChecksum(buf, offset, length) {
  let sum = 0;
  const nlongs = Math.floor((length + 3) / 4);
  for (let i = 0; i < nlongs; i++) {
    const pos = offset + i * 4;
    let val = 0;
    if (pos + 4 <= buf.length) {
      val = buf.readUInt32BE(pos);
    } else {
      for (let b = 0; b < 4; b++) {
        if (pos + b < buf.length) {
          val = (val << 8) | buf.readUInt8(pos + b);
        } else {
          val = (val << 8);
        }
      }
    }
    sum = (sum + val) >>> 0;
  }
  return sum;
}

function sanitizeFontFile(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    const tag = buf.subarray(0, 4).toString('ascii');
    const hex = buf.subarray(0, 4).toString('hex');
    
    // Check if TTF / OTF
    if (hex !== '00010000' && tag !== 'true' && tag !== 'OTTO') {
      return;
    }

    const numTables = buf.readUInt16BE(4);
    let glyfOffset = 0;
    let glyfLength = 0;
    let locaOffset = 0;
    let locaLength = 0;
    let headOffset = 0;
    let maxpOffset = 0;
    let glyfTableRecordOffset = 0;

    for (let i = 0; i < numTables; i++) {
      const recOffset = 12 + i * 16;
      const tableTag = buf.subarray(recOffset, recOffset + 4).toString('ascii');
      const offset = buf.readUInt32BE(recOffset + 8);
      const length = buf.readUInt32BE(recOffset + 12);
      if (tableTag === 'glyf') {
        glyfOffset = offset;
        glyfLength = length;
        glyfTableRecordOffset = recOffset;
      }
      if (tableTag === 'loca') { locaOffset = offset; locaLength = length; }
      if (tableTag === 'head') { headOffset = offset; }
      if (tableTag === 'maxp') { maxpOffset = offset; }
    }

    if (glyfOffset > 0 && locaOffset > 0 && headOffset > 0 && maxpOffset > 0) {
      const indexToLocFormat = buf.readInt16BE(headOffset + 50);
      const numGlyphs = buf.readUInt16BE(maxpOffset + 4);
      let badFlagsFixed = 0;

      for (let g = 0; g < numGlyphs; g++) {
        let gOffset = 0;
        let nextOffset = 0;
        if (indexToLocFormat === 0) {
          gOffset = buf.readUInt16BE(locaOffset + g * 2) * 2;
          nextOffset = buf.readUInt16BE(locaOffset + (g + 1) * 2) * 2;
        } else {
          gOffset = buf.readUInt32BE(locaOffset + g * 4);
          nextOffset = buf.readUInt32BE(locaOffset + (g + 1) * 4);
        }

        if (nextOffset > gOffset) {
          const glyphDataOffset = glyfOffset + gOffset;
          const numberOfContours = buf.readInt16BE(glyphDataOffset);
          if (numberOfContours > 0) {
            // Simple glyph
            const endPtsOfContours = [];
            for (let c = 0; c < numberOfContours; c++) {
              endPtsOfContours.push(buf.readUInt16BE(glyphDataOffset + 10 + c * 2));
            }
            const lastPoint = endPtsOfContours[endPtsOfContours.length - 1];
            const numPoints = lastPoint + 1;
            const instructionLength = buf.readUInt16BE(glyphDataOffset + 10 + numberOfContours * 2);
            const flagsOffset = glyphDataOffset + 10 + numberOfContours * 2 + 2 + instructionLength;

            let curFlagOffset = flagsOffset;
            let ptCount = 0;
            while (ptCount < numPoints && curFlagOffset < glyphDataOffset + (nextOffset - gOffset)) {
              const flag = buf.readUInt8(curFlagOffset);
              if (flag & 0x80) {
                // Clear reserved bit 7!
                const cleanFlag = flag & 0x7F;
                buf.writeUInt8(cleanFlag, curFlagOffset);
                badFlagsFixed++;
              }
              curFlagOffset++;
              if (flag & 0x08) {
                const repeatCount = buf.readUInt8(curFlagOffset);
                curFlagOffset++;
                ptCount += (1 + repeatCount);
              } else {
                ptCount++;
              }
            }
          }
        }
      }

      if (badFlagsFixed > 0) {
        console.log(`[FIXED] ${filePath}: Sanitized ${badFlagsFixed} reserved bit-7 glyph flags.`);

        // Recompute 'glyf' checksum
        const newGlyfChecksum = calculateTableChecksum(buf, glyfOffset, glyfLength);
        buf.writeUInt32BE(newGlyfChecksum, glyfTableRecordOffset + 4);

        // Recompute entire font checksum for head.checkSumAdjustment
        // 1. Zero out head.checkSumAdjustment (offset headOffset + 8)
        buf.writeUInt32BE(0, headOffset + 8);
        // 2. Compute full font checksum
        const fontChecksum = calculateTableChecksum(buf, 0, buf.length);
        // 3. checkSumAdjustment = 0xB1B0AFBA - fontChecksum
        const checkSumAdjustment = (0xB1B0AFBA - fontChecksum) >>> 0;
        buf.writeUInt32BE(checkSumAdjustment, headOffset + 8);

        fs.writeFileSync(filePath, buf);
        console.log(`  Updated table checksums and head.checkSumAdjustment (0x${checkSumAdjustment.toString(16)})`);
      }
    }
  } catch (err) {
    console.error(`Error sanitizing ${filePath}:`, err.message);
  }
}

function scanAndSanitize(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanAndSanitize(fullPath);
    } else if (entry.name.endsWith('.ttf') || entry.name.endsWith('.otf')) {
      sanitizeFontFile(fullPath);
    }
  }
}

scanAndSanitize('./public');
scanAndSanitize('./public/brand');
scanAndSanitize('./docs');
console.log('Sanitization scan completed.');
