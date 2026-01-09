import { test, expect } from '@playwright/test';

/**
 * Quick Help Tasks E2E Tests
 * URL: /tasks, /tasks/create
 */

// Helper to register
async function registerUser(page, username: string, email: string, password: string) {
  await page.goto('/register');
  await page.locator('input[name="username"], input[id="username"]').first().fill(username);
  await page.locator('input[type="email"], input[name="email"]').first().fill(email);
  await page.locator('input[type="password"]').first().fill(password);
  await page.locator('input[type="password"]').nth(1).fill(password);
  await page.getByRole('button', { name: 'Register' }).click();
  await page.waitForURL(/^\/$|\/listings|\/tasks/, { timeout: 10000 });
}

test.describe('Quick Help Tasks', () => {
  
  test.describe('Browse Tasks', () => {
    
    test('should display tasks page', async ({ page }) => {
      await page.goto('/tasks');
      
      // Page may show location prompt first
      // Either skip location or see tasks
      const skipButton = page.getByText(/Skip/i);
      if (await skipButton.isVisible().catch(() => false)) {
        await skipButton.click();
      }
      
      // Should be on tasks page
      await expect(page).toHaveURL(/\/tasks/);
    });

    test('should handle location prompt', async ({ page }) => {
      await page.goto('/tasks');
      
      // Check for location prompt
      const locationPrompt = page.getByText(/Finding your location|location/i);
      const skipButton = page.getByText(/Skip.*Riga/i);
      
      if (await locationPrompt.isVisible().catch(() => false)) {
        await expect(skipButton).toBeVisible();
        await skipButton.click();
      }
    });
  });

  test.describe('Create Task', () => {
    
    test('should require login to create task', async ({ page }) => {
      await page.goto('/tasks/create');
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });

    test('should show create task form when logged in', async ({ page }) => {
      const uniqueId = Date.now();
      await registerUser(page, `taskuser_${uniqueId}`, `taskuser_${uniqueId}@example.com`, 'TestPassword123!');
      
      await page.goto('/tasks/create');
      
      // Form fields: Job Title, Description, Category, Location, Budget, Deadline, Difficulty
      await expect(page.getByText('Job Title')).toBeVisible();
      await expect(page.getByText('Description')).toBeVisible();
      await expect(page.getByText('Category')).toBeVisible();
      await expect(page.getByText('Budget')).toBeVisible();
      // Button: "Create Job"
      await expect(page.getByRole('button', { name: 'Create Job' })).toBeVisible();
    });

    test('should create a new task successfully', async ({ page }) => {
      const uniqueId = Date.now();
      await registerUser(page, `jobcreator_${uniqueId}`, `jobcreator_${uniqueId}@example.com`, 'TestPassword123!');
      
      await page.goto('/tasks/create');
      
      const jobTitle = `Test Job ${uniqueId}`;
      
      // Fill Job Title
      await page.locator('input[name="title"], input[id="title"]').fill(jobTitle);
      
      // Fill Description
      await page.locator('textarea[name="description"], textarea[id="description"]').fill('This is a test job description for E2E testing.');
      
      // Select Category (grouped options like Home & Living, Errands & Delivery)
      await page.locator('select[name="category"], select[id="category"]').selectOption({ index: 1 });
      
      // Fill Location
      await page.locator('input[name="location"], input[id="location"]').fill('Riga');
      
      // Fill Budget
      await page.locator('input[name="budget"], input[id="budget"]').fill('50');
      
      // Click "Create Job"
      await page.getByRole('button', { name: 'Create Job' }).click();
      
      // Should redirect to tasks
      await expect(page).toHaveURL(/\/tasks/, { timeout: 10000 });
    });

    test('should have cancel link', async ({ page }) => {
      const uniqueId = Date.now();
      await registerUser(page, `canceluser_${uniqueId}`, `canceluser_${uniqueId}@example.com`, 'TestPassword123!');
      
      await page.goto('/tasks/create');
      
      // Cancel link
      const cancelLink = page.getByRole('link', { name: /Cancel/i });
      await expect(cancelLink).toBeVisible();
    });

    test('should have optional fields', async ({ page }) => {
      const uniqueId = Date.now();
      await registerUser(page, `optuser_${uniqueId}`, `optuser_${uniqueId}@example.com`, 'TestPassword123!');
      
      await page.goto('/tasks/create');
      
      // Optional fields: Deadline, Difficulty, Urgent checkbox
      await expect(page.getByText(/Deadline/i)).toBeVisible();
      await expect(page.getByText(/How hard is this task/i)).toBeVisible();
      await expect(page.getByText(/urgent/i)).toBeVisible();
    });
  });
});
