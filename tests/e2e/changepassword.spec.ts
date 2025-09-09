import { test, expect } from '@playwright/test';

test.describe('Change Password Flow (Repeatable)', () => {
  // Default test account
  const TEST_EMAIL = 'winnie@gmail.com';
  const INITIAL_PASSWORD = 'Winnie@2026'; // <-- updated
  const NEW_PASSWORD = 'Winnie@2025';     // <-- updated
  const baseURL = 'http://localhost:3001';

  test('Login with known password and change password', async ({ page }) => {
    // 1️⃣ Go to login page
    await page.goto(`${baseURL}/login`);

    // 2️⃣ Fill login form
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', INITIAL_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for login to complete
    await page.waitForTimeout(1000);

    // 3️⃣ Go to change password page
    await page.goto(`${baseURL}/change-password`);

    // 4️⃣ Fill change password form
    await page.fill('input[name="oldPassword"]', INITIAL_PASSWORD);
    await page.fill('input[name="newPassword"]', NEW_PASSWORD);
    await page.fill('input[name="confirmPassword"]', NEW_PASSWORD);
    await page.click('button[type="submit"]');

    // 5️⃣ Verify success message
    await expect(page.locator('text=Password changed successfully')).toBeVisible();

    // 6️⃣ Reset password to initial to make test repeatable
    await page.fill('input[name="oldPassword"]', NEW_PASSWORD);
    await page.fill('input[name="newPassword"]', INITIAL_PASSWORD);
    await page.fill('input[name="confirmPassword"]', INITIAL_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Password changed successfully')).toBeVisible();
  });
});
