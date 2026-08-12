const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function compressDir(dir) {
  if (!fs.existsSync(dir)) return;
  const hempPath = path.join(dir, 'hemp_paper_texture.png');
  const ricePath = path.join(dir, 'rice_paper_texture.png');

  if (fs.existsSync(hempPath)) {
    const buffer = await sharp(hempPath)
      .resize({ width: 800, withoutEnlargement: true })
      .png({ compressionLevel: 9, quality: 75, palette: true })
      .toBuffer();
    const tmpHemp = hempPath + '.tmp';
    fs.writeFileSync(tmpHemp, buffer);
    fs.renameSync(tmpHemp, hempPath);
    console.log(`[${path.basename(dir)}] Hemp size: ${Math.round(buffer.length / 1024)} KB`);
  }

  if (fs.existsSync(ricePath)) {
    const buffer = await sharp(ricePath)
      .resize({ width: 800, withoutEnlargement: true })
      .png({ compressionLevel: 9, quality: 75, palette: true })
      .toBuffer();
    const tmpRice = ricePath + '.tmp';
    fs.writeFileSync(tmpRice, buffer);
    fs.renameSync(tmpRice, ricePath);
    console.log(`[${path.basename(dir)}] Rice size: ${Math.round(buffer.length / 1024)} KB`);
  }
}

async function run() {
  await compressDir(path.join(__dirname, '..', 'public', 'images'));
  await compressDir(path.join(__dirname, '..', 'dist', 'pocketgull', 'browser', 'images'));
}

run().catch(console.error);
