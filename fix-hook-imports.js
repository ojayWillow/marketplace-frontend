/**
 * Fix Hook Imports
 * Reverts hook imports back to local paths since they're not in shared package yet
 */

const fs = require('fs');
const path = require('path');

const webSrcDir = path.join(__dirname, 'apps', 'web', 'src');

let filesModified = 0;

function fixHookImports(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'build', '.next'].includes(entry.name)) {
        continue;
      }
      fixHookImports(fullPath);
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Pattern: Lines that import hooks from @marketplace/shared
      // We need to change them back to importing from '../api/hooks' or similar
      const hookNames = [
        'useTasks', 'useTask', 'useMyTasks', 'useCreateTask', 'useUpdateTask',
        'useApplyToTask', 'useWithdrawApplication', 'taskKeys',
        'useOfferings', 'useBoostedOfferings', 'useOffering', 'useMyOfferings',
        'useCreateOffering', 'useUpdateOffering', 'useBoostOffering', 'offeringKeys',
        'useConversations', 'useConversation', 'useMessages', 'useSendMessage',
        'useMarkAsRead', 'messageKeys',
        'useNotifications', 'useNotificationUnreadCount', 'useUnreadCounts',
        'useMarkNotificationAsRead', 'useMarkAllNotificationsAsRead',
        'useMarkNotificationsByType', 'notificationKeys',
        'useUserProfile', 'useUserReviews', 'useStartConversation', 'userKeys'
      ];

      // Check if file imports any hooks from @marketplace/shared
      const importRegex = /import\s+{([^}]+)}\s+from\s+['"]@marketplace\/shared['"];?/g;
      const matches = [...content.matchAll(importRegex)];

      for (const match of matches) {
        const imports = match[1].split(',').map(i => i.trim());
        const hasHooks = imports.some(imp => {
          const name = imp.split(' as ')[0].trim();
          return hookNames.includes(name);
        });

        if (hasHooks) {
          // This import has hooks - we need to split it
          const hookImports = [];
          const nonHookImports = [];

          for (const imp of imports) {
            const name = imp.split(' as ')[0].trim();
            if (hookNames.includes(name)) {
              hookImports.push(imp);
            } else {
              nonHookImports.push(imp);
            }
          }

          // Calculate relative path to api/hooks
          const relativePath = path.relative(path.dirname(fullPath), path.join(webSrcDir, 'api', 'hooks'));
          const importPath = relativePath.replace(/\\/g, '/');

          let replacement = '';
          if (hookImports.length > 0) {
            replacement += `import { ${hookImports.join(', ')} } from '${importPath}';\n`;
          }
          if (nonHookImports.length > 0) {
            replacement += `import { ${nonHookImports.join(', ')} } from '@marketplace/shared';`;
          }

          content = content.replace(match[0], replacement.trim());
          modified = true;
        }
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

console.log('🔧 Fixing hook imports...\n');
fixHookImports(webSrcDir);

console.log('\n' + '='.repeat(50));
console.log('✅ Hook Import Fix Complete!');
console.log('='.repeat(50));
console.log(`📊 Statistics:`);
console.log(`   - Files modified: ${filesModified}`);
console.log('\n💡 Now run: pnpm dev');
