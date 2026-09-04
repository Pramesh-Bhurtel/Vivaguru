import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Standalone Brand Icon SVG (for app icon, PWA, apple touch icon)
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d1a"/>
      <stop offset="50%" stop-color="#0d1527"/>
      <stop offset="100%" stop-color="#0a1020"/>
    </linearGradient>
    <linearGradient id="vivaGrad" x1="0%" y1="0%" x2="100%" y2="80%">
      <stop offset="0%" stop-color="#a855f7"/>
      <stop offset="45%" stop-color="#7c3aed"/>
      <stop offset="75%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="leftWing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="40%" stop-color="#9333ea"/>
      <stop offset="100%" stop-color="#6b21a8"/>
    </linearGradient>
    <linearGradient id="rightWing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="40%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient>
    <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e40af"/>
      <stop offset="50%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
    <linearGradient id="headGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#9333ea"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient>
    <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#7c3aed" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Background rounded canvas -->
  <rect width="512" height="512" rx="108" fill="url(#bgGrad)"/>
  
  <!-- Subtle ambient inner border -->
  <rect x="6" y="6" width="500" height="500" rx="102" fill="none" stroke="url(#vivaGrad)" stroke-width="2" stroke-opacity="0.25"/>

  <g filter="url(#subtleGlow)" transform="translate(0, 10)">
    <!-- Mortarboard Cap -->
    <!-- Diamond Top -->
    <path d="M 256 92 L 340 128 L 256 164 L 172 128 Z" fill="url(#capGrad)" stroke="#60a5fa" stroke-width="2" stroke-linejoin="round"/>
    
    <!-- Skull Cap Arch -->
    <path d="M 206 138 Q 256 178 306 138 C 306 156 292 174 256 174 C 220 174 206 156 206 138 Z" fill="#1e3a8a"/>

    <!-- Tassel button and cord -->
    <circle cx="256" cy="128" r="4.5" fill="#93c5fd"/>
    <path d="M 256 128 Q 320 138 328 162 L 328 196" fill="none" stroke="#60a5fa" stroke-width="3" stroke-linecap="round"/>
    <!-- Tassel Fringe -->
    <path d="M 324 196 L 332 196 L 330 208 L 326 208 Z" fill="#93c5fd"/>

    <!-- Scholar Head -->
    <circle cx="256" cy="202" r="28" fill="url(#headGrad)"/>

    <!-- Left Arm of the V (Purple/Violet Wing) -->
    <path d="M 256 364 L 166 186 C 182 186 202 188 226 190 L 256 304 Z" fill="url(#leftWing)"/>
    <path d="M 152 184 L 180 184 L 256 348 L 244 354 Z" fill="#a855f7" opacity="0.9"/>

    <!-- Right Arm of the V (Blue Wing) -->
    <path d="M 256 364 L 346 186 C 330 186 310 188 286 190 L 256 304 Z" fill="url(#rightWing)"/>
    <path d="M 360 184 L 332 184 L 256 348 L 268 354 Z" fill="#38bdf8" opacity="0.9"/>

    <!-- Left Book Page (Curved Open Pages) -->
    <path d="M 256 370 C 218 350 174 326 132 292 C 142 328 178 376 256 394 Z" fill="url(#leftWing)"/>
    <path d="M 256 394 C 200 380 160 348 122 316 C 130 332 152 368 256 406 Z" fill="#7c3aed" opacity="0.8"/>

    <!-- Right Book Page (Curved Open Pages) -->
    <path d="M 256 370 C 294 350 338 326 380 292 C 370 328 334 376 256 394 Z" fill="url(#rightWing)"/>
    <path d="M 256 394 C 312 380 352 348 390 316 C 382 332 360 368 256 406 Z" fill="#1d4ed8" opacity="0.8"/>

    <!-- Center Spine Accent -->
    <line x1="256" y1="364" x2="256" y2="408" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.4"/>
  </g>
