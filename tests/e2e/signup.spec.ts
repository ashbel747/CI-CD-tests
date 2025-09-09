import { test, expect } from '@playwright/test';

test.describe('Signup Page', () => {
  test('should render signup form correctly', async ({ page }) => {
    await page.goto('/signup');

    // Check heading
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();

    // Check input fields
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Account Type')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();

    // Check sign up button
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors on invalid inputs', async ({ page }) => {
    await page.goto('/signup');

    // Fill form with invalid data
    await page.fill('input[name="name"]', '');
    await page.fill('input[name="email"]', 'invalidemail');
    await page.fill('input[name="password"]', 'abcdef'); // long enough but no number
    await page.fill('input[name="confirmPassword"]', 'ghijkl'); // mismatch

    await page.click('button[type="submit"]');

    // Expect error messages
    await expect(page.getByText('Password must contain at least one number')).toBeVisible();
    await expect(page.getByText('Passwords do not match')).toBeVisible();
    });

  test('should allow successful signup and redirect', async ({ page }) => {
    await page.goto('/signup');

    // Use a unique email for each test run
    const randomEmail = `user_${Date.now()}@test.com`;

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', randomEmail);
    await page.fill('input[name="password"]', 'Test1234');
    await page.fill('input[name="confirmPassword"]', 'Test1234');
    await page.selectOption('select[name="role"]', 'buyer');

    await page.click('button[type="submit"]');

    // Expect success message
    await expect(page.getByText('Account created successfully!')).toBeVisible();

    // Redirects to login page
    await expect(page).toHaveURL(/\/login/);
  });
});
