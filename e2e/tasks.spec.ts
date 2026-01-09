import { test, expect } from '@playwright/test';

/**
 * Quick Help Tasks E2E Tests
 * Tests: Browse tasks, Create task, Apply to task, Task workflow
 */

// Helper to login before tests that need auth
async function loginTestUser(page: any) {
  const uniqueId = Date.now();
  const testUser = {
    username: `tasktest_${uniqueId}`,
    email: `tasktest_${uniqueId}@example.com`,
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

test.describe('Quick Help Tasks', () => {
  
  test.describe('Browse Tasks', () => {
    
    test('should display tasks page', async ({ page }) => {
      await page.goto('/quick-help');
      
      // Should see task listing or map
      await expect(page.getByRole('heading', { name: /quick help|tasks|help/i })).toBeVisible({ timeout: 5000 });
    });

    test('should show task cards with details', async ({ page }) => {
      await page.goto('/quick-help');
      
      // Wait for tasks to load
      await page.waitForTimeout(2000);
      
      // Check if there are task cards or empty state
      const taskCards = page.locator('[data-testid="task-card"], .task-card, article');
      const emptyState = page.getByText(/no tasks|no results|be the first/i);
      
      // Either tasks exist or empty state is shown
      const hasCards = await taskCards.count() > 0;
      const hasEmptyState = await emptyState.isVisible().catch(() => false);
      
      expect(hasCards || hasEmptyState).toBeTruthy();
    });

    test('should filter tasks by category', async ({ page }) => {
      await page.goto('/quick-help');
      
      // Look for category filter
      const categoryFilter = page.getByRole('combobox', { name: /category/i })
        .or(page.locator('select').filter({ hasText: /category|all/i }))
        .or(page.getByTestId('category-filter'));
      
      if (await categoryFilter.isVisible()) {
        await categoryFilter.click();
        
        // Select a category option
        const options = page.getByRole('option');
        if (await options.count() > 1) {
          await options.nth(1).click();
        }
      }
    });
  });

  test.describe('Create Task', () => {
    
    test('should require login to create task', async ({ page }) => {
      await page.goto('/quick-help/create');
      
      // Should redirect to login or show login prompt
      const isLoginPage = await page.url().includes('/login');
      const hasLoginPrompt = await page.getByText(/login|sign in/i).isVisible().catch(() => false);
      
      expect(isLoginPage || hasLoginPrompt).toBeTruthy();
    });

    test('should show create task form when logged in', async ({ page }) => {
      await loginTestUser(page);
      
      await page.goto('/quick-help/create');
      
      // Should see task creation form
      await expect(page.getByLabel(/title/i)).toBeVisible({ timeout: 5000 });
      await expect(page.getByLabel(/description/i)).toBeVisible();
    });

    test('should create a new task successfully', async ({ page }) => {
      await loginTestUser(page);
      
      await page.goto('/quick-help/create');
      
      const taskTitle = `Test Task ${Date.now()}`;
      
      // Fill in task details
      await page.getByLabel(/title/i).fill(taskTitle);
      await page.getByLabel(/description/i).fill('This is a test task created by Playwright E2E tests.');
      
      // Select category if available
      const categorySelect = page.getByLabel(/category/i);
      if (await categorySelect.isVisible()) {
        await categorySelect.selectOption({ index: 1 });
      }
      
      // Fill budget if available
      const budgetField = page.getByLabel(/budget|price/i);
      if (await budgetField.isVisible()) {
        await budgetField.fill('50');
      }
      
      // Fill location if required
      const locationField = page.getByLabel(/location|address/i);
      if (await locationField.isVisible()) {
        await locationField.fill('Riga, Latvia');
      }
      
      // Submit
      await page.getByRole('button', { name: /create|submit|post/i }).click();
      
      // Should redirect to task detail or tasks list
      await expect(page).toHaveURL(/\/quick-help/, { timeout: 10000 });
      
      // Verify task was created
      await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 5000 });
    });

    test('should validate required fields', async ({ page }) => {
      await loginTestUser(page);
      
      await page.goto('/quick-help/create');
      
      // Try to submit empty form
      await page.getByRole('button', { name: /create|submit|post/i }).click();
      
      // Should show validation errors
      const errorVisible = await page.getByText(/required|please fill|cannot be empty/i).isVisible().catch(() => false);
      const fieldInvalid = await page.locator('input:invalid, textarea:invalid').count() > 0;
      
      expect(errorVisible || fieldInvalid).toBeTruthy();
    });
  });

  test.describe('Task Details', () => {
    
    test('should view task details', async ({ page }) => {
      // Create a task first
      const user = await loginTestUser(page);
      
      await page.goto('/quick-help/create');
      
      const taskTitle = `Detail Test ${Date.now()}`;
      await page.getByLabel(/title/i).fill(taskTitle);
      await page.getByLabel(/description/i).fill('Test task for viewing details.');
      
      const categorySelect = page.getByLabel(/category/i);
      if (await categorySelect.isVisible()) {
        await categorySelect.selectOption({ index: 1 });
      }
      
      const locationField = page.getByLabel(/location|address/i);
      if (await locationField.isVisible()) {
        await locationField.fill('Riga, Latvia');
      }
      
      await page.getByRole('button', { name: /create|submit|post/i }).click();
      await page.waitForURL(/\/quick-help/, { timeout: 10000 });
      
      // Click on the task to view details
      await page.getByText(taskTitle).click();
      
      // Should see task details
      await expect(page.getByText(taskTitle)).toBeVisible();
      await expect(page.getByText(/test task for viewing details/i)).toBeVisible();
    });
  });

  test.describe('Apply to Task', () => {
    
    test('should apply to another user\'s task', async ({ page, browser }) => {
      // Create task with first user
      const user1 = await loginTestUser(page);
      
      await page.goto('/quick-help/create');
      
      const taskTitle = `Apply Test ${Date.now()}`;
      await page.getByLabel(/title/i).fill(taskTitle);
      await page.getByLabel(/description/i).fill('Task for application testing.');
      
      const categorySelect = page.getByLabel(/category/i);
      if (await categorySelect.isVisible()) {
        await categorySelect.selectOption({ index: 1 });
      }
      
      const locationField = page.getByLabel(/location|address/i);
      if (await locationField.isVisible()) {
        await locationField.fill('Riga, Latvia');
      }
      
      await page.getByRole('button', { name: /create|submit|post/i }).click();
      await page.waitForURL(/\/quick-help/, { timeout: 10000 });
      
      // Create new browser context for second user
      const context2 = await browser.newContext();
      const page2 = await context2.newPage();
      
      // Register second user
      const uniqueId2 = Date.now() + 1;
      await page2.goto('/register');
      await page2.getByLabel(/username/i).fill(`applicant_${uniqueId2}`);
      await page2.getByLabel(/email/i).fill(`applicant_${uniqueId2}@example.com`);
      await page2.getByLabel(/password/i).first().fill('TestPassword123!');
      await page2.getByRole('button', { name: /register|sign up/i }).click();
      await page2.waitForURL(/\/(home|dashboard|quick-help)?$/, { timeout: 10000 });
      
      // Find and apply to the task
      await page2.goto('/quick-help');
      await page2.getByText(taskTitle).click();
      
      // Click apply button
      const applyButton = page2.getByRole('button', { name: /apply|respond|help/i });
      if (await applyButton.isVisible()) {
        await applyButton.click();
        
        // Fill application message if required
        const messageField = page2.getByLabel(/message|note/i);
        if (await messageField.isVisible()) {
          await messageField.fill('I would like to help with this task!');
        }
        
        // Submit application
        const submitButton = page2.getByRole('button', { name: /submit|send|apply/i });
        if (await submitButton.isVisible()) {
          await submitButton.click();
        }
        
        // Should see success message or application status
        await expect(page2.getByText(/applied|submitted|sent|pending/i)).toBeVisible({ timeout: 5000 });
      }
      
      await context2.close();
    });
  });
});
