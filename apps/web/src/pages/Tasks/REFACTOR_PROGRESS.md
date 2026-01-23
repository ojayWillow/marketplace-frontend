# Tasks Component Refactoring Progress

## Goal
Split the monolithic Tasks.tsx (~1000 lines) into smaller, maintainable pieces.

## Progress

### ✅ Completed

1. **Folder Structure** - Created organized directory structure
   - `types/` - Shared TypeScript interfaces
   - `utils/` - Helper functions
   - `hooks/` - Custom React hooks
   - `components/` - UI components

2. **Utility Functions** - Extracted to `utils/`
   - ✅ `taskHelpers.ts` - calculateDistance, formatDistance, formatTimeAgo
   - ✅ `mapHelpers.ts` - addMarkerOffsets

3. **Card Components** - Extracted to `components/`
   - ✅ `TaskCard/` - Job card with types
   - ✅ `OfferingCard/` - Service offering card with types

### 🚧 In Progress

4. **Update Main Tasks.tsx** - Replace inline components with imports

### 📋 TODO

5. **Map Components** - Extract to `components/TaskMap/`
   - `MapMarkers.tsx`
   - `MapController.tsx`
   - `LocationPicker.tsx`
   - `JobMapPopup.tsx`
   - `OfferingMapPopup.tsx`
   - `mapIcons.ts` - Icon factory functions

6. **Banner Components** - Extract to `components/TaskBanners/`
   - `UrgentJobsBanner.tsx`
   - `MatchingJobsBanner.tsx`

7. **Custom Hooks** - Extract to `hooks/`
   - `useTaskData.ts` - Fetch logic
   - `useLocation.ts` - Location detection
   - `useTaskFilters.ts` - Filter logic

8. **Other Components**
   - `LocationModal.tsx` - Location search modal

## File Size Progress

- **Before**: ~1000 lines in Tasks.tsx
- **Current**: ~950 lines (cards extracted)
- **Target**: ~200-300 lines in main file

## Branch
`refactor/split-tasks-component`

## Testing Checklist

- [ ] All imports resolve correctly
- [ ] Map displays with correct markers
- [ ] Cards render with proper styling
- [ ] Filters work correctly
- [ ] Location detection works
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Mobile view works
- [ ] Desktop view works
