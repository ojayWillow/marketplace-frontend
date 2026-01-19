/**
 * Fix API Client Imports
 * Converts default imports to named imports for apiClient
 */

const fs = require('fs');
const path = require('path');

const webSrcDir = path.join(__dirname, 'apps', 'web', 'src');

let filesModified = 0;
let importsFixed = 0;

function fixApiImports(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and build directories
      if (['node_modules', 'dist', 'build', '.next'].includes(entry.name)) {
        continue;
      }
      fixApiImports(fullPath);
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Pattern 1: import apiClient from '@marketplace/shared'
      if (content.includes("import apiClient from '@marketplace/shared'")) {
        content = content.replace(
          /import apiClient from '@marketplace\/shared'/g,
          "import { apiClient } from '@marketplace/shared'"
        );
        modified = true;
        importsFixed++;
      }

      // Pattern 2: import apiClient from '@marketplace/shared' (no semicolon)
      if (content.includes("import apiClient from '@marketplace/shared")) {
        content = content.replace(
          /import apiClient from '@marketplace\/shared/g,
          "import { apiClient } from '@marketplace/shared"
        );
        modified = true;
        importsFixed++;
      }

      // Pattern 3: import api from '@marketplace/shared' (used in some files)
      if (content.includes("import api from '@marketplace/shared'")) {
        content = content.replace(
          /import api from '@marketplace\/shared'/g,
          "import { apiClient as api } from '@marketplace/shared'"
        );
        modified = true;
        importsFixed++;
      }

      // Pattern 4: import api from '@marketplace/shared' (no semicolon)
      if (content.includes("import api from '@marketplace/shared")) {
        content = content.replace(
          /import api from '@marketplace\/shared/g,
          "import { apiClient as api } from '@marketplace/shared"
        );
        modified = true;
        importsFixed++;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        filesModified++;
        const relativePath = path.relative(webSrcDir, fullPath);
        console.log(`✓ Fixed: ${relativePath}`);
      }
    }
  }
}

console.log('🔧 Fixing API client imports...\n');
fixApiImports(webSrcDir);

console.log('\n' + '='.repeat(50));
console.log('✅ API Import Fix Complete!');
console.log('='.repeat(50));
console.log(`📊 Statistics:`);
console.log(`   - Files modified: ${filesModified}`);
console.log(`   - Imports fixed: ${importsFixed}`);
console.log('\n💡 Now run: pnpm dev');
