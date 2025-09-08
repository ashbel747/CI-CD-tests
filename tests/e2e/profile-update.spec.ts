import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Update Profile Page', () => {

  test('should block unauthorized user', async ({ page }) => {
    await page.goto('/profile/update');

    // Wait for page to settle
    await page.waitForTimeout(500);

    // Look for error or login link
    const errorMessage = page.getByText(/Could not load profile|Unauthorized/i);
    const loginLink = page.getByRole('link', { name: 'Login' });

    const isErrorVisible = await errorMessage.isVisible().catch(() => false);
    const isLoginVisible = await loginLink.isVisible().catch(() => false);

    expect(isErrorVisible || isLoginVisible).toBeTruthy();
  });

  test('should allow logged-in user to update profile', async ({ page }) => {
    // 1️⃣ Log in first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'sme@gmail.com');
    await page.fill('input[name="password"]', '1238@ashbel');
    await page.click('button[type="submit"]');

    // Wait for redirect to home
    await expect(page).toHaveURL('/');

    // 2️⃣ Navigate to update profile
    await page.goto('/profile/update');

    // Wait until the full name input appears (userProfile loaded)
    const fullNameInput = page.getByRole('textbox', { name: /Full Name/i });
    await expect(fullNameInput).toBeVisible({ timeout: 15000 }); // give enough time for API fetch

    // Fill new name
    await fullNameInput.fill('Wamunyoro');

    // Select seller role
    await page.check('input#seller');

    // Submit
    await page.click('button[type="submit"]');

    // Expect success message
    await expect(page.getByText(/Profile updated successfully/i, { exact: false })).toBeVisible({ timeout: 10000 });

    // Optional: wait for redirect
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL('/profile');
  });

});
