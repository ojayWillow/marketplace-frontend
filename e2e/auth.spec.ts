import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 * Tests: Registration, Login, Logout, Profile access
 */

test.describe('Authentication', () => {
  
  test.describe('Registration', () => {
    
    test('should show registration form', async ({ page }) => {
      await page.goto('/register');
      
      await expect(page.getByRole('heading', { name: /register|sign up/i })).toBeVisible();
      await expect(page.getByLabel(/username/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
    });

    test('should register a new user successfully', async ({ page }) => {
      await page.goto('/register');
      
      // Generate unique user for this test
      const uniqueId = Date.now();
      const testUser = {
        username: `testuser_${uniqueId}`,
        email: `test_${uniqueId}@example.com`,
        password: 'TestPassword123!'
      };
      
      await page.getByLabel(/username/i).fill(testUser.username);
      await page.getByLabel(/email/i).fill(testUser.email);
      await page.getByLabel(/password/i).first().fill(testUser.password);
      
      // If there's a confirm password field
      const confirmPassword = page.getByLabel(/confirm password/i);
      if (await confirmPassword.isVisible()) {
        await confirmPassword.fill(testUser.password);
      }
      
      await page.getByRole('button', { name: /register|sign up/i }).click();
      
      // Should redirect to home or dashboard after successful registration
      await expect(page).toHaveURL(/\/(home|dashboard|quick-help)?$/, { timeout: 10000 });
    });

    test('should show error for existing username', async ({ page }) => {
      await page.goto('/register');
      
      // First, create a user
      const uniqueId = Date.now();
      const testUser = {
        username: `duplicate_${uniqueId}`,
        email: `duplicate_${uniqueId}@example.com`,
        password: 'TestPassword123!'
      };
      
      await page.getByLabel(/username/i).fill(testUser.username);
      await page.getByLabel(/email/i).fill(testUser.email);
      await page.getByLabel(/password/i).first().fill(testUser.password);
      await page.getByRole('button', { name: /register|sign up/i }).click();
      
      // Wait for registration to complete
      await page.waitForURL(/\/(home|dashboard|quick-help)?$/, { timeout: 10000 });
      
      // Logout and try to register with same username
      await page.goto('/register');
      
      await page.getByLabel(/username/i).fill(testUser.username);
      await page.getByLabel(/email/i).fill(`different_${uniqueId}@example.com`);
      await page.getByLabel(/password/i).first().fill(testUser.password);
      await page.getByRole('button', { name: /register|sign up/i }).click();
      
      // Should show error message
      await expect(page.getByText(/username.*exists|already.*taken/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Login', () => {
    
    test('should show login form', async ({ page }) => {
      await page.goto('/login');
      
      await expect(page.getByRole('heading', { name: /login|sign in/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
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
      await page.getByLabel(/username/i).fill(testUser.username);
      await page.getByLabel(/email/i).fill(testUser.email);
      await page.getByLabel(/password/i).first().fill(testUser.password);
      await page.getByRole('button', { name: /register|sign up/i }).click();
      await page.waitForURL(/\/(home|dashboard|quick-help)?$/, { timeout: 10000 });
      
      // Logout (click user menu, then logout)
      await page.goto('/login');
      
      // Now login
      await page.getByLabel(/email/i).fill(testUser.email);
      await page.getByLabel(/password/i).fill(testUser.password);
      await page.getByRole('button', { name: /login|sign in/i }).click();
      
      // Should redirect after login
      await expect(page).toHaveURL(/\/(home|dashboard|quick-help)?$/, { timeout: 10000 });
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      await page.getByLabel(/email/i).fill('nonexistent@example.com');
      await page.getByLabel(/password/i).fill('wrongpassword');
      await page.getByRole('button', { name: /login|sign in/i }).click();
      
      // Should show error message
      await expect(page.getByText(/invalid|incorrect|wrong|error/i)).toBeVisible({ timeout: 5000 });
    });

    test('should have link to registration', async ({ page }) => {
      await page.goto('/login');
      
      const registerLink = page.getByRole('link', { name: /register|sign up|create account/i });
      await expect(registerLink).toBeVisible();
      
      await registerLink.click();
      await expect(page).toHaveURL(/\/register/);
    });
  });

  test.describe('Protected Routes', () => {
    
    test('should redirect to login when accessing profile without auth', async ({ page }) => {
      await page.goto('/profile');
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });

    test('should access profile when logged in', async ({ page }) => {
      // Register and login
      const uniqueId = Date.now();
      const testUser = {
        username: `profiletest_${uniqueId}`,
        email: `profiletest_${uniqueId}@example.com`,
        password: 'TestPassword123!'
      };
      
      await page.goto('/register');
      await page.getByLabel(/username/i).fill(testUser.username);
      await page.getByLabel(/email/i).fill(testUser.email);
      await page.getByLabel(/password/i).first().fill(testUser.password);
      await page.getByRole('button', { name: /register|sign up/i }).click();
      await page.waitForURL(/\/(home|dashboard|quick-help)?$/, { timeout: 10000 });
      
      // Navigate to profile
      await page.goto('/profile');
      
      // Should see profile page with user info
      await expect(page.getByText(testUser.username)).toBeVisible({ timeout: 5000 });
    });
  });
});
