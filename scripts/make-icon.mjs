// Generate build/icon.ico + resources/tray-icon.png from the CloudMascot SVG.
// Uses mood="calm" (line eyes + flat mouth) to match the sidebar's v1.0 mascot.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const CLOUD_WHITE = '#FDFCF8';
const INK = '#2A2A3C';
const PEACH = '#FFCFB8';

// 512×512 canvas, cloud centered with padding.
// Source path is from CloudMascot.tsx (viewBox 0 0 120 90). We wrap in a 512 square
// with some breathing room so the icon reads at small sizes.
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${CLOUD_WHITE}"/>
  <g transform="translate(56 140) scale(3.33)">
    <!-- shadow -->
    <ellipse cx="60" cy="80" rx="40" ry="3" fill="rgba(42,42,60,0.1)"/>
    <!-- cloud body -->
    <path d="M 22 55
             Q 14 56 12 48
             Q 8 38 18 34
             Q 20 22 34 22
             Q 40 12 52 14
             Q 62 6 74 14
             Q 86 10 92 22
             Q 106 24 106 38
             Q 112 48 102 54
             Q 98 62 88 60
             Q 76 66 64 60
             Q 50 66 40 60
             Q 30 62 22 55 Z"
          fill="${CLOUD_WHITE}"
          stroke="${INK}"
          stroke-width="2.8"
          stroke-linejoin="round"/>
    <!-- rouge -->
    <ellipse cx="34" cy="48" rx="5" ry="3" fill="${PEACH}" opacity="0.7"/>
    <ellipse cx="86" cy="48" rx="5" ry="3" fill="${PEACH}" opacity="0.7"/>
    <!-- calm eyes -->
    <path d="M 42 41 Q 46 39 50 41" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M 70 41 Q 74 39 78 41" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <!-- flat mouth -->
    <path d="M 55 52 L 65 52" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
  </g>
</svg>`;

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\//, ''), '..');

async function main() {
  const buildDir = path.join(root, 'build');
  const resourcesDir = path.join(root, 'resources');
  await fs.mkdir(buildDir, { recursive: true });
  await fs.mkdir(resourcesDir, { recursive: true });

  // Rasterize SVG once at 512, then downscale for each ICO size.
  const master = await sharp(Buffer.from(svg)).resize(512, 512).png().toBuffer();

  // ICO wants multiple sizes baked in.
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const pngBuffers = await Promise.all(
    sizes.map((s) => sharp(master).resize(s, s).png().toBuffer())
  );

  const icoBuffer = await pngToIco(pngBuffers);
  await fs.writeFile(path.join(buildDir, 'icon.ico'), icoBuffer);
  await fs.writeFile(path.join(buildDir, 'icon.png'), master);

  // Tray icon — 32×32 transparent background for clarity at small sizes.
  const trayMaster = await sharp(
    Buffer.from(svg.replace(`<rect width="512" height="512" fill="${CLOUD_WHITE}"/>`, ''))
  ).resize(64, 64).png().toBuffer();
  await fs.writeFile(path.join(resourcesDir, 'tray-icon.png'), trayMaster);

  console.log('wrote build/icon.ico  (', icoBuffer.length, 'bytes)');
  console.log('wrote build/icon.png  (', master.length, 'bytes)');
  console.log('wrote resources/tray-icon.png');
}

main().catch((e) => { console.error(e); process.exit(1); });