</svg>`;

// 2. Maskable Icon SVG (with full safe-zone margin for Android adaptive squircle/circle cropping)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0f1d"/>
      <stop offset="100%" stop-color="#0d1629"/>
    </linearGradient>
    <linearGradient id="leftWingM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="40%" stop-color="#9333ea"/>
      <stop offset="100%" stop-color="#6b21a8"/>
    </linearGradient>
    <linearGradient id="rightWingM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="40%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient>
    <linearGradient id="capGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e40af"/>
      <stop offset="100%" stop-color="#2563eb"/>
    </linearGradient>
    <linearGradient id="headGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#9333ea"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient>
  </defs>

  <!-- Solid full-bleed canvas for maskable container -->
  <rect width="512" height="512" fill="url(#bgGradMask)"/>

  <!-- Centered safe-zone group (scaled to 74% to guarantee 15%+ padding on all bounds) -->
  <g transform="translate(66, 66) scale(0.74)">
    <!-- Mortarboard Cap -->
    <path d="M 256 92 L 340 128 L 256 164 L 172 128 Z" fill="url(#capGradM)" stroke="#60a5fa" stroke-width="2" stroke-linejoin="round"/>
    <path d="M 206 138 Q 256 178 306 138 C 306 156 292 174 256 174 C 220 174 206 156 206 138 Z" fill="#1e3a8a"/>
    <circle cx="256" cy="128" r="4.5" fill="#93c5fd"/>
    <path d="M 256 128 Q 320 138 328 162 L 328 196" fill="none" stroke="#60a5fa" stroke-width="3" stroke-linecap="round"/>
    <path d="M 324 196 L 332 196 L 330 208 L 326 208 Z" fill="#93c5fd"/>

    <!-- Scholar Head -->
    <circle cx="256" cy="202" r="28" fill="url(#headGradM)"/>

    <!-- Left Arm of the V -->
    <path d="M 256 364 L 166 186 C 182 186 202 188 226 190 L 256 304 Z" fill="url(#leftWingM)"/>
    <path d="M 152 184 L 180 184 L 256 348 L 244 354 Z" fill="#a855f7" opacity="0.9"/>

    <!-- Right Arm of the V -->
    <path d="M 256 364 L 346 186 C 330 186 310 188 286 190 L 256 304 Z" fill="url(#rightWingM)"/>
    <path d="M 360 184 L 332 184 L 256 348 L 268 354 Z" fill="#38bdf8" opacity="0.9"/>

    <!-- Left Book Page -->
    <path d="M 256 370 C 218 350 174 326 132 292 C 142 328 178 376 256 394 Z" fill="url(#leftWingM)"/>
    <path d="M 256 394 C 200 380 160 348 122 316 C 130 332 152 368 256 406 Z" fill="#7c3aed" opacity="0.8"/>

    <!-- Right Book Page -->
    <path d="M 256 370 C 294 350 338 326 380 292 C 370 328 334 376 256 394 Z" fill="url(#rightWingM)"/>
    <path d="M 256 394 C 312 380 352 348 390 316 C 382 332 360 368 256 406 Z" fill="#1d4ed8" opacity="0.8"/>
  </g>
</svg>`;

