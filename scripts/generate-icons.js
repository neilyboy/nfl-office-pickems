#!/usr/bin/env node

/**
 * Simple icon generator for PWA
 * Creates icon files in multiple sizes
 * Run with: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG template for the icon
const createSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#3b82f6" rx="${size * 0.15}"/>
  
  <!-- Football -->
  <ellipse cx="${size/2}" cy="${size/2}" rx="${size * 0.35}" ry="${size * 0.25}" fill="#8b4513" stroke="#654321" stroke-width="${size * 0.02}"/>
  
  <!-- Laces -->
  <line x1="${size/2}" y1="${size * 0.35}" x2="${size/2}" y2="${size * 0.65}" stroke="white" stroke-width="${size * 0.025}" stroke-linecap="round"/>
  <line x1="${size * 0.40}" y1="${size * 0.42}" x2="${size * 0.60}" y2="${size * 0.42}" stroke="white" stroke-width="${size * 0.015}" stroke-linecap="round"/>
  <line x1="${size * 0.40}" y1="${size * 0.50}" x2="${size * 0.60}" y2="${size * 0.50}" stroke="white" stroke-width="${size * 0.015}" stroke-linecap="round"/>
  <line x1="${size * 0.40}" y1="${size * 0.58}" x2="${size * 0.60}" y2="${size * 0.58}" stroke="white" stroke-width="${size * 0.015}" stroke-linecap="round"/>
  
  <!-- Text -->
  <text x="${size/2}" y="${size * 0.88}" font-family="Arial, sans-serif" font-size="${size * 0.12}" font-weight="bold" fill="white" text-anchor="middle">PICKEMS</text>
</svg>`;

console.log('🎨 Generating PWA icons...\n');

sizes.forEach(size => {
  const svg = createSVG(size);
  const filename = `icon-${size}x${size}.png`;
  const svgFilename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, svgFilename);
  
  fs.writeFileSync(filepath, svg);
  console.log(`✅ Created ${svgFilename}`);
});

console.log('\n📦 SVG icons generated successfully!');
console.log('\n💡 Note: For production, you should convert these SVGs to PNGs using a tool like:');
console.log('   - ImageMagick: convert icon.svg icon.png');
console.log('   - Online converters: svgtopng.com');
console.log('   - Or use the SVGs directly (many browsers support it)');
console.log('\n🚀 Icons are ready in public/icons/');
