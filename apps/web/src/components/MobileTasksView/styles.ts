/**
 * Global styles for MobileTasksView component
 * Includes keyframe animations and utility classes
 */
export const mobileTasksStyles = `
  @keyframes pulse {
    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
  }
  @keyframes urgentPulse {
    0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
    70% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
    100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
  }
  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  @keyframes slideDown {
    from { transform: translateY(0); }
    to { transform: translateY(100%); }
  }
  .animate-slideUp {
    animation: slideUp 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .animate-slideDown {
    animation: slideDown 0.2s ease-in forwards;
  }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .mobile-tasks-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    background: #f3f4f6;
    z-index: 1;
  }
  .selected-marker {
    z-index: 1000 !important;
  }
  .leaflet-marker-icon.selected-marker {
    z-index: 1000 !important;
  }
  .urgent-marker {
    z-index: 500 !important;
  }

  /* ── Mobile map GPU acceleration ────────────────────────── */
  .mobile-map-container .leaflet-container {
    will-change: transform;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
  .mobile-map-container .leaflet-tile-pane {
    will-change: transform;
  }
  .mobile-map-container .leaflet-marker-pane {
    will-change: transform;
  }

  /* ── Pause marker animations during map interaction ────── */
  /* Applied via JS on movestart, removed on moveend.        */
  /* Frees the compositor from running infinite keyframes     */
  /* while Leaflet is repositioning tiles + markers.          */
  .map-interacting .leaflet-marker-icon * {
    animation-play-state: paused !important;
  }
  .map-interacting .user-location-icon * {
    animation-play-state: paused !important;
  }
`;