// 3. Complete Brand Logo SVG (Emblem + "VIVAGURU" + Tagline: "PRACTICE. UNDERSTAND. EXCEL.")
const fullLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 620" width="800" height="620">
  <defs>
    <linearGradient id="vivaGradWord" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#9333ea"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
    <linearGradient id="guruGradWord" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="barGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#9333ea" stop-opacity="0.1"/>
      <stop offset="15%" stop-color="#9333ea"/>
      <stop offset="50%" stop-color="#6366f1"/>
      <stop offset="85%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#2563eb" stop-opacity="0.1"/>
    </linearGradient>
    <linearGradient id="capGradF" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="100%" stop-color="#2563eb"/>
    </linearGradient>
    <linearGradient id="leftWingF" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="50%" stop-color="#9333ea"/>
      <stop offset="100%" stop-color="#6b21a8"/>
    </linearGradient>
    <linearGradient id="rightWingF" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient>
  </defs>

  <!-- Center Emblem Group -->
  <g transform="translate(144, 15) scale(1)">
    <!-- Mortarboard Cap -->
    <path d="M 256 60 L 354 102 L 256 144 L 158 102 Z" fill="url(#capGradF)" stroke="#60a5fa" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M 196 112 Q 256 160 316 112 C 316 134 300 156 256 156 C 212 156 196 134 196 112 Z" fill="#1e3a8a"/>
    <circle cx="256" cy="102" r="5" fill="#93c5fd"/>
    <path d="M 256 102 Q 330 114 340 142 L 340 184" fill="none" stroke="#60a5fa" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M 335 184 L 345 184 L 342 198 L 338 198 Z" fill="#93c5fd"/>

    <!-- Scholar Head -->
    <circle cx="256" cy="190" r="32" fill="url(#capGradF)"/>

    <!-- Left Wing (V left) -->
    <path d="M 256 376 L 152 170 C 170 170 195 172 222 174 L 256 306 Z" fill="url(#leftWingF)"/>
    <path d="M 136 168 L 168 168 L 256 358 L 242 365 Z" fill="#c084fc" opacity="0.95"/>

    <!-- Right Wing (V right) -->
    <path d="M 256 376 L 360 170 C 342 170 317 172 290 174 L 256 306 Z" fill="url(#rightWingF)"/>
    <path d="M 376 168 L 344 168 L 256 358 L 270 365 Z" fill="#38bdf8" opacity="0.95"/>

    <!-- Book Left Pages -->
    <path d="M 256 384 C 210 360 160 332 110 292 C 122 334 164 390 256 412 Z" fill="url(#leftWingF)"/>
    <path d="M 256 412 C 192 396 146 360 100 322 C 110 340 134 382 256 426 Z" fill="#7c3aed"/>

    <!-- Book Right Pages -->
    <path d="M 256 384 C 302 360 352 332 402 292 C 390 334 348 390 256 412 Z" fill="url(#rightWingF)"/>
    <path d="M 256 412 C 320 396 366 360 412 322 C 402 340 378 382 256 426 Z" fill="#1d4ed8"/>
  </g>

  <!-- Typography: VIVA GURU -->
  <g transform="translate(400, 508)" text-anchor="middle">
    <text font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="76" letter-spacing="4">
      <tspan fill="url(#vivaGradWord)">VIVA</tspan>
      <tspan fill="url(#guruGradWord)" dx="16">GURU</tspan>
    </text>
  </g>

  <!-- Tagline: PRACTICE. UNDERSTAND. EXCEL. -->
  <g transform="translate(400, 560)">
    <!-- Thin sleek line with dot accents -->
    <line x1="-310" y1="0" x2="310" y2="0" stroke="url(#barGrad)" stroke-width="2"/>
    <circle cx="-310" cy="0" r="4" fill="#9333ea"/>
    <circle cx="310" cy="0" r="4" fill="#2563eb"/>

    <!-- Tagline Text -->
    <text y="22" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="16" fill="#94a3b8" letter-spacing="5">
      PRACTICE. UNDERSTAND. EXCEL.
    </text>
  </g>
