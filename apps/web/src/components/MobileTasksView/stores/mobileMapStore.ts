import { create } from 'zustand';
import { SheetPosition } from '../types';

/**
 * Zustand store that persists mobile map viewport and UI state
 * across tab navigation (Home → Work → Home).
 *
 * Zustand stores live outside React — they survive component
 * unmount/remount, which is exactly what happens on tab switches.
 */

interface MobileMapState {
  // Map viewport
  mapCenter: [number, number] | null;
  mapZoom: number | null;

  // Bottom sheet
  sheetPosition: SheetPosition;

  // Selected task (by ID, not full object — avoids stale data)
  selectedTaskId: number | null;

  // Actions
  setMapViewport: (center: [number, number], zoom: number) => void;
  setSheetPosition: (position: SheetPosition) => void;
  setSelectedTaskId: (id: number | null) => void;
  reset: () => void;
}

export const useMobileMapStore = create<MobileMapState>((set) => ({
  mapCenter: null,
  mapZoom: null,
  sheetPosition: 'collapsed',
  selectedTaskId: null,

  setMapViewport: (center, zoom) => set({ mapCenter: center, mapZoom: zoom }),
  setSheetPosition: (position) => set({ sheetPosition: position }),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  reset: () => set({
    mapCenter: null,
    mapZoom: null,
    sheetPosition: 'collapsed',
    selectedTaskId: null,
  }),
}));
