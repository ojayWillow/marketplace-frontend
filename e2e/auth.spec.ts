import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 * Selectors based on actual source: src/pages/auth/Login.tsx, Register.tsx
 */

test.describe('Authentication', () => {
  
  test.describe('Registration', () => {
    
    test('should show registration form', async ({ page }) => {
      await page.goto('/register');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check form elements exist by their IDs (from Register.tsx)
      await expect(page.locator('#username')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('#confirmPassword')).toBeVisible();
    });

    test('should register a new user successfully', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      const uniqueId = Date.now();
      const testUser = {
        username: `testuser_${uniqueId}`,
        email: `test_${uniqueId}@example.com`,
        password: 'TestPassword123!'
      };
      
      // Fill form using IDs from Register.tsx
      await page.locator('#username').fill(testUser.username);
      await page.locator('#email').fill(testUser.email);
      await page.locator('#password').fill(testUser.password);
      await page.locator('#confirmPassword').fill(testUser.password);
      
      // Click register button (text from en.json: auth.registerButton = "Register")
      await page.getByRole('button', { name: 'Register' }).click();
      
      // Should redirect after successful registration
      await expect(page).toHaveURL(/^\/$|\/(listings|tasks|home)/, { timeout: 15000 });
    });

    test('should show error for existing email', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      const uniqueId = Date.now();
      const testUser = {
        username: `duplicate_${uniqueId}`,
        email: `duplicate_${uniqueId}@example.com`,
        password: 'TestPassword123!'
      };
      
      // Register first user
      await page.locator('#username').fill(testUser.username);
      await page.locator('#email').fill(testUser.email);
      await page.locator('#password').fill(testUser.password);
      await page.locator('#confirmPassword').fill(testUser.password);
      await page.getByRole('button', { name: 'Register' }).click();
      
      await page.waitForURL(/^\/$|\/(listings|tasks|home)/, { timeout: 15000 });
      
      // Try to register with same email
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      await page.locator('#username').fill(`different_${uniqueId}`);
      await page.locator('#email').fill(testUser.email); // Same email
      await page.locator('#password').fill(testUser.password);
      await page.locator('#confirmPassword').fill(testUser.password);
      await page.getByRole('button', { name: 'Register' }).click();
      
      // Should show error (from en.json: auth.registerError = "Registration error")
      await expect(page.getByText(/error|already|exists|taken/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Login', () => {
    
    test('should show login form', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      // Check form elements by ID (from Login.tsx)
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      // Button text from en.json: auth.loginButton = "Sign in"
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
      await page.waitForLoadState('networkidle');
      
      await page.locator('#username').fill(testUser.username);
      await page.locator('#email').fill(testUser.email);
      await page.locator('#password').fill(testUser.password);
      await page.locator('#confirmPassword').fill(testUser.password);
      await page.getByRole('button', { name: 'Register' }).click();
      
      await page.waitForURL(/^\/$|\/(listings|tasks|home)/, { timeout: 15000 });
      
      // Go to login page
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      // Login with credentials
      await page.locator('#email').fill(testUser.email);
      await page.locator('#password').fill(testUser.password);
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      // Should redirect after login
      await expect(page).toHaveURL(/^\/$|\/(listings|tasks|home)/, { timeout: 15000 });
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      await page.locator('#email').fill('nonexistent@example.com');
      await page.locator('#password').fill('wrongpassword');
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      // Error text from en.json: auth.loginError = "Invalid email or password"
      await expect(page.getByText(/invalid|incorrect|wrong|error/i)).toBeVisible({ timeout: 5000 });
    });

    test('should have link to registration', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      // Link text from en.json: common.register = "Register"
      const registerLink = page.getByRole('link', { name: 'Register' });
      await expect(registerLink).toBeVisible();
      
      await registerLink.click();
      await expect(page).toHaveURL(/\/register/);
    });
  });
});