</svg>`;

// 4. OpenGraph Card Image SVG (1200x630)
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="ogBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070a14"/>
      <stop offset="50%" stop-color="#0b1122"/>
      <stop offset="100%" stop-color="#080e1c"/>
    </linearGradient>
    <linearGradient id="ogVivaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
    <linearGradient id="ogGuruGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <radialGradient id="glowR" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#7c3aed" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#ogBg)"/>
  <circle cx="600" cy="240" r="340" fill="url(#glowR)"/>

  <!-- Border -->
  <rect x="24" y="24" width="1152" height="582" rx="20" fill="none" stroke="#334155" stroke-width="1.5" stroke-opacity="0.4"/>

  <!-- Emblem Icon in OG center -->
  <g transform="translate(600, 210) scale(0.65)">
    <g transform="translate(-256, -256)">
      <!-- Cap -->
      <path d="M 256 92 L 340 128 L 256 164 L 172 128 Z" fill="#2563eb" stroke="#60a5fa" stroke-width="2"/>
      <circle cx="256" cy="128" r="5" fill="#93c5fd"/>
      <path d="M 256 128 Q 320 138 328 162 L 328 196" fill="none" stroke="#60a5fa" stroke-width="3"/>
      <circle cx="256" cy="202" r="28" fill="#1e3a8a"/>

      <!-- Wings -->
      <path d="M 256 364 L 166 186 C 182 186 202 188 226 190 L 256 304 Z" fill="#9333ea"/>
      <path d="M 256 364 L 346 186 C 330 186 310 188 286 190 L 256 304 Z" fill="#2563eb"/>

      <!-- Book -->
      <path d="M 256 370 C 218 350 174 326 132 292 C 142 328 178 376 256 394 Z" fill="#7c3aed"/>
      <path d="M 256 370 C 294 350 338 326 380 292 C 370 328 334 376 256 394 Z" fill="#1d4ed8"/>
    </g>
  </g>

  <!-- Big Typography -->
  <text x="600" y="440" text-anchor="middle" font-family="'Inter', sans-serif" font-weight="900" font-size="78" letter-spacing="4">
    <tspan fill="url(#ogVivaGrad)">VIVA</tspan>
    <tspan fill="url(#ogGuruGrad)" dx="16">GURU</tspan>
  </text>

  <!-- Tagline badge -->
  <text x="600" y="495" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="22" fill="#cbd5e1" letter-spacing="5">
    PRACTICE. UNDERSTAND. EXCEL.
  </text>

  <text x="600" y="540" text-anchor="middle" font-family="'Inter', sans-serif" font-weight="500" font-size="18" fill="#94a3b8">
    Adaptive Socratic Oral Exam Simulator &#8226; Metacognitive Calibration &#8226; Real-Time Audio
  </text>
</svg>`;

async function buildAssets() {
  console.log('Writing vector SVG source files...');
  fs.writeFileSync(path.join(publicDir, 'logo-icon.svg'), iconSvg);
  fs.writeFileSync(path.join(publicDir, 'logo-maskable.svg'), maskableSvg);
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), fullLogoSvg);
  fs.writeFileSync(path.join(publicDir, 'og-image.svg'), ogSvg);

  console.log('Rendering high-resolution PWA icons with sharp...');
  
  // 192x192 PNG
  await sharp(Buffer.from(iconSvg))
    .resize(192, 192)
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('✔ Generated pwa-192x192.png');

  // 512x512 PNG
  await sharp(Buffer.from(iconSvg))
    .resize(512, 512)
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('✔ Generated pwa-512x512.png');

  // 512x512 Maskable PNG
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('✔ Generated pwa-maskable-512x512.png');

  // 180x180 Apple Touch Icon
  await sharp(Buffer.from(iconSvg))
    .resize(180, 180)
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✔ Generated apple-touch-icon.png');

  // 64x64 Favicon PNG
  await sharp(Buffer.from(iconSvg))
    .resize(64, 64)
    .png({ quality: 90 })
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('✔ Generated favicon.png');

  // 1200x630 OpenGraph PNG
  await sharp(Buffer.from(ogSvg))
    .resize(1200, 630)
    .png({ quality: 90 })
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('✔ Generated og-image.png');

  console.log('All branding and PWA assets generated successfully!');
}

buildAssets().catch((err) => {
  console.error('Failed to generate assets:', err);
  process.exit(1);
});
