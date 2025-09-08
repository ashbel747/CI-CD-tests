import { test, expect } from '@playwright/test';

test.describe('My Products Page', () => {
  test('should redirect unauthorized user to error message', async ({ page }) => {
    // Go directly without logging in
    await page.goto('/products/my-products');

    // Expect unauthorized message
    await expect(
      page.getByRole('heading', { name: /You should have a correct user role/ })
    ).toBeVisible();
  });

  test('should show empty state if logged in user has no products', async ({ page }) => {
    // Login with a valid user (no products created yet in DB)
    await page.goto('/login');
    await page.fill('input[name="email"]', 'sme@gmail.com');
    await page.fill('input[name="password"]', '1238@ashbel');
    await page.click('button[type="submit"]');

    // Wait for redirect
    await expect(page).toHaveURL('/');

    // Navigate to my products
    await page.goto('/products/my-products');

    // Should show empty state
    await expect(page.getByText('No products created yet.')).toBeVisible();
  });


  test('should list products for a logged in seller', async ({ page }) => {
    // Login with seller account
    await page.goto('/login');
    await page.fill('input[name="email"]', 'mainaashbel@gmail.com');
    await page.fill('input[name="password"]', '1238@ashbel');
    await page.click('button[type="submit"]');

    // Wait for redirect
    await expect(page).toHaveURL('/');

    // Navigate to my products
    await page.goto('/products/my-products');

    // Check heading
    await expect(page.getByRole('heading', { name: 'My Products' })).toBeVisible();

    // At least one product card should appear
    const products = page.locator('.grid > div'); // each product card
    await expect(products.first()).toBeVisible();

    // Product should show name
    await expect(products.first().getByRole('heading')).toBeVisible();

    // Product should show at least one price (discounted or original)
    const discounted = products.first().locator('span.text-green-600');
    const original = products.first().locator('span.line-through, span:not(.line-through)');

    if (await discounted.count()) {
      await expect(discounted.first()).toBeVisible();
    } else {
      await expect(original.first()).toBeVisible();
    }

    // Action buttons should exist
    await expect(products.first().getByRole('link', { name: 'Edit' })).toBeVisible();
    await expect(products.first().getByRole('button', { name: 'Delete' })).toBeVisible();
  });
});
