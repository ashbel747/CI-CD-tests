import { test, expect } from '@playwright/test';

test('Cart Page Flow (Real Product)', async ({ page }) => {
  // 1️⃣ Go to home page
  await page.goto('http://localhost:3001/');

  // 2️⃣ Log in
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('simon@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Simon@2025');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();

  // 3️⃣ Click the product from home
  await page.getByRole('link', { name: /Luxe Lounge Sofa/i }).first().click();

  // 4️⃣ Click "Add To Cart" on the product page
  await page.getByRole('button', { name: /Add To Cart/i }).click();

  // 5️⃣ Wait for redirect to cart page
  await page.waitForURL(/\/cart/, { timeout: 10000 });
  await expect(page).toHaveURL(/\/cart/);

  // 6️⃣ Optional: confirm the product is in the cart
  await expect(page.getByText(/Luxe Lounge Sofa/i)).toBeVisible();

  // 7️⃣ Checkout
  await page.getByRole('button', { name: /Checkout/i }).click();
  await page.getByRole('button', { name: /Confirm/i }).click();
});
