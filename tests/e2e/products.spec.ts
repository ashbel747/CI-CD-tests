import { test, expect } from '@playwright/test';

test.describe('Products Page', () => {
  test('should render the products page at /products', async ({ page }) => {
    // Go to /products route
    await page.goto('/products');

    // Verify heading exists
    await expect(page.getByRole('heading', { name: 'Our Products' })).toBeVisible();
  });
});
