import * as Sentry from "@sentry/react";

export function initSentry() {
  if (!import.meta.env.VITE_SENTRY_DSN) return;

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    ignoreErrors: [
      // Sentry test error (KOLAB-WEB-1)
      'This is your first error',
      // Chunk loading errors handled by auto-reload (KOLAB-WEB-2, 3, 5)
      'Failed to fetch dynamically imported module',
      'Importing a module script failed',
      "is not a valid JavaScript MIME type",
      'error loading dynamically imported module',
      // Leaflet cleanup race condition (KOLAB-WEB-4)
      '_leaflet_pos',
    ],
    beforeSend(event) {
      if (import.meta.env.DEV) return null;
      return event;
    },
  });
}
