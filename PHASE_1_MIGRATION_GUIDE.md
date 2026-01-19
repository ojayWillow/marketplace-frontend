# Phase 1: Shared Package Migration Guide

This guide explains how to complete Phase 1 by migrating the web app to use shared packages.

## 🎯 Goal

Eliminate code duplication by having both `apps/web` and `apps/mobile` import from `packages/shared`.

---

## 📊 Current State

### ✅ What's Already Done

1. **Shared package created** - `packages/shared/` with:
   - ✅ `src/api/` - All API endpoints
   - ✅ `src/types/` - TypeScript types
   - ✅ `src/stores/` - Zustand stores (auth, favorites, matching, toast)
   - ✅ `src/i18n/` - Internationalization

2. **Mobile app already uses shared package** ✅
   - Imports from `@marketplace/shared`
   - No local duplication

3. **Shared package dependency added to web app** ✅
   - `"@marketplace/shared": "workspace:*"` in `apps/web/package.json`

### ❌ What Needs to Be Done

**Web app still has duplicate code:**
- ❌ `apps/web/src/api/` (duplicate)
- ❌ `apps/web/src/stores/` (duplicate)
- ❌ `apps/web/src/types/` (duplicate)
- ❌ `apps/web/src/i18n/` (duplicate)

---

## 🔧 Migration Steps

### Step 1: Install Dependencies

```bash
# From project root
cd C:\Projects\marketplace-frontend
pnpm install
```

This will link the shared package to the web app.

### Step 2: Update Import Paths

Replace all imports in `apps/web/src/` that reference local folders:

#### Before (Old):
```typescript
import { apiClient } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import type { User } from '../types/user';
import { i18n } from '../i18n';
```

#### After (New):
```typescript
import { apiClient, useAuthStore } from '@marketplace/shared';
import type { User } from '@marketplace/shared';
import { i18n } from '@marketplace/shared';
```

### Step 3: Files That Need Updating

Search and replace imports in these locations:

1. **`apps/web/src/components/`** - All component files
2. **`apps/web/src/pages/`** - All page files
3. **`apps/web/src/hooks/`** - Custom hooks
4. **`apps/web/src/App.tsx`** - Main app file
5. **`apps/web/src/lib/`** - Utility files

### Step 4: Verify No Duplicates

Check if web app has any customizations in local folders that aren't in shared:

```bash
# Compare api folders
diff apps/web/src/api packages/shared/src/api

# Compare stores
diff apps/web/src/stores packages/shared/src/stores

# Compare types
diff apps/web/src/types packages/shared/src/types

# Compare i18n
diff apps/web/src/i18n packages/shared/src/i18n
```

If any web-specific code exists, move it to shared package first.

### Step 5: Delete Duplicate Folders

Once all imports are updated and web app builds successfully:

```bash
cd apps/web/src
rm -rf api/
rm -rf stores/
rm -rf types/
rm -rf i18n/
```

**Windows PowerShell:**
```powershell
cd apps\web\src
Remove-Item -Recurse -Force api
Remove-Item -Recurse -Force stores
Remove-Item -Recurse -Force types
Remove-Item -Recurse -Force i18n
```

### Step 6: Test Web App

```bash
cd apps/web
pnpm dev
```

Verify:
- ✅ App builds without errors
- ✅ Login/logout works
- ✅ API calls work
- ✅ Translations load
- ✅ All features functional

---

## 🔍 Finding Import Statements

### VS Code Search & Replace

1. Open `apps/web/` in VS Code
2. Press `Ctrl+Shift+F` (Find in Files)
3. Search for: `from '../api`
4. Replace with: `from '@marketplace/shared`
5. Repeat for:
   - `from '../stores`
   - `from '../types`
   - `from '../i18n`
   - `from '../../api` (for nested files)
   - `from '../../stores`
   - etc.

### RegEx Pattern (Advanced)

```regex
from ['"](\.\.\/)+(?:api|stores|types|i18n)
```

Replace with:
```
from '@marketplace/shared
```

---

## 📦 Shared Package Exports

### What's Available from `@marketplace/shared`:

```typescript
// API
import { 
  apiClient,
  authAPI,
  tasksAPI,
  offeringsAPI,
  messagesAPI,
  notificationsAPI,
  // ... all other APIs
} from '@marketplace/shared';

// Stores
import { 
  useAuthStore,
  useFavoritesStore,
  useMatchingStore,
  useToastStore,
} from '@marketplace/shared';

// Types
import type { 
  User,
  Task,
  Offering,
  Message,
  // ... all other types
} from '@marketplace/shared';

// i18n
import { i18n } from '@marketplace/shared';
```

---

## ⚠️ Common Issues

### Issue 1: "Cannot find module '@marketplace/shared'"

**Solution:** Run `pnpm install` from project root.

### Issue 2: "Type errors after migration"

**Solution:** Check if types in shared package match web app expectations. May need to sync.

### Issue 3: "Build fails with path errors"

**Solution:** Make sure all relative imports (`../api`, etc.) are replaced with `@marketplace/shared`.

### Issue 4: "Web app-specific customizations"

**Solution:** 
- If code is web-only (e.g., web push notifications), keep it in `apps/web/src/lib/`
- If code can be shared, move to `packages/shared/src/` first
- Use platform detection if needed (like we did for storage)

---

## ✅ Completion Checklist

- [ ] Run `pnpm install` from root
- [ ] Update all imports in `apps/web/src/components/`
- [ ] Update all imports in `apps/web/src/pages/`
- [ ] Update all imports in `apps/web/src/hooks/`
- [ ] Update imports in `apps/web/src/App.tsx`
- [ ] Update imports in `apps/web/src/lib/`
- [ ] Verify no custom code in duplicate folders
- [ ] Delete `apps/web/src/api/`
- [ ] Delete `apps/web/src/stores/`
- [ ] Delete `apps/web/src/types/`
- [ ] Delete `apps/web/src/i18n/`
- [ ] Test web app builds: `cd apps/web && pnpm dev`
- [ ] Test all features work
- [ ] Commit changes

---

## 🎉 Benefits After Migration

✅ **Single source of truth** - API/types/stores defined once  
✅ **Easier maintenance** - Fix bugs in one place  
✅ **Consistent behavior** - Web and mobile use identical logic  
✅ **Faster development** - Add features to both apps simultaneously  
✅ **Better TypeScript** - Shared types ensure consistency  

---

## 📝 Next Steps After Completion

1. Update Issue #19 to mark Phase 1 as **COMPLETE** ✅
2. Proceed to **Phase 3: Core Screens**
3. Build Home/Tasks/Messages screens with shared API

---

**Estimated Time:** 1-2 hours (mostly find & replace)  
**Difficulty:** Medium (careful with imports)  
**Impact:** High (eliminates all duplication)

---

## 🆘 Need Help?

If you encounter issues during migration:

1. Check the shared package exports in `packages/shared/src/index.ts`
2. Verify your imports match the exported names
3. Run `pnpm build` from root to catch TypeScript errors early
4. Test incrementally (update one folder at a time)

---

**Migration Guide Created:** January 19, 2026  
**Status:** Ready to execute
