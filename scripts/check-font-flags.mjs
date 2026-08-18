import fs from 'fs';
import path from 'path';

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name.endsWith('.ttf') || entry.name.endsWith('.woff2') || entry.name.endsWith('.woff')) {
      checkFont(fullPath);
    }
  }
}

function checkFont(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    const tag = buf.subarray(0, 4).toString('ascii');
    const hex = buf.subarray(0, 4).toString('hex');
    console.log(`[FILE] ${filePath} (${buf.length} bytes) Tag: ${tag} / 0x${hex}`);
    
    // If it's a TTF (0x00010000 or 'true' or 'OTTO')
    if (hex === '00010000' || tag === 'true' || tag === 'OTTO') {
      // Parse TTF tables
      const numTables = buf.readUInt16BE(4);
      let glyfOffset = 0;
      let glyfLength = 0;
      let locaOffset = 0;
      let locaLength = 0;
      let headOffset = 0;
      let maxpOffset = 0;

      for (let i = 0; i < numTables; i++) {
        const tableTag = buf.subarray(12 + i * 16, 16 + i * 16).toString('ascii');
        const offset = buf.readUInt32BE(20 + i * 16);
        const length = buf.readUInt32BE(24 + i * 16);
        if (tableTag === 'glyf') { glyfOffset = offset; glyfLength = length; }
        if (tableTag === 'loca') { locaOffset = offset; locaLength = length; }
        if (tableTag === 'head') { headOffset = offset; }
        if (tableTag === 'maxp') { maxpOffset = offset; }
      }

      if (glyfOffset > 0 && locaOffset > 0 && headOffset > 0 && maxpOffset > 0) {
        const indexToLocFormat = buf.readInt16BE(headOffset + 50);
        const numGlyphs = buf.readUInt16BE(maxpOffset + 4);
        console.log(`  numGlyphs: ${numGlyphs}, indexToLocFormat: ${indexToLocFormat}`);

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
              let flagIdx = 0;
              while (ptCount < numPoints && curFlagOffset < glyphDataOffset + (nextOffset - gOffset)) {
                const flag = buf.readUInt8(curFlagOffset);
                if (flag & 0x80) {
                  console.error(`  ❌ [BAD GLYPH FLAG] Glyph ${g}: flag ${flagIdx} = ${flag} (0x${flag.toString(16)}) has bit 7 set! in ${filePath}`);
                }
                curFlagOffset++;
                flagIdx++;
                if (flag & 0x08) { // Repeat flag
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
      }
    }
  } catch (err) {
    console.log(`  Error checking ${filePath}:`, err.message);
  }
}

scanDir('./public');
scanDir('./docs');
