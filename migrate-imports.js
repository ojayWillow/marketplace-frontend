#!/usr/bin/env node

/**
 * Migration Script: Update Web App Imports to Use @marketplace/shared
 * 
 * This script automatically updates all import statements in apps/web/src/
 * to use the shared package instead of local folders.
 */

const fs = require('fs');
const path = require('path');

const WEB_SRC_DIR = path.join(__dirname, 'apps', 'web', 'src');

// Track statistics
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  importsUpdated: 0,
};

// Import patterns to replace
const importPatterns = [
  // Stores
  { 
    pattern: /from ['"](\.\.\/)+stores\/([^'"]+)['"]/g,
    replacement: "from '@marketplace/shared'"
  },
  // API
  { 
    pattern: /from ['"](\.\.\/)+api\/([^'"]+)['"]/g,
    replacement: "from '@marketplace/shared'"
  },
  { 
    pattern: /from ['"](\.\.\/)+api['"]/g,
    replacement: "from '@marketplace/shared'"
  },
  // Types
  { 
    pattern: /from ['"](\.\.\/)+types\/([^'"]+)['"]/g,
    replacement: "from '@marketplace/shared'"
  },
  { 
    pattern: /from ['"](\.\.\/)+types['"]/g,
    replacement: "from '@marketplace/shared'"
  },
  // i18n
  { 
    pattern: /from ['"](\.\.\/)+i18n\/([^'"]+)['"]/g,
    replacement: "from '@marketplace/shared'"
  },
  { 
    pattern: /from ['"](\.\.\/)+i18n['"]/g,
    replacement: "from '@marketplace/shared'"
  },
];

/**
 * Process a single file
 */
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let fileModified = false;
  
  // Apply each pattern
  importPatterns.forEach(({ pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      newContent = newContent.replace(pattern, replacement);
      stats.importsUpdated += matches.length;
      fileModified = true;
    }
  });
  
  // Write back if modified
  if (fileModified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    stats.filesModified++;
    console.log(`✓ Updated: ${path.relative(WEB_SRC_DIR, filePath)}`);
  }
  
  stats.filesProcessed++;
}

/**
 * Recursively process directory
 */
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    
    // Skip the folders we're going to delete
    if (entry.isDirectory()) {
      const folderName = entry.name;
      if (['api', 'stores', 'types', 'i18n', 'node_modules'].includes(folderName)) {
        console.log(`⊘ Skipping folder: ${folderName}`);
        return;
      }
      processDirectory(fullPath);
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      processFile(fullPath);
    }
  });
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting import migration...\n');
  console.log(`📂 Processing directory: ${WEB_SRC_DIR}\n`);
  
  if (!fs.existsSync(WEB_SRC_DIR)) {
    console.error('❌ Error: apps/web/src directory not found!');
    process.exit(1);
  }
  
  processDirectory(WEB_SRC_DIR);
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Migration Complete!');
  console.log('='.repeat(50));
  console.log(`📊 Statistics:`);
  console.log(`   - Files processed: ${stats.filesProcessed}`);
  console.log(`   - Files modified: ${stats.filesModified}`);
  console.log(`   - Imports updated: ${stats.importsUpdated}`);
  console.log('\n💡 Next steps:');
  console.log('   1. Run: pnpm install');
  console.log('   2. Run: cd apps/web && pnpm dev');
  console.log('   3. Test the web app');
  console.log('   4. If everything works, delete duplicate folders');
  console.log('\n');
}

main();
