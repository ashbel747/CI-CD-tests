import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Create Product Page', () => {
  test('should create a new product successfully', async ({ page }) => {
    // Go to login page first
    await page.goto('/login');

    // Fill in login credentials (make sure these exist in your test DB)
    await page.fill('input[name="email"]', 'mainaashbel@gmail.com');
    await page.fill('input[name="password"]', '1238@ashbel');
    await page.click('button[type="submit"]');

    // Wait for redirect after login (adjust URL if needed)
    await expect(page).toHaveURL('/');

    // Now navigate to create product page
    await page.goto('/products/create');

    // Fill in the product form
    await page.fill('input[name="name"]', 'Test product');
    await page.fill('textarea[name="description"]', 'Test product description');
    await page.fill('input[name="initialPrice"]', '3000');
    await page.fill('input[name="discountPercent"]', '10');

    // Upload an image (fixture inside tests/images)
    const filePath = path.join(__dirname, '..', 'images', 'test-image.jpeg');
    await page.setInputFiles('input[name="image"]', filePath);

    // Select category & niche
    await page.selectOption('select[name="category"]', 'Top Picks');
    await page.selectOption('select[name="niche"]', 'living room');

    // Submit the form
    await page.click('button[type="submit"]');

    // Expect success message
    await expect(page.getByTestId('form-message')).toHaveText('Product created successfully!');
  });
});
