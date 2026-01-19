import { test, expect } from '@playwright/test';

/**
 * Quick Help Tasks E2E Tests
 * Selectors based on actual source: src/pages/CreateTask.tsx
 */

// Helper to register
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

test.describe('Quick Help Tasks', () => {
  
  test.describe('Browse Tasks', () => {
    
    test('should display tasks page', async ({ page }) => {
      await page.goto('/tasks');
      await page.waitForLoadState('networkidle');
      
      // Page may show location prompt first - skip it if visible
      const skipButton = page.getByText(/Skip/i);
      if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await skipButton.click();
      }
      
      // Should be on tasks page
      await expect(page).toHaveURL(/\/tasks/);
    });

    test('should handle location prompt', async ({ page }) => {
      await page.goto('/tasks');
      await page.waitForLoadState('networkidle');
      
      // Check for location prompt and skip button
      const skipButton = page.getByText(/Skip.*Riga|Use Riga/i);
      if (await skipButton.isVisible({ timeout: 3000 }).catch(() => false)) {
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
      await page.waitForLoadState('networkidle');
      
      // Check form elements by ID (from CreateTask.tsx)
      await expect(page.locator('#title')).toBeVisible();
      await expect(page.locator('#description')).toBeVisible();
      await expect(page.locator('#category')).toBeVisible();
      await expect(page.locator('#location')).toBeVisible();
      await expect(page.locator('#budget')).toBeVisible();
      // Button text from en.json: createTask.createButton = "Create Task"
      await expect(page.getByRole('button', { name: /Create Task/i })).toBeVisible();
    });

    test('should create a new task successfully', async ({ page }) => {
      const uniqueId = Date.now();
      await registerUser(page, `jobcreator_${uniqueId}`, `jobcreator_${uniqueId}@example.com`, 'TestPassword123!');
      
      await page.goto('/tasks/create');
      await page.waitForLoadState('networkidle');
      
      const jobTitle = `Test Job ${uniqueId}`;
      
      // Fill form using IDs from CreateTask.tsx
      await page.locator('#title').fill(jobTitle);
      await page.locator('#description').fill('This is a test job description for E2E testing.');
      await page.locator('#category').selectOption({ index: 1 });
      await page.locator('#location').fill('Riga, Latvia');
      await page.locator('#budget').fill('50');
      
      // Wait for location geocoding suggestions to appear and clear
      await page.waitForTimeout(1000);
      
      // Click "Create Task" button
      await page.getByRole('button', { name: /Create Task/i }).click();
      
      // Should redirect to tasks page (may take time due to geocoding)
      await expect(page).toHaveURL(/\/tasks/, { timeout: 20000 });
    });

    test('should have cancel button', async ({ page }) => {
      const uniqueId = Date.now();
      await registerUser(page, `canceluser_${uniqueId}`, `canceluser_${uniqueId}@example.com`, 'TestPassword123!');
      
      await page.goto('/tasks/create');
      await page.waitForLoadState('networkidle');
      
      // Cancel button from en.json: common.cancel = "Cancel"
      const cancelButton = page.getByRole('button', { name: /Cancel/i });
      await expect(cancelButton).toBeVisible();
    });

    test('should have optional fields', async ({ page }) => {
      const uniqueId = Date.now();
      await registerUser(page, `optuser_${uniqueId}`, `optuser_${uniqueId}@example.com`, 'TestPassword123!');
      
      await page.goto('/tasks/create');
      await page.waitForLoadState('networkidle');
      
      // Optional fields by ID (from CreateTask.tsx)
      await expect(page.locator('#deadlineDate')).toBeVisible();
      await expect(page.locator('#difficulty')).toBeVisible();
      await expect(page.locator('#is_urgent')).toBeVisible();
    });
  });
});
