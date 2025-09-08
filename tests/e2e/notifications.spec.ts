import { test, expect } from '@playwright/test';

test.describe('Notifications Page', () => {
  test('user can log in and see notifications', async ({ page }) => {
    // Go to login page
    await page.goto('/login');

    // Fill login form
    await page.fill('input[name="email"]', 'kashbel747@gmail.com');
    await page.fill('input[name="password"]', '1238@ashbel');
    await page.click('button[type="submit"]');

    // Wait for redirect after login
    await expect(page).toHaveURL('/');

    // Navigate to notifications page
    await page.goto('/notifications');

    // Verify heading
    await expect(
      page.getByRole('heading', { name: 'My Notifications' })
    ).toBeVisible();

    // Case 1: No notifications
    if (await page.getByText('No notifications yet.').isVisible()) {
      await expect(page.getByText('No notifications yet.')).toBeVisible();
    } else {
      // Case 2: At least one notification card exists
      await expect(page.locator('[data-testid="notification-card"]').first()).toBeVisible();
    }
  });
});
