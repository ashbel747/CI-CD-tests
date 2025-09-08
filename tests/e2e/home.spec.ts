import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should render hero carousel and products section', async ({ page }) => {
    // Go to home page
    await page.goto('/');

    // Check the page title (from metadata)
    await expect(page).toHaveTitle(/Home Decor/);

    // Check hero carousel is visible
    await expect(page.getByTestId('hero-carousel')).toBeVisible();

    // Check "Our Products" heading exists
    await expect(page.getByRole('heading', { name: 'Our Products' })).toBeVisible();
  });
});
