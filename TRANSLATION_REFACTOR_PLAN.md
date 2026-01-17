# 🎯 TRANSLATION REFACTOR - DETAILED STRUCTURE PLAN

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
  ├── en/
  │   ├── common.json              # Shared UI (buttons, navigation, status)
  │   ├── auth.json                # Login, Register, Phone Verification
  │   ├── home.json                # Homepage
  │   ├── menu.json                # Navigation menu, sidebar
  │   ├── quickHelp.json           # Quick Help welcome modal
  │   ├── createModal.json         # Job/Service creation modal
  │   ├── filters.json             # Search filters
  │   │
  │   ├── tasks.json               # Tasks listing page
  │   ├── taskDetail.json          # Task detail page
  │   ├── createTask.json          # Create/Edit task forms
  │   │
  │   ├── offerings.json           # Offerings listing page
  │   ├── offeringDetail.json      # Offering detail page
  │   ├── createOffering.json      # Create/Edit offering forms
  │   │
  │   ├── profile.json             # My Profile page
  │   ├── userProfile.json         # View other user's profile
  │   │
  │   ├── messages.json            # Messages list & conversation
  │   ├── favorites.json           # Favorites page
  │   ├── reviews.json             # Reviews system
  │   │
  │   ├── listings.json            # Marketplace listings
  │   ├── map.json                 # Map interface
  │   ├── notFound.json            # 404 page
  │   ├── toast.json               # Notifications
  │   ├── footer.json              # Footer
  │   └── index.ts                 # Export all translations
  │
  ├── lv/
  │   └── [same structure as en/]
  │
  └── ru/
      └── [same structure as en/]
```

---

## 📋 TRANSLATION FILE MAPPING

### Page → Translation File Mapping

| Page/Component | Translation File | Current Section | Notes |
|----------------|------------------|-----------------|-------|
| **Home.tsx** | `home.json` | `home` | Homepage content |
| **auth/** | `auth.json` | `auth` | Login, Register, Phone verification |
| **Menu components** | `menu.json` | `menu` | Navigation, sidebar |
| **Quick Help Modal** | `quickHelp.json` | `quickHelp` | Welcome/onboarding modal |
| **Create Modal** | `createModal.json` | `createModal` | Job vs Service selection |
| **Filter components** | `filters.json` | `filters` | Search & filter UI |
| | | |
| **Tasks/Tasks.tsx** | `tasks.json` | `tasks` | Tasks listing |
| **TaskDetail/** | `taskDetail.json` | `tasks` (split) | Individual task view |
| **CreateTask.tsx** | `createTask.json` | `createTask` | Create/edit task form |
| **EditTask.tsx** | `createTask.json` | `createTask` | Reuses same translations |
| | | |
| **OfferingDetail.tsx** | `offeringDetail.json` | `offerings` (split) | Individual offering view |
| **CreateOffering.tsx** | `createOffering.json` | `createOffering` | Create/edit offering form |
| **EditOffering.tsx** | `createOffering.json` | `createOffering` | Reuses same translations |
| | | |
| **Profile/Profile.tsx** | `profile.json` | `profile` | My profile page |
| **UserProfile.tsx** | `userProfile.json` | `userProfile` | Other user's profile |
| | | |
| **Messages.tsx** | `messages.json` | `messages` | Messages list |
| **Conversation.tsx** | `messages.json` | `messages` | Conversation view |
| **Favorites.tsx** | `favorites.json` | (new) | Favorites page |
| **Reviews components** | `reviews.json` | `reviews` | Review system |
| | | |
| **listings/** | `listings.json` | `listings` | Marketplace listings |
| **Map components** | `map.json` | `map` | Map interface |
| **NotFound.tsx** | `notFound.json` | `notFound` | 404 page |
| **Toast/Notifications** | `toast.json` | `toast` | Notification messages |
| **Footer** | `footer.json` | `footer` | Footer links |
| **Shared UI** | `common.json` | `common` | Buttons, status, etc. |

---

## 🔧 IMPLEMENTATION STEPS

### Phase 1: Create New Structure ✅ DONE
- [x] Create new branch: `refactor/translation-structure`
- [x] Document roadmap
- [ ] Create new directory structure

### Phase 2: Split Translations
- [ ] Split English translations into modular files
- [ ] Split Latvian translations into modular files
- [ ] Split Russian translations into modular files
- [ ] Fix Russian bug: `profilePictureHint` has Latvian text

### Phase 3: Create Loaders
- [ ] Create `index.ts` in each language folder
- [ ] Update `src/i18n/index.ts` configuration
- [ ] Test imports work correctly

### Phase 4: Testing
- [ ] Verify all pages load correctly
- [ ] Check language switching works
- [ ] Ensure no missing translations
- [ ] Manual testing of key pages

### Phase 5: Deployment
- [ ] Create pull request
- [ ] Code review
- [ ] Merge to main

---

## 📦 FILE BREAKDOWN

### common.json (~30 keys)
- UI elements: buttons (save, cancel, delete, edit, create)
- Navigation: home, listings, quickHelp, login, register
- Status: loading, error, active, paused
- General: price, location, category, description, contact

### tasks.json (~80 keys)
- Task listing page
- Empty states
- Search/filter
- Task cards
- Status badges
- Map view

### taskDetail.json (~20 keys)  
- Individual task view
- Accept/Apply actions
- Navigation buttons
- Status updates

### createTask.json (~30 keys)
- Task creation form
- All form fields
- Validation messages
- Category descriptions

### offerings.json (~40 keys)
- Offerings listing
- Empty states
- Provider info

### offeringDetail.json (~15 keys)
- Individual offering view
- Contact provider
- Hire actions

### createOffering.json (~35 keys)
- Offering creation form
- Service radius options
- Tips section

### profile.json (~30 keys)
- My profile view
- Edit profile
- Activity management

### messages.json (~20 keys)
- Messages list
- Conversation view
- Chat interface

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

## 🚨 IMPORTANT NOTES

- All translation keys must remain identical
- No breaking changes to usage in components
- Backwards compatible during transition
- Test thoroughly before merging

---

## 🐛 KNOWN ISSUES TO FIX

1. **Russian translation bug**: `profile.profilePictureHint` contains Latvian text instead of Russian
   - Current: `"Ievadiet saiti uz savu profila attēlu"` (Latvian)
   - Should be: `"Введите ссылку на вашу фотографию"` (Russian)
