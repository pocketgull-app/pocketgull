import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';

const IMAGES = [
  {
    name: 'barberry.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Berberis_thunb_frt.jpg'
  },
  {
    name: 'deer_tick.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Adult_deer_tick.jpg'
  },
  {
    name: 'dog_tick.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Dermacentor_variabilis%2C_U%2C_Back%2C_MD%2C_Beltsville_2013-07-08-19.15.11_ZS_PMax.jpg'
  },
  {
    name: 'lonestar_tick.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Amblyomma_americanum_P1210455b.jpg'
  },
  {
    name: 'spirochetes.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Borrelia_burgdorferi_%28CDC-PHIL_-6631%29_lores.jpg'
  },
  {
    name: 'babesia_smear.png',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Blood_smear_of_Babesia_microti%2C_annotated.png'
  },
  {
    name: 'white_footed_mouse.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/76/White-footed_Mouse%2C_Cantley%2C_Quebec.jpg'
  },
  {
    name: 'brant_point.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Brant_Point_Light%2C_oblique.jpg'
  }
];

const destDir = path.resolve('c:/Users/philg/Pocketgull/pocketgull/companion-apps/nantucket-tick-radar/public/images');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, {
      headers: {
        'User-Agent': 'PocketGullBot/1.0 (https://pocketgull.org; contact@pocketgull.org)'
      }
    }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed with status ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`[OK] Saved ${path.basename(dest)} (${fs.statSync(dest).size} bytes)`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  for (const img of IMAGES) {
    const dest = path.join(destDir, img.name);
    try {
      await downloadFile(img.url, dest);
    } catch (e) {
      console.error(`[ERR] ${img.name}: ${e.message}`);
    }
  }
}

main();
