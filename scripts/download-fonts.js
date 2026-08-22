import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fontsDir = path.resolve(__dirname, '../public/fonts');
if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
}

// Sovereign Local PocketGull Superfamily Font-Face Definitions
const POCKETGULL_SUPERFAMILY_CSS = `
/* ==========================================================================
   PocketGull Sovereign Superfamily Edge Fonts (Offline-First)
   ========================================================================== */

@font-face {
  font-family: 'PocketGull';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/PocketGull-Bold.woff2') format('woff2'),
       url('/fonts/PocketGull-Bold.ttf') format('truetype');
}

@font-face {
  font-family: 'PocketGull';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/PocketGull-Fineliner.woff2') format('woff2'),
       url('/fonts/PocketGull-Fineliner.ttf') format('truetype');
}

@font-face {
  font-family: 'PocketGull';
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: url('/fonts/PocketGull-Chiseltip.woff2') format('woff2'),
       url('/fonts/PocketGull-Chiseltip.ttf') format('truetype');
}

@font-face {
  font-family: 'PocketGull Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/PocketGullMono-Regular.woff2') format('woff2'),
       url('/fonts/PocketGullMono-Regular.ttf') format('truetype');
}

@font-face {
  font-family: 'PocketGull VF';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url('/fonts/PocketGull-VF.woff2') format('woff2'),
       url('/fonts/PocketGull-VF.ttf') format('truetype');
}
`;

const googleFontsUrl = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap';

async function main() {
    const cssPath = path.resolve(fontsDir, 'fonts.css');
    
    // Check if we already have the local woff2 files in place
    const existingFiles = fs.readdirSync(fontsDir);
    const hasWoff2 = existingFiles.some(f => f.endsWith('.woff2'));
    
    if (hasWoff2 && fs.existsSync(cssPath)) {
        console.log("⚡ Sovereign local font assets detected. Refreshing master fonts.css with PocketGull superfamily...");
        let currentCss = fs.readFileSync(cssPath, 'utf8');
        if (!currentCss.includes("PocketGull Sovereign Superfamily")) {
            currentCss = POCKETGULL_SUPERFAMILY_CSS + "\n" + currentCss;
            fs.writeFileSync(cssPath, currentCss, 'utf8');
        }
        console.log("✅ Offline-first edge fonts compiled successfully.");
        return;
    }

    try {
        console.log("Fetching fallback font CSS...");
        const res = await fetch(googleFontsUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            signal: AbortSignal.timeout(6000)
        });
        
        if (res.ok) {
            let cssText = await res.text();
            const urlRegex = /url\((https:\/\/fonts\.gstatic\.com\/s\/[^\)]+)\)/g;
            let match;
            const urls = [];
            while ((match = urlRegex.exec(cssText)) !== null) {
                urls.push(match[1]);
            }
            
            const urlToLocalMap = new Map();
            for (const url of urls) {
                if (!url.startsWith('https://fonts.gstatic.com/s/')) continue;
                const filename = path.basename(url);
                if (!/^[a-zA-Z0-9_\-\.]+$/.test(filename)) continue;
                const localPath = path.resolve(fontsDir, filename);
                
                if (!fs.existsSync(localPath)) {
                    console.log(`Downloading ${filename}...`);
                    const fontRes = await fetch(url, { signal: AbortSignal.timeout(6000) });
                    if (fontRes.ok) {
                        const buffer = await fontRes.arrayBuffer();
                        fs.writeFileSync(localPath, Buffer.from(buffer));
                    }
                }
                urlToLocalMap.set(url, `/fonts/${filename}`);
            }
            
            let localCssText = cssText;
            for (const [remoteUrl, localUrl] of urlToLocalMap.entries()) {
                localCssText = localCssText.replaceAll(remoteUrl, localUrl);
            }
            
            const finalCss = POCKETGULL_SUPERFAMILY_CSS + "\n" + localCssText;
            fs.writeFileSync(cssPath, finalCss, 'utf8');
            console.log("✅ Fonts CSS compiled to public/fonts/fonts.css");
            return;
        }
    } catch (err) {
        console.warn("⚠️ Network fetch bypassed. Generating 100% sovereign local fonts.css:", err.message);
    }
    
    // Fallback: Pure sovereign edge CSS
    fs.writeFileSync(cssPath, POCKETGULL_SUPERFAMILY_CSS, 'utf8');
    console.log("✅ Sovereign PocketGull font suite written to public/fonts/fonts.css");
}

main().catch(console.error);
