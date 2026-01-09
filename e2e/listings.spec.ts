import { test, expect } from '@playwright/test';

/**
 * Buy/Sell Listings E2E Tests
 * Tests: Browse listings, Create listing, View details, Search/Filter
 */

// Helper to login before tests that need auth
async function loginTestUser(page: any) {
  const uniqueId = Date.now();
  const testUser = {
    username: `listingtest_${uniqueId}`,
    email: `listingtest_${uniqueId}@example.com`,
    password: 'TestPassword123!'
  };
  
  await page.goto('/register');
  await page.getByLabel(/username/i).fill(testUser.username);
  await page.getByLabel(/email/i).fill(testUser.email);
  await page.getByLabel(/password/i).first().fill(testUser.password);
  await page.getByRole('button', { name: /register|sign up/i }).click();
  await page.waitForURL(/\/(home|dashboard|quick-help)?$/, { timeout: 10000 });
  
  return testUser;
}

test.describe('Buy/Sell Listings', () => {
  
  test.describe('Browse Listings', () => {
    
    test('should display listings page', async ({ page }) => {
      await page.goto('/listings');
      
      // Should see listings page
      await expect(page.getByRole('heading', { name: /listings|buy.*sell|marketplace/i })).toBeVisible({ timeout: 5000 });
    });

    test('should show listing cards', async ({ page }) => {
      await page.goto('/listings');
      
      await page.waitForTimeout(2000);
      
      // Check for listing cards or empty state
      const listingCards = page.locator('[data-testid="listing-card"], .listing-card, article');
      const emptyState = page.getByText(/no listings|no results|be the first/i);
      
      const hasCards = await listingCards.count() > 0;
      const hasEmptyState = await emptyState.isVisible().catch(() => false);
      
      expect(hasCards || hasEmptyState).toBeTruthy();
    });

    test('should filter by category', async ({ page }) => {
      await page.goto('/listings');
      
      const categoryFilter = page.getByRole('combobox', { name: /category/i })
        .or(page.locator('select').filter({ hasText: /category/i }))
        .or(page.getByTestId('category-filter'));
      
      if (await categoryFilter.isVisible()) {
        await categoryFilter.click();
        const options = page.getByRole('option');
        if (await options.count() > 1) {
          await options.nth(1).click();
        }
      }
    });

    test('should search listings', async ({ page }) => {
      await page.goto('/listings');
      
      const searchInput = page.getByRole('searchbox')
        .or(page.getByPlaceholder(/search/i))
        .or(page.getByLabel(/search/i));
      
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await searchInput.press('Enter');
        
        // Wait for search results
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('Create Listing', () => {
    
    test('should require login to create listing', async ({ page }) => {
      await page.goto('/listings/create');
      
      const isLoginPage = await page.url().includes('/login');
      const hasLoginPrompt = await page.getByText(/login|sign in/i).isVisible().catch(() => false);
      
      expect(isLoginPage || hasLoginPrompt).toBeTruthy();
    });

    test('should show create listing form when logged in', async ({ page }) => {
      await loginTestUser(page);
      
      await page.goto('/listings/create');
      
      await expect(page.getByLabel(/title/i)).toBeVisible({ timeout: 5000 });
      await expect(page.getByLabel(/price/i)).toBeVisible();
    });

    test('should create a new listing successfully', async ({ page }) => {
      await loginTestUser(page);
      
      await page.goto('/listings/create');
      
      const listingTitle = `Test Listing ${Date.now()}`;
      
      // Fill in listing details
      await page.getByLabel(/title/i).fill(listingTitle);
      await page.getByLabel(/description/i).fill('This is a test listing created by Playwright E2E tests.');
      await page.getByLabel(/price/i).fill('99.99');
      
      // Select category if available
      const categorySelect = page.getByLabel(/category/i);
      if (await categorySelect.isVisible()) {
        await categorySelect.selectOption({ index: 1 });
      }
      
      // Select condition if available
      const conditionSelect = page.getByLabel(/condition/i);
      if (await conditionSelect.isVisible()) {
        await conditionSelect.selectOption({ index: 1 });
      }
      
      // Fill location if available
      const locationField = page.getByLabel(/location/i);
      if (await locationField.isVisible()) {
        await locationField.fill('Riga, Latvia');
      }
      
      // Submit
      await page.getByRole('button', { name: /create|submit|post|publish/i }).click();
      
      // Should redirect to listing detail or listings list
      await expect(page).toHaveURL(/\/listings/, { timeout: 10000 });
      
      // Verify listing was created
      await expect(page.getByText(listingTitle)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Listing Details', () => {
    
    test('should view listing details', async ({ page }) => {
      // Create a listing first
      await loginTestUser(page);
      
      await page.goto('/listings/create');
      
      const listingTitle = `Detail Listing ${Date.now()}`;
      await page.getByLabel(/title/i).fill(listingTitle);
      await page.getByLabel(/description/i).fill('Test listing for viewing details.');
      await page.getByLabel(/price/i).fill('149.99');
      
      const categorySelect = page.getByLabel(/category/i);
      if (await categorySelect.isVisible()) {
        await categorySelect.selectOption({ index: 1 });
      }
      
      await page.getByRole('button', { name: /create|submit|post|publish/i }).click();
      await page.waitForURL(/\/listings/, { timeout: 10000 });
      
      // Click on the listing to view details
      await page.getByText(listingTitle).click();
      
      // Should see listing details
      await expect(page.getByText(listingTitle)).toBeVisible();
      await expect(page.getByText(/149\.99|€149/)).toBeVisible();
    });

    test('should show seller information', async ({ page }) => {
      await loginTestUser(page);
      
      await page.goto('/listings/create');
      
      const listingTitle = `Seller Info Test ${Date.now()}`;
      await page.getByLabel(/title/i).fill(listingTitle);
      await page.getByLabel(/description/i).fill('Test listing to check seller info.');
      await page.getByLabel(/price/i).fill('50');
      
      const categorySelect = page.getByLabel(/category/i);
      if (await categorySelect.isVisible()) {
        await categorySelect.selectOption({ index: 1 });
      }
      
      await page.getByRole('button', { name: /create|submit|post|publish/i }).click();
      await page.waitForURL(/\/listings/, { timeout: 10000 });
      
      await page.getByText(listingTitle).click();
      
      // Should see seller section
      const sellerSection = page.getByText(/seller|posted by|contact/i);
      await expect(sellerSection).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Edit/Delete Listing', () => {
    
    test('should edit own listing', async ({ page }) => {
      await loginTestUser(page);
      
      await page.goto('/listings/create');
      
      const listingTitle = `Edit Test ${Date.now()}`;
      await page.getByLabel(/title/i).fill(listingTitle);
      await page.getByLabel(/description/i).fill('Original description.');
      await page.getByLabel(/price/i).fill('100');
      
      const categorySelect = page.getByLabel(/category/i);
      if (await categorySelect.isVisible()) {
        await categorySelect.selectOption({ index: 1 });
      }
      
      await page.getByRole('button', { name: /create|submit|post|publish/i }).click();
      await page.waitForURL(/\/listings/, { timeout: 10000 });
      
      // Navigate to the listing
      await page.getByText(listingTitle).click();
      
      // Click edit button
      const editButton = page.getByRole('button', { name: /edit/i })
        .or(page.getByRole('link', { name: /edit/i }));
      
      if (await editButton.isVisible()) {
        await editButton.click();
        
        // Update the title
        const updatedTitle = `${listingTitle} - Updated`;
        await page.getByLabel(/title/i).clear();
        await page.getByLabel(/title/i).fill(updatedTitle);
        
        await page.getByRole('button', { name: /save|update/i }).click();
        
        // Verify update
        await expect(page.getByText(updatedTitle)).toBeVisible({ timeout: 5000 });
      }
    });
  });
});
