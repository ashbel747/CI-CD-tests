import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Edit Product Page', () => {
  test('should allow logged in seller to update product', async ({ page }) => {
    // 1. Login as seller
    await page.goto('/login');
    await page.fill('input[name="email"]', 'mainaashbel@gmail.com');
    await page.fill('input[name="password"]', '1238@ashbel');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');

    // 2. Go to edit page
    await page.goto('/products/my-products/68bf3186233076da6ef9b1dc');

    // 3. Update name and description
    await page.fill('input[name="name"]', 'Updated Test Product');
    await page.fill('textarea[name="description"]', 'Updated description here.');

    // 4. Upload a new image
    const filePath = path.join(__dirname, '..', 'images', 'test-image.jpeg');
    await page.setInputFiles('input[type="file"]', filePath);

    // 5. Save changes
    await page.click('button[type="submit"]');

    // 6. Expect success message
    await expect(page.getByText('Product updated successfully!')).toBeVisible();
  });
});
