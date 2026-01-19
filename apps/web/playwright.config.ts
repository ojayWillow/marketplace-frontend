import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * 
 * BEFORE RUNNING TESTS:
 * 1. Start backend: cd marketplace-backend && python wsgi.py
 * 2. Start frontend: npm run dev
 * 3. Run tests: npm run test:e2e
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  /* Increased timeout for slower operations */
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  
  use: {
    /* Base URL for the frontend - Vite default port */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    /* Collect trace on failure */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on failure */
    video: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* Mobile viewports */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* 
   * Removed webServer auto-start - run servers manually:
   * 1. Backend: python wsgi.py (port 5000)
   * 2. Frontend: npm run dev (port 3000)
   */
});
