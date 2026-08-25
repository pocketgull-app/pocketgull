import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import sharp from 'sharp';

const outputDir = path.resolve(process.cwd(), 'public/images/specimens');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// PostScript Type Specimen Definition in Pure PostScript Syntax
const postscriptSpecimen = `
%!PS-Adobe-3.0 EPSF-3.0
%%BoundingBox: 0 0 1200 630
%%Title: PocketGull Ghostscript PostScript Type Specimen
%%Creator: PocketGull Engine

% Background Fill
0.98 0.98 0.99 setrgbcolor
0 0 1200 630 rectfill

% Modular Grid Lines
0.9 0.9 0.92 setrgbcolor
1 setlinewidth
80 0 moveto 80 630 lineto stroke
1120 0 moveto 1120 630 lineto stroke
0 80 moveto 1200 80 lineto stroke
0 550 moveto 1200 550 lineto stroke

% Dieter Rams Header Text
0.4 0.45 0.55 setrgbcolor
/Helvetica-Bold findfont 12 scalefont setfont
80 580 moveto
(POCKETGULL GHOSTSCRIPT POSTSCRIPT TYPE SPECIMEN • WENIGER, ABER BESSER) show

% Title Text
0.06 0.09 0.16 setrgbcolor
/Helvetica-Bold findfont 48 scalefont setfont
80 460 moveto
(PocketGull Marker & Clinical) show

% Subtitle
0.92 0.35 0.05 setrgbcolor
/Helvetica-Bold findfont 24 scalefont setfont
80 400 moveto
(High-Contrast Vector PostScript Rendering Engine) show

% Character Map Row
0.2 0.25 0.35 setrgbcolor
/Helvetica findfont 22 scalefont setfont
80 320 moveto
(0123456789 I V X 1/2 +-% n e u a c a alpha beta Omega B) show

% Dieter Rams 10 Principles Baseline
0.5 0.55 0.6 setrgbcolor
/Helvetica findfont 11 scalefont setfont
80 100 moveto
(1. Innovative  2. Useful  3. Aesthetic  4. Understandable  5. Unobtrusive  6. Honest  7. Long-lasting  8. Thorough  9. Eco  10. Less, but better) show

showpage
%%EOF
`;

const psPath = path.join(outputDir, 'pocketgull_specimen.ps');
const epsPath = path.join(outputDir, 'pocketgull_specimen.eps');
const gsPdfPath = path.join(outputDir, 'pocketgull_specimen_gs.pdf');

fs.writeFileSync(psPath, postscriptSpecimen);
fs.writeFileSync(epsPath, postscriptScriptHeader() + postscriptSpecimen);

console.log(`✅ Written PostScript Specimen Source: ${psPath}`);

function postscriptScriptHeader() {
  return '%!PS-Adobe-3.0 EPSF-3.0\n';
}

// Convert PostScript to High-DPI PDF/PNG using Ghostscript if available
try {
  const gsCmd = process.platform === 'win32' ? 'gswin64c' : 'gs';
  execSync(`${gsCmd} -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -sOutputFile="${gsPdfPath}" "${psPath}"`, { stdio: 'ignore' });
  console.log(`✅ Ghostscript PDF Specimen Generated: ${gsPdfPath}`);
} catch (e) {
  console.log('ℹ️ Ghostscript CLI not found in PATH; falling back to SVG vector rasterization.');
}
