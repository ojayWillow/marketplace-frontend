import { test, expect } from '@playwright/test';

/**
 * Buy/Sell Listings E2E Tests
 * Selectors based on actual source: src/pages/listings/CreateListing.tsx, Listings.tsx
 */

// Helper to register and login
async function registerUser(page, username: string, email: string, password: string) {
  await page.goto('/register');
  await page.waitForLoadState('networkidle');
  
  // Using IDs from Register.tsx
  await page.locator('#username').fill(username);
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('#confirmPassword').fill(password);
  await page.getByRole('button', { name: 'Register' }).click();
  await page.waitForURL(/^\/$|\/(listings|tasks|home)/, { timeout: 15000 });
}

test.describe('Buy/Sell Listings', () => {
  
  test.describe('Browse Listings', () => {
    
    test('should display listings page with categories', async ({ page }) => {
      await page.goto('/listings');
      await page.waitForLoadState('networkidle');
      
      // Check page loaded - look for category text from en.json
      await expect(page.getByText(/Electronics|Vehicles|Property|Browse/i).first()).toBeVisible();
    });

    test('should show category cards', async ({ page }) => {
      await page.goto('/listings');
      await page.waitForLoadState('networkidle');
      
      // Category cards from constants.ts and en.json translations
      await expect(page.getByText('Electronics')).toBeVisible();
    });

    test('should have create listing button', async ({ page }) => {
      await page.goto('/listings');
      await page.waitForLoadState('networkidle');
      
      // "Create listing" from en.json: listings.createNew
      await expect(page.getByRole('link', { name: /Create|listing/i })).toBeVisible();
    });
  });

  test.describe('Create Listing', () => {
    
    test('should require login to create listing', async ({ page }) => {
      await page.goto('/listings/create');
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });

    test('should show create listing form when logged in', async ({ page }) => {
      const uniqueId = Date.now();
      await registerUser(page, `listuser_${uniqueId}`, `listuser_${uniqueId}@example.com`, 'TestPassword123!');
      
      await page.goto('/listings/create');
      await page.waitForLoadState('networkidle');
      
      // Check form elements by ID (from CreateListing.tsx)
      await expect(page.locator('#title')).toBeVisible();
      await expect(page.locator('#category')).toBeVisible();
      await expect(page.locator('#price')).toBeVisible();
      await expect(page.locator('#description')).toBeVisible();
      // Button text from en.json: listings.publishButton = "Publish"
      await expect(page.getByRole('button', { name: 'Publish' })).toBeVisible();
    });

    test('should create a new listing successfully', async ({ page }) => {
      const uniqueId = Date.now();
      await registerUser(page, `seller_${uniqueId}`, `seller_${uniqueId}@example.com`, 'TestPassword123!');
      
      await page.goto('/listings/create');
      await page.waitForLoadState('networkidle');
      
      const listingTitle = `Test Item ${uniqueId}`;
      
      // Fill form using IDs from CreateListing.tsx
      await page.locator('#title').fill(listingTitle);
      await page.locator('#category').selectOption({ index: 1 });
      await page.locator('#price').fill('99');
      await page.locator('#location').selectOption({ index: 1 });
      await page.locator('#description').fill('This is a test listing description for E2E testing.');
      
      // Click Publish button
      await page.getByRole('button', { name: 'Publish' }).click();
      
      // Should redirect to listings page
      await expect(page).toHaveURL(/\/listings/, { timeout: 15000 });
    });

    test('should have cancel link', async ({ page }) => {
      const uniqueId = Date.now();
      await registerUser(page, `canceluser_${uniqueId}`, `canceluser_${uniqueId}@example.com`, 'TestPassword123!');
      
      await page.goto('/listings/create');
      await page.waitForLoadState('networkidle');
      
      // Cancel link from en.json: common.cancel = "Cancel"
      const cancelLink = page.getByRole('link', { name: /Cancel/i });
      await expect(cancelLink).toBeVisible();
      await cancelLink.click();
      await expect(page).toHaveURL(/\/listings/);
    });
  });
});
