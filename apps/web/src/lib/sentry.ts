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
      // IndexedDB connection lost on iOS Safari (KOLAB-WEB-C)
      // iOS aggressively kills IndexedDB connections when backgrounded
      'Connection to Indexed Database server lost',
      'IndexedDB',
      // Firebase IndexedDB AbortError on iOS Safari (idb-open)
      // Triggered in Private Browsing, in-app browsers, or SW registration race
      'The operation was aborted',
      /idb-open/,
      // reCAPTCHA timeout — Firebase SDK rejects with string "Timeout" (KOLAB-WEB-9, KOLAB-WEB-8)
      /^Timeout/,
      /Non-Error promise rejection captured with value: Timeout/,
      // Service worker load failure on Safari (KOLAB-WEB-B)
      'Script.*load failed',
      /sw\.js.*load failed/,
      // reCAPTCHA null.style crash — known Firebase SDK bug (KOLAB-WEB-A)
      // https://github.com/firebase/firebase-js-sdk/issues/8844
      /Cannot read properties of null \(reading 'style'\)/,
      'recaptcha__',
    ],
    beforeSend(event) {
      if (import.meta.env.DEV) return null;
      return event;
    },
  });
}
