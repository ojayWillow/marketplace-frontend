#!/usr/bin/env node

/**
 * Category Sync Check
 * 
 * Extracts category keys from the shared package (source of truth)
 * and verifies they match the expected canonical list.
 * 
 * If you're adding/removing/renaming a category:
 * 1. Update packages/shared/src/constants/categories.ts
 * 2. Update EXPECTED_CATEGORIES below
 * 3. Update backend: app/constants/categories.py (VALID_CATEGORIES + LEGACY_CATEGORY_MAP)
 * 4. Update translation files (en + lv) if labels changed
 */

const fs = require('fs');
const path = require('path');

// ── Expected canonical categories (keep sorted) ──────────────────
// This is the contract. Both frontend and backend must match.
const EXPECTED_CATEGORIES = [
  'assembly',
  'beauty',
  'care',
  'cleaning',
  'delivery',
  'electrical',
  'events',
  'handyman',
  'moving',
  'other',
  'outdoor',
  'painting',
  'plumbing',
  'tech',
  'tutoring',
];

// ── Extract keys from categories.ts ──────────────────────────────
const CATEGORIES_FILE = path.join(
  __dirname,
  '..',
  'packages',
  'shared',
  'src',
  'constants',
  'categories.ts'
);

function extractKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Match key: 'xxx' entries in the CATEGORIES array
  const keyRegex = /key:\s*['"]([^'"]+)['"]/g;
  const keys = [];
  let match;
  
  while ((match = keyRegex.exec(content)) !== null) {
    const key = match[1];
    if (key !== 'all') { // 'all' is filter-only, not a real category
      keys.push(key);
    }
  }
  
  return keys.sort();
}

// ── Run check ────────────────────────────────────────────────────
console.log('\n🔍 Category Sync Check\n');

if (!fs.existsSync(CATEGORIES_FILE)) {
  console.error(`❌ File not found: ${CATEGORIES_FILE}`);
  process.exit(1);
}

const actual = extractKeys(CATEGORIES_FILE);
const expected = [...EXPECTED_CATEGORIES].sort();

console.log(`  Expected: ${expected.length} categories`);
console.log(`  Found:    ${actual.length} categories\n`);

// Find differences
const missing = expected.filter(k => !actual.includes(k));
const extra = actual.filter(k => !expected.includes(k));

if (missing.length === 0 && extra.length === 0) {
  console.log('✅ All categories aligned!\n');
  console.log('  Categories:', expected.join(', '));
  console.log('');
  console.log('  ℹ️  Remember: backend app/constants/categories.py must match too.');
  console.log('');
  process.exit(0);
} else {
  if (missing.length > 0) {
    console.error(`❌ Missing from categories.ts: ${missing.join(', ')}`);
    console.error('   → Add these to the CATEGORIES array in categories.ts');
  }
  if (extra.length > 0) {
    console.error(`❌ Extra in categories.ts (not in expected list): ${extra.join(', ')}`);
    console.error('   → Update EXPECTED_CATEGORIES in scripts/check-category-sync.js');
    console.error('   → Update VALID_CATEGORIES in backend app/constants/categories.py');
    console.error('   → Update translation files (en + lv)');
  }
  console.error('');
  console.error('📋 To fix: update both the source file AND the expected list,');
  console.error('   then sync backend app/constants/categories.py.');
  console.error('');
  process.exit(1);
}
