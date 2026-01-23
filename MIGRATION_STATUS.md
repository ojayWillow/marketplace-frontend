# Phase 1 Migration Status

## ✅ Completed

### Files Successfully Migrated
1. **apps/web/src/components/ProtectedRoute.tsx** - Updated to use `@marketplace/shared`
2. **apps/web/src/pages/Home.tsx** - Updated to use `@marketplace/shared`
3. **migrate-imports.js** - Script created (ready to use)

### Import Changes Made
- `import { useAuthStore } from '../stores/authStore'` → `import { useAuthStore } from '@marketplace/shared'`
- `import api from '../api/client'` → `import { apiClient as api } from '@marketplace/shared'`

## 🔄 Remaining Work

### Option 1: Run the Migration Script (Fastest)

We've created a Node.js script that will automatically update ALL remaining imports:

```bash
# From project root
node migrate-imports.js
```

This script will:
- Find all `.ts` and `.tsx` files in `apps/web/src/`
- Update imports from local folders to `@marketplace/shared`
- Skip the folders we'll delete (api, stores, types, i18n)
- Show you statistics on what was changed

### Option 2: Manual Find & Replace (More Control)

If you prefer to see each change, use VS Code:

1. Open `apps/web/` folder in VS Code
2. Press `Ctrl+Shift+H` (Find and Replace in Files)
3. Make these replacements:

**Replace #1: Store Imports**
- Find: `from '../stores/authStore'`
- Replace: `from '@marketplace/shared'`
- Click "Replace All"

**Replace #2: API Client**
- Find: `import api from '../api/client'`
- Replace: `import { apiClient as api } from '@marketplace/shared'`
- Click "Replace All"

**Replace #3: API Imports**
- Find (RegEx): `from ['"](\.\.\/)+api\/`
- Replace: `from '@marketplace/shared`
- Enable RegEx mode (.*) and click "Replace All"

**Replace #4: Type Imports**
- Find (RegEx): `from ['"](\.\.\/)+types\/`
- Replace: `from '@marketplace/shared`
- Enable RegEx mode and click "Replace All"

**Replace #5: i18n Imports**
- Find (RegEx): `from ['"](\.\.\/)+i18n`
- Replace: `from '@marketplace/shared`
- Enable RegEx mode and click "Replace All"

**Replace #6: Nested Store Imports**
- Find: `from '../../stores/`
- Replace: `from '@marketplace/shared`
- Click "Replace All"

### Step 2: Test the Web App

```bash
# Install dependencies (makes sure shared package is linked)
pnpm install

# Start the web app
cd apps/web
pnpm dev
```

### Step 3: Verify Everything Works

Check these features:
- ✅ Login/logout works
- ✅ Creating tasks works
- ✅ Viewing tasks works
- ✅ Language switching works
- ✅ No console errors

### Step 4: Delete Duplicate Folders

**Only after confirming the web app works**, delete the duplicate folders:

```bash
# From project root
cd apps/web/src

# Windows PowerShell:
Remove-Item -Recurse -Force api
Remove-Item -Recurse -Force stores
Remove-Item -Recurse -Force types
Remove-Item -Recurse -Force i18n

# macOS/Linux:
rm -rf api/
rm -rf stores/
rm -rf types/
rm -rf i18n/
```

### Step 5: Commit the Changes

```bash
cd C:\Projects\marketplace-frontend
git add .
git commit -m "refactor: Complete Phase 1 - Migrate web app to use shared packages

- Updated all imports to use @marketplace/shared
- Deleted duplicate api/, stores/, types/, i18n/ folders from apps/web/src/
- Web app now shares all core logic with mobile app
- Phase 1 is now 100% complete"
```

### Step 6: Update the Roadmap

Update [Issue #19](https://github.com/ojayWillow/marketplace-frontend/issues/19):

- Change Phase 1 status from `🟡 90% Complete` to `✅ Complete`
- Add today's date to the Progress Log
- Celebrate! 🎉

## 📝 Files Likely Needing Updates

Based on the codebase structure, these files probably have imports that need updating:

### Pages
- `apps/web/src/pages/auth/*.tsx` (Login, Register, etc.)
- `apps/web/src/pages/Tasks/*.tsx`
- `apps/web/src/pages/Profile/*.tsx`
- `apps/web/src/pages/TaskDetail/*.tsx`
- `apps/web/src/pages/*.tsx` (all other pages)

### Components
- `apps/web/src/components/Layout/*.tsx`
- `apps/web/src/components/auth/*.tsx`
- `apps/web/src/components/offerings/*.tsx`
- `apps/web/src/components/*.tsx` (all other components)

### Hooks (if any use stores/types)
- `apps/web/src/hooks/*.ts`

## 🎯 Expected Import Patterns

### Before Migration:
```typescript
// Stores
import { useAuthStore } from '../stores/authStore'
import { useFavoritesStore } from '../stores/favoritesStore'
import { useToastStore } from '../stores/toastStore'

// API
import api from '../api/client'
import { getTasks } from '../api/tasks'

// Types
import type { User } from '../types/user'
import type { Task } from '../types/task'

// i18n
import { i18n } from '../i18n'
```

### After Migration:
```typescript
// Stores
import { useAuthStore, useFavoritesStore, useToastStore } from '@marketplace/shared'

// API
import { apiClient as api, getTasks } from '@marketplace/shared'

// Types
import type { User, Task } from '@marketplace/shared'

// i18n
import { i18n } from '@marketplace/shared'
```

## 🚨 Common Issues & Solutions

### Issue: "Cannot find module '@marketplace/shared'"
**Solution:** Run `pnpm install` from the project root.

### Issue: "Module not found: Error: Can't resolve '../api/client'"
**Solution:** Some imports haven't been updated yet. Search for that pattern and replace it.

### Issue: TypeScript errors after migration
**Solution:** Restart your IDE's TypeScript server (VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server")

### Issue: Types are different in shared package
**Solution:** Check if `packages/shared/src/types` matches what was in `apps/web/src/types`. If not, we may need to sync them.

## 📊 Progress Tracker

- [x] Create shared package structure
- [x] Mobile app uses shared package
- [x] Create migration script
- [x] Update sample files (ProtectedRoute, Home)
- [ ] Update all remaining web app files
- [ ] Test web app functionality
- [ ] Delete duplicate folders
- [ ] Commit changes
- [ ] Update roadmap issue

## 🎉 Success Criteria

### Phase 1 is complete when:
1. ✅ All imports in `apps/web/src/` use `@marketplace/shared`
2. ✅ No files import from `../api`, `../stores`, `../types`, or `../i18n`
3. ✅ Web app runs without errors (`pnpm dev` works)
4. ✅ Login, task creation, and basic features work
5. ✅ Duplicate folders are deleted from `apps/web/src/`
6. ✅ Changes are committed to git

---

**Last Updated:** January 19, 2026  
**Status:** In Progress (Manual migration needed for remaining files)  
**Estimated Time to Complete:** 15-30 minutes using migration script, 1-2 hours manually
