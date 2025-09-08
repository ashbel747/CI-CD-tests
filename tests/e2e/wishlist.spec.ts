// tests/e2e/wishlist.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Wishlist Page', () => {

  test('should show error for unauthorized users', async ({ page }) => {
    // Go directly without logging in
    await page.goto('/wishlist');

    // Wait for the login link to appear (unauthorized users should see it)
    const loginLink = page.getByRole('link', { name: 'Login' });
    await expect(loginLink).toBeVisible({ timeout: 5000 });
    });

  test('should display wishlist or empty state for logged-in user', async ({ page }) => {
    // Log in first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'mainaashbel@gmail.com');
    await page.fill('input[name="password"]', '1238@ashbel');
    await page.click('button[type="submit"]');

    // Wait for redirect after login
    await page.waitForURL('/');

    // Go to wishlist page
    await page.goto('/wishlist');
    await page.waitForLoadState('networkidle');

    // Check for empty wishlist or product cards
    const emptyMessage = page.locator('p', { hasText: 'Your wishlist is empty.' }).first();
    const productCards = page.locator('div', { has: page.getByRole('button', { name: 'Add to Cart' }) });

    const isEmptyVisible = await emptyMessage.isVisible().catch(() => false);
    const hasProducts = (await productCards.count()) > 0;

    // At least one of them must be true
    expect(isEmptyVisible || hasProducts).toBeTruthy();

    // If products exist, check visibility of first card and buttons
    if (hasProducts) {
      const firstCard = productCards.first();
      await expect(firstCard).toBeVisible();
      await expect(firstCard.getByRole('button', { name: 'Add to Cart' })).toBeVisible();
      await expect(firstCard.getByRole('button', { name: 'Remove' })).toBeVisible();
    }
  });

});
