import { test, expect } from '@playwright/test';

/**
 * Buy/Sell Listings E2E Tests
 * URL: /listings (Browse Categories), /listings/create
 */

// Helper to register and login
async function registerUser(page, username: string, email: string, password: string) {
  await page.goto('/register');
  await page.locator('input[name="username"], input[id="username"]').first().fill(username);
  await page.locator('input[type="email"], input[name="email"]').first().fill(email);
  await page.locator('input[type="password"]').first().fill(password);
  await page.locator('input[type="password"]').nth(1).fill(password);
  await page.getByRole('button', { name: 'Register' }).click();
  await page.waitForURL(/^\/$|\/listings|\/tasks/, { timeout: 10000 });
}

test.describe('Buy/Sell Listings', () => {
  
  test.describe('Browse Listings', () => {
    
    test('should display listings page with categories', async ({ page }) => {
      await page.goto('/listings');
      
      // Heading: "Browse Categories"
      await expect(page.getByRole('heading', { name: 'Browse Categories' })).toBeVisible();
    });

    test('should show category cards', async ({ page }) => {
      await page.goto('/listings');
      
      // Category cards: Electronics, Vehicles, Property, Furniture, Clothing, Sports, Other
      await expect(page.getByText('Electronics')).toBeVisible();
      await expect(page.getByText('Vehicles')).toBeVisible();
      await expect(page.getByText('Property')).toBeVisible();
    });

    test('should have create listing button', async ({ page }) => {
      await page.goto('/listings');
      
      // "Create Listing" button
      await expect(page.getByRole('link', { name: /Create Listing/i })).toBeVisible();
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
      
      // Form fields: Title, Category, Price, City/Region, Description
      await expect(page.getByText('Title')).toBeVisible();
      await expect(page.getByText('Category')).toBeVisible();
      await expect(page.getByText('Price')).toBeVisible();
      await expect(page.getByText('Description')).toBeVisible();
      // Button: "Publish"
      await expect(page.getByRole('button', { name: 'Publish' })).toBeVisible();
    });

    test('should create a new listing successfully', async ({ page }) => {
      const uniqueId = Date.now();
      await registerUser(page, `seller_${uniqueId}`, `seller_${uniqueId}@example.com`, 'TestPassword123!');
      
      await page.goto('/listings/create');
      
      const listingTitle = `Test Item ${uniqueId}`;
      
      // Fill Title
      await page.locator('input[name="title"], input[id="title"]').fill(listingTitle);
      
      // Select Category (first real option)
      await page.locator('select[name="category"], select[id="category"]').selectOption({ index: 1 });
      
      // Fill Price
      await page.locator('input[name="price"], input[id="price"]').fill('99');
      
      // Select City/Region if present
      const citySelect = page.locator('select').filter({ hasText: /Riga|Visa Latvija/i });
      if (await citySelect.isVisible().catch(() => false)) {
        await citySelect.selectOption({ index: 1 });
      }
      
      // Fill Description
      await page.locator('textarea[name="description"], textarea[id="description"]').fill('This is a test listing description for E2E testing.');
      
      // Click Publish
      await page.getByRole('button', { name: 'Publish' }).click();
      
      // Should redirect to listings
      await expect(page).toHaveURL(/\/listings/, { timeout: 10000 });
    });

    test('should have cancel link', async ({ page }) => {
      const uniqueId = Date.now();
      await registerUser(page, `canceluser_${uniqueId}`, `canceluser_${uniqueId}@example.com`, 'TestPassword123!');
      
      await page.goto('/listings/create');
      
      // Cancel link back to /listings
      const cancelLink = page.getByRole('link', { name: /Cancel/i });
      await expect(cancelLink).toBeVisible();
      await cancelLink.click();
      await expect(page).toHaveURL(/\/listings/);
    });
  });
});
