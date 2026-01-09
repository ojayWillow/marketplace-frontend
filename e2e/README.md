# E2E Tests with Playwright

End-to-end tests for the Marketplace frontend using [Playwright](https://playwright.dev/).

## Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

## Running Tests

### Prerequisites

Make sure the **backend is running** before running E2E tests:

```bash
# In marketplace-backend directory
python wsgi.py
# Backend runs on http://localhost:5000
```

### Run Tests

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Run specific test by name
npx playwright test -g "should login with valid credentials"
```

### View Reports

```bash
# After tests complete, view the HTML report
npm run test:e2e:report
```

## Test Structure

```
e2e/
├── auth.spec.ts      # Authentication tests (login, register, logout)
├── tasks.spec.ts     # Quick Help task tests (create, apply, workflow)
├── listings.spec.ts  # Buy/Sell listing tests (browse, create, edit)
└── README.md         # This file
```

## Test Coverage

### Authentication (`auth.spec.ts`)
- ✅ Registration form display
- ✅ Register new user
- ✅ Duplicate username error
- ✅ Login form display
- ✅ Login with valid credentials
- ✅ Invalid credentials error
- ✅ Protected route redirect
- ✅ Access profile when logged in

### Quick Help Tasks (`tasks.spec.ts`)
- ✅ Browse tasks page
- ✅ Task cards display
- ✅ Category filtering
- ✅ Login required for creation
- ✅ Create task form
- ✅ Create task successfully
- ✅ Field validation
- ✅ View task details
- ✅ Apply to task (multi-user)

### Buy/Sell Listings (`listings.spec.ts`)
- ✅ Browse listings page
- ✅ Listing cards display
- ✅ Category filtering
- ✅ Search functionality
- ✅ Login required for creation
- ✅ Create listing form
- ✅ Create listing successfully
- ✅ View listing details
- ✅ Seller information display
- ✅ Edit own listing

## Configuration

Tests are configured in `playwright.config.ts`:

- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Pixel 5, iPhone 12
- **Base URL**: `http://localhost:5173`
- **Screenshots**: On failure
- **Videos**: On first retry
- **Traces**: On first retry

## Writing New Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/some-page');
    
    // Interact with elements
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByRole('button', { name: /submit/i }).click();
    
    // Assert results
    await expect(page.getByText(/success/i)).toBeVisible();
  });
});
```

## Tips

1. **Use `data-testid`** attributes for stable selectors
2. **Flexible selectors**: Use regex patterns like `/login|sign in/i`
3. **Wait for navigation**: Use `page.waitForURL()` after form submissions
4. **Unique test data**: Generate unique usernames/emails with `Date.now()`
5. **Multi-user tests**: Use `browser.newContext()` for isolated sessions

## Debugging

```bash
# Run with Playwright Inspector
npx playwright test --debug

# Generate code by recording actions
npx playwright codegen localhost:5173
```
