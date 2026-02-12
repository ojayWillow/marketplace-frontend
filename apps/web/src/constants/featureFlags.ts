/**
 * Central feature flags for Kolab.
 *
 * Flip a flag to true/false to enable/disable a feature across
 * the entire app without touching individual components.
 *
 * When a feature is ready to launch, just set it to `true` here.
 */

export const FEATURES = {
  /**
   * Urgent jobs — ⚡ badge, red styling, priority sorting, creation toggle.
   * Coming soon: will auto-expire after 24h and become a paid boost.
   * Set to `true` to re-enable.
   */
  URGENT: false,
} as const;
