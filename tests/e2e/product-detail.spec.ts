import { test, expect } from '@playwright/test';

test.describe('Product Detail Page', () => {
  test('should show product details and login prompts when logged out', async ({ page }) => {
    await page.goto('/products/68bd0b05e16cec975c641507'); 

    // Product info
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/.+/);
    await expect(page.locator('span.text-green-400')).toContainText(/Ksh/);

    // Wishlist button (narrowed to product heart button)
    await expect(page.locator('button.absolute.top-4.left-4')).toBeVisible();

    // Login prompts
    await expect(page.getByRole('button', { name: 'Login to Add to Cart' })).toBeVisible();
    await expect(page.getByText('Login to see reviews and add your own!')).toBeVisible();
  });

  test('should allow logged in user to add a review', async ({ page }) => {
    // Log in
    await page.goto('/login');
    await page.fill('input[name="email"]', 'kashbel747@gmail.com');
    await page.fill('input[name="password"]', '1238@ashbel');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');

    // Product detail
    await page.goto('/products/68bd0b05e16cec975c641507'); 

    // Review form visible
    const reviewForm = page.locator('form');
    await expect(reviewForm).toBeVisible();

    // Fill review (more robust locator)
    const reviewBox = page.locator('textarea[name="review"], textarea#review, textarea');
    await expect(reviewBox.first()).toBeVisible();
    await reviewBox.first().fill('This is an awesome product!');

    // Submit
    await page.click('button[type="submit"]');

    // Confirm review
    await expect(page.getByText('This is an awesome product!')).toBeVisible();
  });
});
