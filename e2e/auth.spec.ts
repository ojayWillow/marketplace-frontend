import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 * Tests: Registration, Login, Logout, Profile access
 */

test.describe('Authentication', () => {
  
  test.describe('Registration', () => {
    
    test('should show registration form', async ({ page }) => {
      await page.goto('/register');
      
      // Check for registration heading and form fields
      await expect(page.getByRole('heading', { name: /sign up|register|create account/i })).toBeVisible();
      await expect(page.getByText('Email')).toBeVisible();
      await expect(page.getByText('Password')).toBeVisible();
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
      
      // Fill form using placeholders or labels
      const nameInput = page.locator('input[type="text"], input[name="name"], input[name="username"]').first();
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      
      if (await nameInput.isVisible()) {
        await nameInput.fill(testUser.username);
      }
      await emailInput.fill(testUser.email);
      await passwordInput.fill(testUser.password);
      
      // If there's a confirm password field
      const confirmPassword = page.locator('input[type="password"]').nth(1);
      if (await confirmPassword.isVisible()) {
        await confirmPassword.fill(testUser.password);
      }
      
      await page.getByRole('button', { name: /sign up|register|create/i }).click();
      
      // Should redirect to home or dashboard after successful registration
      await expect(page).toHaveURL(/\/(home|dashboard|quick-help|listings)?$/, { timeout: 10000 });
    });

    test('should show error for existing email', async ({ page }) => {
      await page.goto('/register');
      
      // First, create a user
      const uniqueId = Date.now();
      const testUser = {
        username: `duplicate_${uniqueId}`,
        email: `duplicate_${uniqueId}@example.com`,
        password: 'TestPassword123!'
      };
      
      const nameInput = page.locator('input[type="text"], input[name="name"], input[name="username"]').first();
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      
      if (await nameInput.isVisible()) {
        await nameInput.fill(testUser.username);
      }
      await emailInput.fill(testUser.email);
      await passwordInput.fill(testUser.password);
      
      const confirmPassword = page.locator('input[type="password"]').nth(1);
      if (await confirmPassword.isVisible()) {
        await confirmPassword.fill(testUser.password);
      }
      
      await page.getByRole('button', { name: /sign up|register|create/i }).click();
      
      // Wait for registration to complete
      await page.waitForURL(/\/(home|dashboard|quick-help|listings)?$/, { timeout: 10000 });
      
      // Logout and try to register with same email
      await page.goto('/register');
      
      if (await nameInput.isVisible()) {
        await nameInput.fill(`different_${uniqueId}`);
      }
      await emailInput.fill(testUser.email); // Same email
      await passwordInput.fill(testUser.password);
      
      if (await confirmPassword.isVisible()) {
        await confirmPassword.fill(testUser.password);
      }
      
      await page.getByRole('button', { name: /sign up|register|create/i }).click();
      
      // Should show error message
      await expect(page.getByText(/already|exists|taken|registered|error/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Login', () => {
    
    test('should show login form', async ({ page }) => {
      await page.goto('/login');
      
      // Your UI shows "Sign in" heading with "Email" and "Password" labels
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
      
      const nameInput = page.locator('input[type="text"], input[name="name"], input[name="username"]').first();
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      
      if (await nameInput.isVisible()) {
        await nameInput.fill(testUser.username);
      }
      await emailInput.fill(testUser.email);
      await passwordInput.fill(testUser.password);
      
      const confirmPassword = page.locator('input[type="password"]').nth(1);
      if (await confirmPassword.isVisible()) {
        await confirmPassword.fill(testUser.password);
      }
      
      await page.getByRole('button', { name: /sign up|register|create/i }).click();
      await page.waitForURL(/\/(home|dashboard|quick-help|listings)?$/, { timeout: 10000 });
      
      // Now go to login page
      await page.goto('/login');
      
      // Login with the credentials
      await page.locator('input[type="email"], input[name="email"]').fill(testUser.email);
      await page.locator('input[type="password"]').fill(testUser.password);
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      // Should redirect after login
      await expect(page).toHaveURL(/\/(home|dashboard|quick-help|listings)?$/, { timeout: 10000 });
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      await page.locator('input[type="email"], input[name="email"]').fill('nonexistent@example.com');
      await page.locator('input[type="password"]').fill('wrongpassword');
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      // Should show error message
      await expect(page.getByText(/invalid|incorrect|wrong|error|failed/i)).toBeVisible({ timeout: 5000 });
    });

    test('should have link to registration', async ({ page }) => {
      await page.goto('/login');
      
      // Your UI shows "Register" link
      const registerLink = page.getByRole('link', { name: 'Register' });
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
      
      const nameInput = page.locator('input[type="text"], input[name="name"], input[name="username"]').first();
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      
      if (await nameInput.isVisible()) {
        await nameInput.fill(testUser.username);
      }
      await emailInput.fill(testUser.email);
      await passwordInput.fill(testUser.password);
      
      const confirmPassword = page.locator('input[type="password"]').nth(1);
      if (await confirmPassword.isVisible()) {
        await confirmPassword.fill(testUser.password);
      }
      
      await page.getByRole('button', { name: /sign up|register|create/i }).click();
      await page.waitForURL(/\/(home|dashboard|quick-help|listings)?$/, { timeout: 10000 });
      
      // Navigate to profile
      await page.goto('/profile');
      
      // Should see profile page (not redirected to login)
      await expect(page).not.toHaveURL(/\/login/);
    });
  });
});
