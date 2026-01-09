import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 * Tests: Registration, Login, Profile access
 */

test.describe('Authentication', () => {
  
  test.describe('Registration', () => {
    
    test('should show registration form', async ({ page }) => {
      await page.goto('/register');
      
      // Heading: "Create account"
      await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
      await expect(page.getByText('Username')).toBeVisible();
      await expect(page.getByText('Email')).toBeVisible();
      await expect(page.getByText('Password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();
    });

    test('should register a new user successfully', async ({ page }) => {
      await page.goto('/register');
      
      const uniqueId = Date.now();
      const testUser = {
        username: `testuser_${uniqueId}`,
        email: `test_${uniqueId}@example.com`,
        password: 'TestPassword123!'
      };
      
      // Fill registration form
      await page.locator('input[name="username"], input[id="username"]').first().fill(testUser.username);
      await page.locator('input[type="email"], input[name="email"]').first().fill(testUser.email);
      await page.locator('input[type="password"]').first().fill(testUser.password);
      await page.locator('input[type="password"]').nth(1).fill(testUser.password); // Confirm password
      
      await page.getByRole('button', { name: 'Register' }).click();
      
      // Should redirect to home after successful registration
      await expect(page).toHaveURL(/^\/$|\/listings|\/tasks/, { timeout: 10000 });
    });

    test('should show error for existing email', async ({ page }) => {
      await page.goto('/register');
      
      const uniqueId = Date.now();
      const testUser = {
        username: `duplicate_${uniqueId}`,
        email: `duplicate_${uniqueId}@example.com`,
        password: 'TestPassword123!'
      };
      
      // Register first user
      await page.locator('input[name="username"], input[id="username"]').first().fill(testUser.username);
      await page.locator('input[type="email"], input[name="email"]').first().fill(testUser.email);
      await page.locator('input[type="password"]').first().fill(testUser.password);
      await page.locator('input[type="password"]').nth(1).fill(testUser.password);
      await page.getByRole('button', { name: 'Register' }).click();
      
      await page.waitForURL(/^\/$|\/listings|\/tasks/, { timeout: 10000 });
      
      // Try to register with same email
      await page.goto('/register');
      await page.locator('input[name="username"], input[id="username"]').first().fill(`different_${uniqueId}`);
      await page.locator('input[type="email"], input[name="email"]').first().fill(testUser.email);
      await page.locator('input[type="password"]').first().fill(testUser.password);
      await page.locator('input[type="password"]').nth(1).fill(testUser.password);
      await page.getByRole('button', { name: 'Register' }).click();
      
      // Should show error
      await expect(page.getByText(/already|exists|taken|registered|error/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Login', () => {
    
    test('should show login form', async ({ page }) => {
      await page.goto('/login');
      
      await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
      await expect(page.getByText('Email')).toBeVisible();
      await expect(page.getByText('Password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    });

    test('should login with valid credentials', async ({ page }) => {
      // First register a user
      const uniqueId = Date.now();
      const testUser = {
        username: `logintest_${uniqueId}`,
        email: `logintest_${uniqueId}@example.com`,
        password: 'TestPassword123!'
      };
      
      await page.goto('/register');
      await page.locator('input[name="username"], input[id="username"]').first().fill(testUser.username);
      await page.locator('input[type="email"], input[name="email"]').first().fill(testUser.email);
      await page.locator('input[type="password"]').first().fill(testUser.password);
      await page.locator('input[type="password"]').nth(1).fill(testUser.password);
      await page.getByRole('button', { name: 'Register' }).click();
      await page.waitForURL(/^\/$|\/listings|\/tasks/, { timeout: 10000 });
      
      // Logout by going to login page
      await page.goto('/login');
      
      // Login
      await page.locator('input[type="email"], input[name="email"]').fill(testUser.email);
      await page.locator('input[type="password"]').fill(testUser.password);
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      // Should redirect after login
      await expect(page).toHaveURL(/^\/$|\/listings|\/tasks/, { timeout: 10000 });
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      await page.locator('input[type="email"], input[name="email"]').fill('nonexistent@example.com');
      await page.locator('input[type="password"]').fill('wrongpassword');
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      await expect(page.getByText(/invalid|incorrect|wrong|error|failed/i)).toBeVisible({ timeout: 5000 });
    });

    test('should have link to registration', async ({ page }) => {
      await page.goto('/login');
      
      const registerLink = page.getByRole('link', { name: 'Register' });
      await expect(registerLink).toBeVisible();
      
      await registerLink.click();
      await expect(page).toHaveURL(/\/register/);
    });
  });
});
