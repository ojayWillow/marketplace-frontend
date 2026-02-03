/**
 * Global styles for MobileTasksView component
 * Includes keyframe animations and utility classes
 */
export const mobileTasksStyles = `
  @keyframes pulse {
    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
  }
  @keyframes slideUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes slideDown {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(100%); opacity: 0; }
  }
  .animate-slideUp {
    animation: slideUp 0.3s ease-out forwards;
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
    z-index: 9999;
  }
  .mobile-tasks-container .leaflet-container {
    z-index: 1 !important;
  }
  .mobile-tasks-container .leaflet-pane {
    z-index: 1 !important;
  }
  .mobile-tasks-container .leaflet-top,
  .mobile-tasks-container .leaflet-bottom {
    z-index: 500 !important;
  }
  .mobile-top-bar {
    position: relative;
    z-index: 10000 !important;
  }
  .mobile-notification-dropdown {
    position: fixed !important;
    z-index: 99999 !important;
  }
  .selected-marker {
    z-index: 1000 !important;
  }
  .leaflet-marker-icon.selected-marker {
    z-index: 1000 !important;
  }
`;
