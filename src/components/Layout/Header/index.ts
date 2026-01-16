// Main Header component
export { default } from './Header';
export { default as Header } from './Header';

// Sub-components (for direct imports if needed)
export { Logo } from './Logo';
export { DesktopNav, navLinkClass } from './DesktopNav';
export { NotificationBell } from './NotificationBell';
export { ProfileDropdown } from './ProfileDropdown';
export { MobileMenu } from './MobileMenu';

// Hooks
export { useNotifications } from './hooks/useNotifications';
export type { NotificationCounts, UseNotificationsReturn } from './hooks/useNotifications';
