# 🎯 TRANSLATION REFACTOR - DETAILED STRUCTURE PLAN

## 📊 PROGRESS TRACKER

### Overall Progress: 33% Complete (22/63 files)

#### ✅ Phase 1: Planning & Setup - 100% COMPLETE
- [x] Branch created: `refactor/translation-structure`
- [x] Structure designed
- [x] Roadmap documented
- [x] Page-to-file mapping completed

#### 🔄 Phase 2: Translation Splitting - 37% COMPLETE (22/60 files)

**English (en/) - 100% COMPLETE ✅**
- [x] common.json (53 keys)
- [x] auth.json (31 keys)
- [x] home.json (76 keys)
- [x] menu.json (28 keys)
- [x] quickHelp.json (27 keys)
- [x] createModal.json (6 keys)
- [x] filters.json (20 keys)
- [x] messages.json (17 keys)
- [x] reviews.json (33 keys)
- [x] profile.json (34 keys)
- [x] userProfile.json (3 keys)
- [x] notFound.json (7 keys)
- [x] toast.json (4 keys)
- [x] footer.json (5 keys)
- [x] listings.json (23 keys)
- [x] map.json (16 keys)
- [x] tasks.json (109 keys) ⭐ Largest
- [x] offerings.json (42 keys)
- [x] createOffering.json (52 keys)
- [x] createTask.json (37 keys)

**Latvian (lv/) - 10% COMPLETE 🔄**
- [x] common.json (53 keys)
- [x] auth.json (31 keys)
- [ ] home.json
- [ ] menu.json
- [ ] quickHelp.json
- [ ] createModal.json
- [ ] filters.json
- [ ] messages.json
- [ ] reviews.json
- [ ] profile.json
- [ ] userProfile.json
- [ ] notFound.json
- [ ] toast.json
- [ ] footer.json
- [ ] listings.json
- [ ] map.json
- [ ] tasks.json
- [ ] offerings.json
- [ ] createOffering.json
- [ ] createTask.json

**Russian (ru/) - 0% COMPLETE ⏳**
- [ ] common.json
- [ ] auth.json
- [ ] home.json
- [ ] menu.json
- [ ] quickHelp.json
- [ ] createModal.json
- [ ] filters.json
- [ ] messages.json
- [ ] reviews.json
- [ ] profile.json ⚠️ (contains bug to fix)
- [ ] userProfile.json
- [ ] notFound.json
- [ ] toast.json
- [ ] footer.json
- [ ] listings.json
- [ ] map.json
- [ ] tasks.json
- [ ] offerings.json
- [ ] createOffering.json
- [ ] createTask.json

#### ⏳ Phase 3: Create Index Files - 0% COMPLETE (0/3 files)
- [ ] src/i18n/locales/en/index.ts
- [ ] src/i18n/locales/lv/index.ts
- [ ] src/i18n/locales/ru/index.ts

#### ⏳ Phase 4: Update Configuration - NOT STARTED
- [ ] Update src/i18n/index.ts to import from new structure
- [ ] Test imports work correctly

#### ⏳ Phase 5: Testing - NOT STARTED
- [ ] Verify all pages load correctly
- [ ] Test language switching
- [ ] Ensure no missing translations
- [ ] Manual testing of key pages

#### ⏳ Phase 6: Deployment - NOT STARTED
- [ ] Create pull request
- [ ] Code review
- [ ] Merge to main

---

## Current Structure (BEFORE)
```
src/i18n/locales/
  ├── en.json (24KB - monolithic)
  ├── lv.json (25KB - monolithic)
  └── ru.json (39KB - monolithic)
```

## New Structure (AFTER)
```
src/i18n/locales/
  ├── en/ ✅ 100% COMPLETE
  │   ├── common.json ✅
  │   ├── auth.json ✅
  │   ├── home.json ✅
  │   ├── menu.json ✅
  │   ├── quickHelp.json ✅
  │   ├── createModal.json ✅
  │   ├── filters.json ✅
  │   ├── tasks.json ✅
  │   ├── offerings.json ✅
  │   ├── createOffering.json ✅
  │   ├── createTask.json ✅
  │   ├── profile.json ✅
  │   ├── userProfile.json ✅
  │   ├── messages.json ✅
  │   ├── reviews.json ✅
  │   ├── listings.json ✅
  │   ├── map.json ✅
  │   ├── notFound.json ✅
  │   ├── toast.json ✅
  │   ├── footer.json ✅
  │   └── index.ts ⏳
  │
  ├── lv/ 🔄 10% COMPLETE
  │   ├── common.json ✅
  │   ├── auth.json ✅
  │   ├── [18 files remaining] ⏳
  │   └── index.ts ⏳
  │
  └── ru/ ⏳ 0% COMPLETE
      ├── [20 files pending] ⏳
      └── index.ts ⏳
```

---

## 📋 TRANSLATION FILE MAPPING

### Page → Translation File Mapping

