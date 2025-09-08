import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('user can log in ', async ({ page }) => {
    // Go to login page
    await page.goto('/login');

    // Fill login form
    await page.fill('input[name="email"]', 'kashbel747@gmail.com');
    await page.fill('input[name="password"]', '1238@ashbel');
    await page.click('button[type="submit"]');

    // Wait for redirect after login
    await expect(page).toHaveURL('/');

    
  });
});