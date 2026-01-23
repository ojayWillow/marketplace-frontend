/**
 * Asset Generation Script for Marketplace Mobile App
 * 
 * Generates placeholder PNG assets so the app can run during development.
 * Replace these with actual branded assets before publishing.
 * 
 * Usage: node scripts/generate-assets.js
 * 
 * Requirements: Node.js (uses built-in modules only)
 */

const fs = require('fs');
const path = require('path');

// Simple PNG generator (creates minimal valid PNG files)
function createPlaceholderPNG(width, height, r, g, b, text) {
  // This creates a minimal valid PNG with a solid color
  // For production, use actual designed assets
  
  const { createCanvas } = requireCanvas();
  
  if (!createCanvas) {
    console.log(`⚠️  Canvas not available. Creating empty placeholder files.`);
    console.log(`   Install 'canvas' package for colored placeholders: npm install canvas`);
    return createMinimalPNG();
  }
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fillRect(0, 0, width, height);
  
  // Add text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${Math.floor(width / 4)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  
  return canvas.toBuffer('image/png');
}

function requireCanvas() {
  try {
    return require('canvas');
  } catch {
    return { createCanvas: null };
  }
}

// Minimal valid 1x1 PNG (will be stretched by Expo)
function createMinimalPNG() {
  // Minimal valid PNG: 1x1 pixel, sky blue color
  return Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, 0x02,             // bit depth: 8, color type: 2 (RGB)
    0x00, 0x00, 0x00,       // compression, filter, interlace
    0x90, 0x77, 0x53, 0xDE, // IHDR CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0xD7, 0x63, 0x60, 0x60, 0x60, 0x00, 0x00, 0x00, 0x04, 0x00, 0x01, // compressed data
    0x27, 0x34, 0x03, 0x00, // IDAT CRC (approximate)
    0x00, 0x00, 0x00, 0x00, // IEND length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // IEND CRC
  ]);
}

const assetsDir = path.join(__dirname, '..', 'assets');

const assets = [
  { name: 'icon.png', width: 1024, height: 1024 },
  { name: 'splash.png', width: 1284, height: 2778 },
  { name: 'adaptive-icon.png', width: 1024, height: 1024 },
  { name: 'favicon.png', width: 48, height: 48 },
  { name: 'notification-icon.png', width: 96, height: 96 },
];

console.log('\n🎨 Generating placeholder assets for Marketplace Mobile App\n');

assets.forEach(asset => {
  const filePath = path.join(assetsDir, asset.name);
  
  // Skip if file already exists and is larger than minimal
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    if (stats.size > 100) {
      console.log(`⏭️  ${asset.name} already exists (${stats.size} bytes), skipping`);
      return;
    }
  }
  
  const buffer = createMinimalPNG();
  fs.writeFileSync(filePath, buffer);
  console.log(`✅ Created ${asset.name} (${asset.width}x${asset.height})`);
});

console.log('\n✨ Done! Assets created in apps/mobile/assets/');
console.log('\n⚠️  These are minimal placeholders. For better visuals during development:');
console.log('   npm install canvas');
console.log('   node scripts/generate-assets.js');
console.log('\n📝 Replace with actual branded assets before publishing.\n');
