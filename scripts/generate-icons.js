/**
 * Generate PWA Icons Script
 * Creates placeholder SVG icons in different sizes
 *
 * Usage: node scripts/generate-icons.js
 *
 * Note: For production, replace these with actual PNG icons using a tool like:
 * - https://realfavicongenerator.net/
 * - https://www.pwabuilder.com/imageGenerator
 */

const fs = require('fs');
const path = require('path');

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const ICON_DIR = path.join(__dirname, '../public/icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(ICON_DIR)) {
  fs.mkdirSync(ICON_DIR, { recursive: true });
}

// SVG template with Haguenau.pro branding
function generateIconSVG(size) {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Gradient background -->
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>

  <!-- Letter "H" for Haguenau -->
  <text
    x="50%"
    y="50%"
    font-family="Arial, sans-serif"
    font-size="${size * 0.5}"
    font-weight="bold"
    fill="white"
    text-anchor="middle"
    dominant-baseline="central">
    H
  </text>

  <!-- Small dot for ".pro" -->
  <circle cx="${size * 0.75}" cy="${size * 0.25}" r="${size * 0.06}" fill="#10B981"/>
</svg>`;
}

// Generate icons
ICON_SIZES.forEach((size) => {
  const svgContent = generateIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(ICON_DIR, filename);

  fs.writeFileSync(filepath, svgContent);
  console.log(`✓ Generated ${filename}`);
});

console.log(`\n✓ Generated ${ICON_SIZES.length} icon files in /public/icons/`);
console.log('\n📝 Next steps:');
console.log('1. For production, convert SVG icons to PNG using an image editor');
console.log('2. Or use online tools like realfavicongenerator.net');
console.log('3. Replace SVG files with optimized PNG files');
console.log('\n💡 Tip: PWA icons should be PNG format for best compatibility');
