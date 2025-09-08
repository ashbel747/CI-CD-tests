import { test, expect } from '@playwright/test';

test.describe('Signup Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to signup page before each test
    await page.goto('http://localhost:3001/signup'); // update if deployed
  });

  test('renders signup form correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/account type/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
  });

  test('shows validation errors for weak password', async ({ page }) => {
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', `testuser${Date.now()}@example.com`);
    await page.selectOption('select[name="role"]', 'buyer');
    await page.fill('input[name="password"]', '123'); // too short + weak
    await page.fill('input[name="confirmPassword"]', '123');
    await page.click('button[type="submit"]');

    await expect(page.locator('[role="alert"]')).toContainText('Password must be at least 6 characters long');
    await expect(page.locator('[role="alert"]')).toContainText('Password must contain at least one number');
  });

  test('shows error when passwords do not match', async ({ page }) => {
    await page.fill('input[name="name"]', 'Mismatch User');
    await page.fill('input[name="email"]', `mismatch${Date.now()}@example.com`);
    await page.selectOption('select[name="role"]', 'seller');
    await page.fill('input[name="password"]', 'Test1234');
    await page.fill('input[name="confirmPassword"]', 'Wrong1234');
    await page.click('button[type="submit"]');

    await expect(page.locator('[role="alert"]')).toContainText('Passwords do not match');
  });

  test('successfully creates account', async ({ page }) => {
    const email = `user${Date.now()}@example.com`;

    await page.fill('input[name="name"]', 'Playwright User');
    await page.fill('input[name="email"]', email);
    await page.selectOption('select[name="role"]', 'buyer');
    await page.fill('input[name="password"]', 'Test1234');
    await page.fill('input[name="confirmPassword"]', 'Test1234');
    await page.click('button[type="submit"]');

    await expect(page.locator('[role="alert"]')).toContainText('Account created successfully');
    await expect(page).toHaveURL(/login/, { timeout: 5000 }); // redirected to login
  });
});