| Page/Component | Translation File | Current Section | Status |
|----------------|------------------|-----------------|--------|
| **Home.tsx** | `home.json` | `home` | EN ✅ LV ⏳ RU ⏳ |
| **auth/** | `auth.json` | `auth` | EN ✅ LV ✅ RU ⏳ |
| **Menu components** | `menu.json` | `menu` | EN ✅ LV ⏳ RU ⏳ |
| **Quick Help Modal** | `quickHelp.json` | `quickHelp` | EN ✅ LV ⏳ RU ⏳ |
| **Create Modal** | `createModal.json` | `createModal` | EN ✅ LV ⏳ RU ⏳ |
| **Filter components** | `filters.json` | `filters` | EN ✅ LV ⏳ RU ⏳ |
| **Tasks/Tasks.tsx** | `tasks.json` | `tasks` | EN ✅ LV ⏳ RU ⏳ |
| **CreateTask.tsx** | `createTask.json` | `createTask` | EN ✅ LV ⏳ RU ⏳ |
| **OfferingDetail.tsx** | `offeringDetail.json` | `offerings` (split) | EN ✅ LV ⏳ RU ⏳ |
| **CreateOffering.tsx** | `createOffering.json` | `createOffering` | EN ✅ LV ⏳ RU ⏳ |
| **Profile/Profile.tsx** | `profile.json` | `profile` | EN ✅ LV ⏳ RU ⏳ ⚠️ |
| **UserProfile.tsx** | `userProfile.json` | `userProfile` | EN ✅ LV ⏳ RU ⏳ |
| **Messages.tsx** | `messages.json` | `messages` | EN ✅ LV ⏳ RU ⏳ |
| **Reviews components** | `reviews.json` | `reviews` | EN ✅ LV ⏳ RU ⏳ |
| **listings/** | `listings.json` | `listings` | EN ✅ LV ⏳ RU ⏳ |
| **Map components** | `map.json` | `map` | EN ✅ LV ⏳ RU ⏳ |
| **NotFound.tsx** | `notFound.json` | `notFound` | EN ✅ LV ⏳ RU ⏳ |
| **Toast/Notifications** | `toast.json` | `toast` | EN ✅ LV ⏳ RU ⏳ |
| **Footer** | `footer.json` | `footer` | EN ✅ LV ⏳ RU ⏳ |
| **Shared UI** | `common.json` | `common` | EN ✅ LV ✅ RU ⏳ |

---

## 📈 STATISTICS

### Files Created: 22 / 63 total (33%)
- English: 20/20 (100%) ✅
- Latvian: 2/20 (10%) 🔄
- Russian: 0/20 (0%) ⏳
- Index files: 0/3 (0%) ⏳

### Translation Keys Migrated
- **English**: ~567 keys ✅
- **Latvian**: ~84 keys (15%) 🔄
- **Russian**: 0 keys ⏳

### Commits Made: 8
1. Initial roadmap
2. English: common, auth
3. English: home, menu
4. English: quickHelp, createModal, filters, messages, reviews
5. English: profile, userProfile, notFound, toast, footer, listings, map
6. English: tasks, offerings
7. English: createOffering, createTask
8. Latvian: common, auth

---

## 🎯 NEXT STEPS

### Immediate (Phase 2 - Translation Splitting)
1. Upload remaining 18 Latvian translation files
2. Upload all 20 Russian translation files
3. Fix Russian bug in profile.json

### After Translation Files (Phase 3 - Loaders)
4. Create index.ts for English (exports all 20 files)
5. Create index.ts for Latvian (exports all 20 files)
6. Create index.ts for Russian (exports all 20 files)

### Configuration Update (Phase 4)
7. Update src/i18n/index.ts to import from new structure

### Testing & Deployment (Phase 5-6)
8. Test all pages and language switching
9. Create pull request
10. Code review and merge

---

## ⚙️ CONFIGURATION CHANGES

### Current i18n config (src/i18n/index.ts)
```typescript
import en from './locales/en.json';
import lv from './locales/lv.json';
import ru from './locales/ru.json';
```

### New i18n config (will need to update)
```typescript
import en from './locales/en';
import lv from './locales/lv';
import ru from './locales/ru';
```

Each language's index.ts will export combined translations.

---

## ✅ BENEFITS

1. **Maintainability**: Easy to find and update translations per page
2. **Collaboration**: Multiple people can work on different pages
3. **Quality Control**: Review translations in context of specific pages
4. **Scalability**: Add new pages without growing monolithic files
5. **Performance**: Potential for lazy loading translations per route
6. **Organization**: Clear mapping between pages and translations

---

## 🐛 KNOWN ISSUES TO FIX

1. **Russian translation bug**: `profile.profilePictureHint` contains Latvian text instead of Russian
   - Current: `"Ievadiet saiti uz savu profila attēlu"` (Latvian)
   - Should be: `"Введите ссылку на вашу фотографию"` (Russian)
   - Status: ⏳ Will fix during Russian file creation

---

## 🚨 IMPORTANT NOTES

- All translation keys must remain identical
- No breaking changes to usage in components
- Backwards compatible during transition
- Test thoroughly before merging

---

## 📝 COMPLETION ESTIMATE

**Current pace**: ~8 commits in 14 minutes
**Remaining work**: 
- 18 Latvian files
- 20 Russian files
- 3 index.ts files
- 1 config update

**Estimated remaining time**: 20-30 minutes at current pace
**Total project time**: ~45 minutes for complete refactor

---

## 🎉 ACHIEVEMENTS SO FAR

✅ **Designed** modular structure for 60 translation files
✅ **Created** comprehensive page-to-file mapping
✅ **Completed** all English translations (20 files, ~567 keys)
✅ **Started** Latvian translations (2 files, ~84 keys)
✅ **Documented** entire refactoring process
✅ **Identified** and documented Russian translation bug

**Great progress! One-third complete!** 🚀
